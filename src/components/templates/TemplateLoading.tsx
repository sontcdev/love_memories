"use client";

import { Heart, Sparkles, BookOpen, Music, Star, GraduationCap, Users, MapPin, MessageCircle, Plane, Gift } from "lucide-react";
import type { LinkType } from "@prisma/client";

interface TemplateLoadingProps {
    linkType: LinkType;
    isDark?: boolean;
}

export function TemplateLoading({ linkType, isDark = false }: TemplateLoadingProps) {
    switch (linkType) {
        case "LOVE":
            return <LoveLoading isDark={isDark} />;
        case "LOVE2":
            return <Love2Loading isDark={isDark} />;
        case "IDOL":
            return <IdolLoading isDark={isDark} />;
        case "GRAD_PERSONAL":
            return <GradPersonalLoading isDark={isDark} />;
        case "GRAD_CLASS":
            return <GradClassLoading isDark={isDark} />;
        case "GRAD_GROUP":
            return <GradGroupLoading isDark={isDark} />;
        case "WEDDING":
            return <WeddingLoading isDark={isDark} />;
        case "TRAVEL":
            return <TravelLoading isDark={isDark} />;
        case "FRIENDSHIP":
            return <FriendshipLoading isDark={isDark} />;
        default:
            return <DefaultLoading isDark={isDark} />;
    }
}

