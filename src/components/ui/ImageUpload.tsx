"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, X, Loader2, ImageIcon, Check } from "lucide-react";

interface ImageUploadProps {
    slug: string;
    onUploadComplete: (url: string) => void;
    currentImageUrl?: string;
    className?: string;
    maxSizeMB?: number;
    targetSizeKB?: number; // Target compressed size in KB
    acceptedTypes?: string[];
}

// Compress image to target size
async function compressImage(
    file: File,
    targetSizeKB: number = 50,
    maxWidth: number = 1920
): Promise<File> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = document.createElement("img");

        img.onload = () => {
            URL.revokeObjectURL(img.src);
            // Calculate new dimensions
            let { width, height } = img;
            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            // Draw image
            ctx?.drawImage(img, 0, 0, width, height);

            // Binary search for optimal quality
            let quality = 0.9;
            let minQuality = 0.1;
            let maxQuality = 1.0;
            const targetBytes = targetSizeKB * 1024;

            const findOptimalQuality = (attempts: number = 0): void => {
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error("Failed to compress image"));
                            return;
                        }

                        // If within target or max attempts reached
                        if (blob.size <= targetBytes || attempts >= 8) {
                            const compressedFile = new File([blob], file.name, {
                                type: "image/jpeg",
                                lastModified: Date.now(),
                            });
                            resolve(compressedFile);
                            return;
                        }

                        // Binary search
                        if (blob.size > targetBytes) {
                            maxQuality = quality;
                            quality = (minQuality + quality) / 2;
                        } else {
                            minQuality = quality;
                            quality = (maxQuality + quality) / 2;
                        }

                        findOptimalQuality(attempts + 1);
                    },
                    "image/jpeg",
                    quality
                );
            };

            findOptimalQuality();
        };

        img.onerror = () => {
            URL.revokeObjectURL(img.src);
            reject(new Error("Failed to load image"));
        };
        img.src = URL.createObjectURL(file);
    });
}

export function ImageUpload({
    slug,
    onUploadComplete,
    currentImageUrl,
    className = "",
    maxSizeMB = 10, // Allow larger initial files
    targetSizeKB = 50, // Compress to 50KB
    acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
}: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
    const [isUploading, setIsUploading] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [compressionInfo, setCompressionInfo] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    const validateFile = (file: File): string | null => {
        if (!acceptedTypes.includes(file.type)) {
            return `Invalid file type. Accepted: ${acceptedTypes.map((t) => t.split("/")[1]).join(", ")}`;
        }
        if (file.size > maxSizeBytes) {
            return `File too large. Maximum size: ${maxSizeMB}MB`;
        }
        return null;
    };

    const handleFile = useCallback(
        async (file: File) => {
            setError(null);
            setUploadSuccess(false);
            setCompressionInfo(null);

            // Validate
            const validationError = validateFile(file);
            if (validationError) {
                setError(validationError);
                return;
            }

            // Create preview immediately
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);

            // Check if compression is needed
            const targetBytes = targetSizeKB * 1024;
            let fileToUpload = file;

            if (file.size > targetBytes && file.type.startsWith("image/")) {
                setIsCompressing(true);
                try {
                    const originalSize = (file.size / 1024).toFixed(0);
                    fileToUpload = await compressImage(file, targetSizeKB);
                    const newSize = (fileToUpload.size / 1024).toFixed(0);
                    setCompressionInfo(`Compressed: ${originalSize}KB → ${newSize}KB`);
                } catch (err) {
                    console.error("Compression error:", err);
                    // Continue with original if compression fails
                } finally {
                    setIsCompressing(false);
                }
            }

            // Upload to API
            setIsUploading(true);
            try {
                const formData = new FormData();
                formData.append("file", fileToUpload);
                formData.append("slug", slug);
                formData.append("type", "image");

                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.error || "Upload failed");
                }

                onUploadComplete(result.url);
                setUploadSuccess(true);

                // Reset success indicator after 2s
                setTimeout(() => setUploadSuccess(false), 2000);
            } catch (err) {
                console.error("Upload error:", err);
                setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
                setPreview(currentImageUrl || null);
            } finally {
                setIsUploading(false);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [slug, onUploadComplete, currentImageUrl, targetSizeKB]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);

            const file = e.dataTransfer.files[0];
            if (file) {
                handleFile(file);
            }
        },
        [handleFile]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const clearImage = () => {
        setPreview(null);
        setError(null);
        setCompressionInfo(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className={className}>
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept={acceptedTypes.join(",")}
                onChange={handleInputChange}
                className="hidden"
            />

            {/* Drop zone / Preview */}
            <div
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all ${isDragging
                    ? "border-purple-400 bg-purple-50"
                    : error
                        ? "border-red-300 bg-red-50"
                        : preview
                            ? "border-transparent"
                            : "border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100"
                    }`}
            >
                {preview ? (
                    /* Image Preview */
                    <div className="relative aspect-square rounded-2xl overflow-hidden">
                        <Image
                            src={preview}
                            alt="Preview"
                            fill
                            className="object-cover"
                        />

                        {/* Overlay states */}
                        {isCompressing && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="text-center text-white">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                                    <span className="text-sm">Compressing...</span>
                                </div>
                            </div>
                        )}

                        {isUploading && !isCompressing && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="text-center text-white">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                                    <span className="text-sm">Uploading...</span>
                                </div>
                            </div>
                        )}

                        {uploadSuccess && (
                            <div className="absolute inset-0 bg-green-500/50 flex items-center justify-center">
                                <Check className="w-12 h-12 text-white" />
                            </div>
                        )}

                        {/* Remove button */}
                        {!isUploading && !isCompressing && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearImage();
                                }}
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ) : (
                    /* Empty state */
                    <div className="aspect-square flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-3">
                            {isDragging ? (
                                <Upload className="w-6 h-6 text-purple-500" />
                            ) : (
                                <ImageIcon className="w-6 h-6 text-gray-400" />
                            )}
                        </div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                            {isDragging ? "Drop image here" : "Click or drag to upload"}
                        </p>
                        <p className="text-xs text-gray-400">
                            Tự động nén còn {targetSizeKB}KB
                        </p>
                    </div>
                )}
            </div>

            {/* Compression info */}
            {compressionInfo && (
                <p className="mt-2 text-xs text-green-600 text-center">{compressionInfo}</p>
            )}

            {/* Error message */}
            {error && (
                <p className="mt-2 text-sm text-red-500 text-center">{error}</p>
            )}
        </div>
    );
}
