"use client";

import { useState, useEffect, useCallback } from "react";
import { verifyLinkPassword } from "@/app/actions/auth-actions";
import { 
    Lock, 
    Heart, 
    Delete, 
    Loader2, 
    GraduationCap, 
    Users, 
    Compass, 
    Camera, 
    Ticket, 
    Sparkles, 
    Star,
    Sun,
    Moon
} from "lucide-react";
import type { Link as PrismaLink, LinkConfig, Gallery, Timeline, Letter, LetterReply } from "@prisma/client";

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

interface Particle {
    id: number;
    size: number;
    left: number;
    top: number;
    delay: number;
    duration: number;
}

export function LockScreen({ slug, onSuccess, linkData }: LockScreenProps) {
    const [pin, setPin] = useState<string[]>(["", "", "", "", "", ""]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [particles, setParticles] = useState<Particle[]>([]);
    const [overrideDark, setOverrideDark] = useState<boolean | null>(null);

    const isDarkBackground = useCallback((hex?: string | null) => {
        if (!hex) return false;
        const color = hex.replace("#", "");
        if (color.length !== 6) return false;
        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness < 120;
    }, []);

    // Read from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(`theme_mode_${slug}`);
        if (saved) {
            setOverrideDark(saved === "dark");
        }
    }, [slug]);

    const isDark = overrideDark !== null ? overrideDark : isDarkBackground(linkData?.config?.background_color);

    const handleThemeToggle = () => {
        const newDark = !isDark;
        setOverrideDark(newDark);
        localStorage.setItem(`theme_mode_${slug}`, newDark ? "dark" : "light");
        window.dispatchEvent(new CustomEvent("theme-change", { detail: { isDark: newDark } }));
    };

    // Generate drift background particles on mount
    useEffect(() => {
        // Clear welcome overlay shown state so it is forced to show when unlocked
        if (typeof window !== "undefined" && window.sessionStorage) {
            sessionStorage.removeItem("welcome_shown");
        }

        const generated = Array.from({ length: 12 }).map((_, i) => ({
            id: i,
            size: Math.random() * 25 + 10, // 10px to 35px
            left: Math.random() * 100,
            top: Math.random() * 100,
            delay: Math.random() * 5,
            duration: Math.random() * 10 + 10, // 10s to 20s
        }));
        setParticles(generated);
    }, []);

    const handleSubmit = useCallback(async (pinValue?: string) => {
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
        }

        setIsLoading(false);
    }, [slug, onSuccess, pin]);

    const handleNumberPad = useCallback((num: string) => {
        setPin((prev) => {
            const emptyIndex = prev.findIndex((p) => p === "");
            if (emptyIndex === -1) return prev;
            
            const newPin = [...prev];
            newPin[emptyIndex] = num;
            
            // Auto-submit when the last digit is entered
            if (emptyIndex === 5) {
                const fullPin = newPin.join("");
                setTimeout(() => handleSubmit(fullPin), 50);
            }
            
            return newPin;
        });
        setError(null);
    }, [handleSubmit]);

    const handleDelete = useCallback(() => {
        setPin((prev) => {
            const lastFilledIndex = prev.map((p, i) => (p ? i : -1)).filter((i) => i !== -1).pop();
            if (lastFilledIndex === undefined || lastFilledIndex < 0) return prev;
            
            const newPin = [...prev];
            newPin[lastFilledIndex] = "";
            return newPin;
        });
        setError(null);
    }, []);

    const handleClear = useCallback(() => {
        setPin(["", "", "", "", "", ""]);
        setError(null);
    }, []);

    // Global keyboard listener for desktop convenience
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (isLoading) return;
            
            if (/^\d$/.test(e.key)) {
                e.preventDefault();
                handleNumberPad(e.key);
            } else if (e.key === "Backspace") {
                e.preventDefault();
                handleDelete();
            } else if (e.key === "Delete" || e.key === "Escape") {
                e.preventDefault();
                handleClear();
            } else if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
            }
        };
        
        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    }, [isLoading, handleNumberPad, handleDelete, handleClear, handleSubmit]);

    // Get dynamic config based on template type
    const type = linkData?.type || "LOVE";
    const profileData = linkData?.profile_data as Record<string, string> | null;
    const subTheme = type === "GRAD_GROUP" ? (profileData?.theme || "caravan") : "";

    const getThemeConfig = () => {
        switch (type) {
            case "GRAD_PERSONAL": {
                const studentName = profileData?.student_name || "Học sinh";
                return {
                    icon: <GraduationCap className="w-10 h-10 text-white" />,
                    iconBg: "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-300/50",
                    title: `Kỷ niệm tốt nghiệp`,
                    subtitle: `Nhập mã PIN để xem trang của ${studentName} nhé!`,
                    bgClass: "from-emerald-950 via-teal-950/80 to-[#030e0b] bg-[radial-gradient(rgba(16,185,129,0.06)_1.5px,transparent_1.5px)] [background-size:28px_28px] text-white",
                    accentColor: "#10b981",
                    cardClass: "bg-[#0c241d]/85 backdrop-blur-xl border border-emerald-500/20 shadow-[0_0_35px_rgba(16,185,129,0.15)]",
                    inputClass: "border-emerald-800/40 bg-[#051510] text-emerald-100",
                    activeInputClass: "border-amber-400 bg-[#051510] shadow-[0_0_10px_rgba(245,158,11,0.25)]",
                    btnClass: "bg-[#071d16] hover:bg-[#0b2f24] border border-emerald-700/30 text-emerald-200 active:scale-95 shadow-md",
                    specialBtnClass: "bg-[#051510]/50 hover:bg-[#071d16]/80 border border-emerald-900/30 text-emerald-400 active:scale-95",
                    dotIcon: <div className="w-2.5 h-2.5 rounded-full bg-emerald-900/60" />,
                    activeDotIcon: <GraduationCap className="w-5 h-5 text-amber-400 animate-pulse" />,
                    particleType: "emerald",
                    avatarUrl: profileData?.student_avatar,
                    footerText: "Chúc mừng ngày tốt nghiệp! 🎓"
                };
            }
            case "GRAD_CLASS": {
                const className = profileData?.class_name || "Lớp học";
                return {
                    icon: <Users className="w-10 h-10 text-white" />,
                    iconBg: "bg-gradient-to-br from-[#12261e] to-slate-800 border border-white/20 shadow-lg",
                    title: `Kỷ yếu lớp ${className}`,
                    subtitle: "Nhập mã PIN để mở cuốn lưu bút của lớp mình!",
                    bgClass: "from-[#0f1512] to-[#12261e] text-white blackboard-texture",
                    accentColor: "#1a2d24",
                    cardClass: "bg-[#1a2d24]/90 backdrop-blur-xl border-2 border-dashed border-slate-700 shadow-2xl",
                    inputClass: "border-slate-700 bg-[#101b15]",
                    activeInputClass: "border-white bg-[#101b15] shadow-[0_0_10px_rgba(255,255,255,0.15)]",
                    btnClass: "bg-[#101b15]/60 hover:bg-[#101b15] border border-dashed border-slate-600 text-slate-200 active:scale-95 shadow-sm chalk-text",
                    specialBtnClass: "bg-[#101b15]/30 hover:bg-[#101b15]/50 border border-dashed border-slate-700 text-slate-400 active:scale-95",
                    dotIcon: <div className="w-2 h-2 rounded-full bg-slate-600" />,
                    activeDotIcon: <Star className="w-5 h-5 text-yellow-200 fill-yellow-200" />,
                    particleType: "dust",
                    avatarUrl: undefined,
                    footerText: "Tập thể lớp bên nhau mãi mãi 💙"
                };
            }
            case "GRAD_GROUP": {
                const grpName = profileData?.group_name || "Nhóm bạn";
                
                if (subTheme === "station") {
                    return {
                        icon: <Users className="w-10 h-10 text-white" />,
                        iconBg: "bg-gradient-to-br from-violet-600 to-indigo-700 shadow-lg shadow-violet-500/20",
                        title: `Trang kỷ niệm ${grpName}`,
                        subtitle: "Nhập mã PIN để cùng bước lên chuyến xe kỷ niệm!",
                        bgClass: "from-[#05060b] via-[#111126] to-[#05060b] bg-[radial-gradient(rgba(139,92,246,0.06)_1.5px,transparent_1.5px)] [background-size:28px_28px] text-violet-100",
                        accentColor: "#7c3aed",
                        cardClass: "bg-[#111126]/95 backdrop-blur-xl border border-violet-500/20 shadow-[0_0_25px_rgba(139,92,246,0.15)]",
                        inputClass: "border-violet-950/40 bg-[#05060b]",
                        activeInputClass: "border-violet-400 bg-[#05060b] shadow-[0_0_10px_rgba(139,92,246,0.25)]",
                        btnClass: "bg-[#05060b]/60 hover:bg-[#111126] border border-violet-900/30 text-violet-200 active:scale-95 shadow-sm",
                        specialBtnClass: "bg-[#05060b]/30 hover:bg-[#05060b]/55 border border-violet-950/30 text-violet-400/80 active:scale-95",
                        dotIcon: <div className="w-2 h-2 rounded-full bg-violet-900/60" />,
                        activeDotIcon: <Ticket className="w-5 h-5 text-violet-400 rotate-12" />,
                        particleType: "violet",
                        avatarUrl: profileData?.group_avatar,
                        footerText: "Trạm ký ức neo giữ thời niên thiếu chúng mình 🌌"
                    };
                } else if (subTheme === "scrapbook") {
                    return {
                        icon: <Users className="w-10 h-10 text-white" />,
                        iconBg: "bg-gradient-to-br from-[#855430] to-[#b5a68d] shadow-lg shadow-[#855430]/20",
                        title: `Trang kỷ niệm ${grpName}`,
                        subtitle: "Nhập mã PIN để cùng bước lên chuyến xe kỷ niệm!",
                        bgClass: "from-[#ece0cc] via-[#f5ecd8] to-[#ece0cc] bg-[radial-gradient(#c8bba3_1.5px,transparent_1.5px)] [background-size:24px_24px] text-[#4a3525]",
                        accentColor: "#855430",
                        cardClass: "bg-[#fcfaf2]/95 border border-[#dacdbf] shadow-2xl",
                        inputClass: "border-[#dacdbf] bg-[#fdfbf7]",
                        activeInputClass: "border-[#855430] bg-[#fdfbf7] shadow-[0_0_10px_rgba(133,84,48,0.15)]",
                        btnClass: "bg-[#ece0cc]/50 hover:bg-[#ebdccb]/80 border border-[#dacdbf]/45 text-[#855430] active:scale-95 shadow-sm",
                        specialBtnClass: "bg-[#ece0cc]/20 hover:bg-[#ece0cc]/40 border border-[#dacdbf]/20 text-[#855430]/75 active:scale-95",
                        dotIcon: <div className="w-2 h-2 rounded-full bg-[#dacdbf]" />,
                        activeDotIcon: <Camera className="w-4 h-4 text-[#855430]" />,
                        particleType: "kraft",
                        avatarUrl: profileData?.group_avatar,
                        footerText: "Lật giở từng cuốn sổ tay lưu niệm tình bạn 📚"
                    };
                } else {
                    // caravan (default)
                    return {
                        icon: <Users className="w-10 h-10 text-white" />,
                        iconBg: "bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20",
                        title: `Trang kỷ niệm ${grpName}`,
                        subtitle: "Nhập mã PIN để cùng bước lên chuyến xe kỷ niệm!",
                        bgClass: "from-[#1c0f07] via-[#2d1b10] to-[#1c0f07] bg-[radial-gradient(rgba(217,119,6,0.06)_1.5px,transparent_1.5px)] [background-size:28px_28px] text-amber-100",
                        accentColor: "#d97706",
                        cardClass: "bg-[#2d1b10]/95 backdrop-blur-xl border border-amber-600/20 shadow-2xl",
                        inputClass: "border-amber-800/40 bg-[#1c0f07]",
                        activeInputClass: "border-amber-400 bg-[#1c0f07] shadow-[0_0_10px_rgba(217,119,6,0.25)]",
                        btnClass: "bg-[#1c0f07]/80 hover:bg-[#2d1b10] border border-amber-700/20 text-amber-200 active:scale-95 shadow-sm",
                        specialBtnClass: "bg-[#1c0f07]/40 hover:bg-[#1c0f07]/75 border border-amber-900/30 text-amber-400 active:scale-95",
                        dotIcon: <div className="w-2.5 h-2.5 rounded-full bg-amber-900/60" />,
                        activeDotIcon: <Compass className="w-5 h-5 text-amber-400 fill-amber-400/20" />,
                        particleType: "amber",
                        avatarUrl: profileData?.group_avatar,
                        footerText: "Chuyến xe thanh xuân cùng những người bạn thân thương 🚌"
                    };
                }
            }
            case "LOVE2": {
                const bName = profileData?.boy_name || "Anh";
                const gName = profileData?.girl_name || "Em";
                if (isDark) {
                    return {
                        icon: <Heart className="w-10 h-10 text-white fill-white" />,
                        iconBg: "bg-gradient-to-br from-rose-600 to-pink-700 shadow-lg shadow-rose-900/30",
                        title: "Memorae Scrapbook",
                        subtitle: `Nhập mã PIN để mở trang nhật ký của ${bName} & ${gName}!`,
                        bgClass: "from-[#1a1816] via-[#282420] to-[#1a1816] bg-[radial-gradient(#3e3229_1.5px,transparent_1.5px)] [background-size:24px_24px] text-[#e2d5c8]",
                        accentColor: "#f43f5e",
                        cardClass: "bg-[#282420]/95 border border-rose-900/30 shadow-2xl",
                        inputClass: "border-rose-900/40 bg-[#1a1816]",
                        activeInputClass: "border-rose-400 bg-[#1a1816] shadow-[0_0_10px_rgba(244,63,94,0.25)]",
                        btnClass: "bg-[#1a1816]/80 hover:bg-[#332e28] border border-rose-900/30 text-rose-200 active:scale-95 shadow-sm",
                        specialBtnClass: "bg-[#1a1816]/40 hover:bg-[#1a1816]/75 border border-rose-950/30 text-rose-400 active:scale-95",
                        dotIcon: <div className="w-2.5 h-2.5 rounded-full bg-rose-900/60" />,
                        activeDotIcon: <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />,
                        particleType: "kraft",
                        avatarUrl: undefined,
                        footerText: "Nhật ký tình yêu ngọt ngào ✨"
                    };
                }
                return {
                    icon: <Heart className="w-10 h-10 text-white fill-white" />,
                    iconBg: "bg-gradient-to-br from-[#855430] via-rose-400 to-[#855430]/70 shadow-lg shadow-rose-200/30",
                    title: "Memorae Scrapbook",
                    subtitle: `Nhập mã PIN để mở trang nhật ký của ${bName} & ${gName}!`,
                    bgClass: "from-stone-100 via-amber-50/20 to-stone-200/50 bg-[#f5ecd8] bg-[radial-gradient(#c8bba3_1.5px,transparent_1.5px)] [background-size:24px_24px] text-[#5c3a21]",
                    accentColor: "#f43f5e",
                    cardClass: "bg-[#fcfaf2]/90 border border-[#ebdccb] shadow-2xl",
                    inputClass: "border-[#ebdccb] bg-[#fcf9f2]",
                    activeInputClass: "border-[#855430] bg-[#fcf9f2] shadow-[0_0_10px_rgba(133,84,48,0.15)]",
                    btnClass: "bg-[#f5ecd8]/60 hover:bg-[#ebdccb]/80 border border-[#e3d7bf]/30 text-[#855430] active:scale-95 shadow-sm",
                    specialBtnClass: "bg-[#f5ecd8]/30 hover:bg-[#ebdccb]/50 border border-[#e3d7bf]/20 text-[#855430]/75 active:scale-95",
                    dotIcon: <div className="w-2.5 h-2.5 rounded-full bg-[#ebdccb]" />,
                    activeDotIcon: <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />,
                    particleType: "kraft",
                    avatarUrl: undefined,
                    footerText: "Nhật ký tình yêu ngọt ngào ✨"
                };
            }
            case "EVERY": {
                const groupName = profileData?.group_name || "Nhóm kỷ niệm";
                if (isDark) {
                    return {
                        icon: <Users className="w-10 h-10 text-white" />,
                        iconBg: "bg-gradient-to-br from-indigo-600 to-purple-700 border border-indigo-500/30 shadow-lg",
                        title: groupName,
                        subtitle: "Nhập mã PIN để mở khóa trang kỷ niệm của nhóm!",
                        bgClass: "from-[#0f0f1a] via-[#1a1a2e] to-[#0f0f1a] text-slate-200",
                        accentColor: "#818cf8",
                        cardClass: "bg-[#1a1a2e]/85 backdrop-blur-2xl border border-indigo-500/20 shadow-2xl",
                        inputClass: "border-indigo-800/40 bg-[#0f0f1a]",
                        activeInputClass: "border-indigo-400 bg-[#0f0f1a] shadow-[0_0_10px_rgba(99,102,241,0.25)]",
                        btnClass: "bg-[#0f0f1a]/60 hover:bg-[#1a1a2e] border border-indigo-800/30 text-indigo-200 active:scale-95 shadow-sm",
                        specialBtnClass: "bg-[#0f0f1a]/30 hover:bg-[#0f0f1a]/55 border border-indigo-950/30 text-indigo-400 active:scale-95",
                        dotIcon: <div className="w-2 h-2 rounded-full bg-indigo-800/60" />,
                        activeDotIcon: <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />,
                        particleType: "soap",
                        avatarUrl: undefined,
                        footerText: "Khoảnh khắc bên nhau 💕"
                    };
                }
                return {
                    icon: <Users className="w-10 h-10 text-indigo-600" />,
                    iconBg: "bg-white border border-indigo-100 shadow-lg",
                    title: groupName,
                    subtitle: "Nhập mã PIN để mở khóa trang kỷ niệm của nhóm!",
                    bgClass: "from-indigo-100 via-pink-100 to-sky-100 text-indigo-950",
                    accentColor: "#6366f1",
                    cardClass: "bg-white/35 backdrop-blur-2xl border border-white/40 shadow-2xl",
                    inputClass: "border-white/40 bg-white/20",
                    activeInputClass: "border-indigo-400 bg-white/35 shadow-[0_0_10px_rgba(99,102,241,0.15)]",
                    btnClass: "bg-white/25 hover:bg-white/45 border border-white/30 text-indigo-950 active:scale-95 shadow-sm",
                    specialBtnClass: "bg-white/15 hover:bg-white/30 border border-white/20 text-indigo-700/80 active:scale-95",
                    dotIcon: <div className="w-2 h-2 rounded-full bg-indigo-200" />,
                    activeDotIcon: <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />,
                    particleType: "soap",
                    avatarUrl: undefined,
                    footerText: "Khoảnh khắc bên nhau 💕"
                };
            }
            case "LOVE":
            default: {
                const boyName = profileData?.boy_name || "Anh";
                const girlName = profileData?.girl_name || "Em";
                return {
                    icon: <Heart className="w-10 h-10 text-white fill-white" />,
                    iconBg: "bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg shadow-rose-300/50",
                    title: "Memorae Love",
                    subtitle: `Mật mã kỷ niệm của ${boyName} & ${girlName} là gì nhỉ?`,
                    bgClass: "from-rose-50 to-pink-100 text-gray-800",
                    accentColor: "#ec4899",
                    cardClass: "bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl",
                    inputClass: "border-gray-200 bg-gray-50",
                    activeInputClass: "border-pink-500 bg-gray-50 shadow-[0_0_10px_rgba(236,72,153,0.15)]",
                    btnClass: "bg-gray-100 hover:bg-gray-200 text-gray-700 active:scale-95 shadow-sm",
                    specialBtnClass: "bg-gray-100 hover:bg-gray-200 text-gray-500 active:scale-95",
                    dotIcon: <div className="w-2 h-2 rounded-full bg-gray-300" />,
                    activeDotIcon: <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />,
                    particleType: "love",
                    avatarUrl: undefined,
                    footerText: "Kỷ niệm của bạn được bảo vệ 💕"
                };
            }
        }
    };

    const theme = getThemeConfig();

    const getParticleColor = (pId: number) => {
        switch (theme.particleType) {
            case "emerald":
                return pId % 2 === 0 ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.25)";
            case "dust":
                return "rgba(255,255,255,0.15)";
            case "amber":
                return pId % 2 === 0 ? "rgba(217,119,6,0.3)" : "rgba(239,68,68,0.25)";
            case "kraft":
                return pId % 2 === 0 ? "rgba(133,84,48,0.2)" : "rgba(245,236,216,0.4)";
            case "violet":
                return pId % 2 === 0 ? "rgba(139,92,246,0.3)" : "rgba(6,182,212,0.25)";
            case "soap":
                return "rgba(147,197,253,0.2)";
            case "love":
            default:
                return pId % 2 === 0 ? "rgba(244,63,94,0.25)" : "rgba(236,72,153,0.2)";
        }
    };

    return (
        <div className={`min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br ${theme.bgClass} relative overflow-hidden transition-all duration-500`}>
            {/* Dynamic floating background particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {particles.map((p) => (
                    <div
                        key={p.id}
                        className="absolute rounded-full opacity-0 animate-drift"
                        style={{
                            width: `${p.size}px`,
                            height: `${p.size}px`,
                            left: `${p.left}%`,
                            top: `${p.top}%`,
                            animationDelay: `${p.delay}s`,
                            animationDuration: `${p.duration}s`,
                            backgroundColor: getParticleColor(p.id),
                            filter: theme.particleType === "soap" 
                                ? "blur(0.5px) border border-white/20" 
                                : "blur(1.5px)",
                            boxShadow: theme.particleType === "violet" 
                                ? "0 0 10px rgba(139,92,246,0.4)" 
                                : theme.particleType === "amber" 
                                ? "0 0 10px rgba(217,119,6,0.4)"
                                : "none"
                        }}
                    />
                ))}
            </div>

            {/* Theme Toggle */}
            {(type === "LOVE2" || type === "EVERY") && (
                <div className="absolute top-4 right-4 z-20">
                    <button
                        onClick={handleThemeToggle}
                        className={`p-2.5 rounded-full shadow-lg transition-all hover:scale-110 border ${
                            isDark 
                                ? "bg-[#282420]/95 text-yellow-400 border-rose-950/30 hover:bg-[#332e28]" 
                                : "bg-white/95 text-rose-500 border-rose-100/30 hover:bg-white"
                        }`}
                        title={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
                    >
                        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                </div>
            )}

            <div className="w-full max-w-sm relative z-10">
                {/* Header */}
                <div className="text-center mb-8 flex flex-col items-center">
                    {theme.avatarUrl ? (
                        <div className="relative inline-block mb-4">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 p-0.5 shadow-xl mx-auto animate-pulse-slow">
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
                    <h1 className="text-2xl font-bold mb-2">{theme.title}</h1>
                    <p className="opacity-80 text-sm max-w-xs px-2">{theme.subtitle}</p>
                </div>

                {/* PIN Card */}
                <div className={`rounded-3xl p-6 shadow-2xl border transition-all duration-300 ${theme.cardClass}`}>
                    {/* Error Message */}
                    {error && (
                        <div className={`border rounded-xl p-3 mb-6 text-sm text-center font-medium animate-shake ${
                            type === "LOVE" || type === "EVERY"
                                ? "bg-red-50 border-red-200 text-red-600"
                                : "bg-red-950/40 border-red-900/50 text-red-400"
                        }`}>
                            {error}
                        </div>
                    )}

                    {/* PIN Input Display */}
                    <div className="flex justify-center gap-3 mb-6">
                        {pin.map((digit, index) => (
                            <div
                                key={index}
                                className={`w-12 h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${
                                    digit 
                                        ? theme.activeInputClass 
                                        : theme.inputClass
                                }`}
                            >
                                {digit ? (
                                    theme.activeDotIcon
                                ) : (
                                    theme.dotIcon
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Number Keypad */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <button
                                key={num}
                                onClick={() => handleNumberPad(num.toString())}
                                disabled={isLoading}
                                className={`h-14 text-xl font-bold transition-all flex items-center justify-center ${theme.btnClass}`}
                            >
                                {num}
                            </button>
                        ))}
                        <button
                            onClick={handleClear}
                            disabled={isLoading}
                            className={`h-14 text-sm font-semibold transition-all flex items-center justify-center ${theme.specialBtnClass}`}
                        >
                            Xóa
                        </button>
                        <button
                            onClick={() => handleNumberPad("0")}
                            disabled={isLoading}
                            className={`h-14 text-xl font-bold transition-all flex items-center justify-center ${theme.btnClass}`}
                        >
                            0
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isLoading}
                            className={`h-14 transition-all flex items-center justify-center ${theme.specialBtnClass}`}
                        >
                            <Delete className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={() => handleSubmit()}
                        disabled={isLoading || pin.some((p) => !p)}
                        className="w-full py-4 rounded-2xl text-white font-bold shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                <p className="text-center opacity-60 text-xs mt-6">
                    {theme.footerText}
                </p>
            </div>

            {/* Embedded styles for animations */}
            <style jsx>{`
                @keyframes drift {
                    0% {
                        transform: translateY(120px) translateX(0) scale(0.8);
                        opacity: 0;
                    }
                    15% {
                        opacity: 0.75;
                    }
                    85% {
                        opacity: 0.75;
                    }
                    100% {
                        transform: translateY(-120px) translateX(40px) scale(1.3);
                        opacity: 0;
                    }
                }
                .animate-drift {
                    animation: drift 14s infinite linear;
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
                .animate-shake {
                    animation: shake 0.2s ease-in-out 2;
                }
                .animate-pulse-slow {
                    animation: pulseSlow 3s ease-in-out infinite;
                }
                @keyframes pulseSlow {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.9; transform: scale(1.04); }
                }
                .blackboard-texture {
                    background-size: 20px 20px;
                    background-image: radial-gradient(rgba(255, 255, 255, 0.012) 1px, transparent 1px);
                    background-color: #101b15;
                }
                .chalk-text {
                    text-shadow: 0 0 3px rgba(255,255,255,0.4);
                }
            `}</style>
        </div>
    );
}
