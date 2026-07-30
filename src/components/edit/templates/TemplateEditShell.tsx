"use client";

import type { LinkType } from "@prisma/client";
import dynamic from "next/dynamic";

// These five are chrome around the editor, not the editor itself: none of them is
// needed to paint the first screen, and PreviewDialog/RevisionHistory only do any
// work once opened. Loading them lazily keeps /[slug]/edit inside its First Load
// JS budget (statically imported, they pushed it 1.7 kB over).
const OnboardingChecklist = dynamic(() =>
    import("@/components/edit/OnboardingChecklist").then((m) => m.OnboardingChecklist)
);
const PreviewDialog = dynamic(() =>
    import("@/components/edit/PreviewDialog").then((m) => m.PreviewDialog)
);
const PublishControl = dynamic(() =>
    import("@/components/edit/PublishControl").then((m) => m.PublishControl)
);
const RevisionHistory = dynamic(() =>
    import("@/components/edit/RevisionHistory").then((m) => m.RevisionHistory)
);
const ShareCard = dynamic(() => import("@/components/edit/ShareCard").then((m) => m.ShareCard));

import {
    EDIT_SHELL_CONFIG,
    resolveSlot,
    type EditShellContext,
} from "@/components/edit/templates/edit-shell-config";
import {
    EditBackLink,
    EditFormContent,
    LoadingGate,
    TemplateTabButton,
    ThemeModeButton,
    ViewPageLink,
    tabsOf,
    useTemplateEditState,
    type TemplateEditProps,
} from "@/components/edit/templates/shared";

/**
 * Single edit-page shell for every LinkType.
 *
 * Replaces the 10 `*EditClient.tsx` files, which shared this exact JSX structure
 * and differed only in the Tailwind chrome / copy / tab order now held in
 * `edit-shell-config.ts`.
 */
