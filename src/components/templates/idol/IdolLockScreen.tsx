"use client";

import { useState, useEffect } from "react";
import { Star, Music } from "lucide-react";

interface IdolLockScreenProps {
    onUnlock: () => void;
    correctPin: string;
    idolName?: string;
}

export function IdolLockScreen({ onUnlock, correctPin, idolName }: IdolLockScreenProps) {
    const [pin, setPin] = useState("");
    const [error, setError] = useState(false);
    const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([]);

    useEffect(() => {
        const newStars = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            delay: Math.random() * 3,
        }));
        setStars(newStars);
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
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
            <style jsx>{`
                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.5); }
                }
                @keyframes glow {
                    0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.5); }
                    50% { box-shadow: 0 0 40px rgba(251, 191, 36, 0.8), 0 0 60px rgba(251, 191, 36, 0.4); }
                }
                @keyframes spotlight {
                    0%, 100% { opacity: 0.3; transform: translateX(-50%) scale(1); }
                    50% { opacity: 0.6; transform: translateX(-50%) scale(1.2); }
                }
                @keyframes holographic {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
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
                .animate-shimmer {
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                    background-size: 200% 100%;
                    animation: shimmer 2s infinite;
                }
            `}</style>

            <div className="absolute inset-0">
                {stars.map((star) => (
                    <div
                        key={star.id}
                        className="absolute rounded-full bg-yellow-300"
                        style={{
                            left: `${star.x}%`,
                            top: `${star.y}%`,
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                            animation: `twinkle 2s ease-in-out infinite`,
                            animationDelay: `${star.delay}s`,
                        }}
                    />
                ))}
            </div>

            <div className="absolute top-0 left-1/2 w-96 h-96 bg-gradient-to-b from-yellow-400/20 to-transparent rounded-full blur-3xl" style={{animation: 'spotlight 4s ease-in-out infinite'}}></div>

            <div className="bg-gradient-to-br from-purple-800/90 to-indigo-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full relative z-10 border-2 border-yellow-400/50 overflow-hidden" style={{
                animation: "glow 3s ease-in-out infinite"
            }}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent animate-shimmer" style={{backgroundSize: '200% 100%'}}></div>
                
                <div className="text-center mb-8 relative">
                    <div className="relative inline-flex items-center justify-center w-28 h-28 mb-4">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-ping opacity-20"></div>
                        <div className="absolute inset-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full animate-pulse opacity-30"></div>
                        <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full w-full h-full flex items-center justify-center shadow-2xl border-4 border-yellow-300">
                            <Star className="w-14 h-14 text-white fill-current" />
                        </div>
                    </div>
                    {idolName && (
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 bg-clip-text text-transparent mb-2 animate-shimmer" style={{backgroundSize: '200% auto'}}>
                            {idolName}
                        </h1>
                    )}
                    <p className="text-purple-200 flex items-center justify-center gap-2">
                        <Music className="w-4 h-4 animate-pulse" />
                        Enter PIN to access the fanzone
                    </p>
                </div>

                <div className="space-y-4 relative">
                    <div className="flex justify-center gap-3">
                        {[0, 1, 2, 3].map((index) => (
                            <div
                                key={index}
                                className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
                                    pin[index]
                                        ? "bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-300 text-white shadow-lg scale-110"
                                        : "border-purple-500/50 bg-purple-900/50"
                                } ${error ? "animate-shake" : ""}`}
                                style={pin[index] ? { animation: 'bounce-in 0.3s ease-out' } : {}}
                            >
                                {pin[index] ? "★" : ""}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <button
                                key={num}
                                onClick={() => handlePinChange(pin + num)}
                                className="aspect-square rounded-xl bg-gradient-to-br from-purple-700 to-indigo-800 hover:from-purple-600 hover:to-indigo-700 border-2 border-yellow-400/30 text-2xl font-bold text-yellow-300 transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg hover:shadow-yellow-400/50 hover:border-yellow-400/60"
                            >
                                {num}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePinChange(pin + "0")}
                            className="aspect-square rounded-xl bg-gradient-to-br from-purple-700 to-indigo-800 hover:from-purple-600 hover:to-indigo-700 border-2 border-yellow-400/30 text-2xl font-bold text-yellow-300 transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg hover:shadow-yellow-400/50 hover:border-yellow-400/60"
                        >
                            0
                        </button>
                        <button
                            onClick={() => setPin(pin.slice(0, -1))}
                            className="aspect-square rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 border-2 border-gray-500/30 text-xl font-bold text-gray-300 transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg hover:border-gray-400/60"
                        >
                            ←
                        </button>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={pin.length !== 4}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 hover:from-yellow-500 hover:via-orange-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold text-lg transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-yellow-400/30 active:scale-95 disabled:scale-100 shadow-lg disabled:shadow-none relative overflow-hidden group"
                    >
                        <span className="relative z-10">Enter Fanzone</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    </button>

                    {error && (
                        <p className="text-center text-red-400 font-medium animate-pulse">
                            Wrong PIN! Try again ⚡
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
