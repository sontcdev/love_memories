"use client";

import { LayoutGrid, Sparkles } from "lucide-react";
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

const tabs = tabsOf(["profile", "gallery", "timeline", "settings"]);

export function EveryEditClient({ slug, linkData }: TemplateEditProps) {
    const state = useTemplateEditState({ slug, linkData, tabs });

    return (
        <LoadingGate isInitializing={state.isInitializing} linkType={linkData.type}>
            <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-indigo-50 py-6 text-teal-950">
                <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border-2 border-teal-100 bg-white/95 shadow-[0_20px_50px_rgba(20,184,166,0.12)]">
                    <header className="border-b-2 border-teal-100 bg-white/90 px-4 py-4 backdrop-blur sm:px-6">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <EditBackLink slug={slug} className="rounded-full p-2 text-teal-700 transition hover:bg-teal-50" />
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-teal-500">Memory room</p>
                                    <h1 className="text-xl font-black">Không gian kỷ niệm</h1>
                                </div>
                            </div>
                            <ViewPageLink slug={slug} className="rounded-full bg-gradient-to-r from-teal-500 to-indigo-500 px-4 py-2 text-sm font-bold text-white" />
                        </div>
                    </header>

                    <div className="grid md:grid-cols-[18rem_1fr]">
                        <aside className="border-teal-100 bg-gradient-to-b from-teal-50 to-indigo-50 p-4 md:border-r-2 md:p-6">
                            <div className="mb-6 rounded-2xl border border-teal-100 bg-white/80 p-4">
                                <Sparkles className="mb-3 h-10 w-10 text-teal-500" />
                                <h2 className="font-black">Linh hoạt nhưng có cấu trúc</h2>
                                <p className="mt-2 text-sm text-teal-700">Template tổng quát cần nhãn trung tính và flow dễ hiểu cho nhiều loại câu chuyện.</p>
                            </div>

                            <nav className="grid grid-cols-2 gap-2 md:flex md:flex-col">
                                {tabs.map((tab) => (
                                    <TemplateTabButton
                                        key={tab.id}
                                        tab={tab}
                                        active={state.activeTab === tab.id}
                                        onClick={() => state.setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 rounded-xl px-3 py-3 text-left transition ${
                                            state.activeTab === tab.id ? "bg-gradient-to-r from-teal-500 to-indigo-500 text-white shadow-md" : "text-teal-700 hover:bg-white"
                                        }`}
                                    />
                                ))}
                            </nav>

                            <PageQrCard copied={state.copied} fullUrl={state.fullUrl} isDark={false} onCopy={state.handleCopyLink} accentClass="text-teal-500" className="mt-6 hidden flex-col gap-4 rounded-2xl border border-teal-100 bg-teal-50/50 p-4 md:flex" />
                        </aside>

                        <main className="p-4 sm:p-6 md:p-8">
                            <section className="mb-6 rounded-2xl border border-teal-100 bg-gradient-to-r from-white to-teal-50/80 p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <LayoutGrid className="h-5 w-5 text-teal-500" />
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-teal-500">Đang sắp xếp</p>
                                        <h2 className="text-lg font-black">{state.activeTabData.label}</h2>
                                        <p className="text-sm text-teal-700">{state.activeTabData.description}</p>
                                    </div>
                                </div>
                            </section>
                            <EditFormContent activeTab={state.activeTab} slug={slug} linkData={linkData} isDark={false} />
                        </main>
                    </div>
                </div>
            </div>
        </LoadingGate>
    );
}
