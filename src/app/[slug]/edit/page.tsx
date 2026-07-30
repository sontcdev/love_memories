import { redirect } from "next/navigation";
import type { LinkType } from "@prisma/client";
import { checkLinkAccess, getLinkData } from "@/app/actions/auth-actions";
import { EditPageClient } from "./edit-client";
import { EditPageClientV2 } from "./edit-client-v2";

interface PageProps {
    params: Promise<{ slug: string }>;
}

// Các LinkType chưa tồn tại trên nhánh `deploy`. Chỉ nhóm này dùng edit shell mới;
// 7 type còn lại dùng `EditPageClient`, là code deploy nguyên bản.
const V2_EDIT_TYPES: LinkType[] = ["WEDDING", "TRAVEL", "FRIENDSHIP"];

export default async function EditPage({ params }: PageProps) {
    const { slug } = await params;

    // Check if user has access
    const hasAccess = await checkLinkAccess(slug);

    if (!hasAccess) {
        // Redirect to main page (which will show lock screen)
        redirect(`/${slug}`);
    }

    // Fetch link data
    const linkResult = await getLinkData(slug);

    if (!linkResult.success || !linkResult.data) {
        redirect(`/${slug}`);
    }

    if (V2_EDIT_TYPES.includes(linkResult.data.type)) {
        return (
            <EditPageClientV2
                slug={slug}
                linkData={linkResult.data}
            />
        );
    }

    return (
        <EditPageClient
            slug={slug}
            linkData={linkResult.data}
        />
    );
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    return {
        title: `Edit | ${slug}`,
        description: "Edit your memory page",
    };
}
