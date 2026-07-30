"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseUndoRedoOptions<T> {
    /**
     * Giá trị hiện tại của form. Hook này là *controlled*: nó không giữ dữ liệu,
     * chỉ giữ lịch sử. Nguồn sự thật vẫn là component cha (hoặc react-hook-form).
     */
    value: T;
    /** Được gọi khi undo/redo cần đẩy một giá trị cũ trở lại cho form. */
    onChange: (value: T) => void;
    /** Số bước lịch sử tối đa. Vượt ngưỡng thì bỏ các bước CŨ NHẤT. */
    limit?: number;
    /**
     * Khoảng "im lặng" để gộp các thay đổi liên tiếp thành một bước.
     * Xem ghi chú về quy tắc gộp ở dưới.
     */
    coalesceMs?: number;
    /** Bật/tắt phím tắt Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y. Mặc định bật. */
    keyboard?: boolean;
}

export interface UseUndoRedoResult<T> {
    canUndo: boolean;
    canRedo: boolean;
    undo: () => void;
    redo: () => void;
    /**
     * Xóa toàn bộ lịch sử. Nếu truyền `next`, đồng thời đẩy giá trị đó ra
     * `onChange` (dùng khi form được nạp lại dữ liệu từ server).
     */
    reset: (next?: T) => void;
}

/**
 * So sánh giá trị theo NỘI DUNG, không theo tham chiếu.
 *
 * Bắt buộc phải như vậy: `watch()` của react-hook-form trả về một object MỚI ở
 * mỗi lần render, nên so sánh bằng `===` sẽ coi mỗi lần render là một lần sửa và
 * lịch sử sẽ phình ra vô hạn. Dữ liệu form luôn JSON-serialisable nên cách này an toàn.
 */
function keyOf<T>(value: T): string {
    try {
        return JSON.stringify(value) ?? "undefined";
    } catch {
        // Vòng lặp tham chiếu hoặc BigInt — không nên xảy ra với state của form,
        // nhưng thà mất khả năng gộp còn hơn làm crash cả trang.
        return String(value);
    }
}

/**
 * Các `<input>` mà trình duyệt CÓ sẵn undo riêng cho từng ô.
 *
 * `date`, `checkbox`, `radio`, `range`, `color`, `file`, `<select>`… không có
 * undo gốc, nên ở những ô đó phím tắt của chúng ta được phép hoạt động.
 */
const NATIVE_UNDO_INPUT_TYPES = new Set([
    "text",
    "search",
    "url",
    "tel",
    "email",
    "password",
    "number",
]);

/**
 * Quyết định (quan trọng): KHÔNG chiếm phím Ctrl/Cmd+Z khi con trỏ đang nằm
 * trong ô nhập liệu.
 *
 * Lý do: undo gốc của trình duyệt trong một ô text hoạt động ở mức từng ký tự và
 * đó chính là điều người dùng mong đợi khi đang gõ. Nếu chúng ta `preventDefault`
 * ở đó, Ctrl+Z sẽ nhảy CẢ FORM về trạng thái trước — người dùng chỉ muốn xóa một
 * chữ vừa gõ sai lại thấy mất luôn mấy ô khác. Cảm giác đó giống lỗi hơn là tính năng.
 *
 * Vì vậy undo mức-form chỉ nhận phím tắt khi focus KHÔNG ở trong ô text (ví dụ vừa
 * bấm một nút, hoặc focus đang ở body). Ngoài ra hook luôn trả về `undo`/`redo` để
 * form render thành hai nút bấm — đó mới là đường đi dễ thấy và dễ dùng nhất,
 * hoạt động ở mọi trạng thái focus.
 */
function isNativeUndoTarget(target: EventTarget | null): boolean {
    if (typeof HTMLElement === "undefined") return false;
    if (!(target instanceof HTMLElement)) return false;
    if (target.isContentEditable) return true;
    if (target instanceof HTMLTextAreaElement) return !target.readOnly && !target.disabled;
    if (target instanceof HTMLInputElement) {
        if (target.readOnly || target.disabled) return false;
        return NATIVE_UNDO_INPUT_TYPES.has(target.type.toLowerCase());
    }
    return false;
}

