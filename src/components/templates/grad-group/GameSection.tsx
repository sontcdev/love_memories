"use client";

import { useState } from "react";
import { RotateCcw, CheckCircle2, XCircle, Share2, HelpCircle } from "lucide-react";

interface QuizQuestion {
    question: string;
    options: string[];
    correctIndex: number;
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
    quiz?: QuizQuestion[];
    quizBadges?: QuizBadges;
    groupName?: string;
    isDark?: boolean;
    accentColor?: string;
}

const defaultQuiz: QuizQuestion[] = [
    {
        question: "Trong nhóm của chúng mình, ai là người hay 'bùng kèo' phút chót nhất?",
        options: ["Thành viên A", "Thành viên B", "Thành viên C", "Cả hội đều uy tín"],
        correctIndex: 1
    },
    {
        question: "Địa điểm tụ tập trà chiều yêu thích nhất của cả nhóm là ở đâu?",
        options: ["Quán trà sữa cổng trường", "Quán cà phê vỉa hè", "Nhà của một thành viên", "Căng tin trường"],
        correctIndex: 0
    },
    {
        question: "Biệt danh của nhóm tụi mình là gì?",
        options: ["Hội báo thủ", "Team đi học muộn", "Bộ sậu ăn quà vặt", "Liên minh huyền thoại"],
        correctIndex: 0
    },
    {
        question: "Chuyến đi xa đầu tiên cùng nhau của nhóm là đi đâu?",
        options: ["Đi cắm trại ngoại ô", "Đi du lịch biển", "Đi xem phim rạp", "Chưa đi đâu xa cùng nhau"],
        correctIndex: 1
    },
    {
        question: "Sau này khi ra trường, điều nhóm mình mong muốn thực hiện nhất là gì?",
        options: ["Cùng đỗ nguyện vọng 1", "Đi du lịch nước ngoài cùng nhau", "Họp nhóm mỗi năm một lần", "Mãi bên nhau bạn nhé"],
        correctIndex: 3
    }
];

