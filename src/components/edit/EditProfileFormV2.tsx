"use client";

// EditProfileFormV2 — bản giữ nguyên implementation mới (toast, auto-save, undo/redo…).
// EditProfileForm.tsx đã rollback về đúng phiên bản trên nhánh deploy và chỉ phục vụ
// các LinkType đã có trên deploy; file V2 này phục vụ WEDDING/TRAVEL/FRIENDSHIP.

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LinkType } from "@prisma/client";
import { updateLinkProfile, LoveProfileData, IdolProfileData, WeddingProfileData, TravelProfileData, FriendshipProfileData, EveryProfileData, BabyProfileData } from "@/app/actions/profile-actions";
import { Save, Loader2, Heart, Camera, LayoutGrid, Undo2, Redo2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useFormFeedback } from "./useFormFeedback";
import { useFormAutoSave, type SaveStatus } from "./useAutoSave";
import { SaveStatusIndicator } from "./SaveStatusIndicator";
import { useUndoRedo } from "./useUndoRedo";
import { SloganField } from "./SloganField";

// A page is exactly one LinkType, so only one of these can ever render. Loading
// all six was the single biggest contributor to the /[slug]/edit bundle.
const EditIdolProfileForm = dynamic(() =>
    import("./EditIdolProfileFormV2").then((m) => m.EditIdolProfileFormV2)
);
const EditGradProfileForm = dynamic(() =>
    import("./EditGradProfileFormV2").then((m) => m.EditGradProfileFormV2)
);
const EditGradGroupProfileForm = dynamic(() =>
    import("./EditGradGroupProfileFormV2").then((m) => m.EditGradGroupProfileFormV2)
);
const EditWeddingProfileForm = dynamic(() =>
    import("./EditWeddingProfileForm").then((m) => m.EditWeddingProfileForm)
);
const EditTravelProfileForm = dynamic(() =>
    import("./EditTravelProfileForm").then((m) => m.EditTravelProfileForm)
);
const EditFriendshipProfileForm = dynamic(() =>
    import("./EditFriendshipProfileForm").then((m) => m.EditFriendshipProfileForm)
);
const EditBabyProfileForm = dynamic(() =>
    import("./EditBabyProfileForm").then((m) => m.EditBabyProfileForm)
);


// ============================================================================
// ZOD SCHEMAS
// ============================================================================

const loveProfileSchema = z.object({
    // Thông báo bằng tiếng Việt: với `mode: "onChange"` (xem bên dưới) người dùng
    // nhìn thấy các lỗi này ngay khi đang gõ, không còn chỉ khi bấm Lưu.
    boy_name: z.string().min(1, "Bắt buộc").max(50),
    girl_name: z.string().min(1, "Bắt buộc").max(50),
    anniversary_date: z.string().optional(),
    title: z.string().max(100).optional(),
    short_note: z.string().max(200).optional(),
    slogan: z.string().max(120, "Tối đa 120 ký tự").optional(),
});

type LoveFormData = z.infer<typeof loveProfileSchema>;

const everyProfileSchema = z.object({
    group_name: z.string().min(1, "Bắt buộc").max(50),
    owner_name: z.string().max(50).optional(),
    title: z.string().max(100).optional(),
    short_note: z.string().max(200).optional(),
    slogan: z.string().max(120, "Tối đa 120 ký tự").optional(),
});

type EveryFormData = z.infer<typeof everyProfileSchema>;


// ============================================================================
// COMPONENT
// ============================================================================

interface EditProfileFormV2Props {
    slug: string;
    linkType: LinkType;
    initialData: Record<string, unknown> | null;
    isDark?: boolean;
    onSuccess?: () => void;
}

