"use client";

import {
    Check,
    Copy,
    CopyPlus,
    Download,
    ExternalLink,
    KeyRound,
    Loader2,
    Power,
    QrCode,
    Star,
    Tag,
    Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { LinkWithUser } from "@/types";
import { getTypeBadgeColor, getTypeIcon } from "./link-type-meta";

export type { LinkWithUser };

/**
 * Thao tác đang chạy trên đúng dòng này.
 *
 * Không có `"pin"`: việc đặt lại PIN diễn ra trong dialog riêng và dialog đó tự
 * hiển thị tiến độ, nên dòng không cần cờ trạng thái thứ hai.
 */
export type RowAction = "status" | "delete" | "favorite" | "duplicate" | "export";

/** Số nhãn hiển thị trực tiếp trong ô; phần còn lại gộp thành "+N". */
const VISIBLE_TAGS = 2;

export interface LinkRowProps {
    link: LinkWithUser;
    selected: boolean;
    /** Đang chạy một thao tác hàng loạt — khoá thao tác từng dòng để tránh chồng chéo. */
    locked: boolean;
    busyAction: RowAction | null;
    copied: boolean;
    onToggleSelect: (linkId: string, selected: boolean) => void;
    onCopyLink: (link: LinkWithUser) => void;
    onToggleStatus: (linkId: string) => void;
    onToggleFavorite: (link: LinkWithUser) => void;
    onEditTags: (link: LinkWithUser) => void;
    onShowQr: (link: LinkWithUser) => void;
    onResetPin: (link: LinkWithUser) => void;
    onDuplicate: (link: LinkWithUser) => void;
    onExport: (link: LinkWithUser) => void;
    onDelete: (link: LinkWithUser) => void;
}

export function LinkRow({
    link,
    selected,
    locked,
    busyAction,
    copied,
    onToggleSelect,
    onCopyLink,
    onToggleStatus,
    onToggleFavorite,
    onEditTags,
    onShowQr,
    onResetPin,
    onDuplicate,
    onExport,
    onDelete,
}: LinkRowProps) {
    const disabled = locked || busyAction !== null;
    const hiddenTagCount = Math.max(0, link.tags.length - VISIBLE_TAGS);

    return (
        <TableRow
            data-state={selected ? "selected" : undefined}
            className={cn(
                "border-slate-700/50 hover:bg-slate-700/20",
                selected && "bg-violet-500/10 hover:bg-violet-500/15"
            )}
        >
            <TableCell className="w-10 pr-0">
                <input
                    type="checkbox"
                    checked={selected}
                    onChange={(event) => onToggleSelect(link.id, event.target.checked)}
                    aria-label={`Chọn liên kết /${link.slug}`}
                    className="h-4 w-4 cursor-pointer rounded border-slate-500 bg-slate-900 accent-violet-500"
                />
            </TableCell>

            <TableCell className="w-10 px-2">
                <Tooltip content={link.is_favorite ? "Bỏ đánh dấu yêu thích" : "Đánh dấu yêu thích"}>
                    <button
                        type="button"
                        onClick={() => onToggleFavorite(link)}
                        disabled={disabled}
                        aria-pressed={link.is_favorite}
                        aria-label={link.is_favorite ? "Bỏ đánh dấu yêu thích" : "Đánh dấu yêu thích"}
                        className="rounded-lg p-1.5 transition-colors hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {busyAction === "favorite" ? (
                            <Loader2 className="h-4 w-4 animate-spin text-amber-400" aria-hidden="true" />
                        ) : (
                            <Star
                                className={cn(
                                    "h-4 w-4",
                                    link.is_favorite
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-slate-500 hover:text-amber-400"
                                )}
                                aria-hidden="true"
                            />
                        )}
                    </button>
                </Tooltip>
            </TableCell>

            <TableCell className="font-medium text-white">{link.user.username}</TableCell>

            <TableCell>
                <div className="flex items-center gap-2">
                    <code className="rounded bg-violet-500/10 px-2 py-1 text-sm text-violet-400">
                        /{link.slug}
                    </code>
                    <button
                        type="button"
                        onClick={() => onCopyLink(link)}
                        aria-label={`Sao chép đường dẫn của /${link.slug}`}
                        className="text-slate-400 transition-colors hover:text-white"
                    >
                        {copied ? (
                            <Check className="h-4 w-4 text-green-400" aria-hidden="true" />
                        ) : (
                            <Copy className="h-4 w-4" aria-hidden="true" />
                        )}
                    </button>
                </div>
            </TableCell>

            <TableCell>
                <span
                    className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                        getTypeBadgeColor(link.type)
                    )}
                >
                    {getTypeIcon(link.type)}
                    {link.type}
                </span>
            </TableCell>

            <TableCell>
                <button
                    type="button"
                    onClick={() => onEditTags(link)}
                    className="flex max-w-[190px] flex-wrap items-center gap-1 rounded-lg px-1 py-0.5 text-left transition-colors hover:bg-slate-700/40"
                    aria-label={`Sửa nhãn cho /${link.slug}`}
                >
                    {link.tags.length === 0 ? (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                            Thêm nhãn
                        </span>
                    ) : (
                        <>
                            {link.tags.slice(0, VISIBLE_TAGS).map((tag) => (
                                <Badge key={tag} variant="violet" size="sm">
                                    {tag}
                                </Badge>
                            ))}
                            {hiddenTagCount > 0 && (
                                <Badge variant="default" size="sm">
                                    +{hiddenTagCount}
                                </Badge>
                            )}
                        </>
                    )}
                </button>
            </TableCell>

            <TableCell>
                <div className="flex flex-col items-start gap-1">
                    <button
                        type="button"
                        onClick={() => onToggleStatus(link.id)}
                        disabled={disabled}
                        className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                            link.is_active
                                ? "border border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                                : "border border-slate-500/30 bg-slate-500/10 text-slate-400 hover:bg-slate-500/20"
                        )}
                    >
                        {busyAction === "status" ? (
                            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                        ) : (
                            <Power className="h-3 w-3" aria-hidden="true" />
                        )}
                        {link.is_active ? "Hoạt động" : "Tạm dừng"}
                    </button>

                    {/* `is_published` do chủ trang quản, khác `is_active` của admin —
                        hiện ra để không ai phải đoán vì sao khách chưa thấy trang. */}
                    {!link.is_published && (
                        <Badge variant="warning" size="sm">
                            Nháp
                        </Badge>
                    )}
                </div>
            </TableCell>

            <TableCell className="whitespace-nowrap text-sm text-slate-400">
                {new Date(link.created_at).toLocaleDateString("vi-VN")}
            </TableCell>

            <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                    <RowIconButton
                        label="Hiển thị mã QR"
                        onClick={() => onShowQr(link)}
                        className="hover:bg-violet-500/10 hover:text-violet-400"
                    >
                        <QrCode className="h-4 w-4" aria-hidden="true" />
                    </RowIconButton>

                    <RowIconButton
                        label="Đặt lại PIN"
                        onClick={() => onResetPin(link)}
                        disabled={disabled}
                        className="hover:bg-amber-500/10 hover:text-amber-400"
                    >
                        <KeyRound className="h-4 w-4" aria-hidden="true" />
                    </RowIconButton>

                    <RowIconButton
                        label="Nhân bản liên kết"
                        onClick={() => onDuplicate(link)}
                        disabled={disabled}
                        loading={busyAction === "duplicate"}
                        className="hover:bg-sky-500/10 hover:text-sky-400"
                    >
                        <CopyPlus className="h-4 w-4" aria-hidden="true" />
                    </RowIconButton>

                    <RowIconButton
                        label="Xuất JSON"
                        onClick={() => onExport(link)}
                        disabled={disabled}
                        loading={busyAction === "export"}
                        className="hover:bg-emerald-500/10 hover:text-emerald-400"
                    >
                        <Download className="h-4 w-4" aria-hidden="true" />
                    </RowIconButton>

                    <Tooltip content="Mở trang trong tab mới">
                        <a
                            href={`/${link.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Mở /${link.slug} trong tab mới`}
                            className="inline-flex rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
                        >
                            <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        </a>
                    </Tooltip>

                    <RowIconButton
                        label="Xoá liên kết"
                        onClick={() => onDelete(link)}
                        disabled={disabled}
                        loading={busyAction === "delete"}
                        className="hover:bg-red-500/10 hover:text-red-400"
                    >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </RowIconButton>
                </div>
            </TableCell>
        </TableRow>
    );
}

function RowIconButton({
    label,
    onClick,
    children,
    className,
    disabled = false,
    loading = false,
}: {
    label: string;
    onClick: () => void;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    loading?: boolean;
}) {
    return (
        <Tooltip content={label}>
            <button
                type="button"
                onClick={onClick}
                disabled={disabled}
                aria-label={label}
                className={cn(
                    "rounded-lg p-2 text-slate-400 transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : children}
            </button>
        </Tooltip>
    );
}
