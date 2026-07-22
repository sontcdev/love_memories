"use client";

import { useMemo, useState, type FormEvent } from "react";
import { CalendarDays, CheckCircle2, Heart, Image, Loader2, Map, MessageCircleHeart, Music2, Save, Sparkles, Star, Target, Trophy, Users } from "lucide-react";
import type { LinkType } from "@prisma/client";
import { updateLinkProfile, type ProfileData } from "@/app/actions/profile-actions";
import type { LinkWithRelations } from "@/components/edit/templates/shared";

interface TemplateFeaturePanelProps {
    slug: string;
    linkData: LinkWithRelations;
    isDark: boolean;
}

type FeatureValues = Record<string, string>;

interface FeatureField {
    key: string;
    label: string;
    type?: "text" | "textarea" | "date" | "number" | "select";
    placeholder?: string;
    maxLength?: number;
    min?: number;
    options?: { label: string; value: string }[];
}

interface TemplateFeatureSpec {
    eyebrow: string;
    title: string;
    description: string;
    primaryAction: string;
    fields: FeatureField[];
    cards: { icon: typeof Sparkles; title: string; text: string }[];
    checklist: string[];
}

const FEATURE_SPECS: Record<LinkType, TemplateFeatureSpec> = {
    LOVE: {
        eyebrow: "Love Story Control",
        title: "Cảm xúc mở đầu",
        description: "Tinh chỉnh những chi tiết tạo cảm giác riêng tư nhất cho trang tình yêu cổ điển.",
        primaryAction: "Lưu điểm nhấn tình yêu",
        fields: [
            { key: "title", label: "Tên câu chuyện", placeholder: "Câu chuyện của chúng mình", maxLength: 100 },
            { key: "short_note", label: "Lời nhắn đầu trang", type: "textarea", placeholder: "Một câu thật riêng cho người ấy...", maxLength: 200 },
            { key: "anniversary_date", label: "Ngày kỷ niệm chính", type: "date" },
        ],
        cards: [
            { icon: Heart, title: "Hero cảm xúc", text: "Ưu tiên lời nhắn ngắn, tên hai người và ngày kỷ niệm." },
            { icon: CalendarDays, title: "Timeline yêu", text: "Các mốc nên là lần gặp, tỏ tình, chuyến đi và kỷ niệm." },
        ],
        checklist: ["Có ảnh đại diện của cả hai", "Có ít nhất 4 mốc timeline", "Có thư hoặc lời nhắn dài", "Nhạc nền nhẹ, không lấn nội dung"],
    },
    LOVE2: {
        eyebrow: "Scrapbook Studio",
        title: "Bàn dựng album thủ công",
        description: "Thiết lập cảm giác polaroid, sticky note và chất scrapbook cho template Love2.",
        primaryAction: "Lưu scrapbook",
        fields: [
            { key: "title", label: "Tên album", placeholder: "Our little scrapbook", maxLength: 100 },
            { key: "short_note", label: "Sticky note mở album", type: "textarea", placeholder: "Một mẩu giấy nhỏ cho ký ức này...", maxLength: 200 },
            { key: "anniversary_date", label: "Ngày bắt đầu album", type: "date" },
        ],
        cards: [
            { icon: Image, title: "Gallery-first", text: "Template này sống bằng ảnh đẹp, caption ngắn và bố cục như album." },
            { icon: MessageCircleHeart, title: "Note cá nhân", text: "Nên viết theo giọng tự nhiên, không quá trang trọng." },
        ],
        checklist: ["Có 8 ảnh nổi bật", "Caption ảnh ngắn như giấy note", "Timeline chỉ giữ mốc đáng nhớ", "Màu nền không làm chìm ảnh"],
    },
    EVERY: {
        eyebrow: "Memory Hub",
        title: "Không gian kỷ niệm linh hoạt",
        description: "Dùng cho gia đình, nhóm nhỏ hoặc sự kiện không thuộc chủ đề cố định.",
        primaryAction: "Lưu memory hub",
        fields: [
            { key: "group_name", label: "Tên nhóm/sự kiện", placeholder: "Gia đình, đội nhóm, sự kiện...", maxLength: 50 },
            { key: "title", label: "Tiêu đề trang", placeholder: "Our Memories", maxLength: 100 },
            { key: "short_note", label: "Mô tả ngắn", type: "textarea", placeholder: "Trang này lưu lại điều gì?", maxLength: 200 },
        ],
        cards: [
            { icon: Sparkles, title: "Cấu trúc trung tính", text: "Giữ nội dung dễ hiểu, không ép theo ngôn ngữ tình yêu hay tốt nghiệp." },
            { icon: Target, title: "Một thông điệp chính", text: "Chốt chủ đề trước để ảnh, timeline và thư không bị rời rạc." },
        ],
        checklist: ["Tiêu đề nói rõ dịp kỷ niệm", "Có mô tả ngắn", "Ảnh đại diện đúng nhóm", "Timeline đủ bối cảnh"],
    },
    IDOL: {
        eyebrow: "Backstage Control",
        title: "Fanzone sân khấu",
        description: "Biến trang thành một concert mini với idol, fan, slogan và năng lượng fandom.",
        primaryAction: "Lưu fanzone",
        fields: [
            { key: "title", label: "Tên fanpage", placeholder: "Tên idol Fan Page", maxLength: 100 },
            { key: "slogan", label: "Fanchant / slogan", type: "textarea", placeholder: "Một câu cổ vũ thật đặc trưng...", maxLength: 200 },
            { key: "debut_date", label: "Ngày debut / ngày bias", type: "date" },
        ],
        cards: [
            { icon: Music2, title: "Concert vibe", text: "Nội dung nên có comeback, sân khấu, award hoặc era đáng nhớ." },
            { icon: Star, title: "Fan identity", text: "Slogan phải ngắn, dễ nhớ và đúng tinh thần fandom." },
        ],
        checklist: ["Có ảnh idol/fan", "Timeline có comeback hoặc award", "Quiz dùng kiến thức fandom", "Bật night mode để nổi neon"],
    },
    GRAD_PERSONAL: {
        eyebrow: "Graduate Desk",
        title: "Bảng mục tiêu cá nhân",
        description: "Tập trung vào chân dung học sinh, ước mơ, trường mong muốn và định hướng sau tốt nghiệp.",
        primaryAction: "Lưu hồ sơ tốt nghiệp",
        fields: [
            { key: "slogan", label: "Quote tốt nghiệp", type: "textarea", placeholder: "Hành trình mới bắt đầu...", maxLength: 200 },
            { key: "dream_university", label: "Trường mơ ước", placeholder: "Tên trường / nơi muốn đến", maxLength: 80 },
            { key: "dream_job", label: "Nghề nghiệp mơ ước", placeholder: "Designer, engineer, doctor...", maxLength: 80 },
        ],
        cards: [
            { icon: Trophy, title: "Ước mơ là trung tâm", text: "Template này nên nói rõ người đó muốn trở thành ai." },
            { icon: Target, title: "Goals rõ ràng", text: "Mỗi mục tiêu nên có tiêu đề ngắn và trạng thái hoàn thành." },
        ],
        checklist: ["Có slogan cá nhân", "Có trường hoặc nghề mơ ước", "Có 3 mục tiêu", "Timeline thể hiện quá trình trưởng thành"],
    },
    GRAD_CLASS: {
        eyebrow: "Yearbook Board",
        title: "Bảng kỷ yếu tập thể",
        description: "Quản lý điểm nhấn của lớp: sĩ số, ban cán sự, giáo viên chủ nhiệm và khẩu hiệu chung.",
        primaryAction: "Lưu kỷ yếu lớp",
        fields: [
            { key: "members_count", label: "Sĩ số", type: "number", min: 1, placeholder: "40" },
            { key: "class_officers_monitor", label: "Lớp trưởng", placeholder: "Tên lớp trưởng", maxLength: 60 },
            { key: "class_officers_vice_monitor", label: "Lớp phó", placeholder: "Tên lớp phó", maxLength: 60 },
            { key: "homeroom_teacher_message", label: "Lời nhắn giáo viên", type: "textarea", placeholder: "Một lời chúc cho cả lớp...", maxLength: 250 },
            { key: "slogan", label: "Khẩu hiệu lớp", type: "textarea", placeholder: "Sinh ra để cùng nhau tỏa sáng", maxLength: 200 },
        ],
        cards: [
            { icon: Users, title: "Tinh thần tập thể", text: "Không chỉ là profile lớp, cần có vai trò và tiếng nói chung." },
            { icon: MessageCircleHeart, title: "Lời nhắn giáo viên", text: "Đây là chi tiết tạo cảm giác kỷ yếu chuyên nghiệp." },
        ],
        checklist: ["Có sĩ số đúng", "Có ban cán sự", "Có lời nhắn giáo viên", "Ảnh tập thể đứng đầu gallery"],
    },
    GRAD_GROUP: {
        eyebrow: "Youth Road Control",
        title: "Chuyến xe thanh xuân",
        description: "Quản lý các yếu tố riêng của nhóm bạn tốt nghiệp: sub-theme, slogan, thành viên và đích đến.",
        primaryAction: "Lưu chuyến xe",
        fields: [
            {
                key: "theme",
                label: "Sub-theme",
                type: "select",
                options: [
                    { label: "Caravan gỗ/amber", value: "caravan" },
                    { label: "Scrapbook kraft", value: "scrapbook" },
                    { label: "Station neon", value: "station" },
                ],
            },
            { key: "slogan", label: "Khẩu hiệu nhóm", type: "textarea", placeholder: "Thanh xuân rực rỡ cùng nhau", maxLength: 200 },
            { key: "graduation_year", label: "Năm tốt nghiệp", placeholder: "2026", maxLength: 4 },
        ],
        cards: [
            { icon: Users, title: "Members là lõi", text: "Trang này cần danh sách thành viên có nickname, quote và ước mơ." },
            { icon: Map, title: "Roadmap thanh xuân", text: "Goals nên là các đích đến sau tốt nghiệp, không chỉ checklist chung." },
        ],
        checklist: ["Chọn đúng sub-theme", "Có ít nhất 4 thành viên", "Có 3 đích đến", "Timeline theo chặng đi cùng nhau"],
    },
    WEDDING: {
        eyebrow: "Invitation Suite",
        title: "Thiệp cưới & lịch lễ",
        description: "Tập trung vào thông tin nghi lễ, giờ tiệc, địa điểm và câu chuyện tình yêu.",
        primaryAction: "Lưu lịch cưới",
        fields: [
            { key: "ceremony_time", label: "Giờ làm lễ", placeholder: "09:00", maxLength: 30 },
            { key: "reception_time", label: "Giờ tiệc", placeholder: "18:00", maxLength: 30 },
            { key: "love_story", label: "Câu chuyện tình yêu", type: "textarea", placeholder: "Hai người đã gặp nhau như thế nào?", maxLength: 500 },
        ],
        cards: [
            { icon: CalendarDays, title: "Thông tin chính xác", text: "Template cưới ưu tiên ngày, giờ, địa điểm trước hiệu ứng." },
            { icon: Heart, title: "Love story", text: "Câu chuyện ngắn giúp thiệp không bị giống form mời chung." },
        ],
        checklist: ["Ngày cưới đã đúng", "Có giờ lễ và giờ tiệc", "Venue rõ ràng", "Timeline mô tả nghi thức chính"],
    },
    TRAVEL: {
        eyebrow: "Travel Log",
        title: "Bản đồ hành trình",
        description: "Biên tập chuyến đi như một itinerary: điểm đến, người đồng hành và ghi chú từng chặng.",
        primaryAction: "Lưu hành trình",
        fields: [
            { key: "destination", label: "Điểm đến chính", placeholder: "Đà Lạt, Seoul, Tokyo...", maxLength: 100 },
            { key: "travelers", label: "Người đồng hành", placeholder: "Gia đình, bạn bè...", maxLength: 100 },
            { key: "short_note", label: "Ghi chú hành trình", type: "textarea", placeholder: "Điều đáng nhớ nhất của chuyến đi...", maxLength: 200 },
        ],
        cards: [
            { icon: Map, title: "Map stop", text: "Timeline nên đi theo ngày hoặc địa điểm để người xem dễ theo dõi." },
            { icon: Image, title: "Ảnh theo chặng", text: "Gallery nên gom ảnh theo địa điểm thay vì upload ngẫu nhiên." },
        ],
        checklist: ["Có điểm đến chính", "Có ngày bắt đầu/kết thúc", "Timeline theo từng chặng", "Ảnh đại diện thể hiện chuyến đi"],
    },
    FRIENDSHIP: {
        eyebrow: "Friend Hub",
        title: "Phòng chat bạn thân",
        description: "Tập trung vào vibe nhóm, motto, inside joke và những kỷ niệm tụ họp.",
        primaryAction: "Lưu friend hub",
        fields: [
            { key: "motto", label: "Motto nhóm", type: "textarea", placeholder: "Bạn bè là mãi mãi", maxLength: 120 },
            { key: "inside_joke", label: "Inside joke", type: "textarea", placeholder: "Chỉ nhóm mình mới hiểu...", maxLength: 160 },
            { key: "since_date", label: "Ngày quen nhau", type: "date" },
        ],
        cards: [
            { icon: MessageCircleHeart, title: "Ngôn ngữ nhóm", text: "Motto và inside joke là thứ làm template này khác template tốt nghiệp." },
            { icon: Users, title: "Các nhân vật", text: "Nên có thành viên, nickname và quote ngắn cho từng người." },
        ],
        checklist: ["Có tên nhóm", "Có motto hoặc inside joke", "Có ảnh vui", "Timeline là các lần tụ họp"],
    },
};

