"use client";

import { Baby, Heart } from "lucide-react";
import {
    PinKeypad,
    PinLockController,
    type TemplateLockScreenProps,
} from "@/components/auth/PinLockController";

export function BabyLockScreen({ slug, onSuccess, linkData }: TemplateLockScreenProps) {
    const profile = linkData?.profile_data as Record<string, unknown> | null;
    const babyName = typeof profile?.baby_name === "string" ? profile.baby_name : "Em bé";

    return (
        <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-gradient-to-br from-[#fff6ea] via-[#fef8f5] to-[#ffeee0] px-3 py-6 text-slate-800 sm:px-6 sm:py-10">
            <div className="absolute -left-16 top-10 h-48 w-48 rounded-full border-[24px] border-amber-200/40" />
            <div className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full border-[28px] border-orange-200/40" />

            <section className="relative w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/90 shadow-[0_24px_70px_rgba(180,120,50,0.18)] backdrop-blur-md">
                <header className="relative overflow-hidden bg-gradient-to-r from-amber-400 to-orange-400 px-5 py-6 text-white sm:px-8 sm:py-8">
                    <Heart className="absolute right-5 top-4 h-6 w-6 rotate-12 text-white/80" />
                    <div className="relative flex items-start gap-3">
                        <div className="rounded-xl bg-white/20 p-2.5 ring-1 ring-white/30">
                            <Baby className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-50">Nhật ký em bé</p>
                            <h1 className="mt-1 truncate text-2xl font-extrabold tracking-tight sm:text-3xl">{babyName}</h1>
                        </div>
                    </div>
                </header>

                <div className="px-4 pb-5 pt-6 sm:px-8 sm:pb-8 sm:pt-7">
                    <div className="mb-5 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-xs sm:px-4">
                        <span className="font-semibold uppercase tracking-wider text-slate-500">MEMORIES</span>
                        <span className="font-semibold uppercase tracking-wider text-slate-500">PIN 6 số</span>
                    </div>

                    <PinLockController slug={slug} onSuccess={onSuccess} errorMessage="Mã PIN không đúng">
                        {(controls) => (
                            <PinKeypad
                                controls={controls}
                                filledIcon={<Heart className="h-4 w-4 fill-current" />}
                                slotClass="border-amber-200 bg-amber-50 text-amber-600"
                                activeSlotClass="border-orange-500 bg-orange-50 text-orange-600 shadow-sm"
                                keyClass="rounded-xl border border-amber-100 bg-gradient-to-br from-white to-amber-50 text-amber-900 shadow-sm hover:border-amber-300 hover:bg-amber-100 active:scale-95"
                                specialKeyClass="rounded-xl border border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95"
                                submitClass="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_10px_24px_rgba(217,119,6,0.22)] hover:brightness-105"
                                submitLabel="Xem nhật ký"
                                errorClass="border-rose-200 bg-rose-50 text-rose-600"
                            />
                        )}
                    </PinLockController>
                </div>
            </section>
        </main>
    );
}
