"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { supabase, STORAGE_BUCKET, generateFilePath, getPublicUrl } from "@/lib/supabase";
import { Upload, X, Loader2, ImageIcon, Check, AlertCircle } from "lucide-react";

interface MultiImageUploadProps {
    slug: string;
    onUploadComplete: (urls: string[]) => void;
    maxFiles?: number;
    maxSizeMB?: number;
    targetSizeKB?: number;
}

interface FileWithPreview {
    file: File;
    preview: string;
    status: "pending" | "compressing" | "uploading" | "done" | "error";
    url?: string;
    error?: string;
}

// Compress image to target size
async function compressImage(
    file: File,
    targetSizeKB: number = 500,
    maxWidth: number = 1920
): Promise<File> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = document.createElement("img");

        img.onload = () => {
            let { width, height } = img;
            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            ctx?.drawImage(img, 0, 0, width, height);

            let quality = 0.8;
            const targetBytes = targetSizeKB * 1024;

            const tryCompress = (attempts: number = 0) => {
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error("Failed to compress"));
                            return;
                        }
                        if (blob.size <= targetBytes || attempts >= 5 || quality <= 0.2) {
                            resolve(new File([blob], file.name, { type: "image/jpeg" }));
                        } else {
                            quality -= 0.15;
                            tryCompress(attempts + 1);
                        }
                    },
                    "image/jpeg",
                    quality
                );
            };
            tryCompress();
        };

        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = URL.createObjectURL(file);
    });
}

export function MultiImageUpload({
    slug,
    onUploadComplete,
    maxFiles = 5,
    maxSizeMB = 10,
    targetSizeKB = 500,
}: MultiImageUploadProps) {
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    const handleFiles = useCallback(async (selectedFiles: FileList | File[]) => {
        const fileArray = Array.from(selectedFiles).slice(0, maxFiles);

        // Validate and create previews
        const validFiles: FileWithPreview[] = [];
        for (const file of fileArray) {
            if (!file.type.startsWith("image/")) continue;
            if (file.size > maxSizeBytes) continue;

            validFiles.push({
                file,
                preview: URL.createObjectURL(file),
                status: "pending",
            });
        }

        if (validFiles.length === 0) return;

        setFiles(validFiles);
        setIsProcessing(true);

        // Process all files in parallel
        const uploadPromises = validFiles.map(async (fileData, index) => {
            try {
                // Update status to compressing
                setFiles(prev => prev.map((f, i) =>
                    i === index ? { ...f, status: "compressing" } : f
                ));

                // Compress if needed
                let fileToUpload = fileData.file;
                if (fileData.file.size > targetSizeKB * 1024) {
                    fileToUpload = await compressImage(fileData.file, targetSizeKB);
                }

                // Update status to uploading
                setFiles(prev => prev.map((f, i) =>
                    i === index ? { ...f, status: "uploading" } : f
                ));

                // Upload to Supabase
                const filePath = generateFilePath(slug, fileToUpload.name);
                const { error: uploadError } = await supabase.storage
                    .from(STORAGE_BUCKET)
                    .upload(filePath, fileToUpload, {
                        cacheControl: "3600",
                        upsert: false,
                    });

                if (uploadError) throw uploadError;

                const publicUrl = getPublicUrl(filePath);

                // Update status to done
                setFiles(prev => prev.map((f, i) =>
                    i === index ? { ...f, status: "done", url: publicUrl } : f
                ));

                return publicUrl;
            } catch (err) {
                console.error("Upload error:", err);
                setFiles(prev => prev.map((f, i) =>
                    i === index ? { ...f, status: "error", error: "Failed" } : f
                ));
                return null;
            }
        });

        const results = await Promise.all(uploadPromises);
        const successfulUrls = results.filter((url): url is string => url !== null);

        setIsProcessing(false);

        if (successfulUrls.length > 0) {
            // Small delay to show success state
            setTimeout(() => {
                onUploadComplete(successfulUrls);
            }, 500);
        }
    }, [slug, maxFiles, maxSizeBytes, targetSizeKB, onUploadComplete]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    }, [handleFiles]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(e.target.files);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const allDone = files.length > 0 && files.every(f => f.status === "done");
    const hasErrors = files.some(f => f.status === "error");

    return (
        <div className="space-y-4">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleInputChange}
                className="hidden"
            />

            {files.length === 0 ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                    className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${isDragging
                            ? "border-pink-400 bg-pink-50"
                            : "border-gray-300 hover:border-gray-400 bg-gray-50"
                        }`}
                >
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3">
                        {isDragging ? (
                            <Upload className="w-6 h-6 text-pink-500" />
                        ) : (
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                        )}
                    </div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                        Click or drag to upload
                    </p>
                    <p className="text-xs text-gray-400">
                        Select up to {maxFiles} photos at once
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {/* File previews grid */}
                    <div className="grid grid-cols-3 gap-2">
                        {files.map((fileData, index) => (
                            <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                                <Image
                                    src={fileData.preview}
                                    alt={`Preview ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />

                                {/* Status overlay */}
                                {fileData.status === "compressing" && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                                    </div>
                                )}
                                {fileData.status === "uploading" && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                                    </div>
                                )}
                                {fileData.status === "done" && (
                                    <div className="absolute inset-0 bg-green-500/50 flex items-center justify-center">
                                        <Check className="w-8 h-8 text-white" />
                                    </div>
                                )}
                                {fileData.status === "error" && (
                                    <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center">
                                        <AlertCircle className="w-6 h-6 text-white" />
                                    </div>
                                )}

                                {/* Remove button (only for pending) */}
                                {fileData.status === "pending" && (
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white hover:bg-black/70"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Status message */}
                    <div className="text-center text-sm">
                        {isProcessing && (
                            <p className="text-gray-500">
                                <Loader2 className="w-4 h-4 inline-block animate-spin mr-1" />
                                Uploading {files.length} photo{files.length > 1 ? "s" : ""}...
                            </p>
                        )}
                        {allDone && (
                            <p className="text-green-600">
                                <Check className="w-4 h-4 inline-block mr-1" />
                                {files.length} photo{files.length > 1 ? "s" : ""} uploaded!
                            </p>
                        )}
                        {hasErrors && !isProcessing && (
                            <p className="text-red-500">
                                Some photos failed to upload
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