export function TemplateEditShell({ slug, linkData }: TemplateEditProps) {
    const linkType = linkData.type as LinkType;
    const config = EDIT_SHELL_CONFIG[linkType] ?? EDIT_SHELL_CONFIG.LOVE;
    const tabs = tabsOf(config.tabs);

    const state = useTemplateEditState({
        slug,
        linkData,
        tabs,
        supportsThemeMode: config.supportsThemeMode ?? false,
    });

    const profileData = linkData.profile_data as Record<string, unknown> | null;

    // "Đã có hồ sơ" = có ít nhất một trường được điền thật, không tính chuỗi rỗng
    // hay mảng rỗng, vì `profile_data` thường được khởi tạo sẵn với khoá trống.
    const hasProfile = Boolean(
        profileData &&
        Object.values(profileData).some((value) => {
            if (value === null || value === undefined) return false;
            if (typeof value === "string") return value.trim().length > 0;
            if (Array.isArray(value)) return value.length > 0;
            return true;
        })
    );

    const ctx: EditShellContext = {
        isDark: state.isDark,
        subTheme: (profileData?.theme as string) || "caravan",
    };

    const contentIsDark =
        typeof config.contentIsDark === "function"
            ? config.contentIsDark(ctx)
            : config.contentIsDark ?? false;

    const AsideIcon = config.aside.icon;
    const MainIcon = config.main.icon;
    const asideIconWrap = resolveSlot(config.aside.iconWrap, ctx);

    return (
        <LoadingGate isInitializing={state.isInitializing} linkType={linkData.type}>
            <div className={resolveSlot(config.page, ctx)}>
                {config.overlay && <div className={resolveSlot(config.overlay, ctx)} />}

                <div className={resolveSlot(config.card, ctx)}>
                    <header className={resolveSlot(config.header.root, ctx)}>
                        <div className={resolveSlot(config.header.inner, ctx)}>
                            <div className="flex items-center gap-3">
                                <EditBackLink slug={slug} className={resolveSlot(config.header.backLink, ctx)} />
                                <div>
                                    <p className={resolveSlot(config.header.eyebrowClass, ctx)}>
                                        {config.header.eyebrow}
                                    </p>
                                    <h1 className={resolveSlot(config.header.titleClass, ctx)}>
                                        {config.header.title}
                                    </h1>
                                </div>
                            </div>

                            {/*
                                Cụm hành động bên phải header. `flex-wrap` để 4 nút vẫn xuống dòng
                                gọn trên màn hình nhỏ — chrome riêng của từng template vẫn lấy từ
                                `edit-shell-config.ts`, ở đây chỉ truyền thêm class ghi đè.
                            */}
                            <div className="flex flex-wrap items-center justify-end gap-2">
                                {config.header.themeButton && (
                                    <ThemeModeButton
                                        isDark={state.isDark}
                                        onToggle={state.toggleTheme}
                                        className={resolveSlot(config.header.themeButton, ctx)}
                                    />
                                )}
                                <PublishControl
                                    slug={slug}
                                    isPublished={linkData.is_published}
                                    publishedAt={linkData.published_at}
                                    isDark={contentIsDark}
                                />
                                <PreviewDialog slug={slug} isDark={contentIsDark} />
                                <ViewPageLink slug={slug} className={resolveSlot(config.header.viewLink, ctx)} />
                            </div>
                        </div>
                    </header>

                    <div className={resolveSlot(config.grid, ctx)}>
                        <aside className={resolveSlot(config.aside.root, ctx)}>
                            <div className={resolveSlot(config.aside.card, ctx)}>
                                {asideIconWrap ? (
                                    <div className={asideIconWrap}>
                                        <AsideIcon className={resolveSlot(config.aside.iconClass, ctx)} />
                                    </div>
                                ) : (
                                    <AsideIcon className={resolveSlot(config.aside.iconClass, ctx)} />
                                )}
                                <h2 className={resolveSlot(config.aside.headingClass, ctx)}>
                                    {config.aside.heading}
                                </h2>
                                <p className={resolveSlot(config.aside.blurbClass, ctx)}>{config.aside.blurb}</p>
                            </div>

                            <nav className={resolveSlot(config.aside.nav, ctx)}>
                                {tabs.map((tab, index) => (
                                    <TemplateTabButton
                                        key={tab.id}
                                        tab={tab}
                                        active={state.activeTab === tab.id}
                                        onClick={() => state.setActiveTab(tab.id)}
                                        className={config.aside.tab({
                                            ...ctx,
                                            active: state.activeTab === tab.id,
                                            index,
                                        })}
                                    />
                                ))}
                            </nav>

                            {/* Chia sẻ + lịch sử nằm ở sidebar: chúng liên quan tới cả
                                trang, không riêng tab nào đang mở. */}
                            <ShareCard slug={slug} isDark={contentIsDark} className="mt-4" />
                            <RevisionHistory slug={slug} isDark={contentIsDark} className="mt-3" />
                        </aside>

                        <main className={resolveSlot(config.main.root, ctx)}>
                            <OnboardingChecklist
                                slug={slug}
                                linkType={linkType}
                                hasProfile={hasProfile}
                                hasGallery={linkData.galleries.length > 0}
                                hasTimeline={linkData.timelines.length > 0}
                                isPublished={linkData.is_published}
                                isDark={contentIsDark}
                                onSelectTab={(tab) => {
                                    // Chỉ nhảy tới tab mà template này thực sự có.
                                    if (tabs.some((t) => t.id === tab)) state.setActiveTab(tab);
                                }}
                            />

                            <section className={resolveSlot(config.main.section, ctx)}>
                                <div className="flex items-center gap-3">
                                    <MainIcon className={resolveSlot(config.main.iconClass, ctx)} />
                                    <div>
                                        <p className={resolveSlot(config.main.eyebrowClass, ctx)}>
                                            {config.main.eyebrow}
                                        </p>
                                        <h2 className={resolveSlot(config.main.titleClass, ctx)}>
                                            {state.activeTabData.label}
                                        </h2>
                                        <p className={resolveSlot(config.main.descriptionClass, ctx)}>
                                            {state.activeTabData.description}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <EditFormContent
                                activeTab={state.activeTab}
                                slug={slug}
                                linkData={linkData}
                                isDark={contentIsDark}
                            />
                        </main>
                    </div>
                </div>
            </div>
        </LoadingGate>
    );
}
