"use client";

// Love2TemplateV2 — bản giữ nguyên implementation mới (UX roadmap) của Love2Template.
// Love2Template.tsx đã được rollback về đúng phiên bản trên nhánh deploy, nên mọi
// tính năng mới (game variant, night mode, hiệu ứng mới) sống ở file V2 này.

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Link as PrismaLink, LinkConfig, Gallery, Timeline, Letter, LetterReply } from "@prisma/client";
import { Heart, Calendar, Image as ImageIcon, Mail, ChevronLeft, ChevronRight, Settings, Sparkles, X, Coffee } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import { Love2LetterBox } from "./Love2LetterBox";
import { Love2GameSection } from "./Love2GameSection";
import { TemplateVariantGame } from "@/components/templates/TemplateVariantGame";
import { normalizeGameTemplate } from "@/components/templates/game-registry";
import { ThemeToggleButton } from "@/components/theme/ThemeToggleButton";
import { useThemeToggle } from "@/components/theme/useThemeToggle";

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

    const deskItems: { id: DeskItem; label: string; icon: typeof Heart; rotation: string; position: string; color: string }[] = [
        { id: "gallery", label: "Scrapbook", icon: ImageIcon, rotation: "rotate-[-3deg]", position: "top-8 left-4 sm:left-12", color: "from-amber-100 to-yellow-50" },
        { id: "timeline", label: "Nhật Ký", icon: Calendar, rotation: "rotate-[2deg]", position: "top-8 right-4 sm:right-12", color: "from-rose-100 to-pink-50" },
        { id: "letters", label: "Lưu Bút", icon: Mail, rotation: "rotate-[-1deg]", position: "bottom-8 left-4 sm:left-16", color: "from-purple-100 to-violet-50" },
        { id: "game", label: "Trò Chơi", icon: Sparkles, rotation: "rotate-[3deg]", position: "bottom-8 right-4 sm:right-16", color: "from-emerald-100 to-teal-50" },
    ];

    return (
        <div className={`min-h-screen relative font-sans selection:bg-rose-200 transition-colors duration-500 overflow-hidden ${isDark ? "dark bg-[#1a1816] text-slate-100" : "bg-[#faf6f0] text-gray-800"}`}>
            <style jsx>{`
                @keyframes heartbeat {
                    0% { transform: scale(1); }
                    14% { transform: scale(1.12); }
                    28% { transform: scale(1); }
                    42% { transform: scale(1.12); }
                    70% { transform: scale(1); }
                }
                .animate-heartbeat { animation: heartbeat 1.4s infinite ease-in-out; }
                @keyframes floatItem {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-6px); }
                }
                .animate-float-item { animation: floatItem 4s ease-in-out infinite; }
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
                        radial-gradient(circle at 1px 1px, rgba(120, 80, 40, 0.06) 1px, transparent 0),
                        radial-gradient(circle at 3px 5px, rgba(140, 100, 60, 0.04) 1px, transparent 0),
                        linear-gradient(135deg, rgba(180, 140, 90, 0.03) 0%, transparent 50%),
                        linear-gradient(45deg, rgba(120, 80, 40, 0.02) 0%, transparent 50%);
                    background-size: 12px 12px, 24px 24px, 100% 100%, 100% 100%;
                }
                .kraft-texture-dark {
                    background-image:
                        radial-gradient(circle at 1px 1px, rgba(200, 160, 110, 0.04) 1px, transparent 0),
                        radial-gradient(circle at 3px 5px, rgba(180, 140, 90, 0.03) 1px, transparent 0);
                    background-size: 12px 12px, 24px 24px;
                }
                .washi-tape {
                    position: absolute;
                    height: 22px;
                    background: repeating-linear-gradient(
                        90deg,
                        var(--tape-color, #fcd34d) 0px,
                        var(--tape-color, #fcd34d) 8px,
                        rgba(255,255,255,0.25) 8px,
                        rgba(255,255,255,0.25) 12px,
                        var(--tape-color, #fcd34d) 12px,
                        var(--tape-color, #fcd34d) 20px,
                        rgba(0,0,0,0.08) 20px,
                        rgba(0,0,0,0.08) 24px
                    );
                    box-shadow: 0 1px 3px rgba(0,0,0,0.15);
                    opacity: 0.92;
                }
                .washi-tape-rose { --tape-color: #fbcfe8; }
                .washi-tape-amber { --tape-color: #fde68a; }
                .washi-tape-mint { --tape-color: #bbf7d0; }
                .washi-tape-sky { --tape-color: #bae6fd; }
                .washi-tape-lilac { --tape-color: #ddd6fe; }

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
                .album-corner-tl { top: -2px; left: -2px; border-width: 12px 12px 0 0; border-color: rgba(244, 114, 182, 0.6) transparent transparent transparent; }
                .album-corner-tr { top: -2px; right: -2px; border-width: 12px 0 12px 0; border-color: transparent transparent transparent rgba(244, 114, 182, 0.6); }
                .album-corner-bl { bottom: -2px; left: -2px; border-width: 0 12px 12px 0; border-color: transparent rgba(244, 114, 182, 0.6) transparent transparent; }
                .album-corner-br { bottom: -2px; right: -2px; border-width: 0 0 12px 12px; border-color: transparent transparent rgba(244, 114, 182, 0.6) transparent; }

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
                        rgba(120, 80, 40, 0.4) 0px,
                        rgba(120, 80, 40, 0.4) 3px,
                        transparent 3px,
                        transparent 6px
                    );
                }
                .string-pin {
                    position: absolute;
                    top: 50%;
                    width: 8px;
                    height: 8px;
                    background: radial-gradient(circle at 30% 30%, #fca5a5, #b91c1c);
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    box-shadow: 0 1px 2px rgba(0,0,0,0.3);
                }
                .glitter-dot {
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: radial-gradient(circle, #fef3c7 0%, #fbbf24 50%, transparent 70%);
                    border-radius: 50%;
                }
            `}</style>

            {/* Desk texture background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className={`absolute inset-0 ${isDark ? "bg-gradient-to-br from-[#2a2520] via-[#1f1c18] to-[#252018]" : "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50"}`} />
                <div className={`absolute inset-0 ${isDark ? "kraft-texture-dark opacity-30" : "kraft-texture opacity-60"} `} />
                <div className={`absolute inset-0 opacity-[0.08] bg-[repeating-linear-gradient(90deg,transparent,transparent_40px,rgba(0,0,0,0.1)_40px,rgba(0,0,0,0.1)_41px)]`} />

                {/* Hand-drawn doodle corners */}
                <svg className={`absolute top-4 left-4 w-16 h-16 ${isDark ? "text-rose-400/40" : "text-rose-400/50"} animate-doodle`} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 28 Q 24 8, 40 28 T 56 36" />
                    <path d="M28 24 l -4 -8 m 4 8 l -8 -2" />
                    <circle cx="48" cy="20" r="2" fill="currentColor" />
                </svg>
                <svg className={`absolute top-4 right-4 w-14 h-14 ${isDark ? "text-amber-400/40" : "text-amber-500/50"} animate-doodle`} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animationDelay: "0.4s" }}>
                    <path d="M32 8 l 3 12 l 12 3 l -12 3 l -3 12 l -3 -12 l -12 -3 l 12 -3 z" />
                </svg>
                <svg className={`absolute bottom-4 left-4 w-16 h-16 ${isDark ? "text-purple-400/40" : "text-purple-500/50"} animate-doodle`} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animationDelay: "0.6s" }}>
                    <path d="M10 50 Q 24 30, 50 40 Q 30 44, 14 56" />
                    <path d="M44 36 l 6 -2 m -6 2 l 2 -6" />
                </svg>
                <svg className={`absolute bottom-4 right-4 w-14 h-14 ${isDark ? "text-emerald-400/40" : "text-emerald-500/50"} animate-doodle`} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animationDelay: "0.8s" }}>
                    <path d="M32 52 C 12 52, 12 28, 32 28 C 52 28, 52 52, 32 52 Z" />
                    <path d="M32 28 V 14 M 26 20 H 38" />
                </svg>

                {/* Scattered glitter dots */}
                <div className="absolute top-1/4 left-1/3 glitter-dot animate-glitter" style={{ animationDelay: "0s" }} />
                <div className="absolute top-1/3 right-1/4 w-3 h-3 glitter-dot animate-glitter" style={{ animationDelay: "0.8s", width: "3px", height: "3px" }} />
                <div className="absolute bottom-1/3 left-1/4 glitter-dot animate-glitter" style={{ animationDelay: "1.2s" }} />
                <div className="absolute bottom-1/4 right-1/3 glitter-dot animate-glitter" style={{ animationDelay: "0.4s" }} />
                <div className="absolute top-1/2 left-1/2 w-2 h-2 glitter-dot animate-glitter" style={{ animationDelay: "1.6s", width: "2px", height: "2px" }} />
            </div>

            {/* Buttons */}
            {!isPopupOpen && !activeItem && (
                <>
                    <ThemeToggleButton
                        isDark={isDark}
                        onToggle={handleThemeToggle}
                        className={`fixed top-4 right-16 z-30 p-3 rounded-full shadow-lg transition-all hover:scale-110 ${isDark ? "bg-[#282420]/95 text-yellow-400 border border-rose-950/30" : "bg-white/95 text-rose-500 border border-rose-100/30"}`}
                        iconClassName="w-5 h-5"
                    />
                    <Link
                        href={`/${slug}/edit`}
                        className={`fixed top-4 right-4 z-30 p-3 rounded-full shadow-lg transition-all border hover:scale-105 ${isDark ? "bg-[#282420]/95 border-rose-950/30 text-rose-400" : "bg-white/95 border-rose-100/30 text-rose-500"}`}
                    >
                        <Settings className="w-5 h-5" />
                    </Link>
                </>
            )}

            {/* DESK VIEW - when no item is open */}
            {!activeItem && (
                <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8">
                    {/* Center profile card - like a photo frame on desk */}
                    <div className={`relative z-10 ${isDark ? "bg-[#282420] border-rose-900/30" : "bg-white border-amber-200"} border-4 rounded-xl p-6 sm:p-8 shadow-2xl max-w-sm w-full text-center torn-edge-bottom`}>
                        {/* Triple washi tape header */}
                        <div className="absolute -top-3 left-0 right-0 h-6 pointer-events-none">
                            <div className="washi-tape washi-tape-rose animate-tape-peel" style={{ left: "10%", width: "35%", transform: "rotate(-3deg)", "--tape-rot": "-3deg" } as React.CSSProperties} />
                            <div className="washi-tape washi-tape-mint animate-tape-peel" style={{ left: "30%", width: "40%", transform: "rotate(2deg)", "--tape-rot": "2deg", animationDelay: "0.7s" } as React.CSSProperties} />
                            <div className="washi-tape washi-tape-amber animate-tape-peel" style={{ left: "55%", width: "32%", transform: "rotate(-1deg)", "--tape-rot": "-1deg", animationDelay: "1.4s" } as React.CSSProperties} />
                        </div>

                        <div className="flex items-center justify-center gap-4 mb-4">
                            <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden p-0.5 border-2 ${isDark ? "bg-zinc-950 border-rose-900/20" : "bg-rose-50 border-rose-100/40"} shadow-md rotate-[-3deg]`}>
                                {boyAvatar ? (
                                    <Image src={boyAvatar} alt={boyName} width={80} height={80} className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <div className="w-full h-full bg-rose-50 flex items-center justify-center text-xl font-bold text-rose-300">👦</div>
                                )}
                                <span className="album-corner album-corner-tl" />
                                <span className="album-corner album-corner-br" />
                            </div>
                            <Heart className="w-6 h-6 text-rose-500 fill-rose-500 animate-heartbeat" />
                            <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden p-0.5 border-2 ${isDark ? "bg-zinc-950 border-rose-900/20" : "bg-rose-50 border-rose-100/40"} shadow-md rotate-[3deg]`}>
                                {girlAvatar ? (
                                    <Image src={girlAvatar} alt={girlName} width={80} height={80} className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <div className="w-full h-full bg-rose-50 flex items-center justify-center text-xl font-bold text-rose-300">👧</div>
                                )}
                                <span className="album-corner album-corner-tr" />
                                <span className="album-corner album-corner-bl" />
                            </div>
                        </div>

                        <h1 className={`text-2xl font-serif font-bold mb-1 ${isDark ? "text-slate-100" : "text-slate-800"}`}>{title}</h1>
                        {profileData?.short_note && (
                            <p className={`italic text-xs font-serif mb-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}>&ldquo;{profileData.short_note}&rdquo;</p>
                        )}
                        {daysTogether && (
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${isDark ? "bg-rose-950/30 text-rose-300" : "bg-rose-50 text-rose-500"}`}>
                                <Heart className="w-3.5 h-3.5 fill-current" />
                                <span className="font-bold">{daysTogether}</span>
                                <span className="text-xs">ngày</span>
                            </div>
                        )}

                        {/* Doodle accent under card */}
                        <svg className={`mx-auto mt-4 w-20 h-4 ${isDark ? "text-amber-400/40" : "text-amber-500/50"}`} viewBox="0 0 80 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                            <path d="M4 8 Q 20 2, 40 8 T 76 8" />
                            <circle cx="76" cy="8" r="1.5" fill="currentColor" />
                        </svg>
                    </div>

                    {/* Desk items scattered around */}
                    <div className="absolute inset-0 pointer-events-none">
                        {deskItems.map((item, idx) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveItem(item.id)}
                                className={`absolute pointer-events-auto ${item.position} ${item.rotation} animate-float-item group`}
                                style={{ animationDelay: `${idx * 0.5}s` }}
                            >
                                <div className={`bg-gradient-to-br ${item.color} ${isDark ? "!from-[#332e28] !to-[#282420] border-rose-900/30" : "border-white/60"} border-2 rounded-xl p-4 sm:p-5 shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 cursor-pointer`}>
                                    <item.icon className={`w-8 h-8 sm:w-10 sm:h-10 ${isDark ? "text-rose-400" : "text-gray-600"} group-hover:scale-110 transition-transform`} />
                                    <span className={`block text-xs font-semibold mt-2 ${isDark ? "text-slate-300" : "text-gray-600"}`}>{item.label}</span>
                                </div>
                            </button>
                        ))}

                        {/* Decorative coffee cup */}
                        <div className={`absolute top-1/2 left-2 sm:left-8 ${isDark ? "text-amber-900/30" : "text-amber-300/40"}`}>
                            <Coffee className="w-10 h-10" />
                        </div>

                        {/* Decorative sticky notes */}
                        <div className={`absolute top-1/3 right-2 sm:right-8 w-16 h-16 ${isDark ? "bg-yellow-900/20" : "bg-yellow-100/60"} rotate-[5deg] rounded-sm shadow-md flex items-center justify-center`}>
                            <Heart className={`w-6 h-6 ${isDark ? "text-rose-800/30" : "text-rose-300"} fill-current`} />
                        </div>
                    </div>

                    {/* Tap hint */}
                    <div className={`mt-8 text-center ${isDark ? "text-slate-500" : "text-gray-400"}`}>
                        <p className="text-xs">Nhấn vào các vật trên bàn để khám phá</p>
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
                            <div className={`washi-tape ${activeItem === "gallery" ? "washi-tape-amber" : activeItem === "timeline" ? "washi-tape-rose" : activeItem === "letters" ? "washi-tape-lilac" : "washi-tape-mint"}`} style={{ left: 0, width: "100%", height: "12px", transform: "rotate(-0.5deg)" }} />
                        </div>

                        {/* Modal header */}
                        <div className={`flex items-center justify-between p-4 border-b ${isDark ? "border-rose-900/30" : "border-amber-100"} relative`}>
                            <div className="flex items-center gap-2">
                                {activeItem === "gallery" && <ImageIcon className="w-5 h-5 text-amber-500" />}
                                {activeItem === "timeline" && <Calendar className="w-5 h-5 text-rose-400" />}
                                {activeItem === "letters" && <Mail className="w-5 h-5 text-purple-400" />}
                                {activeItem === "game" && <Sparkles className="w-5 h-5 text-emerald-400" />}
                                <h2 className="text-lg font-serif font-bold">
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
                                                        className={`${isDark ? "bg-[#332e28] border-rose-900/20" : "bg-white border-slate-200"} p-2 pb-4 border rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer ${rotations[index % 4]} relative`}
                                                    >
                                                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-12 h-4 bg-yellow-100/60 border border-yellow-200/40 shadow-sm" />
                                                        <div className="aspect-square relative overflow-hidden rounded-md">
                                                            <Image src={item.image_url} alt={item.caption || "Memory"} fill className="object-cover" />
                                                            <span className="album-corner album-corner-tl" style={{ borderColor: `transparent transparent transparent ${isDark ? "rgba(244, 114, 182, 0.5)" : "rgba(244, 114, 182, 0.6)"}` }} />
                                                            <span className="album-corner album-corner-br" style={{ borderColor: `transparent transparent ${isDark ? "rgba(244, 114, 182, 0.5)" : "rgba(244, 114, 182, 0.6)"} transparent` }} />
                                                        </div>
                                                        {item.caption && (
                                                            <p className={`text-center font-serif italic text-xs mt-2 truncate ${isDark ? "text-slate-300" : "text-slate-600"}`}>{item.caption}</p>
                                                        )}
                                                        {/* Index doodle number */}
                                                        <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${isDark ? "bg-rose-950/60 text-rose-300" : "bg-rose-100 text-rose-500"} border ${isDark ? "border-rose-800/40" : "border-rose-200"}`}>
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
                                                    <div className="absolute -left-[26px] top-1 w-5 h-5 rounded-full bg-rose-500 border-4 border-white flex items-center justify-center shadow-md" style={isDark ? { borderColor: "#282420" } : {}}>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                                    </div>
                                                    <div className={`${isDark ? "bg-[#332e28]/50 border-rose-900/20" : "bg-rose-50/50 border-rose-100"} border rounded-xl p-4 shadow-sm relative`}>
                                                        <div className="flex items-start justify-between gap-3 mb-2">
                                                            <div className="flex-1">
                                                                <div className={`postmark-stamp inline-block ${isDark ? "text-rose-400" : "text-rose-500"} animate-stamp-ink`}>
                                                                    {new Date(event.date).toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" })}
                                                                </div>
                                                            </div>
                                                            <Calendar className={`w-4 h-4 mt-1 ${isDark ? "text-rose-400/60" : "text-rose-400"}`} />
                                                        </div>
                                                        <h3 className="text-base font-serif font-bold mb-2">{event.title}</h3>
                                                        {event.description && (
                                                            <p className={`text-sm leading-relaxed mb-3 whitespace-pre-wrap font-serif italic ${isDark ? "text-slate-300" : "text-slate-600"}`}>&ldquo;{event.description}&rdquo;</p>
                                                        )}
                                                        {event.image_url && (
                                                            <div className="relative aspect-video rounded-lg overflow-hidden shadow-md">
                                                                <Image src={event.image_url} alt={event.title} fill className="object-cover" />
                                                                <span className="album-corner album-corner-tr" style={{ borderColor: `transparent transparent transparent ${isDark ? "rgba(244, 114, 182, 0.5)" : "rgba(244, 114, 182, 0.6)"}` }} />
                                                                <span className="album-corner album-corner-bl" style={{ borderColor: `transparent ${isDark ? "rgba(244, 114, 182, 0.5)" : "rgba(244, 114, 182, 0.6)"} transparent transparent` }} />
                                                            </div>
                                                        )}
                                                        {/* Doodle underline */}
                                                        <svg className={`w-full h-2 mt-2 ${isDark ? "text-rose-400/30" : "text-rose-300/50"}`} viewBox="0 0 200 4" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" preserveAspectRatio="none">
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
                        <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-4 text-white flex-shrink-0">
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
                            <div className={`px-4 py-2 text-center text-sm font-serif italic ${isDark ? "text-slate-300" : "text-gray-600"}`}>{data.galleries[lightboxIndex].caption}</div>
                        )}
                        <div className={`flex justify-center items-center gap-4 p-4 border-t ${isDark ? "border-rose-900/30" : "border-gray-100"}`}>
                            <button onClick={prevImage} className={`p-2.5 rounded-full transition-all hover:scale-110 ${isDark ? "bg-rose-950/30 text-rose-400" : "bg-amber-50 text-amber-600 hover:bg-amber-100"}`}><ChevronLeft className="w-5 h-5" /></button>
                            <button onClick={nextImage} className={`p-2.5 rounded-full transition-all hover:scale-110 ${isDark ? "bg-rose-950/30 text-rose-400" : "bg-amber-50 text-amber-600 hover:bg-amber-100"}`}><ChevronRight className="w-5 h-5" /></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
