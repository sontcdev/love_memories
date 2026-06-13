"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateLinkProfile, IdolProfileData } from "@/app/actions/profile-actions";
import { Save, Loader2, Star, Camera } from "lucide-react";

// ============================================================================
// ZOD SCHEMA
// ============================================================================

const idolProfileSchema = z.object({
    idol_name: z.string().min(1, "Required").max(50),
    fan_name: z.string().min(1, "Required").max(50),
    debut_date: z.string().optional(),
    title: z.string().max(100).optional(),
    slogan: z.string().max(200).optional(),
});

type IdolFormData = z.infer<typeof idolProfileSchema>;

// ============================================================================
// COMPONENT
// ============================================================================

interface EditIdolProfileFormProps {
    slug: string;
    initialData: IdolProfileData | null;
    isSubmitting: boolean;
    setIsSubmitting: (v: boolean) => void;
    message: { type: "success" | "error"; text: string } | null;
    setMessage: (m: { type: "success" | "error"; text: string } | null) => void;
    onSuccess?: () => void;
    isDark?: boolean;
}

export function EditIdolProfileForm({
    slug,
    initialData,
    isSubmitting,
    setIsSubmitting,
    message,
    setMessage,
    onSuccess,
    isDark = false,
}: EditIdolProfileFormProps) {
    const [idolAvatar, setIdolAvatar] = useState<string>(initialData?.idol_avatar || "");
    const [fanAvatar, setFanAvatar] = useState<string>(initialData?.fan_avatar || "");
    const [uploadingIdol, setUploadingIdol] = useState(false);
    const [uploadingFan, setUploadingFan] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<IdolFormData>({
        resolver: zodResolver(idolProfileSchema),
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

    const onSubmit = async (data: IdolFormData) => {
        setIsSubmitting(true);
        setMessage(null);

        // Include avatars in the data
        const fullData = {
            ...data,
            idol_avatar: idolAvatar,
            fan_avatar: fanAvatar,
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

            {/* Message */}
            {message && (
                <div
                    className={`p-3 rounded-lg text-sm border ${
                        message.type === "success"
                            ? isDark
                                ? "bg-green-950/40 text-green-300 border-green-800/40"
                                : "bg-green-50 text-green-700 border-green-200"
                            : isDark
                                ? "bg-red-950/40 text-red-300 border-red-800/40"
                                : "bg-red-50 text-red-700 border-red-200"
                    }`}
                >
                    {message.text}
                </div>
            )}

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
