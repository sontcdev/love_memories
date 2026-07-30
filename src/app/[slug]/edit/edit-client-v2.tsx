"use client";

// EditPageClientV2 — edit shell mới (TemplateEditShell) cho các LinkType chưa có
// trên deploy: WEDDING, TRAVEL, FRIENDSHIP. Các type còn lại dùng EditPageClient
// trong edit-client.tsx, đã rollback byte-identical với deploy.

import { TemplateEditShell } from "@/components/edit/templates/TemplateEditShell";
import type { TemplateEditProps } from "@/components/edit/templates/shared";

export function EditPageClientV2({ slug, linkData }: TemplateEditProps) {
    return <TemplateEditShell slug={slug} linkData={linkData} />;
}
