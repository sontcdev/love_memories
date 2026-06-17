"use client";

import { useState, useEffect } from "react";
import { RotateCcw, HelpCircle, BarChart2, Loader2 } from "lucide-react";
import { submitQuizVote, getQuizStats, MemberVoteStat } from "@/app/actions/game-actions";

interface QuizQuestion {
    question: string;
    options?: string[];
    correctIndex?: number;
}

interface QuizBadges {
    perfect_title?: string;
    perfect_desc?: string;
    good_title?: string;
    good_desc?: string;
    average_title?: string;
    average_desc?: string;
    low_title?: string;
    low_desc?: string;
}

interface GameSectionProps {
    slug: string;
    quiz?: QuizQuestion[];
    quizBadges?: QuizBadges;
    members?: { id: string; name: string }[];
    groupName?: string;
    isDark?: boolean;
    accentColor?: string;
}

const defaultQuiz: QuizQuestion[] = [
    { question: "Trong nhóm của chúng mình, ai là người hay 'bùng kèo' phút chót nhất?" },
    { question: "Ai là người có nhiều biệt danh độc lạ nhất trong nhóm?" },
    { question: "Ai là 'ông hoàng/bà chúa' nói nhiều nhất hội bạn này?" },
    { question: "Ai là thủ quỹ đanh đá và luôn đòi nợ dai dẳng nhất?" },
    { question: "Khi đi du lịch cùng nhau, ai sẽ là người ngủ nướng muộn nhất?" }
];

