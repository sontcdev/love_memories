"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Link as PrismaLink, LinkConfig, Gallery, Timeline, Letter, LetterReply } from "@prisma/client";
import { Star, Calendar, Image as ImageIcon, Mail, ChevronUp, ChevronLeft, ChevronRight, Settings, Sparkles, X, Mic, Trophy, Disc, Sun, Moon } from "lucide-react";
import { GameSection } from "./GameSection";
import { LetterBox } from "./LetterBox";
import { VideoPlayer } from "@/components/media";

type LetterWithReplies = Letter & { replies: LetterReply[] };

type LinkWithRelations = PrismaLink & {
    config: LinkConfig | null;
    galleries: Gallery[];
    timelines: Timeline[];
    letters: LetterWithReplies[];
};

interface IdolTemplateProps {
    data: LinkWithRelations;
    slug: string;
}

export function IdolTemplate({ data, slug }: IdolTemplateProps) {
    const [activeSection, setActiveSection] = useState<string>("home");
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const profileData = data.profile_data as Record<string, string> | null;
    const [heartsCount, setHeartsCount] = useState(0);
    const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number }[]>([]);

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
        
        const newHeart = {
            id: Date.now() + Math.random(),
            x,
            y
        };
        
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

    // Countdown state
    const [nextAnniversary, setNextAnniversary] = useState<Date | null>(null);
    const [countdown, setCountdown] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    } | null>(null);

    // Track scroll position to show/hide scroll to top button
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Lightbox navigation
    const openLightbox = (index: number) => { setLightboxIndex(index); setIsPopupOpen(true); };
    const closeLightbox = () => { setLightboxIndex(null); setIsPopupOpen(false); };
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

    // Keyboard navigation for lightbox
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightboxIndex === null) return;
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'Escape') closeLightbox();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex, nextImage, prevImage]);

    // Calculate days since debut
    const getDaysSinceDebut = () => {
        if (!debutDate) return null;
        const start = new Date(debutDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysSinceDebut = getDaysSinceDebut();

    // Helper to detect if background color is dark
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

    const [overrideDark, setOverrideDark] = useState<boolean | null>(null);

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
                root.style.setProperty("--theme-bg", data.config?.background_color || "#ffffff");
            }
        }
    }, [slug, data.config?.background_color]);

    const isDark = overrideDark !== null ? overrideDark : isDarkBackground(data.config?.background_color);

    const handleThemeToggle = () => {
        const newDark = !isDark;
        setOverrideDark(newDark);
        localStorage.setItem(`theme_mode_${slug}`, newDark ? "dark" : "light");
        window.dispatchEvent(new CustomEvent("theme-change", { detail: { isDark: newDark } }));
        
        const root = document.documentElement;
        if (newDark) {
            root.style.setProperty("--theme-bg", "#0f0f12");
        } else {
            root.style.setProperty("--theme-bg", data.config?.background_color || "#ffffff");
        }
    };

    // Calculate next anniversary and countdown
    useEffect(() => {
        if (!debutDate) return;

        const calculateTimeLeft = () => {
            const debut = new Date(debutDate);
            const today = new Date();
            
            // Set target to this year's anniversary
            let target = new Date(today.getFullYear(), debut.getMonth(), debut.getDate());
            
            // If the anniversary has already passed this year, set it to next year
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

    return (
        <div className="min-h-screen relative transition-colors duration-500 overflow-x-hidden" style={{ backgroundColor: 'var(--theme-bg, #fff0f5)' }}>
            {/* Holographic Stage Backdrop Elements (concert theme) */}
            {/* Neon grid pattern */}
            <div className={`absolute inset-0 z-0 pointer-events-none opacity-[0.25] ${isDark ? 'cyber-grid' : 'cyber-grid-light'}`} />
            
            {/* Laser beams */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="laser-beam-1" />
                <div className="laser-beam-2" />
            </div>

            {/* Floating Bokeh Bubbles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
                <div className={`bokeh-bubble w-[350px] h-[350px] top-[10%] left-[-5%] ${isDark ? "bg-purple-600/10" : "bg-purple-300/20"}`} style={{ animationDuration: '25s' }} />
                <div className={`bokeh-bubble w-[400px] h-[400px] bottom-[10%] right-[-5%] ${isDark ? "bg-pink-500/10" : "bg-pink-300/20"}`} style={{ animationDuration: '30s', animationDelay: '-5s' }} />
                <div className={`bokeh-bubble w-[250px] h-[250px] top-[50%] left-[60%] ${isDark ? "bg-cyan-500/5" : "bg-cyan-300/15"}`} style={{ animationDuration: '20s', animationDelay: '-10s' }} />
            </div>

            {/* Floating music notes / stars drifting up */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute text-purple-400/20 text-2xl animate-drift-slow-1 bottom-0 left-[15%]">🎵</div>
                <div className="absolute text-pink-400/20 text-3xl animate-drift-slow-2 bottom-0 left-[35%]">🎶</div>
                <div className="absolute text-cyan-400/20 text-xl animate-drift-slow-3 bottom-0 left-[55%]">✨</div>
                <div className="absolute text-yellow-400/20 text-2xl animate-drift-slow-4 bottom-0 left-[75%]">⭐</div>
                <div className="absolute text-purple-400/20 text-xl animate-drift-slow-5 bottom-0 left-[90%]">🎵</div>
            </div>

            {/* Theme Toggle Button - Fixed */}
            {!isPopupOpen && (
                <button
                    onClick={handleThemeToggle}
                    className={`fixed top-4 right-16 z-30 p-3 rounded-full shadow-lg transition-all hover:scale-110 ${
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
            )}

            {/* Edit Button - Fixed */}
            {!isPopupOpen && (
                <Link
                    href={`/${slug}/edit`}
                    className={`fixed top-4 right-4 z-30 p-3 rounded-full shadow-lg transition-all hover:scale-110 ${
                        isDark 
                            ? "bg-slate-900/90 text-purple-400 border border-purple-500/30 hover:bg-slate-800" 
                            : "bg-white/90 text-gray-600 hover:bg-white"
                    }`}
                    title="Edit Page"
                >
                    <Settings className="w-5 h-5" />
                </Link>
            )}

            {/* Banner & Profile Section */}
            <div className="max-w-6xl mx-auto px-4 pt-6 relative z-10">
                {/* Cover Banner Card (Stage theme) */}
                <div className={`h-40 sm:h-48 md:h-56 rounded-3xl relative overflow-hidden shadow-lg border transition-all duration-500 ${
                    isDark 
                        ? "bg-gradient-to-r from-purple-950 via-slate-900 to-cyan-950 border-purple-500/25 shadow-[0_0_30px_rgba(168,85,247,0.2)]" 
                        : "bg-gradient-to-r from-purple-200 via-pink-100 to-cyan-100 border-white shadow-md"
                }`}>
                    {/* Stage lights spotlights overlay */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/15 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Glowing decorative circles */}
                    <div className="absolute -top-12 -left-12 w-48 h-48 bg-purple-500/25 rounded-full blur-2xl animate-pulse" />
                    <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-pink-500/25 rounded-full blur-2xl animate-pulse [animation-delay:1.5s]" />
                    
                    {/* Stage light beams overlaying the banner */}
                    <div className="absolute inset-0 flex justify-around opacity-45">
                        <div className="w-1/4 h-full bg-gradient-to-b from-purple-400/20 to-transparent transform -skew-x-12 origin-top animate-pulse" />
                        <div className="w-1/4 h-full bg-gradient-to-b from-pink-400/20 to-transparent transform skew-x-12 origin-top animate-pulse [animation-delay:1s]" />
                        <div className="w-1/4 h-full bg-gradient-to-b from-cyan-400/20 to-transparent transform -skew-x-6 origin-top animate-pulse [animation-delay:2s]" />
                    </div>

                    {/* Cute floating stickers inside banner */}
                    <div className="absolute top-4 left-6 text-lg opacity-40 animate-bounce">💖</div>
                    <div className="absolute top-6 right-12 text-lg opacity-40 animate-bounce [animation-delay:1.5s]">✨</div>
                    
                    {/* Spinning CD/Vinyl Record Decoration */}
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:block">
                        <div className="relative group cursor-pointer">
                            <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-md group-hover:bg-pink-500/30 transition-all scale-105" />
                            <div className="w-20 h-20 rounded-full bg-zinc-950 border border-zinc-800 shadow-2xl flex items-center justify-center animate-spin-slow group-hover:[animation-duration:4s]">
                                <div className="absolute inset-2 rounded-full border border-zinc-900/40 bg-[radial-gradient(circle,_transparent_30%,_rgba(255,255,255,0.05)_31%,_rgba(255,255,255,0.05)_40%,_transparent_41%)]" />
                                <div className="absolute inset-4 rounded-full border border-zinc-900/50" />
                                <div className="absolute inset-6 rounded-full border border-zinc-900/60" />
                                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-black" />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Banner title / slogan preview if available */}
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent flex flex-col justify-end text-white">
                        <span className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase opacity-75">IDOL ANNIVERSARY FAN PAGE</span>
                    </div>
                </div>
            </div>

            {/* Grid Layout Container */}
            <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Sidebar Column: Profile details, Slogan, Countdown, Send Hearts (on desktop) */}
                    <div className="lg:col-span-4 flex flex-col gap-6 -mt-12 sm:-mt-16 lg:-mt-24 relative z-20">
                        {/* Profile Info Card (Avatar, Name, Badges, Title, Slogan, Days Counter) */}
                        <div className={`rounded-3xl p-6 border flex flex-col items-center text-center transition-all duration-500 ${
                            isDark 
                                ? "bg-slate-900/80 border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.15)] text-white backdrop-blur-md" 
                                : "bg-white/80 backdrop-blur-md border border-white/50 shadow-lg text-gray-800"
                        }`}>
                            <div className="relative">
                                {/* Glowing Neon Ring Background */}
                                <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-60 blur-md scale-105 ${
                                    isDark ? "animate-pulse" : "opacity-30"
                                }`} />
                                
                                {/* Idol Avatar Main */}
                                <div className={`relative z-10 w-24 h-24 sm:w-32 sm:h-32 rounded-full p-1 shadow-2xl flex-shrink-0 transition-all ${
                                    isDark 
                                        ? "bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-400 shadow-[0_0_25px_rgba(168,85,247,0.5)]" 
                                        : "bg-gradient-to-br from-purple-400 to-pink-400 border-4 border-white"
                                }`}>
                                    {idolAvatar ? (
                                        <Image
                                            src={idolAvatar}
                                            alt={idolName}
                                            width={128}
                                            height={128}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className={`w-full h-full rounded-full flex items-center justify-center text-3xl font-bold ${
                                            isDark ? "bg-slate-950 text-purple-400" : "bg-white text-purple-400"
                                        }`}>
                                            {idolName.charAt(0)}
                                        </div>
                                    )}
                                </div>

                                {/* Fan Avatar (Overlap on bottom right) */}
                                <div className="absolute -bottom-1 -right-1 z-20">
                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full p-1 shadow-xl transition-all ${
                                        isDark 
                                            ? "bg-gradient-to-br from-cyan-400 to-purple-500 shadow-[0_0_12px_rgba(6,182,212,0.6)]" 
                                            : "bg-gradient-to-br from-cyan-300 to-purple-400 border-2 border-white"
                                    }`}>
                                        {fanAvatar ? (
                                            <Image
                                                src={fanAvatar}
                                                alt={fanName}
                                                width={48}
                                                height={48}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className={`w-full h-full rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                                                isDark ? "bg-slate-950 text-cyan-400" : "bg-white text-cyan-400"
                                            }`}>
                                                {fanName.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Badges / Names */}
                            <div className="mt-4 flex flex-col items-center gap-1">
                                <h2 className={`text-2xl font-extrabold tracking-wide ${isDark ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]" : "text-gray-800"}`}>
                                    {idolName}
                                </h2>
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                                    isDark 
                                        ? "bg-purple-950/60 text-purple-300 border border-purple-500/30" 
                                        : "bg-purple-100 text-purple-700"
                                }`}>
                                    <Star className="w-3 h-3 fill-current" />
                                    Fandom: {fanName}
                                </div>
                            </div>

                            {/* Title with cute font */}
                            <div className="mt-4 pt-4 border-t border-dashed w-full border-purple-500/20">
                                <h3
                                    className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"
                                    style={{ fontFamily: "var(--font-dancing-script), var(--font-pacifico), cursive" }}
                                >
                                    {title}
                                </h3>

                                {/* Slogan and Days Counter */}
                                {slogan && (
                                    <p className={`italic text-xs mt-2 max-w-xs mx-auto ${isDark ? "text-purple-200" : "text-gray-600"}`}>
                                        &ldquo;{slogan}&rdquo;
                                    </p>
                                )}
                                {daysSinceDebut && (
                                    <div className="flex items-center justify-center gap-1.5 mt-2">
                                        <span className={`text-xl font-black ${isDark ? "text-pink-400" : "text-purple-500"}`}>{daysSinceDebut}</span>
                                        <span className={isDark ? "text-purple-200/80 text-xs" : "text-gray-500 text-xs font-medium"}>ngày cùng {idolName}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Countdown Card (Only visible on desktop sidebar) */}
                        {countdown && nextAnniversary && (
                            <div className={`hidden lg:flex flex-col items-center gap-2.5 px-5 py-4 rounded-3xl border transition-all duration-500 ${
                                isDark 
                                    ? "bg-slate-900/80 border-cyan-500/25 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.15)] text-white" 
                                    : "bg-white/80 backdrop-blur-md border border-pink-100 shadow-md text-gray-800"
                            }`}>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase">
                                    <Sparkles className={`w-3.5 h-3.5 animate-pulse ${isDark ? "text-cyan-400" : "text-purple-500"}`} />
                                    <span className={isDark ? "text-cyan-300" : "text-purple-600"}>
                                        Kỷ niệm Debut sắp tới
                                    </span>
                                </div>
                                
                                <div className="flex gap-2 justify-center w-full">
                                    {[
                                        { label: "ngày", value: countdown.days },
                                        { label: "giờ", value: countdown.hours },
                                        { label: "phút", value: countdown.minutes },
                                        { label: "giây", value: countdown.seconds },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex flex-col items-center flex-1 min-w-[2.5rem]">
                                            <div className={`text-base font-black w-full py-1 rounded-xl text-center shadow-inner ${
                                                isDark 
                                                    ? "bg-slate-950/80 text-cyan-400 border border-cyan-500/20 shadow-[0_0_8px_rgba(6,182,212,0.1)]" 
                                                    : "bg-purple-50 text-purple-600"
                                            }`}>
                                                {String(item.value).padStart(2, '0')}
                                            </div>
                                            <span className={`text-[9px] mt-0.5 uppercase font-semibold ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                                {item.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Interactive heart counters widget (Only visible on desktop sidebar) */}
                        <div className={`hidden lg:flex flex-col items-center justify-center text-center p-5 rounded-3xl border transition-all duration-500 ${
                            isDark 
                                ? "bg-slate-900/80 border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)] backdrop-blur-md text-white" 
                                : "bg-white/80 backdrop-blur-md border border-white/30 shadow-md text-gray-800"
                        }`}>
                            <h4 className="text-xs font-semibold mb-2 opacity-80">Gửi tim yêu thương cho {idolName}</h4>
                            <button 
                                onClick={handleSendHeart}
                                className="relative group p-4 rounded-full bg-pink-500/10 hover:bg-pink-500/20 text-pink-500 border border-pink-500/20 hover:scale-110 active:scale-95 transition-all mb-3"
                            >
                                <Star className="w-8 h-8 fill-pink-500 animate-pulse" />
                                {/* Render floating hearts */}
                                {floatingHearts.map(heart => (
                                    <span 
                                        key={heart.id} 
                                        className="absolute text-pink-500 text-xl pointer-events-none animate-floatUp"
                                        style={{ left: `${heart.x}px`, top: `${heart.y}px` }}
                                    >
                                        ❤️
                                    </span>
                                ))}
                            </button>
                            <div className="text-xl font-bold tracking-wider text-pink-500">
                                {heartsCount.toLocaleString()}
                            </div>
                            <p className="text-[9px] text-gray-400 mt-1">Đã có {heartsCount} tình cảm được gửi đi</p>
                        </div>
                    </div>

                    {/* Right Main Column: Tabs + Tab Content */}
                    <div className="lg:col-span-8 flex flex-col gap-6 pt-4 lg:pt-0">
                        {/* Navigation Tabs (Glassmorphism bar) */}
                        <div className="flex justify-center lg:justify-start">
                            <div className={`inline-flex flex-wrap justify-center gap-1.5 p-1.5 rounded-3xl border transition-all duration-500 ${
                                isDark 
                                    ? "bg-slate-950/40 border-purple-500/15 backdrop-blur-md" 
                                    : "bg-white/60 border-purple-100/50 backdrop-blur-sm shadow-sm"
                            }`}>
                                {[
                                    { id: "home", icon: Disc, label: "Trang chủ" },
                                    { id: "gallery", icon: ImageIcon, label: "Khoảnh khắc" },
                                    { id: "timeline", icon: Trophy, label: "Sự nghiệp" },
                                    { id: "game", icon: Star, label: "Fandom Quiz" },
                                    { id: "letters", icon: Mail, label: "Gửi Idol" },
                                ].map((tab) => {
                                    const isActive = activeSection === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveSection(tab.id)}
                                            className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap hover:scale-[1.03] ${
                                                isActive
                                                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                                                    : isDark
                                                        ? "text-purple-300 hover:bg-slate-800/60"
                                                        : "text-gray-600 hover:bg-purple-50/50"
                                            }`}
                                        >
                                            <tab.icon className={`w-3.5 h-3.5 ${isActive ? "animate-spin-slow" : ""}`} />
                                            {tab.label}
                                            {tab.id === "gallery" && data.galleries.length > 0 && (
                                                <span className="text-[10px] opacity-70">({data.galleries.length})</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Content Section Container */}
                        <div id="content-section" className="w-full">

                            {/* Home Section (Dashboard Overview) */}
                            {activeSection === "home" && (
                                <section className="w-full space-y-8 animate-fadeIn">
                        {/* Billboard / Welcome Card with Glassmorphism */}
                        <div className={`rounded-3xl p-6 md:p-8 border relative overflow-hidden transition-all ${
                            isDark 
                                ? "bg-slate-900/75 border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.15)] text-white backdrop-blur-md" 
                                : "bg-white/75 backdrop-blur-md border border-white/40 shadow-xl text-gray-800"
                        }`}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl pointer-events-none" />
                            <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
                                <div className="flex-1 text-center md:text-left space-y-3">
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                                        isDark ? "bg-purple-950/60 text-purple-300 border border-purple-500/30" : "bg-purple-100 text-purple-700"
                                    }`}>
                                        <Sparkles className="w-3 h-3 text-yellow-400 fill-yellow-400 animate-pulse" />
                                        Chào mừng Fandom
                                    </span>
                                    <h3 className="text-xl sm:text-2xl font-bold">Góc Nhìn Của Những Kẻ Si Tình</h3>
                                    <p className={`text-sm leading-relaxed ${isDark ? "text-purple-200/80" : "text-gray-600"}`}>
                                        Nơi lưu giữ hành trình tuyệt vời, những khoảnh khắc rạng rỡ nhất của {idolName} cùng đại gia đình {fanName}. Hãy cùng khám phá các cột mốc sự nghiệp, hình ảnh rực rỡ và cùng gửi gắm những bức thư đong đầy tình cảm.
                                    </p>
                                </div>
                                <div className="shrink-0 relative">
                                    <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 transform rotate-3 hover:rotate-0 transition-transform ${
                                        isDark ? "border-purple-500/20 bg-slate-950" : "border-pink-200 bg-gray-50"
                                    }`}>
                                        {idolAvatar ? (
                                            <Image src={idolAvatar} alt={idolName} width={128} height={128} className="w-full h-full object-cover animate-float" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-purple-400">I</div>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-2 -left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wide shadow-md">
                                        Artist
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile-only Countdown and Hearts */}
                        <div className="flex flex-col gap-6 lg:hidden">
                            {countdown && nextAnniversary && (
                                <div className={`flex flex-col items-center gap-2.5 px-5 py-4 rounded-3xl border transition-all duration-500 ${
                                    isDark 
                                        ? "bg-slate-900/80 border-cyan-500/25 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.15)] text-white" 
                                        : "bg-white/80 backdrop-blur-md border border-pink-100 shadow-md text-gray-800"
                                }`}>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase">
                                        <Sparkles className={`w-3.5 h-3.5 animate-pulse ${isDark ? "text-cyan-400" : "text-purple-500"}`} />
                                        <span className={isDark ? "text-cyan-300" : "text-purple-600"}>
                                            Kỷ niệm Debut sắp tới
                                        </span>
                                    </div>
                                    
                                    <div className="flex gap-2 justify-center w-full">
                                        {[
                                            { label: "ngày", value: countdown.days },
                                            { label: "giờ", value: countdown.hours },
                                            { label: "phút", value: countdown.minutes },
                                            { label: "giây", value: countdown.seconds },
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex flex-col items-center flex-1 min-w-[2.5rem]">
                                                <div className={`text-base font-black w-full py-1 rounded-xl text-center shadow-inner ${
                                                    isDark 
                                                        ? "bg-slate-950/80 text-cyan-400 border border-cyan-500/20 shadow-[0_0_8px_rgba(6,182,212,0.1)]" 
                                                        : "bg-purple-50 text-purple-600"
                                                }`}>
                                                    {String(item.value).padStart(2, '0')}
                                                </div>
                                                <span className={`text-[9px] mt-0.5 uppercase font-semibold ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                                    {item.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className={`flex flex-col items-center justify-center text-center p-5 rounded-3xl border transition-all duration-500 ${
                                isDark 
                                    ? "bg-slate-900/80 border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)] backdrop-blur-md text-white" 
                                    : "bg-white/80 backdrop-blur-md border border-white/30 shadow-md text-gray-800"
                            }`}>
                                <h4 className="text-xs font-semibold mb-2 opacity-80">Gửi tim yêu thương cho {idolName}</h4>
                                <button 
                                    onClick={handleSendHeart}
                                    className="relative group p-4 rounded-full bg-pink-500/10 hover:bg-pink-500/20 text-pink-500 border border-pink-500/20 hover:scale-110 active:scale-95 transition-all mb-3"
                                >
                                    <Star className="w-8 h-8 fill-pink-500 animate-pulse" />
                                    {floatingHearts.map(heart => (
                                        <span 
                                            key={heart.id} 
                                            className="absolute text-pink-500 text-xl pointer-events-none animate-floatUp"
                                            style={{ left: `${heart.x}px`, top: `${heart.y}px` }}
                                        >
                                            ❤️
                                        </span>
                                    ))}
                                </button>
                                <div className="text-xl font-bold tracking-wider text-pink-500">
                                    {heartsCount.toLocaleString()}
                                </div>
                                <p className="text-[9px] text-gray-400 mt-1">Đã có {heartsCount} tình cảm được gửi đi</p>
                            </div>
                        </div>

                        {/* Fandom stats dashboard grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "Hình ảnh", value: data.galleries.length, desc: "Khoảnh khắc rạng rỡ", icon: ImageIcon, color: "text-purple-500 bg-purple-500/10" },
                                { label: "Sự kiện", value: data.timelines.length, desc: "Cột mốc sự nghiệp", icon: Calendar, color: "text-cyan-500 bg-cyan-500/10" },
                                { label: "Thư từ fan", value: data.letters.length, desc: "Lời gửi ngọt ngào", icon: Mail, color: "text-pink-500 bg-pink-500/10" },
                                { label: "Fandom Quiz", value: "Sẵn sàng", desc: "Độ thấu hiểu Idol", icon: Star, color: "text-yellow-500 bg-yellow-500/10" }
                            ].map((stat, idx) => (
                                <div key={idx} className={`rounded-xl p-4 border transition-all duration-350 ${
                                    isDark 
                                        ? "bg-slate-900/70 border-purple-500/20 backdrop-blur-md hover:border-purple-500/40" 
                                        : "bg-white/70 backdrop-blur-md border border-white/30 hover:border-purple-300 shadow-sm hover:shadow-md"
                                }`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold opacity-70">{stat.label}</span>
                                        <div className={`p-1.5 rounded-lg ${stat.color}`}>
                                            <stat.icon className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <div className="text-lg font-bold">{stat.value}</div>
                                    <div className="text-[9px] text-gray-400 truncate">{stat.desc}</div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Moments peek with Polaroids */}
                        {data.galleries.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-sm tracking-wider uppercase opacity-85 flex items-center gap-1.5">
                                        <Sparkles className="w-4 h-4 text-purple-400" />
                                        Khoảnh khắc nổi bật
                                    </h4>
                                    <button 
                                        onClick={() => setActiveSection("gallery")}
                                        className={`text-xs font-bold transition-colors ${
                                            isDark ? "text-purple-400 hover:text-purple-300" : "text-purple-600 hover:text-purple-700"
                                        }`}
                                    >
                                        Xem tất cả &rarr;
                                    </button>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    {data.galleries.slice(0, 3).map((item, index) => {
                                        const rotClasses = ["-rotate-3", "rotate-2", "-rotate-1"];
                                        const rotClass = rotClasses[index % rotClasses.length];
                                        return (
                                            <div 
                                                key={item.id}
                                                onClick={() => { setActiveSection("gallery"); openLightbox(index); }}
                                                className={`group p-2 pb-6 rounded-lg shadow-md cursor-pointer transition-all hover:scale-105 hover:rotate-0 duration-300 border ${rotClass} ${
                                                    isDark 
                                                        ? "bg-slate-900/90 border-purple-500/20 shadow-purple-950/20" 
                                                        : "bg-white border-gray-100 shadow-gray-200"
                                                }`}
                                            >
                                                <div className="relative aspect-square rounded overflow-hidden">
                                                    <Image src={item.image_url} alt={item.caption || "Moments"} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover transition-transform duration-300" />
                                                </div>
                                                {item.caption && (
                                                    <div className="mt-2 px-1 text-center">
                                                        <p className={`text-[9px] font-mono truncate ${isDark ? "text-purple-300" : "text-gray-500"}`}>
                                                            {item.caption}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Latest Milestones peek */}
                        {data.timelines.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-sm tracking-wider uppercase opacity-85 flex items-center gap-1.5">
                                        <Trophy className="w-4 h-4 text-yellow-500" />
                                        Cột mốc mới nhất
                                    </h4>
                                    <button 
                                        onClick={() => setActiveSection("timeline")}
                                        className={`text-xs font-bold transition-colors ${
                                            isDark ? "text-cyan-400 hover:text-cyan-300" : "text-cyan-600 hover:text-cyan-700"
                                        }`}
                                    >
                                        Xem hành trình &rarr;
                                    </button>
                                </div>
                                <div className={`rounded-2xl p-4 border transition-all ${
                                    isDark ? "bg-slate-900/70 border-purple-500/20 backdrop-blur-md text-white" : "bg-white/70 backdrop-blur-md border border-white/30 text-gray-800 shadow-sm"
                                }`}>
                                    {/* Show the last event */}
                                    {(() => {
                                        const latestEvent = data.timelines[data.timelines.length - 1];
                                        return (
                                            <div className="flex gap-4 items-start">
                                                <div className={`shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center text-white ${
                                                    isDark ? "bg-gradient-to-br from-purple-500 to-pink-500" : "bg-gradient-to-br from-indigo-400 to-purple-400"
                                                }`}>
                                                    <span className="text-lg font-bold leading-none">{new Date(latestEvent.date).getDate()}</span>
                                                    <span className="text-[10px] opacity-80">{new Date(latestEvent.date).toLocaleDateString("en", { month: "short" })}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="font-bold text-sm truncate">{latestEvent.title}</h5>
                                                    <p className={`text-xs mt-1 line-clamp-2 ${isDark ? "text-purple-200/70" : "text-gray-500"}`}>
                                                        {latestEvent.description}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {/* Gallery Section with Polaroids */}
                {activeSection === "gallery" && (
                    <section className="w-full py-8 relative z-10">
                        <h2 className={`text-2xl font-black text-center mb-8 ${isDark ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]" : "text-gray-800"}`}>
                            Những Khoảnh Khắc Đáng Nhớ 🌟
                        </h2>
                        {data.galleries.length === 0 ? (
                            <div className="text-center py-16 text-gray-400">
                                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p>Chưa có ảnh nào...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                {data.galleries.map((item, index) => {
                                    const rotClasses = ["-rotate-2", "rotate-2", "-rotate-1", "rotate-1", "-rotate-3", "rotate-3"];
                                    const rotClass = rotClasses[index % rotClasses.length];
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => openLightbox(index)}
                                            className={`group p-2.5 pb-8 rounded-xl shadow-md hover:shadow-xl transition-all hover:scale-105 hover:rotate-0 duration-300 cursor-pointer border ${rotClass} ${
                                                isDark 
                                                    ? "bg-slate-900/90 border-purple-500/20 shadow-purple-950/30" 
                                                    : "bg-white border-gray-100"
                                            }`}
                                        >
                                            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-50">
                                                <Image
                                                    src={item.image_url}
                                                    alt={item.caption || "Memory"}
                                                    fill
                                                    className="object-cover transition-transform duration-300 animate-fadeIn"
                                                />
                                            </div>
                                            <div className="mt-3 text-center px-1">
                                                <p className={`text-xs font-mono font-medium truncate ${isDark ? "text-purple-300" : "text-gray-600"}`}>
                                                    {item.caption || `Memory #${index + 1}`}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                )}

                {/* Gallery Lightbox */}
                {lightboxIndex !== null && data.galleries[lightboxIndex] && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeLightbox}>
                        <div className={`rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col ${isDark ? "bg-slate-900 text-white border border-purple-500/20" : "bg-white text-gray-800"}`} onClick={(e) => e.stopPropagation()}>
                            {/* Header */}
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white flex-shrink-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">
                                        {lightboxIndex + 1} / {data.galleries.length}
                                    </span>
                                    <button onClick={closeLightbox} className="hover:scale-110 transition-transform">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            {/* Image */}
                            <div className="flex-1 overflow-hidden flex items-center justify-center p-4 min-h-[300px]">
                                <div className="relative w-full aspect-[4/3] max-h-[55vh]">
                                    <Image
                                        src={data.galleries[lightboxIndex].image_url}
                                        alt={data.galleries[lightboxIndex].caption || "Photo"}
                                        fill
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                            </div>
                            {/* Caption */}
                            {data.galleries[lightboxIndex].caption && (
                                <div className={`px-4 py-2 text-center text-sm ${isDark ? "text-purple-200" : "text-gray-600"}`}>
                                    {data.galleries[lightboxIndex].caption}
                                </div>
                            )}
                            {/* Navigation */}
                            <div className={`flex justify-center items-center gap-4 p-4 border-t ${isDark ? "border-purple-500/20" : "border-gray-100"}`}>
                                <button
                                    onClick={prevImage}
                                    className={`p-2.5 rounded-full transition-all hover:scale-110 ${isDark ? "bg-purple-950/30 text-purple-400 hover:bg-purple-950/50" : "bg-purple-50 text-purple-500 hover:bg-purple-100"}`}
                                    aria-label="Ảnh trước"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className={`p-2.5 rounded-full transition-all hover:scale-110 ${isDark ? "bg-purple-950/30 text-purple-400 hover:bg-purple-950/50" : "bg-purple-50 text-purple-500 hover:bg-purple-100"}`}
                                    aria-label="Ảnh tiếp theo"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Timeline Section */}
                {activeSection === "timeline" && (
                    <section className="max-w-2xl mx-auto py-12 relative z-10">
                        <h2 className={`text-2xl font-bold text-center mb-8 ${isDark ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]" : "text-gray-800"}`}>
                            Hành Trình Sự Nghiệp ⭐
                        </h2>
                        {data.timelines.length === 0 ? (
                            <div className="text-center py-16 text-gray-400">
                                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p>Chưa có sự kiện nào...</p>
                            </div>
                        ) : (
                            <div className="relative">
                                {/* Timeline line */}
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
                                            icon = <Disc className="w-4 h-4 text-cyan-600 animate-spin-slow" />;
                                            dotBg = "from-cyan-400 to-blue-500 border-cyan-200";
                                            glowClass = "shadow-[0_0_10px_rgba(6,182,212,0.6)]";
                                        }

                                        return (
                                            <div key={event.id} className="relative pl-16">
                                                {/* Timeline dot with custom Icon */}
                                                <div className={`absolute left-2 w-9 h-9 rounded-full bg-gradient-to-br ${dotBg} border-2 shadow-md flex items-center justify-center z-10 ${glowClass}`}>
                                                    {icon}
                                                </div>

                                                <div className={`rounded-2xl p-5 shadow-md transition-all ${
                                                    isDark 
                                                        ? isAward 
                                                            ? "bg-gradient-to-br from-slate-900 to-amber-950/20 border border-amber-500/20 text-white shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:border-amber-500/40"
                                                            : isRelease
                                                                ? "bg-gradient-to-br from-slate-900 to-cyan-950/20 border border-cyan-500/20 text-white shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:border-cyan-500/40"
                                                                : "bg-slate-900/90 border border-purple-500/15 text-white shadow-[0_0_15px_rgba(168,85,247,0.08)] hover:border-purple-500/30"
                                                        : "bg-white border border-gray-100 hover:shadow-lg text-gray-800"
                                                }`}>
                                                    <div className={`text-xs font-semibold mb-1 ${isDark ? "text-purple-300" : "text-purple-400"}`}>
                                                        {new Date(event.date).toLocaleDateString("vi-VN", {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        })}
                                                    </div>
                                                    <h3 className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-gray-800"}`}>
                                                        {event.title}
                                                    </h3>
                                                    {event.description && (
                                                        <p className={`text-sm leading-relaxed ${isDark ? "text-purple-200/80" : "text-gray-500"}`}>
                                                            {event.description}
                                                        </p>
                                                    )}
                                                    
                                                    {event.image_url && (
                                                        <div className="mt-4 flex items-center gap-4">
                                                            {isRelease ? (
                                                                <div className="relative group/vinyl flex-shrink-0 w-36 h-36 sm:w-40 sm:h-40">
                                                                    {/* CD/Vinyl record sliding out */}
                                                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-zinc-950 border border-zinc-800 shadow-md flex items-center justify-center transition-all duration-500 group-hover/vinyl:translate-x-8 group-hover/vinyl:rotate-180 animate-spin-slow">
                                                                        {/* Grooves */}
                                                                        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border border-zinc-900 flex items-center justify-center">
                                                                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-zinc-900 flex items-center justify-center">
                                                                                {/* Inner CD label with center hole */}
                                                                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 p-0.5">
                                                                                    <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center">
                                                                                        <div className="w-3 h-3 rounded-full bg-slate-900 border border-zinc-700" />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {/* CD Cover Jacket */}
                                                                    <div className="relative z-10 w-36 h-36 sm:w-40 sm:h-40 rounded-xl overflow-hidden shadow-lg border border-purple-200/20 bg-zinc-900">
                                                                        <Image
                                                                            src={event.image_url}
                                                                            alt={event.title}
                                                                            width={160}
                                                                            height={160}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className={`w-48 h-48 rounded-xl overflow-hidden border ${
                                                                    isDark ? "bg-slate-950 border-purple-500/20" : "bg-gray-50 border-gray-100"
                                                                }`}>
                                                                    <Image
                                                                        src={event.image_url}
                                                                        alt={event.title}
                                                                        width={192}
                                                                        height={192}
                                                                        className="w-full h-full object-contain"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    {event.video_url && (
                                                        <div className="mt-4">
                                                            <VideoPlayer url={event.video_url} className="rounded-xl overflow-hidden border border-white/5 shadow-md" />
                                                        </div>
                                                    )}
                                                    {event.audio_url && (
                                                        <div className={`mt-4 p-3.5 rounded-xl border ${
                                                            isDark ? "bg-purple-950/30 border-purple-500/20 text-white" : "bg-purple-50 border-purple-100"
                                                        }`}>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Mic className={`w-4 h-4 ${isDark ? "text-pink-400" : "text-purple-500"}`} />
                                                                <span className="text-sm font-semibold">Ghi âm sự kiện</span>
                                                            </div>
                                                            <audio
                                                                src={event.audio_url}
                                                                controls
                                                                className="w-full h-10"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {/* Letters Section */}
                {activeSection === "letters" && (
                    <section className="max-w-2xl mx-auto py-12 relative z-10">
                        <LetterBox slug={slug} initialLetters={data.letters} theme="idol" isDark={isDark} onPopupOpenChange={setIsPopupOpen} />
                    </section>
                )}

                {/* Game Section */}
                {activeSection === "game" && (
                    <section className="w-full py-12 relative z-10">
                        <GameSection theme="idol" isDark={isDark} />
                    </section>
                )}

                        </div> {/* Close content-section */}
                    </div> {/* Close right column */}
                </div> {/* Close main grid container */}

                {/* Footer */}
                <footer className={`text-center py-8 text-sm ${isDark ? "text-purple-300/60" : "text-gray-400"} relative z-10`}>
                    <Star className="w-4 h-4 inline-block mr-1 text-purple-400 fill-purple-400 animate-pulse" />
                    Được tạo với tình yêu bởi Fandom
                </footer>

                {/* Scroll to Top Button */}
                {showScrollTop && !isPopupOpen && (
                    <button
                        onClick={scrollToTop}
                        className={`fixed bottom-24 right-6 z-40 p-3 rounded-full shadow-lg border transition-all hover:scale-110 ${
                            isDark 
                                ? "bg-slate-900 border-purple-500/30 text-purple-400 hover:bg-slate-800" 
                                : "bg-white/90 border-purple-100 text-purple-500 hover:bg-purple-50"
                        }`}
                        aria-label="Scroll to top"
                    >
                        <ChevronUp className="w-5 h-5" />
                    </button>
                )}

                {/* Custom Styles */}
                <style jsx>{`
                    @keyframes float {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-12px); }
                    }
                    .animate-float {
                        animation: float 4s ease-in-out infinite;
                    }
                    @keyframes spin-slow {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    .animate-spin-slow {
                        animation: spin-slow 8s linear infinite;
                    }
                    @keyframes floatUp {
                        0% { transform: translateY(0) scale(1); opacity: 1; }
                        100% { transform: translateY(-120px) scale(1.4); opacity: 0; }
                    }
                    .animate-floatUp {
                        animation: floatUp 1s ease-out forwards;
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fadeIn {
                        animation: fadeIn 0.5s ease-out forwards;
                    }

                    /* Cyber Grid Overlay */
                    .cyber-grid {
                        background-size: 40px 40px;
                        background-image: 
                            linear-gradient(to right, rgba(168, 85, 247, 0.04) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(168, 85, 247, 0.04) 1px, transparent 1px);
                    }
                    .cyber-grid-light {
                        background-size: 40px 40px;
                        background-image: 
                            linear-gradient(to right, rgba(168, 85, 247, 0.02) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(168, 85, 247, 0.02) 1px, transparent 1px);
                    }

                    /* Stage Laser Light Lines */
                    .laser-beam-1 {
                        position: absolute;
                        top: -10%;
                        left: 10%;
                        width: 2px;
                        height: 120%;
                        background: linear-gradient(to bottom, transparent, rgba(168, 85, 247, 0.15), transparent);
                        transform: rotate(35deg);
                        filter: blur(2px);
                        animation: sweep 12s infinite alternate ease-in-out;
                    }
                    .laser-beam-2 {
                        position: absolute;
                        top: -10%;
                        right: 15%;
                        width: 2px;
                        height: 120%;
                        background: linear-gradient(to bottom, transparent, rgba(236, 72, 153, 0.15), transparent);
                        transform: rotate(-35deg);
                        filter: blur(2px);
                        animation: sweep-reverse 15s infinite alternate ease-in-out;
                    }

                    @keyframes sweep {
                        0% { transform: rotate(30deg) translate(-20px, 0); opacity: 0.3; }
                        50% { opacity: 0.8; }
                        100% { transform: rotate(40deg) translate(20px, 0); opacity: 0.3; }
                    }

                    @keyframes sweep-reverse {
                        0% { transform: rotate(-40deg) translate(20px, 0); opacity: 0.3; }
                        50% { opacity: 0.8; }
                        100% { transform: rotate(-30deg) translate(-20px, 0); opacity: 0.3; }
                    }

                    /* Floating Bokeh Lights */
                    .bokeh-bubble {
                        position: absolute;
                        border-radius: 50%;
                        filter: blur(40px);
                        mix-blend-mode: screen;
                        animation: float-bokeh 20s infinite alternate ease-in-out;
                    }

                    @keyframes float-bokeh {
                        0% { transform: translate(0, 0) scale(1); }
                        50% { transform: translate(40px, -60px) scale(1.2); }
                        100% { transform: translate(-30px, 40px) scale(0.9); }
                    }

                    /* Drifting Particles */
                    @keyframes drift-slow {
                        0% { transform: translateY(100vh) rotate(0deg) scale(0.8); opacity: 0; }
                        10% { opacity: 0.5; }
                        90% { opacity: 0.5; }
                        100% { transform: translateY(-10vh) rotate(360deg) scale(1.2); opacity: 0; }
                    }
                    .animate-drift-slow-1 { animation: drift-slow 22s linear infinite; animation-delay: 0s; }
                    .animate-drift-slow-2 { animation: drift-slow 28s linear infinite; animation-delay: -5s; }
                    .animate-drift-slow-3 { animation: drift-slow 25s linear infinite; animation-delay: -12s; }
                    .animate-drift-slow-4 { animation: drift-slow 32s linear infinite; animation-delay: -8s; }
                    .animate-drift-slow-5 { animation: drift-slow 20s linear infinite; animation-delay: -17s; }
                `}</style>
            </div>
        </div>
    );
}
