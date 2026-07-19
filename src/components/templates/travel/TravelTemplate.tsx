"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Link as PrismaLink, LinkConfig, Gallery, Timeline, Letter, LetterReply } from "@prisma/client";
import { Calendar, Mail, ChevronLeft, ChevronRight, Settings, Sparkles, X, MapPin, Compass, Plane, Camera, Navigation, Mountain, TreePine, Waves, Sun } from "lucide-react";
import { TravelLetterBox } from "./TravelLetterBox";
import { TravelGameSection } from "./TravelGameSection";
import { GameStub } from "@/components/templates/GameStub";
import { normalizeGameTemplate, getGameVariant } from "@/components/templates/game-registry";

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

/* ---------- Decorative SVGs ---------- */

// Topographic contour lines — curved elevation rings
function TopoLines({ className }: { className?: string }) {
    const rings = [
        { cx: 20, cy: 30, r: 8 }, { cx: 20, cy: 30, r: 14 }, { cx: 20, cy: 30, r: 21 },
        { cx: 78, cy: 65, r: 10 }, { cx: 78, cy: 65, r: 17 }, { cx: 78, cy: 65, r: 25 },
        { cx: 50, cy: 18, r: 6 }, { cx: 50, cy: 18, r: 11 },
        { cx: 35, cy: 78, r: 7 }, { cx: 35, cy: 78, r: 13 },
        { cx: 65, cy: 40, r: 9 }, { cx: 65, cy: 40, r: 15 }, { cx: 65, cy: 40, r: 22 },
    ];
    return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
            {rings.map((r, i) => (
                <ellipse key={i} cx={r.cx} cy={r.cy} rx={r.r} ry={r.r * 0.7}
                    fill="none" stroke="#0ea5e9" strokeWidth="0.2" opacity="0.4" />
            ))}
            {/* a few elevation peaks */}
            <circle cx="20" cy="30" r="0.8" fill="#0ea5e9" opacity="0.5" />
            <circle cx="78" cy="65" r="0.8" fill="#0ea5e9" opacity="0.5" />
            <circle cx="65" cy="40" r="0.8" fill="#0ea5e9" opacity="0.5" />
        </svg>
    );
}

