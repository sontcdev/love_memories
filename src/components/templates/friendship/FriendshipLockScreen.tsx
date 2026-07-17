"use client";

import { useState, useEffect } from "react";
import { Smile, Users, Star } from "lucide-react";

interface FriendshipLockScreenProps {
    onUnlock: () => void;
    groupName?: string;
}

export function FriendshipLockScreen({ onUnlock, groupName = "Nhóm bạn" }: FriendshipLockScreenProps) {
    const [pin, setPin] = useState("");
    const [error, setError] = useState(false);
    const [storedPin, setStoredPin] = useState<string | null>(null);

    useEffect(() => {
        const savedPin = localStorage.getItem(`friendship_pin_${groupName}`);
        if (savedPin) {
            setStoredPin(savedPin);
        }
    }, [groupName]);

    const handlePinChange = (value: string) => {
        if (value.length <= 4) {
            setPin(value);
            setError(false);
        }
    };

    const handleSubmit = () => {
        if (storedPin) {
            if (pin === storedPin) {
                onUnlock();
            } else {
                setError(true);
                setTimeout(() => setPin(""), 300);
            }
        } else {
            if (pin.length === 4) {
                localStorage.setItem(`friendship_pin_${groupName}`, pin);
                setStoredPin(pin);
                onUnlock();
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-100 via-white to-pink-100 flex items-center justify-center p-4 relative overflow-hidden">
            <style jsx>{`
                @keyframes bounce-in {
                    0% { transform: scale(0); opacity: 0; }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes float-emoji {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(10deg); }
                }
                @keyframes confetti-fall {
                    0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                }
                .animate-shimmer {
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                    background-size: 200% 100%;
                    animation: shimmer 2s infinite;
                }
            `}</style>

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-32 h-32 bg-violet-200/30 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-40 h-40 bg-pink-200/30 rounded-full blur-3xl" />
                {Array.from({ length: 15 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute text-2xl pointer-events-none"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animation: `float-emoji 3s ease-in-out infinite`,
                            animationDelay: `${i * 0.2}s`,
                        }}
                    >
                        {['🎉', '✨', '🌟', '💫', '🎊'][i % 5]}
                    </div>
                ))}
            </div>

            <div className="relative w-full max-w-sm">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-2 border-violet-200 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{backgroundSize: '200% 100%'}}></div>
                    
                    <div className="text-center mb-8 relative">
                        <div className="relative inline-flex items-center justify-center w-24 h-24 mb-4" style={{animation: 'float-emoji 2s ease-in-out infinite'}}>
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-pink-400 rounded-full animate-ping opacity-20"></div>
                            <div className="relative bg-gradient-to-br from-violet-400 to-pink-400 rounded-full w-full h-full flex items-center justify-center shadow-lg">
                                <Users className="w-12 h-12 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-pink-600 to-violet-600 bg-clip-text text-transparent mb-2 animate-shimmer" style={{backgroundSize: '200% auto'}}>
                            {groupName}
                        </h1>
                        <div className="flex items-center justify-center gap-1 text-violet-600 text-sm">
                            <Star className="w-4 h-4 fill-violet-400 text-violet-400 animate-pulse" />
                            <span>Tình bạn vĩnh cửu</span>
                        </div>
                    </div>

                    <div className="space-y-4 relative">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-2">
                                {storedPin ? "Nhập mã PIN để tiếp tục" : "Tạo mã PIN 4 số"}
                            </p>
                            <div className="flex justify-center gap-2">
                                {[0, 1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className={`w-4 h-4 rounded-full transition-all duration-300 ${
                                            i < pin.length
                                                ? error
                                                    ? "bg-red-400 scale-110"
                                                    : "bg-gradient-to-br from-violet-400 to-pink-400 scale-110"
                                                : "bg-gray-200"
                                        }`}
                                        style={i < pin.length ? { animation: 'bounce-in 0.3s ease-out' } : {}}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "del"].map((num, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        if (num === "del") {
                                            setPin(pin.slice(0, -1));
                                        } else if (num !== null && pin.length < 4) {
                                            handlePinChange(pin + num);
                                        }
                                    }}
                                    disabled={num === null}
                                    className={`h-14 rounded-xl font-semibold text-lg transition-all duration-200 ${
                                        num === null
                                            ? "invisible"
                                            : num === "del"
                                            ? "bg-gray-100 hover:bg-gray-200 text-gray-600 hover:scale-110 hover:shadow-lg active:scale-95"
                                            : "bg-gradient-to-br from-violet-50 to-pink-50 hover:from-violet-100 hover:to-pink-100 text-violet-800 shadow-sm hover:shadow-lg hover:scale-110 active:scale-95 border-2 border-transparent hover:border-violet-300"
                                    }`}
                                >
                                    {num === "del" ? "←" : num}
                                </button>
                            ))}
                        </div>

                        {error && (
                            <p className="text-center text-sm text-red-500 animate-pulse">
                                Mã PIN không đúng
                            </p>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={pin.length !== 4}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-400 to-pink-400 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:from-violet-500 hover:to-pink-500 hover:scale-105 active:scale-95 relative overflow-hidden group"
                        >
                            <span className="relative z-10">
                                <Smile className="w-5 h-5 inline mr-2" />
                                {storedPin ? "Mở khóa" : "Bắt đầu"}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
