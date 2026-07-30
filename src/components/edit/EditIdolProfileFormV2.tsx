"use client";

// EditIdolProfileFormV2 — bản giữ nguyên implementation mới (toast, auto-save, undo/redo…).
// EditIdolProfileForm.tsx đã rollback về đúng phiên bản trên nhánh deploy và chỉ phục vụ
// các LinkType đã có trên deploy; file V2 này phục vụ WEDDING/TRAVEL/FRIENDSHIP.

import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateLinkProfile, IdolProfileData } from "@/app/actions/profile-actions";
import { Save, Loader2, Star, Camera, Undo2, Redo2 } from "lucide-react";
import { useFormFeedback } from "./useFormFeedback";
import { useFormAutoSave, type SaveStatus } from "./useAutoSave";
import { SaveStatusIndicator } from "./SaveStatusIndicator";
import { useUndoRedo } from "./useUndoRedo";

// ============================================================================
// ZOD SCHEMA
// ============================================================================

// Thông báo lỗi bằng tiếng Việt: với `mode: "onChange"` (xem bên dưới) các lỗi này
// hiện ngay khi người dùng đang gõ chứ không còn chỉ khi bấm Lưu, nên "Required" và
// các thông báo mặc định (tiếng Anh) của zod đều phải được viết lại.
const idolProfileSchema = z.object({
    idol_name: z.string().min(1, "Bắt buộc").max(50, "Tối đa 50 ký tự"),
    fan_name: z.string().min(1, "Bắt buộc").max(50, "Tối đa 50 ký tự"),
    debut_date: z.string().optional(),
    title: z.string().max(100, "Tối đa 100 ký tự").optional(),
    slogan: z.string().max(200, "Tối đa 200 ký tự").optional(),
});

type IdolFormData = z.infer<typeof idolProfileSchema>;

// ============================================================================
// COMPONENT
// ============================================================================

interface EditIdolProfileFormV2Props {
    slug: string;
    initialData: IdolProfileData | null;
    isSubmitting: boolean;
    setIsSubmitting: (v: boolean) => void;
    onSuccess?: () => void;
    isDark?: boolean;
}

