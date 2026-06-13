"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface GalleryImage {
    url: string;
    caption?: string;
}

interface GalleryGridProps {
    images: GalleryImage[];
    columns?: 2 | 3 | 4;
}

// Shimmer skeleton component for loading state
function ShimmerSkeleton() {
    return (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]" />
    );
}

// Individual gallery item with loading state
function GalleryItem({
    image,
    index,
    onOpenLightbox
}: {
    image: GalleryImage;
    index: number;
    onOpenLightbox: (index: number) => void;
}) {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div
            onClick={() => onOpenLightbox(index)}
            className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
        >
            {/* Shimmer Loading Effect */}
            {isLoading && <ShimmerSkeleton />}

            <Image
                src={image.url}
                alt={image.caption || `Photo ${index + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className={`object-cover transition-all duration-500 group-hover:scale-110 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setIsLoading(false)}
            />

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Caption - Always visible */}
            {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <p className="text-white text-sm truncate">{image.caption}</p>
                </div>
            )}
        </div>
    );
}

export function GalleryGrid({ images, columns = 3 }: GalleryGridProps) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const openLightbox = useCallback((index: number) => {
        setLightboxIndex(index);
        document.body.style.overflow = "hidden";
    }, []);

    const closeLightbox = useCallback(() => {
        setLightboxIndex(null);
        document.body.style.overflow = "";
    }, []);

    const goNext = useCallback(() => {
        if (lightboxIndex !== null) {
            setLightboxIndex((lightboxIndex + 1) % images.length);
        }
    }, [lightboxIndex, images.length]);

    const goPrev = useCallback(() => {
        if (lightboxIndex !== null) {
            setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
        }
    }, [lightboxIndex, images.length]);

    // Handle keyboard navigation globally when lightbox is open
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightboxIndex === null) return;
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowRight") goNext();
            if (e.key === "ArrowLeft") goPrev();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [lightboxIndex, closeLightbox, goNext, goPrev]);

    if (images.length === 0) {
        return (
            <div className="text-center py-16 text-gray-400">
                <ZoomIn className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Chưa có ảnh nào</p>
            </div>
        );
    }

    const gridCols = {
        2: "grid-cols-2",
        3: "grid-cols-2 md:grid-cols-3",
        4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    };

    return (
        <>
            {/* Grid */}
            <div className={`grid ${gridCols[columns]} gap-3 md:gap-4`}>
                {images.map((image, index) => (
                    <GalleryItem
                        key={index}
                        image={image}
                        index={index}
                        onOpenLightbox={openLightbox}
                    />
                ))}
            </div>

            {/* Lightbox */}
            {lightboxIndex !== null && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
                    onClick={closeLightbox}
                >
                    {/* Close Button */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>

                    {/* Navigation - Previous */}
                    {images.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); goPrev(); }}
                            className="absolute left-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            <ChevronLeft className="w-8 h-8 text-white" />
                        </button>
                    )}

                    {/* Image */}
                    <div
                        className="relative max-w-[90vw] max-h-[85vh] w-full h-full flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Image
                            src={images[lightboxIndex].url}
                            alt={images[lightboxIndex].caption || `Photo ${lightboxIndex + 1}`}
                            fill
                            sizes="90vw"
                            className="object-contain"
                            priority
                        />
                    </div>

                    {/* Navigation - Next */}
                    {images.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); goNext(); }}
                            className="absolute right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            <ChevronRight className="w-8 h-8 text-white" />
                        </button>
                    )}

                    {/* Counter & Caption */}
                    <div className="absolute bottom-4 left-0 right-0 text-center">
                        <p className="text-white/80 text-sm mb-2">
                            {lightboxIndex + 1} / {images.length}
                        </p>
                        {images[lightboxIndex].caption && (
                            <p className="text-white text-base max-w-md mx-auto px-4">
                                {images[lightboxIndex].caption}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
