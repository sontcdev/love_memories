'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Loader2 } from 'lucide-react';
import { updateLinkProfile } from '@/app/actions/profile';
import { useRouter } from 'next/navigation';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    linkId: string;
    currentNames: [string, string];
    currentDate: string;
}

export default function EditProfileModal({
    isOpen,
    onClose,
    linkId,
    currentNames,
    currentDate
}: EditProfileModalProps) {
    const [name1, setName1] = useState(currentNames[0] || '');
    const [name2, setName2] = useState(currentNames[1] || '');
    const [anniversaryDate, setAnniversaryDate] = useState(
        currentDate ? new Date(currentDate).toISOString().split('T')[0] : ''
    );
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSave = async () => {
        setError('');
        setIsSaving(true);

        const result = await updateLinkProfile(linkId, {
            name1,
            name2,
            anniversaryDate
        });

        setIsSaving(false);

        if (result.success) {
            router.refresh();
            onClose();
        } else {
            setError(result.error || 'Failed to update profile');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', duration: 0.5 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 relative">
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                    <Heart className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        Chỉnh Sửa Thông Tin
                                    </h2>
                                    <p className="text-sm text-white/80">
                                        Cập nhật tên và ngày kỷ niệm
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-5">
                            {/* Name 1 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên Người Thứ Nhất
                                </label>
                                <input
                                    type="text"
                                    value={name1}
                                    onChange={(e) => setName1(e.target.value)}
                                    placeholder="VD: Tùng"
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                    disabled={isSaving}
                                />
                            </div>

                            {/* Name 2 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên Người Thứ Hai
                                </label>
                                <input
                                    type="text"
                                    value={name2}
                                    onChange={(e) => setName2(e.target.value)}
                                    placeholder="VD: Cúc"
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                    disabled={isSaving}
                                />
                            </div>

                            {/* Anniversary Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ngày Kỷ Niệm
                                </label>
                                <input
                                    type="date"
                                    value={anniversaryDate}
                                    onChange={(e) => setAnniversaryDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                    disabled={isSaving}
                                />
                            </div>

                            {/* Error Message */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={onClose}
                                    disabled={isSaving}
                                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || !name1.trim() || !name2.trim() || !anniversaryDate}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Đang lưu...</span>
                                        </>
                                    ) : (
                                        <span>Lưu Thay Đổi</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
