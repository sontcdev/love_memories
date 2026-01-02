"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    useEffect(() => {
        // Log error to console (or send to error tracking service)
        console.error("Application error:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                {/* Icon */}
                <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle className="w-10 h-10 text-red-400" />
                </div>

                {/* Message */}
                <h1 className="text-2xl font-bold text-white mb-2">
                    Đã xảy ra lỗi
                </h1>
                <p className="text-gray-400 mb-8">
                    Xin lỗi, đã có sự cố xảy ra. Vui lòng thử lại sau.
                </p>

                {/* Error Details (dev only) */}
                {process.env.NODE_ENV === "development" && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-8 text-left">
                        <p className="text-xs text-red-400 font-mono break-all">
                            {error.message}
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={reset}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Thử lại
                    </button>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all"
                    >
                        <Home className="w-5 h-5" />
                        Về trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
}
