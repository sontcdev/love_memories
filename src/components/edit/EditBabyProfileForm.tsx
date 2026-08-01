"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateLinkProfile, BabyProfileData, BabyMonthEntry } from "@/app/actions/profile-actions";
import { Save, Loader2, Baby as BabyIcon, Undo2, Redo2 } from "lucide-react";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { useFormFeedback } from "./useFormFeedback";
import { useFormAutoSave, type SaveStatus } from "./useAutoSave";
import { SaveStatusIndicator } from "./SaveStatusIndicator";
import { useUndoRedo } from "./useUndoRedo";

const babyProfileSchema = z.object({
    baby_name: z.string().min(1, "Bắt buộc").max(50, "Tối đa 50 ký tự"),
    home_name: z.string().max(50, "Tối đa 50 ký tự").optional(),
    father_name: z.string().max(50, "Tối đa 50 ký tự").optional(),
    mother_name: z.string().max(50, "Tối đa 50 ký tự").optional(),
    birth_date: z.string().optional(),
    birth_weight_kg: z.string().optional(),
    slogan: z.string().max(120, "Tối đa 120 ký tự").optional(),
});

type BabyFormData = z.infer<typeof babyProfileSchema>;

interface EditBabyProfileFormProps {
    slug: string;
    initialData: BabyProfileData | null;
    isSubmitting: boolean;
    setIsSubmitting: (v: boolean) => void;
    onSuccess?: () => void;
}

