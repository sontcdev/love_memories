"use client";

// EditMusicForm — form riêng cho tab "Nhạc nền", dùng chung cho cả 2 thế hệ
// (deploy-parity: LOVE/LOVE2/EVERY/IDOL/GRAD_*; và V2: WEDDING/TRAVEL/FRIENDSHIP).
// Chỉ gửi music_url + auto_play lên updateLinkConfig — upsert của Prisma bỏ qua
// các field không được truyền nên không đụng tới màu sắc/font đã lưu.

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateLinkConfig, LinkConfigData } from "@/app/actions/profile-actions";
import { Save, Loader2, Music } from "lucide-react";

const musicSchema = z.object({
    music_url: z.string().url("Link không hợp lệ").optional().or(z.literal("")),
    auto_play: z.boolean().optional(),
});

type MusicFormData = z.infer<typeof musicSchema>;

interface EditMusicFormProps {
    slug: string;
    initialConfig: Pick<LinkConfigData, "music_url" | "auto_play"> | null;
    onSuccess?: () => void;
    isDark?: boolean;
}

export function EditMusicForm({ slug, initialConfig, onSuccess, isDark = false }: EditMusicFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<MusicFormData>({
        resolver: zodResolver(musicSchema),
        defaultValues: {
            music_url: initialConfig?.music_url || "",
            auto_play: initialConfig?.auto_play || false,
        },
    });

    const onSubmit = async (data: MusicFormData) => {
        setIsSubmitting(true);
        setMessage(null);

        const result = await updateLinkConfig(slug, {
            music_url: data.music_url || undefined,
            auto_play: data.auto_play,
        });

        if (result.success) {
            setMessage({ type: "success", text: "Đã lưu nhạc nền!" });
            onSuccess?.();
        } else {
            setMessage({ type: "error", text: result.error || "Không thể lưu" });
        }

        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Music className="w-5 h-5 text-pink-500" />
                    <h3 className={`text-lg font-semibold ${isDark ? "text-purple-100" : "text-gray-800"}`}>Nhạc nền</h3>
                </div>

                <input
                    {...register("music_url")}
                    className={`w-full px-4 py-2 rounded-lg border outline-none transition-all ${
                        isDark
                            ? "bg-slate-950/60 border-purple-500/30 text-white placeholder-purple-300/30 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]"
                            : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                    }`}
                    placeholder="https://youtube.com/watch?v=... hoặc .mp3 URL"
                />
                {errors.music_url && (
                    <p className="mt-1 text-sm text-red-500">{errors.music_url.message}</p>
                )}
                <p className={`mt-1 text-xs ${isDark ? "text-purple-200/60" : "text-gray-500"}`}>
                    Hỗ trợ YouTube và file audio trực tiếp (.mp3). Link TikTok cần người xem
                    bấm play thủ công.
                </p>

                <label className="flex items-center gap-3 mt-4 cursor-pointer">
                    <input
                        type="checkbox"
                        {...register("auto_play")}
                        className={`w-5 h-5 rounded transition-colors ${
                            isDark
                                ? "border-purple-500/30 bg-slate-950/60 text-purple-500 focus:ring-purple-500/50"
                                : "border-gray-300 text-pink-500 focus:ring-pink-300"
                        }`}
                    />
                    <span className={`text-sm ${isDark ? "text-purple-200/80" : "text-gray-600"}`}>
                        Tự động phát nhạc khi tải trang
                    </span>
                </label>
            </div>

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

            <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-lg text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:brightness-110 ${
                    isDark
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-900/35"
                        : "hover:shadow-pink-500/20"
                }`}
                style={isDark ? {} : { backgroundColor: "var(--theme-accent, #ec4899)" }}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang lưu...
                    </>
                ) : (
                    <>
                        <Save className="w-5 h-5" />
                        Lưu nhạc nền
                    </>
                )}
            </button>
        </form>
    );
}
