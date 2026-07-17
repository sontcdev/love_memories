"use client";

import { useState, useEffect } from "react";
import { Camera } from "lucide-react";

interface Love2LockScreenProps {
    onUnlock: () => void;
    correctPin: string;
    coupleNames?: string;
}

export function Love2LockScreen({ onUnlock, correctPin, coupleNames }: Love2LockScreenProps) {
    const [pin, setPin] = useState("");
    const [error, setError] = useState(false);
    const [polaroids, setPolaroids] = useState<Array<{ id: number; x: number; y: number; rotate: number }>>([]);

    useEffect(() => {
        const newPolaroids = Array.from({ length: 12 }, (_, i) => ({
            id: i,
            x: Math.random() * 80 + 10,
            y: Math.random() * 80 + 10,
            rotate: Math.random() * 30 - 15,
        }));
        setPolaroids(newPolaroids);
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
        <div className="min-h-screen bg-amber-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Q0YTM3NCIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] flex items-center justify-center p-4 relative overflow-hidden">
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(var(--rotate)); }
                    50% { transform: translateY(-10px) rotate(var(--rotate)); }
                }
                @keyframes peel {
                    0% { transform: rotate(0deg) scale(1); }
                    50% { transform: rotate(5deg) scale(1.1); }
                    100% { transform: rotate(0deg) scale(1); }
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
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                    background-size: 200% 100%;
                    animation: shimmer 2s infinite;
                }
            `}</style>

            {polaroids.map((polaroid) => (
                <div
                    key={polaroid.id}
                    className="absolute pointer-events-none opacity-20"
                    style={{
                        left: `${polaroid.x}%`,
                        top: `${polaroid.y}%`,
                        transform: `rotate(${polaroid.rotate}deg)`,
                        animation: `float 3s ease-in-out infinite`,
                        animationDelay: `${polaroid.id * 0.2}s`,
                    }}
                >
                    <div className="w-16 h-20 bg-white shadow-lg p-1 relative">
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-3 bg-gradient-to-r from-rose-300 via-rose-400 to-rose-300 opacity-70 rounded-sm"></div>
                        <div className="w-full h-12 bg-gradient-to-br from-amber-200 to-orange-300"></div>
                    </div>
                </div>
            ))}

            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full relative z-10 border-8 border-white" style={{
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 0 0 1px rgba(0,0,0,0.1)"
            }}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-gradient-to-r from-rose-300 via-rose-400 to-rose-300 opacity-80 rounded-sm shadow-md"></div>
                
                <div className="text-center mb-8">
                    <div className="relative inline-flex items-center justify-center w-24 h-24 mb-4">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full animate-ping opacity-20"></div>
                        <div className="relative bg-gradient-to-br from-amber-400 to-orange-500 rounded-full w-full h-full flex items-center justify-center shadow-xl border-4 border-white">
                            <Camera className="w-12 h-12 text-white" />
                        </div>
                    </div>
                    {coupleNames && (
                        <h1 className="text-4xl font-bold text-amber-800 mb-2 font-serif animate-shimmer" style={{backgroundSize: '200% auto'}}>
                            {coupleNames}
                        </h1>
                    )}
                    <p className="text-amber-600 italic">Our memories, our story</p>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-center gap-3">
                        {[0, 1, 2, 3].map((index) => (
                            <div
                                key={index}
                                className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
                                    pin[index]
                                        ? "bg-gradient-to-br from-amber-400 to-orange-500 border-amber-600 text-white shadow-lg scale-110"
                                        : "border-amber-200 bg-amber-50"
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
                                className="aspect-square rounded-lg bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 text-2xl font-bold text-amber-700 transition-all duration-200 hover:scale-110 hover:shadow-lg active:scale-95 shadow-md font-serif hover:border-amber-400"
                            >
                                {num}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePinChange(pin + "0")}
                            className="aspect-square rounded-lg bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 text-2xl font-bold text-amber-700 transition-all duration-200 hover:scale-110 hover:shadow-lg active:scale-95 shadow-md font-serif hover:border-amber-400"
                        >
                            0
                        </button>
                        <button
                            onClick={() => setPin(pin.slice(0, -1))}
                            className="aspect-square rounded-lg bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 text-xl font-bold text-gray-600 transition-all duration-200 hover:scale-110 hover:shadow-lg active:scale-95 shadow-md hover:border-gray-400"
                        >
                            ←
                        </button>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={pin.length !== 4}
                        className="w-full py-4 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold text-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 disabled:scale-100 shadow-lg disabled:shadow-none font-serif relative overflow-hidden group"
                    >
                        <span className="relative z-10">Open Scrapbook</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    </button>

                    {error && (
                        <p className="text-center text-red-500 font-medium animate-pulse italic">
                            Oops! Wrong PIN 💔
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