// Large ornate compass rose with cardinal points
function CompassRose({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 200 200" className={className} aria-hidden>
            <defs>
                <radialGradient id="compassBg">
                    <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
                    <stop offset="70%" stopColor="#fef3c7" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#fef3c7" stopOpacity="0" />
                </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="90" fill="url(#compassBg)" />
            <circle cx="100" cy="100" r="80" fill="none" stroke="#0c4a6e" strokeWidth="0.5" opacity="0.5" />
            <circle cx="100" cy="100" r="65" fill="none" stroke="#0c4a6e" strokeWidth="0.4" opacity="0.4" />
            {/* Tick marks every 15 degrees */}
            {Array.from({ length: 24 }, (_, i) => {
                const a = (i * 15 * Math.PI) / 180;
                const isCardinal = i % 6 === 0;
                const r1 = isCardinal ? 60 : 70;
                const r2 = 78;
                return (
                    <line key={i}
                        x1={100 + Math.cos(a) * r1} y1={100 + Math.sin(a) * r1}
                        x2={100 + Math.cos(a) * r2} y2={100 + Math.sin(a) * r2}
                        stroke="#0c4a6e" strokeWidth={isCardinal ? 0.8 : 0.3} opacity="0.6" />
                );
            })}
            {/* Compass star — 4 long points (N/S/E/W) */}
            <path d="M100 20 L 106 100 L 100 100 Z" fill="#0c4a6e" opacity="0.7" />
            <path d="M100 20 L 94 100 L 100 100 Z" fill="#7dd3fc" opacity="0.6" />
            <path d="M100 180 L 106 100 L 100 100 Z" fill="#0c4a6e" opacity="0.7" />
            <path d="M100 180 L 94 100 L 100 100 Z" fill="#7dd3fc" opacity="0.6" />
            <path d="M20 100 L 100 94 L 100 100 Z" fill="#0c4a6e" opacity="0.7" />
            <path d="M20 100 L 100 106 L 100 100 Z" fill="#7dd3fc" opacity="0.6" />
            <path d="M180 100 L 100 94 L 100 100 Z" fill="#0c4a6e" opacity="0.7" />
            <path d="M180 100 L 100 106 L 100 100 Z" fill="#7dd3fc" opacity="0.6" />
            {/* Diagonal shorter points */}
            {[[135, 135], [225, 135], [135, 225], [225, 225]].map(([deg], i) => {
                const a = (deg * Math.PI) / 180;
                return (
                    <path key={i}
                        d={`M${100 + Math.cos(a) * 45} ${100 + Math.sin(a) * 45} L 100 100 L ${100 + Math.cos(a) * 25} ${100 + Math.sin(a) * 25} Z`}
                        fill="#0c4a6e" opacity="0.4" />
                );
            })}
            {/* Center hub */}
            <circle cx="100" cy="100" r="5" fill="#fef3c7" stroke="#0c4a6e" strokeWidth="1" />
            <circle cx="100" cy="100" r="2" fill="#b8860b" />
            {/* Cardinal letters */}
            <text x="100" y="14" textAnchor="middle" fontSize="9" fontFamily="Georgia, serif" fill="#0c4a6e" fontWeight="bold">N</text>
            <text x="100" y="196" textAnchor="middle" fontSize="9" fontFamily="Georgia, serif" fill="#0c4a6e" fontWeight="bold">S</text>
            <text x="190" y="103" textAnchor="middle" fontSize="9" fontFamily="Georgia, serif" fill="#0c4a6e" fontWeight="bold">E</text>
            <text x="10" y="103" textAnchor="middle" fontSize="9" fontFamily="Georgia, serif" fill="#0c4a6e" fontWeight="bold">W</text>
        </svg>
    );
}

// Passport stamp — rotated ink-press style
function PassportStamp({ date, label = "VISA", className }: { date: string; label?: string; className?: string }) {
    let d: Date;
    try { d = new Date(date); } catch { d = new Date(); }
    const day = d.getDate().toString().padStart(2, "0");
    const month = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
    const year = d.getFullYear();
    return (
        <svg viewBox="0 0 100 60" className={className} aria-hidden>
            <rect x="3" y="3" width="94" height="54" fill="none" stroke="#7c2d12" strokeWidth="1.5" opacity="0.85" />
            <rect x="7" y="7" width="86" height="46" fill="none" stroke="#7c2d12" strokeWidth="0.6" opacity="0.7" />
            <text x="50" y="20" textAnchor="middle" fontSize="7" fontFamily="Georgia, serif" fill="#7c2d12" opacity="0.85" letterSpacing="2">{label}</text>
            <line x1="20" y1="25" x2="80" y2="25" stroke="#7c2d12" strokeWidth="0.4" opacity="0.6" />
            <text x="50" y="38" textAnchor="middle" fontSize="11" fontFamily="Georgia, serif" fill="#7c2d12" opacity="0.9" fontWeight="bold">{day} {month}</text>
            <text x="50" y="49" textAnchor="middle" fontSize="7" fontFamily="Georgia, serif" fill="#7c2d12" opacity="0.7">{year}</text>
        </svg>
    );
}

