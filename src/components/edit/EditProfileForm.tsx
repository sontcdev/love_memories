"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LinkType } from "@prisma/client";
import { updateLinkProfile, LoveProfileData, IdolProfileData } from "@/app/actions/profile-actions";
import { Save, Loader2, Heart, Camera } from "lucide-react";
import { EditIdolProfileForm } from "./EditIdolProfileForm";
import { EditGradProfileForm } from "./EditGradProfileForm";
import { EditGradGroupProfileForm } from "./EditGradGroupProfileForm";


// ============================================================================
// ZOD SCHEMAS
// ============================================================================

const loveProfileSchema = z.object({
    boy_name: z.string().min(1, "Required").max(50),
    girl_name: z.string().min(1, "Required").max(50),
    anniversary_date: z.string().optional(),
    title: z.string().max(100).optional(),
    short_note: z.string().max(200).optional(),
});

type LoveFormData = z.infer<typeof loveProfileSchema>;



// ============================================================================
// COMPONENT
// ============================================================================

interface EditProfileFormProps {
    slug: string;
    linkType: LinkType;
    initialData: Record<string, unknown> | null;
    isDark?: boolean;
    onSuccess?: () => void;
}

export function EditProfileForm({ slug, linkType, initialData, isDark = false, onSuccess }: EditProfileFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Render based on link type
    if (linkType === "LOVE" || linkType === "LOVE2") {
        return (
            <LoveProfileForm
                slug={slug}
                initialData={initialData as LoveProfileData}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
                message={message}
                setMessage={setMessage}
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
                message={message}
                setMessage={setMessage}
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
    message: { type: "success" | "error"; text: string } | null;
    setMessage: (m: { type: "success" | "error"; text: string } | null) => void;
    onSuccess?: () => void;
}

function LoveProfileForm({
    slug,
    initialData,
    isSubmitting,
    setIsSubmitting,
    message,
    setMessage,
    onSuccess,
}: FormProps<LoveProfileData>) {
    const [boyAvatar, setBoyAvatar] = useState<string>(initialData?.boy_avatar || "");
    const [girlAvatar, setGirlAvatar] = useState<string>(initialData?.girl_avatar || "");
    const [uploadingBoy, setUploadingBoy] = useState(false);
    const [uploadingGirl, setUploadingGirl] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoveFormData>({
        resolver: zodResolver(loveProfileSchema),
        defaultValues: {
            boy_name: initialData?.boy_name || "",
            girl_name: initialData?.girl_name || "",
            anniversary_date: initialData?.anniversary_date || "",
            title: initialData?.title || "",
            short_note: initialData?.short_note || "",
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

    const onSubmit = async (data: LoveFormData) => {
        setIsSubmitting(true);
        setMessage(null);

        // Include avatars in the data
        const fullData = {
            ...data,
            boy_avatar: boyAvatar,
            girl_avatar: girlAvatar,
        };

        const result = await updateLinkProfile(slug, fullData);

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

            {/* Message */}
            {message && (
                <div
                    className={`p-3 rounded-lg text-sm ${message.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                >
                    {message.text}
                </div>
            )}

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
