"use client";

import { Compass, Map } from "lucide-react";
import {
    EditBackLink,
    EditFormContent,
    LoadingGate,
    PageQrCard,
    TemplateTabButton,
    ThemeModeButton,
    ViewPageLink,
    tabsOf,
    useTemplateEditState,
    type TemplateEditProps,
} from "@/components/edit/templates/shared";

const tabs = tabsOf(["profile", "timeline", "gallery", "settings"]);

export function GradGroupEditClient({ slug, linkData }: TemplateEditProps) {
    const state = useTemplateEditState({ slug, linkData, tabs, supportsThemeMode: true });
    const profileData = linkData.profile_data as Record<string, unknown> | null;
    const theme = (profileData?.theme as string) || "caravan";
    const isStation = theme === "station";
    const isScrapbook = theme === "scrapbook";
    const accent = isStation ? "text-cyan-300" : isScrapbook ? "text-pink-200" : "text-orange-200";

    return (
        <LoadingGate isInitializing={state.isInitializing} linkType={linkData.type}>
            <div className={`min-h-screen py-6 ${isStation ? "bg-[#05070a]" : isScrapbook ? "bg-[#1e1c18]" : "bg-[#120a05]"} text-orange-50`}>
                <div className={`mx-auto max-w-6xl overflow-hidden rounded-3xl border-4 shadow-[0_20px_50px_rgba(0,0,0,0.65)] ${
                    isStation ? "border-[#10161c] bg-[#182026]" : isScrapbook ? "border-[#7a0c3a] bg-[#2b2b2b]" : "border-[#3a2517] bg-[#2d1b10]"
                }`}>
                    <header className={`border-b px-4 py-4 sm:px-6 ${isStation ? "border-[#10161c] bg-[#1b252f]" : isScrapbook ? "border-[#1a1a1a] bg-[#880e4f]" : "border-[#1d1008] bg-[#4a3525]"}`}>
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <EditBackLink slug={slug} className="rounded-xl p-2 text-current transition hover:bg-white/10" />
                                <div>
                                    <p className={`text-[10px] font-bold uppercase tracking-[0.28em] ${accent}`}>Nhà ga ký ức</p>
                                    <h1 className="text-xl font-black">Trạm thanh xuân nhóm</h1>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <ThemeModeButton isDark={state.isDark} onToggle={state.toggleTheme} className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold" />
                                <ViewPageLink slug={slug} className="rounded-xl bg-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/20" />
                            </div>
                        </div>
                    </header>

                    <div className="grid md:grid-cols-[18rem_1fr]">
                        <aside className={`p-4 md:border-r-2 md:p-6 ${isStation ? "border-[#10161c] bg-[#1b252f]" : isScrapbook ? "border-[#1a1a1a] bg-[#880e4f]" : "border-[#1d1008] bg-[#4a3525]"}`}>
                            <div className="mb-6 rounded-2xl border border-white/10 bg-black/15 p-4">
                                <Compass className={`mb-3 h-10 w-10 ${accent}`} />
                                <h2 className="font-black">Đi cùng nhau</h2>
                                <p className="mt-2 text-sm opacity-75">Template này cần members, goals và roadmap rõ hơn một trang tốt nghiệp thông thường.</p>
                            </div>

                            <nav className="grid grid-cols-2 gap-2 md:flex md:flex-col md:gap-3">
                                {tabs.map((tab) => (
                                    <TemplateTabButton
                                        key={tab.id}
                                        tab={tab}
                                        active={state.activeTab === tab.id}
                                        onClick={() => state.setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 rounded-2xl px-3 py-3 text-left transition ${
                                            state.activeTab === tab.id ? "bg-white text-slate-900 shadow-lg" : "text-current hover:bg-white/10"
                                        }`}
                                    />
                                ))}
                            </nav>

                            <PageQrCard copied={state.copied} fullUrl={state.fullUrl} isDark onCopy={state.handleCopyLink} accentClass={accent} className="mt-6 hidden flex-col gap-4 rounded-2xl border border-white/10 bg-black/15 p-4 md:flex" />
                        </aside>

                        <main className="bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:100%_2.5rem] p-4 sm:p-6 md:p-8">
                            <section className="mb-6 rounded-2xl border border-white/10 bg-black/15 p-5">
                                <div className="flex items-center gap-3">
                                    <Map className={`h-5 w-5 ${accent}`} />
                                    <div>
                                        <p className={`text-[10px] font-bold uppercase tracking-[0.24em] ${accent}`}>Roadmap nhóm</p>
                                        <h2 className="text-lg font-black">{state.activeTabData.label}</h2>
                                        <p className="text-sm opacity-70">{state.activeTabData.description}</p>
                                    </div>
                                </div>
                            </section>
                            <EditFormContent activeTab={state.activeTab} slug={slug} linkData={linkData} isDark />
                        </main>
                    </div>
                </div>
            </div>
        </LoadingGate>
    );
}
