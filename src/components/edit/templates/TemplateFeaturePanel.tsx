"use client";

import { CheckCircle2, Image, Mail, Sparkles, CalendarDays, type LucideIcon } from "lucide-react";
import type { LinkType } from "@prisma/client";
import { getTemplateEditCapability } from "@/components/edit/templates/capabilities";
import type { LinkWithRelations } from "@/components/edit/templates/shared";

interface TemplateFeaturePanelProps {
    linkData: LinkWithRelations;
    isDark: boolean;
}

function ProgressItem({ icon: Icon, label, current, target, isDark }: {
    icon: LucideIcon;
    label: string;
    current: number;
    target: number;
    isDark: boolean;
}) {
    const percent = Math.min(100, Math.round((current / target) * 100));

    return (
        <div>
            <div className="mb-1 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-semibold"><Icon className="h-4 w-4 text-amber-400" />{label}</span>
                <span className="font-black">{current}/{target}</span>
            </div>
            <div className={`h-2 overflow-hidden rounded-full ${isDark ? "bg-white/10" : "bg-slate-200"}`}>
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all" style={{ width: `${percent}%` }} />
            </div>
        </div>
    );
}

function targetsFor(linkType: LinkType) {
    switch (linkType) {
        case "LOVE2":
        case "TRAVEL":
            return { gallery: 8, timeline: 5, letters: 1 };
        case "IDOL":
        case "WEDDING":
        case "FRIENDSHIP":
            return { gallery: 6, timeline: 4, letters: 2 };
        case "GRAD_CLASS":
        case "GRAD_GROUP":
            return { gallery: 8, timeline: 5, letters: 3 };
        case "GRAD_PERSONAL":
            return { gallery: 4, timeline: 4, letters: 2 };
        case "EVERY":
            return { gallery: 4, timeline: 3, letters: 1 };
        case "LOVE":
        default:
            return { gallery: 5, timeline: 4, letters: 2 };
    }
}

export function TemplateFeaturePanel({ linkData, isDark }: TemplateFeaturePanelProps) {
    const capability = getTemplateEditCapability(linkData.type);
    const targets = targetsFor(linkData.type);
    const surfaceClass = isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-white text-slate-900";

    return (
        <div className="space-y-5">
            <section className={`rounded-2xl border p-5 ${surfaceClass}`}>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] opacity-60">{capability.eyebrow}</p>
                <h3 className="mt-2 flex items-center gap-2 text-xl font-black"><Sparkles className="h-5 w-5 text-amber-400" />{capability.title}</h3>
                <p className="mt-2 max-w-2xl text-sm opacity-75">{capability.description}</p>
                <p className={`mt-4 rounded-xl px-4 py-3 text-sm ${isDark ? "bg-black/20" : "bg-slate-50"}`}><span className="font-bold">Ưu tiên:</span> {capability.focus}</p>
            </section>

            <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
                <section className={`rounded-2xl border p-5 ${surfaceClass}`}>
                    <h4 className="font-black">Quy trình biên tập đề xuất</h4>
                    <ol className="mt-4 space-y-3">
                        {capability.workflow.map((step, index) => (
                            <li key={step} className="flex items-start gap-3 text-sm">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 font-black text-slate-950">{index + 1}</span>
                                <span className="pt-0.5 opacity-80">{step}</span>
                            </li>
                        ))}
                    </ol>
                    <p className="mt-5 border-t pt-4 text-sm opacity-70">Các trường nội dung chỉ được chỉnh sửa tại tab <strong>Hồ sơ</strong>, để mỗi dữ liệu có một nơi lưu duy nhất.</p>
                </section>

                <aside className={`space-y-4 rounded-2xl border p-5 ${surfaceClass}`}>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] opacity-60">Độ sẵn sàng</p>
                        <div className="mt-4 space-y-4">
                            <ProgressItem icon={Image} label="Ảnh" current={linkData.galleries.length} target={targets.gallery} isDark={isDark} />
                            <ProgressItem icon={CalendarDays} label="Timeline" current={linkData.timelines.length} target={targets.timeline} isDark={isDark} />
                            <ProgressItem icon={Mail} label="Lưu bút" current={linkData.letters.length} target={targets.letters} isDark={isDark} />
                        </div>
                    </div>
                    <div className={`border-t pt-4 text-sm ${isDark ? "border-white/10" : "border-slate-200"}`}>
                        <p className="mb-2 font-bold">Checklist</p>
                        <ul className="space-y-2">
                            {capability.workflow.slice(0, 3).map((item) => <li key={item} className="flex gap-2 opacity-75"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />{item}</li>)}
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
}
