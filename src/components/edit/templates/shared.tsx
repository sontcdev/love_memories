"use client";

import { useCallback, useEffect, useState, type ComponentType, type ReactNode } from "react";
import Link from "next/link";
import type { Gallery, Letter, Link as PrismaLink, LinkConfig, LinkType, Timeline } from "@prisma/client";
import {
    ArrowLeft,
    Calendar,
    Image as ImageIcon,
    Moon,
    Settings,
    Sparkles,
    Sun,
    User,
    type LucideIcon,
} from "lucide-react";
import { EditConfigForm } from "@/components/edit/EditConfigForm";
import { EditIdolConfigForm } from "@/components/edit/EditIdolConfigForm";
import { EditProfileForm } from "@/components/edit/EditProfileForm";
import { GalleryManager } from "@/components/edit/GalleryManager";
import { TimelineManager } from "@/components/edit/TimelineManager";
import { EditTemplateLoading } from "@/app/[slug]/edit/edit-template-loading";
import { TemplateFeaturePanel } from "@/components/edit/templates/TemplateFeaturePanel";

export type LinkWithRelations = PrismaLink & {
    config: LinkConfig | null;
    galleries: Gallery[];
    timelines: Timeline[];
    letters: Letter[];
};

export interface TemplateEditProps {
    slug: string;
    linkData: LinkWithRelations;
}

export type EditTabId = "profile" | "features" | "gallery" | "timeline" | "settings";

export interface EditTab {
    id: EditTabId;
    label: string;
    shortLabel?: string;
    description: string;
    icon: LucideIcon;
}

export const EDIT_TABS: Record<EditTabId, EditTab> = {
    profile: {
        id: "profile",
        label: "Thông tin chung",
        shortLabel: "Hồ sơ",
        description: "Cập nhật thông tin hồ sơ",
        icon: User,
    },
    features: {
        id: "features",
        label: "Tính năng riêng",
        shortLabel: "Tính năng",
        description: "Cấu hình điểm nhấn theo template",
        icon: Sparkles,
    },
    gallery: {
        id: "gallery",
        label: "Thư viện ảnh",
        shortLabel: "Ảnh",
        description: "Quản lý ảnh của bạn",
        icon: ImageIcon,
    },
    timeline: {
        id: "timeline",
        label: "Dòng thời gian",
        shortLabel: "Timeline",
        description: "Chỉnh sửa câu chuyện",
        icon: Calendar,
    },
    settings: {
        id: "settings",
        label: "Cài đặt",
        shortLabel: "Cài đặt",
        description: "Tùy chỉnh màu sắc và nhạc",
        icon: Settings,
    },
};

export function tabsOf(ids: EditTabId[]): EditTab[] {
    return ids.map((id) => EDIT_TABS[id]);
}

export function useTemplateEditState({
    slug,
    linkData,
    tabs,
    supportsThemeMode = false,
}: TemplateEditProps & {
    tabs: EditTab[];
    supportsThemeMode?: boolean;
}) {
    const [activeTab, setActiveTab] = useState<EditTabId>(tabs[0]?.id ?? "profile");
    const [isInitializing, setIsInitializing] = useState(true);
    const [overrideDark, setOverrideDark] = useState<boolean | null>(null);

    useEffect(() => {
        const timer = window.setTimeout(() => setIsInitializing(false), 500);
        return () => window.clearTimeout(timer);
    }, []);

    const isDarkBackground = useCallback((hex?: string | null) => {
        if (!hex) return false;
        const color = hex.replace("#", "");
        if (color.length !== 6) return false;
        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness < 120;
    }, []);

    useEffect(() => {
        if (!supportsThemeMode) return;
        const saved = localStorage.getItem(`theme_mode_${slug}`);
        if (!saved) return;

        const isSavedDark = saved === "dark";
        setOverrideDark(isSavedDark);
        document.documentElement.style.setProperty(
            "--theme-bg",
            isSavedDark ? "#0b0813" : linkData.config?.background_color || "#ffffff"
        );
    }, [linkData.config?.background_color, slug, supportsThemeMode]);

    const isDark = supportsThemeMode && (overrideDark !== null ? overrideDark : isDarkBackground(linkData.config?.background_color));

    const toggleTheme = () => {
        const nextDark = !isDark;
        setOverrideDark(nextDark);
        localStorage.setItem(`theme_mode_${slug}`, nextDark ? "dark" : "light");
        window.dispatchEvent(new CustomEvent("theme-change", { detail: { isDark: nextDark } }));
        document.documentElement.style.setProperty("--theme-bg", nextDark ? "#0b0813" : linkData.config?.background_color || "#ffffff");
    };

    const activeTabData = tabs.find((tab) => tab.id === activeTab) ?? tabs[0] ?? EDIT_TABS.profile;

    return {
        activeTab,
        activeTabData,
        isDark,
        isInitializing,
        setActiveTab,
        toggleTheme,
    };
}

