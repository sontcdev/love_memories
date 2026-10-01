"use client";

// Love2TemplateV2 — bản giữ nguyên implementation mới (UX roadmap) của Love2Template.
// Love2Template.tsx đã được rollback về đúng phiên bản trên nhánh deploy, nên mọi
// tính năng mới (game variant, night mode, hiệu ứng mới, polaroid wall) sống ở file V2 này.

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Link as PrismaLink, LinkConfig, Gallery, Timeline, Letter, LetterReply } from "@prisma/client";
import { Heart, Calendar, Image as ImageIcon, Mail, ChevronLeft, ChevronRight, Settings, Sparkles, X } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import { Love2LetterBox } from "./Love2LetterBox";
import { Love2GameSection } from "./Love2GameSection";
import { TemplateVariantGame } from "@/components/templates/TemplateVariantGame";
import { normalizeGameTemplate } from "@/components/templates/game-registry";
import { ThemeToggleButton } from "@/components/theme/ThemeToggleButton";
import { useThemeToggle } from "@/components/theme/useThemeToggle";
import { buildTemplateTokens } from "@/components/theme/template-tokens";

type LetterWithReplies = Letter & { replies: LetterReply[] };

type LinkWithRelations = PrismaLink & {
    config: LinkConfig | null;
    galleries: Gallery[];
    timelines: Timeline[];
    letters: LetterWithReplies[];
};

interface Love2TemplateV2Props {
    data: LinkWithRelations;
    slug: string;
}

type DeskItem = "home" | "gallery" | "timeline" | "game" | "letters";