export function GameSection({ quiz, quizBadges, groupName = "Chúng tớ", isDark = false, accentColor = "#d97706" }: GameSectionProps) {
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
                title: quizBadges?.perfect_title || "Tri Kỷ Tri Âm",
                icon: "🏆",
                desc: quizBadges?.perfect_desc || "Bạn hiểu nhóm tớ tới mức thượng thừa! Xứng đáng làm thành viên danh dự thứ n.",
                color: "from-yellow-400 via-amber-500 to-orange-500 text-white shadow-yellow-500/25",
                badgeBorder: "border-yellow-400"
            };
        } else if (ratio >= 0.6) {
            return {
                title: quizBadges?.good_title || "Đồng Bọn Chí Cốt",
                icon: "🥇",
                desc: quizBadges?.good_desc || "Chỉ lệch một chút thôi! Bạn rất biết quan sát nhóm tớ đấy.",
                color: "from-indigo-400 via-purple-500 to-pink-500 text-white shadow-purple-500/25",
                badgeBorder: "border-purple-400"
            };
        } else if (ratio >= 0.3) {
            return {
                title: quizBadges?.average_title || "Bạn Bè Xã Giao",
                icon: "🤝",
                desc: quizBadges?.average_desc || "Hiểu sương sương kỷ niệm, mau rủ cả nhóm tụ tập ăn uống chuộc lỗi đi nha!",
                color: "from-blue-400 via-teal-500 to-emerald-500 text-white shadow-teal-500/25",
                badgeBorder: "border-teal-400"
            };
        } else {
            return {
                title: quizBadges?.low_title || "Người Lạ Ghé Chơi",
                icon: "👤",
                desc: quizBadges?.low_desc || "Ủa bạn đi lầm ga rồi hả? Vui lòng kết nối lại tình nghĩa với nhóm tớ mau!",
                color: "from-slate-400 to-slate-600 text-white shadow-slate-500/25",
                badgeBorder: "border-slate-400"
            };
        }
    };

    const badge = getBadge(score, activeQuiz.length);

    const handleShare = () => {
        const text = `Tớ đạt ${score}/${activeQuiz.length} điểm trong Thử Thách Hiểu Ý Đồng Đội của nhóm ${groupName} và nhận danh hiệu [${badge.title} ${badge.icon}]! Thử sức xem bạn được bao nhiêu điểm nhé: ${window.location.href}`;
        navigator.clipboard.writeText(text);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
    };

    return (
        <div className={`rounded-3xl p-6 md:p-8 transition-all border ${
            isDark 
                ? "bg-slate-900/80 border-amber-900/20 shadow-xl text-white" 
                : "bg-white border-amber-900/10 shadow-lg text-gray-800"
        }`}>
            {gameState === "start" && (
                <div className="text-center space-y-6 py-6">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-md" style={{ backgroundColor: accentColor }}>
                        <HelpCircle className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl sm:text-2xl font-serif font-bold">Thử Thách Hiểu Ý Đồng Đội</h3>
                        <p className={`text-xs sm:text-sm max-w-md mx-auto leading-relaxed ${isDark ? "text-slate-350" : "text-gray-500"}`}>
                            Nhóm {groupName} đã soạn thảo bộ trắc nghiệm đặc biệt để kiểm tra xem bạn hiểu về tình huynh đệ của chúng tớ đến đâu. Vượt qua thử thách để rinh Huy hiệu tùy chọn nhé!
                        </p>
                    </div>
                    <button
                        onClick={() => setGameState("playing")}
                        className="px-8 py-3 rounded-full text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all hover:scale-105"
                        style={{ backgroundColor: accentColor }}
                    >
                        Bắt đầu chơi 🎮
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
                        <div className="w-32 bg-slate-200 h-2 rounded-full overflow-hidden">
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
                            {currentQuestion.options.map((option, idx) => {
                                let optStyle = isDark 
                                    ? "bg-slate-950 border-slate-850 hover:bg-slate-850/50" 
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
                                    optStyle = "ring-2 ring-opacity-25";
                                }

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionSelect(idx)}
                                        disabled={showFeedback}
                                        style={(!showFeedback && idx === selectedOption) ? { borderColor: accentColor, boxShadow: `0 0 0 3px ${accentColor}40` } : {}}
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
                                className="px-6 py-2.5 rounded-full text-white font-semibold text-xs transition-all hover:scale-103 shadow"
                                style={{ backgroundColor: accentColor }}
                            >
                                {currentIndex < activeQuiz.length - 1 ? "Câu hỏi tiếp theo ➔" : "Xem kết quả nhóm 🎉"}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {gameState === "ended" && (
                <div className="text-center space-y-6 py-4">
                    {/* Badge stickers */}
                    <div className="relative inline-block">
                        <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${badge.color} border-4 ${badge.badgeBorder} flex flex-col items-center justify-center mx-auto shadow-xl`}>
                            <span className="text-4xl mb-1">{badge.icon}</span>
                            <span className="text-[9px] px-1 font-bold tracking-wider uppercase text-center truncate w-full">{badge.title}</span>
                        </div>
                        <div className="absolute -top-1 -right-1 bg-yellow-400 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full rotate-[12deg] shadow-md border border-white">
                            {score} / {activeQuiz.length} Đ
                        </div>
                    </div>

                    {/* Result Info */}
                    <div className="space-y-2 max-w-sm mx-auto">
                        <h3 className="text-lg font-serif font-bold text-emerald-500">KẾT QUẢ ĐẠT ĐƯỢC</h3>
                        <p className="text-sm font-semibold italic">{badge.title}</p>
                        <p className={`text-xs leading-relaxed ${isDark ? "text-slate-350" : "text-gray-500"}`}>
                            {badge.desc}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                        <button
                            onClick={handleShare}
                            className="px-5 py-2.5 rounded-full text-white font-semibold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 hover:scale-103"
                            style={{ backgroundColor: accentColor }}
                        >
                            <Share2 className="w-3.5 h-3.5" />
                            {shareCopied ? "Đã sao chép!" : "Chia sẻ điểm"}
                        </button>
                        <button
                            onClick={resetQuiz}
                            className={`px-5 py-2.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all hover:scale-103 ${
                                isDark 
                                    ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750" 
                                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Thử lại
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