/**
 * Lịch sử undo/redo dùng chung cho state của form.
 *
 * Ghi chú thiết kế:
 *
 * 1. **Sửa mới thì XÓA nhánh redo.** Sau khi undo về B rồi gõ tiếp, "tương lai"
 *    cũ không còn tồn tại nữa nên `future` bị xóa ngay tại thời điểm bắt đầu sửa
 *    (không đợi tới lúc commit) để `canRedo` phản ánh đúng tức thì.
 *
 * 2. **Không ghi lại chính hành động undo.** `undo()` gọi `onChange(previous)`,
 *    cha render lại, effect theo dõi `value` chạy — nếu ghi lần đó thành một bước
 *    mới thì undo/redo sẽ tự đẩy nhau vô hạn. Chặn tường minh bằng
 *    `applyingKeyRef`: giá trị vừa đẩy ra `onChange` được nhớ lại và "tiếng vọng"
 *    của nó bị bỏ qua đúng một lần. Nếu tiếng vọng không bao giờ về (cha phớt lờ
 *    `onChange`), cờ được xả ở lần thay đổi thật kế tiếp thay vì ăn mất bước đó.
 *
 * 3. **Chặn số bước ở `limit`, bỏ các bước CŨ NHẤT.** Người dùng cần undo gần,
 *    không cần undo về đầu buổi; giữ đuôi mới nhất là đúng nhu cầu và chặn được
 *    việc phình bộ nhớ.
 *
 * 4. **Quy tắc gộp (coalescing): debounce theo thời gian rảnh.** Một chuỗi thay
 *    đổi cách nhau dưới `coalesceMs` (mặc định 500ms) chỉ tạo ĐÚNG MỘT bước, và
 *    mốc phục hồi của bước đó là trạng thái TRƯỚC KHI chuỗi bắt đầu. Nhờ vậy
 *    undo nhảy về "trước khi gõ từ này", không nhảy vào giữa từ — gõ một từ 20
 *    ký tự cho 1 bước, không phải 20 bước. `undo()`/`redo()` luôn "flush" bước
 *    đang chờ trước khi chạy, nên thay đổi vừa gõ 50ms trước vẫn undo được.
 *
 * 5. **Phím tắt:** Ctrl/Cmd+Z = undo, Ctrl/Cmd+Shift+Z và Ctrl+Y = redo. Xem
 *    {@link isNativeUndoTarget} về việc cố tình nhường phím cho ô nhập liệu.
 */
