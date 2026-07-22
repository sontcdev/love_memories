"use client";

import { useState } from "react";
import { Star, Trophy, RotateCcw, Music, Check, X } from "lucide-react";

interface IdolGameSectionProps {
    isDark?: boolean;
}

interface Question {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
}

const defaultQuestions: Question[] = [
    {
        id: 1,
        question: "Một fanpage idol nên thể hiện điều gì rõ nhất?",
        options: ["Visual sân khấu", "Tình cảm fandom", "Dấu mốc sự nghiệp", "Tất cả các ý trên"],
        correctAnswer: 3,
    },
    {
        id: 2,
        question: "Cách support idol văn minh nhất là gì?",
        options: ["Stream nhạc", "Lan tỏa năng lượng tích cực", "Tôn trọng idol và fan khác", "Tất cả các ý trên"],
        correctAnswer: 3,
    },
    {
        id: 3,
        question: "Timeline idol nên ưu tiên mốc nào?",
        options: ["Debut/comeback", "Award", "Concert", "Tất cả các ý trên"],
        correctAnswer: 3,
    },
    {
        id: 4,
        question: "Một fanchant tốt nên như thế nào?",
        options: ["Ngắn, dễ nhớ, đúng vibe idol", "Thật dài", "Khó đọc", "Không liên quan"],
        correctAnswer: 0,
    },
    {
        id: 5,
        question: "Ảnh nào nên đặt nổi bật trong template Idol?",
        options: ["Ảnh sân khấu/visual rõ nhất", "Ảnh mờ", "Ảnh không liên quan", "Ảnh lỗi"],
        correctAnswer: 0,
    },
];

