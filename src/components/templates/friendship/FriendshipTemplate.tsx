"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Link as PrismaLink, LinkConfig, Gallery, Timeline, Letter, LetterReply } from "@prisma/client";
import { Image as ImageIcon, Mail, ChevronLeft, ChevronRight, Settings, X, Smile, Users, Star, Zap, Send, Phone, Video, Heart, MessageCircle } from "lucide-react";
import { FriendshipLetterBox } from "./FriendshipLetterBox";
import { FriendshipGameSection } from "./FriendshipGameSection";

type LetterWithReplies = Letter & { replies: LetterReply[] };

type LinkWithRelations = PrismaLink & {
    config: LinkConfig | null;
    galleries: Gallery[];
    timelines: Timeline[];
    letters: LetterWithReplies[];
};

interface FriendshipTemplateProps {
    data: LinkWithRelations;
    slug: string;
}

type ChatTab = "chat" | "gallery" | "guestbook" | "quiz";

/* ---------- Decorative SVGs ---------- */

// Friendship bracelet — woven colorful chevron pattern
function FriendshipBracelet({ className }: { className?: string }) {
    const colors = ["#a855f7", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];
    const rows = 8;
    return (
        <svg viewBox="0 0 200 40" className={className} aria-hidden>
            {Array.from({ length: rows }, (_, r) => {
                const offset = r % 2 === 0 ? 0 : 5;
                return Array.from({ length: 20 }, (_, c) => {
                    const x = c * 10 + offset;
                    const colorIdx = (c + r) % colors.length;
                    const isChevron = Math.abs(c - 10) <= 4 - Math.abs(r - 4);
                    return (
                        <path
                            key={`${r}-${c}`}
                            d={`M${x} ${r * 5} L ${x + 5} ${r * 5 + 5} L ${x + 10} ${r * 5} L ${x + 5} ${r * 5 - 5} Z`}
                            fill={colors[colorIdx]}
                            opacity={isChevron ? 1 : 0.7}
                        />
                    );
                });
            })}
            {/* Tassels on ends */}
            <line x1="2" y1="20" x2="2" y2="34" stroke="#a855f7" strokeWidth="1.5" />
            <line x1="4" y1="20" x2="4" y2="36" stroke="#ec4899" strokeWidth="1.5" />
            <line x1="6" y1="20" x2="6" y2="34" stroke="#f59e0b" strokeWidth="1.5" />
            <line x1="194" y1="20" x2="194" y2="34" stroke="#10b981" strokeWidth="1.5" />
            <line x1="196" y1="20" x2="196" y2="36" stroke="#3b82f6" strokeWidth="1.5" />
            <line x1="198" y1="20" x2="198" y2="34" stroke="#a855f7" strokeWidth="1.5" />
        </svg>
    );
}

// Scattered playful sticker — star, heart, smiley
function Sticker({ type, className }: { type: "star" | "heart" | "smile"; className?: string }) {
    if (type === "star") {
        return (
            <svg viewBox="0 0 24 24" className={className} aria-hidden>
                <path d="M12 2 L 14.5 8.5 L 21 9 L 16 13.5 L 17.5 20 L 12 16.5 L 6.5 20 L 8 13.5 L 3 9 L 9.5 8.5 Z"
                    fill="#fbbf24" stroke="#d97706" strokeWidth="0.5" />
                <circle cx="10" cy="11" r="0.8" fill="#7c2d12" />
                <circle cx="14" cy="11" r="0.8" fill="#7c2d12" />
                <path d="M9 14 Q 12 16 15 14" stroke="#7c2d12" strokeWidth="0.6" fill="none" strokeLinecap="round" />
            </svg>
        );
    }
    if (type === "heart") {
        return (
            <svg viewBox="0 0 24 24" className={className} aria-hidden>
                <path d="M12 21 C 4 14 2 10 5 7 C 7 5 10 6 12 9 C 14 6 17 5 19 7 C 22 10 20 14 12 21 Z"
                    fill="#f472b6" stroke="#be185d" strokeWidth="0.5" />
                <circle cx="9.5" cy="11" r="0.6" fill="#831843" />
                <circle cx="14.5" cy="11" r="0.6" fill="#831843" />
            </svg>
        );
    }
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
            <circle cx="12" cy="12" r="10" fill="#fde047" stroke="#ca8a04" strokeWidth="0.75" />
            <circle cx="9" cy="10" r="1" fill="#713f12" />
            <circle cx="15" cy="10" r="1" fill="#713f12" />
            <path d="M8 14 Q 12 18 16 14" stroke="#713f12" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        </svg>
    );
}

