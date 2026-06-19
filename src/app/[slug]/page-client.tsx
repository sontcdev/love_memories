"use client";

import { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { LockScreen } from "@/components/auth/LockScreen";
import { IdolLockScreen } from "@/components/auth/IdolLockScreen";
import { ThemeWrapper } from "@/components/theme/ThemeWrapper";
import type { MusicPlayerRef } from "@/components/music/MusicPlayer";
import { WelcomeOverlay } from "@/components/music/WelcomeOverlay";
import { getLinkData } from "@/app/actions/auth-actions";

// Dynamically load templates to optimize compilation and bundle size
const LoveTemplate = dynamic(() => import("@/components/templates/love/LoveTemplate").then(m => m.LoveTemplate), {
    loading: () => <div className="min-h-screen flex items-center justify-center text-slate-400">Đang tải giao diện...</div>
});
const Love2Template = dynamic(() => import("@/components/templates/love2/Love2Template").then(m => m.Love2Template), {
    loading: () => <div className="min-h-screen flex items-center justify-center text-slate-400">Đang tải giao diện...</div>
});
const IdolTemplate = dynamic(() => import("@/components/templates/idol/IdolTemplate").then(m => m.IdolTemplate), {
    loading: () => <div className="min-h-screen flex items-center justify-center text-slate-400">Đang tải giao diện...</div>
});
const GradPersonalTemplate = dynamic(() => import("@/components/templates/grad-personal/GradPersonalTemplate").then(m => m.GradPersonalTemplate), {
    loading: () => <div className="min-h-screen flex items-center justify-center text-slate-400">Đang tải giao diện...</div>
});
const GradClassTemplate = dynamic(() => import("@/components/templates/grad-class/GradClassTemplate").then(m => m.GradClassTemplate), {
    loading: () => <div className="min-h-screen flex items-center justify-center text-slate-400">Đang tải giao diện...</div>
});
const GradGroupTemplate = dynamic(() => import("@/components/templates/grad-group/GradGroupTemplate").then(m => m.GradGroupTemplate), {
    loading: () => <div className="min-h-screen flex items-center justify-center text-slate-400">Đang tải giao diện...</div>
});
import type { Link, LinkConfig, Gallery, Timeline, Letter, LetterReply } from "@prisma/client";

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
    const [isLoadingData, setIsLoadingData] = useState(false);
    const musicPlayerRef = useRef<MusicPlayerRef>(null);

    const handleUnlock = useCallback(async () => {
        setIsLoadingData(true);
        try {
            const result = await getLinkData(slug);
            if (result.success && result.data) {
                setLinkData(result.data as LinkWithRelations);
                setAuthenticated(true);
            } else {
                window.location.reload();
            }
        } catch {
            window.location.reload();
        }
        setIsLoadingData(false);
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
                {lockScreenData.type === "IDOL" ? (
                    <IdolLockScreen slug={slug} onSuccess={handleUnlock} linkData={lockScreenData} />
                ) : (
                    <LockScreen slug={slug} onSuccess={handleUnlock} linkData={lockScreenData} />
                )}
                {isLoadingData && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-6 flex items-center gap-3 shadow-xl">
                            <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-gray-700 font-medium">Đang tải nội dung...</span>
                        </div>
                    </div>
                )}
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
