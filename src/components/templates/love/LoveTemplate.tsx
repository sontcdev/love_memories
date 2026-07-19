"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Link as PrismaLink, LinkConfig, Gallery, Timeline, Letter, LetterReply } from "@prisma/client";
import { Heart, Calendar, Image as ImageIcon, Mail, ChevronLeft, ChevronRight, Settings, Sparkles, X, BookOpen, Flower2 } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import { LoveLetterBox } from "./LoveLetterBox";
import { LoveGameSection } from "./LoveGameSection";

type LetterWithReplies = Letter & { replies: LetterReply[] };

type LinkWithRelations = PrismaLink & {
    config: LinkConfig | null;
    galleries: Gallery[];
    timelines: Timeline[];
    letters: LetterWithReplies[];
};

interface LoveTemplateProps {
    data: LinkWithRelations;
    slug: string;
}

const PAGES = [
    { id: "cover", label: "Bìa sách", icon: BookOpen },
    { id: "gallery", label: "Khoảnh khắc", icon: ImageIcon },
    { id: "timeline", label: "Câu chuyện", icon: Calendar },
    { id: "game", label: "Trò chơi", icon: Sparkles },
    { id: "letters", label: "Thư", icon: Mail },
];

export function LoveTemplate({ data, slug }: LoveTemplateProps) {
    const [currentPage, setCurrentPage] = useState(0);
    const [isFlipping, setIsFlipping] = useState(false);
    const [flipDirection, setFlipDirection] = useState<"left" | "right" | null>(null);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const profileData = data.profile_data as Record<string, string> | null;

    const boyName = profileData?.boy_name || "Him";
    const girlName = profileData?.girl_name || "Her";
    const boyAvatar = profileData?.boy_avatar;
    const girlAvatar = profileData?.girl_avatar;
    const anniversaryDate = profileData?.anniversary_date;
    const title = profileData?.title || `${boyName} & ${girlName}`;

    const getDaysTogether = () => {
        if (!anniversaryDate) return null;
        const start = new Date(anniversaryDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - start.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const daysTogether = getDaysTogether();

    const goToPage = useCallback((pageIndex: number, direction?: "left" | "right") => {
        if (isFlipping || pageIndex === currentPage) return;
        if (pageIndex < 0 || pageIndex >= PAGES.length) return;
        setIsFlipping(true);
        setFlipDirection(direction || (pageIndex > currentPage ? "left" : "right"));
        setTimeout(() => {
            setCurrentPage(pageIndex);
            setIsFlipping(false);
            setFlipDirection(null);
        }, 400);
    }, [isFlipping, currentPage]);

    const nextPage = useCallback(() => {
        if (currentPage < PAGES.length - 1) goToPage(currentPage + 1, "left");
    }, [currentPage, goToPage]);

    const prevPage = useCallback(() => {
        if (currentPage > 0) goToPage(currentPage - 1, "right");
    }, [currentPage, goToPage]);

    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => {
            if (lightboxIndex !== null) {
                setLightboxIndex((lightboxIndex + 1) % data.galleries.length);
            } else {
                nextPage();
            }
        },
        onSwipedRight: () => {
            if (lightboxIndex !== null) {
                setLightboxIndex((lightboxIndex - 1 + data.galleries.length) % data.galleries.length);
            } else {
                prevPage();
            }
        },
        preventScrollOnSwipe: true,
        trackMouse: false,
    });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightboxIndex !== null) {
                if (e.key === 'ArrowRight') setLightboxIndex((lightboxIndex + 1) % data.galleries.length);
                if (e.key === 'ArrowLeft') setLightboxIndex((lightboxIndex - 1 + data.galleries.length) % data.galleries.length);
                if (e.key === 'Escape') { setLightboxIndex(null); setIsPopupOpen(false); }
            } else {
                if (e.key === 'ArrowRight') nextPage();
                if (e.key === 'ArrowLeft') prevPage();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex, nextPage, prevPage, data.galleries.length]);

    const openLightbox = (index: number) => { setLightboxIndex(index); setIsPopupOpen(true); };
    const closeLightbox = () => { setLightboxIndex(null); setIsPopupOpen(false); };

    const pageAnimClass = isFlipping
        ? flipDirection === "left"
            ? "animate-flip-left"
            : "animate-flip-right"
        : "animate-page-in";

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex flex-col items-center justify-center relative overflow-hidden">
            <style jsx>{`
                @keyframes flipLeft {
                    0% { transform: perspective(1200px) rotateY(0deg); opacity: 1; }
                    50% { transform: perspective(1200px) rotateY(-15deg); opacity: 0.5; }
                    100% { transform: perspective(1200px) rotateY(0deg); opacity: 1; }
                }
                @keyframes flipRight {
                    0% { transform: perspective(1200px) rotateY(0deg); opacity: 1; }
                    50% { transform: perspective(1200px) rotateY(15deg); opacity: 0.5; }
                    100% { transform: perspective(1200px) rotateY(0deg); opacity: 1; }
                }
                @keyframes pageIn {
                    0% { opacity: 0; transform: scale(0.97); }
                    100% { opacity: 1; transform: scale(1); }
                }
                @keyframes floatHeart {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    25% { transform: translateY(-15px) rotate(5deg); }
                    75% { transform: translateY(-5px) rotate(-3deg); }
                }
                @keyframes sparkle {
                    0%, 100% { opacity: 0.3; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
                @keyframes foilShimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes heartbeatWave {
                    0%, 100% { transform: scale(1); }
                    10% { transform: scale(1.15); }
                    20% { transform: scale(1); }
                    30% { transform: scale(1.12); }
                    40% { transform: scale(1); }
                }
                @keyframes cornerGlow {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.8; }
                }
                .animate-flip-left { animation: flipLeft 0.4s ease-in-out; }
                .animate-flip-right { animation: flipRight 0.4s ease-in-out; }
                .animate-page-in { animation: pageIn 0.3s ease-out; }
                .animate-float-heart { animation: floatHeart 4s ease-in-out infinite; }
                .animate-sparkle { animation: sparkle 2s ease-in-out infinite; }
                .animate-heartbeat-wave { animation: heartbeatWave 1.6s ease-in-out infinite; }
                .animate-corner-glow { animation: cornerGlow 3s ease-in-out infinite; }
                .foil-text {
                    background: linear-gradient(110deg, #b8860b 0%, #fbbf24 20%, #fef3c7 35%, #fbbf24 50%, #fef3c7 65%, #fbbf24 80%, #b8860b 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: foilShimmer 4s linear infinite;
                    filter: drop-shadow(0 1px 2px rgba(180, 130, 20, 0.3));
                }
                .floral-pattern {
                    background-image:
                        radial-gradient(circle at 20% 30%, rgba(244, 114, 182, 0.06) 0%, transparent 30%),
                        radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.05) 0%, transparent 30%),
                        radial-gradient(circle at 50% 50%, rgba(251, 207, 232, 0.04) 0%, transparent 40%);
                }
                .paper-texture {
                    background-image:
                        radial-gradient(circle at 1px 1px, rgba(180, 140, 100, 0.04) 1px, transparent 0);
                    background-size: 24px 24px;
                }
                .photo-corner {
                    position: absolute;
                    width: 18px;
                    height: 18px;
                    border-color: rgba(244, 114, 182, 0.5);
                }
                .photo-corner-tl { top: -4px; left: -4px; border-top: 2px solid; border-left: 2px solid; border-top-left-radius: 4px; }
                .photo-corner-tr { top: -4px; right: -4px; border-top: 2px solid; border-right: 2px solid; border-top-right-radius: 4px; }
                .photo-corner-bl { bottom: -4px; left: -4px; border-bottom: 2px solid; border-left: 2px solid; border-bottom-left-radius: 4px; }
                .photo-corner-br { bottom: -4px; right: -4px; border-bottom: 2px solid; border-right: 2px solid; border-bottom-right-radius: 4px; }
            `}</style>

            {/* Background decorations: floral pattern + floating hearts */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden floral-pattern">
                {/* Floating hearts */}
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute animate-float-heart"
                        style={{
                            left: `${10 + Math.random() * 80}%`,
                            top: `${10 + Math.random() * 80}%`,
                            animationDelay: `${i * 0.7}s`,
                            animationDuration: `${3 + Math.random() * 3}s`,
                        }}
                    >
                        <Heart className="w-4 h-4 text-rose-200 fill-rose-200 opacity-40" />
                    </div>
                ))}
                {/* Floral SVG corners */}
                <svg className="absolute top-0 left-0 w-32 h-32 text-rose-200/30 animate-corner-glow" viewBox="0 0 100 100" fill="none">
                    <path d="M5,5 Q5,40 25,50 Q5,60 5,95 M5,5 Q40,5 50,25 Q60,5 95,5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    <circle cx="25" cy="25" r="3" fill="currentColor" opacity="0.5" />
                    <circle cx="50" cy="5" r="2" fill="currentColor" opacity="0.4" />
                    <circle cx="5" cy="50" r="2" fill="currentColor" opacity="0.4" />
                    <path d="M15,15 Q20,10 25,15 Q30,20 25,25 Q20,30 15,25 Q10,20 15,15" fill="currentColor" opacity="0.3" />
                </svg>
                <svg className="absolute top-0 right-0 w-32 h-32 text-purple-200/30 animate-corner-glow" viewBox="0 0 100 100" fill="none" style={{ animationDelay: '1.5s' }}>
                    <path d="M95,5 Q95,40 75,50 Q95,60 95,95 M95,5 Q60,5 50,25 Q40,5 5,5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    <circle cx="75" cy="25" r="3" fill="currentColor" opacity="0.5" />
                    <circle cx="50" cy="5" r="2" fill="currentColor" opacity="0.4" />
                    <circle cx="95" cy="50" r="2" fill="currentColor" opacity="0.4" />
                    <path d="M75,15 Q80,10 85,15 Q90,20 85,25 Q80,30 75,25 Q70,20 75,15" fill="currentColor" opacity="0.3" />
                </svg>
                <svg className="absolute bottom-0 left-0 w-32 h-32 text-pink-200/30 animate-corner-glow" viewBox="0 0 100 100" fill="none" style={{ animationDelay: '0.7s' }}>
                    <path d="M5,95 Q5,60 25,50 Q5,40 5,5 M5,95 Q40,95 50,75 Q60,95 95,95" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    <circle cx="25" cy="75" r="3" fill="currentColor" opacity="0.5" />
                    <path d="M15,75 Q20,70 25,75 Q30,80 25,85 Q20,90 15,85 Q10,80 15,75" fill="currentColor" opacity="0.3" />
                </svg>
                <svg className="absolute bottom-0 right-0 w-32 h-32 text-rose-200/30 animate-corner-glow" viewBox="0 0 100 100" fill="none" style={{ animationDelay: '2.2s' }}>
                    <path d="M95,95 Q95,60 75,50 Q95,40 95,5 M95,95 Q60,95 50,75 Q40,95 5,95" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    <circle cx="75" cy="75" r="3" fill="currentColor" opacity="0.5" />
                    <path d="M75,75 Q80,70 85,75 Q90,80 85,85 Q80,90 75,85 Q70,80 75,75" fill="currentColor" opacity="0.3" />
                </svg>
            </div>

            {/* Edit Button */}
            {!isPopupOpen && (
                <Link
                    href={`/${slug}/edit`}
                    className="fixed top-4 right-4 z-30 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl hover:bg-white transition-all"
                    title="Edit Page"
                >
                    <Settings className="w-5 h-5 text-gray-600" />
                </Link>
            )}

            {/* Book Container */}
            <div className="w-full max-w-2xl mx-auto px-4 py-6 flex flex-col items-center min-h-screen justify-center">
                {/* Book spine decoration */}
                <div className="relative w-full">
                    {/* Page edge decoration */}
                    <div className="absolute -right-1 top-4 bottom-4 w-2 bg-gradient-to-b from-amber-100 via-amber-50 to-amber-100 rounded-r-sm shadow-inner hidden sm:block" />
                    <div className="absolute -right-0.5 top-5 bottom-5 w-1 bg-gradient-to-b from-amber-200/50 via-amber-100/50 to-amber-200/50 rounded-r-sm hidden sm:block" />

                    {/* Main Page */}
                    <div
                        {...(lightboxIndex === null ? swipeHandlers : {})}
                        className={`relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-rose-100 ${pageAnimClass} paper-texture`}
                        style={{ minHeight: "70vh" }}
                    >
                        {/* Ornate corner flourishes */}
                        <svg className="absolute top-2 left-2 w-10 h-10 text-rose-300/40 pointer-events-none z-10" viewBox="0 0 40 40" fill="none">
                            <path d="M2,2 Q2,20 10,25 M2,2 Q20,2 25,10" stroke="currentColor" strokeWidth="1.5" />
                            <circle cx="10" cy="10" r="1.5" fill="currentColor" />
                        </svg>
                        <svg className="absolute top-2 right-2 w-10 h-10 text-rose-300/40 pointer-events-none z-10" viewBox="0 0 40 40" fill="none">
                            <path d="M38,2 Q38,20 30,25 M38,2 Q20,2 15,10" stroke="currentColor" strokeWidth="1.5" />
                            <circle cx="30" cy="10" r="1.5" fill="currentColor" />
                        </svg>
                        <svg className="absolute bottom-2 left-2 w-10 h-10 text-rose-300/40 pointer-events-none z-10" viewBox="0 0 40 40" fill="none">
                            <path d="M2,38 Q2,20 10,15 M2,38 Q20,38 25,30" stroke="currentColor" strokeWidth="1.5" />
                            <circle cx="10" cy="30" r="1.5" fill="currentColor" />
                        </svg>
                        <svg className="absolute bottom-2 right-2 w-10 h-10 text-rose-300/40 pointer-events-none z-10" viewBox="0 0 40 40" fill="none">
                            <path d="M38,38 Q38,20 30,15 M38,38 Q20,38 15,30" stroke="currentColor" strokeWidth="1.5" />
                            <circle cx="30" cy="30" r="1.5" fill="currentColor" />
                        </svg>

                        {/* Page content */}
                        {PAGES[currentPage].id === "cover" && (
                            <div className="flex flex-col items-center justify-center p-8 py-12 min-h-[70vh]">
                                <div className="text-center">
                                    {/* Avatars */}
                                    <div className="flex items-center justify-center gap-4 sm:gap-8 mb-8">
                                        <div className="flex flex-col items-center">
                                            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-rose-300 to-pink-400 p-1 shadow-xl">
                                                {boyAvatar ? (
                                                    <Image src={boyAvatar} alt={boyName} width={112} height={112} className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-2xl sm:text-3xl font-bold text-rose-400">
                                                        {boyName.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-sm font-medium text-gray-600 mt-2">{boyName}</span>
                                        </div>

                                        <div className="animate-heartbeat-wave relative">
                                            <Heart className="w-8 h-8 sm:w-12 sm:h-12 text-rose-400 fill-rose-400" />
                                            <Sparkles className="absolute -top-2 -right-2 w-3 h-3 text-amber-300 fill-amber-300 animate-sparkle" />
                                            <Sparkles className="absolute -bottom-1 -left-2 w-2.5 h-2.5 text-rose-300 fill-rose-300 animate-sparkle" style={{ animationDelay: '0.5s' }} />
                                        </div>

                                        <div className="flex flex-col items-center">
                                            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-pink-300 to-purple-400 p-1 shadow-xl">
                                                {girlAvatar ? (
                                                    <Image src={girlAvatar} alt={girlName} width={112} height={112} className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-2xl sm:text-3xl font-bold text-pink-400">
                                                        {girlName.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-sm font-medium text-gray-600 mt-2">{girlName}</span>
                                        </div>
                                    </div>

                                    {/* Ornate divider top */}
                                    <div className="flex items-center justify-center gap-2 mb-3">
                                        <div className="h-px w-12 bg-gradient-to-r from-transparent to-rose-300" />
                                        <Flower2 className="w-3 h-3 text-rose-300" />
                                        <div className="h-px w-12 bg-gradient-to-l from-transparent to-rose-300" />
                                    </div>

                                    <h1
                                        className="foil-text text-4xl sm:text-5xl font-bold mb-2 leading-relaxed pb-2"
                                        style={{ fontFamily: "var(--font-dancing-script), var(--font-pacifico), cursive" }}
                                    >
                                        {title}
                                    </h1>

                                    {/* Ornate divider bottom */}
                                    <div className="flex items-center justify-center gap-2 mb-4">
                                        <div className="h-px w-16 bg-gradient-to-r from-transparent via-rose-300 to-rose-300" />
                                        <Heart className="w-3 h-3 text-rose-300 fill-rose-300" />
                                        <div className="h-px w-16 bg-gradient-to-l from-transparent via-rose-300 to-rose-300" />
                                    </div>

                                    {profileData?.short_note && (
                                        <p className="text-gray-500 italic text-sm max-w-xs mx-auto mb-6">
                                            {profileData.short_note}
                                        </p>
                                    )}

                                    {daysTogether && (
                                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-50 to-pink-50 px-6 py-3 rounded-full shadow-md border border-rose-100">
                                            <Heart className="w-4 h-4 text-rose-400 fill-rose-400 animate-heartbeat-wave" />
                                            <span className="text-2xl font-bold text-rose-500">{daysTogether}</span>
                                            <span className="text-gray-500 text-sm">ngày bên nhau</span>
                                        </div>
                                    )}

                                    <div className="mt-8 flex items-center justify-center gap-2 text-rose-300">
                                        <span className="text-xs">Vuốt để lật trang</span>
                                        <ChevronRight className="w-4 h-4 animate-bounce" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {PAGES[currentPage].id === "gallery" && (
                            <div className="p-6 sm:p-8 min-h-[70vh]">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <div className="h-px w-10 bg-gradient-to-r from-transparent to-rose-300" />
                                    <ImageIcon className="w-4 h-4 text-rose-400" />
                                    <h2 className="text-xl font-bold text-gray-800">Khoảnh Khắc</h2>
                                    <ImageIcon className="w-4 h-4 text-rose-400" />
                                    <div className="h-px w-10 bg-gradient-to-l from-transparent to-rose-300" />
                                </div>
                                <p className="text-center text-sm text-gray-400 mb-6">{data.galleries.length} kỷ niệm</p>
                                {data.galleries.length === 0 ? (
                                    <div className="text-center py-16 text-gray-400">
                                        <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                        <p>Chưa có ảnh nào...</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {data.galleries.map((item, index) => (
                                            <div
                                                key={item.id}
                                                onClick={() => openLightbox(index)}
                                                className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-md hover:shadow-2xl transition-all hover:scale-[1.03] cursor-pointer"
                                            >
                                                {/* Photo corners */}
                                                <span className="photo-corner photo-corner-tl z-10" />
                                                <span className="photo-corner photo-corner-tr z-10" />
                                                <span className="photo-corner photo-corner-bl z-10" />
                                                <span className="photo-corner photo-corner-br z-10" />
                                                <Image
                                                    src={item.image_url}
                                                    alt={item.caption || "Memory"}
                                                    width={400}
                                                    height={400}
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                />
                                                {item.caption && (
                                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                                        <p className="text-white text-xs truncate">{item.caption}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {PAGES[currentPage].id === "timeline" && (
                            <div className="p-6 sm:p-8 min-h-[70vh]">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <div className="h-px w-10 bg-gradient-to-r from-transparent to-rose-300" />
                                    <Calendar className="w-4 h-4 text-rose-400" />
                                    <h2 className="text-xl font-bold text-gray-800">Câu Chuyện</h2>
                                    <Calendar className="w-4 h-4 text-rose-400" />
                                    <div className="h-px w-10 bg-gradient-to-l from-transparent to-rose-300" />
                                </div>
                                <p className="text-center text-sm text-gray-400 mb-6">{data.timelines.length} cột mốc</p>
                                {data.timelines.length === 0 ? (
                                    <div className="text-center py-16 text-gray-400">
                                        <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                        <p>Chưa có sự kiện nào...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {data.timelines.map((event, idx) => (
                                            <div key={event.id} className="relative pl-8">
                                                <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-gradient-to-br from-rose-400 to-pink-400 border-4 border-white shadow" />
                                                {idx < data.timelines.length - 1 && (
                                                    <div className="absolute left-[7px] top-5 bottom-0 w-0.5 bg-gradient-to-b from-rose-200 to-rose-100" />
                                                )}
                                                <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-4 shadow-sm border border-rose-100 relative overflow-hidden">
                                                    <Flower2 className="absolute -top-2 -right-2 w-12 h-12 text-rose-100/50" />
                                                    <div className="text-xs text-rose-400 font-medium mb-1 flex items-center gap-1.5">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(event.date).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" })}
                                                    </div>
                                                    <h3 className="text-base font-semibold text-gray-800 mb-2">{event.title}</h3>
                                                    {event.description && (
                                                        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap mb-3">{event.description}</p>
                                                    )}
                                                    {event.image_url && (
                                                        <div className="rounded-lg overflow-hidden shadow-md relative">
                                                            <span className="photo-corner photo-corner-tl" />
                                                            <span className="photo-corner photo-corner-tr" />
                                                            <Image src={event.image_url} alt={event.title} width={800} height={600} className="w-full object-cover" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {PAGES[currentPage].id === "game" && (
                            <div className="p-6 sm:p-8 min-h-[70vh]">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <div className="h-px w-10 bg-gradient-to-r from-transparent to-rose-300" />
                                    <Sparkles className="w-4 h-4 text-rose-400" />
                                    <h2 className="text-xl font-bold text-gray-800">Trò Chơi</h2>
                                    <Sparkles className="w-4 h-4 text-rose-400" />
                                    <div className="h-px w-10 bg-gradient-to-l from-transparent to-rose-300" />
                                </div>
                                <p className="text-center text-sm text-gray-400 mb-6">Cùng nhau giải đố</p>
                                <LoveGameSection photos={data.galleries.map(g => ({ id: g.id, url: g.image_url, caption: g.caption }))} />
                            </div>
                        )}

                        {PAGES[currentPage].id === "letters" && (
                            <div className="p-6 sm:p-8 min-h-[70vh]">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <div className="h-px w-10 bg-gradient-to-r from-transparent to-rose-300" />
                                    <Mail className="w-4 h-4 text-rose-400" />
                                    <h2 className="text-xl font-bold text-gray-800">Thư Tình</h2>
                                    <Mail className="w-4 h-4 text-rose-400" />
                                    <div className="h-px w-10 bg-gradient-to-l from-transparent to-rose-300" />
                                </div>
                                <p className="text-center text-sm text-gray-400 mb-6">Gửi lời yêu thương</p>
                                <LoveLetterBox slug={slug} initialLetters={data.letters} onPopupOpenChange={setIsPopupOpen} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Page Navigation */}
                <div className="flex items-center justify-between w-full mt-6 px-2">
                    <button
                        onClick={prevPage}
                        disabled={currentPage === 0}
                        className={`p-2.5 rounded-full transition-all ${currentPage === 0 ? "text-gray-300 cursor-not-allowed" : "bg-white/80 text-rose-500 shadow-md hover:bg-white hover:shadow-lg hover:scale-110"}`}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Page dots */}
                    <div className="flex items-center gap-2">
                        {PAGES.map((page, idx) => (
                            <button
                                key={page.id}
                                onClick={() => goToPage(idx)}
                                className={`transition-all duration-300 rounded-full ${idx === currentPage
                                    ? "w-8 h-2.5 bg-gradient-to-r from-rose-400 to-pink-400 shadow-md"
                                    : "w-2.5 h-2.5 bg-rose-200 hover:bg-rose-300"
                                    }`}
                                title={page.label}
                            />
                        ))}
                    </div>

                    <button
                        onClick={nextPage}
                        disabled={currentPage === PAGES.length - 1}
                        className={`p-2.5 rounded-full transition-all ${currentPage === PAGES.length - 1 ? "text-gray-300 cursor-not-allowed" : "bg-white/80 text-rose-500 shadow-md hover:bg-white hover:shadow-lg hover:scale-110"}`}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Page label */}
                <div className="mt-3 text-center">
                    <span className="text-xs text-gray-400 font-medium">
                        {PAGES[currentPage].label} ({currentPage + 1}/{PAGES.length})
                    </span>
                </div>
            </div>

            {/* Lightbox */}
            {lightboxIndex !== null && data.galleries[lightboxIndex] && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeLightbox}>
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-rose-400 to-pink-500 p-4 text-white flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{lightboxIndex + 1} / {data.galleries.length}</span>
                                <button onClick={closeLightbox} className="hover:scale-110 transition-transform">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div {...swipeHandlers} className="flex-1 overflow-hidden flex items-center justify-center p-4 bg-gray-50 min-h-[300px]">
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
                        {data.galleries[lightboxIndex].caption && (
                            <div className="px-4 py-2 text-center text-gray-700 text-sm">
                                {data.galleries[lightboxIndex].caption}
                            </div>
                        )}
                        <div className="flex justify-center items-center gap-4 p-4 border-t border-gray-100">
                            <button onClick={() => setLightboxIndex((lightboxIndex - 1 + data.galleries.length) % data.galleries.length)} className="p-2.5 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all hover:scale-110">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button onClick={() => setLightboxIndex((lightboxIndex + 1) % data.galleries.length)} className="p-2.5 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all hover:scale-110">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
