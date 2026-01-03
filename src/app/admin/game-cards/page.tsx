import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { GameCardsTable } from "./game-cards-table";

export default async function GameCardsPage() {
    // Check admin auth
    const cookieStore = await cookies();
    const adminId = cookieStore.get("admin_session")?.value;

    if (!adminId) {
        redirect("/admin/login");
    }

    // Get admin info
    const admin = await prisma.admin.findUnique({
        where: { id: adminId },
        select: { username: true },
    });

    // Fetch game cards
    const cards = await prisma.gameCard.findMany({
        orderBy: [
            { level: "asc" },
            { created_at: "desc" },
        ],
    });

    // Count by level
    const counts = {
        EASY: cards.filter(c => c.level === "EASY").length,
        MEDIUM: cards.filter(c => c.level === "MEDIUM").length,
        HARD: cards.filter(c => c.level === "HARD").length,
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">M</span>
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-white">Trang Quản Trị</h1>
                                <p className="text-xs text-slate-400">Quản lý {cards.length} thẻ trò chơi</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-400">
                                Xin chào, <span className="text-white font-medium">{admin?.username}</span>
                            </span>
                            <form action="/admin/logout" method="POST">
                                <button
                                    type="submit"
                                    className="text-sm text-slate-400 hover:text-white transition-colors"
                                >
                                    Đăng xuất
                                </button>
                            </form>
                        </div>
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
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm font-medium">DỄ</p>
                        <p className="text-2xl font-bold text-white">{counts.EASY}</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-400 text-sm font-medium">TRUNG BÌNH</p>
                        <p className="text-2xl font-bold text-white">{counts.MEDIUM}</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                        <p className="text-red-400 text-sm font-medium">KHÓ</p>
                        <p className="text-2xl font-bold text-white">{counts.HARD}</p>
                    </div>
                </div>

                {/* Table */}
                <GameCardsTable initialCards={cards} />
            </main>
        </div>
    );
}
