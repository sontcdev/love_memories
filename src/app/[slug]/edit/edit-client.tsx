"use client";

import { useState } from "react";
import Link from "next/link";
import { Link as PrismaLink, LinkConfig, Gallery, Timeline, Letter } from "@prisma/client";
import { EditProfileForm } from "@/components/edit/EditProfileForm";
import { EditConfigForm } from "@/components/edit/EditConfigForm";
import { GalleryManager } from "@/components/edit/GalleryManager";
import { TimelineManager } from "@/components/edit/TimelineManager";
import {
    User,
    Image as ImageIcon,
    Calendar,
    Settings,
    ArrowLeft,
    ChevronRight
} from "lucide-react";

type LinkWithRelations = PrismaLink & {
    config: LinkConfig | null;
    galleries: Gallery[];
    timelines: Timeline[];
    letters: Letter[];
};

interface EditPageClientProps {
    slug: string;
    linkData: LinkWithRelations;
}

type TabId = "profile" | "gallery" | "timeline" | "settings";

const TABS: { id: TabId; label: string; icon: typeof User; description: string }[] = [
    { id: "profile", label: "Thông tin chung", icon: User, description: "Cập nhật thông tin hồ sơ" },
    { id: "gallery", label: "Thư viện ảnh", icon: ImageIcon, description: "Quản lý ảnh của bạn" },
    { id: "timeline", label: "Dòng thời gian", icon: Calendar, description: "Chỉnh sửa câu chuyện" },
    { id: "settings", label: "Cài đặt", icon: Settings, description: "Tùy chỉnh màu sắc và nhạc" },
];

export function EditPageClient({ slug, linkData }: EditPageClientProps) {
    const [activeTab, setActiveTab] = useState<TabId>("profile");

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/${slug}`}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Chỉnh sửa trang</h1>
                            <p className="text-sm text-gray-500">/{slug}</p>
                        </div>
                    </div>
                    <Link
                        href={`/${slug}`}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        Xem trang
                    </Link>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <aside className="md:w-64 shrink-0">
                        <nav className="bg-white rounded-2xl shadow-sm p-2 sticky top-24">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeTab === tab.id
                                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                                        : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    <tab.icon className="w-5 h-5" />
                                    <div className="flex-1">
                                        <div className="font-medium">{tab.label}</div>
                                        {activeTab === tab.id && (
                                            <div className="text-xs opacity-80 mt-0.5">{tab.description}</div>
                                        )}
                                    </div>
                                    {activeTab === tab.id && (
                                        <ChevronRight className="w-4 h-4" />
                                    )}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                            {activeTab === "profile" && (
                                <EditProfileForm
                                    slug={slug}
                                    linkType={linkData.type}
                                    initialData={linkData.profile_data as Record<string, unknown>}
                                />
                            )}

                            {activeTab === "gallery" && (
                                <GalleryManager
                                    slug={slug}
                                    initialGallery={linkData.galleries}
                                />
                            )}

                            {activeTab === "timeline" && (
                                <TimelineManager
                                    slug={slug}
                                    initialTimeline={linkData.timelines}
                                />
                            )}

                            {activeTab === "settings" && (
                                <EditConfigForm
                                    slug={slug}
                                    initialConfig={linkData.config ? {
                                        background_color: linkData.config.background_color ?? undefined,
                                        font_family: linkData.config.font_family ?? undefined,
                                        music_url: linkData.config.music_url ?? undefined,
                                        auto_play: linkData.config.auto_play,
                                    } : null}
                                />
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

