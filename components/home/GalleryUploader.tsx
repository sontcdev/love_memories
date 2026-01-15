'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, ImagePlus } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';

interface GalleryImage {
    id: string;
    image_url: string;
    width: number | null;
    height: number | null;
    sort_order: number;
}

interface GalleryUploaderProps {
    linkId: string;
    images: GalleryImage[];
    onUploadComplete: () => void;
}

const MAX_PHOTOS = 20;

export default function GalleryUploader({ linkId, images, onUploadComplete }: GalleryUploaderProps) {
    const { viewMode } = useAuthStore();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    const isOwner = viewMode === 'owner';
    const canUpload = isOwner && images.length < MAX_PHOTOS;
    const remainingSlots = MAX_PHOTOS - images.length;

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Check if adding these files would exceed limit
        if (images.length + files.length > MAX_PHOTOS) {
            alert(`Chỉ có thể tải lên tối đa ${MAX_PHOTOS} ảnh. Bạn còn ${remainingSlots} vị trí trống.`);
            return;
        }

        setIsUploading(true);

        try {
            for (let i = 0; i < files.length; i++) {
                setUploadProgress(`Đang xử lý ảnh ${i + 1}/${files.length}...`);
                try {
                    await uploadImage(files[i], images.length + i);
                } catch (err: any) {
                    // Handle image too complex error
                    if (err.message === 'IMAGE_TOO_COMPLEX') {
                        alert(`Ảnh "${files[i].name}" quá phức tạp, không thể nén xuống 100KB. Vui lòng chọn ảnh khác hoặc giảm độ phân giải.`);
                        continue; // Skip this image and continue with the next
                    }
                    throw err; // Re-throw other errors
                }
            }

            setUploadProgress('Hoàn tất!');
            setTimeout(() => {
                setUploadProgress('');
                setIsUploading(false);
                onUploadComplete();
            }, 1000);

        } catch (error) {
            console.error('Upload error:', error);
            alert('Có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại.');
            setIsUploading(false);
            setUploadProgress('');
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const uploadImage = async (file: File, sortOrder: number) => {
        // Client-side compression with strict 100KB limit
        const options = {
            maxSizeMB: 0.1, // 100KB target
            maxWidthOrHeight: 1280, // Good balance for mobile screens
            useWebWorker: true, // Avoid UI freezing
            fileType: 'image/jpeg' as const,
            initialQuality: 0.7, // Start lower for better compression
        };

        // Compress the image
        const compressedFile = await imageCompression(file, options);

        // CRITICAL: Verify compressed size is under 150KB (allow small buffer)
        const MAX_SIZE_BYTES = 150 * 1024; // 150KB
        if (compressedFile.size > MAX_SIZE_BYTES) {
            throw new Error('IMAGE_TOO_COMPLEX');
        }

        console.log(`Compressed ${file.name}: ${(file.size / 1024).toFixed(1)}KB → ${(compressedFile.size / 1024).toFixed(1)}KB`);

        // Get image dimensions
        const dimensions = await getImageDimensions(compressedFile);

        // Upload to Supabase Storage
        const fileName = `${linkId}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('gallery')
            .upload(fileName, compressedFile, {
                contentType: 'image/jpeg',
                cacheControl: '3600',
            });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('gallery')
            .getPublicUrl(fileName);

        // Insert into database
        const { error: dbError } = await supabase
            .from('gallery')
            .insert({
                link_id: linkId,
                image_url: urlData.publicUrl,
                width: dimensions.width,
                height: dimensions.height,
                sort_order: sortOrder,
            });

        if (dbError) throw dbError;
    };

    const getImageDimensions = (file: Blob): Promise<{ width: number; height: number }> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve({ width: img.width, height: img.height });
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Failed to load image'));
            };

            img.src = url;
        });
    };

    const handleDeleteImage = async (imageId: string, imageUrl: string) => {
        if (!confirm('Bạn có chắc muốn xóa ảnh này?')) return;

        try {
            // Extract file path from URL
            const urlParts = imageUrl.split('/');
            const fileName = `${urlParts[urlParts.length - 2]}/${urlParts[urlParts.length - 1]}`;

            // Delete from storage
            await supabase.storage.from('gallery').remove([fileName]);

            // Delete from database
            await supabase.from('gallery').delete().eq('id', imageId);

            onUploadComplete();
        } catch (error) {
            console.error('Delete error:', error);
            alert('Có lỗi xảy ra khi xóa ảnh.');
        }
    };

    if (!isOwner) {
        return null; // Only show uploader to owners
    }

    return (
        <div className="space-y-4">
            {/* Upload button */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div className="text-sm text-gray-600">
                    {images.length} / {MAX_PHOTOS} ảnh
                </div>

                <motion.button
                    whileHover={{ scale: canUpload ? 1.05 : 1 }}
                    whileTap={{ scale: canUpload ? 0.95 : 1 }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!canUpload || isUploading}
                    className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
            ${canUpload
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }
          `}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Đang tải...</span>
                        </>
                    ) : (
                        <>
                            <ImagePlus className="w-4 h-4" />
                            <span>Thêm ảnh</span>
                        </>
                    )}
                </motion.button>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={!canUpload || isUploading}
                />
            </motion.div>

            {/* Upload progress */}
            <AnimatePresence>
                {uploadProgress && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-3 text-sm text-purple-700"
                    >
                        {uploadProgress}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete buttons overlay (only in owner mode) */}
            {isOwner && (
                <div className="absolute inset-0 pointer-events-none">
                    {images.map((image) => (
                        <motion.button
                            key={image.id}
                            whileHover={{ scale: 1.1 }}
                            onClick={() => handleDeleteImage(image.id, image.image_url)}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-lg pointer-events-auto hover:bg-red-600 transition-colors"
                            style={{ zIndex: 10 }}
                        >
                            <X className="w-4 h-4" />
                        </motion.button>
                    ))}
                </div>
            )}
        </div>
    );
}
