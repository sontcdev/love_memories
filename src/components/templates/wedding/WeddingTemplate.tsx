"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Link as PrismaLink, LinkConfig, Gallery, Timeline, Letter, LetterReply } from "@prisma/client";
import { Calendar, Image as ImageIcon, Mail, ChevronLeft, ChevronRight, Settings, Sparkles, X, Gem, Clock, MapPin, ChevronDown, Heart } from "lucide-react";
import { WeddingLetterBox } from "./WeddingLetterBox";
import { WeddingGameSection } from "./WeddingGameSection";
import { TemplateVariantGame } from "@/components/templates/TemplateVariantGame";
import { normalizeGameTemplate } from "@/components/templates/game-registry";
import { useThemeToggle } from "@/components/theme/useThemeToggle";
import { ThemeToggleButton } from "@/components/theme/ThemeToggleButton";

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

/* ---------- Decorative SVGs ---------- */

// Delicate falling petal (sakura/rose petal shape)
function Petal({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
            <path d="M12 2C7 6 4 11 4 15c0 4 3 7 8 7s8-3 8-7c0-4-3-9-8-13z" opacity="0.85" />
            <path d="M12 5C9 8 7 11 7 14c0 2 2 4 5 4s5-2 5-4c0-3-2-6-5-9z" opacity="0.5" />
        </svg>
    );
}

// Botanical eucalyptus wreath — full circle of leaves
function BotanicalWreath({ className, isDark = false }: { className?: string; isDark?: boolean }) {
    // Night foliage is lifted a couple of stops so the wreath stays legible
    // against the espresso card instead of reading as a dark smudge.
    const leafA = isDark ? "#9db070" : "#7c8a5a";
    const leafB = isDark ? "#b6c68d" : "#9aa872";
    const leafOuter = isDark ? "#cfdaa8" : "#b8c490";
    const ring = isDark ? "#9db070" : "#7c8a5a";
    const leaves = Array.from({ length: 28 }, (_, i) => {
        const angle = (i / 28) * 360;
        const isOdd = i % 2 === 1;
        return { angle, isOdd, key: i };
    });
    return (
        <svg viewBox="0 0 200 200" className={className} aria-hidden>
            {leaves.map(({ angle, isOdd, key }) => {
                const rad = (angle * Math.PI) / 180;
                const cx = 100 + Math.cos(rad) * 82;
                const cy = 100 + Math.sin(rad) * 82;
                return (
                    <ellipse
                        key={key}
                        cx={cx}
                        cy={cy}
                        rx={isOdd ? 7 : 5}
                        ry={isOdd ? 14 : 11}
                        fill={isOdd ? leafA : leafB}
                        opacity={isOdd ? 0.85 : 0.65}
                        transform={`rotate(${angle + 90} ${cx} ${cy})`}
                    />
                );
            })}
            <circle cx="100" cy="100" r="78" fill="none" stroke={ring} strokeWidth="0.5" opacity="0.3" />
            {leaves.slice(0, 14).map(({ angle, key }) => {
                const rad = (angle * Math.PI) / 180;
                const cx = 100 + Math.cos(rad) * 92;
                const cy = 100 + Math.sin(rad) * 92;
                return (
                    <ellipse key={`o-${key}`} cx={cx} cy={cy} rx={4} ry={8} fill={leafOuter} opacity="0.5"
                        transform={`rotate(${angle + 90} ${cx} ${cy})`} />
                );
            })}
        </svg>
    );
}

// Monogram crest — ornate circle with initials
function MonogramCrest({ left, right, isDark = false }: { left: string; right: string; isDark?: boolean }) {
    const l = (left[0] || "?").toUpperCase();
    const r = (right[0] || "?").toUpperCase();
    // Antique gold in daylight, bright candle gold at night.
    const gold = isDark ? "#e8c877" : "#b8860b";
    const goldDeep = isDark ? "#f4d47c" : "#8b6914";
    return (
        <svg viewBox="0 0 120 120" className="w-full h-full" aria-hidden>
            {/* Outer ornate ring */}
            <circle cx="60" cy="60" r="56" fill="none" stroke={gold} strokeWidth="1.5" />
            <circle cx="60" cy="60" r="50" fill="none" stroke={gold} strokeWidth="0.75" />
            {/* Filigree dots ring */}
            {Array.from({ length: 24 }, (_, i) => {
                const a = (i / 24) * Math.PI * 2;
                return (
                    <circle key={i} cx={60 + Math.cos(a) * 53} cy={60 + Math.sin(a) * 53}
                        r="0.8" fill={gold} opacity="0.7" />
                );
            })}
            {/* Top flourish */}
            <path d="M60 8 Q 54 12 50 16 Q 60 14 70 16 Q 66 12 60 8 Z" fill={gold} opacity="0.8" />
            {/* Bottom flourish */}
            <path d="M60 112 Q 66 108 70 104 Q 60 106 50 104 Q 54 108 60 112 Z" fill={gold} opacity="0.8" />
            {/* Side flourishes */}
            <path d="M8 60 Q 12 54 16 50 Q 14 60 16 70 Q 12 66 8 60 Z" fill={gold} opacity="0.8" />
            <path d="M112 60 Q 108 66 104 70 Q 106 60 104 50 Q 108 54 112 60 Z" fill={gold} opacity="0.8" />
            {/* Interlocking initials */}
            <text x="42" y="74" textAnchor="middle" fontFamily="Georgia, serif" fontSize="38" fontStyle="italic"
                fill={goldDeep} fontWeight="600">{l}</text>
            <text x="78" y="74" textAnchor="middle" fontFamily="Georgia, serif" fontSize="38" fontStyle="italic"
                fill={goldDeep} fontWeight="600">{r}</text>
            {/* Ampersand center */}
            <text x="60" y="68" textAnchor="middle" fontFamily="Georgia, serif" fontSize="16"
                fill={gold} opacity="0.9">&amp;</text>
        </svg>
    );
}

