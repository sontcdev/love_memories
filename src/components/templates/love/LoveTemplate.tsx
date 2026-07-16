"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Link as PrismaLink, LinkConfig, Gallery, Timeline, Letter, LetterReply } from "@prisma/client";
import { Heart, Calendar, Image as ImageIcon, Mail, ChevronUp, ChevronLeft, ChevronRight, Settings, Sparkles, X } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import { GameSection } from "@/components/shared/CardDrawGame";
import { LetterBox } from "@/components/shared/LetterBox";

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

export function LoveTemplate({ data, slug }: LoveTemplateProps) {
    const [activeSection, setActiveSection] = useState<string>("home");
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const profileData = data.profile_data as Record<string, string> | null;

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
        <div className="min-h-screen relative" style={{ backgroundColor: 'var(--theme-bg, #fff0f5)' }}>
            {/* Edit Button - Fixed */}
            {!isPopupOpen && (
                <Link
                    href={`/${slug}/edit`}
                    className="fixed top-4 right-4 z-30 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl hover:bg-white transition-all"
                    title="Edit Page"
                    aria-label="Chỉnh sửa trang"
                >
                    <Settings className="w-5 h-5 text-gray-600" />
                </Link>
            )}
            {/* Hero Section */}
            <section className="relative flex flex-col items-center justify-center px-4 pt-16 pb-8">

                {/* Main Content */}
                <div className="relative z-10 text-center px-4 w-full max-w-md mx-auto">
                    {/* Profile Images with Names */}
                    <div className="flex items-start justify-center gap-2 sm:gap-6 mb-8">
                        {/* His Profile */}
                        <div className="flex flex-col items-center flex-1 min-w-0 max-w-[120px] sm:max-w-[140px]">
                            <div className="w-16 h-16 min-[380px]:w-20 min-[380px]:h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-rose-300 to-pink-400 p-1 shadow-lg mb-2 flex-shrink-0">
                                {boyAvatar ? (
                                    <Image
                                        src={boyAvatar}
                                        alt={boyName}
                                        width={96}
                                        height={96}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xl sm:text-2xl font-bold text-rose-400">
                                        {boyName.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-gray-600 text-center leading-tight w-full line-clamp-2">{boyName}</span>
                        </div>

                        {/* Heart - aligned with avatar center */}
                        <div className="h-16 min-[380px]:h-20 sm:h-24 flex items-center flex-shrink-0">
                            <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-rose-400 fill-rose-400 animate-pulse" />
                        </div>

                        {/* Her Profile */}
                        <div className="flex flex-col items-center flex-1 min-w-0 max-w-[120px] sm:max-w-[140px]">
                            <div className="w-16 h-16 min-[380px]:w-20 min-[380px]:h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-pink-300 to-purple-400 p-1 shadow-lg mb-2 flex-shrink-0">
                                {girlAvatar ? (
                                    <Image
                                        src={girlAvatar}
                                        alt={girlName}
                                        width={96}
                                        height={96}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xl sm:text-2xl font-bold text-pink-400">
                                        {girlName.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-gray-600 text-center leading-tight w-full line-clamp-2">{girlName}</span>
                        </div>
                    </div>

                    {/* Title with cute font */}
                    <h1
                        className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent leading-relaxed pb-2"
                        style={{ fontFamily: "var(--font-dancing-script), var(--font-pacifico), cursive" }}
                    >
                        {title}
                    </h1>

                    {/* Short Note with Days Counter */}
                    {daysTogether && (
                        <div className="mb-8">
                            <div className="inline-flex flex-col items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-lg">
                                {profileData?.short_note && (
                                    <p className="text-gray-600 italic text-sm max-w-xs">
                                        {profileData.short_note}
                                    </p>
                                )}
                                <div className="flex items-center gap-1">
                                    <span className="text-2xl font-bold text-rose-500">{daysTogether}</span>
                                    <span className="text-gray-500 text-sm">ngày</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Tabs */}
                    <div className="mt-8">
                        <div className="inline-flex flex-wrap justify-center gap-2">
                            {[
                                { id: "gallery", icon: ImageIcon, label: "Ảnh" },
                                { id: "timeline", icon: Calendar, label: "Dòng thời gian" },
                                { id: "game", icon: Sparkles, label: "Trò chơi" },
                                { id: "letters", icon: Mail, label: "Thư" },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveSection(tab.id)}
                                    className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeSection === tab.id
                                        ? "bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-md"
                                        : "bg-white/80 text-gray-500 hover:bg-rose-50 shadow-sm"
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                    {tab.id === "gallery" && data.galleries.length > 0 && (
                                        <span className="text-xs opacity-70">({data.galleries.length})</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <div id="content-section">

                {/* Gallery Section */}
                {activeSection === "gallery" && (
                    <section className="max-w-4xl mx-auto px-4 py-6">
                        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
                            Khoảnh Khắc Của Chúng Mình 📸
                        </h2>
                        {data.galleries.length === 0 ? (
                            <div className="text-center py-16 text-gray-400">
                                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p>Chưa có ảnh nào...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {data.galleries.map((item, index) => (
                                    <div
                                        key={item.id}
                                        onClick={() => openLightbox(index)}
                                        className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-md hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer"
                                    >
                                        {/* Shimmer placeholder */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]" />

                                        <Image
                                            src={item.image_url}
                                            alt={item.caption || "Memory"}
                                            width={400}
                                            height={400}
                                            className="relative z-10 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                            onLoad={(e) => {
                                                const parent = e.currentTarget.parentElement;
                                                const shimmer = parent?.querySelector('.animate-shimmer');
                                                if (shimmer) shimmer.classList.add('hidden');
                                            }}
                                        />

                                        {/* Caption - Always visible */}
                                        {item.caption && (
                                            <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/60 to-transparent p-3">
                                                <p className="text-white text-sm truncate">{item.caption}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* Gallery Lightbox */}
                {lightboxIndex !== null && data.galleries[lightboxIndex] && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeLightbox}>
                        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                            {/* Header */}
                            <div className="bg-gradient-to-r from-rose-400 to-pink-500 p-4 text-white flex-shrink-0">
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
                            {/* Caption */}
                            {data.galleries[lightboxIndex].caption && (
                                <div className="px-4 py-2 text-center text-gray-700 text-sm">
                                    {data.galleries[lightboxIndex].caption}
                                </div>
                            )}
                            {/* Navigation */}
                            <div className="flex justify-center items-center gap-4 p-4 border-t border-gray-100">
                                <button
                                    onClick={prevImage}
                                    className="p-2.5 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all hover:scale-110"
                                    aria-label="Ảnh trước"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="p-2.5 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all hover:scale-110"
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
                    <section className="max-w-2xl mx-auto px-4 py-12">
                        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
                            Câu Chuyện Của Chúng Mình 💕
                        </h2>
                        {data.timelines.length === 0 ? (
                            <div className="text-center py-16 text-gray-400">
                                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p>Chưa có sự kiện nào...</p>
                            </div>
                        ) : (
                            <div className="relative">
                                {/* Timeline line */}
                                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-rose-200" />

                                <div className="space-y-8">
                                    {data.timelines.map((event) => (
                                        <div key={event.id} className="relative pl-16">
                                            {/* Timeline dot */}
                                            <div className="absolute left-4 w-4 h-4 rounded-full bg-gradient-to-br from-rose-400 to-pink-400 border-4 border-white shadow" />

                                            <div className="bg-white rounded-2xl p-5 shadow-md">
                                                <div className="text-xs text-rose-400 font-medium mb-1">
                                                    {new Date(event.date).toLocaleDateString("vi-VN", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })}
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                                    {event.title}
                                                </h3>
                                                {/* Event Content */}
                                                <div className="space-y-4">
                                                    {event.description && (
                                                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                            {event.description}
                                                        </p>
                                                    )}

                                                    {/* Image */}
                                                    {event.image_url && (
                                                        <div className="rounded-xl overflow-hidden shadow-md">
                                                            <Image
                                                                src={event.image_url}
                                                                alt={event.title}
                                                                width={800}
                                                                height={600}
                                                                className="w-full object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {/* Letters Section */}
                {activeSection === "letters" && (
                    <section className="max-w-2xl mx-auto px-4 py-12">
                        <LetterBox slug={slug} initialLetters={data.letters} theme="love" onPopupOpenChange={setIsPopupOpen} />
                    </section>
                )}

                {/* Game Section */}
                {activeSection === "game" && (
                    <section className="max-w-4xl mx-auto px-4 py-12">
                        <GameSection theme="love" />
                    </section>
                )}

                {/* Footer */}
                <footer className="text-center py-8 text-gray-400 text-sm">
                    <Heart className="w-4 h-4 inline-block mr-1 text-rose-300 fill-rose-300" />
                    Được tạo với tình yêu
                </footer>

                {/* Scroll to Top Button */}
                {showScrollTop && !isPopupOpen && (
                    <button
                        onClick={scrollToTop}
                        className="fixed bottom-28 right-6 z-40 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-rose-100 hover:bg-rose-50 transition-all hover:scale-110"
                        aria-label="Lên đầu trang"
                    >
                        <ChevronUp className="w-5 h-5 text-rose-500" />
                    </button>
                )}

                {/* Custom Styles */}
                <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
            </div>
        </div>
    );
}
