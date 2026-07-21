"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Loader2, Save, Sparkles } from "lucide-react";
import { updateLinkProfile, type ProfileData } from "@/app/actions/profile-actions";
import { getTemplateEditCapability, type TemplateFeatureField } from "@/components/edit/templates/capabilities";
import type { LinkWithRelations } from "@/components/edit/templates/shared";

interface TemplateFeaturePanelProps {
    slug: string;
    linkData: LinkWithRelations;
    isDark: boolean;
}

type FeatureValues = Record<string, string>;

function normalizeValue(value: unknown) {
    if (typeof value === "number") return String(value);
    if (typeof value === "string") return value;
    return "";
}

function buildPayload(fields: TemplateFeatureField[], values: FeatureValues) {
    return fields.reduce<Record<string, string | number>>((payload, field) => {
        const rawValue = values[field.key]?.trim() ?? "";
        if (!rawValue) {
            payload[field.key] = "";
            return payload;
        }

        payload[field.key] = field.type === "number" ? Number(rawValue) : rawValue;
        return payload;
    }, {});
}

function getReadinessTargets(linkType: LinkWithRelations["type"]) {
    switch (linkType) {
        case "LOVE2":
            return { gallery: 8, timeline: 3, letters: 1 };
        case "IDOL":
            return { gallery: 6, timeline: 4, letters: 1 };
        case "GRAD_PERSONAL":
            return { gallery: 4, timeline: 4, letters: 2 };
        case "GRAD_CLASS":
            return { gallery: 8, timeline: 5, letters: 3 };
        case "GRAD_GROUP":
            return { gallery: 8, timeline: 5, letters: 3 };
        case "WEDDING":
            return { gallery: 6, timeline: 3, letters: 2 };
        case "TRAVEL":
            return { gallery: 8, timeline: 5, letters: 1 };
        case "FRIENDSHIP":
            return { gallery: 6, timeline: 4, letters: 3 };
        case "EVERY":
            return { gallery: 4, timeline: 3, letters: 1 };
        case "LOVE":
        default:
            return { gallery: 5, timeline: 4, letters: 2 };
    }
}

function ReadinessMeter({
    current,
    label,
    target,
    isDark,
}: {
    current: number;
    label: string;
    target: number;
    isDark: boolean;
}) {
    const percent = Math.min(100, Math.round((current / target) * 100));

    return (
        <div>
            <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-semibold opacity-80">{label}</span>
                <span className="font-black">
                    {current}/{target}
                </span>
            </div>
            <div className={`h-2 overflow-hidden rounded-full ${isDark ? "bg-white/10" : "bg-slate-200"}`}>
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all" style={{ width: `${percent}%` }} />
            </div>
        </div>
    );
}

