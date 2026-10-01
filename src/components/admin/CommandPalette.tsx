"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutList, LogOut, Palette, Plus, Search, Spade, X } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

/**
 * Bảng lệnh (Cmd/Ctrl + K) cho khu vực quản trị.
 *
 * ## Vì sao cần
 * Trang admin có hai tab, một ô tìm kiếm, một nút tạo liên kết và một nút đăng
 * xuất — tất cả đều nằm ở đầu trang. Khi cuộn xuống giữa bảng 20 dòng thì mọi
 * thứ đó biến mất. Bảng lệnh đưa chúng về trong tầm một phím tắt.
 *
 * ## Quy tắc phím tắt
 * Chỉ mở khi **có phím phụ trợ** (`Cmd`/`Ctrl` + `K`). Cố tình không nhận phím
 * đơn: admin gõ slug, tên người dùng, thẻ… vào các ô nhập suốt ngày, và một
 * phím đơn sẽ chiếm ký tự người ta đang gõ. `Cmd+K` an toàn ngay cả khi con trỏ
 * đang ở trong ô nhập, nên không cần loại trừ ô nhập. Đây cũng là lý do file
 * này không dùng lại `use-admin-shortcuts.ts`: hook đó *bỏ qua* mọi sự kiện có
 * phím phụ trợ, đúng cho phím `/` nhưng ngược hoàn toàn với nhu cầu ở đây.
 *
 * ## Vì sao có vài lệnh phải "chạm" DOM
 * Bảng lệnh được mount ở `app/admin/layout.tsx` nên nó sống *bên trên* các
 * client component đang giữ state (ô tìm kiếm nằm trong `LinkFilterBar`, hộp
 * tạo liên kết nằm trong `CreateLinkDialog`). Không có store dùng chung, và
 * việc dựng một cái chỉ cho hai lệnh này là quá đắt. Vì vậy hai lệnh đó tìm
 * đúng phần tử trong DOM rồi tác động lên nó — có kiểm tra tồn tại và có đường
 * lùi tử tế nếu không tìm thấy (ví dụ đang ở tab Thẻ trò chơi).
 */

export interface CommandAction {
    id: string;
    /** Nhãn hiện trong danh sách. Cũng là thứ được đem đi so khớp. */
    label: string;
    /** Một dòng giải thích ngắn, hiện mờ bên dưới nhãn. */
    description?: string;
    /**
     * Từ khoá phụ để tìm được lệnh bằng tên khác ("links", "logout"…).
     * Không hiện trên giao diện.
     */
    keywords?: string[];
    icon?: ReactNode;
    /** Nhóm để gom các lệnh cùng loại; hiện dạng nhãn nhỏ bên phải. */
    group?: string;
    /**
     * Đặt `true` nếu lệnh tự chuyển focus tới nơi khác (focus ô tìm kiếm, mở
     * hộp thoại). Khi đó bảng lệnh **không** trả focus về chỗ cũ, vì làm vậy sẽ
     * giật focus ra khỏi đúng chỗ lệnh vừa đưa tới.
     */
    movesFocus?: boolean;
    run: () => void | Promise<void>;
}

/**
 * Bỏ dấu tiếng Việt để "the tro choi" khớp được với "Thẻ trò chơi".
 *
 * `normalize("NFD")` tách dấu thanh và dấu mũ thành ký tự tổ hợp rồi xoá đi,
 * nhưng **"đ" không phải chữ có dấu** — nó là một chữ cái riêng và NFD không
 * tách nó, nên phải thay tay.
 */
export function foldVietnamese(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase();
}

/** Mọi ký tự của `needle` xuất hiện trong `haystack` theo đúng thứ tự. */
function isSubsequence(needle: string, haystack: string): boolean {
    if (!needle) return true;
    let index = 0;
    for (const char of haystack) {
        if (char === needle[index]) index += 1;
        if (index === needle.length) return true;
    }
    return false;
}

/**
 * Lọc và xếp hạng lệnh theo từ khoá.
 *
 * Ba mức, giữ nguyên thứ tự khai báo trong cùng một mức:
 *  0 — khớp chuỗi con trong chính nhãn (rõ ràng nhất)
 *  1 — khớp chuỗi con trong mô tả / từ khoá phụ
 *  2 — khớp mờ: các ký tự rời rạc nhưng đúng thứ tự, **chỉ xét trên nhãn**
 *
 * Mức 2 cố tình không xét mô tả và từ khoá phụ. Nếu xét, một từ khoá ba ký tự
 * như "the" sẽ khớp gần như mọi lệnh (chữ t, h, e nằm rải rác đâu đó trong một
 * câu mô tả tiếng Việt là chuyện đương nhiên) và bộ lọc trở thành vô dụng.
 *
 * Tách khỏi component để test được như một hàm thuần.
 */
