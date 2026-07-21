"use client";

import { MessageCircle, Users } from "lucide-react";
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

const tabs = tabsOf(["profile", "features", "gallery", "timeline", "settings"]);

export function FriendshipEditClient({ slug, linkData }: TemplateEditProps) {
    const state = useTemplateEditState({ slug, linkData, tabs });

    return (
        <LoadingGate isInitializing={state.isInitializing} linkType={linkData.type}>
            <div className="min-h-screen bg-gradient-to-tr from-violet-50 via-pink-50 to-sky-50 py-6 text-violet-950">
                <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-violet-100 bg-white/90 shadow-[0_24px_60px_rgba(147,51,234,0.14)]">
                    <header className="border-b border-violet-100 bg-white/85 px-4 py-4 backdrop-blur sm:px-6">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <EditBackLink slug={slug} className="rounded-full p-2 text-violet-600 transition hover:bg-violet-50" />
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-pink-500">Friend hub</p>
                                    <h1 className="text-xl font-black">Phòng chat bạn thân</h1>
                                </div>
                            </div>
                            <ViewPageLink slug={slug} className="rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 px-4 py-2 text-sm font-bold text-white" />
                        </div>
                    </header>

                    <div className="grid md:grid-cols-[18rem_1fr]">
                        <aside className="border-violet-100 bg-violet-50/50 p-4 md:border-r md:p-6">
                            <div className="mb-6 rounded-3xl rounded-br-sm border border-violet-100 bg-white p-4 shadow-sm">
                                <Users className="mb-3 h-10 w-10 text-pink-500" />
                                <h2 className="font-black">Nhóm là nhân vật chính</h2>
                                <p className="mt-2 text-sm text-violet-700">Ưu tiên identity nhóm, ảnh vui và các khoảnh khắc có tính hội thoại.</p>
                            </div>

                            <nav className="grid grid-cols-2 gap-2 md:flex md:flex-col">
                                {tabs.map((tab) => (
                                    <TemplateTabButton
                                        key={tab.id}
                                        tab={tab}
                                        active={state.activeTab === tab.id}
                                        onClick={() => state.setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 rounded-2xl rounded-br-sm px-3 py-3 text-left transition ${
                                            state.activeTab === tab.id ? "bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow-md" : "text-violet-700 hover:bg-white"
                                        }`}
                                    />
                                ))}
                            </nav>

                            <PageQrCard copied={state.copied} fullUrl={state.fullUrl} isDark={false} onCopy={state.handleCopyLink} accentClass="text-pink-500" className="mt-6 hidden flex-col gap-4 rounded-3xl rounded-br-sm border border-violet-100 bg-white/80 p-4 md:flex" />
                        </aside>

                        <main className="p-4 sm:p-6 md:p-8">
                            <section className="mb-6 rounded-3xl rounded-br-sm border border-violet-100 bg-white/85 p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <MessageCircle className="h-5 w-5 text-pink-500" />
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-pink-500">Đang gửi tin</p>
                                        <h2 className="text-lg font-black">{state.activeTabData.label}</h2>
                                        <p className="text-sm text-violet-700">{state.activeTabData.description}</p>
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
