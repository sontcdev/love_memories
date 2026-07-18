"use client";

import { Heart, Sparkles } from "lucide-react";
import {
    PinKeypad,
    PinLockController,
    type TemplateLockScreenProps,
} from "@/components/auth/PinLockController";

export function WeddingLockScreen({ slug, onSuccess, linkData }: TemplateLockScreenProps) {
    const profile = linkData?.profile_data as Record<string, unknown> | null;
    const groomName = typeof profile?.groom_name === "string" ? profile.groom_name : "Chú rể";
    const brideName = typeof profile?.bride_name === "string" ? profile.bride_name : "Cô dâu";

    return (
        <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#f8f1e9] px-3 py-6 text-[#553b35] sm:px-6 sm:py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(190,135,122,0.22),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(180,143,69,0.18),transparent_34%)]" />
            <div className="absolute left-[-3rem] top-8 h-44 w-44 rounded-full border border-[#b88f57]/20 sm:left-10 sm:h-60 sm:w-60" />
            <div className="absolute bottom-8 right-[-4rem] h-52 w-52 rounded-full border border-[#b88f57]/20 sm:right-8 sm:h-72 sm:w-72" />

            <section className="relative w-full max-w-md">
                <div className="absolute -inset-2 rounded-[2rem] border border-[#b18a50]/30 sm:-inset-3" />
                <div className="relative overflow-hidden rounded-[1.75rem] border border-[#d5bd91] bg-[#fffdf8] shadow-[0_24px_70px_rgba(91,57,45,0.22)]">
                    <div className="relative border-b border-[#d9c49d] bg-[#f3e7da] px-5 pb-14 pt-7 text-center sm:px-8 sm:pt-9">
                        <div className="absolute inset-x-0 bottom-0 h-20 overflow-hidden">
                            <div className="absolute -bottom-12 left-1/2 h-28 w-[115%] -translate-x-1/2 rotate-3 border border-[#d3b98e] bg-[#fffaf2]" />
                            <div className="absolute -bottom-12 left-1/2 h-28 w-[115%] -translate-x-1/2 -rotate-3 border border-[#d3b98e] bg-[#fffaf2]/75" />
                        </div>
                        <p className="relative text-[10px] font-semibold uppercase tracking-[0.34em] text-[#9b7444] sm:text-xs">
                            Thiệp cưới riêng tư
                        </p>
                        <h1 className="relative mt-3 font-serif text-3xl leading-tight text-[#4f3631] sm:text-4xl">
                            {groomName}
                            <span className="mx-2 font-normal italic text-[#b17a72]">&amp;</span>
                            {brideName}
                        </h1>
                    </div>

                    <div className="relative px-4 pb-5 pt-10 sm:px-8 sm:pb-8 sm:pt-12">
                        <div className="absolute left-1/2 top-0 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-[#f7eee3] bg-gradient-to-br from-[#a95555] to-[#7e3036] text-[#f9dec3] shadow-[0_7px_16px_rgba(91,39,42,0.3)]">
                            <Heart className="h-6 w-6 fill-current" />
                            <Sparkles className="absolute right-2 top-2 h-3 w-3" />
                        </div>
                        <div className="mb-5 text-center sm:mb-6">
                            <p className="font-serif text-lg italic text-[#634842]">Mở phong thư kỷ niệm</p>
                            <p className="mt-1 text-xs tracking-wide text-[#92766e]">Nhập mã PIN gồm 6 chữ số</p>
                        </div>

                        <PinLockController slug={slug} onSuccess={onSuccess} errorMessage="Mã PIN chưa đúng, xin vui lòng thử lại">
                            {(controls) => (
                                <PinKeypad
                                    controls={controls}
                                    filledIcon={<Heart className="h-3.5 w-3.5 fill-current sm:h-4 sm:w-4" />}
                                    slotClass="border-[#dbc7a4] bg-[#fbf5eb] text-[#aa8360]"
                                    activeSlotClass="border-[#a8755f] bg-[#f2dfd5] text-[#914b4d] shadow-sm"
                                    keyClass="rounded-xl border border-[#dec9a7] bg-[#fffaf1] font-serif text-[#65473e] shadow-sm hover:border-[#b88b58] hover:bg-[#f8ecdc] active:scale-95"
                                    specialKeyClass="rounded-xl border border-[#dfd0b8] bg-[#f4ede3] text-[#826b60] hover:bg-[#eadfd1] active:scale-95"
                                    submitClass="border border-[#9d7046] bg-gradient-to-r from-[#8f623e] via-[#b38a51] to-[#8f623e] text-white shadow-[0_10px_24px_rgba(132,91,54,0.25)] hover:brightness-105"
                                    submitLabel="Mở phong thư"
                                    errorClass="border-[#d7a4a0] bg-[#fff1ed] text-[#9b4545]"
                                />
                            )}
                        </PinLockController>
                    </div>
                </div>
            </section>
        </main>
    );
}
