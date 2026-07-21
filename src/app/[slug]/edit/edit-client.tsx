"use client";

import { EveryEditClient } from "@/components/edit/templates/every/EveryEditClient";
import { FriendshipEditClient } from "@/components/edit/templates/friendship/FriendshipEditClient";
import { GradClassEditClient } from "@/components/edit/templates/grad-class/GradClassEditClient";
import { GradGroupEditClient } from "@/components/edit/templates/grad-group/GradGroupEditClient";
import { GradPersonalEditClient } from "@/components/edit/templates/grad-personal/GradPersonalEditClient";
import { IdolEditClient } from "@/components/edit/templates/idol/IdolEditClient";
import { LoveEditClient } from "@/components/edit/templates/love/LoveEditClient";
import { Love2EditClient } from "@/components/edit/templates/love2/Love2EditClient";
import { TravelEditClient } from "@/components/edit/templates/travel/TravelEditClient";
import { WeddingEditClient } from "@/components/edit/templates/wedding/WeddingEditClient";
import type { TemplateEditProps } from "@/components/edit/templates/shared";

export function EditPageClient({ slug, linkData }: TemplateEditProps) {
    switch (linkData.type) {
        case "LOVE2":
            return <Love2EditClient slug={slug} linkData={linkData} />;
        case "EVERY":
            return <EveryEditClient slug={slug} linkData={linkData} />;
        case "IDOL":
            return <IdolEditClient slug={slug} linkData={linkData} />;
        case "GRAD_PERSONAL":
            return <GradPersonalEditClient slug={slug} linkData={linkData} />;
        case "GRAD_CLASS":
            return <GradClassEditClient slug={slug} linkData={linkData} />;
        case "GRAD_GROUP":
            return <GradGroupEditClient slug={slug} linkData={linkData} />;
        case "WEDDING":
            return <WeddingEditClient slug={slug} linkData={linkData} />;
        case "TRAVEL":
            return <TravelEditClient slug={slug} linkData={linkData} />;
        case "FRIENDSHIP":
            return <FriendshipEditClient slug={slug} linkData={linkData} />;
        case "LOVE":
        default:
            return <LoveEditClient slug={slug} linkData={linkData} />;
    }
}
