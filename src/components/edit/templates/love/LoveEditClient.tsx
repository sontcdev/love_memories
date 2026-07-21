"use client";

import { Heart, PenLine } from "lucide-react";
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

const tabs = tabsOf(["profile", "timeline", "gallery", "settings"]);

export function LoveEditClient({ slug, linkData }: TemplateEditProps) {
    const state = useTemplateEditState({ slug, linkData, tabs });

    return (
        <LoadingGate isInitializing={state.isInitializing} linkType={linkData.type}>
            <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 py-6 text-rose-950">
                <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border-2 border-rose-200 bg-white/95 shadow-[0_24px_60px_rgba(244,114,182,0.22)] backdrop-blur">
                    <header className="sticky top-0 z-20 border-b-2 border-rose-100 bg-white/90 backdrop-blur">
                        <div className="flex items-center justify-between px-4 py-4 sm:px-6">
                            <div className="flex items-center gap-3">
                                <EditBackLink slug={slug} className="rounded-full p-2 text-rose-600 transition hover:bg-rose-50" />
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-rose-400">Love editor</p>
                                    <h1 className="text-xl font-bold text-rose-800">Cuốn sổ tình yêu</h1>
                                </div>
                            </div>
                            <ViewPageLink slug={slug} className="text-sm font-semibold text-rose-600 hover:text-rose-800" />
                        </div>
                    </header>

                    <div className="grid md:grid-cols-[18rem_1fr]">
                        <aside className="border-rose-100 bg-gradient-to-b from-rose-50 to-pink-50 p-4 md:border-r-2 md:p-6">
                            <div className="mb-6 rounded-[1.5rem] border border-rose-100 bg-white/75 p-4 shadow-sm">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-500">
                                    <Heart className="h-6 w-6 fill-current" />
                                </div>
                                <h2 className="font-serif text-2xl font-bold text-rose-800">Nhật ký hai người</h2>
                                <p className="mt-2 text-sm leading-relaxed text-rose-600">Ưu tiên câu chuyện, ngày kỷ niệm và những lời nhắn riêng tư.</p>
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
                                                ? "bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-lg shadow-rose-200"
                                                : "text-rose-700 hover:bg-white/80"
                                        }`}
                                    />
                                ))}
                            </nav>

                            <PageQrCard
                                copied={state.copied}
                                fullUrl={state.fullUrl}
                                isDark={false}
                                onCopy={state.handleCopyLink}
                                accentClass="text-rose-500"
                                className="mt-6 hidden flex-col gap-4 rounded-2xl border border-rose-100 bg-rose-50/60 p-4 md:flex"
                            />
                        </aside>

                        <main className="bg-white/80 p-4 sm:p-6 md:p-8">
                            <section className="mb-6 rounded-[2rem] border border-rose-100 bg-gradient-to-r from-white to-rose-50/80 p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <PenLine className="h-5 w-5 text-rose-500" />
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-rose-400">Đang chỉnh</p>
                                        <h2 className="text-lg font-bold text-rose-900">{state.activeTabData.label}</h2>
                                        <p className="text-sm text-rose-600">{state.activeTabData.description}</p>
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
                    accentClass="text-rose-500"
                    className="mx-auto mt-6 flex max-w-6xl flex-col gap-4 rounded-3xl border border-rose-100 bg-white/90 p-4 text-rose-800 shadow-md md:hidden"
                />
            </div>
        </LoadingGate>
    );
}
