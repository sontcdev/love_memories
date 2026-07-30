import Link from "next/link";
import { Skeleton, SkeletonRow } from "@/components/ui/skeleton";

/**
 * Trạng thái "đang tải" của trang Thẻ trò chơi.
 *
 * Trang này render động (đọc cookie + truy vấn Prisma) nên mỗi lần điều hướng
 * đều phải chờ dữ liệu. Trước đây khoảng chờ đó không có phản hồi nào, khiến
 * "đang tải" trông giống "không có dữ liệu". Khung xương dưới đây mô phỏng đúng
 * hình dạng nội dung thật (3 ô thống kê + bảng thẻ) để ba trạng thái
 * đang tải / trống / lỗi trông khác nhau rõ ràng.
 *
 * Các skeleton đều `aria-hidden`, nên `role="status"` và `aria-busy` được đặt ở
 * thẻ bọc ngoài cùng — trình đọc màn hình chỉ thông báo một vùng đang chờ.
 * Class `dark` để primitive dùng biến thể dark: trên nền slate của trang quản trị.
 */
export default function Loading() {
    return (
        <div className="dark min-h-screen" role="status" aria-busy="true">
            <span className="sr-only">Đang tải thẻ trò chơi...</span>

            {/* Header */}
            <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">M</span>
                            </div>
                            <div className="space-y-1.5">
                                <h1 className="text-lg font-semibold text-white">Trang Quản Trị</h1>
                                {/* Số lượng thẻ chỉ biết được sau khi tải xong */}
                                <Skeleton className="h-3 w-36" />
                            </div>
                        </div>
                        {/* Tên đăng nhập của quản trị viên */}
                        <Skeleton className="h-4 w-40" />
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-1 -mb-px">
                        <Link
                            href="/admin/links"
                            className="px-4 py-3 text-sm font-medium text-slate-400 hover:text-white border-b-2 border-transparent hover:border-slate-600 transition-colors"
                        >
                            📋 Liên kết
                        </Link>
                        <Link
                            href="/admin/game-cards"
                            className="px-4 py-3 text-sm font-medium text-white border-b-2 border-violet-500"
                        >
                            🀴 Thẻ trò chơi
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: "DỄ", chrome: "bg-green-500/10 border-green-500/30 text-green-400" },
                        { label: "TRUNG BÌNH", chrome: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" },
                        { label: "KHÓ", chrome: "bg-red-500/10 border-red-500/30 text-red-400" },
                    ].map((stat) => (
                        <div key={stat.label} className={`border rounded-xl p-4 ${stat.chrome}`}>
                            <p className="text-sm font-medium">{stat.label}</p>
                            <Skeleton className="mt-2 h-7 w-12" />
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                        <div className="flex gap-2">
                            {["ALL", "EASY", "MEDIUM", "HARD"].map((level) => (
                                <Skeleton key={level} className="h-8 w-16 rounded-lg" />
                            ))}
                        </div>
                        <Skeleton className="h-10 w-28 rounded-lg" />
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-slate-700/50 px-4">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <SkeletonRow key={index} columns={4} />
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-700/50">
                        <Skeleton className="h-4 w-40" />
                    </div>
                </div>
            </main>
        </div>
    );
}
