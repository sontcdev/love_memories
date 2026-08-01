"use client";

import Image from "next/image";
import { Home, Images, Flame, Heart, KeyRound } from "lucide-react";
import {
    PinKeypad,
    PinLockController,
    type TemplateLockScreenProps,
} from "@/components/auth/PinLockController";

type FamilyTheme = "home" | "album" | "hearth";

export function FamilyLockScreen({ slug, onSuccess, linkData }: TemplateLockScreenProps) {
    const profile = linkData?.profile_data as Record<string, unknown> | null;
    const requestedTheme = typeof profile?.theme === "string" ? profile.theme : "home";
    const theme: FamilyTheme = requestedTheme === "album" || requestedTheme === "hearth" ? requestedTheme : "home";
    const familyName = typeof profile?.family_name === "string" ? profile.family_name : "Gia đình mình";
    const familyAvatar = typeof profile?.family_avatar === "string" ? profile.family_avatar : null;

    const skin = theme === "hearth" ? {
        page: "bg-[#2b1410] text-orange-50",
        glow: "bg-orange-600/20",
        card: "rounded-3xl border-orange-700/60 bg-[#3d1c14]/95 shadow-[0_28px_80px_rgba(0,0,0,0.55)]",
        avatar: "rounded-full border-orange-500 bg-orange-950 shadow-lg",
        eyebrow: "text-orange-400",
        title: "text-orange-50",
        copy: "text-orange-200/70",
        slot: "border-orange-900 bg-[#2b1410]",
        activeSlot: "border-orange-400 bg-[#2b1410] shadow-[0_0_12px_rgba(251,146,60,0.35)]",
        key: "rounded-xl border border-orange-800/70 bg-[#33170f] text-orange-100 shadow-md hover:bg-orange-900/60 hover:border-orange-500 active:scale-95",
        special: "rounded-xl border border-orange-950 bg-[#221009] text-orange-500 hover:bg-[#33170f] active:scale-95",
        submit: "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-black/30 hover:from-orange-500 hover:to-red-500",
        error: "border-red-900/50 bg-red-950/60 text-red-100",
        label: "HEARTH / GIA ĐÌNH ẤM ÁP",
        action: "Sưởi ấm nhà",
    } : theme === "album" ? {
        page: "bg-[#cbb193] text-[#4a3320]",
        glow: "bg-amber-100/30",
        card: "rotate-[-0.4deg] rounded-sm border-[#9b7a4d] bg-[#f4ecdb] shadow-[10px_12px_0_rgba(74,51,32,0.2),0_25px_60px_rgba(74,51,32,0.3)]",
        avatar: "rotate-2 rounded-sm border-white bg-white shadow-md",
        eyebrow: "text-[#9a622d]",
        title: "text-[#4a3320]",
        copy: "text-[#76583d]",
        slot: "rounded-sm border-dashed border-[#b79269] bg-[#ead9bd]",
        activeSlot: "rounded-sm border-[#855430] bg-[#dfc9a8] shadow-sm",
        key: "rounded-sm border border-[#b79269] bg-[#ead9bd] text-[#56351f] shadow-[2px_2px_0_rgba(133,84,48,0.2)] hover:bg-[#dfc9a8] active:translate-x-0.5 active:translate-y-0.5",
        special: "rounded-sm border border-dashed border-[#b79269] bg-[#f0e2ca] text-[#855430] hover:bg-[#e4d1b3]",
        submit: "rounded-sm bg-[#855430] text-[#fffaf0] shadow-[3px_3px_0_#4a3320] hover:bg-[#704326]",
        error: "border-red-800/30 bg-red-100/80 text-red-800",
        label: "ALBUM / KỶ NIỆM GIA ĐÌNH",
        action: "Mở album gia đình",
    } : {
        page: "bg-[#241a0d] text-amber-50",
        glow: "bg-orange-500/15",
        card: "rounded-3xl border-amber-700/60 bg-[#3a2b14]/95 shadow-[0_28px_80px_rgba(0,0,0,0.55)]",
        avatar: "rounded-full border-amber-500 bg-amber-950 shadow-lg",
        eyebrow: "text-amber-400",
        title: "text-amber-50",
        copy: "text-amber-200/70",
        slot: "border-amber-900 bg-[#241a0d]",
        activeSlot: "border-amber-400 bg-[#241a0d] shadow-[0_0_12px_rgba(245,158,11,0.3)]",
        key: "rounded-xl border border-amber-800/70 bg-[#2b2010] text-amber-100 shadow-md hover:bg-amber-900/60 hover:border-amber-500 active:scale-95",
        special: "rounded-xl border border-amber-950 bg-[#1c1409] text-amber-500 hover:bg-[#2b2010] active:scale-95",
        submit: "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-black/30 hover:from-amber-500 hover:to-orange-500",
        error: "border-red-900/50 bg-red-950/60 text-red-100",
        label: "HOME / TỔ ẤM CỦA CHÚNG TA",
        action: "Về nhà",
    };

    return (
        <main className={`relative flex min-h-screen w-full items-center justify-center overflow-hidden px-3 py-5 sm:p-6 ${skin.page}`}>
            {theme === "home" && (
                <div className="absolute inset-x-0 bottom-[12%] h-24 -skew-y-3 border-y-4 border-dashed border-amber-500/15 bg-black/15" />
            )}
            {theme === "album" && (
                <div className="absolute inset-0 opacity-25 [background-image:repeating-linear-gradient(0deg,transparent,transparent_23px,#855430_24px)]" />
            )}
            {theme === "hearth" && (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(251,146,60,0.18),transparent_60%)]" />
            )}
            <div className={`absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl ${skin.glow}`} />

            <section className={`relative z-10 w-full max-w-sm border p-4 sm:p-6 ${skin.card}`}>
                {theme === "album" && <div className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-2 bg-amber-200/60 shadow-sm" />}
                {theme === "hearth" && <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent" />}

                <header className="mb-5 text-center">
                    <div className={`relative mx-auto mb-3 h-20 w-20 overflow-hidden border-[3px] sm:h-24 sm:w-24 ${skin.avatar}`}>
                        {familyAvatar ? (
                            <Image src={familyAvatar} alt={`Ảnh của ${familyName}`} fill sizes="96px" className="object-cover" />
                        ) : theme === "home" ? (
                            <Home className="absolute inset-0 m-auto h-10 w-10 text-amber-300" />
                        ) : theme === "hearth" ? (
                            <Flame className="absolute inset-0 m-auto h-10 w-10 text-orange-300" />
                        ) : (
                            <Images className="absolute inset-0 m-auto h-10 w-10 text-[#855430]" />
                        )}
                    </div>
                    <p className={`text-[9px] font-bold uppercase tracking-[0.22em] ${skin.eyebrow}`}>{skin.label}</p>
                    <h1 className={`mt-1 break-words text-2xl font-black sm:text-3xl ${skin.title}`}>{familyName}</h1>
                    <p className={`mt-2 flex items-center justify-center gap-1.5 text-xs ${skin.copy}`}>
                        {theme === "hearth" ? <Flame className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
                        Nhập mã PIN 6 số để mở kỷ niệm gia đình
                    </p>
                </header>

                <PinLockController slug={slug} onSuccess={onSuccess} errorMessage="Mã PIN gia đình không đúng">
                    {(controls) => (
                        <PinKeypad
                            controls={controls}
                            filledIcon={theme === "hearth" ? <span className="h-2.5 w-2.5 rotate-45 bg-orange-300 shadow-[0_0_8px_#fb923c]" /> : theme === "album" ? <span className="text-lg text-[#855430]">x</span> : <KeyRound className="h-4 w-4 text-amber-400 sm:h-5 sm:w-5" />}
                            slotClass={skin.slot}
                            activeSlotClass={skin.activeSlot}
                            keyClass={skin.key}
                            specialKeyClass={skin.special}
                            submitClass={skin.submit}
                            submitLabel={skin.action}
                            errorClass={skin.error}
                        />
                    )}
                </PinLockController>
            </section>
        </main>
    );
}
