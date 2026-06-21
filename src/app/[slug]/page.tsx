import { Suspense } from "react";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getLinkData, getLinkPublicData } from "@/app/actions/auth-actions";
import { SlugPageClient } from "./page-client";
import { PageSkeleton } from "./page-skeleton";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ slug: string }>;
}

const escapeJs = (s: string) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/<\//g, '<\\/');

const InactivePage = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Trang không khả dụng</h1>
            <p className="text-gray-500">Trang kỷ niệm này hiện không khả dụng.</p>
        </div>
    </div>
);

export default async function SlugPage({ params }: PageProps) {
    const { slug } = await params;

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(`session_${slug}`)?.value;
    const hasSession = !!sessionToken;

    // P-Fix 5: For authenticated users, fetch full data directly (saves 1 query)
    // For unauthenticated, fetch public data only (cached across requests)
    const isAuth = hasSession;
    const result = isAuth
        ? await getLinkData(slug)
        : await getLinkPublicData(slug);

    if (!result.success || !result.data) {
        notFound();
    }

    if (!result.data.is_active) {
        return <InactivePage />;
    }

    const config = result.data.config;
    const bgColor = config?.background_color || '#ffffff';
    const accentColor = config?.accent_color || '#ec4899';
    const textColor = config?.text_color || '#1f2937';

    return (
        <>
            <script
                dangerouslySetInnerHTML={{
                    __html: `
                        document.documentElement.style.setProperty('--theme-bg', '${escapeJs(bgColor)}');
                        document.documentElement.style.setProperty('--theme-accent', '${escapeJs(accentColor)}');
                        document.documentElement.style.setProperty('--theme-text', '${escapeJs(textColor)}');
                    `,
                }}
            />
            <Suspense
                key={`${slug}-${isAuth}`}
                fallback={
                    <PageSkeleton themeConfig={config} type={result.data.type} />
                }
            >
                {isAuth ? (
                    <SlugPageClient
                        slug={slug}
                        isAuthenticated={true}
                        linkData={result.data as Parameters<typeof SlugPageClient>[0]["linkData"]}
                    />
                ) : (
                    <SlugPageClient
                        slug={slug}
                        isAuthenticated={false}
                        linkData={null}
                        publicData={result.data as Parameters<typeof SlugPageClient>[0]["publicData"]}
                    />
                )}
            </Suspense>
        </>
    );
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    const publicResult = await getLinkPublicData(slug);

    if (!publicResult.success || !publicResult.data) {
        return {
            title: "Không tìm thấy | Love Memories",
            description: "Trang kỷ niệm này không tồn tại.",
        };
    }

    const profileData = publicResult.data.profile_data as Record<string, string> | null;
    const linkType = publicResult.data.type;

    let title = "Trang kỷ niệm";
    let description = "Một trang kỷ niệm đặc biệt dành cho bạn. Nhập mã PIN để mở khóa!";

    switch (linkType) {
        case "LOVE":
        case "LOVE2":
            title = "Kỷ niệm tình yêu";
            description = "Một trang kỷ niệm tình yêu đang chờ bạn mở khóa.";
            break;
        case "IDOL":
            title = "Fan Page";
            description = "Trang dành cho fan. Nhập mã PIN để xem!";
            break;
        case "GRAD_PERSONAL":
            title = "Kỷ niệm tốt nghiệp";
            description = "Trang kỷ niệm tốt nghiệp. Nhập mã PIN để xem!";
            break;
        case "GRAD_CLASS":
            title = "Kỷ yếu lớp";
            description = "Kỷ yếu tập thể lớp. Nhập mã PIN để mở khóa!";
            break;
        case "GRAD_GROUP":
            const groupName = profileData?.group_name || "Nhóm bạn";
            title = profileData?.title || `Kỷ niệm nhóm - ${groupName}`;
            description = `Trang kỷ niệm của nhóm ${groupName}. Nhập mã PIN để xem!`;
            break;
    }

    return {
        title: `${title} | Love Memories`,
        description,
        openGraph: {
            title,
            description,
            type: "website",
            locale: "vi_VN",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
        },
    };
}