"use client";

import { BookOpen, School, Star } from "lucide-react";
import {
    PinKeypad,
    PinLockController,
    type TemplateLockScreenProps,
} from "@/components/auth/PinLockController";

export function GradClassLockScreen({ slug, onSuccess, linkData }: TemplateLockScreenProps) {
    const profile = linkData?.profile_data as Record<string, unknown> | null;
    const className = typeof profile?.class_name === "string" ? profile.class_name : "Tập thể lớp";

    return (
        <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#101713] px-3 py-5 text-stone-100 sm:p-6">
            <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.45)_0.6px,transparent_0.8px)] [background-size:7px_7px]" />
            <div className="absolute left-4 top-5 -rotate-6 font-serif text-5xl text-white/5 sm:left-12 sm:text-8xl">A+</div>
            <div className="absolute bottom-7 right-3 rotate-6 font-serif text-5xl text-white/5 sm:right-12 sm:text-8xl">2026</div>

            <section className="relative z-10 w-full max-w-sm rounded-lg border-[6px] border-[#60452f] bg-[#193328] p-1 shadow-[0_28px_80px_rgba(0,0,0,0.65),inset_0_0_40px_rgba(0,0,0,0.35)] sm:border-[9px]">
                <div className="relative overflow-hidden border border-[#8b6848]/40 px-3 py-5 sm:px-5 sm:py-6">
                    <div className="absolute inset-x-4 top-3 border-t border-dashed border-white/20" />
                    <header className="mb-5 text-center" style={{ fontFamily: "var(--font-caveat), cursive" }}>
                        <School className="mx-auto mb-2 h-10 w-10 text-yellow-100 sm:h-12 sm:w-12" strokeWidth={1.5} />
                        <p className="text-xs uppercase tracking-[0.22em] text-emerald-100/60">Niên khóa của chúng mình</p>
                        <h1 className="mt-1 break-words text-3xl font-bold text-white [text-shadow:1px_1px_0_rgba(255,255,255,0.12)] sm:text-4xl">
                            {className}
                        </h1>
                        <div className="mx-auto mt-2 h-px w-36 bg-white/35" />
                    </header>

                    <div className="mb-4 flex items-center justify-center gap-2 text-center text-xs text-emerald-50/75">
                        <BookOpen className="h-4 w-4 shrink-0 text-yellow-100" />
                        Nhập mã PIN 6 số để mở cuốn kỷ yếu
                    </div>

                    <PinLockController slug={slug} onSuccess={onSuccess} errorMessage="Mã PIN kỷ yếu không đúng">
                        {(controls) => (
                            <PinKeypad
                                controls={controls}
                                filledIcon={<Star className="h-4 w-4 fill-yellow-100 text-yellow-100 sm:h-5 sm:w-5" />}
                                emptyIcon={<span className="h-2 w-2 rounded-full bg-white/20" />}
                                slotClass="rounded-md border-dashed border-white/25 bg-black/15"
                                activeSlotClass="rounded-md border-dashed border-yellow-100/80 bg-black/20 shadow-[0_0_10px_rgba(254,249,195,0.12)]"
                                keyClass="rounded-md border border-dashed border-white/25 bg-black/20 text-xl text-stone-100 shadow-sm hover:bg-black/30 hover:text-yellow-100 active:scale-95"
                                specialKeyClass="rounded-md border border-dashed border-white/15 bg-black/10 text-stone-300 hover:bg-black/25 active:scale-95"
                                submitClass="rounded-md border border-yellow-100/40 bg-yellow-100 text-[#193328] shadow-lg hover:bg-white"
                                submitLabel="Mở kỷ yếu"
                                errorClass="border-red-200/30 bg-red-950/60 text-red-100"
                            />
                        )}
                    </PinLockController>

                    <div className="mt-5 flex items-end justify-between border-t border-white/10 pt-3 text-[9px] uppercase tracking-[0.16em] text-white/35">
                        <span>Yearbook archive</span>
                        <span className="h-2 w-12 rounded-sm bg-yellow-100/70 shadow-[5px_2px_0_rgba(255,255,255,0.18)]" />
                    </div>
                </div>
            </section>
        </main>
    );
}
