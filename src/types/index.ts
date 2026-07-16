import { Link, LinkConfig, Gallery, Timeline, Letter, LetterReply } from "@prisma/client";

export type LetterWithReplies = Letter & { replies: LetterReply[] };

export type LinkWithRelations = Link & {
    config: LinkConfig | null;
    galleries: Gallery[];
    timelines: Timeline[];
    letters: LetterWithReplies[];
};

export type LinkPublicData = {
    id: string;
    slug: string;
    type: string;
    is_active: boolean;
    profile_data: unknown;
    config: LinkConfig | null;
};

export type LinkWithUser = Link & {
    user: {
        id: string;
        username: string;
    };
};

export type LinkWithConfig = Link & {
    config: LinkConfig | null;
    galleries: Gallery[];
    timelines: Timeline[];
    letters: Letter[];
};
