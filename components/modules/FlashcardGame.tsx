'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCw, Plus, Edit2, Trash2, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import EmptyState from '@/components/ui/EmptyState';
import { useAuthStore } from '@/store/useAuthStore';

interface GameQuestion {
    id: string;
    question: string;
    answer: string;
    category: string | null;
}

interface FlashcardGameProps {
    linkId: string;
}

export default function FlashcardGame({ linkId }: FlashcardGameProps) {
    const [questions, setQuestions] = useState<GameQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<GameQuestion | null>(null);
    const { viewMode } = useAuthStore();
    const supabase = createClient();

    const isOwner = viewMode === 'owner';

    const fetchQuestions = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('games')
            .select('*')
            .eq('link_id', linkId)
            .order('created_at', { ascending: true });

        if (!error && data) {
            setQuestions(data as GameQuestion[]);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchQuestions();
    }, [linkId]);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => {
            if (currentIndex < questions.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                // Reset to start
                setCurrentIndex(0);
            }
        }, 300);
    };

    const handlePrevious = () => {
        setIsFlipped(false);
        setTimeout(() => {
            if (currentIndex > 0) {
                setCurrentIndex(currentIndex - 1);
            }
        }, 300);
    };

    const handleReset = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex(0);
        }, 300);
    };

    const handleDelete = async (questionId: string) => {
        if (!confirm('Bạn có chắc muốn xóa câu hỏi này?')) return;

        await supabase.from('games').delete().eq('id', questionId);

        // Reset if deleting current card
        if (questions[currentIndex]?.id === questionId) {
            setCurrentIndex(0);
            setIsFlipped(false);
        }

        fetchQuestions();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent" />
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                        Trò Chơi Hiểu Nhau
                    </h2>
                    <p className="text-gray-600">
                        Thử thách hiểu biết về nhau
                    </p>
                </div>

                {isOwner && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            setEditingQuestion(null);
                            setShowAddModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Thêm câu hỏi</span>
                    </motion.button>
                )}
            </div>

            {/* Game Area */}
            {questions.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">🎮</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        Chưa có câu hỏi nào
                    </h3>
                    <p className="text-gray-500">
                        {isOwner
                            ? 'Tạo câu hỏi đầu tiên để bắt đầu trò chơi'
                            : 'Trò chơi sẽ có sẵn khi có câu hỏi'
                        }
                    </p>
                </div>
            ) : (
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Progress */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Câu {currentIndex + 1} / {questions.length}</span>
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 180 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleReset}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            title="Bắt đầu lại"
                        >
                            <RotateCw className="w-4 h-4" />
                        </motion.button>
                    </div>

                    {/* 3D Flip Card */}
                    <div
                        className="perspective-1000 cursor-pointer"
                        onClick={handleFlip}
                    >
                        <motion.div
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                            className="relative w-full aspect-[4/3] preserve-3d"
                        >
                            {/* Front - Question */}
                            <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center">
                                <div className="text-white text-center space-y-4">
                                    <div className="text-sm font-medium opacity-80">CÂU HỎI</div>
                                    <h3 className="text-2xl md:text-3xl font-bold leading-relaxed">
                                        {currentQuestion?.question}
                                    </h3>
                                    <div className="mt-8 text-sm opacity-70">
                                        Nhấn để xem đáp án
                                    </div>
                                </div>

                                {/* Category badge */}
                                {currentQuestion?.category && (
                                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white">
                                        {currentQuestion.category}
                                    </div>
                                )}
                            </div>

                            {/* Back - Answer */}
                            <div
                                className="absolute inset-0 backface-hidden bg-gradient-to-br from-green-500 to-teal-500 rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center"
                                style={{ transform: 'rotateY(180deg)' }}
                            >
                                <div className="text-white text-center space-y-4">
                                    <div className="text-sm font-medium opacity-80">ĐÁP ÁN</div>
                                    <h3 className="text-2xl md:text-3xl font-bold leading-relaxed">
                                        {currentQuestion?.answer}
                                    </h3>
                                    <div className="mt-8 text-sm opacity-70">
                                        Nhấn để xem câu hỏi
                                    </div>
                                </div>

                                {/* Edit/Delete buttons for owner */}
                                {isOwner && (
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingQuestion(currentQuestion);
                                                setShowAddModal(true);
                                            }}
                                            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4 text-white" />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(currentQuestion.id);
                                            }}
                                            className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4 text-white" />
                                        </motion.button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handlePrevious}
                            disabled={currentIndex === 0}
                            className="p-3 bg-purple-100 hover:bg-purple-200 disabled:bg-gray-100 disabled:cursor-not-allowed rounded-full transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6 text-purple-600" />
                        </motion.button>

                        <div className="text-sm text-gray-600 min-w-[100px] text-center">
                            Thẻ {currentIndex + 1} / {questions.length}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleNext}
                            className="p-3 bg-purple-100 hover:bg-purple-200 rounded-full transition-colors"
                        >
                            <ChevronRight className="w-6 h-6 text-purple-600" />
                        </motion.button>
                    </div>

                    {/* Completion message */}
                    {currentIndex === questions.length - 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center p-4 bg-green-50 border border-green-200 rounded-xl text-green-700"
                        >
                            🎉 Bạn đã xem hết tất cả câu hỏi! Nhấn mũi tên phải để bắt đầu lại.
                        </motion.div>
                    )}
                </div>
            )}

            {/* Add/Edit Modal */}
            <QuestionModal
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    setEditingQuestion(null);
                }}
                linkId={linkId}
                editingQuestion={editingQuestion}
                onSuccess={fetchQuestions}
            />
        </div>
    );
}

// Question Modal Component
function QuestionModal({ isOpen, onClose, linkId, editingQuestion, onSuccess }: {
    isOpen: boolean;
    onClose: () => void;
    linkId: string;
    editingQuestion: GameQuestion | null;
    onSuccess: () => void;
}) {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [category, setCategory] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        if (editingQuestion) {
            setQuestion(editingQuestion.question);
            setAnswer(editingQuestion.answer);
            setCategory(editingQuestion.category || '');
        } else {
            setQuestion('');
            setAnswer('');
            setCategory('');
        }
    }, [editingQuestion]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question || !answer) return;

        setIsSubmitting(true);

        try {
            if (editingQuestion) {
                // Update existing
                await supabase
                    .from('games')
                    .update({
                        question,
                        answer,
                        category: category || null,
                    })
                    .eq('id', editingQuestion.id);
            } else {
                // Create new
                await supabase.from('games').insert({
                    link_id: linkId,
                    question,
                    answer,
                    category: category || null,
                });
            }

            setQuestion('');
            setAnswer('');
            setCategory('');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving question:', error);
            alert('Có lỗi xảy ra khi lưu câu hỏi');
        }

        setIsSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-3xl shadow-2xl max-w-lg w-full"
                >
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-2xl font-bold text-gray-800">
                            {editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
                        </h3>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Câu hỏi *
                            </label>
                            <textarea
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="VD: Màu yêu thích của em là gì?"
                                rows={3}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Đáp án *
                            </label>
                            <textarea
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="VD: Màu hồng"
                                rows={3}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Danh mục (tuỳ chọn)
                            </label>
                            <input
                                type="text"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder="VD: Sở thích, Kỷ niệm, ..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !question || !answer}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Đang lưu...' : editingQuestion ? 'Cập nhật' : 'Thêm câu hỏi'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
