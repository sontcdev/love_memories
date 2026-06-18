"use client";

import { useState } from "react";
import { RotateCcw, CheckCircle2, XCircle, Share2, HelpCircle } from "lucide-react";

interface QuizQuestion {
    question: string;
    options: string[];
    correctIndex: number;
}

interface GameSectionProps {
    quiz?: QuizQuestion[];
    studentName?: string;
    isDark?: boolean;
    theme?: string;
}

const defaultQuiz: QuizQuestion[] = [
    {
        question: "Môn học nào làm tôi 'ám ảnh' nhất những năm cấp 3?",
        options: ["Toán học", "Vật lý / Hóa học", "Lịch sử / Địa lý", "Ngữ văn"],
        correctIndex: 0
    },
    {
        question: "Hoạt động ngoại khóa nào để lại kỷ niệm sâu sắc nhất?",
        options: ["Hội trại trường", "Giải bóng đá lớp", "Chuyến đi dã ngoại", "Văn nghệ chào mừng"],
        correctIndex: 0
    },
    {
        question: "Tôi thường làm gì nhất trong giờ ra chơi?",
        options: ["Xuống căng tin ăn vặt", "Ngủ bù trên bàn học", "Tám chuyện với bạn bè", "Đọc truyện/Lướt điện thoại"],
        correctIndex: 2
    },
    {
        question: "Môn thi đại học tôi tự tin nhất là gì?",
        options: ["Toán học", "Ngữ văn", "Tiếng Anh", "Tự nhiên/Xã hội"],
        correctIndex: 0
    },
    {
        question: "Sau này khi ra trường, điều tôi sẽ nhớ nhất là gì?",
        options: ["Thầy cô giáo", "Đám bạn thân siêu nghịch", "Góc ghế đá sân trường", "Những buổi học muộn"],
        correctIndex: 1
    }
];

