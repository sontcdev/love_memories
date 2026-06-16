import { notFound } from "next/navigation";
import { getLinkData, checkLinkAccess } from "@/app/actions/auth-actions";
import { SlugPageClient } from "./page-client";

// Disable caching to always check fresh
export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function SlugPage({ params }: PageProps) {
    const { slug } = await params;

    // Fetch link data
    const linkResult = await getLinkData(slug);

    // If link doesn't exist, show 404
    if (!linkResult.success || !linkResult.data) {
        notFound();
    }

    // If link is not active, show disabled message
    if (!linkResult.data.is_active) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center px-4">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Trang không khả dụng</h1>
                    <p className="text-gray-500">Trang kỷ niệm này hiện không khả dụng.</p>
                </div>
            </div>
        );
    }

    // Check if the user is already authenticated (has session cookie)
    const isAuthed = await checkLinkAccess(slug);
    const bgColor = linkResult.data.config?.background_color || '#ffffff';
    const accentColor = linkResult.data.config?.accent_color || '#ec4899';

    return (
        <>
            {/* Inject theme CSS variables immediately */}
            <script
                dangerouslySetInnerHTML={{
                    __html: `
                        document.documentElement.style.setProperty('--theme-bg', '${bgColor}');
                        document.documentElement.style.setProperty('--theme-accent', '${accentColor}');
                    `,
                }}
            />
            <SlugPageClient
                slug={slug}
                isAuthenticated={isAuthed}
                linkData={linkResult.data}
            />
        </>
    );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    const linkResult = await getLinkData(slug);

    if (!linkResult.success || !linkResult.data) {
        return {
            title: "Không tìm thấy | Love Memories",
            description: "Trang kỷ niệm này không tồn tại.",
        };
    }

    const profileData = linkResult.data.profile_data as Record<string, string> | null;
    const linkType = linkResult.data.type;

    // Generate title based on link type
    let title = "Our Memories";
    let description = "Lưu giữ những khoảnh khắc đáng nhớ.";

    switch (linkType) {
        case "LOVE":
        case "LOVE2":
            const boyName = profileData?.boy_name || "Anh";
            const girlName = profileData?.girl_name || "Em";
            title = profileData?.title || `Kỷ niệm của ${boyName} & ${girlName}`;
            description = `Trang kỷ niệm tình yêu của ${boyName} và ${girlName}. ${profileData?.short_note || ""}`;
            break;
        case "IDOL":
            const idolName = profileData?.idol_name || "Idol";
            title = profileData?.title || `Fan Page - ${idolName}`;
            description = `Trang dành cho fan của ${idolName}.`;
            break;
        case "GRAD_PERSONAL":
            const studentName = profileData?.student_name || "Học sinh";
            title = profileData?.title || `Kỷ niệm tốt nghiệp - ${studentName}`;
            description = `Trang kỷ niệm tốt nghiệp cá nhân của ${studentName}. ${profileData?.slogan || ""}`;
            break;
        case "GRAD_CLASS":
            const className = profileData?.class_name || "Tập thể lớp";
            title = profileData?.title || `Kỷ yếu số lớp ${className}`;
            description = `Trang kỷ yếu số và lưu bút của tập thể lớp ${className}. ${profileData?.slogan || ""}`;
            break;
        case "GRAD_GROUP":
            const groupName = profileData?.group_name || "Nhóm bạn";
            title = profileData?.title || `Kỷ niệm nhóm - ${groupName}`;
            description = `Trang kỷ niệm của nhóm bạn ${groupName}. ${profileData?.slogan || ""}`;
            break;
        // case "EVERY":
        //     const groupName = profileData?.group_name || "Nhóm";
        //     title = profileData?.title || groupName;
        //     description = `Trang kỷ niệm của ${groupName}.`;
        //     break;
    }

    // Get first gallery image for OpenGraph
    const ogImage = linkResult.data.galleries?.[0]?.image_url;

    return {
        title: `${title} | Love Memories`,
        description,
        openGraph: {
            title,
            description,
            type: "website",
            locale: "vi_VN",
            ...(ogImage && { images: [{ url: ogImage, width: 1200, height: 630 }] }),
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            ...(ogImage && { images: [ogImage] }),
        },
    };
}