export function EditProfileFormV2({ slug, linkType, initialData, isDark = false, onSuccess }: EditProfileFormV2Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Render based on link type
    if (linkType === "LOVE" || linkType === "LOVE2") {
        return (
            <LoveProfileForm
                slug={slug}
                initialData={initialData as LoveProfileData}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
                onSuccess={onSuccess}
            />
        );
    }

    if (linkType === "EVERY") {
        return (
            <EveryProfileForm
                slug={slug}
                initialData={initialData as EveryProfileData}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
                onSuccess={onSuccess}
            />
        );
    }

    if (linkType === "IDOL") {
        return (
            <EditIdolProfileForm
                slug={slug}
                initialData={initialData as IdolProfileData}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
                onSuccess={onSuccess}
                isDark={isDark}
            />
        );
    }

    if (linkType === "GRAD_PERSONAL" || linkType === "GRAD_CLASS") {
        return (
            <EditGradProfileForm
                slug={slug}
                linkType={linkType}
                initialData={initialData}
                isDark={isDark}
                onSuccess={onSuccess}
            />
        );
    }

    if (linkType === "GRAD_GROUP") {
        return (
            <EditGradGroupProfileForm
                slug={slug}
                initialData={initialData}
                isDark={isDark}
                onSuccess={onSuccess}
            />
        );
    }

    if (linkType === "WEDDING") {
        return (
            <EditWeddingProfileForm
                slug={slug}
                initialData={initialData as WeddingProfileData}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
                onSuccess={onSuccess}
            />
        );
    }

    if (linkType === "TRAVEL") {
        return (
            <EditTravelProfileForm
                slug={slug}
                initialData={initialData as TravelProfileData}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
                onSuccess={onSuccess}
            />
        );
    }

    if (linkType === "FRIENDSHIP") {
        return (
            <EditFriendshipProfileForm
                slug={slug}
                initialData={initialData as FriendshipProfileData}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
                onSuccess={onSuccess}
            />
        );
    }

    if (linkType === "BABY") {
        return (
            <EditBabyProfileForm
                slug={slug}
                initialData={initialData as BabyProfileData}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
                onSuccess={onSuccess}
            />
        );
    }

    return null;
}

// ============================================================================
// LOVE PROFILE FORM
// ============================================================================

interface FormProps<T> {
    slug: string;
    initialData: T | null;
    isSubmitting: boolean;
    setIsSubmitting: (v: boolean) => void;
    onSuccess?: () => void;
}

// ============================================================================
// THANH TRẠNG THÁI LƯU + HOÀN TÁC
// ============================================================================

