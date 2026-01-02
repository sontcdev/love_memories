"use client";

import { Heart } from "lucide-react";

export default function SlugLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex flex-col items-center justify-center">
            {/* Beating Heart */}
            <div className="relative mb-8">
                <Heart className="w-16 h-16 text-rose-400 fill-rose-400 animate-pulse" />
                <div className="absolute inset-0 w-16 h-16 bg-rose-400/20 rounded-full animate-ping" />
            </div>

            {/* Loading Text */}
            <p className="text-gray-400 font-medium mb-8">Đang tải kỷ niệm...</p>

            {/* Skeleton Content */}
            <div className="w-full max-w-md px-8 space-y-6">
                {/* Profile Skeleton */}
                <div className="flex items-center justify-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200 animate-shimmer" />
                    <div className="w-8 h-8 rounded-full bg-gray-200 animate-shimmer" />
                    <div className="w-16 h-16 rounded-full bg-gray-200 animate-shimmer" />
                </div>

                {/* Title Skeleton */}
                <div className="h-8 bg-gray-200 rounded-xl animate-shimmer mx-auto w-48" />

                {/* Subtitle Skeleton */}
                <div className="h-4 bg-gray-200 rounded-lg animate-shimmer mx-auto w-32" />

                {/* Nav Skeleton */}
                <div className="flex justify-center gap-2 pt-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="h-10 w-20 bg-gray-200 rounded-full animate-shimmer"
                            style={{ animationDelay: `${i * 100}ms` }}
                        />
                    ))}
                </div>
            </div>

            {/* Shimmer Animation Style */}
            <style jsx>{`
                @keyframes shimmer {
                    0% { opacity: 0.6; }
                    50% { opacity: 0.3; }
                    100% { opacity: 0.6; }
                }
                .animate-shimmer {
                    animation: shimmer 1.5s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
