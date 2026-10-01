import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Small status label. Used for draft/published state, template type and tags.
 *
 * Colours are self-contained rather than pulled from the shadcn `--primary`
 * tokens, because badges sit inside templates that each have their own palette
 * and the semantic meaning (draft vs live) must stay readable in all of them.
 */
const badgeVariants = cva(
    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors",
    {
        variants: {
            variant: {
                default: "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200",
                success: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-900/30 dark:text-emerald-300",
                warning: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700/60 dark:bg-amber-900/30 dark:text-amber-300",
                danger: "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700/60 dark:bg-rose-900/30 dark:text-rose-300",
                info: "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-700/60 dark:bg-sky-900/30 dark:text-sky-300",
                violet: "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700/60 dark:bg-violet-900/30 dark:text-violet-300",
                outline: "border-current bg-transparent",
            },
            size: {
                default: "text-xs",
                sm: "px-1.5 py-0 text-[10px]",
            },
        },
        defaultVariants: { variant: "default", size: "default" },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> { }

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant, size, ...props }, ref) => (
        <span ref={ref} className={cn(badgeVariants({ variant, size }), className)} {...props} />
    )
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
