"use client";

import { useEffect, useState } from "react";
import type { LinkType } from "@prisma/client";
import { Check, Circle, Rocket, Sparkles, X } from "lucide-react";
import type { EditTabId } from "@/components/edit/templates/shared";
import { cn } from "@/lib/utils";

/**
 * Hướng dẫn lần đầu cho chủ trang vừa nhận slug + mã PIN.
 *
 * Chỉ hiện checklist khi chưa bị tắt. Trạng thái tắt lưu ở localStorage theo
 * từng slug (`onboarding_dismissed_${slug}`).
 *
 * QUAN TRỌNG — đọc localStorage trong `useEffect`, KHÔNG đọc khi render: render
 * đầu tiên ở client phải giống hệt HTML do server sinh ra, nếu không React sẽ
 * báo lệch hydration (lỗi đã được ghi lại trong AGENTS.md của dự án).
 */
export interface OnboardingChecklistProps {
    slug: string;
    linkType: LinkType;
    hasProfile: boolean;
    hasGallery: boolean;
    hasTimeline: boolean;
    isPublished: boolean;
    /** Nền xung quanh là tối (IDOL/GRAD_*). */
    isDark?: boolean;
    /** Cho phép bấm vào một bước để nhảy sang tab tương ứng. */
    onSelectTab?: (tab: EditTabId) => void;
    className?: string;
}

/** Tên "hồ sơ" theo từng loại trang, để câu hướng dẫn nghe đúng ngữ cảnh. */
const PROFILE_LABEL: Partial<Record<LinkType, string>> = {
    LOVE: "tên hai người và ngày kỷ niệm",
    LOVE2: "tên hai người và ngày kỷ niệm",
    EVERY: "tên và lời mở đầu",
    IDOL: "tên idol và tên fan",
    GRAD_PERSONAL: "tên, lớp và trường",
    GRAD_CLASS: "tên lớp, khoá và giáo viên",
    GRAD_GROUP: "tên nhóm và danh sách thành viên",
    WEDDING: "tên cô dâu, chú rể và ngày cưới",
    TRAVEL: "tên chuyến đi và điểm đến",
    FRIENDSHIP: "tên nhóm bạn và câu châm ngôn",
};

