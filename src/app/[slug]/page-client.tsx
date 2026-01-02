"use client";

import { useState, useRef, useCallback } from "react";
import { LockScreen } from "@/components/auth/LockScreen";
import { ThemeWrapper } from "@/components/theme/ThemeWrapper";
import { MusicPlayer, MusicPlayerRef, WelcomeOverlay } from "@/components/music";
import { LoveTemplate } from "@/components/templates/LoveTemplate";
import { EveryTemplate } from "@/components/templates/EveryTemplate";
import { IdolTemplate } from "@/components/templates/IdolTemplate";
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
        // Full page reload to get updated data with new auth cookie
        setAuthenticated(true);
        window.location.reload();
    };

    // Callback for when user opens the welcome overlay
    const handleWelcomeOpen = useCallback(() => {
        // Start playing music after user interaction (required by browsers)
        if (linkData?.config?.auto_play) {
            setTimeout(() => {
                musicPlayerRef.current?.play();
            }, 300);
        }
    }, [linkData?.config?.auto_play]);

    // Show lock screen if not authenticated
    if (!authenticated) {
        return <LockScreen slug={slug} onSuccess={handleUnlock} />;
    }

    // No data available (should have data after reload)
    if (!linkData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Content Not Available</h1>
                    <p className="text-gray-500">This page is being prepared...</p>
                </div>
            </div>
        );
    }

    // Get profile data for welcome title
    const profileData = linkData.profile_data as Record<string, string> | null;
    const getWelcomeTitle = () => {
        switch (linkData.type) {
            case "LOVE":
                const boyName = profileData?.boy_name || "Him";
                const girlName = profileData?.girl_name || "Her";
                return `${boyName} & ${girlName}`;
            case "EVERY":
                return profileData?.group_name || "Our Memories";
            case "IDOL":
                return `For ${profileData?.idol_name || "My Idol"}`;
            default:
                return "Welcome";
        }
    };

    // Map link type to theme
    const getTheme = (): "love" | "every" | "idol" => {
        switch (linkData.type) {
            case "LOVE": return "love";
            case "EVERY": return "every";
            case "IDOL": return "idol";
            default: return "love";
        }
    };

    // Render template based on link type
    const renderTemplate = () => {
        switch (linkData.type) {
            case "LOVE":
                return <LoveTemplate data={linkData} slug={slug} />;
            case "EVERY":
                return <EveryTemplate data={linkData} slug={slug} />;
            case "IDOL":
                return <IdolTemplate data={linkData} slug={slug} />;
            default:
                return <LoveTemplate data={linkData} slug={slug} />;
        }
    };

    return (
        <ThemeWrapper config={linkData.config}>
            {/* Welcome Overlay - shows on first visit */}
            <WelcomeOverlay
                title={getWelcomeTitle()}
                subtitle={profileData?.short_note || "A special place for memories"}
                buttonText="Enter ✨"
                theme={getTheme()}
                onOpen={handleWelcomeOpen}
            />

            {/* Main Template Content */}
            {renderTemplate()}

            {/* Music Player - appears after overlay is dismissed */}
            <MusicPlayer
                ref={musicPlayerRef}
                src={linkData.config?.music_url}
                autoPlay={linkData.config?.auto_play ?? false}
            />
        </ThemeWrapper>
    );
}
