"use client";

import { useState, useEffect } from "react";
import { 
    Heart, 
    Sparkles, 
    Music, 
    GraduationCap, 
    Camera, 
    Compass, 
    Train, 
    Ticket, 
    Clock, 
    BookOpen, 
    Map,
    Flame,
    Star,
    Award,
    Volume2
} from "lucide-react";

interface WelcomeOverlayProps {
    type?: string;
    profileData?: Record<string, unknown> | null;
    title?: string;
    buttonText?: string;
    onOpen: () => void;
}

const SESSION_KEY = "welcome_shown";

export function WelcomeOverlay({
    type = "LOVE",
    profileData = {},
    title = "Welcome",
    buttonText = "Khám Phá Ngay ✨",
    onOpen,
}: WelcomeOverlayProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);

    // Get sub-theme for GRAD_GROUP
    const subTheme = type === "GRAD_GROUP" ? (profileData?.theme || "caravan") : "";

    // Check session storage on mount
    useEffect(() => {
        const hasShown = sessionStorage.getItem(SESSION_KEY);
        if (hasShown === "true") {
            setIsVisible(false);
            onOpen();
        }
    }, [onOpen]);

    const handleOpen = () => {
        setIsAnimatingOut(true);
        sessionStorage.setItem(SESSION_KEY, "true");

        // Trigger music immediately within the user interaction call stack to prevent autoplay blocks
        onOpen();

        // Wait for animation then hide
        setTimeout(() => {
            setIsVisible(false);
        }, 600);
    };

    if (!isVisible) return null;

    // 1. LOVE (Old classic template - kept simple as requested)
    if (type === "LOVE") {
        return (
            <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-rose-100 via-pink-100 to-purple-100 transition-opacity duration-500 ${isAnimatingOut ? "opacity-0" : "opacity-100"}`}>
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(10)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-3 h-3 rounded-full bg-pink-300 animate-float opacity-30"
                            style={{
                                left: `${5 + i * 9}%`,
                                top: `${15 + (i % 4) * 20}%`,
                                animationDelay: `${i * 0.4}s`,
                                animationDuration: `${3 + (i % 3)}s`,
                            }}
                        />
                    ))}
                </div>
                <div className="relative text-center px-6">
                    <div className="mb-8 flex justify-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 p-1 shadow-2xl animate-pulse">
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                                <Heart className="w-10 h-10 text-rose-400 fill-rose-400" />
                            </div>
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-10 bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent font-serif">
                        {title}
                    </h1>
                    <button
                        onClick={handleOpen}
                        className="group relative px-10 py-4 rounded-full text-white font-semibold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-rose-400 to-pink-500"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <Heart className="w-5 h-5 fill-white" />
                            {buttonText}
                        </span>
                    </button>
                    <p className="mt-6 text-sm text-rose-400/60 flex items-center justify-center gap-1.5 font-medium">
                        <Volume2 className="w-4 h-4" /> 🎵 Nhạc sẽ phát sau khi vào
                    </p>
                </div>
                <style jsx>{`
                    @keyframes float {
                        0%, 100% { transform: translateY(0) rotate(0deg); }
                        50% { transform: translateY(-20px) rotate(180deg); }
                    }
                    .animate-float { animation: float 4s ease-in-out infinite; }
                `}</style>
            </div>
        );
    }

    // 2. LOVE2 (Polaroid Scrapbook - Redesigned)
    if (type === "LOVE2") {
        return (
            <div className={`fixed inset-0 z-50 flex items-center justify-center bg-[#f4ecd8] bg-[radial-gradient(#c8bba3_1.5px,transparent_1.5px)] [background-size:24px_24px] transition-all duration-700 ${isAnimatingOut ? "opacity-0 scale-95 pointer-events-none" : "opacity-100"}`}>
                {/* Washi tapes & polaroids & dry flowers */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Retro floral border patterns */}
                    <div className="absolute top-0 left-0 w-32 h-32 border-l-4 border-t-4 border-[#855430]/10 m-6 rounded-tl-3xl" />
                    <div className="absolute bottom-0 right-0 w-32 h-32 border-r-4 border-b-4 border-[#855430]/10 m-6 rounded-br-3xl" />
                    
                    {/* Washi tape decor */}
                    <div className="absolute top-8 right-12 w-28 h-8 bg-[#b5a68d]/40 -rotate-12 border-y border-[#a89980]/30 shadow-sm" />
                    <div className="absolute bottom-12 left-8 w-24 h-8 bg-[#855430]/20 rotate-45 border-y border-[#855430]/15 shadow-sm" />

                    {/* Falling petals */}
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute text-xl animate-petal-fall select-none"
                            style={{
                                left: `${5 + i * 8}%`,
                                top: `-5%`,
                                animationDelay: `${i * 0.7}s`,
                                animationDuration: `${6 + (i % 5)}s`,
                            }}
                        >
                            {i % 4 === 0 ? "🌸" : i % 4 === 1 ? "🍂" : i % 4 === 2 ? "✨" : "❤️"}
                        </div>
                    ))}
                </div>

                <div className="relative text-center px-6 max-w-lg z-10">
                    {/* Polaroid stacked frame */}
                    <div className="mb-10 flex justify-center">
                        <div className="relative w-36 h-40 bg-white border border-[#dacdbf]/60 p-3 pb-9 rounded shadow-2xl -rotate-6 transition-transform hover:rotate-0 hover:scale-105 duration-500 cursor-pointer group">
                            {/* Washi tape pinning the photo */}
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-16 h-6 bg-[#c8bba3]/75 -rotate-2 border border-[#b8ab93]/20 shadow-sm" />
                            <div className="w-full h-full bg-[#fcf9f2] border border-[#ebdccb] flex flex-col items-center justify-center relative overflow-hidden rounded-sm">
                                <Camera className="w-10 h-10 text-[#855430] opacity-80 group-hover:scale-110 transition-transform duration-300" />
                                <Heart className="absolute w-5 h-5 text-rose-500 fill-rose-500 top-2 right-2 animate-pulse" />
                            </div>
                            <div className="absolute bottom-2 left-0 right-0 text-center font-serif text-[10px] text-[#855430]/75 tracking-wider select-none">
                                OUR MEMORIES
                            </div>
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-extrabold font-serif text-[#5c3a21] tracking-wide mb-4 leading-snug drop-shadow-sm">
                        {title}
                    </h1>
                    
                    <div className="relative max-w-xs mx-auto mb-10">
                        <div className="absolute inset-0 bg-[#e3d7bf]/30 blur-md rounded-lg" />
                        <p className="relative z-10 px-4 py-2 text-sm font-serif italic text-amber-900/80 border-y border-[#5c3a21]/20">
                            Mở cuốn sổ tay lưu giữ những khoảnh khắc ngọt ngào nhất...
                        </p>
                    </div>

                    <button
                        onClick={handleOpen}
                        className="group relative px-10 py-4 rounded-xl text-white font-serif font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95 border-2 border-[#5c3a21]/20 overflow-hidden"
                        style={{ backgroundColor: "#855430" }}
                    >
                        {/* Washi tape-style button highlight */}
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <span className="flex items-center justify-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
                            {buttonText}
                        </span>
                    </button>
                    
                    <p className="mt-8 text-xs text-amber-800/60 font-serif italic flex items-center justify-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5" /> Âm nhạc du dương tự động phát
                    </p>
                </div>

                <style jsx>{`
                    @keyframes petalFall {
                        0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 0; }
                        10% { opacity: 0.8; }
                        90% { opacity: 0.8; }
                        100% { transform: translateY(105vh) rotate(360deg) translateX(50px); opacity: 0; }
                    }
                    .animate-petal-fall { animation: petalFall 8s linear infinite; }
                `}</style>
            </div>
        );
    }

    // 3. IDOL (Concert Fanpage - Redesigned)
    if (type === "IDOL") {
        return (
            <div className={`fixed inset-0 z-50 flex items-center justify-center bg-[#05030a] transition-all duration-700 ${isAnimatingOut ? "opacity-0 scale-95 pointer-events-none" : "opacity-100"}`}>
                {/* Holographic lasers & concert grid */}
                <div className="absolute inset-0 pointer-events-none opacity-40 z-0">
                    {/* Perspective Cyber Grid */}
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-[linear-gradient(to_bottom,transparent,rgba(168,85,247,0.1))] cyber-grid-3d" />
                    
                    {/* Concert Lasers */}
                    <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-pink-500 via-pink-500/20 to-transparent origin-top rotate-[-25deg] blur-[3px] animate-laser-pink" />
                    <div className="absolute top-0 right-1/4 w-1 h-full bg-gradient-to-b from-cyan-400 via-cyan-400/20 to-transparent origin-top rotate-[25deg] blur-[3px] animate-laser-cyan" />
                    <div className="absolute top-0 left-1/2 w-1.5 h-full bg-gradient-to-b from-purple-500 via-purple-500/10 to-transparent origin-top blur-[4px] animate-laser-purple" />
                </div>

                {/* Glowing lightsticks / bokehs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full opacity-0 animate-lightstick-drift"
                            style={{
                                width: `${10 + (i % 3) * 12}px`,
                                height: `${10 + (i % 3) * 12}px`,
                                left: `${5 + i * 5}%`,
                                bottom: `0%`,
                                animationDelay: `${i * 0.4}s`,
                                animationDuration: `${6 + (i % 4) * 2}s`,
                                backgroundColor: i % 3 === 0 ? "#ec4899" : i % 3 === 1 ? "#06b6d4" : "#a855f7",
                                boxShadow: i % 3 === 0 ? "0 0 15px #ec4899" : i % 3 === 1 ? "0 0 15px #06b6d4" : "0 0 15px #a855f7",
                            }}
                        />
                    ))}
                </div>

                <div className="relative text-center px-6 z-10 max-w-md">
                    {/* Glowing lightstick badge */}
                    <div className="mb-8 flex justify-center">
                        <div className="relative w-28 h-28 rounded-full border border-pink-500/30 bg-[#160624]/80 flex items-center justify-center shadow-[0_0_35px_rgba(236,72,153,0.5)] animate-pulse-glow">
                            <div className="absolute inset-1.5 rounded-full border border-purple-500/40 bg-gradient-to-tr from-pink-900/30 via-purple-900/40 to-cyan-900/30 flex items-center justify-center">
                                <Music className="w-10 h-10 text-pink-400 drop-shadow-[0_0_12px_rgba(236,72,153,0.9)] animate-bounce-slow" />
                            </div>
                            {/* Orbiting star */}
                            <Star className="absolute top-0 right-1 w-5 h-5 text-yellow-300 fill-yellow-300 animate-spin-slow" />
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extrabold font-sans text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 tracking-wider mb-2 uppercase drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                        {title}
                    </h1>
                    
                    <p className="text-xs text-purple-300/80 uppercase tracking-[0.25em] mb-12 font-mono flex items-center justify-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping" />
                        Official Tribute Stage
                    </p>

                    <button
                        onClick={handleOpen}
                        className="group relative px-10 py-4.5 rounded-full text-white font-bold tracking-wider text-base shadow-[0_0_25px_rgba(236,72,153,0.5)] hover:shadow-[0_0_40px_rgba(236,72,153,0.8)] transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 border border-white/20 overflow-hidden"
                    >
                        {/* Shimmer sweep */}
                        <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] -translate-x-full group-hover:animate-shimmer" />
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            <Sparkles className="w-5 h-5 text-cyan-200" />
                            {buttonText}
                        </span>
                    </button>
                    
                    <p className="mt-8 text-[10px] text-purple-400/70 font-mono tracking-widest uppercase flex items-center justify-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-pink-500 animate-pulse" /> Live Concert Audio preloaded
                    </p>
                </div>

                <style jsx>{`
                    .cyber-grid-3d {
                        background-size: 40px 40px;
                        background-image: linear-gradient(to right, rgba(168, 85, 247, 0.08) 1px, transparent 1px),
                                          linear-gradient(to bottom, rgba(168, 85, 247, 0.08) 1px, transparent 1px);
                        transform: perspective(300px) rotateX(60deg);
                    }
                    @keyframes laserPink {
                        0%, 100% { transform: rotate(-25deg); opacity: 0.3; }
                        50% { transform: rotate(-15deg); opacity: 0.8; }
                    }
                    @keyframes laserCyan {
                        0%, 100% { transform: rotate(25deg); opacity: 0.3; }
                        50% { transform: rotate(15deg); opacity: 0.8; }
                    }
                    @keyframes laserPurple {
                        0%, 100% { transform: rotate(0deg) translateX(-10px); opacity: 0.2; }
                        50% { transform: rotate(5deg) translateX(10px); opacity: 0.6; }
                    }
                    @keyframes lightstickDrift {
                        0% { transform: translateY(50px) scale(0.6); opacity: 0; }
                        15% { opacity: 0.75; }
                        85% { opacity: 0.75; }
                        100% { transform: translateY(-105vh) scale(1.2) translateX(40px); opacity: 0; }
                    }
                    @keyframes shimmer {
                        100% { transform: translateX(300%) skew-x-[-20deg]; }
                    }
                    .animate-laser-pink { animation: laserPink 4s ease-in-out infinite; }
                    .animate-laser-cyan { animation: laserCyan 5.2s ease-in-out infinite; }
                    .animate-laser-purple { animation: laserPurple 6s ease-in-out infinite; }
                    .animate-lightstick-drift { animation: lightstickDrift 7s linear infinite; }
                    .group-hover\:animate-shimmer { animation: shimmer 1.2s ease-in-out infinite; }
                    .animate-pulse-glow {
                        animation: pulseGlow 3s ease-in-out infinite;
                    }
                    @keyframes pulseGlow {
                        0%, 100% { box-shadow: 0 0 30px rgba(236,72,153,0.4); }
                        50% { box-shadow: 0 0 45px rgba(236,72,153,0.7); }
                    }
                    .animate-bounce-slow {
                        animation: bounceSlow 3s ease-in-out infinite;
                    }
                    @keyframes bounceSlow {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-8px); }
                    }
                    .animate-spin-slow {
                        animation: spinSlow 12s linear infinite;
                    }
                    @keyframes spinSlow {
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    // 4. GRAD_PERSONAL (Emerald Desk - Redesigned)
    if (type === "GRAD_PERSONAL") {
        return (
            <div className={`fixed inset-0 z-50 flex items-center justify-center bg-[#051510] bg-[radial-gradient(rgba(16,185,129,0.06)_1.5px,transparent_1.5px)] [background-size:28px_28px] transition-all duration-700 ${isAnimatingOut ? "opacity-0 scale-95 pointer-events-none" : "opacity-100"}`}>
                {/* Gold frames & leaves */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    {/* Golden luxury corners */}
                    <div className="absolute top-8 left-8 w-24 h-24 border-l-2 border-t-2 border-amber-500/20" />
                    <div className="absolute bottom-8 right-8 w-24 h-24 border-r-2 border-b-2 border-amber-500/20" />
                    
                    {/* Floating autumn/phoenix leaves */}
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute text-xl animate-leaf-drift opacity-30 select-none"
                            style={{
                                left: `${8 + i * 8}%`,
                                top: `-5%`,
                                animationDelay: `${i * 0.5}s`,
                                animationDuration: `${6 + (i % 4)}s`,
                            }}
                        >
                            {i % 3 === 0 ? "🌿" : i % 3 === 1 ? "🍁" : "✨"}
                        </div>
                    ))}
                </div>

                <div className="relative text-center px-6 max-w-md z-10">
                    {/* Golden Laurel Emblem */}
                    <div className="mb-8 flex justify-center">
                        <div className="w-28 h-28 rounded-full border-2 border-amber-500/40 bg-[#0c241d]/90 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.25)] animate-pulse-slow relative">
                            {/* Inner border */}
                            <div className="absolute inset-2 rounded-full border border-amber-600/20 bg-emerald-950/60 flex items-center justify-center">
                                <GraduationCap className="w-12 h-12 text-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)]" />
                            </div>
                            {/* Twinkling star */}
                            <Award className="absolute -bottom-2 -right-1 w-7 h-7 text-amber-500 fill-amber-500 animate-bounce" />
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-amber-100 tracking-wide mb-4 leading-snug drop-shadow-md">
                        {title}
                    </h1>
                    
                    <div className="relative max-w-xs mx-auto mb-12">
                        <div className="absolute inset-0 bg-emerald-950/40 blur-md rounded-lg" />
                        <p className="relative z-10 px-4 py-2.5 text-xs font-serif italic text-emerald-300/85 border-y border-amber-500/20 uppercase tracking-widest">
                            Hành trình rực rỡ và tự hào 🎓
                        </p>
                    </div>

                    <button
                        onClick={handleOpen}
                        className="group relative px-10 py-4 rounded-full text-[#0a2017] bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 font-serif font-bold text-base shadow-[0_6px_20px_rgba(245,158,11,0.3)] hover:shadow-[0_8px_25px_rgba(245,158,11,0.5)] transition-all hover:scale-105 active:scale-95 overflow-hidden"
                    >
                        <span className="flex items-center gap-2 justify-center">
                            <BookOpen className="w-5 h-5 text-[#0a2017]" />
                            {buttonText}
                        </span>
                    </button>
                    
                    <p className="mt-8 text-xs text-emerald-400/50 font-serif italic flex items-center justify-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5" /> Khúc nhạc vinh quang sẵn sàng phát
                    </p>
                </div>

                <style jsx>{`
                    @keyframes leafDrift {
                        0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 0; }
                        10% { opacity: 0.6; }
                        90% { opacity: 0.6; }
                        100% { transform: translateY(105vh) rotate(180deg) translateX(40px); opacity: 0; }
                    }
                    .animate-leaf-drift { animation: leafDrift 7s linear infinite; }
                    .animate-pulse-slow {
                        animation: pulseSlow 4s ease-in-out infinite;
                    }
                    @keyframes pulseSlow {
                        0%, 100% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.9; transform: scale(1.03); }
                    }
                `}</style>
            </div>
        );
    }

    // 5. GRAD_CLASS (Blackboard Yearbook - Redesigned)
    if (type === "GRAD_CLASS") {
        const className = (profileData?.class_name as string) || "Lớp học";
        return (
            <div className={`fixed inset-0 z-50 flex items-center justify-center bg-[#101b15] transition-all duration-700 ${isAnimatingOut ? "opacity-0 scale-95 pointer-events-none" : "opacity-100"}`}>
                {/* Chalk blackboard styling */}
                <div className="absolute inset-0 pointer-events-none z-0 blackboard-texture opacity-70" />
                
                {/* Chalk doodles in background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-20">
                    {/* Hand-drawn styled icons */}
                    <div className="absolute top-12 left-12 w-16 h-16 border-2 border-dashed border-white rounded-full flex items-center justify-center text-white font-mono text-xl rotate-12">12A</div>
                    <div className="absolute bottom-16 right-16 w-20 h-16 border border-white rounded flex items-center justify-center text-white text-xs -rotate-6">YEARBOOK</div>
                    <div className="absolute top-1/4 right-20 text-white text-2xl animate-pulse">🎓</div>
                    <div className="absolute bottom-1/4 left-16 text-white text-2xl animate-bounce">🎒</div>
                    
                    {/* Floating chalk particles */}
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute text-slate-200/50 animate-dust-float text-base font-serif"
                            style={{
                                left: `${5 + i * 8.5}%`,
                                top: `-5%`,
                                animationDelay: `${i * 0.6}s`,
                                animationDuration: `${5 + (i % 4)}s`,
                            }}
                        >
                            {i % 4 === 0 ? "✏️" : i % 4 === 1 ? "⭐" : i % 4 === 2 ? "✈️" : "✨"}
                        </div>
                    ))}
                </div>

                <div className="relative text-center px-6 max-w-md z-10">
                    {/* Wooden chalk board badge */}
                    <div className="mb-8 flex justify-center">
                        <div className="w-36 h-28 bg-[#1e3427] border-8 border-[#5c3a21] shadow-2xl rounded-lg flex flex-col items-center justify-center -rotate-3 relative group hover:rotate-0 duration-300">
                            {/* Chalk dust tray */}
                            <div className="absolute -bottom-2.5 left-2 right-2 h-1.5 bg-[#402717] rounded shadow-sm" />
                            {/* Text */}
                            <span className="font-mono text-white/95 text-lg select-none tracking-widest chalk-text">OUR CLASS</span>
                            <span className="font-mono text-yellow-200/85 text-2xl select-none font-bold chalk-text">{className}</span>
                            <div className="absolute bottom-1 right-2 w-3 h-1 bg-white/90 rounded-sm blur-[0.5px]" />
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-wide mb-4 leading-snug chalk-text">
                        {title}
                    </h1>
                    
                    <p className="text-xs font-serif italic text-slate-300/80 mb-12 max-w-xs mx-auto px-4 py-2 border border-white/20 bg-white/5 rounded-md">
                        Mở cuốn lưu bút lớp học bảng đen, ôn lại kỷ niệm tinh nghịch thời học sinh...
                    </p>

                    <button
                        onClick={handleOpen}
                        className="group relative px-10 py-4 rounded border-2 border-white hover:border-yellow-200 text-white hover:text-yellow-100 font-serif font-bold tracking-wider text-sm shadow-xl hover:bg-white/5 transition-all hover:scale-105 active:scale-95 bg-transparent overflow-hidden"
                    >
                        <span className="flex items-center gap-2 justify-center">
                            <Sparkles className="w-4 h-4 animate-spin-slow" />
                            {buttonText}
                        </span>
                    </button>
                    
                    <p className="mt-8 text-[10px] text-slate-400 font-mono tracking-widest uppercase flex items-center justify-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5" /> Nhạc lưu bút xưa sẵn sàng phát
                    </p>
                </div>

                <style jsx>{`
                    .blackboard-texture {
                        background-size: 20px 20px;
                        background-image: radial-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px);
                        background-color: #12261e;
                    }
                    .chalk-text {
                        text-shadow: 0 0 3px rgba(255,255,255,0.4), 0 0 8px rgba(255,255,255,0.1);
                    }
                    @keyframes dustFloat {
                        0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 0; }
                        15% { opacity: 0.7; }
                        85% { opacity: 0.7; }
                        100% { transform: translateY(105vh) rotate(180deg) translateX(30px); opacity: 0; }
                    }
                    .animate-dust-float { animation: dustFloat 6.5s linear infinite; }
                    .animate-spin-slow { animation: spin 8s linear infinite; }
                `}</style>
            </div>
        );
    }

    // 6. GRAD_GROUP (Chuyến Xe Thanh Xuân - Redesigned)
    if (type === "GRAD_GROUP") {
        // Caravan (sunset amber roadtrip)
        if (subTheme === "caravan") {
            return (
                <div className={`fixed inset-0 z-50 flex items-center justify-center bg-[#1c0f07] bg-[radial-gradient(rgba(217,119,6,0.06)_1.5px,transparent_1.5px)] [background-size:28px_28px] transition-all duration-700 ${isAnimatingOut ? "opacity-0 scale-95 pointer-events-none" : "opacity-100"}`}>
                    {/* Sunset sky gradient light */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-amber-600/10 to-orange-800/5 filter blur-[100px] pointer-events-none z-0" />
                    
                    {/* Fire embers flying up */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                        {/* Moving caravan silhouette */}
                        <div className="absolute bottom-6 w-full flex justify-center animate-caravan-ride">
                            <div className="opacity-15 flex items-center gap-1 text-amber-500 text-6xl">
                                🚐 <span className="text-3xl">⛺</span>
                            </div>
                        </div>

                        {[...Array(15)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute rounded-full opacity-0 animate-ember-rise"
                                style={{
                                    width: `${2 + (i % 3) * 3}px`,
                                    height: `${2 + (i % 3) * 3}px`,
                                    left: `${15 + i * 5}%`,
                                    bottom: `-5%`,
                                    backgroundColor: "#d97706",
                                    boxShadow: "0 0 10px #f59e0b, 0 0 20px #ef4444",
                                    animationDelay: `${i * 0.3}s`,
                                    animationDuration: `${5 + (i % 4)}s`,
                                }}
                            />
                        ))}
                    </div>

                    <div className="relative text-center px-6 max-w-md z-10">
                        {/* Amber Compass Emblem */}
                        <div className="mb-8 flex justify-center">
                            <div className="w-28 h-28 rounded-full border border-amber-600/30 bg-[#2d1b10]/95 flex items-center justify-center shadow-[0_0_30px_rgba(217,119,6,0.3)] animate-pulse-slow relative">
                                <div className="absolute inset-2 rounded-full border border-amber-500/20 bg-amber-950/40 flex items-center justify-center">
                                    <Compass className="w-12 h-12 text-amber-500 animate-spin-slow" />
                                </div>
                                <Flame className="absolute -top-2 w-7 h-7 text-orange-500 animate-bounce" />
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-amber-100 tracking-wide mb-4 leading-snug drop-shadow-md">
                            {title}
                        </h1>
                        
                        <p className="text-xs font-serif italic text-amber-500/70 mb-12 max-w-xs mx-auto px-4 py-2 bg-[#2d1b10]/40 border border-amber-500/20 rounded-lg">
                            Khởi hành chuyến xe dã ngoại thanh xuân cùng những người bạn quý giá...
                        </p>

                        <button
                            onClick={handleOpen}
                            className="group relative px-10 py-4 rounded-full text-[#1b0e06] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 font-serif font-bold text-base shadow-[0_6px_20px_rgba(217,119,6,0.3)] hover:shadow-[0_8px_25px_rgba(217,119,6,0.5)] transition-all hover:scale-105 active:scale-95 overflow-hidden"
                        >
                            <span className="flex items-center gap-2 justify-center">
                                <Map className="w-5 h-5 text-[#1b0e06]" />
                                {buttonText}
                            </span>
                        </button>
                        
                        <p className="mt-8 text-[10px] text-amber-500/40 font-mono tracking-widest uppercase flex items-center justify-center gap-1.5">
                            <Volume2 className="w-3.5 h-3.5" /> Lofi acoustic track preloaded
                        </p>
                    </div>

                    <style jsx>{`
                        @keyframes emberRise {
                            0% { transform: translateY(0) scale(0.8) translateX(0); opacity: 0; }
                            15% { opacity: 0.8; }
                            85% { opacity: 0.8; }
                            100% { transform: translateY(-105vh) scale(1.3) translateX(30px); opacity: 0; }
                        }
                        @keyframes caravanRide {
                            0% { transform: translateX(-60vw); }
                            100% { transform: translateX(60vw); }
                        }
                        .animate-ember-rise { animation: emberRise 6s linear infinite; }
                        .animate-caravan-ride { animation: caravanRide 15s linear infinite; }
                        .animate-spin-slow { animation: spinSlow 20s linear infinite; }
                        @keyframes spinSlow { 100% { transform: rotate(360deg); } }
                    `}</style>
                </div>
            );
        }

        // Scrapbook (kraft polaroid)
        if (subTheme === "scrapbook") {
            return (
                <div className={`fixed inset-0 z-50 flex items-center justify-center bg-[#ece0cc] bg-[radial-gradient(#c8bba3_1.5px,transparent_1.5px)] [background-size:24px_24px] transition-all duration-700 ${isAnimatingOut ? "opacity-0 scale-95 pointer-events-none" : "opacity-100"}`}>
                    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                        {/* Washi tape decors */}
                        <div className="absolute top-6 right-8 w-24 h-6 bg-[#855430]/20 rotate-12 shadow-sm border-x border-[#855430]/10" />
                        <div className="absolute bottom-8 left-10 w-20 h-6 bg-[#855430]/30 -rotate-45 shadow-sm border-x border-[#855430]/15" />
                        
                        {/* Sticker items */}
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute text-lg animate-sticker-drift opacity-30 select-none"
                                style={{
                                    left: `${5 + i * 8.5}%`,
                                    top: `-5%`,
                                    animationDelay: `${i * 0.45}s`,
                                    animationDuration: `${7 + (i % 4)}s`,
                                }}
                            >
                                {i % 4 === 0 ? "📸" : i % 4 === 1 ? "🩹" : i % 4 === 2 ? "🍀" : "✨"}
                            </div>
                        ))}
                    </div>

                    <div className="relative text-center px-6 max-w-md z-10">
                        {/* Stacked polaroids */}
                        <div className="mb-10 flex justify-center">
                            <div className="relative w-36 h-40 bg-white border border-[#dacdbf] p-3 pb-8 rounded shadow-2xl -rotate-6 hover:rotate-0 hover:scale-105 duration-300">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-4 bg-[#855430]/35 rotate-3 border border-[#855430]/10 shadow-sm" />
                                <div className="w-full h-full bg-[#fdfbf7] border border-[#dacdbf]/40 flex items-center justify-center rounded-sm">
                                    <Camera className="w-10 h-10 text-[#855430] opacity-80" />
                                </div>
                                <span className="absolute bottom-1.5 left-0 right-0 font-serif text-[10px] text-[#855430]/80">BEST FRIENDS</span>
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#4a3525] tracking-wide mb-4 leading-snug">
                            {title}
                        </h1>
                        
                        <p className="text-xs font-serif italic text-[#855430]/80 mb-12 max-w-xs mx-auto px-4 py-2 border border-[#855430]/20 bg-[#fbf5eb] rounded-lg">
                            Mở cuốn sổ tay lưu niệm, lật giở từng mảnh ghép ký ức thời niên thiếu...
                        </p>

                        <button
                            onClick={handleOpen}
                            className="group relative px-10 py-4 rounded-lg text-white font-serif font-bold text-base shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95 border border-[#855430]/20 overflow-hidden"
                            style={{ backgroundColor: "#855430" }}
                        >
                            <span className="flex items-center gap-2 justify-center">
                                <Sparkles className="w-5 h-5 text-amber-200" />
                                {buttonText}
                            </span>
                        </button>
                        
                        <p className="mt-8 text-[10px] text-[#855430]/50 font-mono tracking-widest uppercase flex items-center justify-center gap-1.5">
                            <Volume2 className="w-3.5 h-3.5" /> Vintage retro acoustics ready
                        </p>
                    </div>

                    <style jsx>{`
                        @keyframes stickerDrift {
                            0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 0; }
                            15% { opacity: 0.6; }
                            85% { opacity: 0.6; }
                            100% { transform: translateY(105vh) rotate(180deg) translateX(30px); opacity: 0; }
                        }
                        .animate-sticker-drift { animation: stickerDrift 8s linear infinite; }
                    `}</style>
                </div>
            );
        }

        // Station (cyber neon metro train)
        if (subTheme === "station") {
            return (
                <div className={`fixed inset-0 z-50 flex items-center justify-center bg-[#05060b] transition-all duration-700 ${isAnimatingOut ? "opacity-0 scale-95 pointer-events-none" : "opacity-100"}`}>
                    {/* Rainy glass & neon bokeh overlay */}
                    <div className="absolute inset-0 pointer-events-none z-0">
                        {/* Radial neon glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-violet-600/10 to-indigo-800/5 filter blur-[100px]" />
                        
                        {/* Moving train shadow */}
                        <div className="absolute top-2/3 left-0 w-full h-24 bg-gradient-to-r from-transparent via-violet-950/10 to-transparent -translate-y-12 animate-train-rush pointer-events-none" />
                        
                        {/* Rain falls */}
                        <div className="absolute inset-0 rain-container opacity-40" />
                    </div>

                    {/* Floating station icons */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute text-violet-500/30 animate-station-float text-lg"
                                style={{
                                    left: `${5 + i * 8.5}%`,
                                    top: `-5%`,
                                    animationDelay: `${i * 0.4}s`,
                                    animationDuration: `${6.5 + (i % 3)}s`,
                                }}
                            >
                                {i % 4 === 0 ? "🎟️" : i % 4 === 1 ? "🛤️" : i % 4 === 2 ? "🕒" : "✨"}
                            </div>
                        ))}
                    </div>

                    <div className="relative text-center px-6 max-w-md z-10">
                        {/* Neon Metro Train Emblem */}
                        <div className="mb-8 flex justify-center">
                            <div className="w-28 h-28 rounded-full border border-violet-500/35 bg-[#141221]/90 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.4)] animate-pulse-slow relative">
                                <div className="absolute inset-2 rounded-full border border-violet-500/15 bg-violet-950/40 flex items-center justify-center">
                                    <Train className="w-12 h-12 text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                                </div>
                                <Clock className="absolute -bottom-1 -right-1 w-6 h-6 text-violet-500 animate-spin-slow" style={{ animationDuration: "120s" }} />
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-violet-100 tracking-wide mb-4 leading-snug drop-shadow-md">
                            {title}
                        </h1>
                        
                        <p className="text-xs font-serif italic text-violet-400/80 mb-12 max-w-xs mx-auto px-4 py-2 bg-[#141221]/60 border border-violet-500/20 rounded-lg">
                            Đặt chân vào Ga tàu Ký ức, nơi cất giữ chiếc vé khứ hồi quay về ngày xanh...
                        </p>

                        <button
                            onClick={handleOpen}
                            className="group relative px-10 py-4.5 rounded-full text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-serif font-bold text-base shadow-[0_4px_20px_rgba(139,92,246,0.4)] hover:shadow-[0_6px_30px_rgba(139,92,246,0.6)] transition-all hover:scale-105 active:scale-95 border border-white/10 overflow-hidden"
                        >
                            <span className="flex items-center gap-2 justify-center">
                                <Ticket className="w-5 h-5 text-violet-200 rotate-12 group-hover:rotate-45 transition-transform duration-300" />
                                {buttonText}
                            </span>
                        </button>
                        
                        <p className="mt-8 text-[10px] text-violet-400/50 font-mono tracking-widest uppercase flex items-center justify-center gap-1.5">
                            <Volume2 className="w-3.5 h-3.5 text-violet-500 animate-pulse" /> Station Lofi track loaded
                        </p>
                    </div>

                    <style jsx>{`
                        @keyframes stationFloat {
                            0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 0; }
                            15% { opacity: 0.6; }
                            85% { opacity: 0.6; }
                            100% { transform: translateY(105vh) rotate(180deg) translateX(30px); opacity: 0; }
                        }
                        @keyframes trainRush {
                            0% { transform: translateX(-100%) skewX(-10deg); opacity: 0; }
                            20% { opacity: 0.3; }
                            80% { opacity: 0.3; }
                            100% { transform: translateX(100%) skewX(-10deg); opacity: 0; }
                        }
                        .animate-station-float { animation: stationFloat 7.5s linear infinite; }
                        .animate-train-rush { animation: trainRush 10s linear infinite; }
                        .rain-container {
                            background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
                            background-size: 3px 60px;
                            animation: rainFall 1.2s linear infinite;
                        }
                        @keyframes rainFall { 0% { background-position: 0 0; } 100% { background-position: 15px 600px; } }
                    `}</style>
                </div>
            );
        }
    }

    // 7. EVERY (Everyday / default fallback - Glassmorphism Soap Bubbles Redesigned)
    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-tr from-indigo-100 via-pink-100 to-sky-100 transition-all duration-700 ${isAnimatingOut ? "opacity-0 scale-95 pointer-events-none" : "opacity-100"}`}>
            {/* Dynamic bubble background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {[...Array(16)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full border border-white/40 opacity-0 animate-bubble-float"
                        style={{
                            width: `${15 + (i % 4) * 20}px`,
                            height: `${15 + (i % 4) * 20}px`,
                            left: `${5 + i * 6}%`,
                            bottom: `-10%`,
                            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.05) 70%, rgba(147,197,253,0.2) 100%)",
                            boxShadow: "inset -3px -3px 8px rgba(147,197,253,0.3), 0 5px 15px rgba(147,197,253,0.15)",
                            animationDelay: `${i * 0.35}s`,
                            animationDuration: `${7 + (i % 5) * 2}s`,
                        }}
                    />
                ))}
            </div>

            <div className="relative text-center px-6 max-w-md z-10">
                {/* Glass orb badge */}
                <div className="mb-8 flex justify-center">
                    <div className="w-24 h-24 rounded-full border border-white/50 bg-white/20 backdrop-blur-md flex items-center justify-center shadow-[0_8px_32px_0_rgba(147,197,253,0.2)] animate-pulse relative">
                        <div className="absolute inset-1.5 rounded-full border border-white/30 bg-white/10 flex items-center justify-center">
                            <Sparkles className="w-10 h-10 text-indigo-400 drop-shadow-[0_2px_8px_rgba(99,102,241,0.3)] animate-spin-slow" style={{ animationDuration: "15s" }} />
                        </div>
                    </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-800 tracking-wide mb-4 leading-snug drop-shadow-sm">
                    {title}
                </h1>
                
                <p className="text-xs font-serif italic text-slate-600/80 mb-12 max-w-xs mx-auto px-4 py-2 border border-white/40 bg-white/30 backdrop-blur-sm rounded-2xl shadow-sm">
                    Chào mừng bạn đến với góc nhỏ lưu giữ những khoảnh khắc đời thường ý nghĩa...
                </p>

                <button
                    onClick={handleOpen}
                    className="group relative px-10 py-4 rounded-full text-indigo-900 border border-white/50 bg-white/30 backdrop-blur-md font-serif font-bold text-base shadow-[0_8px_32px_0_rgba(147,197,253,0.2)] hover:bg-white/40 transition-all hover:scale-105 active:scale-95 overflow-hidden"
                >
                    {/* Gloss shine */}
                    <div className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-15deg] -translate-x-full group-hover:animate-shimmer" />
                    <span className="flex items-center gap-2 justify-center">
                        <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
                        {buttonText}
                    </span>
                </button>
                
                <p className="mt-8 text-xs text-slate-500/70 font-serif italic flex items-center justify-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> Nhạc nền thư giãn đã sẵn sàng
                </p>
            </div>

            <style jsx>{`
                @keyframes bubbleFloat {
                    0% { transform: translateY(0) scale(0.8) translateX(0); opacity: 0; }
                    10% { opacity: 0.85; }
                    90% { opacity: 0.85; }
                    100% { transform: translateY(-110vh) scale(1.3) translateX(40px); opacity: 0; }
                }
                .animate-bubble-float { animation: bubbleFloat 8s linear infinite; }
            `}</style>
        </div>
    );
}
