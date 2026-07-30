import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Placeholder shown when a list has no items yet.
 *
 * This exists because "no data" was previously indistinguishable from "still
 * loading" or "request failed" — all three rendered as an empty container. An
 * empty state should always say what the thing is and how to create the first one.
 */
export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Usually a lucide icon. Decorative only, so it is hidden from a11y tree. */
    icon?: React.ReactNode;
    title: string;
    description?: string;
    /** Primary call to action — the "create the first one" button. */
    action?: React.ReactNode;
    /** Compact spacing, for use inside a card or tab panel. */
    compact?: boolean;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
    ({ className, icon, title, description, action, compact = false, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "flex flex-col items-center justify-center rounded-xl border border-dashed text-center",
                "border-slate-300 dark:border-slate-700",
                compact ? "gap-2 px-4 py-6" : "gap-3 px-6 py-12",
                className
            )}
            {...props}
        >
            {icon && (
                <div
                    aria-hidden="true"
                    className={cn(
                        "flex items-center justify-center rounded-full text-slate-400 dark:text-slate-500",
                        "bg-slate-100 dark:bg-slate-800",
                        compact ? "h-9 w-9" : "h-12 w-12"
                    )}
                >
                    {icon}
                </div>
            )}
            <p className={cn("font-semibold text-slate-700 dark:text-slate-200", compact ? "text-sm" : "text-base")}>
                {title}
            </p>
            {description && (
                <p className={cn("max-w-sm text-slate-500 dark:text-slate-400", compact ? "text-xs" : "text-sm")}>
                    {description}
                </p>
            )}
            {action && <div className={compact ? "mt-1" : "mt-2"}>{action}</div>}
        </div>
    )
);
EmptyState.displayName = "EmptyState";

export { EmptyState };
