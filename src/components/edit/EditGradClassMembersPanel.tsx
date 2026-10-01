"use client";

import { useCallback, useMemo, useState } from "react";
import { Plus, Search, Users } from "lucide-react";
import { updateLinkProfile, type ClassMemberLite, type GradClassProfileData } from "@/app/actions/profile-actions";
import { useAutoSave } from "./useAutoSave";
import { SaveStatusIndicator } from "./SaveStatusIndicator";
import { ClassMemberRow } from "./ClassMemberRow";

const MAX_MEMBERS = 60;
const PAGE_SIZE = 12;

interface EditGradClassMembersPanelProps {
    slug: string;
    initialData: Record<string, unknown> | null;
    isDark: boolean;
}

function makeId() {
    return Math.random().toString(36).substring(2, 11);
}

export function EditGradClassMembersPanel({ slug, initialData, isDark }: EditGradClassMembersPanelProps) {
    const [members, setMembers] = useState<ClassMemberLite[]>(
        () => (initialData?.members as ClassMemberLite[] | undefined) ?? []
    );
    const [search, setSearch] = useState("");
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    const save = useCallback(
        async (value: ClassMemberLite[]) => {
            const payload: GradClassProfileData = { members: value };
            return updateLinkProfile(slug, payload);
        },
        [slug]
    );

    const { status, lastSavedAt, error, saveNow } = useAutoSave<ClassMemberLite[]>({
        value: members,
        save,
        delay: 1500,
    });

    const addMember = useCallback(() => {
        setMembers((prev) => {
            if (prev.length >= MAX_MEMBERS) return prev;
            return [...prev, { id: makeId(), name: "" }];
        });
    }, []);

    const removeMember = useCallback((id: string) => {
        setMembers((prev) => prev.filter((m) => m.id !== id));
    }, []);

    const updateMember = useCallback(
        (id: string, field: "name" | "nickname" | "avatar", value: string) => {
            setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
        },
        []
    );

    // Search filters the FULL list, independent of the chunked "load more" window.
    const filteredMembers = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return members;
        return members.filter(
            (m) => m.name.toLowerCase().includes(q) || (m.nickname ?? "").toLowerCase().includes(q)
        );
    }, [members, search]);

    const visibleMembers = filteredMembers.slice(0, visibleCount);
    const remaining = filteredMembers.length - visibleMembers.length;

    const atLimit = members.length >= MAX_MEMBERS;

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className={`flex items-center gap-2 text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                    <Users className="w-4 h-4" />
                    Sĩ số: {members.length}/{MAX_MEMBERS}
                </div>
                <SaveStatusIndicator status={status} lastSavedAt={lastSavedAt} error={error} onRetry={saveNow} />
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-slate-400" : "text-slate-400"}`} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm theo tên hoặc biệt danh..."
                        className={`w-full rounded-lg border pl-9 pr-3 py-2 text-sm outline-none transition-colors ${
                            isDark
                                ? "border-white/10 bg-black/20 text-white placeholder:text-slate-500 focus:border-emerald-400/50"
                                : "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-emerald-400"
                        }`}
                    />
                </div>
                <button
                    type="button"
                    onClick={addMember}
                    disabled={atLimit}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                        isDark ? "bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30" : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                >
                    <Plus className="w-4 h-4" />
                    Thêm thành viên
                </button>
            </div>

            {atLimit && (
                <p className={`text-xs ${isDark ? "text-amber-300" : "text-amber-600"}`}>
                    Đã đạt tối đa {MAX_MEMBERS} thành viên.
                </p>
            )}

            {filteredMembers.length === 0 ? (
                <div className={`text-center py-10 text-sm ${isDark ? "text-slate-400" : "text-slate-400"}`}>
                    {members.length === 0 ? "Chưa có thành viên nào. Nhấn \"Thêm thành viên\" để bắt đầu." : "Không tìm thấy thành viên phù hợp."}
                </div>
            ) : (
                <div className="space-y-3">
                    {visibleMembers.map((member) => (
                        <ClassMemberRow
                            key={member.id}
                            member={member}
                            slug={slug}
                            isDark={isDark}
                            onUpdate={updateMember}
                            onRemove={removeMember}
                        />
                    ))}
                </div>
            )}

            {remaining > 0 && (
                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                        className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                            isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                    >
                        Xem thêm (còn {remaining})
                    </button>
                </div>
            )}
        </div>
    );
}
