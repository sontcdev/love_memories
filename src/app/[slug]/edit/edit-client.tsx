"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Link as PrismaLink, LinkConfig, Gallery, Timeline, Letter } from "@prisma/client";
import { EditProfileForm } from "@/components/edit/EditProfileForm";
import { EditConfigForm } from "@/components/edit/EditConfigForm";
import { EditIdolConfigForm } from "@/components/edit/EditIdolConfigForm";
import { GalleryManager } from "@/components/edit/GalleryManager";
import { TimelineManager } from "@/components/edit/TimelineManager";
import {
    User,
    Image as ImageIcon,
    Calendar,
    Settings,
    ArrowLeft,
    ChevronRight,
    Sun,
    Moon,
    Copy,
    Check,
    QrCode
} from "lucide-react";
import QRCode from "react-qr-code";

type LinkWithRelations = PrismaLink & {
    config: LinkConfig | null;
    galleries: Gallery[];
    timelines: Timeline[];
    letters: Letter[];
};

interface EditPageClientProps {
    slug: string;
    linkData: LinkWithRelations;
}

type TabId = "profile" | "gallery" | "timeline" | "settings";

const TABS: { id: TabId; label: string; icon: typeof User; description: string }[] = [
    { id: "profile", label: "Thông tin chung", icon: User, description: "Cập nhật thông tin hồ sơ" },
    { id: "gallery", label: "Thư viện ảnh", icon: ImageIcon, description: "Quản lý ảnh của bạn" },
    { id: "timeline", label: "Dòng thời gian", icon: Calendar, description: "Chỉnh sửa câu chuyện" },
    { id: "settings", label: "Cài đặt", icon: Settings, description: "Tùy chỉnh màu sắc và nhạc" },
];

