"use client";

import Image from "next/image";
import { GraduationCap, Monitor, ShieldCheck } from "lucide-react";
import {
    PinKeypad,
    PinLockController,
    type TemplateLockScreenProps,
} from "@/components/auth/PinLockController";

export function GradPersonalLockScreen({ slug, onSuccess, linkData }: TemplateLockScreenProps) {
    const profile = linkData?.profile_data as Record<string, unknown> | null;
    const studentName = typeof profile?.student_name === "string" ? profile.student_name : "Học sinh";
    const studentAvatar = typeof profile?.student_avatar === "string" ? profile.student_avatar : null;

    return (
        <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#100b07] px-3 py-5 font-mono text-amber-50 sm:p-6">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(251,191,36,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(251,191,36,0.045)_1px,transparent_1px)] [background-size:32px_32px]" />
            <div className="absolute left-[8%] top-[12%] h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="absolute bottom-[8%] right-[5%] h-56 w-56 rounded-full bg-orange-700/10 blur-3xl" />

            <section className="relative z-10 w-full max-w-sm overflow-hidden rounded-xl border border-amber-900/60 bg-[#19130e]/95 shadow-[0_28px_90px_rgba(0,0,0,0.65)]">
                <header className="flex h-10 items-center justify-between border-b border-amber-900/50 bg-[#282019] px-3">
                    <div className="flex gap-1.5" aria-hidden="true">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                        <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                    </div>
                    <span className="text-[9px] uppercase tracking-[0.16em] text-amber-400/70">GradOS / pin-auth.exe</span>
                    <Monitor className="h-3.5 w-3.5 text-amber-500/60" />
                </header>

                <div className="p-4 sm:p-6">
                    <div className="mb-5 flex items-center gap-3 border-b border-amber-900/35 pb-4 sm:gap-4">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 border-amber-500/70 bg-gradient-to-br from-amber-500 to-orange-700 shadow-[0_0_22px_rgba(245,158,11,0.18)] sm:h-20 sm:w-20">
                            {studentAvatar ? (
                                <Image src={studentAvatar} alt={`Ảnh của ${studentName}`} fill sizes="80px" className="object-cover" />
                            ) : (
                                <GraduationCap className="absolute inset-0 m-auto h-8 w-8 text-amber-50 sm:h-10 sm:w-10" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <div className="mb-1 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.18em] text-emerald-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online
                            </div>
                            <h1 className="truncate text-lg font-bold text-amber-100 sm:text-xl">{studentName}</h1>
                            <p className="mt-1 text-[10px] uppercase tracking-wider text-amber-500/70">Personal class archive</p>
                        </div>
                    </div>

                    <div className="mb-4 flex items-center gap-2 text-xs text-amber-200/75">
                        <ShieldCheck className="h-4 w-4 shrink-0 text-amber-500" />
                        <p>Nhập mã PIN 6 số để đăng nhập GradOS.</p>
                    </div>

                    <PinLockController slug={slug} onSuccess={onSuccess} errorMessage="Mã PIN GradOS không đúng">
                        {(controls) => (
                            <PinKeypad
                                controls={controls}
                                filledIcon={<GraduationCap className="h-4 w-4 text-amber-400 sm:h-5 sm:w-5" />}
                                emptyIcon={<span className="h-2 w-2 rounded-sm bg-amber-950 ring-1 ring-amber-800" />}
                                slotClass="border-amber-900/60 bg-[#0f0a07]"
                                activeSlotClass="border-amber-400 bg-[#0f0a07] shadow-[0_0_12px_rgba(245,158,11,0.28)]"
                                keyClass="rounded-lg border border-amber-900/50 bg-[#272019] text-amber-100 shadow-md hover:border-amber-600 hover:bg-amber-950/60 active:scale-95"
                                specialKeyClass="rounded-lg border border-amber-950/70 bg-[#100b07] text-amber-500 hover:bg-[#272019] active:scale-95"
                                submitClass="rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-950/40 hover:from-amber-500 hover:to-orange-500"
                                submitLabel="Đăng nhập GradOS"
                                errorClass="border-red-900/60 bg-red-950/60 text-red-200"
                            />
                        )}
                    </PinLockController>
                </div>

                <footer className="border-t border-amber-900/40 bg-[#100b07]/70 px-4 py-2 text-center text-[8px] uppercase tracking-[0.18em] text-amber-700">
                    Secure session / Archive protected
                </footer>
            </section>
        </main>
    );
}
