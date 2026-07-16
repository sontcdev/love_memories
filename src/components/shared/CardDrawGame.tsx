"use client";

import { useState } from "react";
import { drawCard, DrawnCard } from "@/app/actions/game-actions";
import { Sparkles, Heart, Flame, Star, RotateCcw, Loader2, RefreshCw } from "lucide-react";

interface CardDrawGameProps {
    theme?: "love" | "every" | "idol" | "wedding" | "travel" | "friendship";
    isDark?: boolean;
}

type Difficulty = "EASY" | "MEDIUM" | "HARD";

export function CardDrawGame({ theme = "love", isDark = false }: CardDrawGameProps) {
    const [isDrawing, setIsDrawing] = useState(false);
    const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
    const [drawnCard, setDrawnCard] = useState<DrawnCard | null>(null);
    const [isFlipped, setIsFlipped] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [shownCardIds, setShownCardIds] = useState<string[]>([]);

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
        wedding: {
            easy: "from-green-400 to-emerald-500",
            medium: "from-amber-300 to-yellow-400",
            hard: "from-rose-400 to-pink-500",
            card: "from-amber-200 via-yellow-300 to-rose-300",
            bg: "bg-gradient-to-br from-amber-50 to-rose-50",
        },
        travel: {
            easy: "from-green-400 to-emerald-500",
            medium: "from-teal-400 to-cyan-500",
            hard: "from-orange-400 to-red-500",
            card: "from-teal-400 via-cyan-500 to-orange-400",
            bg: "bg-gradient-to-br from-teal-50 to-orange-50",
        },
        friendship: {
            easy: "from-green-400 to-emerald-500",
            medium: "from-purple-400 to-violet-500",
            hard: "from-pink-400 to-rose-500",
            card: "from-purple-400 via-pink-400 to-cyan-400",
            bg: "bg-gradient-to-br from-purple-50 to-cyan-50",
        },
    };

    const colors = themeColors[theme];

    const difficulties: { level: Difficulty; label: string; icon: typeof Heart; gradient: string }[] = [
        { level: "EASY", label: "Dễ", icon: Heart, gradient: colors.easy },
        { level: "MEDIUM", label: "Trung bình", icon: Flame, gradient: colors.medium },
        { level: "HARD", label: "Khó", icon: Star, gradient: colors.hard },
    ];

    const handleDrawCard = async (difficulty: Difficulty, excludeIds?: string[]) => {
        setIsDrawing(true);
        setError(null);
        setSelectedDifficulty(difficulty);
        setIsFlipped(false);
        setDrawnCard(null);

        await new Promise((resolve) => setTimeout(resolve, 300));

        const excludeParam = excludeIds && excludeIds.length > 0 ? excludeIds.join(",") : undefined;
        const result = await drawCard(difficulty, excludeParam);

        if (result.success && result.card) {
            setDrawnCard(result.card);
            setShownCardIds(prev => [...prev, result.card!.id]);
            setTimeout(() => setIsFlipped(true), 500);
        } else if (result.error === "All cards shown") {
            setShownCardIds([]);
            const retryResult = await drawCard(difficulty);
            if (retryResult.success && retryResult.card) {
                setDrawnCard(retryResult.card);
                setShownCardIds([retryResult.card.id]);
                setTimeout(() => setIsFlipped(true), 500);
            } else {
                setError(retryResult.error || "Failed to draw card");
            }
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
        setShownCardIds([]);
    };

    const shuffleQuestion = async () => {
        if (!selectedDifficulty) return;
        await handleDrawCard(selectedDifficulty, shownCardIds);
    };

    return (
        <div className={`rounded-3xl p-6 md:p-8 transition-all ${
            isDark 
                ? "bg-slate-900/80 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)] text-white" 
                : colors.bg
        }`}>
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 mb-2">
                    <Sparkles className="w-6 h-6 text-amber-400" />
                    <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                        {theme === "idol" ? "Thử Thách Fandom" : theme === "wedding" ? "Thử Thách Cặp Đôi" : theme === "travel" ? "Thử Thách Phiêu Lưu" : theme === "friendship" ? "Thử Thách Tình Bạn" : "Thử Thách Tình Yêu"}
                    </h2>
                    <Sparkles className="w-6 h-6 text-amber-400" />
                </div>
                <p className={`${isDark ? "text-purple-200/70" : "text-gray-500"} text-sm`}>Chọn độ khó và khám phá thử thách của bạn!</p>
            </div>

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
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    ))}
                </div>
            )}

            {selectedDifficulty && (
                <div className="flex flex-col items-center">
                    <div
                        className="relative w-full max-w-[280px] sm:w-72 h-96 perspective-1000 mb-6"
                        style={{ perspective: "1000px" }}
                    >
                        <div
                            className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${isFlipped ? "rotate-y-180" : ""}`}
                            style={{
                                transformStyle: "preserve-3d",
                                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                            }}
                        >
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

                            <div
                                className={`absolute inset-0 rounded-3xl shadow-2xl p-6 flex flex-col items-center justify-center backface-hidden ${
                                    isDark ? "bg-slate-950 border border-purple-500/30 text-white" : "bg-white text-gray-800"
                                }`}
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
                                        <div className={`px-4 py-1 rounded-full bg-gradient-to-r ${difficulties.find(d => d.level === drawnCard.level)?.gradient} text-white text-sm font-medium mb-4`}>
                                            {drawnCard.level}
                                        </div>

                                        <div className="flex-1 flex items-center justify-center">
                                            <p className={`text-xl md:text-2xl text-center font-medium leading-relaxed ${isDark ? "text-white" : "text-gray-800"}`}>
                                                {drawnCard.content}
                                            </p>
                                        </div>

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
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                                isDark 
                                    ? "bg-slate-800 hover:bg-slate-700 text-purple-200" 
                                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                            }`}
                        >
                            <RotateCcw className="w-4 h-4" />
                            Đổi độ khó
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
