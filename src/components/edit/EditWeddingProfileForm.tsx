"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateLinkProfile, WeddingProfileData } from "@/app/actions/profile-actions";
import { Save, Loader2, Gem } from "lucide-react";

const weddingProfileSchema = z.object({
    groom_name: z.string().min(1, "Bắt buộc").max(50),
    bride_name: z.string().min(1, "Bắt buộc").max(50),
    wedding_date: z.string().optional(),
    venue: z.string().max(100).optional(),
    title: z.string().max(100).optional(),
    ceremony_time: z.string().max(30).optional(),
    reception_time: z.string().max(30).optional(),
    love_story: z.string().max(500).optional(),
});

type WeddingFormData = z.infer<typeof weddingProfileSchema>;

interface EditWeddingProfileFormProps {
    slug: string;
    initialData: WeddingProfileData | null;
    isSubmitting: boolean;
    setIsSubmitting: (v: boolean) => void;
    message: { type: "success" | "error"; text: string } | null;
    setMessage: (m: { type: "success" | "error"; text: string } | null) => void;
    onSuccess?: () => void;
}

export function EditWeddingProfileForm({
    slug,
    initialData,
    isSubmitting,
    setIsSubmitting,
    message,
    setMessage,
    onSuccess,
}: EditWeddingProfileFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<WeddingFormData>({
        resolver: zodResolver(weddingProfileSchema),
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

    const onSubmit = async (data: WeddingFormData) => {
        setIsSubmitting(true);
        setMessage(null);

        const result = await updateLinkProfile(slug, data);

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
