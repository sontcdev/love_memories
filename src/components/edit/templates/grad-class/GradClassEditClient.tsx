"use client";

import { BookOpen, Users } from "lucide-react";
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

const tabs = tabsOf(["profile", "features", "gallery", "timeline", "settings"]);

export function GradClassEditClient({ slug, linkData }: TemplateEditProps) {
    const state = useTemplateEditState({ slug, linkData, tabs, supportsThemeMode: true });
    const dark = state.isDark;

    return (
        <LoadingGate isInitializing={state.isInitializing} linkType={linkData.type}>
            <div className={`min-h-screen py-6 ${dark ? "bg-[#1a0f0b]" : "bg-[#3e2723]"} text-slate-100`}>
                <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border-4 border-[#1e100b] bg-[#131f1a] shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
                    <header className="border-b border-[#0c1411] bg-[#263238] px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <EditBackLink slug={slug} className="rounded-lg p-2 text-slate-200 transition hover:bg-white/10" />
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-lime-200/70">Phấn bảng</p>
                                    <h1 className="font-serif text-xl font-bold">Bảng kỷ yếu lớp</h1>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <ThemeModeButton isDark={dark} onToggle={state.toggleTheme} className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold" />
                                <ViewPageLink slug={slug} className="rounded-lg bg-lime-200 px-4 py-2 text-sm font-bold text-slate-900" />
                            </div>
                        </div>
                    </header>

                    <div className="grid md:grid-cols-[19rem_1fr]">
                        <aside className="bg-[#263238] p-4 md:border-r-2 md:border-[#0c1411] md:p-6">
                            <div className="mb-6 rounded-sm border-2 border-dashed border-lime-100/30 bg-black/10 p-4">
                                <Users className="mb-3 h-10 w-10 text-lime-200" />
                                <h2 className="font-serif text-xl font-bold">Kỷ yếu là tập thể</h2>
                                <p className="mt-2 text-sm text-slate-300">Ảnh lớp và dòng thời gian chung phải nổi bật hơn cấu hình cá nhân.</p>
                            </div>

                            <nav className="grid grid-cols-2 gap-2 md:flex md:flex-col">
                                {tabs.map((tab) => (
                                    <TemplateTabButton
                                        key={tab.id}
                                        tab={tab}
                                        active={state.activeTab === tab.id}
                                        onClick={() => state.setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 rounded-sm border-2 border-dashed px-3 py-3 text-left transition ${
                                            state.activeTab === tab.id ? "border-lime-200 bg-lime-200 text-slate-900" : "border-white/10 text-slate-200 hover:bg-white/10"
                                        }`}
                                    />
                                ))}
                            </nav>

                        </aside>

                        <main className="bg-[#131f1a] bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:16px_16px] p-4 sm:p-6 md:p-8">
                            <section className="mb-6 rounded-sm border-2 border-dashed border-lime-100/25 bg-black/20 p-5">
                                <div className="flex items-center gap-3">
                                    <BookOpen className="h-5 w-5 text-lime-200" />
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-lime-200/70">Góc bảng lớp</p>
                                        <h2 className="font-serif text-lg font-bold">{state.activeTabData.label}</h2>
                                        <p className="text-sm text-slate-300">{state.activeTabData.description}</p>
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
