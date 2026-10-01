import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder assets
         * - API routes (handled separately)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.ico$|api/).*)",
    ],
};

// ============================================================================
// ROUTE PATTERNS
// ============================================================================

const ADMIN_ROUTES = ["/admin"];
const ADMIN_PUBLIC_ROUTES = ["/admin/login", "/admin/setup"];
// Only /[slug]/edit exists as a route today. `/letters` and `/timeline` used to be
// listed here but have no page.tsx in src/app — re-add them if those routes return.
const PROTECTED_SLUG_SUFFIXES = ["/edit"];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isAdminRoute(pathname: string): boolean {
    return ADMIN_ROUTES.some((route) => pathname.startsWith(route));
}

function isAdminPublicRoute(pathname: string): boolean {
    return ADMIN_PUBLIC_ROUTES.some((route) => pathname === route);
}

function isProtectedSlugRoute(pathname: string): boolean {
    // Check if path matches /[slug]/edit
    return PROTECTED_SLUG_SUFFIXES.some((suffix) => pathname.endsWith(suffix));
}

function getSlugFromPath(pathname: string): string | null {
    // Extract slug from paths like /my-slug/edit or /my-slug
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length >= 1) {
        return parts[0];
    }
    return null;
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // ---------------------------------------------
    // 1. ADMIN ROUTES PROTECTION
    // ---------------------------------------------
    if (isAdminRoute(pathname)) {
        // Allow public admin routes
        if (isAdminPublicRoute(pathname)) {
            return NextResponse.next();
        }

        // Check for admin session cookie
        const adminSession = request.cookies.get("admin_session")?.value;

        if (!adminSession) {
            // Redirect to admin login
            const loginUrl = new URL("/admin/login", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Admin is authenticated, continue
        return NextResponse.next();
    }

    // ---------------------------------------------
    // 2. USER SLUG ROUTES PROTECTION
    // ---------------------------------------------
    const slug = getSlugFromPath(pathname);

    if (slug && isProtectedSlugRoute(pathname)) {
        // Check for user session cookie (set after PIN verification)
        const sessionToken = request.cookies.get(`session_${slug}`)?.value;

        if (!sessionToken) {
            // Redirect to the main slug page (which shows lock screen)
            const slugUrl = new URL(`/${slug}`, request.url);
            slugUrl.searchParams.set("auth", "required");
            return NextResponse.redirect(slugUrl);
        }

        // User is authenticated for this slug, continue
        return NextResponse.next();
    }

    // ---------------------------------------------
    // 3. PUBLIC ROUTES - ALLOW ALL
    // ---------------------------------------------
    return NextResponse.next();
}
