import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ToastProvider, useToast, type ToastApi } from "@/components/ui/toast";

/**
 * Mirrors the (unexported) constants in src/components/ui/toast.tsx. If those
 * change, these tests should fail loudly — that is the point.
 */
const MAX_VISIBLE = 4;
const DEFAULT_DURATION = {
    success: 4000,
    info: 4000,
    warning: 6000,
    error: 8000,
} as const;

const CLOSE_LABEL = "Đóng thông báo";

/**
 * Mounts a provider and hands back the imperative API, so tests can fire toasts
 * without also having to build a button for every variant.
 */
function renderToasts() {
    const captured: { current: ToastApi | null } = { current: null };

    function Capture() {
        captured.current = useToast();
        return null;
    }

    const utils = render(
        <ToastProvider>
            <Capture />
        </ToastProvider>
    );

    function run<T>(fn: (api: ToastApi) => T): T {
        const api = captured.current;
        if (!api) throw new Error("ToastProvider did not mount");
        let result!: T;
        act(() => {
            result = fn(api);
        });
        return result;
    }

    return { ...utils, run };
}

/** All toast cards, regardless of which live-region role they took. */
function allToasts() {
    return [...screen.queryAllByRole("status"), ...screen.queryAllByRole("alert")];
}

describe("useToast()", () => {
    it("throws a helpful error when used outside <ToastProvider>", () => {
        function Orphan() {
            useToast();
            return null;
        }
        // React logs the render error itself; silence it so the run stays readable.
        const spy = vi.spyOn(console, "error").mockImplementation(() => { });
        expect(() => render(<Orphan />)).toThrow(/ToastProvider/);
        spy.mockRestore();
    });

    it("returns a stable api object across re-renders", () => {
        const seen: ToastApi[] = [];
        function Capture() {
            seen.push(useToast());
            return null;
        }
        const { rerender } = render(
            <ToastProvider>
                <Capture />
            </ToastProvider>
        );
        rerender(
            <ToastProvider>
                <Capture />
            </ToastProvider>
        );

        expect(seen.length).toBeGreaterThanOrEqual(2);
        expect(seen[1]).toBe(seen[0]);
    });
});

describe("<ToastProvider /> rendering", () => {
    it("renders nothing until a toast is fired", () => {
        renderToasts();
        expect(allToasts()).toHaveLength(0);
    });

    it("renders a toast from success()", () => {
        const { run } = renderToasts();
        run((t) => t.success("Đã lưu thay đổi"));

        expect(screen.getByText("Đã lưu thay đổi")).toBeInTheDocument();
        expect(allToasts()).toHaveLength(1);
    });

    it("renders the optional description alongside the title", () => {
        const { run } = renderToasts();
        run((t) => t.error("Không thể tải ảnh", "Ảnh vượt quá 50KB."));

        expect(screen.getByText("Không thể tải ảnh")).toBeInTheDocument();
        expect(screen.getByText("Ảnh vượt quá 50KB.")).toBeInTheDocument();
    });

    it("returns a new increasing id for every toast", () => {
        const { run } = renderToasts();
        const first = run((t) => t.success("a"));
        const second = run((t) => t.info("b"));

        expect(typeof first).toBe("number");
        expect(second).toBeGreaterThan(first);
    });

    it("gives every toast a labelled close button", () => {
        const { run } = renderToasts();
        run((t) => t.success("Đã lưu"));

        expect(screen.getByRole("button", { name: CLOSE_LABEL })).toBeInTheDocument();
    });
});

