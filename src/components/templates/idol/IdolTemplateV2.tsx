"use client";

// IdolTemplateV2 — bản giữ nguyên implementation mới (UX roadmap) của IdolTemplate.
// IdolTemplate.tsx đã được rollback về đúng phiên bản trên nhánh deploy, nên mọi
// tính năng mới (game variant, night mode, hiệu ứng mới) sống ở file V2 này.

import { useState, useEffect, useCallback, useRef, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Link as PrismaLink, LinkConfig, Gallery, Timeline, Letter, LetterReply } from "@prisma/client";
import { Star, Calendar, Image as ImageIcon, Mail, ChevronLeft, ChevronRight, Settings, Sparkles, X, Mic, Trophy, Disc, Zap } from "lucide-react";
import { IdolLetterBox } from "./IdolLetterBox";
import { IdolGameSection } from "./IdolGameSection";
import { TemplateVariantGame } from "@/components/templates/TemplateVariantGame";
import { normalizeGameTemplate } from "@/components/templates/game-registry";
import { VideoPlayer } from "@/components/media";
import { ThemeToggleButton } from "@/components/theme/ThemeToggleButton";
import { useThemeToggle } from "@/components/theme/useThemeToggle";
import { buildTemplateTokens } from "@/components/theme/template-tokens";

type LetterWithReplies = Letter & { replies: LetterReply[] };

type LinkWithRelations = PrismaLink & {
    config: LinkConfig | null;
    galleries: Gallery[];
    timelines: Timeline[];
    letters: LetterWithReplies[];
};

interface IdolTemplateV2Props {
    data: LinkWithRelations;
    slug: string;
}

type StageAct = "intro" | "gallery" | "timeline" | "game" | "letters";

