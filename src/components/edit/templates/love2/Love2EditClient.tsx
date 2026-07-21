"use client";

import { Image as ImageIcon, Scissors } from "lucide-react";
import {
    EditBackLink,
    EditFormContent,
    LoadingGate,
    PageQrCard,
    TemplateTabButton,
    ViewPageLink,
    tabsOf,
    useTemplateEditState,
    type TemplateEditProps,
} from "@/components/edit/templates/shared";

const tabs = tabsOf(["gallery", "features", "profile", "timeline", "settings"]);

export function Love2EditClient({ slug, linkData }: TemplateEditProps) {
    const state = useTemplateEditState({ slug, linkData, tabs });

    return (
        <LoadingGate isInitializing={state.isInitializing} linkType={linkData.type}>
            <div className="min-h-screen bg-[#f3e2bd] bg-[radial-gradient(#d7b46a_1px,transparent_1px)] [background-size:22px_22px] py-6 text-amber-950">
                <div className="mx-auto max-w-6xl rounded-2xl border-4 border-amber-300 bg-[#fff8dc] p-3 shadow-[12px_16px_0_rgba(146,64,14,0.16)]">
                    <header className="rotate-[-0.4deg] rounded-xl border-2 border-dashed border-amber-300 bg-white/80 px-4 py-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <EditBackLink slug={slug} className="rounded-xl border border-amber-200 bg-white p-2 text-amber-700 transition hover:bg-amber-50" />
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-600">Craft desk</p>
                                    <h1 className="text-xl font-black text-amber-900">Bàn scrapbook</h1>
                                </div>
                            </div>
                            <ViewPageLink slug={slug} className="rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-white shadow hover:bg-amber-600" />
                        </div>
                    </header>

                    <div className="mt-4 grid gap-4 md:grid-cols-[17rem_1fr]">
                        <aside className="rounded-xl border-2 border-amber-200 bg-[#ffe9a8] p-4 shadow-[6px_8px_0_rgba(180,83,9,0.10)]">
                            <div className="mb-5 rotate-[1deg] rounded-lg bg-white p-4 shadow-md">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded bg-amber-100 text-amber-700">
                                    <ImageIcon className="h-6 w-6" />
                                </div>
                                <h2 className="font-bold text-amber-950">Xếp polaroid trước</h2>
                                <p className="mt-2 text-sm text-amber-800">Template này sống bằng ảnh, caption, giấy note và thứ tự kỷ niệm.</p>
                            </div>

                            <nav className="grid grid-cols-2 gap-2 md:flex md:flex-col">
                                {tabs.map((tab, index) => (
                                    <TemplateTabButton
                                        key={tab.id}
                                        tab={tab}
                                        active={state.activeTab === tab.id}
                                        onClick={() => state.setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 rounded-xl border-2 px-3 py-3 text-left transition ${index % 2 ? "rotate-[0.5deg]" : "rotate-[-0.5deg]"} ${
                                            state.activeTab === tab.id
                                                ? "border-amber-500 bg-white text-amber-950 shadow-[4px_5px_0_rgba(217,119,6,0.20)]"
                                                : "border-amber-200 bg-amber-50 text-amber-800 hover:bg-white"
                                        }`}
                                    />
                                ))}
                            </nav>

                            <PageQrCard
                                copied={state.copied}
                                fullUrl={state.fullUrl}
                                isDark={false}
                                onCopy={state.handleCopyLink}
                                accentClass="text-amber-600"
                                className="mt-6 hidden flex-col gap-4 rounded-xl border-2 border-dashed border-amber-300 bg-[#fff7d6] p-4 md:flex"
                            />
                        </aside>

                        <main className="rounded-xl border-2 border-amber-100 bg-white p-4 shadow-inner sm:p-6 md:p-8">
                            <section className="mb-6 rotate-[-0.4deg] rounded-xl border-2 border-dashed border-amber-300 bg-[#fff7d6] p-5 text-amber-950">
                                <div className="flex items-center gap-3">
                                    <Scissors className="h-5 w-5 text-amber-600" />
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-600">Sticky note</p>
                                        <h2 className="text-lg font-black">{state.activeTabData.label}</h2>
                                        <p className="text-sm text-amber-700">{state.activeTabData.description}</p>
                                    </div>
                                </div>
                            </section>

                            <EditFormContent activeTab={state.activeTab} slug={slug} linkData={linkData} isDark={false} />
                        </main>
                    </div>
                </div>

                <PageQrCard
                    copied={state.copied}
                    fullUrl={state.fullUrl}
                    isDark={false}
                    onCopy={state.handleCopyLink}
                    accentClass="text-amber-600"
                    className="mx-auto mt-6 flex max-w-6xl flex-col gap-4 rounded-xl border-2 border-dashed border-amber-300 bg-[#fff7d6] p-4 text-amber-900 md:hidden"
                />
            </div>
        </LoadingGate>
    );
}
