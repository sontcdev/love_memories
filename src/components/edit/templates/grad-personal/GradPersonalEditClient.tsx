"use client";

import { Award, BookOpen } from "lucide-react";
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

const tabs = tabsOf(["profile", "features", "timeline", "gallery", "settings"]);

export function GradPersonalEditClient({ slug, linkData }: TemplateEditProps) {
    const state = useTemplateEditState({ slug, linkData, tabs, supportsThemeMode: true });
    const dark = state.isDark;

    return (
        <LoadingGate isInitializing={state.isInitializing} linkType={linkData.type}>
            <div className={`min-h-screen py-6 ${dark ? "bg-[#150f0b] text-emerald-100" : "bg-[#2d1f18] text-slate-800"}`}>
                <div className={`mx-auto max-w-6xl overflow-hidden rounded-3xl border-4 shadow-[0_20px_50px_rgba(0,0,0,0.45)] ${dark ? "border-[#1c1511] bg-[#24352f]" : "border-[#3e2b20] bg-[#faf6ee]"}`}>
                    <header className={`border-b px-4 py-4 sm:px-6 ${dark ? "border-[#12241d] bg-[#0f1d19]" : "border-[#12241d] bg-[#1c352d] text-emerald-100"}`}>
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <EditBackLink slug={slug} className="rounded-xl p-2 text-current transition hover:bg-black/10" />
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] opacity-65">Sổ tay tốt nghiệp</p>
                                    <h1 className="text-xl font-black">Bàn tốt nghiệp cá nhân</h1>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <ThemeModeButton isDark={dark} onToggle={state.toggleTheme} className="flex items-center gap-2 rounded-xl bg-black/10 px-3 py-2 text-xs font-bold text-current" />
                                <ViewPageLink slug={slug} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white" />
                            </div>
                        </div>
                    </header>

                    <div className="grid md:grid-cols-[18rem_1fr]">
                        <aside className={`p-4 md:border-r-2 md:p-6 ${dark ? "border-[#10201a] bg-[#0f1d19]" : "border-[#1a3028]/20 bg-[#1c352d] text-emerald-100"}`}>
                            <div className="mb-6 rounded-sm border border-white/10 bg-black/10 p-4 shadow-inner">
                                <Award className="mb-3 h-10 w-10 text-amber-300" />
                                <h2 className="font-serif text-xl font-bold">Hồ sơ cá nhân là trung tâm</h2>
                                <p className="mt-2 text-sm opacity-75">Template này cần nhấn student profile, achievement và các cột mốc trưởng thành.</p>
                            </div>

                            <nav className="grid grid-cols-2 gap-2 md:flex md:flex-col md:gap-3">
                                {tabs.map((tab) => (
                                    <TemplateTabButton
                                        key={tab.id}
                                        tab={tab}
                                        active={state.activeTab === tab.id}
                                        onClick={() => state.setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 rounded-sm border px-3 py-3 text-left transition ${
                                            state.activeTab === tab.id ? "border-amber-300 bg-amber-300 text-emerald-950 shadow" : "border-white/10 text-current hover:bg-white/10"
                                        }`}
                                    />
                                ))}
                            </nav>

                        </aside>

                        <main className={`bg-[linear-gradient(rgba(36,74,60,0.05)_1px,transparent_1px)] bg-[size:100%_2.5rem] p-4 sm:p-6 md:p-8 ${dark ? "text-emerald-100" : "text-slate-800"}`}>
                            <section className="mb-6 rounded-sm border border-black/10 bg-white/30 p-5 shadow-inner">
                                <div className="flex items-center gap-3">
                                    <BookOpen className="h-5 w-5 text-amber-400" />
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] opacity-60">Trang hồ sơ</p>
                                        <h2 className="text-lg font-black">{state.activeTabData.label}</h2>
                                        <p className="text-sm opacity-70">{state.activeTabData.description}</p>
                                    </div>
                                </div>
                            </section>
                            <EditFormContent activeTab={state.activeTab} slug={slug} linkData={linkData} isDark={dark} />
                        </main>
                    </div>
                </div>
            </div>
        </LoadingGate>
    );
}