function normalizeValue(value: unknown) {
    if (typeof value === "number") return String(value);
    if (typeof value === "string") return value;
    return "";
}

function buildPayload(fields: FeatureField[], values: FeatureValues) {
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

function getReadinessTargets(linkType: LinkType) {
    switch (linkType) {
        case "LOVE2":
        case "TRAVEL":
            return { gallery: 8, timeline: 5, letters: 1 };
        case "IDOL":
            return { gallery: 6, timeline: 4, letters: 1 };
        case "GRAD_PERSONAL":
            return { gallery: 4, timeline: 4, letters: 2 };
        case "GRAD_CLASS":
        case "GRAD_GROUP":
            return { gallery: 8, timeline: 5, letters: 3 };
        case "WEDDING":
            return { gallery: 6, timeline: 3, letters: 2 };
        case "FRIENDSHIP":
            return { gallery: 6, timeline: 4, letters: 3 };
        case "EVERY":
            return { gallery: 4, timeline: 3, letters: 1 };
        case "LOVE":
        default:
            return { gallery: 5, timeline: 4, letters: 2 };
    }
}

function ReadinessMeter({ current, label, target, isDark }: { current: number; label: string; target: number; isDark: boolean }) {
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

function FieldControl({ field, value, isDark, onChange }: { field: FeatureField; value: string; isDark: boolean; onChange: (value: string) => void }) {
    const controlClass = `w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${isDark ? "border-white/10 bg-white/10 text-white placeholder:text-white/35 focus:ring-white/20" : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-slate-200"}`;

    if (field.type === "textarea") {
        return <textarea value={value} onChange={(event) => onChange(event.target.value)} maxLength={field.maxLength} rows={4} placeholder={field.placeholder} className={`${controlClass} resize-none`} />;
    }

    if (field.type === "select") {
        return (
            <select value={value} onChange={(event) => onChange(event.target.value)} className={controlClass}>
                <option value="">Chọn...</option>
                {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        );
    }

    return <input value={value} onChange={(event) => onChange(event.target.value)} type={field.type ?? "text"} min={field.min} maxLength={field.maxLength} placeholder={field.placeholder} className={controlClass} />;
}

function TemplateSpecificCards({ spec, isDark }: { spec: TemplateFeatureSpec; isDark: boolean }) {
    return (
        <div className="grid gap-3 md:grid-cols-2">
            {spec.cards.map((card) => {
                const Icon = card.icon;
                return (
                    <div key={card.title} className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                        <Icon className="h-5 w-5 text-amber-400" />
                        <h4 className="mt-3 font-black">{card.title}</h4>
                        <p className="mt-1 text-sm opacity-70">{card.text}</p>
                    </div>
                );
            })}
        </div>
    );
}

function FeatureChecklist({ items, isDark }: { items: string[]; isDark: boolean }) {
    return (
        <div className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50 text-slate-800"}`}>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] opacity-60">Checklist template</p>
            <div className="mt-4 space-y-3">
                {items.map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        <span className="opacity-80">{item}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TemplateFeatureForm({ slug, linkData, isDark, spec }: TemplateFeaturePanelProps & { spec: TemplateFeatureSpec }) {
    const initialValues = useMemo(() => {
        const profileData = (linkData.profile_data as Record<string, unknown> | null) ?? {};
        return spec.fields.reduce<FeatureValues>((values, field) => {
            values[field.key] = normalizeValue(profileData[field.key]);
            return values;
        }, {});
    }, [spec.fields, linkData.profile_data]);
    const [values, setValues] = useState<FeatureValues>(initialValues);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const readinessTargets = getReadinessTargets(linkData.type);

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setMessage(null);

        const result = await updateLinkProfile(slug, buildPayload(spec.fields, values) as ProfileData);
        setMessage(result.success ? { type: "success", text: "Đã lưu phần tính năng của template." } : { type: "error", text: result.error || "Không thể lưu tính năng template." });
        setIsSubmitting(false);
    };

    return (
        <div className="space-y-5">
            <div className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-white text-slate-900"}`}>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] opacity-60">{spec.eyebrow}</p>
                <h3 className="mt-1 flex items-center gap-2 text-xl font-black">
                    <Sparkles className="h-5 w-5 text-amber-400" />
                    {spec.title}
                </h3>
                <p className="mt-2 max-w-2xl text-sm opacity-75">{spec.description}</p>
            </div>

            <TemplateSpecificCards spec={spec} isDark={isDark} />

            <div className="grid gap-5 lg:grid-cols-[1fr_16rem]">
                <form onSubmit={onSubmit} className={`space-y-4 rounded-2xl border p-4 ${isDark ? "border-white/10 bg-black/20" : "border-slate-200 bg-white"}`}>
                    {spec.fields.map((field) => (
                        <div key={field.key}>
                            <label className={`mb-1 block text-sm font-bold ${isDark ? "text-white/85" : "text-slate-700"}`}>{field.label}</label>
                            <FieldControl field={field} value={values[field.key] ?? ""} isDark={isDark} onChange={(value) => setValues((current) => ({ ...current, [field.key]: value }))} />
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

                    <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 font-bold text-white transition hover:bg-slate-800 disabled:opacity-60">
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        {isSubmitting ? "Đang lưu..." : spec.primaryAction}
                    </button>
                </form>

                <aside className="space-y-4">
                    <FeatureChecklist items={spec.checklist} isDark={isDark} />
                    <div className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50 text-slate-800"}`}>
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] opacity-60">Độ sẵn sàng</p>
                        <div className="mt-4 space-y-3">
                            <ReadinessMeter label="Ảnh" current={linkData.galleries.length} target={readinessTargets.gallery} isDark={isDark} />
                            <ReadinessMeter label="Timeline" current={linkData.timelines.length} target={readinessTargets.timeline} isDark={isDark} />
                            <ReadinessMeter label="Lưu bút" current={linkData.letters.length} target={readinessTargets.letters} isDark={isDark} />
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

export function TemplateFeaturePanel({ slug, linkData, isDark }: TemplateFeaturePanelProps) {
    const spec = FEATURE_SPECS[linkData.type] ?? FEATURE_SPECS.LOVE;

    return <TemplateFeatureForm slug={slug} linkData={linkData} isDark={isDark} spec={spec} />;
}