/**
 * Hàng điều khiển đặt ngay trên nút "Lưu thay đổi".
 *
 * Gom chung vào một component vì cả hồ sơ LOVE và EVERY đều cần y hệt nhau, và
 * vì hai thứ này chỉ có nghĩa khi ở cạnh nhau: người dùng nhìn thấy "đã lưu tự
 * động" thì lập tức cần biết mình vẫn hoàn tác được.
 *
 * Hai nút đều là `type="button"` — nếu để mặc định, bấm hoàn tác sẽ submit form.
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
            <SaveStatusIndicator
                status={status}
                lastSavedAt={lastSavedAt}
                error={error}
                onRetry={onRetry}
            />
            <div className="ml-auto flex items-center gap-2">
                <button
                    type="button"
                    onClick={onUndo}
                    disabled={!canUndo}
                    className={buttonClass}
                    title="Hoàn tác (Ctrl+Z)"
                >
                    <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Hoàn tác
                </button>
                <button
                    type="button"
                    onClick={onRedo}
                    disabled={!canRedo}
                    className={buttonClass}
                    title="Làm lại (Ctrl+Shift+Z)"
                >
                    <Redo2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Làm lại
                </button>
            </div>
        </div>
    );
}

function LoveProfileForm({
    slug,
    initialData,
    isSubmitting,
    setIsSubmitting,
    onSuccess,
}: FormProps<LoveProfileData>) {
    const setMessage = useFormFeedback();
    const [boyAvatar, setBoyAvatar] = useState<string>(initialData?.boy_avatar || "");
    const [girlAvatar, setGirlAvatar] = useState<string>(initialData?.girl_avatar || "");
    const [uploadingBoy, setUploadingBoy] = useState(false);
    const [uploadingGirl, setUploadingGirl] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        reset: resetFormValues,
        formState: { errors, isDirty, isValid },
    } = useForm<LoveFormData>({
        resolver: zodResolver(loveProfileSchema),
        // `mode: "onChange"` là BẮT BUỘC ở đây, không phải tùy chọn thẩm mỹ:
        // cổng chặn của tự động lưu là `isDirty && isValid`, mà với mode mặc định
        // ("onSubmit") thì `isValid` chỉ được cập nhật sau lần submit đầu tiên —
        // tự động lưu sẽ hoặc không bao giờ chạy, hoặc chạy với dữ liệu chưa hợp lệ.
        // Đổi mode KHÔNG ảnh hưởng nút "Lưu thay đổi": `handleSubmit` vẫn validate
        // như trước, chỉ khác là lỗi hiện sớm hơn.
        mode: "onChange",
        defaultValues: {
            boy_name: initialData?.boy_name || "",
            girl_name: initialData?.girl_name || "",
            anniversary_date: initialData?.anniversary_date || "",
            title: initialData?.title || "",
            short_note: initialData?.short_note || "",
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
        type: "boy" | "girl" | "background",
        setUploading: (v: boolean) => void,
        setAvatar: (v: string) => void
    ) => {
        setUploading(true);
        try {
            // Compress image - larger size and dimension for background images
            const targetSize = type === "background" ? 100 : 50;
            const maxDimension = type === "background" ? 1920 : 300;
            const compressedFile = await compressImage(file, targetSize, maxDimension);
            console.log(`Image compressed: ${(file.size / 1024).toFixed(1)}KB → ${(compressedFile.size / 1024).toFixed(1)}KB`);

            const formData = new FormData();
            formData.append("file", compressedFile);
            formData.append("slug", slug);
            formData.append("type", type === "background" ? "background" : `${type}_avatar`);

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
     * Cả nút "Lưu thay đổi" và tự động lưu đều đi qua đây, nên không có chỗ nào
     * gọi `updateLinkProfile` lần thứ hai — hai luồng không thể lệch nhau về
     * payload (ví dụ quên kèm avatar) hay về cách xử lý lỗi.
     */
    const persist = useCallback(
        async (data: LoveFormData) => {
            return updateLinkProfile(slug, {
                ...data,
                boy_avatar: boyAvatar,
                girl_avatar: girlAvatar,
            });
        },
        [slug, boyAvatar, girlAvatar]
    );

    /**
     * Tự động lưu — BỔ SUNG cho nút Lưu, không thay thế.
     *
     * Cổng `enabled` chặn mọi trường hợp không nên ghi:
     * - `isDirty`: form chưa ai chạm vào thì không ghi (mở trang không phải là sửa).
     * - `isValid`: dữ liệu sai thì không ghi (server cũng sẽ từ chối).
     * - `!isSubmitting`: đang lưu tay thì không chen ngang.
     * - `!uploadingBoy && !uploadingGirl`: đang tải ảnh thì `boyAvatar`/`girlAvatar`
     *   còn là URL cũ, ghi lúc này sẽ đè mất ảnh vừa tải lên.
     */
    const autoSave = useFormAutoSave<LoveFormData>({
        watch,
        isDirty,
        isValid,
        save: persist,
        enabled: isDirty && isValid && !isSubmitting && !uploadingBoy && !uploadingGirl,
    });

    /**
     * Hoàn tác/làm lại cho các ô chữ của form.
     *
     * `keepDefaultValues: true` để react-hook-form tính lại `isDirty` bằng cách so
     * với giá trị gốc: hoàn tác về đúng dữ liệu ban đầu thì form trở lại "sạch" và
     * tự động lưu tự dừng — đúng như mong đợi.
     *
     * Ảnh đại diện nằm ngoài lịch sử này (chúng là state riêng, và đã được tải lên
     * storage rồi nên "hoàn tác" cũng không thu hồi được file).
     */
    const undoRedo = useUndoRedo<LoveFormData>({
        value: watch(),
        onChange: (previous) => resetFormValues(previous, { keepDefaultValues: true }),
    });

    const onSubmit = async (data: LoveFormData) => {
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
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <h3 className="text-lg font-semibold text-gray-800">Hồ sơ tình yêu</h3>
            </div>

            {/* Avatars Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* His Avatar */}
                <div className="flex flex-col items-center">
                    <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                        Ảnh của anh
                    </label>
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-300 to-pink-400 p-1 shadow-lg">
                            {boyAvatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={boyAvatar}
                                    alt="His avatar"
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-2xl font-bold text-rose-400">
                                    {initialData?.boy_name?.charAt(0) || "H"}
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
                                    if (file) handleAvatarUpload(file, "boy", setUploadingBoy, setBoyAvatar);
                                }}
                                disabled={uploadingBoy}
                            />
                            {uploadingBoy ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <Camera className="w-6 h-6" />
                            )}
                        </label>
                    </div>
                </div>

                {/* Her Avatar */}
                <div className="flex flex-col items-center">
                    <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                        Ảnh của em
                    </label>
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-300 to-purple-400 p-1 shadow-lg">
                            {girlAvatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={girlAvatar}
                                    alt="Her avatar"
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-2xl font-bold text-pink-400">
                                    {initialData?.girl_name?.charAt(0) || "S"}
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
                                    if (file) handleAvatarUpload(file, "girl", setUploadingGirl, setGirlAvatar);
                                }}
                                disabled={uploadingGirl}
                            />
                            {uploadingGirl ? (
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên anh <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register("boy_name")}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-300 focus:border-rose-400 outline-none transition-all"
                        placeholder="Tên của anh"
                    />
                    {errors.boy_name && (
                        <p className="mt-1 text-sm text-red-500">{errors.boy_name.message}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên em <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register("girl_name")}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-300 focus:border-rose-400 outline-none transition-all"
                        placeholder="Tên của em"
                    />
                    {errors.girl_name && (
                        <p className="mt-1 text-sm text-red-500">{errors.girl_name.message}</p>
                    )}
                </div>
            </div>

            {/* Anniversary Date */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày kỷ niệm
                </label>
                <input
                    {...register("anniversary_date")}
                    type="date"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-300 focus:border-rose-400 outline-none transition-all bg-white appearance-none"
                />
            </div>

            {/* Title */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiêu đề trang
                </label>
                <input
                    {...register("title")}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-300 focus:border-rose-400 outline-none transition-all"
                    placeholder="Câu Chuyện Tình Yêu"
                />
            </div>

            {/* Short Note */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú ngắn
                </label>
                <textarea
                    {...register("short_note")}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-300 focus:border-rose-400 outline-none transition-all resize-none"
                    placeholder="Lời nhắn ngọt ngào cho trang của bạn..."
                />
                {errors.short_note && (
                    <p className="mt-1 text-sm text-red-500">{errors.short_note.message}</p>
                )}
            </div>

            <SloganField
                registerProps={register("slogan")}
                error={errors.slogan?.message}
                focusRingClassName="focus:ring-rose-300 focus:border-rose-400"
            />

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
                disabled={isSubmitting || uploadingBoy || uploadingGirl}
                className="w-full py-3 rounded-lg text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:brightness-110"
                style={{ backgroundColor: 'var(--theme-accent, #ec4899)' }}
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

function EveryProfileForm({
    slug,
    initialData,
    isSubmitting,
    setIsSubmitting,
    onSuccess,
}: FormProps<EveryProfileData>) {
    const setMessage = useFormFeedback();
    const {
        register,
        handleSubmit,
        watch,
        reset: resetFormValues,
        formState: { errors, isDirty, isValid },
    } = useForm<EveryFormData>({
        resolver: zodResolver(everyProfileSchema),
        // Xem giải thích ở LoveProfileForm: cổng của tự động lưu dựa vào `isValid`,
        // giá trị này chỉ đáng tin với mode "onChange".
        mode: "onChange",
        defaultValues: {
            group_name: initialData?.group_name || "",
            owner_name: initialData?.owner_name || "",
            title: initialData?.title || "",
            short_note: initialData?.short_note || "",
            slogan: initialData?.slogan || "",
        },
    });

    /** Đường duy nhất ghi hồ sơ — dùng chung cho nút Lưu và tự động lưu. */
    const persist = useCallback(
        async (data: EveryFormData) => updateLinkProfile(slug, data),
        [slug]
    );

    const autoSave = useFormAutoSave<EveryFormData>({
        watch,
        isDirty,
        isValid,
        save: persist,
        enabled: isDirty && isValid && !isSubmitting,
    });

    const undoRedo = useUndoRedo<EveryFormData>({
        value: watch(),
        onChange: (previous) => resetFormValues(previous, { keepDefaultValues: true }),
    });

    const onSubmit = async (data: EveryFormData) => {
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
            <div className="mb-4 flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-teal-500" />
                <h3 className="text-lg font-semibold text-gray-800">Hồ sơ kỷ niệm chung</h3>
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Tên nhóm / sự kiện <span className="text-red-500">*</span>
                </label>
                <input
                    {...register("group_name")}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-300"
                    placeholder="Our Memories"
                />
                {errors.group_name && <p className="mt-1 text-sm text-red-500">{errors.group_name.message}</p>}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Người tạo / đại diện</label>
                <input
                    {...register("owner_name")}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-300"
                    placeholder="Tên người tạo trang"
                />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tiêu đề trang</label>
                <input
                    {...register("title")}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-300"
                    placeholder="Không gian kỷ niệm"
                />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Mô tả ngắn</label>
                <textarea
                    {...register("short_note")}
                    rows={3}
                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2 outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-300"
                    placeholder="Trang này lưu lại điều gì?"
                />
                {errors.short_note && <p className="mt-1 text-sm text-red-500">{errors.short_note.message}</p>}
            </div>

            <SloganField
                registerProps={register("slogan")}
                error={errors.slogan?.message}
                focusRingClassName="focus:ring-teal-300 focus:border-teal-400"
            />

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
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-500 py-3 font-semibold text-white shadow-md transition-all hover:bg-teal-600 disabled:opacity-50"
            >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
        </form>
    );
}
