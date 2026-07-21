"use client";

import { useState, useRef, useCallback } from "react";
import { ThemeWrapper } from "@/components/theme/ThemeWrapper";
import { MusicPlayerRef, WelcomeOverlay } from "@/components/music";
import { LoveTemplate } from "@/components/templates/love/LoveTemplate";
import { LoveLockScreen } from "@/components/templates/love/LoveLockScreen";
import { Love2Template } from "@/components/templates/love2/Love2Template";
import { Love2LockScreen } from "@/components/templates/love2/Love2LockScreen";
import { IdolTemplate } from "@/components/templates/idol/IdolTemplate";
import { IdolLockScreen } from "@/components/templates/idol/IdolLockScreen";
import { GradPersonalTemplate } from "@/components/templates/grad-personal/GradPersonalTemplate";
import { GradPersonalLockScreen } from "@/components/templates/grad-personal/GradPersonalLockScreen";
import { GradClassTemplate } from "@/components/templates/grad-class/GradClassTemplate";
import { GradClassLockScreen } from "@/components/templates/grad-class/GradClassLockScreen";
import { GradGroupTemplate } from "@/components/templates/grad-group/GradGroupTemplate";
import { GradGroupLockScreen } from "@/components/templates/grad-group/GradGroupLockScreen";
import { WeddingTemplate } from "@/components/templates/wedding/WeddingTemplate";
import { WeddingLockScreen } from "@/components/templates/wedding/WeddingLockScreen";
import { TravelTemplate } from "@/components/templates/travel/TravelTemplate";
import { TravelLockScreen } from "@/components/templates/travel/TravelLockScreen";
import { FriendshipTemplate } from "@/components/templates/friendship/FriendshipTemplate";
import { FriendshipLockScreen } from "@/components/templates/friendship/FriendshipLockScreen";
import { getLinkData } from "@/app/actions/auth-actions";
import { Link, LinkConfig, Gallery, Timeline, Letter, LetterReply } from "@prisma/client";
import { Loader2 } from "lucide-react";

type LetterWithReplies = Letter & { replies: LetterReply[] };

type LinkWithRelations = Link & {
    config: LinkConfig | null;
    galleries: Gallery[];
    timelines: Timeline[];
    letters: LetterWithReplies[];
};

type LinkPublicData = {
    id: string;
    slug: string;
    type: string;
    is_active: boolean;
    profile_data: unknown;
    config: LinkConfig | null;
};

interface SlugPageClientProps {
    slug: string;
    isAuthenticated: boolean;
    linkData: LinkWithRelations | null;
    publicData?: LinkPublicData | null;
}

