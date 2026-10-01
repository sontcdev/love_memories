"use client";

import { Camera, Heart, Moon, Star, Sun } from "lucide-react";
import {
    PinKeypad,
    PinLockController,
    type TemplateLockScreenProps,
    useLockTheme,
} from "@/components/auth/PinLockController";

export function Love2LockScreen({ slug, onSuccess, linkData }: TemplateLockScreenProps) {
    const { isDark, toggleTheme } = useLockTheme(slug);
    const profile = linkData?.profile_data as Record<string, string> | null;
    const boyName = profile?.boy_name || "Him";
    const girlName = profile?.girl_name || "Her";

    return (
        <main className={`relative flex min-h-[100svh] items-center justify-center overflow-hidden px-3 py-6 transition-colors sm:px-6 ${isDark ? "bg-[#171411]" : "bg-[#d7b989]"}`}>
            <div className={`pointer-events-none absolute inset-0 opacity-30 ${isDark ? "[background-image:radial-gradient(#d8a96a_0.7px,transparent_0.7px)]" : "[background-image:radial-gradient(#6f4d2e_0.7px,transparent_0.7px)]"} [background-size:7px_7px]`} />
            <div className={`pointer-events-none absolute -left-8 top-[12%] h-28 w-36 -rotate-6 border-[7px] pb-7 shadow-xl ${isDark ? "border-[#ddd3c3] bg-[#29231d]" : "border-white bg-[#8fb2a2]"}`}>
                <Camera className={`m-auto mt-5 h-9 w-9 ${isDark ? "text-stone-400" : "text-white/70"}`} />
            </div>
            <div className="pointer-events-none absolute -right-12 bottom-[9%] h-24 w-44 rotate-12 bg-rose-300/70 shadow-md [clip-path:polygon(3%_5%,100%_0,96%_93%,0_100%)]" />

            <section className={`relative w-full max-w-[430px] rotate-[-0.35deg] rounded-sm border p-4 pt-8 shadow-[0_25px_70px_rgba(50,31,17,0.35)] transition-colors sm:p-8 sm:pt-10 ${isDark ? "border-stone-700 bg-[#28231e] text-stone-100" : "border-amber-100 bg-[#fffaf0] text-[#513c2b]"}`}>
                <div className="absolute -top-3 left-1/2 h-7 w-28 -translate-x-1/2 -rotate-2 bg-amber-200/75 shadow-sm [clip-path:polygon(2%_8%,98%_0,100%_88%,0_100%)]" />
                <button type="button" onClick={toggleTheme} className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border transition-transform hover:rotate-12 ${isDark ? "border-stone-600 bg-stone-800 text-amber-300" : "border-amber-200 bg-amber-50 text-amber-700"}`} aria-label={isDark ? "Bật giao diện sáng" : "Bật giao diện tối"}>
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>

                <header className="mb-5 text-center sm:mb-6">
                    <div className={`relative mx-auto mb-3 flex h-16 w-16 rotate-3 items-center justify-center border-[5px] shadow-lg sm:h-20 sm:w-20 ${isDark ? "border-stone-200 bg-[#6f5540]" : "border-white bg-[#c98269]"}`}>
                        <Camera className="h-8 w-8 text-white sm:h-9 sm:w-9" />
                        <span className="absolute -bottom-4 -right-5 rotate-[-8deg] rounded-sm bg-amber-200 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-900 shadow">keep this</span>
                    </div>
                    <p className={`mb-1 font-mono text-[10px] uppercase tracking-[0.28em] ${isDark ? "text-amber-300" : "text-amber-700"}`}>A little scrapbook</p>
                    <h1 className="font-serif text-2xl font-bold sm:text-3xl">{boyName} <span className="text-rose-500">+</span> {girlName}</h1>
                    <p className={`mt-2 text-sm ${isDark ? "text-stone-400" : "text-[#80634a]"}`}>Nhập 6 số bí mật để lật mở album</p>
                </header>

                <PinLockController slug={slug} onSuccess={onSuccess} errorMessage="Mã bí mật chưa đúng rồi">
                    {(controls) => (
                        <PinKeypad
                            controls={controls}
                            filledIcon={<Heart className="h-4 w-4 fill-current" />}
                            emptyIcon={<Star className="h-3.5 w-3.5 opacity-25" />}
                            slotClass={isDark ? "border-stone-600 bg-stone-900/40 text-amber-300" : "border-amber-300 bg-amber-50 text-amber-700"}
                            activeSlotClass={isDark ? "border-rose-400 bg-rose-950/40 text-rose-300 shadow-md" : "border-rose-400 bg-rose-50 text-rose-500 shadow-md"}
                            keyClass={isDark ? "rounded-md border border-stone-600 bg-[#342d26] font-mono text-amber-200 shadow-[2px_3px_0_#171411] hover:border-amber-500 active:translate-y-0.5" : "rounded-md border border-amber-300 bg-[#fff8e8] font-mono text-amber-900 shadow-[2px_3px_0_#b8905d] hover:-rotate-1 hover:bg-white active:translate-y-0.5"}
                            specialKeyClass={isDark ? "rounded-md border border-stone-600 bg-stone-800 font-mono text-stone-300 hover:text-white" : "rounded-md border border-[#c9a87b] bg-[#ead9bd] font-mono text-[#725337] hover:bg-[#dfc69f]"}
                            submitClass="rounded-md bg-gradient-to-r from-[#b35f4c] to-[#d27b63] font-mono uppercase tracking-wider text-white shadow-[3px_5px_0_rgba(91,48,37,0.35)] hover:-translate-y-0.5"
                            submitLabel="Mở scrapbook"
                            errorClass={isDark ? "border-rose-800 bg-rose-950/60 text-rose-300" : "border-rose-200 bg-rose-50 text-rose-700"}
                        />
                    )}
                </PinLockController>

                <div className={`pointer-events-none absolute -bottom-2 left-8 h-5 w-20 rotate-2 ${isDark ? "bg-sky-900/70" : "bg-sky-200/75"}`} />
            </section>
        </main>
    );
}
