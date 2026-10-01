"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { History, Loader2, RotateCcw, TriangleAlert } from "lucide-react";
import { listRevisions, restoreRevision } from "@/app/actions/publish-actions";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

/**
 * Lịch sử chỉnh sửa của một trang.
 *
 * Đây là *bảng lưu tiện lợi*, không phải sổ kiểm toán: `publish-actions.ts` chỉ
 * giữ 20 bản mới nhất. Vì vậy phần này cố tình không phân trang, không lọc —
 * toàn bộ danh sách luôn vừa một khung cuộn.
 *
 * Hai quyết định đáng ghi lại:
 *
 * 1. **Tải khi mở, không tải khi mount.** Phần lịch sử nằm cạnh biểu mẫu sửa
 *    trang; nạp sẵn danh sách sẽ tốn một lượt gọi server cho thứ đa số người
 *    dùng không bao giờ bấm vào.
 *
 * 2. **Hoàn tác luôn hỏi trước.** `restoreRevision()` ghi đè `profile_data`
 *    hiện tại. Nhưng trước khi ghi đè, chính nó gọi `createRevision(slug,
 *    "Trước khi hoàn tác")` — nghĩa là bản đang có sẽ được cất vào lịch sử và
 *    **việc hoàn tác cũng hoàn tác được**. Câu xác nhận nói đúng điều đó: vừa
 *    trung thực, vừa làm người dùng bớt sợ khi bấm.
 */

type RevisionListResult = Awaited<ReturnType<typeof listRevisions>>;
type Revision = Extract<RevisionListResult, { success: true }>["data"][number];