// Hand-drawn doodle arrow (curved)
function DoodleArrow({ className, flip = false }: { className?: string; flip?: boolean }) {
    return (
        <svg viewBox="0 0 60 40" className={className} aria-hidden
            style={flip ? { transform: "scaleX(-1)" } : undefined}>
            <path d="M5 8 Q 20 5 30 15 Q 38 22 45 30"
                stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M45 30 L 40 25 M 45 30 L 48 23"
                stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            {/* wobble dots */}
            <circle cx="12" cy="7" r="0.8" fill="currentColor" />
            <circle cx="25" cy="10" r="0.6" fill="currentColor" />
        </svg>
    );
}

// Confetti burst
function ConfettiBurst({ className }: { className?: string }) {
    const pieces = Array.from({ length: 16 }, (_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const dist = 18 + (i % 3) * 6;
        return {
            x: 50 + Math.cos(angle) * dist,
            y: 50 + Math.sin(angle) * dist,
            color: ["#a855f7", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#fbbf24"][i % 6],
            rot: i * 30,
            key: i,
        };
    });
    return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden>
            {pieces.map(p => (
                <rect key={p.key} x={p.x} y={p.y} width="3" height="1.5"
                    fill={p.color} transform={`rotate(${p.rot} ${p.x} ${p.y})`} opacity="0.85" />
            ))}
        </svg>
    );
}

// Typing indicator (three animated dots)
function TypingDots() {
    return (
        <div className="flex items-center gap-1 px-3 py-2">
            {[0, 1, 2].map(i => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-typing-bounce"
                    style={{ animationDelay: `${i * 0.15}s` } as React.CSSProperties} />
            ))}
        </div>
    );
}

// Reaction emoji badge
function ReactionBadge({ emoji, count, className }: { emoji: string; count: number; className?: string }) {
    return (
        <div className={`inline-flex items-center gap-1 bg-white rounded-full px-1.5 py-0.5 shadow-md border border-gray-100 text-xs ${className}`}>
            <span className="text-sm">{emoji}</span>
            <span className="text-gray-600 font-medium">{count}</span>
        </div>
    );
}

