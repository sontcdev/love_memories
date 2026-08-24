"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Link as PrismaLink, LinkConfig, Gallery, Timeline, Letter, LetterReply } from "@prisma/client";
import { Settings, Sparkles, X, MapPin, Compass, Plane, Navigation, Mountain, TreePine, Waves, Sun } from "lucide-react";
import { TravelGameSection } from "./TravelGameSection";
import { TemplateVariantGame } from "@/components/templates/TemplateVariantGame";
import { normalizeGameTemplate } from "@/components/templates/game-registry";
import { useThemeToggle } from "@/components/theme/useThemeToggle";
import { ThemeToggleButton } from "@/components/theme/ThemeToggleButton";
import { TravelProfileData, TravelDestination } from "@/app/actions/profile-actions";

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
    type: "home" | "destination" | "quiz";
    title: string;
    icon: typeof MapPin;
    position: { x: number; y: number };
    color: string;
}

/* ---------- Decorative SVGs ---------- */

// Topographic contour lines — curved elevation rings
function TopoLines({ className, isDark = false }: { className?: string; isDark?: boolean }) {
    const stroke = isDark ? "#38bdf8" : "#0ea5e9";
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
                    fill="none" stroke={stroke} strokeWidth="0.2" opacity={isDark ? 0.55 : 0.4} />
            ))}
            {/* a few elevation peaks */}
            <circle cx="20" cy="30" r="0.8" fill={stroke} opacity="0.5" />
            <circle cx="78" cy="65" r="0.8" fill={stroke} opacity="0.5" />
            <circle cx="65" cy="40" r="0.8" fill={stroke} opacity="0.5" />
        </svg>
    );
}

// Large ornate compass rose with cardinal points
function CompassRose({ className, isDark = false }: { className?: string; isDark?: boolean }) {
    const gradientId = isDark ? "compassBgDark" : "compassBg";
    // At night the navy engraving would vanish, so ink and highlight swap roles.
    const ink = isDark ? "#7dd3fc" : "#0c4a6e";
    const highlight = isDark ? "#e0f2fe" : "#7dd3fc";
    const hub = isDark ? "#1e293b" : "#fef3c7";
    const needle = isDark ? "#fcd34d" : "#b8860b";
    return (
        <svg viewBox="0 0 200 200" className={className} aria-hidden>
            <defs>
                <radialGradient id={gradientId}>
                    <stop offset="0%" stopColor={isDark ? "#0f2233" : "#fff"} stopOpacity={isDark ? 0.85 : 0.9} />
                    <stop offset="70%" stopColor={isDark ? "#0b1b28" : "#fef3c7"} stopOpacity="0.7" />
                    <stop offset="100%" stopColor={isDark ? "#0b1b28" : "#fef3c7"} stopOpacity="0" />
                </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="90" fill={`url(#${gradientId})`} />
            <circle cx="100" cy="100" r="80" fill="none" stroke={ink} strokeWidth="0.5" opacity="0.5" />
            <circle cx="100" cy="100" r="65" fill="none" stroke={ink} strokeWidth="0.4" opacity="0.4" />
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
                        stroke={ink} strokeWidth={isCardinal ? 0.8 : 0.3} opacity="0.6" />
                );
            })}
            {/* Compass star — 4 long points (N/S/E/W) */}
            <path d="M100 20 L 106 100 L 100 100 Z" fill={ink} opacity="0.7" />
            <path d="M100 20 L 94 100 L 100 100 Z" fill={highlight} opacity="0.6" />
            <path d="M100 180 L 106 100 L 100 100 Z" fill={ink} opacity="0.7" />
            <path d="M100 180 L 94 100 L 100 100 Z" fill={highlight} opacity="0.6" />
            <path d="M20 100 L 100 94 L 100 100 Z" fill={ink} opacity="0.7" />
            <path d="M20 100 L 100 106 L 100 100 Z" fill={highlight} opacity="0.6" />
            <path d="M180 100 L 100 94 L 100 100 Z" fill={ink} opacity="0.7" />
            <path d="M180 100 L 100 106 L 100 100 Z" fill={highlight} opacity="0.6" />
            {/* Diagonal shorter points */}
            {[[135, 135], [225, 135], [135, 225], [225, 225]].map(([deg], i) => {
                const a = (deg * Math.PI) / 180;
                return (
                    <path key={i}
                        d={`M${100 + Math.cos(a) * 45} ${100 + Math.sin(a) * 45} L 100 100 L ${100 + Math.cos(a) * 25} ${100 + Math.sin(a) * 25} Z`}
                        fill={ink} opacity="0.4" />
                );
            })}
            {/* Center hub */}
            <circle cx="100" cy="100" r="5" fill={hub} stroke={ink} strokeWidth="1" />
            <circle cx="100" cy="100" r="2" fill={needle} />
            {/* Cardinal letters */}
            <text x="100" y="14" textAnchor="middle" fontSize="9" fontFamily="Georgia, serif" fill={ink} fontWeight="bold">N</text>
            <text x="100" y="196" textAnchor="middle" fontSize="9" fontFamily="Georgia, serif" fill={ink} fontWeight="bold">S</text>
            <text x="190" y="103" textAnchor="middle" fontSize="9" fontFamily="Georgia, serif" fill={ink} fontWeight="bold">E</text>
            <text x="10" y="103" textAnchor="middle" fontSize="9" fontFamily="Georgia, serif" fill={ink} fontWeight="bold">W</text>
        </svg>
    );
}

