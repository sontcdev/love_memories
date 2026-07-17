"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Link as PrismaLink, LinkConfig, Gallery, Timeline, Letter, LetterReply } from "@prisma/client";
import { Heart, Calendar, Image as ImageIcon, Mail, ChevronLeft, ChevronRight, Settings, Sparkles, X, Sun, Moon, Coffee } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import { Love2LetterBox } from "./Love2LetterBox";
import { Love2GameSection } from "./Love2GameSection";

type LetterWithReplies = Letter & { replies: LetterReply[] };

type LinkWithRelations = PrismaLink & {
    config: LinkConfig | null;
    galleries: Gallery[];
    timelines: Timeline[];
    letters: LetterWithReplies[];
};

interface Love2TemplateProps {
    data: LinkWithRelations;
    slug: string;
}

type DeskItem = "home" | "gallery" | "timeline" | "game" | "letters";

export function Love2Template({ data, slug }: Love2TemplateProps) {
    const [activeItem, setActiveItem] = useState<DeskItem | null>(null);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const profileData = data.profile_data as Record<string, string> | null;
    const [overrideDark, setOverrideDark] = useState<boolean | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem(`theme_mode_${slug}`);
        if (saved) {
            const isSavedDark = saved === "dark";
            setOverrideDark(isSavedDark);
            const root = document.documentElement;
            if (isSavedDark) {
                root.style.setProperty("--theme-bg", "#181614");
            } else {
                root.style.setProperty("--theme-bg", data.config?.background_color || "#faf6f0");
            }
        }
    }, [slug, data.config?.background_color]);

    const isDark = overrideDark !== null ? overrideDark : false;

    const handleThemeToggle = () => {
        const newDark = !isDark;
        setOverrideDark(newDark);
        localStorage.setItem(`theme_mode_${slug}`, newDark ? "dark" : "light");
        window.dispatchEvent(new CustomEvent("theme-change", { detail: { isDark: newDark } }));
        const root = document.documentElement;
        if (newDark) {
            root.style.setProperty("--theme-bg", "#181614");
        } else {
            root.style.setProperty("--theme-bg", data.config?.background_color || "#faf6f0");
        }
    };

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
            `}</style>

            {/* Desk texture background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className={`absolute inset-0 ${isDark ? "bg-gradient-to-br from-[#2a2520] via-[#1f1c18] to-[#252018]" : "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50"}`} />
                <div className={`absolute inset-0 opacity-[0.08] bg-[repeating-linear-gradient(90deg,transparent,transparent_40px,rgba(0,0,0,0.1)_40px,rgba(0,0,0,0.1)_41px)]`} />
            </div>

            {/* Buttons */}
            {!isPopupOpen && !activeItem && (
                <>
                    <button
                        onClick={handleThemeToggle}
                        className={`fixed top-4 right-16 z-30 p-3 rounded-full shadow-lg transition-all hover:scale-110 ${isDark ? "bg-[#282420]/95 text-yellow-400 border border-rose-950/30" : "bg-white/95 text-rose-500 border border-rose-100/30"}`}
                    >
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
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
                    <div className={`relative z-10 ${isDark ? "bg-[#282420] border-rose-900/30" : "bg-white border-amber-200"} border-4 rounded-xl p-6 sm:p-8 shadow-2xl max-w-sm w-full text-center`}>
                        {/* Washi tape */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-yellow-100/70 border border-yellow-200/50 rotate-[-1deg] z-10 shadow-sm flex items-center justify-center text-[10px] text-gray-500/70 font-mono">
                            OUR DESK
                        </div>

                        <div className="flex items-center justify-center gap-4 mb-4">
                            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden p-0.5 border-2 ${isDark ? "bg-zinc-950 border-rose-900/20" : "bg-rose-50 border-rose-100/40"} shadow-md rotate-[-3deg]`}>
                                {boyAvatar ? (
                                    <Image src={boyAvatar} alt={boyName} width={80} height={80} className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <div className="w-full h-full bg-rose-50 flex items-center justify-center text-xl font-bold text-rose-300">👦</div>
                                )}
                            </div>
                            <Heart className="w-6 h-6 text-rose-500 fill-rose-500 animate-heartbeat" />
                            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden p-0.5 border-2 ${isDark ? "bg-zinc-950 border-rose-900/20" : "bg-rose-50 border-rose-100/40"} shadow-md rotate-[3deg]`}>
                                {girlAvatar ? (
                                    <Image src={girlAvatar} alt={girlName} width={80} height={80} className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <div className="w-full h-full bg-rose-50 flex items-center justify-center text-xl font-bold text-rose-300">👧</div>
                                )}
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
                        {/* Modal header */}
                        <div className={`flex items-center justify-between p-4 border-b ${isDark ? "border-rose-900/30" : "border-amber-100"}`}>
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
                                                        </div>
                                                        {item.caption && (
                                                            <p className={`text-center font-serif italic text-xs mt-2 truncate ${isDark ? "text-slate-300" : "text-slate-600"}`}>{item.caption}</p>
                                                        )}
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
                                        <div className="relative pl-6 border-l-2 border-dashed border-rose-300 space-y-6">
                                            {data.timelines.map((event) => (
                                                <div key={event.id} className="relative">
                                                    <div className="absolute -left-[29px] top-1 w-5 h-5 rounded-full bg-rose-500 border-4 border-white flex items-center justify-center shadow-md" style={isDark ? { borderColor: "#282420" } : {}}>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                                    </div>
                                                    <div className={`${isDark ? "bg-[#332e28]/50 border-rose-900/20" : "bg-rose-50/50 border-rose-100"} border rounded-xl p-4 shadow-sm`}>
                                                        <div className="text-xs font-semibold text-rose-500 mb-1 flex items-center gap-1.5">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            {new Date(event.date).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" })}
                                                        </div>
                                                        <h3 className="text-base font-serif font-bold mb-2">{event.title}</h3>
                                                        {event.description && (
                                                            <p className={`text-sm leading-relaxed mb-3 whitespace-pre-wrap font-serif italic ${isDark ? "text-slate-300" : "text-slate-600"}`}>&ldquo;{event.description}&rdquo;</p>
                                                        )}
                                                        {event.image_url && (
                                                            <div className="relative aspect-video rounded-lg overflow-hidden shadow-md">
                                                                <Image src={event.image_url} alt={event.title} fill className="object-cover" />
                                                            </div>
                                                        )}
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
                                <Love2GameSection photos={data.galleries.map(g => ({ id: g.id, url: g.image_url, caption: g.caption }))} isDark={isDark} />
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
