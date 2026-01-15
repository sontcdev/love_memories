'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Heart } from 'lucide-react';

interface GuestPasswordGateProps {
    username: string;
    onSuccess: (linkId: string) => void;
}

export default function GuestPasswordGate({ username, onSuccess }: GuestPasswordGateProps) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/verify-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Mật khẩu không đúng');
                setIsLoading(false);
                return;
            }

            // Start unlock animation
            setIsUnlocking(true);

            // Wait for animation, then call success
            setTimeout(() => {
                onSuccess(data.linkId);
            }, 800);

        } catch (err) {
            console.error('Password verification error:', err);
            setError('Có lỗi xảy ra, vui lòng thử lại');
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence mode="wait">
            {!isUnlocking ? (
                <motion.div
                    key="password-gate"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{
                        background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.9) 0%, rgba(147, 51, 234, 0.9) 100%)',
                        backdropFilter: 'blur(20px)',
                    }}
                >
                    {/* Animated background shapes */}
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/5 rounded-full"
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 90, 0],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                        />
                        <motion.div
                            className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-white/5 rounded-full"
                            animate={{
                                scale: [1.2, 1, 1.2],
                                rotate: [0, -90, 0],
                            }}
                            transition={{
                                duration: 25,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                        />
                    </div>

                    {/* Main content */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="relative w-full max-w-md"
                    >
                        {/* Card */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                            {/* Header */}
                            <div className="p-8 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                                    className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-white/20 rounded-full"
                                >
                                    <Heart className="w-8 h-8 text-white" fill="white" />
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-3xl font-bold text-white mb-2"
                                >
                                    Kỷ Niệm Số
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-white/80"
                                >
                                    Nhập mật khẩu để xem kỷ niệm của <span className="font-semibold">{username}</span>
                                </motion.p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-8 pt-0">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <div className="relative mb-2">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                setError('');
                                            }}
                                            placeholder="Nhập mật khẩu"
                                            className="w-full px-4 py-4 pl-12 bg-white/20 border border-white/30 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all backdrop-blur-sm"
                                            disabled={isLoading}
                                            autoFocus
                                        />
                                    </div>

                                    {error && (
                                        <motion.p
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="text-sm text-red-200 mb-4"
                                        >
                                            {error}
                                        </motion.p>
                                    )}

                                    <motion.button
                                        type="submit"
                                        disabled={isLoading || !password}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full py-4 bg-white text-purple-600 font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-xl"
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Đang xác thực...
                                            </span>
                                        ) : (
                                            'Mở khóa'
                                        )}
                                    </motion.button>
                                </motion.div>
                            </form>
                        </div>

                        {/* Footer hint */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="text-center text-white/60 text-sm mt-6"
                        >
                            Hãy liên hệ người tạo nếu bạn chưa có mật khẩu
                        </motion.p>
                    </motion.div>
                </motion.div>
            ) : (
                <motion.div
                    key="unlocking"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-pink-500/90 to-purple-600/90"
                >
                    <motion.div
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.2, 0] }}
                        transition={{ duration: 0.8 }}
                        className="text-white"
                    >
                        <Heart className="w-24 h-24" fill="white" />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
