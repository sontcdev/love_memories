import Link from "next/link";
import { Heart, Home, Search } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                {/* Icon */}
                <div className="relative mb-8">
                    <div className="w-32 h-32 mx-auto bg-gradient-to-br from-rose-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                        <Heart className="w-16 h-16 text-rose-400/50" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Search className="w-8 h-8 text-white/30" />
                    </div>
                </div>

                {/* 404 */}
                <h1 className="text-7xl font-bold text-white/20 mb-4">404</h1>

                {/* Message */}
                <h2 className="text-2xl font-bold text-white mb-2">
                    Không tìm thấy trang
                </h2>
                <p className="text-gray-400 mb-8">
                    Trang kỷ niệm này không tồn tại hoặc đã bị xóa.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                        <Home className="w-5 h-5" />
                        Về trang chủ
                    </Link>
                </div>

                {/* Decorative */}
                <div className="mt-12 flex justify-center gap-2">
                    {[...Array(3)].map((_, i) => (
                        <Heart
                            key={i}
                            className="w-4 h-4 text-rose-500/30 fill-rose-500/30"
                            style={{ animationDelay: `${i * 200}ms` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