// Passport stamp — rotated ink-press style
function PassportStamp({ date, label = "VISA", className, isDark = false }: { date: string; label?: string; className?: string; isDark?: boolean }) {
    // Rubber-stamp ink: oxblood on paper by day, faded terracotta at night.
    const ink = isDark ? "#fca5a5" : "#7c2d12";
    let d: Date;
    try { d = new Date(date); } catch { d = new Date(); }
    const day = d.getDate().toString().padStart(2, "0");
    const month = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
    const year = d.getFullYear();
    return (
        <svg viewBox="0 0 100 60" className={className} aria-hidden>
            <rect x="3" y="3" width="94" height="54" fill="none" stroke={ink} strokeWidth="1.5" opacity="0.85" />
            <rect x="7" y="7" width="86" height="46" fill="none" stroke={ink} strokeWidth="0.6" opacity="0.7" />
            <text x="50" y="20" textAnchor="middle" fontSize="7" fontFamily="Georgia, serif" fill={ink} opacity="0.85" letterSpacing="2">{label}</text>
            <line x1="20" y1="25" x2="80" y2="25" stroke={ink} strokeWidth="0.4" opacity="0.6" />
            <text x="50" y="38" textAnchor="middle" fontSize="11" fontFamily="Georgia, serif" fill={ink} opacity="0.9" fontWeight="bold">{day} {month}</text>
            <text x="50" y="49" textAnchor="middle" fontSize="7" fontFamily="Georgia, serif" fill={ink} opacity="0.7">{year}</text>
        </svg>
    );
}