function LoveLoading({ isDark }: { isDark: boolean }) {
    return (
        <div className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden ${isDark ? "bg-gradient-to-br from-rose-950 via-pink-950 to-purple-950" : "bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50"}`}>
            {/* Floating Hearts */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(8)].map((_, i) => (
                    <Heart
                        key={i}
                        className={`absolute fill-rose-400/30 animate-float-heart ${isDark ? "text-rose-400/30" : "text-rose-300/40"}`}
                        style={{
                            left: `${10 + i * 12}%`,
                            width: `${20 + Math.random() * 25}px`,
                            height: `${20 + Math.random() * 25}px`,
                            animationDuration: `${5 + Math.random() * 5}s`,
                            animationDelay: `${i * 0.4}s`,
                        }}
                    />
                ))}
            </div>

            {/* Book Animation */}
            <div className="relative z-10 mb-8">
                <div className={`relative w-24 h-24 rounded-2xl ${isDark ? "bg-white/10" : "bg-white/80"} backdrop-blur-sm shadow-2xl flex items-center justify-center`}>
                    <BookOpen className={`w-12 h-12 ${isDark ? "text-rose-300" : "text-rose-500"} animate-pulse`} />
                    <div className={`absolute inset-0 rounded-2xl ${isDark ? "bg-rose-500/20" : "bg-rose-400/20"} animate-ping`} />
                </div>
            </div>

            <p className={`text-lg font-medium z-10 ${isDark ? "text-rose-200" : "text-rose-700"}`}>Đang mở câu chuyện tình yêu...</p>
            <p className={`text-sm mt-2 z-10 ${isDark ? "text-rose-300/60" : "text-rose-500/60"}`}>Lật từng trang kỷ niệm</p>

            <style jsx>{`
                @keyframes float-heart {
                    0% { transform: translateY(100vh) scale(0) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.4; }
                    90% { opacity: 0.4; }
                    100% { transform: translateY(-100px) scale(1) rotate(360deg); opacity: 0; }
                }
                .animate-float-heart {
                    animation: float-heart linear infinite;
                }
            `}</style>
        </div>
    );
}

function Love2Loading({ isDark }: { isDark: boolean }) {
    return (
        <div className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden ${isDark ? "bg-gradient-to-br from-amber-950 via-orange-950 to-yellow-950" : "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50"}`}>
            {/* Scattered Polaroids */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className={`absolute ${isDark ? "bg-white/10" : "bg-white/60"} rounded-lg shadow-lg animate-float-polaroid`}
                        style={{
                            left: `${15 + i * 14}%`,
                            top: `${20 + (i % 3) * 25}%`,
                            width: "60px",
                            height: "70px",
                            transform: `rotate(${-15 + Math.random() * 30}deg)`,
                            animationDuration: `${4 + Math.random() * 3}s`,
                            animationDelay: `${i * 0.3}s`,
                        }}
                    />
                ))}
            </div>

            {/* Desk Item */}
            <div className="relative z-10 mb-8">
                <div className={`relative w-24 h-24 rounded-2xl ${isDark ? "bg-amber-900/50" : "bg-amber-100"} backdrop-blur-sm shadow-2xl flex items-center justify-center border-2 ${isDark ? "border-amber-700/30" : "border-amber-200"}`}>
                    <Gift className={`w-12 h-12 ${isDark ? "text-amber-300" : "text-amber-600"} animate-bounce`} />
                </div>
            </div>

            <p className={`text-lg font-medium z-10 ${isDark ? "text-amber-200" : "text-amber-700"}`}>Đang sắp xếp kỷ niệm...</p>
            <p className={`text-sm mt-2 z-10 ${isDark ? "text-amber-300/60" : "text-amber-500/60"}`}>Trên bàn làm việc yêu thương</p>

            <style jsx>{`
                @keyframes float-polaroid {
                    0%, 100% { transform: translateY(0) rotate(var(--rotation, 0deg)); }
                    50% { transform: translateY(-15px) rotate(var(--rotation, 0deg)); }
                }
                .animate-float-polaroid {
                    animation: float-polaroid ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}

function IdolLoading({ isDark }: { isDark: boolean }) {
    return (
        <div className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden ${isDark ? "bg-gradient-to-br from-purple-950 via-pink-950 to-blue-950" : "bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100"}`}>
            {/* Stage Lights */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute top-0 left-1/4 w-32 h-96 ${isDark ? "bg-purple-500/20" : "bg-purple-400/10"} blur-3xl animate-spotlight-1`} />
                <div className={`absolute top-0 right-1/4 w-32 h-96 ${isDark ? "bg-pink-500/20" : "bg-pink-400/10"} blur-3xl animate-spotlight-2`} />
            </div>

            {/* Music Note */}
            <div className="relative z-10 mb-8">
                <div className={`relative w-24 h-24 rounded-full ${isDark ? "bg-gradient-to-br from-purple-600 to-pink-600" : "bg-gradient-to-br from-purple-400 to-pink-400"} shadow-2xl flex items-center justify-center`}>
                    <Music className="w-12 h-12 text-white animate-pulse" />
                    <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
                </div>
                {/* Floating Stars */}
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`absolute ${isDark ? "text-yellow-300" : "text-yellow-400"} fill-current animate-float-star`}
                        style={{
                            width: `${12 + Math.random() * 8}px`,
                            height: `${12 + Math.random() * 8}px`,
                            left: `${-20 + i * 20}px`,
                            top: `${-30 + (i % 2) * 40}px`,
                            animationDuration: `${2 + Math.random() * 2}s`,
                            animationDelay: `${i * 0.2}s`,
                        }}
                    />
                ))}
            </div>

            <p className={`text-lg font-bold z-10 ${isDark ? "text-purple-200" : "text-purple-700"}`}>Đang bật sân khấu...</p>
            <p className={`text-sm mt-2 z-10 ${isDark ? "text-pink-300/60" : "text-pink-500/60"}`}>Chuẩn bị concert cho idol</p>

            <style jsx>{`
                @keyframes spotlight-1 {
                    0%, 100% { transform: translateX(0) rotate(-15deg); opacity: 0.3; }
                    50% { transform: translateX(50px) rotate(15deg); opacity: 0.6; }
                }
                @keyframes spotlight-2 {
                    0%, 100% { transform: translateX(0) rotate(15deg); opacity: 0.3; }
                    50% { transform: translateX(-50px) rotate(-15deg); opacity: 0.6; }
                }
                @keyframes float-star {
                    0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
                    50% { transform: translateY(-10px) scale(1.2); opacity: 1; }
                }
                .animate-spotlight-1 { animation: spotlight-1 4s ease-in-out infinite; }
                .animate-spotlight-2 { animation: spotlight-2 4s ease-in-out infinite; }
                .animate-float-star { animation: float-star ease-in-out infinite; }
            `}</style>
        </div>
    );
}

function GradPersonalLoading({ isDark }: { isDark: boolean }) {
    return (
        <div className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden ${isDark ? "bg-gradient-to-br from-emerald-950 via-teal-950 to-cyan-950" : "bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50"}`}>
            {/* Desktop Icons */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className={`absolute ${isDark ? "bg-white/10" : "bg-white/60"} rounded-xl shadow-lg animate-float-window`}
                        style={{
                            left: `${20 + i * 20}%`,
                            top: `${30 + (i % 2) * 20}%`,
                            width: "80px",
                            height: "60px",
                            animationDuration: `${3 + Math.random() * 2}s`,
                            animationDelay: `${i * 0.3}s`,
                        }}
                    />
                ))}
            </div>

            {/* Graduation Cap */}
            <div className="relative z-10 mb-8">
                <div className={`relative w-24 h-24 rounded-2xl ${isDark ? "bg-emerald-900/50" : "bg-emerald-100"} backdrop-blur-sm shadow-2xl flex items-center justify-center border-2 ${isDark ? "border-emerald-700/30" : "border-emerald-200"}`}>
                    <GraduationCap className={`w-12 h-12 ${isDark ? "text-emerald-300" : "text-emerald-600"} animate-bounce`} />
                </div>
            </div>

            <p className={`text-lg font-medium z-10 ${isDark ? "text-emerald-200" : "text-emerald-700"}`}>Đang tải desktop...</p>
            <p className={`text-sm mt-2 z-10 ${isDark ? "text-emerald-300/60" : "text-emerald-500/60"}`}>Kỷ niệm tốt nghiệp của bạn</p>

            <style jsx>{`
                @keyframes float-window {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-float-window {
                    animation: float-window ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}

function GradClassLoading({ isDark }: { isDark: boolean }) {
    return (
        <div className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden ${isDark ? "bg-gradient-to-br from-slate-950 via-gray-950 to-zinc-950" : "bg-gradient-to-br from-slate-100 via-gray-100 to-zinc-100"}`}>
            {/* Chalkboard Effect */}
            <div className={`absolute inset-0 ${isDark ? "bg-slate-900/50" : "bg-slate-200/50"} backdrop-blur-sm`} />

            {/* Book Pages */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className={`absolute ${isDark ? "bg-white/10" : "bg-white/60"} rounded shadow-lg animate-flip-page`}
                        style={{
                            left: `${25 + i * 12}%`,
                            width: "70px",
                            height: "90px",
                            animationDuration: `${3 + Math.random() * 2}s`,
                            animationDelay: `${i * 0.4}s`,
                        }}
                    />
                ))}
            </div>

            {/* Yearbook Icon */}
            <div className="relative z-10 mb-8">
                <div className={`relative w-24 h-24 rounded-2xl ${isDark ? "bg-slate-800/50" : "bg-white/80"} backdrop-blur-sm shadow-2xl flex items-center justify-center border-2 ${isDark ? "border-slate-700/30" : "border-slate-200"}`}>
                    <BookOpen className={`w-12 h-12 ${isDark ? "text-slate-300" : "text-slate-600"} animate-pulse`} />
                </div>
            </div>

            <p className={`text-lg font-medium z-10 ${isDark ? "text-slate-200" : "text-slate-700"}`}>Đang mở kỷ yếu...</p>
            <p className={`text-sm mt-2 z-10 ${isDark ? "text-slate-300/60" : "text-slate-500/60"}`}>Lật từng trang ký ức</p>

            <style jsx>{`
                @keyframes flip-page {
                    0% { transform: rotateY(0deg) translateY(0); opacity: 0.6; }
                    50% { transform: rotateY(180deg) translateY(-20px); opacity: 1; }
                    100% { transform: rotateY(360deg) translateY(0); opacity: 0.6; }
                }
                .animate-flip-page {
                    animation: flip-page ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}

function GradGroupLoading({ isDark }: { isDark: boolean }) {
    return (
        <div className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden ${isDark ? "bg-gradient-to-br from-blue-950 via-indigo-950 to-violet-950" : "bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50"}`}>
            {/* Road Map */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute top-1/2 left-0 right-0 h-2 ${isDark ? "bg-white/10" : "bg-white/60"} rounded-full`} />
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className={`absolute top-1/2 ${isDark ? "bg-blue-400/40" : "bg-blue-400/60"} rounded-full animate-move-car`}
                        style={{
                            left: `${i * 25}%`,
                            width: "20px",
                            height: "20px",
                            animationDuration: `${4 + Math.random() * 2}s`,
                            animationDelay: `${i * 0.5}s`,
                        }}
                    />
                ))}
            </div>

            {/* Car Icon */}
            <div className="relative z-10 mb-8">
                <div className={`relative w-24 h-24 rounded-2xl ${isDark ? "bg-blue-900/50" : "bg-blue-100"} backdrop-blur-sm shadow-2xl flex items-center justify-center border-2 ${isDark ? "border-blue-700/30" : "border-blue-200"}`}>
                    <Users className={`w-12 h-12 ${isDark ? "text-blue-300" : "text-blue-600"} animate-bounce`} />
                </div>
            </div>

            <p className={`text-lg font-medium z-10 ${isDark ? "text-blue-200" : "text-blue-700"}`}>Đang bắt đầu hành trình...</p>
            <p className={`text-sm mt-2 z-10 ${isDark ? "text-blue-300/60" : "text-blue-500/60"}`}>Chuyến xe thanh xuân</p>

            <style jsx>{`
                @keyframes move-car {
                    0% { transform: translateX(-100px); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateX(100px); opacity: 0; }
                }
                .animate-move-car {
                    animation: move-car linear infinite;
                }
            `}</style>
        </div>
    );
}

function WeddingLoading({ isDark }: { isDark: boolean }) {
    return (
        <div className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden ${isDark ? "bg-gradient-to-br from-amber-950 via-rose-950 to-pink-950" : "bg-gradient-to-br from-amber-50 via-rose-50 to-pink-50"}`}>
            {/* Sparkles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(10)].map((_, i) => (
                    <Sparkles
                        key={i}
                        className={`absolute ${isDark ? "text-amber-300/40" : "text-amber-400/60"} animate-sparkle`}
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            width: `${15 + Math.random() * 15}px`,
                            height: `${15 + Math.random() * 15}px`,
                            animationDuration: `${2 + Math.random() * 2}s`,
                            animationDelay: `${i * 0.3}s`,
                        }}
                    />
                ))}
            </div>

            {/* Envelope */}
            <div className="relative z-10 mb-8">
                <div className={`relative w-24 h-24 rounded-2xl ${isDark ? "bg-amber-900/50" : "bg-amber-100"} backdrop-blur-sm shadow-2xl flex items-center justify-center border-2 ${isDark ? "border-amber-700/30" : "border-amber-200"}`}>
                    <Gift className={`w-12 h-12 ${isDark ? "text-amber-300" : "text-amber-600"} animate-pulse`} />
                    <div className={`absolute inset-0 rounded-2xl ${isDark ? "bg-amber-500/20" : "bg-amber-400/20"} animate-ping`} />
                </div>
            </div>

            <p className={`text-lg font-medium z-10 ${isDark ? "text-amber-200" : "text-amber-700"}`}>Đang mở thiệp mời...</p>
            <p className={`text-sm mt-2 z-10 ${isDark ? "text-rose-300/60" : "text-rose-500/60"}`}>Một tình yêu đẹp đang chờ</p>

            <style jsx>{`
                @keyframes sparkle {
                    0%, 100% { opacity: 0; transform: scale(0); }
                    50% { opacity: 1; transform: scale(1); }
                }
                .animate-sparkle {
                    animation: sparkle ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}

function TravelLoading({ isDark }: { isDark: boolean }) {
    return (
        <div className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden ${isDark ? "bg-gradient-to-br from-sky-950 via-cyan-950 to-teal-950" : "bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50"}`}>
            {/* Map Pins */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <MapPin
                        key={i}
                        className={`absolute ${isDark ? "text-sky-400/40" : "text-sky-500/60"} animate-bounce-pin`}
                        style={{
                            left: `${15 + i * 15}%`,
                            top: `${30 + (i % 3) * 20}%`,
                            width: `${25 + Math.random() * 15}px`,
                            height: `${25 + Math.random() * 15}px`,
                            animationDuration: `${2 + Math.random() * 2}s`,
                            animationDelay: `${i * 0.3}s`,
                        }}
                    />
                ))}
            </div>

            {/* Compass */}
            <div className="relative z-10 mb-8">
                <div className={`relative w-24 h-24 rounded-full ${isDark ? "bg-sky-900/50" : "bg-sky-100"} backdrop-blur-sm shadow-2xl flex items-center justify-center border-2 ${isDark ? "border-sky-700/30" : "border-sky-200"}`}>
                    <Plane className={`w-12 h-12 ${isDark ? "text-sky-300" : "text-sky-600"} animate-fly`} />
                </div>
            </div>

            <p className={`text-lg font-medium z-10 ${isDark ? "text-sky-200" : "text-sky-700"}`}>Đang khám phá bản đồ...</p>
            <p className={`text-sm mt-2 z-10 ${isDark ? "text-sky-300/60" : "text-sky-500/60"}`}>Những chuyến đi đáng nhớ</p>

            <style jsx>{`
                @keyframes bounce-pin {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes fly {
                    0%, 100% { transform: translateX(0) rotate(0deg); }
                    25% { transform: translateX(5px) rotate(5deg); }
                    75% { transform: translateX(-5px) rotate(-5deg); }
                }
                .animate-bounce-pin { animation: bounce-pin ease-in-out infinite; }
                .animate-fly { animation: fly ease-in-out infinite; }
            `}</style>
        </div>
    );
}