export function GameSection({ quiz, studentName = "tôi", isDark = false }: GameSectionProps) {
    const activeQuiz = quiz && quiz.length > 0 ? quiz : defaultQuiz;
    const [gameState, setGameState] = useState<"start" | "playing" | "ended">("start");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [shareCopied, setShareCopied] = useState(false);

    const currentQuestion = activeQuiz[currentIndex];

    const handleOptionSelect = (index: number) => {
        if (showFeedback) return;
        setSelectedOption(index);
        setShowFeedback(true);
        if (index === currentQuestion.correctIndex) {
            setScore(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < activeQuiz.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setShowFeedback(false);
        } else {
            setGameState("ended");
        }
    };

    const resetQuiz = () => {
        setCurrentIndex(0);
        setScore(0);
        setSelectedOption(null);
        setShowFeedback(false);
        setGameState("start");
        setShareCopied(false);
    };

    const getBadge = (correctScore: number, totalQuestions: number) => {
        const ratio = correctScore / totalQuestions;
        if (ratio === 1) {
            return {
                title: "Tri Kỷ Tri Âm",
                icon: "🏆",
                desc: "Bạn hiểu tớ tới từng chân tơ kẽ tóc! Xứng đáng làm bạn thân suốt đời.",
                color: "from-yellow-400 via-amber-500 to-orange-500 text-white shadow-yellow-500/25",
                badgeBorder: "border-yellow-400"
            };
        } else if (ratio >= 0.6) {
            return {
                title: "Bạn Thân Chí Cốt",
                icon: "🥇",
                desc: "Hiểu nhau đến 80% thế này là quá tuyệt vời rồi đó nha!",
                color: "from-indigo-400 via-purple-500 to-pink-500 text-white shadow-purple-500/25",
                badgeBorder: "border-purple-400"
            };
        } else if (ratio >= 0.3) {
            return {
                title: "Bạn Xã Giao",
                icon: "🤝",
                desc: "Cũng hiểu sương sương đấy, nhưng cần đi trà sữa nói chuyện nhiều hơn nha!",
                color: "from-blue-400 via-teal-500 to-emerald-500 text-white shadow-teal-500/25",
                badgeBorder: "border-teal-400"
            };
        } else {
            return {
                title: "Người Lạ Từng Quen",
                icon: "👤",
                desc: "Ơ kìa, chúng mình học chung lớp thật không thế? Mau kết nối lại đi nào!",
                color: "from-slate-400 to-slate-600 text-white shadow-slate-500/25",
                badgeBorder: "border-slate-400"
            };
        }
    };

    const badge = getBadge(score, activeQuiz.length);

    const handleShare = () => {
        const text = `Tớ đạt ${score}/${activeQuiz.length} điểm (${badge.title} ${badge.icon}) trong Thử Thách Độ Hiểu Nhau trên trang kỷ niệm của ${studentName}! Vào chơi thử xem bạn đạt bao nhiêu nhé: ${window.location.href}`;
        navigator.clipboard.writeText(text);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
    };

    return (
        <div className={`rounded-3xl p-6 md:p-8 transition-all border ${
            isDark 
                ? "bg-slate-900/80 border-amber-900/25 shadow-xl text-white" 
                : "bg-white border-amber-900/10 shadow-lg text-gray-800"
        }`}>
            {gameState === "start" && (
                <div className="text-center space-y-6 py-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto shadow-md">
                        <HelpCircle className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl sm:text-2xl font-serif font-bold">Thử Thách Độ Hiểu Nhau</h3>
                        <p className={`text-xs sm:text-sm max-w-md mx-auto leading-relaxed ${isDark ? "text-slate-300" : "text-gray-500"}`}>
                            Chủ nhân trang web ({studentName}) đã thiết lập bộ trắc nghiệm đặc biệt. Trả lời các câu hỏi để kiểm tra độ khăng khít của các cậu và nhận huy hiệu danh giá nhé!
                        </p>
                    </div>
                    <button
                        onClick={() => setGameState("playing")}
                        className="px-8 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all hover:scale-105"
                    >
                        Bắt đầu thử thách 🚀
                    </button>
                </div>
            )}

            {gameState === "playing" && (
                <div className="space-y-6">
                    {/* Header/Progress */}
                    <div className="flex justify-between items-center border-b pb-3 border-amber-900/10">
                        <span className="text-xs font-mono font-bold text-emerald-500">
                            CÂU HỎI {currentIndex + 1} / {activeQuiz.length}
                        </span>
                        <div className="w-32 bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div 
                                className="bg-emerald-500 h-full transition-all duration-300"
                                style={{ width: `${((currentIndex + 1) / activeQuiz.length) * 100}%` }}
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
                            {currentQuestion.options.map((option, idx) => {
                                let optStyle = isDark 
                                    ? "bg-slate-950 border-slate-700 hover:bg-slate-700/50" 
                                    : "bg-slate-50 border-slate-100 hover:bg-slate-100/50";
                                
                                if (showFeedback) {
                                    if (idx === currentQuestion.correctIndex) {
                                        optStyle = "bg-green-500/10 border-green-500 text-green-600 font-semibold";
                                    } else if (idx === selectedOption) {
                                        optStyle = "bg-red-500/10 border-red-500 text-red-600 font-semibold";
                                    } else {
                                        optStyle = "opacity-50 border-transparent pointer-events-none";
                                    }
                                } else if (idx === selectedOption) {
                                    optStyle = "border-emerald-500 ring-2 ring-emerald-500/20";
                                }

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionSelect(idx)}
                                        disabled={showFeedback}
                                        className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-3 ${optStyle}`}
                                    >
                                        <span>{option}</span>
                                        {showFeedback && idx === currentQuestion.correctIndex && (
                                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        )}
                                        {showFeedback && idx === selectedOption && idx !== currentQuestion.correctIndex && (
                                            <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
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
                                className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all hover:scale-103"
                            >
                                {currentIndex < activeQuiz.length - 1 ? "Câu hỏi tiếp theo ➔" : "Xem kết quả cuộc thi 🎉"}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {gameState === "ended" && (
                <div className="text-center space-y-6 py-4">
                    {/* Glowing Interactive Badge */}
                    <div className="relative inline-block">
                        <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${badge.color} border-4 ${badge.badgeBorder} flex flex-col items-center justify-center mx-auto shadow-xl`}>
                            <span className="text-4xl mb-1">{badge.icon}</span>
                            <span className="text-[10px] font-bold tracking-wider uppercase">{badge.title}</span>
                        </div>
                        <div className="absolute -top-1 -right-1 bg-yellow-400 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full rotate-[12deg] shadow-md border border-white">
                            {score} / {activeQuiz.length} Đ
                        </div>
                    </div>

                    {/* Result Description */}
                    <div className="space-y-2 max-w-sm mx-auto">
                        <h3 className="text-lg font-serif font-bold text-emerald-500">Thành quả của bạn!</h3>
                        <p className="text-sm font-semibold italic">{badge.title}</p>
                        <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-gray-500"}`}>
                            {badge.desc}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                        <button
                            onClick={handleShare}
                            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 hover:scale-103"
                        >
                            <Share2 className="w-3.5 h-3.5" />
                            {shareCopied ? "Đã sao chép!" : "Chia sẻ điểm số"}
                        </button>
                        <button
                            onClick={resetQuiz}
                            className={`px-5 py-2.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all hover:scale-103 ${
                                isDark 
                                    ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-755" 
                                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Chơi lại
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
