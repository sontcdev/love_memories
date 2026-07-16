"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Link as PrismaLink, LinkConfig, Gallery, Timeline, Letter, LetterReply } from "@prisma/client";
import { Calendar, Mail, ChevronUp, ChevronLeft, ChevronRight, Settings, Sparkles, X, MapPin, Compass, Plane, Camera } from "lucide-react";
import { CardDrawGame } from "@/components/shared/CardDrawGame";
import { LetterBox } from "@/components/shared/LetterBox";

type LetterWithReplies = Letter & { replies: LetterReply[] };

type LinkWithRelations = PrismaLink & {
    config: LinkConfig | null;
    galleries: Gallery[];
    timelines: Timeline[];
    letters: LetterWithReplies[];
};

interface TravelTemplateProps {
    data: LinkWithRelations;
    slug: string;
}

export function TravelTemplate({ data, slug }: TravelTemplateProps) {
    const [activeSection, setActiveSection] = useState<string>("home");
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const profileData = data.profile_data as Record<string, string> | null;

    const tripName = profileData?.trip_name || "Hành Trình";
    const destination = profileData?.destination;
    const startDate = profileData?.start_date;
    const endDate = profileData?.end_date;
    const travelers = profileData?.travelers;

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

    const getTripDuration = () => {
        if (!startDate || !endDate) return null;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    const duration = getTripDuration();

    const navItems = [
        { id: "home", label: "Trang chủ", icon: Compass },
        { id: "story", label: "Kỷ niệm", icon: Calendar },
        { id: "gallery", label: "Album", icon: Camera },
        { id: "guestbook", label: "Lưu bút", icon: Mail },
        { id: "quiz", label: "Thử thách", icon: Sparkles },
    ];

    const scrollToSection = (sectionId: string) => {
        setActiveSection(sectionId);
        const element = document.getElementById(sectionId);
        if (element) {
            const offset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-sky-100 shadow-sm">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <Plane className="w-5 h-5 text-sky-500" />
                            <span className="font-medium text-lg text-sky-800">{tripName}</span>
                        </div>
                        <div className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        activeSection === item.id
                                            ? "bg-sky-100 text-sky-700"
                                            : "text-gray-600 hover:bg-sky-50"
                                    }`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                </button>
                            ))}
                        </div>
                        <Link
                            href={`/${slug}/edit`}
                            className="p-2 rounded-lg text-gray-500 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                        >
                            <Settings className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Mobile Nav */}
            <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/90 backdrop-blur-md border-t border-sky-100 shadow-lg">
                <div className="flex items-center justify-around py-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => scrollToSection(item.id)}
                            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                activeSection === item.id
                                    ? "text-sky-600"
                                    : "text-gray-500"
                            }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 pt-20 pb-24 md:pb-8">
                {/* Hero Section */}
                <section id="home" className="py-12 text-center">
                    <div className="mb-8">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-sky-200 to-emerald-200 mb-6">
                            <Compass className="w-12 h-12 text-sky-600" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-sky-900 mb-4">
                            {tripName}
                        </h1>
                        {destination && (
                            <div className="flex items-center justify-center gap-2 text-sky-600 mb-4">
                                <MapPin className="w-5 h-5" />
                                <span className="text-lg">{destination}</span>
                            </div>
                        )}
                        {travelers && (
                            <p className="text-gray-600 mb-6">{travelers}</p>
                        )}
                    </div>

                    {(startDate || endDate) && (
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto border border-sky-100 shadow-sm">
                            <div className="flex items-center justify-center gap-2 text-sky-700 mb-2">
                                <Calendar className="w-5 h-5" />
                                <span className="font-medium">Thời gian</span>
                            </div>
                            <div className="text-lg text-sky-900">
                                {startDate && new Date(startDate).toLocaleDateString("vi-VN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                })}
                                {startDate && endDate && " → "}
                                {endDate && new Date(endDate).toLocaleDateString("vi-VN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </div>
                            {duration && (
                                <div className="mt-2 text-sm text-emerald-600">
                                    {duration} ngày khám phá
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* Timeline Section */}
                {data.timelines.length > 0 && (
                    <section id="story" className="py-12">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-sky-900 mb-2">Kỷ niệm chuyến đi</h2>
                            <div className="flex items-center justify-center gap-2">
                                <div className="h-px w-12 bg-sky-300" />
                                <Calendar className="w-4 h-4 text-sky-500" />
                                <div className="h-px w-12 bg-sky-300" />
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-sky-200" />
                            {data.timelines.map((item, index) => (
                                <div
                                    key={item.id}
                                    className={`relative flex items-start gap-4 mb-8 ${
                                        index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                                    }`}
                                >
                                    <div className="absolute left-4 md:left-1/2 w-3 h-3 -translate-x-1/2 rounded-full bg-sky-400 border-2 border-white shadow" />
                                    <div className={`ml-10 md:ml-0 md:w-1/2 ${index % 2 === 0 ? "md:pr-8" : "md:pl-8"}`}>
                                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-sky-100 shadow-sm">
                                            <div className="text-sm text-sky-600 font-medium mb-1">
                                                {new Date(item.date).toLocaleDateString("vi-VN", {
                                                    day: "2-digit",
                                                    month: "long",
                                                    year: "numeric",
                                                })}
                                            </div>
                                            <h3 className="text-lg font-semibold text-sky-900 mb-2">{item.title}</h3>
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
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Gallery Section */}
                {data.galleries.length > 0 && (
                    <section id="gallery" className="py-12">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-sky-900 mb-2">Khoảnh khắc đáng nhớ</h2>
                            <div className="flex items-center justify-center gap-2">
                                <div className="h-px w-12 bg-sky-300" />
                                <Camera className="w-4 h-4 text-sky-500" />
                                <div className="h-px w-12 bg-sky-300" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {data.galleries.map((photo, index) => (
                                <div
                                    key={photo.id}
                                    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group border-2 border-sky-100"
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
                    </section>
                )}

                {/* Guest Book Section */}
                <section id="guestbook" className="py-12">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-sky-900 mb-2">Lưu bút</h2>
                        <div className="flex items-center justify-center gap-2">
                            <div className="h-px w-12 bg-sky-300" />
                            <Mail className="w-4 h-4 text-sky-500" />
                            <div className="h-px w-12 bg-sky-300" />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Chia sẻ cảm nhận về chuyến đi</p>
                    </div>
                    <LetterBox slug={slug} initialLetters={data.letters} theme="travel" onPopupOpenChange={setIsPopupOpen} />
                </section>

                {/* Quiz Section */}
                <section id="quiz" className="py-12">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-sky-900 mb-2">Thử thách</h2>
                        <div className="flex items-center justify-center gap-2">
                            <div className="h-px w-12 bg-sky-300" />
                            <Sparkles className="w-4 h-4 text-sky-500" />
                            <div className="h-px w-12 bg-sky-300" />
                        </div>
                    </div>
                    <CardDrawGame theme="travel" />
                </section>
            </main>

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

            {/* Scroll to top */}
            {showScrollTop && !isPopupOpen && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-20 md:bottom-8 right-4 p-3 rounded-full bg-sky-500 text-white shadow-lg hover:bg-sky-600 transition-all z-30"
                >
                    <ChevronUp className="w-5 h-5" />
                </button>
            )}
        </div>
    );
}
