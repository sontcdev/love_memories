"use client";

import { useState, useEffect } from "react";
import { Users, Bus } from "lucide-react";

interface GradGroupLockScreenProps {
    onUnlock: () => void;
    correctPin: string;
    groupName?: string;
}

export function GradGroupLockScreen({ onUnlock, correctPin, groupName }: GradGroupLockScreenProps) {
    const [pin, setPin] = useState("");
    const [error, setError] = useState(false);
    const [bubbles, setBubbles] = useState<Array<{ id: number; x: number; size: number; delay: number }>>([]);

    useEffect(() => {
        const newBubbles = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            size: Math.random() * 40 + 20,
            delay: Math.random() * 5,
        }));
        setBubbles(newBubbles);
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
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
            <style jsx>{`
                @keyframes rise {
                    0% { transform: translateY(100vh) scale(0); opacity: 0; }
                    10% { opacity: 0.6; }
                    90% { opacity: 0.6; }
                    100% { transform: translateY(-100px) scale(1); opacity: 0; }
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
                @keyframes bus-drive {
                    0%, 100% { transform: translateX(-5px); }
                    50% { transform: translateX(5px); }
                }
                .animate-shimmer {
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                    background-size: 200% 100%;
                    animation: shimmer 2s infinite;
                }
            `}</style>

            <div className="absolute inset-0">
                {bubbles.map((bubble) => (
                    <div
                        key={bubble.id}
                        className="absolute rounded-full bg-gradient-to-br from-blue-400/30 to-purple-400/30 backdrop-blur-sm"
                        style={{
                            left: `${bubble.x}%`,
                            width: `${bubble.size}px`,
                            height: `${bubble.size}px`,
                            animation: `rise 10s linear infinite`,
                            animationDelay: `${bubble.delay}s`,
                        }}
                    />
                ))}
            </div>

            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full relative z-10 border-4 border-blue-300">
                <div className="text-center mb-8">
                    <div className="relative inline-flex items-center justify-center w-28 h-28 mb-4">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-ping opacity-20"></div>
                        <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-full w-full h-full flex items-center justify-center shadow-xl border-4 border-white" style={{animation: 'bus-drive 2s ease-in-out infinite'}}>
                            <Bus className="w-14 h-14 text-white" />
                        </div>
                    </div>
                    {groupName && (
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2 animate-shimmer" style={{backgroundSize: '200% auto'}}>
                            {groupName}
                        </h1>
                    )}
                    <p className="text-gray-600 flex items-center justify-center gap-2">
                        <Users className="w-4 h-4 text-blue-600 animate-pulse" />
                        Enter PIN to view group memories
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-center gap-3">
                        {[0, 1, 2, 3].map((index) => (
                            <div
                                key={index}
                                className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
                                    pin[index]
                                        ? "bg-gradient-to-br from-blue-500 to-purple-600 border-blue-400 text-white shadow-lg scale-110"
                                        : "border-blue-200 bg-blue-50"
                                } ${error ? "animate-shake" : ""}`}
                                style={pin[index] ? { animation: 'bounce-in 0.3s ease-out' } : {}}
                            >
                                {pin[index] ? "🚌" : ""}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <button
                                key={num}
                                onClick={() => handlePinChange(pin + num)}
                                className="aspect-square rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-2 border-blue-200 text-2xl font-bold text-blue-700 transition-all duration-200 hover:scale-110 hover:shadow-lg active:scale-95 shadow-md hover:border-blue-400"
                            >
                                {num}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePinChange(pin + "0")}
                            className="aspect-square rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-2 border-blue-200 text-2xl font-bold text-blue-700 transition-all duration-200 hover:scale-110 hover:shadow-lg active:scale-95 shadow-md hover:border-blue-400"
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
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold text-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 disabled:scale-100 shadow-lg disabled:shadow-none relative overflow-hidden group"
                    >
                        <span className="relative z-10">Start Journey</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    </button>

                    {error && (
                        <p className="text-center text-red-500 font-medium animate-pulse">
                            Incorrect PIN. Try again! 🚌
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
