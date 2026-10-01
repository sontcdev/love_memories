"use client";

import { forwardRef } from "react";
import { LinkType } from "@prisma/client";
import { Search, Star, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
    isFilterActive,
    LINK_SORT_LABELS,
    type LinkFilterState,
    type LinkSortKey,
    type LinkStatusFilter,
} from "./link-filters";
import { LINK_TYPE_LABELS, LINK_TYPE_ORDER, getTypeIcon } from "./link-type-meta";

const SELECT_TRIGGER = "bg-slate-900/50 border-slate-600 text-white h-9";
const SELECT_CONTENT = "bg-slate-800 border-slate-700";
const SELECT_ITEM = "text-white focus:bg-slate-700 focus:text-white";

const STATUS_LABELS: Record<LinkStatusFilter, string> = {
    ALL: "Mọi trạng thái",
    ACTIVE: "Đang hoạt động",
    INACTIVE: "Đang tạm dừng",
};

export interface LinkFilterBarProps {
    filters: LinkFilterState;
    onChange: (next: LinkFilterState) => void;
    onReset: () => void;
    /** Số dòng còn lại sau khi lọc, và tổng số dòng của trang hiện tại. */
    resultCount: number;
    totalCount: number;
}

/**
 * Thanh tìm kiếm / lọc / sắp xếp.
 *
 * `ref` được chuyển xuống ô tìm kiếm để phím tắt "/" focus được vào đây.
 */
export const LinkFilterBar = forwardRef<HTMLInputElement, LinkFilterBarProps>(
    function LinkFilterBar({ filters, onChange, onReset, resultCount, totalCount }, ref) {
        const active = isFilterActive(filters);

        return (
            <div className="space-y-3 rounded-xl border border-slate-700/50 bg-slate-800/40 p-3 sm:p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="relative flex-1 lg:max-w-sm">
                        <Search
                            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                            aria-hidden="true"
                        />
                        <Input
                            ref={ref}
                            // `type="text"` chứ không phải `"search"`: WebKit vẽ nút xoá riêng
                            // của nó đúng chỗ gợi ý phím "/" bên phải ô nhập.
                            type="text"
                            value={filters.search}
                            onChange={(event) => onChange({ ...filters, search: event.target.value })}
                            placeholder="Tìm theo slug hoặc tên người dùng…"
                            aria-label="Tìm theo slug hoặc tên người dùng trong trang này"
                            className="h-9 border-slate-600 bg-slate-900/50 pl-9 pr-12 text-white placeholder:text-slate-500"
                        />
                        <kbd
                            aria-hidden="true"
                            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-slate-600 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-400"
                        >
                            /
                        </kbd>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Select
                            value={filters.type}
                            onValueChange={(value) =>
                                onChange({ ...filters, type: value as LinkType | "ALL" })
                            }
                        >
                            <SelectTrigger className={cn(SELECT_TRIGGER, "w-[190px]")} aria-label="Lọc theo giao diện">
                                <SelectValue placeholder="Mọi giao diện" />
                            </SelectTrigger>
                            <SelectContent className={SELECT_CONTENT}>
                                <SelectItem value="ALL" className={SELECT_ITEM}>
                                    Mọi giao diện
                                </SelectItem>
                                {LINK_TYPE_ORDER.map((type) => (
                                    <SelectItem key={type} value={type} className={SELECT_ITEM}>
                                        <span className="flex items-center gap-2">
                                            {getTypeIcon(type)}
                                            {LINK_TYPE_LABELS[type]}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.status}
                            onValueChange={(value) =>
                                onChange({ ...filters, status: value as LinkStatusFilter })
                            }
                        >
                            <SelectTrigger className={cn(SELECT_TRIGGER, "w-[165px]")} aria-label="Lọc theo trạng thái">
                                <SelectValue placeholder="Mọi trạng thái" />
                            </SelectTrigger>
                            <SelectContent className={SELECT_CONTENT}>
                                {(Object.keys(STATUS_LABELS) as LinkStatusFilter[]).map((status) => (
                                    <SelectItem key={status} value={status} className={SELECT_ITEM}>
                                        {STATUS_LABELS[status]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.sort}
                            onValueChange={(value) => onChange({ ...filters, sort: value as LinkSortKey })}
                        >
                            <SelectTrigger className={cn(SELECT_TRIGGER, "w-[160px]")} aria-label="Sắp xếp">
                                <SelectValue placeholder="Sắp xếp" />
                            </SelectTrigger>
                            <SelectContent className={SELECT_CONTENT}>
                                {(Object.keys(LINK_SORT_LABELS) as LinkSortKey[]).map((key) => (
                                    <SelectItem key={key} value={key} className={SELECT_ITEM}>
                                        {LINK_SORT_LABELS[key]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Tooltip content="Chỉ hiện liên kết đã đánh dấu yêu thích">
                            <button
                                type="button"
                                aria-pressed={filters.favoritesOnly}
                                onClick={() => onChange({ ...filters, favoritesOnly: !filters.favoritesOnly })}
                                className={cn(
                                    "inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm transition-colors",
                                    filters.favoritesOnly
                                        ? "border-amber-500/50 bg-amber-500/15 text-amber-300"
                                        : "border-slate-600 bg-slate-900/50 text-slate-300 hover:text-white"
                                )}
                            >
                                <Star
                                    className={cn("h-4 w-4", filters.favoritesOnly && "fill-amber-400 text-amber-400")}
                                    aria-hidden="true"
                                />
                                Yêu thích
                            </button>
                        </Tooltip>

                        {active && (
                            <button
                                type="button"
                                onClick={onReset}
                                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-600 bg-slate-900/50 px-3 text-sm text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
                            >
                                <X className="h-4 w-4" aria-hidden="true" />
                                Xoá bộ lọc
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                    <p aria-live="polite">
                        {active ? (
                            <>
                                Hiện <span className="font-semibold text-slate-200">{resultCount}</span>/{totalCount} liên
                                kết trong trang này
                            </>
                        ) : (
                            <>
                                <span className="font-semibold text-slate-200">{totalCount}</span> liên kết trong trang này
                            </>
                        )}
                        <span className="ml-1 text-slate-500">
                            (bộ lọc chỉ áp dụng cho trang hiện tại)
                        </span>
                    </p>

                    <ShortcutLegend />
                </div>
            </div>
        );
    }
);

/** Chú thích phím tắt — để phím tắt có thể phát hiện được chứ không phải bí mật. */
function ShortcutLegend() {
    return (
        <Tooltip
            side="left"
            content="Nhấn / để nhảy tới ô tìm kiếm. Nhấn Esc để bỏ chọn và xoá bộ lọc. Phím tắt không hoạt động khi đang gõ trong một ô nhập."
        >
            <span className="inline-flex cursor-help items-center gap-1.5 text-slate-500">
                <Kbd>/</Kbd>
                <span>tìm kiếm</span>
                <span aria-hidden="true">·</span>
                <Kbd>Esc</Kbd>
                <span>bỏ chọn</span>
            </span>
        </Tooltip>
    );
}

function Kbd({ children }: { children: React.ReactNode }) {
    return (
        <kbd className="rounded border border-slate-600 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
            {children}
        </kbd>
    );
}
