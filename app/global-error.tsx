'use client';

import { useEffect } from 'react';
// import * as Sentry from '@sentry/nextjs'; // Install @sentry/nextjs to enable error tracking
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log critical error to Sentry
        Sentry.captureException(error, {
            tags: {
                errorBoundary: 'global',
            },
            level: 'fatal',
        });
    }, [error]);

    return (
        <html lang="vi">
            <body>
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-purple-900 to-gray-900 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-md w-full"
                    >
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center">
                            {/* Icon */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
                                className="flex justify-center mb-6"
                            >
                                <div className="p-4 bg-red-500/20 rounded-full">
                                    <AlertTriangle className="w-20 h-20 text-red-400" />
                                </div>
                            </motion.div>

                            {/* Title */}
                            <h1 className="text-4xl font-bold text-white mb-4">
                                Lỗi Nghiêm Trọng
                            </h1>

                            {/* Description */}
                            <p className="text-white/80 text-lg mb-6">
                                Ứng dụng đã gặp sự cố nghiêm trọng. Chúng tôi đã ghi nhận lỗi này
                                và sẽ khắc phục trong thời gian sớm nhất.
                            </p>

                            {/* Error Details (development only) */}
                            {process.env.NODE_ENV === 'development' && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-left">
                                    <p className="text-xs text-red-300 font-mono break-all">
                                        {error.message}
                                    </p>
                                    {error.digest && (
                                        <p className="text-xs text-red-400 mt-2">
                                            Error ID: {error.digest}
                                        </p>
                                    )}
                                    {error.stack && (
                                        <details className="mt-2">
                                            <summary className="text-xs text-red-400 cursor-pointer">
                                                Stack Trace
                                            </summary>
                                            <pre className="text-xs text-red-300 mt-2 overflow-auto max-h-40">
                                                {error.stack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}

                            {/* Reload Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={reset}
                                className="flex items-center justify-center gap-2 w-full py-4 bg-white text-purple-900 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
                            >
                                <RefreshCw className="w-6 h-6" />
                                <span>Tải lại trang</span>
                            </motion.button>

                            {/* Footer Info */}
                            <p className="text-white/50 text-sm mt-6">
                                Lỗi đã được gửi đến đội ngũ phát triển
                            </p>
                        </div>
                    </motion.div>
                </div>
            </body>
        </html>
    );
}
