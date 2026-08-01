"use client";

import { useState } from "react";
import Image from "next/image";
import { Link as PrismaLink, LinkConfig, Gallery, Timeline, Letter, LetterReply } from "@prisma/client";
import { Baby, Calendar, Heart, Scale, X } from "lucide-react";
import { LetterBox } from "@/components/shared/LetterBox";
import type { BabyMonthEntry } from "@/app/actions/profile-actions";

type LetterWithReplies = Letter & { replies: LetterReply[] };

type LinkWithRelations = PrismaLink & {
    config: LinkConfig | null;
    galleries: Gallery[];
    timelines: Timeline[];
    letters: LetterWithReplies[];
};

interface BabyTemplateProps {
    data: LinkWithRelations;
    slug: string;
}

function formatVietnameseDate(isoDate?: string | null): string | null {
    if (!isoDate) return null;
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const MONTH_LABELS = Array.from({ length: 12 }, (_, i) => i + 1);

export function BabyTemplate({ data, slug }: BabyTemplateProps) {
    const profileData = data.profile_data as Record<string, unknown> | null;
    const babyName = (profileData?.baby_name as string) || "Em bé của chúng ta";
    const homeName = profileData?.home_name as string | undefined;
    const fatherName = profileData?.father_name as string | undefined;
    const motherName = profileData?.mother_name as string | undefined;
    const birthDate = profileData?.birth_date as string | undefined;
    const birthWeightKg = profileData?.birth_weight_kg as number | undefined;
    const slogan = profileData?.slogan as string | undefined;
    const journey = (profileData?.journey as BabyMonthEntry[] | undefined) || [];

    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

    const journeyByMonth = new Map(journey.map((j) => [j.month, j]));

    return (
        <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/40 to-white text-slate-800">
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-amber-400 to-orange-400 px-4 py-14 text-center text-white sm:py-20">
                <Baby className="mx-auto mb-4 h-10 w-10" />
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-50">
                    {homeName ? `Bé ${homeName}` : "Nhật ký em bé"}
                </p>
                <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">{babyName}</h1>
                {slogan && <p className="mt-3 text-sm text-amber-50 sm:text-base">{slogan}</p>}

                <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
                    {birthDate && (
                        <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5">
                            <Calendar className="h-4 w-4" /> Sinh ngày {formatVietnameseDate(birthDate)}
                        </span>
                    )}
                    {typeof birthWeightKg === "number" && (
                        <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5">
                            <Scale className="h-4 w-4" /> {birthWeightKg} kg lúc sinh
                        </span>
                    )}
                </div>

                {(fatherName || motherName) && (
                    <p className="mt-4 flex items-center justify-center gap-1.5 text-sm text-amber-50">
                        <Heart className="h-4 w-4" />
                        {[fatherName, motherName].filter(Boolean).join(" & ")}
                    </p>
                )}
            </section>

            {/* Journey grid */}
            <section className="mx-auto max-w-5xl px-4 py-12">
                <h2 className="mb-6 text-center text-2xl font-black text-amber-700">Hành trình 1 năm đầu đời</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {MONTH_LABELS.map((month) => {
                        const entry = journeyByMonth.get(month);
                        if (!entry?.image_url && !entry?.weight_kg && !entry?.note) {
                            return (
                                <div
                                    key={month}
                                    className="flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/50 text-amber-300"
                                >
                                    <span className="text-xs font-semibold">Tháng {month}</span>
                                </div>
                            );
                        }
                        return (
                            <div key={month} className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => entry.image_url && setLightboxUrl(entry.image_url)}
                                    className="relative block aspect-square w-full bg-amber-100"
                                    disabled={!entry.image_url}
                                >
                                    {entry.image_url && (
                                        <Image src={entry.image_url} alt={`Tháng ${month}`} fill className="object-cover" />
                                    )}
                                </button>
                                <div className="space-y-0.5 p-2 text-center">
                                    <p className="text-xs font-bold text-amber-700">Tháng {month}</p>
                                    {typeof entry.weight_kg === "number" && (
                                        <p className="text-[11px] text-slate-500">{entry.weight_kg} kg</p>
                                    )}
                                    {entry.note && <p className="text-[11px] text-slate-500">{entry.note}</p>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Timeline */}
            {data.timelines.length > 0 && (
                <section className="mx-auto max-w-3xl px-4 py-12">
                    <h2 className="mb-6 text-center text-2xl font-black text-amber-700">Những cột mốc đáng nhớ</h2>
                    <div className="space-y-4">
                        {data.timelines.map((t) => (
                            <div key={t.id} className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm">
                                <p className="text-xs font-semibold text-amber-500">
                                    {t.date ? formatVietnameseDate(t.date.toString()) : ""}
                                </p>
                                <h3 className="font-bold text-slate-800">{t.title}</h3>
                                {t.description && <p className="mt-1 text-sm text-slate-600">{t.description}</p>}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Gallery */}
            {data.galleries.length > 0 && (
                <section className="mx-auto max-w-5xl px-4 py-12">
                    <h2 className="mb-6 text-center text-2xl font-black text-amber-700">Album ảnh</h2>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {data.galleries.map((g) => (
                            <button
                                key={g.id}
                                type="button"
                                onClick={() => setLightboxUrl(g.image_url)}
                                className="relative aspect-square overflow-hidden rounded-xl bg-amber-100"
                            >
                                <Image src={g.image_url} alt={g.caption || babyName} fill className="object-cover" />
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {/* Letters */}
            <section className="mx-auto max-w-3xl px-4 py-12">
                <LetterBox slug={slug} initialLetters={data.letters} theme="baby" />
            </section>

            {lightboxUrl && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                    onClick={() => setLightboxUrl(null)}
                >
                    <button
                        type="button"
                        onClick={() => setLightboxUrl(null)}
                        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white"
                    >
                        <X className="h-6 w-6" />
                    </button>
                    <div className="relative h-full max-h-[80vh] w-full max-w-2xl">
                        <Image src={lightboxUrl} alt={babyName} fill className="object-contain" />
                    </div>
                </div>
            )}
        </main>
    );
}
