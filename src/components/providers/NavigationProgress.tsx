"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgress() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Reset when navigation completes
        setProgress(100);

        const timeout = setTimeout(() => {
            setProgress(0);
        }, 200);

        return () => clearTimeout(timeout);
    }, [pathname, searchParams]);

    // Listen for navigation start
    useEffect(() => {
        const handleStart = () => {
            setProgress(0);

            // Animate progress
            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 100);

            return () => clearInterval(interval);
        };

        // Override link clicks to detect navigation
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest("a");

            if (link && link.href && link.href.startsWith(window.location.origin)) {
                const href = link.getAttribute("href");
                if (href && !href.startsWith("#") && href !== pathname) {
                    handleStart();
                }
            }
        };

        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, [pathname]);

    if (progress === 0) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[10000] h-1">
            <div
                className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-all duration-200 ease-out"
                style={{
                    width: `${progress}%`,
                    boxShadow: progress > 0 && progress < 100 ? "0 0 10px rgba(236, 72, 153, 0.7)" : "none"
                }}
            />
        </div>
    );
}
