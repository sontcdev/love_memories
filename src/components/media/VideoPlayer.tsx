"use client";

import Image from "next/image";
import { Youtube, Music2, ExternalLink } from "lucide-react";

interface VideoPlayerProps {
    url: string;
    className?: string;
}

type Platform = "youtube" | "tiktok" | "unknown";

// Parse YouTube URL and extract video ID
function parseYouTubeUrl(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.+&v=)([a-zA-Z0-9_-]{11})/,
        /youtu\.be\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
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

// Detect platform from URL
function detectPlatform(url: string): Platform {
    if (!url) return "unknown";

    if (url.includes("youtube.com") || url.includes("youtu.be")) {
        return "youtube";
    }
    if (url.includes("tiktok.com")) {
        return "tiktok";
    }
    return "unknown";
}

export function VideoPlayer({ url, className = "" }: VideoPlayerProps) {
    const platform = detectPlatform(url);
    const youtubeId = platform === "youtube" ? parseYouTubeUrl(url) : null;

    if (!url) return null;

    // YouTube Player
    if (platform === "youtube" && youtubeId) {
        return (
            <div className={`relative aspect-video rounded-xl overflow-hidden bg-gray-900 ${className}`}>
                <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                />
            </div>
        );
    }

    // TikTok Player - Simple card link (embed is unreliable)
    if (platform === "tiktok") {
        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 p-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all group ${className}`}
            >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 via-pink-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                    <Music2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm">Video TikTok</p>
                    <p className="text-gray-400 text-xs break-all line-clamp-2">{url}</p>
                </div>
                <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors flex-shrink-0" />
            </a>
        );
    }

    // Unknown platform - show link
    return (
        <div className={`flex items-center gap-2 p-4 bg-gray-50 rounded-xl ${className}`}>
            <ExternalLink className="w-5 h-5 text-gray-400" />
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline truncate"
            >
                {url}
            </a>
        </div>
    );
}

// Compact version for thumbnails/previews
export function VideoThumbnail({ url, onClick }: { url: string; onClick?: () => void }) {
    const platform = detectPlatform(url);
    const youtubeId = platform === "youtube" ? parseYouTubeUrl(url) : null;

    if (!url) return null;

    const thumbnailUrl = youtubeId
        ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
        : null;

    return (
        <button
            onClick={onClick}
            className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 group"
        >
            {thumbnailUrl ? (
                <Image
                    src={thumbnailUrl}
                    alt="Video thumbnail"
                    fill
                    className="object-cover"
                    unoptimized
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <Music2 className="w-8 h-8 text-white" />
                </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    {platform === "youtube" ? (
                        <Youtube className="w-5 h-5 text-red-500" />
                    ) : (
                        <Music2 className="w-5 h-5 text-gray-800" />
                    )}
                </div>
            </div>
        </button>
    );
}
