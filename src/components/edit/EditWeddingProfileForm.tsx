"use client";

import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateLinkProfile, WeddingProfileData } from "@/app/actions/profile-actions";
import { Save, Loader2, Gem, Undo2, Redo2 } from "lucide-react";
import { useFormFeedback } from "./useFormFeedback";
import { useFormAutoSave, type SaveStatus } from "./useAutoSave";
import { SaveStatusIndicator } from "./SaveStatusIndicator";
import { useUndoRedo } from "./useUndoRedo";

// Thông báo lỗi bằng tiếng Việt: với `mode: "onChange"` (xem bên dưới) người dùng
// nhìn thấy các lỗi này ngay khi đang gõ, không còn chỉ khi bấm Lưu — nên mọi
// thông báo mặc định (tiếng Anh) của zod đều phải được viết lại.
const weddingProfileSchema = z.object({
    groom_name: z.string().min(1, "Bắt buộc").max(50, "Tối đa 50 ký tự"),
    bride_name: z.string().min(1, "Bắt buộc").max(50, "Tối đa 50 ký tự"),
    wedding_date: z.string().optional(),
    venue: z.string().max(100, "Tối đa 100 ký tự").optional(),
    title: z.string().max(100, "Tối đa 100 ký tự").optional(),
    ceremony_time: z.string().max(30, "Tối đa 30 ký tự").optional(),
    reception_time: z.string().max(30, "Tối đa 30 ký tự").optional(),
    love_story: z.string().max(500, "Tối đa 500 ký tự").optional(),
});

type WeddingFormData = z.infer<typeof weddingProfileSchema>;

interface EditWeddingProfileFormProps {
    slug: string;
    initialData: WeddingProfileData | null;
    isSubmitting: boolean;
    setIsSubmitting: (v: boolean) => void;
    onSuccess?: () => void;
}

/**
 * Hàng điều khiển đặt ngay trên nút "Lưu thay đổi": trạng thái tự động lưu +
 * hoàn tác/làm lại.
 *
 * Hai thứ này chỉ có nghĩa khi ở cạnh nhau: thấy "đã lưu tự động" thì người dùng
 * lập tức cần biết mình vẫn hoàn tác được.
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

export function EditWeddingProfileForm({
    slug,
    initialData,
    isSubmitting,
    setIsSubmitting,
    onSuccess,
}: EditWeddingProfileFormProps) {
    const setMessage = useFormFeedback();
    const {
        register,
        handleSubmit,
        watch,
        reset: resetFormValues,
        formState: { errors, isDirty, isValid },
    } = useForm<WeddingFormData>({
        resolver: zodResolver(weddingProfileSchema),
        // `mode: "onChange"` là BẮT BUỘC, không phải tùy chọn thẩm mỹ: cổng chặn của
        // tự động lưu là `isDirty && isValid`, mà với mode mặc định ("onSubmit") thì
        // `isValid` chỉ được cập nhật sau lần submit đầu tiên — tự động lưu sẽ hoặc
        // không bao giờ chạy, hoặc chạy với dữ liệu chưa hợp lệ. Đổi mode KHÔNG ảnh
        // hưởng nút "Lưu thay đổi": `handleSubmit` vẫn validate như trước.
        mode: "onChange",
        defaultValues: {
            groom_name: initialData?.groom_name || "",
            bride_name: initialData?.bride_name || "",
            wedding_date: initialData?.wedding_date || "",
            venue: initialData?.venue || "",
            title: initialData?.title || "",
            ceremony_time: initialData?.ceremony_time || "",
            reception_time: initialData?.reception_time || "",
            love_story: initialData?.love_story || "",
        },
    });

    /**
     * ĐƯỜNG DUY NHẤT ghi hồ sơ xuống server.
     *
     * Cả nút "Lưu thay đổi" và tự động lưu đều đi qua đây, nên không có chỗ nào gọi
     * `updateLinkProfile` lần thứ hai — hai luồng không thể lệch nhau về payload
     * hay về cách xử lý lỗi.
     */
    const persist = useCallback(
        async (data: WeddingFormData) => updateLinkProfile(slug, data),
        [slug]
    );

    /**
     * Tự động lưu — BỔ SUNG cho nút Lưu, không thay thế.
     *
     * Cổng `enabled` chặn mọi trường hợp không nên ghi:
     * - `isDirty`: form chưa ai chạm vào thì không ghi (mở trang không phải là sửa).
     * - `isValid`: dữ liệu sai thì không ghi (server cũng sẽ từ chối).
     * - `!isSubmitting`: đang lưu tay thì không chen ngang.
     *
     * Hồ sơ đám cưới không có ô tải ảnh nào, nên không cần chặn theo trạng thái upload.
     */
    const autoSave = useFormAutoSave<WeddingFormData>({
        watch,
        isDirty,
        isValid,
        save: persist,
        enabled: isDirty && isValid && !isSubmitting,
    });

    /**
     * Hoàn tác/làm lại cho các ô chữ của form.
     *
     * `keepDefaultValues: true` để react-hook-form tính lại `isDirty` bằng cách so
     * với giá trị gốc: hoàn tác về đúng dữ liệu ban đầu thì form trở lại "sạch" và
     * tự động lưu tự dừng.
     */
    const undoRedo = useUndoRedo<WeddingFormData>({
        value: watch(),
        onChange: (previous) => resetFormValues(previous, { keepDefaultValues: true }),
    });

    const onSubmit = async (data: WeddingFormData) => {
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
                <Gem className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-semibold text-gray-800">Hồ sơ đám cưới</h3>
            </div>

            {/* Names Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên chú rể <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register("groom_name")}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none transition-all"
                        placeholder="Tên chú rể"
                    />
                    {errors.groom_name && (
                        <p className="mt-1 text-sm text-red-500">{errors.groom_name.message}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên cô dâu <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register("bride_name")}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none transition-all"
                        placeholder="Tên cô dâu"
                    />
                    {errors.bride_name && (
                        <p className="mt-1 text-sm text-red-500">{errors.bride_name.message}</p>
                    )}
                </div>
            </div>

            {/* Wedding Date */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày cưới
                </label>
                <input
                    {...register("wedding_date")}
                    type="date"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none transition-all bg-white appearance-none"
                />
            </div>

            {/* Venue */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa điểm
                </label>
                <input
                    {...register("venue")}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none transition-all"
                    placeholder="Nhà hàng, khách sạn, địa điểm..."
                />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giờ làm lễ</label>
                    <input
                        {...register("ceremony_time")}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none transition-all"
                        placeholder="09:00"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giờ tiệc</label>
                    <input
                        {...register("reception_time")}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none transition-all"
                        placeholder="18:00"
                    />
                </div>
            </div>

            {/* Title */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiêu đề trang
                </label>
                <input
                    {...register("title")}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none transition-all"
                    placeholder="Ngày trọng đại"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Câu chuyện tình yêu</label>
                <textarea
                    {...register("love_story")}
                    rows={5}
                    maxLength={500}
                    className="w-full resize-none px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none transition-all"
                    placeholder="Hai người đã gặp nhau như thế nào?"
                />
                {errors.love_story && <p className="mt-1 text-sm text-red-500">{errors.love_story.message}</p>}
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