// Boarding pass header strip
function BoardingPassHeader({ tripName, destination, startDate, endDate, duration, slug, isDark = false }: {
    tripName: string; destination?: string; startDate?: string; endDate?: string; duration: number | null; slug: string; isDark?: boolean;
}) {
    const fmt = (d?: string) => d ? new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
    return (
        <div className={`relative rounded-xl shadow-lg border overflow-hidden ${isDark ? "bg-[#101c26] border-sky-800/50" : "bg-white border-sky-200"}`}>
            {/* Perforated edge */}
            <div className={`absolute top-0 bottom-0 left-1/3 w-px border-l-2 border-dashed ${isDark ? "border-sky-800/60" : "border-sky-200"}`} />
            {/* Left: flight info */}
            <div className="flex">
                <div className={`w-1/3 p-4 ${isDark ? "bg-gradient-to-br from-sky-950/70 to-emerald-950/60" : "bg-gradient-to-br from-sky-50 to-emerald-50"}`}>
                    <div className="flex items-center gap-1.5 mb-2">
                        <Plane className={`w-4 h-4 ${isDark ? "text-sky-300" : "text-sky-600"}`} />
                        <span className={`text-[10px] font-mono uppercase tracking-wider ${isDark ? "text-sky-300" : "text-sky-600"}`}>Boarding Pass</span>
                    </div>
                    <p className={`font-mono text-lg font-bold leading-tight ${isDark ? "text-sky-100" : "text-sky-900"}`}>{tripName}</p>
                    {destination && (
                        <p className={`text-xs mt-1 flex items-center gap-1 ${isDark ? "text-sky-300/80" : "text-sky-600"}`}>
                            <MapPin className="w-3 h-3" />{destination}
                        </p>
                    )}
                </div>
                {/* Right: dates / duration */}
                <div className="flex-1 p-4">
                    <div className="flex items-center justify-between gap-2 text-xs">
                        <div>
                            <p className={`text-[10px] font-mono uppercase ${isDark ? "text-slate-400" : "text-gray-400"}`}>Departure</p>
                            <p className={`font-mono font-semibold ${isDark ? "text-sky-100" : "text-sky-900"}`}>{fmt(startDate)}</p>
                        </div>
                        <div className="flex-1 mx-2 relative">
                            <div className={`border-t-2 border-dashed ${isDark ? "border-sky-800/60" : "border-sky-200"}`} />
                            <Plane className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 px-0.5 ${isDark ? "text-sky-300 bg-[#101c26]" : "text-sky-500 bg-white"}`} />
                        </div>
                        <div className="text-right">
                            <p className={`text-[10px] font-mono uppercase ${isDark ? "text-slate-400" : "text-gray-400"}`}>Return</p>
                            <p className={`font-mono font-semibold ${isDark ? "text-sky-100" : "text-sky-900"}`}>{fmt(endDate)}</p>
                        </div>
                    </div>
                    {duration !== null && (
                        <div className={`mt-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono ${isDark ? "bg-amber-900/40 text-amber-200" : "bg-amber-100 text-amber-800"}`}>
                            <Compass className="w-3 h-3" /> {duration} days
                        </div>
                    )}
                </div>
            </div>
            {/* Bottom stub barcode */}
            <div className={`px-4 py-1.5 flex items-center gap-1 ${isDark ? "bg-sky-950/60" : "bg-sky-50"}`}>
                {Array.from({ length: 32 }, (_, i) => (
                    <div key={i} className={isDark ? "bg-sky-300" : "bg-sky-900"} style={{
                        width: i % 3 === 0 ? "2px" : "1px",
                        height: "12px",
                        opacity: i % 4 === 0 ? 0.9 : 0.5,
                    } as React.CSSProperties} />
                ))}
                <span className={`ml-2 font-mono text-[9px] ${isDark ? "text-sky-300" : "text-sky-700"}`}>TRIP-{slug.slice(-6).toUpperCase()}</span>
            </div>
        </div>
    );
}

// Treasure X marks the spot
function TreasureX({ className, isDark = false }: { className?: string; isDark?: boolean }) {
    const ink = isDark ? "#fca5a5" : "#7c2d12";
    return (
        <svg viewBox="0 0 60 60" className={className} aria-hidden>
            <path d="M8 8 L 52 52 M 52 8 L 8 52" stroke={ink} strokeWidth="3" strokeLinecap="round" opacity="0.8" />
            <path d="M8 8 L 52 52 M 52 8 L 8 52" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round" opacity="0.9" />
            <circle cx="30" cy="30" r="3" fill="#fbbf24" stroke={ink} strokeWidth="0.5" />
        </svg>
    );
}

export function TravelTemplate({ data, slug, isAuthenticated }: TravelTemplateProps) {
    const [activeStop, setActiveStop] = useState<string | null>(null);
    const profileData = data.profile_data as TravelProfileData | null;
    const gameTemplateId = normalizeGameTemplate(data.config?.game_template ?? null);

    // Night/Light state. Declared before every helper that reads `isDark`
    // (see the TDZ gotcha in AGENTS.md). The toggle is mounted in the bottom bar.
    const { isDark, toggle } = useThemeToggle({
        slug,
        darkBg: "#0a1017",
        lightBg: data.config?.background_color || "#f0f9ff",
    });

    /* ---------- Night palette (lamp-lit chart table) ---------- */
    const pageShellClass = isDark
        ? "bg-gradient-to-br from-[#0b1017] via-[#0b141c] to-[#0a1614]"
        : "bg-gradient-to-br from-amber-50 via-sky-50 to-emerald-50";
    const barClass = isDark ? "bg-[#0d1720]/90 border-sky-900/50" : "bg-white/90 border-sky-100";
    const panelClass = isDark ? "bg-[#101c26] border-sky-900/50" : "bg-white border-sky-100";
    const headingClass = isDark ? "text-sky-100" : "text-sky-900";
    const accentClass = isDark ? "text-sky-300" : "text-sky-600";
    const bodyClass = isDark ? "text-slate-300" : "text-gray-600";
    const mutedClass = isDark ? "text-slate-500" : "text-gray-400";
    const cardClass = isDark
        ? "bg-gradient-to-br from-sky-950/60 to-emerald-950/50 border-sky-800/40"
        : "bg-gradient-to-br from-sky-50 to-emerald-50 border-sky-100";
    const iconBtnClass = isDark
        ? "text-slate-400 hover:bg-sky-900/40 hover:text-sky-200"
        : "text-gray-500 hover:bg-sky-50 hover:text-sky-600";
    const closeBtnClass = isDark
        ? "bg-sky-950/70 text-sky-300 hover:bg-sky-900/70"
        : "bg-sky-50 text-sky-600 hover:bg-sky-100";
    const pinLabelIdleClass = isDark
        ? "bg-[#101c26]/90 text-sky-200 group-hover:bg-sky-900/80"
        : "bg-white/90 text-sky-700 group-hover:bg-sky-100";

    const tripName = profileData?.trip_name || "Hành Trình";
    const destinations: TravelDestination[] = profileData?.destinations || [];
    const destinationNames = destinations.map(d => d.name).filter(Boolean).join(" · ");
    const startDate = profileData?.start_date;
    const endDate = profileData?.end_date;
    const ownerName = profileData?.owner_name;

    const getTripDuration = () => {
        if (!startDate || !endDate) return null;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    const duration = getTripDuration();

    const destinationStops: MapStop[] = destinations.map((d, i) => ({
        id: `dest-${d.id}`,
        type: "destination" as const,
        title: d.name,
        icon: MapPin,
        position: { x: 20 + (i % 3) * 30, y: 35 + Math.floor(i / 3) * 20 },
        color: "from-blue-400 to-cyan-400",
    }));

    const stops: MapStop[] = [
        { id: "home", type: "home", title: tripName, icon: Compass, position: { x: 50, y: 15 }, color: "from-sky-400 to-emerald-400" },
        ...destinationStops,
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
                        destination={destinationNames || undefined}
                        startDate={startDate}
                        endDate={endDate}
                        duration={duration}
                        slug={slug}
                        isDark={isDark}
                    />

                    <div className="text-center mt-6 mb-4">
                        {ownerName && <p className={`font-mono text-sm ${bodyClass}`}>Người tổ chức: {ownerName}</p>}
                    </div>

                    {destinations.length > 0 ? (
                        <div className="mt-4">
                            <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 font-mono ${headingClass}`}>
                                <Navigation className="w-5 h-5" />
                                Điểm đến
                            </h3>
                            <div className="grid gap-3">
                                {destinations.map((d, index) => (
                                    <button
                                        key={d.id}
                                        onClick={() => setActiveStop(`dest-${d.id}`)}
                                        className={`flex items-center gap-4 rounded-xl p-4 border shadow-sm text-left transition-transform hover:scale-[1.01] ${cardClass}`}
                                    >
                                        <div
                                            className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-emerald-400 flex items-center justify-center shadow-lg font-mono text-white font-bold text-sm flex-shrink-0"
                                        >
                                            {(index + 1).toString().padStart(2, "0")}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`font-bold truncate ${headingClass}`}>{d.name}</h4>
                                            {d.location_note && <p className={`text-sm truncate ${bodyClass}`}>{d.location_note}</p>}
                                            <p className={`text-xs font-mono mt-0.5 ${mutedClass}`}>{d.milestones.length} cột mốc</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className={`mt-6 text-center py-8 rounded-xl border ${isDark ? "bg-sky-950/50 border-sky-800/50" : "bg-sky-50 border-sky-100"}`}>
                            <Navigation className={`w-12 h-12 mx-auto mb-3 ${isDark ? "text-sky-700" : "text-sky-300"}`} />
                            <p className={`italic ${accentClass}`}>Chưa có điểm đến nào được thêm</p>
                            {isAuthenticated && (
                                <Link
                                    href={`/${slug}/edit`}
                                    className={`inline-flex items-center gap-2 mt-3 px-4 py-2 text-white rounded-lg transition-colors font-mono text-sm ${isDark ? "bg-sky-700 hover:bg-sky-600" : "bg-sky-500 hover:bg-sky-600"}`}
                                >
                                    <Settings className="w-4 h-4" />
                                    Thêm điểm đến
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            );
        }

        if (activeStop.startsWith("dest-")) {
            const destId = activeStop.replace("dest-", "");
            const destIndex = destinations.findIndex(d => d.id === destId);
            const dest = destinations[destIndex];
            if (!dest) return null;
            const milestones = [...dest.milestones].sort((a, b) => a.sort_order - b.sort_order);
            const prevDest = destIndex > 0 ? destinations[destIndex - 1] : null;
            const nextDest = destIndex < destinations.length - 1 ? destinations[destIndex + 1] : null;
            return (
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <MapPin className={`w-6 h-6 flex-shrink-0 ${accentClass}`} />
                        <div>
                            <h3 className={`text-2xl font-bold ${headingClass}`}>{dest.name}</h3>
                            {dest.location_note && <p className={`text-sm ${bodyClass}`}>{dest.location_note}</p>}
                        </div>
                    </div>
                    {destinations.length > 1 && (
                        <div className="flex items-center justify-between mt-4 mb-2">
                            <button
                                onClick={() => prevDest && setActiveStop(`dest-${prevDest.id}`)}
                                disabled={!prevDest}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-mono transition-colors ${cardClass} disabled:opacity-30 disabled:cursor-not-allowed`}
                            >
                                ← {prevDest ? prevDest.name : "Trước"}
                            </button>
                            <span className={`text-xs font-mono ${mutedClass}`}>
                                {destIndex + 1}/{destinations.length}
                            </span>
                            <button
                                onClick={() => nextDest && setActiveStop(`dest-${nextDest.id}`)}
                                disabled={!nextDest}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-mono transition-colors ${cardClass} disabled:opacity-30 disabled:cursor-not-allowed`}
                            >
                                {nextDest ? nextDest.name : "Sau"} →
                            </button>
                        </div>
                    )}
                    {dest.cover_image_url && (
                        <Image
                            src={dest.cover_image_url}
                            alt={dest.name}
                            width={600}
                            height={350}
                            className={`mt-3 rounded-xl object-cover w-full max-h-56 border-2 shadow-md ${isDark ? "border-sky-900/60" : "border-white"}`}
                        />
                    )}

                    {milestones.length > 0 ? (
                        <div className="relative mt-6">
                            <div className={`absolute left-6 top-0 bottom-0 w-0.5 ${isDark ? "bg-gradient-to-b from-sky-700 via-emerald-700 to-sky-700" : "bg-gradient-to-b from-sky-300 via-emerald-300 to-sky-300"}`} />
                            <div className="space-y-6">
                                {milestones.map((item, index) => (
                                    <div key={item.id} className="relative flex gap-4">
                                        <div className="relative z-10 flex-shrink-0">
                                            <div
                                                className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-emerald-400 flex items-center justify-center shadow-lg border-2 font-mono text-white font-bold text-sm"
                                                style={{ borderColor: isDark ? "#101c26" : "#ffffff" }}
                                            >
                                                {(index + 1).toString().padStart(2, "0")}
                                            </div>
                                            {index < milestones.length - 1 && (
                                                <div className={`absolute top-12 left-1/2 -translate-x-1/2 w-0.5 h-full ${isDark ? "bg-sky-800" : "bg-sky-200"}`} />
                                            )}
                                        </div>

                                        <div className={`flex-1 rounded-xl p-4 border shadow-sm relative ${cardClass}`}>
                                            {item.date && (
                                                <div className="absolute -top-2 -right-2 rotate-12 opacity-80 pointer-events-none">
                                                    <PassportStamp date={new Date(item.date).toISOString()} label="VISITED" className="w-20 h-12" isDark={isDark} />
                                                </div>
                                            )}
                                            {item.date && (
                                                <div className={`text-sm font-mono mb-1 ${accentClass}`}>
                                                    {new Date(item.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" })}
                                                </div>
                                            )}
                                            <h4 className={`text-lg font-bold mb-2 pr-16 ${headingClass}`}>{item.title}</h4>
                                            {item.description && (
                                                <p className={`text-sm ${bodyClass}`}>{item.description}</p>
                                            )}
                                            {item.image_url && (
                                                <Image
                                                    src={item.image_url}
                                                    alt={item.title}
                                                    width={400}
                                                    height={250}
                                                    className={`mt-3 rounded-lg object-cover w-full max-h-48 border-2 shadow-md ${isDark ? "border-sky-900/60" : "border-white"}`}
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className={`mt-6 text-center italic ${mutedClass}`}>Chưa có cột mốc nào ở điểm đến này</p>
                    )}
                </div>
            );
        }

        if (activeStop === "quiz") {
            return (
                <div>
                    <div className="text-center mb-4">
                        <div className="inline-flex items-center justify-center relative">
                            <h3 className={`text-2xl font-bold ${headingClass}`}>Thử thách</h3>
                            <TreasureX className="absolute -right-8 -top-2 w-6 h-6" isDark={isDark} />
                        </div>
                        <p className={`text-xs font-mono mt-1 ${mutedClass}`}>X marks the spot</p>
                    </div>
                    {gameTemplateId === "A" ? (
                        <TravelGameSection isDark={isDark} />
                    ) : (
                        <TemplateVariantGame
                            linkType={data.type}
                            variantId={gameTemplateId}
                            profileData={data.profile_data as Record<string, unknown> | null}
                            photos={data.galleries.map(g => ({ id: g.id, url: g.image_url, caption: g.caption }))}
                            timelines={data.timelines.map(t => ({ id: t.id, title: t.title, description: t.description }))}
                            isDark={isDark}
                        />
                    )}
                </div>
            );
        }

        return null;
    };

    return (
        <div className={`min-h-screen overflow-hidden transition-colors duration-500 ${isDark ? "dark" : ""} ${pageShellClass}`}>
            {/* Aged paper texture overlay */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-40"
                style={{
                    background: isDark
                        ? "radial-gradient(ellipse at center, transparent 0%, transparent 55%, rgba(0, 0, 0, 0.65) 100%)"
                        : "radial-gradient(ellipse at center, transparent 0%, transparent 60%, rgba(180, 130, 80, 0.15) 100%)",
                } as React.CSSProperties} />

            {/* Topographic contour lines background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <TopoLines className={`w-full h-full ${isDark ? "opacity-25" : "opacity-30"}`} isDark={isDark} />
            </div>

            {/* Top bar */}
            <div className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b shadow-sm ${barClass}`}>
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex items-center justify-between h-14">
                        <div className="flex items-center gap-2">
                            <Plane className={`w-5 h-5 ${isDark ? "text-sky-300" : "text-sky-500"}`} />
                            <span className={`font-mono font-semibold text-lg ${isDark ? "text-sky-100" : "text-sky-800"}`}>{tripName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <ThemeToggleButton
                                isDark={isDark}
                                onToggle={toggle}
                                className={`p-2 rounded-lg transition-colors ${iconBtnClass}`}
                                iconClassName="w-5 h-5"
                            />
                            <Link href={`/${slug}/edit`} className={`p-2 rounded-lg transition-colors ${iconBtnClass}`}>
                                <Settings className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Compass rose accent (corner) */}
            <div className="fixed top-20 right-4 z-5 pointer-events-none opacity-40 hidden md:block">
                <CompassRose className="w-32 h-32 animate-compass-rotate" isDark={isDark} />
            </div>

            {/* Floating button to the challenge cards ("thẻ phiêu lưu") */}
            <button
                onClick={() => setActiveStop("quiz")}
                className={`fixed bottom-6 left-4 z-40 flex items-center gap-2 rounded-full px-4 py-3 shadow-lg border font-mono text-sm transition-transform hover:scale-105 ${
                    isDark ? "bg-amber-900/70 border-amber-700/60 text-amber-200" : "bg-amber-100 border-amber-200 text-amber-800"
                }`}
            >
                <Sparkles className="w-4 h-4" />
                Thử thách
            </button>

            {/* Map View */}
            <div className="pt-14 min-h-screen relative">
                {/* Map background with terrain */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Terrain decorations */}
                    <div className={isDark ? "absolute top-[20%] left-[10%] opacity-30" : "absolute top-[20%] left-[10%] opacity-40"}>
                        <Mountain className={`w-16 h-16 ${isDark ? "text-emerald-500" : "text-emerald-400"}`} />
                    </div>
                    <div className={isDark ? "absolute top-[40%] right-[15%] opacity-30" : "absolute top-[40%] right-[15%] opacity-40"}>
                        <TreePine className={`w-12 h-12 ${isDark ? "text-emerald-600" : "text-emerald-500"}`} />
                    </div>
                    <div className={isDark ? "absolute bottom-[30%] left-[20%] opacity-30" : "absolute bottom-[30%] left-[20%] opacity-40"}>
                        <Waves className={`w-14 h-14 ${isDark ? "text-sky-500" : "text-sky-400"}`} />
                    </div>
                    <div className={isDark ? "absolute top-[15%] right-[25%] opacity-30" : "absolute top-[15%] right-[25%] opacity-40"}>
                        <Sun className={`w-10 h-10 ${isDark ? "text-amber-300" : "text-amber-400"}`} />
                    </div>

                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                        {destinationStops.slice(0, -1).map((stop, i) => {
                            const next = destinationStops[i + 1];
                            return (
                                <line
                                    key={i}
                                    x1={`${stop.position.x}%`}
                                    y1={`${stop.position.y}%`}
                                    x2={`${next.position.x}%`}
                                    y2={`${next.position.y}%`}
                                    stroke={isDark ? "rgba(125, 211, 252, 0.45)" : "rgba(56, 189, 248, 0.5)"}
                                    strokeWidth="2"
                                    strokeDasharray="8 4"
                                />
                            );
                        })}

                        {destinationStops.length > 1 && (
                            <g>
                                <path
                                    id="flightPath"
                                    d={`M ${destinationStops[0].position.x} ${destinationStops[0].position.y} ${destinationStops.slice(1).map(s => `L ${s.position.x} ${s.position.y}`).join(" ")}`}
                                    fill="none"
                                    stroke="none"
                                />
                                <g>
                                    <circle r="3" fill={isDark ? "#7dd3fc" : "#0c4a6e"} opacity="0.4">
                                        <animateMotion dur="12s" repeatCount="indefinite">
                                            <mpath href="#flightPath" />
                                        </animateMotion>
                                    </circle>
                                    <g>
                                        <path d="M-6 0 L 4 -2 L 6 0 L 4 2 L -6 0 M 0 -3 L 2 -3 L 2 3 L 0 3 Z"
                                            fill={isDark ? "#e0f2fe" : "#fff"} stroke={isDark ? "#0f2233" : "#0c4a6e"} strokeWidth="0.5" />
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
                            <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-2 rounded-full blur-sm transition-all ${isDark ? "bg-black/50" : "bg-black/20"} ${
                                activeStop === stop.id ? "w-8" : ""
                            }`} />

                            {/* Pin body — teardrop map pin shape */}
                            <div className={`relative w-12 h-12 flex items-center justify-center ${activeStop === stop.id ? "animate-pin-drop" : ""}`}>
                                <svg viewBox="0 0 24 24" className={`absolute inset-0 w-full h-full drop-shadow-lg`}>
                                    <path d="M12 0 C 5.4 0 0 5.4 0 12 c 0 8 12 12 12 12 s 12 -4 12 -12 C 24 5.4 18.6 0 12 0 Z"
                                        fill={isDark ? "#16222c" : "white"} stroke={isDark ? "#334155" : "#cbd5e1"} strokeWidth="0.5" />
                                </svg>
                                <div className={`absolute inset-1 rounded-full bg-gradient-to-br ${stop.color} flex items-center justify-center ${
                                    activeStop === stop.id ? `ring-4 animate-pulse ${isDark ? "ring-sky-500/40" : "ring-sky-300/50"}` : ""
                                }`}>
                                    <stop.icon className="w-5 h-5 text-white" />
                                </div>
                            </div>

                            {/* Pin label — coordinate-style */}
                            <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-mono px-2 py-0.5 rounded-full transition-all ${
                                activeStop === stop.id
                                    ? (isDark ? "bg-sky-700 text-white" : "bg-sky-600 text-white")
                                    : pinLabelIdleClass
                            }`}>
                                {stop.title}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Instruction overlay when no stop selected */}
                {!activeStop && (
                    <div className={`absolute bottom-24 left-1/2 -translate-x-1/2 z-20 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border animate-bounce ${isDark ? "bg-[#101c26]/90 border-sky-800/50" : "bg-white/90 border-sky-100"}`}>
                        <div className={`flex items-center gap-2 ${isDark ? "text-sky-200" : "text-sky-700"}`}>
                            <Navigation className="w-4 h-4" />
                            <span className="text-sm font-mono">Tap a pin to explore</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Content Panel - slides up from bottom */}
            {activeStop && (
                <div className="fixed inset-x-0 bottom-0 z-30 animate-slideUp">
                    <div className={`relative mx-auto max-w-3xl rounded-t-3xl shadow-2xl border-t max-h-[70vh] overflow-y-auto ${panelClass}`}>
                        {/* Handle bar with passport-stamp styled grip */}
                        <div className={`sticky top-0 pt-3 pb-2 border-b z-10 ${isDark ? "bg-[#101c26] border-sky-900/40" : "bg-white border-sky-50"}`}>
                            <div className={`w-12 h-1.5 rounded-full mx-auto ${isDark ? "bg-sky-800" : "bg-sky-200"}`} />
                        </div>

                        {/* Close button */}
                        <button
                            onClick={() => setActiveStop(null)}
                            className={`absolute top-4 right-4 p-2 rounded-full transition-colors z-20 ${closeBtnClass}`}
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
