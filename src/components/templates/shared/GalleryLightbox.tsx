"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface GalleryImage {
    image_url: string;
    caption?: string | null;
}

interface GalleryLightboxProps {
    isOpen: boolean;
    currentIndex: number;
    images: GalleryImage[];
    onClose: () => void;
    onPrev: () => void;
    onNext: () => void;
    headerClass?: string;
    headerStyle?: React.CSSProperties;
    navClass?: string;
    cardClass?: string;
    borderClass?: string;
    captionClass?: string;
    swipeHandlers?: Record<string, unknown> | { ref: (el: HTMLElement | null) => void; onMouseDown?: (event: React.MouseEvent) => void };
}

export function GalleryLightbox({
    isOpen,
    currentIndex,
    images,
    onClose,
    onPrev,
    onNext,
    headerClass = "bg-gradient-to-r from-purple-500 to-pink-500",
    headerStyle,
    navClass = "bg-purple-50 text-purple-500 hover:bg-purple-100",
    cardClass = "bg-white text-gray-800",
    borderClass = "border-gray-100",
    captionClass = "text-gray-600",
    swipeHandlers,
}: GalleryLightboxProps) {
    if (!isOpen || !images[currentIndex]) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div
                className={`rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col ${cardClass}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`p-4 text-white flex-shrink-0 ${headerClass}`} style={headerStyle}>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                            {currentIndex + 1} / {images.length}
                        </span>
                        <button onClick={onClose} className="hover:scale-110 transition-transform">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div {...(swipeHandlers || {})} className="flex-1 overflow-hidden flex items-center justify-center p-4 min-h-[300px]">
                    <div className="relative w-full aspect-[4/3] max-h-[55vh]">
                        <Image
                            src={images[currentIndex].image_url}
                            alt={images[currentIndex].caption || "Photo"}
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>

                {images[currentIndex].caption && (
                    <div className={`px-4 py-2 text-center text-sm ${captionClass}`}>
                        {images[currentIndex].caption}
                    </div>
                )}

                <div className={`flex justify-center items-center gap-4 p-4 border-t ${borderClass}`}>
                    <button
                        onClick={onPrev}
                        className={`p-2.5 rounded-full transition-all hover:scale-110 ${navClass}`}
                        aria-label="Previous"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onNext}
                        className={`p-2.5 rounded-full transition-all hover:scale-110 ${navClass}`}
                        aria-label="Next"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