/**
 * Hàng điều khiển đặt ngay trên nút "Lưu thay đổi": trạng thái tự động lưu +
 * hoàn tác/làm lại.
 *
 * Có `isDark` vì khung sửa của IDOL chạy cả ở chế độ nền tối (sân khấu neon) —
 * viền xám nhạt của bản sáng sẽ chìm hẳn trên nền slate.
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
    isDark,
}: {
    status: SaveStatus;
    lastSavedAt: Date | null;
    error: string | null;
    onRetry: () => void;
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
    isDark: boolean;
}) {
    const buttonClass = `inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        isDark
            ? "border-purple-500/30 bg-slate-950/60 text-purple-100 hover:bg-slate-900"
            : "border-gray-300 text-gray-600 hover:bg-gray-50"
    }`;

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

export function EditIdolProfileFormV2({
    slug,
    initialData,
    isSubmitting,
    setIsSubmitting,
    onSuccess,
    isDark = false,
}: EditIdolProfileFormV2Props) {
    const setMessage = useFormFeedback();
    const [idolAvatar, setIdolAvatar] = useState<string>(initialData?.idol_avatar || "");
    const [fanAvatar, setFanAvatar] = useState<string>(initialData?.fan_avatar || "");
    const [uploadingIdol, setUploadingIdol] = useState(false);
    const [uploadingFan, setUploadingFan] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        reset: resetFormValues,
        formState: { errors, isDirty, isValid },
    } = useForm<IdolFormData>({
        resolver: zodResolver(idolProfileSchema),
        // `mode: "onChange"` là BẮT BUỘC, không phải tùy chọn thẩm mỹ: cổng chặn của
        // tự động lưu là `isDirty && isValid`, mà với mode mặc định ("onSubmit") thì
        // `isValid` chỉ được cập nhật sau lần submit đầu tiên — tự động lưu sẽ hoặc
        // không bao giờ chạy, hoặc chạy với dữ liệu chưa hợp lệ. Đổi mode KHÔNG ảnh
        // hưởng nút "Lưu thay đổi": `handleSubmit` vẫn validate như trước.
        mode: "onChange",
        defaultValues: {
            idol_name: initialData?.idol_name || "",
            fan_name: initialData?.fan_name || "",
            debut_date: initialData?.debut_date || "",
            title: initialData?.title || "",
            slogan: initialData?.slogan || "",
        },
    });

    // Compress image to target size
    const compressImage = async (file: File, maxSizeKB: number = 50, maxDimension: number = 300): Promise<File> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");

                    // Resize to max dimension
                    let { width, height } = img;

                    if (width > height) {
                        if (width > maxDimension) {
                            height = (height * maxDimension) / width;
                            width = maxDimension;
                        }
                    } else {
                        if (height > maxDimension) {
                            width = (width * maxDimension) / height;
                            height = maxDimension;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext("2d");
                    if (!ctx) {
                        resolve(file);
                        return;
                    }

                    ctx.drawImage(img, 0, 0, width, height);

                    // Start with good quality and reduce until under target
                    let quality = 0.9;
                    const tryCompress = () => {
                        canvas.toBlob(
                            (blob) => {
                                if (!blob) {
                                    resolve(file);
                                    return;
                                }

                                if (blob.size <= maxSizeKB * 1024 || quality <= 0.3) {
                                    const compressedFile = new File([blob], file.name, {
                                        type: "image/jpeg",
                                        lastModified: Date.now(),
                                    });
                                    resolve(compressedFile);
                                } else {
                                    quality -= 0.1;
                                    tryCompress();
                                }
                            },
                            "image/jpeg",
                            quality
                        );
                    };

                    tryCompress();
                };
                img.onerror = () => reject(new Error("Failed to load image"));
                img.src = e.target?.result as string;
            };
            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.readAsDataURL(file);
        });
    };

    const handleAvatarUpload = async (
        file: File,
        type: "idol" | "fan",
        setUploading: (v: boolean) => void,
        setAvatar: (v: string) => void
    ) => {
        setUploading(true);
        try {
            // Compress image
            const compressedFile = await compressImage(file, 50, 300);
            console.log(`Image compressed: ${(file.size / 1024).toFixed(1)}KB → ${(compressedFile.size / 1024).toFixed(1)}KB`);

            const formData = new FormData();
            formData.append("file", compressedFile);
            formData.append("slug", slug);
            formData.append("type", `${type}_avatar`);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            if (result.success && result.url) {
                setAvatar(result.url);
            } else {
                setMessage({ type: "error", text: result.error || "Tải ảnh thất bại" });
            }
        } catch (error) {
            console.error("Upload error:", error);
            setMessage({ type: "error", text: "Không thể tải ảnh đại diện" });
        }
        setUploading(false);
    };

    /**
     * ĐƯỜNG DUY NHẤT ghi hồ sơ xuống server.
     *
     * Cả nút "Lưu thay đổi" và tự động lưu đều đi qua đây, nên không có chỗ nào gọi
     * `updateLinkProfile` lần thứ hai — hai luồng không thể lệch nhau về payload
     * (ví dụ quên kèm ảnh đại diện) hay về cách xử lý lỗi.
     */
    const persist = useCallback(
        async (data: IdolFormData) => {
            return updateLinkProfile(slug, {
                ...data,
                idol_avatar: idolAvatar,
                fan_avatar: fanAvatar,
            });
        },
        [slug, idolAvatar, fanAvatar]
    );

    /**
     * Ảnh đại diện KHÔNG nằm trong react-hook-form (chúng là state riêng), nên
     * `isDirty` của form không biết chúng đã đổi. Nếu chỉ nghe `watch()` thì tải ảnh
     * lên rồi rời trang là mất: file đã nằm trên storage nhưng hồ sơ vẫn trỏ vào ảnh cũ.
     *
     * So sánh theo nội dung với dữ liệu lúc mở trang (giữ trong ref để mốc so sánh
     * không đổi giữa các lần render).
     */
    const initialAvatars = useRef(
        JSON.stringify({
            idolAvatar: initialData?.idol_avatar || "",
            fanAvatar: initialData?.fan_avatar || "",
        })
    );
    const avatarsDirty = JSON.stringify({ idolAvatar, fanAvatar }) !== initialAvatars.current;

    /**
     * Tự động lưu — BỔ SUNG cho nút Lưu, không thay thế.
     *
     * Cổng `enabled` chặn mọi trường hợp không nên ghi:
     * - `isDirty || avatarsDirty`: chưa ai chạm vào gì thì không ghi (mở trang không
     *   phải là sửa).
     * - `isValid`: dữ liệu sai thì không ghi (server cũng sẽ từ chối).
     * - `!isSubmitting`: đang lưu tay thì không chen ngang.
     * - `!uploadingIdol && !uploadingFan`: đang tải ảnh thì `idolAvatar`/`fanAvatar`
     *   còn là URL cũ, ghi lúc này sẽ đè mất ảnh vừa tải lên.
     */
    const autoSave = useFormAutoSave({
        watch: () => ({ ...watch(), idolAvatar, fanAvatar }),
        isDirty: isDirty || avatarsDirty,
        isValid,
        save: persist,
        enabled:
            (isDirty || avatarsDirty) && isValid && !isSubmitting && !uploadingIdol && !uploadingFan,
    });

    /**
     * Hoàn tác/làm lại cho các ô chữ của form.
     *
     * `keepDefaultValues: true` để react-hook-form tính lại `isDirty` bằng cách so
     * với giá trị gốc: hoàn tác về đúng dữ liệu ban đầu thì form trở lại "sạch" và
     * tự động lưu tự dừng.
     *
     * Ảnh đại diện nằm ngoài lịch sử này (chúng là state riêng, và đã tải lên storage
     * rồi nên "hoàn tác" cũng không thu hồi được file).
     */
    const undoRedo = useUndoRedo<IdolFormData>({
        value: watch(),
        onChange: (previous) => resetFormValues(previous, { keepDefaultValues: true }),
    });

    const onSubmit = async (data: IdolFormData) => {
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
                <Star className="w-5 h-5 text-purple-500 fill-purple-500" />
                <h3 className={`text-lg font-semibold ${isDark ? "text-purple-100" : "text-gray-800"}`}>Hồ sơ Idol</h3>
            </div>

            {/* Avatars Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Idol Avatar */}
                <div className="flex flex-col items-center">
                    <label className={`block text-sm font-medium mb-3 text-center ${isDark ? "text-purple-200" : "text-gray-700"}`}>
                        Ảnh Idol
                    </label>
                    <div className="relative group">
                        <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 p-1 shadow-lg ${isDark ? "shadow-purple-900/30" : ""}`}>
                            {idolAvatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={idolAvatar}
                                    alt="Idol avatar"
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <div className={`w-full h-full rounded-full flex items-center justify-center text-2xl font-bold ${
                                    isDark ? "bg-slate-950 text-purple-400" : "bg-white text-purple-400"
                                }`}>
                                    {initialData?.idol_name?.charAt(0) || "I"}
                                </div>
                            )}
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleAvatarUpload(file, "idol", setUploadingIdol, setIdolAvatar);
                                }}
                                disabled={uploadingIdol}
                            />
                            {uploadingIdol ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <Camera className="w-6 h-6" />
                            )}
                        </label>
                    </div>
                </div>

                {/* Fan Avatar */}
                <div className="flex flex-col items-center">
                    <label className={`block text-sm font-medium mb-3 text-center ${isDark ? "text-purple-200" : "text-gray-700"}`}>
                        Ảnh Fandom
                    </label>
                    <div className="relative group">
                        <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 p-1 shadow-lg ${isDark ? "shadow-purple-900/30" : ""}`}>
                            {fanAvatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={fanAvatar}
                                    alt="Fan avatar"
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <div className={`w-full h-full rounded-full flex items-center justify-center text-2xl font-bold ${
                                    isDark ? "bg-slate-950 text-cyan-400" : "bg-white text-cyan-400"
                                }`}>
                                    {initialData?.fan_name?.charAt(0) || "F"}
                                </div>
                            )}
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleAvatarUpload(file, "fan", setUploadingFan, setFanAvatar);
                                }}
                                disabled={uploadingFan}
                            />
                            {uploadingFan ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <Camera className="w-6 h-6" />
                            )}
                        </label>
                    </div>
                </div>
            </div>

            {/* Names Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? "text-purple-200/90" : "text-gray-700"}`}>
                        Tên Idol <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register("idol_name")}
                        className={`w-full px-4 py-2 rounded-lg border outline-none transition-all ${
                            isDark 
                                ? "bg-slate-950/60 border-purple-500/30 text-white placeholder-purple-300/30 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]" 
                                : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
                        }`}
                        placeholder="Tên Idol"
                    />
                    {errors.idol_name && (
                        <p className="mt-1 text-sm text-red-500">{errors.idol_name.message}</p>
                    )}
                </div>
                <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? "text-purple-200/90" : "text-gray-700"}`}>
                        Tên Fandom <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register("fan_name")}
                        className={`w-full px-4 py-2 rounded-lg border outline-none transition-all ${
                            isDark 
                                ? "bg-slate-950/60 border-purple-500/30 text-white placeholder-purple-300/30 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]" 
                                : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
                        }`}
                        placeholder="Tên Fandom"
                    />
                    {errors.fan_name && (
                        <p className="mt-1 text-sm text-red-500">{errors.fan_name.message}</p>
                    )}
                </div>
            </div>

            {/* Debut Date */}
            <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? "text-purple-200/90" : "text-gray-700"}`}>
                    Ngày Debut
                </label>
                <input
                    {...register("debut_date")}
                    type="date"
                    style={{ colorScheme: isDark ? "dark" : "light" }}
                    className={`w-full px-4 py-2 rounded-lg border outline-none transition-all appearance-none ${
                        isDark 
                            ? "bg-slate-950/60 border-purple-500/30 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]" 
                            : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
                    }`}
                />
            </div>

            {/* Title */}
            <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? "text-purple-200/90" : "text-gray-700"}`}>
                    Tiêu đề trang
                </label>
                <input
                    {...register("title")}
                    className={`w-full px-4 py-2 rounded-lg border outline-none transition-all ${
                        isDark 
                            ? "bg-slate-950/60 border-purple-500/30 text-white placeholder-purple-300/30 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]" 
                            : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
                    }`}
                    placeholder="Fan Page Chính Thức"
                />
            </div>

            {/* Slogan */}
            <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? "text-purple-200/90" : "text-gray-700"}`}>
                    Slogan / Khẩu hiệu
                </label>
                <textarea
                    {...register("slogan")}
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border outline-none transition-all resize-none ${
                        isDark 
                            ? "bg-slate-950/60 border-purple-500/30 text-white placeholder-purple-300/30 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]" 
                            : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
                    }`}
                    placeholder="Hãy viết slogan hoặc khẩu hiệu yêu thích của bạn..."
                />
                {errors.slogan && (
                    <p className="mt-1 text-sm text-red-500">{errors.slogan.message}</p>
                )}
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
                isDark={isDark}
            />

            {/* Submit */}
            <button
                type="submit"
                disabled={isSubmitting || uploadingIdol || uploadingFan}
                className={`w-full py-3 rounded-lg text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:brightness-110 ${
                    isDark 
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-900/35" 
                        : "hover:shadow-pink-500/20"
                }`}
                style={isDark ? {} : { backgroundColor: 'var(--theme-accent, #a855f7)' }}
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
