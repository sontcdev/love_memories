import { redirect } from "next/navigation";
import { checkLinkAccess, getLinkData } from "@/app/actions/auth-actions";
import { EditPageClient } from "./edit-client";

interface PageProps {
    params: Promise<{ slug: string }>;
}

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
