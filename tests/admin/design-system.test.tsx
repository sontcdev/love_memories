import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DesignSystemClient } from "@/app/admin/design-system/design-system-client";
import { ToastProvider } from "@/components/ui/toast";

vi.mock("next/link", () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

function renderPage() {
    return render(
        <ToastProvider>
            <DesignSystemClient />
        </ToastProvider>
    );
}

describe("/admin/design-system", () => {
    it("render mọi nhóm primitive", () => {
        renderPage();

        for (const heading of [
            "Button",
            "Badge",
            "Card",
            "Skeleton",
            "EmptyState",
            "Tooltip",
            "Form control",
            "Toast",
            "Night / Light",
        ]) {
            expect(screen.getByRole("heading", { name: heading, level: 2 })).toBeInTheDocument();
        }
    });

    it("mỗi nhóm render hai lần: nền sáng và trong .dark", () => {
        renderPage();

        // Mỗi Section render children hai lần, nên nút icon-only "Thêm" của bảng
        // Button phải xuất hiện gấp đôi số variant (6 variant × 2 nền).
        expect(screen.getAllByRole("button", { name: "Thêm" })).toHaveLength(12);
    });

    it("có trạng thái invalid và disabled của input", () => {
        renderPage();

        const invalid = screen.getAllByDisplayValue("giá trị không hợp lệ");
        expect(invalid.length).toBeGreaterThan(0);
        expect(invalid[0]).toHaveAttribute("aria-invalid");

        const disabled = screen.getAllByDisplayValue("disabled");
        expect(disabled[0]).toBeDisabled();
    });

    it("vùng skeleton được đánh dấu aria-busy ở container", () => {
        renderPage();

        const busy = screen.getAllByRole("status");
        expect(busy.length).toBeGreaterThan(0);
        expect(busy[0]).toHaveAttribute("aria-busy", "true");
    });

    it("nút toast phát được thông báo", async () => {
        const user = userEvent.setup();
        renderPage();

        await user.click(screen.getAllByRole("button", { name: "success" })[0]);

        const alerts = await screen.findAllByRole("status");
        expect(alerts.some((el) => within(el).queryByText("Toast success"))).toBe(true);
    });
});
