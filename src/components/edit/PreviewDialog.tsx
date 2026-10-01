"use client";

import { useState } from "react";
import { ExternalLink, Eye, Info, Monitor, RotateCw, Smartphone, Tablet } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Xem trước trang thật ngay trong trang sửa (không cần rời trang).
 *
 * Dùng `<iframe>` trỏ vào `/${slug}` thay vì render lại template: nhờ vậy bản
 * xem trước luôn đúng với những gì khách thấy, kể cả nhạc, khoá PIN, PWA...
 * mà không phải nhân bản logic của 10 template.
 *
 * Lưu ý: iframe chỉ được mount khi hộp thoại mở (Radix bỏ nội dung khi đóng),
 * nên trang sửa không phải tải trang công khai một cách vô ích.
 */
type ViewportId = "mobile" | "tablet" | "desktop";

const VIEWPORTS: { id: ViewportId; label: string; width: string; icon: typeof Smartphone }[] = [
    { id: "mobile", label: "Điện thoại", width: "390px", icon: Smartphone },
    { id: "tablet", label: "Máy tính bảng", width: "768px", icon: Tablet },
    { id: "desktop", label: "Máy tính", width: "100%", icon: Monitor },
];

export interface PreviewDialogProps {
    slug: string;
    /** Nền xung quanh là tối — dùng để chọn màu cho nút mở hộp thoại. */
    isDark?: boolean;
    /** Ghi đè class của nút mở, để khớp chrome của từng template. */
    triggerClassName?: string;
}

export function PreviewDialog({ slug, isDark = false, triggerClassName }: PreviewDialogProps) {
    const [open, setOpen] = useState(false);
    const [viewport, setViewport] = useState<ViewportId>("mobile");
    // Đổi key để React bỏ iframe cũ và tạo iframe mới — cách gọn nhất để tải
    // lại nội dung sau khi lưu, vì ta không truy cập được document bên trong.
    const [reloadKey, setReloadKey] = useState(0);

    const active = VIEWPORTS.find((v) => v.id === viewport) ?? VIEWPORTS[0];

    const handleOpenChange = (next: boolean) => {
        setOpen(next);
        // Mỗi lần mở lại là một lần tải mới, để chủ trang thấy nội dung vừa lưu.
        if (next) setReloadKey((k) => k + 1);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                        isDark
                            ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                        triggerClassName
                    )}
                >
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Xem trước</span>
                </button>
            </DialogTrigger>

            <DialogContent className="max-w-6xl gap-3 p-4 sm:p-5">
                <DialogHeader className="pr-8">
                    <DialogTitle className="flex items-center gap-2 text-base">
                        <Eye className="h-4 w-4 text-slate-500" aria-hidden="true" />
                        Xem trước trang /{slug}
                    </DialogTitle>
                    <DialogDescription>
                        Bản xem trước dùng đúng trang công khai của bạn. Hãy lưu thay đổi rồi bấm
                        “Tải lại” để thấy nội dung mới nhất.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-wrap items-center gap-2">
                    <div
                        className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1"
                        role="group"
                        aria-label="Chọn khổ màn hình xem trước"
                    >
                        {VIEWPORTS.map((v) => {
                            const Icon = v.icon;
                            const isActive = v.id === viewport;
                            return (
                                <button
                                    key={v.id}
                                    type="button"
                                    onClick={() => setViewport(v.id)}
                                    aria-pressed={isActive}
                                    title={v.label}
                                    className={cn(
                                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                                        isActive
                                            ? "bg-white text-slate-900 shadow-sm"
                                            : "text-slate-500 hover:text-slate-800"
                                    )}
                                >
                                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                                    <span className="hidden sm:inline">{v.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    <button
                        type="button"
                        onClick={() => setReloadKey((k) => k + 1)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
                        Tải lại
                    </button>

                    <a
                        href={`/${slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        Mở tab mới
                    </a>

                    <span className="ml-auto text-[11px] tabular-nums text-slate-400">
                        {active.id === "desktop" ? "Toàn bộ chiều rộng" : active.width}
                    </span>
                </div>

                <p className="flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 p-2.5 text-[11px] leading-relaxed text-sky-800">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>
                        Nếu trang có mã PIN, khách vào lần đầu sẽ thấy <strong>màn hình nhập PIN</strong>{" "}
                        trước khi xem được nội dung. Trong khung xem trước này bạn thường vào thẳng nội
                        dung vì phiên đăng nhập của bạn còn hiệu lực — đừng nhầm đó là trang đã bỏ khoá.
                    </span>
                </p>

                <div className="flex justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-2 sm:p-3">
                    <div
                        className="h-[70vh] max-h-[70vh] w-full overflow-hidden rounded-lg bg-white shadow-inner transition-[width] duration-200"
                        style={{ width: active.width, maxWidth: "100%" }}
                    >
                        <iframe
                            key={reloadKey}
                            src={`/${slug}`}
                            title={`Xem trước trang ${slug}`}
                            aria-label={`Bản xem trước trang công khai ${slug}, khổ ${active.label.toLowerCase()}`}
                            className="h-full w-full border-0"
                            loading="lazy"
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
