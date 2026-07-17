"use client";

import { Heart, Sparkles, BookOpen, Music, Star, GraduationCap, Users, MapPin, MessageCircle, Plane, Gift, Loader2, Palette } from "lucide-react";
import type { LinkType } from "@prisma/client";

interface EditTemplateLoadingProps {
    linkType: LinkType;
}

export function EditTemplateLoading({ linkType }: EditTemplateLoadingProps) {
    switch (linkType) {
        case "LOVE":
            return <LoveEditLoading />;
        case "LOVE2":
            return <Love2EditLoading />;
        case "IDOL":
            return <IdolEditLoading />;
        case "GRAD_PERSONAL":
            return <GradPersonalEditLoading />;
        case "GRAD_CLASS":
            return <GradClassEditLoading />;
        case "GRAD_GROUP":
            return <GradGroupEditLoading />;
        case "WEDDING":
            return <WeddingEditLoading />;
        case "TRAVEL":
            return <TravelEditLoading />;
        case "FRIENDSHIP":
            return <FriendshipEditLoading />;
        default:
            return <DefaultEditLoading />;
    }
}

function DefaultEditLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute animate-float-up"
                        style={{
                            left: `${10 + i * 12}%`,
                            animationDuration: `${6 + Math.random() * 4}s`,
                            animationDelay: `${i * 0.3}s`,
                        }}
                    >
                        {i % 2 === 0 ? (
                            <Heart className="text-rose-300/40 fill-rose-300/40 w-6 h-6" />
                        ) : (
                            <Sparkles className="text-amber-300/40 w-5 h-5" />
                        )}
                    </div>
                ))}
            </div>

            <div className="relative z-10 flex flex-col items-center">
                <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center">
                        <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
                    </div>
                    <div className="absolute inset-0 w-20 h-20 bg-rose-400/20 rounded-full animate-ping" />
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">Đang tải trang chỉnh sửa</h2>
                <p className="text-gray-500 text-sm">Chuẩn bị không gian sáng tạo...</p>
            </div>

            <style jsx>{`
                @keyframes float-up {
                    0% { transform: translateY(100vh) scale(0); opacity: 0; }
                    10% { opacity: 0.4; }
                    90% { opacity: 0.4; }
                    100% { transform: translateY(-100px) scale(1); opacity: 0; }
                }
                .animate-float-up {
                    animation: float-up linear infinite;
                }
            `}</style>
        </div>
    );
}

function LoveEditLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(10)].map((_, i) => (
                    <Heart
                        key={i}
                        className="absolute text-rose-300/30 fill-rose-300/30 animate-float-heart"
                        style={{
                            left: `${10 + i * 10}%`,
                            width: `${20 + Math.random() * 20}px`,
                            height: `${20 + Math.random() * 20}px`,
                            animationDuration: `${5 + Math.random() * 5}s`,
                            animationDelay: `${i * 0.4}s`,
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 flex flex-col items-center">
                <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-2xl bg-white/80 backdrop-blur-sm shadow-2xl flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-rose-500 animate-pulse" />
                    </div>
                    <div className="absolute inset-0 w-24 h-24 bg-rose-400/20 rounded-2xl animate-ping" />
                </div>

                <h2 className="text-2xl font-bold text-rose-800 mb-2">Đang mở câu chuyện...</h2>
                <p className="text-rose-500 text-sm">Lật từng trang kỷ niệm tình yêu</p>

                <div className="mt-8 flex gap-3">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="w-16 h-20 bg-white/60 rounded-lg shadow-md animate-shimmer"
                            style={{ animationDelay: `${i * 100}ms` }}
                        />
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes float-heart {
                    0% { transform: translateY(100vh) scale(0) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.3; }
                    90% { opacity: 0.3; }
                    100% { transform: translateY(-100px) scale(1) rotate(360deg); opacity: 0; }
                }
                @keyframes shimmer {
                    0% { opacity: 0.6; }
                    50% { opacity: 0.3; }
                    100% { opacity: 0.6; }
                }
                .animate-float-heart { animation: float-heart linear infinite; }
                .animate-shimmer { animation: shimmer 1.5s ease-in-out infinite; }
            `}</style>
        </div>
    );
}

function Love2EditLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute bg-white/60 rounded-lg shadow-lg animate-float-polaroid"
                        style={{
                            left: `${15 + i * 12}%`,
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

            <div className="relative z-10 flex flex-col items-center">
                <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-2xl bg-amber-100 backdrop-blur-sm shadow-2xl flex items-center justify-center border-2 border-amber-200">
                        <Gift className="w-12 h-12 text-amber-600 animate-bounce" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-amber-800 mb-2">Đang sắp xếp bàn làm việc...</h2>
                <p className="text-amber-500 text-sm">Chuẩn bị không gian sáng tạo</p>
            </div>

            <style jsx>{`
                @keyframes float-polaroid {
                    0%, 100% { transform: translateY(0) rotate(var(--rotation, 0deg)); }
                    50% { transform: translateY(-15px) rotate(var(--rotation, 0deg)); }
                }
                .animate-float-polaroid { animation: float-polaroid ease-in-out infinite; }
            `}</style>
        </div>
    );
}

function IdolEditLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-950 via-pink-950 to-blue-950 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-32 h-96 bg-purple-500/20 blur-3xl animate-spotlight-1" />
                <div className="absolute top-0 right-1/4 w-32 h-96 bg-pink-500/20 blur-3xl animate-spotlight-2" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
                <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 shadow-2xl flex items-center justify-center">
                        <Music className="w-12 h-12 text-white animate-pulse" />
                        <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
                    </div>
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className="absolute text-yellow-300 fill-current animate-float-star"
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

                <h2 className="text-2xl font-bold text-purple-200 mb-2">Đang bật sân khấu...</h2>
                <p className="text-pink-300/60 text-sm">Chuẩn bị concert cho idol</p>
            </div>

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

function GradPersonalEditLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute bg-white/60 rounded-xl shadow-lg animate-float-window"
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

            <div className="relative z-10 flex flex-col items-center">
                <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-2xl bg-emerald-100 backdrop-blur-sm shadow-2xl flex items-center justify-center border-2 border-emerald-200">
                        <GraduationCap className="w-12 h-12 text-emerald-600 animate-bounce" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-emerald-800 mb-2">Đang tải desktop...</h2>
                <p className="text-emerald-500 text-sm">Kỷ niệm tốt nghiệp của bạn</p>
            </div>

            <style jsx>{`
                @keyframes float-window {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-float-window { animation: float-window ease-in-out infinite; }
            `}</style>
        </div>
    );
}

function GradClassEditLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-zinc-100 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-slate-200/50 backdrop-blur-sm" />

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute bg-white/60 rounded shadow-lg animate-flip-page"
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

            <div className="relative z-10 flex flex-col items-center">
                <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-2xl bg-white/80 backdrop-blur-sm shadow-2xl flex items-center justify-center border-2 border-slate-200">
                        <BookOpen className="w-12 h-12 text-slate-600 animate-pulse" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-700 mb-2">Đang mở kỷ yếu...</h2>
                <p className="text-slate-500 text-sm">Lật từng trang ký ức</p>
            </div>

            <style jsx>{`
                @keyframes flip-page {
                    0% { transform: rotateY(0deg) translateY(0); opacity: 0.6; }
                    50% { transform: rotateY(180deg) translateY(-20px); opacity: 1; }
                    100% { transform: rotateY(360deg) translateY(0); opacity: 0.6; }
                }
                .animate-flip-page { animation: flip-page ease-in-out infinite; }
            `}</style>
        </div>
    );
}

function GradGroupEditLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-0 right-0 h-2 bg-white/60 rounded-full" />
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute top-1/2 bg-blue-400/60 rounded-full animate-move-car"
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

            <div className="relative z-10 flex flex-col items-center">
                <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-2xl bg-blue-100 backdrop-blur-sm shadow-2xl flex items-center justify-center border-2 border-blue-200">
                        <Users className="w-12 h-12 text-blue-600 animate-bounce" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-blue-800 mb-2">Đang bắt đầu hành trình...</h2>
                <p className="text-blue-500 text-sm">Chuyến xe thanh xuân</p>
            </div>

            <style jsx>{`
                @keyframes move-car {
                    0% { transform: translateX(-100px); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateX(100px); opacity: 0; }
                }
                .animate-move-car { animation: move-car linear infinite; }
            `}</style>
        </div>
    );
}

function WeddingEditLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-pink-50 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(10)].map((_, i) => (
                    <Sparkles
                        key={i}
                        className="absolute text-amber-400/60 animate-sparkle"
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

            <div className="relative z-10 flex flex-col items-center">
                <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-2xl bg-amber-100 backdrop-blur-sm shadow-2xl flex items-center justify-center border-2 border-amber-200">
                        <Palette className="w-12 h-12 text-amber-600 animate-pulse" />
                        <div className="absolute inset-0 rounded-2xl bg-amber-400/20 animate-ping" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-amber-800 mb-2">Đang mở thiệp mời...</h2>
                <p className="text-rose-500 text-sm">Chuẩn bị không gian chỉnh sửa</p>
            </div>

            <style jsx>{`
                @keyframes sparkle {
                    0%, 100% { opacity: 0; transform: scale(0); }
                    50% { opacity: 1; transform: scale(1); }
                }
                .animate-sparkle { animation: sparkle ease-in-out infinite; }
            `}</style>
        </div>
    );
}

function TravelEditLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <MapPin
                        key={i}
                        className="absolute text-sky-500/60 animate-bounce-pin"
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

            <div className="relative z-10 flex flex-col items-center">
                <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-full bg-sky-100 backdrop-blur-sm shadow-2xl flex items-center justify-center border-2 border-sky-200">
                        <Plane className="w-12 h-12 text-sky-600 animate-fly" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-sky-800 mb-2">Đang khám phá bản đồ...</h2>
                <p className="text-sky-500 text-sm">Chuẩn bị hành trình chỉnh sửa</p>
            </div>

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

function FriendshipEditLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute bg-white/60 rounded-2xl animate-float-chat"
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

            <div className="relative z-10 flex flex-col items-center">
                <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-2xl bg-violet-100 backdrop-blur-sm shadow-2xl flex items-center justify-center border-2 border-violet-200">
                        <MessageCircle className="w-12 h-12 text-violet-600 animate-pulse" />
                        <div className="absolute inset-0 rounded-2xl bg-violet-400/20 animate-ping" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-violet-800 mb-2">Đang tải tin nhắn...</h2>
                <p className="text-violet-500 text-sm">Chuẩn bị không gian trò chuyện</p>
            </div>

            <style jsx>{`
                @keyframes float-chat {
                    0% { transform: translateY(100vh) scale(0); opacity: 0; }
                    10% { opacity: 0.6; }
                    90% { opacity: 0.6; }
                    100% { transform: translateY(-100px) scale(1); opacity: 0; }
                }
                .animate-float-chat { animation: float-chat linear infinite; }
            `}</style>
        </div>
    );
}