export function IdolGameSection({ isDark = true }: IdolGameSectionProps) {
    const [questions] = useState<Question[]>(defaultQuestions);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameFinished, setGameFinished] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const initializeGame = () => {
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setScore(0);
        setShowResult(false);
        setGameStarted(true);
        setGameFinished(false);
        setShowConfetti(false);
    };

    const handleAnswerSelect = (answerIndex: number) => {
        if (showResult) return;

        setSelectedAnswer(answerIndex);
        setShowResult(true);

        if (answerIndex === questions[currentQuestion].correctAnswer) {
            setScore(s => s + 1);
        }

        setTimeout(() => {
            if (currentQuestion < questions.length - 1) {
                setCurrentQuestion(q => q + 1);
                setSelectedAnswer(null);
                setShowResult(false);
            } else {
                setGameFinished(true);
                setShowConfetti(true);
            }
        }, 1500);
    };

    if (!gameStarted) {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-yellow-400 rounded-full blur-2xl opacity-60 animate-pulse"></div>
                        <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 shadow-2xl border-4 border-yellow-300 animate-bounce">
                            <Music className="w-10 h-10 text-white" />
                        </div>
                    </div>
                    <h2 className={`text-2xl font-bold mb-2 ${isDark ? "text-yellow-300" : "text-gray-800"}`}>
                        Fan Quiz
                    </h2>
                    <p className={`mb-6 ${isDark ? "text-purple-300" : "text-gray-600"}`}>
                        Kiểm tra độ hiểu fandom và câu chuyện idol.
                    </p>
                    <button
                        onClick={initializeGame}
                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-lg shadow-lg hover:shadow-2xl hover:shadow-yellow-400/50 transition-all hover:scale-105 relative overflow-hidden group"
                    >
                        <span className="relative z-10">Bắt đầu</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    </button>
                </div>
            </div>
        );
    }

    if (gameFinished) {
        const percentage = (score / questions.length) * 100;
        const isPerfect = percentage === 100;

        return (
            <div className="space-y-6">
                {showConfetti && (
                    <div className="relative">
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            {Array.from({ length: 40 }).map((_, i) => (
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
                                    <Star className="w-6 h-6 text-yellow-400 fill-current" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className={`relative text-center p-8 rounded-2xl ${isDark ? "bg-gradient-to-br from-purple-900/80 to-indigo-900/80 border border-yellow-400/50" : "bg-gradient-to-br from-yellow-50 to-orange-50 border-4 border-yellow-200"}`}>
                    <div className="relative inline-block">
                        <div className={`absolute inset-0 blur-2xl opacity-60 animate-pulse rounded-full ${isPerfect ? "bg-yellow-400" : "bg-orange-400"}`}></div>
                        <Trophy className={`relative w-20 h-20 mx-auto mb-4 ${isPerfect ? "text-yellow-400 animate-bounce" : "text-orange-400"}`} />
                    </div>
                    <h3 className={`text-3xl font-bold mb-2 ${isDark ? "text-yellow-300" : "text-gray-800"}`}>
                        {isPerfect ? "FAN CỨNG TUYỆT ĐỐI!" : "Hoàn thành quiz!"}
                    </h3>
                    <p className={`text-xl mb-4 ${isDark ? "text-purple-200" : "text-gray-600"}`}>
                        Bạn đạt {score}/{questions.length} câu đúng
                    </p>
                    <div className={`text-4xl font-bold mb-6 ${isPerfect ? "text-yellow-400" : "text-orange-400"}`}>
                        {percentage}%
                    </div>
                    <p className={`mb-6 ${isDark ? "text-purple-300" : "text-gray-600"}`}>
                        {isPerfect
                            ? "Bạn đúng là fan cứng. ⭐"
                            : percentage >= 80
                            ? "Rất ổn, fandom này có tâm. 🌟"
                            : percentage >= 60
                            ? "Ổn rồi, tiếp tục support văn minh. 💪"
                            : "Cần xem lại fanpage và timeline idol thêm. 💖"}
                    </p>
                    <button
                        onClick={initializeGame}
                        className="flex items-center gap-2 px-6 py-3 mx-auto rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold shadow-lg hover:shadow-2xl hover:shadow-yellow-400/50 transition-all hover:scale-105 relative overflow-hidden group"
                    >
                        <RotateCcw className="w-5 h-5 relative z-10" />
                        <span className="relative z-10">Chơi lại</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    </button>
                </div>
            </div>
        );
    }

    const question = questions[currentQuestion];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className="absolute inset-0 bg-yellow-400 rounded-full blur-lg opacity-50 animate-pulse"></div>
                        <div className="relative w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-300">
                            <Star className="w-5 h-5 text-white fill-current" />
                        </div>
                    </div>
                    <div>
                        <h2 className={`text-xl font-bold ${isDark ? "text-yellow-300" : "text-gray-800"}`}>
                            Fan Quiz
                        </h2>
                        <span className={`text-sm ${isDark ? "text-purple-300" : "text-gray-400"}`}>
                            Câu {currentQuestion + 1}/{questions.length}
                        </span>
                    </div>
                </div>
                <div className={`px-4 py-2 rounded-full ${isDark ? "bg-purple-800 text-yellow-300" : "bg-yellow-100 text-orange-600"} font-bold`}>
                    Điểm: {score}
                </div>
            </div>

            <div className={`p-6 rounded-2xl ${isDark ? "bg-gradient-to-br from-purple-900/80 to-indigo-900/80 border border-yellow-400/30" : "bg-white border-4 border-yellow-200 shadow-lg"}`}>
                <h3 className={`text-xl font-bold mb-6 ${isDark ? "text-yellow-300" : "text-gray-800"}`}>
                    {question.question}
                </h3>

                <div className="space-y-3">
                    {question.options.map((option, index) => {
                        const isSelected = selectedAnswer === index;
                        const isCorrect = index === question.correctAnswer;
                        const showAnswerStyle = showResult && (isSelected || isCorrect);

                        return (
                            <button
                                key={index}
                                onClick={() => handleAnswerSelect(index)}
                                disabled={showResult}
                                className={`w-full p-4 rounded-xl text-left font-medium transition-all ${
                                    showAnswerStyle
                                        ? isCorrect
                                            ? "bg-green-500 text-white border-2 border-green-400 scale-105"
                                            : "bg-red-500 text-white border-2 border-red-400"
                                        : isSelected
                                        ? "bg-yellow-400 text-white border-2 border-yellow-300"
                                        : isDark
                                        ? "bg-purple-800/50 text-purple-100 border-2 border-purple-600 hover:bg-purple-700/50 hover:border-yellow-400/50"
                                        : "bg-yellow-50 text-gray-700 border-2 border-yellow-200 hover:bg-yellow-100 hover:border-yellow-400"
                                } ${!showResult && !isSelected ? "hover:scale-102" : ""}`}
                            >
                                <div className="flex items-center justify-between">
                                    <span>{option}</span>
                                    {showAnswerStyle && (
                                        isCorrect ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex justify-center gap-2">
                {questions.map((_, index) => (
                    <div
                        key={index}
                        className={`w-3 h-3 rounded-full transition-all ${
                            index === currentQuestion
                                ? "bg-yellow-400 scale-125"
                                : index < currentQuestion
                                ? "bg-green-400"
                                : isDark
                                ? "bg-purple-700"
                                : "bg-gray-300"
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}