export function useUndoRedo<T>({
    value,
    onChange,
    limit = 50,
    coalesceMs = 500,
    keyboard = true,
}: UseUndoRedoOptions<T>): UseUndoRedoResult<T> {
    const cap = Math.max(1, Math.floor(limit));

    // Giữ trong ref để một callback truyền inline không làm listener bàn phím
    // phải gắn/tháo lại mỗi lần render.
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    const latestValueRef = useRef(value);
    latestValueRef.current = value;

    /**
     * Lịch sử nằm trong ref chứ không phải state: `undo()` phải ĐỌC và GHI nó một
     * cách đồng bộ trong cùng một event handler (nó flush bước đang chờ rồi mới
     * pop). Nếu để trong state, hai lần setState nối tiếp buộc phải viết trong
     * updater — mà updater lại không được phép gây side effect như `onChange`.
     */
    const historyRef = useRef<{ past: T[]; future: T[] }>({ past: [], future: [] });

    // Chỉ mirror ra state phần UI cần, để render lại đúng lúc canUndo/canRedo đổi.
    const [flags, setFlags] = useState({ canUndo: false, canRedo: false });

    // `present` = giá trị đang hiển thị, xét theo góc nhìn lịch sử.
    const presentRef = useRef(value);
    const presentKeyRef = useRef(keyOf(value));

    // Ảnh chụp trạng thái TRƯỚC chuỗi sửa, đang chờ được đẩy vào `past`.
    // Bọc trong object vì bản thân T có thể là `null`.
    const pendingRef = useRef<{ snapshot: T } | null>(null);
    const timerRef = useRef<number | null>(null);

    // Giá trị vừa đẩy ra `onChange`; tiếng vọng của nó không được ghi vào lịch sử.
    const applyingKeyRef = useRef<string | null>(null);

    const syncFlags = useCallback(() => {
        const canUndo = historyRef.current.past.length > 0 || pendingRef.current !== null;
        const canRedo = historyRef.current.future.length > 0;
        // Bail-out khi không đổi: `syncFlags` được gọi từ trong effect theo dõi
        // `value`, setState vô điều kiện ở đó sẽ thành vòng lặp render.
        setFlags((prev) =>
            prev.canUndo === canUndo && prev.canRedo === canRedo ? prev : { canUndo, canRedo }
        );
    }, []);

    const clearTimer = useCallback(() => {
        if (timerRef.current !== null) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    /** Đẩy ảnh chụp đang chờ vào `past`. Gọi nhiều lần cũng an toàn. */
    const commitPending = useCallback(() => {
        clearTimer();
        const pending = pendingRef.current;
        if (!pending) return;
        pendingRef.current = null;

        // Người dùng gõ rồi xóa về đúng trạng thái cũ: không tạo bước "chết" mà
        // undo bấm vào chẳng thấy gì thay đổi.
        if (keyOf(pending.snapshot) === presentKeyRef.current) {
            syncFlags();
            return;
        }

        const past = [...historyRef.current.past, pending.snapshot];
        if (past.length > cap) past.splice(0, past.length - cap); // bỏ bước CŨ NHẤT
        historyRef.current = { past, future: historyRef.current.future };
        syncFlags();
    }, [cap, clearTimer, syncFlags]);

    useEffect(() => {
        const key = keyOf(value);

        // Chặn (2): render này là tiếng vọng của undo()/redo() do chính ta gây ra.
        if (applyingKeyRef.current !== null) {
            const expected = applyingKeyRef.current;
            applyingKeyRef.current = null;
            if (key === expected) return;
            // Tiếng vọng không về đúng như mong đợi — coi đây là một lần sửa thật
            // và xử lý tiếp, tuyệt đối không "ăn" mất thay đổi của người dùng.
        }

        // Không có gì đổi thật (render lại, hoặc object mới từ `watch()`).
        if (key === presentKeyRef.current) return;

        if (pendingRef.current === null) {
            // Bắt đầu một chuỗi sửa: nhớ mốc phục hồi là trạng thái TRƯỚC chuỗi.
            pendingRef.current = { snapshot: presentRef.current };
            // Chặn (1): sửa mới thì nhánh redo hết hiệu lực, xóa ngay.
            if (historyRef.current.future.length > 0) {
                historyRef.current = { past: historyRef.current.past, future: [] };
            }
        }

        presentRef.current = value;
        presentKeyRef.current = key;
        syncFlags();

        // Gộp (4): mỗi thay đổi đẩy lại hạn chót; chỉ khi im lặng đủ lâu mới chốt
        // thành một bước. CỐ TÌNH không clear timer trong cleanup của effect này —
        // effect chạy lại ở mọi lần render (vì `value` đổi tham chiếu), cleanup sẽ
        // hủy timer và bước đang chờ sẽ không bao giờ được chốt.
        clearTimer();
        timerRef.current = window.setTimeout(() => {
            timerRef.current = null;
            commitPending();
        }, coalesceMs);
    }, [value, coalesceMs, clearTimer, commitPending, syncFlags]);

    // Chỉ dọn timer khi unmount, để một bước đang chờ không setState trên
    // component đã chết.
    useEffect(() => () => clearTimer(), [clearTimer]);

    const undo = useCallback(() => {
        // Flush trước: thay đổi vừa gõ 50ms trước còn chưa vào `past`, mà "vừa gõ
        // xong bấm undo không thấy gì xảy ra" là hành vi tệ nhất có thể.
        commitPending();

        const { past, future } = historyRef.current;
        if (past.length === 0) return;

        const previous = past[past.length - 1];
        historyRef.current = {
            past: past.slice(0, -1),
            future: [presentRef.current, ...future],
        };

        const nextKey = keyOf(previous);
        applyingKeyRef.current = nextKey;
        presentRef.current = previous;
        presentKeyRef.current = nextKey;
        syncFlags();
        onChangeRef.current(previous);
    }, [commitPending, syncFlags]);

    const redo = useCallback(() => {
        // Nếu đang có bước chờ thì nhánh redo đã bị xóa từ trước; flush chỉ để
        // `past` nhất quán trước khi di chuyển.
        commitPending();

        const { past, future } = historyRef.current;
        if (future.length === 0) return;

        const next = future[0];
        const nextPast = [...past, presentRef.current];
        if (nextPast.length > cap) nextPast.splice(0, nextPast.length - cap);
        historyRef.current = { past: nextPast, future: future.slice(1) };

        const nextKey = keyOf(next);
        applyingKeyRef.current = nextKey;
        presentRef.current = next;
        presentKeyRef.current = nextKey;
        syncFlags();
        onChangeRef.current(next);
    }, [cap, commitPending, syncFlags]);

    const reset = useCallback(
        (next?: T) => {
            clearTimer();
            pendingRef.current = null;
            historyRef.current = { past: [], future: [] };

            const base = next === undefined ? latestValueRef.current : next;
            presentRef.current = base;
            presentKeyRef.current = keyOf(base);
            syncFlags();

            if (next !== undefined) {
                applyingKeyRef.current = presentKeyRef.current;
                onChangeRef.current(next);
            }
        },
        [clearTimer, syncFlags]
    );

    useEffect(() => {
        if (!keyboard) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (!event.metaKey && !event.ctrlKey) return;
            if (event.altKey) return;

            const pressed = event.key.toLowerCase();
            const wantsUndo = pressed === "z" && !event.shiftKey;
            const wantsRedo = (pressed === "z" && event.shiftKey) || pressed === "y";
            if (!wantsUndo && !wantsRedo) return;

            // Nhường phím lại cho undo gốc của trình duyệt khi đang gõ trong ô text.
            if (isNativeUndoTarget(event.target)) return;

            event.preventDefault();
            if (wantsRedo) redo();
            else undo();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [keyboard, undo, redo]);

    return { canUndo: flags.canUndo, canRedo: flags.canRedo, undo, redo, reset };
}
