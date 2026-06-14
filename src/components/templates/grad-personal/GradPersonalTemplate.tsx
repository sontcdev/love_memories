"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Link as PrismaLink, LinkConfig, Gallery, Timeline, Letter, LetterReply } from "@prisma/client";
import { Calendar, Image as ImageIcon, Mail, ChevronUp, ChevronLeft, ChevronRight, Settings, Sparkles, X, Target, Award, Coffee, Sun, Moon } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import { GameSection } from "./GameSection";
import { LetterBox } from "./LetterBox";

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

interface Petal {
    id: number;
    left: number;
    size: number;
    delay: number;
    duration: number;
    color: string;
    angle: number;
}

interface ThrownCap {
    id: number;
    left: number;
    delay: number;
    scale: number;
}

export function GradPersonalTemplate({ data, slug }: GradPersonalTemplateProps) {
    const [activeSection, setActiveSection] = useState<string>("gallery");
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const profileData = data.profile_data as GradPersonalProfileData | null;
    const [overrideDark, setOverrideDark] = useState<boolean | null>(null);

    // Gói 1: Particle States
    const [petals, setPetals] = useState<Petal[]>([]);
    const [thrownCaps, setThrownCaps] = useState<ThrownCap[]>([]);

    // Generate falling petals/flowers on mount
    useEffect(() => {
        const colors = [
            "#ef4444", // Phoenix red
            "#dc2626", // Deep red
            "#c084fc", // Bằng Lăng purple
            "#a855f7", // Deep purple
            "#f472b6", // Pinkish red
        ];
        const generated = Array.from({ length: 18 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            size: Math.random() * 12 + 8,
            delay: Math.random() * 8,
            duration: Math.random() * 8 + 6,
            color: colors[Math.floor(Math.random() * colors.length)],
            angle: Math.random() * 360,
        }));
        setPetals(generated);
    }, []);

    const handleThrowCaps = () => {
        const caps = Array.from({ length: 8 }).map((_, i) => ({
            id: Date.now() + i,
            left: 15 + Math.random() * 70, // spread horizontally
            delay: Math.random() * 0.4,
            scale: 0.7 + Math.random() * 0.5,
        }));
        setThrownCaps(prev => [...prev, ...caps]);
        // Remove after animation finishes
        setTimeout(() => {
            setThrownCaps(prev => prev.filter(c => !caps.find(cc => cc.id === c.id)));
        }, 2700);
    };

    // Read theme mode from localStorage
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
    const openLightbox = (index: number) => setLightboxIndex(index);
    const closeLightbox = () => setLightboxIndex(null);
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

    // Swipe handlers for mobile gallery navigation
    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => {
            if (lightboxIndex !== null) nextImage();
        },
        onSwipedRight: () => {
            if (lightboxIndex !== null) prevImage();
        },
        preventScrollOnSwipe: true,
        trackMouse: false,
    });

    return (
        <div className={`min-h-screen relative pb-16 transition-colors duration-500 bg-gradient-to-b ${isDark ? "from-[#0f0a07] to-[#1d120a]" : "from-[#3a2213] to-[#53331c]"} overflow-x-hidden`}>
            {/* Gói 1: Particle & Cap CSS Animations Injected Safely */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes petal-fall {
                    0% {
                        transform: translateY(-20px) rotate(var(--rot, 0deg)) translateX(0);
                        opacity: 0;
                    }
                    10% { opacity: 0.8; }
                    90% { opacity: 0.8; }
                    100% {
                        transform: translateY(105vh) rotate(calc(var(--rot, 0deg) + 360deg)) translateX(50px);
                        opacity: 0;
                    }
                }
                .animate-petal {
                    animation: petal-fall linear infinite;
                }
                @keyframes cap-fly-up {
                    0% {
                        transform: translateY(100vh) scale(0.4) rotate(0deg);
                        opacity: 0;
                    }
                    10% { opacity: 1; }
                    40% {
                        transform: translateY(-25vh) scale(1.1) rotate(180deg);
                    }
                    90% { opacity: 0.8; }
                    100% {
                        transform: translateY(100vh) scale(0.6) rotate(360deg);
                        opacity: 0;
                    }
                }
                .animate-cap {
                    animation: cap-fly-up 2.6s cubic-bezier(0.25, 1, 0.5, 1) forwards;
                }
            `}} />

            {/* Gói 1: Falling petals container */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                {petals.map((petal) => (
                    <div
                        key={petal.id}
                        style={{
                            left: `${petal.left}%`,
                            width: `${petal.size}px`,
                            height: `${petal.size * 0.75}px`,
                            backgroundColor: petal.color,
                            borderRadius: "50% 0 50% 50%",
                            animationDelay: `${petal.delay}s`,
                            animationDuration: `${petal.duration}s`,
                            '--rot': `${petal.angle}deg`,
                        } as React.CSSProperties}
                        className="absolute -top-10 animate-petal opacity-0"
                    />
                ))}
            </div>

            {/* Gói 1: Thrown Caps overlay */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
                {thrownCaps.map((cap) => (
                    <div
                        key={cap.id}
                        style={{
                            left: `${cap.left}%`,
                            animationDelay: `${cap.delay}s`,
                            transform: `scale(${cap.scale})`,
                        }}
                        className="absolute bottom-0 animate-cap opacity-0"
                    >
                        {/* Graduation Cap SVG */}
                        <svg viewBox="0 0 24 24" className="w-16 h-16 text-slate-900 fill-current drop-shadow-2xl">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M17 10v4.7c0 1.3-2.2 2.3-5 2.3s-5-1-5-2.3V10l5 2.5L17 10z" />
                            <path d="M21 7.5v8.5" className="stroke-yellow-500 stroke-[1.5]" />
                            <circle cx="21" cy="16" r="1.5" className="fill-yellow-500" />
                        </svg>
                    </div>
                ))}
            </div>

            {/* Wooden grain background texture simulator */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100%_4px]" />

            {/* Theme Toggle Button */}
            <button
                onClick={handleThemeToggle}
                className={`fixed top-4 right-16 z-30 p-3 rounded-full shadow-lg transition-all hover:scale-110 ${
                    isDark 
                        ? "bg-[#25201b]/95 text-yellow-400 border border-amber-900/30 hover:bg-[#332e28]" 
                        : "bg-white/95 text-amber-900 hover:bg-white border border-amber-900/10"
                }`}
                title={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
            >
                {isDark ? (
                    <Sun className="w-5 h-5" />
                ) : (
                    <Moon className="w-5 h-5" />
                )}
            </button>

            {/* Edit Button */}
            <Link
                href={`/${slug}/edit`}
                className={`fixed top-4 right-4 z-30 p-2.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all border ${
                    isDark 
                        ? "bg-[#25201b]/95 border-amber-900/30 text-amber-200 hover:bg-[#332e28]" 
                        : "bg-[#fefefe]/95 border-amber-900/10 text-[#3a2213] hover:bg-white"
                }`}
                title="Chỉnh sửa trang"
                aria-label="Chỉnh sửa trang"
            >
                <Settings className="w-5 h-5" />
            </Link>

            {/* Desk items layout (Only visible on PC for premium look) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 hidden lg:block opacity-75">
                {/* Coffee mug */}
                <div className={`absolute top-12 left-12 w-20 h-20 rounded-full shadow-2xl flex items-center justify-center border-4 ${isDark ? "bg-[#28201a] border-[#3e3229]" : "bg-[#ece6e2] border-[#dacdbf]"}`}>
                    <div className="w-12 h-12 rounded-full bg-[#5c4033] flex items-center justify-center text-xs font-mono text-[#dacdbf] font-semibold">
                        <Coffee className="w-5 h-5 animate-pulse" />
                    </div>
                </div>
                {/* Pen and Ruler */}
                <div className="absolute top-48 left-16 w-32 h-2 bg-yellow-400 rounded-full shadow-xl rotate-[45deg]" />
                <div className="absolute top-52 left-10 w-36 h-3 bg-slate-200 rounded shadow-xl rotate-[35deg] border-l-4 border-slate-400" />
                {/* Graduation cap */}
                <div className="absolute bottom-16 left-12 w-28 h-28 opacity-90 rotate-[-15deg] drop-shadow-2xl">
                    <div className="relative">
                        <div className="w-20 h-20 bg-slate-900 rotate-[45deg] mx-auto shadow-lg" />
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-16 h-8 bg-slate-950 rounded-b-full shadow-inner" />
                        <div className="absolute top-10 right-4 w-12 h-0.5 bg-yellow-500 origin-left rotate-[40deg]" />
                    </div>
                </div>
                {/* Pinned notes */}
                <div className={`absolute top-24 right-16 w-32 h-32 shadow-xl rotate-[6deg] p-3 border flex flex-col justify-between ${isDark ? "bg-[#2d2722]/95 border-amber-950/30 text-slate-300" : "bg-yellow-100/95 border-yellow-200 text-slate-700"}`}>
                    <div className="w-3.5 h-3.5 bg-red-500 rounded-full shadow absolute -top-1.5 left-1/2 -translate-x-1/2" />
                    <p className={`text-[10px] font-mono italic font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>NOTE: Thi đại học cố lên nha! 💪</p>
                    <span className="text-[8px] text-right text-slate-400 font-mono">12/12</span>
                </div>
            </div>

            {/* Hero Header */}
            <section className="relative z-10 flex flex-col items-center justify-center px-4 pt-16 pb-8 max-w-4xl mx-auto text-center">
                <div className="text-center px-4 w-full max-w-xl mx-auto">
                    
                    {/* Polaroid student avatar photo */}
                    <div 
                        onClick={handleThrowCaps}
                        className={`relative inline-block ${isDark ? "bg-[#25201b] border-amber-950/20 text-slate-100" : "bg-white border-slate-200 text-slate-700"} p-3 pb-6 border rounded-md shadow-2xl rotate-[-2deg] hover:rotate-0 transition-transform duration-300 mb-8 cursor-pointer group`}
                        title="Click để tung nón tốt nghiệp! 🎓"
                    >
                        {/* Washi tape decoration */}
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-20 h-5 bg-yellow-100/80 border border-yellow-200/50 rotate-[1deg] shadow-sm" />
                        
                        <div className="w-28 h-28 sm:w-32 sm:h-32 bg-slate-50 relative overflow-hidden rounded-sm border border-slate-100 mx-auto">
                            {studentAvatar ? (
                                <Image
                                    src={studentAvatar}
                                    alt={studentName}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-4xl">
                                    🎓
                                </div>
                            )}
                        </div>
                        <span className={`block font-serif italic text-sm mt-3 font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                            {studentName}
                        </span>
                        
                        {/* Interactive Hint */}
                        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[9px] font-sans font-bold px-2 py-0.5 rounded-full shadow-md scale-0 group-hover:scale-100 transition-all duration-200 whitespace-nowrap">
                            Tung nón tốt nghiệp! 🎓
                        </div>
                    </div>

                    {/* Class and school details written like chalk on wood */}
                    <p className="text-[#e2c19e] font-serif font-semibold text-sm sm:text-base mb-2">
                        Niên khóa {graduationYear} • Lớp {className} • Trường {schoolName}
                    </p>
                    <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto mb-6 italic font-serif">
                        &ldquo;{slogan}&rdquo;
                    </p>

                    {/* Dream tags */}
                    {(dreamJob || dreamUniversity) && (
                        <div className="flex flex-wrap justify-center gap-3 mb-8">
                            {dreamJob && (
                                <span className="inline-flex items-center gap-1.5 bg-[#e2c19e]/15 border border-[#e2c19e]/30 text-[#e2c19e] px-3 py-1.5 rounded-full text-xs font-semibold shadow-inner">
                                    <Target className="w-3.5 h-3.5" /> Mơ ước: {dreamJob}
                                </span>
                            )}
                            {dreamUniversity && (
                                <span className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-200 px-3 py-1.5 rounded-full text-xs font-semibold shadow-inner">
                                    <Award className="w-3.5 h-3.5" /> Đại học: {dreamUniversity}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Desk drawer navigation tabs */}
                    <div className="inline-flex flex-wrap justify-center gap-2 bg-black/30 p-1.5 rounded-full border border-white/5 shadow-md">
                        {[
                            { id: "gallery", icon: ImageIcon, label: "Album Lưu Giữ" },
                            { id: "timeline", icon: Calendar, label: "Hành Trình" },
                            { id: "roadmap", icon: Target, label: "Mục Tiêu" },
                            { id: "game", icon: Sparkles, label: "Thử Thách" },
                            { id: "letters", icon: Mail, label: "Hòm Lưu Bút" },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveSection(tab.id)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                                    activeSection === tab.id
                                        ? "bg-[#e2c19e] text-[#3a2213] shadow-md scale-105"
                                        : "text-slate-300 hover:text-[#e2c19e] hover:bg-white/5"
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                {tab.id === "gallery" && data.galleries.length > 0 && (
                                    <span className="text-xs opacity-75">({data.galleries.length})</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Notebook page content */}
            <main className="max-w-4xl mx-auto px-4 relative z-10">
                {/* Spiral notebook layout container */}
                <div className={`rounded-3xl p-6 sm:p-8 border-t-8 border-[#dacdbf] shadow-2xl relative transition-colors duration-500 ${isDark ? "bg-[#181512] text-slate-100" : "bg-[#fcfbf9] text-slate-800"}`}>
                    
                    {/* Ring binder holes design down the left edge (PC layout only) */}
                    <div className="absolute left-4 top-10 bottom-10 w-4 hidden md:flex flex-col justify-between pointer-events-none opacity-40 z-15">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className={`w-3.5 h-3.5 rounded-full ${isDark ? "bg-black/40 border-r border-[#181512]" : "bg-slate-900/20 border-r border-white"} flex items-center justify-center`}>
                                <div className={`w-2 h-2 rounded-full ${isDark ? "bg-amber-950/40" : "bg-[#53331c]/50"}`} />
                            </div>
                        ))}
                    </div>

                    <div className="md:pl-8">
                        {/* Gallery Section */}
                        {activeSection === "gallery" && (
                            <section className="space-y-6">
                                <h2 className={`text-xl sm:text-2xl font-serif font-bold mb-6 flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                                    <span className={`p-2 rounded-xl ${isDark ? "bg-amber-950/30 text-amber-300" : "bg-amber-50 text-amber-700"}`}>📸</span>
                                    Cuốn Album Lưu Bút
                                </h2>
                                {data.galleries.length === 0 ? (
                                    <div className="text-center py-16 text-slate-400 font-serif italic">
                                        <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                        <p>Chưa có hình ảnh nào được lưu trữ.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {data.galleries.map((item, index) => (
                                            <div
                                                key={item.id}
                                                onClick={() => openLightbox(index)}
                                                className={`group relative aspect-square rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all hover:scale-[1.01] border ${isDark ? "bg-zinc-950/40 border-zinc-800/80" : "bg-slate-50 border-slate-100"}`}
                                            >
                                                <Image
                                                    src={item.image_url}
                                                    alt={item.caption || "Kỷ niệm"}
                                                    fill
                                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                                {item.caption && (
                                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80 to-transparent p-3 pt-6 z-10">
                                                        <p className="text-white text-xs sm:text-sm truncate font-serif italic">{item.caption}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Timeline / Journey Section */}
                        {activeSection === "timeline" && (
                            <section className="space-y-6">
                                <h2 className={`text-xl sm:text-2xl font-serif font-bold mb-6 flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                                    <span className={`p-2 rounded-xl ${isDark ? "bg-amber-950/30 text-amber-300" : "bg-amber-50 text-amber-700"}`}>⏳</span>
                                    Hành Trình Trưởng Thành
                                </h2>
                                {data.timelines.length === 0 ? (
                                    <div className="text-center py-16 text-slate-400 font-serif italic">
                                        <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                        <p>Chưa ghi nhận cột mốc hành trình nào.</p>
                                    </div>
                                ) : (
                                    <div className={`relative pl-6 border-l ml-2 space-y-8 ${isDark ? "border-amber-700/40" : "border-amber-900/20"}`}>
                                        {data.timelines.map((event) => (
                                            <div key={event.id} className="relative">
                                                {/* Wax stamp dot style */}
                                                <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full shadow-md border-4 bg-amber-700 ${isDark ? "border-[#181512] bg-amber-500" : "border-white bg-amber-700"}`} />

                                                <div className={`transition-all rounded-2xl p-4 sm:p-5 border shadow-sm ${isDark ? "bg-zinc-900/40 hover:bg-[#201c18] border-zinc-850 text-slate-200" : "bg-slate-50/50 hover:bg-slate-50 border-slate-100 text-slate-800"}`}>
                                                    <span className={`text-xs font-semibold font-mono ${isDark ? "text-amber-300" : "text-amber-700"}`}>
                                                        {new Date(event.date).toLocaleDateString("vi-VN", {
                                                            month: "long",
                                                            year: "numeric",
                                                        })}
                                                    </span>
                                                    <h3 className={`text-base sm:text-lg font-serif font-bold mt-1 mb-2 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                                                        {event.title}
                                                    </h3>
                                                    {event.description && (
                                                        <p className={`text-sm leading-relaxed mb-3 font-serif italic ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                                                            &ldquo;{event.description}&rdquo;
                                                        </p>
                                                    )}

                                                    {event.image_url && (
                                                        <div className={`relative aspect-video max-w-md rounded-xl overflow-hidden shadow-inner border ${isDark ? "border-zinc-850" : "border-slate-200/50"}`}>
                                                            <Image
                                                                src={event.image_url}
                                                                alt={event.title}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Gói 4: Bản Đồ Mục Tiêu */}
                        {activeSection === "roadmap" && (
                            <section className="space-y-6">
                                <h2 className={`text-xl sm:text-2xl font-serif font-bold mb-2 flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                                    <span className={`p-2 rounded-xl ${isDark ? "bg-amber-950/30 text-amber-300" : "bg-amber-50 text-amber-700"}`}>🎯</span>
                                    Bản Đồ Mục Tiêu Tương Lai
                                </h2>
                                <p className={`text-xs sm:text-sm mb-6 font-serif italic ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                    Những cột mốc học tập, ước mơ và kế hoạch tương lai của {studentName}.
                                </p>

                                <div className="relative py-8 px-2 max-w-lg mx-auto">
                                    {/* Center connector line */}
                                    <div className={`absolute left-6 md:left-1/2 top-4 bottom-4 w-0.5 border-l-2 border-dashed ${isDark ? "border-amber-700/40" : "border-amber-900/20"} -translate-x-1/2`} />

                                    <div className="space-y-12">
                                        {(profileData?.goals && profileData.goals.length > 0 ? profileData.goals : [
                                            { id: "g1", title: "Tốt nghiệp THPT", description: "Vượt qua kỳ thi tốt nghiệp THPT với kết quả xuất sắc", status: "done" },
                                            { id: "g2", title: `Đỗ Đại học${dreamUniversity ? `: ${dreamUniversity}` : ""}`, description: `Đặt chân vào cổng trường đại học mơ ước`, status: "todo" },
                                            { id: "g3", title: "Khám phá đời sinh viên", description: "Học hỏi hết mình và rèn luyện kỹ năng sống", status: "todo" },
                                            { id: "g4", title: `Đạt công việc mơ ước${dreamJob ? `: ${dreamJob}` : ""}`, description: "Trở thành chuyên gia giỏi trong ngành nghề yêu thích", status: "todo" }
                                        ] as GoalItem[]).map((goal: GoalItem, idx: number) => {
                                            const isDone = goal.status === "done";
                                            const alignmentClass = idx % 2 === 0 ? "md:flex-row-reverse" : "md:flex-row";
                                            const textAlignmentClass = idx % 2 === 0 ? "md:text-right" : "md:text-left";
                                            const offsetClass = idx % 2 === 0 ? "md:pr-10" : "md:pl-10";

                                            return (
                                                <div key={goal.id} className={`flex items-start ${alignmentClass} relative w-full`}>
                                                    {/* Circle Node */}
                                                    <div className={`absolute left-6 md:left-1/2 w-8 h-8 rounded-full flex items-center justify-center z-10 border-4 -translate-x-1/2 transition-all duration-300 ${
                                                        isDone 
                                                            ? "bg-emerald-500 border-emerald-200 text-white shadow-lg shadow-emerald-500/20" 
                                                            : "bg-slate-200 border-slate-350 text-slate-550"
                                                    }`}>
                                                        {isDone ? "✓" : idx + 1}
                                                    </div>

                                                    {/* Content Card */}
                                                    <div className={`w-full pl-12 md:pl-0 md:w-1/2 ${offsetClass}`}>
                                                        <div className={`p-5 rounded-2xl border transition-all hover:shadow-md ${
                                                            isDone 
                                                                ? (isDark ? "bg-emerald-950/20 border-emerald-900/30 text-slate-100" : "bg-emerald-50/50 border-emerald-100 text-slate-800")
                                                                : (isDark ? "bg-zinc-900/40 border-zinc-800 text-slate-400" : "bg-slate-50 border-slate-100 text-slate-650")
                                                        }`}>
                                                            <div className={`flex items-center gap-2 mb-1.5 ${idx % 2 === 0 ? "md:justify-end" : "md:justify-start"}`}>
                                                                <h4 className="font-serif font-bold text-sm sm:text-base leading-tight">
                                                                    {goal.title}
                                                                </h4>
                                                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-sans font-bold uppercase ${
                                                                    isDone ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-500/10 text-slate-500"
                                                                }`}>
                                                                    {isDone ? "Đã đạt" : "Mục tiêu"}
                                                                </span>
                                                            </div>
                                                            <p className={`text-xs ${textAlignmentClass} font-serif italic`}>
                                                                {goal.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className={`max-w-md mx-auto p-4 rounded-xl text-center border font-serif italic text-xs ${
                                    isDark ? "bg-amber-950/15 border-amber-900/20 text-amber-200/80" : "bg-amber-50/50 border-amber-900/10 text-amber-900"
                                }`}>
                                    &ldquo;Vũ trụ sẽ đồng lòng giúp sức khi bạn nỗ lực hết mình hướng về mục tiêu! ✨&rdquo;
                                </div>
                            </section>
                        )}

                        {/* Challenges / Trivia Quiz Section (Gói 3) */}
                        {activeSection === "game" && (
                            <section className="space-y-6">
                                <h2 className={`text-xl sm:text-2xl font-serif font-bold mb-6 flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                                    <span className={`p-2 rounded-xl ${isDark ? "bg-amber-950/30 text-amber-300" : "bg-amber-50 text-amber-700"}`}>🎲</span>
                                    Thử Thách Độ Hiểu Nhau
                                </h2>
                                <GameSection quiz={profileData?.quiz} studentName={studentName} isDark={isDark} />
                            </section>
                        )}

                        {/* Time Capsule Wishes / Letters Section (Gói 2) */}
                        {activeSection === "letters" && (
                            <section className="space-y-6">
                                <h2 className={`text-xl sm:text-2xl font-serif font-bold mb-2 flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                                    <span className={`p-2 rounded-xl ${isDark ? "bg-amber-950/30 text-amber-300" : "bg-amber-50 text-amber-700"}`}>✉️</span>
                                    Bức Thư Thời Gian
                                </h2>
                                <p className={`text-xs sm:text-sm mb-6 font-serif italic ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                    Để lại những dòng lưu bút gửi gắm lời chúc ấm áp và cảm động dành cho {studentName}.
                                </p>
                                <LetterBox initialLetters={data.letters} slug={slug} theme="every" isDark={isDark} />
                            </section>
                        )}
                    </div>
                </div>
            </main>

            {/* Lightbox Modal */}
            {lightboxIndex !== null && data.galleries[lightboxIndex] && (
                <div
                    {...swipeHandlers}
                    className="fixed inset-0 z-50 bg-slate-950/98 flex flex-col items-center justify-center p-4 animate-fade-in"
                    onClick={closeLightbox}
                >
                    <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 z-20">
                        <span className="text-slate-300 text-sm font-medium">
                            {lightboxIndex + 1} / {data.galleries.length}
                        </span>
                        <button
                            onClick={closeLightbox}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                            aria-label="Đóng"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="relative w-full max-w-4xl flex-1 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <div className="relative w-full h-[70vh] aspect-[3/4] sm:aspect-[4/3] max-h-[75vh]">
                            <Image
                                src={data.galleries[lightboxIndex].image_url}
                                alt={data.galleries[lightboxIndex].caption || "Kỷ niệm"}
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>

                        {data.galleries.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                    className="absolute left-2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                                    aria-label="Ảnh trước"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                    className="absolute right-2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                                    aria-label="Ảnh kế tiếp"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </>
                        )}
                    </div>

                    {data.galleries[lightboxIndex].caption && (
                        <div className="w-full max-w-2xl text-center py-4 px-6 text-white z-10 font-serif italic">
                            <p className="text-sm sm:text-base font-light">
                                {data.galleries[lightboxIndex].caption}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Scroll To Top */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 z-30 p-3 bg-gradient-to-r from-amber-500 to-[#3a2213] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                    title="Lên đầu trang"
                    aria-label="Lên đầu trang"
                >
                    <ChevronUp className="w-5 h-5" />
                </button>
            )}
        </div>
    );
}
