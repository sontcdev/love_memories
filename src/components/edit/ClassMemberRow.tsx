"use client";

import { memo } from "react";
import { Trash2 } from "lucide-react";
import { ImageUpload } from "@/components/ui/ImageUpload";
import type { ClassMemberLite } from "@/app/actions/profile-actions";

export interface ClassMemberRowProps {
    member: ClassMemberLite;
    slug: string;
    isDark: boolean;
    onUpdate: (id: string, field: "name" | "nickname" | "avatar", value: string) => void;
    onRemove: (id: string) => void;
}

// Memoized so editing one member's name does not re-render the other 40-59 rows.
// `onUpdate`/`onRemove` are stable callbacks (useCallback with functional setState
// in the parent), and `member` only gets a new reference when this row's own data
// changes — the array-update helpers in the parent never touch sibling entries.
function ClassMemberRowImpl({ member, slug, isDark, onUpdate, onRemove }: ClassMemberRowProps) {
    return (
        <div
            className={`flex items-start gap-3 rounded-2xl border p-3 sm:p-4 transition-colors ${
                isDark ? "border-white/10 bg-black/20" : "border-slate-200 bg-white"
            }`}
        >
            <div className="w-16 h-16 shrink-0">
                <ImageUpload
                    slug={slug}
                    currentImageUrl={member.avatar}
                    targetSizeKB={30}
                    className="[&>div]:rounded-full [&_img]:rounded-full"
                    onUploadComplete={(url) => onUpdate(member.id, "avatar", url)}
                />
            </div>

            <div className="flex-1 min-w-0 space-y-2">
                <input
                    type="text"
                    value={member.name}
                    onChange={(e) => onUpdate(member.id, "name", e.target.value)}
                    placeholder="Tên thành viên"
                    className={`w-full rounded-lg border px-3 py-2 text-sm font-medium outline-none transition-colors ${
                        isDark
                            ? "border-white/10 bg-black/30 text-white placeholder:text-slate-500 focus:border-emerald-400/50"
                            : "border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:border-emerald-400"
                    }`}
                />
                <input
                    type="text"
                    value={member.nickname ?? ""}
                    onChange={(e) => onUpdate(member.id, "nickname", e.target.value)}
                    placeholder="Biệt danh (tuỳ chọn)"
                    className={`w-full rounded-lg border px-3 py-2 text-xs outline-none transition-colors ${
                        isDark
                            ? "border-white/10 bg-black/20 text-slate-200 placeholder:text-slate-500 focus:border-emerald-400/50"
                            : "border-slate-200 bg-white text-slate-600 placeholder:text-slate-400 focus:border-emerald-400"
                    }`}
                />
            </div>

            <button
                type="button"
                onClick={() => onRemove(member.id)}
                className={`p-2 rounded-lg shrink-0 transition-colors ${
                    isDark
                        ? "text-rose-300 hover:bg-rose-500/10"
                        : "text-rose-500 hover:bg-rose-50"
                }`}
                title="Xoá thành viên"
                aria-label="Xoá thành viên"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}

export const ClassMemberRow = memo(ClassMemberRowImpl);
