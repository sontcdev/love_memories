"use client";

import { Gem, Heart } from "lucide-react";
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

const tabs = tabsOf(["profile", "features", "timeline", "gallery", "settings"]);

export function WeddingEditClient({ slug, linkData }: TemplateEditProps) {
    const state = useTemplateEditState({ slug, linkData, tabs });

    return (
        <LoadingGate isInitializing={state.isInitializing} linkType={linkData.type}>
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50 py-6 text-amber-950">
                <div className="mx-auto max-w-6xl overflow-hidden rounded-sm border border-amber-200 bg-white/95 shadow-[0_24px_70px_rgba(180,83,9,0.12)]">
                    <header className="border-b border-amber-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-6">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <EditBackLink slug={slug} className="rounded-full p-2 text-amber-700 transition hover:bg-amber-50" />
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-amber-500">Invitation suite</p>
                                    <h1 className="font-serif text-xl font-bold">Thiệp cưới</h1>
                                </div>
                            </div>
                            <ViewPageLink slug={slug} className="rounded-full border border-amber-300 px-4 py-2 text-sm font-bold text-amber-700 hover:bg-amber-50" />
                        </div>
                    </header>

                    <div className="grid md:grid-cols-[18rem_1fr]">
                        <aside className="border-amber-100 bg-gradient-to-b from-amber-50 to-rose-50 p-4 md:border-r md:p-6">
                            <div className="mb-6 border border-amber-200 bg-white/80 p-5 text-center">
                                <Gem className="mx-auto mb-3 h-10 w-10 text-amber-500" />
                                <h2 className="font-serif text-xl font-bold">Nghi thức & lời mời</h2>
                                <p className="mt-2 text-sm text-amber-700">Ưu tiên cô dâu chú rể, lịch sự kiện, lời mời và album ngày cưới.</p>
                            </div>

                            <nav className="grid grid-cols-2 gap-2 md:flex md:flex-col">
                                {tabs.map((tab) => (
                                    <TemplateTabButton
                                        key={tab.id}
                                        tab={tab}
                                        active={state.activeTab === tab.id}
                                        onClick={() => state.setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 rounded-sm border px-3 py-3 text-left transition ${
                                            state.activeTab === tab.id ? "border-amber-400 bg-amber-100 text-amber-950" : "border-amber-100 text-amber-700 hover:bg-white"
                                        }`}
                                    />
                                ))}
                            </nav>

                        </aside>

                        <main className="p-4 sm:p-6 md:p-8">
                            <section className="mb-6 border border-amber-200 bg-white/85 p-5 shadow-[0_12px_28px_rgba(180,83,9,0.08)]">
                                <div className="flex items-center gap-3">
                                    <Heart className="h-5 w-5 text-amber-600" />
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-500">Đang soạn thiệp</p>
                                        <h2 className="font-serif text-lg font-bold">{state.activeTabData.label}</h2>
                                        <p className="text-sm text-amber-700">{state.activeTabData.description}</p>
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
