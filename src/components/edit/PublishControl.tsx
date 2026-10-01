"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EyeOff, Globe, Loader2 } from "lucide-react";
import { setPublishState } from "@/app/actions/publish-actions";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

/**
 * Công tắc "đăng trang" của chủ trang.
 *
 * Khác với `is_active` (công tắc của admin), `is_published` do chủ trang tự bật
 * tắt. Vì `is_published` mặc định là `true`, mọi trang đã tồn tại vẫn đang hiển
 * thị — nút này chỉ đổi trạng thái khi người dùng chủ động bấm.
 *
 * Ẩn trang là hành động "hơi phá": khách đang có link sẽ không xem được nữa, nên
 * bước này phải xác nhận trước. Bật lại thì không cần hỏi.
 */
export interface PublishControlProps {
    slug: string;
    isPublished: boolean;
    publishedAt?: Date | string | null;
    /** Nền xung quanh là tối (IDOL/GRAD_*) — dùng để chọn màu chip cho dễ đọc. */
    isDark?: boolean;
    className?: string;
}

export function PublishControl({
    slug,
    isPublished,
    publishedAt,
    isDark = false,
    className,
}: PublishControlProps) {
    const router = useRouter();
    const toast = useToast();

    // Giữ trạng thái cục bộ để chip đổi ngay sau khi lưu thành công, không phải
    // chờ server component render lại.
    const [published, setPublished] = useState(isPublished);
    const [isPending, setIsPending] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    // Ngày đăng chỉ hiện sau khi mount: định dạng ngày của Node và của trình
    // duyệt (múi giờ, ICU) có thể khác nhau và gây lệch hydration.
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    // Prop là nguồn sự thật khi server trả dữ liệu mới (ví dụ sau router.refresh).
    useEffect(() => setPublished(isPublished), [isPublished]);

    const apply = async (next: boolean) => {
        setIsPending(true);
        try {
            const result = await setPublishState(slug, next);
            if (!result.success) {
                toast.error("Không đổi được trạng thái", result.error);
                return;
            }

            setPublished(next);
            if (next) {
                toast.success("Trang đã được đăng", "Khách có link đã xem được trang của bạn.");
            } else {
                toast.warning("Trang đã chuyển về bản nháp", "Khách truy cập sẽ thấy thông báo trang đang chuẩn bị.");
            }
            router.refresh();
        } catch (error) {
            console.error("PublishControl toggle failed", error);
            toast.error("Không đổi được trạng thái", "Vui lòng thử lại sau ít phút.");
        } finally {
            setIsPending(false);
            setConfirmOpen(false);
        }
    };

    const handleClick = () => {
        if (published) {
            setConfirmOpen(true);
            return;
        }
        void apply(true);
    };

    const publishedDate = publishedAt ? new Date(publishedAt) : null;
    const publishedLabel =
        mounted && publishedDate && !Number.isNaN(publishedDate.getTime())
            ? publishedDate.toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            })
            : null;

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="flex flex-col items-start leading-tight">
                <Badge variant={published ? "success" : "warning"}>
                    {published ? (
                        <Globe className="h-3 w-3" aria-hidden="true" />
                    ) : (
                        <EyeOff className="h-3 w-3" aria-hidden="true" />
                    )}
                    {published ? "Đang hiển thị" : "Bản nháp"}
                </Badge>
                {published && publishedLabel && (
                    <span
                        className={cn(
                            "mt-0.5 text-[10px] tabular-nums",
                            isDark ? "text-white/60" : "text-slate-500"
                        )}
                    >
                        Đăng ngày {publishedLabel}
                    </span>
                )}
            </div>

            <button
                type="button"
                onClick={handleClick}
                disabled={isPending}
                aria-busy={isPending}
                className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
                    isDark
                        ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                )}
            >
                {isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                ) : published ? (
                    <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                    <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>{published ? "Ẩn trang" : "Đăng trang"}</span>
            </button>

            <ConfirmDialog
                isOpen={confirmOpen}
                title="Ẩn trang khỏi khách?"
                message="Khách đang giữ link sẽ không xem được nội dung nữa, họ chỉ thấy thông báo trang đang được chuẩn bị. Bạn vẫn sửa và xem trước bình thường, và có thể đăng lại bất cứ lúc nào."
                confirmText="Ẩn trang"
                cancelText="Giữ hiển thị"
                variant="warning"
                isLoading={isPending}
                onConfirm={() => void apply(false)}
                onCancel={() => setConfirmOpen(false)}
            />
        </div>
    );
}
