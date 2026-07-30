"use client";

// IdolTemplateV2 — bản giữ nguyên implementation mới (UX roadmap) của IdolTemplate.
// IdolTemplate.tsx đã được rollback về đúng phiên bản trên nhánh deploy, nên mọi
// tính năng mới (game variant, night mode, hiệu ứng mới) sống ở file V2 này.

import { useState, useEffect, useCallback, useRef } from "react";
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
    const title = profileData?.title || `${idolName} Fan Page`;
    const slogan = profileData?.slogan;

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

    const getDaysSinceDebut = () => {
        if (!debutDate) return null;
        const start = new Date(debutDate);
        const today = new Date();
        return Math.ceil(Math.abs(today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    };
    const daysSinceDebut = getDaysSinceDebut();

    const acts: { id: StageAct; label: string; icon: typeof Star; actNumber: string }[] = [
        { id: "intro", label: "Opening", icon: Mic, actNumber: "I" },
        { id: "gallery", label: "Khoảnh Khắc", icon: ImageIcon, actNumber: "II" },
        { id: "timeline", label: "Sự Nghiệp", icon: Trophy, actNumber: "III" },
        { id: "game", label: "Fandom Quiz", icon: Star, actNumber: "IV" },
        { id: "letters", label: "Gửi Idol", icon: Mail, actNumber: "V" },
    ];

    return (
        <div ref={stageRef} className="min-h-screen relative transition-colors duration-500 overflow-x-hidden" style={{ backgroundColor: 'var(--theme-bg, #fff0f5)' }}>
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
                    0%, 100% { box-shadow: 0 0 30px rgba(168, 85, 247, 0.2), 0 0 60px rgba(236, 72, 153, 0.1); }
                    50% { box-shadow: 0 0 50px rgba(168, 85, 247, 0.35), 0 0 80px rgba(236, 72, 153, 0.2); }
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
                    background-image: linear-gradient(to right, rgba(168, 85, 247, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(168, 85, 247, 0.04) 1px, transparent 1px);
                }
                .cyber-grid-light {
                    background-size: 40px 40px;
                    background-image: linear-gradient(to right, rgba(168, 85, 247, 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(168, 85, 247, 0.02) 1px, transparent 1px);
                }
                @keyframes holoShimmer {
                    0% { background-position: 0% center; filter: hue-rotate(0deg); }
                    100% { background-position: 200% center; filter: hue-rotate(360deg); }
                }
                .holo-text {
                    background: linear-gradient(110deg,
                        #ff006e 0%, #ff8500 10%, #ffd60a 20%, #06ffa5 35%,
                        #00b4d8 50%, #7209b7 65%, #f72585 80%, #ff006e 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: holoShimmer 4s linear infinite;
                    filter: drop-shadow(0 0 8px rgba(255, 0, 110, 0.4)) drop-shadow(0 0 16px rgba(114, 9, 183, 0.2));
                }
                @keyframes marqueeChase {
                    0% { box-shadow: 0 0 8px rgba(255,255,255,0.8), 8px 0 0 rgba(255,255,255,0.3); }
                    100% { box-shadow: 0 0 8px rgba(255,255,255,0.8), -8px 0 0 rgba(255,255,255,0.3); }
                }
                .marquee-ring {
                    position: absolute;
                    inset: -10px;
                    border-radius: 9999px;
                    pointer-events: none;
                }
                .marquee-bulb {
                    position: absolute;
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: radial-gradient(circle at 30% 30%, #fef9c3, #fbbf24);
                    box-shadow: 0 0 6px rgba(251, 191, 36, 0.9), 0 0 12px rgba(251, 191, 36, 0.5);
                    animation: bulbBlink 1.5s ease-in-out infinite;
                }
                @keyframes bulbBlink {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(0.8); }
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
                @keyframes starBurst {
                    0% { transform: rotate(0deg) scale(1); opacity: 0.6; }
                    100% { transform: rotate(360deg) scale(1); opacity: 0.6; }
                }
                .star-burst {
                    position: absolute;
                    inset: -30px;
                    pointer-events: none;
                    animation: starBurst 30s linear infinite;
                }
                @keyframes holoBorderShift {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 200% 50%; }
                }
                .holo-border {
                    position: relative;
                }
                .holo-border::before {
                    content: '';
                    position: absolute;
                    inset: -2px;
                    border-radius: inherit;
                    padding: 2px;
                    background: linear-gradient(110deg, #ff006e, #ff8500, #ffd60a, #06ffa5, #00b4d8, #7209b7, #f72585, #ff006e);
                    background-size: 200% 100%;
                    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    animation: holoBorderShift 4s linear infinite;
                    pointer-events: none;
                }
                @keyframes stageFloor {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.7; }
                }
                .stage-floor {
                    background: radial-gradient(ellipse at center top, rgba(168, 85, 247, 0.3) 0%, transparent 60%);
                    animation: stageFloor 4s ease-in-out infinite;
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

            {/* Laser Light Beams */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="laser-beam text-pink-500" style={{ left: '15%', animationDelay: '0s' }} />
                <div className="laser-beam text-purple-500" style={{ left: '45%', animationDelay: '1.5s' }} />
                <div className="laser-beam text-cyan-400" style={{ left: '75%', animationDelay: '3s' }} />
                <div className="laser-beam text-pink-400" style={{ left: '30%', animationDelay: '4.5s', animationDuration: '7s' }} />
                <div className="laser-beam text-purple-400" style={{ left: '60%', animationDelay: '2s', animationDuration: '7s' }} />
            </div>

            {/* Moving Spotlights */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[500px] h-[800px] bg-gradient-to-b from-purple-500/15 via-purple-400/5 to-transparent rounded-full blur-3xl" style={{ animation: 'spotlight-sweep 18s ease-in-out infinite' }} />
                <div className="absolute top-0 right-1/4 w-[400px] h-[700px] bg-gradient-to-b from-pink-500/12 via-pink-400/4 to-transparent rounded-full blur-3xl" style={{ animation: 'spotlight-sweep-2 22s ease-in-out infinite' }} />
                <div className="absolute top-0 left-1/2 w-[300px] h-[600px] bg-gradient-to-b from-cyan-500/8 via-cyan-400/3 to-transparent rounded-full blur-3xl" style={{ animation: 'spotlight-sweep 15s ease-in-out infinite', animationDelay: '-7s' }} />
            </div>

            {/* Floating Particles */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute text-purple-400/20 text-2xl animate-drift-1 bottom-0 left-[15%]">🎵</div>
                <div className="absolute text-pink-400/20 text-3xl animate-drift-2 bottom-0 left-[35%]">🎶</div>
                <div className="absolute text-cyan-400/20 text-xl animate-drift-3 bottom-0 left-[55%]">✨</div>
                <div className="absolute text-yellow-400/20 text-2xl animate-drift-4 bottom-0 left-[75%]">⭐</div>
                <div className="absolute text-purple-400/20 text-xl animate-drift-5 bottom-0 left-[90%]">🎵</div>
            </div>

            {/* Stage Curtains */}
            <div className="fixed top-0 left-0 w-8 sm:w-16 h-full z-10 pointer-events-none">
                <div className={`w-full h-full ${isDark ? "bg-gradient-to-r from-purple-950/80 via-purple-900/40 to-transparent" : "bg-gradient-to-r from-purple-200/60 via-purple-100/30 to-transparent"}`} style={{ animation: 'curtain-shimmer 4s ease-in-out infinite' }} />
            </div>
            <div className="fixed top-0 right-0 w-8 sm:w-16 h-full z-10 pointer-events-none">
                <div className={`w-full h-full ${isDark ? "bg-gradient-to-l from-purple-950/80 via-purple-900/40 to-transparent" : "bg-gradient-to-l from-purple-200/60 via-purple-100/30 to-transparent"}`} style={{ animation: 'curtain-shimmer 4s ease-in-out infinite', animationDelay: '2s' }} />
            </div>

            {/* Top Bar */}
            <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${isDark ? "bg-purple-950/60 text-purple-300 border border-purple-500/30" : "bg-purple-100 text-purple-700"}`}>
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    LIVE CONCERT
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggleButton
                        isDark={isDark}
                        onToggle={handleThemeToggle}
                        className={`p-2.5 rounded-full shadow-lg transition-all hover:scale-110 ${isDark ? "bg-slate-900/90 text-yellow-400 border border-purple-500/30" : "bg-white/90 text-indigo-600 border border-gray-100"}`}
                    />
                    <Link href={`/${slug}/edit`} className={`p-2.5 rounded-full shadow-lg transition-all hover:scale-110 ${isDark ? "bg-slate-900/90 text-purple-400 border border-purple-500/30" : "bg-white/90 text-gray-600"}`}>
                        <Settings className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* ACT NAVIGATION - Concert Setlist */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30">
                <div className={`flex items-center gap-1 p-1.5 rounded-2xl border backdrop-blur-md ${isDark ? "bg-slate-950/80 border-purple-500/20" : "bg-white/80 border-purple-100/50 shadow-lg"}`}>
                    {acts.map((act) => {
                        const isActive = currentAct === act.id;
                        return (
                            <button
                                key={act.id}
                                onClick={() => switchAct(act.id)}
                                className={`relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-[10px] font-bold transition-all duration-300 ${
                                    isActive
                                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 scale-105"
                                        : isDark
                                            ? "text-purple-300/60 hover:text-purple-200 hover:bg-slate-800/60"
                                            : "text-gray-500 hover:text-purple-600 hover:bg-purple-50/50"
                                }`}
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
                            <div className={`absolute inset-0 rounded-full blur-3xl ${isDark ? "bg-purple-500/20" : "bg-purple-300/30"}`} style={{ animation: 'stage-glow 3s ease-in-out infinite', width: '200%', height: '200%', top: '-50%', left: '-50%' }} />
                            {/* Star burst SVG behind avatar */}
                            <svg className="star-burst opacity-40" viewBox="0 0 200 200" fill="none">
                                <g stroke={isDark ? "#f72585" : "#a855f7"} strokeWidth="1" opacity="0.5">
                                    {Array.from({ length: 24 }).map((_, i) => {
                                        const angle = (i * 15) * Math.PI / 180;
                                        const x1 = 100 + Math.cos(angle) * 40;
                                        const y1 = 100 + Math.sin(angle) * 40;
                                        const x2 = 100 + Math.cos(angle) * 95;
                                        const y2 = 100 + Math.sin(angle) * 95;
                                        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
                                    })}
                                </g>
                                <circle cx="100" cy="100" r="50" stroke={isDark ? "#f72585" : "#a855f7"} strokeWidth="0.5" strokeDasharray="2 4" opacity="0.4" fill="none" />
                            </svg>
                            <div className={`relative w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1 ${isDark ? "bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-400 shadow-[0_0_40px_rgba(168,85,247,0.5)]" : "bg-gradient-to-br from-purple-400 to-pink-400 border-4 border-white shadow-2xl"}`}>
                                {idolAvatar ? (
                                    <Image src={idolAvatar} alt={idolName} width={160} height={160} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <div className={`w-full h-full rounded-full flex items-center justify-center text-4xl font-bold ${isDark ? "bg-slate-950 text-purple-400" : "bg-white text-purple-400"}`}>{idolName.charAt(0)}</div>
                                )}
                            </div>
                            {/* Marquee bulb ring */}
                            <div className="marquee-ring">
                                {Array.from({ length: 16 }).map((_, i) => {
                                    const angle = (i * 22.5) * Math.PI / 180;
                                    const radius = 76;
                                    const x = 50 + Math.cos(angle) * radius;
                                    const y = 50 + Math.sin(angle) * radius;
                                    return (
                                        <span
                                            key={i}
                                            className="marquee-bulb"
                                            style={{
                                                left: `${x}%`,
                                                top: `${y}%`,
                                                animationDelay: `${i * 0.1}s`,
                                            }}
                                        />
                                    );
                                })}
                            </div>
                            {/* Stage floor reflection */}
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-4 rounded-full stage-floor blur-md" />
                            {/* Fan avatar overlap */}
                            <div className="absolute -bottom-2 -right-2">
                                <div className={`w-12 h-12 rounded-full p-0.5 shadow-xl ${isDark ? "bg-gradient-to-br from-cyan-400 to-purple-500 shadow-[0_0_12px_rgba(6,182,212,0.6)]" : "bg-gradient-to-br from-cyan-300 to-purple-400 border-2 border-white"}`}>
                                    {fanAvatar ? (
                                        <Image src={fanAvatar} alt={fanName} width={48} height={48} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <div className={`w-full h-full rounded-full flex items-center justify-center text-sm font-bold ${isDark ? "bg-slate-950 text-cyan-400" : "bg-white text-cyan-400"}`}>{fanName.charAt(0)}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${isDark ? "bg-purple-950/60 text-purple-300 border border-purple-500/30" : "bg-purple-100 text-purple-700"}`}>
                                <Star className="w-3.5 h-3.5 fill-current" />
                                Fandom: {fanName}
                            </div>
                            <h1 className={`text-4xl sm:text-5xl font-black holo-text`}>{idolName}</h1>
                            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent" style={{ fontFamily: "var(--font-dancing-script), cursive" }}>{title}</h2>
                            {slogan && <p className={`italic text-sm max-w-md mx-auto ${isDark ? "text-purple-200/80" : "text-gray-500"}`}>&ldquo;{slogan}&rdquo;</p>}
                        </div>

                        {/* Decorative Equalizer Bars */}
                        <div className="flex items-end justify-center gap-1 h-8" aria-hidden="true">
                            {Array.from({ length: 15 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="eq-bar"
                                    style={{
                                        height: '100%',
                                        animationDelay: `${i * 0.08}s`,
                                        animationDuration: `${0.6 + (i % 3) * 0.2}s`,
                                    }}
                                />
                            ))}
                        </div>

                        {/* Stats Row */}
                        <div className="flex flex-wrap justify-center gap-4">
                            {daysSinceDebut && (
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${isDark ? "bg-slate-900/80 border border-purple-500/20" : "bg-white/80 border border-purple-100 shadow-sm"}`}>
                                    <Calendar className={`w-4 h-4 ${isDark ? "text-purple-400" : "text-purple-500"}`} />
                                    <span className="text-sm font-bold">{daysSinceDebut}</span>
                                    <span className={`text-xs ${isDark ? "text-purple-300/70" : "text-gray-500"}`}>ngày</span>
                                </div>
                            )}
                            <button onClick={handleSendHeart} className={`relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105 active:scale-95 ${isDark ? "bg-pink-950/40 border border-pink-500/20 text-pink-400" : "bg-pink-50 border border-pink-100 text-pink-500"}`}>
                                <Star className="w-4 h-4 fill-current animate-pulse" />
                                <span className="text-sm font-bold">{heartsCount.toLocaleString()}</span>
                                {floatingHearts.map(heart => (
                                    <span key={heart.id} className="absolute text-pink-500 text-sm pointer-events-none animate-floatUp" style={{ left: `${heart.x}px`, top: `${heart.y}px` }}>❤️</span>
                                ))}
                            </button>
                        </div>

                        {/* Countdown */}
                        {countdown && nextAnniversary && (
                            <div className={`holo-border w-full max-w-md p-4 rounded-2xl border ${isDark ? "bg-slate-900/80 border-cyan-500/25 backdrop-blur-md" : "bg-white/80 backdrop-blur-md border border-pink-100 shadow-md"}`}>
                                <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold tracking-wider uppercase mb-3">
                                    <Sparkles className={`w-3.5 h-3.5 animate-pulse ${isDark ? "text-cyan-400" : "text-purple-500"}`} />
                                    <span className={isDark ? "text-cyan-300" : "text-purple-600"}>Kỷ niệm Debut sắp tới</span>
                                    <span className={`ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded ${isDark ? "bg-cyan-950/60 text-cyan-400 border border-cyan-500/30" : "bg-purple-100 text-purple-500"}`}>VIP</span>
                                </div>
                                <div className="flex gap-2 justify-center">
                                    {[
                                        { label: "ngày", value: countdown.days },
                                        { label: "giờ", value: countdown.hours },
                                        { label: "phút", value: countdown.minutes },
                                        { label: "giây", value: countdown.seconds },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex flex-col items-center flex-1">
                                            <div className={`text-lg font-black w-full py-1.5 rounded-xl text-center ${isDark ? "bg-slate-950/80 text-cyan-400 border border-cyan-500/20" : "bg-purple-50 text-purple-600"}`}>
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
                                <button key={idx} onClick={() => switchAct(stat.act)} className={`p-3 rounded-xl border transition-all hover:scale-105 ${isDark ? "bg-slate-900/70 border-purple-500/20 hover:border-purple-500/40" : "bg-white/70 border border-white/30 hover:border-purple-300 shadow-sm"}`}>
                                    <div className="text-lg font-bold">{stat.value}</div>
                                    <div className={`text-[10px] ${isDark ? "text-purple-300/70" : "text-gray-500"}`}>{stat.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ACT II - GALLERY (Khoảnh Khắc) */}
                {currentAct === "gallery" && (
                    <div className="py-8 space-y-6">
                        <div className="text-center space-y-2">
                            <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-purple-400" : "text-purple-500"}`}>Act II</span>
                            <h2 className={`text-3xl font-black ${isDark ? "text-white" : "text-gray-800"}`}>Những Khoảnh Khắc Đáng Nhớ</h2>
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
                                            className={`group p-2 pb-6 rounded-xl shadow-md hover:shadow-xl transition-all hover:scale-105 hover:rotate-0 duration-300 cursor-pointer border ${rotClasses[index % 6]} ${isDark ? "bg-slate-900/90 border-purple-500/20" : "bg-white border-gray-100"}`}
                                        >
                                            <div className="relative aspect-square rounded-lg overflow-hidden">
                                                <Image src={item.image_url} alt={item.caption || "Memory"} fill className="object-cover transition-transform duration-300" />
                                            </div>
                                            <p className={`text-xs font-mono font-medium truncate mt-2 text-center px-1 ${isDark ? "text-purple-300" : "text-gray-600"}`}>
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
                            <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-purple-400" : "text-purple-500"}`}>Act III</span>
                            <h2 className={`text-3xl font-black ${isDark ? "text-white" : "text-gray-800"}`}>Hành Trình Sự Nghiệp</h2>
                        </div>
                        {data.timelines.length === 0 ? (
                            <div className="text-center py-16 text-gray-400">
                                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p>Chưa có sự kiện nào...</p>
                            </div>
                        ) : (
                            <div className="relative max-w-2xl mx-auto">
                                <div className={`absolute left-6 top-0 bottom-0 w-0.5 ${isDark ? "bg-purple-900/50" : "bg-purple-200"}`} />
                                <div className="space-y-8">
                                    {data.timelines.map((event) => {
                                        const isAward = (event.title + " " + (event.description || "")).toLowerCase().match(/(giải|cúp|trophy|award|daesang|bonsang|win|thắng|first place|hạng 1|top 1|số 1)/);
                                        const isRelease = (event.title + " " + (event.description || "")).toLowerCase().match(/(album|single|mv|release|song|nhạc|bài hát|đĩa|debut)/);
                                        let icon = <Star className="w-4 h-4 text-purple-500 fill-purple-300" />;
                                        let dotBg = "from-purple-400 to-pink-400 border-white";
                                        let glowClass = "";
                                        if (isAward) {
                                            icon = <Trophy className="w-4 h-4 text-yellow-600 fill-yellow-200" />;
                                            dotBg = "from-yellow-400 to-amber-500 border-yellow-200";
                                            glowClass = "shadow-[0_0_10px_rgba(245,158,11,0.6)]";
                                        } else if (isRelease) {
                                            icon = <Disc className="w-4 h-4 text-cyan-600 animate-spin-slower" />;
                                            dotBg = "from-cyan-400 to-blue-500 border-cyan-200";
                                            glowClass = "shadow-[0_0_10px_rgba(6,182,212,0.6)]";
                                        }
                                        return (
                                            <div key={event.id} className="relative pl-16">
                                                <div className={`absolute left-2 w-9 h-9 rounded-full bg-gradient-to-br ${dotBg} border-2 shadow-md flex items-center justify-center z-10 ${glowClass}`}>
                                                    {icon}
                                                </div>
                                                <div className={`relative rounded-2xl shadow-md transition-all overflow-hidden ${isDark ? (isAward ? "bg-gradient-to-br from-slate-900 to-amber-950/20 border border-amber-500/20 text-white" : isRelease ? "bg-gradient-to-br from-slate-900 to-cyan-950/20 border border-cyan-500/20 text-white" : "bg-slate-900/90 border border-purple-500/15 text-white") : "bg-white border border-gray-100 text-gray-800"}`}>
                                                    {/* Ticket header strip */}
                                                    <div className={`flex items-center justify-between px-4 py-1.5 ${isDark ? "bg-purple-950/40" : "bg-purple-50"} border-b border-dashed ${isDark ? "border-purple-500/30" : "border-purple-200"}`}>
                                                        <span className={`text-[9px] font-mono font-bold tracking-widest uppercase ${isDark ? "text-purple-300" : "text-purple-600"}`}>
                                                            {isAward ? "AWARD" : isRelease ? "RELEASE" : "EVENT"}
                                                        </span>
                                                        <span className={`text-[9px] font-mono ${isDark ? "text-purple-400/70" : "text-purple-400"}`}>
                                                            #{String(event.id).slice(-6).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="p-5">
                                                        <div className={`text-xs font-semibold mb-1 flex items-center gap-1.5 ${isDark ? "text-purple-300" : "text-purple-400"}`}>
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(event.date).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" })}
                                                        </div>
                                                        <h3 className="text-lg font-bold mb-2">{event.title}</h3>
                                                        {event.description && <p className={`text-sm leading-relaxed ${isDark ? "text-purple-200/80" : "text-gray-500"}`}>{event.description}</p>}
                                                        {event.image_url && (
                                                            <div className="mt-4">
                                                                <div className={`w-48 h-48 rounded-xl overflow-hidden border ${isDark ? "bg-slate-950 border-purple-500/20" : "bg-gray-50 border-gray-100"}`}>
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
                                                            <div className={`mt-4 p-3.5 rounded-xl border ${isDark ? "bg-purple-950/30 border-purple-500/20 text-white" : "bg-purple-50 border-purple-100"}`}>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <Mic className={`w-4 h-4 ${isDark ? "text-pink-400" : "text-purple-500"}`} />
                                                                    <span className="text-sm font-semibold">Ghi âm sự kiện</span>
                                                                </div>
                                                                <audio src={event.audio_url} controls className="w-full h-10" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Ticket perforation bottom */}
                                                    <div className={`ticket-perforation px-4 py-2 flex items-center justify-between ${isDark ? "border-purple-500/30 bg-purple-950/30" : "border-purple-200 bg-purple-50/50"}`}>
                                                        <span className={`text-[9px] font-mono ${isDark ? "text-purple-400/70" : "text-purple-400"}`}>ADMIT ONE</span>
                                                        <div className="flex items-center gap-1">
                                                            <Star className={`w-2.5 h-2.5 ${isDark ? "text-pink-400" : "text-purple-400"} fill-current`} />
                                                            <Star className={`w-2 h-2 ${isDark ? "text-purple-400" : "text-purple-300"} fill-current`} />
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
                            <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-purple-400" : "text-purple-500"}`}>Act IV</span>
                            <h2 className={`text-3xl font-black ${isDark ? "text-white" : "text-gray-800"}`}>Fandom Quiz</h2>
                        </div>
                        {gameTemplateId === "A" ? (
                            <IdolGameSection isDark={isDark} />
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
                            <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-purple-400" : "text-purple-500"}`}>Act V</span>
                            <h2 className={`text-3xl font-black ${isDark ? "text-white" : "text-gray-800"}`}>Gửi Idol</h2>
                        </div>
                        <IdolLetterBox slug={slug} initialLetters={data.letters} isDark={isDark} />
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {lightboxIndex !== null && data.galleries[lightboxIndex] && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeLightbox}>
                    <div className={`rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col ${isDark ? "bg-slate-900 text-white border border-purple-500/20" : "bg-white text-gray-800"}`} onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white flex-shrink-0">
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
                            <div className={`px-4 py-2 text-center text-sm ${isDark ? "text-purple-200" : "text-gray-600"}`}>{data.galleries[lightboxIndex].caption}</div>
                        )}
                        <div className={`flex justify-center items-center gap-4 p-4 border-t ${isDark ? "border-purple-500/20" : "border-gray-100"}`}>
                            <button onClick={prevImage} className={`p-2.5 rounded-full transition-all hover:scale-110 ${isDark ? "bg-purple-950/30 text-purple-400" : "bg-purple-50 text-purple-500"}`}><ChevronLeft className="w-5 h-5" /></button>
                            <button onClick={nextImage} className={`p-2.5 rounded-full transition-all hover:scale-110 ${isDark ? "bg-purple-950/30 text-purple-400" : "bg-purple-50 text-purple-500"}`}><ChevronRight className="w-5 h-5" /></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