export function filterCommands(actions: CommandAction[], query: string): CommandAction[] {
    const needle = foldVietnamese(query).replace(/\s+/g, "");
    if (!needle) return actions;

    const scored: Array<{ action: CommandAction; score: number; order: number }> = [];

    actions.forEach((action, order) => {
        const label = foldVietnamese(action.label).replace(/\s+/g, "");
        const extra = foldVietnamese(
            [action.description ?? "", ...(action.keywords ?? [])].join(" ")
        ).replace(/\s+/g, "");

        if (label.includes(needle)) scored.push({ action, score: 0, order });
        else if (extra.includes(needle)) scored.push({ action, score: 1, order });
        else if (isSubsequence(needle, label)) scored.push({ action, score: 2, order });
    });

    return scored
        .sort((a, b) => a.score - b.score || a.order - b.order)
        .map((entry) => entry.action);
}

/**
 * Tìm ô tìm kiếm của trang hiện tại.
 *
 * Thử `data-admin-search` trước để sau này ai gắn thuộc tính đó vào là thành
 * cách chính thức; hai lựa chọn sau là đường lùi cho `LinkFilterBar` hiện tại.
 */
function findAdminSearchInput(): HTMLInputElement | null {
    const selectors = [
        "[data-admin-search]",
        'input[aria-label^="Tìm theo slug"]',
        'input[type="search"]',
    ];
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element instanceof HTMLInputElement) return element;
    }
    return null;
}

/** Tìm nút mở hộp "Tạo Liên Kết Mới" theo nhãn, không phân biệt dấu và hoa thường. */
function findCreateLinkTrigger(): HTMLElement | null {
    const target = "taolienketmoi";
    const buttons = Array.from(document.querySelectorAll("button"));
    return (
        buttons.find(
            (button) => foldVietnamese(button.textContent ?? "").replace(/\s+/g, "") === target
        ) ?? null
    );
}

/** Bộ lệnh mặc định của khu vực quản trị. */
function useAdminCommands(): CommandAction[] {
    const router = useRouter();
    const toast = useToast();

    return useMemo<CommandAction[]>(
        () => [
            {
                id: "goto-links",
                label: "Liên kết",
                description: "Danh sách và quản lý liên kết người dùng",
                keywords: ["links", "danh sach", "quan ly", "bang"],
                group: "Điều hướng",
                icon: <LayoutList className="h-4 w-4" aria-hidden="true" />,
                run: () => router.push("/admin/links"),
            },
            {
                id: "goto-game-cards",
                label: "Thẻ trò chơi",
                description: "Quản lý thẻ dùng cho các trò chơi trong trang",
                keywords: ["game cards", "the", "tro choi", "quiz"],
                group: "Điều hướng",
                icon: <Spade className="h-4 w-4" aria-hidden="true" />,
                run: () => router.push("/admin/game-cards"),
            },
            {
                id: "goto-design-system",
                label: "Design system",
                description: "Bảng tham chiếu nội bộ cho các primitive UI",
                keywords: ["design", "he thong", "primitive", "ui", "token"],
                group: "Điều hướng",
                icon: <Palette className="h-4 w-4" aria-hidden="true" />,
                run: () => router.push("/admin/design-system"),
            },
            {
                id: "focus-search",
                label: "Tìm kiếm trong trang",
                description: "Nhảy tới ô tìm theo slug hoặc tên người dùng",
                keywords: ["search", "tim", "loc", "filter"],
                group: "Hành động",
                movesFocus: true,
                icon: <Search className="h-4 w-4" aria-hidden="true" />,
                run: () => {
                    const input = findAdminSearchInput();
                    if (!input) {
                        toast.info("Trang này không có ô tìm kiếm", "Hãy mở tab Liên kết trước.");
                        return;
                    }
                    input.focus();
                    input.select();
                },
            },
            {
                id: "create-link",
                label: "Tạo liên kết mới",
                description: "Mở hộp thoại tạo liên kết",
                keywords: ["new", "them", "moi", "create"],
                group: "Hành động",
                movesFocus: true,
                icon: <Plus className="h-4 w-4" aria-hidden="true" />,
                run: () => {
                    const trigger = findCreateLinkTrigger();
                    if (trigger) {
                        trigger.click();
                        return;
                    }
                    // Nút chỉ tồn tại trên trang Liên kết — đưa người dùng tới đó
                    // và nói rõ bước còn lại, thay vì im lặng không làm gì.
                    router.push("/admin/links");
                    toast.info(
                        "Đang mở trang Liên kết",
                        'Bấm "Tạo Liên Kết Mới" ở góc trên phải để tiếp tục.'
                    );
                },
            },
            {
                id: "logout",
                label: "Đăng xuất",
                description: "Kết thúc phiên quản trị",
                keywords: ["logout", "sign out", "thoat", "dang xuat"],
                group: "Hành động",
                icon: <LogOut className="h-4 w-4" aria-hidden="true" />,
                run: async () => {
                    try {
                        // `/admin/logout` là route POST đã có sẵn (header cũng gửi
                        // form tới đó). Gọi bằng fetch để xoá cookie rồi tự điều
                        // hướng, thay vì dựng một form ẩn để submit.
                        await fetch("/admin/logout", { method: "POST" });
                    } catch (error) {
                        console.error("Đăng xuất thất bại", error);
                        toast.error("Không đăng xuất được", "Vui lòng thử lại.");
                        return;
                    }
                    router.push("/admin/login");
                    router.refresh();
                },
            },
        ],
        [router, toast]
    );
}

