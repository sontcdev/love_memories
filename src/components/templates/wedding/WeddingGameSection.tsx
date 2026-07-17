"use client";

import { useState } from "react";
import { drawCard, DrawnCard } from "@/app/actions/game-actions";
import { Heart, Flame, Star, RotateCcw, Loader2, RefreshCw, Gem } from "lucide-react";

interface WeddingGameSectionProps {
    isDark?: boolean;
}

type Difficulty = "EASY" | "MEDIUM" | "HARD";

export function WeddingGameSection({ isDark = false }: WeddingGameSectionProps) {
    const [isDrawing, setIsDrawing] = useState(false);
    const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
    const [drawnCard, setDrawnCard] = useState<DrawnCard | null>(null);
    const [isFlipped, setIsFlipped] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [shownCardIds, setShownCardIds] = useState<string[]>([]);

    const colors = {
        easy: "from-green-400 to-emerald-500",
        medium: "from-amber-300 to-yellow-400",
        hard: "from-rose-400 to-pink-500",
        card: "from-amber-200 via-yellow-300 to-rose-300",
        bg: "bg-gradient-to-br from-amber-50 to-rose-50",
    };

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
                ? "bg-slate-900/80 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)] text-white" 
                : colors.bg
        }`}>
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 mb-2">
                    <div className="relative">
                        <div className="absolute inset-0 bg-amber-500 blur-lg opacity-50 animate-pulse rounded-full"></div>
                        <Gem className="relative w-6 h-6 text-amber-500" />
                    </div>
                    <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-amber-900"}`}>
                        Thử Thách Cặp Đôi
                    </h2>
                    <div className="relative">
                        <div className="absolute inset-0 bg-amber-500 blur-lg opacity-50 animate-pulse rounded-full"></div>
                        <Gem className="relative w-6 h-6 text-amber-500" />
                    </div>
                </div>
                <p className={`${isDark ? "text-amber-200/70" : "text-gray-500"} text-sm`}>Chọn độ khó và khám phá thử thách của bạn!</p>
            </div>

            {!selectedDifficulty && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {difficulties.map(({ level, label, icon: Icon, gradient }) => (
                        <button
                            key={level}
                            onClick={() => handleDrawCard(level)}
                            disabled={isDrawing}
                            className={`group relative px-8 py-4 rounded-2xl bg-gradient-to-r ${gradient} text-white font-semibold shadow-lg hover:shadow-2xl hover:shadow-amber-400/40 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 overflow-hidden`}
                        >
                            <div className="flex items-center justify-center gap-2 relative z-10">
                                <Icon className="w-5 h-5" />
                                <span>{label}</span>
                            </div>
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
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
                                        <div className="text-6xl mb-4">💍</div>
                                        <p className="text-lg font-medium opacity-80">Flipping...</p>
                                    </div>
                                )}
                            </div>

                            <div
                                className={`absolute inset-0 rounded-3xl shadow-2xl p-6 flex flex-col items-center justify-center backface-hidden ${
                                    isDark ? "bg-slate-950 border border-amber-500/30 text-white" : "bg-white text-gray-800"
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
                            className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-amber-400 to-rose-400 hover:from-amber-500 hover:to-rose-500 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
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
                                    ? "bg-slate-800 hover:bg-slate-700 text-amber-200" 
                                    : "bg-white/80 hover:bg-white text-amber-700 border border-amber-200"
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
