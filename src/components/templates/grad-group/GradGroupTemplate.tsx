"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Link as PrismaLink, LinkConfig, Gallery, Timeline, Letter, LetterReply } from "@prisma/client";
import { Image as ImageIcon, Mail, ChevronLeft, ChevronRight, Settings, Sparkles, X, Target, Sun, Moon, Users, MapPin, Navigation, Calendar, Flag } from "lucide-react";
import { GameSection } from "./GameSection";
import { LetterBox } from "./LetterBox";

type LetterWithReplies = Letter & { replies: LetterReply[] };

type LinkWithRelations = PrismaLink & {
    config: LinkConfig | null;
    galleries: Gallery[];
    timelines: Timeline[];
    letters: LetterWithReplies[];
};

interface GradGroupTemplateProps {
    data: LinkWithRelations;
    slug: string;
}

interface GroupMember {
    id: string;
    name: string;
    nickname?: string;
    avatar?: string;
    quote?: string;
    dream_university?: string;
    dream_job?: string;
    facebook?: string;
    instagram?: string;
}

interface Goal {
    id: string;
    title: string;
    description: string;
    status: string;
}

interface GradGroupProfile {
    theme?: string;
    group_name?: string;
    group_avatar?: string;
    title?: string;
    slogan?: string;
    graduation_year?: string;
    members?: GroupMember[];
    goals?: Goal[];
    quiz?: { question: string; options: string[]; correctIndex: number }[];
    quiz_badges?: {
        perfect_title?: string; perfect_desc?: string;
        good_title?: string; good_desc?: string;
        normal_title?: string; normal_desc?: string;
    };
}

type RoadStop = "start" | "crew" | "gallery" | "timeline" | "goals" | "game" | "letters";

