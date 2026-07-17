"use client";

import { useState } from "react";
import { School, Trophy, RotateCcw, BookOpen, Check, X, Sparkles } from "lucide-react";

interface GradClassGameSectionProps {
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
        question: "What's the best part of school?",
        options: ["Classes", "Friends", "Teachers", "All of the above"],
        correctAnswer: 3,
    },
    {
        id: 2,
        question: "What will you miss most?",
        options: ["Learning", "Memories", "Friends", "Everything"],
        correctAnswer: 3,
    },
    {
        id: 3,
        question: "What's the key to success?",
        options: ["Hard work", "Never give up", "Stay focused", "All of the above"],
        correctAnswer: 3,
    },
    {
        id: 4,
        question: "What makes a great class?",
        options: ["Unity", "Support", "Fun", "All of the above"],
        correctAnswer: 3,
    },
    {
        id: 5,
        question: "What's graduation day?",
        options: ["Sad", "Happy", "Bittersweet", "All emotions"],
        correctAnswer: 3,
    },
];

export function GradClassGameSection({ isDark = false }: GradClassGameSectionProps) {
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
                        <div className="absolute inset-0 bg-amber-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                        <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mb-4 shadow-2xl border-4 border-white animate-bounce">
                            <BookOpen className="w-10 h-10 text-white" />
                        </div>
                    </div>
                    <h2 className={`text-2xl font-bold mb-2 font-mono ${isDark ? "text-slate-100" : "text-gray-800"}`}>
                        Class Trivia
                    </h2>
                    <p className={`mb-6 font-mono ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                        Test your class knowledge!
                    </p>
                    <button
                        onClick={initializeGame}
                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-lg shadow-lg hover:shadow-2xl hover:shadow-amber-500/50 transition-all hover:scale-105 font-mono relative overflow-hidden group"
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
                                    <Sparkles className="w-6 h-6 text-amber-500" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className={`relative text-center p-8 rounded-2xl ${isDark ? "bg-gradient-to-br from-slate-800 to-slate-900 border border-amber-700" : "bg-gradient-to-br from-amber-100 to-orange-100 border-4 border-amber-200"}`}>
                    <div className="relative inline-block">
                        <div className={`absolute inset-0 blur-2xl opacity-60 animate-pulse rounded-full ${isPerfect ? "bg-yellow-500" : "bg-amber-500"}`}></div>
                        <Trophy className={`relative w-20 h-20 mx-auto mb-4 ${isPerfect ? "text-yellow-500 animate-bounce" : "text-amber-500"}`} />
                    </div>
                    <h3 className={`text-3xl font-bold mb-2 font-mono ${isDark ? "text-amber-300" : "text-gray-800"}`}>
                        {isPerfect ? "PERFECT SCORE!" : "Quiz Complete!"}
                    </h3>
                    <p className={`text-xl mb-4 font-mono ${isDark ? "text-slate-300" : "text-gray-600"}`}>
                        You scored {score} out of {questions.length}
                    </p>
                    <div className={`text-4xl font-bold mb-6 font-mono ${isPerfect ? "text-yellow-500" : "text-amber-500"}`}>
                        {percentage}%
                    </div>
                    <p className={`mb-6 font-mono ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                        {isPerfect 
                            ? "You're a class legend! 🎓" 
                            : percentage >= 80 
                            ? "Amazing! You know your class well! 🌟"
                            : percentage >= 60
                            ? "Good job! Keep the memories alive! 💪"
                            : "Remember the good times! 💖"}
                    </p>
                    <button
                        onClick={initializeGame}
                        className="flex items-center gap-2 px-6 py-3 mx-auto rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold shadow-lg hover:shadow-2xl hover:shadow-amber-500/50 transition-all hover:scale-105 font-mono relative overflow-hidden group"
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
                        <div className="absolute inset-0 bg-amber-500 rounded-full blur-lg opacity-40 animate-pulse"></div>
                        <div className="relative w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                            <School className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div>
                        <h2 className={`text-xl font-bold font-mono ${isDark ? "text-slate-100" : "text-gray-800"}`}>
                            Class Trivia
                        </h2>
                        <span className={`text-sm ${isDark ? "text-slate-400" : "text-gray-400"} font-mono`}>
                            Question {currentQuestion + 1} of {questions.length}
                        </span>
                    </div>
                </div>
                <div className={`px-4 py-2 rounded-full ${isDark ? "bg-slate-700 text-amber-300" : "bg-amber-100 text-orange-600"} font-bold font-mono`}>
                    Score: {score}
                </div>
            </div>

            <div className={`p-6 rounded-2xl ${isDark ? "bg-gradient-to-br from-slate-800 to-slate-900 border border-amber-700" : "bg-white border-4 border-amber-200 shadow-lg"}`}>
                <h3 className={`text-xl font-bold mb-6 font-mono ${isDark ? "text-amber-300" : "text-gray-800"}`}>
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
                                className={`w-full p-4 rounded-xl text-left font-medium transition-all font-mono ${
                                    showAnswerStyle
                                        ? isCorrect
                                            ? "bg-green-500 text-white border-2 border-green-400 scale-105"
                                            : "bg-red-500 text-white border-2 border-red-400"
                                        : isSelected
                                        ? "bg-amber-500 text-white border-2 border-amber-400"
                                        : isDark
                                        ? "bg-slate-700 text-slate-100 border-2 border-slate-600 hover:bg-slate-600 hover:border-amber-500"
                                        : "bg-amber-50 text-gray-700 border-2 border-amber-200 hover:bg-amber-100 hover:border-amber-400"
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
                        className={`w-3 h-3 rounded-full transition-all font-mono ${
                            index === currentQuestion
                                ? "bg-amber-500 scale-125"
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
