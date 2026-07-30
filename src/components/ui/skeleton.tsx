import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Placeholder block for content that is still loading.
 *
 * Uses the shared `shimmer` keyframe from tailwind.config.ts rather than a local
 * styled-jsx animation. The sweep is gated behind `motion-safe:` so users with
 * "reduce motion" get a static block instead of a moving gradient.
 *
 * Mark the *container* with `aria-busy` / `role="status"` rather than each
 * skeleton, so screen readers announce one pending region instead of many.
 */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Render as a circle — handy for avatars. */
    circle?: boolean;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
    ({ className, circle = false, ...props }, ref) => (
        <div
            ref={ref}
            aria-hidden="true"
            className={cn(
                "bg-slate-200/70 dark:bg-slate-700/40",
                circle ? "rounded-full" : "rounded-md",
                // Gradient sweep; falls back to a flat block without motion.
                "motion-safe:animate-shimmer motion-safe:bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.55)_50%,transparent_100%)] motion-safe:bg-[length:200%_100%]",
                "dark:motion-safe:bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.08)_50%,transparent_100%)]",
                className
            )}
            {...props}
        />
    )
);
Skeleton.displayName = "Skeleton";

/** A few lines of fake text. `lines` controls how many; the last one is shortened. */
function SkeletonText({
    lines = 3,
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & { lines?: number }) {
    return (
        <div className={cn("space-y-2", className)} {...props}>
            {Array.from({ length: lines }).map((_, index) => (
                <Skeleton
                    key={index}
                    className={cn("h-4", index === lines - 1 && lines > 1 && "w-2/3")}
                />
            ))}
        </div>
    );
}

/** Skeleton shaped like one admin table row. */
function SkeletonRow({ columns = 4 }: { columns?: number }) {
    return (
        <div className="flex items-center gap-4 py-3">
            <Skeleton circle className="h-9 w-9 shrink-0" />
            {Array.from({ length: columns }).map((_, index) => (
                <Skeleton key={index} className="h-4 flex-1" />
            ))}
        </div>
    );
}

export { Skeleton, SkeletonText, SkeletonRow };
