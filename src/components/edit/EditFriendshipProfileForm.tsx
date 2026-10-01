"use client";

import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateLinkProfile, FriendshipProfileData } from "@/app/actions/profile-actions";
import { Save, Loader2, Smile, Undo2, Redo2 } from "lucide-react";
import { useFormFeedback } from "./useFormFeedback";
import { useFormAutoSave, type SaveStatus } from "./useAutoSave";
import { SaveStatusIndicator } from "./SaveStatusIndicator";
import { useUndoRedo } from "./useUndoRedo";

// Thông báo lỗi bằng tiếng Việt: với `mode: "onChange"` (xem bên dưới) các lỗi này
// hiện ngay khi người dùng đang gõ, nên không được để lọt thông báo mặc định
// (tiếng Anh) của zod.
const friendshipProfileSchema = z.object({
    group_name: z.string().min(1, "Bắt buộc").max(50, "Tối đa 50 ký tự"),
    motto: z.string().max(100, "Tối đa 100 ký tự").optional(),
    since_date: z.string().optional(),
});

type FriendshipFormData = z.infer<typeof friendshipProfileSchema>;

interface EditFriendshipProfileFormProps {
    slug: string;
    initialData: FriendshipProfileData | null;
    isSubmitting: boolean;
    setIsSubmitting: (v: boolean) => void;
    onSuccess?: () => void;
}

/**
 * Hàng điều khiển đặt ngay trên nút "Lưu thay đổi": trạng thái tự động lưu +
 * hoàn tác/làm lại.
 *
 * Cả hai nút đều là `type="button"` — nếu để mặc định, bấm hoàn tác sẽ submit form.
 */
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

export function EditFriendshipProfileForm({
    slug,
    initialData,
    isSubmitting,
    setIsSubmitting,
    onSuccess,
}: EditFriendshipProfileFormProps) {
    const setMessage = useFormFeedback();
    const {
        register,
        handleSubmit,
        watch,
        reset: resetFormValues,
        formState: { errors, isDirty, isValid },
    } = useForm<FriendshipFormData>({
        resolver: zodResolver(friendshipProfileSchema),
        // `mode: "onChange"` là BẮT BUỘC: cổng chặn của tự động lưu là
        // `isDirty && isValid`, mà với mode mặc định ("onSubmit") thì `isValid` chỉ
        // được cập nhật sau lần submit đầu tiên. Nút "Lưu thay đổi" không đổi hành vi.
        mode: "onChange",
        defaultValues: {
            group_name: initialData?.group_name || "",
            motto: initialData?.motto || "",
            since_date: initialData?.since_date || "",
        },
    });

    /** ĐƯỜNG DUY NHẤT ghi hồ sơ — dùng chung cho nút Lưu và tự động lưu. */
    const persist = useCallback(
        async (data: FriendshipFormData) => updateLinkProfile(slug, data),
        [slug]
    );

    /**
     * Tự động lưu — BỔ SUNG cho nút Lưu, không thay thế.
     *
     * - `isDirty`: form chưa ai chạm vào thì không ghi.
     * - `isValid`: dữ liệu sai thì không ghi.
     * - `!isSubmitting`: đang lưu tay thì không chen ngang.
     *
     * Hồ sơ nhóm bạn không có ô tải ảnh, nên không cần chặn theo trạng thái upload.
     */
    const autoSave = useFormAutoSave<FriendshipFormData>({
        watch,
        isDirty,
        isValid,
        save: persist,
        enabled: isDirty && isValid && !isSubmitting,
    });

    /**
     * Hoàn tác/làm lại. `keepDefaultValues: true` để hoàn tác về đúng dữ liệu ban
     * đầu thì form trở lại "sạch" và tự động lưu tự dừng.
     */
    const undoRedo = useUndoRedo<FriendshipFormData>({
        value: watch(),
        onChange: (previous) => resetFormValues(previous, { keepDefaultValues: true }),
    });

    const onSubmit = async (data: FriendshipFormData) => {
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
                <Smile className="w-5 h-5 text-violet-500" />
                <h3 className="text-lg font-semibold text-gray-800">Hồ sơ nhóm bạn</h3>
            </div>

            {/* Group Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên nhóm <span className="text-red-500">*</span>
                </label>
                <input
                    {...register("group_name")}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none transition-all"
                    placeholder="Nhóm bạn thân"
                />
                {errors.group_name && (
                    <p className="mt-1 text-sm text-red-500">{errors.group_name.message}</p>
                )}
            </div>

            {/* Motto */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phương châm / Khẩu hiệu
                </label>
                <input
                    {...register("motto")}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none transition-all"
                    placeholder="Bạn bè là mãi mãi"
                />
            </div>

            {/* Since Date */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quen nhau từ
                </label>
                <input
                    {...register("since_date")}
                    type="date"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none transition-all bg-white appearance-none"
                />
            </div>

            {/* Trạng thái tự động lưu + hoàn tác, đặt ngay trên nút Lưu */}
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

            {/* Submit */}
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-lg text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 bg-violet-500 hover:bg-violet-600"
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
