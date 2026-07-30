import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EmptyState } from "@/components/ui/empty-state";

describe("<EmptyState />", () => {
    it("renders title, description and action together", () => {
        render(
            <EmptyState
                title="Chưa có ảnh nào"
                description="Thêm ảnh đầu tiên để bắt đầu album kỷ niệm."
                action={<button type="button">Thêm ảnh</button>}
            />
        );

        expect(screen.getByText("Chưa có ảnh nào")).toBeInTheDocument();
        expect(
            screen.getByText("Thêm ảnh đầu tiên để bắt đầu album kỷ niệm.")
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Thêm ảnh" })).toBeInTheDocument();
    });

    it("renders title alone when description and action are omitted", () => {
        const { container } = render(<EmptyState title="Trống" />);
        expect(screen.getByText("Trống")).toBeInTheDocument();
        // Exactly one text node — no empty <p> or wrapper div left behind.
        expect(container.querySelectorAll("p")).toHaveLength(1);
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("keeps the action clickable", async () => {
        const onClick = vi.fn();
        const user = userEvent.setup();
        render(
            <EmptyState
                title="Chưa có mốc thời gian"
                action={
                    <button type="button" onClick={onClick}>
                        Tạo mốc
                    </button>
                }
            />
        );

        await user.click(screen.getByRole("button", { name: "Tạo mốc" }));
        expect(onClick).toHaveBeenCalledOnce();
    });

    it("hides the decorative icon from the accessibility tree", () => {
        render(<EmptyState title="Trống" icon={<svg data-testid="icon" />} />);
        const icon = screen.getByTestId("icon");
        expect(icon).toBeInTheDocument();
        // The icon carries no meaning the title does not already convey.
        expect(icon.parentElement).toHaveAttribute("aria-hidden", "true");
    });

    it("renders no icon wrapper when no icon is passed", () => {
        const { container } = render(<EmptyState title="Trống" />);
        expect(container.querySelector("[aria-hidden='true']")).toBeNull();
    });

    it("uses the dashed border that distinguishes 'empty' from 'loading'", () => {
        const { container } = render(<EmptyState title="Trống" />);
        expect(container.firstElementChild).toHaveClass("border-dashed", "rounded-xl", "text-center");
    });

    it("tightens spacing and type scale in compact mode", () => {
        const { container } = render(
            <EmptyState compact title="Trống" description="mô tả" icon={<svg data-testid="icon" />} />
        );

        expect(container.firstElementChild).toHaveClass("gap-2", "px-4", "py-6");
        expect(screen.getByText("Trống")).toHaveClass("text-sm");
        expect(screen.getByText("mô tả")).toHaveClass("text-xs");
        expect(screen.getByTestId("icon").parentElement).toHaveClass("h-9", "w-9");
    });

    it("uses roomy spacing and larger type by default", () => {
        const { container } = render(
            <EmptyState title="Trống" description="mô tả" icon={<svg data-testid="icon" />} />
        );

        expect(container.firstElementChild).toHaveClass("gap-3", "px-6", "py-12");
        expect(screen.getByText("Trống")).toHaveClass("text-base");
        expect(screen.getByText("mô tả")).toHaveClass("text-sm");
        expect(screen.getByTestId("icon").parentElement).toHaveClass("h-12", "w-12");
    });

    it("forwards className, extra div props and the ref", () => {
        const ref = React.createRef<HTMLDivElement>();
        render(<EmptyState ref={ref} title="Trống" className="my-8" data-testid="empty" role="status" />);

        const root = screen.getByTestId("empty");
        expect(ref.current).toBe(root);
        expect(root).toHaveClass("my-8");
        expect(root).toHaveAttribute("role", "status");
    });
});
