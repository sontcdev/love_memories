"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Link as PrismaLink, LinkConfig, Gallery, Timeline, Letter } from "@prisma/client";
import { Users, Calendar, Image as ImageIcon, Mail, Sparkles, Settings, User } from "lucide-react";

type LinkWithRelations = PrismaLink & {
    config: LinkConfig | null;
    galleries: Gallery[];
    timelines: Timeline[];
    letters: Letter[];
};

interface EveryTemplateProps {
    data: LinkWithRelations;
    slug: string;
}

// Member type for group/family
interface Member {
    name: string;
    role?: string;
    dob?: string;
    avatar_url?: string;
}

// Profile data type for Every template
interface EveryProfileData {
    group_name?: string;
    title?: string;
    short_note?: string;
    members?: Member[];
    start_date?: string;
}

// Generate avatar color based on name
function getAvatarColor(name: string): string {
    const colors = [
        "from-blue-400 to-indigo-500",
        "from-purple-400 to-pink-500",
        "from-green-400 to-teal-500",
        "from-orange-400 to-red-500",
        "from-cyan-400 to-blue-500",
        "from-pink-400 to-rose-500",
        "from-indigo-400 to-purple-500",
        "from-teal-400 to-green-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
}

export function EveryTemplate({ data, slug }: EveryTemplateProps) {
    const [activeSection, setActiveSection] = useState<string>("members");
    const profileData = data.profile_data as EveryProfileData | null;

    const groupName = profileData?.group_name || "Our Memories";
    const title = profileData?.title || groupName;
    const members = profileData?.members || [];

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--theme-bg, #eff6ff)' }}>
            {/* Edit Button */}
            <Link
                href={`/${slug}/edit`}
                className="fixed top-4 right-4 z-30 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl hover:bg-white transition-all"
                title="Edit Page"
            >
                <Settings className="w-5 h-5 text-gray-600" />
            </Link>

            {/* Hero Section */}
            <section className="relative py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Group Icon or Member Avatars Preview */}
                    {members.length > 0 ? (
                        <div className="flex justify-center mb-6">
                            {/* Stack avatars */}
                            <div className="flex -space-x-4">
                                {members.slice(0, 5).map((member, index) => (
                                    <div
                                        key={index}
                                        className={`w-16 h-16 rounded-full bg-gradient-to-br ${getAvatarColor(member.name)} p-0.5 shadow-lg ring-4 ring-white`}
                                        style={{ zIndex: members.length - index }}
                                    >
                                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                            {member.avatar_url ? (
                                                <Image
                                                    src={member.avatar_url}
                                                    alt={member.name}
                                                    width={64}
                                                    height={64}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-lg font-bold text-gray-600">
                                                    {member.name.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {members.length > 5 && (
                                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold shadow-lg ring-4 ring-white">
                                        +{members.length - 5}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 mb-6 shadow-lg">
                            <Users className="w-10 h-10 text-white" />
                        </div>
                    )}

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                        {title}
                    </h1>

                    {/* Member Count */}
                    {members.length > 0 && (
                        <p className="text-indigo-500 font-medium mb-4">
                            {members.length} thành viên
                        </p>
                    )}

                    {/* Subtitle */}
                    {profileData?.short_note && (
                        <p className="text-gray-500 max-w-md mx-auto">
                            {profileData.short_note}
                        </p>
                    )}
                </div>
            </section>

            {/* Navigation */}
            <nav className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-blue-100">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex justify-center gap-2 py-3">
                        {[
                            { id: "members", icon: Users, label: "Thành viên" },
                            { id: "gallery", icon: ImageIcon, label: "Ảnh" },
                            { id: "timeline", icon: Calendar, label: "Khoảnh khắc" },
                            { id: "letters", icon: Mail, label: "Ghi chú" },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveSection(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeSection === tab.id
                                    ? "bg-gradient-to-r from-blue-400 to-indigo-400 text-white shadow-md"
                                    : "text-gray-500 hover:bg-blue-50"
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Content Sections */}
            <main className="max-w-4xl mx-auto px-4 py-12">
                {/* Members Grid */}
                {activeSection === "members" && (
                    <>
                        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
                            <Users className="w-6 h-6 inline-block mr-2 text-blue-400" />
                            Đội Của Chúng Mình
                        </h2>
                        {members.length === 0 ? (
                            <div className="text-center py-16 text-gray-400">
                                <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p>Chưa có thành viên nào</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {members.map((member, index) => (
                                    <div
                                        key={index}
                                        className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow text-center group"
                                    >
                                        {/* Avatar */}
                                        <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${getAvatarColor(member.name)} p-0.5 shadow-md group-hover:scale-105 transition-transform`}>
                                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                                {member.avatar_url ? (
                                                    <Image
                                                        src={member.avatar_url}
                                                        alt={member.name}
                                                        width={80}
                                                        height={80}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-2xl font-bold text-gray-600">
                                                        {member.name.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Name */}
                                        <h3 className="mt-3 font-semibold text-gray-800">
                                            {member.name}
                                        </h3>

                                        {/* Role */}
                                        {member.role && (
                                            <p className="text-sm text-indigo-500 mt-1">
                                                {member.role}
                                            </p>
                                        )}

                                        {/* Birthday */}
                                        {member.dob && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                🎂 {new Date(member.dob).toLocaleDateString("vi-VN", {
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Gallery */}
                {activeSection === "gallery" && (
                    <>
                        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
                            <Sparkles className="w-6 h-6 inline-block mr-2 text-blue-400" />
                            Bộ Sưu Tập Ảnh
                        </h2>
                        {data.galleries.length === 0 ? (
                            <div className="text-center py-16 text-gray-400">
                                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p>Chưa có ảnh nào</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {data.galleries.map((item) => (
                                    <div
                                        key={item.id}
                                        className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-md hover:shadow-xl transition-all hover:scale-[1.02]"
                                    >
                                        {/* Shimmer placeholder */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]" />

                                        <Image
                                            src={item.image_url}
                                            alt={item.caption || "Photo"}
                                            width={400}
                                            height={400}
                                            className="relative z-10 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                            onLoad={(e) => {
                                                const parent = e.currentTarget.parentElement;
                                                const shimmer = parent?.querySelector('.animate-shimmer');
                                                if (shimmer) shimmer.classList.add('hidden');
                                            }}
                                        />

                                        {/* Caption - Always visible */}
                                        {item.caption && (
                                            <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/60 to-transparent p-3">
                                                <p className="text-white text-sm truncate">{item.caption}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Timeline */}
                {activeSection === "timeline" && (
                    <>
                        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
                            <Calendar className="w-6 h-6 inline-block mr-2 text-blue-400" />
                            Khoảnh Khắc Đáng Nhớ
                        </h2>
                        {data.timelines.length === 0 ? (
                            <div className="text-center py-16 text-gray-400">
                                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p>Chưa có khoảnh khắc nào</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {data.timelines.map((event) => (
                                    <div
                                        key={event.id}
                                        className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white font-bold shrink-0">
                                                {new Date(event.date).getDate()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xs text-blue-400 font-medium mb-1">
                                                    {new Date(event.date).toLocaleDateString("vi-VN", {
                                                        year: "numeric",
                                                        month: "long",
                                                    })}
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-800">
                                                    {event.title}
                                                </h3>
                                                {event.description && (
                                                    <p className="text-gray-500 text-sm mt-1">{event.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        {event.image_url && (
                                            <div className="mt-4 rounded-xl overflow-hidden">
                                                <Image
                                                    src={event.image_url}
                                                    alt={event.title}
                                                    width={600}
                                                    height={300}
                                                    className="w-full object-cover"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Letters/Notes */}
                {activeSection === "letters" && (
                    <>
                        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
                            <Mail className="w-6 h-6 inline-block mr-2 text-blue-400" />
                            Ghi Chú & Tin Nhắn
                        </h2>
                        {data.letters.length === 0 ? (
                            <div className="text-center py-16 text-gray-400">
                                <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p>Chưa có ghi chú nào</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {data.letters.map((letter) => (
                                    <div
                                        key={letter.id}
                                        className="bg-white rounded-2xl p-6 shadow-md"
                                    >
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                            {letter.title}
                                        </h3>
                                        <p className="text-gray-600 whitespace-pre-wrap">
                                            {letter.content}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Footer */}
            <footer className="text-center py-8 text-gray-400 text-sm">
                <Users className="w-4 h-4 inline-block mr-1 text-blue-300" />
                Kỷ niệm được chia sẻ
            </footer>
        </div>
    );
}
