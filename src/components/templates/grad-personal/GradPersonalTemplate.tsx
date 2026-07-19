"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Link as PrismaLink, LinkConfig, Gallery, Timeline, Letter, LetterReply } from "@prisma/client";
import { Calendar, Image as ImageIcon, Mail, ChevronLeft, ChevronRight, Settings, Sparkles, X, Target, Award, Sun, Moon, GraduationCap } from "lucide-react";
import { GameSection } from "./GameSection";
import { LetterBox } from "./LetterBox";
import { GameStub } from "@/components/templates/GameStub";
import { normalizeGameTemplate, getGameVariant } from "@/components/templates/game-registry";

type LetterWithReplies = Letter & { replies: LetterReply[] };

type LinkWithRelations = PrismaLink & {
    config: LinkConfig | null;
    galleries: Gallery[];
    timelines: Timeline[];
    letters: LetterWithReplies[];
};

interface QuizQuestion {
    question: string;
    options: string[];
    correctIndex: number;
}

interface GoalItem {
    id: string;
    title: string;
    description: string;
    status: "todo" | "done";
}

interface GradPersonalProfileData {
    student_name?: string;
    student_avatar?: string;
    class_name?: string;
    school_name?: string;
    graduation_year?: string;
    slogan?: string;
    dream_job?: string;
    dream_university?: string;
    title?: string;
    quiz?: QuizQuestion[];
    goals?: GoalItem[];
}

interface GradPersonalTemplateProps {
    data: LinkWithRelations;
    slug: string;
}

type WindowId = "profile" | "gallery" | "timeline" | "goals" | "game" | "letters";

interface WindowState {
    id: WindowId;
    isOpen: boolean;
    isMinimized: boolean;
    zIndex: number;
}

