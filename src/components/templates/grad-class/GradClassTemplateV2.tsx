"use client";

// GradClassTemplateV2 — bản giữ nguyên implementation mới (UX roadmap) của GradClassTemplate.
// GradClassTemplate.tsx đã được rollback về đúng phiên bản trên nhánh deploy, nên mọi
// tính năng mới (game variant, night mode, hiệu ứng mới, sổ lưu bút số hoá) sống ở file V2 này.

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Link as PrismaLink, LinkConfig, Gallery, Timeline, Letter, LetterReply } from "@prisma/client";
import { Users, Calendar, Image as ImageIcon, ChevronLeft, ChevronRight, Settings, X, BookOpen } from "lucide-react";
import { GradClassLetterBox } from "./GradClassLetterBox";
import { GradClassGameSection } from "./GradClassGameSection";
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

interface GradClassTemplateV2Props {
    data: LinkWithRelations;
    slug: string;
}

interface ClassMember {
    name: string;
    role?: string;
    avatar?: string;
    quote?: string;
}

type YearbookPage = "cover" | "members" | "gallery" | "timeline" | "game" | "letters";

const PIN_COLORS = ["#ef4444", "#eab308", "#3b82f6", "#e5e7eb"];

export function GradClassTemplateV2({ data, slug }: GradClassTemplateV2Props) {
    const [currentPage, setCurrentPage] = useState<YearbookPage>("cover");
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [selectedMember, setSelectedMember] = useState<ClassMember | null>(null);
    const [isFlipping, setIsFlipping] = useState(false);
    const [flipDirection, setFlipDirection] = useState<"left" | "right">("right");
    const profileData = data.profile_data as Record<string, unknown> | null;
    const gameTemplateId = normalizeGameTemplate(data.config?.game_template ?? null);
    const { isDark, toggle: handleThemeToggle } = useThemeToggle({
        slug,
        darkBg: "#162a22",
        lightBg: "#f8fafc",
        defaultDark: true,
    });
    const { style: tokenStyle } = buildTemplateTokens({
        accentColor: data.config?.accent_color,
        fontFamily: data.config?.font_family,
    });

    const className = (profileData?.class_name as string) || "Chúng Mình";
    const schoolName = (profileData?.school_name as string) || "Trường học";
    const graduationYear = (profileData?.graduation_year as string) || "2026";
    const slogan = (profileData?.slogan as string) || "Sinh ra để cùng nhau tỏa sáng.";
    const membersCount = (profileData?.members_count as number) || 40;
    const teacherName = (profileData?.homeroom_teacher_name as string) || "Cô giáo chủ nhiệm";
    const teacherAvatar = (profileData?.homeroom_teacher_avatar as string);
    const teacherMessage = (profileData?.homeroom_teacher_message as string) || "Chúc tập thể lớp luôn giữ vững ước mơ và thành công trên con đường sắp tới!";
    const monitor = (profileData?.class_officers_monitor as string) || "Lớp trưởng";
    const viceMonitor = (profileData?.class_officers_vice_monitor as string) || "Lớp phó";

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

    const pages: { id: YearbookPage; label: string }[] = [
        { id: "cover", label: "Bìa" },
        { id: "members", label: "Thành viên" },
        { id: "gallery", label: "Ảnh" },
        { id: "timeline", label: "Kỷ niệm" },
        { id: "game", label: "Trò chơi" },
        { id: "letters", label: "Lưu bút" },
    ];

    const goToPage = (page: YearbookPage) => {
        const currentIdx = pages.findIndex(p => p.id === currentPage);
        const targetIdx = pages.findIndex(p => p.id === page);
        setFlipDirection(targetIdx > currentIdx ? "right" : "left");
        setIsFlipping(true);
        setTimeout(() => {
            setCurrentPage(page);
            setIsFlipping(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 400);
    };

    const nextPage = () => {
        const currentIdx = pages.findIndex(p => p.id === currentPage);
        if (currentIdx < pages.length - 1) goToPage(pages[currentIdx + 1].id);
    };

    const prevPage = () => {
        const currentIdx = pages.findIndex(p => p.id === currentPage);
        if (currentIdx > 0) goToPage(pages[currentIdx - 1].id);
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
            if (lightboxIndex !== null) {
                if (e.key === 'ArrowRight') nextImage();
                if (e.key === 'ArrowLeft') prevImage();
                if (e.key === 'Escape') closeLightbox();
            } else {
                if (e.key === 'ArrowRight') nextPage();
                if (e.key === 'ArrowLeft') prevPage();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex, nextImage, prevImage, currentPage]);

    const currentIdx = pages.findIndex(p => p.id === currentPage);
    const pageNumber = String(currentIdx + 1).padStart(2, "0");

    return (
        <div className={`min-h-screen relative transition-colors duration-500 ${isDark ? "bg-[#162a22]" : "bg-slate-50"}`} style={{ ...tokenStyle, fontFamily: "var(--font-display)" }}>
            <style jsx>{`
                @keyframes page-flip-right {
                    0% { transform: perspective(1200px) rotateY(0deg); }
                    100% { transform: perspective(1200px) rotateY(-90deg); }
                }
                @keyframes page-flip-left {
                    0% { transform: perspective(1200px) rotateY(0deg); }
                    100% { transform: perspective(1200px) rotateY(90deg); }
                }
                @keyframes page-appear {
                    0% { opacity: 0; transform: scale(0.98); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .page-flip-right { animation: page-flip-right 0.4s ease-in forwards; transform-origin: left center; }
                .page-flip-left { animation: page-flip-left 0.4s ease-in forwards; transform-origin: right center; }
                .page-appear { animation: page-appear 0.3s ease-out forwards; }
                @keyframes chalkDraw {
                    0% { stroke-dashoffset: 200; opacity: 0; }
                    100% { stroke-dashoffset: 0; opacity: 0.7; }
                }
                .chalk-doodle { stroke-dasharray: 200; animation: chalkDraw 1.5s ease-out 0.3s both; }

                .notebook-page {
                    border: 1px solid color-mix(in oklch, var(--accent) 25%, transparent);
                    border-radius: 10px;
                    position: relative;
                }
                .notebook-idx {
                    position: absolute;
                    top: 10px;
                    right: 14px;
                    font-size: 11px;
                    letter-spacing: 0.08em;
                    color: color-mix(in oklch, var(--accent) 70%, black);
                    font-family: 'Courier New', monospace;
                }
                .pin-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.4);
                    display: inline-block;
                }
                .roster-avatar {
                    border-radius: 50%;
                    border: 2px solid color-mix(in oklch, var(--accent) 45%, transparent);
                }
                .roster-stamp {
                    border: 3px solid currentColor;
                    padding: 4px 12px;
                    font-family: 'Courier New', monospace;
                    font-weight: bold;
                    letter-spacing: 0.15em;
                    text-transform: uppercase;
                    transform: rotate(-6deg);
                    opacity: 0.8;
                    position: relative;
                    display: inline-block;
                }
                .roster-stamp::before {
                    content: '';
                    position: absolute;
                    inset: 2px;
                    border: 1px dashed currentColor;
                    opacity: 0.5;
                }
            `}</style>

            {/* Chalk dust texture */}
            <div className={`absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-[0.05] bg-[radial-gradient(${isDark ? "#ffffff" : "#000000"}_1px,transparent_1px)] bg-[size:16px_16px]`} />

            {/* Chalk doodle accents in corners */}
            <svg className="chalk-doodle absolute top-16 left-4 w-20 h-12 pointer-events-none z-0" style={{ color: `color-mix(in oklch, var(--accent) ${isDark ? "35%" : "45%"}, transparent)` }} viewBox="0 0 80 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M4 24 Q 20 4, 40 24 T 76 24" />
                <path d="M40 24 l -4 -6 m 4 6 l -8 -2" />
                <circle cx="68" cy="14" r="3" />
            </svg>
            <svg className="chalk-doodle absolute top-20 right-4 w-16 h-16 pointer-events-none z-0" style={{ color: `color-mix(in oklch, var(--accent) ${isDark ? "35%" : "45%"}, transparent)`, animationDelay: "0.4s" }} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M32 8 l 4 12 l 12 4 l -12 4 l -4 12 l -4 -12 l -12 -4 l 12 -4 z" />
            </svg>
            <svg className="chalk-doodle absolute bottom-28 left-4 w-16 h-20 pointer-events-none z-0" style={{ color: `color-mix(in oklch, var(--accent) ${isDark ? "35%" : "45%"}, transparent)`, animationDelay: "0.7s" }} viewBox="0 0 64 80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M32 72 C 12 72, 12 48, 32 48 C 52 48, 52 72, 32 72 Z" />
                <path d="M32 48 V 32 M 26 38 H 38" />
            </svg>

            {/* Top Bar */}
            <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-2">
                    <div
                        className={`rounded-full shadow-lg border ${isDark ? "bg-white/95" : "bg-[#162a22]"}`}
                        style={{ color: "var(--accent)", borderColor: "color-mix(in oklch, var(--accent) 30%, transparent)" }}
                    >
                        <ThemeToggleButton
                            isDark={isDark}
                            onToggle={handleThemeToggle}
                            className="p-2.5 rounded-full transition-all hover:scale-110 block"
                        />
                    </div>
                    <Link
                        href={`/${slug}/edit`}
                        className={`p-2.5 rounded-full shadow-lg transition-all hover:scale-110 border ${isDark ? "bg-white/95" : "bg-[#162a22]"}`}
                        style={{ color: "var(--accent)", borderColor: "color-mix(in oklch, var(--accent) 30%, transparent)" }}
                    >
                        <Settings className="w-4 h-4" />
                    </Link>
                </div>
                {/* Page indicator */}
                <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${isDark ? "bg-white/90" : "bg-[#162a22]"}`}
                    style={{ color: "var(--accent)" }}
                >
                    <BookOpen className="w-3.5 h-3.5" />
                    {currentIdx + 1} / {pages.length}
                </div>
            </div>

            {/* Page Navigation Tabs (bottom) */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30">
                <div className={`flex items-center gap-1 p-1.5 rounded-2xl border backdrop-blur-md ${isDark ? "bg-white/95" : "bg-[#162a22]/95"}`} style={{ borderColor: "color-mix(in oklch, var(--accent) 25%, transparent)" }}>
                    <button onClick={prevPage} disabled={currentIdx === 0} className="p-2 rounded-lg transition-all disabled:opacity-30" style={{ color: isDark ? "var(--accent)" : "white" }}>
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    {pages.map((page) => {
                        const isActive = currentPage === page.id;
                        return (
                            <button
                                key={page.id}
                                onClick={() => goToPage(page.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!isActive ? (isDark ? "hover:bg-black/5" : "text-white/70 hover:text-white") : ""}`}
                                style={isActive ? { backgroundColor: "var(--accent)", color: "white" } : { color: isDark ? "color-mix(in oklch, var(--accent) 70%, black)" : undefined }}
                            >
                                {page.label}
                            </button>
                        );
                    })}
                    <button onClick={nextPage} disabled={currentIdx === pages.length - 1} className="p-2 rounded-lg transition-all disabled:opacity-30" style={{ color: isDark ? "var(--accent)" : "white" }}>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Yearbook Pages Container */}
            <div className="pt-14 pb-24 px-4 max-w-3xl mx-auto min-h-screen flex items-center justify-center">
                <div className={`w-full rounded-2xl shadow-2xl overflow-hidden ${isFlipping ? (flipDirection === "right" ? "page-flip-right" : "page-flip-left") : "page-appear"}`}>
                    {/* Book spine decoration */}
                    <div className="h-2" style={{ background: "linear-gradient(to right, var(--accent), color-mix(in oklch, var(--accent) 50%, #000), var(--accent))" }} />

                    {/* Page Content */}
                    <div className={`p-6 sm:p-10 relative notebook-page ${isDark ? "bg-[#faf8f5] text-slate-800" : "bg-[#fefcf9] text-slate-800"}`}>
                        <span className="notebook-idx">TRANG {pageNumber}</span>
                        {/* Page texture */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[repeating-linear-gradient(0deg,transparent,transparent_28px,rgba(0,0,0,0.1)_28px,rgba(0,0,0,0.1)_29px)]" />

                        {/* COVER PAGE */}
                        {currentPage === "cover" && (
                            <div className="text-center space-y-6 py-6">
                                <p className="text-xs font-mono tracking-widest uppercase" style={{ color: "color-mix(in oklch, var(--accent) 70%, black)" }}>Class of</p>
                                <h1 className="text-3xl sm:text-4xl font-black -mt-4" style={{ fontFamily: "var(--font-display)", color: "var(--accent)" }}>{graduationYear}</h1>

                                <div className="roster-stamp" style={{ color: "var(--accent)" }}>
                                    Graduated ✓
                                </div>

                                <div className="space-y-2">
                                    <h1 className="text-3xl sm:text-4xl font-black text-slate-800" style={{ fontFamily: "var(--font-display)" }}>{className}</h1>
                                    <p className="text-base text-slate-600 font-medium">{schoolName}</p>
                                </div>
                                <div className="w-24 h-1 mx-auto rounded-full" style={{ background: "var(--accent)" }} />
                                <p className="italic text-slate-500 max-w-md mx-auto text-base font-serif">&ldquo;{slogan}&rdquo;</p>

                                {/* Teacher Card - minimal notebook card */}
                                <div className="max-w-sm mx-auto mt-6 relative">
                                    <div className="rounded-lg p-5 text-left relative border" style={{ borderColor: "color-mix(in oklch, var(--accent) 25%, transparent)", background: "color-mix(in oklch, var(--accent) 5%, white)" }}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0">
                                                {teacherAvatar ? (
                                                    <Image src={teacherAvatar} alt={teacherName} width={56} height={56} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xl" style={{ background: "color-mix(in oklch, var(--accent) 15%, transparent)" }}>👩‍🏫</div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-600 font-medium">GVCN</p>
                                                <p className="font-bold text-slate-800">{teacherName}</p>
                                            </div>
                                        </div>
                                        <p className="mt-3 text-sm italic text-slate-700">&ldquo;{teacherMessage}&rdquo;</p>
                                    </div>
                                </div>

                                <div className="flex justify-center gap-4 text-sm text-slate-500">
                                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {membersCount} thành viên</span>
                                    <span className="flex items-center gap-1"><ImageIcon className="w-4 h-4" /> {data.galleries.length} ảnh</span>
                                </div>

                                <button
                                    onClick={() => goToPage("members")}
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all hover:scale-105 text-white"
                                    style={{ background: "var(--accent)" }}
                                >
                                    Mở Yearbook <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* MEMBERS PAGE */}
                        {currentPage === "members" && (
                            <div className="space-y-6">
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-black text-slate-800" style={{ fontFamily: "var(--font-display)" }}>Danh Sách Lớp</h2>
                                    <p className="text-sm text-slate-500">{members.length} thành viên</p>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                                    {members.map((member, idx) => {
                                        const pinColor = PIN_COLORS[idx % PIN_COLORS.length];
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedMember(member)}
                                                className="group text-center relative flex flex-col items-center gap-2"
                                            >
                                                <div className="relative">
                                                    <div className="roster-avatar relative mx-auto w-20 h-20 overflow-hidden shadow-md group-hover:shadow-lg transition-all group-hover:scale-105 bg-white">
                                                        {member.avatar ? (
                                                            <Image src={member.avatar} alt={member.name} fill className="object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-slate-400" style={{ background: "color-mix(in oklch, var(--accent) 12%, transparent)" }}>
                                                                {member.name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="pin-dot absolute -top-1 -right-1" style={{ background: pinColor }} />
                                                </div>
                                                <p className="text-xs font-bold text-slate-800 truncate">{member.name}</p>
                                                {member.role && <p className="text-[10px] text-slate-500">{member.role}</p>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* GALLERY PAGE */}
                        {currentPage === "gallery" && (
                            <div className="space-y-6">
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-black text-slate-800" style={{ fontFamily: "var(--font-display)" }}>Khoảnh Khắc Đáng Nhớ</h2>
                                    <p className="text-sm text-slate-500">{data.galleries.length} ảnh</p>
                                </div>
                                {data.galleries.length === 0 ? (
                                    <div className="text-center py-16 text-slate-400">
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
                                                    className={`${rotations[index % 4]} hover:rotate-0 transition-all duration-300 cursor-pointer group relative`}
                                                >
                                                    <span className="pin-dot absolute -top-1.5 left-1/2 -translate-x-1/2 z-10" style={{ background: PIN_COLORS[index % PIN_COLORS.length] }} />
                                                    <div className="bg-white p-2 pb-4 rounded-lg shadow-md hover:shadow-xl border" style={{ borderColor: "color-mix(in oklch, var(--accent) 15%, transparent)" }}>
                                                        <div className="relative aspect-square rounded overflow-hidden">
                                                            <Image src={item.image_url} alt={item.caption || "Memory"} fill className="object-cover" />
                                                        </div>
                                                        {item.caption && <p className="text-center text-xs mt-2 text-slate-600 truncate font-serif italic">{item.caption}</p>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TIMELINE PAGE */}
                        {currentPage === "timeline" && (
                            <div className="space-y-6">
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-black text-slate-800" style={{ fontFamily: "var(--font-display)" }}>Kỷ Niệm Đáng Nhớ</h2>
                                </div>
                                {data.timelines.length === 0 ? (
                                    <div className="text-center py-16 text-slate-400">
                                        <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                        <p>Chưa có kỷ niệm nào...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {data.timelines.map((event) => (
                                            <div key={event.id} className="p-5 rounded-xl border-l-4" style={{ borderColor: "var(--accent)", background: "color-mix(in oklch, var(--accent) 6%, transparent)" }}>
                                                <div className="text-xs font-bold mb-1" style={{ color: "color-mix(in oklch, var(--accent) 75%, black)" }}>
                                                    {new Date(event.date).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" })}
                                                </div>
                                                <h3 className="font-bold text-lg text-slate-800 mb-2" style={{ fontFamily: "var(--font-display)" }}>{event.title}</h3>
                                                {event.description && <p className="text-sm text-slate-600 leading-relaxed">{event.description}</p>}
                                                {event.image_url && (
                                                    <div className="mt-3 rounded-lg overflow-hidden max-w-xs shadow-md">
                                                        <Image src={event.image_url} alt={event.title} width={300} height={200} className="w-full h-auto" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* GAME PAGE */}
                        {currentPage === "game" && (
                            <div className="space-y-4">
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-black text-slate-800" style={{ fontFamily: "var(--font-display)" }}>Trò Chơi Lớp</h2>
                                </div>
                                {gameTemplateId === "A" ? (
                                    <GradClassGameSection isDark={isDark} />
                                ) : (
                                    <TemplateVariantGame
                                        linkType={data.type}
                                        variantId={gameTemplateId}
                                        profileData={data.profile_data as Record<string, unknown> | null}
                                        photos={data.galleries.map(g => ({ id: g.id, url: g.image_url, caption: g.caption }))}
                                        timelines={data.timelines.map(t => ({ id: t.id, title: t.title, description: t.description }))}
                                        isDark={isDark}
                                    />
                                )}
                            </div>
                        )}

                        {/* LETTERS PAGE */}
                        {currentPage === "letters" && (
                            <div className="space-y-4">
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-black text-slate-800" style={{ fontFamily: "var(--font-display)" }}>Lưu Bút</h2>
                                </div>
                                <GradClassLetterBox slug={slug} initialLetters={data.letters} isDark={isDark} />
                            </div>
                        )}
                    </div>

                    {/* Page number footer */}
                    <div className={`px-6 py-3 flex items-center justify-between text-xs ${isDark ? "bg-[#f5f3f0] text-slate-500" : "bg-[#faf8f5] text-slate-400"}`}>
                        <span>{className} • {graduationYear}</span>
                        <span>Trang {currentIdx + 1}</span>
                    </div>
                </div>
            </div>

            {/* Member Modal */}
            {selectedMember && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedMember(null)}>
                    <div className={`max-w-sm w-full rounded-2xl shadow-2xl overflow-hidden ${isDark ? "bg-[#faf8f5]" : "bg-white"}`} onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 text-center" style={{ background: "color-mix(in oklch, var(--accent) 8%, transparent)" }}>
                            <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg">
                                {selectedMember.avatar ? (
                                    <Image src={selectedMember.avatar} alt={selectedMember.name} width={96} height={96} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-500" style={{ background: "color-mix(in oklch, var(--accent) 20%, transparent)" }}>
                                        {selectedMember.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <h3 className="mt-3 text-xl font-bold text-slate-800" style={{ fontFamily: "var(--font-display)" }}>{selectedMember.name}</h3>
                            {selectedMember.role && <p className="text-sm font-medium" style={{ color: "var(--accent)" }}>{selectedMember.role}</p>}
                        </div>
                        {selectedMember.quote && (
                            <div className="p-5">
                                <div className="rounded-lg p-4 border" style={{ borderColor: "color-mix(in oklch, var(--accent) 25%, transparent)" }}>
                                    <p className="italic text-slate-700 text-center font-serif">&ldquo;{selectedMember.quote}&rdquo;</p>
                                </div>
                            </div>
                        )}
                        <div className="p-4 flex justify-center">
                            <button onClick={() => setSelectedMember(null)} className="px-6 py-2 rounded-full bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors">Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lightbox */}
            {lightboxIndex !== null && data.galleries[lightboxIndex] && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeLightbox}>
                    <div className="rounded-xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col bg-white text-slate-800" onClick={(e) => e.stopPropagation()}>
                        <div className="p-3 text-white flex-shrink-0" style={{ background: "var(--accent)" }}>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{lightboxIndex + 1} / {data.galleries.length}</span>
                                <button onClick={closeLightbox} className="hover:scale-110 transition-transform"><X className="w-5 h-5" /></button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden flex items-center justify-center p-4 min-h-[300px]">
                            <div className="relative w-full aspect-[4/3] max-h-[55vh]">
                                <Image src={data.galleries[lightboxIndex].image_url} alt={data.galleries[lightboxIndex].caption || "Photo"} fill className="object-contain" priority />
                            </div>
                        </div>
                        {data.galleries[lightboxIndex].caption && (
                            <div className="px-4 py-2 text-center text-sm text-slate-600">{data.galleries[lightboxIndex].caption}</div>
                        )}
                        <div className="flex justify-center items-center gap-4 p-3 border-t border-slate-200">
                            <button onClick={prevImage} className="p-2 rounded-lg transition-all" style={{ background: "color-mix(in oklch, var(--accent) 12%, transparent)", color: "var(--accent)" }}><ChevronLeft className="w-5 h-5" /></button>
                            <button onClick={nextImage} className="p-2 rounded-lg transition-all" style={{ background: "color-mix(in oklch, var(--accent) 12%, transparent)", color: "var(--accent)" }}><ChevronRight className="w-5 h-5" /></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
