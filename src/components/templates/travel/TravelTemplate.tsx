"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Link as PrismaLink, LinkConfig, Gallery, Timeline, Letter, LetterReply } from "@prisma/client";
import { Calendar, Mail, ChevronLeft, ChevronRight, Settings, Sparkles, X, MapPin, Compass, Plane, Camera, Navigation, Mountain, TreePine, Waves, Sun } from "lucide-react";
import { TravelLetterBox } from "./TravelLetterBox";
import { TravelGameSection } from "./TravelGameSection";

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
    isAuthenticated?: boolean;
}

interface MapStop {
    id: string;
    type: "timeline" | "gallery" | "guestbook" | "quiz";
    title: string;
    icon: typeof MapPin;
    position: { x: number; y: number };
    color: string;
}

export function TravelTemplate({ data, slug, isAuthenticated }: TravelTemplateProps) {
    const [activeStop, setActiveStop] = useState<string | null>(null);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const profileData = data.profile_data as Record<string, string> | null;

    const tripName = profileData?.trip_name || "Hành Trình";
    const destination = profileData?.destination;
    const startDate = profileData?.start_date;
    const endDate = profileData?.end_date;
    const travelers = profileData?.travelers;

    const getTripDuration = () => {
        if (!startDate || !endDate) return null;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    const duration = getTripDuration();

    const stops: MapStop[] = [
        { id: "home", type: "timeline", title: tripName, icon: Compass, position: { x: 50, y: 15 }, color: "from-sky-400 to-emerald-400" },
        ...data.timelines.map((t, i) => ({
            id: `timeline-${t.id}`,
            type: "timeline" as const,
            title: t.title,
            icon: Calendar,
            position: { x: 20 + (i % 3) * 30, y: 30 + Math.floor(i / 3) * 15 },
            color: "from-blue-400 to-cyan-400",
        })),
        { id: "gallery", type: "gallery", title: "Album ảnh", icon: Camera, position: { x: 75, y: 45 }, color: "from-emerald-400 to-teal-400" },
        { id: "guestbook", type: "guestbook", title: "Lưu bút", icon: Mail, position: { x: 30, y: 70 }, color: "from-violet-400 to-purple-400" },
        { id: "quiz", type: "quiz", title: "Thử thách", icon: Sparkles, position: { x: 70, y: 80 }, color: "from-amber-400 to-orange-400" },
    ];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setActiveStop(null);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const renderStopContent = () => {
        if (!activeStop) return null;

        if (activeStop === "home") {
            return (
                <div>
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-sky-200 to-emerald-200 mb-4">
                            <Compass className="w-10 h-10 text-sky-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-sky-900 mb-2">{tripName}</h2>
                        {destination && (
                            <div className="flex items-center justify-center gap-2 text-sky-600 mb-3">
                                <MapPin className="w-5 h-5" />
                                <span>{destination}</span>
                            </div>
                        )}
                        {travelers && <p className="text-gray-600 mb-4">{travelers}</p>}
                        {(startDate || endDate) && (
                            <div className="bg-sky-50 rounded-xl p-4 inline-block border border-sky-100">
                                <div className="text-sky-700">
                                    {startDate && new Date(startDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "short", year: "numeric" })}
                                    {startDate && endDate && " → "}
                                    {endDate && new Date(endDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "short", year: "numeric" })}
                                </div>
                                {duration && <p className="text-emerald-600 text-sm mt-1">{duration} ngày khám phá</p>}
                            </div>
                        )}
                    </div>

                    {/* Timeline / Hành trình */}
                    {data.timelines.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-xl font-bold text-sky-900 mb-4 flex items-center gap-2">
                                <Navigation className="w-5 h-5" />
                                Hành trình
                            </h3>
                            <div className="relative">
                                {/* Timeline line */}
                                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-sky-300 via-emerald-300 to-sky-300" />

                                {/* Timeline items */}
                                <div className="space-y-6">
                                    {data.timelines.map((item, index) => (
                                        <div key={item.id} className="relative flex gap-4">
                                            {/* Dot */}
                                            <div className="relative z-10 flex-shrink-0">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-emerald-400 flex items-center justify-center shadow-lg border-3 border-white">
                                                    <Calendar className="w-5 h-5 text-white" />
                                                </div>
                                                {index < data.timelines.length - 1 && (
                                                    <div className="absolute top-12 left-1/2 -translate-x-1/2 w-0.5 h-full bg-sky-200" />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 bg-gradient-to-br from-sky-50 to-emerald-50 rounded-xl p-4 border border-sky-100 shadow-sm">
                                                <div className="text-sm text-sky-600 font-medium mb-1">
                                                    {new Date(item.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" })}
                                                </div>
                                                <h4 className="text-lg font-bold text-sky-900 mb-2">{item.title}</h4>
                                                {item.description && (
                                                    <p className="text-gray-600 text-sm">{item.description}</p>
                                                )}
                                                {item.image_url && (
                                                    <Image
                                                        src={item.image_url}
                                                        alt={item.title}
                                                        width={400}
                                                        height={250}
                                                        className="mt-3 rounded-lg object-cover w-full max-h-48"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {data.timelines.length === 0 && (
                        <div className="mt-6 text-center py-8 bg-sky-50 rounded-xl border border-sky-100">
                            <Navigation className="w-12 h-12 text-sky-300 mx-auto mb-3" />
                            <p className="text-sky-600 italic">Chưa có hành trình nào được thêm</p>
                            {isAuthenticated && (
                                <Link
                                    href={`/${slug}/edit`}
                                    className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                                >
                                    <Settings className="w-4 h-4" />
                                    Thêm hành trình
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            );
        }

        if (activeStop.startsWith("timeline-")) {
            const timelineId = activeStop.replace("timeline-", "");
            const item = data.timelines.find(t => t.id === timelineId);
            if (!item) return null;
            return (
                <div>
                    <div className="text-sm text-sky-600 font-medium mb-2">
                        {new Date(item.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" })}
                    </div>
                    <h3 className="text-2xl font-bold text-sky-900 mb-3">{item.title}</h3>
                    {item.description && <p className="text-gray-600 mb-4">{item.description}</p>}
                    {item.image_url && (
                        <Image src={item.image_url} alt={item.title} width={600} height={400} className="rounded-xl object-cover w-full max-h-64" />
                    )}
                </div>
            );
        }

        if (activeStop === "gallery") {
            return (
                <div>
                    <h3 className="text-2xl font-bold text-sky-900 mb-4 text-center">Khoảnh khắc đáng nhớ</h3>
                    {data.galleries.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {data.galleries.map((photo, index) => (
                                <div
                                    key={photo.id}
                                    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group border-2 border-sky-100 shadow-md"
                                    onClick={() => setLightboxIndex(index)}
                                >
                                    <Image src={photo.image_url} alt={photo.caption || `Photo ${index + 1}`} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
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
            );
        }

        if (activeStop === "guestbook") {
            return (
                <div>
                    <h3 className="text-2xl font-bold text-sky-900 mb-4 text-center">Lưu bút</h3>
                    <TravelLetterBox slug={slug} initialLetters={data.letters} onPopupOpenChange={() => {}} />
                </div>
            );
        }

        if (activeStop === "quiz") {
            return (
                <div>
                    <h3 className="text-2xl font-bold text-sky-900 mb-4 text-center">Thử thách</h3>
                    <TravelGameSection />
                </div>
            );
        }

        return null;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-100 via-emerald-50 to-sky-50 overflow-hidden">
            {/* Top bar */}
            <div className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-sky-100 shadow-sm">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex items-center justify-between h-14">
                        <div className="flex items-center gap-2">
                            <Plane className="w-5 h-5 text-sky-500" />
                            <span className="font-medium text-lg text-sky-800">{tripName}</span>
                        </div>
                        <Link href={`/${slug}/edit`} className="p-2 rounded-lg text-gray-500 hover:bg-sky-50 hover:text-sky-600 transition-colors">
                            <Settings className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Map View */}
            <div className="pt-14 min-h-screen relative">
                {/* Map background with terrain */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Grid lines */}
                    <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: `
                            linear-gradient(rgba(56, 189, 248, 0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(56, 189, 248, 0.3) 1px, transparent 1px)
                        `,
                        backgroundSize: "60px 60px"
                    }} />

                    {/* Terrain decorations */}
                    <div className="absolute top-[20%] left-[10%] opacity-30">
                        <Mountain className="w-16 h-16 text-emerald-400" />
                    </div>
                    <div className="absolute top-[40%] right-[15%] opacity-30">
                        <TreePine className="w-12 h-12 text-emerald-500" />
                    </div>
                    <div className="absolute bottom-[30%] left-[20%] opacity-30">
                        <Waves className="w-14 h-14 text-sky-400" />
                    </div>
                    <div className="absolute top-[15%] right-[25%] opacity-30">
                        <Sun className="w-10 h-10 text-amber-400" />
                    </div>

                    {/* Dotted path connecting stops */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                        {stops.slice(0, -1).map((stop, i) => {
                            const next = stops[i + 1];
                            return (
                                <line
                                    key={i}
                                    x1={`${stop.position.x}%`}
                                    y1={`${stop.position.y}%`}
                                    x2={`${next.position.x}%`}
                                    y2={`${next.position.y}%`}
                                    stroke="rgba(56, 189, 248, 0.4)"
                                    strokeWidth="2"
                                    strokeDasharray="8 4"
                                />
                            );
                        })}
                    </svg>
                </div>

                {/* Map Pins */}
                <div className="absolute inset-0 z-10">
                    {stops.map((stop) => (
                        <button
                            key={stop.id}
                            onClick={() => setActiveStop(stop.id)}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 group ${
                                activeStop === stop.id ? "scale-125 z-20" : "hover:scale-110"
                            }`}
                            style={{ left: `${stop.position.x}%`, top: `${stop.position.y}%` }}
                        >
                            {/* Pin shadow */}
                            <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-2 rounded-full bg-black/20 blur-sm transition-all ${
                                activeStop === stop.id ? "w-8" : ""
                            }`} />

                            {/* Pin body */}
                            <div className={`relative w-12 h-12 rounded-full bg-gradient-to-br ${stop.color} shadow-lg flex items-center justify-center border-3 border-white ${
                                activeStop === stop.id ? "ring-4 ring-sky-300/50 animate-pulse" : ""
                            }`}>
                                <stop.icon className="w-5 h-5 text-white" />
                            </div>

                            {/* Pin label */}
                            <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium px-2 py-0.5 rounded-full transition-all ${
                                activeStop === stop.id
                                    ? "bg-sky-600 text-white"
                                    : "bg-white/80 text-sky-700 group-hover:bg-sky-100"
                            }`}>
                                {stop.title}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Instruction overlay when no stop selected */}
                {!activeStop && (
                    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-sky-100 animate-bounce">
                        <div className="flex items-center gap-2 text-sky-700">
                            <Navigation className="w-4 h-4" />
                            <span className="text-sm font-medium">Nhấn vào điểm trên bản đồ để khám phá</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Content Panel - slides up from bottom */}
            {activeStop && (
                <div className="fixed inset-x-0 bottom-0 z-30 animate-slideUp">
                    <div className="bg-white rounded-t-3xl shadow-2xl border-t border-sky-100 max-h-[70vh] overflow-y-auto">
                        {/* Handle bar */}
                        <div className="sticky top-0 bg-white pt-3 pb-2 border-b border-sky-50 z-10">
                            <div className="w-12 h-1.5 bg-sky-200 rounded-full mx-auto" />
                        </div>

                        {/* Close button */}
                        <button
                            onClick={() => setActiveStop(null)}
                            className="absolute top-4 right-4 p-2 rounded-full bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors z-20"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Content */}
                        <div className="p-6 pb-8">
                            {renderStopContent()}
                        </div>
                    </div>
                </div>
            )}

            {/* Lightbox */}
            {lightboxIndex !== null && data.galleries.length > 0 && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" onClick={() => setLightboxIndex(null)}>
                    <button onClick={() => setLightboxIndex(null)} className="absolute top-4 right-4 p-2 text-white/80 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setLightboxIndex(Math.max(lightboxIndex - 1, 0)); }}
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
                        onClick={(e) => { e.stopPropagation(); setLightboxIndex(Math.min(lightboxIndex + 1, data.galleries.length - 1)); }}
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
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                :global(.animate-slideUp) { animation: slideUp 0.3s ease-out; }
            `}</style>
        </div>
    );
}
