"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Link as PrismaLink, LinkConfig, Gallery, Timeline, Letter } from "@prisma/client";
import { Star, Calendar, Image as ImageIcon, Heart, Sparkles, Settings, Clock } from "lucide-react";

type LinkWithRelations = PrismaLink & {
    config: LinkConfig | null;
    galleries: Gallery[];
    timelines: Timeline[];
    letters: Letter[];
};

interface IdolTemplateProps {
    data: LinkWithRelations;
    slug: string;
}

// Profile data type for Idol template
interface IdolProfileData {
    idol_name?: string;
    fandom_name?: string;
    debut_date?: string;
    title?: string;
    short_note?: string;
    avatar_url?: string;
}

// Calculate days since debut
function getDaysSinceDebut(debutDate: string): { days: number; years: number; months: number } | null {
    if (!debutDate) return null;
    const start = new Date(debutDate);
    const today = new Date();

    const diffTime = today.getTime() - start.getTime();
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);

    return { days: totalDays, years, months };
}

export function IdolTemplate({ data, slug }: IdolTemplateProps) {
    const [activeSection, setActiveSection] = useState<string>("gallery");
    const profileData = data.profile_data as IdolProfileData | null;

    const idolName = profileData?.idol_name || "My Idol";
    const fandomName = profileData?.fandom_name || "Fan";
    const title = profileData?.title || `For ${idolName}`;
    const debutDate = profileData?.debut_date;
    const avatarUrl = profileData?.avatar_url;

    const debutInfo = debutDate ? getDaysSinceDebut(debutDate) : null;

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--theme-bg, #fffbeb)' }}>
            {/* Edit Button */}
            <Link
                href={`/${slug}/edit`}
                className="fixed top-4 right-4 z-30 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl hover:bg-white transition-all"
                title="Edit Page"
            >
                <Settings className="w-5 h-5 text-gray-600" />
            </Link>

            {/* Hero Section */}
            <section className="relative py-20 px-4 overflow-hidden">
                {/* Decorative stars */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                        <Star
                            key={i}
                            className="absolute text-yellow-300 fill-yellow-300 animate-pulse"
                            style={{
                                width: `${16 + (i % 3) * 8}px`,
                                left: `${10 + i * 12}%`,
                                top: `${15 + (i % 4) * 20}%`,
                                opacity: 0.3,
                                animationDelay: `${i * 0.3}s`,
                            }}
                        />
                    ))}
                </div>

                <div className="relative max-w-4xl mx-auto text-center">
                    {/* Profile Avatar */}
                    <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-400 mb-6 shadow-xl p-1">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                            {avatarUrl ? (
                                <Image
                                    src={avatarUrl}
                                    alt={idolName}
                                    width={128}
                                    height={128}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Star className="w-14 h-14 text-amber-400 fill-amber-400" />
                            )}
                        </div>
                    </div>

                    {/* Idol Name */}
                    <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                        {idolName}
                    </h1>

                    {/* Title */}
                    <p className="text-amber-600 font-medium mb-4">
                        ✨ {title} ✨
                    </p>

                    {/* Fandom Badge */}
                    {fandomName && (
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                            <Heart className="w-4 h-4 fill-white" />
                            {fandomName}
                        </div>
                    )}

                    {/* Days Since Debut Counter */}
                    {debutInfo && (
                        <div className="mb-8">
                            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-lg">
                                <Clock className="w-6 h-6 text-amber-500" />
                                <div className="text-left">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Thời gian làm fan</p>
                                    <div className="flex items-baseline gap-2">
                                        {debutInfo.years > 0 && (
                                            <>
                                                <span className="text-2xl font-bold text-amber-500">{debutInfo.years}</span>
                                                <span className="text-gray-500 text-sm">năm</span>
                                            </>
                                        )}
                                        {debutInfo.months > 0 && (
                                            <>
                                                <span className="text-2xl font-bold text-amber-500">{debutInfo.months}</span>
                                                <span className="text-gray-500 text-sm">tháng</span>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {debutInfo.days.toLocaleString()} ngày kể từ ngày debut
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Fan Message */}
                    {profileData?.short_note && (
                        <p className="text-gray-500 italic max-w-md mx-auto">
                            &quot;{profileData.short_note}&quot;
                        </p>
                    )}
                </div>
            </section>

            {/* Navigation */}
            <nav className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-amber-100">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex justify-center gap-2 py-3">
                        {[
                            { id: "gallery", icon: ImageIcon, label: "Bộ sưu tập" },
                            { id: "timeline", icon: Calendar, label: "Khoảnh khắc" },
                            { id: "fanletters", icon: Heart, label: "Thư fan" },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveSection(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeSection === tab.id
                                    ? "bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-md"
                                    : "text-gray-500 hover:bg-amber-50"
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 py-12">
                {activeSection === "gallery" && (
                    <>
                        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
                            <Sparkles className="w-6 h-6 inline-block mr-2 text-amber-400" />
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
                                        className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-md hover:shadow-xl transition-all hover:scale-[1.02] ring-2 ring-amber-200"
                                    >
                                        {/* Shimmer placeholder */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]" />

                                        <Image
                                            src={item.image_url}
                                            alt={item.caption || "Idol photo"}
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

                {activeSection === "timeline" && (
                    <>
                        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
                            <Star className="w-6 h-6 inline-block mr-2 text-amber-400 fill-amber-400" />
                            Khoảnh Khắc Đặc Biệt
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
                                        className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow border-l-4 border-amber-400"
                                    >
                                        <div className="text-xs text-amber-500 font-medium mb-2">
                                            ⭐ {new Date(event.date).toLocaleDateString("vi-VN", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                            {event.title}
                                        </h3>
                                        {event.description && (
                                            <p className="text-gray-500 text-sm">{event.description}</p>
                                        )}
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

                {activeSection === "fanletters" && (
                    <>
                        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
                            <Heart className="w-6 h-6 inline-block mr-2 text-amber-400 fill-amber-400" />
                            Thư Fan
                        </h2>
                        {data.letters.length === 0 ? (
                            <div className="text-center py-16 text-gray-400">
                                <Heart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p>Chưa có thư fan nào</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {data.letters.map((letter) => (
                                    <div
                                        key={letter.id}
                                        className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 shadow-md"
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                {letter.title}
                                            </h3>
                                        </div>
                                        <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                                            {letter.content}
                                        </p>
                                        <div className="mt-4 text-right text-sm text-amber-500">
                                            — với tình yêu ❤️
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Footer */}
            <footer className="text-center py-8 text-gray-400 text-sm">
                <Star className="w-4 h-4 inline-block mr-1 text-amber-300 fill-amber-300" />
                Mãi là fan
            </footer>
        </div>
    );
}