export function EditPageClient({ slug, linkData }: EditPageClientProps) {
    const [activeTab, setActiveTab] = useState<TabId>("profile");
    const isIdol = linkData.type === "IDOL";
    const isGrad = linkData.type === "GRAD_PERSONAL" || linkData.type === "GRAD_CLASS" || linkData.type === "GRAD_GROUP";

    let gradTheme = "emerald";
    if (linkData.type === "GRAD_CLASS") {
        gradTheme = "chalkboard";
    } else if (linkData.type === "GRAD_GROUP") {
        const profileData = linkData.profile_data as Record<string, unknown> | null;
        gradTheme = (profileData?.theme as string) || "caravan";
    }

    const [overrideDark, setOverrideDark] = useState<boolean | null>(null);
    const [copied, setCopied] = useState(false);
    const [fullUrl, setFullUrl] = useState(`https://love-memories.com/${slug}`);

    useEffect(() => {
        setFullUrl(`${window.location.origin}/${slug}`);
    }, [slug]);

    const handleCopyLink = async () => {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
            try {
                await navigator.clipboard.writeText(fullUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                return;
            } catch (err) {
                console.error("Failed to copy using navigator.clipboard", err);
            }
        }
        
        // Fallback for non-secure origins or unsupported browsers
        try {
            const textArea = document.createElement("textarea");
            textArea.value = fullUrl;
            // Avoid scrolling to bottom
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.position = "fixed";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const successful = document.execCommand("copy");
            document.body.removeChild(textArea);
            if (successful) {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } else {
                console.error("Fallback copy was unsuccessful");
            }
        } catch (err) {
            console.error("Fallback copy failed", err);
        }
    };

    // Read from localStorage on mount
    useEffect(() => {
        if (!isIdol && !isGrad) return;
        const saved = localStorage.getItem(`theme_mode_${slug}`);
        if (saved) {
            const isSavedDark = saved === "dark";
            setOverrideDark(isSavedDark);
            
            const root = document.documentElement;
            if (isSavedDark) {
                root.style.setProperty("--theme-bg", "#0f0f12");
            } else {
                root.style.setProperty("--theme-bg", linkData.config?.background_color || "#ffffff");
            }
        }
    }, [slug, isIdol, isGrad, linkData.config?.background_color]);

    const isDarkBackground = useCallback((hex?: string | null) => {
        if (!hex) return false;
        const color = hex.replace("#", "");
        if (color.length !== 6) return false;
        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness < 120; // threshold for dark backgrounds
    }, []);

    const isDark = (isIdol || isGrad) && (overrideDark !== null ? overrideDark : isDarkBackground(linkData.config?.background_color));

    const handleThemeToggle = () => {
        const newDark = !isDark;
        setOverrideDark(newDark);
        localStorage.setItem(`theme_mode_${slug}`, newDark ? "dark" : "light");
        window.dispatchEvent(new CustomEvent("theme-change", { detail: { isDark: newDark } }));
        
        const root = document.documentElement;
        if (newDark) {
            root.style.setProperty("--theme-bg", "#0f0f12");
        } else {
            root.style.setProperty("--theme-bg", linkData.config?.background_color || "#ffffff");
        }
    };

    // Themed styles setup
    let wrapperClass = `min-h-screen relative overflow-x-hidden transition-colors duration-500 ${isDark ? "bg-[#0a0a0c] text-white" : "bg-gray-50 text-gray-800"}`;
    let containerClass = `rounded-3xl border transition-all duration-500 overflow-hidden ${
        isDark 
            ? "bg-slate-900/85 border-purple-500/20 shadow-[0_0_40px_rgba(168,85,247,0.15)] text-white backdrop-blur-sm" 
            : "bg-white border-gray-100 shadow-xl text-gray-800"
    }`;
    let sidebarClass = `w-full md:w-72 shrink-0 p-4 md:p-6 flex flex-col gap-6 md:border-r transition-all ${
        isDark ? "border-purple-500/25 bg-slate-950/20" : "border-gray-100 bg-gray-50/30"
    }`;
    let mainClass = "flex-1 p-4 sm:p-6 md:p-8";
    
    let headerClass = `sticky top-0 z-20 border-b transition-all ${
        isDark 
            ? "bg-slate-950/80 border-purple-900/30 backdrop-blur-md" 
            : "bg-white border-gray-200 shadow-sm"
    }`;
    
    let headerTextClass = isDark ? "text-white" : "text-gray-800";
    let headerBackLinkClass = isDark ? "hover:bg-slate-800 text-purple-400" : "hover:bg-gray-100 text-gray-600";
    let headerViewLinkClass = isDark ? "text-purple-300 hover:text-white" : "text-gray-600 hover:text-gray-800";

    if (isGrad) {
        if (gradTheme === "emerald") {
            if (isDark) {
                wrapperClass = "min-h-screen relative overflow-x-hidden bg-[#150f0b] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,40,32,0.6),rgba(0,0,0,0.8))] py-6";
                containerClass = "rounded-3xl border-4 border-[#1c1511] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden bg-[#24352f] text-emerald-100 max-w-6xl mx-auto";
                sidebarClass = "w-full md:w-72 shrink-0 p-4 md:p-6 flex flex-col gap-6 md:border-r-2 md:border-[#10201a] bg-[#0f1d19] text-emerald-200 relative";
                mainClass = "flex-1 p-4 sm:p-6 md:p-8 bg-[#24352f] bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_2.5rem] text-emerald-100 relative shadow-inner";
                headerClass = "sticky top-0 z-20 border-b border-[#12241d] bg-[#0f1d19] text-emerald-200";
            } else {
                wrapperClass = "min-h-screen relative overflow-x-hidden bg-[#2d1f18] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] py-6";
                containerClass = "rounded-3xl border-4 border-[#3e2b20] shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden bg-[#faf6ee] text-slate-800 max-w-6xl mx-auto";
                sidebarClass = "w-full md:w-72 shrink-0 p-4 md:p-6 flex flex-col gap-6 md:border-r-2 md:border-[#1a3028]/20 bg-[#1c352d] text-emerald-100 relative";
                mainClass = "flex-1 p-4 sm:p-6 md:p-8 bg-[#faf6ee] bg-[linear-gradient(rgba(36,74,60,0.03)_1px,transparent_1px)] bg-[size:100%_2.5rem] text-slate-800 relative shadow-inner";
                headerClass = "sticky top-0 z-20 border-b border-[#12241d] bg-[#1c352d] text-emerald-100";
            }
            headerTextClass = "text-current";
            headerBackLinkClass = "hover:bg-black/10 text-current";
            headerViewLinkClass = "text-current opacity-80 hover:opacity-100";
        } else if (gradTheme === "chalkboard") {
            if (isDark) {
                wrapperClass = "min-h-screen relative overflow-x-hidden bg-[#1a0f0b] py-6";
                containerClass = "rounded-3xl border-4 border-[#0c0503] shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden bg-[#0b120f] text-[#a5c0b0] max-w-6xl mx-auto";
                sidebarClass = "w-full md:w-72 shrink-0 p-4 md:p-6 flex flex-col gap-6 md:border-r-2 md:border-[#070b09] bg-[#182024] text-slate-300 relative";
                mainClass = "flex-1 p-4 sm:p-6 md:p-8 bg-[#0b120f] bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] text-[#a5c0b0] relative shadow-inner";
                headerClass = "sticky top-0 z-20 border-b border-[#070b09] bg-[#182024] text-slate-300";
            } else {
                wrapperClass = "min-h-screen relative overflow-x-hidden bg-[#3e2723] bg-gradient-to-b from-[#2d1a12] to-[#3e2723] py-6";
                containerClass = "rounded-3xl border-4 border-[#1e100b] shadow-[0_20px_50px_rgba(0,0,0,0.7)] overflow-hidden bg-[#131f1a] text-[#f4f7f6] max-w-6xl mx-auto";
                sidebarClass = "w-full md:w-72 shrink-0 p-4 md:p-6 flex flex-col gap-6 md:border-r-2 md:border-[#0c1411] bg-[#263238] text-slate-200 relative";
                mainClass = "flex-1 p-4 sm:p-6 md:p-8 bg-[#131f1a] bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] text-[#f4f7f6] relative shadow-inner";
                headerClass = "sticky top-0 z-20 border-b border-[#0c1411] bg-[#263238] text-slate-200";
            }
            headerTextClass = "text-current";
            headerBackLinkClass = "hover:bg-black/10 text-current";
            headerViewLinkClass = "text-current opacity-80 hover:opacity-100";
        } else if (gradTheme === "caravan") {
            if (isDark) {
                wrapperClass = "min-h-screen relative overflow-x-hidden bg-[#120a05] py-6";
                containerClass = "rounded-3xl border-4 border-[#3a2517] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden bg-[#2d1b10] text-[#f2e6d9] max-w-6xl mx-auto";
                sidebarClass = "w-full md:w-72 shrink-0 p-4 md:p-6 flex flex-col gap-6 md:border-r-2 md:border-[#1d1008] bg-[#4a3525] text-orange-200 relative";
                mainClass = "flex-1 p-4 sm:p-6 md:p-8 bg-[#2d1b10] bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_2.5rem] text-[#f2e6d9] relative shadow-inner";
                headerClass = "sticky top-0 z-20 border-b border-[#1d1008] bg-[#4a3525] text-orange-200";
            } else {
                wrapperClass = "min-h-screen relative overflow-x-hidden bg-[#27150c] bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.2)_1px,transparent_1px)] py-6";
                containerClass = "rounded-3xl border-4 border-[#543b27] shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden bg-[#faf4e8] text-amber-950 max-w-6xl mx-auto";
                sidebarClass = "w-full md:w-72 shrink-0 p-4 md:p-6 flex flex-col gap-6 md:border-r-2 md:border-[#543b27]/20 bg-[#7a5c43] text-orange-50 relative";
                mainClass = "flex-1 p-4 sm:p-6 md:p-8 bg-[#faf4e8] bg-[linear-gradient(rgba(84,59,39,0.03)_1px,transparent_1px)] bg-[size:100%_2.5rem] text-amber-950 relative shadow-inner";
                headerClass = "sticky top-0 z-20 border-b border-[#543b27]/20 bg-[#7a5c43] text-orange-50";
            }
            headerTextClass = "text-current";
            headerBackLinkClass = "hover:bg-black/10 text-current";
            headerViewLinkClass = "text-current opacity-80 hover:opacity-100";
        } else if (gradTheme === "scrapbook") {
            if (isDark) {
                wrapperClass = "min-h-screen relative overflow-x-hidden bg-[#1e1c18] py-6";
                containerClass = "rounded-3xl border-4 border-[#7a0c3a] shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden bg-[#2b2b2b] text-slate-100 max-w-6xl mx-auto";
                sidebarClass = "w-full md:w-72 shrink-0 p-4 md:p-6 flex flex-col gap-6 md:border-r-2 md:border-[#1a1a1a] bg-[#880e4f] text-pink-100 relative";
                mainClass = "flex-1 p-4 sm:p-6 md:p-8 bg-[#2b2b2b] bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_2.5rem] text-slate-100 relative shadow-inner";
                headerClass = "sticky top-0 z-20 border-b border-[#1a1a1a] bg-[#880e4f] text-pink-100";
            } else {
                wrapperClass = "min-h-screen relative overflow-x-hidden bg-[#f0e6d2] bg-[radial-gradient(#d3c5a7_1px,transparent_1px)] [background-size:24px_24px] py-6";
                containerClass = "rounded-3xl border-4 border-[#ad1457] shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden bg-white text-slate-800 max-w-6xl mx-auto";
                sidebarClass = "w-full md:w-72 shrink-0 p-4 md:p-6 flex flex-col gap-6 md:border-r-2 md:border-pink-200 bg-[#d81b60] text-pink-50 relative";
                mainClass = "flex-1 p-4 sm:p-6 md:p-8 bg-white bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:100%_2.5rem] text-slate-800 relative shadow-inner";
                headerClass = "sticky top-0 z-20 border-b border-pink-200 bg-[#d81b60] text-pink-50";
            }
            headerTextClass = "text-current";
            headerBackLinkClass = "hover:bg-black/10 text-current";
            headerViewLinkClass = "text-current opacity-80 hover:opacity-100";
        } else { // station theme
            if (isDark) {
                wrapperClass = "min-h-screen relative overflow-x-hidden bg-[#05070a] py-6";
                containerClass = "rounded-3xl border-4 border-[#10161c] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden bg-[#182026] text-slate-200 max-w-6xl mx-auto";
                sidebarClass = "w-full md:w-72 shrink-0 p-4 md:p-6 flex flex-col gap-6 md:border-r-2 md:border-[#10161c] bg-[#1b252f] text-blue-200 relative";
                mainClass = "flex-1 p-4 sm:p-6 md:p-8 bg-[#182026] bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:2rem_2rem] text-slate-200 relative shadow-inner";
                headerClass = "sticky top-0 z-20 border-b border-[#10161c] bg-[#1b252f] text-blue-200";
            } else {
                wrapperClass = "min-h-screen relative overflow-x-hidden bg-[#0d131a] bg-gradient-to-tr from-[#060a0f] to-[#141d26] py-6";
                containerClass = "rounded-3xl border-4 border-[#1a252f] shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden bg-[#f4f7f6] text-slate-800 max-w-6xl mx-auto";
                sidebarClass = "w-full md:w-72 shrink-0 p-4 md:p-6 flex flex-col gap-6 md:border-r-2 md:border-slate-300 bg-[#2c3e50] text-blue-50 relative";
                mainClass = "flex-1 p-4 sm:p-6 md:p-8 bg-[#f4f7f6] bg-[linear-gradient(rgba(44,62,80,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(44,62,80,0.03)_1px,transparent_1px)] bg-[size:2rem_2rem] text-slate-800 relative shadow-inner";
                headerClass = "sticky top-0 z-20 border-b border-slate-300 bg-[#2c3e50] text-blue-50";
            }
            headerTextClass = "text-current";
            headerBackLinkClass = "hover:bg-black/10 text-current";
            headerViewLinkClass = "text-current opacity-80 hover:opacity-100";
        }
    }

    return (
        <div className={wrapperClass}
            style={isIdol ? { backgroundColor: 'var(--theme-bg, #fff0f5)' } : {}}
        >
            {/* Holographic Stage Backdrop Elements (concert theme) */}
            {isIdol && (
                <>
                    {/* Neon grid pattern */}
                    <div className={`absolute inset-0 z-0 pointer-events-none opacity-[0.25] ${isDark ? 'cyber-grid' : 'cyber-grid-light'}`} />
                    
                    {/* Laser beams */}
                    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                        <div className="laser-beam-1" />
                        <div className="laser-beam-2" />
                    </div>

                    {/* Floating Bokeh Bubbles */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
                        <div className={`bokeh-bubble w-[350px] h-[350px] top-[10%] left-[-5%] ${isDark ? "bg-purple-600/10" : "bg-purple-300/20"}`} style={{ animationDuration: '25s' }} />
                        <div className={`bokeh-bubble w-[400px] h-[400px] bottom-[10%] right-[-5%] ${isDark ? "bg-pink-500/10" : "bg-pink-300/20"}`} style={{ animationDuration: '30s', animationDelay: '-5s' }} />
                        <div className={`bokeh-bubble w-[250px] h-[250px] top-[50%] left-[60%] ${isDark ? "bg-cyan-500/5" : "bg-cyan-300/15"}`} style={{ animationDuration: '20s', animationDelay: '-10s' }} />
                    </div>
                </>
            )}

            {/* Header */}
            <header className={headerClass}>
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/${slug}`}
                            className={`p-2 rounded-lg transition-colors ${headerBackLinkClass}`}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className={`text-xl font-bold ${headerTextClass}`}>Chỉnh sửa trang</h1>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {(isIdol || isGrad) && (
                            <button
                                onClick={handleThemeToggle}
                                className={`p-2 rounded-lg transition-all hover:scale-105 ${
                                    isDark 
                                        ? isGrad
                                            ? "bg-black/20 text-yellow-400 border border-yellow-500/30"
                                            : "bg-slate-900 text-yellow-400 border border-purple-500/30" 
                                        : isGrad
                                            ? "bg-white/20 text-amber-600 border border-amber-600/30 hover:bg-white/30"
                                            : "bg-white text-indigo-600 border border-gray-200 hover:bg-gray-50"
                                }`}
                                title={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
                            >
                                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                        )}
                        <Link
                            href={`/${slug}`}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${headerViewLinkClass}`}
                        >
                            Xem trang
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main content body */}
            <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 md:py-8 relative z-10">
                {/* Unified Card Container (Dashboard Panel layout) */}
                <div className={containerClass}>
                    <div className="flex flex-col md:flex-row min-h-[600px] relative">
                        {isGrad && (
                            <div className="hidden md:flex absolute left-72 top-0 bottom-0 w-0 z-20 flex-col justify-around py-8 pointer-events-none">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <div key={i} className="w-8 h-4 -translate-x-1/2 bg-gradient-to-r from-gray-300 via-gray-100 to-gray-400 rounded-full shadow-lg border border-gray-400/85 flex items-center justify-between">
                                        <div className="w-1.5 h-1.5 bg-gray-600/50 rounded-full ml-1" />
                                        <div className="w-1.5 h-1.5 bg-gray-600/50 rounded-full mr-1" />
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* Left Column (Sidebar Panel) */}
                        <aside className={sidebarClass}>
                            <nav className="grid grid-cols-2 md:flex md:flex-col gap-2">
                                {TABS.map((tab) => {
                                    const isActive = activeTab === tab.id;
                                    let tabBtnClass = `flex items-center gap-2 md:gap-3 px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-left transition-all ${
                                        isActive
                                            ? isDark
                                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-purple-400/25"
                                                : "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                                            : isDark
                                                ? "text-purple-300 hover:bg-slate-800/80"
                                                : "text-gray-600 hover:bg-gray-50"
                                    }`;

                                    if (isGrad) {
                                        if (gradTheme === "emerald") {
                                            tabBtnClass = `flex items-center gap-2 md:gap-3 px-3 py-2.5 md:px-4 md:py-3 rounded-l-xl text-left transition-all md:rounded-r-none md:-mr-6 ${
                                                isActive
                                                    ? "bg-[#faf6ee] text-emerald-900 font-bold border-y border-l border-emerald-900/20 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] relative z-10"
                                                    : "text-emerald-100 hover:bg-[#152822]"
                                            }`;
                                            if (isDark && isActive) {
                                                tabBtnClass = `flex items-center gap-2 md:gap-3 px-3 py-2.5 md:px-4 md:py-3 rounded-l-xl text-left transition-all md:rounded-r-none md:-mr-6 bg-[#24352f] text-emerald-200 font-bold border-y border-l border-[#10201a]/30 shadow-[-4px_0_10px_rgba(0,0,0,0.15)] relative z-10`;
                                            }
                                        } else if (gradTheme === "chalkboard") {
                                            tabBtnClass = `flex items-center gap-2 md:gap-3 px-3 py-2.5 md:px-4 md:py-3 rounded-l-xl text-left transition-all md:rounded-r-none md:-mr-6 ${
                                                isActive
                                                    ? isDark
                                                        ? "bg-[#0b120f] text-[#a5c0b0] font-bold border-y border-l border-[#070b09]/30 shadow-[-4px_0_10px_rgba(0,0,0,0.2)] relative z-10"
                                                        : "bg-[#131f1a] text-emerald-400 font-bold border-y border-l border-emerald-950/20 shadow-[-4px_0_10px_rgba(0,0,0,0.15)] relative z-10"
                                                    : "text-slate-300 hover:bg-[#1e2d25]"
                                            }`;
                                        } else if (gradTheme === "caravan") {
                                            tabBtnClass = `flex items-center gap-2 md:gap-3 px-3 py-2.5 md:px-4 md:py-3 rounded-l-xl text-left transition-all md:rounded-r-none md:-mr-6 ${
                                                isActive
                                                    ? isDark
                                                        ? "bg-[#2d1b10] text-[#f2e6d9] font-bold border-y border-l border-[#1d1008]/30 shadow-[-4px_0_10px_rgba(0,0,0,0.15)] relative z-10"
                                                        : "bg-[#faf4e8] text-[#543b27] font-bold border-y border-l border-[#543b27]/20 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] relative z-10"
                                                    : "text-orange-100 hover:bg-[#644933]"
                                            }`;
                                        } else if (gradTheme === "scrapbook") {
                                            tabBtnClass = `flex items-center gap-2 md:gap-3 px-3 py-2.5 md:px-4 md:py-3 rounded-l-xl text-left transition-all md:rounded-r-none md:-mr-6 ${
                                                isActive
                                                    ? isDark
                                                        ? "bg-[#2b2b2b] text-pink-200 font-bold border-y border-l border-[#1a1a1a]/30 shadow-[-4px_0_10px_rgba(0,0,0,0.15)] relative z-10"
                                                        : "bg-white text-[#d81b60] font-bold border-y border-l border-pink-100 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] relative z-10"
                                                    : "text-pink-100 hover:bg-[#c2185b]"
                                            }`;
                                        } else { // station theme
                                            tabBtnClass = `flex items-center gap-2 md:gap-3 px-3 py-2.5 md:px-4 md:py-3 rounded-l-xl text-left transition-all md:rounded-r-none md:-mr-6 ${
                                                isActive
                                                    ? isDark
                                                        ? "bg-[#182026] text-blue-200 font-bold border-y border-l border-[#10161c]/30 shadow-[-4px_0_10px_rgba(0,0,0,0.15)] relative z-10"
                                                        : "bg-[#f4f7f6] text-blue-900 font-bold border-y border-l border-blue-100 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] relative z-10"
                                                    : "text-blue-100 hover:bg-[#202d3b]"
                                            }`;
                                        }
                                    }

                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={tabBtnClass}
                                        >
                                            <tab.icon className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-xs md:text-sm truncate">{tab.label}</div>
                                                {isActive && (
                                                    <div className="hidden md:block text-xs opacity-90 mt-0.5">{tab.description}</div>
                                                )}
                                            </div>
                                            {isActive && (
                                                <ChevronRight className="hidden md:block w-4 h-4 shrink-0" />
                                            )}
                                        </button>
                                    );
                                })}
                            </nav>

                            {/* Page Status / QR Code Widget (Desktop sidebar space filler) */}
                            {(isIdol || isGrad) && (
                                <div className={`hidden md:flex flex-col gap-4 p-4 rounded-2xl border transition-all ${
                                    isDark 
                                        ? isGrad
                                            ? "bg-black/25 border-white/5"
                                            : "bg-slate-950/40 border-purple-500/10" 
                                        : isGrad
                                            ? "bg-white/40 border-black/5"
                                            : "bg-white border-gray-200/60 shadow-sm"
                                }`}>
                                    <div className="flex items-center gap-2 border-b pb-2" style={isDark ? { borderColor: 'rgba(255,255,255,0.05)' } : { borderColor: 'rgba(0,0,0,0.05)' }}>
                                        <QrCode className={`w-4 h-4 ${isDark ? isGrad ? "text-yellow-400" : "text-purple-400" : "text-purple-600"}`} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-85">Trạng thái trang</span>
                                    </div>
                                    
                                    {/* URL slug & Copy Link */}
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] opacity-70">Đường dẫn trang của bạn:</p>
                                        <div className={`flex items-center gap-1 p-1.5 rounded-lg text-[10px] font-mono break-all ${isDark ? "bg-black/30 text-slate-300" : "bg-white/60 text-gray-700 border border-black/5"}`}>
                                            <span className="flex-1 truncate select-all">{fullUrl}</span>
                                            <button 
                                                onClick={handleCopyLink}
                                                className={`p-1 rounded transition-colors ${isDark ? "bg-black/20 hover:bg-black/40 text-slate-300" : "bg-white hover:bg-gray-100 text-gray-600 border border-gray-200"}`}
                                                title="Sao chép liên kết"
                                            >
                                                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* QR Code preview */}
                                    <div className="flex flex-col items-center gap-2 py-1.5 border-t" style={isDark ? { borderColor: 'rgba(255,255,255,0.05)' } : { borderColor: 'rgba(0,0,0,0.05)' }}>
                                        <div className={`p-2.5 rounded-xl ${isDark ? "bg-white/95" : "bg-white border border-gray-100 shadow-sm"}`}>
                                            <QRCode
                                                value={fullUrl}
                                                size={110}
                                                level="M"
                                                fgColor="#0f0f12"
                                                bgColor="#ffffff"
                                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                            />
                                        </div>
                                        <span className="text-[9px] text-center opacity-60">Quét bằng điện thoại để xem trực tiếp</span>
                                    </div>
                                </div>
                            )}
                        </aside>

                        {/* Right Column (Forms Content Panel) */}
                        <main className={mainClass}>
                            {activeTab === "profile" && (
                                <EditProfileForm
                                    slug={slug}
                                    linkType={linkData.type}
                                    initialData={linkData.profile_data as Record<string, unknown>}
                                    isDark={isDark}
                                />
                            )}

                            {activeTab === "gallery" && (
                                <GalleryManager
                                    slug={slug}
                                    initialGallery={linkData.galleries}
                                    isDark={isDark}
                                />
                            )}

                            {activeTab === "timeline" && (
                                <TimelineManager
                                    slug={slug}
                                    initialTimeline={linkData.timelines}
                                    isDark={isDark}
                                />
                            )}

                            {activeTab === "settings" && (
                                linkData.type === "IDOL" ? (
                                    <EditIdolConfigForm
                                        slug={slug}
                                        initialConfig={linkData.config ? {
                                            background_color: linkData.config.background_color ?? undefined,
                                            accent_color: linkData.config.accent_color ?? undefined,
                                            text_color: linkData.config.text_color ?? undefined,
                                            font_family: linkData.config.font_family ?? undefined,
                                            music_url: linkData.config.music_url ?? undefined,
                                            auto_play: linkData.config.auto_play,
                                        } : null}
                                        isDark={isDark}
                                    />
                                ) : (
                                    <EditConfigForm
                                        slug={slug}
                                        initialConfig={linkData.config ? {
                                            background_color: linkData.config.background_color ?? undefined,
                                            accent_color: linkData.config.accent_color ?? undefined,
                                            text_color: linkData.config.text_color ?? undefined,
                                            font_family: linkData.config.font_family ?? undefined,
                                            music_url: linkData.config.music_url ?? undefined,
                                            auto_play: linkData.config.auto_play,
                                        } : null}
                                    />
                                )
                            )}
                        </main>
                    </div>
                </div>

                {/* Page Status / QR Code Widget (Only visible on mobile at the bottom to avoid blocking form) */}
                {(isIdol || isGrad) && (
                    <div className={`md:hidden mt-6 p-4 rounded-3xl border transition-all ${
                        isDark 
                            ? isGrad
                                ? "bg-black/25 border-white/5 text-slate-100 shadow-lg"
                                : "bg-slate-900/85 border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.1)] text-white backdrop-blur-sm" 
                            : isGrad
                                ? "bg-white/40 border-black/5 text-slate-800 shadow-md"
                                : "bg-white border-gray-100 shadow-lg text-gray-800"
                    }`}>
                        <div className="flex items-center gap-2 border-b pb-2 mb-3" style={isDark ? { borderColor: 'rgba(255,255,255,0.05)' } : { borderColor: 'rgba(0,0,0,0.05)' }}>
                            <QrCode className={`w-4 h-4 ${isDark ? isGrad ? "text-yellow-400" : "text-purple-500" : "text-purple-600"}`} />
                            <span className="text-xs font-bold uppercase tracking-wider opacity-85">Trạng thái trang</span>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="flex-1 w-full space-y-2">
                                <p className="text-xs opacity-75">Đường dẫn xem trang của bạn:</p>
                                <div className={`flex items-center gap-1.5 p-2 rounded-lg text-xs font-mono break-all ${isDark ? "bg-black/30 text-slate-300" : "bg-white/60 text-gray-700 border border-black/5"}`}>
                                    <span className="flex-1 truncate select-all">{fullUrl}</span>
                                    <button 
                                        onClick={handleCopyLink}
                                        className={`p-1.5 rounded transition-all ${isDark ? "bg-black/20 hover:bg-black/40 text-slate-300" : "bg-white hover:bg-gray-100 text-gray-600 border border-gray-200"}`}
                                    >
                                        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>
                            <div className="shrink-0 flex flex-col items-center gap-1">
                                <div className={`p-2 rounded-xl ${isDark ? "bg-white/95" : "bg-white border shadow-sm"}`}>
                                    <QRCode
                                        value={fullUrl}
                                        size={90}
                                        level="M"
                                        fgColor="#0f0f12"
                                        bgColor="#ffffff"
                                    />
                                </div>
                                <span className="text-[9px] opacity-60">Quét bằng điện thoại để xem trực tiếp</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <style jsx>{`
                /* Cyber Grid Overlay */
                .cyber-grid {
                    background-size: 40px 40px;
                    background-image: 
                        linear-gradient(to right, rgba(168, 85, 247, 0.04) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(168, 85, 247, 0.04) 1px, transparent 1px);
                }
                .cyber-grid-light {
                    background-size: 40px 40px;
                    background-image: 
                        linear-gradient(to right, rgba(168, 85, 247, 0.02) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(168, 85, 247, 0.02) 1px, transparent 1px);
                }

                /* Stage Laser Light Lines */
                .laser-beam-1 {
                    position: absolute;
                    top: -10%;
                    left: 10%;
                    width: 2px;
                    height: 120%;
                    background: linear-gradient(to bottom, transparent, rgba(168, 85, 247, 0.15), transparent);
                    transform: rotate(35deg);
                    filter: blur(2px);
                    animation: sweep 12s infinite alternate ease-in-out;
                }
                .laser-beam-2 {
                    position: absolute;
                    top: -10%;
                    right: 15%;
                    width: 2px;
                    height: 120%;
                    background: linear-gradient(to bottom, transparent, rgba(236, 72, 153, 0.15), transparent);
                    transform: rotate(-35deg);
                    filter: blur(2px);
                    animation: sweep-reverse 15s infinite alternate ease-in-out;
                }

                @keyframes sweep {
                    0% { transform: rotate(30deg) translate(-20px, 0); opacity: 0.3; }
                    50% { opacity: 0.8; }
                    100% { transform: rotate(40deg) translate(20px, 0); opacity: 0.3; }
                }

                @keyframes sweep-reverse {
                    0% { transform: rotate(-40deg) translate(20px, 0); opacity: 0.3; }
                    50% { opacity: 0.8; }
                    100% { transform: rotate(-30deg) translate(-20px, 0); opacity: 0.3; }
                }

                /* Floating Bokeh Lights */
                .bokeh-bubble {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(40px);
                    mix-blend-mode: screen;
                    animation: float 20s infinite alternate ease-in-out;
                }

                @keyframes float {
                    0% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(40px, -60px) scale(1.2); }
                    100% { transform: translate(-30px, 40px) scale(0.9); }
                }
            `}</style>
        </div>
    );
}