function FormSaveToolbar({
    status,
    lastSavedAt,
    error,
    onRetry,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
}: {
    status: SaveStatus;
    lastSavedAt: Date | null;
    error: string | null;
    onRetry: () => void;
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
}) {
    const buttonClass =
        "inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40";

    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <SaveStatusIndicator status={status} lastSavedAt={lastSavedAt} error={error} onRetry={onRetry} />
            <div className="ml-auto flex items-center gap-2">
                <button type="button" onClick={onUndo} disabled={!canUndo} className={buttonClass} title="Hoàn tác (Ctrl+Z)">
                    <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Hoàn tác
                </button>
                <button type="button" onClick={onRedo} disabled={!canRedo} className={buttonClass} title="Làm lại (Ctrl+Shift+Z)">
                    <Redo2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Làm lại
                </button>
            </div>
        </div>
    );
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export function EditBabyProfileForm({
    slug,
    initialData,
    isSubmitting,
    setIsSubmitting,
    onSuccess,
}: EditBabyProfileFormProps) {
    const setMessage = useFormFeedback();
    const [journey, setJourney] = useState<BabyMonthEntry[]>(initialData?.journey || []);

    const {
        register,
        handleSubmit,
        watch,
        reset: resetFormValues,
        formState: { errors, isDirty, isValid },
    } = useForm<BabyFormData>({
        resolver: zodResolver(babyProfileSchema),
        mode: "onChange",
        defaultValues: {
            baby_name: initialData?.baby_name || "",
            home_name: initialData?.home_name || "",
            father_name: initialData?.father_name || "",
            mother_name: initialData?.mother_name || "",
            birth_date: initialData?.birth_date || "",
            birth_weight_kg: initialData?.birth_weight_kg?.toString() || "",
            slogan: initialData?.slogan || "",
        },
    });

    const getMonthEntry = (month: number): BabyMonthEntry => journey.find((j) => j.month === month) || { month };

    const updateMonthEntry = useCallback((month: number, patch: Partial<BabyMonthEntry>) => {
        setJourney((prev) => {
            const existing = prev.find((j) => j.month === month);
            if (existing) {
                return prev.map((j) => (j.month === month ? { ...j, ...patch } : j));
            }
            return [...prev, { month, ...patch }].sort((a, b) => a.month - b.month);
        });
    }, []);

    /** ĐƯỜNG DUY NHẤT ghi hồ sơ — dùng chung cho nút Lưu và tự động lưu. */
    const persist = useCallback(
        async (data: BabyFormData) =>
            updateLinkProfile(slug, {
                ...data,
                birth_weight_kg: data.birth_weight_kg ? Number(data.birth_weight_kg) : undefined,
                journey,
            }),
        [slug, journey]
    );

    const autoSave = useFormAutoSave<BabyFormData>({
        watch: () => ({ ...watch(), journey } as BabyFormData & { journey: BabyMonthEntry[] }),
        isDirty,
        isValid,
        save: persist,
        enabled: isDirty && isValid && !isSubmitting,
    });

    const undoRedo = useUndoRedo<BabyFormData>({
        value: watch(),
        onChange: (previous) => resetFormValues(previous, { keepDefaultValues: true }),
    });

    const onSubmit = async (data: BabyFormData) => {
        setIsSubmitting(true);

        const result = await persist(data);

        if (result.success) {
            setMessage({ type: "success", text: "Đã cập nhật hồ sơ!" });
            onSuccess?.();
        } else {
            setMessage({ type: "error", text: result.error || "Không thể cập nhật" });
        }

        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <BabyIcon className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-semibold text-gray-800">Hồ sơ em bé</h3>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên bé <span className="text-red-500">*</span>
                </label>
                <input
                    {...register("baby_name")}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none transition-all"
                    placeholder="Bống, Sóc, Bơ..."
                />
                {errors.baby_name && <p className="mt-1 text-sm text-red-500">{errors.baby_name.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Biệt danh ở nhà</label>
                    <input
                        {...register("home_name")}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none transition-all"
                        placeholder="Cún con"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                    <input
                        {...register("birth_date")}
                        type="date"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none transition-all bg-white appearance-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên bố</label>
                    <input
                        {...register("father_name")}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên mẹ</label>
                    <input
                        {...register("mother_name")}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none transition-all"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cân nặng lúc sinh (kg)</label>
                <input
                    {...register("birth_weight_kg")}
                    inputMode="decimal"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none transition-all"
                    placeholder="3.2"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slogan</label>
                <input
                    {...register("slogan")}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none transition-all"
                    placeholder="Món quà nhỏ, tình yêu lớn"
                />
            </div>

            {/* Hành trình 1 năm */}
            <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Hành trình 1 năm đầu đời</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {MONTHS.map((month) => {
                        const entry = getMonthEntry(month);
                        return (
                            <div key={month} className="rounded-lg border border-gray-200 p-3 space-y-2">
                                <p className="text-xs font-semibold text-gray-600">Tháng {month}</p>
                                <ImageUpload
                                    slug={slug}
                                    currentImageUrl={entry.image_url}
                                    onUploadComplete={(url) => updateMonthEntry(month, { image_url: url })}
                                    targetSizeKB={80}
                                    className="aspect-square"
                                />
                                <input
                                    type="number"
                                    step="0.01"
                                    value={entry.weight_kg ?? ""}
                                    onChange={(e) =>
                                        updateMonthEntry(month, {
                                            weight_kg: e.target.value ? Number(e.target.value) : undefined,
                                        })
                                    }
                                    placeholder="Cân nặng (kg)"
                                    className="w-full px-2 py-1 text-xs rounded border border-gray-300 focus:ring-1 focus:ring-amber-300 outline-none"
                                />
                                <input
                                    type="text"
                                    value={entry.note ?? ""}
                                    onChange={(e) => updateMonthEntry(month, { note: e.target.value })}
                                    placeholder="Ghi chú"
                                    className="w-full px-2 py-1 text-xs rounded border border-gray-300 focus:ring-1 focus:ring-amber-300 outline-none"
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            <FormSaveToolbar
                status={autoSave.status}
                lastSavedAt={autoSave.lastSavedAt}
                error={autoSave.error}
                onRetry={autoSave.saveNow}
                canUndo={undoRedo.canUndo}
                canRedo={undoRedo.canRedo}
                onUndo={undoRedo.undo}
                onRedo={undoRedo.redo}
            />

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-lg text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang lưu...
                    </>
                ) : (
                    <>
                        <Save className="w-5 h-5" />
                        Lưu thay đổi
                    </>
                )}
            </button>
        </form>
    );
}
