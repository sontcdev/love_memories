
import { getAdminSession } from "@/app/actions/admin-actions";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getAdminSession();

    // Check if on login page
    const isLoginPage =
        typeof window === "undefined" ? false : window.location.pathname === "/admin/login";

    // If not logged in and not on login page, redirect to login
    if (!session && !isLoginPage) {
        // We'll handle this in middleware or individual pages
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {children}
        </div>
    );
}
