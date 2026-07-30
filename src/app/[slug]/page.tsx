import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { cache } from "react";
import { Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getLinkData, getLinkPublicData } from "@/app/actions/auth-actions";
import { SlugPageClient } from "./page-client";
import { sanitizeHexColor } from "@/lib/validations";

export const dynamic = "force-dynamic";

/**
 * Trạng thái đăng của trang, đọc riêng khỏi `getLinkPublicData`.
 *
 * `getLinkPublicData` dùng một `select` được chia sẻ cho nhiều nơi và không có
 * `is_published`; đọc riêng ở đây rẻ hơn và an toàn hơn là nới rộng truy vấn
 * chung đó. Bọc trong `cache()` để page và `generateMetadata` dùng lại cùng một
 * lần truy vấn trong một request.
 */
const getPublishState = cache(async (slug: string) => {
    try {
        return await prisma.link.findUnique({
            where: { slug },
            select: { is_published: true },
        });
    } catch (error) {
        console.error("getPublishState failed", error);
        // Lỗi đọc cờ đăng không được làm sập trang: coi như đang hiển thị, giống
        // hành vi trước khi có tính năng này (`is_published` mặc định true).
        return { is_published: true };
    }
});

/** Màn hình cho khách khi chủ trang chưa đăng (hoặc đã chuyển về bản nháp). */
function ComingSoonScreen() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-rose-50 px-4">
            <div className="max-w-md text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                    <Clock className="h-8 w-8 text-amber-500" aria-hidden="true" />
                </div>
                <h1 className="mb-2 text-2xl font-bold text-slate-800">Trang đang được chuẩn bị</h1>
                <p className="leading-relaxed text-slate-500">
                    Chủ trang vẫn đang hoàn thiện những kỷ niệm ở đây. Bạn hãy quay lại sau một chút
                    nhé — link này vẫn dùng được, không cần xin lại.
                </p>
            </div>
        </div>
    );
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function SlugPage({ params }: PageProps) {
    const { slug } = await params;

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(`session_${slug}`)?.value;
    const isAuthenticated = !!sessionToken;

    if (isAuthenticated) {
        const linkResult = await getLinkData(slug);
        if (linkResult.success && linkResult.data) {
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
            const bgColor = sanitizeHexColor(linkResult.data.config?.background_color || '#ffffff');
            const accentColor = sanitizeHexColor(linkResult.data.config?.accent_color || '#ec4899');
            const textColor = sanitizeHexColor(linkResult.data.config?.text_color || '#1f2937');
            return (
                <>
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `
                                document.documentElement.style.setProperty('--theme-bg', '${bgColor}');
                                document.documentElement.style.setProperty('--theme-accent', '${accentColor}');
                                document.documentElement.style.setProperty('--theme-text', '${textColor}');
                            `,
                        }}
                    />
                    <SlugPageClient
                        slug={slug}
                        isAuthenticated={true}
                        linkData={linkResult.data}
                    />
                </>
            );
        }
    }

    const publicResult = await getLinkPublicData(slug);
    if (!publicResult.success || !publicResult.data) {
        notFound();
    }
    // `is_active` (công tắc của admin) giữ nguyên hành vi cũ.
    if (!publicResult.data.is_active) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center px-4">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Trang không khả dụng</h1>
                    <p className="text-gray-500">Trang kỷ niệm này hiện không khả dụng.</p>
                </div>
            </div>
        );
    }

    // Chưa đăng: KHÔNG 404, vì chủ trang có thể đã gửi link cho khách từ sớm.
    // Chủ trang (có cookie phiên) vẫn xem được bình thường ở nhánh phía trên.
    const publishState = await getPublishState(slug);
    if (publishState && !publishState.is_published) {
        return <ComingSoonScreen />;
    }

    const bgColor = sanitizeHexColor(publicResult.data.config?.background_color || '#ffffff');
    const accentColor = sanitizeHexColor(publicResult.data.config?.accent_color || '#ec4899');
    const textColor = sanitizeHexColor(publicResult.data.config?.text_color || '#1f2937');

    return (
        <>
            <script
                dangerouslySetInnerHTML={{
                    __html: `
                        document.documentElement.style.setProperty('--theme-bg', '${bgColor}');
                        document.documentElement.style.setProperty('--theme-accent', '${accentColor}');
                        document.documentElement.style.setProperty('--theme-text', '${textColor}');
                    `,
                }}
            />
            <SlugPageClient
                slug={slug}
                isAuthenticated={false}
                linkData={null}
                publicData={publicResult.data}
            />
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

    // Trang chưa đăng thì không cho công cụ tìm kiếm lập chỉ mục — bản nháp
    // không nên xuất hiện trong kết quả tìm kiếm.
    const publishState = await getPublishState(slug);
    const isPublished = publishState?.is_published !== false;

    return {
        title: `${title} | Love Memories`,
        description,
        ...(isPublished ? {} : { robots: { index: false, follow: false } }),
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
