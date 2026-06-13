"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { verifyLinkPassword } from "@/app/actions/auth-actions";
import { Star, Delete, Loader2, Lock, Sparkles, Sun, Moon } from "lucide-react";
import { Link as PrismaLink, LinkConfig, Gallery, Timeline, Letter, LetterReply } from "@prisma/client";

type LetterWithReplies = Letter & { replies: LetterReply[] };

type LinkWithRelations = PrismaLink & {
    config: LinkConfig | null;
    galleries: Gallery[];
    timelines: Timeline[];
    letters: LetterWithReplies[];
};

interface IdolLockScreenProps {
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

export function IdolLockScreen({ slug, onSuccess, linkData }: IdolLockScreenProps) {
    const [pin, setPin] = useState<string[]>(["", "", "", "", "", ""]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [particles, setParticles] = useState<Particle[]>([]);
    const [overrideDark, setOverrideDark] = useState<boolean | null>(null);

    const profileData = linkData?.profile_data as Record<string, string> | null;
    const idolName = profileData?.idol_name || "Idol";
    const idolAvatar = profileData?.idol_avatar;

    // Detect if background color is dark
    const isDarkBackground = useCallback((hex?: string | null) => {
        if (!hex) return false;
        const color = hex.replace("#", "");
        if (color.length !== 6) return false;
        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness < 120; // threshold for dark backgrounds
    }, []);

    // Read from localStorage and apply on mount
    useEffect(() => {
        const saved = localStorage.getItem(`theme_mode_${slug}`);
        if (saved) {
            const isSavedDark = saved === "dark";
            setOverrideDark(isSavedDark);
            
            const root = document.documentElement;
            if (isSavedDark) {
                root.style.setProperty("--theme-bg", "#0f0f12");
            } else {
                root.style.setProperty("--theme-bg", linkData?.config?.background_color || "#ffffff");
            }
        }
    }, [slug, linkData?.config?.background_color]);

    const isDark = overrideDark !== null ? overrideDark : isDarkBackground(linkData?.config?.background_color);

    const handleThemeToggle = () => {
        const newDark = !isDark;
        setOverrideDark(newDark);
        localStorage.setItem(`theme_mode_${slug}`, newDark ? "dark" : "light");
        
        const root = document.documentElement;
        if (newDark) {
            root.style.setProperty("--theme-bg", "#0f0f12");
        } else {
            root.style.setProperty("--theme-bg", linkData?.config?.background_color || "#ffffff");
        }
    };

    // Generate bokeh particles on mount (slightly larger and sharper)
    useEffect(() => {
        const generated = Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            size: Math.random() * 30 + 15, // 15px to 45px
            left: Math.random() * 100,
            top: Math.random() * 100,
            delay: Math.random() * 5,
            duration: Math.random() * 12 + 10, // 10s to 22s
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
            setError(result.error || "Mã PIN kết nối Fandom không đúng");
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

    // Keypad styles
    const buttonBaseClass = `h-14 rounded-2xl text-xl font-bold transition-all active:scale-95 flex items-center justify-center shadow-sm border ${
        isDark
            ? "bg-slate-950/40 hover:bg-slate-950/80 border-purple-900/30 hover:border-purple-500/30 text-purple-200 hover:text-white"
            : "bg-white/80 hover:bg-purple-50/80 border-purple-100/50 hover:border-purple-200 text-purple-800 hover:text-purple-900"
    }`;

    const specialButtonClass = `h-14 rounded-2xl text-sm font-semibold transition-all active:scale-95 flex items-center justify-center shadow-sm border ${
        isDark
            ? "bg-slate-950/30 hover:bg-slate-950/60 border-purple-950/40 text-purple-400 hover:text-purple-300"
            : "bg-purple-50/60 hover:bg-purple-100/60 border-purple-100/30 text-purple-600 hover:text-purple-700"
    }`;

    return (
        <div 
            className="min-h-screen w-full flex items-center justify-center p-4 transition-all duration-500 relative overflow-hidden"
            style={{ 
                backgroundColor: 'var(--theme-bg, #fff0f5)'
            }}
        >
            {/* Theme Toggle Button - Lock Screen */}
            <button
                onClick={handleThemeToggle}
                className={`fixed top-4 right-4 z-30 p-3 rounded-full shadow-lg transition-all hover:scale-110 ${
                    isDark 
                        ? "bg-slate-900/90 text-yellow-400 border border-purple-500/30 hover:bg-slate-800" 
                        : "bg-white/90 text-indigo-600 hover:bg-white border border-gray-100"
                }`}
                title={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
            >
                {isDark ? (
                    <Sun className="w-5 h-5" />
                ) : (
                    <Moon className="w-5 h-5" />
                )}
            </button>

            {/* Holographic Mesh Gradient Orbs (More vibrant, sharper blur) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {/* Orb 1: Purple */}
                <div className={`absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full filter blur-[70px] opacity-45 animate-blob ${
                    isDark ? "bg-purple-600/25" : "bg-purple-300/60"
                }`} />
                {/* Orb 2: Pink */}
                <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full filter blur-[70px] opacity-45 animate-blob animation-delay-2000 ${
                    isDark ? "bg-pink-500/25" : "bg-pink-300/60"
                }`} />
                {/* Orb 3: Cyan */}
                <div className={`absolute top-[25%] right-[10%] w-[50%] h-[50%] rounded-full filter blur-[70px] opacity-35 animate-blob animation-delay-4000 ${
                    isDark ? "bg-cyan-500/25" : "bg-cyan-200/50"
                }`} />
            </div>

            {/* Concert Floating Bokeh Particles (Sharper blur) */}
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
                            backgroundColor: isDark 
                                ? p.id % 3 === 0 
                                    ? 'rgba(168,85,247,0.5)' // Glowing Purple
                                    : p.id % 3 === 1 
                                        ? 'rgba(6,182,212,0.5)' // Glowing Cyan
                                        : 'rgba(236,72,153,0.5)' // Glowing Pink
                                : p.id % 3 === 0 
                                    ? 'rgba(168,85,247,0.35)' 
                                    : p.id % 3 === 1 
                                        ? 'rgba(6,182,212,0.35)' 
                                        : 'rgba(236,72,153,0.35)',
                            filter: 'blur(1.5px)',
                        }}
                    />
                ))}
            </div>

            {/* Main Content Container */}
            <div className="w-full max-w-sm relative z-10">
                {/* Header */}
                <div className="text-center mb-8 flex flex-col items-center">
                    <div className="relative mb-6">
                        {/* Glowing neon halo */}
                        {isDark ? (
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-60 blur-md animate-pulse scale-105" />
                        ) : (
                            <div className="absolute inset-0 rounded-full bg-purple-200/50 opacity-80 blur-sm animate-pulse scale-105" />
                        )}
                        
                        {/* Double Ring Superstar Badge */}
                        <div className={`relative z-10 w-24 h-24 rounded-full p-1 shadow-xl flex items-center justify-center transition-all ${
                            isDark 
                                ? "bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-400 shadow-[0_0_20px_rgba(168,85,247,0.5)]" 
                                : "bg-gradient-to-br from-purple-400 via-pink-400 to-pink-500 shadow-[0_4px_15px_rgba(168,85,247,0.25)]"
                        }`}>
                            {idolAvatar ? (
                                <Image
                                    src={idolAvatar}
                                    alt={idolName}
                                    width={96}
                                    height={96}
                                    className="w-full h-full rounded-full object-cover border border-white/20"
                                />
                            ) : (
                                <div className={`w-full h-full rounded-full flex items-center justify-center ${
                                    isDark ? "bg-slate-950 text-purple-400" : "bg-white text-purple-500"
                                }`}>
                                    <Star className="w-10 h-10 fill-current animate-float" />
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <h1 className={`text-2xl font-bold tracking-wide ${isDark ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]" : "text-gray-800"}`}>
                        {idolName} Portal
                    </h1>
                    <p className={`text-sm mt-1 max-w-xs ${isDark ? "text-purple-200/80" : "text-gray-500"}`}>
                        Nhập mật mã PIN Fandom để kết nối cùng {idolName}
                    </p>
                </div>

                {/* PIN Card */}
                <div className={`rounded-3xl p-6 shadow-2xl border transition-all ${
                    isDark 
                        ? "bg-slate-900/80 border-purple-500/20 backdrop-blur-xl shadow-[0_0_25px_rgba(168,85,247,0.15)]" 
                        : "bg-white/80 backdrop-blur-xl border-white/50"
                }`}>
                    {/* Error Message */}
                    {error && (
                        <div className={`border rounded-xl p-3 mb-6 text-sm text-center font-medium ${
                            isDark 
                                ? "bg-red-950/40 border-red-900/50 text-red-400 animate-shake" 
                                : "bg-red-50 border-red-200 text-red-600 animate-shake"
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
                                        ? isDark 
                                            ? "border-cyan-400 bg-slate-950/80 shadow-[0_0_10px_rgba(6,182,212,0.4)]" 
                                            : "border-purple-400 bg-purple-50/50 shadow-[0_0_10px_rgba(168,85,247,0.15)]"
                                        : isDark 
                                            ? "border-purple-900/40 bg-slate-950/30" 
                                            : "border-gray-200 bg-gray-50/50"
                                }`}
                            >
                                {digit ? (
                                    <Star className={`w-5 h-5 fill-current ${isDark ? "text-cyan-400" : "text-purple-500"}`} />
                                ) : (
                                    <div className={`w-2 h-2 rounded-full ${isDark ? "bg-purple-900/60" : "bg-gray-300"}`} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Number Pad */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <button
                                key={num}
                                onClick={() => handleNumberPad(num.toString())}
                                disabled={isLoading}
                                className={buttonBaseClass}
                            >
                                {num}
                            </button>
                        ))}
                        <button
                            onClick={handleClear}
                            disabled={isLoading}
                            className={specialButtonClass}
                        >
                            Xóa
                        </button>
                        <button
                            onClick={() => handleNumberPad("0")}
                            disabled={isLoading}
                            className={buttonBaseClass}
                        >
                            0
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isLoading}
                            className={specialButtonClass}
                        >
                            <Delete className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={() => handleSubmit()}
                        disabled={isLoading || pin.some((p) => !p)}
                        className={`w-full py-4 rounded-2xl font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:brightness-110 ${
                            isDark 
                                ? "bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)]" 
                                : "text-white shadow-[0_4px_15px_rgba(168,85,247,0.2)]"
                        }`}
                        style={isDark ? {} : { backgroundColor: 'var(--theme-accent, #a855f7)' }}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Đang mở khóa...
                            </>
                        ) : (
                            <>
                                <Lock className="w-5 h-5" />
                                Mở khóa Fandom
                            </>
                        )}
                    </button>
                </div>

                {/* Footer */}
                <p className={`text-center text-xs mt-6 flex items-center justify-center gap-1 ${isDark ? "text-purple-300/60" : "text-gray-400"}`}>
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    Không gian kỷ niệm được bảo mật
                </p>
            </div>
            
            {/* Embedded styles for animations */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
                .animate-shake {
                    animation: shake 0.2s ease-in-out 2;
                }
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(25px, -35px) scale(1.08); }
                    66% { transform: translate(-15px, 15px) scale(0.95); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 12s infinite alternate ease-in-out;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
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
                    animation: drift 15s infinite linear;
                }
            `}</style>
        </div>
    );
}
