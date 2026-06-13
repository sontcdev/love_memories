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
    { value: "Inter", label: "Inter (Default)" },
    { value: "Roboto", label: "Roboto" },
    { value: "Poppins", label: "Poppins" },
    { value: "Playfair Display", label: "Playfair Display (Serif)" },
    { value: "Dancing Script", label: "Dancing Script (Cursive)" },
    { value: "Quicksand", label: "Quicksand" },
    { value: "Nunito", label: "Nunito" },
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

// Idol-Specific Accent Colors
const IDOL_ACCENT_COLORS = [
    { name: "Black/Pink", value: "#ec4899" }, // Pink 500 (BLACKPINK style)
    { name: "Purple", value: "#a855f7" },     // Purple 500
    { name: "Neon Green", value: "#22c55e" }, // Green 500
    { name: "Sky Blue", value: "#0ea5e9" },   // Sky 500
];



// ============================================================================
// COMPONENT
// ============================================================================

interface EditIdolConfigFormProps {
    slug: string;
    initialConfig: LinkConfigData | null;
    onSuccess?: () => void;
    isDark?: boolean;
}

export function EditIdolConfigForm({ slug, initialConfig, onSuccess, isDark = false }: EditIdolConfigFormProps) {
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
            accent_color: initialConfig?.accent_color || "#a855f7",
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
                    <h3 className={`text-lg font-semibold ${isDark ? "text-purple-100" : "text-gray-800"}`}>Màu nền</h3>
                </div>

                {/* Preset Colors */}
                <div className="flex flex-wrap gap-3 mb-4">
                    {PRESET_COLORS.map((color) => (
                        <button
                            key={color}
                            type="button"
                            onClick={() => setValue("background_color", color)}
                            className={`w-10 h-10 rounded-xl border-2 transition-all ${selectedColor === color
                                ? isDark
                                    ? "border-purple-400 ring-2 ring-purple-500/50 scale-110 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                                    : "border-purple-500 ring-2 ring-purple-200 scale-110"
                                : isDark
                                    ? "border-purple-950/40 hover:border-purple-500/30"
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
                        className={`w-12 h-10 rounded-lg cursor-pointer border ${isDark ? "border-purple-500/30 bg-slate-900" : "border-gray-300 bg-white"}`}
                    />
                    <input
                        {...register("background_color")}
                        className={`flex-1 px-4 py-2 rounded-lg border outline-none transition-all font-mono text-sm ${
                            isDark 
                                ? "bg-slate-950/60 border-purple-500/30 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]" 
                                : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
                        }`}
                        placeholder="#ffffff"
                    />
                </div>
                {errors.background_color && (
                    <p className="mt-1 text-sm text-red-500">{errors.background_color.message}</p>
                )}
            </div>

            {/* Accent Color - Idol Themed */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Palette className="w-5 h-5 text-pink-500" />
                    <h3 className={`text-lg font-semibold ${isDark ? "text-purple-100" : "text-gray-800"}`}>Màu nhấn (Button)</h3>
                </div>

                {/* Idol-Specific Preset Accent Colors */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {IDOL_ACCENT_COLORS.map((color) => (
                        <button
                            key={color.value}
                            type="button"
                            onClick={() => setValue("accent_color", color.value)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${selectedAccentColor === color.value
                                ? isDark
                                    ? "border-purple-400 bg-purple-950/30 ring-2 ring-purple-500/50 scale-105 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                                    : "border-gray-800 ring-2 ring-gray-300 scale-105"
                                : isDark
                                    ? "border-purple-950/50 bg-slate-900/50 hover:border-purple-500/20 hover:bg-slate-900"
                                    : "border-gray-200 hover:border-gray-300 bg-white"
                                }`}
                        >
                            <div
                                className="w-6 h-6 rounded-full"
                                style={{ backgroundColor: color.value }}
                            />
                            <span className={`text-sm font-medium ${isDark ? "text-purple-200" : "text-gray-700"}`}>{color.name}</span>
                        </button>
                    ))}
                </div>

                {/* Custom Accent Color Input */}
                <div className="flex items-center gap-3">
                    <input
                        type="color"
                        {...register("accent_color")}
                        className={`w-12 h-10 rounded-lg cursor-pointer border ${isDark ? "border-purple-500/30 bg-slate-900" : "border-gray-300 bg-white"}`}
                    />
                    <input
                        {...register("accent_color")}
                        className={`flex-1 px-4 py-2 rounded-lg border outline-none transition-all font-mono text-sm ${
                            isDark 
                                ? "bg-slate-950/60 border-purple-500/30 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]" 
                                : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                        }`}
                        placeholder="#a855f7"
                    />
                </div>
                {errors.accent_color && (
                    <p className="mt-1 text-sm text-red-500">{errors.accent_color.message}</p>
                )}
            </div>

            {/* Font Family */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Type className="w-5 h-5 text-blue-500" />
                    <h3 className={`text-lg font-semibold ${isDark ? "text-purple-100" : "text-gray-800"}`}>Phông chữ</h3>
                </div>

                <select
                    {...register("font_family")}
                    className={`w-full px-4 py-2 rounded-lg border outline-none transition-all bg-white ${
                        isDark 
                            ? "bg-slate-950/80 border-purple-500/30 text-purple-100 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400" 
                            : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                    }`}
                >
                    {FONT_OPTIONS.map((font) => (
                        <option 
                            key={font.value} 
                            value={font.value}
                            className={isDark ? "bg-slate-950 text-white" : "bg-white text-gray-900"}
                        >
                            {font.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Music URL */}
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
                    placeholder="https://youtube.com/... hoặc .mp3 URL"
                />
                {errors.music_url && (
                    <p className="mt-1 text-sm text-red-500">{errors.music_url.message}</p>
                )}

                {/* Auto-play Toggle */}
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
                disabled={isSubmitting}
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
                        Lưu cài đặt
                    </>
                )}
            </button>
        </form>
    );
}
