import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useAutoSave } from "@/components/edit/useAutoSave";

/**
 * These tests guard the "khách không thể mất thay đổi" criterion. The riskiest
 * behaviours are the ones asserted first: never saving on mount, never racing
 * two saves, and surfacing failures instead of silently dropping them.
 */
describe("useAutoSave", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    function setup(initialValue: string, save = vi.fn().mockResolvedValue({ success: true })) {
        const view = renderHook(
            ({ value }: { value: string }) => useAutoSave({ value, save, delay: 1000 }),
            { initialProps: { value: initialValue } }
        );
        return { view, save };
    }

    it("does not save on mount", () => {
        const { view, save } = setup("a");

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(save).not.toHaveBeenCalled();
        expect(view.result.current.status).toBe("idle");
    });

    it("goes pending immediately on change, then saves after the delay", async () => {
        const { view, save } = setup("a");

        act(() => {
            view.rerender({ value: "b" });
        });
        expect(view.result.current.status).toBe("pending");
        expect(view.result.current.hasUnsavedChanges).toBe(true);
        expect(save).not.toHaveBeenCalled();

        await act(async () => {
            vi.advanceTimersByTime(1000);
        });

        expect(save).toHaveBeenCalledExactlyOnceWith("b");
        expect(view.result.current.status).toBe("saved");
        expect(view.result.current.lastSavedAt).toBeInstanceOf(Date);
        expect(view.result.current.hasUnsavedChanges).toBe(false);
    });

    it("debounces rapid edits into a single save with the newest value", async () => {
        const { view, save } = setup("a");

        act(() => {
            view.rerender({ value: "b" });
            vi.advanceTimersByTime(400);
            view.rerender({ value: "c" });
            vi.advanceTimersByTime(400);
            view.rerender({ value: "d" });
        });

        await act(async () => {
            vi.advanceTimersByTime(1000);
        });

        expect(save).toHaveBeenCalledExactlyOnceWith("d");
    });

    it("reverts from saved to idle after savedDuration", async () => {
        const save = vi.fn().mockResolvedValue({ success: true });
        const view = renderHook(
            ({ value }: { value: string }) =>
                useAutoSave({ value, save, delay: 1000, savedDuration: 2000 }),
            { initialProps: { value: "a" } }
        );

        act(() => {
            view.rerender({ value: "b" });
        });
        await act(async () => {
            vi.advanceTimersByTime(1000);
        });
        expect(view.result.current.status).toBe("saved");

        act(() => {
            vi.advanceTimersByTime(2000);
        });
        expect(view.result.current.status).toBe("idle");
        // The timestamp survives the status reset, so the indicator can still
        // show "Đã lưu lúc HH:MM".
        expect(view.result.current.lastSavedAt).toBeInstanceOf(Date);
    });

    it("does not save while disabled", async () => {
        const save = vi.fn().mockResolvedValue({ success: true });
        const view = renderHook(
            ({ value, enabled }: { value: string; enabled: boolean }) =>
                useAutoSave({ value, save, enabled, delay: 1000 }),
            { initialProps: { value: "a", enabled: false } }
        );

        act(() => {
            view.rerender({ value: "b", enabled: false });
        });
        await act(async () => {
            vi.advanceTimersByTime(5000);
        });

        expect(save).not.toHaveBeenCalled();
    });

    it("reports an error when the save returns success: false", async () => {
        const save = vi.fn().mockResolvedValue({ success: false, error: "Không thể cập nhật" });
        const view = renderHook(({ value }: { value: string }) => useAutoSave({ value, save, delay: 1000 }), {
            initialProps: { value: "a" },
        });

        act(() => {
            view.rerender({ value: "b" });
        });
        await act(async () => {
            vi.advanceTimersByTime(1000);
        });

        expect(view.result.current.status).toBe("error");
        expect(view.result.current.error).toBe("Không thể cập nhật");
    });

    it("reports an error when the save throws", async () => {
        const save = vi.fn().mockRejectedValue(new Error("mạng lỗi"));
        const view = renderHook(({ value }: { value: string }) => useAutoSave({ value, save, delay: 1000 }), {
            initialProps: { value: "a" },
        });

        act(() => {
            view.rerender({ value: "b" });
        });
        await act(async () => {
            vi.advanceTimersByTime(1000);
        });

        expect(view.result.current.status).toBe("error");
        expect(view.result.current.error).toBe("mạng lỗi");
    });

    it("saveNow flushes without waiting for the debounce", async () => {
        const { view, save } = setup("a");

        act(() => {
            view.rerender({ value: "b" });
        });
        await act(async () => {
            view.result.current.saveNow();
        });

        expect(save).toHaveBeenCalledExactlyOnceWith("b");

        // The cancelled debounce must not fire a second save afterwards.
        await act(async () => {
            vi.advanceTimersByTime(5000);
        });
        expect(save).toHaveBeenCalledTimes(1);
    });

    it("serialises overlapping saves instead of racing them", async () => {
        const order: string[] = [];
        let releaseFirst: (() => void) | null = null;

        const save = vi.fn().mockImplementation((value: string) => {
            order.push(`start:${value}`);
            if (value === "b") {
                return new Promise<{ success: boolean }>((resolve) => {
                    releaseFirst = () => {
                        order.push("end:b");
                        resolve({ success: true });
                    };
                });
            }
            order.push(`end:${value}`);
            return Promise.resolve({ success: true });
        });

        const view = renderHook(({ value }: { value: string }) => useAutoSave({ value, save, delay: 1000 }), {
            initialProps: { value: "a" },
        });

        // First save starts and hangs.
        act(() => {
            view.rerender({ value: "b" });
        });
        await act(async () => {
            vi.advanceTimersByTime(1000);
        });
        expect(order).toEqual(["start:b"]);

        // A second edit lands while the first is still in flight.
        act(() => {
            view.rerender({ value: "c" });
        });
        await act(async () => {
            vi.advanceTimersByTime(1000);
        });
        // Still only one request in flight — the new one was queued, not raced.
        expect(save).toHaveBeenCalledTimes(1);

        await act(async () => {
            releaseFirst?.();
        });

        // The queued payload runs only after the first finished, so the newest
        // value is guaranteed to be written last.
        expect(order).toEqual(["start:b", "end:b", "start:c", "end:c"]);
        expect(save).toHaveBeenNthCalledWith(2, "c");
    });

    it("registers beforeunload only while there are unsaved changes", async () => {
        const addSpy = vi.spyOn(window, "addEventListener");
        const removeSpy = vi.spyOn(window, "removeEventListener");
        const { view } = setup("a");

        const countBeforeUnload = (spy: typeof addSpy) =>
            spy.mock.calls.filter(([type]) => type === "beforeunload").length;

        expect(countBeforeUnload(addSpy)).toBe(0);

        act(() => {
            view.rerender({ value: "b" });
        });
        expect(countBeforeUnload(addSpy)).toBe(1);

        await act(async () => {
            vi.advanceTimersByTime(1000);
        });
        // Saved — the guard must be torn down so normal navigation is not blocked.
        expect(countBeforeUnload(removeSpy)).toBe(1);
    });

    it("clears pending timers on unmount", async () => {
        const { view, save } = setup("a");

        act(() => {
            view.rerender({ value: "b" });
        });
        view.unmount();

        await act(async () => {
            vi.advanceTimersByTime(5000);
        });

        expect(save).not.toHaveBeenCalled();
    });
});