export function TemplateFeaturePanel({ slug, linkData, isDark }: TemplateFeaturePanelProps) {
    const capability = getTemplateEditCapability(linkData.type);
    const initialValues = useMemo(
        () => {
            const profileData = (linkData.profile_data as Record<string, unknown> | null) ?? {};
            return capability.fields.reduce<FeatureValues>((values, field) => {
                values[field.key] = normalizeValue(profileData[field.key]);
                return values;
            }, {});
        },
        [capability.fields, linkData.profile_data]
    );
    const [values, setValues] = useState<FeatureValues>(initialValues);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const readinessTargets = getReadinessTargets(linkData.type);

    const updateValue = (key: string, value: string) => {
        setValues((current) => ({ ...current, [key]: value }));
    };

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setMessage(null);

        const result = await updateLinkProfile(slug, buildPayload(capability.fields, values) as ProfileData);
        if (result.success) {
            setMessage({ type: "success", text: "Đã lưu tính năng riêng cho template." });
        } else {
            setMessage({ type: "error", text: result.error || "Không thể lưu tính năng riêng." });
        }

        setIsSubmitting(false);
    };

    return (
        <div className="space-y-5">
            <div className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-white text-slate-900"}`}>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.28em] opacity-60">{capability.eyebrow}</p>
                        <h3 className="mt-1 flex items-center gap-2 text-xl font-black">
                            <Sparkles className="h-5 w-5 text-amber-400" />
                            {capability.title}
                        </h3>
                        <p className="mt-2 max-w-2xl text-sm opacity-75">{capability.description}</p>
                    </div>
                    <div className={`rounded-xl px-3 py-2 text-xs font-semibold ${isDark ? "bg-black/25 text-white/75" : "bg-slate-100 text-slate-600"}`}>
                        {capability.focus}
                    </div>
                </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1fr_16rem]">
                <form onSubmit={onSubmit} className={`space-y-4 rounded-2xl border p-4 ${isDark ? "border-white/10 bg-black/20" : "border-slate-200 bg-white"}`}>
                    {capability.fields.map((field) => (
                        <div key={field.key}>
                            <label className={`mb-1 block text-sm font-bold ${isDark ? "text-white/85" : "text-slate-700"}`}>{field.label}</label>
                            {field.type === "textarea" ? (
                                <textarea
                                    value={values[field.key] ?? ""}
                                    onChange={(event) => updateValue(field.key, event.target.value)}
                                    maxLength={field.maxLength}
                                    rows={4}
                                    placeholder={field.placeholder}
                                    className={`w-full resize-none rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${isDark ? "border-white/10 bg-white/10 text-white placeholder:text-white/35 focus:ring-white/20" : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-slate-200"}`}
                                />
                            ) : field.type === "select" ? (
                                <select
                                    value={values[field.key] ?? ""}
                                    onChange={(event) => updateValue(field.key, event.target.value)}
                                    className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${isDark ? "border-white/10 bg-white/10 text-white focus:ring-white/20" : "border-slate-200 bg-white text-slate-900 focus:ring-slate-200"}`}
                                >
                                    <option value="">Chọn...</option>
                                    {field.options?.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    value={values[field.key] ?? ""}
                                    onChange={(event) => updateValue(field.key, event.target.value)}
                                    type={field.type}
                                    min={field.min}
                                    maxLength={field.maxLength}
                                    placeholder={field.placeholder}
                                    className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${isDark ? "border-white/10 bg-white/10 text-white placeholder:text-white/35 focus:ring-white/20" : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-slate-200"}`}
                                />
                            )}
                            {field.maxLength && (
                                <p className={`mt-1 text-right text-[11px] ${isDark ? "text-white/45" : "text-slate-400"}`}>
                                    {(values[field.key] ?? "").length}/{field.maxLength}
                                </p>
                            )}
                        </div>
                    ))}

                    {message && (
                        <div className={`rounded-xl border px-3 py-2 text-sm ${message.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
                            {message.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
                    >
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        {isSubmitting ? "Đang lưu..." : "Lưu tính năng riêng"}
                    </button>
                </form>

                <aside className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50 text-slate-800"}`}>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] opacity-60">Workflow đề xuất</p>
                    <ol className="mt-4 space-y-3">
                        {capability.workflow.map((item, index) => (
                            <li key={item} className="flex gap-3 text-sm">
                                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${isDark ? "bg-white/10" : "bg-white"}`}>{index + 1}</span>
                                <span className="opacity-80">{item}</span>
                            </li>
                        ))}
                    </ol>

                    <div className={`my-4 h-px ${isDark ? "bg-white/10" : "bg-slate-200"}`} />

                    <p className="text-[10px] font-black uppercase tracking-[0.24em] opacity-60">Độ sẵn sàng</p>
                    <div className="mt-4 space-y-3">
                        <ReadinessMeter label="Ảnh" current={linkData.galleries.length} target={readinessTargets.gallery} isDark={isDark} />
                        <ReadinessMeter label="Timeline" current={linkData.timelines.length} target={readinessTargets.timeline} isDark={isDark} />
                        <ReadinessMeter label="Lưu bút" current={linkData.letters.length} target={readinessTargets.letters} isDark={isDark} />
                    </div>
                </aside>
            </div>
        </div>
    );
}
