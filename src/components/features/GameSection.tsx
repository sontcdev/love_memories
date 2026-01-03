"use client";

import { useState } from "react";
import { drawCard, DrawnCard } from "@/app/actions/game-actions";
import { Sparkles, Heart, Flame, Star, RotateCcw, Loader2, RefreshCw } from "lucide-react";

interface GameSectionProps {
    theme?: "love" | "every" | "idol";
}

type Difficulty = "EASY" | "MEDIUM" | "HARD";

export function GameSection({ theme = "love" }: GameSectionProps) {
    const [isDrawing, setIsDrawing] = useState(false);
    const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
    const [drawnCard, setDrawnCard] = useState<DrawnCard | null>(null);
    const [isFlipped, setIsFlipped] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const themeColors = {
        love: {
            easy: "from-green-400 to-emerald-500",
            medium: "from-rose-400 to-pink-500",
            hard: "from-red-500 to-rose-600",
            card: "from-rose-400 via-pink-500 to-purple-500",
            bg: "bg-gradient-to-br from-rose-50 to-pink-50",
        },
        every: {
            easy: "from-green-400 to-emerald-500",
            medium: "from-blue-400 to-indigo-500",
            hard: "from-purple-500 to-indigo-600",
            card: "from-blue-400 via-indigo-500 to-purple-500",
            bg: "bg-gradient-to-br from-blue-50 to-indigo-50",
        },
        idol: {
            easy: "from-green-400 to-emerald-500",
            medium: "from-amber-400 to-orange-500",
            hard: "from-red-500 to-orange-600",
            card: "from-amber-400 via-orange-500 to-red-500",
            bg: "bg-gradient-to-br from-amber-50 to-orange-50",
        },
    };

    const colors = themeColors[theme];

    const difficulties: { level: Difficulty; label: string; icon: typeof Heart; gradient: string }[] = [
        { level: "EASY", label: "Dễ", icon: Heart, gradient: colors.easy },
        { level: "MEDIUM", label: "Trung bình", icon: Flame, gradient: colors.medium },
        { level: "HARD", label: "Khó", icon: Star, gradient: colors.hard },
    ];

    const handleDrawCard = async (difficulty: Difficulty, excludeId?: string) => {
        setIsDrawing(true);
        setError(null);
        setSelectedDifficulty(difficulty);
        setIsFlipped(false);
        setDrawnCard(null);

        // Small delay for animation
        await new Promise((resolve) => setTimeout(resolve, 300));

        const result = await drawCard(difficulty, excludeId);

        if (result.success && result.card) {
            setDrawnCard(result.card);
            // Flip after a brief moment
            setTimeout(() => setIsFlipped(true), 500);
        } else {
            setError(result.error || "Failed to draw card");
        }

        setIsDrawing(false);
    };

    const resetGame = () => {
        setSelectedDifficulty(null);
        setDrawnCard(null);
        setIsFlipped(false);
        setError(null);
    };

    const shuffleQuestion = async () => {
        if (!selectedDifficulty) return;
        // Pass current card ID to exclude it from the next draw
        await handleDrawCard(selectedDifficulty, drawnCard?.id);
    };

    return (
        <div className={`rounded-3xl p-6 md:p-8 ${colors.bg}`}>
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 mb-2">
                    <Sparkles className="w-6 h-6 text-amber-400" />
                    <h2 className="text-2xl font-bold text-gray-800">Thử Thách Tình Yêu</h2>
                    <Sparkles className="w-6 h-6 text-amber-400" />
                </div>
                <p className="text-gray-500 text-sm">Chọn độ khó và khám phá thử thách của bạn!</p>
            </div>

            {/* Difficulty Buttons */}
            {!selectedDifficulty && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {difficulties.map(({ level, label, icon: Icon, gradient }) => (
                        <button
                            key={level}
                            onClick={() => handleDrawCard(level)}
                            disabled={isDrawing}
                            className={`group relative px-8 py-4 rounded-2xl bg-gradient-to-r ${gradient} text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Icon className="w-5 h-5" />
                                <span>{label}</span>
                            </div>
                            {/* Shine effect */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    ))}
                </div>
            )}

            {/* Card Display */}
            {selectedDifficulty && (
                <div className="flex flex-col items-center">
                    {/* Card Container */}
                    <div
                        className="relative w-72 h-96 perspective-1000 mb-6"
                        style={{ perspective: "1000px" }}
                    >
                        <div
                            className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${isFlipped ? "rotate-y-180" : ""
                                }`}
                            style={{
                                transformStyle: "preserve-3d",
                                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                            }}
                        >
                            {/* Card Back */}
                            <div
                                className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${colors.card} shadow-2xl flex items-center justify-center backface-hidden`}
                                style={{ backfaceVisibility: "hidden" }}
                            >
                                {isDrawing ? (
                                    <Loader2 className="w-16 h-16 text-white animate-spin" />
                                ) : (
                                    <div className="text-center text-white">
                                        <div className="text-6xl mb-4">🎴</div>
                                        <p className="text-lg font-medium opacity-80">Flipping...</p>
                                    </div>
                                )}
                            </div>

                            {/* Card Front (Content) */}
                            <div
                                className="absolute inset-0 rounded-3xl bg-white shadow-2xl p-6 flex flex-col items-center justify-center backface-hidden"
                                style={{
                                    backfaceVisibility: "hidden",
                                    transform: "rotateY(180deg)",
                                }}
                            >
                                {error ? (
                                    <div className="text-center text-red-500">
                                        <div className="text-4xl mb-4">😢</div>
                                        <p>{error}</p>
                                    </div>
                                ) : drawnCard ? (
                                    <>
                                        {/* Difficulty Badge */}
                                        <div className={`px-4 py-1 rounded-full bg-gradient-to-r ${difficulties.find(d => d.level === drawnCard.level)?.gradient
                                            } text-white text-sm font-medium mb-4`}>
                                            {drawnCard.level}
                                        </div>

                                        {/* Card Content */}
                                        <div className="flex-1 flex items-center justify-center">
                                            <p className="text-xl md:text-2xl text-center text-gray-800 font-medium leading-relaxed">
                                                {drawnCard.content}
                                            </p>
                                        </div>

                                        {/* Decorative */}
                                        <div className="flex gap-2 mt-4">
                                            <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
                                            <Heart className="w-5 h-5 text-rose-300 fill-rose-300" />
                                            <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
                                        </div>
                                    </>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={shuffleQuestion}
                            disabled={isDrawing}
                            className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                            title="Đổi câu hỏi khác"
                        >
                            {isDrawing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <RefreshCw className="w-5 h-5" />
                            )}
                        </button>
                        <button
                            onClick={resetGame}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Rút lại
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