export function GradGroupTemplate({ data, slug }: GradGroupTemplateProps) {
    const [currentStop, setCurrentStop] = useState<RoadStop>("start");
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const profileData = data.profile_data as unknown as GradGroupProfile | null;
    const [overrideDark, setOverrideDark] = useState<boolean | null>(null);
    const isDark = overrideDark !== null ? overrideDark : false;

    const subTheme = profileData?.theme || "caravan";

    const getThemeProps = () => {
        switch (subTheme) {
            case "station":
                return {
                    bgClass: isDark ? "from-[#05040a] to-[#100c1e]" : "from-[#0f0c1b] to-[#211a3b]",
                    accentColor: "#8b5cf6",
                    roadColor: isDark ? "bg-violet-900/40" : "bg-violet-300/60",
                    stopColor: isDark ? "bg-violet-600" : "bg-violet-500",
                    cardBg: isDark ? "bg-[#1a103c]/90" : "bg-white/90",
                    textColor: isDark ? "text-violet-100" : "text-violet-900",
                    mutedText: isDark ? "text-violet-300/70" : "text-violet-600",
                };
            case "scrapbook":
                return {
                    bgClass: isDark ? "from-[#1c1611] to-[#2b2118]" : "from-[#e5d4bc] to-[#c7b399]",
                    accentColor: "#855430",
                    roadColor: isDark ? "bg-amber-900/40" : "bg-amber-300/60",
                    stopColor: isDark ? "bg-amber-700" : "bg-amber-600",
                    cardBg: isDark ? "bg-[#2b2118]/90" : "bg-white/90",
                    textColor: isDark ? "text-amber-100" : "text-amber-900",
                    mutedText: isDark ? "text-amber-300/70" : "text-amber-700",
                };
            case "caravan":
            default:
                return {
                    bgClass: isDark ? "from-[#0f0a07] to-[#1d120a]" : "from-[#3a2213] to-[#53331c]",
                    accentColor: "#d97706",
                    roadColor: isDark ? "bg-amber-900/40" : "bg-amber-300/60",
                    stopColor: isDark ? "bg-amber-600" : "bg-amber-500",
                    cardBg: isDark ? "bg-[#1d120a]/90" : "bg-white/90",
                    textColor: isDark ? "text-amber-100" : "text-amber-900",
                    mutedText: isDark ? "text-amber-300/70" : "text-amber-700",
                };
        }
    };

    const theme = getThemeProps();

    useEffect(() => {
        const saved = localStorage.getItem(`theme_mode_${slug}`);
        if (saved) {
            const isSavedDark = saved === "dark";
            setOverrideDark(isSavedDark);
            const root = document.documentElement;
            if (isSavedDark) {
                const darkBg = subTheme === "station" ? "#05040a" : subTheme === "scrapbook" ? "#1c1611" : "#0f0a07";
                root.style.setProperty("--theme-bg", darkBg);
            } else {
                root.style.setProperty("--theme-bg", data.config?.background_color || "#3a2213");
            }
        }
    }, [slug, subTheme, data.config?.background_color]);

    const handleThemeToggle = () => {
        const newDark = !isDark;
        setOverrideDark(newDark);
        localStorage.setItem(`theme_mode_${slug}`, newDark ? "dark" : "light");
        window.dispatchEvent(new CustomEvent("theme-change", { detail: { isDark: newDark } }));
        const root = document.documentElement;
        if (newDark) {
            const darkBg = subTheme === "station" ? "#05040a" : subTheme === "scrapbook" ? "#1c1611" : "#0f0a07";
            root.style.setProperty("--theme-bg", darkBg);
        } else {
            root.style.setProperty("--theme-bg", data.config?.background_color || "#3a2213");
        }
    };

    const groupName = profileData?.group_name || "Nhóm bạn";
    const groupAvatar = profileData?.group_avatar;
    const title = profileData?.title || groupName;
    const slogan = profileData?.slogan || "Thanh xuân rực rỡ cùng nhau.";
    const graduationYear = profileData?.graduation_year || "2026";
    const members = profileData?.members || [];
    const goals = profileData?.goals || [];

    const stops: { id: RoadStop; label: string; icon: typeof MapPin }[] = [
        { id: "start", label: "Xuất Phát", icon: Flag },
        { id: "crew", label: "Đồng Đội", icon: Users },
        { id: "gallery", label: "Khoảnh Khắc", icon: ImageIcon },
        { id: "timeline", label: "Hành Trình", icon: Calendar },
        { id: "goals", label: "Đích Đến", icon: Target },
        { id: "game", label: "Thử Thách", icon: Sparkles },
        { id: "letters", label: "Lưu Bút", icon: Mail },
    ];

    const goToStop = (stop: RoadStop) => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentStop(stop);
            setIsTransitioning(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 250);
    };

    const openLightbox = (index: number) => { setLightboxIndex(index); };
    const closeLightbox = () => { setLightboxIndex(null); };
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
            if (lightboxIndex === null) return;
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'Escape') closeLightbox();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex, nextImage, prevImage]);

    const currentStopIdx = stops.findIndex(s => s.id === currentStop);

    return (
        <div className={`min-h-screen relative transition-colors duration-500 bg-gradient-to-b ${theme.bgClass}`}>
            <style jsx>{`
                @keyframes road-dash {
                    0% { background-position: 0 0; }
                    100% { background-position: 0 40px; }
                }
                @keyframes stop-pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.15); }
                }
                @keyframes car-drive {
                    0% { transform: translateX(-10px) rotate(-2deg); }
                    50% { transform: translateX(10px) rotate(2deg); }
                    100% { transform: translateX(-10px) rotate(-2deg); }
                }
                .road-dash { animation: road-dash 1s linear infinite; }
                .stop-pulse { animation: stop-pulse 2s ease-in-out infinite; }
                .car-drive { animation: car-drive 3s ease-in-out infinite; }
                @keyframes fade-slide {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .fade-slide { animation: fade-slide 0.4s ease-out; }
            `}</style>

            {/* Top Bar */}
            <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-2">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${theme.cardBg} ${theme.textColor} backdrop-blur-md border border-white/10`}>
                    <Navigation className="w-3.5 h-3.5" />
                    {graduationYear}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleThemeToggle} className={`p-2.5 rounded-full shadow-lg transition-all hover:scale-110 ${theme.cardBg} ${theme.textColor} backdrop-blur-md`}>
                        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                    <Link href={`/${slug}/edit`} className={`p-2.5 rounded-full shadow-lg transition-all hover:scale-110 ${theme.cardBg} ${theme.textColor} backdrop-blur-md`}>
                        <Settings className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Road Navigation (bottom) */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-lg px-4">
                <div className={`relative ${theme.cardBg} backdrop-blur-md rounded-2xl border border-white/10 p-2 shadow-xl`}>
                    <div className="flex items-center justify-between gap-0.5 overflow-x-auto">
                        {stops.map((stop, idx) => {
                            const isActive = currentStop === stop.id;
                            const isVisited = idx < currentStopIdx;
                            return (
                                <button
                                    key={stop.id}
                                    onClick={() => goToStop(stop.id)}
                                    className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-[48px]"
                                >
                                    <div className={`relative w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                                        isActive ? `${theme.stopColor} text-white shadow-lg stop-pulse` :
                                        isVisited ? `${theme.stopColor}/60 text-white` :
                                        isDark ? "bg-white/10 text-white/40" : "bg-black/10 text-black/40"
                                    }`}>
                                        <stop.icon className="w-3.5 h-3.5" />
                                        {isActive && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white" />}
                                    </div>
                                    <span className={`text-[8px] font-medium whitespace-nowrap ${isActive ? theme.textColor : isDark ? "text-white/40" : "text-black/40"}`}>
                                        {stop.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    {/* Road line connecting stops */}
                    <div className={`absolute top-[22px] left-8 right-8 h-0.5 ${theme.roadColor} -z-10`} />
                </div>
            </div>

            {/* Content Area */}
            <div className={`pt-14 pb-28 px-4 max-w-3xl mx-auto min-h-screen ${isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"} transition-all duration-250`}>

                {/* STOP: Start (Xuất Phát) */}
                {currentStop === "start" && (
                    <div className="flex flex-col items-center justify-center min-h-[75vh] text-center space-y-6 fade-slide">
                        <div className="relative">
                            <div className={`w-28 h-28 rounded-full overflow-hidden border-4 shadow-2xl ${isDark ? "border-white/20" : "border-white/60"}`}>
                                {groupAvatar ? (
                                    <Image src={groupAvatar} alt={groupName} width={112} height={112} className="w-full h-full object-cover" />
                                ) : (
                                    <div className={`w-full h-full flex items-center justify-center text-4xl ${isDark ? "bg-white/10" : "bg-white/40"}`}>🚗</div>
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 car-drive text-2xl">🚗</div>
                        </div>

                        <div className="space-y-3">
                            <h1 className={`text-3xl sm:text-4xl font-black ${isDark ? "text-white" : "text-white"}`}>{title}</h1>
                            <p className={`text-lg ${isDark ? "text-white/70" : "text-white/80"}`}>{groupName}</p>
                            <p className={`italic max-w-md mx-auto ${isDark ? "text-white/50" : "text-white/60"}`}>&ldquo;{slogan}&rdquo;</p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-3">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${theme.cardBg} backdrop-blur-md border border-white/10`}>
                                <Users className={`w-4 h-4 ${theme.mutedText}`} />
                                <span className={`text-sm font-bold ${theme.textColor}`}>{members.length}</span>
                                <span className={`text-xs ${theme.mutedText}`}>thành viên</span>
                            </div>
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${theme.cardBg} backdrop-blur-md border border-white/10`}>
                                <ImageIcon className={`w-4 h-4 ${theme.mutedText}`} />
                                <span className={`text-sm font-bold ${theme.textColor}`}>{data.galleries.length}</span>
                                <span className={`text-xs ${theme.mutedText}`}>ảnh</span>
                            </div>
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${theme.cardBg} backdrop-blur-md border border-white/10`}>
                                <Calendar className={`w-4 h-4 ${theme.mutedText}`} />
                                <span className={`text-sm font-bold ${theme.textColor}`}>{data.timelines.length}</span>
                                <span className={`text-xs ${theme.mutedText}`}>kỷ niệm</span>
                            </div>
                        </div>

                        <button onClick={() => goToStop("crew")} className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white transition-all hover:scale-105 ${theme.stopColor} shadow-lg`}>
                            Bắt đầu hành trình <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* STOP: Crew (Đồng Đội) */}
                {currentStop === "crew" && (
                    <div className="py-8 space-y-6 fade-slide">
                        <div className="text-center space-y-2">
                            <MapPin className={`w-6 h-6 mx-auto ${isDark ? "text-white/60" : "text-white/80"}`} />
                            <h2 className={`text-2xl font-black ${isDark ? "text-white" : "text-white"}`}>Đồng Đội</h2>
                            <p className={`text-sm ${isDark ? "text-white/50" : "text-white/60"}`}>{members.length} chiến hữu</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {members.map((member, idx) => (
                                <button
                                    key={member.id || idx}
                                    onClick={() => setSelectedMember(member)}
                                    className={`${theme.cardBg} backdrop-blur-md rounded-xl p-4 border border-white/10 text-center hover:scale-105 transition-all`}
                                >
                                    <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-white/20 shadow-md">
                                        {member.avatar ? (
                                            <Image src={member.avatar} alt={member.name} width={64} height={64} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className={`w-full h-full flex items-center justify-center text-xl font-bold ${isDark ? "bg-white/10 text-white/60" : "bg-white/30 text-white/80"}`}>
                                                {member.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <p className={`mt-2 text-sm font-bold ${theme.textColor} truncate`}>{member.name}</p>
                                    {member.nickname && <p className={`text-xs ${theme.mutedText}`}>{member.nickname}</p>}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* STOP: Gallery (Khoảnh Khắc) */}
                {currentStop === "gallery" && (
                    <div className="py-8 space-y-6 fade-slide">
                        <div className="text-center space-y-2">
                            <MapPin className={`w-6 h-6 mx-auto ${isDark ? "text-white/60" : "text-white/80"}`} />
                            <h2 className={`text-2xl font-black ${isDark ? "text-white" : "text-white"}`}>Khoảnh Khắc</h2>
                        </div>
                        {data.galleries.length === 0 ? (
                            <div className="text-center py-16 text-white/40">
                                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                <p>Chưa có ảnh nào...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {data.galleries.map((item, index) => (
                                    <div
                                        key={item.id}
                                        onClick={() => openLightbox(index)}
                                        className={`${theme.cardBg} backdrop-blur-md p-2 pb-4 rounded-xl border border-white/10 shadow-lg hover:scale-105 transition-all cursor-pointer`}
                                    >
                                        <div className="relative aspect-square rounded-lg overflow-hidden">
                                            <Image src={item.image_url} alt={item.caption || "Memory"} fill className="object-cover" />
                                        </div>
                                        {item.caption && <p className={`text-center text-xs mt-2 truncate ${theme.mutedText}`}>{item.caption}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* STOP: Timeline (Hành Trình) */}
                {currentStop === "timeline" && (
                    <div className="py-8 space-y-6 fade-slide">
                        <div className="text-center space-y-2">
                            <MapPin className={`w-6 h-6 mx-auto ${isDark ? "text-white/60" : "text-white/80"}`} />
                            <h2 className={`text-2xl font-black ${isDark ? "text-white" : "text-white"}`}>Hành Trình</h2>
                        </div>
                        {data.timelines.length === 0 ? (
                            <div className="text-center py-16 text-white/40">
                                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                <p>Chưa có kỷ niệm nào...</p>
                            </div>
                        ) : (
                            <div className="relative pl-8">
                                <div className={`absolute left-3 top-0 bottom-0 w-0.5 ${theme.roadColor}`} />
                                <div className="space-y-6">
                                    {data.timelines.map((event) => (
                                        <div key={event.id} className="relative">
                                            <div className={`absolute -left-5 top-2 w-4 h-4 rounded-full ${theme.stopColor} border-2 border-white shadow-md`} />
                                            <div className={`${theme.cardBg} backdrop-blur-md rounded-xl p-4 border border-white/10`}>
                                                <div className={`text-xs font-bold mb-1 ${theme.mutedText}`}>
                                                    {new Date(event.date).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" })}
                                                </div>
                                                <h3 className={`font-bold text-lg ${theme.textColor}`}>{event.title}</h3>
                                                {event.description && <p className={`text-sm mt-1 ${theme.mutedText}`}>{event.description}</p>}
                                                {event.image_url && (
                                                    <div className="mt-3 rounded-lg overflow-hidden max-w-xs shadow-md">
                                                        <Image src={event.image_url} alt={event.title} width={300} height={200} className="w-full h-auto" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* STOP: Goals (Đích Đến) */}
                {currentStop === "goals" && (
                    <div className="py-8 space-y-6 fade-slide">
                        <div className="text-center space-y-2">
                            <MapPin className={`w-6 h-6 mx-auto ${isDark ? "text-white/60" : "text-white/80"}`} />
                            <h2 className={`text-2xl font-black ${isDark ? "text-white" : "text-white"}`}>Đích Đến</h2>
                        </div>
                        {goals.length === 0 ? (
                            <div className="text-center py-16 text-white/40">
                                <Target className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                <p>Chưa có mục tiêu nào...</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {goals.map((goal) => (
                                    <div key={goal.id} className={`${theme.cardBg} backdrop-blur-md rounded-xl p-4 border border-white/10 flex items-start gap-3`}>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${goal.status === "done" ? "bg-green-500 border-green-400" : isDark ? "border-white/30" : "border-white/50"}`}>
                                            {goal.status === "done" && <span className="text-white text-xs">✓</span>}
                                        </div>
                                        <div>
                                            <h4 className={`font-bold text-sm ${theme.textColor} ${goal.status === "done" ? "line-through opacity-60" : ""}`}>{goal.title}</h4>
                                            {goal.description && <p className={`text-xs mt-0.5 ${theme.mutedText}`}>{goal.description}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* STOP: Game (Thử Thách) */}
                {currentStop === "game" && (
                    <div className="py-8 space-y-6 fade-slide">
                        <div className="text-center space-y-2">
                            <MapPin className={`w-6 h-6 mx-auto ${isDark ? "text-white/60" : "text-white/80"}`} />
                            <h2 className={`text-2xl font-black ${isDark ? "text-white" : "text-white"}`}>Thử Thách</h2>
                        </div>
                        <GameSection
                            slug={slug}
                            quiz={profileData?.quiz}
                            quizBadges={profileData?.quiz_badges}
                            members={members.map(m => ({ id: m.id, name: m.name }))}
                            groupName={groupName}
                            isDark={isDark}
                            accentColor={theme.accentColor}
                        />
                    </div>
                )}

                {/* STOP: Letters (Lưu Bút) */}
                {currentStop === "letters" && (
                    <div className="py-8 space-y-6 fade-slide">
                        <div className="text-center space-y-2">
                            <MapPin className={`w-6 h-6 mx-auto ${isDark ? "text-white/60" : "text-white/80"}`} />
                            <h2 className={`text-2xl font-black ${isDark ? "text-white" : "text-white"}`}>Lưu Bút</h2>
                        </div>
                        <LetterBox slug={slug} initialLetters={data.letters} isDark={isDark} accentColor={theme.accentColor} />
                    </div>
                )}
            </div>

            {/* Member Modal */}
            {selectedMember && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedMember(null)}>
                    <div className={`max-w-sm w-full rounded-2xl shadow-2xl overflow-hidden ${theme.cardBg} backdrop-blur-md border border-white/10`} onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white/20 shadow-lg">
                                {selectedMember.avatar ? (
                                    <Image src={selectedMember.avatar} alt={selectedMember.name} width={96} height={96} className="w-full h-full object-cover" />
                                ) : (
                                    <div className={`w-full h-full flex items-center justify-center text-3xl font-bold ${isDark ? "bg-white/10 text-white/60" : "bg-white/30 text-white/80"}`}>
                                        {selectedMember.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <h3 className={`mt-3 text-xl font-bold ${theme.textColor}`}>{selectedMember.name}</h3>
                            {selectedMember.nickname && <p className={`text-sm ${theme.mutedText}`}>{selectedMember.nickname}</p>}
                        </div>
                        {selectedMember.quote && (
                            <div className="px-5 pb-4">
                                <p className={`italic text-center ${theme.mutedText}`}>&ldquo;{selectedMember.quote}&rdquo;</p>
                            </div>
                        )}
                        {(selectedMember.dream_university || selectedMember.dream_job) && (
                            <div className="px-5 pb-4 flex flex-wrap gap-2 justify-center">
                                {selectedMember.dream_job && (
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${isDark ? "bg-white/10 text-white/70" : "bg-white/20 text-white/90"}`}>
                                        {selectedMember.dream_job}
                                    </span>
                                )}
                                {selectedMember.dream_university && (
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${isDark ? "bg-white/10 text-white/70" : "bg-white/20 text-white/90"}`}>
                                        {selectedMember.dream_university}
                                    </span>
                                )}
                            </div>
                        )}
                        <div className="p-4 flex justify-center">
                            <button onClick={() => setSelectedMember(null)} className={`px-6 py-2 rounded-full text-sm font-medium text-white ${theme.stopColor} hover:opacity-90 transition-opacity`}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lightbox */}
            {lightboxIndex !== null && data.galleries[lightboxIndex] && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeLightbox}>
                    <div className={`rounded-xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col ${theme.cardBg} ${theme.textColor}`} onClick={(e) => e.stopPropagation()}>
                        <div className={`p-3 flex items-center justify-between border-b border-white/10`}>
                            <span className="text-sm font-medium">{lightboxIndex + 1} / {data.galleries.length}</span>
                            <button onClick={closeLightbox} className="hover:scale-110 transition-transform"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="flex-1 overflow-hidden flex items-center justify-center p-4 min-h-[300px]">
                            <div className="relative w-full aspect-[4/3] max-h-[55vh]">
                                <Image src={data.galleries[lightboxIndex].image_url} alt={data.galleries[lightboxIndex].caption || "Photo"} fill className="object-contain" priority />
                            </div>
                        </div>
                        {data.galleries[lightboxIndex].caption && (
                            <div className={`px-4 py-2 text-center text-sm ${theme.mutedText}`}>{data.galleries[lightboxIndex].caption}</div>
                        )}
                        <div className="flex justify-center items-center gap-4 p-3 border-t border-white/10">
                            <button onClick={prevImage} className={`p-2 rounded-lg ${isDark ? "bg-white/10 text-white" : "bg-white/20 text-white"}`}><ChevronLeft className="w-5 h-5" /></button>
                            <button onClick={nextImage} className={`p-2 rounded-lg ${isDark ? "bg-white/10 text-white" : "bg-white/20 text-white"}`}><ChevronRight className="w-5 h-5" /></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
