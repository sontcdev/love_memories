"use client";

import { useState } from "react";
import { Heart, Flame, Star, RotateCcw, Loader2, RefreshCw, Smile, Zap } from "lucide-react";

interface FriendshipGameSectionProps {
    isDark?: boolean;
}

type Difficulty = "EASY" | "MEDIUM" | "HARD";

interface DrawnCard {
    id: string;
    content: string;
    level: Difficulty;
}

const friendshipDeck: Record<Difficulty, string[]> = {
    EASY: [
        "Mỗi người kể một kỷ niệm khiến cả nhóm cười nhiều nhất.",
        "Chọn một người và nói một điểm đáng quý của người đó.",
        "Đặt caption mới cho ảnh nhóm gần nhất.",
    ],
    MEDIUM: [
        "Bình chọn ai là người hay tạo drama vui nhất nhóm.",
        "Kể nguồn gốc một biệt danh nội bộ mà chỉ nhóm hiểu.",
        "Mỗi người gửi một lời nhắn ẩn danh, cả nhóm đoán người viết.",
    ],
    HARD: [
        "Tái hiện một inside joke của nhóm trong 30 giây.",
        "Cả nhóm cùng viết một lời hứa giữ liên lạc sau này.",
        "Chọn một người làm MC và phỏng vấn nhanh từng thành viên.",
    ],
};

function drawFriendshipCard(level: Difficulty, excludeIds: string[] = []): DrawnCard {
    const availableCards = friendshipDeck[level].map((content, index) => ({ id: `${level}-${index}`, content, level })).filter((card) => !excludeIds.includes(card.id));
    const cards = availableCards.length > 0 ? availableCards : friendshipDeck[level].map((content, index) => ({ id: `${level}-${index}`, content, level }));
    return cards[Math.floor(Math.random() * cards.length)];
}

export function FriendshipGameSection({ isDark = false }: FriendshipGameSectionProps) {
    const [isDrawing, setIsDrawing] = useState(false);
    const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
    const [drawnCard, setDrawnCard] = useState<DrawnCard | null>(null);
    const [isFlipped, setIsFlipped] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [shownCardIds, setShownCardIds] = useState<string[]>([]);

    const colors = {
        easy: "from-green-400 to-emerald-500",
        medium: "from-purple-400 to-violet-500",
        hard: "from-pink-400 to-rose-500",
        card: "from-purple-400 via-pink-400 to-cyan-400",
        bg: "bg-gradient-to-br from-purple-50 to-cyan-50",
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

        const card = drawFriendshipCard(difficulty, excludeIds);
        setDrawnCard(card);
        setShownCardIds((prev) => [...prev.filter((id) => id !== card.id), card.id]);
        setTimeout(() => setIsFlipped(true), 500);

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
                    <div className="relative">
                        <div className="absolute inset-0 bg-purple-500 blur-lg opacity-50 animate-pulse rounded-full"></div>
                        <Smile className="relative w-6 h-6 text-purple-500 animate-bounce" />
                    </div>
                    <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-purple-900"}`}>
                        Thử Thách Tình Bạn
                    </h2>
                    <div className="relative">
                        <div className="absolute inset-0 bg-purple-500 blur-lg opacity-50 animate-pulse rounded-full"></div>
                        <Smile className="relative w-6 h-6 text-purple-500 animate-bounce" />
                    </div>
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
                            className={`group relative px-8 py-4 rounded-2xl bg-gradient-to-r ${gradient} text-white font-semibold shadow-lg hover:shadow-2xl hover:shadow-purple-400/40 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 overflow-hidden`}
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
                                        <div className="text-6xl mb-4">🎉</div>
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
                                            <Zap className="w-5 h-5 text-purple-400" />
                                            <Smile className="w-5 h-5 text-pink-400" />
                                            <Zap className="w-5 h-5 text-cyan-400" />
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
                            className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
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
                                    : "bg-white/80 hover:bg-white text-purple-700 border border-purple-200"
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