export function GradPersonalTemplate({ data, slug }: GradPersonalTemplateProps) {
    const [windows, setWindows] = useState<WindowState[]>([
        { id: "profile", isOpen: true, isMinimized: false, zIndex: 10 },
        { id: "gallery", isOpen: false, isMinimized: false, zIndex: 5 },
        { id: "timeline", isOpen: false, isMinimized: false, zIndex: 5 },
        { id: "goals", isOpen: false, isMinimized: false, zIndex: 5 },
        { id: "game", isOpen: false, isMinimized: false, zIndex: 5 },
        { id: "letters", isOpen: false, isMinimized: false, zIndex: 5 },
    ]);
    const [activeWindow, setActiveWindow] = useState<WindowId | null>("profile");
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const profileData = data.profile_data as GradPersonalProfileData | null;
    const gameTemplateId = normalizeGameTemplate(data.config?.game_template ?? null);
    const gameVariant = getGameVariant(data.type, gameTemplateId);
    const [overrideDark, setOverrideDark] = useState<boolean | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem(`theme_mode_${slug}`);
        if (saved) {
            const isSavedDark = saved === "dark";
            setOverrideDark(isSavedDark);
            const root = document.documentElement;
            if (isSavedDark) {
                root.style.setProperty("--theme-bg", "#0f0a07");
            } else {
                root.style.setProperty("--theme-bg", data.config?.background_color || "#3a2213");
            }
        }
    }, [slug, data.config?.background_color]);

    const isDark = overrideDark !== null ? overrideDark : false;

    const handleThemeToggle = () => {
        const newDark = !isDark;
        setOverrideDark(newDark);
        localStorage.setItem(`theme_mode_${slug}`, newDark ? "dark" : "light");
        window.dispatchEvent(new CustomEvent("theme-change", { detail: { isDark: newDark } }));
        const root = document.documentElement;
        if (newDark) {
            root.style.setProperty("--theme-bg", "#0f0a07");
        } else {
            root.style.setProperty("--theme-bg", data.config?.background_color || "#3a2213");
        }
    };

    const studentName = profileData?.student_name || "Học sinh";
    const studentAvatar = profileData?.student_avatar;
    const className = profileData?.class_name || "Lớp học";
    const schoolName = profileData?.school_name || "Trường học";
    const graduationYear = profileData?.graduation_year || "2026";
    const slogan = profileData?.slogan || "Hành trình vạn dặm bắt đầu từ một bước chân.";
    const dreamJob = profileData?.dream_job;
    const dreamUniversity = profileData?.dream_university;
    const goals = profileData?.goals || [];

    const bringToFront = (id: WindowId) => {
        setWindows(prev => prev.map(w => ({
            ...w,
            zIndex: w.id === id ? Math.max(...prev.map(p => p.zIndex)) + 1 : w.zIndex
        })));
        setActiveWindow(id);
    };

    const openWindow = (id: WindowId) => {
        setWindows(prev => prev.map(w => ({
            ...w,
            isOpen: w.id === id ? true : w.isOpen,
            isMinimized: w.id === id ? false : w.isMinimized,
            zIndex: w.id === id ? Math.max(...prev.map(p => p.zIndex)) + 1 : w.zIndex
        })));
        setActiveWindow(id);
    };

    const closeWindow = (id: WindowId) => {
        setWindows(prev => prev.map(w => ({
            ...w,
            isOpen: w.id === id ? false : w.isOpen
        })));
        if (activeWindow === id) setActiveWindow(null);
    };

    const minimizeWindow = (id: WindowId) => {
        setWindows(prev => prev.map(w => ({
            ...w,
            isMinimized: w.id === id ? true : w.isMinimized
        })));
    };

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
            if (lightboxIndex === null) return;
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'Escape') closeLightbox();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex, nextImage, prevImage]);

    const taskbarItems: { id: WindowId; label: string; icon: typeof ImageIcon }[] = [
        { id: "profile", label: "Profile", icon: GraduationCap },
        { id: "gallery", label: "Album", icon: ImageIcon },
        { id: "timeline", label: "Hành Trình", icon: Calendar },
        { id: "goals", label: "Mục Tiêu", icon: Target },
        { id: "game", label: "Thử Thách", icon: Sparkles },
        { id: "letters", label: "Lưu Bút", icon: Mail },
    ];

    const WindowChrome = ({ id, title, children, className = "" }: { id: WindowId; title: string; children: React.ReactNode; className?: string }) => {
        const win = windows.find(w => w.id === id);
        if (!win || !win.isOpen || win.isMinimized) return null;
        const isActive = activeWindow === id;

        return (
            <div
                className={`absolute transition-all duration-200 ${className}`}
                style={{ zIndex: win.zIndex }}
                onClick={() => bringToFront(id)}
            >
                <div className={`rounded-xl overflow-hidden shadow-2xl border ${isDark ? "bg-[#1a1612] border-amber-900/30" : "bg-white border-amber-200"} ${isActive ? "ring-2 ring-amber-400/50" : ""}`}>
                    {/* Title Bar */}
                    <div className={`flex items-center justify-between px-3 py-2 border-b ${isDark ? "bg-[#25201b] border-amber-900/20" : "bg-gradient-to-r from-amber-100 to-orange-50 border-amber-200"}`}>
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1.5">
                                <button onClick={() => closeWindow(id)} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors" />
                                <button onClick={() => minimizeWindow(id)} className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors" />
                                <button className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors" />
                            </div>
                            <span className={`text-xs font-semibold ${isDark ? "text-amber-200" : "text-amber-900"}`}>{title}</span>
                        </div>
                    </div>
                    {/* Content */}
                    <div className="max-h-[60vh] overflow-y-auto">
                        {children}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`min-h-screen relative transition-colors duration-500 overflow-hidden ${isDark ? "bg-gradient-to-br from-[#0f0a07] via-[#1a1208] to-[#0f0a07]" : "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50"}`}>
            <style jsx>{`
                @keyframes window-open {
                    0% { opacity: 0; transform: scale(0.9) translateY(20px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                .window-animate { animation: window-open 0.3s ease-out; }
                @keyframes desktop-icon-hover {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                @keyframes laurelSway {
                    0%, 100% { transform: rotate(-2deg); }
                    50% { transform: rotate(2deg); }
                }
                .laurel-left { animation: laurelSway 5s ease-in-out infinite; transform-origin: bottom center; }
                .laurel-right { animation: laurelSway 5s ease-in-out infinite reverse; transform-origin: bottom center; }
                @keyframes waxShimmer {
                    0%, 100% { box-shadow: 0 2px 8px rgba(180, 83, 9, 0.4), inset 0 1px 2px rgba(255, 220, 150, 0.3); }
                    50% { box-shadow: 0 2px 12px rgba(180, 83, 9, 0.6), inset 0 1px 3px rgba(255, 220, 150, 0.5); }
                }
                .wax-seal {
                    animation: waxShimmer 3s ease-in-out infinite;
                    background: radial-gradient(circle at 30% 30%, #f59e0b 0%, #b45309 60%, #78350f 100%);
                    box-shadow: 0 2px 8px rgba(180, 83, 9, 0.5), inset 0 1px 2px rgba(255, 220, 150, 0.3);
                }
                @keyframes phoenixRise {
                    0% { transform: translateY(20px) rotate(-5deg); opacity: 0; }
                    50% { opacity: 0.4; }
                    100% { transform: translateY(-10px) rotate(5deg); opacity: 0; }
                }
                .phoenix-accent { animation: phoenixRise 8s ease-in-out infinite; }
                @keyframes ribbonFlow {
                    0%, 100% { transform: skewX(-2deg); }
                    50% { transform: skewX(2deg); }
                }
                .ribbon-banner { animation: ribbonFlow 6s ease-in-out infinite; }
                @keyframes stampPress {
                    0% { opacity: 0; transform: scale(1.3) rotate(-20deg); }
                    60% { opacity: 0.8; transform: scale(0.95) rotate(-12deg); }
                    100% { opacity: 0.7; transform: scale(1) rotate(-10deg); }
                }
                .grad-stamp { animation: stampPress 0.5s ease-out both; }
                .diploma-border {
                    position: relative;
                }
                .diploma-border::before {
                    content: '';
                    position: absolute;
                    inset: 4px;
                    border: 1px double currentColor;
                    border-radius: inherit;
                    opacity: 0.3;
                    pointer-events: none;
                }
                .desk-wood-grain {
                    background-image:
                        repeating-linear-gradient(
                            90deg,
                            transparent 0px,
                            transparent 60px,
                            rgba(120, 53, 15, 0.03) 60px,
                            rgba(120, 53, 15, 0.03) 62px
                        ),
                        repeating-linear-gradient(
                            90deg,
                            transparent 0px,
                            transparent 120px,
                            rgba(180, 83, 9, 0.04) 120px,
                            rgba(180, 83, 9, 0.04) 121px
                        );
                }
                .desk-wood-grain-dark {
                    background-image:
                        repeating-linear-gradient(
                            90deg,
                            transparent 0px,
                            transparent 60px,
                            rgba(251, 191, 36, 0.04) 60px,
                            rgba(251, 191, 36, 0.04) 62px
                        ),
                        repeating-linear-gradient(
                            90deg,
                            transparent 0px,
                            transparent 120px,
                            rgba(217, 119, 6, 0.05) 120px,
                            rgba(217, 119, 6, 0.05) 121px
                        );
                }
            `}</style>

            {/* Desk wood grain + Phoenix accent */}
            <div className={`absolute inset-0 pointer-events-none ${isDark ? "desk-wood-grain-dark" : "desk-wood-grain"}`} />
            <svg className={`phoenix-accent absolute top-20 right-8 w-24 h-24 ${isDark ? "text-amber-500/20" : "text-amber-600/15"} pointer-events-none`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M50 90 Q 30 70, 35 50 Q 40 30, 50 20 Q 60 30, 65 50 Q 70 70, 50 90 Z" />
                <path d="M50 20 Q 45 10, 40 5 M 50 20 Q 55 10, 60 5" />
                <path d="M35 50 Q 25 45, 15 50 Q 25 55, 35 60" />
                <path d="M65 50 Q 75 45, 85 50 Q 75 55, 65 60" />
                <circle cx="50" cy="35" r="2" fill="currentColor" />
            </svg>
            <svg className={`phoenix-accent absolute bottom-32 left-8 w-20 h-20 ${isDark ? "text-orange-500/15" : "text-orange-600/10"} pointer-events-none`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ animationDelay: "3s" }}>
                <path d="M50 90 Q 30 70, 35 50 Q 40 30, 50 20 Q 60 30, 65 50 Q 70 70, 50 90 Z" />
                <path d="M35 50 Q 25 45, 15 50 Q 25 55, 35 60" />
                <path d="M65 50 Q 75 45, 85 50 Q 75 55, 65 60" />
            </svg>

            {/* Desktop Grid Pattern */}
            <div className={`absolute inset-0 pointer-events-none opacity-[0.03] bg-[repeating-linear-gradient(0deg,transparent,transparent_40px,currentColor_40px,currentColor_41px),repeating-linear-gradient(90deg,transparent,transparent_40px,currentColor_40px,currentColor_41px)] ${isDark ? "text-amber-200" : "text-amber-900"}`} />

            {/* Top Bar */}
            <div className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 border-b ${isDark ? "bg-[#1a1612]/95 border-amber-900/30" : "bg-white/95 border-amber-200 shadow-sm"} backdrop-blur-sm`}>
                <div className="flex items-center gap-3">
                    <GraduationCap className={`w-5 h-5 ${isDark ? "text-amber-400" : "text-amber-600"}`} />
                    <span className={`text-sm font-bold ${isDark ? "text-amber-200" : "text-amber-900"}`}>GradOS</span>
                    <span className={`text-xs ${isDark ? "text-amber-400/60" : "text-amber-600/60"}`}>v{graduationYear}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleThemeToggle} className={`p-2 rounded-lg transition-all hover:scale-110 ${isDark ? "text-yellow-400 hover:bg-amber-900/30" : "text-amber-700 hover:bg-amber-100"}`}>
                        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                    <Link href={`/${slug}/edit`} className={`p-2 rounded-lg transition-all hover:scale-110 ${isDark ? "text-amber-300 hover:bg-amber-900/30" : "text-amber-700 hover:bg-amber-100"}`}>
                        <Settings className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Desktop Area */}
            <div className="pt-14 pb-20 px-4 min-h-screen relative">
                {/* Desktop Icons */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 max-w-2xl mx-auto mb-8">
                    {taskbarItems.map((item) => {
                        const win = windows.find(w => w.id === item.id);
                        const isOpen = win?.isOpen && !win?.isMinimized;
                        return (
                            <button
                                key={item.id}
                                onDoubleClick={() => openWindow(item.id)}
                                onClick={() => openWindow(item.id)}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:scale-105 ${isOpen ? (isDark ? "bg-amber-900/30 ring-1 ring-amber-500/50" : "bg-amber-100 ring-1 ring-amber-400") : (isDark ? "hover:bg-amber-900/20" : "hover:bg-amber-50")}`}
                            >
                                <div className={`p-3 rounded-xl ${isDark ? "bg-[#25201b] border border-amber-900/30" : "bg-white border border-amber-200 shadow-sm"}`}>
                                    <item.icon className={`w-6 h-6 ${isDark ? "text-amber-400" : "text-amber-600"}`} />
                                </div>
                                <span className={`text-[10px] font-medium text-center ${isDark ? "text-amber-200" : "text-amber-900"}`}>{item.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Windows Container */}
                <div className="relative max-w-4xl mx-auto min-h-[60vh]">
                    {/* Profile Window */}
                    <WindowChrome id="profile" title={`${studentName} - Profile`} className="window-animate left-0 right-0 mx-auto max-w-md">
                        <div className={`p-6 text-center space-y-4 diploma-border ${isDark ? "text-amber-200" : "text-amber-900"}`}>
                            {/* Laurel wreath around avatar */}
                            <div className="relative inline-block">
                                {/* Left laurel */}
                                <svg className="laurel-left absolute -left-6 top-1/2 -translate-y-1/2 w-8 h-16 pointer-events-none" viewBox="0 0 32 64" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M16 60 Q 4 50, 6 30 Q 8 14, 16 4" strokeLinecap="round" />
                                    <ellipse cx="8" cy="20" rx="5" ry="3" transform="rotate(-30 8 20)" fill="currentColor" opacity="0.4" />
                                    <ellipse cx="6" cy="30" rx="5" ry="3" transform="rotate(-40 6 30)" fill="currentColor" opacity="0.4" />
                                    <ellipse cx="6" cy="40" rx="5" ry="3" transform="rotate(-50 6 40)" fill="currentColor" opacity="0.4" />
                                    <ellipse cx="8" cy="50" rx="5" ry="3" transform="rotate(-60 8 50)" fill="currentColor" opacity="0.4" />
                                </svg>
                                {/* Right laurel (mirror) */}
                                <svg className="laurel-right absolute -right-6 top-1/2 -translate-y-1/2 w-8 h-16 pointer-events-none" viewBox="0 0 32 64" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M16 60 Q 28 50, 26 30 Q 24 14, 16 4" strokeLinecap="round" />
                                    <ellipse cx="24" cy="20" rx="5" ry="3" transform="rotate(30 24 20)" fill="currentColor" opacity="0.4" />
                                    <ellipse cx="26" cy="30" rx="5" ry="3" transform="rotate(40 26 30)" fill="currentColor" opacity="0.4" />
                                    <ellipse cx="26" cy="40" rx="5" ry="3" transform="rotate(50 26 40)" fill="currentColor" opacity="0.4" />
                                    <ellipse cx="24" cy="50" rx="5" ry="3" transform="rotate(60 24 50)" fill="currentColor" opacity="0.4" />
                                </svg>
                                <div className={`inline-block p-1 rounded-full ${isDark ? "bg-gradient-to-br from-amber-500 to-orange-600" : "bg-gradient-to-br from-amber-400 to-orange-500"}`}>
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white">
                                        {studentAvatar ? (
                                            <Image src={studentAvatar} alt={studentName} width={96} height={96} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-amber-100 flex items-center justify-center text-3xl">🎓</div>
                                        )}
                                    </div>
                                </div>
                                {/* Wax seal stamp */}
                                <div className="wax-seal absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-white text-[8px] font-bold pointer-events-none">
                                    <GraduationCap className="w-4 h-4" />
                                </div>
                            </div>
                            {/* Ribbon banner for name */}
                            <div className={`relative inline-block ribbon-banner`}>
                                <div className={`relative px-6 py-1.5 ${isDark ? "bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-amber-50" : "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-white"} shadow-md`}>
                                    <h2 className="text-xl font-bold tracking-wide">{studentName}</h2>
                                    {/* Ribbon tails */}
                                    <div className={`absolute -left-2 top-0 bottom-0 w-2 ${isDark ? "bg-amber-900" : "bg-amber-600"}`} style={{ clipPath: "polygon(100% 0, 100% 100%, 0 50%)" }} />
                                    <div className={`absolute -right-2 top-0 bottom-0 w-2 ${isDark ? "bg-amber-900" : "bg-amber-600"}`} style={{ clipPath: "polygon(0 0, 0 100%, 100% 50%)" }} />
                                </div>
                            </div>
                            <p className={`text-sm ${isDark ? "text-amber-300/70" : "text-amber-700"}`}>Lớp {className} • {schoolName}</p>
                            <p className={`text-xs ${isDark ? "text-amber-400/60" : "text-amber-600"}`}>Niên khóa {graduationYear}</p>
                            <p className={`italic text-sm ${isDark ? "text-amber-200/80" : "text-amber-800"}`}>&ldquo;{slogan}&rdquo;</p>
                            {(dreamJob || dreamUniversity) && (
                                <div className="flex flex-wrap justify-center gap-2 pt-2">
                                    {dreamJob && (
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${isDark ? "bg-amber-900/30 text-amber-200 border border-amber-700/30" : "bg-amber-100 text-amber-800"}`}>
                                            <Target className="w-3 h-3" /> {dreamJob}
                                        </span>
                                    )}
                                    {dreamUniversity && (
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${isDark ? "bg-orange-900/30 text-orange-200 border border-orange-700/30" : "bg-orange-100 text-orange-800"}`}>
                                            <Award className="w-3 h-3" /> {dreamUniversity}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </WindowChrome>

                    {/* Gallery Window */}
                    <WindowChrome id="gallery" title="Album Lưu Bút" className="window-animate left-0 right-0 mx-auto max-w-2xl">
                        <div className="p-4">
                            {data.galleries.length === 0 ? (
                                <div className="text-center py-12 text-amber-500/60">
                                    <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm">Chưa có hình ảnh nào</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {data.galleries.map((item, index) => (
                                        <div
                                            key={item.id}
                                            onClick={() => openLightbox(index)}
                                            className={`aspect-square rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform border ${isDark ? "border-amber-900/30" : "border-amber-200"}`}
                                        >
                                            <Image src={item.image_url} alt={item.caption || "Memory"} fill className="object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </WindowChrome>

                    {/* Timeline Window */}
                    <WindowChrome id="timeline" title="Hành Trình" className="window-animate left-0 right-0 mx-auto max-w-2xl">
                        <div className="p-4">
                            {data.timelines.length === 0 ? (
                                <div className="text-center py-12 text-amber-500/60">
                                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm">Chưa có sự kiện nào</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {data.timelines.map((event) => (
                                        <div key={event.id} className={`relative p-4 rounded-xl border ${isDark ? "bg-[#25201b]/50 border-amber-900/20" : "bg-amber-50 border-amber-200"}`}>
                                            <div className="flex items-start justify-between gap-3 mb-1">
                                                <div className={`grad-stamp inline-block px-2.5 py-1 rounded border-2 ${isDark ? "border-amber-500/60 text-amber-400 bg-amber-950/30" : "border-amber-600 text-amber-700 bg-amber-100/60"}`} style={{ fontFamily: "'Courier New', monospace" }}>
                                                    <span className="text-[10px] font-bold tracking-widest uppercase">{new Date(event.date).toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" })}</span>
                                                </div>
                                                <Calendar className={`w-4 h-4 mt-1 ${isDark ? "text-amber-500/60" : "text-amber-500"}`} />
                                            </div>
                                            <h3 className={`font-bold mb-1 ${isDark ? "text-amber-100" : "text-amber-900"}`}>{event.title}</h3>
                                            {event.description && <p className={`text-sm ${isDark ? "text-amber-200/70" : "text-amber-700"}`}>{event.description}</p>}
                                            {event.image_url && (
                                                <div className="mt-3 rounded-lg overflow-hidden max-w-xs border-2 border-double" style={{ borderColor: isDark ? "rgba(217, 119, 6, 0.3)" : "rgba(180, 83, 9, 0.3)" }}>
                                                    <Image src={event.image_url} alt={event.title} width={200} height={150} className="w-full h-auto" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </WindowChrome>

                    {/* Goals Window */}
                    <WindowChrome id="goals" title="Mục Tiêu" className="window-animate left-0 right-0 mx-auto max-w-lg">
                        <div className="p-4">
                            {goals.length === 0 ? (
                                <div className="text-center py-12 text-amber-500/60">
                                    <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm">Chưa có mục tiêu nào</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {goals.map((goal) => (
                                        <div key={goal.id} className={`p-3 rounded-lg border flex items-start gap-3 ${isDark ? "bg-[#25201b]/50 border-amber-900/20" : "bg-amber-50 border-amber-200"}`}>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${goal.status === "done" ? (isDark ? "bg-green-600 border-green-500" : "bg-green-500 border-green-400") : (isDark ? "border-amber-700" : "border-amber-300")}`}>
                                                {goal.status === "done" && <span className="text-white text-xs">✓</span>}
                                            </div>
                                            <div>
                                                <h4 className={`font-semibold text-sm ${isDark ? "text-amber-100" : "text-amber-900"} ${goal.status === "done" ? "line-through opacity-60" : ""}`}>{goal.title}</h4>
                                                {goal.description && <p className={`text-xs mt-0.5 ${isDark ? "text-amber-300/70" : "text-amber-700"}`}>{goal.description}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </WindowChrome>

                    {/* Game Window */}
                    <WindowChrome id="game" title="Thử Thách" className="window-animate left-0 right-0 mx-auto max-w-2xl">
                        <div className="p-4">
                            {gameTemplateId === "A" ? (
                                <GameSection quiz={profileData?.quiz} studentName={studentName} isDark={isDark} />
                            ) : (
                                <GameStub variantId={gameTemplateId} label={gameVariant.label} description={gameVariant.description} isDark={isDark} />
                            )}
                        </div>
                    </WindowChrome>

                    {/* Letters Window */}
                    <WindowChrome id="letters" title="Hòm Lưu Bút" className="window-animate left-0 right-0 mx-auto max-w-2xl">
                        <div className="p-4">
                            <LetterBox slug={slug} initialLetters={data.letters} isDark={isDark} />
                        </div>
                    </WindowChrome>
                </div>
            </div>

            {/* Taskbar */}
            <div className={`fixed bottom-0 left-0 right-0 z-50 border-t ${isDark ? "bg-[#1a1612]/98 border-amber-900/30" : "bg-white/98 border-amber-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"} backdrop-blur-sm`}>
                <div className="flex items-center justify-center gap-1 px-2 py-2 overflow-x-auto">
                    {taskbarItems.map((item) => {
                        const win = windows.find(w => w.id === item.id);
                        const isOpen = win?.isOpen;
                        const isMinimized = win?.isMinimized;
                        const isActive = activeWindow === item.id && isOpen && !isMinimized;

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (!isOpen) {
                                        openWindow(item.id);
                                    } else if (isMinimized) {
                                        openWindow(item.id);
                                    } else if (isActive) {
                                        minimizeWindow(item.id);
                                    } else {
                                        bringToFront(item.id);
                                    }
                                }}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                                    isActive
                                        ? (isDark ? "bg-amber-600 text-white" : "bg-amber-500 text-white")
                                        : isOpen
                                            ? (isDark ? "bg-amber-900/40 text-amber-200 hover:bg-amber-900/60" : "bg-amber-100 text-amber-800 hover:bg-amber-200")
                                            : (isDark ? "text-amber-400/70 hover:bg-amber-900/30 hover:text-amber-300" : "text-amber-700 hover:bg-amber-50")
                                }`}
                            >
                                <item.icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{item.label}</span>
                                {isOpen && !isMinimized && <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Lightbox */}
            {lightboxIndex !== null && data.galleries[lightboxIndex] && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={closeLightbox}>
                    <div className={`rounded-xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col ${isDark ? "bg-[#1a1612] text-amber-100" : "bg-white text-amber-900"}`} onClick={(e) => e.stopPropagation()}>
                        <div className={`flex items-center justify-between p-3 border-b ${isDark ? "bg-[#25201b] border-amber-900/30" : "bg-amber-100 border-amber-200"}`}>
                            <span className="text-sm font-medium">{lightboxIndex + 1} / {data.galleries.length}</span>
                            <button onClick={closeLightbox} className="hover:scale-110 transition-transform"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="flex-1 overflow-hidden flex items-center justify-center p-4 min-h-[300px]">
                            <div className="relative w-full aspect-[4/3] max-h-[55vh]">
                                <Image src={data.galleries[lightboxIndex].image_url} alt={data.galleries[lightboxIndex].caption || "Photo"} fill className="object-contain" priority />
                            </div>
                        </div>
                        {data.galleries[lightboxIndex].caption && (
                            <div className={`px-4 py-2 text-center text-sm ${isDark ? "text-amber-200" : "text-amber-700"}`}>{data.galleries[lightboxIndex].caption}</div>
                        )}
                        <div className={`flex justify-center items-center gap-4 p-3 border-t ${isDark ? "border-amber-900/30" : "border-amber-200"}`}>
                            <button onClick={prevImage} className={`p-2 rounded-lg transition-all hover:scale-110 ${isDark ? "bg-amber-900/30 text-amber-400" : "bg-amber-100 text-amber-600"}`}><ChevronLeft className="w-5 h-5" /></button>
                            <button onClick={nextImage} className={`p-2 rounded-lg transition-all hover:scale-110 ${isDark ? "bg-amber-900/30 text-amber-400" : "bg-amber-100 text-amber-600"}`}><ChevronRight className="w-5 h-5" /></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
