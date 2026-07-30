import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge, badgeVariants } from "@/components/ui/badge";

describe("<Badge />", () => {
    it("renders its children as a <span>", () => {
        render(<Badge>Đã xuất bản</Badge>);
        const badge = screen.getByText("Đã xuất bản");
        expect(badge).toBeInTheDocument();
        expect(badge.tagName).toBe("SPAN");
    });

    it("applies the base shape classes to every variant", () => {
        render(<Badge>base</Badge>);
        expect(screen.getByText("base")).toHaveClass(
            "inline-flex",
            "items-center",
            "rounded-full",
            "border",
            "text-xs",
            "font-medium"
        );
    });

    it("falls back to the default variant when none is given", () => {
        render(<Badge>default</Badge>);
        expect(screen.getByText("default")).toHaveClass("bg-slate-100", "text-slate-700");
    });

    it.each([
        ["success", "bg-emerald-50", "text-emerald-700"],
        ["warning", "bg-amber-50", "text-amber-700"],
        ["danger", "bg-rose-50", "text-rose-700"],
        ["info", "bg-sky-50", "text-sky-700"],
        ["violet", "bg-violet-50", "text-violet-700"],
    ] as const)("applies %s variant colours", (variant, bg, text) => {
        render(<Badge variant={variant}>{variant}</Badge>);
        expect(screen.getByText(variant)).toHaveClass(bg, text);
    });

    it("uses transparent background for the outline variant", () => {
        render(<Badge variant="outline">outline</Badge>);
        const badge = screen.getByText("outline");
        expect(badge).toHaveClass("border-current", "bg-transparent");
        expect(badge).not.toHaveClass("bg-slate-100");
    });

    it("shrinks padding and font size for size='sm'", () => {
        render(<Badge size="sm">sm</Badge>);
        const badge = screen.getByText("sm");
        expect(badge).toHaveClass("px-1.5", "text-[10px]");
        // tailwind-merge must have dropped the base `text-xs`/`px-2`.
        expect(badge).not.toHaveClass("text-xs");
        expect(badge).not.toHaveClass("px-2");
    });

    it("lets a caller className override a variant class", () => {
        render(
            <Badge variant="success" className="bg-white">
                override
            </Badge>
        );
        const badge = screen.getByText("override");
        expect(badge).toHaveClass("bg-white");
        expect(badge).not.toHaveClass("bg-emerald-50");
    });

    it("forwards arbitrary span props and the ref", () => {
        const ref = React.createRef<HTMLSpanElement>();
        render(
            <Badge ref={ref} data-testid="badge" title="tooltip" aria-label="status">
                props
            </Badge>
        );
        const badge = screen.getByTestId("badge");
        expect(ref.current).toBe(badge);
        expect(badge).toHaveAttribute("title", "tooltip");
        expect(badge).toHaveAccessibleName("status");
    });

    it("exposes badgeVariants for use outside the component", () => {
        expect(badgeVariants({ variant: "danger" })).toContain("bg-rose-50");
        expect(badgeVariants({ size: "sm" })).toContain("text-[10px]");
    });
});
