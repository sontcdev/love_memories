"use client";

import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, QrCode, Share2 } from "lucide-react";
import { QRCodeDialog } from "@/components/admin/QRCodeDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { copyToClipboard } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

/**
 * Thẻ chia sẻ trang — dành cho chủ trang, không phải cho admin.
 *
 * Ba cách chia sẻ, xếp theo mức tiện trên thiết bị tương ứng:
 *
 * 1. **Nút chia sẻ hệ thống** (`navigator.share`) — trên di động đây là cách
 *    nhanh nhất: mở thẳng Zalo/Messenger. Phải *dò tính năng* chứ không đoán:
 *    Firefox trên desktop và mọi trình duyệt trong ngữ cảnh không bảo mật đều
 *    không có API này. Việc dò đặt trong `useEffect` để HTML server render ra
 *    và HTML client render lần đầu giống nhau (tránh lệch hydration).
 * 2. **Sao chép liên kết** — luôn có. Dùng `copyToClipboard()` với cơ chế dự
 *    phòng `execCommand("copy")`, đúng như bảng admin đang làm: nhiều người mở
 *    trang qua IP LAN (http), nơi `navigator.clipboard` không tồn tại.
 * 3. **Mã QR** — dùng lại `QRCodeDialog` của admin (đã có chọn màu, nền trong
 *    suốt, tải PNG) thay vì dựng một hộp QR thứ hai.
 */

export interface ShareCardProps {
    slug: string;
    /** Tên hiển thị của trang, dùng cho tiêu đề khi chia sẻ qua hệ thống. */
    title?: string;
    /** Nền xung quanh là tối (IDOL / GRAD_*) — đổi màu chữ cho dễ đọc. */
    isDark?: boolean;
    className?: string;
}

export function ShareCard({ slug, title, isDark = false, className }: ShareCardProps) {
    const toast = useToast();

    const [origin, setOrigin] = useState("");
    const [canNativeShare, setCanNativeShare] = useState(false);
    const [justCopied, setJustCopied] = useState(false);
    const [isQrOpen, setIsQrOpen] = useState(false);

    useEffect(() => {
        setOrigin(window.location.origin);
        setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
    }, []);

    // Trước khi mount chỉ hiện đường dẫn tương đối: `window` chưa có ở phía
    // server, và ghép sẵn một tên miền phỏng đoán sẽ hiện sai trong tích tắc.
    const path = `/${slug}`;
    const fullUrl = origin ? `${origin}${path}` : path;
    const shareTitle = title?.trim() ? title.trim() : `Trang kỷ niệm ${slug}`;

    const handleCopy = async () => {
        const ok = await copyToClipboard(fullUrl);
        if (!ok) {
            toast.error(
                "Không sao chép được",
                "Trình duyệt đã chặn clipboard. Bạn có thể chọn đường dẫn rồi nhấn Ctrl/Cmd + C."
            );
            return;
        }
        setJustCopied(true);
        toast.success("Đã sao chép liên kết", fullUrl);
        window.setTimeout(() => setJustCopied(false), 2000);
    };

    const handleNativeShare = async () => {
        try {
            await navigator.share({
                title: shareTitle,
                text: `${shareTitle} — mời bạn xem trang này`,
                url: fullUrl,
            });
        } catch (error) {
            // Người dùng bấm huỷ trong bảng chia sẻ của hệ thống cũng vào đây.
            // Đó không phải lỗi, nên không quấy rầy bằng toast.
            if (error instanceof DOMException && error.name === "AbortError") return;
            console.error("navigator.share thất bại", error);
            toast.error("Không mở được bảng chia sẻ", "Bạn có thể sao chép liên kết bên dưới.");
        }
    };

    const mutedText = isDark ? "text-white/60" : "text-slate-500";
    const buttonBase =
        "inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition";
    const buttonChrome = isDark
        ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50";

    return (
        <Card
            className={cn(
                isDark && "border-white/15 bg-white/5 text-white shadow-none",
                className
            )}
        >
            <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isDark && "text-white")}>
                    <Share2 className="h-4 w-4 text-violet-500" aria-hidden="true" />
                    Chia sẻ trang
                </CardTitle>
                <CardDescription className={isDark ? "text-white/60" : undefined}>
                    Ai có liên kết này là xem được trang, không cần đăng nhập.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
                <div
                    className={cn(
                        "flex items-center gap-2 rounded-xl border p-2",
                        isDark ? "border-white/15 bg-black/20" : "border-slate-200 bg-slate-50"
                    )}
                >
                    {/* `dir="ltr"` để dấu "/" đầu chuỗi không bị đảo chỗ khi cắt bớt. */}
                    <code
                        dir="ltr"
                        className={cn(
                            "min-w-0 flex-1 truncate font-mono text-xs",
                            isDark ? "text-violet-200" : "text-violet-700"
                        )}
                    >
                        {fullUrl}
                    </code>

                    <button
                        type="button"
                        onClick={() => void handleCopy()}
                        aria-label={`Sao chép liên kết ${fullUrl}`}
                        className={cn(buttonBase, buttonChrome, "shrink-0 px-2.5 py-1.5 text-xs")}
                    >
                        {justCopied ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
                        ) : (
                            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        {justCopied ? "Đã chép" : "Sao chép"}
                    </button>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                    {canNativeShare && (
                        <button
                            type="button"
                            onClick={() => void handleNativeShare()}
                            className={cn(
                                buttonBase,
                                "border-transparent bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700"
                            )}
                        >
                            <Share2 className="h-4 w-4" aria-hidden="true" />
                            Chia sẻ
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => setIsQrOpen(true)}
                        className={cn(buttonBase, buttonChrome)}
                    >
                        <QrCode className="h-4 w-4" aria-hidden="true" />
                        Mã QR
                    </button>

                    <a
                        href={path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(buttonBase, buttonChrome)}
                    >
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        Xem trang
                    </a>
                </div>

                {!canNativeShare && (
                    <p className={cn("text-xs leading-relaxed", mutedText)}>
                        Mở trang này trên điện thoại để dùng nút chia sẻ nhanh của hệ thống.
                    </p>
                )}
            </CardContent>

            {/* Dùng lại hộp QR của admin: đã có chọn màu, nền trong suốt và tải PNG. */}
            <QRCodeDialog
                slug={slug}
                username={shareTitle}
                isOpen={isQrOpen}
                onClose={() => setIsQrOpen(false)}
            />
        </Card>
    );
}
