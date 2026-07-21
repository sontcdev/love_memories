"use client";

import { Mic, Radio } from "lucide-react";
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

const tabs = tabsOf(["profile", "features", "gallery", "timeline", "settings"]);

export function IdolEditClient({ slug, linkData }: TemplateEditProps) {
    const state = useTemplateEditState({ slug, linkData, tabs, supportsThemeMode: true });

    return (
        <LoadingGate isInitializing={state.isInitializing} linkType={linkData.type}>
            <div className={`min-h-screen overflow-hidden py-6 ${state.isDark ? "bg-[#05030a] text-purple-100" : "bg-gradient-to-br from-purple-50 via-white to-pink-50 text-purple-950"}`}>
                <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(236,72,153,0.18),transparent_26%),radial-gradient(circle_at_80%_0%,rgba(34,211,238,0.14),transparent_24%)]" />
                <div className={`relative mx-auto max-w-6xl overflow-hidden rounded-3xl border ${state.isDark ? "border-fuchsia-400/20 bg-slate-950/85 shadow-[0_0_60px_rgba(168,85,247,0.22)]" : "border-purple-100 bg-white/90 shadow-[0_24px_60px_rgba(168,85,247,0.16)]"}`}>
                    <header className={`border-b px-4 py-4 backdrop-blur sm:px-6 ${state.isDark ? "border-fuchsia-500/20 bg-slate-950/70" : "border-purple-100 bg-white/80"}`}>
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <EditBackLink slug={slug} className={`rounded-full p-2 transition ${state.isDark ? "text-cyan-300 hover:bg-white/10" : "text-purple-600 hover:bg-purple-50"}`} />
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-fuchsia-500">Stage manager</p>
                                    <h1 className="text-xl font-black tracking-wide">Backstage fanzone</h1>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <ThemeModeButton isDark={state.isDark} onToggle={state.toggleTheme} className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${state.isDark ? "bg-white/10 text-cyan-200" : "bg-purple-50 text-purple-700"}`} />
                                <ViewPageLink slug={slug} className="rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 px-4 py-2 text-sm font-bold text-white shadow-lg" />
                            </div>
                        </div>
                    </header>

                    <div className="grid md:grid-cols-[18rem_1fr]">
                        <aside className={`p-4 md:border-r md:p-6 ${state.isDark ? "border-fuchsia-500/20 bg-black/25" : "border-purple-100 bg-purple-50/50"}`}>
                            <div className={`mb-6 rounded-2xl border p-4 ${state.isDark ? "border-cyan-400/20 bg-white/5" : "border-purple-100 bg-white"}`}>
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-cyan-500 text-white shadow-lg">
                                    <Mic className="h-6 w-6" />
                                </div>
                                <h2 className="text-lg font-black">Điều phối sân khấu</h2>
                                <p className="mt-2 text-sm opacity-75">Tập trung idol profile, concert moments, fan letters và cảm giác live stage.</p>
                            </div>

                            <nav className="grid grid-cols-2 gap-2 md:flex md:flex-col">
                                {tabs.map((tab) => (
                                    <TemplateTabButton
                                        key={tab.id}
                                        tab={tab}
                                        active={state.activeTab === tab.id}
                                        onClick={() => state.setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 rounded-2xl px-3 py-3 text-left transition ${
                                            state.activeTab === tab.id
                                                ? "bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white shadow-[0_0_24px_rgba(217,70,239,0.25)]"
                                                : state.isDark ? "text-purple-100 hover:bg-white/10" : "text-purple-700 hover:bg-white"
                                        }`}
                                    />
                                ))}
                            </nav>

                            <PageQrCard
                                copied={state.copied}
                                fullUrl={state.fullUrl}
                                isDark={state.isDark}
                                onCopy={state.handleCopyLink}
                                accentClass={state.isDark ? "text-cyan-300" : "text-purple-600"}
                                className={`mt-6 hidden flex-col gap-4 rounded-2xl border p-4 md:flex ${state.isDark ? "border-fuchsia-500/20 bg-black/25" : "border-purple-100 bg-white/80"}`}
                            />
                        </aside>

                        <main className="p-4 sm:p-6 md:p-8">
                            <section className={`mb-6 rounded-2xl border p-5 ${state.isDark ? "border-fuchsia-400/20 bg-slate-950/45 shadow-[0_0_24px_rgba(168,85,247,0.12)]" : "border-purple-100 bg-white/85 shadow-[0_14px_34px_rgba(168,85,247,0.10)]"}`}>
                                <div className="flex items-center gap-3">
                                    <Radio className="h-5 w-5 text-fuchsia-500" />
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-fuchsia-500">Now editing</p>
                                        <h2 className="text-lg font-black">{state.activeTabData.label}</h2>
                                        <p className="text-sm opacity-70">{state.activeTabData.description}</p>
                                    </div>
                                </div>
                            </section>

                            <EditFormContent activeTab={state.activeTab} slug={slug} linkData={linkData} isDark={state.isDark} />
                        </main>
                    </div>
                </div>
            </div>
        </LoadingGate>
    );
}