describe("<ToastProvider /> live-region roles", () => {
    it("uses role=status / aria-live=polite for success", () => {
        const { run } = renderToasts();
        run((t) => t.success("Đã lưu"));

        const toast = screen.getByRole("status");
        expect(toast).toHaveAttribute("aria-live", "polite");
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("uses role=status / aria-live=polite for info", () => {
        const { run } = renderToasts();
        run((t) => t.info("Đang đồng bộ"));

        expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
    });

    it("uses role=alert / aria-live=assertive for error", () => {
        const { run } = renderToasts();
        run((t) => t.error("Lỗi mạng"));

        const toast = screen.getByRole("alert");
        expect(toast).toHaveAttribute("aria-live", "assertive");
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("uses role=alert for warning, since it also interrupts", () => {
        const { run } = renderToasts();
        run((t) => t.warning("Sắp hết dung lượng"));

        expect(screen.getByRole("alert")).toHaveAttribute("aria-live", "assertive");
    });

    it("keeps a success toast and an error toast on their own roles at once", () => {
        const { run } = renderToasts();
        run((t) => t.success("Đã lưu"));
        run((t) => t.error("Lỗi mạng"));

        expect(screen.getByRole("status")).toHaveTextContent("Đã lưu");
        expect(screen.getByRole("alert")).toHaveTextContent("Lỗi mạng");
    });
});

describe("<ToastProvider /> dismissal", () => {
    it("removes a toast when dismiss(id) is called", () => {
        const { run } = renderToasts();
        const id = run((t) => t.success("Đã lưu"));
        expect(allToasts()).toHaveLength(1);

        run((t) => t.dismiss(id));
        expect(allToasts()).toHaveLength(0);
        expect(screen.queryByText("Đã lưu")).not.toBeInTheDocument();
    });

    it("only removes the targeted toast", () => {
        const { run } = renderToasts();
        const keep = run((t) => t.success("giữ lại"));
        const drop = run((t) => t.success("xoá đi"));

        run((t) => t.dismiss(drop));

        expect(screen.queryByText("xoá đi")).not.toBeInTheDocument();
        expect(screen.getByText("giữ lại")).toBeInTheDocument();
        expect(keep).not.toBe(drop);
    });

    it("ignores dismiss() for an id that is already gone", () => {
        const { run } = renderToasts();
        const id = run((t) => t.success("Đã lưu"));
        run((t) => t.dismiss(id));

        expect(() => run((t) => t.dismiss(id))).not.toThrow();
        expect(allToasts()).toHaveLength(0);
    });

    it("removes a toast when its close button is clicked", async () => {
        const user = userEvent.setup();
        const { run } = renderToasts();
        run((t) => t.success("Đã lưu"));

        await user.click(screen.getByRole("button", { name: CLOSE_LABEL }));

        expect(allToasts()).toHaveLength(0);
    });

    it("clears every toast with dismissAll()", () => {
        const { run } = renderToasts();
        run((t) => t.success("a"));
        run((t) => t.error("b"));
        run((t) => t.warning("c"));
        expect(allToasts()).toHaveLength(3);

        run((t) => t.dismissAll());
        expect(allToasts()).toHaveLength(0);
    });
});

describe("<ToastProvider /> stack cap", () => {
    it(`shows at most ${MAX_VISIBLE} toasts at once`, () => {
        const { run } = renderToasts();
        for (let i = 1; i <= 6; i++) {
            run((t) => t.success(`toast ${i}`));
        }

        expect(allToasts()).toHaveLength(MAX_VISIBLE);
    });

    it("drops the oldest toasts, keeping the newest ones in order", () => {
        const { run } = renderToasts();
        for (let i = 1; i <= 6; i++) {
            run((t) => t.success(`toast ${i}`));
        }

        expect(screen.queryByText("toast 1")).not.toBeInTheDocument();
        expect(screen.queryByText("toast 2")).not.toBeInTheDocument();
        expect(screen.getAllByRole("status").map((el) => el.textContent)).toEqual([
            expect.stringContaining("toast 3"),
            expect.stringContaining("toast 4"),
            expect.stringContaining("toast 5"),
            expect.stringContaining("toast 6"),
        ]);
    });

    it("stays capped even when the burst is fired inside one batch", () => {
        const { run } = renderToasts();
        run((t) => {
            for (let i = 1; i <= 10; i++) t.success(`burst ${i}`);
        });

        expect(allToasts()).toHaveLength(MAX_VISIBLE);
        expect(screen.getByText("burst 10")).toBeInTheDocument();
        expect(screen.queryByText("burst 6")).not.toBeInTheDocument();
    });
});

describe("<ToastProvider /> auto-dismiss", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const advance = (ms: number) =>
        act(() => {
            vi.advanceTimersByTime(ms);
        });

    it("auto-dismisses a success toast after its default duration", () => {
        const { run } = renderToasts();
        run((t) => t.success("Đã lưu"));

        advance(DEFAULT_DURATION.success - 1);
        expect(allToasts()).toHaveLength(1);

        advance(1);
        expect(allToasts()).toHaveLength(0);
    });

    it("keeps an error toast on screen twice as long as a success toast", () => {
        const { run } = renderToasts();
        run((t) => t.error("Lỗi mạng"));

        advance(DEFAULT_DURATION.success);
        expect(screen.getByRole("alert")).toBeInTheDocument();

        advance(DEFAULT_DURATION.error - DEFAULT_DURATION.success);
        expect(allToasts()).toHaveLength(0);
    });

    it("uses the 6s warning duration", () => {
        const { run } = renderToasts();
        run((t) => t.warning("Sắp hết dung lượng"));

        advance(DEFAULT_DURATION.warning - 1);
        expect(allToasts()).toHaveLength(1);
        advance(1);
        expect(allToasts()).toHaveLength(0);
    });

    it("honours an explicit duration", () => {
        const { run } = renderToasts();
        run((t) => t.show({ title: "nhanh", variant: "success", duration: 500 }));

        advance(499);
        expect(allToasts()).toHaveLength(1);
        advance(1);
        expect(allToasts()).toHaveLength(0);
    });

    it("keeps a toast forever when duration is 0", () => {
        const { run } = renderToasts();
        run((t) => t.show({ title: "dính", variant: "error", duration: 0 }));

        advance(60_000);
        expect(screen.getByText("dính")).toBeInTheDocument();
    });

    it("expires each toast on its own schedule", () => {
        const { run } = renderToasts();
        run((t) => t.show({ title: "sớm", variant: "info", duration: 1000 }));
        run((t) => t.show({ title: "muộn", variant: "info", duration: 5000 }));

        advance(1000);
        expect(screen.queryByText("sớm")).not.toBeInTheDocument();
        expect(screen.getByText("muộn")).toBeInTheDocument();

        advance(4000);
        expect(allToasts()).toHaveLength(0);
    });

    it("pauses the countdown while hovered and restarts it on leave", () => {
        const { run } = renderToasts();
        run((t) => t.success("Đã lưu"));
        const toast = screen.getByRole("status");

        advance(3000);
        fireEvent.mouseEnter(toast);

        // Paused: well past the 4s duration and still visible.
        advance(30_000);
        expect(allToasts()).toHaveLength(1);

        fireEvent.mouseLeave(toast);
        advance(DEFAULT_DURATION.success - 1);
        expect(allToasts()).toHaveLength(1);

        advance(1);
        expect(allToasts()).toHaveLength(0);
    });

    it("pauses the countdown while focused", () => {
        const { run } = renderToasts();
        run((t) => t.success("Đã lưu"));
        const toast = screen.getByRole("status");

        fireEvent.focus(toast);
        advance(30_000);
        expect(allToasts()).toHaveLength(1);

        fireEvent.blur(toast);
        advance(DEFAULT_DURATION.success);
        expect(allToasts()).toHaveLength(0);
    });

    it("does not resurrect a toast that overflowed the stack", () => {
        const { run } = renderToasts();
        for (let i = 1; i <= 6; i++) {
            run((t) => t.success(`toast ${i}`));
        }

        advance(DEFAULT_DURATION.success);
        expect(allToasts()).toHaveLength(0);
        expect(screen.queryByText("toast 1")).not.toBeInTheDocument();
    });
});
