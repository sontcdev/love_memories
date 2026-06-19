"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Link as PrismaLink, LinkConfig, Gallery, Timeline, Letter, LetterReply } from "@prisma/client";
import { Users, Calendar, Image as ImageIcon, Mail, ChevronUp, Settings, Sparkles, X, Pin, Sun, Moon } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import { GameSection } from "./GameSection";
import { LetterBox } from "./LetterBox";
import { GalleryLightbox } from "@/components/templates/shared/GalleryLightbox";
import { formatDate } from "@/lib/date-utils";

type LetterWithReplies = Letter & { replies: LetterReply[] };

type LinkWithRelations = PrismaLink & {
    config: LinkConfig | null;
    galleries: Gallery[];
    timelines: Timeline[];
    letters: LetterWithReplies[];
};

interface GradClassTemplateProps {
    data: LinkWithRelations;
    slug: string;
}

interface ClassMember {
    name: string;
    role?: string;
    avatar?: string;
    quote?: string;
}

export function GradClassTemplate({ data, slug }: GradClassTemplateProps) {
    const [activeSection, setActiveSection] = useState<string>("members");
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [selectedMember, setSelectedMember] = useState<ClassMember | null>(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const profileData = data.profile_data as Record<string, unknown> | null;
    const [overrideDark, setOverrideDark] = useState<boolean | null>(null);

    // Read from localStorage and apply on mount
    useEffect(() => {
        const saved = localStorage.getItem(`theme_mode_${slug}`);
        if (saved) {
            const isSavedDark = saved === "dark";
            setOverrideDark(isSavedDark);
            
            const root = document.documentElement;
            if (isSavedDark) {
                root.style.setProperty("--theme-bg", "#162a22");
            } else {
                root.style.setProperty("--theme-bg", "#f8fafc");
            }
        }
    }, [slug]);

    const isDark = overrideDark !== null ? overrideDark : true;

    const handleThemeToggle = () => {
        const newDark = !isDark;
        setOverrideDark(newDark);
        localStorage.setItem(`theme_mode_${slug}`, newDark ? "dark" : "light");
        window.dispatchEvent(new CustomEvent("theme-change", { detail: { isDark: newDark } }));
        
        const root = document.documentElement;
        if (newDark) {
            root.style.setProperty("--theme-bg", "#162a22");
        } else {
            root.style.setProperty("--theme-bg", "#f8fafc");
        }
    };

    const className = (profileData?.class_name as string) || "Tập thể lớp";
    const schoolName = (profileData?.school_name as string) || "Trường học";
    const graduationYear = (profileData?.graduation_year as string) || "2026";
    const slogan = (profileData?.slogan as string) || "Sinh ra để cùng nhau tỏa sáng.";
    const membersCount = (profileData?.members_count as number) || 40;

    // Homeroom Teacher info
    const teacherName = (profileData?.homeroom_teacher_name as string) || "Cô giáo chủ nhiệm";
    const teacherAvatar = (profileData?.homeroom_teacher_avatar as string);
    const teacherMessage = (profileData?.homeroom_teacher_message as string) || "Chúc tập thể lớp luôn giữ vững ước mơ và thành công trên con đường sắp tới!";

    // Class Officers info
    const monitor = (profileData?.class_officers_monitor as string) || "Lớp trưởng";
    const viceMonitor = (profileData?.class_officers_vice_monitor as string) || "Lớp phó";

    // Mock members fallback
    const mockMembers: ClassMember[] = [
        { name: monitor, role: "Lớp trưởng", avatar: "", quote: "Mọi người nộp quỹ lớp giùm mình nha! 💸" },
        { name: viceMonitor, role: "Lớp phó học tập", avatar: "", quote: "Hôm nay ai chưa làm bài tập tự giác đứng lên nhé! 📚" },
        { name: "Nguyễn Văn A", role: "Cây hài của lớp", avatar: "", quote: "Ở đâu có tôi, ở đó có tiếng cười. Hì hì 😆" },
        { name: "Trần Thị B", role: "Bí thư chi đoàn", avatar: "", quote: "Bất biến giữa dòng đời vạn biến. ✨" },
        { name: "Lê Văn C", role: "Trùm thể thao", avatar: "", quote: "Sức khỏe là vàng, thể thao dẹp tan lười biếng! ⚽" },
        { name: "Phạm Thị D", role: "Cây văn nghệ", avatar: "", quote: "Đời là một bài hát, hãy hát lên thật vang! 🎤" },
        { name: "Hoàng Văn E", role: "Trùm ngủ gật", avatar: "", quote: "Ngủ là một nghệ thuật và người ngủ gật là một nghệ sĩ. 😴" },
        { name: "Vũ Thị F", role: "Nhiếp ảnh gia", avatar: "", quote: "Lưu giữ khoảnh khắc bằng trái tim và ống kính. 📸" },
    ];

    const members: ClassMember[] = (profileData?.members as ClassMember[]) || mockMembers;

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

    const openLightbox = (index: number) => { setLightboxIndex(index); setIsPopupOpen(true); };
    const closeLightbox = () => { setLightboxIndex(null); setIsPopupOpen(false); };
    const openMemberModal = (member: ClassMember) => { setSelectedMember(member); setIsPopupOpen(true); };
    const closeMemberModal = () => { setSelectedMember(null); setIsPopupOpen(false); };

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
        <div className={`min-h-screen relative pb-16 transition-colors duration-500 ${isDark ? "bg-[#162a22]" : "bg-slate-50"}`}>
            {/* Chalk dust and blackboard grid style */}
            <div className={`absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-[0.05] bg-[radial-gradient(${isDark ? "#ffffff" : "#000000"}_1px,transparent_1px)] bg-[size:16px_16px]`} />

            {/* Theme Toggle Button */}
            {!isPopupOpen && (
                <button
                    onClick={handleThemeToggle}
                    className={`fixed top-4 right-16 z-30 p-3 rounded-full shadow-lg transition-all hover:scale-110 ${
                        isDark 
                            ? "bg-white/95 text-emerald-900 border border-slate-200 hover:bg-white" 
                            : "bg-[#162a22] text-yellow-400 border border-emerald-800 hover:bg-[#1f3a2f]"
                    }`}
                    title={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
                >
                    {isDark ? (
                        <Sun className="w-5 h-5" />
                    ) : (
                        <Moon className="w-5 h-5" />
                    )}
                </button>
            )}

            {/* Edit Button */}
            {!isPopupOpen && (
                <Link
                    href={`/${slug}/edit`}
                    className={`fixed top-4 right-4 z-30 p-2.5 rounded-full shadow-lg hover:shadow-xl transition-all border ${
                        isDark 
                            ? "bg-[#fefefe]/95 border-slate-200 text-[#162a22] hover:bg-white" 
                            : "bg-[#162a22] border-emerald-800/20 text-white hover:bg-[#1f3a2f]"
                    }`}
                    title="Chỉnh sửa trang"
                    aria-label="Chỉnh sửa trang"
                >
                    <Settings className="w-5 h-5" />
                </Link>
            )}

            {/* Blackboard Header */}
            <section className="relative z-10 flex flex-col items-center justify-center px-4 pt-16 pb-8 max-w-4xl mx-auto text-center">
                {/* Chalkboard frame border style */}
                <div className={`border-8 rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-2xl relative transition-colors duration-500 ${
                    isDark 
                        ? "border-[#5c3a21] bg-[#0c1c16]" 
                        : "border-slate-400 bg-white"
                }`}>
                    {/* Chalk writing header */}
                    <div className="space-y-3 font-serif">
                        <span className={`text-xs uppercase tracking-widest font-mono ${isDark ? "text-[#a8d3ba]/60" : "text-slate-400"}`}>★ CLASS YEARBOOK ★</span>
                        <h1 className={`text-4xl sm:text-5xl font-bold tracking-wide border-b border-dashed pb-4 transition-colors ${
                            isDark ? "text-white border-[#a8d3ba]/20" : "text-slate-800 border-slate-200"
                        }`}>
                            TẬP THỂ LỚP {className}
                        </h1>
                        <p className={`font-medium text-sm sm:text-base transition-colors ${
                            isDark ? "text-[#a8d3ba]" : "text-slate-600"
                        }`}>
                            Niên khóa {graduationYear} • Trường {schoolName} • Sĩ số: {membersCount} thành viên
                        </p>
                        <div className={`relative inline-block max-w-md mt-4 p-4 border rounded-xl transition-colors ${
                            isDark ? "border-[#a8d3ba]/10 bg-black/10 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-600"
                        }`}>
                            {/* Doodles style chalkboard slogan */}
                            <p className="italic text-sm font-light">
                                &ldquo;{slogan}&rdquo;
                            </p>
                        </div>
                    </div>
                </div>

                {/* Chalk navigation tab menu */}
                <div className={`inline-flex flex-wrap justify-center gap-2 mt-8 p-1.5 rounded-full border shadow-md transition-colors ${
                    isDark ? "bg-black/30 border-white/5" : "bg-white border-slate-200"
                }`}>
                    {[
                        { id: "members", icon: Users, label: "Thành Viên" },
                        { id: "gallery", icon: ImageIcon, label: "Bảng Ghim Lớp" },
                        { id: "timeline", icon: Calendar, label: "Nhật Ký Lớp" },
                        { id: "game", icon: Sparkles, label: "Câu Đố" },
                        { id: "letters", icon: Mail, label: "Lưu Bút Lớp" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSection(tab.id)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                                activeSection === tab.id
                                    ? isDark
                                        ? "bg-white text-[#162a22] shadow-md scale-105"
                                        : "bg-[#162a22] text-white shadow-md scale-105"
                                    : isDark
                                        ? "text-slate-300 hover:text-white hover:bg-white/10"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            }`}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* Content display */}
            <main className="max-w-5xl mx-auto px-4 relative z-10">
                
                {/* 1. Members / Directory Section */}
                {activeSection === "members" && (
                    <div className="space-y-8">
                        {/* Homeroom Teacher Message Board (Styled like teacher desk blackboard) */}
                        <section className={`border-4 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row gap-6 items-center md:items-start transition-colors duration-500 ${
                            isDark ? "bg-[#0c1c16] border-[#5c3a21] text-white" : "bg-white border-slate-300 text-slate-800"
                        }`}>
                            <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden p-1 border-2 flex-shrink-0 relative ${
                                isDark ? "bg-[#162a22] border-white/15" : "bg-slate-100 border-slate-200"
                            }`}>
                                {teacherAvatar ? (
                                    <Image src={teacherAvatar} alt={teacherName} width={112} height={112} className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                    <div className="w-full h-full rounded-xl bg-slate-900 flex items-center justify-center text-3xl font-bold">👩‍🏫</div>
                                )}
                            </div>
                            <div className="flex-1 text-center md:text-left space-y-2">
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    isDark ? "bg-[#a8d3ba]/10 text-[#a8d3ba]" : "bg-emerald-50 text-emerald-700"
                                }`}>
                                    Giáo Viên Chủ Nhiệm
                                </span>
                                <h3 className="text-lg sm:text-xl font-serif font-bold">{teacherName}</h3>
                                <p className={`text-sm italic font-serif leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                                    &ldquo;{teacherMessage}&rdquo;
                                </p>
                            </div>
                        </section>

                        {/* Members 3D Flip Card Grid */}
                        <section className={`rounded-3xl p-6 sm:p-8 shadow-2xl border transition-colors duration-500 ${
                            isDark ? "bg-[#0c1c16]/50 border-emerald-950/20 text-white" : "bg-white border-slate-100 text-slate-800"
                        }`}>
                            <h2 className={`text-xl sm:text-2xl font-serif font-bold mb-6 flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                                <span className="text-xl">🎓</span> Kỷ Yếu Thành Viên
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {members.map((member, index) => (
                                    <div
                                        key={index}
                                        onClick={() => openMemberModal(member)}
                                        className="group h-44 [perspective:1000px] cursor-pointer"
                                    >
                                        <div className="relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                                            {/* Card Front */}
                                            <div className={`absolute inset-0 border rounded-2xl p-4 flex flex-col items-center justify-center text-center [backface-visibility:hidden] shadow-sm transition-colors duration-300 ${
                                                isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-[#fbfbfa] border-slate-200 text-slate-800"
                                            }`}>
                                                <div className={`w-16 h-16 rounded-full p-0.5 mb-3 relative overflow-hidden ${isDark ? "bg-zinc-800" : "bg-slate-200"}`}>
                                                    {member.avatar ? (
                                                        <Image src={member.avatar} alt={member.name} fill sizes="80px" className="object-cover rounded-full" />
                                                    ) : (
                                                        <div className="w-full h-full bg-white flex items-center justify-center text-lg font-bold text-slate-400 rounded-full">
                                                            {member.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <h4 className={`font-bold text-sm truncate w-full ${isDark ? "text-slate-200" : "text-slate-800"}`}>{member.name}</h4>
                                                {member.role && (
                                                    <p className={`text-[9px] font-semibold mt-1 uppercase tracking-wider ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                                                        {member.role}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Card Back (Flipped) */}
                                            <div className={`absolute inset-0 border rounded-2xl p-4 flex flex-col items-center justify-center text-center [transform:rotateY(180deg)] [backface-visibility:hidden] shadow-md transition-colors duration-300 ${
                                                isDark ? "bg-[#0c1c16] text-white border-[#a8d3ba]/10" : "bg-slate-100 text-slate-800 border-slate-200"
                                            }`}>
                                                <h4 className={`font-bold text-xs mb-1.5 ${isDark ? "text-[#a8d3ba]" : "text-emerald-700"}`}>{member.name}</h4>
                                                {member.quote ? (
                                                    <p className={`text-[10px] italic font-serif leading-relaxed line-clamp-4 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                                                        &ldquo;{member.quote}&rdquo;
                                                    </p>
                                                ) : (
                                                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Ban cán sự</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {/* 2. Corkboard Class Gallery */}
                {activeSection === "gallery" && (
                    <section className="bg-[#b3865c] border-8 border-[#4e2f18] rounded-[2rem] p-6 sm:p-8 shadow-2xl relative">
                        {/* Cork pattern mock */}
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none z-0" />
                        
                        <h2 className="text-2xl font-serif font-bold text-white text-center mb-8 flex items-center justify-center gap-2 relative z-10">
                            <span className="text-xl">📌</span> Bảng Ghim Ảnh Lớp
                        </h2>
                        {data.galleries.length === 0 ? (
                            <div className="text-center py-16 text-white/70 relative z-10">
                                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p>Bảng ghim ảnh hiện đang trống...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 relative z-10">
                                {data.galleries.map((item, index) => {
                                    // Random skew rotation for a ginned look
                                    const rotations = ["rotate-[-2deg]", "rotate-[3deg]", "rotate-[-1deg]", "rotate-[2deg]"];
                                    const rotClass = rotations[index % rotations.length];
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => openLightbox(index)}
                                            className={`bg-white p-3 pb-6 rounded-md shadow-lg hover:shadow-xl hover:scale-102 hover:rotate-0 transition-all duration-300 cursor-pointer ${rotClass} relative`}
                                        >
                                            {/* Push pin icon */}
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 text-red-500 hover:scale-110 active:scale-90 transition-transform">
                                                <Pin className="w-6 h-6 fill-red-500 drop-shadow-md" />
                                            </div>
                                            
                                            <div className="aspect-square relative overflow-hidden bg-slate-50 border border-slate-100 rounded-sm">
                                                <Image src={item.image_url} alt={item.caption || "Class moment"} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
                                            </div>
                                            
                                            {item.caption && (
                                                <p className="text-center text-slate-700 font-mono text-[10px] sm:text-xs mt-3 truncate px-1 border-t border-dashed border-slate-100 pt-2">
                                                    {item.caption}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                )}

                {/* 3. Class Timeline */}
                {activeSection === "timeline" && (
                    <section className={`rounded-3xl p-6 sm:p-8 border shadow-2xl transition-colors duration-500 ${
                        isDark ? "bg-[#0c1c16]/50 border-emerald-950/20 text-white" : "bg-white border-slate-100 text-slate-800"
                    }`}>
                        <h2 className={`text-2xl font-serif font-bold text-center mb-8 flex items-center justify-center gap-2 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                            <span className="text-xl">⌛</span> Hành Trình Lớp Chúng Mình
                        </h2>
                        {data.timelines.length === 0 ? (
                            <div className="text-center py-16 text-slate-400">
                                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                <p>Hành trình lớp học chưa lưu sự kiện nào.</p>
                            </div>
                        ) : (
                            <div className="relative pl-6 border-l-2 border-emerald-500 ml-4 space-y-8">
                                {data.timelines.map((event) => (
                                    <div key={event.id} className="relative animate-fade-in">
                                        {/* School Graduation Cap connector dot */}
                                        <div className={`absolute -left-[33px] top-1 w-5 h-5 rounded-full bg-emerald-500 border-4 shadow-md flex items-center justify-center text-[10px] text-white transition-colors duration-300 ${
                                            isDark ? "border-[#0c1c16]" : "border-white"
                                        }`}>
                                            🎓
                                        </div>

                                        <div className={`border rounded-2xl p-5 shadow-sm transition-all ${
                                            isDark ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800" : "bg-[#fbfbfa] border-slate-200/50 hover:bg-[#f8f8f6]"
                                        }`}>
                                            <div className={`text-xs font-bold mb-1 flex items-center gap-1.5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                                                <Calendar className="w-3.5 h-3.5" />
                                                {formatDate(event.date, {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </div>
                                            <h3 className={`text-base sm:text-lg font-serif font-bold mb-2 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                                                {event.title}
                                            </h3>
                                            
                                            {event.description && (
                                                <p className={`text-sm leading-relaxed mb-4 whitespace-pre-wrap ${isDark ? "text-slate-300" : "text-slate-600"}`}>
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

                {/* 4. Game Section */}
                {activeSection === "game" && (
                    <section className={`rounded-3xl p-6 sm:p-8 border shadow-2xl transition-colors duration-500 ${
                        isDark ? "bg-[#0c1c16]/50 border-emerald-950/20 text-white" : "bg-white border-slate-100 text-slate-800"
                    }`}>
                        <h2 className={`text-2xl font-serif font-bold text-center mb-6 flex items-center justify-center gap-2 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                            <span className="text-xl">🎲</span> Thử Thách Lớp Học
                        </h2>
                        <GameSection theme="every" isDark={isDark} />
                    </section>
                )}

                {/* 5. Wish Wall / Letterbox */}
                {activeSection === "letters" && (
                    <section className={`rounded-3xl p-6 sm:p-8 border shadow-2xl transition-colors duration-500 ${
                        isDark ? "bg-[#0c1c16]/50 border-emerald-950/20 text-white" : "bg-white border-slate-100 text-slate-800"
                    }`}>
                        <h2 className={`text-2xl font-serif font-bold text-center mb-2 flex items-center justify-center gap-2 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                            <span className="text-xl">✉️</span> Bảng Lời Chúc Học Đường
                        </h2>
                        <p className={`text-xs sm:text-sm text-center mb-6 max-w-sm mx-auto ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                            Viết những lời lưu bút ý nghĩa và nhắn nhủ thân thương tới tập thể lớp {className}.
                        </p>
                        <LetterBox initialLetters={data.letters} slug={slug} theme="every" isDark={isDark} onPopupOpenChange={setIsPopupOpen} />
                    </section>
                )}
            </main>

            {/* Member Profile Modal Popup (Flip card fallback details) */}
            {selectedMember && (
                <div
                    className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
                    onClick={closeMemberModal}
                >
                    <div
                        className={`rounded-3xl max-w-sm w-full p-6 relative border shadow-2xl transition-colors duration-300 ${
                            isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-emerald-50 text-slate-800"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                            <button
                                onClick={closeMemberModal}
                                className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors ${
                                    isDark ? "hover:bg-zinc-800 text-zinc-400" : "hover:bg-slate-100 text-slate-400"
                                }`}
                            >
                                <X className="w-5 h-5" />
                            </button>

                        <div className="text-center space-y-4">
                            <div className={`w-20 h-20 rounded-full p-0.5 mx-auto relative overflow-hidden shadow-md ${isDark ? "bg-zinc-800" : "bg-slate-100"}`}>
                                {selectedMember.avatar ? (
                                    <Image src={selectedMember.avatar} alt={selectedMember.name} fill sizes="120px" className="object-cover rounded-full" />
                                ) : (
                                    <div className={`w-full h-full rounded-full bg-white flex items-center justify-center text-2xl font-bold ${
                                        isDark ? "text-emerald-400" : "text-emerald-500"
                                    }`}>
                                        {selectedMember.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className={`text-lg font-serif font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>{selectedMember.name}</h3>
                                {selectedMember.role && (
                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-1 uppercase tracking-wider ${
                                        isDark ? "bg-emerald-950/30 text-emerald-300" : "bg-[#a8d3ba]/10 text-emerald-700"
                                    }`}>
                                        {selectedMember.role}
                                    </span>
                                )}
                            </div>
                            {selectedMember.quote && (
                                <p className={`text-sm font-serif italic py-2 border-t ${
                                    isDark ? "text-slate-300 border-zinc-800" : "text-slate-600 border-slate-100"
                                }`}>
                                    &ldquo;{selectedMember.quote}&rdquo;
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <GalleryLightbox
                isOpen={lightboxIndex !== null && !!data.galleries[lightboxIndex]}
                currentIndex={lightboxIndex ?? 0}
                images={data.galleries}
                onClose={closeLightbox}
                onPrev={prevImage}
                onNext={nextImage}
                headerClass="bg-gradient-to-r from-emerald-600 to-emerald-800"
                cardClass={isDark ? "bg-[#0c1c16] text-white border border-emerald-800/30" : "bg-white text-gray-800"}
                navClass={isDark ? "bg-emerald-950/30 text-emerald-400 hover:bg-emerald-950/50" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}
                borderClass={isDark ? "border-emerald-800/30" : "border-gray-100"}
                captionClass={isDark ? "text-slate-300" : "text-gray-600"}
                swipeHandlers={swipeHandlers}
            />

            {/* Scroll to Top */}
            {showScrollTop && !isPopupOpen && (
                <button
                    onClick={scrollToTop}
                    className={`fixed bottom-6 right-6 z-30 p-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all ${
                        isDark ? "bg-white text-[#162a22]" : "bg-[#162a22] text-white"
                    }`}
                    title="Lên đầu trang"
                    aria-label="Lên đầu trang"
                >
                    <ChevronUp className="w-5 h-5" />
                </button>
            )}
        </div>
    );
}
