"use client";

import { useCallback, useEffect, useState, Suspense, type ComponentType, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { Gallery, Letter, LetterReply, Link as PrismaLink, LinkConfig, LinkType, Timeline } from "@prisma/client";
import {
    ArrowLeft,
    Calendar,
    Image as ImageIcon,
    Mail,
    Moon,
    Settings,
    Sparkles,
    Sun,
    User,
    type LucideIcon,
} from "lucide-react";
import { EditTemplateLoading } from "@/app/[slug]/edit/edit-template-loading";

// Only one tab is ever on screen, but statically importing all six panels put
// every one of them in the /[slug]/edit bundle. EditProfileForm is the worst
// offender because it in turn fans out to the per-LinkType profile forms.
// ssr is left on (the default) so the panel is still server-rendered.
//
// Các panel dưới đây trỏ vào bản `*V2`: shell này chỉ phục vụ WEDDING/TRAVEL/
// FRIENDSHIP, còn 7 LinkType đã có trên deploy dùng `edit-client.tsx` (code
// deploy) với các form không hậu tố. Đừng đổi về tên không hậu tố.
const EditProfileForm = dynamic(() =>
    import("@/components/edit/EditProfileFormV2").then((m) => m.EditProfileFormV2)
);
const GalleryManager = dynamic(() =>
    import("@/components/edit/GalleryManagerV2").then((m) => m.GalleryManagerV2)
);
const TimelineManager = dynamic(() =>
    import("@/components/edit/TimelineManagerV2").then((m) => m.TimelineManagerV2)
);
const LetterBox = dynamic(() => import("@/components/shared/LetterBox").then((m) => m.LetterBox));
const TemplateFeaturePanel = dynamic(() =>
    import("@/components/edit/templates/TemplateFeaturePanel").then((m) => m.TemplateFeaturePanel)
);
const EditConfigForm = dynamic(() =>
    import("@/components/edit/EditConfigFormV2").then((m) => m.EditConfigFormV2)
);
const EditIdolConfigForm = dynamic(() =>
    import("@/components/edit/EditIdolConfigFormV2").then((m) => m.EditIdolConfigFormV2)
);

export type LinkWithRelations = PrismaLink & {
    config: LinkConfig | null;
    galleries: Gallery[];
    timelines: Timeline[];
    letters: (Letter & { replies: LetterReply[] })[];
};

export interface TemplateEditProps {
    slug: string;
    linkData: LinkWithRelations;
}

export type EditTabId = "profile" | "features" | "gallery" | "timeline" | "letters" | "settings";

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
        label: "Hướng dẫn & tiến độ",
        shortLabel: "Tiến độ",
        description: "Gợi ý biên tập theo template",
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
    letters: {
        id: "letters",
        label: "Lưu bút",
        shortLabel: "Lưu bút",
        description: "Viết, mở khóa và quản lý những lời nhắn riêng",
        icon: Mail,
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
    // Gate the first paint only until the persisted night-mode choice has been read
    // from localStorage, so the page never flashes the wrong palette. There is no
    // artificial delay: this resolves on the first client effect, and starts already
    // resolved for templates that have no night mode at all.
    const [isInitializing, setIsInitializing] = useState(supportsThemeMode);
    const [overrideDark, setOverrideDark] = useState<boolean | null>(null);

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

        if (saved) {
            const isSavedDark = saved === "dark";
            setOverrideDark(isSavedDark);
            document.documentElement.style.setProperty(
                "--theme-bg",
                isSavedDark ? "#0b0813" : linkData.config?.background_color || "#ffffff"
            );
        }

        // Theme resolved (whether or not a value was stored) — release the first paint.
        setIsInitializing(false);
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

export function EditFormContent(props: {
    activeTab: EditTabId;
    slug: string;
    linkData: LinkWithRelations;
    isDark: boolean;
}) {
    return (
        // Switching tabs now fetches a chunk. Without a boundary the panel area
        // would blank out mid-navigation; this keeps the layout height stable.
        <Suspense fallback={<EditPanelFallback isDark={props.isDark} />}>
            <EditFormPanel {...props} />
        </Suspense>
    );
}

function EditPanelFallback({ isDark }: { isDark: boolean }) {
    return (
        <div
            role="status"
            aria-busy="true"
            className="flex min-h-[16rem] flex-col gap-3 py-4"
        >
            <span className="sr-only">Đang tải nội dung…</span>
            {[0, 1, 2, 3].map((row) => (
                <div
                    key={row}
                    aria-hidden="true"
                    className={`h-11 rounded-lg motion-safe:animate-pulse ${isDark ? "bg-white/10" : "bg-slate-200/70"
                        } ${row === 3 ? "w-2/3" : "w-full"}`}
                />
            ))}
        </div>
    );
}

function EditFormPanel({
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

    if (activeTab === "letters") {
        return <LetterBox slug={slug} initialLetters={linkData.letters} isDark={isDark} />;
    }

    if (activeTab === "features") {
        return <TemplateFeaturePanel linkData={linkData} isDark={isDark} />;
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