// Boarding pass header strip
function BoardingPassHeader({ tripName, destination, startDate, endDate, duration, slug }: {
    tripName: string; destination?: string; startDate?: string; endDate?: string; duration: number | null; slug: string;
}) {
    const fmt = (d?: string) => d ? new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
    return (
        <div className="relative bg-white rounded-xl shadow-lg border border-sky-200 overflow-hidden">
            {/* Perforated edge */}
            <div className="absolute top-0 bottom-0 left-1/3 w-px border-l-2 border-dashed border-sky-200" />
            {/* Left: flight info */}
            <div className="flex">
                <div className="w-1/3 p-4 bg-gradient-to-br from-sky-50 to-emerald-50">
                    <div className="flex items-center gap-1.5 mb-2">
                        <Plane className="w-4 h-4 text-sky-600" />
                        <span className="text-[10px] font-mono uppercase tracking-wider text-sky-600">Boarding Pass</span>
                    </div>
                    <p className="font-mono text-lg font-bold text-sky-900 leading-tight">{tripName}</p>
                    {destination && (
                        <p className="text-xs text-sky-600 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />{destination}
                        </p>
                    )}
                </div>
                {/* Right: dates / duration */}
                <div className="flex-1 p-4">
                    <div className="flex items-center justify-between gap-2 text-xs">
                        <div>
                            <p className="text-[10px] font-mono uppercase text-gray-400">Departure</p>
                            <p className="font-mono text-sky-900 font-semibold">{fmt(startDate)}</p>
                        </div>
                        <div className="flex-1 mx-2 relative">
                            <div className="border-t-2 border-dashed border-sky-200" />
                            <Plane className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 text-sky-500 bg-white px-0.5" />
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-mono uppercase text-gray-400">Return</p>
                            <p className="font-mono text-sky-900 font-semibold">{fmt(endDate)}</p>
                        </div>
                    </div>
                    {duration !== null && (
                        <div className="mt-3 inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-mono">
                            <Compass className="w-3 h-3" /> {duration} days
                        </div>
                    )}
                </div>
            </div>
            {/* Bottom stub barcode */}
            <div className="bg-sky-50 px-4 py-1.5 flex items-center gap-1">
                {Array.from({ length: 32 }, (_, i) => (
                    <div key={i} className="bg-sky-900" style={{
                        width: i % 3 === 0 ? "2px" : "1px",
                        height: "12px",
                        opacity: i % 4 === 0 ? 0.9 : 0.5,
                    } as React.CSSProperties} />
                ))}
                <span className="ml-2 font-mono text-[9px] text-sky-700">TRIP-{slug.slice(-6).toUpperCase()}</span>
            </div>
        </div>
    );
}

// Treasure X marks the spot
function TreasureX({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 60 60" className={className} aria-hidden>
            <path d="M8 8 L 52 52 M 52 8 L 8 52" stroke="#7c2d12" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
            <path d="M8 8 L 52 52 M 52 8 L 8 52" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round" opacity="0.9" />
            <circle cx="30" cy="30" r="3" fill="#fbbf24" stroke="#7c2d12" strokeWidth="0.5" />
        </svg>
    );
}

