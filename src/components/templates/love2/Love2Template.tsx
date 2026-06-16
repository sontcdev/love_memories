"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Link as PrismaLink, LinkConfig, Gallery, Timeline, Letter, LetterReply } from "@prisma/client";
import { Heart, Calendar, Image as ImageIcon, Mail, ChevronUp, ChevronLeft, ChevronRight, Settings, Sparkles, X, Sun, Moon } from "lucide-react";
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

interface Love2TemplateProps {
    data: LinkWithRelations;
    slug: string;
}

export function Love2Template({ data, slug }: Love2TemplateProps) {
    const [activeSection, setActiveSection] = useState<string>("home");
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const profileData = data.profile_data as Record<string, string> | null;
    const [overrideDark, setOverrideDark] = useState<boolean | null>(null);

    // Read from localStorage and apply on mount
    useEffect(() => {
        const saved = localStorage.getItem(`theme_mode_${slug}`);
        if (saved) {
            const isSavedDark = saved === "dark";
            setOverrideDark(isSavedDark);
            
            const root = document.documentElement;
            if (isSavedDark) {
                root.style.setProperty("--theme-bg", "#181614");
            } else {
                root.style.setProperty("--theme-bg", data.config?.background_color || "#faf6f0");
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
            root.style.setProperty("--theme-bg", "#181614");
        } else {
            root.style.setProperty("--theme-bg", data.config?.background_color || "#faf6f0");
        }
    };

    const boyName = profileData?.boy_name || "Him";
    const girlName = profileData?.girl_name || "Her";
    const boyAvatar = profileData?.boy_avatar;
    const girlAvatar = profileData?.girl_avatar;
    const anniversaryDate = profileData?.anniversary_date;
    const title = profileData?.title || `${boyName} & ${girlName}`;

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

    // Calculate days together
    const getDaysTogether = () => {
        if (!anniversaryDate) return null;
        const start = new Date(anniversaryDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysTogether = getDaysTogether();

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
        <div className={`min-h-screen relative pb-20 font-sans selection:bg-rose-200 transition-colors duration-500 ${isDark ? "dark bg-[#1a1816] text-slate-100" : "bg-[#faf6f0] text-gray-800"}`}>
            {/* Scrapbook grid patterns and tape assets decoration */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-[0.15]">
                <div className={`absolute inset-0 bg-[linear-gradient(rgba(0,0,0,${isDark ? "0.15" : "0.05"})_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,${isDark ? "0.15" : "0.05"})_1px,transparent_1px)] bg-[size:30px_30px]`} />
                <div className={`absolute w-[500px] h-[500px] rounded-full ${isDark ? "bg-rose-950/20" : "bg-rose-300"} blur-3xl top-10 left-[-100px]`} />
                <div className={`absolute w-[600px] h-[600px] rounded-full ${isDark ? "bg-purple-950/20" : "bg-purple-300"} blur-3xl bottom-10 right-[-150px]`} />
            </div>

            {/* Theme Toggle Button */}
            <button
                onClick={handleThemeToggle}
                className={`fixed top-4 right-16 z-30 p-3 rounded-full shadow-lg transition-all hover:scale-110 ${
                    isDark 
                        ? "bg-[#282420]/95 text-yellow-400 border border-rose-950/30 hover:bg-[#332e28]" 
                        : "bg-white/95 text-rose-500 hover:bg-white border border-rose-100/30"
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
                className={`fixed top-4 right-4 z-30 p-3 rounded-full shadow-lg transition-all border hover:scale-105 ${
                    isDark
                        ? "bg-[#282420]/95 border-rose-950/30 text-rose-400 hover:bg-[#332e28]"
                        : "bg-white/95 border-rose-100/30 text-rose-500 hover:bg-white"
                }`}
                title="Chỉnh sửa trang"
                aria-label="Chỉnh sửa trang"
            >
                <Settings className="w-5 h-5" />
            </Link>

            {/* Main Header / Cover */}
            <section className="relative z-10 flex flex-col items-center justify-center px-4 pt-16 pb-8 max-w-3xl mx-auto text-center">
                {/* Anniversary Counter Pinned */}
                {daysTogether && (
                    <div className="mb-6 relative animate-bounce-slow">
                        {/* Washi tape graphic mock */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-yellow-100/70 border border-yellow-200/50 rotate-[-2deg] z-10 shadow-sm flex items-center justify-center text-[10px] text-gray-500/70 font-mono">
                            ★ SWEET DAYS ★
                        </div>
                        <div className={`border-2 border-dashed ${isDark ? "bg-[#282420] border-rose-900/40" : "bg-white border-rose-200"} px-6 py-4 rounded-3xl shadow-xl flex flex-col items-center`}>
                            <span className="text-4xl font-bold text-rose-500 tracking-tight">{daysTogether}</span>
                            <span className="text-xs uppercase tracking-wider text-rose-400 font-semibold mt-0.5">Ngày bên nhau</span>
                        </div>
                    </div>
                )}

                {/* Profiles card */}
                <div className={`${isDark ? "bg-[#282420]/95 border-rose-900/30 text-slate-100" : "bg-white/95 border-rose-100/50 text-gray-800"} border backdrop-blur-md rounded-[2rem] p-6 sm:p-8 shadow-2xl w-full max-w-md mx-auto mb-8 relative`}>
                    {/* Corner photo corners styling */}
                    <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-rose-300 rounded-tl-lg" />
                    <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-rose-300 rounded-tr-lg" />
                    <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-rose-300 rounded-bl-lg" />
                    <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-rose-300 rounded-br-lg" />

                    <div className="flex items-center justify-center gap-6 mb-4">
                        {/* Boy Avatar */}
                        <div className="flex flex-col items-center">
                            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden p-1 border-2 ${isDark ? "bg-zinc-950 border-rose-900/20" : "bg-rose-50 border-rose-100/40"} shadow-md rotate-[-3deg] hover:rotate-0 transition-transform duration-300`}>
                                {boyAvatar ? (
                                    <Image src={boyAvatar} alt={boyName} width={96} height={96} className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                    <div className="w-full h-full bg-rose-50 flex items-center justify-center text-2xl font-bold text-rose-300">👦</div>
                                )}
                            </div>
                            <span className={`text-xs sm:text-sm font-semibold mt-2 truncate max-w-[90px] ${isDark ? "text-slate-200" : "text-slate-700"}`}>{boyName}</span>
                        </div>

                        {/* Pulsing Heart Connect */}
                        <div className="flex flex-col items-center">
                            <Heart className="w-8 h-8 text-rose-500 fill-rose-500 animate-heartbeat" />
                        </div>

                        {/* Girl Avatar */}
                        <div className="flex flex-col items-center">
                            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden p-1 border-2 ${isDark ? "bg-zinc-950 border-rose-900/20" : "bg-rose-50 border-rose-100/40"} shadow-md rotate-[3deg] hover:rotate-0 transition-transform duration-300`}>
                                {girlAvatar ? (
                                    <Image src={girlAvatar} alt={girlName} width={96} height={96} className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                    <div className="w-full h-full bg-rose-50 flex items-center justify-center text-2xl font-bold text-rose-300">👧</div>
                                )}
                            </div>
                            <span className={`text-xs sm:text-sm font-semibold mt-2 truncate max-w-[90px] ${isDark ? "text-slate-200" : "text-slate-700"}`}>{girlName}</span>
                        </div>
                    </div>

                    <h1 className={`text-3xl font-serif font-bold tracking-tight mb-2 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                        {title}
                    </h1>

                    {profileData?.short_note && (
                        <p className={`italic text-sm font-serif max-w-xs mx-auto ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            &ldquo;{profileData.short_note}&rdquo;
                        </p>
                    )}
                </div>

                {/* Scrapbook Tabs Header */}
                <div className={`inline-flex flex-wrap justify-center gap-2 p-1.5 rounded-full border shadow-md ${isDark ? "bg-[#282420]/75 border-rose-900/30 text-slate-100" : "bg-white/70 border-rose-100 text-gray-800"} backdrop-blur-md`}>
                    {[
                        { id: "home", icon: Heart, label: "Home" },
                        { id: "gallery", icon: ImageIcon, label: "Scrapbook" },
                        { id: "timeline", icon: Calendar, label: "Kỷ Niệm" },
                        { id: "game", icon: Sparkles, label: "Trò Chơi" },
                        { id: "letters", icon: Mail, label: "Lưu Bút" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSection(tab.id)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                                activeSection === tab.id
                                    ? "bg-rose-500 text-white shadow-md scale-105"
                                    : "text-slate-600 hover:bg-rose-50"
                            }`}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* Content Display */}
            <main className="max-w-4xl mx-auto px-4 relative z-10">
                {/* Home Cover / Sweet Note Page */}
                {activeSection === "home" && (
                    <div className={`${isDark ? "bg-[#282420]/80 border-rose-900/30 text-slate-100" : "bg-white/80 border-rose-100/50 text-gray-800"} backdrop-blur-md rounded-3xl p-6 sm:p-8 border shadow-xl max-w-xl mx-auto text-center space-y-6`}>
                        <h2 className={`text-2xl font-serif font-bold ${isDark ? "text-slate-100" : "text-gray-800"}`}>Gửi Cậu, Người Tớ Thương 💕</h2>
                        <div className={`relative p-6 ${isDark ? "bg-rose-950/20 border-rose-900/40 text-slate-300" : "bg-rose-50/50 border-rose-200 text-slate-600"} border border-dashed rounded-2xl italic font-serif text-sm sm:text-base leading-relaxed`}>
                            {/* Washi tape decoration */}
                            <div className="absolute -top-2.5 left-6 w-16 h-5 bg-pink-100/70 rotate-[-1deg] border border-pink-200/50 shadow-sm" />
                            &ldquo;Thanh xuân của tớ thật đẹp vì có sự xuất hiện của cậu. Cám ơn cậu vì đã luôn đồng hành, luôn yêu thương và là một phần quan trọng nhất trong cuộc đời tớ.&rdquo;
                        </div>
                        <div className="text-xs text-rose-400 font-semibold uppercase tracking-widest flex items-center justify-center gap-2">
                            <span>Forever & Always</span>
                            <Heart className="w-3 h-3 fill-rose-400" />
                        </div>
                    </div>
                )}

                {/* Polaroid Scrapbook Gallery */}
                {activeSection === "gallery" && (
                    <section className={`${isDark ? "bg-[#282420]/85 border-rose-900/30 text-slate-100" : "bg-white/85 border-rose-100/40 text-gray-800"} backdrop-blur-md rounded-[2.5rem] p-6 sm:p-8 border shadow-2xl`}>
                        <h2 className={`text-2xl font-serif font-bold ${isDark ? "text-slate-100" : "text-gray-800"} text-center mb-8 flex items-center justify-center gap-2`}>
                            <span className="text-xl">📸</span> Album Scrapbook Polaroid
                        </h2>
                        {data.galleries.length === 0 ? (
                            <div className="text-center py-16 text-slate-400">
                                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                <p>Cuốn album ảnh hiện chưa có ảnh nào...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {data.galleries.map((item, index) => {
                                    // Random skew rotation for a natural scrapbook feel
                                    const rotations = ["rotate-[-2deg]", "rotate-[1deg]", "rotate-[2deg]", "rotate-[-1deg]"];
                                    const rotClass = rotations[index % rotations.length];
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => openLightbox(index)}
                                            className={`${isDark ? "bg-[#332e28] border-rose-900/20 text-slate-200" : "bg-white border-slate-150 text-gray-800"} p-3 pb-6 border rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer ${rotClass} relative`}
                                        >
                                            {/* Washi tape effect */}
                                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-16 h-5 bg-yellow-100/60 border border-yellow-200/40 shadow-sm opacity-80" />
                                            
                                            {/* Image container */}
                                            <div className={`aspect-square relative overflow-hidden ${isDark ? "bg-zinc-950 border-rose-950/20" : "bg-slate-50 border-slate-100"} rounded-md border`}>
                                                <Image
                                                    src={item.image_url}
                                                    alt={item.caption || "Love Memory"}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>

                                            {/* Caption styled as handwriting */}
                                            {item.caption && (
                                                <p className={`text-center font-serif italic text-xs mt-3 truncate px-1 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                                                    {item.caption}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                )}

                {/* Timeline Story Ribbon */}
                {activeSection === "timeline" && (
                    <section className={`${isDark ? "bg-[#282420]/85 border-rose-900/30 text-slate-100" : "bg-white/85 border-rose-100/40 text-gray-800"} backdrop-blur-md rounded-[2.5rem] p-6 sm:p-8 border shadow-2xl`}>
                        <h2 className={`text-2xl font-serif font-bold ${isDark ? "text-slate-100" : "text-gray-800"} text-center mb-10 flex items-center justify-center gap-2`}>
                            <span className="text-xl">🌸</span> Nhật Ký Câu Chuyện Chúng Ta
                        </h2>
                        {data.timelines.length === 0 ? (
                            <div className="text-center py-16 text-slate-400">
                                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                <p>Dòng thời gian câu chuyện hiện chưa ghi nhận sự kiện nào.</p>
                            </div>
                        ) : (
                            <div className="relative pl-6 border-l-2 border-dashed border-rose-300 ml-4 space-y-8">
                                {data.timelines.map((event) => (
                                    <div key={event.id} className="relative">
                                        {/* Heart Icon Connector */}
                                        <div className="absolute -left-[33px] top-1 w-5 h-5 rounded-full bg-rose-500 border-4 border-white flex items-center justify-center shadow-md" style={isDark ? { borderColor: "#1a1816" } : {}}>
                                            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                        </div>

                                        {/* Scrapbook Diary Card */}
                                        <div className={`${isDark ? "bg-[#332e28]/50 hover:bg-[#332e28] border-rose-900/20 text-slate-200" : "bg-slate-50/50 hover:bg-slate-50 border-rose-50/50"} border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all`}>
                                            <div className="text-xs font-semibold text-rose-500 mb-1 flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(event.date).toLocaleDateString("vi-VN", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </div>
                                            <h3 className={`text-base sm:text-lg font-serif font-bold mb-2 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                                                {event.title}
                                            </h3>
                                            
                                            {event.description && (
                                                <p className={`text-sm leading-relaxed mb-4 whitespace-pre-wrap font-serif italic ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                                                    &ldquo;{event.description}&rdquo;
                                                </p>
                                            )}

                                            {event.image_url && (
                                                <div className={`relative aspect-video max-w-md rounded-xl overflow-hidden shadow-md border ${isDark ? "border-rose-950/20" : "border-rose-100/40"}`}>
                                                    <Image src={event.image_url} alt={event.title} fill className="object-cover" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* Interactive Envelope Letterbox */}
                {activeSection === "letters" && (
                    <section className={`${isDark ? "bg-[#282420]/85 border-rose-900/30 text-slate-100" : "bg-white/85 border-rose-100/40 text-gray-800"} backdrop-blur-md rounded-[2.5rem] p-6 sm:p-8 border shadow-2xl`}>
                        <h2 className={`text-2xl font-serif font-bold ${isDark ? "text-slate-100" : "text-gray-800"} text-center mb-2 flex items-center justify-center gap-2`}>
                            <span className="text-xl">✉️</span> Thư Tình Bỏ Túi
                        </h2>
                        <p className={`text-xs sm:text-sm text-center mb-6 max-w-sm mx-auto ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                            Tất cả những lá thư ngọt ngào nhất được lưu trữ tại hòm thư này.
                        </p>
                        <LetterBox initialLetters={data.letters} slug={slug} theme="love" isDark={isDark} />
                    </section>
                )}

                {/* Challenge Game Section */}
                {activeSection === "game" && (
                    <section className={`${isDark ? "bg-[#282420]/85 border-rose-900/30 text-slate-100" : "bg-white/85 border-rose-100/40 text-gray-800"} backdrop-blur-md rounded-[2.5rem] p-6 sm:p-8 border shadow-2xl`}>
                        <h2 className={`text-2xl font-serif font-bold ${isDark ? "text-slate-100" : "text-gray-800"} text-center mb-6 flex items-center justify-center gap-2`}>
                            <span className="text-xl">🎲</span> Thử Thách Tình Yêu
                        </h2>
                        <GameSection theme="love" isDark={isDark} />
                    </section>
                )}
            </main>

            {/* Lightbox Modal */}
            {lightboxIndex !== null && data.galleries[lightboxIndex] && (
                <div
                    {...swipeHandlers}
                    className="fixed inset-0 z-50 bg-slate-950/98 flex flex-col items-center justify-center p-4 animate-fade-in"
                    onClick={closeLightbox}
                >
                    {/* Header */}
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

                    {/* Image Container */}
                    <div className="relative w-full max-w-4xl flex-1 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <div className="relative w-full h-[70vh] aspect-[3/4] sm:aspect-[4/3] max-h-[75vh]">
                            <Image
                                src={data.galleries[lightboxIndex].image_url}
                                alt={data.galleries[lightboxIndex].caption || "Photo"}
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

                    {/* Caption */}
                    {data.galleries[lightboxIndex].caption && (
                        <div className="w-full max-w-2xl text-center py-4 px-6 text-white z-10 font-serif italic">
                            <p className="text-sm sm:text-base font-light">
                                {data.galleries[lightboxIndex].caption}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Scroll to top */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 z-30 p-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                    title="Lên đầu trang"
                    aria-label="Lên đầu trang"
                >
                    <ChevronUp className="w-5 h-5" />
                </button>
            )}

            {/* Styles */}
            <style jsx>{`
                @keyframes heartbeat {
                    0% { transform: scale(1); }
                    14% { transform: scale(1.12); }
                    28% { transform: scale(1); }
                    42% { transform: scale(1.12); }
                    70% { transform: scale(1); }
                }
                .animate-heartbeat {
                    animation: heartbeat 1.4s infinite ease-in-out;
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
}
