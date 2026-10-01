import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useState } from "react";
import { useUndoRedo } from "@/components/edit/useUndoRedo";

/**
 * Undo/redo chỉ đáng tin khi nó không bao giờ làm MẤT dữ liệu. Nên các bài test
 * nặng nhất là: undo không tự sinh thêm bước (nếu không undo/redo sẽ ping-pong),
 * sửa mới phải xóa nhánh redo, và chặn `limit` phải bỏ bước cũ nhất chứ không
 * bỏ bước mới nhất.
 */
describe("useUndoRedo", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    const COALESCE = 100;

    /**
     * Harness mô phỏng một component cha *controlled* thật: `onChange` gọi
     * `setValue`, nên undo/redo thực sự gây render lại và effect theo dõi `value`
     * chạy đúng như trong form thật. Nếu chỉ mock `onChange` thì "tiếng vọng" của
     * undo sẽ không bao giờ xảy ra và bài test sẽ bỏ lọt lỗi vòng lặp.
     */
    function setup(initial: string, options: { limit?: number; coalesceMs?: number } = {}) {
        const onChange = vi.fn();

        const view = renderHook(() => {
            const [value, setValue] = useState(initial);
            const api = useUndoRedo<string>({
                value,
                onChange: (next) => {
                    onChange(next);
                    setValue(next);
                },
                coalesceMs: options.coalesceMs ?? COALESCE,
                ...(options.limit === undefined ? {} : { limit: options.limit }),
            });
            return { ...api, value, setValue };
        });

        /** Gõ một giá trị mới mà KHÔNG chờ hết cửa sổ gộp. */
        const type = (next: string) => {
            act(() => {
                view.result.current.setValue(next);
            });
        };

        /** Gõ rồi để im đủ lâu để bước được chốt vào lịch sử. */
        const typeAndSettle = (next: string) => {
            type(next);
            act(() => {
                vi.advanceTimersByTime(COALESCE);
            });
        };

        const undo = () =>
            act(() => {
                view.result.current.undo();
            });

        const redo = () =>
            act(() => {
                view.result.current.redo();
            });

        return { view, onChange, type, typeAndSettle, undo, redo };
    }

    it("bắt đầu với lịch sử rỗng", () => {
        const { view } = setup("a");

        expect(view.result.current.canUndo).toBe(false);
        expect(view.result.current.canRedo).toBe(false);
    });

    it("undo trả về giá trị trước đó", () => {
        const { view, onChange, typeAndSettle, undo } = setup("a");

        typeAndSettle("b");
        expect(view.result.current.value).toBe("b");
        expect(view.result.current.canUndo).toBe(true);

        undo();

        expect(onChange).toHaveBeenCalledExactlyOnceWith("a");
        expect(view.result.current.value).toBe("a");
    });

    it("redo áp dụng lại giá trị vừa bị undo", () => {
        const { view, typeAndSettle, undo, redo } = setup("a");

        typeAndSettle("b");
        undo();
        expect(view.result.current.value).toBe("a");
        expect(view.result.current.canRedo).toBe(true);

        redo();

        expect(view.result.current.value).toBe("b");
        expect(view.result.current.canRedo).toBe(false);
        expect(view.result.current.canUndo).toBe(true);
    });

    it("đi được nhiều bước liên tiếp theo cả hai chiều", () => {
        const { view, typeAndSettle, undo, redo } = setup("a");

        typeAndSettle("b");
        typeAndSettle("c");
        typeAndSettle("d");

        undo();
        expect(view.result.current.value).toBe("c");
        undo();
        expect(view.result.current.value).toBe("b");
        undo();
        expect(view.result.current.value).toBe("a");

        redo();
        expect(view.result.current.value).toBe("b");
        redo();
        expect(view.result.current.value).toBe("c");
        redo();
        expect(view.result.current.value).toBe("d");
    });

    it("sửa mới xóa nhánh redo", () => {
        const { view, typeAndSettle, type, undo, redo } = setup("a");

        typeAndSettle("b");
        typeAndSettle("c");
        undo();
        expect(view.result.current.value).toBe("b");
        expect(view.result.current.canRedo).toBe(true);

        // Nhánh redo phải mất NGAY khi sửa, không đợi hết cửa sổ gộp.
        type("d");
        expect(view.result.current.canRedo).toBe(false);

        act(() => {
            vi.advanceTimersByTime(COALESCE);
        });
        redo();
        // "c" không còn tồn tại — redo là no-op, giá trị giữ nguyên.
        expect(view.result.current.value).toBe("d");
        expect(view.result.current.canRedo).toBe(false);

        // Nhưng undo vẫn về được trạng thái trước lần sửa mới.
        undo();
        expect(view.result.current.value).toBe("b");
    });

    it("undo KHÔNG tự tạo thêm một bước lịch sử", () => {
        const { view, typeAndSettle, undo } = setup("a");

        typeAndSettle("b");
        undo();

        // Sau khi undo về "a": lịch sử quá khứ đã cạn.
        expect(view.result.current.value).toBe("a");
        expect(view.result.current.canUndo).toBe(false);
        expect(view.result.current.canRedo).toBe(true);

        // Để cửa sổ gộp chạy hết: tiếng vọng của undo không được chốt thành bước mới.
        act(() => {
            vi.advanceTimersByTime(COALESCE * 5);
        });
        expect(view.result.current.canUndo).toBe(false);
        expect(view.result.current.canRedo).toBe(true);

        // Và undo lần nữa cũng không đẩy "a" ra `onChange` thêm lần nào.
        undo();
        expect(view.result.current.value).toBe("a");
    });

    it("gộp chuỗi thay đổi nhanh thành một bước duy nhất", () => {
        const { view, onChange, undo } = setup("a");

        // Mô phỏng gõ từng ký tự của một từ.
        act(() => {
            view.result.current.setValue("ab");
        });
        act(() => {
            vi.advanceTimersByTime(COALESCE / 2);
            view.result.current.setValue("abc");
        });
        act(() => {
            vi.advanceTimersByTime(COALESCE / 2);
            view.result.current.setValue("abcd");
        });
        act(() => {
            vi.advanceTimersByTime(COALESCE);
        });

        undo();

        // Một bước duy nhất, và mốc phục hồi là trạng thái TRƯỚC khi gõ từ đó.
        expect(onChange).toHaveBeenCalledExactlyOnceWith("a");
        expect(view.result.current.value).toBe("a");
        expect(view.result.current.canUndo).toBe(false);
    });

    it("undo flush bước đang chờ nên thay đổi vừa gõ vẫn undo được", () => {
        const { view, type, undo } = setup("a");

        type("b");
        // Chưa hết cửa sổ gộp, nhưng canUndo phải đã bật.
        expect(view.result.current.canUndo).toBe(true);

        undo();
        expect(view.result.current.value).toBe("a");
    });

    it("chặn số bước ở limit và bỏ các bước CŨ NHẤT", () => {
        const { view, typeAndSettle, undo } = setup("a", { limit: 3 });

        typeAndSettle("b");
        typeAndSettle("c");
        typeAndSettle("d");
        typeAndSettle("e");

        // Bốn mốc phục hồi (a, b, c, d) nhưng chỉ giữ 3 mốc mới nhất: b, c, d.
        undo();
        expect(view.result.current.value).toBe("d");
        undo();
        expect(view.result.current.value).toBe("c");
        undo();
        expect(view.result.current.value).toBe("b");

        // "a" đã bị bỏ vì là bước cũ nhất.
        expect(view.result.current.canUndo).toBe(false);
        undo();
        expect(view.result.current.value).toBe("b");
    });

    it("canUndo/canRedo đúng ở cả hai đầu lịch sử", () => {
        const { view, typeAndSettle, undo, redo } = setup("a");

        // Đầu trên: chưa sửa gì.
        expect(view.result.current.canUndo).toBe(false);
        expect(view.result.current.canRedo).toBe(false);
        undo();
        expect(view.result.current.value).toBe("a");

        typeAndSettle("b");
        // Ở cuối lịch sử: undo được, redo không.
        expect(view.result.current.canUndo).toBe(true);
        expect(view.result.current.canRedo).toBe(false);
        redo();
        expect(view.result.current.value).toBe("b");

        undo();
        // Về đầu lịch sử: redo được, undo không.
        expect(view.result.current.canUndo).toBe(false);
        expect(view.result.current.canRedo).toBe(true);
    });

    it("gõ rồi xóa về đúng giá trị cũ thì không tạo bước chết", () => {
        const { view, type } = setup("a");

        type("ab");
        type("a");
        act(() => {
            vi.advanceTimersByTime(COALESCE);
        });

        expect(view.result.current.value).toBe("a");
        expect(view.result.current.canUndo).toBe(false);
    });

    it("reset xóa lịch sử, và đẩy giá trị mới ra onChange khi được truyền", () => {
        const { view, onChange, typeAndSettle } = setup("a");

        typeAndSettle("b");
        expect(view.result.current.canUndo).toBe(true);

        act(() => {
            view.result.current.reset();
        });
        expect(view.result.current.canUndo).toBe(false);
        expect(view.result.current.canRedo).toBe(false);
        expect(onChange).not.toHaveBeenCalled();

        act(() => {
            view.result.current.reset("z");
        });
        expect(onChange).toHaveBeenCalledExactlyOnceWith("z");
        expect(view.result.current.value).toBe("z");
        expect(view.result.current.canUndo).toBe(false);
    });

    it("làm việc với giá trị dạng object, so sánh theo nội dung", () => {
        const onChange = vi.fn();
        type Form = { boy_name: string; girl_name: string };

        const view = renderHook(() => {
            const [value, setValue] = useState<Form>({ boy_name: "An", girl_name: "Bình" });
            const api = useUndoRedo<Form>({
                value,
                onChange: (next) => {
                    onChange(next);
                    setValue(next);
                },
                coalesceMs: COALESCE,
            });
            return { ...api, value, setValue };
        });

        // Object mới nhưng nội dung y hệt: không được tính là một lần sửa.
        act(() => {
            view.result.current.setValue({ boy_name: "An", girl_name: "Bình" });
            vi.advanceTimersByTime(COALESCE);
        });
        expect(view.result.current.canUndo).toBe(false);

        act(() => {
            view.result.current.setValue({ boy_name: "An", girl_name: "Chi" });
            vi.advanceTimersByTime(COALESCE);
        });
        expect(view.result.current.canUndo).toBe(true);

        act(() => {
            view.result.current.undo();
        });
        expect(view.result.current.value).toEqual({ boy_name: "An", girl_name: "Bình" });
    });

    describe("phím tắt", () => {
        function pressOn(target: HTMLElement, key: string, modifiers: Partial<KeyboardEventInit> = {}) {
            const event = new KeyboardEvent("keydown", {
                key,
                bubbles: true,
                cancelable: true,
                ctrlKey: true,
                ...modifiers,
            });
            act(() => {
                target.dispatchEvent(event);
            });
            return event;
        }

        it("Ctrl+Z ngoài ô nhập liệu thì undo và chặn hành vi mặc định", () => {
            const { view, typeAndSettle } = setup("a");
            typeAndSettle("b");

            const event = pressOn(document.body, "z");

            expect(event.defaultPrevented).toBe(true);
            expect(view.result.current.value).toBe("a");
        });

        it("Ctrl+Shift+Z và Ctrl+Y đều redo", () => {
            const { view, typeAndSettle, undo } = setup("a");
            typeAndSettle("b");
            typeAndSettle("c");
            undo();
            undo();
            expect(view.result.current.value).toBe("a");

            pressOn(document.body, "Z", { shiftKey: true });
            expect(view.result.current.value).toBe("b");

            pressOn(document.body, "y");
            expect(view.result.current.value).toBe("c");
        });

        it("KHÔNG chiếm undo gốc của trình duyệt khi đang gõ trong input/textarea", () => {
            const { view, typeAndSettle } = setup("a");
            typeAndSettle("b");

            const input = document.createElement("input");
            input.type = "text";
            document.body.appendChild(input);
            const textarea = document.createElement("textarea");
            document.body.appendChild(textarea);

            try {
                const inputEvent = pressOn(input, "z");
                expect(inputEvent.defaultPrevented).toBe(false);
                expect(view.result.current.value).toBe("b");

                const textareaEvent = pressOn(textarea, "z");
                expect(textareaEvent.defaultPrevented).toBe(false);
                expect(view.result.current.value).toBe("b");
            } finally {
                input.remove();
                textarea.remove();
            }
        });

        it("vẫn nhận phím tắt ở các ô không có undo gốc (checkbox, date)", () => {
            const { view, typeAndSettle } = setup("a");
            typeAndSettle("b");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            document.body.appendChild(checkbox);

            try {
                const event = pressOn(checkbox, "z");
                expect(event.defaultPrevented).toBe(true);
                expect(view.result.current.value).toBe("a");
            } finally {
                checkbox.remove();
            }
        });

        it("bỏ qua phím tắt khi keyboard: false", () => {
            const onChange = vi.fn();
            const view = renderHook(() => {
                const [value, setValue] = useState("a");
                const api = useUndoRedo<string>({
                    value,
                    onChange: (next) => {
                        onChange(next);
                        setValue(next);
                    },
                    coalesceMs: COALESCE,
                    keyboard: false,
                });
                return { ...api, value, setValue };
            });

            act(() => {
                view.result.current.setValue("b");
                vi.advanceTimersByTime(COALESCE);
            });

            const event = new KeyboardEvent("keydown", {
                key: "z",
                ctrlKey: true,
                bubbles: true,
                cancelable: true,
            });
            act(() => {
                document.body.dispatchEvent(event);
            });

            expect(event.defaultPrevented).toBe(false);
            expect(view.result.current.value).toBe("b");
        });
    });
});