export function FriendshipTemplate({ data, slug }: FriendshipTemplateProps) {
    const [activeTab, setActiveTab] = useState<ChatTab>("chat");
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const profileData = data.profile_data as Record<string, string> | null;

    const groupName = profileData?.group_name || "Nhóm bạn";
    const motto = profileData?.motto;
    const memberCount = profileData?.member_count;
    const since = profileData?.since;

    const getYearsTogether = () => {
        if (!since) return null;
        const startYear = new Date(since).getFullYear();
        const currentYear = new Date().getFullYear();
        return currentYear - startYear;
    };

    const years = getYearsTogether();

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [activeTab]);

    const tabs = [
        { id: "chat" as const, label: "Trò chuyện", icon: MessageCircle },
        { id: "gallery" as const, label: "Ảnh", icon: ImageIcon },
        { id: "guestbook" as const, label: "Lưu bút", icon: Mail },
        { id: "quiz" as const, label: "Thử thách", icon: Zap },
    ];

    const avatarColors = [
        "bg-violet-400", "bg-pink-400", "bg-sky-400", "bg-emerald-400",
        "bg-amber-400", "bg-rose-400", "bg-indigo-400", "bg-teal-400",
    ];

    const getAvatarColor = (index: number) => avatarColors[index % avatarColors.length];

    // Scattered stickers for header bomb
    const stickerPositions = [
        { type: "star" as const, className: "w-5 h-5 -top-1 -left-2 rotate-12", anim: "animate-sticker-wiggle" },
        { type: "heart" as const, className: "w-4 h-4 -top-2 right-8 -rotate-12", anim: "animate-sticker-wiggle" },
        { type: "smile" as const, className: "w-5 h-5 -bottom-2 -left-3 rotate-6", anim: "animate-sticker-bounce" },
        { type: "star" as const, className: "w-3 h-3 -bottom-1 right-6 rotate-45", anim: "animate-sticker-wiggle" },
    ];

    return (
        <div className="h-screen flex flex-col bg-violet-50 relative overflow-hidden">
            {/* Floating background stickers */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
                <Sticker type="star" className="absolute top-[15%] left-[8%] w-8 h-8 rotate-12 animate-sticker-wiggle" />
                <Sticker type="heart" className="absolute top-[60%] left-[5%] w-6 h-6 -rotate-12 animate-sticker-bounce" />
                <Sticker type="smile" className="absolute top-[25%] right-[10%] w-10 h-10 rotate-6 animate-sticker-wiggle" />
                <Sticker type="star" className="absolute bottom-[20%] right-[8%] w-7 h-7 -rotate-6 animate-sticker-bounce" />
                <Sticker type="heart" className="absolute top-[75%] right-[15%] w-5 h-5 rotate-45 animate-sticker-wiggle" />
            </div>

            {/* Chat Header */}
            <div className="bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow-lg z-40 relative">
                {/* Friendship bracelet strip under header */}
                <div className="absolute -bottom-1 left-0 right-0 h-3 opacity-90">
                    <FriendshipBracelet className="w-full h-full" />
                </div>

                <div className="max-w-2xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* Group avatar with sticker bomb + online pulse */}
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center relative">
                                    <Users className="w-5 h-5" />
                                    {/* Online status dot */}
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-violet-600 animate-online-pulse" />
                                </div>
                                {/* Sticker bomb */}
                                {stickerPositions.map((s, i) => (
                                    <div key={i} className={`absolute ${s.className} ${s.anim}`}
                                        style={{ animationDelay: `${i * 0.3}s` } as React.CSSProperties}>
                                        <Sticker type={s.type} className="w-full h-full" />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <h1 className="font-semibold text-lg flex items-center gap-2">
                                    {groupName}
                                    <span className="inline-flex items-center gap-0.5 bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">
                                        <Star className="w-2.5 h-2.5 fill-yellow-300 text-yellow-300" />
                                        BFF
                                    </span>
                                </h1>
                                <div className="flex items-center gap-2 text-xs text-white/80">
                                    {memberCount && <span>{memberCount} thành viên</span>}
                                    {years !== null && <span>· {years} năm gắn bó</span>}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
                                <Phone className="w-5 h-5" />
                            </button>
                            <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
                                <Video className="w-5 h-5" />
                            </button>
                            <Link
                                href={`/${slug}/edit`}
                                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                            >
                                <Settings className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab bar */}
            <div className="bg-white border-b border-violet-100 shadow-sm z-30">
                <div className="max-w-2xl mx-auto flex">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium border-b-2 transition-colors relative ${
                                activeTab === tab.id
                                    ? "border-violet-500 text-violet-600"
                                    : "border-transparent text-gray-500 hover:text-violet-400"
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            {activeTab === tab.id && (
                                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-500" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Content Area */}
            <div className="flex-1 overflow-y-auto relative">
                <div className="max-w-2xl mx-auto">
                    {activeTab === "chat" && (
                        <div className="p-4 space-y-4">
                            {/* Group intro message */}
                            <div className="flex justify-center">
                                <div className="bg-violet-100 text-violet-700 text-xs px-4 py-2 rounded-full">
                                    {motto ? `"${motto}"` : `${groupName} đã bắt đầu trò chuyện`}
                                </div>
                            </div>

                            {/* Timeline events as chat messages */}
                            {data.timelines.length > 0 && (
                                <>
                                    <div className="flex justify-center items-center gap-2">
                                        <DoodleArrow className="w-8 h-5 text-violet-300" flip />
                                        <div className="bg-violet-100 text-violet-700 text-xs px-4 py-2 rounded-full font-medium">
                                            Kỷ niệm đáng nhớ
                                        </div>
                                        <DoodleArrow className="w-8 h-5 text-violet-300" />
                                    </div>
                                    {data.timelines.map((item, index) => {
                                        const isLeft = index % 2 === 0;
                                        return (
                                            <div key={item.id} className={`flex gap-2 ${isLeft ? "" : "flex-row-reverse"}`}>
                                                <div className={`w-8 h-8 rounded-full ${getAvatarColor(index)} flex items-center justify-center flex-shrink-0 relative`}>
                                                    <Smile className="w-4 h-4 text-white" />
                                                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-white" />
                                                </div>
                                                <div className={`max-w-[75%] ${isLeft ? "" : "items-end"} relative`}>
                                                    <div className={`rounded-2xl overflow-hidden shadow-sm ${
                                                        isLeft
                                                            ? "bg-white rounded-tl-sm"
                                                            : "bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-tr-sm"
                                                    }`}>
                                                        {item.image_url && (
                                                            <Image
                                                                src={item.image_url}
                                                                alt={item.title}
                                                                width={300}
                                                                height={200}
                                                                className="w-full object-cover max-h-48"
                                                            />
                                                        )}
                                                        <div className="p-3">
                                                            <div className={`text-xs mb-1 ${isLeft ? "text-violet-500" : "text-white/80"}`}>
                                                                {new Date(item.date).toLocaleDateString("vi-VN", {
                                                                    day: "2-digit",
                                                                    month: "short",
                                                                    year: "numeric",
                                                                })}
                                                            </div>
                                                            <h3 className={`font-semibold ${isLeft ? "text-gray-800" : "text-white"}`}>
                                                                {item.title}
                                                            </h3>
                                                            {item.description && (
                                                                <p className={`text-sm mt-1 ${isLeft ? "text-gray-600" : "text-white/90"}`}>
                                                                    {item.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {/* Reaction badges on messages */}
                                                    <div className={`flex gap-1 mt-1 ${isLeft ? "" : "justify-end"}`}>
                                                        <ReactionBadge emoji="❤️" count={index % 3 + 2} />
                                                        <ReactionBadge emoji="😂" count={index % 2 + 1} />
                                                    </div>
                                                    <div className={`text-xs text-gray-400 mt-1 ${isLeft ? "" : "text-right"}`}>
                                                        {new Date(item.date).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            )}

                            {/* Gallery preview in chat */}
                            {data.galleries.length > 0 && (
                                <>
                                    <div className="flex justify-center">
                                        <div className="bg-violet-100 text-violet-700 text-xs px-4 py-2 rounded-full">
                                            {data.galleries.length} ảnh đã được chia sẻ
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-8 h-8 rounded-full bg-violet-400 flex items-center justify-center flex-shrink-0 relative">
                                            <ImageIcon className="w-4 h-4 text-white" />
                                            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-white" />
                                        </div>
                                        <div className="max-w-[75%]">
                                            <div className="bg-white rounded-2xl rounded-tl-sm p-2 shadow-sm">
                                                <div className="grid grid-cols-3 gap-1">
                                                    {data.galleries.slice(0, 6).map((photo, index) => (
                                                        <div
                                                            key={photo.id}
                                                            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer"
                                                            onClick={() => setLightboxIndex(index)}
                                                        >
                                                            <Image
                                                                src={photo.image_url}
                                                                alt={photo.caption || `Photo ${index + 1}`}
                                                                fill
                                                                className="object-cover hover:scale-105 transition-transform"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                                {data.galleries.length > 6 && (
                                                    <p className="text-xs text-violet-500 text-center mt-2">
                                                        +{data.galleries.length - 6} ảnh nữa
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Reaction message with confetti */}
                            <div className="flex justify-center relative">
                                <div className="bg-white rounded-full px-4 py-2 shadow-sm flex items-center gap-2 relative">
                                    <ConfettiBurst className="absolute inset-0 w-full h-full animate-confetti-burst pointer-events-none" />
                                    <Heart className="w-4 h-4 text-pink-400 fill-pink-400 animate-heartbeat" />
                                    <span className="text-sm text-gray-600 font-medium relative z-10">Mãi bên nhau nhé!</span>
                                    <Star className="w-4 h-4 text-amber-400 fill-amber-400 animate-heartbeat" />
                                </div>
                            </div>

                            {/* Typing indicator */}
                            <div className="flex gap-2">
                                <div className={`w-8 h-8 rounded-full ${getAvatarColor(data.timelines.length)} flex items-center justify-center flex-shrink-0 relative`}>
                                    <Smile className="w-4 h-4 text-white" />
                                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-white" />
                                </div>
                                <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm">
                                    <TypingDots />
                                </div>
                                <span className="text-xs text-gray-400 self-center">đang nhập...</span>
                            </div>

                            <div ref={chatEndRef} />
                        </div>
                    )}

                    {activeTab === "gallery" && (
                        <div className="p-4">
                            <div className="text-center mb-4">
                                <h2 className="text-xl font-bold text-violet-900">Khoảnh khắc vui vẻ</h2>
                                <p className="text-sm text-gray-500">{data.galleries.length} ảnh</p>
                                <p className="text-xs text-violet-400 mt-1">photo booth strip</p>
                            </div>
                            {data.galleries.length > 0 ? (
                                <div className="space-y-4">
                                    {/* Photo booth strip — groups of 3 with white border + timestamp */}
                                    {Array.from({ length: Math.ceil(data.galleries.length / 3) }, (_, stripIdx) => {
                                        const strip = data.galleries.slice(stripIdx * 3, stripIdx * 3 + 3);
                                        return (
                                            <div
                                                key={stripIdx}
                                                className="bg-white p-3 shadow-lg"
                                                style={{ transform: `rotate(${stripIdx % 2 === 0 ? -1 : 1}deg)` } as React.CSSProperties}
                                            >
                                                <div className="grid grid-cols-3 gap-1">
                                                    {strip.map((photo, i) => {
                                                        const globalIdx = stripIdx * 3 + i;
                                                        return (
                                                            <div
                                                                key={photo.id}
                                                                className="relative aspect-square overflow-hidden cursor-pointer group"
                                                                onClick={() => setLightboxIndex(globalIdx)}
                                                            >
                                                                <Image
                                                                    src={photo.image_url}
                                                                    alt={photo.caption || `Photo ${globalIdx + 1}`}
                                                                    fill
                                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <p className="text-center text-xs text-gray-500 mt-2 font-mono">
                                                    strip {stripIdx + 1} · {strip.length} photos
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-center text-gray-400 italic py-8">Chưa có ảnh nào</p>
                            )}
                        </div>
                    )}

                    {activeTab === "guestbook" && (
                        <div className="p-4">
                            <div className="text-center mb-4 relative inline-block w-full">
                                <h2 className="text-xl font-bold text-violet-900 inline-block relative">
                                    Lưu bút
                                    <DoodleArrow className="absolute -right-8 -top-2 w-6 h-5 text-violet-300" />
                                </h2>
                                <p className="text-sm text-gray-500">Chia sẻ kỷ niệm với nhóm</p>
                            </div>
                            <FriendshipLetterBox slug={slug} initialLetters={data.letters} onPopupOpenChange={() => {}} />
                        </div>
                    )}

                    {activeTab === "quiz" && (
                        <div className="p-4">
                            <div className="text-center mb-4 relative">
                                <h2 className="text-xl font-bold text-violet-900 inline-block">
                                    Thử thách nhóm
                                </h2>
                                <Sticker type="star" className="absolute -right-6 -top-3 w-6 h-6 rotate-12 animate-sticker-bounce" />
                                <p className="text-sm text-gray-500 mt-1">giải cùng nhau nào!</p>
                            </div>
                            <FriendshipGameSection />
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Input Bar (decorative) */}
            {activeTab === "chat" && (
                <div className="bg-white border-t border-violet-100 p-3 z-30">
                    <div className="max-w-2xl mx-auto flex items-center gap-2">
                        <button className="p-2 rounded-full text-violet-400 hover:bg-violet-50 transition-colors">
                            <Smile className="w-6 h-6" />
                        </button>
                        <div className="flex-1 bg-violet-50 rounded-full px-4 py-2.5 text-sm text-gray-400 flex items-center gap-2">
                            <span>Nhập tin nhắn...</span>
                            <span className="ml-auto inline-flex">
                                <span className="w-1 h-1 rounded-full bg-violet-300 animate-typing-bounce" />
                            </span>
                        </div>
                        <button className="p-2 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-md hover:shadow-lg transition-shadow hover:scale-105 active:scale-95">
                            <Send className="w-5 h-5" />
                        </button>
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
                    <div className="max-w-4xl max-h-[80vh] relative bg-white p-3 pb-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
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
                @keyframes typing-bounce {
                    0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
                    30% { transform: translateY(-4px); opacity: 1; }
                }
                @keyframes online-pulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7); }
                    50% { box-shadow: 0 0 0 4px rgba(52, 211, 153, 0); }
                }
                @keyframes sticker-wiggle {
                    0%, 100% { transform: rotate(-3deg) scale(1); }
                    50% { transform: rotate(3deg) scale(1.08); }
                }
                @keyframes sticker-bounce {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-3px) rotate(5deg); }
                }
                @keyframes confetti-burst {
                    0% { transform: scale(0.3); opacity: 0; }
                    30% { opacity: 1; }
                    100% { transform: scale(1.5); opacity: 0; }
                }
                @keyframes heartbeat {
                    0%, 100% { transform: scale(1); }
                    25% { transform: scale(1.15); }
                    50% { transform: scale(0.95); }
                    75% { transform: scale(1.1); }
                }
                :global(.animate-typing-bounce) { animation: typing-bounce 1.4s ease-in-out infinite; }
                :global(.animate-online-pulse) { animation: online-pulse 2s ease-out infinite; }
                :global(.animate-sticker-wiggle) { animation: sticker-wiggle 3s ease-in-out infinite; transform-origin: center; }
                :global(.animate-sticker-bounce) { animation: sticker-bounce 2.5s ease-in-out infinite; transform-origin: center; }
                :global(.animate-confetti-burst) { animation: confetti-burst 2.5s ease-out infinite; transform-origin: center; }
                :global(.animate-heartbeat) { animation: heartbeat 1.5s ease-in-out infinite; transform-origin: center; }
            `}</style>
        </div>
    );
}
