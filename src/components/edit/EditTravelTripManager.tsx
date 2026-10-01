"use client";

import { useState, useRef } from "react";
import { ChevronDown, ChevronUp, MapPin, Plus, Trash2, Flag } from "lucide-react";
import { updateLinkProfile, TravelDestination, TravelMilestone, TravelProfileData } from "@/app/actions/profile-actions";
import { useAutoSave } from "./useAutoSave";
import { useFormFeedback } from "./useFormFeedback";
import { SaveStatusIndicator } from "./SaveStatusIndicator";
import { ImageUpload } from "@/components/ui/ImageUpload";

const MAX_MILESTONES = 10;

function randomId() {
    return Math.random().toString(36).substring(2, 11);
}

interface EditTravelTripManagerProps {
    slug: string;
    initialData: Record<string, unknown>;
    isDark: boolean;
}

export function EditTravelTripManager({ slug, initialData, isDark }: EditTravelTripManagerProps) {
    const castData = initialData as TravelProfileData;
    const [destinations, setDestinations] = useState<TravelDestination[]>(castData.destinations || []);
    const [expandedDestId, setExpandedDestId] = useState<string | null>(null);
    const setMessage = useFormFeedback();
    const initialRef = useRef(JSON.stringify(castData.destinations || []));

    const save = async (value: TravelDestination[]) => {
        const result = await updateLinkProfile(slug, { destinations: value });
        if (!result.success) {
            setMessage({ type: "error", text: result.error || "Không thể lưu thay đổi" });
        }
        return result;
    };

    const isDirty = JSON.stringify(destinations) !== initialRef.current;
    const { status, lastSavedAt, error, saveNow } = useAutoSave({
        value: destinations,
        save,
        enabled: isDirty,
    });

    const addDestination = () => {
        const dest: TravelDestination = {
            id: randomId(),
            name: "",
            milestones: [],
            sort_order: destinations.length,
        };
        setDestinations((prev) => [...prev, dest]);
        setExpandedDestId(dest.id);
    };

    const removeDestination = (id: string) => {
        setDestinations((prev) => prev.filter((d) => d.id !== id));
        if (expandedDestId === id) setExpandedDestId(null);
    };

    const updateDestination = (id: string, patch: Partial<TravelDestination>) => {
        setDestinations((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
    };

    const addMilestone = (destId: string) => {
        setDestinations((prev) =>
            prev.map((d) => {
                if (d.id !== destId) return d;
                if (d.milestones.length >= MAX_MILESTONES) return d;
                const milestone: TravelMilestone = {
                    id: randomId(),
                    title: "",
                    sort_order: d.milestones.length,
                };
                return { ...d, milestones: [...d.milestones, milestone] };
            })
        );
    };

    const removeMilestone = (destId: string, milestoneId: string) => {
        setDestinations((prev) =>
            prev.map((d) =>
                d.id === destId ? { ...d, milestones: d.milestones.filter((m) => m.id !== milestoneId) } : d
            )
        );
    };

    const updateMilestone = (destId: string, milestoneId: string, patch: Partial<TravelMilestone>) => {
        setDestinations((prev) =>
            prev.map((d) =>
                d.id === destId
                    ? { ...d, milestones: d.milestones.map((m) => (m.id === milestoneId ? { ...m, ...patch } : m)) }
                    : d
            )
        );
    };

    const inputClass = `w-full px-3 py-2 rounded-lg border outline-none transition-all text-sm ${
        isDark
            ? "bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500"
            : "border-gray-300 focus:ring-2 focus:ring-sky-300 focus:border-sky-400"
    }`;
    const labelClass = `mb-1 block text-xs font-semibold ${isDark ? "text-slate-300" : "text-gray-600"}`;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
                        Điểm đến & cột mốc
                    </h3>
                    <p className={`text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                        Mỗi điểm đến có thể chứa tối đa {MAX_MILESTONES} cột mốc.
                    </p>
                </div>
                <SaveStatusIndicator status={status} lastSavedAt={lastSavedAt} error={error} onRetry={saveNow} />
            </div>

            {destinations.length === 0 && (
                <div
                    className={`rounded-xl border border-dashed p-6 text-center text-sm ${
                        isDark ? "border-slate-700 text-slate-400" : "border-gray-300 text-gray-500"
                    }`}
                >
                    Chưa có điểm đến nào. Thêm điểm đến đầu tiên cho chuyến đi.
                </div>
            )}

            <div className="space-y-3">
                {destinations.map((dest, index) => {
                    const expanded = expandedDestId === dest.id;
                    return (
                        <div
                            key={dest.id}
                            className={`rounded-xl border ${
                                isDark ? "border-slate-800 bg-slate-900/40" : "border-gray-200 bg-gray-50/50"
                            }`}
                        >
                            <div className="flex items-center gap-3 p-3">
                                <span
                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                        isDark ? "bg-sky-500/20 text-sky-300" : "bg-sky-100 text-sky-700"
                                    }`}
                                >
                                    {index + 1}
                                </span>
                                <input
                                    value={dest.name}
                                    onChange={(e) => updateDestination(dest.id, { name: e.target.value })}
                                    placeholder="Tên điểm đến"
                                    maxLength={100}
                                    className={`${inputClass} flex-1`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setExpandedDestId(expanded ? null : dest.id)}
                                    className={`rounded-lg p-2 ${isDark ? "hover:bg-white/10 text-slate-300" : "hover:bg-gray-200 text-gray-600"}`}
                                    aria-label={expanded ? "Thu gọn" : "Mở rộng"}
                                >
                                    {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeDestination(dest.id)}
                                    className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                                    aria-label="Xóa điểm đến"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            {expanded && (
                                <div className={`space-y-4 border-t p-4 ${isDark ? "border-slate-800" : "border-gray-200"}`}>
                                    <div>
                                        <label className={labelClass}>Ghi chú vị trí</label>
                                        <input
                                            value={dest.location_note || ""}
                                            onChange={(e) => updateDestination(dest.id, { location_note: e.target.value })}
                                            placeholder="VD: Đà Lạt, Lâm Đồng"
                                            maxLength={150}
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Ảnh bìa điểm đến</label>
                                        <ImageUpload
                                            slug={slug}
                                            currentImageUrl={dest.cover_image_url}
                                            onUploadComplete={(url) => updateDestination(dest.id, { cover_image_url: url })}
                                            targetSizeKB={80}
                                        />
                                    </div>

                                    <div>
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className={`flex items-center gap-1.5 text-sm font-semibold ${isDark ? "text-slate-200" : "text-gray-700"}`}>
                                                <Flag className="h-4 w-4" /> Cột mốc ({dest.milestones.length}/{MAX_MILESTONES})
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => addMilestone(dest.id)}
                                                disabled={dest.milestones.length >= MAX_MILESTONES}
                                                className="flex items-center gap-1 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                <Plus className="h-3.5 w-3.5" /> Thêm cột mốc
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {dest.milestones.map((milestone, mIndex) => (
                                                <div
                                                    key={milestone.id}
                                                    className={`rounded-lg border p-3 ${isDark ? "border-slate-800 bg-slate-950/40" : "border-gray-200 bg-white"}`}
                                                >
                                                    <div className="mb-2 flex items-start gap-2">
                                                        <span className={`mt-2 text-xs font-bold ${isDark ? "text-slate-500" : "text-gray-400"}`}>
                                                            {mIndex + 1}
                                                        </span>
                                                        <div className="flex-1 space-y-2">
                                                            <input
                                                                value={milestone.title}
                                                                onChange={(e) =>
                                                                    updateMilestone(dest.id, milestone.id, { title: e.target.value })
                                                                }
                                                                placeholder="Tiêu đề cột mốc"
                                                                maxLength={100}
                                                                className={inputClass}
                                                            />
                                                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                                <input
                                                                    type="date"
                                                                    value={milestone.date || ""}
                                                                    onChange={(e) =>
                                                                        updateMilestone(dest.id, milestone.id, { date: e.target.value })
                                                                    }
                                                                    className={inputClass}
                                                                />
                                                            </div>
                                                            <textarea
                                                                value={milestone.description || ""}
                                                                onChange={(e) =>
                                                                    updateMilestone(dest.id, milestone.id, { description: e.target.value })
                                                                }
                                                                placeholder="Mô tả ngắn"
                                                                maxLength={500}
                                                                rows={2}
                                                                className={inputClass}
                                                            />
                                                            <ImageUpload
                                                                slug={slug}
                                                                currentImageUrl={milestone.image_url}
                                                                onUploadComplete={(url) =>
                                                                    updateMilestone(dest.id, milestone.id, { image_url: url })
                                                                }
                                                                targetSizeKB={60}
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeMilestone(dest.id, milestone.id)}
                                                            className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                                                            aria-label="Xóa cột mốc"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <button
                type="button"
                onClick={addDestination}
                className={`flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-sm font-semibold transition-colors ${
                    isDark
                        ? "border-slate-700 text-slate-300 hover:bg-white/5"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
            >
                <MapPin className="h-4 w-4" /> Thêm điểm đến
            </button>
        </div>
    );
}
