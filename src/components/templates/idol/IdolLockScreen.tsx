"use client";

import Image from "next/image";
import { Mic2, Moon, Music2, Sparkles, Star, Sun, Zap } from "lucide-react";
import {
    PinKeypad,
    PinLockController,
    type TemplateLockScreenProps,
    useLockTheme,
} from "@/components/auth/PinLockController";

export function IdolLockScreen({ slug, onSuccess, linkData }: TemplateLockScreenProps) {
    const { isDark, toggleTheme } = useLockTheme(slug, true);
    const profile = linkData?.profile_data as Record<string, string> | null;
    const idolName = profile?.idol_name || "My Idol";
    const idolAvatar = profile?.idol_avatar;

    return (
        <main className={`relative flex min-h-[100svh] items-center justify-center overflow-hidden px-3 py-6 transition-colors sm:px-6 ${isDark ? "bg-[#070611]" : "bg-[#e9f5ff]"}`}>
            <div className={`pointer-events-none absolute inset-0 ${isDark ? "opacity-50" : "opacity-20"} [background-image:linear-gradient(rgba(34,211,238,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(217,70,239,0.22)_1px,transparent_1px)] [background-size:34px_34px] [mask-image:linear-gradient(to_bottom,transparent,black_30%,black)]`} />
            <div className="pointer-events-none absolute left-1/2 top-0 h-[45vh] w-56 -translate-x-1/2 bg-gradient-to-b from-cyan-300/25 to-transparent blur-2xl [clip-path:polygon(35%_0,65%_0,100%_100%,0_100%)]" />
            <div className="pointer-events-none absolute -left-28 top-1/3 h-64 w-64 rounded-full border-[35px] border-fuchsia-500/10 blur-sm" />
            <div className="pointer-events-none absolute -right-28 bottom-1/4 h-64 w-64 rounded-full border-[35px] border-cyan-400/10 blur-sm" />

            <section className={`relative w-full max-w-[440px] overflow-hidden rounded-[1.75rem] border p-4 pt-5 shadow-2xl backdrop-blur-xl sm:p-8 ${isDark ? "border-cyan-400/35 bg-[#100d24]/90 text-white shadow-fuchsia-950/50" : "border-white/90 bg-white/75 text-slate-900 shadow-cyan-900/20"}`}>
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
                <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-fuchsia-500/15 blur-3xl" />
                <button type="button" onClick={toggleTheme} className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur transition-all hover:scale-105 ${isDark ? "border-cyan-400/30 bg-white/5 text-cyan-200" : "border-cyan-200 bg-white/70 text-indigo-700"}`} aria-label={isDark ? "Bật giao diện sáng" : "Bật giao diện tối"}>
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>

                <header className="relative mb-5 text-center sm:mb-6">
                    <div className="relative mx-auto mb-3 h-24 w-24 sm:h-28 sm:w-28">
                        <div className="absolute inset-0 rotate-6 rounded-[2rem] bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-500 opacity-80 blur-[1px]" />
                        <div className={`absolute inset-1 -rotate-3 overflow-hidden rounded-[1.7rem] border-2 ${isDark ? "border-white/60 bg-[#17132d]" : "border-white bg-indigo-100"}`}>
                            {idolAvatar ? (
                                <Image src={idolAvatar} alt={idolName} fill sizes="112px" className="object-cover" priority />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-600">
                                    <Mic2 className="h-11 w-11 text-white" />
                                </div>
                            )}
                        </div>
                        <span className="absolute -bottom-1 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-yellow-400 text-indigo-950 shadow-lg">
                            <Star className="h-4 w-4 fill-current" />
                        </span>
                    </div>
                    <div className="mb-1 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-500">
                        <Music2 className="h-3.5 w-3.5" /> Private backstage
                    </div>
                    <h1 className="bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 bg-clip-text text-3xl font-black uppercase tracking-tight text-transparent sm:text-4xl">{idolName}</h1>
                    <p className={`mt-2 text-sm ${isDark ? "text-violet-200/75" : "text-indigo-700/70"}`}>Nhập fan code 6 số để bước vào fanzone</p>
                </header>

                <PinLockController slug={slug} onSuccess={onSuccess} errorMessage="Fan code không đúng, hãy thử lại">
                    {(controls) => (
                        <PinKeypad
                            controls={controls}
                            filledIcon={<Zap className="h-4 w-4 fill-current" />}
                            emptyIcon={<Sparkles className="h-4 w-4 opacity-30" />}
                            slotClass={isDark ? "border-violet-500/40 bg-black/20 text-cyan-300" : "border-violet-200 bg-white/60 text-violet-500"}
                            activeSlotClass={isDark ? "border-cyan-300 bg-cyan-400/10 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.35)]" : "border-fuchsia-400 bg-fuchsia-50 text-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.2)]"}
                            keyClass={isDark ? "rounded-xl border border-violet-500/35 bg-gradient-to-br from-violet-950/80 to-indigo-950/80 text-cyan-100 shadow-[0_0_14px_rgba(139,92,246,0.12)] hover:border-cyan-300/70 hover:text-white hover:shadow-cyan-400/20 active:scale-95" : "rounded-xl border border-indigo-200 bg-white/70 text-indigo-700 shadow-sm hover:border-fuchsia-300 hover:bg-white active:scale-95"}
                            specialKeyClass={isDark ? "rounded-xl border border-fuchsia-500/30 bg-fuchsia-950/30 text-fuchsia-200 hover:border-fuchsia-400/70 active:scale-95" : "rounded-xl border border-fuchsia-200 bg-fuchsia-50/80 text-fuchsia-700 hover:bg-fuchsia-100 active:scale-95"}
                            submitClass="bg-gradient-to-r from-cyan-500 via-violet-600 to-fuchsia-500 uppercase tracking-wider text-white shadow-[0_0_24px_rgba(139,92,246,0.38)] hover:saturate-150"
                            submitLabel="Enter fanzone"
                            errorClass={isDark ? "border-rose-500/40 bg-rose-950/50 text-rose-200" : "border-rose-200 bg-rose-50 text-rose-700"}
                        />
                    )}
                </PinLockController>
            </section>
        </main>
    );
}
