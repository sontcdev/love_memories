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
        if (!isIdol) return;
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
    }, [slug, isIdol, linkData.config?.background_color]);

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

    const isDark = isIdol && (overrideDark !== null ? overrideDark : isDarkBackground(linkData.config?.background_color));

    const handleThemeToggle = () => {
        const newDark = !isDark;
        setOverrideDark(newDark);
        localStorage.setItem(`theme_mode_${slug}`, newDark ? "dark" : "light");
        
        const root = document.documentElement;
        if (newDark) {
            root.style.setProperty("--theme-bg", "#0f0f12");
        } else {
            root.style.setProperty("--theme-bg", linkData.config?.background_color || "#ffffff");
        }
    };

    return (
        <div className={`min-h-screen relative overflow-x-hidden transition-colors duration-500 ${isDark ? "bg-[#0a0a0c] text-white" : "bg-gray-50 text-gray-800"}`}
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
            <header className={`sticky top-0 z-20 border-b transition-all ${
                isDark 
                    ? "bg-slate-950/80 border-purple-900/30 backdrop-blur-md" 
                    : "bg-white border-gray-200 shadow-sm"
            }`}>
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/${slug}`}
                            className={`p-2 rounded-lg transition-colors ${
                                isDark ? "hover:bg-slate-800 text-purple-400" : "hover:bg-gray-100 text-gray-600"
                            }`}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>Chỉnh sửa trang</h1>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {isIdol && (
                            <button
                                onClick={handleThemeToggle}
                                className={`p-2 rounded-lg transition-all hover:scale-105 ${
                                    isDark 
                                        ? "bg-slate-900 text-yellow-400 border border-purple-500/30" 
                                        : "bg-white text-indigo-600 border border-gray-200 hover:bg-gray-50"
                                }`}
                                title={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
                            >
                                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                        )}
                        <Link
                            href={`/${slug}`}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                                isDark ? "text-purple-300 hover:text-white" : "text-gray-600 hover:text-gray-800"
                            }`}
                        >
                            Xem trang
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main content body */}
            <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 md:py-8 relative z-10">
                {/* Unified Card Container (Dashboard Panel layout) */}
                <div className={`rounded-3xl border transition-all duration-500 overflow-hidden ${
                    isDark 
                        ? "bg-slate-900/85 border-purple-500/20 shadow-[0_0_40px_rgba(168,85,247,0.15)] text-white backdrop-blur-sm" 
                        : "bg-white border-gray-100 shadow-xl text-gray-800"
                }`}>
                    <div className="flex flex-col md:flex-row min-h-[600px]">
                        {/* Left Column (Sidebar Panel) */}
                        <aside className={`w-full md:w-72 shrink-0 p-4 md:p-6 flex flex-col gap-6 md:border-r transition-all ${
                            isDark ? "border-purple-500/25 bg-slate-950/20" : "border-gray-100 bg-gray-50/30"
                        }`}>
                            <nav className="grid grid-cols-2 md:flex md:flex-col gap-2">
                                {TABS.map((tab) => {
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-2 md:gap-3 px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-left transition-all ${
                                                isActive
                                                    ? isDark
                                                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-purple-400/25"
                                                        : "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                                                    : isDark
                                                        ? "text-purple-300 hover:bg-slate-800/80"
                                                        : "text-gray-600 hover:bg-gray-50"
                                            }`}
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
                            {isIdol && (
                                <div className={`hidden md:flex flex-col gap-4 p-4 rounded-2xl border transition-all ${
                                    isDark 
                                        ? "bg-slate-950/40 border-purple-500/10" 
                                        : "bg-white border-gray-200/60 shadow-sm"
                                }`}>
                                    <div className="flex items-center gap-2 border-b pb-2" style={isDark ? { borderColor: 'rgba(168,85,247,0.1)' } : { borderColor: 'rgba(0,0,0,0.05)' }}>
                                        <QrCode className={`w-4 h-4 ${isDark ? "text-purple-400" : "text-purple-600"}`} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-85">Trạng thái trang</span>
                                    </div>
                                    
                                    {/* URL slug & Copy Link */}
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] opacity-70">Đường dẫn trang của bạn:</p>
                                        <div className={`flex items-center gap-1 p-1.5 rounded-lg text-[10px] font-mono break-all ${isDark ? "bg-slate-950 text-purple-300" : "bg-gray-50 text-gray-700"}`}>
                                            <span className="flex-1 truncate select-all">{fullUrl}</span>
                                            <button 
                                                onClick={handleCopyLink}
                                                className={`p-1 rounded transition-colors ${isDark ? "bg-slate-900 hover:bg-slate-800 text-purple-400" : "bg-white hover:bg-gray-100 text-gray-600 border border-gray-200"}`}
                                                title="Sao chép liên kết"
                                            >
                                                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* QR Code preview */}
                                    <div className="flex flex-col items-center gap-2 py-1.5 border-t" style={isDark ? { borderColor: 'rgba(168,85,247,0.1)' } : { borderColor: 'rgba(0,0,0,0.05)' }}>
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
                        <main className="flex-1 p-4 sm:p-6 md:p-8">
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
                {isIdol && (
                    <div className={`md:hidden mt-6 p-4 rounded-3xl border transition-all ${
                        isDark 
                            ? "bg-slate-900/85 border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.1)] text-white backdrop-blur-sm" 
                            : "bg-white border-gray-100 shadow-lg text-gray-800"
                    }`}>
                        <div className="flex items-center gap-2 border-b pb-2 mb-3" style={isDark ? { borderColor: 'rgba(168,85,247,0.1)' } : { borderColor: 'rgba(0,0,0,0.05)' }}>
                            <QrCode className="w-4 h-4 text-purple-500" />
                            <span className="text-xs font-bold uppercase tracking-wider opacity-85">Trạng thái trang</span>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="flex-1 w-full space-y-2">
                                <p className="text-xs opacity-75">Đường dẫn xem trang của bạn:</p>
                                <div className={`flex items-center gap-1.5 p-2 rounded-lg text-xs font-mono break-all ${isDark ? "bg-slate-950 text-purple-300" : "bg-gray-50 text-gray-700"}`}>
                                    <span className="flex-1 truncate select-all">{fullUrl}</span>
                                    <button 
                                        onClick={handleCopyLink}
                                        className={`p-1.5 rounded transition-all ${isDark ? "bg-slate-900 hover:bg-slate-800 text-purple-400" : "bg-white hover:bg-gray-100 text-gray-600 border border-gray-200"}`}
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