// Interlocking wedding rings — divider ornament
function WeddingRings({ className, isDark = false }: { className?: string; isDark?: boolean }) {
    const gradientId = isDark ? "ringGoldDark" : "ringGold";
    const line = isDark ? "#e8c877" : "#b8860b";
    const diamond = isDark ? "#fff3c4" : "#f4d47c";
    return (
        <svg viewBox="0 0 120 50" className={className} aria-hidden>
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={isDark ? "#fff3c4" : "#f4d47c"} />
                    <stop offset="50%" stopColor={isDark ? "#e0b64a" : "#b8860b"} />
                    <stop offset="100%" stopColor={isDark ? "#b8860b" : "#8b6914"} />
                </linearGradient>
            </defs>
            {/* Left line */}
            <line x1="0" y1="25" x2="40" y2="25" stroke={line} strokeWidth="0.75" opacity="0.6" />
            {/* Left ring */}
            <circle cx="48" cy="25" r="13" fill="none" stroke={`url(#${gradientId})`} strokeWidth="2.5" />
            <circle cx="48" cy="25" r="13" fill="none" stroke="#fff" strokeWidth="0.5" opacity={isDark ? 0.35 : 0.6} />
            {/* Right ring */}
            <circle cx="72" cy="25" r="13" fill="none" stroke={`url(#${gradientId})`} strokeWidth="2.5" />
            <circle cx="72" cy="25" r="13" fill="none" stroke="#fff" strokeWidth="0.5" opacity={isDark ? 0.35 : 0.6} />
            {/* Diamond on top */}
            <path d="M60 8 L 64 12 L 60 18 L 56 12 Z" fill={diamond} stroke={line} strokeWidth="0.5" />
            <line x1="58" y1="8" x2="62" y2="8" stroke={line} strokeWidth="0.5" />
            {/* Right line */}
            <line x1="80" y1="25" x2="120" y2="25" stroke={line} strokeWidth="0.75" opacity="0.6" />
        </svg>
    );
}

// Lace trim — scalloped border strip
function LaceTrim({ className, flip = false }: { className?: string; flip?: boolean }) {
    const bumps = Array.from({ length: 20 }, (_, i) => i * 10);
    return (
        <svg viewBox="0 0 200 16" preserveAspectRatio="none" className={className}
            style={flip ? { transform: "scaleY(-1)" } : undefined} aria-hidden>
            <path
                d={`M0 0 L 0 8 ${bumps.map(b => `Q ${b + 5} 16 ${b + 10} 8`).join(" ")} L 200 8 L 200 0 Z`}
                fill="currentColor" opacity="0.5"
            />
            {bumps.map(b => (
                <circle key={b} cx={b + 5} cy={11} r="1.5" fill="currentColor" opacity="0.7" />
            ))}
        </svg>
    );
}

// Filigree corner ornament — baroque swirl
function FiligreeCorner({ className, rotate = 0 }: { className?: string; rotate?: number }) {
    return (
        <svg viewBox="0 0 60 60" className={className} aria-hidden
            style={{ transform: `rotate(${rotate}deg)` }}>
            <path d="M4 4 Q 30 4 30 30 Q 30 4 56 4" fill="none" stroke="currentColor" strokeWidth="1.25" />
            <path d="M10 10 Q 24 10 24 24 Q 24 10 38 10" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.7" />
            <circle cx="30" cy="4" r="2" fill="currentColor" />
            <circle cx="4" cy="30" r="2" fill="currentColor" />
            <path d="M16 16 Q 20 16 20 20 Q 20 16 24 16" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
            <circle cx="14" cy="14" r="1" fill="currentColor" opacity="0.6" />
        </svg>
    );
}

