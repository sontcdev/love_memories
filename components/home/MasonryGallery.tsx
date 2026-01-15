'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Masonry from 'react-masonry-css';
import { createClient } from '@/lib/supabase/client';
import GalleryUploader from './GalleryUploader';
import { useAuthStore } from '@/store/useAuthStore';

interface GalleryImage {
    id: string;
    image_url: string;
    width: number | null;
    height: number | null;
    sort_order: number;
}

interface MasonryGalleryProps {
    linkId: string;
}

export default function MasonryGallery({ linkId }: MasonryGalleryProps) {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const { viewMode } = useAuthStore();
    const supabase = createClient();

    const fetchImages = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('gallery')
            .select('*')
            .eq('link_id', linkId)
            .order('sort_order', { ascending: true });

        if (!error && data) {
            setImages(data as GalleryImage[]);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchImages();
    }, [linkId]);

    const breakpointColumns = {
        default: 3,
        1024: 2,
        640: 1,
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Uploader (only for owners) */}
            {viewMode === 'owner' && (
                <GalleryUploader
                    linkId={linkId}
                    images={images}
                    onUploadComplete={fetchImages}
                />
            )}

            {/* Gallery */}
            {images.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">📸</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        Chưa có ảnh nào
                    </h3>
                    <p className="text-gray-500">
                        {viewMode === 'owner'
                            ? 'Thêm ảnh đầu tiên để bắt đầu bộ sưu tập'
                            : 'Bộ sưu tập ảnh sẽ được hiển thị ở đây'
                        }
                    </p>
                </div>
            ) : (
                <Masonry
                    breakpointCols={breakpointColumns}
                    className="flex -ml-4 w-auto"
                    columnClassName="pl-4 bg-clip-padding"
                >
                    {images.map((image, index) => (
                        <motion.div
                            key={image.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="mb-4 relative group cursor-pointer"
                            onClick={() => setSelectedImage(image.image_url)}
                        >
                            <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-shadow">
                                <img
                                    src={image.image_url}
                                    alt={`Gallery image ${index + 1}`}
                                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                />

                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </motion.div>
                    ))}
                </Masonry>
            )}

            {/* Lightbox */}
            {selectedImage && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedImage(null)}
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
                >
                    <motion.img
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.8 }}
                        src={selectedImage}
                        alt="Full size"
                        className="max-w-full max-h-full object-contain rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />
                </motion.div>
            )}
        </div>
    );
}
