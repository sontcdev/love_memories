"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Link as PrismaLink, LinkConfig, Gallery, Timeline, Letter, LetterReply } from "@prisma/client";
import { Heart, Calendar, Image as ImageIcon, Mail, ChevronLeft, ChevronRight, Settings, Sparkles, X, Gem, Clock, MapPin, Ribbon, ArrowDown } from "lucide-react";
import { WeddingLetterBox } from "./WeddingLetterBox";
import { WeddingGameSection } from "./WeddingGameSection";

type LetterWithReplies = Letter & { replies: LetterReply[] };

type LinkWithRelations = PrismaLink & {
    config: LinkConfig | null;
    galleries: Gallery[];
    timelines: Timeline[];
    letters: LetterWithReplies[];
};

interface WeddingTemplateProps {
    data: LinkWithRelations;
    slug: string;
}

export function WeddingTemplate({ data, slug }: WeddingTemplateProps) {
    const [isCardOpen, setIsCardOpen] = useState(false);
    const [activeSection, setActiveSection] = useState<string>("cover");
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const profileData = data.profile_data as Record<string, string> | null;

    const brideName = profileData?.bride_name || "Cô dâu";
    const groomName = profileData?.groom_name || "Chú rể";
    const weddingDate = profileData?.wedding_date;
    const venue = profileData?.venue;
    const title = profileData?.title || `${groomName} & ${brideName}`;

    const getDaysUntilWedding = useCallback(() => {
        if (!weddingDate) return null;
        const wedding = new Date(weddingDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        wedding.setHours(0, 0, 0, 0);
        const diffTime = wedding.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }, [weddingDate]);

    const daysUntil = getDaysUntilWedding();

    const sections = useMemo(() => [
        { id: "cover", label: "Trang bìa", icon: Heart },
        { id: "story", label: "Câu chuyện", icon: Calendar },
        { id: "gallery", label: "Album", icon: ImageIcon },
        { id: "guestbook", label: "Lưu bút", icon: Mail },
        { id: "quiz", label: "Thử thách", icon: Sparkles },
    ], []);

    const goToSection = (sectionId: string) => {
        setActiveSection(sectionId);
    };

    const nextSection = useCallback(() => {
        const currentIndex = sections.findIndex(s => s.id === activeSection);
        if (currentIndex < sections.length - 1) {
            setActiveSection(sections[currentIndex + 1].id);
        }
    }, [activeSection, sections]);

    const prevSection = useCallback(() => {
        const currentIndex = sections.findIndex(s => s.id === activeSection);
        if (currentIndex > 0) {
            setActiveSection(sections[currentIndex - 1].id);
        }
    }, [activeSection, sections]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isCardOpen) return;
            if (e.key === "ArrowRight") nextSection();
            if (e.key === "ArrowLeft") prevSection();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isCardOpen, nextSection, prevSection]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-amber-50 overflow-hidden">
            {/* Floating decorations */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute animate-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: `${4 + Math.random() * 3}s`,
                        }}
                    >
                        <Heart className="w-4 h-4 text-rose-200/40 fill-rose-200/40" />
                    </div>
                ))}
            </div>

            {/* Card Closed State - Invitation Envelope */}
            {!isCardOpen && (
                <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
                    <div className="text-center">
                        {/* Envelope */}
                        <div
                            className="relative cursor-pointer group"
                            onClick={() => setIsCardOpen(true)}
                        >
                            {/* Envelope body */}
                            <div className="w-80 h-56 md:w-96 md:h-64 bg-gradient-to-br from-amber-100 to-rose-100 rounded-lg shadow-2xl border-2 border-amber-200 relative overflow-hidden transition-transform duration-500 group-hover:scale-105">
                                {/* Envelope flap */}
                                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-amber-200 to-amber-100" style={{ clipPath: "polygon(0 0, 50% 100%, 100% 0)" }} />

                                {/* Wax seal */}
                                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 shadow-lg flex items-center justify-center border-4 border-rose-300">
                                    <Heart className="w-8 h-8 text-white fill-white" />
                                </div>

                                {/* Card peeking out */}
                                <div className="absolute bottom-4 left-4 right-4 h-20 bg-white rounded shadow-inner flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="font-serif text-amber-800 text-sm">Thiệp mời</p>
                                        <p className="font-serif text-2xl text-amber-900">{title}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tap to open hint */}
                            <div className="mt-8 flex flex-col items-center gap-2 animate-bounce">
                                <ArrowDown className="w-6 h-6 text-amber-600" />
                                <p className="text-amber-700 font-medium">Nhấn để mở thiệp</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Card Opened State - Inside the Invitation */}
            {isCardOpen && (
                <div className="min-h-screen relative z-10">
                    {/* Top bar */}
                    <div className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-amber-100 shadow-sm">
                        <div className="max-w-4xl mx-auto px-4">
                            <div className="flex items-center justify-between h-14">
                                <div className="flex items-center gap-2">
                                    <Gem className="w-5 h-5 text-amber-500" />
                                    <span className="font-serif text-lg text-amber-800">{title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsCardOpen(false)}
                                        className="px-3 py-1.5 rounded-lg text-sm text-amber-600 hover:bg-amber-50 transition-colors flex items-center gap-1"
                                    >
                                        <Ribbon className="w-4 h-4" />
                                        Đóng thiệp
                                    </button>
                                    <Link
                                        href={`/${slug}/edit`}
                                        className="p-2 rounded-lg text-gray-500 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                                    >
                                        <Settings className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section navigation dots */}
                    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col gap-3">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => goToSection(section.id)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                    activeSection === section.id
                                        ? "bg-amber-500 scale-150 shadow-lg shadow-amber-300"
                                        : "bg-amber-200 hover:bg-amber-300"
                                }`}
                                title={section.label}
                            />
                        ))}
                    </div>

                    {/* Main content area - Card pages */}
                    <div className="pt-16 pb-20 px-4 min-h-screen flex items-center justify-center">
                        <div className="w-full max-w-3xl">
                            {/* Cover Section */}
                            {activeSection === "cover" && (
                                <div className="bg-white rounded-2xl shadow-2xl border-2 border-amber-100 overflow-hidden animate-fadeIn">
                                    {/* Ornate border */}
                                    <div className="p-2 bg-gradient-to-r from-amber-200 via-rose-200 to-amber-200">
                                        <div className="bg-white rounded-xl p-8 md:p-12">
                                            {/* Corner decorations */}
                                            <div className="relative">
                                                <div className="absolute -top-4 -left-4 w-16 h-16 border-t-4 border-l-4 border-amber-300 rounded-tl-full" />
                                                <div className="absolute -top-4 -right-4 w-16 h-16 border-t-4 border-r-4 border-amber-300 rounded-tr-full" />
                                                <div className="absolute -bottom-4 -left-4 w-16 h-16 border-b-4 border-l-4 border-amber-300 rounded-bl-full" />
                                                <div className="absolute -bottom-4 -right-4 w-16 h-16 border-b-4 border-r-4 border-amber-300 rounded-br-full" />

                                                <div className="text-center py-8">
                                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-rose-100 mb-6 border-2 border-amber-200">
                                                        <Heart className="w-10 h-10 text-rose-400 fill-rose-400" />
                                                    </div>

                                                    <p className="text-amber-600 font-serif text-lg mb-2">Trân trọng kính mời</p>

                                                    <h1 className="font-serif text-4xl md:text-5xl text-amber-900 mb-2">
                                                        {groomName}
                                                    </h1>

                                                    <div className="flex items-center justify-center gap-4 my-4">
                                                        <div className="h-px w-20 bg-gradient-to-r from-transparent to-amber-300" />
                                                        <span className="font-serif text-2xl text-rose-400">&</span>
                                                        <div className="h-px w-20 bg-gradient-to-l from-transparent to-amber-300" />
                                                    </div>

                                                    <h1 className="font-serif text-4xl md:text-5xl text-amber-900 mb-8">
                                                        {brideName}
                                                    </h1>

                                                    {weddingDate && (
                                                        <div className="bg-gradient-to-r from-amber-50 to-rose-50 rounded-xl p-6 max-w-sm mx-auto border border-amber-100">
                                                            <div className="flex items-center justify-center gap-2 text-amber-700 mb-2">
                                                                <Calendar className="w-5 h-5" />
                                                                <span className="font-medium">Ngày cưới</span>
                                                            </div>
                                                            <p className="text-xl font-serif text-amber-900 mb-3">
                                                                {new Date(weddingDate).toLocaleDateString("vi-VN", {
                                                                    weekday: "long",
                                                                    day: "2-digit",
                                                                    month: "long",
                                                                    year: "numeric",
                                                                })}
                                                            </p>
                                                            {daysUntil !== null && daysUntil > 0 && (
                                                                <div className="flex items-center justify-center gap-2 text-rose-500">
                                                                    <Clock className="w-4 h-4" />
                                                                    <span className="text-sm">Còn {daysUntil} ngày</span>
                                                                </div>
                                                            )}
                                                            {daysUntil !== null && daysUntil <= 0 && (
                                                                <div className="flex items-center justify-center gap-2 text-emerald-500">
                                                                    <Heart className="w-4 h-4 fill-emerald-500" />
                                                                    <span className="text-sm">Đã diễn ra</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {venue && (
                                                        <div className="mt-4 flex items-center justify-center gap-2 text-amber-600">
                                                            <MapPin className="w-4 h-4" />
                                                            <span>{venue}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Story/Timeline Section */}
                            {activeSection === "story" && (
                                <div className="bg-white rounded-2xl shadow-2xl border-2 border-amber-100 overflow-hidden animate-fadeIn">
                                    <div className="p-2 bg-gradient-to-r from-amber-200 via-rose-200 to-amber-200">
                                        <div className="bg-white rounded-xl p-6 md:p-8">
                                            <div className="text-center mb-8">
                                                <h2 className="font-serif text-3xl text-amber-900 mb-2">Câu Chuyện Tình Yêu</h2>
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="h-px w-12 bg-amber-300" />
                                                    <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                                                    <div className="h-px w-12 bg-amber-300" />
                                                </div>
                                            </div>

                                            {data.timelines.length > 0 ? (
                                                <div className="space-y-6">
                                                    {data.timelines.map((item) => (
                                                        <div key={item.id} className="relative pl-8 border-l-2 border-amber-200">
                                                            <div className="absolute left-0 top-0 w-4 h-4 -translate-x-1/2 rounded-full bg-amber-400 border-2 border-white shadow" />
                                                            <div className="bg-gradient-to-r from-amber-50 to-rose-50 rounded-xl p-4 border border-amber-100">
                                                                <div className="text-sm text-amber-600 font-medium mb-1">
                                                                    {new Date(item.date).toLocaleDateString("vi-VN", {
                                                                        day: "2-digit",
                                                                        month: "long",
                                                                        year: "numeric",
                                                                    })}
                                                                </div>
                                                                <h3 className="font-serif text-lg text-amber-900 mb-2">{item.title}</h3>
                                                                {item.description && (
                                                                    <p className="text-sm text-gray-600">{item.description}</p>
                                                                )}
                                                                {item.image_url && (
                                                                    <Image
                                                                        src={item.image_url}
                                                                        alt={item.title}
                                                                        width={400}
                                                                        height={300}
                                                                        className="mt-3 rounded-lg object-cover w-full"
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-center text-gray-400 italic">Chưa có kỷ niệm nào</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Gallery Section */}
                            {activeSection === "gallery" && (
                                <div className="bg-white rounded-2xl shadow-2xl border-2 border-amber-100 overflow-hidden animate-fadeIn">
                                    <div className="p-2 bg-gradient-to-r from-amber-200 via-rose-200 to-amber-200">
                                        <div className="bg-white rounded-xl p-6 md:p-8">
                                            <div className="text-center mb-8">
                                                <h2 className="font-serif text-3xl text-amber-900 mb-2">Album Cưới</h2>
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="h-px w-12 bg-amber-300" />
                                                    <ImageIcon className="w-4 h-4 text-amber-500" />
                                                    <div className="h-px w-12 bg-amber-300" />
                                                </div>
                                            </div>

                                            {data.galleries.length > 0 ? (
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {data.galleries.map((photo, index) => (
                                                        <div
                                                            key={photo.id}
                                                            className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group border-2 border-amber-100 shadow-md hover:shadow-lg transition-shadow"
                                                            onClick={() => setLightboxIndex(index)}
                                                        >
                                                            <Image
                                                                src={photo.image_url}
                                                                alt={photo.caption || `Photo ${index + 1}`}
                                                                fill
                                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                            {photo.caption && (
                                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                                                    <p className="text-white text-xs text-center truncate">{photo.caption}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-center text-gray-400 italic">Chưa có ảnh nào</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Guestbook Section */}
                            {activeSection === "guestbook" && (
                                <div className="bg-white rounded-2xl shadow-2xl border-2 border-amber-100 overflow-hidden animate-fadeIn">
                                    <div className="p-2 bg-gradient-to-r from-amber-200 via-rose-200 to-amber-200">
                                        <div className="bg-white rounded-xl p-6 md:p-8">
                                            <div className="text-center mb-8">
                                                <h2 className="font-serif text-3xl text-amber-900 mb-2">Sổ Lưu Bút</h2>
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="h-px w-12 bg-amber-300" />
                                                    <Mail className="w-4 h-4 text-amber-500" />
                                                    <div className="h-px w-12 bg-amber-300" />
                                                </div>
                                                <p className="text-sm text-gray-500 mt-2">Gửi lời chúc đến cô dâu chú rể</p>
                                            </div>
                                            <WeddingLetterBox slug={slug} initialLetters={data.letters} onPopupOpenChange={() => {}} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Quiz Section */}
                            {activeSection === "quiz" && (
                                <div className="bg-white rounded-2xl shadow-2xl border-2 border-amber-100 overflow-hidden animate-fadeIn">
                                    <div className="p-2 bg-gradient-to-r from-amber-200 via-rose-200 to-amber-200">
                                        <div className="bg-white rounded-xl p-6 md:p-8">
                                            <div className="text-center mb-8">
                                                <h2 className="font-serif text-3xl text-amber-900 mb-2">Thử Thách Cặp Đôi</h2>
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="h-px w-12 bg-amber-300" />
                                                    <Sparkles className="w-4 h-4 text-amber-500" />
                                                    <div className="h-px w-12 bg-amber-300" />
                                                </div>
                                            </div>
                                            <WeddingGameSection />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation buttons */}
                            <div className="flex items-center justify-between mt-6">
                                <button
                                    onClick={prevSection}
                                    disabled={activeSection === "cover"}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-amber-200 text-amber-700 hover:bg-amber-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    Trước
                                </button>

                                <div className="flex gap-2">
                                    {sections.map((section) => (
                                        <button
                                            key={section.id}
                                            onClick={() => goToSection(section.id)}
                                            className={`w-2.5 h-2.5 rounded-full transition-all ${
                                                activeSection === section.id
                                                    ? "bg-amber-500 scale-125"
                                                    : "bg-amber-200 hover:bg-amber-300"
                                            }`}
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={nextSection}
                                    disabled={activeSection === "quiz"}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-amber-200 text-amber-700 hover:bg-amber-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    Sau
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom mobile nav */}
                    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/90 backdrop-blur-md border-t border-amber-100 shadow-lg">
                        <div className="flex items-center justify-around py-2">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => goToSection(section.id)}
                                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                        activeSection === section.id
                                            ? "text-amber-600"
                                            : "text-gray-500"
                                    }`}
                                >
                                    <section.icon className="w-5 h-5" />
                                    {section.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Lightbox */}
            {lightboxIndex !== null && data.galleries.length > 0 && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
                    onClick={() => setLightboxIndex(null)}
                >
                    <button
                        onClick={() => setLightboxIndex(null)}
                        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setLightboxIndex(Math.max(lightboxIndex - 1, 0));
                        }}
                        disabled={lightboxIndex === 0}
                        className="absolute left-4 p-2 text-white/80 hover:text-white disabled:opacity-30"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>
                    <div className="max-w-4xl max-h-[80vh] relative" onClick={(e) => e.stopPropagation()}>
                        <Image
                            src={data.galleries[lightboxIndex].image_url}
                            alt={data.galleries[lightboxIndex].caption || `Photo ${lightboxIndex + 1}`}
                            width={1200}
                            height={800}
                            className="max-h-[80vh] w-auto object-contain"
                        />
                        {data.galleries[lightboxIndex].caption && (
                            <p className="text-white text-center mt-4">{data.galleries[lightboxIndex].caption}</p>
                        )}
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setLightboxIndex(Math.min(lightboxIndex + 1, data.galleries.length - 1));
                        }}
                        disabled={lightboxIndex === data.galleries.length - 1}
                        className="absolute right-4 p-2 text-white/80 hover:text-white disabled:opacity-30"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
                        {lightboxIndex + 1} / {data.galleries.length}
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.4; }
                    50% { transform: translateY(-20px) rotate(10deg); opacity: 0.8; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                :global(.animate-float) { animation: float 4s ease-in-out infinite; }
                :global(.animate-fadeIn) { animation: fadeIn 0.4s ease-out; }
            `}</style>
        </div>
    );
}
