"use client";

import Image from "next/image";
import { Bus, MapPin, Navigation, Ticket, Users } from "lucide-react";
import {
    PinKeypad,
    PinLockController,
    type TemplateLockScreenProps,
} from "@/components/auth/PinLockController";

type GroupTheme = "caravan" | "scrapbook" | "station";

export function GradGroupLockScreen({ slug, onSuccess, linkData }: TemplateLockScreenProps) {
    const profile = linkData?.profile_data as Record<string, unknown> | null;
    const requestedTheme = typeof profile?.theme === "string" ? profile.theme : "caravan";
    const theme: GroupTheme = requestedTheme === "scrapbook" || requestedTheme === "station" ? requestedTheme : "caravan";
    const groupName = typeof profile?.group_name === "string" ? profile.group_name : "Nhóm bạn";
    const groupAvatar = typeof profile?.group_avatar === "string" ? profile.group_avatar : null;

    const skin = theme === "station" ? {
        page: "bg-[#070510] text-violet-50",
        glow: "bg-violet-600/20",
        card: "rounded-2xl border-violet-500/50 bg-[#110b25]/95 shadow-[0_0_60px_rgba(124,58,237,0.28)]",
        avatar: "rounded-full border-violet-400 bg-violet-950 shadow-[0_0_24px_rgba(139,92,246,0.45)]",
        eyebrow: "text-cyan-300",
        title: "text-violet-50",
        copy: "text-violet-200/70",
        slot: "border-violet-900 bg-black/30",
        activeSlot: "border-cyan-300 bg-violet-950 shadow-[0_0_14px_rgba(34,211,238,0.35)]",
        key: "rounded-xl border border-violet-700/60 bg-violet-950/70 text-violet-100 hover:border-cyan-400 hover:bg-violet-900 active:scale-95",
        special: "rounded-xl border border-violet-900 bg-black/25 text-violet-300 hover:bg-violet-950 active:scale-95",
        submit: "bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-[0_0_22px_rgba(139,92,246,0.35)] hover:from-violet-500 hover:to-cyan-400",
        error: "border-fuchsia-500/40 bg-fuchsia-950/70 text-fuchsia-100",
        label: "TRANSIT // PRIVATE LINE",
        action: "Qua cổng soát vé",
    } : theme === "scrapbook" ? {
        page: "bg-[#c9b08e] text-[#4a2d1c]",
        glow: "bg-amber-100/30",
        card: "rotate-[-0.4deg] rounded-sm border-[#9b744d] bg-[#f4ead7] shadow-[10px_12px_0_rgba(75,45,28,0.2),0_25px_60px_rgba(75,45,28,0.3)]",
        avatar: "rotate-2 rounded-sm border-white bg-white shadow-md",
        eyebrow: "text-[#9a4f2d]",
        title: "text-[#4a2d1c]",
        copy: "text-[#76543d]",
        slot: "rounded-sm border-dashed border-[#b79269] bg-[#ead9bd]",
        activeSlot: "rounded-sm border-[#855430] bg-[#dfc9a8] shadow-sm",
        key: "rounded-sm border border-[#b79269] bg-[#ead9bd] text-[#56351f] shadow-[2px_2px_0_rgba(133,84,48,0.2)] hover:bg-[#dfc9a8] active:translate-x-0.5 active:translate-y-0.5",
        special: "rounded-sm border border-dashed border-[#b79269] bg-[#f0e2ca] text-[#855430] hover:bg-[#e4d1b3]",
        submit: "rounded-sm bg-[#855430] text-[#fffaf0] shadow-[3px_3px_0_#4a2d1c] hover:bg-[#704326]",
        error: "border-red-800/30 bg-red-100/80 text-red-800",
        label: "SCRAPBOOK / OUR CREW",
        action: "Mở album thanh xuân",
    } : {
        page: "bg-[#24160d] text-amber-50",
        glow: "bg-orange-500/15",
        card: "rounded-3xl border-amber-700/60 bg-[#3a2314]/95 shadow-[0_28px_80px_rgba(0,0,0,0.55)]",
        avatar: "rounded-full border-amber-500 bg-amber-950 shadow-lg",
        eyebrow: "text-amber-400",
        title: "text-amber-50",
        copy: "text-amber-200/70",
        slot: "border-amber-900 bg-[#24160d]",
        activeSlot: "border-amber-400 bg-[#24160d] shadow-[0_0_12px_rgba(245,158,11,0.3)]",
        key: "rounded-xl border border-amber-800/70 bg-[#2b1a10] text-amber-100 shadow-md hover:bg-amber-900/60 hover:border-amber-500 active:scale-95",
        special: "rounded-xl border border-amber-950 bg-[#1c110b] text-amber-500 hover:bg-[#2b1a10] active:scale-95",
        submit: "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-black/30 hover:from-amber-500 hover:to-orange-500",
        error: "border-red-900/50 bg-red-950/60 text-red-100",
        label: "CARAVAN / MEMORY ROUTE",
        action: "Khởi hành",
    };

    return (
        <main className={`relative flex min-h-screen w-full items-center justify-center overflow-hidden px-3 py-5 sm:p-6 ${skin.page}`}>
            {theme === "caravan" && (
                <div className="absolute inset-x-0 bottom-[12%] h-24 -skew-y-3 border-y-4 border-dashed border-amber-500/15 bg-black/15" />
            )}
            {theme === "scrapbook" && (
                <div className="absolute inset-0 opacity-25 [background-image:repeating-linear-gradient(0deg,transparent,transparent_23px,#855430_24px)]" />
            )}
            {theme === "station" && (
                <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.07)_1px,transparent_1px)] [background-size:28px_28px] [transform:perspective(500px)_rotateX(8deg)_scale(1.1)]" />
            )}
            <div className={`absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl ${skin.glow}`} />

            <section className={`relative z-10 w-full max-w-sm border p-4 sm:p-6 ${skin.card}`}>
                {theme === "scrapbook" && <div className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-2 bg-amber-200/60 shadow-sm" />}
                {theme === "station" && <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />}

                <header className="mb-5 text-center">
                    <div className={`relative mx-auto mb-3 h-20 w-20 overflow-hidden border-[3px] sm:h-24 sm:w-24 ${skin.avatar}`}>
                        {groupAvatar ? (
                            <Image src={groupAvatar} alt={`Ảnh của ${groupName}`} fill sizes="96px" className="object-cover" />
                        ) : theme === "caravan" ? (
                            <Bus className="absolute inset-0 m-auto h-10 w-10 text-amber-300" />
                        ) : theme === "station" ? (
                            <Navigation className="absolute inset-0 m-auto h-10 w-10 text-cyan-300" />
                        ) : (
                            <Users className="absolute inset-0 m-auto h-10 w-10 text-[#855430]" />
                        )}
                    </div>
                    <p className={`text-[9px] font-bold uppercase tracking-[0.22em] ${skin.eyebrow}`}>{skin.label}</p>
                    <h1 className={`mt-1 break-words text-2xl font-black sm:text-3xl ${skin.title}`}>{groupName}</h1>
                    <p className={`mt-2 flex items-center justify-center gap-1.5 text-xs ${skin.copy}`}>
                        {theme === "station" ? <Ticket className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                        Nhập mã PIN 6 số để tiếp tục hành trình
                    </p>
                </header>

                <PinLockController slug={slug} onSuccess={onSuccess} errorMessage="Mã PIN hành trình không đúng">
                    {(controls) => (
                        <PinKeypad
                            controls={controls}
                            filledIcon={theme === "station" ? <span className="h-2.5 w-2.5 rotate-45 bg-cyan-300 shadow-[0_0_8px_#22d3ee]" /> : theme === "scrapbook" ? <span className="text-lg text-[#855430]">x</span> : <MapPin className="h-4 w-4 text-amber-400 sm:h-5 sm:w-5" />}
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
