"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateLinkProfile, FriendshipProfileData } from "@/app/actions/profile-actions";
import { Save, Loader2, Smile } from "lucide-react";

const friendshipProfileSchema = z.object({
    group_name: z.string().min(1, "Bắt buộc").max(50),
    motto: z.string().max(100).optional(),
    since_date: z.string().optional(),
});

type FriendshipFormData = z.infer<typeof friendshipProfileSchema>;

interface EditFriendshipProfileFormProps {
    slug: string;
    initialData: FriendshipProfileData | null;
    isSubmitting: boolean;
    setIsSubmitting: (v: boolean) => void;
    message: { type: "success" | "error"; text: string } | null;
    setMessage: (m: { type: "success" | "error"; text: string } | null) => void;
    onSuccess?: () => void;
}

export function EditFriendshipProfileForm({
    slug,
    initialData,
    isSubmitting,
    setIsSubmitting,
    message,
    setMessage,
    onSuccess,
}: EditFriendshipProfileFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FriendshipFormData>({
        resolver: zodResolver(friendshipProfileSchema),
        defaultValues: {
            group_name: initialData?.group_name || "",
            motto: initialData?.motto || "",
            since_date: initialData?.since_date || "",
        },
    });

    const onSubmit = async (data: FriendshipFormData) => {
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