export function TravelTemplate({ data, slug, isAuthenticated }: TravelTemplateProps) {
    const [activeStop, setActiveStop] = useState<string | null>(null);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const profileData = data.profile_data as Record<string, string> | null;
    const gameTemplateId = normalizeGameTemplate(data.config?.game_template ?? null);
    const gameVariant = getGameVariant(data.type, gameTemplateId);

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
                    {/* Boarding pass header */}
                    <BoardingPassHeader
                        tripName={tripName}
                        destination={destination}
                        startDate={startDate}
                        endDate={endDate}
                        duration={duration}
                        slug={slug}
                    />

                    <div className="text-center mt-6 mb-4">
                        {destination && (
                            <div className="inline-flex items-center gap-2 text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
                                <MapPin className="w-4 h-4" />
                                <span className="font-mono text-sm">{destination}</span>
                                <span className="text-xs text-gray-400">·</span>
                                <span className="font-mono text-xs text-gray-500">
                                    {`${(destination.length * 7 % 90).toFixed(2)}°N`}
                                </span>
                            </div>
                        )}
                        {travelers && <p className="text-gray-600 mt-3 font-mono text-sm">{travelers}</p>}
                    </div>

                    {data.timelines.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-lg font-bold text-sky-900 mb-4 flex items-center gap-2 font-mono">
                                <Navigation className="w-5 h-5" />
                                Itinerary
                            </h3>
                            <div className="relative">
                                {/* Timeline line */}
                                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-sky-300 via-emerald-300 to-sky-300" />

                                <div className="space-y-6">
                                    {data.timelines.map((item, index) => (
                                        <div key={item.id} className="relative flex gap-4">
                                            {/* Numbered waypoint badge */}
                                            <div className="relative z-10 flex-shrink-0">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-emerald-400 flex items-center justify-center shadow-lg border-2 border-white font-mono text-white font-bold text-sm">
                                                    {(index + 1).toString().padStart(2, "0")}
                                                </div>
                                                {index < data.timelines.length - 1 && (
                                                    <div className="absolute top-12 left-1/2 -translate-x-1/2 w-0.5 h-full bg-sky-200" />
                                                )}
                                            </div>

                                            {/* Content card with passport stamp */}
                                            <div className="flex-1 bg-gradient-to-br from-sky-50 to-emerald-50 rounded-xl p-4 border border-sky-100 shadow-sm relative">
                                                {/* Passport stamp top-right */}
                                                <div className="absolute -top-2 -right-2 rotate-12 opacity-80 pointer-events-none">
                                                    <PassportStamp date={new Date(item.date).toISOString()} label="VISITED" className="w-20 h-12" />
                                                </div>
                                                <div className="text-sm text-sky-600 font-mono mb-1">
                                                    {new Date(item.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" })}
                                                </div>
                                                <h4 className="text-lg font-bold text-sky-900 mb-2 pr-16">{item.title}</h4>
                                                {item.description && (
                                                    <p className="text-gray-600 text-sm">{item.description}</p>
                                                )}
                                                {item.image_url && (
                                                    <Image
                                                        src={item.image_url}
                                                        alt={item.title}
                                                        width={400}
                                                        height={250}
                                                        className="mt-3 rounded-lg object-cover w-full max-h-48 border-2 border-white shadow-md"
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
                                    className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors font-mono text-sm"
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
                    <div className="flex items-center gap-3 mb-2">
                        <PassportStamp date={new Date(item.date).toISOString()} label="VISITED" className="w-24 h-14 rotate-3" />
                        <div>
                            <div className="text-sm text-sky-600 font-mono">
                                {new Date(item.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" })}
                            </div>
                            <h3 className="text-2xl font-bold text-sky-900">{item.title}</h3>
                        </div>
                    </div>
                    {item.description && <p className="text-gray-600 mb-4">{item.description}</p>}
                    {item.image_url && (
                        <Image src={item.image_url} alt={item.title} width={600} height={400} className="rounded-xl object-cover w-full max-h-64 border-2 border-white shadow-md" />
                    )}
                </div>
            );
        }

        if (activeStop === "gallery") {
            return (
                <div>
                    <h3 className="text-2xl font-bold text-sky-900 mb-1 text-center">Khoảnh khắc đáng nhớ</h3>
                    <p className="text-center text-xs font-mono text-gray-400 mb-4">polaroids · taped to the map</p>
                    {data.galleries.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {data.galleries.map((photo, index) => (
                                <div
                                    key={photo.id}
                                    className="relative cursor-pointer group bg-white p-2 pb-8 shadow-lg hover:shadow-xl transition-shadow"
                                    onClick={() => setLightboxIndex(index)}
                                    style={{ transform: `rotate(${(index % 3) - 1}deg)` } as React.CSSProperties}
                                >
                                    {/* Tape strip on top */}
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-amber-200/70 border-l border-r border-amber-300/50 rotate-1" />
                                    <div className="relative aspect-square overflow-hidden">
                                        <Image src={photo.image_url} alt={photo.caption || `Photo ${index + 1}`} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                                    </div>
                                    {photo.caption && (
                                        <p className="text-center text-xs text-gray-600 mt-2 font-mono italic truncate">{photo.caption}</p>
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
                    <p className="text-center text-xs font-mono text-gray-400 mb-4">messages from fellow travelers</p>
                    <TravelLetterBox slug={slug} initialLetters={data.letters} onPopupOpenChange={() => {}} />
                </div>
            );
        }

        if (activeStop === "quiz") {
            return (
                <div>
                    <div className="text-center mb-4">
                        <div className="inline-flex items-center justify-center relative">
                            <h3 className="text-2xl font-bold text-sky-900">Thử thách</h3>
                            <TreasureX className="absolute -right-8 -top-2 w-6 h-6" />
                        </div>
                        <p className="text-xs font-mono text-gray-400 mt-1">X marks the spot</p>
                    </div>
                    {gameTemplateId === "A" ? (
                        <TravelGameSection />
                    ) : (
                        <GameStub variantId={gameTemplateId} label={gameVariant.label} description={gameVariant.description} />
                    )}
                </div>
            );
        }

        return null;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-sky-50 to-emerald-50 overflow-hidden">
            {/* Aged paper texture overlay */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-40"
                style={{
                    background: "radial-gradient(ellipse at center, transparent 0%, transparent 60%, rgba(180, 130, 80, 0.15) 100%)",
                } as React.CSSProperties} />

            {/* Topographic contour lines background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <TopoLines className="w-full h-full opacity-30" />
            </div>

            {/* Top bar */}
            <div className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-sky-100 shadow-sm">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex items-center justify-between h-14">
                        <div className="flex items-center gap-2">
                            <Plane className="w-5 h-5 text-sky-500" />
                            <span className="font-mono font-semibold text-lg text-sky-800">{tripName}</span>
                        </div>
                        <Link href={`/${slug}/edit`} className="p-2 rounded-lg text-gray-500 hover:bg-sky-50 hover:text-sky-600 transition-colors">
                            <Settings className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Compass rose accent (corner) */}
            <div className="fixed top-20 right-4 z-5 pointer-events-none opacity-40 hidden md:block">
                <CompassRose className="w-32 h-32 animate-compass-rotate" />
            </div>

            {/* Map View */}
            <div className="pt-14 min-h-screen relative">
                {/* Map background with terrain */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Terrain decorations */}
                    <div className="absolute top-[20%] left-[10%] opacity-40">
                        <Mountain className="w-16 h-16 text-emerald-400" />
                    </div>
                    <div className="absolute top-[40%] right-[15%] opacity-40">
                        <TreePine className="w-12 h-12 text-emerald-500" />
                    </div>
                    <div className="absolute bottom-[30%] left-[20%] opacity-40">
                        <Waves className="w-14 h-14 text-sky-400" />
                    </div>
                    <div className="absolute top-[15%] right-[25%] opacity-40">
                        <Sun className="w-10 h-10 text-amber-400" />
                    </div>

                    {/* Flight path with animated airplane */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                        {/* Dashed flight path */}
                        {stops.slice(0, -1).map((stop, i) => {
                            const next = stops[i + 1];
                            return (
                                <line
                                    key={i}
                                    x1={`${stop.position.x}%`}
                                    y1={`${stop.position.y}%`}
                                    x2={`${next.position.x}%`}
                                    y2={`${next.position.y}%`}
                                    stroke="rgba(56, 189, 248, 0.5)"
                                    strokeWidth="2"
                                    strokeDasharray="8 4"
                                />
                            );
                        })}

                        {/* Animated airplane traveling along the path (uses SMIL animateMotion) */}
                        {stops.length > 1 && (
                            <g>
                                <path
                                    id="flightPath"
                                    d={`M ${stops[0].position.x} ${stops[0].position.y} ${stops.slice(1).map(s => `L ${s.position.x} ${s.position.y}`).join(" ")}`}
                                    fill="none"
                                    stroke="none"
                                />
                                <g>
                                    <circle r="3" fill="#0c4a6e" opacity="0.4">
                                        <animateMotion dur="12s" repeatCount="indefinite">
                                            <mpath href="#flightPath" />
                                        </animateMotion>
                                    </circle>
                                    <g>
                                        <path d="M-6 0 L 4 -2 L 6 0 L 4 2 L -6 0 M 0 -3 L 2 -3 L 2 3 L 0 3 Z"
                                            fill="#fff" stroke="#0c4a6e" strokeWidth="0.5" />
                                        <animateMotion dur="12s" repeatCount="indefinite" rotate="auto">
                                            <mpath href="#flightPath" />
                                        </animateMotion>
                                    </g>
                                </g>
                            </g>
                        )}
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

                            {/* Pin body — teardrop map pin shape */}
                            <div className={`relative w-12 h-12 flex items-center justify-center ${activeStop === stop.id ? "animate-pin-drop" : ""}`}>
                                <svg viewBox="0 0 24 24" className={`absolute inset-0 w-full h-full drop-shadow-lg`}>
                                    <path d="M12 0 C 5.4 0 0 5.4 0 12 c 0 8 12 12 12 12 s 12 -4 12 -12 C 24 5.4 18.6 0 12 0 Z"
                                        fill="white" stroke="#cbd5e1" strokeWidth="0.5" />
                                </svg>
                                <div className={`absolute inset-1 rounded-full bg-gradient-to-br ${stop.color} flex items-center justify-center ${
                                    activeStop === stop.id ? "ring-4 ring-sky-300/50 animate-pulse" : ""
                                }`}>
                                    <stop.icon className="w-5 h-5 text-white" />
                                </div>
                            </div>

                            {/* Pin label — coordinate-style */}
                            <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-mono px-2 py-0.5 rounded-full transition-all ${
                                activeStop === stop.id
                                    ? "bg-sky-600 text-white"
                                    : "bg-white/90 text-sky-700 group-hover:bg-sky-100"
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
                            <span className="text-sm font-mono">Tap a pin to explore</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Content Panel - slides up from bottom */}
            {activeStop && (
                <div className="fixed inset-x-0 bottom-0 z-30 animate-slideUp">
                    <div className="bg-white rounded-t-3xl shadow-2xl border-t border-sky-100 max-h-[70vh] overflow-y-auto">
                        {/* Handle bar with passport-stamp styled grip */}
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
                    <div className="max-w-4xl max-h-[80vh] relative bg-white p-3 pb-10 shadow-2xl" style={{ transform: `rotate(${(lightboxIndex % 3) - 1}deg)` } as React.CSSProperties} onClick={(e) => e.stopPropagation()}>
                        <Image
                            src={data.galleries[lightboxIndex].image_url}
                            alt={data.galleries[lightboxIndex].caption || `Photo ${lightboxIndex + 1}`}
                            width={1200}
                            height={800}
                            className="max-h-[80vh] w-auto object-contain"
                        />
                        {data.galleries[lightboxIndex].caption && (
                            <p className="text-gray-700 text-center mt-3 font-mono italic text-sm">{data.galleries[lightboxIndex].caption}</p>
                        )}
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); setLightboxIndex(Math.min(lightboxIndex + 1, data.galleries.length - 1)); }}
                        disabled={lightboxIndex === data.galleries.length - 1}
                        className="absolute right-4 p-2 text-white/80 hover:text-white disabled:opacity-30"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm font-mono">
                        {lightboxIndex + 1} / {data.galleries.length}
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                @keyframes pin-drop {
                    0% { transform: translateY(-8px) scale(0.9); }
                    60% { transform: translateY(2px) scale(1.1); }
                    100% { transform: translateY(0) scale(1.25); }
                }
                @keyframes compass-rotate {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                :global(.animate-slideUp) { animation: slideUp 0.3s ease-out; }
                :global(.animate-pin-drop) { animation: pin-drop 0.4s ease-out; }
                :global(.animate-compass-rotate) { animation: compass-rotate 60s linear infinite; transform-origin: center; }
            `}</style>
        </div>
    );
}
