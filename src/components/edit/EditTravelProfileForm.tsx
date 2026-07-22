"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateLinkProfile, TravelProfileData } from "@/app/actions/profile-actions";
import { Save, Loader2, Plane } from "lucide-react";

const travelProfileSchema = z.object({
    trip_name: z.string().min(1, "Bắt buộc").max(50),
    destination: z.string().max(100).optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    travelers: z.string().max(100).optional(),
});

type TravelFormData = z.infer<typeof travelProfileSchema>;

interface EditTravelProfileFormProps {
    slug: string;
    initialData: TravelProfileData | null;
    isSubmitting: boolean;
    setIsSubmitting: (v: boolean) => void;
    message: { type: "success" | "error"; text: string } | null;
    setMessage: (m: { type: "success" | "error"; text: string } | null) => void;
    onSuccess?: () => void;
}

export function EditTravelProfileForm({
    slug,
    initialData,
    isSubmitting,
    setIsSubmitting,
    message,
    setMessage,
    onSuccess,
}: EditTravelProfileFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<TravelFormData>({
        resolver: zodResolver(travelProfileSchema),
        defaultValues: {
            trip_name: initialData?.trip_name || "",
            destination: initialData?.destination || initialData?.destinations || "",
            start_date: initialData?.start_date || "",
            end_date: initialData?.end_date || "",
            travelers: initialData?.travelers || "",
        },
    });

    const onSubmit = async (data: TravelFormData) => {
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
                <Plane className="w-5 h-5 text-sky-500" />
                <h3 className="text-lg font-semibold text-gray-800">Hồ sơ chuyến đi</h3>
            </div>

            {/* Trip Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên chuyến đi <span className="text-red-500">*</span>
                </label>
                <input
                    {...register("trip_name")}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-300 focus:border-sky-400 outline-none transition-all"
                    placeholder="Hành trình đáng nhớ"
                />
                {errors.trip_name && (
                    <p className="mt-1 text-sm text-red-500">{errors.trip_name.message}</p>
                )}
            </div>

            {/* Destinations */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Điểm đến
                </label>
                <input
                    {...register("destination")}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-300 focus:border-sky-400 outline-none transition-all"
                    placeholder="Đà Lạt, Phú Quốc, Nhật Bản..."
                />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày bắt đầu
                    </label>
                    <input
                        {...register("start_date")}
                        type="date"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-300 focus:border-sky-400 outline-none transition-all bg-white appearance-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày kết thúc
                    </label>
                    <input
                        {...register("end_date")}
                        type="date"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-300 focus:border-sky-400 outline-none transition-all bg-white appearance-none"
                    />
                </div>
            </div>

            {/* Travelers */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Người đồng hành
                </label>
                <input
                    {...register("travelers")}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-300 focus:border-sky-400 outline-none transition-all"
                    placeholder="Gia đình, bạn bè, người yêu..."
                />
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
                className="w-full py-3 rounded-lg text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600"
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
