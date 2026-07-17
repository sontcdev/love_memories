"use client";

import { useState, useEffect, useRef } from "react";
import { Heart, Trophy, RotateCcw, Sparkles } from "lucide-react";

interface Card {
    id: number;
    pairId: number;
    imageUrl: string;
    isFlipped: boolean;
    isMatched: boolean;
}

interface LoveGameSectionProps {
    photos: Array<{ id: string; url: string; caption?: string | null }>;
    isDark?: boolean;
}

export function LoveGameSection({ photos, isDark = false }: LoveGameSectionProps) {
    const [cards, setCards] = useState<Card[]>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [matches, setMatches] = useState(0);
    const [gameWon, setGameWon] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const totalPairs = Math.min(8, Math.floor(photos.length / 2) || 4);

    useEffect(() => {
        if (photos.length >= 2) {
            initializeGame();
        }
    }, [photos]);

    const initializeGame = () => {
        const selectedPhotos = photos.slice(0, totalPairs);
        const cardPairs: Card[] = [];

        selectedPhotos.forEach((photo, index) => {
            cardPairs.push(
                { id: index * 2, pairId: index, imageUrl: photo.url, isFlipped: false, isMatched: false },
                { id: index * 2 + 1, pairId: index, imageUrl: photo.url, isFlipped: false, isMatched: false }
            );
        });

        const shuffled = cardPairs.sort(() => Math.random() - 0.5);
        setCards(shuffled);
        setFlippedCards([]);
        setMoves(0);
        setMatches(0);
        setGameWon(false);
        setShowConfetti(false);
    };

    const handleCardClick = (cardId: number) => {
        if (isChecking) return;
        if (flippedCards.length >= 2) return;

        const card = cards.find(c => c.id === cardId);
        if (!card || card.isFlipped || card.isMatched) return;

        const newCards = cards.map(c =>
            c.id === cardId ? { ...c, isFlipped: true } : c
        );
        setCards(newCards);

        const newFlipped = [...flippedCards, cardId];
        setFlippedCards(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(m => m + 1);
            setIsChecking(true);

            const [firstId, secondId] = newFlipped;
            const firstCard = newCards.find(c => c.id === firstId)!;
            const secondCard = newCards.find(c => c.id === secondId)!;

            if (firstCard.pairId === secondCard.pairId) {
                setTimeout(() => {
                    setCards(prev => prev.map(c =>
                        c.id === firstId || c.id === secondId
                            ? { ...c, isMatched: true }
                            : c
                    ));
                    setMatches(m => {
                        const newMatches = m + 1;
                        if (newMatches === totalPairs) {
                            setGameWon(true);
                            setShowConfetti(true);
                        }
                        return newMatches;
                    });
                    setFlippedCards([]);
                    setIsChecking(false);
                }, 500);
            } else {
                timeoutRef.current = setTimeout(() => {
                    setCards(prev => prev.map(c =>
                        c.id === firstId || c.id === secondId
                            ? { ...c, isFlipped: false }
                            : c
                    ));
                    setFlippedCards([]);
                    setIsChecking(false);
                }, 1000);
            }
        }
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    if (photos.length < 2) {
        return (
            <div className={`text-center py-12 ${isDark ? "text-slate-400" : "text-gray-400"}`}>
                <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Thêm ít nhất 2 ảnh để chơi game!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className="absolute inset-0 bg-rose-400 rounded-full blur-lg opacity-40 animate-pulse"></div>
                        <div className="relative w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div>
                        <h2 className={`text-xl font-bold ${isDark ? "text-slate-100" : "text-gray-800"}`}>
                            Memory Match
                        </h2>
                        <span className={`text-sm ${isDark ? "text-slate-400" : "text-gray-400"}`}>
                            Tìm các cặp ảnh giống nhau
                        </span>
                    </div>
                </div>
                <button
                    onClick={initializeGame}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 text-white font-medium shadow-md hover:shadow-xl transition-all hover:scale-105 relative overflow-hidden group"
                >
                    <RotateCcw className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">Chơi lại</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </button>
            </div>

            <div className={`flex items-center justify-center gap-6 p-4 rounded-xl ${isDark ? "bg-slate-800" : "bg-gradient-to-r from-rose-50 to-pink-50"}`}>
                <div className="text-center">
                    <p className={`text-2xl font-bold ${isDark ? "text-rose-400" : "text-rose-600"}`}>{moves}</p>
                    <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>Lượt đi</p>
                </div>
                <div className="w-px h-8 bg-rose-200"></div>
                <div className="text-center">
                    <p className={`text-2xl font-bold ${isDark ? "text-pink-400" : "text-pink-600"}`}>{matches}/{totalPairs}</p>
                    <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>Cặp tìm được</p>
                </div>
            </div>

            {gameWon && showConfetti && (
                <div className="relative">
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {Array.from({ length: 30 }).map((_, i) => (
                            <div
                                key={i}
                                className="absolute animate-bounce"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 2}s`,
                                    animationDuration: `${1 + Math.random() * 2}s`,
                                }}
                            >
                                <Heart className="w-6 h-6 text-rose-500 fill-current" />
                            </div>
                        ))}
                    </div>
                    <div className={`relative text-center p-6 rounded-2xl ${isDark ? "bg-gradient-to-br from-rose-900/50 to-pink-900/50 border border-rose-700" : "bg-gradient-to-br from-rose-100 to-pink-100 border-2 border-rose-300"}`}>
                        <Trophy className="w-16 h-16 mx-auto mb-3 text-yellow-500" />
                        <h3 className={`text-2xl font-bold mb-2 ${isDark ? "text-rose-100" : "text-rose-700"}`}>
                            Chúc mừng! 🎉
                        </h3>
                        <p className={`${isDark ? "text-rose-200" : "text-rose-600"}`}>
                            Bạn đã hoàn thành trong {moves} lượt đi!
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-4 gap-3">
                {cards.map((card) => (
                    <button
                        key={card.id}
                        onClick={() => handleCardClick(card.id)}
                        disabled={card.isFlipped || card.isMatched || isChecking}
                        className={`aspect-square rounded-xl transition-all duration-300 transform ${
                            card.isMatched
                                ? "scale-95 opacity-70"
                                : card.isFlipped
                                ? "scale-105 shadow-2xl"
                                : "hover:scale-105 hover:shadow-xl"
                        }`}
                        style={{ perspective: "1000px" }}
                    >
                        <div
                            className={`relative w-full h-full transition-transform duration-500`}
                            style={{
                                transformStyle: "preserve-3d",
                                transform: card.isFlipped || card.isMatched ? "rotateY(180deg)" : "rotateY(0deg)",
                            }}
                        >
                            <div
                                className={`absolute inset-0 rounded-xl flex items-center justify-center ${
                                    isDark
                                        ? "bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600"
                                        : "bg-gradient-to-br from-rose-400 to-pink-500"
                                } shadow-lg`}
                                style={{ backfaceVisibility: "hidden" }}
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-white rounded-full blur-md opacity-30"></div>
                                    <Heart className="relative w-8 h-8 text-white fill-current" />
                                </div>
                            </div>
                            <div
                                className={`absolute inset-0 rounded-xl overflow-hidden border-4 ${
                                    card.isMatched
                                        ? "border-green-400 shadow-lg shadow-green-400/50"
                                        : "border-rose-300"
                                }`}
                                style={{
                                    backfaceVisibility: "hidden",
                                    transform: "rotateY(180deg)",
                                }}
                            >
                                <img
                                    src={card.imageUrl}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