// Vintage postage stamp
function PostageStamp({ className, label = "FOREVER", isDark = false }: { className?: string; label?: string; isDark?: boolean }) {
    const paper = isDark ? "#2b2116" : "#fff8e7";
    const perf = isDark ? "#1a130d" : "#f7e8d4";
    const ink = isDark ? "#e8c877" : "#7c2d12";
    const inkSoft = isDark ? "#d4a574" : "#d4a574";
    const gold = isDark ? "#f4d47c" : "#b8860b";
    const goldText = isDark ? "#e8c877" : "#8b6914";
    return (
        <svg viewBox="0 0 60 70" className={className} aria-hidden>
            {/* Perforated border via mask */}
            <rect x="4" y="4" width="52" height="62" fill={paper} stroke={gold} strokeWidth="0.75" />
            {Array.from({ length: 7 }, (_, i) => (
                <g key={i}>
                    <circle cx={4 + (i + 1) * 7} cy="4" r="1.5" fill={perf} />
                    <circle cx={4 + (i + 1) * 7} cy="66" r="1.5" fill={perf} />
                </g>
            ))}
            {Array.from({ length: 8 }, (_, i) => (
                <g key={`s${i}`}>
                    <circle cx="4" cy={4 + (i + 1) * 7} r="1.5" fill={perf} />
                    <circle cx="56" cy={4 + (i + 1) * 7} r="1.5" fill={perf} />
                </g>
            ))}
            {/* Inner ornament */}
            <rect x="8" y="8" width="44" height="54" fill="none" stroke={inkSoft} strokeWidth="0.5" />
            <circle cx="30" cy="28" r="10" fill="none" stroke={gold} strokeWidth="0.75" />
            <path d="M30 20 L 32 26 L 38 26 L 33 30 L 35 36 L 30 32 L 25 36 L 27 30 L 22 26 L 28 26 Z" fill={ink} opacity="0.7" />
            <text x="30" y="50" textAnchor="middle" fontSize="5" fontFamily="Georgia, serif" fill={goldText}>{label}</text>
            <text x="30" y="58" textAnchor="middle" fontSize="4" fontFamily="Georgia, serif" fill={goldText} opacity="0.7">2026</text>
        </svg>
    );
}

// Draped ribbon banner
function RibbonBanner({ children, isDark = false }: { children: React.ReactNode; isDark?: boolean }) {
    const body = isDark ? "#2e2318" : "#f7e8d4";
    const tail = isDark ? "#241b12" : "#e8d5b8";
    const edge = isDark ? "#e8c877" : "#b8860b";
    const edgeSoft = isDark ? "#b8860b" : "#d4a574";
    return (
        <div className="relative inline-block">
            <svg viewBox="0 0 300 50" className="absolute inset-0 w-full h-full" preserveAspectRatio="none" aria-hidden>
                {/* Main ribbon body */}
                <path d="M10 12 Q 150 4 290 12 L 290 32 Q 150 24 10 32 Z" fill={body} stroke={edge} strokeWidth="0.75" />
                <path d="M10 12 Q 150 4 290 12 L 290 32 Q 150 24 10 32 Z" fill="none" stroke={edgeSoft} strokeWidth="0.5" opacity="0.6" />
                {/* Left tail (cut V) */}
                <path d="M10 12 L 0 18 L 10 32 L 4 22 Z" fill={tail} stroke={edge} strokeWidth="0.5" />
                {/* Right tail (cut V) */}
                <path d="M290 12 L 300 18 L 290 32 L 296 22 Z" fill={tail} stroke={edge} strokeWidth="0.5" />
            </svg>
            <div className="relative px-8 py-2 z-10">{children}</div>
        </div>
    );
}

