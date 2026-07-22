"use client";

import { Compass, Map } from "lucide-react";
import {
    EditBackLink,
    EditFormContent,
    LoadingGate,
    TemplateTabButton,
    ViewPageLink,
    tabsOf,
    useTemplateEditState,
    type TemplateEditProps,
} from "@/components/edit/templates/shared";

const tabs = tabsOf(["timeline", "profile", "gallery", "letters", "features", "settings"]);

export function TravelEditClient({ slug, linkData }: TemplateEditProps) {
    const state = useTemplateEditState({ slug, linkData, tabs });

    return (
        <LoadingGate isInitializing={state.isInitializing} linkType={linkData.type}>
            <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 py-6 text-sky-950">
                <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-sky-100 bg-white/90 shadow-[0_24px_60px_rgba(14,165,233,0.14)]">
                    <header className="border-b border-sky-100 bg-white/85 px-4 py-4 backdrop-blur sm:px-6">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <EditBackLink slug={slug} className="rounded-full p-2 text-sky-600 transition hover:bg-sky-50" />
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-sky-500">Travel log</p>
                                    <h1 className="text-xl font-black">Bản đồ hành trình</h1>
                                </div>
                            </div>
                            <ViewPageLink slug={slug} className="rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 px-4 py-2 text-sm font-bold text-white" />
                        </div>
                    </header>

                    <div className="grid md:grid-cols-[18rem_1fr]">
                        <aside className="border-sky-100 bg-sky-50/50 p-4 md:border-r md:p-6">
                            <div className="mb-6 rounded-2xl border border-sky-100 bg-white p-4">
                                <Compass className="mb-3 h-10 w-10 text-sky-500" />
                                <h2 className="font-black">Điểm đến trước, hồ sơ sau</h2>
                                <p className="mt-2 text-sm text-sky-700">Template du lịch cần timeline/chặng đi và ảnh hành trình nổi bật nhất.</p>
                            </div>

                            <nav className="grid grid-cols-2 gap-2 md:flex md:flex-col md:gap-3">
                                {tabs.map((tab) => (
                                    <TemplateTabButton
                                        key={tab.id}
                                        tab={tab}
                                        active={state.activeTab === tab.id}
                                        onClick={() => state.setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 rounded-2xl px-3 py-3 text-left transition ${
                                            state.activeTab === tab.id ? "bg-gradient-to-r from-sky-500 to-emerald-500 text-white shadow-md" : "text-sky-700 hover:bg-white"
                                        }`}
                                    />
                                ))}
                            </nav>

                        </aside>

                        <main className="bg-[linear-gradient(to_right,rgba(14,165,233,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(14,165,233,0.04)_1px,transparent_1px)] bg-[size:48px_48px] p-4 sm:p-6 md:p-8">
                            <section className="mb-6 rounded-2xl border border-sky-100 bg-gradient-to-r from-white/90 to-emerald-50/80 p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <Map className="h-5 w-5 text-emerald-500" />
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-sky-500">Đang đánh dấu</p>
                                        <h2 className="text-lg font-black">{state.activeTabData.label}</h2>
                                        <p className="text-sm text-sky-700">{state.activeTabData.description}</p>
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