const LISTBOX_ID = "admin-command-palette-list";
const optionId = (index: number) => `admin-command-option-${index}`;

/** Các trang admin không có chrome quản trị, nên bảng lệnh cũng không nên có ở đó. */
const HIDDEN_PATHS = ["/admin/login", "/admin/setup"];

export interface CommandPaletteProps {
    /** Ghi đè bộ lệnh mặc định — dùng cho test và cho các khu vực khác. */
    actions?: CommandAction[];
}

export function CommandPalette({ actions }: CommandPaletteProps = {}) {
    const pathname = usePathname();
    const defaultActions = useAdminCommands();
    const allActions = actions ?? defaultActions;

    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);

    const inputRef = useRef<HTMLInputElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
    /** Phần tử đang có focus lúc mở bảng lệnh, để trả lại khi đóng. */
    const restoreFocusRef = useRef<HTMLElement | null>(null);

    const isHidden = HIDDEN_PATHS.includes(pathname ?? "");

    const results = useMemo(() => filterCommands(allActions, query), [allActions, query]);
    // Kẹp chỉ số lại: danh sách co lại sau mỗi ký tự người dùng gõ.
    const safeIndex = results.length === 0 ? -1 : Math.min(activeIndex, results.length - 1);

    const close = useCallback(() => setIsOpen(false), []);

    // Mở / đóng bằng Cmd+K, đóng bằng Escape.
    useEffect(() => {
        if (isHidden) return;

        const onKeyDown = (event: KeyboardEvent) => {
            const key = event.key?.toLowerCase();

            if ((event.metaKey || event.ctrlKey) && key === "k") {
                event.preventDefault();
                setIsOpen((open) => !open);
                return;
            }

            if (event.key === "Escape" && isOpen) {
                event.preventDefault();
                close();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [close, isHidden, isOpen]);

    // Khi mở: nhớ chỗ focus cũ, xoá từ khoá lần trước, đưa con trỏ vào ô nhập.
    useEffect(() => {
        if (!isOpen) return;
        restoreFocusRef.current =
            document.activeElement instanceof HTMLElement ? document.activeElement : null;
        setQuery("");
        setActiveIndex(0);
        inputRef.current?.focus();
    }, [isOpen]);

    // Khi đóng: trả focus về đúng phần tử trước đó, nếu nó còn trong DOM.
    useEffect(() => {
        if (isOpen) return;
        const target = restoreFocusRef.current;
        restoreFocusRef.current = null;
        if (target && document.contains(target)) target.focus();
    }, [isOpen]);

    // Mục đang chọn phải nằm trong vùng nhìn thấy khi đi bằng bàn phím.
    useEffect(() => {
        if (!isOpen || safeIndex < 0) return;
        const element = itemRefs.current[safeIndex];
        // jsdom và một số WebView cũ không có `scrollIntoView`.
        if (element && typeof element.scrollIntoView === "function") {
            element.scrollIntoView({ block: "nearest" });
        }
    }, [isOpen, safeIndex, results.length]);

    const runAction = useCallback(
        (action: CommandAction) => {
            // Lệnh tự dẫn focus đi đâu thì bảng lệnh nhường, không kéo về chỗ cũ.
            if (action.movesFocus) restoreFocusRef.current = null;
            setIsOpen(false);
            void action.run();
        },
        []
    );

    const move = (delta: number) => {
        if (results.length === 0) return;
        setActiveIndex((current) => {
            const from = Math.min(current, results.length - 1);
            // Vòng lại từ đầu/cuối: danh sách ngắn, đi vòng nhanh hơn là kẹt ở biên.
            return (from + delta + results.length) % results.length;
        });
    };

    const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                move(1);
                break;
            case "ArrowUp":
                event.preventDefault();
                move(-1);
                break;
            case "Home":
                event.preventDefault();
                setActiveIndex(0);
                break;
            case "End":
                event.preventDefault();
                setActiveIndex(Math.max(0, results.length - 1));
                break;
            case "Enter": {
                event.preventDefault();
                const action = safeIndex >= 0 ? results[safeIndex] : undefined;
                if (action) runAction(action);
                break;
            }
            default:
                break;
        }
    };

    // Giữ focus trong hộp thoại: `aria-modal="true"` nói với trình đọc màn hình
    // rằng phần còn lại của trang không tồn tại, nên Tab cũng phải như vậy.
    const onDialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== "Tab") return;
        const root = dialogRef.current;
        if (!root) return;

        const focusables = Array.from(
            root.querySelectorAll<HTMLElement>('input, button:not([disabled]), [href]')
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    };

    if (isHidden || !isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[120] flex items-start justify-center p-4 pt-[12vh]"
            onKeyDown={onDialogKeyDown}
        >
            {/* Nền mờ. Bấm ra ngoài là đóng — nút thật nằm trong hộp thoại, còn
                lớp này chỉ là vùng bấm nên ẩn khỏi cây trợ năng. */}
            <div
                className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
                aria-hidden="true"
                onClick={close}
            />

            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-label="Bảng lệnh quản trị"
                className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
            >
                <div className="flex items-center gap-2 border-b border-slate-700/70 px-3">
                    <Search className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(event) => {
                            setQuery(event.target.value);
                            setActiveIndex(0);
                        }}
                        onKeyDown={onInputKeyDown}
                        placeholder="Gõ để tìm lệnh…"
                        aria-label="Tìm lệnh"
                        role="combobox"
                        aria-expanded
                        aria-controls={LISTBOX_ID}
                        aria-autocomplete="list"
                        aria-activedescendant={safeIndex >= 0 ? optionId(safeIndex) : undefined}
                        autoComplete="off"
                        spellCheck={false}
                        className="h-12 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                    />
                    <button
                        type="button"
                        onClick={close}
                        aria-label="Đóng bảng lệnh"
                        className="-mr-1 shrink-0 rounded-md p-1.5 text-slate-500 transition-colors hover:text-white"
                    >
                        <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>

                {results.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-slate-400">
                        Không có lệnh nào khớp với “{query}”.
                    </p>
                ) : (
                    <ul id={LISTBOX_ID} role="listbox" aria-label="Danh sách lệnh" className="max-h-80 overflow-y-auto p-2">
                        {results.map((action, index) => {
                            const isActive = index === safeIndex;
                            const descriptionId = `${optionId(index)}-desc`;

                            return (
                                <li
                                    key={action.id}
                                    ref={(element) => {
                                        itemRefs.current[index] = element;
                                    }}
                                    id={optionId(index)}
                                    role="option"
                                    aria-selected={isActive}
                                    // Tên của option là *nhãn*, còn mô tả đi qua
                                    // `aria-describedby`. Nếu để trình đọc tự ghép text
                                    // con, nó sẽ đọc liền "Liên kết Danh sách và quản lý…
                                    // Điều hướng" thành một tên dài không ai nghe hết.
                                    aria-label={action.label}
                                    aria-describedby={action.description ? descriptionId : undefined}
                                    onClick={() => runAction(action)}
                                    // Chuột đi tới đâu thì mục đó thành mục đang chọn, để
                                    // Enter và cú bấm chuột không trỏ về hai mục khác nhau.
                                    onMouseMove={() => setActiveIndex(index)}
                                    className={cn(
                                        "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                                        isActive ? "bg-violet-600/25 text-white" : "text-slate-300"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                                            isActive
                                                ? "border-violet-400/40 bg-violet-500/20 text-violet-200"
                                                : "border-slate-700 bg-slate-800 text-slate-400"
                                        )}
                                        aria-hidden="true"
                                    >
                                        {action.icon ?? <Search className="h-4 w-4" />}
                                    </span>

                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate font-medium">{action.label}</span>
                                        {action.description && (
                                            <span id={descriptionId} className="block truncate text-xs text-slate-500">
                                                {action.description}
                                            </span>
                                        )}
                                    </span>

                                    {action.group && (
                                        <span className="shrink-0 text-[10px] uppercase tracking-wide text-slate-500">
                                            {action.group}
                                        </span>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}

                <div className="flex items-center justify-between gap-2 border-t border-slate-700/70 px-3 py-2 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1.5">
                        <Kbd>↑</Kbd>
                        <Kbd>↓</Kbd>
                        <span>di chuyển</span>
                        <Kbd>Enter</Kbd>
                        <span>chạy</span>
                        <Kbd>Esc</Kbd>
                        <span>đóng</span>
                    </span>
                    <span className="tabular-nums">{results.length} lệnh</span>
                </div>
            </div>
        </div>
    );
}

function Kbd({ children }: { children: ReactNode }) {
    return (
        <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
            {children}
        </kbd>
    );
}
