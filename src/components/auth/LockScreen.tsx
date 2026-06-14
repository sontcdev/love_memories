"use client";

import { useState, useRef, useEffect } from "react";
import { verifyLinkPassword } from "@/app/actions/auth-actions";
import { Lock, Heart, Delete, Loader2, GraduationCap, Users } from "lucide-react";
import { Link as PrismaLink, LinkConfig, Gallery, Timeline, Letter, LetterReply } from "@prisma/client";

type LetterWithReplies = Letter & { replies: LetterReply[] };
type LinkWithRelations = PrismaLink & {
    config: LinkConfig | null;
    galleries: Gallery[];
    timelines: Timeline[];
    letters: LetterWithReplies[];
};

interface LockScreenProps {
    slug: string;
    onSuccess: () => void;
    linkData: LinkWithRelations | null;
}

export function LockScreen({ slug, onSuccess, linkData }: LockScreenProps) {
    const [pin, setPin] = useState<string[]>(["", "", "", "", "", ""]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // Focus first input on mount
        inputRefs.current[0]?.focus();
    }, []);

    const handleInputChange = (index: number, value: string) => {
        if (value && !/^\d$/.test(value)) return;

        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);
        setError(null);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all digits entered
        if (value && index === 5) {
            const fullPin = newPin.join("");
            if (fullPin.length === 6) {
                handleSubmit(fullPin);
            }
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !pin[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleNumberPad = (num: string) => {
        const emptyIndex = pin.findIndex((p) => p === "");
        if (emptyIndex !== -1) {
            handleInputChange(emptyIndex, num);
        }
    };

    const handleDelete = () => {
        const lastFilledIndex = pin.map((p, i) => (p ? i : -1)).filter((i) => i !== -1).pop();
        if (lastFilledIndex !== undefined && lastFilledIndex >= 0) {
            const newPin = [...pin];
            newPin[lastFilledIndex] = "";
            setPin(newPin);
            inputRefs.current[lastFilledIndex]?.focus();
        }
    };

    const handleClear = () => {
        setPin(["", "", "", "", "", ""]);
        setError(null);
        inputRefs.current[0]?.focus();
    };

    const handleSubmit = async (pinValue?: string) => {
        const fullPin = pinValue || pin.join("");
        if (fullPin.length !== 6) {
            setError("Vui lòng nhập đủ 6 chữ số");
            return;
        }

        setIsLoading(true);
        setError(null);

        const result = await verifyLinkPassword(slug, fullPin);

        if (result.success) {
            onSuccess();
        } else {
            setError(result.error || "Mã PIN không đúng");
            setPin(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
        }

        setIsLoading(false);
    };

    // Get dynamic config based on template type
    const type = linkData?.type || "LOVE";
    const profileData = linkData?.profile_data as Record<string, string> | null;

    const getThemeConfig = () => {
        switch (type) {
            case "GRAD_PERSONAL":
                const studentName = profileData?.student_name || "Học sinh";
                return {
                    icon: <GraduationCap className="w-10 h-10 text-white" />,
                    iconBg: "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-300/50",
                    title: `Kỷ niệm tốt nghiệp`,
                    subtitle: `Nhập mã PIN để xem trang của ${studentName} nhé!`,
                    bgClass: "from-emerald-50 via-teal-50/30 to-cyan-50/50",
                    accentColor: "#10b981",
                    focusClass: "focus:border-emerald-500 focus:ring-emerald-200",
                    avatarUrl: profileData?.student_avatar,
                    footerText: "Chúc mừng ngày tốt nghiệp! 🎓"
                };
            case "GRAD_CLASS":
                const className = profileData?.class_name || "Lớp học";
                return {
                    icon: <Users className="w-10 h-10 text-white" />,
                    iconBg: "bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-300/50",
                    title: `Kỷ yếu lớp ${className}`,
                    subtitle: "Nhập mã PIN để mở cuốn lưu bút của lớp mình!",
                    bgClass: "from-cyan-50 via-blue-50/30 to-indigo-50/50",
                    accentColor: "#06b6d4",
                    focusClass: "focus:border-cyan-500 focus:ring-cyan-200",
                    avatarUrl: undefined,
                    footerText: "Tập thể lớp bên nhau mãi mãi 💙"
                };
            case "GRAD_GROUP":
                const grpName = profileData?.group_name || "Nhóm bạn";
                const grpTheme = profileData?.theme || "caravan";
                let bgCls = "from-amber-50 via-orange-50/30 to-amber-100/50";
                let accentC = "#d97706";
                let footerT = "Chuyến xe thanh xuân cùng những người bạn thân thương 🚌";
                
                if (grpTheme === "station") {
                    bgCls = "from-[#0d0d1a] via-[#111126] to-[#0d0d1a] text-slate-200";
                    accentC = "#8b5cf6";
                    footerT = "Trạm ký ức neo giữ thời niên thiếu chúng mình 🌌";
                } else if (grpTheme === "scrapbook") {
                    bgCls = "from-[#f4e8c1]/30 via-[#faf3e0]/50 to-[#d6c5b3]/30";
                    accentC = "#855430";
                    footerT = "Lật giở từng cuốn sổ tay lưu niệm tình bạn 📚";
                }

                return {
                    icon: <Users className="w-10 h-10 text-white" />,
                    iconBg: "bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-300/50",
                    title: `Trang kỷ niệm ${grpName}`,
                    subtitle: "Nhập mã PIN để cùng bước lên chuyến xe kỷ niệm!",
                    bgClass: bgCls,
                    accentColor: accentC,
                    focusClass: "focus:border-amber-500 focus:ring-amber-200",
                    avatarUrl: profileData?.group_avatar,
                    footerText: footerT
                };
            case "EVERY":
                const groupName = profileData?.group_name || "Nhóm kỷ niệm";
                return {
                    icon: <Users className="w-10 h-10 text-white" />,
                    iconBg: "bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg shadow-blue-300/50",
                    title: groupName,
                    subtitle: "Nhập mã PIN để mở khóa trang kỷ niệm của nhóm!",
                    bgClass: "from-blue-50 to-indigo-100",
                    accentColor: "#6366f1",
                    focusClass: "focus:border-indigo-500 focus:ring-indigo-200",
                    avatarUrl: undefined,
                    footerText: "Khoảnh khắc bên nhau 💕"
                };
            case "LOVE2":
                const bName = profileData?.boy_name || "Anh";
                const gName = profileData?.girl_name || "Em";
                return {
                    icon: <Heart className="w-10 h-10 text-white fill-white" />,
                    iconBg: "bg-gradient-to-br from-amber-200 via-rose-300 to-pink-400 shadow-lg shadow-rose-200/50",
                    title: "Memorae Scrapbook",
                    subtitle: `Nhập mã PIN để mở trang nhật ký của ${bName} & ${gName}!`,
                    bgClass: "from-stone-50 via-rose-50/20 to-amber-50/30",
                    accentColor: "#f43f5e",
                    focusClass: "focus:border-rose-400 focus:ring-rose-200",
                    avatarUrl: undefined,
                    footerText: "Nhật ký tình yêu ngọt ngào ✨"
                };
            case "LOVE":
            default:
                const boyName = profileData?.boy_name || "Anh";
                const girlName = profileData?.girl_name || "Em";
                return {
                    icon: <Heart className="w-10 h-10 text-white fill-white" />,
                    iconBg: "bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg shadow-rose-300/50",
                    title: "Memorae Love",
                    subtitle: `Mật mã kỷ niệm của ${boyName} & ${girlName} là gì nhỉ?`,
                    bgClass: "from-rose-50 to-pink-100",
                    accentColor: "#ec4899",
                    focusClass: "focus:border-pink-500 focus:ring-pink-200",
                    avatarUrl: undefined,
                    footerText: "Kỷ niệm của bạn được bảo vệ 💕"
                };
        }
    };

    const theme = getThemeConfig();

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 bg-gradient-to-br ${theme.bgClass}`} style={{ backgroundColor: 'var(--theme-bg)' }}>
            <div className="w-full max-w-sm relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    {theme.avatarUrl ? (
                        <div className="relative inline-block mb-4">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 p-0.5 shadow-xl mx-auto">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={theme.avatarUrl}
                                    alt="Student avatar"
                                    className="w-full h-full rounded-full object-cover"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 shadow-lg ${theme.iconBg}`}>
                            {theme.icon}
                        </div>
                    )}
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">{theme.title}</h1>
                    <p className="text-gray-500 text-sm">{theme.subtitle}</p>
                </div>

                {/* PIN Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6 text-red-600 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* PIN Input Display */}
                    <div className="flex justify-center gap-3 mb-6">
                        {pin.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="none"
                                readOnly
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleInputChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                disabled={isLoading}
                                className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 border-gray-200 outline-none transition-all bg-gray-50 disabled:opacity-50 ${theme.focusClass}`}
                            />
                        ))}
                    </div>

                    {/* Number Pad */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <button
                                key={num}
                                onClick={() => handleNumberPad(num.toString())}
                                disabled={isLoading}
                                className="h-14 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-xl font-semibold text-gray-700 transition-all disabled:opacity-50"
                            >
                                {num}
                            </button>
                        ))}
                        <button
                            onClick={handleClear}
                            disabled={isLoading}
                            className="h-14 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-sm font-medium text-gray-500 transition-all disabled:opacity-50"
                        >
                            Xóa
                        </button>
                        <button
                            onClick={() => handleNumberPad("0")}
                            disabled={isLoading}
                            className="h-14 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-xl font-semibold text-gray-700 transition-all disabled:opacity-50"
                        >
                            0
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isLoading}
                            className="h-14 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-500 transition-all disabled:opacity-50 flex items-center justify-center"
                        >
                            <Delete className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={() => handleSubmit()}
                        disabled={isLoading || pin.some((p) => !p)}
                        className="w-full py-4 rounded-xl text-white font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:brightness-110"
                        style={{ backgroundColor: theme.accentColor }}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Đang mở khóa...
                            </>
                        ) : (
                            <>
                                <Lock className="w-5 h-5" />
                                Mở khóa
                            </>
                        )}
                    </button>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-400 text-xs mt-6">
                    {theme.footerText}
                </p>
            </div>
        </div>
    );
}
