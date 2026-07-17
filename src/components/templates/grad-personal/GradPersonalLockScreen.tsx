"use client";

import { useState, useEffect } from "react";
import { GraduationCap, Award } from "lucide-react";

interface GradPersonalLockScreenProps {
    onUnlock: () => void;
    correctPin: string;
    graduateName?: string;
}

export function GradPersonalLockScreen({ onUnlock, correctPin, graduateName }: GradPersonalLockScreenProps) {
    const [pin, setPin] = useState("");
    const [error, setError] = useState(false);
    const [confetti, setConfetti] = useState<Array<{ id: number; x: number; delay: number; color: string }>>([]);

    useEffect(() => {
        const colors = ["#10b981", "#059669", "#fbbf24", "#f59e0b"];
        const newConfetti = Array.from({ length: 30 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 5,
            color: colors[Math.floor(Math.random() * colors.length)],
        }));
        setConfetti(newConfetti);
    }, []);

    const handlePinChange = (value: string) => {
        if (value.length <= 4) {
            setPin(value);
            setError(false);
        }
    };

    const handleSubmit = () => {
        if (pin === correctPin) {
            onUnlock();
        } else {
            setError(true);
            setTimeout(() => setPin(""), 500);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
            <style jsx>{`
                @keyframes fall {
                    0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                }
                @keyframes bounce-in {
                    0% { transform: scale(0); opacity: 0; }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes laurel-sway {
                    0%, 100% { transform: rotate(-2deg); }
                    50% { transform: rotate(2deg); }
                }
                .animate-shimmer {
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                    background-size: 200% 100%;
                    animation: shimmer 2s infinite;
                }
            `}</style>

            {confetti.map((item) => (
                <div
                    key={item.id}
                    className="absolute w-2 h-2 rounded-full pointer-events-none"
                    style={{
                        left: `${item.x}%`,
                        backgroundColor: item.color,
                        animation: `fall 10s linear infinite`,
                        animationDelay: `${item.delay}s`,
                    }}
                />
            ))}

            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md w-full relative z-10 border-4 border-emerald-200">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-12 pointer-events-none" style={{animation: 'laurel-sway 3s ease-in-out infinite'}}>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-8 border-l-4 border-emerald-600 rounded-l-full"></div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-8 border-r-4 border-emerald-600 rounded-r-full"></div>
                </div>
                
                <div className="text-center mb-8">
                    <div className="relative inline-flex items-center justify-center w-28 h-28 mb-4">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full animate-ping opacity-20"></div>
                        <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full w-full h-full flex items-center justify-center shadow-xl border-4 border-white">
                            <GraduationCap className="w-14 h-14 text-white" />
                        </div>
                    </div>
                    {graduateName && (
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent mb-2 animate-shimmer" style={{backgroundSize: '200% auto'}}>
                            {graduateName}
                        </h1>
                    )}
                    <p className="text-gray-600 flex items-center justify-center gap-2">
                        <Award className="w-4 h-4 text-emerald-600 animate-pulse" />
                        Enter PIN to view graduation memories
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-center gap-3">
                        {[0, 1, 2, 3].map((index) => (
                            <div
                                key={index}
                                className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
                                    pin[index]
                                        ? "bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 text-white shadow-lg scale-110"
                                        : "border-emerald-200 bg-emerald-50"
                                } ${error ? "animate-shake" : ""}`}
                                style={pin[index] ? { animation: 'bounce-in 0.3s ease-out' } : {}}
                            >
                                {pin[index] ? "🎓" : ""}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <button
                                key={num}
                                onClick={() => handlePinChange(pin + num)}
                                className="aspect-square rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border-2 border-emerald-200 text-2xl font-bold text-emerald-700 transition-all duration-200 hover:scale-110 hover:shadow-lg active:scale-95 shadow-md hover:border-emerald-400"
                            >
                                {num}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePinChange(pin + "0")}
                            className="aspect-square rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border-2 border-emerald-200 text-2xl font-bold text-emerald-700 transition-all duration-200 hover:scale-110 hover:shadow-lg active:scale-95 shadow-md hover:border-emerald-400"
                        >
                            0
                        </button>
                        <button
                            onClick={() => setPin(pin.slice(0, -1))}
                            className="aspect-square rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-2 border-gray-200 text-xl font-bold text-gray-600 transition-all duration-200 hover:scale-110 hover:shadow-lg active:scale-95 shadow-md hover:border-gray-400"
                        >
                            ←
                        </button>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={pin.length !== 4}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold text-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 disabled:scale-100 shadow-lg disabled:shadow-none relative overflow-hidden group"
                    >
                        <span className="relative z-10">Unlock Memories</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    </button>

                    {error && (
                        <p className="text-center text-red-500 font-medium animate-pulse">
                            Incorrect PIN. Try again! 🎓
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