function FriendshipLoading({ isDark }: { isDark: boolean }) {
    return (
        <div className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden ${isDark ? "bg-gradient-to-br from-violet-950 via-purple-950 to-pink-950" : "bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50"}`}>
            {/* Chat Bubbles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className={`absolute ${isDark ? "bg-white/10" : "bg-white/60"} rounded-2xl animate-float-chat`}
                        style={{
                            left: `${10 + i * 12}%`,
                            width: `${60 + Math.random() * 40}px`,
                            height: `${30 + Math.random() * 20}px`,
                            animationDuration: `${4 + Math.random() * 3}s`,
                            animationDelay: `${i * 0.4}s`,
                        }}
                    />
                ))}
            </div>

            {/* Chat Icon */}
            <div className="relative z-10 mb-8">
                <div className={`relative w-24 h-24 rounded-2xl ${isDark ? "bg-violet-900/50" : "bg-violet-100"} backdrop-blur-sm shadow-2xl flex items-center justify-center border-2 ${isDark ? "border-violet-700/30" : "border-violet-200"}`}>
                    <MessageCircle className={`w-12 h-12 ${isDark ? "text-violet-300" : "text-violet-600"} animate-pulse`} />
                    <div className={`absolute inset-0 rounded-2xl ${isDark ? "bg-violet-500/20" : "bg-violet-400/20"} animate-ping`} />
                </div>
            </div>

            <p className={`text-lg font-medium z-10 ${isDark ? "text-violet-200" : "text-violet-700"}`}>Đang tải tin nhắn...</p>
            <p className={`text-sm mt-2 z-10 ${isDark ? "text-violet-300/60" : "text-violet-500/60"}`}>Những cuộc trò chuyện vui vẻ</p>

            <style jsx>{`
                @keyframes float-chat {
                    0% { transform: translateY(100vh) scale(0); opacity: 0; }
                    10% { opacity: 0.6; }
                    90% { opacity: 0.6; }
                    100% { transform: translateY(-100px) scale(1); opacity: 0; }
                }
                .animate-float-chat {
                    animation: float-chat linear infinite;
                }
            `}</style>
        </div>
    );
}

function DefaultLoading({ isDark }: { isDark: boolean }) {
    return (
        <div className={`min-h-screen flex flex-col items-center justify-center ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
            <div className={`relative w-20 h-20 rounded-full ${isDark ? "bg-gray-800" : "bg-white"} shadow-2xl flex items-center justify-center mb-6`}>
                <Heart className={`w-10 h-10 ${isDark ? "text-rose-400" : "text-rose-500"} fill-current animate-pulse`} />
                <div className={`absolute inset-0 rounded-full ${isDark ? "bg-rose-500/20" : "bg-rose-400/20"} animate-ping`} />
            </div>
            <p className={`text-lg font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>Đang tải kỷ niệm...</p>
        </div>
    );
}
