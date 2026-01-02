"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface ShimmerImageProps extends Omit<ImageProps, "onLoad"> {
    shimmerColor?: string;
}

export function ShimmerImage({
    className,
    shimmerColor = "from-gray-200 via-gray-100 to-gray-200",
    alt,
    ...props
}: ShimmerImageProps) {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className="relative w-full h-full overflow-hidden">
            {/* Shimmer skeleton */}
            {isLoading && (
                <div
                    className={cn(
                        "absolute inset-0 bg-gradient-to-r animate-shimmer bg-[length:200%_100%]",
                        shimmerColor
                    )}
                />
            )}

            {/* Actual image */}
            <Image
                {...props}
                alt={alt}
                className={cn(
                    className,
                    "transition-opacity duration-500",
                    isLoading ? "opacity-0" : "opacity-100"
                )}
                onLoad={() => setIsLoading(false)}
            />
        </div>
    );
}
