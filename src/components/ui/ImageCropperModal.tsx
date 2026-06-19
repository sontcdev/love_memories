"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, ZoomIn, ZoomOut, Check } from "lucide-react";

interface ImageCropperModalProps {
    file: File;
    onClose: () => void;
    onCropComplete: (croppedFile: File) => void;
}

export function ImageCropperModal({
    file,
    onClose,
    onCropComplete,
}: ImageCropperModalProps) {
    const [imageSrc, setImageSrc] = useState<string>("");
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const [isCropping, setIsCropping] = useState(false);

    const viewportRef = useRef<HTMLDivElement>(null);

    // Create object URL from file
    useEffect(() => {
        const url = URL.createObjectURL(file);
        setImageSrc(url);
        return () => {
            URL.revokeObjectURL(url);
        };
    }, [file]);

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        setImageDimensions({
            width: img.naturalWidth,
            height: img.naturalHeight,
        });
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    };

    const getBaseDimensions = useCallback(() => {
        if (!imageDimensions.width || !imageDimensions.height) {
            return { width: 0, height: 0 };
        }
        const { width: nw, height: nh } = imageDimensions;
        const viewportSize = 280;
        if (nw > nh) {
            return {
                width: viewportSize * (nw / nh),
                height: viewportSize,
            };
        } else {
            return {
                width: viewportSize,
                height: viewportSize * (nh / nw),
            };
        }
    }, [imageDimensions]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        });
    };

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDragging) return;
            const base = getBaseDimensions();
            if (!base.width) return;

            const newX = e.clientX - dragStart.x;
            const newY = e.clientY - dragStart.y;

            const maxTx = (base.width * zoom - 280) / 2;
            const maxTy = (base.height * zoom - 280) / 2;

            setPosition({
                x: Math.min(Math.max(newX, -maxTx), maxTx),
                y: Math.min(Math.max(newY, -maxTy), maxTy),
            });
        },
        [isDragging, dragStart, zoom, getBaseDimensions]
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({
            x: touch.clientX - position.x,
            y: touch.clientY - position.y,
        });
    };

    const handleTouchMove = useCallback(
        (e: TouchEvent) => {
            if (!isDragging) return;
            const base = getBaseDimensions();
            if (!base.width) return;

            const touch = e.touches[0];
            const newX = touch.clientX - dragStart.x;
            const newY = touch.clientY - dragStart.y;

            const maxTx = (base.width * zoom - 280) / 2;
            const maxTy = (base.height * zoom - 280) / 2;

            setPosition({
                x: Math.min(Math.max(newX, -maxTx), maxTx),
                y: Math.min(Math.max(newY, -maxTy), maxTy),
            });
        },
        [isDragging, dragStart, zoom, getBaseDimensions]
    );

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Listen to mouse/touch move on window when dragging
    useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
            window.addEventListener("touchmove", handleTouchMove, { passive: false });
            window.addEventListener("touchend", handleTouchEnd);
        }
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("touchend", handleTouchEnd);
        };
    }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

    const handleCrop = async () => {
        if (!imageDimensions.width || !imageDimensions.height) return;

        setIsCropping(true);
        try {
            const base = getBaseDimensions();
            const img = new window.Image();
            img.src = imageSrc;

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            const outputSize = 400; // standard high-res square avatar
            canvas.width = outputSize;
            canvas.height = outputSize;

            const viewportSize = 280;
            const X_c = viewportSize / 2;
            const Y_c = viewportSize / 2;

            const currentWidth = base.width * zoom;
            const currentHeight = base.height * zoom;

            const imgX = X_c + position.x - currentWidth / 2;
            const imgY = Y_c + position.y - currentHeight / 2;

            const scaleFactor = imageDimensions.width / currentWidth;

            const sx = -imgX * scaleFactor;
            const sy = -imgY * scaleFactor;
            const sWidth = viewportSize * scaleFactor;
            const sHeight = viewportSize * scaleFactor;

            ctx?.drawImage(
                img,
                sx,
                sy,
                sWidth,
                sHeight,
                0,
                0,
                outputSize,
                outputSize
            );

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const croppedFile = new File([blob], file.name, {
                            type: "image/jpeg",
                            lastModified: Date.now(),
                        });
                        onCropComplete(croppedFile);
                    } else {
                        console.error("Failed to crop image");
                    }
                    setIsCropping(false);
                },
                "image/jpeg",
                0.9
            );
        } catch (err) {
            console.error("Error cropping image:", err);
            setIsCropping(false);
        }
    };

    const base = getBaseDimensions();

    return (
        <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
                className="max-w-[360px] bg-neutral-900 border-neutral-800 text-white rounded-2xl p-5 gap-5 animate-in fade-in zoom-in-95"
            >
                <DialogHeader className="p-0 select-none">
                    <DialogTitle className="text-lg font-bold text-center text-neutral-100 flex items-center justify-center gap-2">
                        Cắt ảnh đại diện
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center py-2">
                    {/* Viewport container */}
                    <div
                        ref={viewportRef}
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleTouchStart}
                        className="relative w-[280px] h-[280px] overflow-hidden bg-neutral-950 rounded-xl select-none cursor-move border border-neutral-800"
                    >
                        {imageSrc && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={imageSrc}
                                alt="Crop preview"
                                onLoad={handleImageLoad}
                                style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    width: base.width ? `${base.width}px` : "auto",
                                    height: base.height ? `${base.height}px` : "auto",
                                    transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                                    transformOrigin: "center center",
                                    maxWidth: "none",
                                    maxHeight: "none",
                                }}
                                draggable={false}
                            />
                        )}
                        {/* Circular cutout overlay */}
                        <div className="absolute inset-0 rounded-full border border-dashed border-white/60 pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.65)]" />
                    </div>

                    {/* Controls */}
                    <div className="w-full mt-5 space-y-3">
                        <div className="flex items-center gap-3">
                            <ZoomOut className="w-4 h-4 text-neutral-400" />
                            <input
                                type="range"
                                min={1}
                                max={3}
                                step={0.01}
                                value={zoom}
                                onChange={(e) => {
                                    const nextZoom = parseFloat(e.target.value);
                                    setZoom(nextZoom);

                                    // Instantly clamp position when zoom changes
                                    const base = getBaseDimensions();
                                    if (base.width) {
                                        const maxTx = (base.width * nextZoom - 280) / 2;
                                        const maxTy = (base.height * nextZoom - 280) / 2;
                                        setPosition(prev => ({
                                            x: Math.min(Math.max(prev.x, -maxTx), maxTx),
                                            y: Math.min(Math.max(prev.y, -maxTy), maxTy),
                                        }));
                                    }
                                }}
                                className="flex-1 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                            />
                            <ZoomIn className="w-4 h-4 text-neutral-400" />
                        </div>
                        <p className="text-xs text-neutral-500 text-center select-none">
                            Kéo để di chuyển, sử dụng thanh trượt để phóng to/thu nhỏ
                        </p>
                    </div>
                </div>

                <DialogFooter className="flex sm:flex-row gap-2 mt-2 p-0 w-full">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isCropping}
                        className="flex-1 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl transition-colors font-medium text-sm border border-neutral-700 disabled:opacity-50"
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={handleCrop}
                        disabled={isCropping || !imageDimensions.width}
                        className="flex-1 px-4 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl transition-colors font-medium text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                        {isCropping ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4" />
                                Cắt ảnh
                            </>
                        )}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
