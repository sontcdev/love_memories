"use client";

import { useState, useRef, useCallback } from "react";
import { LockScreen } from "@/components/auth/LockScreen";
import { IdolLockScreen } from "@/components/auth/IdolLockScreen";
import { ThemeWrapper } from "@/components/theme/ThemeWrapper";
import { MusicPlayer, MusicPlayerRef, WelcomeOverlay } from "@/components/music";
import { LoveTemplate } from "@/components/templates/love/LoveTemplate";
import { Love2Template } from "@/components/templates/love2/Love2Template";
import { IdolTemplate } from "@/components/templates/idol/IdolTemplate";
import { GradPersonalTemplate } from "@/components/templates/grad-personal/GradPersonalTemplate";
import { GradClassTemplate } from "@/components/templates/grad-class/GradClassTemplate";
import { GradGroupTemplate } from "@/components/templates/grad-group/GradGroupTemplate";
import { Link, LinkConfig, Gallery, Timeline, Letter, LetterReply } from "@prisma/client";

type LetterWithReplies = Letter & { replies: LetterReply[] };

type LinkWithRelations = Link & {
    config: LinkConfig | null;
    galleries: Gallery[];
    timelines: Timeline[];
    letters: LetterWithReplies[];
};

interface SlugPageClientProps {
    slug: string;
    isAuthenticated: boolean;
    linkData: LinkWithRelations | null;
}

export function SlugPageClient({ slug, isAuthenticated, linkData }: SlugPageClientProps) {
    const [authenticated, setAuthenticated] = useState(isAuthenticated);
    const musicPlayerRef = useRef<MusicPlayerRef>(null);

    const handleUnlock = () => {
        // Just set authenticated state - no reload needed since linkData is already available
        setAuthenticated(true);
    };

    // Callback for when user opens the welcome overlay
    const handleWelcomeOpen = useCallback(() => {
        // Start playing music after user interaction (required by browsers)
        if (linkData?.config?.auto_play) {
            musicPlayerRef.current?.play();
        }
    }, [linkData?.config?.auto_play]);

    // No data available (should have data after reload)
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

    // Get profile data for welcome title
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

    // Render template based on link type
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
            {!authenticated ? (
                linkData.type === "IDOL" ? (
                    <IdolLockScreen slug={slug} onSuccess={handleUnlock} linkData={linkData} />
                ) : (
                    <LockScreen slug={slug} onSuccess={handleUnlock} linkData={linkData} />
                )
            ) : (
                <>
                    {/* Welcome Overlay - shows on first visit */}
                    <WelcomeOverlay
                        title={getWelcomeTitle()}
                        buttonText="Enter ✨"
                        type={linkData.type}
                        profileData={linkData.profile_data as Record<string, unknown> | null}
                        onOpen={handleWelcomeOpen}
                    />

                    {/* Main Template Content */}
                    {renderTemplate()}

                    {/* Music Player - appears after overlay is dismissed */}
                    {linkData.config?.music_url && (
                        <MusicPlayer
                            ref={musicPlayerRef}
                            src={linkData.config.music_url}
                            autoPlay={linkData.config.auto_play ?? false}
                        />
                    )}
                </>
            )}
        </ThemeWrapper>
    );
}
