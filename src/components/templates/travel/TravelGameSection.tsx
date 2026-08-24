"use client";

import { useState } from "react";
import { RotateCcw, Loader2, RefreshCw, Compass, MapPin, Sparkles } from "lucide-react";

interface TravelGameSectionProps {
    isDark?: boolean;
}

const travelQuestions: string[] = [
    "Khoảnh khắc nào trong chuyến đi khiến bạn nhớ nhất?",
    "Món ăn ngon nhất bạn đã thử trong chuyến đi là gì?",
    "Ai là người khiến cả nhóm cười nhiều nhất? Kể một tình huống.",
    "Nếu được quay lại một địa điểm trong chuyến đi, bạn chọn nơi nào?",
    "Điều bất ngờ nhất đã xảy ra trong chuyến đi là gì?",
    "Bức ảnh bạn thích nhất chụp ở đâu và vì sao?",
    "Nếu chuyến đi có một tên gọi, bạn sẽ đặt là gì?",
    "Ai là người 'lạc đường' hoặc trễ giờ nhiều nhất? Kể lại.",
    "Trải nghiệm nào bạn muốn thử lại nếu đi cùng nhau lần nữa?",
    "Điều gì trong chuyến đi khiến bạn biết ơn nhất?",
    "Nếu phải chọn một từ mô tả cả chuyến đi, đó là từ gì?",
    "Kỷ niệm nào bạn sẽ kể lại cho người khác về chuyến đi này?",
    "Ai đã chăm sóc cả nhóm nhiều nhất trong chuyến đi?",
    "Có điều gì bạn ước mình đã làm khác đi trong chuyến đi không?",
    "Điểm dừng nào khiến bạn muốn ở lại lâu hơn?",
];

function drawQuestion(excludeIndexes: number[] = []): { index: number; content: string } {
    const available = travelQuestions
        .map((content, index) => ({ index, content }))
        .filter((q) => !excludeIndexes.includes(q.index));
    const pool = available.length > 0 ? available : travelQuestions.map((content, index) => ({ index, content }));
    return pool[Math.floor(Math.random() * pool.length)];
}

export function TravelGameSection({ isDark = false }: TravelGameSectionProps) {
    const [isDrawing, setIsDrawing] = useState(false);
    const [started, setStarted] = useState(false);
    const [question, setQuestion] = useState<{ index: number; content: string } | null>(null);
    const [isFlipped, setIsFlipped] = useState(false);
    const [shownIndexes, setShownIndexes] = useState<number[]>([]);

    const colors = {
        card: "from-teal-400 via-cyan-500 to-orange-400",
        bg: "bg-gradient-to-br from-teal-50 to-orange-50",
    };

    const handleDraw = async (excludeIndexes?: number[]) => {
        setIsDrawing(true);
        setStarted(true);
        setIsFlipped(false);
        setQuestion(null);

        await new Promise((resolve) => setTimeout(resolve, 300));

        const drawn = drawQuestion(excludeIndexes);
        setQuestion(drawn);
        setShownIndexes((prev) => [...prev.filter((i) => i !== drawn.index), drawn.index]);
        setTimeout(() => setIsFlipped(true), 500);

        setIsDrawing(false);
    };

    const resetGame = () => {
        setStarted(false);
        setQuestion(null);
        setIsFlipped(false);
        setShownIndexes([]);
    };

    const shuffleQuestion = async () => {
        await handleDraw(shownIndexes);
    };

    return (
        <div className={`rounded-3xl p-6 md:p-8 transition-all ${
            isDark
                ? "bg-slate-900/80 border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.1)] text-white"
                : colors.bg
        }`}>
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 mb-2">
                    <div className="relative">
                        <div className="absolute inset-0 bg-teal-500 blur-lg opacity-50 animate-pulse rounded-full"></div>
                        <Compass className="relative w-6 h-6 text-teal-500 animate-spin" style={{ animationDuration: '10s' }} />
                    </div>
                    <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-teal-900"}`}>
                        Random Câu Hỏi
                    </h2>
                    <div className="relative">
                        <div className="absolute inset-0 bg-teal-500 blur-lg opacity-50 animate-pulse rounded-full"></div>
                        <Compass className="relative w-6 h-6 text-teal-500 animate-spin" style={{ animationDuration: '10s' }} />
                    </div>
                </div>
                <p className={`${isDark ? "text-teal-200/70" : "text-gray-500"} text-sm`}>Bốc một câu hỏi và cùng nhau chia sẻ trải nghiệm chuyến đi!</p>
            </div>

            {!started && (
                <div className="flex justify-center">
                    <button
                        onClick={() => handleDraw()}
                        disabled={isDrawing}
                        className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-500 text-white font-semibold shadow-lg hover:shadow-2xl hover:shadow-teal-400/40 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 overflow-hidden"
                    >
                        <div className="flex items-center justify-center gap-2 relative z-10">
                            <Sparkles className="w-5 h-5" />
                            <span>Bốc câu hỏi</span>
                        </div>
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    </button>
                </div>
            )}

            {started && (
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
                                        <div className="text-6xl mb-4">🗺️</div>
                                        <p className="text-lg font-medium opacity-80">Flipping...</p>
                                    </div>
                                )}
                            </div>

                            <div
                                className={`absolute inset-0 rounded-3xl shadow-2xl p-6 flex flex-col items-center justify-center backface-hidden ${
                                    isDark ? "bg-slate-950 border border-teal-500/30 text-white" : "bg-white text-gray-800"
                                }`}
                                style={{
                                    backfaceVisibility: "hidden",
                                    transform: "rotateY(180deg)",
                                }}
                            >
                                {question ? (
                                    <>
                                        <div className="flex-1 flex items-center justify-center">
                                            <p className={`text-xl md:text-2xl text-center font-medium leading-relaxed ${isDark ? "text-white" : "text-gray-800"}`}>
                                                {question.content}
                                            </p>
                                        </div>

                                        <div className="flex gap-2 mt-4">
                                            <MapPin className="w-5 h-5 text-teal-400" />
                                            <Compass className="w-5 h-5 text-cyan-400" />
                                            <MapPin className="w-5 h-5 text-teal-400" />
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
                            className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
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
                                    ? "bg-slate-800 hover:bg-slate-700 text-teal-200"
                                    : "bg-white/80 hover:bg-white text-teal-700 border border-teal-200"
                            }`}
                        >
                            <RotateCcw className="w-4 h-4" />
                            Bắt đầu lại
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
