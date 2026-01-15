'use client';

import { useEffect } from 'react';
// import * as Sentry from '@sentry/nextjs'; // Install @sentry/nextjs to enable error tracking
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error to Sentry
        Sentry.captureException(error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full"
            >
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
                    {/* Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="flex justify-center mb-6"
                    >
                        <div className="p-4 bg-red-500/20 rounded-full">
                            <AlertTriangle className="w-16 h-16 text-red-400" />
                        </div>
                    </motion.div>

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-white text-center mb-4">
                        Oops! Đã có lỗi xảy ra
                    </h1>

                    {/* Description */}
                    <p className="text-white/70 text-center mb-8">
                        Chúng tôi xin lỗi vì sự bất tiện này. Đã có lỗi xảy ra khi tải trang.
                        Vui lòng thử lại hoặc quay về trang chủ.
                    </p>

                    {/* Error Details (only in development) */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-xs text-red-300 font-mono break-all">
                                {error.message}
                            </p>
                            {error.digest && (
                                <p className="text-xs text-red-400 mt-2">
                                    Error ID: {error.digest}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={reset}
                            className="flex items-center justify-center gap-2 w-full py-3 bg-white text-purple-900 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                        >
                            <RefreshCw className="w-5 h-5" />
                            <span>Thử lại</span>
                        </motion.button>

                        <motion.a
                            href="/"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center justify-center gap-2 w-full py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors"
                        >
                            <Home className="w-5 h-5" />
                            <span>Về trang chủ</span>
                        </motion.a>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-white/50 text-sm mt-6">
                    Nếu lỗi vẫn tiếp tục, vui lòng liên hệ bộ phận hỗ trợ
                </p>
            </motion.div>
        </div>
    );
}