export function WeddingTemplate({ data, slug }: WeddingTemplateProps) {
    const [isCardOpen, setIsCardOpen] = useState(false);
    const [activeSection, setActiveSection] = useState<string>("cover");
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [sealBroken, setSealBroken] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const profileData = data.profile_data as Record<string, string> | null;
    const gameTemplateId = normalizeGameTemplate(data.config?.game_template ?? null);

    // Night/Light state. Declared before every helper that reads `isDark`
    // (see the TDZ gotcha in AGENTS.md). The toggle is mounted in the top bar.
    const { isDark, toggle } = useThemeToggle({
        slug,
        darkBg: "#14100a",
        lightBg: data.config?.background_color || "#fffbeb",
    });

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

    const handleOpenCard = () => {
        setSealBroken(true);
        setTimeout(() => setIsCardOpen(true), 600);
    };

    /* ---------- Night palette (candlelit gold on espresso ink) ---------- */
    const pageShellClass = isDark
        ? "bg-gradient-to-br from-[#15110b] via-[#181014] to-[#15110b]"
        : "bg-gradient-to-br from-amber-50 via-rose-50 to-amber-50";
    // Outer card + the gilt frame + the ivory panel inside it.
    const cardShellClass = isDark
        ? "bg-[#1d160f] border-amber-900/50"
        : "bg-white border-amber-100";
    const goldFrameClass = isDark
        ? "bg-gradient-to-r from-amber-800/60 via-rose-900/50 to-amber-800/60"
        : "bg-gradient-to-r from-amber-200 via-rose-200 to-amber-200";
    const panelClass = isDark ? "bg-[#241a12]" : "bg-white";
    const laceClass = isDark ? "text-amber-700/70" : "text-amber-300";
    const laceSoftClass = isDark ? "text-amber-800/70" : "text-amber-200";
    const filigreeClass = isDark ? "text-amber-500/70" : "text-amber-400";
    const filigreeSoftClass = isDark ? "text-amber-600/60" : "text-amber-300";
    const headingClass = isDark ? "text-amber-100" : "text-amber-900";
    const scriptClass = isDark ? "text-amber-200" : "text-amber-700";
    const accentClass = isDark ? "text-amber-300" : "text-amber-600";
    const bodyClass = isDark ? "text-amber-100/75" : "text-gray-600";
    const mutedClass = isDark ? "text-amber-200/40" : "text-gray-400";
    const softMutedClass = isDark ? "text-amber-200/55" : "text-gray-500";
    const barClass = isDark
        ? "bg-[#1a130d]/90 border-amber-900/50"
        : "bg-white/90 border-amber-100";
    const dateBoxClass = isDark
        ? "bg-gradient-to-r from-amber-950/60 to-rose-950/50 border-amber-800/50"
        : "bg-gradient-to-r from-amber-50 to-rose-50 border-amber-100";
    const storyCardClass = isDark
        ? "bg-gradient-to-r from-amber-950/50 to-rose-950/40 border-amber-800/40"
        : "bg-gradient-to-r from-amber-50 to-rose-50 border-amber-100";
    const outlineBtnClass = isDark
        ? "bg-[#241a12] border-amber-800/60 text-amber-200 hover:bg-[#2e2117]"
        : "bg-white border-amber-200 text-amber-700 hover:bg-amber-50";
    const ghostBtnClass = isDark
        ? "text-amber-300 hover:bg-amber-900/30"
        : "text-amber-600 hover:bg-amber-50";
    const iconBtnClass = isDark
        ? "text-amber-200/60 hover:bg-amber-900/30 hover:text-amber-200"
        : "text-gray-500 hover:bg-amber-50 hover:text-amber-600";
    const dotIdleClass = isDark ? "bg-amber-800 hover:bg-amber-600" : "bg-amber-200 hover:bg-amber-300";
    const foilNameClass = isDark
        ? "bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-300"
        : "bg-gradient-to-r from-amber-600 via-yellow-300 to-amber-600";
    const timelineRailClass = isDark ? "border-amber-800/50" : "border-amber-200";
    const photoFrameClass = isDark
        ? "border-amber-800/50 bg-[#2b2016]"
        : "border-amber-200 bg-white";

    return (
        <div className={`min-h-screen overflow-hidden transition-colors duration-500 ${isDark ? "dark" : ""} ${pageShellClass}`}>
            {/* Falling petals — elegant, romantic */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                {[...Array(16)].map((_, i) => {
                    const left = (i * 6.25 + (i % 3) * 2) % 100;
                    const duration = 8 + (i % 4) * 2;
                    const delay = (i * 0.7) % 6;
                    const colors = isDark
                        ? ["text-rose-400/35", "text-amber-400/30", "text-pink-300/30"]
                        : ["text-rose-300/60", "text-amber-300/50", "text-pink-200/50"];
                    return (
                        <div
                            key={i}
                            className={`absolute animate-petal-fall ${colors[i % 3]}`}
                            style={{
                                left: `${left}%`,
                                top: `-30px`,
                                animationDelay: `${delay}s`,
                                animationDuration: `${duration}s`,
                            } as React.CSSProperties}
                        >
                            <Petal className="w-3 h-3" />
                            <span className="sr-only">petal</span>
                        </div>
                    );
                })}
            </div>

            {/* Card Closed State — Invitation Envelope */}
            {!isCardOpen && (
                <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
                    {/* Night/Light is also reachable before the invitation is opened —
                        the top bar with the other controls only exists once it is. */}
                    <ThemeToggleButton
                        isDark={isDark}
                        onToggle={toggle}
                        className={`fixed top-4 right-4 z-40 p-2.5 rounded-full shadow-lg backdrop-blur transition ${isDark ? "bg-[#1c1710]/90 text-amber-200 border border-amber-900/50" : "bg-white/90 text-amber-700 border border-amber-200"}`}
                        iconClassName="w-5 h-5"
                    />
                    <div className="text-center">
                        {/* Envelope */}
                        <div className="relative cursor-pointer group" onClick={handleOpenCard}>
                            {/* Vintage postage stamps (top-right corner of envelope) */}
                            <div className="absolute -top-4 -right-2 z-20 flex gap-1 rotate-6">
                                <PostageStamp className="w-10 h-12 shadow-md" label="LOVE" isDark={isDark} />
                                <PostageStamp className="w-9 h-11 shadow-md -mt-2 -rotate-3" label="FOREVER" isDark={isDark} />
                            </div>

                            {/* Envelope body */}
                            <div className={`w-80 h-56 md:w-96 md:h-64 rounded-lg shadow-2xl border-2 relative overflow-hidden transition-transform duration-500 group-hover:scale-105 ${isDark ? "bg-gradient-to-br from-[#2a1f14] to-[#2c1c20] border-amber-800/60" : "bg-gradient-to-br from-amber-100 to-rose-100 border-amber-200"}`}>
                                {/* Lace trim along top */}
                                <div className={`absolute top-0 left-0 right-0 h-3 ${laceClass}`}>
                                    <LaceTrim className="w-full h-full" />
                                </div>

                                {/* Envelope flap */}
                                <div className={`absolute top-0 left-0 right-0 h-32 transition-transform duration-500 group-hover:translate-y-[-2px] ${isDark ? "bg-gradient-to-b from-[#3b2a19] to-[#2a1f14]" : "bg-gradient-to-b from-amber-200 to-amber-100"}`}
                                    style={{ clipPath: "polygon(0 0, 50% 100%, 100% 0)" }} />

                                {/* Wax seal — animated press-in when clicked */}
                                <div className={`absolute top-20 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full shadow-lg flex items-center justify-center border-4 transition-all duration-500 ${isDark ? "bg-gradient-to-br from-rose-600 to-rose-900 border-rose-700" : "bg-gradient-to-br from-rose-400 to-rose-600 border-rose-300"} ${sealBroken ? "scale-150 opacity-0 rotate-12" : "scale-100 opacity-100"}`}>
                                    <span className="font-serif italic text-white text-xl font-bold">
                                        {(groomName[0] || "?").toUpperCase()}&amp;{(brideName[0] || "?").toUpperCase()}
                                    </span>
                                </div>

                                {/* Card peeking out */}
                                <div className={`absolute bottom-4 left-4 right-4 h-20 rounded shadow-inner flex items-center justify-center border ${isDark ? "bg-[#241a12] border-amber-900/50" : "bg-white border-amber-100"}`}>
                                    <div className="text-center px-4">
                                        <p className={`font-serif italic text-xs tracking-widest uppercase ${accentClass}`}>Thiệp mời</p>
                                        <p className={`font-serif text-base md:text-lg truncate ${headingClass}`}>{title}</p>
                                    </div>
                                </div>

                                {/* Lace trim along bottom */}
                                <div className={`absolute bottom-0 left-0 right-0 h-3 ${laceClass}`}>
                                    <LaceTrim className="w-full h-full" flip />
                                </div>
                            </div>

                            {/* Tap to open hint */}
                            <div className="mt-8 flex flex-col items-center gap-2 animate-bounce">
                                <ChevronDown className={`w-6 h-6 ${isDark ? "text-amber-300" : "text-amber-600"}`} />
                                <p className={`font-serif italic ${isDark ? "text-amber-200" : "text-amber-700"}`}>Nhấn để mở thiệp</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Card Opened State — Inside the Invitation */}
            {isCardOpen && (
                <div className="min-h-screen relative z-10">
                    {/* Top bar */}
                    <div className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b shadow-sm ${barClass}`}>
                        {/* Lace strip under top bar */}
                        <div className={`absolute bottom-0 left-0 right-0 h-2 ${laceSoftClass}`}>
                            <LaceTrim className="w-full h-full" flip />
                        </div>
                        <div className="max-w-4xl mx-auto px-4">
                            <div className="flex items-center justify-between h-14">
                                <div className="flex items-center gap-2">
                                    <span className={`font-serif italic text-lg ${isDark ? "text-amber-100" : "text-amber-800"}`}>{title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsCardOpen(false)}
                                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1 ${ghostBtnClass}`}
                                    >
                                        <Gem className="w-4 h-4" />
                                        Đóng thiệp
                                    </button>
                                    {!isPopupOpen && (
                                        <>
                                            <ThemeToggleButton
                                                isDark={isDark}
                                                onToggle={toggle}
                                                className={`p-2 rounded-lg transition-colors ${iconBtnClass}`}
                                                iconClassName="w-5 h-5"
                                            />
                                            <Link
                                                href={`/${slug}/edit`}
                                                className={`p-2 rounded-lg transition-colors ${iconBtnClass}`}
                                            >
                                                <Settings className="w-5 h-5" />
                                            </Link>
                                        </>
                                    )}
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
                                        ? `scale-150 shadow-lg ${isDark ? "bg-amber-300 shadow-amber-500/40" : "bg-amber-500 shadow-amber-300"}`
                                        : dotIdleClass
                                }`}
                                title={section.label}
                            />
                        ))}
                    </div>

                    {/* Main content area — Card pages */}
                    <div className="pt-16 pb-20 px-4 min-h-screen flex items-center justify-center">
                        <div className="w-full max-w-3xl">
                            {/* Cover Section */}
                            {activeSection === "cover" && (
                                <div className={`rounded-2xl shadow-2xl border-2 overflow-hidden animate-fadeIn relative ${cardShellClass}`}>
                                    {/* Ornate gold border */}
                                    <div className={`p-2 relative ${goldFrameClass}`}>
                                        {/* Lace trim top */}
                                        <div className={`absolute top-0 left-0 right-0 h-3 z-10 ${laceClass}`}>
                                            <LaceTrim className="w-full h-full" />
                                        </div>
                                        <div className={`rounded-xl p-8 md:p-12 relative ${panelClass}`}>
                                            {/* Filigree corner ornaments */}
                                            <FiligreeCorner className={`absolute -top-2 -left-2 w-12 h-12 ${filigreeClass}`} rotate={0} />
                                            <FiligreeCorner className={`absolute -top-2 -right-2 w-12 h-12 ${filigreeClass}`} rotate={90} />
                                            <FiligreeCorner className={`absolute -bottom-2 -left-2 w-12 h-12 ${filigreeClass}`} rotate={270} />
                                            <FiligreeCorner className={`absolute -bottom-2 -right-2 w-12 h-12 ${filigreeClass}`} rotate={180} />

                                            <div className="text-center py-6 relative">
                                                {/* Monogram crest with botanical wreath */}
                                                <div className="relative inline-flex items-center justify-center w-40 h-40 mb-6">
                                                    <BotanicalWreath className="absolute inset-0 w-full h-full animate-wreath-sway" isDark={isDark} />
                                                    <div className="w-24 h-24 relative z-10">
                                                        <MonogramCrest left={groomName} right={brideName} isDark={isDark} />
                                                    </div>
                                                </div>

                                                {/* Ribbon banner — invitation greeting */}
                                                <div className="mb-6">
                                                    <RibbonBanner isDark={isDark}>
                                                        <span className={`font-serif italic text-sm tracking-wide ${scriptClass}`}>Trân trọng kính mời</span>
                                                    </RibbonBanner>
                                                </div>

                                                {/* Groom name with gold foil shimmer */}
                                                <h1 className={`font-serif italic text-4xl md:text-5xl mb-2 relative inline-block animate-gold-shimmer bg-clip-text text-transparent ${foilNameClass}`}
                                                    style={{ backgroundSize: "200% auto" } as React.CSSProperties}>
                                                    {groomName}
                                                </h1>

                                                {/* Interlocking rings divider */}
                                                <div className="flex items-center justify-center my-4">
                                                    <WeddingRings className="w-32 h-12" isDark={isDark} />
                                                </div>

                                                {/* Bride name with gold foil shimmer */}
                                                <h1 className={`font-serif italic text-4xl md:text-5xl mb-8 relative inline-block animate-gold-shimmer bg-clip-text text-transparent ${foilNameClass}`}
                                                    style={{ backgroundSize: "200% auto" } as React.CSSProperties}>
                                                    {brideName}
                                                </h1>

                                                {weddingDate && (
                                                    <div className={`rounded-xl p-6 max-w-sm mx-auto border relative ${dateBoxClass}`}>
                                                        {/* Filigree corner accents on date box */}
                                                        <FiligreeCorner className={`absolute top-1 left-1 w-6 h-6 ${filigreeSoftClass}`} />
                                                        <FiligreeCorner className={`absolute top-1 right-1 w-6 h-6 ${filigreeSoftClass}`} rotate={90} />
                                                        <FiligreeCorner className={`absolute bottom-1 left-1 w-6 h-6 ${filigreeSoftClass}`} rotate={270} />
                                                        <FiligreeCorner className={`absolute bottom-1 right-1 w-6 h-6 ${filigreeSoftClass}`} rotate={180} />
                                                        <div className={`flex items-center justify-center gap-2 mb-2 ${scriptClass}`}>
                                                            <Calendar className="w-5 h-5" />
                                                            <span className="font-serif italic font-medium">Ngày cưới</span>
                                                        </div>
                                                        <p className={`text-xl font-serif mb-3 ${headingClass}`}>
                                                            {new Date(weddingDate).toLocaleDateString("vi-VN", {
                                                                weekday: "long",
                                                                day: "2-digit",
                                                                month: "long",
                                                                year: "numeric",
                                                            })}
                                                        </p>
                                                        {daysUntil !== null && daysUntil > 0 && (
                                                            <div className={`flex items-center justify-center gap-2 ${isDark ? "text-rose-300" : "text-rose-500"}`}>
                                                                <Clock className="w-4 h-4" />
                                                                <span className="text-sm font-medium">Còn {daysUntil} ngày</span>
                                                            </div>
                                                        )}
                                                        {daysUntil !== null && daysUntil <= 0 && (
                                                            <div className={`flex items-center justify-center gap-2 ${isDark ? "text-emerald-300" : "text-emerald-500"}`}>
                                                                <Heart className={`w-4 h-4 ${isDark ? "fill-emerald-300" : "fill-emerald-500"}`} />
                                                                <span className="text-sm font-medium">Đã diễn ra</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {venue && (
                                                    <div className={`mt-4 flex items-center justify-center gap-2 ${accentClass}`}>
                                                        <MapPin className="w-4 h-4" />
                                                        <span className="font-serif italic">{venue}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* Lace trim bottom */}
                                        <div className={`absolute bottom-0 left-0 right-0 h-3 z-10 ${laceClass}`}>
                                            <LaceTrim className="w-full h-full" flip />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Story/Timeline Section */}
                            {activeSection === "story" && (
                                <div className={`rounded-2xl shadow-2xl border-2 overflow-hidden animate-fadeIn relative ${cardShellClass}`}>
                                    <div className={`p-2 relative ${goldFrameClass}`}>
                                        <div className={`absolute top-0 left-0 right-0 h-3 z-10 ${laceClass}`}>
                                            <LaceTrim className="w-full h-full" />
                                        </div>
                                        <div className={`rounded-xl p-6 md:p-8 relative ${panelClass}`}>
                                            <div className="text-center mb-8">
                                                <h2 className={`font-serif italic text-3xl mb-3 ${headingClass}`}>Câu Chuyện Tình Yêu</h2>
                                                <WeddingRings className="w-32 h-10 mx-auto" isDark={isDark} />
                                            </div>

                                            {data.timelines.length > 0 ? (
                                                <div className="space-y-6">
                                                    {data.timelines.map((item) => (
                                                        <div key={item.id} className={`relative pl-8 border-l-2 ${timelineRailClass}`}>
                                                            {/* Floral dot on timeline */}
                                                            <div
                                                                className={`absolute left-0 top-0 w-5 h-5 -translate-x-1/2 rounded-full border-2 shadow flex items-center justify-center ${isDark ? "bg-gradient-to-br from-amber-400 to-rose-400" : "bg-gradient-to-br from-amber-300 to-rose-300"}`}
                                                                style={{ borderColor: isDark ? "#241a12" : "#ffffff" }}
                                                            >
                                                                <Heart className="w-2.5 h-2.5 text-white fill-white" />
                                                            </div>
                                                            <div className={`rounded-xl p-4 border relative ${storyCardClass}`}>
                                                                <FiligreeCorner className={`absolute -top-1 -left-1 w-5 h-5 ${filigreeSoftClass}`} />
                                                                <FiligreeCorner className={`absolute -top-1 -right-1 w-5 h-5 ${filigreeSoftClass}`} rotate={90} />
                                                                <div className={`font-serif italic text-sm mb-1 tracking-wide ${accentClass}`}>
                                                                    {new Date(item.date).toLocaleDateString("vi-VN", {
                                                                        day: "2-digit",
                                                                        month: "long",
                                                                        year: "numeric",
                                                                    })}
                                                                </div>
                                                                <h3 className={`font-serif text-lg mb-2 ${headingClass}`}>{item.title}</h3>
                                                                {item.description && (
                                                                    <p className={`text-sm ${bodyClass}`}>{item.description}</p>
                                                                )}
                                                                {item.image_url && (
                                                                    <Image
                                                                        src={item.image_url}
                                                                        alt={item.title}
                                                                        width={400}
                                                                        height={300}
                                                                        className={`mt-3 rounded-lg object-cover w-full border ${isDark ? "border-amber-800/50" : "border-amber-200"}`}
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className={`text-center italic font-serif ${mutedClass}`}>Chưa có kỷ niệm nào</p>
                                            )}
                                        </div>
                                        <div className={`absolute bottom-0 left-0 right-0 h-3 z-10 ${laceClass}`}>
                                            <LaceTrim className="w-full h-full" flip />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Gallery Section */}
                            {activeSection === "gallery" && (
                                <div className={`rounded-2xl shadow-2xl border-2 overflow-hidden animate-fadeIn relative ${cardShellClass}`}>
                                    <div className={`p-2 relative ${goldFrameClass}`}>
                                        <div className={`absolute top-0 left-0 right-0 h-3 z-10 ${laceClass}`}>
                                            <LaceTrim className="w-full h-full" />
                                        </div>
                                        <div className={`rounded-xl p-6 md:p-8 relative ${panelClass}`}>
                                            <div className="text-center mb-8">
                                                <h2 className={`font-serif italic text-3xl mb-3 ${headingClass}`}>Album Cưới</h2>
                                                <WeddingRings className="w-32 h-10 mx-auto" isDark={isDark} />
                                            </div>

                                            {data.galleries.length > 0 ? (
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {data.galleries.map((photo, index) => (
                                                        <div
                                                            key={photo.id}
                                                            className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer group border-2 shadow-md hover:shadow-lg transition-shadow p-1 ${photoFrameClass}`}
                                                            onClick={() => setLightboxIndex(index)}
                                                            style={{ transform: `rotate(${(index % 3) - 1}deg)` } as React.CSSProperties}
                                                        >
                                                            {/* Filigree corner accents on photos */}
                                                            <FiligreeCorner className={`absolute top-0 left-0 w-4 h-4 z-20 ${filigreeClass}`} />
                                                            <FiligreeCorner className={`absolute top-0 right-0 w-4 h-4 z-20 ${filigreeClass}`} rotate={90} />
                                                            <FiligreeCorner className={`absolute bottom-0 left-0 w-4 h-4 z-20 ${filigreeClass}`} rotate={270} />
                                                            <FiligreeCorner className={`absolute bottom-0 right-0 w-4 h-4 z-20 ${filigreeClass}`} rotate={180} />
                                                            <div className="relative w-full h-full overflow-hidden rounded-lg">
                                                                <Image
                                                                    src={photo.image_url}
                                                                    alt={photo.caption || `Photo ${index + 1}`}
                                                                    fill
                                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                                />
                                                            </div>
                                                            {photo.caption && (
                                                                <div className="absolute bottom-1 left-1 right-1 bg-gradient-to-t from-black/70 to-transparent p-2 rounded-b-lg z-10">
                                                                    <p className="text-white text-xs text-center truncate font-serif italic">{photo.caption}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className={`text-center italic font-serif ${mutedClass}`}>Chưa có ảnh nào</p>
                                            )}
                                        </div>
                                        <div className={`absolute bottom-0 left-0 right-0 h-3 z-10 ${laceClass}`}>
                                            <LaceTrim className="w-full h-full" flip />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Guestbook Section */}
                            {activeSection === "guestbook" && (
                                <div className={`rounded-2xl shadow-2xl border-2 overflow-hidden animate-fadeIn relative ${cardShellClass}`}>
                                    <div className={`p-2 relative ${goldFrameClass}`}>
                                        <div className={`absolute top-0 left-0 right-0 h-3 z-10 ${laceClass}`}>
                                            <LaceTrim className="w-full h-full" />
                                        </div>
                                        <div className={`rounded-xl p-6 md:p-8 relative ${panelClass}`}>
                                            <div className="text-center mb-8">
                                                <h2 className={`font-serif italic text-3xl mb-3 ${headingClass}`}>Sổ Lưu Bút</h2>
                                                <WeddingRings className="w-32 h-10 mx-auto" isDark={isDark} />
                                                <p className={`text-sm mt-2 font-serif italic ${softMutedClass}`}>Gửi lời chúc đến cô dâu chú rể</p>
                                            </div>
                                            <WeddingLetterBox slug={slug} initialLetters={data.letters} onPopupOpenChange={setIsPopupOpen} isDark={isDark} />
                                        </div>
                                        <div className={`absolute bottom-0 left-0 right-0 h-3 z-10 ${laceClass}`}>
                                            <LaceTrim className="w-full h-full" flip />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Quiz Section */}
                            {activeSection === "quiz" && (
                                <div className={`rounded-2xl shadow-2xl border-2 overflow-hidden animate-fadeIn relative ${cardShellClass}`}>
                                    <div className={`p-2 relative ${goldFrameClass}`}>
                                        <div className={`absolute top-0 left-0 right-0 h-3 z-10 ${laceClass}`}>
                                            <LaceTrim className="w-full h-full" />
                                        </div>
                                        <div className={`rounded-xl p-6 md:p-8 relative ${panelClass}`}>
                                            <div className="text-center mb-8">
                                                <h2 className={`font-serif italic text-3xl mb-3 ${headingClass}`}>Thử Thách Cặp Đôi</h2>
                                                <WeddingRings className="w-32 h-10 mx-auto" isDark={isDark} />
                                            </div>
                                            {gameTemplateId === "A" ? (
                                                <WeddingGameSection isDark={isDark} />
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
                                        <div className={`absolute bottom-0 left-0 right-0 h-3 z-10 ${laceClass}`}>
                                            <LaceTrim className="w-full h-full" flip />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Prev/next controls. The section indicator itself lives in the
                                fixed right-edge dots on desktop and the bottom tab bar on
                                mobile, so no third inline dot row here. */}
                            <div className="flex items-center justify-between mt-6">
                                <button
                                    onClick={prevSection}
                                    disabled={activeSection === "cover"}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-serif italic ${outlineBtnClass}`}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    Trước
                                </button>

                                <button
                                    onClick={nextSection}
                                    disabled={activeSection === "quiz"}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-serif italic ${outlineBtnClass}`}
                                >
                                    Sau
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom mobile nav */}
                    <div className={`fixed bottom-0 left-0 right-0 z-40 md:hidden backdrop-blur-md border-t shadow-lg ${barClass}`}>
                        <div className="flex items-center justify-around py-2">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => goToSection(section.id)}
                                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                        activeSection === section.id
                                            ? (isDark ? "text-amber-300" : "text-amber-600")
                                            : (isDark ? "text-amber-200/50" : "text-gray-500")
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
                            <p className="text-white text-center mt-4 font-serif italic">{data.galleries[lightboxIndex].caption}</p>
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
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm font-serif italic">
                        {lightboxIndex + 1} / {data.galleries.length}
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes petal-fall {
                    0% { transform: translateY(-30px) translateX(0) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.8; }
                    90% { opacity: 0.6; }
                    100% { transform: translateY(100vh) translateX(40px) rotate(360deg); opacity: 0; }
                }
                @keyframes gold-shimmer {
                    0% { background-position: 0% center; }
                    50% { background-position: 100% center; }
                    100% { background-position: 0% center; }
                }
                @keyframes wreath-sway {
                    0%, 100% { transform: rotate(-1.5deg); }
                    50% { transform: rotate(1.5deg); }
                }
                :global(.animate-fadeIn) { animation: fadeIn 0.4s ease-out; }
                :global(.animate-petal-fall) { animation: petal-fall 10s linear infinite; }
                :global(.animate-gold-shimmer) { animation: gold-shimmer 4s ease-in-out infinite; }
                :global(.animate-wreath-sway) { animation: wreath-sway 6s ease-in-out infinite; transform-origin: center; }
            `}</style>
        </div>
    );
}