export interface RevisionHistoryProps {
    slug: string;
    /** Nền xung quanh là tối (IDOL / GRAD_*) — dùng để chọn màu chữ cho dễ đọc. */
    isDark?: boolean;
    /** Gọi sau khi hoàn tác thành công, để biểu mẫu bên ngoài nạp lại dữ liệu. */
    onRestored?: () => void;
    className?: string;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Khoảng thời gian tương đối bằng tiếng Việt ("3 phút trước").
 *
 * Nhận `now` qua tham số thay vì gọi `Date.now()` bên trong để hàm thuần và
 * kiểm thử được. Quá 7 ngày thì mốc tương đối mất ý nghĩa, trả về chuỗi rỗng để
 * chỉ còn hiện ngày giờ tuyệt đối.
 */
export function formatRelativeVi(date: Date, now: number): string {
    const diff = now - date.getTime();
    if (Number.isNaN(diff)) return "";
    if (diff < 45_000) return "vừa xong";
    if (diff < HOUR) return `${Math.max(1, Math.floor(diff / MINUTE))} phút trước`;
    if (diff < DAY) return `${Math.floor(diff / HOUR)} giờ trước`;
    if (diff < 7 * DAY) return `${Math.floor(diff / DAY)} ngày trước`;
    return "";
}

/** Ngày giờ tuyệt đối — luôn hiện, vì mốc tương đối một mình thì mơ hồ. */
function formatAbsoluteVi(date: Date): string {
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

export function RevisionHistory({
    slug,
    isDark = false,
    onRestored,
    className,
}: RevisionHistoryProps) {
    const router = useRouter();
    const toast = useToast();

    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [revisions, setRevisions] = useState<Revision[] | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [pendingId, setPendingId] = useState<string | null>(null);
    const [isRestoring, setIsRestoring] = useState(false);

    // Mốc thời gian dùng để tính "x phút trước". Chỉ đặt sau khi tải xong, nên
    // không có nguy cơ lệch hydration: server không bao giờ render danh sách này.
    const [now, setNow] = useState(0);

    const load = useCallback(async () => {
        setIsLoading(true);
        setLoadError(null);
        try {
            const result = await listRevisions(slug);
            if (!result.success) {
                setLoadError(result.error ?? "Không thể tải lịch sử");
                setRevisions([]);
                return;
            }
            // Server action đã sắp xếp mới nhất trước; sắp lại ở đây để thứ tự
            // hiển thị không phụ thuộc vào chi tiết truy vấn ở tầng khác.
            const ordered = [...result.data].sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            setRevisions(ordered);
            setNow(Date.now());
        } catch (error) {
            console.error("RevisionHistory load failed", error);
            setLoadError("Không thể tải lịch sử");
            setRevisions([]);
        } finally {
            setIsLoading(false);
        }
    }, [slug]);

    // Bỏ qua kết quả nếu component đã unmount giữa lúc chờ server.
    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const handleToggle = () => {
        const next = !isOpen;
        setIsOpen(next);
        // Chỉ tải lần đầu mở; muốn dữ liệu mới thì có nút "Tải lại".
        if (next && revisions === null && !isLoading) void load();
    };

    const handleRestore = async (revisionId: string) => {
        setIsRestoring(true);
        try {
            const result = await restoreRevision(slug, revisionId);
            if (!mountedRef.current) return;

            if (!result.success) {
                toast.error("Không hoàn tác được", result.error);
                return;
            }

            toast.success(
                "Đã hoàn tác về bản lưu này",
                "Bản trước khi hoàn tác đã được cất vào lịch sử, bạn có thể quay lại bất cứ lúc nào."
            );
            // Danh sách vừa dài thêm một dòng ("Trước khi hoàn tác") nên phải nạp lại.
            void load();
            onRestored?.();
            router.refresh();
        } catch (error) {
            console.error("RevisionHistory restore failed", error);
            if (mountedRef.current) {
                toast.error("Không hoàn tác được", "Vui lòng thử lại sau ít phút.");
            }
        } finally {
            if (mountedRef.current) {
                setIsRestoring(false);
                setPendingId(null);
            }
        }
    };

    const panelId = `revision-history-${slug}`;
    const count = revisions?.length ?? 0;

    const mutedText = isDark ? "text-white/60" : "text-slate-500";
    const strongText = isDark ? "text-white" : "text-slate-800";

    return (
        <section className={cn("space-y-3", className)}>
            <div className="flex items-center justify-between gap-2">
                <button
                    type="button"
                    onClick={handleToggle}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                        isDark
                            ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    )}
                >
                    <History className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Lịch sử chỉnh sửa</span>
                    {revisions !== null && count > 0 && (
                        <Badge variant="violet" size="sm">
                            {count}
                        </Badge>
                    )}
                </button>

                {isOpen && revisions !== null && (
                    <button
                        type="button"
                        onClick={() => void load()}
                        disabled={isLoading}
                        className={cn(
                            "text-xs font-medium underline-offset-2 hover:underline disabled:opacity-50",
                            mutedText
                        )}
                    >
                        Tải lại
                    </button>
                )}
            </div>

            {isOpen && (
                <div
                    id={panelId}
                    className={cn(
                        "rounded-xl border p-3",
                        isDark ? "border-white/15 bg-white/5" : "border-slate-200 bg-slate-50/70"
                    )}
                >
                    <p className={cn("mb-3 text-xs leading-relaxed", mutedText)}>
                        Hệ thống giữ 20 bản lưu gần nhất. Hoàn tác sẽ thay nội dung hiện tại
                        bằng bản bạn chọn — bản hiện tại được cất lại vào lịch sử trước khi
                        thay, nên không có gì bị mất.
                    </p>

                    {isLoading && (
                        <div role="status" aria-busy="true" aria-label="Đang tải lịch sử" className="space-y-2">
                            {[0, 1, 2].map((index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "flex items-center justify-between gap-3 rounded-lg border p-3",
                                        isDark ? "border-white/10" : "border-slate-200 bg-white"
                                    )}
                                >
                                    <div className="min-w-0 flex-1 space-y-2">
                                        <Skeleton className="h-3.5 w-32" />
                                        <Skeleton className="h-3 w-48" />
                                    </div>
                                    <Skeleton className="h-8 w-24 shrink-0 rounded-lg" />
                                </div>
                            ))}
                        </div>
                    )}

                    {!isLoading && loadError && (
                        <div
                            role="alert"
                            className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-200"
                        >
                            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                            <div className="min-w-0">
                                <p className="font-medium">{loadError}</p>
                                <button
                                    type="button"
                                    onClick={() => void load()}
                                    className="mt-1 text-xs font-semibold underline underline-offset-2"
                                >
                                    Thử lại
                                </button>
                            </div>
                        </div>
                    )}

                    {!isLoading && !loadError && count === 0 && (
                        <EmptyState
                            compact
                            icon={<History className="h-4 w-4" aria-hidden="true" />}
                            title="Chưa có bản lưu nào"
                            description="Mỗi lần bạn lưu thay đổi, một bản sao được cất vào đây để hoàn tác khi cần."
                            className={isDark ? "border-white/20" : undefined}
                        />
                    )}

                    {!isLoading && !loadError && count > 0 && (
                        <ul className="max-h-72 space-y-2 overflow-y-auto pr-0.5">
                            {revisions?.map((revision, index) => {
                                const date = new Date(revision.created_at);
                                const relative = now ? formatRelativeVi(date, now) : "";
                                const absolute = formatAbsoluteVi(date);

                                return (
                                    <li
                                        key={revision.id}
                                        className={cn(
                                            "flex items-center justify-between gap-3 rounded-lg border p-3",
                                            isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
                                        )}
                                    >
                                        <div className="min-w-0">
                                            <p className={cn("truncate text-sm font-medium", strongText)}>
                                                {revision.label || "Bản lưu tự động"}
                                                {index === 0 && (
                                                    <span className="ml-2 align-middle">
                                                        <Badge variant="info" size="sm">
                                                            Mới nhất
                                                        </Badge>
                                                    </span>
                                                )}
                                            </p>
                                            <p className={cn("mt-0.5 text-xs tabular-nums", mutedText)}>
                                                {relative ? `${relative} · ${absolute}` : absolute}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setPendingId(revision.id)}
                                            disabled={isRestoring}
                                            className={cn(
                                                "inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
                                                isDark
                                                    ? "border-white/20 text-white hover:bg-white/10"
                                                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                                            )}
                                        >
                                            {isRestoring && pendingId === revision.id ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                                            ) : (
                                                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                                            )}
                                            Hoàn tác
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}

            <ConfirmDialog
                isOpen={pendingId !== null}
                title="Hoàn tác về bản lưu này?"
                message="Toàn bộ nội dung hiện tại sẽ được thay bằng nội dung của bản lưu bạn chọn. Bản đang có được cất vào lịch sử với tên “Trước khi hoàn tác”, nên nếu đổi ý bạn quay lại được ngay."
                confirmText="Hoàn tác"
                cancelText="Giữ nguyên"
                variant="warning"
                isLoading={isRestoring}
                onConfirm={() => {
                    if (pendingId) void handleRestore(pendingId);
                }}
                onCancel={() => setPendingId(null)}
            />
        </section>
    );
}
