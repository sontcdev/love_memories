'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Music, Loader2 } from 'lucide-react';
import ThemeSelector from '@/components/settings/ThemeSelector';
import BackupButton from '@/components/settings/BackupButton';
import VisitorStats from '@/components/settings/VisitorStats';
import { useAuthStore } from '@/store/useAuthStore';
import { updateMusicUrl } from '@/app/actions/settings';
import { useRouter } from 'next/navigation';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    linkId: string;
    currentThemeColor?: string;
    currentMusicVideoId?: string;
}

export default function SettingsModal({ isOpen, onClose, linkId, currentThemeColor, currentMusicVideoId }: SettingsModalProps) {
    const [musicUrl, setMusicUrl] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { viewMode } = useAuthStore();
    const router = useRouter();

    // Only show for owners
    if (viewMode !== 'owner') return null;

    const handleSaveMusicUrl = async () => {
        if (!musicUrl.trim()) {
            setError('Vui lòng nhập URL YouTube');
            return;
        }

        setIsSaving(true);
        setError('');
        setSuccess('');

        try {
            const result = await updateMusicUrl(linkId, musicUrl);

            if (result.success) {
                setSuccess('✅ Đã cập nhật nhạc nền!');
                setMusicUrl('');

                // Refresh the page to reload MusicPlayer with new video ID
                setTimeout(() => {
                    router.refresh();
                    onClose();
                }, 1500);
            } else {
                setError(result.error || 'Có lỗi xảy ra');
            }
        } catch (err) {
            setError('Có lỗi xảy ra khi lưu');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', duration: 0.5 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
                        >
                            {/* Header */}
                            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 p-6">
                                <button
                                    onClick={onClose}
                                    className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Settings className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            Settings
                                        </h2>
                                        <p className="text-sm text-gray-600">
                                            Customize your digital memories
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 overflow-y-auto max-h-[calc(80vh-100px)] bg-gray-50 space-y-6">
                                {/* Theme Selector */}
                                <ThemeSelector
                                    linkId={linkId}
                                    currentColor={currentThemeColor}
                                    onColorChange={(color) => {
                                        console.log('Theme changed to:', color);
                                    }}
                                />

                                {/* Divider */}
                                <div className="border-t border-gray-200" />

                                {/* Music URL Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Music className="w-5 h-5 text-primary-600" />
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            Nhạc Nền
                                        </h3>
                                    </div>

                                    <p className="text-sm text-gray-600">
                                        Thay đổi nhạc nền bằng cách nhập URL YouTube. Trang sẽ tự động reload sau khi lưu.
                                    </p>

                                    {/* Current Video ID Display */}
                                    {currentMusicVideoId && (
                                        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                                            <span className="font-medium">Video ID hiện tại:</span> {currentMusicVideoId}
                                        </div>
                                    )}

                                    {/* Input */}
                                    <div className="space-y-3">
                                        <label className="block text-sm font-medium text-gray-700">
                                            URL YouTube <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={musicUrl}
                                            onChange={(e) => {
                                                setMusicUrl(e.target.value);
                                                setError('');
                                                setSuccess('');
                                            }}
                                            placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                                            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                            disabled={isSaving}
                                        />
                                        <p className="text-xs text-gray-500">
                                            Hỗ trợ: youtube.com/watch?v=... hoặc youtu.be/...
                                        </p>
                                    </div>

                                    {/* Error/Success Messages */}
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700"
                                        >
                                            {error}
                                        </motion.div>
                                    )}

                                    {success && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700"
                                        >
                                            {success}
                                        </motion.div>
                                    )}

                                    {/* Save Button */}
                                    <button
                                        onClick={handleSaveMusicUrl}
                                        disabled={isSaving || !musicUrl.trim()}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Đang lưu...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Music className="w-5 h-5" />
                                                <span>Lưu Nhạc Nền</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-gray-200" />

                                {/* Backup Data Section */}
                                <BackupButton linkId={linkId} />

                                {/* Divider */}
                                <div className="border-t border-gray-200" />

                                {/* Visitor Stats Section */}
                                <VisitorStats linkId={linkId} />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
