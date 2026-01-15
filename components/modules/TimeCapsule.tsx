'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Clock, X, Plus, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import EmptyState from '@/components/ui/EmptyState';
import { useAuthStore } from '@/store/useAuthStore';

interface Message {
    id: string;
    title: string | null;
    content: string;
    open_at: string;
    is_opened: boolean;
    visible_to: 'owner' | 'guest' | 'both';
}

interface TimeCapsuleProps {
    linkId: string;
}

export default function TimeCapsule({ linkId }: TimeCapsuleProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [serverTime, setServerTime] = useState<Date | null>(null);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const { viewMode } = useAuthStore();
    const supabase = createClient();

    const isOwner = viewMode === 'owner';

    // Fetch server time
    const fetchServerTime = async () => {
        try {
            const response = await fetch('/api/server-time');
            const data = await response.json();
            setServerTime(new Date(data.serverTime));
        } catch (error) {
            console.error('Failed to fetch server time:', error);
            // Fallback to client time if server time fails
            setServerTime(new Date());
        }
    };

    // Fetch messages
    const fetchMessages = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('link_id', linkId)
            .order('open_at', { ascending: true });

        if (!error && data) {
            setMessages(data as Message[]);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchServerTime();
        fetchMessages();
    }, [linkId]);

    const isUnlocked = (message: Message) => {
        if (!serverTime) return false;
        return new Date(message.open_at) <= serverTime;
    };

    const handleEnvelopeClick = async (message: Message) => {
        if (!isUnlocked(message)) {
            // Locked - do nothing (shake animation handled by CSS)
            return;
        }

        // Mark as opened if not already
        if (!message.is_opened) {
            await supabase
                .from('messages')
                .update({ is_opened: true, opened_at: new Date().toISOString() })
                .eq('id', message.id);

            // Update local state
            setMessages(messages.map(m =>
                m.id === message.id ? { ...m, is_opened: true } : m
            ));
        }

        setSelectedMessage(message);
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (!confirm('Bạn có chắc muốn xóa lá thư này?')) return;

        await supabase.from('messages').delete().eq('id', messageId);
        fetchMessages();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                        Hộp Thư Thời Gian
                    </h2>
                    <p className="text-gray-600">
                        Những lời nhắn được mở khóa theo thời gian
                    </p>
                </div>

                {isOwner && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Thêm thư</span>
                    </motion.button>
                )}
            </div>

            {/* Messages Grid */}
            {messages.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">💌</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        Chưa có lá thư nào
                    </h3>
                    <p className="text-gray-500">
                        {isOwner
                            ? 'Tạo lá thư đầu tiên cho hộp thư thời gian'
                            : 'Hộp thư thời gian sẽ hiển thị ở đây'
                        }
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {messages.map((message) => {
                        const unlocked = isUnlocked(message);

                        return (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative"
                            >
                                <motion.button
                                    whileHover={{ scale: unlocked ? 1.05 : 1 }}
                                    whileTap={unlocked ? { scale: 0.95 } : { x: [-5, 5, -5, 5, 0] }}
                                    onClick={() => handleEnvelopeClick(message)}
                                    className={`
                    w-full aspect-square rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all
                    ${unlocked
                                            ? 'bg-gradient-to-br from-amber-100 to-yellow-100 hover:shadow-xl cursor-pointer'
                                            : 'bg-gradient-to-br from-gray-200 to-gray-300 cursor-not-allowed'
                                        }
                  `}
                                >
                                    {/* Envelope Icon */}
                                    <div className="relative">
                                        <Mail
                                            className={`w-16 h-16 ${unlocked ? 'text-amber-600' : 'text-gray-500'}`}
                                            fill={unlocked ? 'currentColor' : 'none'}
                                        />
                                        {!unlocked && (
                                            <Lock className="w-6 h-6 text-gray-600 absolute -top-1 -right-1 bg-white rounded-full p-1" />
                                        )}
                                    </div>

                                    {/* Title or Date */}
                                    <div className="text-center">
                                        <p className={`text-sm font-semibold ${unlocked ? 'text-amber-800' : 'text-gray-600'}`}>
                                            {message.title || 'Thư không tên'}
                                        </p>
                                        <div className="flex items-center gap-1 justify-center mt-1">
                                            <Clock className="w-3 h-3 text-gray-500" />
                                            <p className="text-xs text-gray-500">
                                                {new Date(message.open_at).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status badge */}
                                    {message.is_opened && unlocked && (
                                        <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                                            Đã đọc
                                        </div>
                                    )}
                                </motion.button>

                                {/* Delete button (owner only) */}
                                {isOwner && (
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        onClick={() => handleDeleteMessage(message.id)}
                                        className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </motion.button>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Letter Modal */}
            <AnimatePresence>
                {selectedMessage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedMessage(null)}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 50 }}
                            transition={{ type: "spring", duration: 0.6 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
                        >
                            {/* Envelope Header */}
                            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-6 relative">
                                <button
                                    onClick={() => setSelectedMessage(null)}
                                    className="absolute right-4 top-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>

                                <div className="flex items-center gap-3">
                                    <Mail className="w-8 h-8 text-white" fill="white" />
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">
                                            {selectedMessage.title || 'Thư không tên'}
                                        </h3>
                                        <p className="text-sm text-white/80">
                                            Mở khóa: {new Date(selectedMessage.open_at).toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Letter Content */}
                            <motion.div
                                initial={{ y: 100, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="p-8 overflow-y-auto max-h-[60vh]"
                            >
                                <div className="prose prose-lg max-w-none">
                                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                        {selectedMessage.content}
                                    </p>
                                </div>

                                {selectedMessage.is_opened && (
                                    <div className="mt-6 pt-6 border-t border-amber-200 text-sm text-gray-500 text-center">
                                        Đã mở lần đầu: {new Date(selectedMessage.open_at).toLocaleDateString('vi-VN')}
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Message Modal */}
            <AddMessageModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                linkId={linkId}
                onSuccess={fetchMessages}
            />
        </div>
    );
}

// Add Message Modal Component
function AddMessageModal({ isOpen, onClose, linkId, onSuccess }: {
    isOpen: boolean;
    onClose: () => void;
    linkId: string;
    onSuccess: () => void;
}) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [openAt, setOpenAt] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content || !openAt) return;

        setIsSubmitting(true);

        try {
            await supabase.from('messages').insert({
                link_id: linkId,
                title: title || null,
                content,
                open_at: new Date(openAt).toISOString(),
                visible_to: 'both',
            });

            setTitle('');
            setContent('');
            setOpenAt('');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error creating message:', error);
            alert('Có lỗi xảy ra khi tạo thư');
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
                        <h3 className="text-2xl font-bold text-gray-800">Tạo Thư Mới</h3>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tiêu đề (tuỳ chọn)
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="VD: Thư cho ngày kỷ niệm"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nội dung thư *
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Viết lời nhắn của bạn..."
                                rows={6}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Thời gian mở khóa *
                            </label>
                            <input
                                type="datetime-local"
                                value={openAt}
                                onChange={(e) => setOpenAt(e.target.value)}
                                required
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
                                disabled={isSubmitting || !content || !openAt}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Đang tạo...' : 'Tạo thư'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
