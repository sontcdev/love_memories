"use client";

import { BookHeart, Heart, Sparkles } from "lucide-react";
import {
    PinKeypad,
    PinLockController,
    type TemplateLockScreenProps,
} from "@/components/auth/PinLockController";

export function LoveLockScreen({ slug, onSuccess, linkData }: TemplateLockScreenProps) {
    const profile = linkData?.profile_data as Record<string, string> | null;
    const boyName = profile?.boy_name || "Him";
    const girlName = profile?.girl_name || "Her";

    return (
        <main className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#efe3d0] px-3 py-6 sm:px-6">
            <div className="pointer-events-none absolute inset-0 opacity-45 [background-image:repeating-linear-gradient(0deg,transparent,transparent_27px,rgba(116,74,55,0.08)_28px)]" />
            <div className="pointer-events-none absolute -left-10 top-10 h-40 w-40 rounded-full bg-rose-300/30 blur-3xl" />
            <div className="pointer-events-none absolute -right-12 bottom-12 h-48 w-48 rounded-full bg-amber-200/50 blur-3xl" />

            <section className="relative w-full max-w-[440px] rounded-r-[2rem] rounded-l-lg border border-[#d3b99a] bg-[#fffaf0] p-4 pl-6 shadow-[0_24px_70px_rgba(77,45,35,0.25),inset_12px_0_20px_rgba(116,74,55,0.06)] sm:p-8 sm:pl-10">
                <div className="absolute inset-y-3 left-2 w-px bg-rose-300/70 sm:left-3" />
                <div className="absolute inset-y-0 left-[15px] flex flex-col justify-around py-8 sm:left-[21px]">
                    {[0, 1, 2, 3, 4, 5].map((ring) => (
                        <span key={ring} className="h-2.5 w-2.5 rounded-full border border-[#ad856b] bg-[#efe3d0] shadow-inner" />
                    ))}
                </div>
                <div className="absolute -right-2 top-12 h-16 w-5 rounded-r-md border border-l-0 border-rose-300 bg-rose-200 shadow-sm" />

                <header className="mb-5 text-center sm:mb-7">
                    <div className="relative mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600 shadow-[0_8px_24px_rgba(190,24,93,0.14)] sm:h-20 sm:w-20">
                        <BookHeart className="h-8 w-8 sm:h-10 sm:w-10" strokeWidth={1.6} />
                        <Sparkles className="absolute -right-2 top-0 h-5 w-5 text-amber-500" />
                    </div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#9a6a58]">Our private chapter</p>
                    <h1 className="font-serif text-2xl font-semibold leading-tight text-[#6f3040] sm:text-3xl">
                        {boyName} <span className="font-normal text-rose-400">&amp;</span> {girlName}
                    </h1>
                    <div className="mx-auto my-3 flex items-center justify-center gap-2 text-rose-400">
                        <span className="h-px w-12 bg-rose-200" />
                        <Heart className="h-3.5 w-3.5 fill-current" />
                        <span className="h-px w-12 bg-rose-200" />
                    </div>
                    <p className="text-sm italic text-[#886b60]">Nhập mã PIN để mở những trang ký ức của chúng mình</p>
                </header>

                <PinLockController slug={slug} onSuccess={onSuccess} errorMessage="Mã PIN chưa đúng, thử lại nhé">
                    {(controls) => (
                        <PinKeypad
                            controls={controls}
                            filledIcon={<Heart className="h-4 w-4 fill-current" />}
                            slotClass="border-[#dfcbb8] bg-[#fffdf8] text-rose-400 shadow-inner"
                            activeSlotClass="border-rose-400 bg-rose-50 text-rose-500 shadow-[0_5px_14px_rgba(244,63,94,0.18)]"
                            keyClass="rounded-xl border border-[#dfc8b3] bg-[#fffdf8] font-serif text-[#744a43] shadow-[0_3px_0_#d8bea6] hover:-translate-y-0.5 hover:border-rose-300 hover:text-rose-600 active:translate-y-0 active:shadow-none disabled:transform-none"
                            specialKeyClass="rounded-xl border border-[#dfc8b3] bg-[#f7eee2] text-[#8a6559] shadow-[0_3px_0_#d8bea6] hover:bg-rose-50 active:translate-y-0.5 active:shadow-none"
                            submitClass="bg-gradient-to-r from-[#a93654] via-rose-500 to-[#a93654] text-white shadow-[0_10px_24px_rgba(190,24,93,0.28)] hover:brightness-105"
                            submitLabel="Mở trang ký ức"
                            errorClass="border-rose-200 bg-rose-50 text-rose-700"
                        />
                    )}
                </PinLockController>
            </section>
        </main>
    );
}
