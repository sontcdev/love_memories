import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession, getLinks } from "@/app/actions/admin-actions";
import { LinksTableClient } from "./links-table-client";

export default async function LinksPage() {
    const session = await getAdminSession();

    if (!session) {
        redirect("/admin/login");
    }

    const linksResult = await getLinks();
    const links = linksResult.success ? linksResult.data : [];

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
                                <p className="text-xs text-slate-400">Quản lý {links?.length || 0} liên kết</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-400">
                                Xin chào, <span className="text-white font-medium">{session.username}</span>
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
                            className="px-4 py-3 text-sm font-medium text-white border-b-2 border-violet-500"
                        >
                            📋 Liên kết
                        </Link>
                        <Link
                            href="/admin/game-cards"
                            className="px-4 py-3 text-sm font-medium text-slate-400 hover:text-white border-b-2 border-transparent hover:border-slate-600 transition-colors"
                        >
                            🀴 Thẻ trò chơi
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <LinksTableClient initialLinks={links || []} />
            </main>
        </div>
    );
}

