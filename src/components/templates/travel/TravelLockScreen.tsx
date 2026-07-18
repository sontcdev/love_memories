"use client";

import { MapPin, Plane, Route } from "lucide-react";
import {
    PinKeypad,
    PinLockController,
    type TemplateLockScreenProps,
} from "@/components/auth/PinLockController";

export function TravelLockScreen({ slug, onSuccess, linkData }: TemplateLockScreenProps) {
    const profile = linkData?.profile_data as Record<string, unknown> | null;
    const tripName = typeof profile?.trip_name === "string" ? profile.trip_name : "Hành Trình";
    const destination = typeof profile?.destination === "string" ? profile.destination : null;

    return (
        <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-gradient-to-br from-[#dff4ff] via-[#f3fbf8] to-[#ccebdd] px-3 py-6 text-slate-800 sm:px-6 sm:py-10">
            <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(14,116,144,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(14,116,144,0.09)_1px,transparent_1px)] [background-size:28px_28px]" />
            <div className="absolute -left-20 top-12 h-52 w-52 rounded-full border-[24px] border-sky-300/20" />
            <div className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full border-[32px] border-emerald-300/20" />

            <section className="relative w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/90 shadow-[0_24px_70px_rgba(12,74,89,0.2)] backdrop-blur-md">
                <header className="relative overflow-hidden bg-gradient-to-r from-sky-600 to-emerald-600 px-5 py-6 text-white sm:px-8 sm:py-8">
                    <div className="absolute -right-6 -top-8 h-32 w-32 rounded-full border border-white/20" />
                    <div className="absolute right-8 top-7 w-24 border-t-2 border-dashed border-white/45 sm:w-36" />
                    <Plane className="absolute right-5 top-4 h-6 w-6 rotate-12 text-white/80" />
                    <div className="relative flex items-start gap-3">
                        <div className="rounded-xl bg-white/15 p-2.5 ring-1 ring-white/30">
                            <Route className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-sky-50">Boarding pass</p>
                            <h1 className="mt-1 truncate text-2xl font-extrabold tracking-tight sm:text-3xl">{tripName}</h1>
                            {destination && (
                                <p className="mt-2 flex items-center gap-1.5 text-sm text-white/90">
                                    <MapPin className="h-4 w-4 shrink-0" />
                                    <span className="truncate">Điểm đến: {destination}</span>
                                </p>
                            )}
                        </div>
                    </div>
                </header>

                <div className="relative border-b-2 border-dashed border-slate-200">
                    <div className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-[#d9f1f6]" />
                    <div className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-[#d7eee4]" />
                </div>

                <div className="px-4 pb-5 pt-6 sm:px-8 sm:pb-8 sm:pt-7">
                    <div className="mb-5 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-xs sm:px-4">
                        <span className="font-semibold uppercase tracking-wider text-slate-500">Cổng</span>
                        <span className="font-black text-sky-700">MEMORIES</span>
                        <span className="font-semibold uppercase tracking-wider text-slate-500">PIN 6 số</span>
                    </div>

                    <PinLockController slug={slug} onSuccess={onSuccess} errorMessage="Mã PIN không đúng, hành trình chưa thể bắt đầu">
                        {(controls) => (
                            <PinKeypad
                                controls={controls}
                                filledIcon={<MapPin className="h-4 w-4 fill-current" />}
                                slotClass="border-sky-200 bg-sky-50 text-sky-600"
                                activeSlotClass="border-emerald-500 bg-emerald-50 text-emerald-600 shadow-sm"
                                keyClass="rounded-xl border border-sky-100 bg-gradient-to-br from-white to-sky-50 text-sky-900 shadow-sm hover:border-sky-300 hover:bg-sky-100 active:scale-95"
                                specialKeyClass="rounded-xl border border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95"
                                submitClass="bg-gradient-to-r from-sky-600 to-emerald-600 text-white shadow-[0_10px_24px_rgba(5,150,105,0.22)] hover:brightness-105"
                                submitLabel="Bắt đầu hành trình"
                                errorClass="border-rose-200 bg-rose-50 text-rose-600"
                            />
                        )}
                    </PinLockController>
                </div>
            </section>
        </main>
    );
}