export function SlugPageClient({ slug, isAuthenticated, linkData: initialLinkData, publicData }: SlugPageClientProps) {
    const [authenticated, setAuthenticated] = useState(isAuthenticated);
    const [linkData, setLinkData] = useState<LinkWithRelations | null>(initialLinkData);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const musicPlayerRef = useRef<MusicPlayerRef>(null);

    const handleUnlock = useCallback(async () => {
        setIsUnlocking(true);
        try {
            const result = await getLinkData(slug);
            if (result.success && result.data) {
                setLinkData(result.data as LinkWithRelations);
                setAuthenticated(true);
                return;
            } else {
                window.location.reload();
            }
        } catch {
            window.location.reload();
        } finally {
            setIsUnlocking(false);
        }
    }, [slug]);

    const handleWelcomeOpen = useCallback(() => {
        if (linkData?.config?.auto_play) {
            musicPlayerRef.current?.play();
        }
    }, [linkData?.config?.auto_play]);

    const lockScreenData = linkData || (publicData ? {
        ...publicData,
        galleries: [],
        timelines: [],
        letters: [],
    } as unknown as LinkWithRelations : null);

    const renderLockScreen = (data: LinkWithRelations) => {
        const props = { slug, onSuccess: handleUnlock, linkData: data };

        switch (data.type) {
            case "LOVE2":
                return <Love2LockScreen {...props} />;
            case "IDOL":
                return <IdolLockScreen {...props} />;
            case "GRAD_PERSONAL":
                return <GradPersonalLockScreen {...props} />;
            case "GRAD_CLASS":
                return <GradClassLockScreen {...props} />;
            case "GRAD_GROUP":
                return <GradGroupLockScreen {...props} />;
            case "WEDDING":
                return <WeddingLockScreen {...props} />;
            case "TRAVEL":
                return <TravelLockScreen {...props} />;
            case "FRIENDSHIP":
                return <FriendshipLockScreen {...props} />;
            case "EVERY":
            case "LOVE":
            default:
                return <LoveLockScreen {...props} />;
        }
    };

    if (!authenticated) {
        if (!lockScreenData) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Nội dung chưa sẵn sàng</h1>
                        <p className="text-gray-500">Trang này đang được chuẩn bị...</p>
                    </div>
                </div>
            );
        }

        return (
            <ThemeWrapper config={lockScreenData.config} type={lockScreenData.type}>
                <>
                    {renderLockScreen(lockScreenData)}
                    {isUnlocking && <UnlockLoadingOverlay />}
                </>
            </ThemeWrapper>
        );
    }

    if (!linkData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Nội dung chưa sẵn sàng</h1>
                    <p className="text-gray-500">Trang này đang được chuẩn bị...</p>
                </div>
            </div>
        );
    }

    const profileData = linkData.profile_data as Record<string, string> | null;
    const getWelcomeTitle = () => {
        switch (linkData.type) {
            case "LOVE":
            case "LOVE2":
                const boyName = profileData?.boy_name || "Him";
                const girlName = profileData?.girl_name || "Her";
                return `${boyName} & ${girlName}`;
            case "EVERY":
                return profileData?.group_name || "Our Memories";
            case "IDOL":
                return `For ${profileData?.idol_name || "My Idol"}`;
            case "GRAD_PERSONAL":
                return profileData?.student_name || "Graduation Day";
            case "GRAD_CLASS":
                return profileData?.class_name || "Our Class";
            case "GRAD_GROUP":
                return profileData?.group_name || "Our Group";
            case "WEDDING":
                const brideName = profileData?.bride_name || "Bride";
                const groomName = profileData?.groom_name || "Groom";
                return `${groomName} & ${brideName}`;
            case "TRAVEL":
                return profileData?.trip_name || "Our Journey";
            case "FRIENDSHIP":
                return profileData?.group_name || "Best Friends";
            default:
                return "Welcome";
        }
    };

    const renderTemplate = () => {
        switch (linkData.type) {
            case "LOVE":
                return <LoveTemplate data={linkData} slug={slug} />;
            case "LOVE2":
                return <Love2Template data={linkData} slug={slug} />;
            case "IDOL":
                return <IdolTemplate data={linkData} slug={slug} />;
            case "GRAD_PERSONAL":
                return <GradPersonalTemplate data={linkData} slug={slug} />;
            case "GRAD_CLASS":
                return <GradClassTemplate data={linkData} slug={slug} />;
            case "GRAD_GROUP":
                return <GradGroupTemplate data={linkData} slug={slug} />;
            case "WEDDING":
                return <WeddingTemplate data={linkData} slug={slug} />;
            case "TRAVEL":
                return <TravelTemplate data={linkData} slug={slug} isAuthenticated={isAuthenticated} />;
            case "FRIENDSHIP":
                return <FriendshipTemplate data={linkData} slug={slug} />;
            case "EVERY":
                return <LoveTemplate data={linkData} slug={slug} />;
            default:
                return <LoveTemplate data={linkData} slug={slug} />;
        }
    };

    return (
        <ThemeWrapper config={linkData.config} type={linkData.type}>
            <>
                <WelcomeOverlay
                    title={getWelcomeTitle()}
                    buttonText="Enter ✨"
                    type={linkData.type}
                    profileData={linkData.profile_data as Record<string, unknown> | null}
                    onOpen={handleWelcomeOpen}
                />

                {renderTemplate()}

                {/* Music Player - temporarily disabled (YouTube/TikTok playback issue) */}
                {/* {linkData.config?.music_url && (
                    <MusicPlayer
                        ref={musicPlayerRef}
                        src={linkData.config.music_url}
                        autoPlay={linkData.config.auto_play ?? false}
                    />
                )} */}
            </>
        </ThemeWrapper>
    );
}

function UnlockLoadingOverlay() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
            <div className="flex w-full max-w-xs flex-col items-center gap-4 rounded-3xl border border-white/20 bg-white/95 p-7 text-center shadow-2xl">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-pink-50">
                    <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
                </div>
                <div>
                    <p className="text-base font-bold text-gray-900">Đang mở khóa trang...</p>
                    <p className="mt-1 text-sm text-gray-500">Đang tải kỷ niệm và chuẩn bị giao diện.</p>
                </div>
            </div>
        </div>
    );
}
