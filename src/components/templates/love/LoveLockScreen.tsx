"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

interface LoveLockScreenProps {
    onUnlock: () => void;
    correctPin: string;
    coupleNames?: string;
}

export function LoveLockScreen({ onUnlock, correctPin, coupleNames }: LoveLockScreenProps) {
    const [pin, setPin] = useState("");
    const [error, setError] = useState(false);
    const [hearts, setHearts] = useState<Array<{ id: number; x: number; delay: number }>>([]);

    useEffect(() => {
        const newHearts = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 5,
        }));
        setHearts(newHearts);
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
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-100 to-red-100 flex items-center justify-center p-4 relative overflow-hidden">
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
                }
                @keyframes pulse-ring {
                    0% { transform: scale(0.8); opacity: 1; }
                    100% { transform: scale(1.5); opacity: 0; }
                }
                @keyframes shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes bounce-in {
                    0% { transform: scale(0); opacity: 0; }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-shimmer {
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                    background-size: 200% 100%;
                    animation: shimmer 2s infinite;
                }
            `}</style>

            {hearts.map((heart) => (
                <div
                    key={heart.id}
                    className="absolute text-pink-300 pointer-events-none"
                    style={{
                        left: `${heart.x}%`,
                        animation: `float 10s linear infinite`,
                        animationDelay: `${heart.delay}s`,
                    }}
                >
                    <Heart className="w-8 h-8 fill-current" />
                </div>
            ))}

            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-md w-full relative z-10 border-2 border-pink-200/50">
                <div className="text-center mb-8">
                    <div className="relative inline-flex items-center justify-center w-24 h-24 mb-4">
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full animate-ping opacity-20"></div>
                        <div className="relative bg-gradient-to-br from-pink-400 to-rose-500 rounded-full w-full h-full flex items-center justify-center shadow-xl">
                            <Heart className="w-12 h-12 text-white fill-current" />
                        </div>
                    </div>
                    {coupleNames && (
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 bg-clip-text text-transparent mb-2 animate-shimmer" style={{backgroundSize: '200% auto'}}>
                            {coupleNames}
                        </h1>
                    )}
                    <p className="text-gray-600 text-sm">Enter PIN to unlock our memories</p>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-center gap-3">
                        {[0, 1, 2, 3].map((index) => (
                            <div
                                key={index}
                                className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
                                    pin[index]
                                        ? "bg-gradient-to-br from-pink-400 to-rose-500 border-pink-500 text-white shadow-lg scale-110"
                                        : "border-pink-200 bg-white"
                                } ${error ? "animate-shake" : ""}`}
                                style={pin[index] ? { animation: 'bounce-in 0.3s ease-out' } : {}}
                            >
                                {pin[index] ? "♥" : ""}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <button
                                key={num}
                                onClick={() => handlePinChange(pin + num)}
                                className="aspect-square rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 border-2 border-pink-200 text-2xl font-bold text-pink-600 transition-all duration-200 hover:scale-110 hover:shadow-lg active:scale-95 shadow-md hover:border-pink-400"
                            >
                                {num}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePinChange(pin + "0")}
                            className="aspect-square rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 border-2 border-pink-200 text-2xl font-bold text-pink-600 transition-all duration-200 hover:scale-110 hover:shadow-lg active:scale-95 shadow-md hover:border-pink-400"
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
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold text-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 disabled:scale-100 shadow-lg disabled:shadow-none relative overflow-hidden group"
                    >
                        <span className="relative z-10">Unlock Memories</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    </button>

                    {error && (
                        <p className="text-center text-red-500 font-medium animate-pulse">
                            Incorrect PIN. Try again! 💔
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
