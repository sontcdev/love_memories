"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Link2, Check, X, AlertCircle, Youtube, Music2 } from "lucide-react";

interface VideoInputProps {
    value: string;
    onChange: (url: string) => void;
    placeholder?: string;
}

type Platform = "youtube" | "tiktok" | "unknown";

interface VideoInfo {
    platform: Platform;
    videoId: string | null;
    embedUrl: string | null;
    thumbnailUrl: string | null;
}

// Parse YouTube URL and extract video ID
function parseYouTubeUrl(url: string): string | null {
    const patterns = [
        // youtube.com/watch?v=ID
        /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.+&v=)([a-zA-Z0-9_-]{11})/,
        // youtu.be/ID
        /youtu\.be\/([a-zA-Z0-9_-]{11})/,
        // youtube.com/embed/ID
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        // youtube.com/shorts/ID
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    return null;
}

// Parse TikTok URL
function parseTikTokUrl(url: string): string | null {
    const patterns = [
        // tiktok.com/@user/video/ID
        /tiktok\.com\/@[^/]+\/video\/(\d+)/,
        // vm.tiktok.com/CODE
        /vm\.tiktok\.com\/([a-zA-Z0-9]+)/,
        // tiktok.com/t/CODE
        /tiktok\.com\/t\/([a-zA-Z0-9]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    return null;
}

// Analyze URL and get video info
function getVideoInfo(url: string): VideoInfo {
    if (!url) {
        return { platform: "unknown", videoId: null, embedUrl: null, thumbnailUrl: null };
    }

    const youtubeId = parseYouTubeUrl(url);
    if (youtubeId) {
        return {
            platform: "youtube",
            videoId: youtubeId,
            embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
            thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
        };
    }

    const tiktokId = parseTikTokUrl(url);
    if (tiktokId) {
        return {
            platform: "tiktok",
            videoId: tiktokId,
            embedUrl: url, // TikTok uses blockquote embed
            thumbnailUrl: null,
        };
    }

    return { platform: "unknown", videoId: null, embedUrl: null, thumbnailUrl: null };
}

// Check if URL is valid video URL
function isValidVideoUrl(url: string): boolean {
    const info = getVideoInfo(url);
    return info.platform !== "unknown" && info.videoId !== null;
}

export function VideoInput({ value, onChange, placeholder = "Paste YouTube or TikTok URL..." }: VideoInputProps) {
    const [inputValue, setInputValue] = useState(value);
    const [error, setError] = useState<string | null>(null);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setInputValue(url);
        setError(null);

        if (!url) {
            onChange("");
            return;
        }

        if (isValidVideoUrl(url)) {
            onChange(url);
        }
    }, [onChange]);

    const handleBlur = useCallback(() => {
        if (inputValue && !isValidVideoUrl(inputValue)) {
            setError("Please enter a valid YouTube or TikTok URL");
        }
    }, [inputValue]);

    const handleClear = useCallback(() => {
        setInputValue("");
        setError(null);
        onChange("");
    }, [onChange]);

    const videoInfo = getVideoInfo(inputValue);
    const isValid = videoInfo.platform !== "unknown";

    return (
        <div className="space-y-2">
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    {isValid ? (
                        videoInfo.platform === "youtube" ? (
                            <Youtube className="w-5 h-5 text-red-500" />
                        ) : (
                            <Music2 className="w-5 h-5 text-gray-800" />
                        )
                    ) : (
                        <Link2 className="w-5 h-5 text-gray-400" />
                    )}
                </div>
                <input
                    type="url"
                    value={inputValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    className={`w-full pl-10 pr-10 py-3 border rounded-xl text-sm focus:ring-2 focus:border-transparent transition-all ${error
                        ? "border-red-300 focus:ring-red-200"
                        : isValid
                            ? "border-green-300 focus:ring-green-200"
                            : "border-gray-200 focus:ring-pink-200"
                        }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {inputValue && (
                        isValid ? (
                            <Check className="w-5 h-5 text-green-500" />
                        ) : (
                            <button
                                onClick={handleClear}
                                className="p-1 hover:bg-gray-100 rounded-full"
                            >
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        )
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-1 text-red-500 text-xs">
                    <AlertCircle className="w-3 h-3" />
                    {error}
                </div>
            )}

            {/* Preview Thumbnail */}
            {isValid && videoInfo.thumbnailUrl && (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <Image
                        src={videoInfo.thumbnailUrl}
                        alt="Video thumbnail"
                        fill
                        className="object-cover"
                        unoptimized
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center">
                            {videoInfo.platform === "youtube" ? (
                                <Youtube className="w-6 h-6 text-white" />
                            ) : (
                                <Music2 className="w-6 h-6 text-white" />
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleClear}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* TikTok notice */}
            {videoInfo.platform === "tiktok" && (
                <p className="text-xs text-gray-400">
                    TikTok videos will be embedded when displayed
                </p>
            )}
        </div>
    );
}

// Export utility for external use
export { getVideoInfo, isValidVideoUrl };
export type { VideoInfo, Platform };
