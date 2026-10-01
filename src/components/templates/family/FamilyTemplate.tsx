"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Link as PrismaLink, LinkConfig, Gallery, Timeline, Letter, LetterReply } from "@prisma/client";
import { Image as ImageIcon, Mail, ChevronUp, ChevronLeft, ChevronRight, Settings, Sparkles, X, Target, Home, Sun, Moon, Users, Cake, Calendar } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import { GameSection } from "./GameSection";
import { LetterBox } from "./LetterBox";

type LetterWithReplies = Letter & { replies: LetterReply[] };

type LinkWithRelations = PrismaLink & {
    config: LinkConfig | null;
    galleries: Gallery[];
    timelines: Timeline[];
    letters: LetterWithReplies[];
};

interface FamilyTemplateProps {
    data: LinkWithRelations;
    slug: string;
}

interface FamilyMember {
    id: string;
    name: string;
    role?: string;
    avatar?: string;
    quote?: string;
    birthday?: string;
}

interface Particle {
    id: number;
    left: number;
    size: number;
    delay: number;
    duration: number;
    angle: number;
    content: string; // emoji or character
}

interface ThrownAvatar {
    id: number;
    left: number;
    delay: number;
    avatar?: string;
    name: string;
}

export function FamilyTemplate({ data, slug }: FamilyTemplateProps) {
    const [activeSection, setActiveSection] = useState<string>("members");
    interface Goal {
        id: string;
        title: string;
        description: string;
        status: string;
    }

    interface FamilyProfile {
        theme?: string;
        family_name?: string;
        family_avatar?: string;
        title?: string;
        slogan?: string;
        established_year?: string;
        members?: FamilyMember[];
        goals?: Goal[];
        quiz?: {
            question: string;
            options: string[];
            correctIndex: number;
        }[];
        quiz_badges?: {
            perfect_title?: string;
            perfect_desc?: string;
            good_title?: string;
            good_desc?: string;
            average_title?: string;
            average_desc?: string;
            low_title?: string;
            low_desc?: string;
        };
    }

    const [showScrollTop, setShowScrollTop] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const profileData = data.profile_data as unknown as FamilyProfile | null;
    const [overrideDark, setOverrideDark] = useState<boolean | null>(null);
    const isDark = overrideDark !== null ? overrideDark : false;

    // Selected Sub-theme config
    const subTheme = profileData?.theme || "home"; // "home" | "album" | "hearth"

    // Card flip state for mobile taps
    const [flippedCardId, setFlippedCardId] = useState<string | null>(null);

    // Gói 1: Particle States
    const [particles, setParticles] = useState<Particle[]>([]);
    const [thrownAvatars, setThrownAvatars] = useState<ThrownAvatar[]>([]);

    // Get theme properties
    const getThemeProps = () => {
        switch (subTheme) {
            case "hearth":
                return {
                    bgClass: isDark ? "from-[#170907] to-[#2b1210]" : "from-[#2b1410] to-[#4a1f16]",
                    accentColor: "#ea580c",
                    particleEmoji: "🔥",
                    deskTextureOpacity: "opacity-5",
                    woodColor: "from-[#3d1c14] via-[#5c2a1c] to-[#3d1c14]",
                    ribbonBg: "bg-orange-950/90 text-orange-200 border-orange-800/30",
                    deskOverlay: "bep-lua",
                    badgeBg: "bg-orange-500/10",
                    accentText: "text-orange-500",
                };
            case "album":
                return {
                    bgClass: isDark ? "from-[#1c1611] to-[#2b2118]" : "from-[#cbb193] to-[#a9895f]",
                    accentColor: "#855430",
                    particleEmoji: "📷",
                    deskTextureOpacity: "opacity-15",
                    woodColor: "from-[#4a3424] via-[#6e4e37] to-[#4a3424]",
                    ribbonBg: "bg-[#faf3e0]/95 text-[#5c3a21] border-[#855430]/20",
                    deskOverlay: "kraft",
                    badgeBg: "bg-[#855430]/10",
                    accentText: "text-[#855430]",
                };
            case "home":
            default:
                return {
                    bgClass: isDark ? "from-[#160f07] to-[#241a0d]" : "from-[#3a2a13] to-[#53401c]",
                    accentColor: "#d97706",
                    particleEmoji: "🏡",
                    deskTextureOpacity: "opacity-10",
                    woodColor: "from-[#5c4321] via-[#856330] to-[#5c4321]",
                    ribbonBg: "bg-amber-50/90 text-amber-950 border-amber-900/15",
                    deskOverlay: "to-am",
                    badgeBg: "bg-amber-500/10",
                    accentText: "text-amber-600",
                };
        }
    };

    const themeProps = getThemeProps();

    // Generate falling/floating elements on mount
    useEffect(() => {
        const generated = Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            size: subTheme === "hearth" ? Math.random() * 6 + 4 : Math.random() * 16 + 12,
            delay: Math.random() * 8,
            duration: Math.random() * 7 + 6,
            angle: Math.random() * 360,
            content: themeProps.particleEmoji,
        }));
        setParticles(generated);
    }, [subTheme, themeProps.particleEmoji]);

    const handleThrowStickers = () => {
        const membersList = profileData?.members || [];
        if (membersList.length === 0) return;

        const generated = Array.from({ length: 8 }).map((_, i) => {
            const member = membersList[i % membersList.length];
            return {
                id: Date.now() + i,
                left: 10 + Math.random() * 80,
                delay: Math.random() * 0.4,
                avatar: member.avatar,
                name: member.name
            };
        });

        setThrownAvatars(prev => [...prev, ...generated]);
        setTimeout(() => {
            setThrownAvatars(prev => prev.filter(a => !generated.find(gg => gg.id === a.id)));
        }, 2800);
    };

    // Read theme mode from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(`theme_mode_${slug}`);
        if (saved) {
            const isSavedDark = saved === "dark";
            setOverrideDark(isSavedDark);

            const root = document.documentElement;
            if (isSavedDark) {
                const darkBg = subTheme === "hearth" ? "#170907" : subTheme === "album" ? "#1c1611" : "#160f07";
                root.style.setProperty("--theme-bg", darkBg);
            } else {
                root.style.setProperty("--theme-bg", data.config?.background_color || "#3a2a13");
            }
        }
    }, [slug, data.config?.background_color, subTheme]);

    const handleThemeToggle = () => {
        const newDark = !isDark;
        setOverrideDark(newDark);
        localStorage.setItem(`theme_mode_${slug}`, newDark ? "dark" : "light");
        window.dispatchEvent(new CustomEvent("theme-change", { detail: { isDark: newDark } }));

        const root = document.documentElement;
        if (newDark) {
            const darkBg = subTheme === "hearth" ? "#170907" : subTheme === "album" ? "#1c1611" : "#160f07";
            root.style.setProperty("--theme-bg", darkBg);
        } else {
            root.style.setProperty("--theme-bg", data.config?.background_color || "#3a2a13");
        }
    };

    const familyName = profileData?.family_name || "Gia đình mình";
    const familyAvatar = profileData?.family_avatar;
    const slogan = profileData?.slogan || "Nơi có gia đình, nơi đó là nhà, là bến bờ bình yên nhất.";
    const establishedYear = profileData?.established_year || "2026";
    const title = profileData?.title || "";
    const members: FamilyMember[] = profileData?.members || [];

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Lightbox navigation
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

    // Keyboard navigation for lightbox
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

    // Swipe handlers for mobile gallery navigation
    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => {
            if (lightboxIndex !== null) nextImage();
        },
        onSwipedRight: () => {
            if (lightboxIndex !== null) prevImage();
        },
        preventScrollOnSwipe: true,
        trackMouse: false,
    });

    return (
        <div className={`min-h-screen relative pb-16 transition-colors duration-500 bg-gradient-to-b ${themeProps.bgClass} overflow-x-hidden`}>
            {/* 3D card flip & Particle animations */}
            <style dangerouslySetInnerHTML={{__html: `
                .perspective-1000 { perspective: 1000px; }
                .preserve-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }

                @keyframes float-plane {
                    0% { transform: translateY(-20px) rotate(var(--rot, 0deg)) translateX(0); opacity: 0; }
                    10% { opacity: 0.7; }
                    90% { opacity: 0.7; }
                    100% { transform: translateY(105vh) rotate(calc(var(--rot, 0deg) + 180deg)) translateX(60px); opacity: 0; }
                }
                .animate-custom-particle {
                    animation: float-plane linear infinite;
                }

                @keyframes avatar-pop-up {
                    0% { transform: translateY(100vh) scale(0.4) rotate(0deg); opacity: 0; }
                    15% { opacity: 1; }
                    50% { transform: translateY(-30vh) scale(1.1) rotate(180deg); }
                    85% { opacity: 0.8; }
                    100% { transform: translateY(100vh) scale(0.6) rotate(360deg); opacity: 0; }
                }
                .animate-thrown-avatar {
                    animation: avatar-pop-up 2.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
                }
            `}} />

            {/* Falling particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                {particles.map((p) => (
                    <div
                        key={p.id}
                        style={{
                            left: `${p.left}%`,
                            fontSize: `${p.size}px`,
                            animationDelay: `${p.delay}s`,
                            animationDuration: `${p.duration}s`,
                            '--rot': `${p.angle}deg`,
                        } as React.CSSProperties}
                        className="absolute -top-10 animate-custom-particle opacity-0"
                    >
                        {p.content}
                    </div>
                ))}
            </div>

            {/* Sticker avatar shower overlay */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
                {thrownAvatars.map((a) => (
                    <div
                        key={a.id}
                        style={{
                            left: `${a.left}%`,
                            animationDelay: `${a.delay}s`,
                        }}
                        className="absolute bottom-0 animate-thrown-avatar opacity-0 flex flex-col items-center gap-1"
                    >
                        <div className="w-14 h-14 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100">
                            {a.avatar ? (
                                <Image src={a.avatar} alt={a.name} width={56} height={56} className="object-cover w-full h-full" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xl bg-amber-100">👨‍👩‍👧‍👦</div>
                            )}
                        </div>
                        <span className="bg-black/80 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow">
                            {a.name}
                        </span>
                    </div>
                ))}
            </div>

            {/* Simulated background wood grain */}
            <div className={`absolute inset-0 pointer-events-none overflow-hidden z-0 ${themeProps.deskTextureOpacity} bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100%_4px]`} />

            {/* Theme Toggle */}
            {!isPopupOpen && (
                <button
                    onClick={handleThemeToggle}
                    className={`fixed top-4 right-16 z-30 p-3 rounded-full shadow-lg transition-all hover:scale-110 ${
                        isDark
                            ? "bg-[#25201b]/95 text-yellow-400 border border-amber-900/30 hover:bg-[#332e28]"
                            : "bg-white/95 text-amber-900 hover:bg-white border border-amber-900/10"
                    }`}
                    title={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
                >
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
            )}

            {/* Edit Button */}
            {!isPopupOpen && (
                <Link
                    href={`/${slug}/edit`}
                    className={`fixed top-4 right-4 z-30 p-2.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all border ${
                        isDark
                            ? "bg-[#25201b]/95 border-amber-900/30 text-amber-200 hover:bg-[#332e28]"
                            : "bg-[#fefefe]/95 border-amber-900/10 text-[#3a2a13] hover:bg-white"
                    }`}
                    title="Chỉnh sửa trang"
                >
                    <Settings className="w-5 h-5" />
                </Link>
            )}

            {/* Extra Decor items on PC */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 hidden lg:block opacity-75">
                {subTheme === "home" && (
                    <>
                        {/* Mug */}
                        <div className={`absolute top-12 left-12 w-20 h-20 rounded-full shadow-2xl flex items-center justify-center border-4 ${isDark ? "bg-[#28201a] border-[#3e3229]" : "bg-[#ece6e2] border-[#dacdbf]"}`}>
                            <div className="w-12 h-12 rounded-full bg-[#855430] flex items-center justify-center text-xs font-mono text-amber-100 font-semibold">
                                <Home className="w-5 h-5 animate-pulse" />
                            </div>
                        </div>
                        {/* Pinned note tag */}
                        <div className={`absolute top-24 right-16 w-36 h-36 shadow-xl rotate-[6deg] p-3 border flex flex-col justify-between ${isDark ? "bg-[#2d2722]/95 border-amber-950/30 text-slate-400" : "bg-orange-50/95 border-orange-200 text-slate-700"}`}>
                            <div className="w-3.5 h-3.5 bg-red-500 rounded-full shadow absolute -top-1.5 left-1/2 -translate-x-1/2" />
                            <p className="text-[10px] font-mono italic font-semibold">HOME: Nơi bình yên nhất! 🏡</p>
                            <span className="text-[8px] text-right text-slate-400 font-mono">{establishedYear}</span>
                        </div>
                    </>
                )}
                {subTheme === "album" && (
                    <>
                        {/* Clips and tapes */}
                        <div className="absolute top-16 left-16 w-32 h-6 bg-slate-300/40 border border-slate-400/20 rotate-[12deg] shadow-sm" />
                        <div className="absolute bottom-16 left-12 w-24 h-24 border-2 border-dashed border-amber-800/20 rotate-[-15deg] rounded" />
                        {/* Note */}
                        <div className={`absolute top-24 right-16 w-32 h-32 shadow-lg rotate-[-6deg] p-3 border flex flex-col justify-between ${isDark ? "bg-[#24211e] border-amber-900/30 text-slate-300" : "bg-yellow-50/90 border-yellow-200 text-slate-700"}`}>
                            <div className="w-3 h-3 bg-blue-500 rounded-full shadow absolute -top-1 left-1/2 -translate-x-1/2" />
                            <p className="text-[10px] font-serif italic font-bold">KỶ NIỆM: Từng khoảnh khắc bên nhau 📷</p>
                        </div>
                    </>
                )}
                {subTheme === "hearth" && (
                    <>
                        {/* Glowing ember tag */}
                        <div className="absolute top-20 left-16 w-36 h-14 bg-gradient-to-r from-orange-900/40 to-red-950/40 border border-orange-500/20 rounded-md rotate-[-8deg] shadow-lg flex items-center justify-center p-3 text-orange-300 text-[10px] font-mono uppercase tracking-widest">
                            🔥 Bếp lửa nhà ta
                        </div>
                    </>
                )}
            </div>

            {/* Hero Header */}
            <section className="relative z-10 flex flex-col items-center justify-center px-4 pt-16 pb-8 max-w-4xl mx-auto text-center">
                <div className="text-center px-4 w-full max-w-xl mx-auto">

                    {/* Polaroid Family photo */}
                    <div
                        onClick={handleThrowStickers}
                        className={`relative inline-block ${isDark ? "bg-[#25201b] border-amber-950/20 text-slate-100" : "bg-white border-slate-200 text-slate-700"} p-3 pb-6 border rounded-md shadow-2xl rotate-[-1.5deg] hover:rotate-0 transition-transform duration-300 mb-8 cursor-pointer group`}
                        title="Click để thả pháo hoa sticker gia đình! 🎉"
                    >
                        {/* Tape decoration */}
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-24 h-5 bg-yellow-100/70 border border-yellow-200/40 rotate-[1deg] shadow-xs" />

                        <div className="w-48 h-32 sm:w-64 sm:h-44 bg-slate-50 relative overflow-hidden rounded-sm border border-slate-100 mx-auto">
                            {familyAvatar ? (
                                <Image
                                    src={familyAvatar}
                                    alt={familyName}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-4xl gap-2 text-slate-400">
                                    👨‍👩‍👧‍👦
                                    <span className="text-xs font-mono font-semibold">Tải ảnh gia đình lên</span>
                                </div>
                            )}
                        </div>
                        <span className={`block font-serif italic text-sm mt-3 font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                            🏡 {familyName}
                        </span>
                    </div>

                    {/* Detail tags */}
                    {title && (
                        <p className="text-[#e2c19e] font-serif font-bold text-base sm:text-lg mb-1">
                            {title}
                        </p>
                    )}
                    <p className="text-[#e2c19e] font-serif font-semibold text-sm sm:text-base mb-2">
                        Từ {establishedYear}
                    </p>
                    <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto mb-6 italic font-serif leading-relaxed">
                        &ldquo;{slogan}&rdquo;
                    </p>

                    {/* Desk Drawer Navigation Tabs */}
                    <div className="inline-flex flex-wrap justify-center gap-2 bg-black/35 p-1.5 rounded-full border border-white/5 shadow-md">
                        {[
                            { id: "members", icon: Users, label: "Thành Viên" },
                            { id: "gallery", icon: ImageIcon, label: "Kỷ Niệm Đẹp" },
                            { id: "timeline", icon: Calendar, label: "Dòng Thời Gian" },
                            { id: "roadmap", icon: Target, label: "Ước Mơ Gia Đình" },
                            { id: "game", icon: Sparkles, label: "Đố Vui Gia Đình" },
                            { id: "letters", icon: Mail, label: "Bảng Lưu Bút" },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveSection(tab.id);
                                    setFlippedCardId(null);
                                }}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                                    activeSection === tab.id
                                        ? "text-[#3a2a13] shadow-md scale-105"
                                        : "text-slate-300 hover:text-[#e2c19e] hover:bg-white/5"
                                }`}
                                style={activeSection === tab.id ? { backgroundColor: themeProps.accentColor, color: "#fff" } : {}}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Notebook panel */}
            <main className="max-w-4xl mx-auto px-4 relative z-10">
                <div className={`rounded-3xl p-6 sm:p-8 border-t-8 border-[#dacdbf] shadow-2xl relative transition-colors duration-500 ${isDark ? "bg-[#181512] text-slate-100" : "bg-[#fcfbf9] text-slate-800"}`}>

                    {/* Ring binder spirals */}
                    <div className="absolute left-4 top-10 bottom-10 w-4 hidden md:flex flex-col justify-between pointer-events-none opacity-40 z-15">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className={`w-3.5 h-3.5 rounded-full ${isDark ? "bg-black/40 border-r border-[#181512]" : "bg-slate-900/20 border-r border-white"} flex items-center justify-center`}>
                                <div className={`w-2 h-2 rounded-full ${isDark ? "bg-amber-950/40" : "bg-[#53401c]/50"}`} />
                            </div>
                        ))}
                    </div>

                    <div className="md:pl-8">
                        {/* Member Cards Grid */}
                        {activeSection === "members" && (
                            <section className="space-y-6">
                                <h2 className="text-xl sm:text-2xl font-serif font-bold mb-2 flex items-center gap-2">
                                    <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">👨‍👩‍👧‍👦</span>
                                    Những Thành Viên Yêu Thương
                                </h2>
                                <p className={`text-xs sm:text-sm mb-6 font-serif italic ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                                    Chạm vào thẻ bài của từng người để lật mặt sau và khám phá những điều thú vị về họ nhé!
                                </p>

                                {members.length === 0 ? (
                                    <div className="text-center py-16 text-slate-400 font-serif italic">
                                        <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                        <p>Chưa có thành viên nào được thiết lập. Hãy truy cập trang Edit để tạo thẻ thành viên.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                        {members.map((member) => {
                                            const isFlipped = flippedCardId === member.id;
                                            return (
                                                <div
                                                    key={member.id}
                                                    onClick={() => setFlippedCardId(isFlipped ? null : member.id)}
                                                    className="w-full h-64 perspective-1000 cursor-pointer group"
                                                >
                                                    <div className={`relative w-full h-full duration-700 preserve-3d transition-transform ${isFlipped ? "rotate-y-180" : "md:group-hover:rotate-y-180"}`}>

                                                        {/* Front Side Card */}
                                                        <div className={`absolute inset-0 rounded-2xl border p-4 flex flex-col justify-between backface-hidden shadow-md ${
                                                            isDark ? "bg-zinc-950/40 border-zinc-800" : "bg-white border-slate-200"
                                                        }`}>
                                                            {/* Push Pin corner */}
                                                            <div className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-red-500 shadow-sm border border-red-700" />

                                                            <div className="space-y-3 pt-2">
                                                                {/* Avatar image */}
                                                                <div className="w-28 h-28 rounded-2xl mx-auto overflow-hidden border-2 border-amber-900/10 bg-slate-50 relative">
                                                                    {member.avatar ? (
                                                                        <Image src={member.avatar} alt={member.name} fill sizes="(max-width: 768px) 50vw, 200px" className="object-cover rounded-2xl" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-4xl">🧑</div>
                                                                    )}
                                                                </div>

                                                                <div className="text-center space-y-1">
                                                                    <h3 className="font-serif font-bold text-sm sm:text-base">{member.name}</h3>
                                                                    {member.role && (
                                                                        <span className="text-[10px] italic opacity-70">({member.role})</span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2 border-t pt-3 border-amber-900/5">
                                                                {member.birthday && (
                                                                    <div className="text-[10px] text-center font-serif leading-tight">
                                                                        🎂 {member.birthday}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Back Side Card */}
                                                        <div className={`absolute inset-0 rounded-2xl border p-5 flex flex-col justify-between rotate-y-180 backface-hidden shadow-lg ${
                                                            isDark ? "bg-zinc-900/90 border-amber-900/20 text-slate-100" : "bg-[#fdfbf7] border-amber-900/10 text-amber-950"
                                                        }`}
                                                            style={{ backgroundImage: "radial-gradient(#faf6ec 40%, #f3ede0 100%)" }}
                                                        >
                                                            {/* Personal Quote */}
                                                            <div className="space-y-3 pt-2">
                                                                <span className="text-[8px] font-mono tracking-wider uppercase opacity-50 block">Câu nói yêu thích</span>
                                                                <p className="text-xs italic font-serif leading-relaxed text-[#5c3a21]">
                                                                    &ldquo;{member.quote || "Gia đình là nơi cuộc sống bắt đầu..."}&rdquo;
                                                                </p>
                                                            </div>

                                                            {/* Role / birthday details */}
                                                            <div className="space-y-3 border-t pt-3 border-[#dacdbf]">
                                                                {member.role && (
                                                                    <div className="text-[10px] font-serif text-[#8c6239]">
                                                                        💛 Vai trò: {member.role}
                                                                    </div>
                                                                )}
                                                                {member.birthday && (
                                                                    <div className="flex gap-2 justify-center items-center text-[10px] font-serif text-[#8c6239]">
                                                                        <Cake className="w-3.5 h-3.5" />
                                                                        {member.birthday}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Gallery Section */}
                        {activeSection === "gallery" && (
                            <section className="space-y-6">
                                <h2 className="text-xl sm:text-2xl font-serif font-bold mb-6 flex items-center gap-2">
                                    <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">📸</span>
                                    Album Ảnh Gia Đình
                                </h2>
                                {data.galleries.length === 0 ? (
                                    <div className="text-center py-16 text-slate-400 font-serif italic">
                                        <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                        <p>Chưa có kỷ niệm ảnh nào.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {data.galleries.map((item, index) => (
                                            <div
                                                key={item.id}
                                                onClick={() => openLightbox(index)}
                                                className={`group relative aspect-square rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all hover:scale-[1.01] border ${isDark ? "bg-zinc-950/40 border-zinc-800" : "bg-slate-50 border-slate-100"}`}
                                            >
                                                <Image
                                                    src={item.image_url}
                                                    alt={item.caption || "Photo"}
                                                    fill
                                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                                {item.caption && (
                                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80 to-transparent p-3 pt-6 z-10">
                                                        <p className="text-white text-xs sm:text-sm truncate font-serif italic">{item.caption}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Timeline Section */}
                        {activeSection === "timeline" && (
                            <section className="space-y-6">
                                <h2 className="text-xl sm:text-2xl font-serif font-bold mb-2 flex items-center gap-2">
                                    <span className={`p-2 rounded-xl ${themeProps.badgeBg} ${themeProps.accentText}`}>⌛</span>
                                    Dòng Thời Gian Gia Đình
                                </h2>
                                <p className={`text-xs sm:text-sm mb-6 font-serif italic ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                                    Nhìn lại những cột mốc đáng nhớ cả nhà đã cùng nhau đi qua...
                                </p>

                                {data.timelines.length === 0 ? (
                                    <div className="text-center py-16 text-slate-400 font-serif italic">
                                        <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                        <p>Chưa có sự kiện nào được ghi nhận. Hãy truy cập trang Edit để tạo dòng thời gian.</p>
                                    </div>
                                ) : (
                                    <div className="relative pl-6 border-l-2 ml-4 space-y-8" style={{ borderColor: themeProps.accentColor }}>
                                        {data.timelines.map((event) => (
                                            <div key={event.id} className="relative animate-note-pop">
                                                {/* Connecting Dot */}
                                                <div
                                                    className={`absolute -left-[33px] top-1 w-5 h-5 rounded-full border-4 shadow-md flex items-center justify-center text-[10px] text-white transition-colors duration-300`}
                                                    style={{
                                                        backgroundColor: themeProps.accentColor,
                                                        borderColor: isDark ? "#181512" : "#fcfbf9"
                                                    }}
                                                >
                                                    🏡
                                                </div>

                                                <div className={`border rounded-2xl p-5 shadow-sm transition-all ${
                                                    isDark ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800" : "bg-[#fbfbfa] border-slate-200/50 hover:bg-[#f8f8f6]"
                                                }`}>
                                                    <div className={`text-xs font-bold mb-1 flex items-center gap-1.5 ${themeProps.accentText}`}>
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {new Date(event.date).toLocaleDateString("vi-VN", {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        })}
                                                    </div>
                                                    <h3 className="text-base sm:text-lg font-serif font-bold mb-2">
                                                        {event.title}
                                                    </h3>

                                                    {event.description && (
                                                        <p className={`text-sm leading-relaxed mb-4 whitespace-pre-wrap ${isDark ? "text-slate-300" : "text-gray-600"}`}>
                                                            {event.description}
                                                        </p>
                                                    )}

                                                    {event.image_url && (
                                                        <div className={`relative aspect-video max-w-md rounded-xl overflow-hidden shadow-inner border ${isDark ? "border-zinc-800" : "border-slate-100"}`}>
                                                            <Image src={event.image_url} alt={event.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Gói 4: Bản Đồ Ước Mơ Gia Đình */}
                        {activeSection === "roadmap" && (
                            <section className="space-y-6">
                                <h2 className="text-xl sm:text-2xl font-serif font-bold mb-2 flex items-center gap-2">
                                    <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">🎯</span>
                                    Ước Mơ & Kỷ Niệm Gia Đình
                                </h2>
                                <p className={`text-xs sm:text-sm mb-6 font-serif italic ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                    Sơ đồ những cột mốc đáng nhớ và dự định tương lai của cả nhà.
                                </p>

                                <div className="relative py-8 px-2 max-w-lg mx-auto">
                                    {/* Central connector */}
                                    <div className={`absolute left-6 md:left-1/2 top-4 bottom-4 w-0.5 border-l-2 border-dashed ${isDark ? "border-amber-700/40" : "border-amber-900/20"} -translate-x-1/2`} />

                                    <div className="space-y-12">
                                        {(profileData?.goals || [
                                            { id: "g1", title: "Ngày cả nhà sum vầy", description: "Khởi đầu cho những năm tháng yêu thương bên nhau", status: "done" },
                                            { id: "g2", title: "Chuyến du lịch đầu tiên", description: "Cả nhà cùng nhau khám phá vùng đất mới", status: "done" },
                                            { id: "g3", title: "Ngôi nhà mơ ước", description: "Cùng nhau xây dựng tổ ấm vững chắc cho tương lai", status: "todo" },
                                            { id: "g4", title: "Sum họp gia đình 2028", description: "Lịch hẹn quây quần đầy đủ các thành viên", status: "todo" }
                                        ]).map((goal: Goal, idx: number) => {
                                            const isDone = goal.status === "done";
                                            const alignmentClass = idx % 2 === 0 ? "md:flex-row-reverse" : "md:flex-row";
                                            const textAlignmentClass = idx % 2 === 0 ? "md:text-right" : "md:text-left";
                                            const offsetClass = idx % 2 === 0 ? "md:pr-10" : "md:pl-10";

                                            return (
                                                <div key={goal.id} className={`flex items-start ${alignmentClass} relative w-full`}>
                                                    {/* Node */}
                                                    <div className={`absolute left-6 md:left-1/2 w-8 h-8 rounded-full flex items-center justify-center z-10 border-4 -translate-x-1/2 transition-all duration-300 ${
                                                        isDone
                                                            ? "bg-emerald-500 border-emerald-200 text-white shadow-lg shadow-emerald-500/20"
                                                            : "bg-slate-200 border-slate-300 text-slate-500"
                                                    }`}>
                                                        {isDone ? "✓" : idx + 1}
                                                    </div>

                                                    {/* Goal info card */}
                                                    <div className={`w-full pl-12 md:pl-0 md:w-1/2 ${offsetClass}`}>
                                                        <div className={`p-5 rounded-2xl border transition-all hover:shadow-md ${
                                                            isDone
                                                                ? (isDark ? "bg-emerald-950/20 border-emerald-900/30 text-slate-100" : "bg-emerald-50/50 border-emerald-100 text-slate-800")
                                                                : (isDark ? "bg-zinc-900/40 border-zinc-800 text-slate-400" : "bg-slate-50 border-slate-100 text-slate-600")
                                                        }`}>
                                                            <div className={`flex items-center gap-2 mb-1.5 ${idx % 2 === 0 ? "md:justify-end" : "md:justify-start"}`}>
                                                                <h4 className="font-serif font-bold text-sm sm:text-base leading-tight">
                                                                    {goal.title}
                                                                </h4>
                                                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-sans font-bold uppercase ${
                                                                    isDone ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-500/10 text-slate-500"
                                                                }`}>
                                                                    {isDone ? "Đã đạt" : "Mục tiêu"}
                                                                </span>
                                                            </div>
                                                            <p className={`text-xs ${textAlignmentClass} font-serif italic`}>
                                                                {goal.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Challenges / Family Trivia Section (Gói 3) */}
                        {activeSection === "game" && (
                            <section className="space-y-6">
                                <h2 className="text-xl sm:text-2xl font-serif font-bold mb-6 flex items-center gap-2">
                                    <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">🎲</span>
                                    Thử Thách Độ Hiểu Gia Đình
                                </h2>
                                <GameSection
                                    slug={slug}
                                    quiz={profileData?.quiz}
                                    quizBadges={profileData?.quiz_badges}
                                    members={profileData?.members}
                                    familyName={familyName}
                                    isDark={isDark}
                                    accentColor={themeProps.accentColor}
                                />
                            </section>
                        )}

                        {/* LetterBox / Wish Corkboard Section (Gói 2) */}
                        {activeSection === "letters" && (
                            <section className="space-y-6">
                                <h2 className="text-xl sm:text-2xl font-serif font-bold mb-6 flex items-center gap-2">
                                    <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">✉️</span>
                                    Lưu Bút Cho Gia Đình
                                </h2>
                                <LetterBox
                                    initialLetters={data.letters}
                                    slug={slug}
                                    isDark={isDark}
                                    accentColor={themeProps.accentColor}
                                    onPopupOpenChange={setIsPopupOpen}
                                />
                            </section>
                        )}
                    </div>
                </div>
            </main>

            {/* Gallery Lightbox */}
            {lightboxIndex !== null && data.galleries[lightboxIndex] && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={closeLightbox}>
                    <div className={`rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col ${isDark ? "bg-[#181512] text-slate-100 border border-amber-900/20" : "bg-white text-gray-800"}`} onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="p-4 text-white flex-shrink-0" style={{ background: `linear-gradient(to right, ${themeProps.accentColor}, ${themeProps.accentColor}dd)` }}>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    {lightboxIndex + 1} / {data.galleries.length}
                                </span>
                                <button onClick={closeLightbox} className="hover:scale-110 transition-transform">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        {/* Image */}
                        <div {...swipeHandlers} className="flex-1 overflow-hidden flex items-center justify-center p-4 min-h-[300px]">
                            <div className="relative w-full aspect-[4/3] max-h-[55vh]">
                                <Image
                                    src={data.galleries[lightboxIndex].image_url}
                                    alt={data.galleries[lightboxIndex].caption || "Photo"}
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </div>
                        {/* Caption */}
                        {data.galleries[lightboxIndex].caption && (
                            <div className={`px-4 py-2 text-center text-sm font-serif italic ${isDark ? "text-slate-300" : "text-gray-600"}`}>
                                {data.galleries[lightboxIndex].caption}
                            </div>
                        )}
                        {/* Navigation */}
                        <div className={`flex justify-center items-center gap-4 p-4 border-t ${isDark ? "border-amber-900/20" : "border-gray-100"}`}>
                            <button
                                onClick={prevImage}
                                className={`p-2.5 rounded-full transition-all hover:scale-110 ${isDark ? "bg-amber-950/30 text-amber-400 hover:bg-amber-950/50" : "bg-amber-50 text-amber-600 hover:bg-amber-100"}`}
                                aria-label="Ảnh trước"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={nextImage}
                                className={`p-2.5 rounded-full transition-all hover:scale-110 ${isDark ? "bg-amber-950/30 text-amber-400 hover:bg-amber-950/50" : "bg-amber-50 text-amber-600 hover:bg-amber-100"}`}
                                aria-label="Ảnh tiếp theo"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Scroll To Top */}
            {showScrollTop && !isPopupOpen && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 z-30 p-3 bg-gradient-to-r from-amber-500 to-[#3a2a13] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                    style={{ backgroundColor: themeProps.accentColor }}
                >
                    <ChevronUp className="w-5 h-5" />
                </button>
            )}
        </div>
    );
}
