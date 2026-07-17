"use client";

import { useState } from "react";
import { Users, Trophy, RotateCcw, Bus, Sparkles, Check, X } from "lucide-react";

interface GradGroupGameSectionProps {
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
        question: "What's the best thing about our friend group?",
        options: ["Fun times", "Support", "Memories", "All of the above"],
        correctAnswer: 3,
    },
    {
        id: 2,
        question: "What will we miss most?",
        options: ["Hanging out", "Inside jokes", "Adventures", "Everything"],
        correctAnswer: 3,
    },
    {
        id: 3,
        question: "What makes us a great group?",
        options: ["Loyalty", "Trust", "Fun", "All of the above"],
        correctAnswer: 3,
    },
    {
        id: 4,
        question: "What's our group motto?",
        options: ["Together forever", "Friends for life", "Always there", "All of the above"],
        correctAnswer: 3,
    },
    {
        id: 5,
        question: "What's graduation day for us?",
        options: ["End of chapter", "New beginning", "Bittersweet", "All emotions"],
        correctAnswer: 3,
    },
];

export function GradGroupGameSection({ isDark = false }: GradGroupGameSectionProps) {
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
                        <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                        <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 shadow-2xl border-4 border-white animate-bounce">
                            <Users className="w-10 h-10 text-white" />
                        </div>
                    </div>
                    <h2 className={`text-2xl font-bold mb-2 ${isDark ? "text-slate-100" : "text-gray-800"}`}>
                        Friendship Quiz
                    </h2>
                    <p className={`mb-6 ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                        How well do you know the group?
                    </p>
                    <button
                        onClick={initializeGame}
                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-105 relative overflow-hidden group"
                    >
                        <span className="relative z-10">Start Quiz</span>
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
                                    <Sparkles className="w-6 h-6 text-blue-500" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className={`relative text-center p-8 rounded-2xl ${isDark ? "bg-gradient-to-br from-blue-900/50 to-purple-900/50 border border-blue-700" : "bg-gradient-to-br from-blue-100 to-purple-100 border-4 border-blue-200"}`}>
                    <div className="relative inline-block">
                        <div className={`absolute inset-0 blur-2xl opacity-60 animate-pulse rounded-full ${isPerfect ? "bg-yellow-500" : "bg-blue-500"}`}></div>
                        <Trophy className={`relative w-20 h-20 mx-auto mb-4 ${isPerfect ? "text-yellow-500 animate-bounce" : "text-blue-500"}`} />
                    </div>
                    <h3 className={`text-3xl font-bold mb-2 ${isDark ? "text-blue-100" : "text-gray-800"}`}>
                        {isPerfect ? "PERFECT SCORE!" : "Quiz Complete!"}
                    </h3>
                    <p className={`text-xl mb-4 ${isDark ? "text-slate-300" : "text-gray-600"}`}>
                        You scored {score} out of {questions.length}
                    </p>
                    <div className={`text-4xl font-bold mb-6 ${isPerfect ? "text-yellow-500" : "text-blue-500"}`}>
                        {percentage}%
                    </div>
                    <p className={`mb-6 ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                        {isPerfect 
                            ? "You're the ultimate friend! 🌟" 
                            : percentage >= 80 
                            ? "Amazing! You know the group well! 💙"
                            : percentage >= 60
                            ? "Good job! Keep the friendship alive! 💪"
                            : "Friends forever! 💖"}
                    </p>
                    <button
                        onClick={initializeGame}
                        className="flex items-center gap-2 px-6 py-3 mx-auto rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-105 relative overflow-hidden group"
                    >
                        <RotateCcw className="w-5 h-5 relative z-10" />
                        <span className="relative z-10">Play Again</span>
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
                        <div className="absolute inset-0 bg-blue-500 rounded-full blur-lg opacity-40 animate-pulse"></div>
                        <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                            <Bus className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div>
                        <h2 className={`text-xl font-bold ${isDark ? "text-slate-100" : "text-gray-800"}`}>
                            Friendship Quiz
                        </h2>
                        <span className={`text-sm ${isDark ? "text-slate-400" : "text-gray-400"}`}>
                            Question {currentQuestion + 1} of {questions.length}
                        </span>
                    </div>
                </div>
                <div className={`px-4 py-2 rounded-full ${isDark ? "bg-slate-800 text-blue-300" : "bg-blue-100 text-blue-600"} font-bold`}>
                    Score: {score}
                </div>
            </div>

            <div className={`p-6 rounded-2xl ${isDark ? "bg-gradient-to-br from-blue-900/80 to-purple-900/80 border border-blue-700" : "bg-white border-4 border-blue-200 shadow-lg"}`}>
                <h3 className={`text-xl font-bold mb-6 ${isDark ? "text-blue-300" : "text-gray-800"}`}>
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
                                        ? "bg-blue-500 text-white border-2 border-blue-400"
                                        : isDark
                                        ? "bg-slate-800 text-slate-100 border-2 border-slate-700 hover:bg-slate-700 hover:border-blue-500"
                                        : "bg-blue-50 text-gray-700 border-2 border-blue-200 hover:bg-blue-100 hover:border-blue-400"
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
                                ? "bg-blue-500 scale-125"
                                : index < currentQuestion
                                ? "bg-green-500"
                                : isDark
                                ? "bg-slate-700"
                                : "bg-gray-300"
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}
