"use client";

import dynamic from "next/dynamic";
import type { Link } from "@prisma/client";

type LinkWithUser = Link & {
    user: {
        id: string;
        username: string;
    };
};

const LinksTable = dynamic(
    () => import("./links-table").then((m) => m.LinksTable),
    {
        loading: () => (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
        ),
    }
);

interface LinksTableClientProps {
    initialLinks: LinkWithUser[];
}

export function LinksTableClient({ initialLinks }: LinksTableClientProps) {
    return <LinksTable initialLinks={initialLinks} />;
}