export function GameSection({ 
    slug, 
    quiz, 
    members = [], 
    groupName = "Chúng tớ", 
    isDark = false, 
    accentColor = "#d97706" 
}: GameSectionProps) {
    const activeQuiz = quiz && quiz.length > 0 ? quiz : defaultQuiz;
    const [gameState, setGameState] = useState<"start" | "playing" | "ended">("start");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [voteStats, setVoteStats] = useState<MemberVoteStat[]>([]);
    const [allQuizStats, setAllQuizStats] = useState<{ [key: number]: MemberVoteStat[] }>({});

    // Fallback options if no members defined
    const activeOptions = members.length > 0 ? members : [
        { id: "m1", name: "Thành viên A" },
        { id: "m2", name: "Thành viên B" },
        { id: "m3", name: "Thành viên C" },
        { id: "m4", name: "Mọi người đều uy tín" }
    ];

    const currentQuestion = activeQuiz[currentIndex];

    // Load saved vote stats on mount or when ending
    useEffect(() => {
        if (gameState === "ended") {
            const fetchAllStats = async () => {
                const statsMap: { [key: number]: MemberVoteStat[] } = {};
                for (let i = 0; i < activeQuiz.length; i++) {
                    const res = await getQuizStats(slug, i);
                    if (res.success && res.stats) {
                        statsMap[i] = res.stats;
                    }
                }
                setAllQuizStats(statsMap);
            };
            fetchAllStats().catch(console.error);
        }
    }, [gameState, slug, activeQuiz.length]);

    const handleVote = async (memberId: string) => {
        if (showFeedback || isSubmitting) return;
        setSelectedOption(memberId);
        setIsSubmitting(true);

        try {
            const result = await submitQuizVote(slug, currentIndex, memberId);
            if (result.success && result.stats) {
                setVoteStats(result.stats);
                setAllQuizStats(prev => ({ ...prev, [currentIndex]: result.stats || [] }));
                setShowFeedback(true);
            }
        } catch (err) {
            console.error("Failed to submit vote:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = () => {
        if (currentIndex < activeQuiz.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setShowFeedback(false);
            setVoteStats([]);
        } else {
            setGameState("ended");
        }
    };

    const resetQuiz = () => {
        setCurrentIndex(0);
        setSelectedOption(null);
        setShowFeedback(false);
        setVoteStats([]);
        setGameState("start");
    };

    return (
        <div className={`rounded-3xl p-6 md:p-8 transition-all border ${
            isDark 
                ? "bg-slate-900/80 border-amber-900/20 shadow-xl text-white" 
                : "bg-white border-amber-900/10 shadow-lg text-gray-800"
        }`}>
            {gameState === "start" && (
                <div className="text-center space-y-6 py-6">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-md animate-pulse" style={{ backgroundColor: accentColor }}>
                        <HelpCircle className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl sm:text-2xl font-serif font-bold">Thử Thách Bình Chọn Đồng Đội</h3>
                        <p className={`text-xs sm:text-sm max-w-md mx-auto leading-relaxed ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                            Hãy cùng tham gia cuộc bình chọn vui xem ai trong nhóm {groupName} phù hợp nhất với các danh hiệu dìm hàng. Kết quả thống kê tỉ lệ bình chọn sẽ hiển thị ngay sau khi bạn vote!
                        </p>
                    </div>
                    <button
                        onClick={() => setGameState("playing")}
                        className="px-8 py-3 rounded-full text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all hover:scale-105"
                        style={{ backgroundColor: accentColor }}
                    >
                        Bắt đầu bình chọn 📊
                    </button>
                </div>
            )}

            {gameState === "playing" && (
                <div className="space-y-6">
                    {/* Header/Progress */}
                    <div className="flex justify-between items-center border-b pb-3 border-amber-900/10">
                        <span className="text-xs font-mono font-bold" style={{ color: accentColor }}>
                            CÂU HỎI {currentIndex + 1} / {activeQuiz.length}
                        </span>
                        <div className="w-32 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div 
                                className="h-full transition-all duration-300"
                                style={{ width: `${((currentIndex + 1) / activeQuiz.length) * 100}%`, backgroundColor: accentColor }}
                            />
                        </div>
                    </div>

                    {/* Question Content */}
                    <div className="space-y-4">
                        <h4 className="text-base sm:text-lg font-serif font-bold leading-relaxed text-center">
                            {currentQuestion.question}
                        </h4>

                        {/* Options Grid */}
                        <div className="grid grid-cols-1 gap-3 max-w-md mx-auto pt-2">
                            {activeOptions.map((member) => {
                                const isSelected = selectedOption === member.id;
                                const stat = voteStats.find(s => s.memberId === member.id);
                                const percentage = stat?.percentage || 0;
                                const voteCount = stat?.count || 0;

                                if (showFeedback) {
                                    return (
                                        <div
                                            key={member.id}
                                            className={`relative w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all overflow-hidden ${
                                                isSelected 
                                                    ? "border-amber-500 bg-amber-500/5 text-amber-900 dark:text-amber-300 font-semibold" 
                                                    : "border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300"
                                            }`}
                                        >
                                            {/* Background progress bar representation */}
                                            <div 
                                                className="absolute left-0 top-0 bottom-0 bg-amber-500/10 dark:bg-amber-500/20 transition-all duration-1000 ease-out z-0"
                                                style={{ width: `${percentage}%` }}
                                            />
                                            <div className="relative z-10 flex justify-between items-center">
                                                <span>{member.name}</span>
                                                <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                                                    {percentage}% ({voteCount} vote{voteCount !== 1 ? "s" : ""})
                                                </span>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <button
                                        key={member.id}
                                        onClick={() => handleVote(member.id)}
                                        disabled={isSubmitting}
                                        className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all hover:scale-[1.01] flex items-center justify-between ${
                                            isDark 
                                                ? "bg-slate-950 border-slate-800 hover:bg-slate-800/40 text-slate-300" 
                                                : "bg-slate-50 border-slate-100 hover:bg-slate-100/60 text-gray-750"
                                        }`}
                                    >
                                        <span>{member.name}</span>
                                        {isSubmitting && selectedOption === member.id && (
                                            <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer/Navigation */}
                    {showFeedback && (
                        <div className="flex justify-center pt-2">
                            <button
                                onClick={handleNext}
                                className="px-6 py-2.5 rounded-full text-white font-semibold text-xs transition-all hover:scale-103 shadow-md"
                                style={{ backgroundColor: accentColor }}
                            >
                                {currentIndex < activeQuiz.length - 1 ? "Câu hỏi tiếp theo ➔" : "Xem tổng hợp kết quả 📊"}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {gameState === "ended" && (
                <div className="space-y-6 py-4">
                    {/* Badge stickers */}
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto shadow-lg">
                            <BarChart2 className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="mt-3 text-lg font-serif font-bold">Thống kê bình chọn cả nhóm</h3>
                        <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                            Tổng số lượt bình chọn và kết quả thống kê của các thành viên.
                        </p>
                    </div>

                    {/* Result Info */}
                    <div className="space-y-3 max-w-md mx-auto text-left">
                        {activeQuiz.map((q, idx) => {
                            const questionStats = allQuizStats[idx] || [];
                            const topVoted = [...questionStats].sort((a, b) => b.count - a.count)[0];

                            return (
                                <div key={idx} className={`p-4 rounded-xl border ${isDark ? "bg-slate-950/40 border-slate-800" : "bg-slate-50 border-slate-150"}`}>
                                    <p className="text-xs font-bold font-serif mb-2">Câu {idx + 1}: {q.question}</p>
                                    {topVoted && topVoted.count > 0 ? (
                                        <div className="flex justify-between items-center text-xs">
                                            <span>
                                                Nhận vote nhiều nhất: <strong className="text-amber-600 dark:text-amber-400">{topVoted.memberName}</strong>
                                            </span>
                                            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                                                {topVoted.percentage}% ({topVoted.count} vote{topVoted.count !== 1 ? "s" : ""})
                                            </span>
                                        </div>
                                    ) : (
                                        <p className="text-[10px] text-gray-400">Chưa có lượt bình chọn nào.</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                        <button
                            onClick={resetQuiz}
                            className={`px-5 py-2.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all hover:scale-103 ${
                                isDark 
                                    ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750" 
                                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Bình chọn lại
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
