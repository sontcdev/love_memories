"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateLinkConfig, LinkConfigData } from "@/app/actions/profile-actions";
import { Save, Loader2, Palette, Music, Type } from "lucide-react";

// ============================================================================
// SCHEMA
// ============================================================================

const configSchema = z.object({
    background_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional().or(z.literal("")),
    accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional().or(z.literal("")),
    font_family: z.string().optional(),
    music_url: z.string().url("Invalid URL").optional().or(z.literal("")),
    auto_play: z.boolean().optional(),
});

type ConfigFormData = z.infer<typeof configSchema>;

// ============================================================================
// FONT OPTIONS
// ============================================================================

const FONT_OPTIONS = [
    { value: "Inter", label: "Inter (Mặc định)" },
    { value: "Roboto", label: "Roboto (Thanh lịch)" },
    { value: "Poppins", label: "Poppins (Hiện đại)" },
    { value: "Playfair Display", label: "Playfair Display (Có chân)" },
    { value: "Dancing Script", label: "Dancing Script (Viết tay bay bổng)" },
    { value: "Quicksand", label: "Quicksand (Bo tròn dễ thương)" },
    { value: "Nunito", label: "Nunito (Trẻ trung)" },
    { value: "Pacifico", label: "Pacifico (Script nghệ thuật)" },
    { value: "Montserrat", label: "Montserrat (Mạnh mẽ)" },
    { value: "Comfortaa", label: "Comfortaa (Bo tròn mập)" },
    { value: "Caveat", label: "Caveat (Viết tay phóng khoáng)" },
];

// ============================================================================
// PRESET COLORS
// ============================================================================

const PRESET_COLORS = [
    "#ffffff", // White
    "#fef2f2", // Rose 50
    "#fdf2f8", // Pink 50
    "#faf5ff", // Purple 50
    "#eff6ff", // Blue 50
    "#f0fdf4", // Green 50
    "#fffbeb", // Amber 50
    "#1f2937", // Gray 800
];

const ACCENT_COLORS = [
    "#ec4899", // Pink 500
    "#f43f5e", // Rose 500
    "#8b5cf6", // Violet 500
    "#3b82f6", // Blue 500
    "#10b981", // Emerald 500
    "#f59e0b", // Amber 500
    "#ef4444", // Red 500
    "#6366f1", // Indigo 500
];

// ============================================================================
// COMPONENT
// ============================================================================

interface EditConfigFormProps {
    slug: string;
    initialConfig: LinkConfigData | null;
    onSuccess?: () => void;
}

export function EditConfigForm({ slug, initialConfig, onSuccess }: EditConfigFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<ConfigFormData>({
        resolver: zodResolver(configSchema),
        defaultValues: {
            background_color: initialConfig?.background_color || "#ffffff",
            accent_color: initialConfig?.accent_color || "#ec4899",
            font_family: initialConfig?.font_family || "Inter",
            music_url: initialConfig?.music_url || "",
            auto_play: initialConfig?.auto_play || false,
        },
    });

    const selectedColor = watch("background_color");
    const selectedAccentColor = watch("accent_color");

    const onSubmit = async (data: ConfigFormData) => {
        setIsSubmitting(true);
        setMessage(null);

        const result = await updateLinkConfig(slug, {
            background_color: data.background_color || undefined,
            accent_color: data.accent_color || undefined,
            font_family: data.font_family || undefined,
            music_url: data.music_url || undefined,
            auto_play: data.auto_play,
        });

        if (result.success) {
            setMessage({ type: "success", text: "Đã lưu cài đặt!" });
            onSuccess?.();
        } else {
            setMessage({ type: "error", text: result.error || "Không thể lưu" });
        }

        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Background Color */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Palette className="w-5 h-5 text-purple-500" />
                    <h3 className="text-lg font-semibold text-gray-800">Màu nền</h3>
                </div>

                {/* Preset Colors */}
                <div className="flex flex-wrap gap-3 mb-4">
                    {PRESET_COLORS.map((color) => (
                        <button
                            key={color}
                            type="button"
                            onClick={() => setValue("background_color", color)}
                            className={`w-10 h-10 rounded-xl border-2 transition-all ${selectedColor === color
                                ? "border-purple-500 ring-2 ring-purple-200 scale-110"
                                : "border-gray-200 hover:border-gray-300"
                                }`}
                            style={{ backgroundColor: color }}
                            title={color}
                        />
                    ))}
                </div>

                {/* Custom Color Input */}
                <div className="flex items-center gap-3">
                    <input
                        type="color"
                        {...register("background_color")}
                        className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <input
                        {...register("background_color")}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-300 focus:border-purple-400 outline-none transition-all font-mono text-sm"
                        placeholder="#ffffff"
                    />
                </div>
                {errors.background_color && (
                    <p className="mt-1 text-sm text-red-500">{errors.background_color.message}</p>
                )}
            </div>

            {/* Accent Color */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Palette className="w-5 h-5 text-pink-500" />
                    <h3 className="text-lg font-semibold text-gray-800">Màu nhấn (Button)</h3>
                </div>

                {/* Preset Accent Colors */}
                <div className="flex flex-wrap gap-3 mb-4">
                    {ACCENT_COLORS.map((color) => (
                        <button
                            key={color}
                            type="button"
                            onClick={() => setValue("accent_color", color)}
                            className={`w-10 h-10 rounded-xl border-2 transition-all ${selectedAccentColor === color
                                ? "border-gray-800 ring-2 ring-gray-300 scale-110"
                                : "border-gray-200 hover:border-gray-300"
                                }`}
                            style={{ backgroundColor: color }}
                            title={color}
                        />
                    ))}
                </div>

                {/* Custom Accent Color Input */}
                <div className="flex items-center gap-3">
                    <input
                        type="color"
                        {...register("accent_color")}
                        className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <input
                        {...register("accent_color")}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none transition-all font-mono text-sm"
                        placeholder="#ec4899"
                    />
                </div>
                {errors.accent_color && (
                    <p className="mt-1 text-sm text-red-500">{errors.accent_color.message}</p>
                )}
            </div>
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Type className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-800">Phông chữ</h3>
                </div>

                <select
                    {...register("font_family")}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none transition-all bg-white"
                >
                    {FONT_OPTIONS.map((font) => (
                        <option key={font.value} value={font.value}>
                            {font.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Music URL */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Music className="w-5 h-5 text-pink-500" />
                    <h3 className="text-lg font-semibold text-gray-800">Nhạc nền</h3>
                </div>

                <input
                    {...register("music_url")}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none transition-all"
                    placeholder="https://example.com/music.mp3"
                />
                {errors.music_url && (
                    <p className="mt-1 text-sm text-red-500">{errors.music_url.message}</p>
                )}

                {/* Auto-play Toggle */}
                <label className="flex items-center gap-3 mt-4 cursor-pointer">
                    <input
                        type="checkbox"
                        {...register("auto_play")}
                        className="w-5 h-5 rounded border-gray-300 text-pink-500 focus:ring-pink-300"
                    />
                    <span className="text-sm text-gray-600">
                        Tự động phát nhạc khi tải trang
                    </span>
                </label>
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
                        Lưu cài đặt
                    </>
                )}
            </button>
        </form>
    );
}
