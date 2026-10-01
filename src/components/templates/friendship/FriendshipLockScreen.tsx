"use client";

import { MessageCircle, Smile, Users } from "lucide-react";
import {
    PinKeypad,
    PinLockController,
    type TemplateLockScreenProps,
} from "@/components/auth/PinLockController";

export function FriendshipLockScreen({ slug, onSuccess, linkData }: TemplateLockScreenProps) {
    const profile = linkData?.profile_data as Record<string, unknown> | null;
    const groupName = typeof profile?.group_name === "string" ? profile.group_name : "Nhóm bạn";

    return (
        <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#f6f1ff] px-3 py-6 text-slate-800 sm:px-6 sm:py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(139,92,246,0.18),transparent_30%),radial-gradient(circle_at_85%_85%,rgba(236,72,153,0.18),transparent_32%)]" />
            <div className="absolute left-3 top-8 max-w-[12rem] rounded-2xl rounded-bl-sm bg-white/70 px-4 py-3 text-xs text-violet-500 shadow-sm sm:left-[8%] sm:top-[16%]">
                Ai có mật mã không?
            </div>
            <div className="absolute bottom-10 right-3 rounded-2xl rounded-br-sm bg-gradient-to-r from-violet-500/15 to-pink-500/15 px-4 py-3 text-xs text-pink-600 sm:bottom-[14%] sm:right-[8%]">
                Có mặt đầy đủ nhé!
            </div>

            <section className="relative w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/90 shadow-[0_24px_70px_rgba(91,33,128,0.2)] backdrop-blur-md">
                <header className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 px-5 py-5 text-white sm:px-7 sm:py-6">
                    <div className="flex items-center gap-3">
                        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/40 sm:h-14 sm:w-14">
                            <Users className="h-6 w-6 sm:h-7 sm:w-7" />
                            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-purple-600 bg-emerald-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xl font-extrabold sm:text-2xl">{groupName}</p>
                            <p className="mt-0.5 text-xs text-white/80">Nhóm riêng tư · Kỷ niệm chung</p>
                        </div>
                        <MessageCircle className="h-6 w-6 shrink-0 text-white/80" />
                    </div>
                </header>

                <div className="px-4 pb-5 pt-5 sm:px-8 sm:pb-8 sm:pt-6">
                    <div className="mb-5 space-y-2.5">
                        <div className="mr-10 w-fit rounded-2xl rounded-bl-sm bg-slate-100 px-3.5 py-2.5 text-sm text-slate-600">
                            Nhập mật mã để vào nhóm nha
                        </div>
                        <div className="ml-auto flex w-fit items-center gap-2 rounded-2xl rounded-br-sm bg-gradient-to-r from-violet-500 to-pink-500 px-3.5 py-2.5 text-sm font-medium text-white shadow-sm">
                            PIN gồm 6 số <Smile className="h-4 w-4" />
                        </div>
                    </div>

                    <PinLockController slug={slug} onSuccess={onSuccess} errorMessage="Mật mã nhóm chưa đúng, thử lại nhé">
                        {(controls) => (
                            <PinKeypad
                                controls={controls}
                                filledIcon={<MessageCircle className="h-4 w-4 fill-current" />}
                                slotClass="border-violet-200 bg-violet-50 text-violet-400"
                                activeSlotClass="border-pink-400 bg-pink-50 text-pink-500 shadow-sm"
                                keyClass="rounded-2xl border border-violet-100 bg-white text-violet-800 shadow-sm hover:border-pink-300 hover:bg-pink-50 active:scale-95"
                                specialKeyClass="rounded-2xl border border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95"
                                submitClass="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 text-white shadow-[0_10px_24px_rgba(147,51,234,0.25)] hover:brightness-105"
                                submitLabel="Vào nhóm chat"
                                errorClass="border-pink-200 bg-pink-50 text-pink-600"
                            />
                        )}
                    </PinLockController>
                </div>
            </section>
        </main>
    );
}