export function EditBackLink({ slug, className }: { slug: string; className: string }) {
    return (
        <Link href={`/${slug}`} className={className} aria-label="Quay lại trang">
            <ArrowLeft className="h-5 w-5" />
        </Link>
    );
}

export function ViewPageLink({ slug, className }: { slug: string; className: string }) {
    return (
        <Link href={`/${slug}`} target="_blank" className={className}>
            Xem trang
        </Link>
    );
}

export function ThemeModeButton({
    isDark,
    onToggle,
    className,
}: {
    isDark: boolean;
    onToggle: () => void;
    className: string;
}) {
    return (
        <button type="button" onClick={onToggle} className={className} aria-label="Đổi chế độ sáng tối">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="hidden sm:inline">{isDark ? "Light" : "Night"}</span>
        </button>
    );
}

export function TemplateTabButton({
    tab,
    active,
    onClick,
    className,
}: {
    tab: EditTab;
    active: boolean;
    onClick: () => void;
    className: string;
}) {
    const Icon = tab.icon;
    return (
        <button type="button" onClick={onClick} className={className} aria-current={active ? "page" : undefined}>
            <Icon className="h-4 w-4 shrink-0" />
            <span className="text-sm font-semibold">{tab.shortLabel ?? tab.label}</span>
        </button>
    );
}

export function EditFormContent({
    activeTab,
    slug,
    linkData,
    isDark,
}: {
    activeTab: EditTabId;
    slug: string;
    linkData: LinkWithRelations;
    isDark: boolean;
}) {
    if (activeTab === "profile") {
        return (
            <EditProfileForm
                slug={slug}
                linkType={linkData.type as LinkType}
                initialData={linkData.profile_data as Record<string, unknown>}
                isDark={isDark}
            />
        );
    }

    if (activeTab === "gallery") {
        return <GalleryManager slug={slug} initialGallery={linkData.galleries} isDark={isDark} />;
    }

    if (activeTab === "timeline") {
        return <TimelineManager slug={slug} initialTimeline={linkData.timelines} isDark={isDark} />;
    }

    if (activeTab === "features") {
        return <TemplateFeaturePanel slug={slug} linkData={linkData} isDark={isDark} />;
    }

    if (activeTab === "settings") {
        const initialConfig = linkData.config
            ? {
                background_color: linkData.config.background_color ?? undefined,
                accent_color: linkData.config.accent_color ?? undefined,
                text_color: linkData.config.text_color ?? undefined,
                font_family: linkData.config.font_family ?? undefined,
                music_url: linkData.config.music_url ?? undefined,
                auto_play: linkData.config.auto_play,
                game_template: linkData.config.game_template ?? undefined,
            }
            : null;

        if (linkData.type === "IDOL") {
            return (
                <EditIdolConfigForm
                    slug={slug}
                    linkType={linkData.type}
                    initialConfig={initialConfig}
                    isDark={isDark}
                />
            );
        }

        return <EditConfigForm slug={slug} linkType={linkData.type as LinkType} initialConfig={initialConfig} />;
    }

    return null;
}

export function LoadingGate({
    children,
    isInitializing,
    linkType,
}: {
    children: ReactNode;
    isInitializing: boolean;
    linkType: LinkType;
}) {
    if (isInitializing) return <EditTemplateLoading linkType={linkType} />;
    return children;
}

export type TemplateComponent = ComponentType<TemplateEditProps>;