export function IdolTemplateV2({ data, slug }: IdolTemplateV2Props) {
    const [currentAct, setCurrentAct] = useState<StageAct>("intro");
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const profileData = data.profile_data as Record<string, string> | null;
    const gameTemplateId = normalizeGameTemplate(data.config?.game_template ?? null);
    const [heartsCount, setHeartsCount] = useState(0);
    const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number }[]>([]);
    const stageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const saved = localStorage.getItem(`hearts_count_${slug}`);
        if (saved) {
            setHeartsCount(parseInt(saved, 10));
        } else {
            const startVal = Math.floor(Math.random() * 500) + 1200;
            setHeartsCount(startVal);
            localStorage.setItem(`hearts_count_${slug}`, startVal.toString());
        }
    }, [slug]);

    const handleSendHeart = (e: React.MouseEvent<HTMLButtonElement>) => {
        const newCount = heartsCount + 1;
        setHeartsCount(newCount);
        localStorage.setItem(`hearts_count_${slug}`, newCount.toString());
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const newHeart = { id: Date.now() + Math.random(), x, y };
        setFloatingHearts((prev) => [...prev, newHeart]);
        setTimeout(() => {
            setFloatingHearts((prev) => prev.filter(h => h.id !== newHeart.id));
        }, 1000);
    };

    const idolName = profileData?.idol_name || "Idol";
    const fanName = profileData?.fan_name || "Fan";
    const idolAvatar = profileData?.idol_avatar;
    const fanAvatar = profileData?.fan_avatar;
    const debutDate = profileData?.debut_date;
    const idolBirthday = profileData?.idol_birthday;
    const fanSinceDate = profileData?.fan_since_date;
    const title = profileData?.title || `${idolName} Fan Page`;
    const slogan = profileData?.slogan;

    const formatVietnameseDate = (isoDate?: string) => {
        if (!isoDate) return null;
        const d = new Date(isoDate);
        if (Number.isNaN(d.getTime())) return null;
        return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    };

    const [nextAnniversary, setNextAnniversary] = useState<Date | null>(null);
    const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

    const isDarkBackground = useCallback((hex?: string | null) => {
        if (!hex) return false;
        const color = hex.replace("#", "");
        if (color.length !== 6) return false;
        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);
        return (r * 299 + g * 587 + b * 114) / 1000 < 120;
    }, []);

    const { isDark, toggle: handleThemeToggle } = useThemeToggle({
        slug,
        darkBg: "#0b0813",
        lightBg: data.config?.background_color || "#ffffff",
        defaultDark: isDarkBackground(data.config?.background_color),
    });

    const { style: tokenStyle } = buildTemplateTokens({
        accentColor: data.config?.accent_color,
        fontFamily: data.config?.font_family,
    });

    useEffect(() => {
        if (!debutDate) return;
        const calculateTimeLeft = () => {
            const debut = new Date(debutDate);
            const today = new Date();
            let target = new Date(today.getFullYear(), debut.getMonth(), debut.getDate());
            if (target.getTime() < today.getTime()) {
                target = new Date(today.getFullYear() + 1, debut.getMonth(), debut.getDate());
            }
            const difference = target.getTime() - today.getTime();
            if (difference > 0) {
                setCountdown({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
                setNextAnniversary(target);
            }
        };
        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [debutDate]);

    const switchAct = useCallback((act: StageAct) => {
        if (act === currentAct) return;
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentAct(act);
            setIsTransitioning(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 300);
    }, [currentAct]);

    const openLightbox = (index: number) => { setLightboxIndex(index); };
    const closeLightbox = () => { setLightboxIndex(null); };
    const nextImage = useCallback(() => {
        if (lightboxIndex !== null && data.galleries.length > 0) {
            setLightboxIndex((lightboxIndex + 1) % data.galleries.length);
        }
    }, [lightboxIndex, data.galleries.length]);
    const prevImage = useCallback(() => {
        if (lightboxIndex !== null && data.galleries.length > 0) {
            setLightboxIndex((lightboxIndex - 1 + data.galleries.length) % data.galleries.length);
        }
    }, [lightboxIndex, data.galleries.length]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightboxIndex !== null) {
                if (e.key === 'ArrowRight') nextImage();
                if (e.key === 'ArrowLeft') prevImage();
                if (e.key === 'Escape') closeLightbox();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex, nextImage, prevImage]);

    const getDaysSinceFan = () => {
        const start_date = fanSinceDate || debutDate;
        if (!start_date) return null;
        const start = new Date(start_date);
        const today = new Date();
        return Math.ceil(Math.abs(today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    };
    const daysSinceFan = getDaysSinceFan();

    const acts: { id: StageAct; label: string; icon: typeof Star; actNumber: string }[] = [
        { id: "intro", label: "Opening", icon: Mic, actNumber: "I" },
        { id: "gallery", label: "Khoảnh Khắc", icon: ImageIcon, actNumber: "II" },
        { id: "timeline", label: "Sự Nghiệp", icon: Trophy, actNumber: "III" },
        { id: "game", label: "Fandom Quiz", icon: Star, actNumber: "IV" },
        { id: "letters", label: "Gửi Idol", icon: Mail, actNumber: "V" },
    ];

    return (
        <div ref={stageRef} className="min-h-screen relative transition-colors duration-500 overflow-x-hidden" style={{ backgroundColor: 'var(--theme-bg, #fff0f5)', ...tokenStyle }}>
            <style jsx>{`
                @keyframes spotlight-sweep {
                    0% { transform: translateX(-30%) scale(1); opacity: 0.3; }
                    25% { transform: translateX(10%) scale(1.1); opacity: 0.6; }
                    50% { transform: translateX(30%) scale(0.9); opacity: 0.4; }
                    75% { transform: translateX(-10%) scale(1.05); opacity: 0.5; }
                    100% { transform: translateX(-30%) scale(1); opacity: 0.3; }
                }
                @keyframes spotlight-sweep-2 {
                    0% { transform: translateX(20%) scale(1.1); opacity: 0.2; }
                    33% { transform: translateX(-20%) scale(0.9); opacity: 0.5; }
                    66% { transform: translateX(10%) scale(1); opacity: 0.3; }
                    100% { transform: translateX(20%) scale(1.1); opacity: 0.2; }
                }
                @keyframes curtain-shimmer {
                    0%, 100% { opacity: 0.8; }
                    50% { opacity: 1; }
                }
                @keyframes stage-glow {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                }
                @keyframes act-enter {
                    0% { opacity: 0; transform: translateY(30px) scale(0.95); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes act-exit {
                    0% { opacity: 1; transform: translateY(0) scale(1); }
                    100% { opacity: 0; transform: translateY(-20px) scale(0.95); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-12px); }
                }
                @keyframes floatUp {
                    0% { transform: translateY(0) scale(1); opacity: 1; }
                    100% { transform: translateY(-120px) scale(1.4); opacity: 0; }
                }
                @keyframes drift-slow {
                    0% { transform: translateY(100vh) rotate(0deg) scale(0.8); opacity: 0; }
                    10% { opacity: 0.5; }
                    90% { opacity: 0.5; }
                    100% { transform: translateY(-10vh) rotate(360deg) scale(1.2); opacity: 0; }
                }
                .animate-float { animation: float 4s ease-in-out infinite; }
                .animate-floatUp { animation: floatUp 1s ease-out forwards; }
                .animate-drift-1 { animation: drift-slow 22s linear infinite; }
                .animate-drift-2 { animation: drift-slow 28s linear infinite; animation-delay: -5s; }
                .animate-drift-3 { animation: drift-slow 25s linear infinite; animation-delay: -12s; }
                .animate-drift-4 { animation: drift-slow 32s linear infinite; animation-delay: -8s; }
                .animate-drift-5 { animation: drift-slow 20s linear infinite; animation-delay: -17s; }
                .act-entering { animation: act-enter 0.5s ease-out forwards; }
                .act-exiting { animation: act-exit 0.3s ease-in forwards; }
                .cyber-grid {
                    background-size: 40px 40px;
                    background-image: linear-gradient(to right, color-mix(in oklch, var(--accent) 12%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--accent) 12%, transparent) 1px, transparent 1px);
                }
                .cyber-grid-light {
                    background-size: 40px 40px;
                    background-image: linear-gradient(to right, color-mix(in oklch, var(--accent) 6%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--accent) 6%, transparent) 1px, transparent 1px);
                }
                @keyframes eqBar {
                    0%, 100% { transform: scaleY(0.3); }
                    50% { transform: scaleY(1); }
                }
                .eq-bar {
                    width: 4px;
                    background: linear-gradient(to top, #7209b7, #f72585, #ff006e);
                    border-radius: 2px 2px 0 0;
                    transform-origin: bottom;
                    animation: eqBar 0.8s ease-in-out infinite;
                }
                @keyframes laserSweep {
                    0% { opacity: 0; transform: rotate(-15deg) translateX(-100%); }
                    50% { opacity: 0.6; }
                    100% { opacity: 0; transform: rotate(-15deg) translateX(100%); }
                }
                .laser-beam {
                    position: absolute;
                    top: 0;
                    width: 2px;
                    height: 100vh;
                    background: linear-gradient(to bottom, transparent, currentColor 30%, currentColor 70%, transparent);
                    filter: blur(1px);
                    transform-origin: top center;
                    animation: laserSweep 6s ease-in-out infinite;
                }
                @keyframes stageFloor {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.7; }
                }
                .ticket-stub {
                    position: relative;
                    background:
                        radial-gradient(circle at left center, transparent 6px, currentColor 6px) left center / 12px 8px repeat-y,
                        radial-gradient(circle at right center, transparent 6px, currentColor 6px) right center / 12px 8px repeat-y;
                }
                .ticket-perforation {
                    border-left: 2px dashed currentColor;
                    position: relative;
                }
                .ticket-perforation::before, .ticket-perforation::after {
                    content: '';
                    position: absolute;
                    left: -5px;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: inherit;
                }
                .ticket-perforation::before { top: -4px; }
                .ticket-perforation::after { bottom: -4px; }
            `}</style>

            {/* Stage Background */}
            <div className={`fixed inset-0 z-0 pointer-events-none ${isDark ? 'cyber-grid' : 'cyber-grid-light'}`} />

            {/* Laser Light Beams (trimmed to 2 — refined, not cluttered) */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="laser-beam" style={{ left: '20%', animationDelay: '0s', color: 'var(--accent)' }} />
                <div className="laser-beam" style={{ left: '70%', animationDelay: '3s', color: 'var(--accent)' }} />
            </div>

            {/* Moving Spotlight (single, accent-colored) */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[800px] rounded-full blur-3xl" style={{ animation: 'spotlight-sweep 18s ease-in-out infinite', background: 'radial-gradient(ellipse at top, color-mix(in oklch, var(--accent) 18%, transparent), transparent 70%)' }} />
            </div>

            {/* Floating Particles (trimmed to 3) */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute text-2xl animate-drift-1 bottom-0 left-[20%] opacity-20">🎵</div>
                <div className="absolute text-3xl animate-drift-2 bottom-0 left-[50%] opacity-20">✨</div>
                <div className="absolute text-xl animate-drift-3 bottom-0 left-[80%] opacity-20">🎵</div>
            </div>

            {/* Stage Curtains */}
            <div className="fixed top-0 left-0 w-8 sm:w-16 h-full z-10 pointer-events-none">
                <div className="w-full h-full" style={{ animation: 'curtain-shimmer 4s ease-in-out infinite', background: `linear-gradient(to right, color-mix(in oklch, var(--accent) ${isDark ? "35%" : "20%"}, transparent), transparent)` }} />
            </div>
            <div className="fixed top-0 right-0 w-8 sm:w-16 h-full z-10 pointer-events-none">
                <div className="w-full h-full" style={{ animation: 'curtain-shimmer 4s ease-in-out infinite', animationDelay: '2s', background: `linear-gradient(to left, color-mix(in oklch, var(--accent) ${isDark ? "35%" : "20%"}, transparent), transparent)` }} />
            </div>

            {/* Top Bar */}
            <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3">
                <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${isDark ? "bg-slate-950/60" : "bg-white/70"}`}
                    style={{ color: 'var(--accent)', borderColor: 'color-mix(in oklch, var(--accent) 35%, transparent)' }}
                >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    LIVE CONCERT
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggleButton
                        isDark={isDark}
                        onToggle={handleThemeToggle}
                        className={`p-2.5 rounded-full shadow-lg transition-all hover:scale-110 ${isDark ? "bg-slate-900/90 text-yellow-400 border border-white/10" : "bg-white/90 text-indigo-600 border border-gray-100"}`}
                    />
                    <Link href={`/${slug}/edit`} className={`p-2.5 rounded-full shadow-lg transition-all hover:scale-110 ${isDark ? "bg-slate-900/90 text-gray-300 border border-white/10" : "bg-white/90 text-gray-600"}`}>
                        <Settings className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* ACT NAVIGATION - Concert Setlist */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30">
                <div className={`flex items-center gap-1 p-1.5 rounded-2xl border backdrop-blur-md ${isDark ? "bg-slate-950/80 border-white/10" : "bg-white/80 border-gray-100 shadow-lg"}`}>
                    {acts.map((act) => {
                        const isActive = currentAct === act.id;
                        return (
                            <button
                                key={act.id}
                                onClick={() => switchAct(act.id)}
                                className={`relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-[10px] font-bold transition-all duration-300 ${
                                    isActive
                                        ? "text-white shadow-lg scale-105"
                                        : isDark
                                            ? "text-gray-400 hover:text-gray-200 hover:bg-slate-800/60"
                                            : "text-gray-500 hover:bg-gray-50"
                                }`}
                                style={isActive ? { backgroundColor: 'var(--accent)' } : undefined}
                            >
                                {isActive && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                                <act.icon className="w-4 h-4" />
                                <span className="hidden sm:block">{act.label}</span>
                                <span className="text-[8px] opacity-60">ACT {act.actNumber}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* STAGE CONTENT */}
            <div className={`relative z-20 min-h-screen pt-16 pb-24 px-4 sm:px-8 max-w-4xl mx-auto ${isTransitioning ? 'act-exiting' : 'act-entering'}`}>

                {/* ACT I - INTRO / OPENING */}
                {currentAct === "intro" && (
                    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8">
                        {/* Main Stage Spotlight on Idol */}
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full blur-3xl" style={{ animation: 'stage-glow 3s ease-in-out infinite', width: '200%', height: '200%', top: '-50%', left: '-50%', background: 'color-mix(in oklch, var(--accent) 20%, transparent)' }} />
                            <div
                                className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1"
                                style={{
                                    border: `2px solid var(--accent)`,
                                    boxShadow: `0 0 40px color-mix(in oklch, var(--accent) 55%, transparent)`,
                                    background: isDark ? "rgba(255,255,255,0.03)" : "#fff",
                                }}
                            >
                                {idolAvatar ? (
                                    <Image src={idolAvatar} alt={idolName} width={160} height={160} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <div className={`w-full h-full rounded-full flex items-center justify-center text-4xl font-bold ${isDark ? "bg-slate-950" : "bg-white"}`} style={{ color: 'var(--accent)' }}>{idolName.charAt(0)}</div>
                                )}
                            </div>
                            {/* Stage floor reflection */}
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-4 rounded-full blur-md" style={{ background: 'radial-gradient(ellipse at center top, color-mix(in oklch, var(--accent) 30%, transparent) 0%, transparent 60%)', animation: 'stageFloor 4s ease-in-out infinite' }} />
                            {/* Fan avatar overlap */}
                            <div className="absolute -bottom-2 -right-2">
                                <div className={`w-12 h-12 rounded-full p-0.5 shadow-xl ${isDark ? "border border-white/10" : "border-2 border-white"}`} style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#fff" }}>
                                    {fanAvatar ? (
                                        <Image src={fanAvatar} alt={fanName} width={48} height={48} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <div className={`w-full h-full rounded-full flex items-center justify-center text-sm font-bold ${isDark ? "bg-slate-950" : "bg-white"}`} style={{ color: 'var(--accent)' }}>{fanName.charAt(0)}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div
                                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${isDark ? "bg-slate-950/40" : "bg-white/60"}`}
                                style={{ color: 'var(--accent)', borderColor: 'color-mix(in oklch, var(--accent) 40%, transparent)' }}
                            >
                                <Star className="w-3.5 h-3.5 fill-current" />
                                Fandom: {fanName}
                            </div>
                            <h1
                                className="text-4xl sm:text-5xl font-black"
                                style={{
                                    fontFamily: 'var(--font-display)',
                                    color: 'var(--accent)',
                                    textShadow: '0 0 24px color-mix(in oklch, var(--accent) 55%, transparent)',
                                }}
                            >
                                {idolName}
                            </h1>
                            <h2 className={`text-2xl sm:text-3xl font-bold italic ${isDark ? "text-gray-200" : "text-gray-700"}`} style={{ fontFamily: 'var(--font-display)' }}>{title}</h2>
                            {slogan && <p className={`italic text-sm max-w-md mx-auto ${isDark ? "text-gray-400" : "text-gray-500"}`}>&ldquo;{slogan}&rdquo;</p>}
                            {(debutDate || idolBirthday) && (
                                <div className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                    {debutDate && <span>Debut: {formatVietnameseDate(debutDate)}</span>}
                                    {idolBirthday && <span>Sinh nhật: {formatVietnameseDate(idolBirthday)}</span>}
                                </div>
                            )}
                        </div>

                        {/* Decorative Equalizer Bars */}
                        <div className="flex items-end justify-center gap-1 h-8" aria-hidden="true">
                            {Array.from({ length: 15 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="eq-bar"
                                    style={{
                                        height: '100%',
                                        background: 'var(--accent)',
                                        animationDelay: `${i * 0.08}s`,
                                        animationDuration: `${0.6 + (i % 3) * 0.2}s`,
                                    }}
                                />
                            ))}
                        </div>

                        {/* Stats Row */}
                        <div className="flex flex-wrap justify-center gap-4">
                            {daysSinceFan && (
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${isDark ? "bg-slate-900/80 border border-white/10" : "bg-white/80 border border-gray-100 shadow-sm"}`}>
                                    <Calendar className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                                    <span className="text-sm font-bold">{daysSinceFan}</span>
                                    <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>ngày là fan</span>
                                </div>
                            )}
                            <button onClick={handleSendHeart} className={`relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105 active:scale-95 border ${isDark ? "bg-slate-900/60" : "bg-white/70"}`} style={{ color: 'var(--accent)', borderColor: 'color-mix(in oklch, var(--accent) 30%, transparent)' }}>
                                <Star className="w-4 h-4 fill-current animate-pulse" />
                                <span className="text-sm font-bold">{heartsCount.toLocaleString()}</span>
                                {floatingHearts.map(heart => (
                                    <span key={heart.id} className="absolute text-sm pointer-events-none animate-floatUp" style={{ left: `${heart.x}px`, top: `${heart.y}px` }}>❤️</span>
                                ))}
                            </button>
                        </div>

                        {/* Countdown */}
                        {countdown && nextAnniversary && (
                            <div className={`w-full max-w-md p-4 rounded-2xl border ${isDark ? "bg-slate-900/80 backdrop-blur-md" : "bg-white/80 backdrop-blur-md shadow-md"}`} style={{ borderColor: 'color-mix(in oklch, var(--accent) 30%, transparent)' }}>
                                <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold tracking-wider uppercase mb-3">
                                    <Sparkles className="w-3.5 h-3.5 animate-pulse" style={{ color: 'var(--accent)' }} />
                                    <span style={{ color: 'var(--accent)' }}>Kỷ niệm Debut sắp tới</span>
                                    <span className={`ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded border ${isDark ? "bg-slate-950/60" : "bg-white"}`} style={{ color: 'var(--accent)', borderColor: 'color-mix(in oklch, var(--accent) 30%, transparent)' }}>VIP</span>
                                </div>
                                <div className="flex gap-2 justify-center">
                                    {[
                                        { label: "ngày", value: countdown.days },
                                        { label: "giờ", value: countdown.hours },
                                        { label: "phút", value: countdown.minutes },
                                        { label: "giây", value: countdown.seconds },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex flex-col items-center flex-1">
                                            <div className={`text-lg font-black w-full py-1.5 rounded-xl text-center border ${isDark ? "bg-slate-950/80" : "bg-white"}`} style={{ color: 'var(--accent)', borderColor: 'color-mix(in oklch, var(--accent) 20%, transparent)' }}>
                                                {String(item.value).padStart(2, '0')}
                                            </div>
                                            <span className={`text-[9px] mt-0.5 uppercase font-semibold ${isDark ? "text-gray-400" : "text-gray-500"}`}>{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quick Peek Cards */}
                        <div className="grid grid-cols-3 gap-3 w-full max-w-md">
                            {[
                                { label: "Khoảnh khắc", value: data.galleries.length, act: "gallery" as StageAct },
                                { label: "Cột mốc", value: data.timelines.length, act: "timeline" as StageAct },
                                { label: "Thư từ fan", value: data.letters.length, act: "letters" as StageAct },
                            ].map((stat, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => switchAct(stat.act)}
                                    className={`p-3 rounded-xl border transition-all hover:scale-105 ${isDark ? "bg-slate-900/70 border-white/10" : "bg-white/70 border-white/30 shadow-sm"}`}
                                >
                                    <div className="text-lg font-bold">{stat.value}</div>
                                    <div className={`text-[10px] ${isDark ? "text-gray-400" : "text-gray-500"}`}>{stat.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ACT II - GALLERY (Khoảnh Khắc) */}
                {currentAct === "gallery" && (
                    <div className="py-8 space-y-6">
                        <div className="text-center space-y-2">
                            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Act II</span>
                            <h2 className={`text-3xl font-black ${isDark ? "text-white" : "text-gray-800"}`} style={{ fontFamily: 'var(--font-display)' }}>Những Khoảnh Khắc Đáng Nhớ</h2>
                        </div>
                        {data.galleries.length === 0 ? (
                            <div className="text-center py-16 text-gray-400">
                                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p>Chưa có ảnh nào...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                                {data.galleries.map((item, index) => {
                                    const rotClasses = ["-rotate-2", "rotate-2", "-rotate-1", "rotate-1", "-rotate-3", "rotate-3"];
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => openLightbox(index)}
                                            className={`group p-2 pb-6 rounded-xl shadow-md hover:shadow-xl transition-all hover:scale-105 hover:rotate-0 duration-300 cursor-pointer border ${rotClasses[index % 6]} ${isDark ? "bg-slate-900/90 border-white/10" : "bg-white border-gray-100"}`}
                                        >
                                            <div className="relative aspect-square rounded-lg overflow-hidden">
                                                <Image src={item.image_url} alt={item.caption || "Memory"} fill className="object-cover transition-transform duration-300" />
                                            </div>
                                            <p className={`text-xs font-mono font-medium truncate mt-2 text-center px-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                                {item.caption || `Memory #${index + 1}`}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ACT III - TIMELINE (Sự Nghiệp) */}
                {currentAct === "timeline" && (
                    <div className="py-8 space-y-6">
                        <div className="text-center space-y-2">
                            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Act III</span>
                            <h2 className={`text-3xl font-black ${isDark ? "text-white" : "text-gray-800"}`} style={{ fontFamily: 'var(--font-display)' }}>Hành Trình Sự Nghiệp</h2>
                        </div>
                        {data.timelines.length === 0 ? (
                            <div className="text-center py-16 text-gray-400">
                                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p>Chưa có sự kiện nào...</p>
                            </div>
                        ) : (
                            <div className="relative max-w-2xl mx-auto">
                                <div className="absolute left-6 top-0 bottom-0 w-0.5" style={{ background: 'color-mix(in oklch, var(--accent) 25%, transparent)' }} />
                                <div className="space-y-8">
                                    {data.timelines.map((event) => {
                                        const isAward = (event.title + " " + (event.description || "")).toLowerCase().match(/(giải|cúp|trophy|award|daesang|bonsang|win|thắng|first place|hạng 1|top 1|số 1)/);
                                        const isRelease = (event.title + " " + (event.description || "")).toLowerCase().match(/(album|single|mv|release|song|nhạc|bài hát|đĩa|debut)/);
                                        let icon = <Star className="w-4 h-4 fill-current" style={{ color: 'var(--accent)' }} />;
                                        let dotStyle: CSSProperties = { background: 'var(--accent)', borderColor: '#fff' };
                                        let glowClass = "";
                                        if (isAward) {
                                            icon = <Trophy className="w-4 h-4 text-yellow-600 fill-yellow-200" />;
                                            dotStyle = { background: 'linear-gradient(to bottom right, #facc15, #d97706)', borderColor: '#fef3c7' };
                                            glowClass = "shadow-[0_0_10px_rgba(245,158,11,0.6)]";
                                        } else if (isRelease) {
                                            icon = <Disc className="w-4 h-4 text-cyan-600 animate-spin-slower" />;
                                            dotStyle = { background: 'linear-gradient(to bottom right, #22d3ee, #3b82f6)', borderColor: '#a5f3fc' };
                                            glowClass = "shadow-[0_0_10px_rgba(6,182,212,0.6)]";
                                        }
                                        return (
                                            <div key={event.id} className="relative pl-16">
                                                <div className={`absolute left-2 w-9 h-9 rounded-full border-2 shadow-md flex items-center justify-center z-10 ${glowClass}`} style={dotStyle}>
                                                    {icon}
                                                </div>
                                                <div className={`relative rounded-2xl shadow-md transition-all overflow-hidden border ${isDark ? (isAward ? "bg-gradient-to-br from-slate-900 to-amber-950/20 border-amber-500/20 text-white" : isRelease ? "bg-gradient-to-br from-slate-900 to-cyan-950/20 border-cyan-500/20 text-white" : "bg-slate-900/90 text-white") : "bg-white border-gray-100 text-gray-800"}`} style={!isDark || (!isAward && !isRelease) ? { borderColor: isDark ? 'color-mix(in oklch, var(--accent) 15%, transparent)' : undefined } : undefined}>
                                                    {/* Ticket header strip */}
                                                    <div className={`flex items-center justify-between px-4 py-1.5 border-b border-dashed ${isDark ? "bg-slate-950/30" : "bg-gray-50"}`} style={{ borderColor: 'color-mix(in oklch, var(--accent) 25%, transparent)' }}>
                                                        <span className="text-[9px] font-mono font-bold tracking-widest uppercase" style={{ color: 'var(--accent)' }}>
                                                            {isAward ? "AWARD" : isRelease ? "RELEASE" : "EVENT"}
                                                        </span>
                                                        <span className={`text-[9px] font-mono ${isDark ? "text-gray-400" : "text-gray-400"}`}>
                                                            #{String(event.id).slice(-6).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="p-5">
                                                        <div className="text-xs font-semibold mb-1 flex items-center gap-1.5" style={{ color: 'var(--accent)' }}>
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(event.date).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" })}
                                                        </div>
                                                        <h3 className="text-lg font-bold mb-2">{event.title}</h3>
                                                        {event.description && <p className={`text-sm leading-relaxed ${isDark ? "text-gray-300" : "text-gray-500"}`}>{event.description}</p>}
                                                        {event.image_url && (
                                                            <div className="mt-4">
                                                                <div className={`w-48 h-48 rounded-xl overflow-hidden border ${isDark ? "bg-slate-950 border-white/10" : "bg-gray-50 border-gray-100"}`}>
                                                                    <Image src={event.image_url} alt={event.title} width={192} height={192} className="w-full h-full object-contain" />
                                                                </div>
                                                            </div>
                                                        )}
                                                        {event.video_url && (
                                                            <div className="mt-4">
                                                                <VideoPlayer url={event.video_url} className="rounded-xl overflow-hidden border border-white/5 shadow-md" />
                                                            </div>
                                                        )}
                                                        {event.audio_url && (
                                                            <div className={`mt-4 p-3.5 rounded-xl border ${isDark ? "text-white" : ""}`} style={{ background: isDark ? 'color-mix(in oklch, var(--accent) 10%, transparent)' : 'color-mix(in oklch, var(--accent) 6%, white)', borderColor: 'color-mix(in oklch, var(--accent) 25%, transparent)' }}>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <Mic className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                                                                    <span className="text-sm font-semibold">Ghi âm sự kiện</span>
                                                                </div>
                                                                <audio src={event.audio_url} controls className="w-full h-10" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Ticket perforation bottom */}
                                                    <div className={`ticket-perforation px-4 py-2 flex items-center justify-between ${isDark ? "bg-slate-950/30" : "bg-gray-50"}`} style={{ borderColor: 'color-mix(in oklch, var(--accent) 25%, transparent)' }}>
                                                        <span className="text-[9px] font-mono text-gray-400">ADMIT ONE</span>
                                                        <div className="flex items-center gap-1">
                                                            <Star className="w-2.5 h-2.5 fill-current" style={{ color: 'var(--accent)' }} />
                                                            <Star className="w-2 h-2 fill-current opacity-50" style={{ color: 'var(--accent)' }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ACT IV - GAME (Fandom Quiz) */}
                {currentAct === "game" && (
                    <div className="py-8 space-y-6">
                        <div className="text-center space-y-2">
                            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Act IV</span>
                            <h2 className={`text-3xl font-black ${isDark ? "text-white" : "text-gray-800"}`} style={{ fontFamily: 'var(--font-display)' }}>Fandom Quiz</h2>
                        </div>
                        {gameTemplateId === "A" ? (
                            <IdolGameSection
                                isDark={isDark}
                                idolName={idolName}
                                fanName={fanName}
                                debutDate={debutDate}
                                idolBirthday={idolBirthday}
                                fanSinceDate={fanSinceDate}
                            />
                        ) : (
                            <TemplateVariantGame
                                linkType={data.type}
                                variantId={gameTemplateId}
                                profileData={data.profile_data as Record<string, unknown> | null}
                                photos={data.galleries.map(g => ({ id: g.id, url: g.image_url, caption: g.caption }))}
                                timelines={data.timelines.map(t => ({ id: t.id, title: t.title, description: t.description }))}
                                isDark={isDark}
                            />
                        )}
                    </div>
                )}

                {/* ACT V - LETTERS (Gửi Idol) */}
                {currentAct === "letters" && (
                    <div className="py-8 space-y-6">
                        <div className="text-center space-y-2">
                            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Act V</span>
                            <h2 className={`text-3xl font-black ${isDark ? "text-white" : "text-gray-800"}`} style={{ fontFamily: 'var(--font-display)' }}>Gửi Idol</h2>
                        </div>
                        <IdolLetterBox slug={slug} initialLetters={data.letters} isDark={isDark} />
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {lightboxIndex !== null && data.galleries[lightboxIndex] && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeLightbox}>
                    <div className={`rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col border ${isDark ? "bg-slate-900 text-white border-white/10" : "bg-white text-gray-800 border-transparent"}`} onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 text-white flex-shrink-0" style={{ background: 'var(--accent)' }}>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{lightboxIndex + 1} / {data.galleries.length}</span>
                                <button onClick={closeLightbox} className="hover:scale-110 transition-transform"><X className="w-5 h-5" /></button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden flex items-center justify-center p-4 min-h-[300px]">
                            <div className="relative w-full aspect-[4/3] max-h-[55vh]">
                                <Image src={data.galleries[lightboxIndex].image_url} alt={data.galleries[lightboxIndex].caption || "Photo"} fill className="object-contain" priority />
                            </div>
                        </div>
                        {data.galleries[lightboxIndex].caption && (
                            <div className={`px-4 py-2 text-center text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>{data.galleries[lightboxIndex].caption}</div>
                        )}
                        <div className={`flex justify-center items-center gap-4 p-4 border-t ${isDark ? "border-white/10" : "border-gray-100"}`}>
                            <button onClick={prevImage} className={`p-2.5 rounded-full transition-all hover:scale-110 ${isDark ? "bg-slate-950/40" : "bg-gray-50"}`} style={{ color: 'var(--accent)' }}><ChevronLeft className="w-5 h-5" /></button>
                            <button onClick={nextImage} className={`p-2.5 rounded-full transition-all hover:scale-110 ${isDark ? "bg-slate-950/40" : "bg-gray-50"}`} style={{ color: 'var(--accent)' }}><ChevronRight className="w-5 h-5" /></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
