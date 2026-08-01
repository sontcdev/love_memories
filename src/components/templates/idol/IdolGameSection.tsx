"use client";

import { useState } from "react";
import { Star, Trophy, RotateCcw, Music, Check, X } from "lucide-react";

interface IdolGameSectionProps {
    isDark?: boolean;
    idolName?: string;
    fanName?: string;
    debutDate?: string;
    idolBirthday?: string;
    fanSinceDate?: string;
}

interface Question {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
}

function formatVi(isoDate?: string): string | null {
    if (!isoDate) return null;
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** Trộn thứ tự và trả về 3 phương án nhiễu cộng với đáp án đúng, đáp án đúng ở vị trí ngẫu nhiên. */
function buildOptions(correct: string, decoys: string[]): { options: string[]; correctAnswer: number } {
    const correctIndex = Math.floor(Math.random() * (decoys.length + 1));
    const options = [...decoys];
    options.splice(correctIndex, 0, correct);
    return { options, correctAnswer: correctIndex };
}

/**
 * Quiz "Kỷ niệm cá nhân hoá" — thay cho fan quiz chung chung cũ.
 * Câu hỏi dùng chính dữ liệu người dùng đã nhập (ngày debut, ngày sinh idol,
 * ngày thành fan) nên mỗi trang Idol có bộ câu hỏi khác nhau.
 */
function buildPersonalizedQuestions({
    idolName = "Idol",
    fanName = "Fan",
    debutDate,
    idolBirthday,
    fanSinceDate,
}: {
    idolName?: string;
    fanName?: string;
    debutDate?: string;
    idolBirthday?: string;
    fanSinceDate?: string;
}): Question[] {
    const questions: Question[] = [];

    const debutFormatted = formatVi(debutDate);
    if (debutFormatted) {
        const { options, correctAnswer } = buildOptions(debutFormatted, ["01/01/2020", "15/06/2021", "20/09/2022"]);
        questions.push({
            id: 1,
            question: `${idolName} debut vào ngày nào?`,
            options,
            correctAnswer,
        });
    }

    const birthdayFormatted = formatVi(idolBirthday);
    if (birthdayFormatted) {
        const { options, correctAnswer } = buildOptions(birthdayFormatted, ["10/03", "22/07", "05/11"].map((d) => `${d}/${new Date().getFullYear() - 20}`));
        questions.push({
            id: 2,
            question: `Ngày sinh của ${idolName} là ngày nào?`,
            options,
            correctAnswer,
        });
    }

    const fanSinceFormatted = formatVi(fanSinceDate);
    if (fanSinceFormatted) {
        const { options, correctAnswer } = buildOptions(fanSinceFormatted, ["01/01/2023", "14/02/2024", "30/04/2024"]);
        questions.push({
            id: 3,
            question: `${fanName} trở thành fan của ${idolName} từ ngày nào?`,
            options,
            correctAnswer,
        });
    }

    questions.push({
        id: 4,
        question: `Fandom của ${idolName} có tên gọi là gì?`,
        options: [fanName, "Người hâm mộ ẩn danh", "Khán giả", "Chưa rõ"],
        correctAnswer: 0,
    });

    questions.push({
        id: 5,
        question: "Cách support idol văn minh nhất là gì?",
        options: ["Stream nhạc", "Lan tỏa năng lượng tích cực", "Tôn trọng idol và fan khác", "Tất cả các ý trên"],
        correctAnswer: 3,
    });

    return questions;
}

export function IdolGameSection({ isDark = true, idolName, fanName, debutDate, idolBirthday, fanSinceDate }: IdolGameSectionProps) {
    const [questions] = useState<Question[]>(() =>
        buildPersonalizedQuestions({ idolName, fanName, debutDate, idolBirthday, fanSinceDate })
    );
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
                        <div className="absolute inset-0 rounded-full blur-2xl opacity-60 animate-pulse" style={{ background: 'var(--accent)' }}></div>
                        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 shadow-2xl border-4 animate-bounce" style={{ background: 'var(--accent)', borderColor: 'color-mix(in oklch, var(--accent) 40%, white)' }}>
                            <Music className="w-10 h-10 text-white" />
                        </div>
                    </div>
                    <h2 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-800"}`}>
                        Fan Quiz
                    </h2>
                    <p className={`mb-6 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                        Kiểm tra độ hiểu fandom và câu chuyện idol.
                    </p>
                    <button
                        onClick={initializeGame}
                        className="px-8 py-3 rounded-xl text-white font-bold text-lg shadow-lg transition-all hover:scale-105 relative overflow-hidden group"
                        style={{ background: 'var(--accent)' }}
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

                <div className={`relative text-center p-8 rounded-2xl border ${isDark ? "bg-slate-900/80" : "bg-white"}`} style={{ borderColor: 'color-mix(in oklch, var(--accent) 35%, transparent)' }}>
                    <div className="relative inline-block">
                        <div className="absolute inset-0 blur-2xl opacity-60 animate-pulse rounded-full" style={{ background: 'var(--accent)' }}></div>
                        <Trophy className={`relative w-20 h-20 mx-auto mb-4 ${isPerfect ? "animate-bounce" : ""}`} style={{ color: 'var(--accent)' }} />
                    </div>
                    <h3 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-800"}`}>
                        {isPerfect ? "FAN CỨNG TUYỆT ĐỐI!" : "Hoàn thành quiz!"}
                    </h3>
                    <p className={`text-xl mb-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                        Bạn đạt {score}/{questions.length} câu đúng
                    </p>
                    <div className="text-4xl font-bold mb-6" style={{ color: 'var(--accent)' }}>
                        {percentage}%
                    </div>
                    <p className={`mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
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
                        className="flex items-center gap-2 px-6 py-3 mx-auto rounded-xl text-white font-bold shadow-lg transition-all hover:scale-105 relative overflow-hidden group"
                        style={{ background: 'var(--accent)' }}
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
                        <div className="absolute inset-0 rounded-full blur-lg opacity-50 animate-pulse" style={{ background: 'var(--accent)' }}></div>
                        <div className="relative w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2" style={{ background: 'var(--accent)', borderColor: 'color-mix(in oklch, var(--accent) 40%, white)' }}>
                            <Star className="w-5 h-5 text-white fill-current" />
                        </div>
                    </div>
                    <div>
                        <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                            Fan Quiz
                        </h2>
                        <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-400"}`}>
                            Câu {currentQuestion + 1}/{questions.length}
                        </span>
                    </div>
                </div>
                <div className="px-4 py-2 rounded-full font-bold" style={{ background: 'color-mix(in oklch, var(--accent) 15%, transparent)', color: 'var(--accent)' }}>
                    Điểm: {score}
                </div>
            </div>

            <div className={`p-6 rounded-2xl border ${isDark ? "bg-slate-900/80" : "bg-white shadow-lg"}`} style={{ borderColor: 'color-mix(in oklch, var(--accent) 25%, transparent)' }}>
                <h3 className={`text-xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-800"}`}>
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
                                className={`w-full p-4 rounded-xl text-left font-medium transition-all border-2 ${
                                    showAnswerStyle
                                        ? isCorrect
                                            ? "bg-green-500 text-white border-green-400 scale-105"
                                            : "bg-red-500 text-white border-red-400"
                                        : isSelected
                                        ? "text-white"
                                        : isDark
                                        ? "bg-slate-800/50 text-gray-200 border-white/10"
                                        : "bg-gray-50 text-gray-700 border-gray-200"
                                } ${!showResult && !isSelected ? "hover:scale-102" : ""}`}
                                style={!showAnswerStyle && isSelected ? { background: 'var(--accent)', borderColor: 'var(--accent)' } : undefined}
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
                                ? "scale-125"
                                : index < currentQuestion
                                ? "bg-green-400"
                                : isDark
                                ? "bg-slate-700"
                                : "bg-gray-300"
                        }`}
                        style={index === currentQuestion ? { background: 'var(--accent)' } : undefined}
                    />
                ))}
            </div>
        </div>
    );
}
