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

    return (
        <div className="h-screen flex flex-col bg-violet-50">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow-lg z-40">
                <div className="max-w-2xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="font-semibold text-lg">{groupName}</h1>
                                <div className="flex items-center gap-2 text-xs text-white/80">
                                    {memberCount && <span>{memberCount} thành viên</span>}
                                    {years !== null && <span>{years} năm gắn bó</span>}
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
                            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === tab.id
                                    ? "border-violet-500 text-violet-600"
                                    : "border-transparent text-gray-500 hover:text-violet-400"
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Content Area */}
            <div className="flex-1 overflow-y-auto">
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
                                    <div className="flex justify-center">
                                        <div className="bg-violet-100 text-violet-700 text-xs px-4 py-2 rounded-full">
                                            Kỷ niệm đáng nhớ
                                        </div>
                                    </div>
                                    {data.timelines.map((item, index) => {
                                        const isLeft = index % 2 === 0;
                                        return (
                                            <div key={item.id} className={`flex gap-2 ${isLeft ? "" : "flex-row-reverse"}`}>
                                                <div className={`w-8 h-8 rounded-full ${getAvatarColor(index)} flex items-center justify-center flex-shrink-0`}>
                                                    <Smile className="w-4 h-4 text-white" />
                                                </div>
                                                <div className={`max-w-[75%] ${isLeft ? "" : "items-end"}`}>
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
                                        <div className="w-8 h-8 rounded-full bg-violet-400 flex items-center justify-center flex-shrink-0">
                                            <ImageIcon className="w-4 h-4 text-white" />
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

                            {/* Reaction message */}
                            <div className="flex justify-center">
                                <div className="bg-white rounded-full px-4 py-2 shadow-sm flex items-center gap-2">
                                    <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
                                    <span className="text-sm text-gray-600">Mãi bên nhau nhé!</span>
                                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                </div>
                            </div>

                            <div ref={chatEndRef} />
                        </div>
                    )}

                    {activeTab === "gallery" && (
                        <div className="p-4">
                            <div className="text-center mb-4">
                                <h2 className="text-xl font-bold text-violet-900">Khoảnh khắc vui vẻ</h2>
                                <p className="text-sm text-gray-500">{data.galleries.length} ảnh</p>
                            </div>
                            {data.galleries.length > 0 ? (
                                <div className="grid grid-cols-3 gap-2">
                                    {data.galleries.map((photo, index) => (
                                        <div
                                            key={photo.id}
                                            className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group border-2 border-violet-100 shadow-sm"
                                            onClick={() => setLightboxIndex(index)}
                                        >
                                            <Image
                                                src={photo.image_url}
                                                alt={photo.caption || `Photo ${index + 1}`}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            {photo.caption && (
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                                                    <p className="text-white text-xs text-center truncate">{photo.caption}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-400 italic py-8">Chưa có ảnh nào</p>
                            )}
                        </div>
                    )}

                    {activeTab === "guestbook" && (
                        <div className="p-4">
                            <div className="text-center mb-4">
                                <h2 className="text-xl font-bold text-violet-900">Lưu bút</h2>
                                <p className="text-sm text-gray-500">Chia sẻ kỷ niệm với nhóm</p>
                            </div>
                            <FriendshipLetterBox slug={slug} initialLetters={data.letters} onPopupOpenChange={() => {}} />
                        </div>
                    )}

                    {activeTab === "quiz" && (
                        <div className="p-4">
                            <div className="text-center mb-4">
                                <h2 className="text-xl font-bold text-violet-900">Thử thách nhóm</h2>
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
                        <div className="flex-1 bg-violet-50 rounded-full px-4 py-2.5 text-sm text-gray-400">
                            Nhập tin nhắn...
                        </div>
                        <button className="p-2 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-md hover:shadow-lg transition-shadow">
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
        </div>
    );
}
