"use client";

import { useState, useEffect } from "react";
import { School, BookOpen } from "lucide-react";

interface GradClassLockScreenProps {
    onUnlock: () => void;
    correctPin: string;
    className?: string;
}

export function GradClassLockScreen({ onUnlock, correctPin, className }: GradClassLockScreenProps) {
    const [pin, setPin] = useState("");
    const [error, setError] = useState(false);
    const [chalks, setChalks] = useState<Array<{ id: number; x: number; y: number; rotate: number }>>([]);

    useEffect(() => {
        const newChalks = Array.from({ length: 15 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            rotate: Math.random() * 360,
        }));
        setChalks(newChalks);
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
        <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(var(--rotate)); }
                    50% { transform: translateY(-20px) rotate(var(--rotate)); }
                }
                @keyframes chalk-dust {
                    0% { opacity: 0; transform: translateY(0) scale(0); }
                    50% { opacity: 0.5; }
                    100% { opacity: 0; transform: translateY(-30px) scale(1); }
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
                @keyframes chalk-write {
                    0% { clip-path: inset(0 100% 0 0); }
                    100% { clip-path: inset(0 0 0 0); }
                }
                .animate-shimmer {
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    background-size: 200% 100%;
                    animation: shimmer 2s infinite;
                }
            `}</style>

            <div className="absolute inset-0 opacity-10">
                {chalks.map((chalk) => (
                    <div
                        key={chalk.id}
                        className="absolute w-1 h-12 bg-white rounded-full"
                        style={{
                            left: `${chalk.x}%`,
                            top: `${chalk.y}%`,
                            transform: `rotate(${chalk.rotate}deg)`,
                            animation: `float 4s ease-in-out infinite`,
                            animationDelay: `${chalk.id * 0.3}s`,
                        }}
                    />
                ))}
            </div>

            <div className="bg-gradient-to-br from-green-900 to-emerald-900 rounded-3xl shadow-2xl p-8 max-w-md w-full relative z-10 border-8 border-amber-900 overflow-hidden" style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
            }}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" style={{backgroundSize: '200% 100%'}}></div>
                
                <div className="text-center mb-8 relative">
                    <div className="relative inline-flex items-center justify-center w-28 h-28 mb-4">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full animate-ping opacity-20"></div>
                        <div className="relative bg-gradient-to-br from-amber-500 to-orange-600 rounded-full w-full h-full flex items-center justify-center shadow-xl border-4 border-amber-300">
                            <School className="w-14 h-14 text-white" />
                        </div>
                    </div>
                    {className && (
                        <h1 className="text-4xl font-bold text-white mb-2 font-mono" style={{
                            textShadow: '2px 2px 4px rgba(0,0,0,0.5), 0 0 10px rgba(255,255,255,0.3)'
                        }}>
                            {className}
                        </h1>
                    )}
                    <p className="text-green-200 flex items-center justify-center gap-2 font-mono">
                        <BookOpen className="w-4 h-4 animate-pulse" />
                        Enter PIN to view yearbook
                    </p>
                </div>

                <div className="space-y-4 relative">
                    <div className="flex justify-center gap-3">
                        {[0, 1, 2, 3].map((index) => (
                            <div
                                key={index}
                                className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all duration-300 font-mono ${
                                    pin[index]
                                        ? "bg-gradient-to-br from-amber-500 to-orange-600 border-amber-400 text-white shadow-lg scale-110"
                                        : "border-green-700 bg-green-800/50 text-green-300"
                                } ${error ? "animate-shake" : ""}`}
                                style={pin[index] ? { animation: 'bounce-in 0.3s ease-out' } : {}}
                            >
                                {pin[index] ? "✎" : ""}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <button
                                key={num}
                                onClick={() => handlePinChange(pin + num)}
                                className="aspect-square rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 border-2 border-amber-500/30 text-2xl font-bold text-amber-300 transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-amber-500/30 active:scale-95 shadow-lg font-mono hover:border-amber-400/60"
                            >
                                {num}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePinChange(pin + "0")}
                            className="aspect-square rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 border-2 border-amber-500/30 text-2xl font-bold text-amber-300 transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-amber-500/30 active:scale-95 shadow-lg font-mono hover:border-amber-400/60"
                        >
                            0
                        </button>
                        <button
                            onClick={() => setPin(pin.slice(0, -1))}
                            className="aspect-square rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 border-2 border-gray-500/30 text-xl font-bold text-gray-300 transition-all duration-200 hover:scale-110 hover:shadow-lg active:scale-95 shadow-lg font-mono hover:border-gray-400/60"
                        >
                            ←
                        </button>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={pin.length !== 4}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold text-lg transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-amber-500/30 active:scale-95 disabled:scale-100 shadow-lg disabled:shadow-none font-mono relative overflow-hidden group"
                    >
                        <span className="relative z-10">Open Yearbook</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    </button>

                    {error && (
                        <p className="text-center text-red-400 font-medium animate-pulse font-mono">
                            Wrong PIN! Try again ✏️
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