export function Love2TemplateV2({ data, slug }: Love2TemplateV2Props) {
    const [activeItem, setActiveItem] = useState<DeskItem | null>(null);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const profileData = data.profile_data as Record<string, string> | null;
    const gameTemplateId = normalizeGameTemplate(data.config?.game_template ?? null);
    const { isDark, toggle: handleThemeToggle } = useThemeToggle({
        slug,
        darkBg: "#181614",
        lightBg: data.config?.background_color || "#faf6f0",
    });
    const { style: tokenStyle } = buildTemplateTokens({
        accentColor: data.config?.accent_color,
        fontFamily: data.config?.font_family,
    });

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
        return Math.ceil(Math.abs(today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    };
    const daysTogether = getDaysTogether();

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

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightboxIndex !== null) {
                if (e.key === 'ArrowRight') nextImage();
                if (e.key === 'ArrowLeft') prevImage();
                if (e.key === 'Escape') closeLightbox();
            } else if (activeItem) {
                if (e.key === 'Escape') setActiveItem(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex, nextImage, prevImage, activeItem]);

    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => { if (lightboxIndex !== null) nextImage(); },
        onSwipedRight: () => { if (lightboxIndex !== null) prevImage(); },
        preventScrollOnSwipe: true,
        trackMouse: false,
    });

    const polaroids: { id: DeskItem; label: string; icon: typeof Heart; rotation: string; count: number }[] = [
        { id: "gallery", label: "Scrapbook", icon: ImageIcon, rotation: "rotate-[-2deg]", count: data.galleries.length },
        { id: "timeline", label: "Nhật Ký", icon: Calendar, rotation: "rotate-[2deg]", count: data.timelines.length },
        { id: "letters", label: "Lưu Bút", icon: Mail, rotation: "rotate-[-1.5deg]", count: data.letters.length },
        { id: "game", label: "Trò Chơi", icon: Sparkles, rotation: "rotate-[1.5deg]", count: 0 },
    ];

    return (
        <div className={`min-h-screen relative font-sans selection:bg-rose-200 transition-colors duration-500 overflow-hidden ${isDark ? "dark bg-[#1a1816] text-slate-100" : "bg-[#faf6f0] text-gray-800"}`} style={{ ...tokenStyle, fontFamily: "var(--font-display)" }}>
            <style jsx>{`
                @keyframes heartbeat {
                    0% { transform: scale(1); }
                    14% { transform: scale(1.12); }
                    28% { transform: scale(1); }
                    42% { transform: scale(1.12); }
                    70% { transform: scale(1); }
                }
                .animate-heartbeat { animation: heartbeat 1.4s infinite ease-in-out; }
                @keyframes modalIn {
                    0% { opacity: 0; transform: scale(0.9) translateY(20px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-modal-in { animation: modalIn 0.3s ease-out; }
                @keyframes glitterTwinkle {
                    0%, 100% { opacity: 0.2; transform: scale(0.7) rotate(0deg); }
                    50% { opacity: 0.9; transform: scale(1.1) rotate(45deg); }
                }
                .animate-glitter { animation: glitterTwinkle 2.5s ease-in-out infinite; }
                @keyframes tapePeel {
                    0%, 100% { transform: rotate(var(--tape-rot, -2deg)) translateY(0); }
                    50% { transform: rotate(var(--tape-rot, -2deg)) translateY(-1px); }
                }
                .animate-tape-peel { animation: tapePeel 6s ease-in-out infinite; }
                @keyframes stampInk {
                    0% { opacity: 0; transform: scale(1.3) rotate(-15deg); }
                    100% { opacity: 0.7; transform: scale(1) rotate(-8deg); }
                }
                .animate-stamp-ink { animation: stampInk 0.6s ease-out both; }
                @keyframes doodleDraw {
                    0% { stroke-dashoffset: 100; opacity: 0; }
                    100% { stroke-dashoffset: 0; opacity: 0.6; }
                }
                .animate-doodle { stroke-dasharray: 100; animation: doodleDraw 1.2s ease-out 0.3s both; }

                .kraft-texture {
                    background-image:
                        radial-gradient(circle at 1px 1px, color-mix(in oklch, var(--accent) 14%, transparent) 1px, transparent 0),
                        radial-gradient(circle at 3px 5px, color-mix(in oklch, var(--accent) 10%, transparent) 1px, transparent 0);
                    background-size: 12px 12px, 24px 24px;
                }
                .kraft-texture-dark {
                    background-image:
                        radial-gradient(circle at 1px 1px, color-mix(in oklch, var(--accent) 20%, transparent) 1px, transparent 0),
                        radial-gradient(circle at 3px 5px, color-mix(in oklch, var(--accent) 14%, transparent) 1px, transparent 0);
                    background-size: 12px 12px, 24px 24px;
                }
                .washi-tape {
                    position: absolute;
                    height: 22px;
                    background: repeating-linear-gradient(
                        90deg,
                        var(--tape-color, var(--accent)) 0px,
                        var(--tape-color, var(--accent)) 8px,
                        rgba(255,255,255,0.25) 8px,
                        rgba(255,255,255,0.25) 12px,
                        var(--tape-color, var(--accent)) 12px,
                        var(--tape-color, var(--accent)) 20px,
                        rgba(0,0,0,0.08) 20px,
                        rgba(0,0,0,0.08) 24px
                    );
                    box-shadow: 0 1px 3px rgba(0,0,0,0.15);
                    opacity: 0.92;
                }
                .washi-tape-a { --tape-color: color-mix(in oklch, var(--accent) 55%, white); }
                .washi-tape-b { --tape-color: color-mix(in oklch, var(--accent) 75%, white); }
                .washi-tape-c { --tape-color: color-mix(in oklch, var(--accent) 40%, white); }

                .torn-edge-bottom {
                    -webkit-mask-image: linear-gradient(to bottom, #000 calc(100% - 8px), transparent 100%),
                        url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 8' preserveAspectRatio='none'><path d='M0,4 Q5,0 10,4 T20,4 T30,4 T40,4 T50,4 T60,4 T70,4 T80,4 T90,4 T100,4 L100,8 L0,8 Z' fill='black'/></svg>");
                    -webkit-mask-size: 100% 100%, 24px 8px;
                    -webkit-mask-position: 0 0, 0 100%;
                    -webkit-mask-repeat: no-repeat, repeat-x;
                }

                .album-corner {
                    position: absolute;
                    width: 0;
                    height: 0;
                    border-style: solid;
                    filter: drop-shadow(0 1px 1px rgba(0,0,0,0.15));
                }
                .album-corner-tl { top: -2px; left: -2px; border-width: 12px 12px 0 0; border-color: color-mix(in oklch, var(--accent) 60%, transparent) transparent transparent transparent; }
                .album-corner-tr { top: -2px; right: -2px; border-width: 12px 0 12px 0; border-color: transparent transparent transparent color-mix(in oklch, var(--accent) 60%, transparent); }
                .album-corner-bl { bottom: -2px; left: -2px; border-width: 0 12px 12px 0; border-color: transparent color-mix(in oklch, var(--accent) 60%, transparent) transparent transparent; }
                .album-corner-br { bottom: -2px; right: -2px; border-width: 0 0 12px 12px; border-color: transparent transparent color-mix(in oklch, var(--accent) 60%, transparent) transparent; }

                .postmark-stamp {
                    border: 2px solid currentColor;
                    border-radius: 9999px;
                    padding: 2px 8px;
                    font-family: 'Courier New', monospace;
                    font-size: 10px;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    transform: rotate(-8deg);
                    opacity: 0.7;
                    position: relative;
                }
                .postmark-stamp::before, .postmark-stamp::after {
                    content: '';
                    position: absolute;
                    inset: 2px;
                    border: 1px dashed currentColor;
                    border-radius: 9999px;
                    opacity: 0.5;
                }
                .postmark-stamp::after { inset: 4px; border-style: dotted; opacity: 0.3; }

                .string-divider {
                    position: relative;
                    height: 2px;
                    background: repeating-linear-gradient(
                        90deg,
                        color-mix(in oklch, var(--accent) 40%, transparent) 0px,
                        color-mix(in oklch, var(--accent) 40%, transparent) 3px,
                        transparent 3px,
                        transparent 6px
                    );
                }
                .string-pin {
                    position: absolute;
                    top: 50%;
                    width: 8px;
                    height: 8px;
                    background: radial-gradient(circle at 30% 30%, color-mix(in oklch, var(--accent) 40%, white), var(--accent));
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    box-shadow: 0 1px 2px rgba(0,0,0,0.3);
                }
                .glitter-dot {
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: radial-gradient(circle, color-mix(in oklch, var(--accent) 30%, white) 0%, var(--accent) 50%, transparent 70%);
                    border-radius: 50%;
                }

                .polaroid-card {
                    background: ${isDark ? "#2c2620" : "#f4ede3"};
                    border-radius: 4px;
                    padding: 10px 10px 22px;
                    position: relative;
                    box-shadow: 0 6px 16px rgba(0,0,0,0.18);
                }
                .polaroid-pin {
                    position: absolute;
                    top: -6px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: radial-gradient(circle at 30% 30%, color-mix(in oklch, var(--accent) 35%, white), var(--accent));
                    box-shadow: 0 2px 3px rgba(0,0,0,0.35);
                    z-index: 2;
                }
            `}</style>

            {/* Desk texture background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0" style={{ background: isDark ? "linear-gradient(to bottom right, color-mix(in oklch, var(--accent) 10%, #221e1a), #1a1816, color-mix(in oklch, var(--accent) 6%, #1a1816))" : "linear-gradient(to bottom right, color-mix(in oklch, var(--accent) 8%, #fdf8f0), #fdf8f0, color-mix(in oklch, var(--accent) 5%, #fdf8f0))" }} />
                <div className={`absolute inset-0 ${isDark ? "kraft-texture-dark opacity-30" : "kraft-texture opacity-60"} `} />

                {/* Hand-drawn doodle corners */}
                <svg className="absolute top-4 left-4 w-16 h-16 animate-doodle" style={{ color: `color-mix(in oklch, var(--accent) ${isDark ? "40%" : "50%"}, transparent)` }} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 28 Q 24 8, 40 28 T 56 36" />
                    <path d="M28 24 l -4 -8 m 4 8 l -8 -2" />
                    <circle cx="48" cy="20" r="2" fill="currentColor" />
                </svg>
                <svg className="absolute top-4 right-4 w-14 h-14 animate-doodle" style={{ color: `color-mix(in oklch, var(--accent) ${isDark ? "40%" : "50%"}, transparent)`, animationDelay: "0.4s" }} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M32 8 l 3 12 l 12 3 l -12 3 l -3 12 l -3 -12 l -12 -3 l 12 -3 z" />
                </svg>
                <svg className="absolute bottom-4 left-4 w-16 h-16 animate-doodle" style={{ color: `color-mix(in oklch, var(--accent) ${isDark ? "40%" : "50%"}, transparent)`, animationDelay: "0.6s" }} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 50 Q 24 30, 50 40 Q 30 44, 14 56" />
                    <path d="M44 36 l 6 -2 m -6 2 l 2 -6" />
                </svg>
                <svg className="absolute bottom-4 right-4 w-14 h-14 animate-doodle" style={{ color: `color-mix(in oklch, var(--accent) ${isDark ? "40%" : "50%"}, transparent)`, animationDelay: "0.8s" }} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M32 52 C 12 52, 12 28, 32 28 C 52 28, 52 52, 32 52 Z" />
                    <path d="M32 28 V 14 M 26 20 H 38" />
                </svg>

                {/* Scattered glitter dots */}
                <div className="absolute top-1/4 left-1/3 glitter-dot animate-glitter" style={{ animationDelay: "0s" }} />
                <div className="absolute top-1/3 right-1/4 glitter-dot animate-glitter" style={{ animationDelay: "0.8s", width: "3px", height: "3px" }} />
                <div className="absolute bottom-1/3 left-1/4 glitter-dot animate-glitter" style={{ animationDelay: "1.2s" }} />
                <div className="absolute bottom-1/4 right-1/3 glitter-dot animate-glitter" style={{ animationDelay: "0.4s" }} />
                <div className="absolute top-1/2 left-1/2 glitter-dot animate-glitter" style={{ animationDelay: "1.6s", width: "2px", height: "2px" }} />
            </div>

            {/* Buttons */}
            {!isPopupOpen && !activeItem && (
                <>
                    <div
                        className={`fixed top-4 right-16 z-30 rounded-full shadow-lg border ${isDark ? "bg-[#282420]/95" : "bg-white/95"}`}
                        style={{ color: "var(--accent)", borderColor: "color-mix(in oklch, var(--accent) 25%, transparent)" }}
                    >
                        <ThemeToggleButton
                            isDark={isDark}
                            onToggle={handleThemeToggle}
                            className="p-3 rounded-full transition-all hover:scale-110 block"
                            iconClassName="w-5 h-5"
                        />
                    </div>
                    <Link
                        href={`/${slug}/edit`}
                        className={`fixed top-4 right-4 z-30 p-3 rounded-full shadow-lg transition-all border hover:scale-105 ${isDark ? "bg-[#282420]/95" : "bg-white/95"}`}
                        style={{ color: "var(--accent)", borderColor: "color-mix(in oklch, var(--accent) 25%, transparent)" }}
                    >
                        <Settings className="w-5 h-5" />
                    </Link>
                </>
            )}

            {/* DESK VIEW - when no item is open */}
            {!activeItem && (
                <div className="relative min-h-screen flex flex-col items-center px-4 py-8 gap-8">
                    {/* Center profile card - like a photo frame on desk */}
                    <div className={`relative z-10 ${isDark ? "bg-[#282420]" : "bg-white"} border-4 rounded-xl p-6 sm:p-8 shadow-2xl max-w-sm w-full text-center torn-edge-bottom`} style={{ borderColor: "color-mix(in oklch, var(--accent) 35%, transparent)" }}>
                        {/* Triple washi tape header */}
                        <div className="absolute -top-3 left-0 right-0 h-6 pointer-events-none">
                            <div className="washi-tape washi-tape-a animate-tape-peel" style={{ left: "10%", width: "35%", transform: "rotate(-3deg)", "--tape-rot": "-3deg" } as React.CSSProperties} />
                            <div className="washi-tape washi-tape-b animate-tape-peel" style={{ left: "30%", width: "40%", transform: "rotate(2deg)", "--tape-rot": "2deg", animationDelay: "0.7s" } as React.CSSProperties} />
                            <div className="washi-tape washi-tape-c animate-tape-peel" style={{ left: "55%", width: "32%", transform: "rotate(-1deg)", "--tape-rot": "-1deg", animationDelay: "1.4s" } as React.CSSProperties} />
                        </div>

                        <div className="flex items-center justify-center gap-4 mb-4">
                            <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden p-0.5 border-2 ${isDark ? "bg-zinc-950" : "bg-white"} shadow-md rotate-[-3deg]`} style={{ borderColor: "color-mix(in oklch, var(--accent) 25%, transparent)" }}>
                                {boyAvatar ? (
                                    <Image src={boyAvatar} alt={boyName} width={80} height={80} className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xl font-bold" style={{ background: "color-mix(in oklch, var(--accent) 12%, transparent)", color: "var(--accent)" }}>👦</div>
                                )}
                                <span className="album-corner album-corner-tl" />
                                <span className="album-corner album-corner-br" />
                            </div>
                            <Heart className="w-6 h-6 animate-heartbeat" style={{ color: "var(--accent)", fill: "var(--accent)" }} />
                            <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden p-0.5 border-2 ${isDark ? "bg-zinc-950" : "bg-white"} shadow-md rotate-[3deg]`} style={{ borderColor: "color-mix(in oklch, var(--accent) 25%, transparent)" }}>
                                {girlAvatar ? (
                                    <Image src={girlAvatar} alt={girlName} width={80} height={80} className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xl font-bold" style={{ background: "color-mix(in oklch, var(--accent) 12%, transparent)", color: "var(--accent)" }}>👧</div>
                                )}
                                <span className="album-corner album-corner-tr" />
                                <span className="album-corner album-corner-bl" />
                            </div>
                        </div>

                        <h1 className={`text-2xl font-bold mb-1 ${isDark ? "text-slate-100" : "text-slate-800"}`} style={{ fontFamily: "var(--font-display)" }}>{title}</h1>
                        {profileData?.short_note && (
                            <p className={`italic text-xs mb-3 ${isDark ? "text-slate-400" : "text-slate-500"}`} style={{ fontFamily: "var(--font-display)" }}>&ldquo;{profileData.short_note}&rdquo;</p>
                        )}
                        {daysTogether && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm" style={{ background: "color-mix(in oklch, var(--accent) 12%, transparent)", color: "var(--accent)" }}>
                                <Heart className="w-3.5 h-3.5 fill-current" />
                                <span className="font-bold">{daysTogether}</span>
                                <span className="text-xs">ngày</span>
                            </div>
                        )}

                        {/* Doodle accent under card */}
                        <svg className="mx-auto mt-4 w-20 h-4" style={{ color: `color-mix(in oklch, var(--accent) ${isDark ? "40%" : "50%"}, transparent)` }} viewBox="0 0 80 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                            <path d="M4 8 Q 20 2, 40 8 T 76 8" />
                            <circle cx="76" cy="8" r="1.5" fill="currentColor" />
                        </svg>
                    </div>

                    {/* Polaroid wall */}
                    <div className="relative z-10 w-full max-w-sm flex flex-col gap-6 pb-8">
                        {polaroids.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveItem(item.id)}
                                className={`polaroid-card ${item.rotation} hover:scale-[1.03] hover:!rotate-0 transition-all duration-300 text-left`}
                            >
                                <span className="polaroid-pin" />
                                <div
                                    className="w-full aspect-video rounded-sm flex items-center justify-center"
                                    style={{ background: "linear-gradient(135deg, var(--accent), color-mix(in oklch, var(--accent) 45%, #000))" }}
                                >
                                    <item.icon className="w-9 h-9 text-white/90" />
                                </div>
                                <div className="flex items-end justify-between mt-2 px-0.5">
                                    <span className="italic text-sm" style={{ fontFamily: "var(--font-display)", color: isDark ? "#e8ddd0" : "#3a2f28" }}>{item.label}</span>
                                    {item.count > 0 && (
                                        <span className="text-[10px]" style={{ color: isDark ? "#a89a88" : "#8a7a68" }}>{item.count}</span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Tap hint */}
                    <div className={`text-center ${isDark ? "text-slate-500" : "text-gray-400"}`}>
                        <p className="text-xs">Nhấn vào các tấm ảnh để khám phá</p>
                    </div>
                </div>
            )}

            {/* EXPANDED ITEM MODAL */}
            {activeItem && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setActiveItem(null)} />
                    <div className={`relative w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-modal-in ${isDark ? "bg-[#282420] text-slate-100" : "bg-white text-gray-800"}`}>
                        {/* Washi tape top strip on modal */}
                        <div className="absolute -top-1 left-0 right-0 h-3 pointer-events-none z-10">
                            <div className="washi-tape washi-tape-a" style={{ left: 0, width: "100%", height: "12px", transform: "rotate(-0.5deg)" }} />
                        </div>

                        {/* Modal header */}
                        <div className={`flex items-center justify-between p-4 border-b relative`} style={{ borderColor: "color-mix(in oklch, var(--accent) 20%, transparent)" }}>
                            <div className="flex items-center gap-2">
                                {activeItem === "gallery" && <ImageIcon className="w-5 h-5" style={{ color: "var(--accent)" }} />}
                                {activeItem === "timeline" && <Calendar className="w-5 h-5" style={{ color: "var(--accent)" }} />}
                                {activeItem === "letters" && <Mail className="w-5 h-5" style={{ color: "var(--accent)" }} />}
                                {activeItem === "game" && <Sparkles className="w-5 h-5" style={{ color: "var(--accent)" }} />}
                                <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>
                                    {activeItem === "gallery" && "Scrapbook Polaroid"}
                                    {activeItem === "timeline" && "Nhật Ký"}
                                    {activeItem === "letters" && "Lưu Bút"}
                                    {activeItem === "game" && "Trò Chơi"}
                                </h2>
                            </div>
                            <button onClick={() => setActiveItem(null)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {activeItem === "gallery" && (
                                <>
                                    {data.galleries.length === 0 ? (
                                        <div className="text-center py-16 text-gray-400">
                                            <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                            <p>Chưa có ảnh nào...</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {data.galleries.map((item, index) => {
                                                const rotations = ["rotate-[-2deg]", "rotate-[1deg]", "rotate-[2deg]", "rotate-[-1deg]"];
                                                return (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => openLightbox(index)}
                                                        className={`${isDark ? "bg-[#332e28]" : "bg-white"} p-2 pb-4 border rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer ${rotations[index % 4]} relative`}
                                                        style={{ borderColor: "color-mix(in oklch, var(--accent) 20%, transparent)" }}
                                                    >
                                                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-12 h-4" style={{ background: "color-mix(in oklch, var(--accent) 25%, white)", opacity: 0.7 }} />
                                                        <div className="aspect-square relative overflow-hidden rounded-md">
                                                            <Image src={item.image_url} alt={item.caption || "Memory"} fill className="object-cover" />
                                                            <span className="album-corner album-corner-tl" />
                                                            <span className="album-corner album-corner-br" />
                                                        </div>
                                                        {item.caption && (
                                                            <p className={`text-center italic text-xs mt-2 truncate ${isDark ? "text-slate-300" : "text-slate-600"}`} style={{ fontFamily: "var(--font-display)" }}>{item.caption}</p>
                                                        )}
                                                        {/* Index doodle number */}
                                                        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border" style={{ background: "color-mix(in oklch, var(--accent) 15%, transparent)", color: "var(--accent)", borderColor: "color-mix(in oklch, var(--accent) 30%, transparent)" }}>
                                                            {index + 1}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </>
                            )}

                            {activeItem === "timeline" && (
                                <>
                                    {data.timelines.length === 0 ? (
                                        <div className="text-center py-16 text-gray-400">
                                            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                            <p>Chưa có sự kiện nào...</p>
                                        </div>
                                    ) : (
                                        <div className="relative pl-8 space-y-8">
                                            {/* String with pins vertical divider */}
                                            <div className="absolute left-2 top-2 bottom-2 w-px">
                                                <div className="string-divider h-full" />
                                                <span className="string-pin" style={{ top: "0%" }} />
                                                <span className="string-pin" style={{ top: "33%" }} />
                                                <span className="string-pin" style={{ top: "66%" }} />
                                                <span className="string-pin" style={{ top: "100%" }} />
                                            </div>
                                            {data.timelines.map((event) => (
                                                <div key={event.id} className="relative">
                                                    <div className="absolute -left-[26px] top-1 w-5 h-5 rounded-full border-4 border-white flex items-center justify-center shadow-md" style={{ background: "var(--accent)", ...(isDark ? { borderColor: "#282420" } : {}) }}>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                                    </div>
                                                    <div className={`${isDark ? "bg-[#332e28]/50" : "bg-white/50"} border rounded-xl p-4 shadow-sm relative`} style={{ borderColor: "color-mix(in oklch, var(--accent) 18%, transparent)" }}>
                                                        <div className="flex items-start justify-between gap-3 mb-2">
                                                            <div className="flex-1">
                                                                <div className="postmark-stamp inline-block animate-stamp-ink" style={{ color: "var(--accent)" }}>
                                                                    {new Date(event.date).toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" })}
                                                                </div>
                                                            </div>
                                                            <Calendar className="w-4 h-4 mt-1" style={{ color: "color-mix(in oklch, var(--accent) 70%, transparent)" }} />
                                                        </div>
                                                        <h3 className="text-base font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>{event.title}</h3>
                                                        {event.description && (
                                                            <p className={`text-sm leading-relaxed mb-3 whitespace-pre-wrap italic ${isDark ? "text-slate-300" : "text-slate-600"}`} style={{ fontFamily: "var(--font-display)" }}>&ldquo;{event.description}&rdquo;</p>
                                                        )}
                                                        {event.image_url && (
                                                            <div className="relative aspect-video rounded-lg overflow-hidden shadow-md">
                                                                <Image src={event.image_url} alt={event.title} fill className="object-cover" />
                                                                <span className="album-corner album-corner-tr" />
                                                                <span className="album-corner album-corner-bl" />
                                                            </div>
                                                        )}
                                                        {/* Doodle underline */}
                                                        <svg className="w-full h-2 mt-2" style={{ color: "color-mix(in oklch, var(--accent) 35%, transparent)" }} viewBox="0 0 200 4" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" preserveAspectRatio="none">
                                                            <path d="M2 2 Q 30 0, 60 2 T 120 2 T 198 2" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            {activeItem === "letters" && (
                                <Love2LetterBox initialLetters={data.letters} slug={slug} isDark={isDark} onPopupOpenChange={setIsPopupOpen} />
                            )}

                            {activeItem === "game" && (
                                gameTemplateId === "A" ? (
                                    <Love2GameSection photos={data.galleries.map(g => ({ id: g.id, url: g.image_url, caption: g.caption }))} isDark={isDark} />
                                ) : (
                                    <TemplateVariantGame
                                        linkType={data.type}
                                        variantId={gameTemplateId}
                                        profileData={data.profile_data as Record<string, unknown> | null}
                                        photos={data.galleries.map(g => ({ id: g.id, url: g.image_url, caption: g.caption }))}
                                        timelines={data.timelines.map(t => ({ id: t.id, title: t.title, description: t.description }))}
                                        isDark={isDark}
                                    />
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Lightbox */}
            {lightboxIndex !== null && data.galleries[lightboxIndex] && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeLightbox}>
                    <div className={`rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col ${isDark ? "bg-[#282420] text-slate-100" : "bg-white text-gray-800"}`} onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 text-white flex-shrink-0" style={{ background: "var(--accent)" }}>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{lightboxIndex + 1} / {data.galleries.length}</span>
                                <button onClick={closeLightbox} className="hover:scale-110 transition-transform"><X className="w-5 h-5" /></button>
                            </div>
                        </div>
                        <div {...swipeHandlers} className="flex-1 overflow-hidden flex items-center justify-center p-4 min-h-[300px]">
                            <div className="relative w-full aspect-[4/3] max-h-[55vh]">
                                <Image src={data.galleries[lightboxIndex].image_url} alt={data.galleries[lightboxIndex].caption || "Photo"} fill className="object-contain" priority />
                            </div>
                        </div>
                        {data.galleries[lightboxIndex].caption && (
                            <div className={`px-4 py-2 text-center text-sm italic ${isDark ? "text-slate-300" : "text-gray-600"}`} style={{ fontFamily: "var(--font-display)" }}>{data.galleries[lightboxIndex].caption}</div>
                        )}
                        <div className="flex justify-center items-center gap-4 p-4 border-t" style={{ borderColor: "color-mix(in oklch, var(--accent) 20%, transparent)" }}>
                            <button onClick={prevImage} className="p-2.5 rounded-full transition-all hover:scale-110" style={{ background: "color-mix(in oklch, var(--accent) 12%, transparent)", color: "var(--accent)" }}><ChevronLeft className="w-5 h-5" /></button>
                            <button onClick={nextImage} className="p-2.5 rounded-full transition-all hover:scale-110" style={{ background: "color-mix(in oklch, var(--accent) 12%, transparent)", color: "var(--accent)" }}><ChevronRight className="w-5 h-5" /></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
