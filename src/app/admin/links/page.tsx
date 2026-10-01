import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession, getLinks } from "@/app/actions/admin-actions";
import { LinksTable } from "./links-table";

/**
 * Rows per page. `getLinks()` defaults to 50, but now that pages are actually
 * reachable a smaller page is quicker to scan and to load.
 */
const PAGE_SIZE = 20;

export default async function LinksPage({
    searchParams,
}: {
    searchParams: { page?: string };
}) {
    const session = await getAdminSession();

    if (!session) {
        redirect("/admin/login");
    }

    const requestedPage = Number(searchParams?.page);
    const page = Number.isFinite(requestedPage) && requestedPage > 0 ? Math.floor(requestedPage) : 1;

    const linksResult = await getLinks(page, PAGE_SIZE);
    const links = linksResult.success ? linksResult.data : [];
    const pagination = "pagination" in linksResult ? linksResult.pagination : undefined;
    const total = pagination?.total ?? links?.length ?? 0;
    const totalPages = pagination?.totalPages ?? 1;

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
                                <p className="text-xs text-slate-400">
                                    Quản lý {total} liên kết
                                    {totalPages > 1 && ` · Trang ${page}/${totalPages}`}
                                </p>
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
                <LinksTable initialLinks={links || []} />
                <LinksPagination page={page} totalPages={totalPages} total={total} pageSize={PAGE_SIZE} />
            </main>
        </div>
    );
}

/**
 * Server-rendered pagination — plain links, so it needs no client JS and each page
 * is bookmarkable. Renders nothing when everything fits on one page.
 */
function LinksPagination({
    page,
    totalPages,
    total,
    pageSize,
}: {
    page: number;
    totalPages: number;
    total: number;
    pageSize: number;
}) {
    if (totalPages <= 1) return null;

    const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const last = Math.min(page * pageSize, total);

    // First, last, and the current page ±1 — with gaps collapsed into an ellipsis.
    const shown = new Set<number>([1, totalPages, page - 1, page, page + 1]);
    const pages = Array.from(shown)
        .filter((p) => p >= 1 && p <= totalPages)
        .sort((a, b) => a - b);

    const linkBase =
        "min-w-9 rounded-lg border px-3 py-1.5 text-sm transition-colors text-center";
    const inactive =
        "border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500 hover:text-white";
    const disabled = "border-slate-800 bg-slate-900/30 text-slate-600 cursor-not-allowed";

    return (
        <nav aria-label="Phân trang danh sách liên kết" className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-xs text-slate-400">
                Hiển thị {first}–{last} trên {total} liên kết
            </p>

            <div className="flex items-center gap-1.5">
                {page > 1 ? (
                    <Link href={`/admin/links?page=${page - 1}`} className={`${linkBase} ${inactive}`} rel="prev">
                        ← Trước
                    </Link>
                ) : (
                    <span className={`${linkBase} ${disabled}`} aria-disabled="true">
                        ← Trước
                    </span>
                )}

                {pages.map((p, index) => {
                    const previous = pages[index - 1];
                    const gap = previous !== undefined && p - previous > 1;

                    return (
                        <span key={p} className="flex items-center gap-1.5">
                            {gap && (
                                <span className="px-1 text-slate-600" aria-hidden="true">
                                    …
                                </span>
                            )}
                            {p === page ? (
                                <span
                                    aria-current="page"
                                    className={`${linkBase} border-violet-500 bg-violet-500/15 font-semibold text-white`}
                                >
                                    {p}
                                </span>
                            ) : (
                                <Link href={`/admin/links?page=${p}`} className={`${linkBase} ${inactive}`}>
                                    {p}
                                </Link>
                            )}
                        </span>
                    );
                })}

                {page < totalPages ? (
                    <Link href={`/admin/links?page=${page + 1}`} className={`${linkBase} ${inactive}`} rel="next">
                        Sau →
                    </Link>
                ) : (
                    <span className={`${linkBase} ${disabled}`} aria-disabled="true">
                        Sau →
                    </span>
                )}
            </div>
        </nav>
    );
}