export function OnboardingChecklist({
    slug,
    linkType,
    hasProfile,
    hasGallery,
    hasTimeline,
    isPublished,
    isDark = false,
    onSelectTab,
    className,
}: OnboardingChecklistProps) {
    // Mặc định ẩn: server và lần render đầu ở client đều không vẽ gì, effect mới
    // quyết định có hiện hay không.
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        try {
            const dismissed = window.localStorage.getItem(`onboarding_dismissed_${slug}`);
            setVisible(dismissed !== "1");
        } catch {
            // Chế độ riêng tư / bị chặn storage: vẫn hiện hướng dẫn, chỉ là không nhớ được.
            setVisible(true);
        }
    }, [slug]);

    const dismiss = () => {
        setVisible(false);
        try {
            window.localStorage.setItem(`onboarding_dismissed_${slug}`, "1");
        } catch {
            // Không lưu được thì thôi, lần sau hiện lại cũng không sao.
        }
    };

    if (!visible) return null;

    const items: { id: string; tab?: EditTabId; title: string; hint: string; done: boolean }[] = [
        {
            id: "profile",
            tab: "profile",
            title: "Điền thông tin chung",
            hint: `Bắt đầu bằng ${PROFILE_LABEL[linkType] ?? "thông tin cơ bản của trang"}.`,
            done: hasProfile,
        },
        {
            id: "gallery",
            tab: "gallery",
            title: "Thêm ảnh vào thư viện",
            hint: "Tối đa 20 ảnh, mỗi lần tải lên 5 ảnh. Ảnh được nén tự động.",
            done: hasGallery,
        },
        {
            id: "timeline",
            tab: "timeline",
            title: "Tạo dòng thời gian",
            hint: "Tối đa 10 mốc đáng nhớ, sắp theo ngày.",
            done: hasTimeline,
        },
        {
            id: "publish",
            title: "Đăng trang và chia sẻ",
            hint: isPublished
                ? "Trang đang hiển thị. Gửi link kèm mã PIN cho người bạn muốn tặng."
                : "Trang đang là bản nháp. Bấm “Đăng trang” ở đầu trang khi bạn đã sẵn sàng.",
            done: isPublished,
        },
    ];

    const doneCount = items.filter((item) => item.done).length;
    const allDone = doneCount === items.length;

    return (
        <section
            aria-label="Hướng dẫn bắt đầu"
            className={cn(
                "mb-6 rounded-2xl border p-4",
                isDark
                    ? "border-white/15 bg-white/[0.06] text-white"
                    : "border-slate-200 bg-white/90 text-slate-800",
                className
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                    {allDone ? (
                        <Rocket
                            className={cn("h-4 w-4", isDark ? "text-emerald-300" : "text-emerald-500")}
                            aria-hidden="true"
                        />
                    ) : (
                        <Sparkles
                            className={cn("h-4 w-4", isDark ? "text-amber-300" : "text-amber-500")}
                            aria-hidden="true"
                        />
                    )}
                    <div>
                        <p
                            className={cn(
                                "text-[10px] font-bold uppercase tracking-[0.24em]",
                                isDark ? "text-white/50" : "text-slate-400"
                            )}
                        >
                            Bắt đầu nhanh
                        </p>
                        <h2 className="text-sm font-bold">
                            {allDone ? "Trang của bạn đã đủ nội dung 🎉" : "Bốn bước để hoàn thiện trang"}
                        </h2>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={dismiss}
                    aria-label="Ẩn hướng dẫn bắt đầu"
                    className={cn(
                        "-m-1 shrink-0 rounded-lg p-1 transition",
                        isDark ? "text-white/50 hover:bg-white/10 hover:text-white" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    )}
                >
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>

            <div className="mt-3 flex items-center gap-2">
                <div
                    className={cn(
                        "h-1.5 flex-1 overflow-hidden rounded-full",
                        isDark ? "bg-white/15" : "bg-slate-200"
                    )}
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={items.length}
                    aria-valuenow={doneCount}
                    aria-label={`Hoàn thành ${doneCount} trên ${items.length} bước`}
                >
                    <div
                        className={cn("h-full rounded-full transition-all", allDone ? "bg-emerald-400" : "bg-amber-400")}
                        style={{ width: `${(doneCount / items.length) * 100}%` }}
                    />
                </div>
                <span className={cn("text-xs font-semibold tabular-nums", isDark ? "text-white/70" : "text-slate-500")}>
                    {doneCount}/{items.length}
                </span>
            </div>

            <ol className="mt-3 space-y-1.5">
                {items.map((item) => {
                    const clickable = Boolean(item.tab && onSelectTab);
                    const body = (
                        <>
                            {item.done ? (
                                <Check
                                    className={cn("mt-0.5 h-4 w-4 shrink-0", isDark ? "text-emerald-300" : "text-emerald-500")}
                                    aria-hidden="true"
                                />
                            ) : (
                                <Circle
                                    className={cn("mt-0.5 h-4 w-4 shrink-0", isDark ? "text-white/40" : "text-slate-300")}
                                    aria-hidden="true"
                                />
                            )}
                            <span className="min-w-0">
                                <span
                                    className={cn(
                                        "block text-sm font-semibold",
                                        item.done && (isDark ? "text-white/60 line-through" : "text-slate-400 line-through")
                                    )}
                                >
                                    {item.title}
                                </span>
                                <span className={cn("block text-xs leading-snug", isDark ? "text-white/60" : "text-slate-500")}>
                                    {item.hint}
                                </span>
                            </span>
                        </>
                    );

                    return (
                        <li key={item.id}>
                            {clickable ? (
                                <button
                                    type="button"
                                    onClick={() => onSelectTab?.(item.tab as EditTabId)}
                                    className={cn(
                                        "flex w-full items-start gap-2 rounded-xl p-2 text-left transition",
                                        isDark ? "hover:bg-white/10" : "hover:bg-slate-50"
                                    )}
                                >
                                    {body}
                                </button>
                            ) : (
                                <div className="flex items-start gap-2 p-2">{body}</div>
                            )}
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}
