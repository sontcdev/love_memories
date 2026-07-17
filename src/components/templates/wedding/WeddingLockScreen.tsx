"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

interface WeddingLockScreenProps {
    onUnlock: () => void;
    correctPin: string;
    coupleNames?: string;
}

export function WeddingLockScreen({ onUnlock, correctPin, coupleNames }: WeddingLockScreenProps) {
    const [pin, setPin] = useState("");
    const [error, setError] = useState(false);
    const [petals, setPetals] = useState<Array<{ id: number; x: number; delay: number; size: number }>>([]);

    useEffect(() => {
        const newPetals = Array.from({ length: 30 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 5,
            size: Math.random() * 20 + 10,
        }));
        setPetals(newPetals);
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
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center p-4 relative overflow-hidden">
            <style jsx>{`
                @keyframes fall {
                    0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
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
                @keyframes float-gentle {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                .animate-shimmer {
                    background: linear-gradient(90deg, transparent, rgba(255,215,0,0.3), transparent);
                    background-size: 200% 100%;
                    animation: shimmer 3s infinite;
                }
            `}</style>

            {petals.map((petal) => (
                <div
                    key={petal.id}
                    className="absolute pointer-events-none"
                    style={{
                        left: `${petal.x}%`,
                        width: `${petal.size}px`,
                        height: `${petal.size}px`,
                        animation: `fall 10s linear infinite`,
                        animationDelay: `${petal.delay}s`,
                    }}
                >
                    <div className="w-full h-full bg-gradient-to-br from-pink-200 to-rose-300 rounded-full opacity-60"></div>
                </div>
            ))}

            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md w-full relative z-10 border-4 border-amber-200">
                <div className="absolute -top-2 -left-2 -right-2 -bottom-2 border-2 border-amber-300/30 rounded-3xl pointer-events-none"></div>
                <div className="absolute -top-4 -left-4 w-8 h-8 border-t-4 border-l-4 border-amber-400 rounded-tl-3xl"></div>
                <div className="absolute -top-4 -right-4 w-8 h-8 border-t-4 border-r-4 border-amber-400 rounded-tr-3xl"></div>
                <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b-4 border-l-4 border-amber-400 rounded-bl-3xl"></div>
                <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-4 border-r-4 border-amber-400 rounded-br-3xl"></div>
                
                <div className="text-center mb-8">
                    <div className="relative inline-flex items-center justify-center w-28 h-28 mb-4" style={{animation: 'float-gentle 3s ease-in-out infinite'}}>
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full animate-ping opacity-20"></div>
                        <div className="relative bg-gradient-to-br from-amber-400 to-orange-500 rounded-full w-full h-full flex items-center justify-center shadow-xl border-4 border-white">
                            <Heart className="w-14 h-14 text-white fill-current" />
                        </div>
                    </div>
                    {coupleNames && (
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 bg-clip-text text-transparent mb-2 animate-shimmer" style={{backgroundSize: '200% auto'}}>
                            {coupleNames}
                        </h1>
                    )}
                    <p className="text-gray-600 flex items-center justify-center gap-2">
                        <Heart className="w-4 h-4 text-amber-600 fill-current animate-pulse" />
                        Enter PIN to view wedding memories
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-center gap-3">
                        {[0, 1, 2, 3].map((index) => (
                            <div
                                key={index}
                                className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
                                    pin[index]
                                        ? "bg-gradient-to-br from-amber-400 to-orange-500 border-amber-300 text-white shadow-lg scale-110"
                                        : "border-amber-200 bg-amber-50"
                                } ${error ? "animate-shake" : ""}`}
                                style={pin[index] ? { animation: 'bounce-in 0.3s ease-out' } : {}}
                            >
                                {pin[index] ? "💍" : ""}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <button
                                key={num}
                                onClick={() => handlePinChange(pin + num)}
                                className="aspect-square rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border-2 border-amber-200 text-2xl font-bold text-amber-700 transition-all duration-200 hover:scale-110 hover:shadow-lg active:scale-95 shadow-md hover:border-amber-400"
                            >
                                {num}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePinChange(pin + "0")}
                            className="aspect-square rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border-2 border-amber-200 text-2xl font-bold text-amber-700 transition-all duration-200 hover:scale-110 hover:shadow-lg active:scale-95 shadow-md hover:border-amber-400"
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
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold text-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 disabled:scale-100 shadow-lg disabled:shadow-none relative overflow-hidden group"
                    >
                        <span className="relative z-10">Unlock Memories</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    </button>

                    {error && (
                        <p className="text-center text-red-500 font-medium animate-pulse">
                            Incorrect PIN. Try again! 💍
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
