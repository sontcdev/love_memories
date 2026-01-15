'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar as CalendarIcon, Image as ImageIcon, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { createClient } from '@/lib/supabase/client';
import { addMemory } from '@/app/actions/memories';

interface AddMemoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    linkId: string;
    onSuccess: () => void;
}

export default function AddMemoryModal({ isOpen, onClose, linkId, onSuccess }: AddMemoryModalProps) {
    const [title, setTitle] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const supabase = createClient();

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Vui lòng chọn file hình ảnh');
            return;
        }

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!title.trim()) {
            setError('Vui lòng nhập tiêu đề');
            return;
        }

        if (!eventDate) {
            setError('Vui lòng chọn ngày');
            return;
        }

        setIsSaving(true);

        try {
            let imageUrl: string | undefined;

            // Upload image if provided
            if (imageFile) {
                // Compress image (same logic as GalleryUploader)
                const options = {
                    maxSizeMB: 0.1, // 100KB
                    maxWidthOrHeight: 1280,
                    useWebWorker: true,
                    fileType: 'image/jpeg' as const,
                    initialQuality: 0.7,
                };

                const compressedFile = await imageCompression(imageFile, options);

                // Verify size < 150KB
                const MAX_SIZE_BYTES = 150 * 1024;
                if (compressedFile.size > MAX_SIZE_BYTES) {
                    setError('Ảnh quá phức tạp, không thể nén xuống 100KB. Vui lòng chọn ảnh khác.');
                    setIsSaving(false);
                    return;
                }

                // Upload to Supabase Storage
                const fileName = `${linkId}/memories/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
                const { error: uploadError } = await supabase.storage
                    .from('gallery')
                    .upload(fileName, compressedFile, {
                        contentType: 'image/jpeg',
                        cacheControl: '3600',
                    });

                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    setError('Không thể tải ảnh lên');
                    setIsSaving(false);
                    return;
                }

                // Get public URL
                const { data: urlData } = supabase.storage
                    .from('gallery')
                    .getPublicUrl(fileName);

                imageUrl = urlData.publicUrl;
            }

            // Add memory via server action
            const result = await addMemory({
                linkId,
                title: title.trim(),
                eventDate,
                description: description.trim() || undefined,
                imageUrl,
            });

            if (result.success) {
                // Reset form
                setTitle('');
                setEventDate('');
                setDescription('');
                setImageFile(null);
                setImagePreview('');

                onSuccess();
                onClose();
            } else {
                setError(result.error || 'Có lỗi xảy ra');
            }

        } catch (err) {
            console.error('Submit error:', err);
            setError('Có lỗi xảy ra khi lưu');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', duration: 0.5 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 relative">
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                                disabled={isSaving}
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>

                            <h2 className="text-2xl font-bold text-white">
                                Thêm Kỷ Niệm
                            </h2>
                            <p className="text-sm text-white/80">
                                Lưu lại những khoảnh khắc đáng nhớ
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-100px)] space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tiêu đề <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="VD: Ngày đầu gặp nhau"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    maxLength={200}
                                    disabled={isSaving}
                                />
                            </div>

                            {/* Event Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ngày <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="date"
                                        value={eventDate}
                                        onChange={(e) => setEventDate(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={isSaving}
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mô tả
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Kể lại kỷ niệm này..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    rows={4}
                                    disabled={isSaving}
                                />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Hình ảnh
                                </label>

                                {imagePreview ? (
                                    <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-48 object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImageFile(null);
                                                setImagePreview('');
                                            }}
                                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                            disabled={isSaving}
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                                        <div className="flex flex-col items-center justify-center py-4">
                                            <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-500">Click để chọn ảnh</p>
                                            <p className="text-xs text-gray-400">Tự động nén xuống 100KB</p>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageSelect}
                                            className="hidden"
                                            disabled={isSaving}
                                        />
                                    </label>
                                )}
                            </div>

                            {/* Error Message */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Đang lưu...</span>
                                    </>
                                ) : (
                                    <span>Thêm Kỷ Niệm</span>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
