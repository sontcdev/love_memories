"use client";

// EditConfigFormV2 — bản giữ nguyên implementation mới (toast, auto-save, undo/redo…).
// EditConfigForm.tsx đã rollback về đúng phiên bản trên nhánh deploy và chỉ phục vụ
// các LinkType đã có trên deploy; file V2 này phục vụ WEDDING/TRAVEL/FRIENDSHIP.

import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LinkType } from "@prisma/client";
import { updateLinkConfig, LinkConfigData } from "@/app/actions/profile-actions";
import { Save, Loader2, Palette, Type, Music, Undo2, Redo2, ChevronDown, Sparkles } from "lucide-react";
import { GameTemplateSelector } from "./GameTemplateSelector";
import { normalizeGameTemplate, type GameVariantId } from "@/components/templates/game-registry";
import { useFormFeedback } from "./useFormFeedback";
import { useFormAutoSave, type SaveStatus } from "./useAutoSave";
import { SaveStatusIndicator } from "./SaveStatusIndicator";
import { useUndoRedo } from "./useUndoRedo";

// ============================================================================
// SCHEMA
// ============================================================================

// Thông báo lỗi bằng tiếng Việt: với `mode: "onChange"` (xem bên dưới) các lỗi này
// hiện ngay khi người dùng đang gõ — dán một link nhạc dở dang là thấy ngay — nên
// không được để lọt thông báo tiếng Anh.
const configSchema = z.object({
    background_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Mã màu không hợp lệ (ví dụ: #ffffff)").optional().or(z.literal("")),
    accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Mã màu không hợp lệ (ví dụ: #ffffff)").optional().or(z.literal("")),
    text_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Mã màu không hợp lệ (ví dụ: #ffffff)").optional().or(z.literal("")),
    font_family: z.string().optional(),
    music_url: z.string().url("Đường dẫn không hợp lệ").optional().or(z.literal("")),
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
// THEME PRESETS — bộ trọn gói (nền + nhấn + chữ + font cùng lúc)
// ============================================================================

const THEME_PRESETS: {
    name: string;
    background_color: string;
    accent_color: string;
    text_color: string;
    font_family: string;
}[] = [
    { name: "Mặc định", background_color: "#ffffff", accent_color: "#ec4899", text_color: "#1f2937", font_family: "Inter" },
    { name: "Ngọt ngào", background_color: "#fdf2f8", accent_color: "#f43f5e", text_color: "#831843", font_family: "Dancing Script" },
    { name: "Tối giản", background_color: "#1f2937", accent_color: "#6366f1", text_color: "#f9fafb", font_family: "Poppins" },
    { name: "Tươi mới", background_color: "#f0fdf4", accent_color: "#10b981", text_color: "#14532d", font_family: "Nunito" },
    { name: "Sang trọng", background_color: "#faf5ff", accent_color: "#8b5cf6", text_color: "#3b0764", font_family: "Playfair Display" },
];

// ============================================================================
// COMPONENT
// ============================================================================

interface EditConfigFormV2Props {
    slug: string;
    linkType: LinkType;
    initialConfig: LinkConfigData | null;
    onSuccess?: () => void;
}

/**
 * Hàng điều khiển đặt ngay trên nút "Lưu cài đặt": trạng thái tự động lưu +
 * hoàn tác/làm lại.
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

export function EditConfigFormV2({ slug, linkType, initialConfig, onSuccess }: EditConfigFormV2Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const setMessage = useFormFeedback();
    const [gameTemplate, setGameTemplate] = useState<GameVariantId>(
        normalizeGameTemplate(initialConfig?.game_template)
    );
    const [showAdvanced, setShowAdvanced] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset: resetFormValues,
        formState: { errors, isDirty, isValid },
    } = useForm<ConfigFormData>({
        resolver: zodResolver(configSchema),
        // `mode: "onChange"` là BẮT BUỘC, không phải tùy chọn thẩm mỹ: cổng chặn của
        // tự động lưu là `isDirty && isValid`, mà với mode mặc định ("onSubmit") thì
        // `isValid` chỉ được cập nhật sau lần submit đầu tiên — tự động lưu sẽ hoặc
        // không bao giờ chạy, hoặc chạy với dữ liệu chưa hợp lệ. Đổi mode KHÔNG ảnh
        // hưởng nút "Lưu cài đặt": `handleSubmit` vẫn validate như trước.
        mode: "onChange",
        defaultValues: {
            background_color: initialConfig?.background_color || "#ffffff",
            accent_color: initialConfig?.accent_color || "#ec4899",
            text_color: initialConfig?.text_color || "#1f2937",
            font_family: initialConfig?.font_family || "Inter",
            music_url: initialConfig?.music_url || "",
            auto_play: initialConfig?.auto_play || false,
        },
    });

    const selectedColor = watch("background_color");
    const selectedAccentColor = watch("accent_color");
    const selectedTextColor = watch("text_color");
    const selectedFont = watch("font_family");

    /**
     * Áp 1 theme preset trọn gói: nền + nhấn + chữ + font cùng lúc.
     *
     * `shouldDirty: true` trên cả 4 field — xem ghi chú ở nút chọn màu nền: thiếu
     * cờ này thì tự động lưu không thấy thay đổi.
     */
    const applyThemePreset = (preset: (typeof THEME_PRESETS)[number]) => {
        setValue("background_color", preset.background_color, { shouldDirty: true, shouldValidate: true });
        setValue("accent_color", preset.accent_color, { shouldDirty: true, shouldValidate: true });
        setValue("text_color", preset.text_color, { shouldDirty: true, shouldValidate: true });
        setValue("font_family", preset.font_family, { shouldDirty: true, shouldValidate: true });
    };

    /**
     * ĐƯỜNG DUY NHẤT ghi cài đặt xuống server.
     *
     * Cả nút "Lưu cài đặt" và tự động lưu đều đi qua đây, nên không có chỗ nào gọi
     * `updateLinkConfig` lần thứ hai — hai luồng không thể lệch nhau về payload (ví
     * dụ quên kèm `game_template`) hay về cách chuyển "" thành `undefined`.
     */
    const persist = useCallback(
        async (data: ConfigFormData) =>
            updateLinkConfig(slug, {
                background_color: data.background_color || undefined,
                accent_color: data.accent_color || undefined,
                text_color: data.text_color || undefined,
                font_family: data.font_family || undefined,
                music_url: data.music_url || undefined,
                auto_play: data.auto_play,
                game_template: gameTemplate,
            }),
        [slug, gameTemplate]
    );

    /**
     * Bộ chọn trò chơi nằm NGOÀI react-hook-form (state riêng), nên `isDirty` của
     * form không biết nó đã đổi. Nếu chỉ nghe `watch()` thì đổi trò chơi rồi rời
     * trang là mất — dù nút "Lưu cài đặt" vẫn lưu nó.
     *
     * Mốc so sánh giữ trong ref để không đổi giữa các lần render.
     */
    const initialGameTemplate = useRef(gameTemplate);
    const gameTemplateDirty = gameTemplate !== initialGameTemplate.current;

    /**
     * Tự động lưu — BỔ SUNG cho nút Lưu, không thay thế.
     *
     * Cổng `enabled` chặn mọi trường hợp không nên ghi:
     * - `isDirty || gameTemplateDirty`: chưa ai chạm vào gì thì không ghi (mở trang
     *   không phải là sửa).
     * - `isValid`: mã màu hay link nhạc còn dở dang thì không ghi.
     * - `!isSubmitting`: đang lưu tay thì không chen ngang.
     *
     * Tab cài đặt không có ô tải ảnh, nên không cần chặn theo trạng thái upload.
     */
    const autoSave = useFormAutoSave({
        watch: () => ({ ...watch(), game_template: gameTemplate }),
        isDirty: isDirty || gameTemplateDirty,
        isValid,
        save: persist,
        enabled: (isDirty || gameTemplateDirty) && isValid && !isSubmitting,
    });

    /**
     * Hoàn tác/làm lại cho các ô của form (màu, phông chữ, nhạc).
     *
     * `keepDefaultValues: true` để react-hook-form tính lại `isDirty` bằng cách so
     * với giá trị gốc: hoàn tác về đúng cài đặt ban đầu thì form trở lại "sạch".
     *
     * Lựa chọn trò chơi nằm ngoài lịch sử này — nó có UI chọn riêng, gộp vào cùng
     * một ngăn xếp undo sẽ khiến người dùng bấm "Hoàn tác" mà không hiểu vừa hoàn
     * tác cái gì.
     */
    const undoRedo = useUndoRedo<ConfigFormData>({
        value: watch(),
        onChange: (previous) => resetFormValues(previous, { keepDefaultValues: true }),
    });

    const onSubmit = async (data: ConfigFormData) => {
        setIsSubmitting(true);

        const result = await persist(data);

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
            {/* Theme Presets — set nền+nhấn+chữ+font cùng lúc */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h3 className="text-lg font-semibold text-gray-800">Bộ giao diện có sẵn</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                    {THEME_PRESETS.map((preset) => (
                        <button
                            key={preset.name}
                            type="button"
                            onClick={() => applyThemePreset(preset)}
                            className="flex items-center gap-2 rounded-xl border-2 border-gray-200 px-3 py-2 transition-all hover:border-gray-300 hover:shadow-sm"
                        >
                            <span
                                className="w-6 h-6 rounded-full border border-black/10"
                                style={{ backgroundColor: preset.background_color }}
                            />
                            <span
                                className="w-6 h-6 rounded-full border border-black/10"
                                style={{ backgroundColor: preset.accent_color }}
                            />
                            <span className="text-sm font-medium text-gray-700">{preset.name}</span>
                        </button>
                    ))}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                    Chọn nhanh 1 bộ, sau đó vẫn có thể tùy chỉnh riêng từng phần bên dưới.
                </p>
            </div>

            {/* Cơ bản: những cài đặt hay dùng nhất */}
            <div className="space-y-8">
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
                                onClick={() =>
                                    // Xem ghi chú ở ô màu nền (mục Nâng cao): thiếu
                                    // `shouldDirty` thì tự động lưu không bao giờ thấy
                                    // thay đổi này.
                                    setValue("accent_color", color, {
                                        shouldDirty: true,
                                        shouldValidate: true,
                                    })
                                }
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

                {/* Music URL */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Music className="w-5 h-5 text-pink-500" />
                        <h3 className="text-lg font-semibold text-gray-800">Nhạc nền</h3>
                    </div>

                    <input
                        {...register("music_url")}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none transition-all"
                        placeholder="https://youtube.com/watch?v=... hoặc .mp3 URL"
                    />
                    {errors.music_url && (
                        <p className="mt-1 text-sm text-red-500">{errors.music_url.message}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                        Hỗ trợ YouTube và file audio trực tiếp (.mp3). Link TikTok cần người xem
                        bấm play thủ công.
                    </p>

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

                {/* Game Template Selector */}
                <GameTemplateSelector
                    linkType={linkType}
                    value={gameTemplate}
                    onChange={setGameTemplate}
                />
            </div>

            {/* Nâng cao: đóng mặc định — màu nền, font, màu chữ */}
            <div className="border-t border-gray-200 pt-6">
                <button
                    type="button"
                    onClick={() => setShowAdvanced((v) => !v)}
                    className="flex w-full items-center justify-between text-left"
                >
                    <h3 className="text-lg font-semibold text-gray-800">Nâng cao</h3>
                    <ChevronDown
                        className={`w-5 h-5 text-gray-500 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
                    />
                </button>

                {showAdvanced && (
                    <div className="mt-6 space-y-8">
                        {/* Background Color */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Palette className="w-5 h-5 text-purple-500" />
                                <h3 className="text-lg font-semibold text-gray-800">Màu nền màn hình chờ</h3>
                            </div>

                            {/* Preset Colors */}
                            <div className="flex flex-wrap gap-3 mb-4">
                                {PRESET_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() =>
                                            // `shouldDirty` là bắt buộc: mặc định `setValue` KHÔNG
                                            // đánh dấu form là đã sửa, nên chọn màu bằng ô mẫu sẽ
                                            // không kích hoạt tự động lưu và người dùng mất màu vừa
                                            // chọn nếu rời trang.
                                            setValue("background_color", color, {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            })
                                        }
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

                        {/* Font */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Type className="w-5 h-5 text-blue-500" />
                                <h3 className="text-lg font-semibold text-gray-800">Phông chữ</h3>
                            </div>

                            <select
                                {...register("font_family")}
                                value={selectedFont}
                                onChange={(e) => setValue("font_family", e.target.value, { shouldDirty: true, shouldValidate: true })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none transition-all bg-white"
                            >
                                {FONT_OPTIONS.map((font) => (
                                    <option key={font.value} value={font.value}>
                                        {font.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Text Color */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Type className="w-5 h-5 text-gray-700" />
                                <h3 className="text-lg font-semibold text-gray-800">Màu chữ</h3>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    {...register("text_color")}
                                    className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
                                />
                                <input
                                    {...register("text_color")}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-300 focus:border-gray-400 outline-none transition-all font-mono text-sm"
                                    placeholder="#1f2937"
                                />
                            </div>
                            {errors.text_color && (
                                <p className="mt-1 text-sm text-red-500">{errors.text_color.message}</p>
                            )}
                            {selectedTextColor !== undefined && (
                                <p
                                    className="mt-2 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                    style={{ color: selectedTextColor || undefined }}
                                >
                                    Xem trước màu chữ
                                </p>
                            )}
                        </div>
                    </div>
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
            />

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
