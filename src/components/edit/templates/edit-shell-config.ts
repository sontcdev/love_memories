import type { LinkType } from "@prisma/client";
import {
    Award,
    Baby,
    BookOpen,
    Compass,
    Gem,
    Heart,
    Home,
    Image as ImageIcon,
    LayoutGrid,
    Map,
    MessageCircle,
    Mic,
    PenLine,
    Radio,
    Scissors,
    Sparkles,
    Users,
    type LucideIcon,
} from "lucide-react";
import type { EditTabId } from "@/components/edit/templates/shared";

/**
 * Per-LinkType chrome for `TemplateEditShell`.
 *
 * The 10 `*EditClient.tsx` files this replaces had byte-identical JSX structure
 * and differed only in the values below, so each slot here maps 1:1 onto a class
 * or text that used to be inlined per file.
 *
 * Slots that varied with night mode or a GRAD_GROUP sub-theme take a function of
 * `EditShellContext`; everything else is a literal.
 */
export interface EditShellContext {
    isDark: boolean;
    /** `profile_data.theme` for GRAD_GROUP (`caravan` | `scrapbook` | `station`). */
    subTheme: string;
}

type Slot = string | ((ctx: EditShellContext) => string);

export interface EditShellConfig {
    tabs: EditTabId[];
    /** Enables the header's Night/Light button and night-aware chrome. */
    supportsThemeMode?: boolean;
    /** `isDark` handed to `EditFormContent` (some shells are permanently dark). */
    contentIsDark?: boolean | ((ctx: EditShellContext) => boolean);

    page: Slot;
    /** Optional fixed decorative layer rendered directly inside the page. */
    overlay?: Slot;
    card: Slot;
    grid: Slot;

    header: {
        root: Slot;
        inner: Slot;
        backLink: Slot;
        eyebrow: string;
        eyebrowClass: Slot;
        title: string;
        titleClass: Slot;
        themeButton?: Slot;
        viewLink: Slot;
    };

    aside: {
        root: Slot;
        card: Slot;
        icon: LucideIcon;
        /** Wrapper around the icon; omit to render the icon bare. */
        iconWrap?: Slot;
        iconClass: Slot;
        heading: string;
        headingClass: Slot;
        blurb: string;
        blurbClass: Slot;
        nav: Slot;
        tab: (ctx: EditShellContext & { active: boolean; index: number }) => string;
    };

    main: {
        root: Slot;
        section: Slot;
        icon: LucideIcon;
        iconClass: Slot;
        eyebrow: string;
        eyebrowClass: Slot;
        titleClass: Slot;
        descriptionClass: Slot;
    };
}

const EYEBROW = "text-[10px] font-bold uppercase tracking-[0.28em]";
const MAIN_EYEBROW = "text-[10px] font-bold uppercase tracking-[0.24em]";
const HEADER_INNER = "flex items-center justify-between gap-3";
const NAV = "grid grid-cols-2 gap-2 md:flex md:flex-col";
const NAV_GAP3 = "grid grid-cols-2 gap-2 md:flex md:flex-col md:gap-3";
const GRID_18 = "grid md:grid-cols-[18rem_1fr]";

/** Reproduces the tab class order the per-file shells used. */
const tabBase = (shape: string) => `flex items-center gap-2 ${shape} px-3 py-3 text-left transition`;

export const EDIT_SHELL_CONFIG: Record<LinkType, EditShellConfig> = {
    LOVE: {
        tabs: ["profile", "features", "timeline", "gallery", "letters", "settings"],
        page: "min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 py-6 text-rose-950",
        card: "mx-auto max-w-6xl overflow-hidden rounded-[2rem] border-2 border-rose-200 bg-white/95 shadow-[0_24px_60px_rgba(244,114,182,0.22)] backdrop-blur",
        grid: GRID_18,
        header: {
            root: "sticky top-0 z-20 border-b-2 border-rose-100 bg-white/90 backdrop-blur",
            inner: "flex items-center justify-between px-4 py-4 sm:px-6",
            backLink: "rounded-full p-2 text-rose-600 transition hover:bg-rose-50",
            eyebrow: "Love editor",
            eyebrowClass: `${EYEBROW} text-rose-400`,
            title: "Cuốn sổ tình yêu",
            titleClass: "text-xl font-bold text-rose-800",
            viewLink: "text-sm font-semibold text-rose-600 hover:text-rose-800",
        },
        aside: {
            root: "border-rose-100 bg-gradient-to-b from-rose-50 to-pink-50 p-4 md:border-r-2 md:p-6",
            card: "mb-6 rounded-[1.5rem] border border-rose-100 bg-white/75 p-4 shadow-sm",
            icon: Heart,
            iconWrap: "mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-500",
            iconClass: "h-6 w-6 fill-current",
            heading: "Nhật ký hai người",
            headingClass: "font-serif text-2xl font-bold text-rose-800",
            blurb: "Ưu tiên câu chuyện, ngày kỷ niệm và những lời nhắn riêng tư.",
            blurbClass: "mt-2 text-sm leading-relaxed text-rose-600",
            nav: NAV,
            tab: ({ active }) =>
                `${tabBase("rounded-2xl")} ${active
                    ? "bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-lg shadow-rose-200"
                    : "text-rose-700 hover:bg-white/80"
                }`,
        },
        main: {
            root: "bg-white/80 p-4 sm:p-6 md:p-8",
            section: "mb-6 rounded-[2rem] border border-rose-100 bg-gradient-to-r from-white to-rose-50/80 p-5 shadow-sm",
            icon: PenLine,
            iconClass: "h-5 w-5 text-rose-500",
            eyebrow: "Đang chỉnh",
            eyebrowClass: `${MAIN_EYEBROW} text-rose-400`,
            titleClass: "text-lg font-bold text-rose-900",
            descriptionClass: "text-sm text-rose-600",
        },
    },

    LOVE2: {
        tabs: ["gallery", "profile", "timeline", "letters", "features", "settings"],
        page: "min-h-screen bg-[#f3e2bd] bg-[radial-gradient(#d7b46a_1px,transparent_1px)] [background-size:22px_22px] py-6 text-amber-950",
        card: "mx-auto max-w-6xl rounded-2xl border-4 border-amber-300 bg-[#fff8dc] p-3 shadow-[12px_16px_0_rgba(146,64,14,0.16)]",
        grid: "mt-4 grid gap-4 md:grid-cols-[17rem_1fr]",
        header: {
            root: "rotate-[-0.4deg] rounded-xl border-2 border-dashed border-amber-300 bg-white/80 px-4 py-4",
            inner: HEADER_INNER,
            backLink: "rounded-xl border border-amber-200 bg-white p-2 text-amber-700 transition hover:bg-amber-50",
            eyebrow: "Craft desk",
            eyebrowClass: `${EYEBROW} text-amber-600`,
            title: "Bàn scrapbook",
            titleClass: "text-xl font-black text-amber-900",
            viewLink: "rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-white shadow hover:bg-amber-600",
        },
        aside: {
            root: "rounded-xl border-2 border-amber-200 bg-[#ffe9a8] p-4 shadow-[6px_8px_0_rgba(180,83,9,0.10)]",
            card: "mb-5 rotate-[1deg] rounded-lg bg-white p-4 shadow-md",
            icon: ImageIcon,
            iconWrap: "mb-3 flex h-12 w-12 items-center justify-center rounded bg-amber-100 text-amber-700",
            iconClass: "h-6 w-6",
            heading: "Xếp polaroid trước",
            headingClass: "font-bold text-amber-950",
            blurb: "Template này sống bằng ảnh, caption, giấy note và thứ tự kỷ niệm.",
            blurbClass: "mt-2 text-sm text-amber-800",
            nav: NAV,
            tab: ({ active, index }) =>
                `${tabBase("rounded-xl border-2")} ${index % 2 ? "rotate-[0.5deg]" : "rotate-[-0.5deg]"} ${active
                    ? "border-amber-500 bg-white text-amber-950 shadow-[4px_5px_0_rgba(217,119,6,0.20)]"
                    : "border-amber-200 bg-amber-50 text-amber-800 hover:bg-white"
                }`,
        },
        main: {
            root: "rounded-xl border-2 border-amber-100 bg-white p-4 shadow-inner sm:p-6 md:p-8",
            section: "mb-6 rotate-[-0.4deg] rounded-xl border-2 border-dashed border-amber-300 bg-[#fff7d6] p-5 text-amber-950",
            icon: Scissors,
            iconClass: "h-5 w-5 text-amber-600",
            eyebrow: "Sticky note",
            eyebrowClass: `${MAIN_EYEBROW} text-amber-600`,
            titleClass: "text-lg font-black",
            descriptionClass: "text-sm text-amber-700",
        },
    },

    EVERY: {
        tabs: ["profile", "features", "gallery", "timeline", "letters", "settings"],
        page: "min-h-screen bg-gradient-to-br from-teal-50 via-white to-indigo-50 py-6 text-teal-950",
        card: "mx-auto max-w-6xl overflow-hidden rounded-3xl border-2 border-teal-100 bg-white/95 shadow-[0_20px_50px_rgba(20,184,166,0.12)]",
        grid: GRID_18,
        header: {
            root: "border-b-2 border-teal-100 bg-white/90 px-4 py-4 backdrop-blur sm:px-6",
            inner: HEADER_INNER,
            backLink: "rounded-full p-2 text-teal-700 transition hover:bg-teal-50",
            eyebrow: "Memory room",
            eyebrowClass: `${EYEBROW} text-teal-500`,
            title: "Không gian kỷ niệm",
            titleClass: "text-xl font-black",
            viewLink: "rounded-full bg-gradient-to-r from-teal-500 to-indigo-500 px-4 py-2 text-sm font-bold text-white",
        },
        aside: {
            root: "border-teal-100 bg-gradient-to-b from-teal-50 to-indigo-50 p-4 md:border-r-2 md:p-6",
            card: "mb-6 rounded-2xl border border-teal-100 bg-white/80 p-4",
            icon: Sparkles,
            iconClass: "mb-3 h-10 w-10 text-teal-500",
            heading: "Linh hoạt nhưng có cấu trúc",
            headingClass: "font-black",
            blurb: "Template tổng quát cần nhãn trung tính và flow dễ hiểu cho nhiều loại câu chuyện.",
            blurbClass: "mt-2 text-sm text-teal-700",
            nav: NAV,
            tab: ({ active }) =>
                `${tabBase("rounded-xl")} ${active ? "bg-gradient-to-r from-teal-500 to-indigo-500 text-white shadow-md" : "text-teal-700 hover:bg-white"
                }`,
        },
        main: {
            root: "p-4 sm:p-6 md:p-8",
            section: "mb-6 rounded-2xl border border-teal-100 bg-gradient-to-r from-white to-teal-50/80 p-5 shadow-sm",
            icon: LayoutGrid,
            iconClass: "h-5 w-5 text-teal-500",
            eyebrow: "Đang sắp xếp",
            eyebrowClass: `${MAIN_EYEBROW} text-teal-500`,
            titleClass: "text-lg font-black",
            descriptionClass: "text-sm text-teal-700",
        },
    },

    IDOL: {
        tabs: ["profile", "features", "gallery", "timeline", "letters", "settings"],
        supportsThemeMode: true,
        contentIsDark: ({ isDark }) => isDark,
        page: ({ isDark }) =>
            `min-h-screen overflow-hidden py-6 ${isDark ? "bg-[#05030a] text-purple-100" : "bg-gradient-to-br from-purple-50 via-white to-pink-50 text-purple-950"}`,
        overlay:
            "pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(236,72,153,0.18),transparent_26%),radial-gradient(circle_at_80%_0%,rgba(34,211,238,0.14),transparent_24%)]",
        card: ({ isDark }) =>
            `relative mx-auto max-w-6xl overflow-hidden rounded-3xl border ${isDark ? "border-fuchsia-400/20 bg-slate-950/85 shadow-[0_0_60px_rgba(168,85,247,0.22)]" : "border-purple-100 bg-white/90 shadow-[0_24px_60px_rgba(168,85,247,0.16)]"}`,
        grid: GRID_18,
        header: {
            root: ({ isDark }) =>
                `border-b px-4 py-4 backdrop-blur sm:px-6 ${isDark ? "border-fuchsia-500/20 bg-slate-950/70" : "border-purple-100 bg-white/80"}`,
            inner: HEADER_INNER,
            backLink: ({ isDark }) =>
                `rounded-full p-2 transition ${isDark ? "text-cyan-300 hover:bg-white/10" : "text-purple-600 hover:bg-purple-50"}`,
            eyebrow: "Stage manager",
            eyebrowClass: "text-[10px] font-bold uppercase tracking-[0.3em] text-fuchsia-500",
            title: "Backstage fanzone",
            titleClass: "text-xl font-black tracking-wide",
            themeButton: ({ isDark }) =>
                `flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${isDark ? "bg-white/10 text-cyan-200" : "bg-purple-50 text-purple-700"}`,
            viewLink: "rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 px-4 py-2 text-sm font-bold text-white shadow-lg",
        },
        aside: {
            root: ({ isDark }) =>
                `p-4 md:border-r md:p-6 ${isDark ? "border-fuchsia-500/20 bg-black/25" : "border-purple-100 bg-purple-50/50"}`,
            card: ({ isDark }) =>
                `mb-6 rounded-2xl border p-4 ${isDark ? "border-cyan-400/20 bg-white/5" : "border-purple-100 bg-white"}`,
            icon: Mic,
            iconWrap:
                "mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-cyan-500 text-white shadow-lg",
            iconClass: "h-6 w-6",
            heading: "Điều phối sân khấu",
            headingClass: "text-lg font-black",
            blurb: "Tập trung idol profile, concert moments, fan letters và cảm giác live stage.",
            blurbClass: "mt-2 text-sm opacity-75",
            nav: NAV,
            tab: ({ active, isDark }) =>
                `${tabBase("rounded-2xl")} ${active
                    ? "bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white shadow-[0_0_24px_rgba(217,70,239,0.25)]"
                    : isDark ? "text-purple-100 hover:bg-white/10" : "text-purple-700 hover:bg-white"
                }`,
        },
        main: {
            root: "p-4 sm:p-6 md:p-8",
            section: ({ isDark }) =>
                `mb-6 rounded-2xl border p-5 ${isDark ? "border-fuchsia-400/20 bg-slate-950/45 shadow-[0_0_24px_rgba(168,85,247,0.12)]" : "border-purple-100 bg-white/85 shadow-[0_14px_34px_rgba(168,85,247,0.10)]"}`,
            icon: Radio,
            iconClass: "h-5 w-5 text-fuchsia-500",
            eyebrow: "Now editing",
            eyebrowClass: `${MAIN_EYEBROW} text-fuchsia-500`,
            titleClass: "text-lg font-black",
            descriptionClass: "text-sm opacity-70",
        },
    },

    GRAD_PERSONAL: {
        tabs: ["profile", "features", "timeline", "gallery", "letters", "settings"],
        supportsThemeMode: true,
        contentIsDark: ({ isDark }) => isDark,
        page: ({ isDark }) =>
            `min-h-screen py-6 ${isDark ? "bg-[#150f0b] text-emerald-100" : "bg-[#2d1f18] text-slate-800"}`,
        card: ({ isDark }) =>
            `mx-auto max-w-6xl overflow-hidden rounded-3xl border-4 shadow-[0_20px_50px_rgba(0,0,0,0.45)] ${isDark ? "border-[#1c1511] bg-[#24352f]" : "border-[#3e2b20] bg-[#faf6ee]"}`,
        grid: GRID_18,
        header: {
            root: ({ isDark }) =>
                `border-b px-4 py-4 sm:px-6 ${isDark ? "border-[#12241d] bg-[#0f1d19]" : "border-[#12241d] bg-[#1c352d] text-emerald-100"}`,
            inner: HEADER_INNER,
            backLink: "rounded-xl p-2 text-current transition hover:bg-black/10",
            eyebrow: "Sổ tay tốt nghiệp",
            eyebrowClass: `${EYEBROW} opacity-65`,
            title: "Bàn tốt nghiệp cá nhân",
            titleClass: "text-xl font-black",
            themeButton: "flex items-center gap-2 rounded-xl bg-black/10 px-3 py-2 text-xs font-bold text-current",
            viewLink: "rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white",
        },
        aside: {
            root: ({ isDark }) =>
                `p-4 md:border-r-2 md:p-6 ${isDark ? "border-[#10201a] bg-[#0f1d19]" : "border-[#1a3028]/20 bg-[#1c352d] text-emerald-100"}`,
            card: "mb-6 rounded-sm border border-white/10 bg-black/10 p-4 shadow-inner",
            icon: Award,
            iconClass: "mb-3 h-10 w-10 text-amber-300",
            heading: "Hồ sơ cá nhân là trung tâm",
            headingClass: "font-serif text-xl font-bold",
            blurb: "Template này cần nhấn student profile, achievement và các cột mốc trưởng thành.",
            blurbClass: "mt-2 text-sm opacity-75",
            nav: NAV_GAP3,
            tab: ({ active }) =>
                `${tabBase("rounded-sm border")} ${active ? "border-amber-300 bg-amber-300 text-emerald-950 shadow" : "border-white/10 text-current hover:bg-white/10"
                }`,
        },
        main: {
            root: ({ isDark }) =>
                `bg-[linear-gradient(rgba(36,74,60,0.05)_1px,transparent_1px)] bg-[size:100%_2.5rem] p-4 sm:p-6 md:p-8 ${isDark ? "text-emerald-100" : "text-slate-800"}`,
            section: "mb-6 rounded-sm border border-black/10 bg-white/30 p-5 shadow-inner",
            icon: BookOpen,
            iconClass: "h-5 w-5 text-amber-400",
            eyebrow: "Trang hồ sơ",
            eyebrowClass: `${MAIN_EYEBROW} opacity-60`,
            titleClass: "text-lg font-black",
            descriptionClass: "text-sm opacity-70",
        },
    },

    GRAD_CLASS: {
        tabs: ["profile", "features", "gallery", "timeline", "letters", "settings"],
        supportsThemeMode: true,
        contentIsDark: true,
        page: ({ isDark }) => `min-h-screen py-6 ${isDark ? "bg-[#1a0f0b]" : "bg-[#3e2723]"} text-slate-100`,
        card: "mx-auto max-w-6xl overflow-hidden rounded-3xl border-4 border-[#1e100b] bg-[#131f1a] shadow-[0_20px_50px_rgba(0,0,0,0.7)]",
        grid: "grid md:grid-cols-[19rem_1fr]",
        header: {
            root: "border-b border-[#0c1411] bg-[#263238] px-4 py-4 sm:px-6",
            inner: HEADER_INNER,
            backLink: "rounded-lg p-2 text-slate-200 transition hover:bg-white/10",
            eyebrow: "Phấn bảng",
            eyebrowClass: `${EYEBROW} text-lime-200/70`,
            title: "Bảng kỷ yếu lớp",
            titleClass: "font-serif text-xl font-bold",
            themeButton: "flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold",
            viewLink: "rounded-lg bg-lime-200 px-4 py-2 text-sm font-bold text-slate-900",
        },
        aside: {
            root: "bg-[#263238] p-4 md:border-r-2 md:border-[#0c1411] md:p-6",
            card: "mb-6 rounded-sm border-2 border-dashed border-lime-100/30 bg-black/10 p-4",
            icon: Users,
            iconClass: "mb-3 h-10 w-10 text-lime-200",
            heading: "Kỷ yếu là tập thể",
            headingClass: "font-serif text-xl font-bold",
            blurb: "Ảnh lớp và dòng thời gian chung phải nổi bật hơn cấu hình cá nhân.",
            blurbClass: "mt-2 text-sm text-slate-300",
            nav: NAV,
            tab: ({ active }) =>
                `${tabBase("rounded-sm border-2 border-dashed")} ${active ? "border-lime-200 bg-lime-200 text-slate-900" : "border-white/10 text-slate-200 hover:bg-white/10"
                }`,
        },
        main: {
            root: "bg-[#131f1a] bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:16px_16px] p-4 sm:p-6 md:p-8",
            section: "mb-6 rounded-sm border-2 border-dashed border-lime-100/25 bg-black/20 p-5",
            icon: BookOpen,
            iconClass: "h-5 w-5 text-lime-200",
            eyebrow: "Góc bảng lớp",
            eyebrowClass: `${MAIN_EYEBROW} text-lime-200/70`,
            titleClass: "font-serif text-lg font-bold",
            descriptionClass: "text-sm text-slate-300",
        },
    },

    GRAD_GROUP: {
        tabs: ["profile", "features", "timeline", "gallery", "letters", "settings"],
        supportsThemeMode: true,
        contentIsDark: true,
        page: ({ subTheme }) =>
            `min-h-screen py-6 ${subTheme === "station" ? "bg-[#05070a]" : subTheme === "scrapbook" ? "bg-[#1e1c18]" : "bg-[#120a05]"} text-orange-50`,
        card: ({ subTheme }) =>
            `mx-auto max-w-6xl overflow-hidden rounded-3xl border-4 shadow-[0_20px_50px_rgba(0,0,0,0.65)] ${subTheme === "station" ? "border-[#10161c] bg-[#182026]" : subTheme === "scrapbook" ? "border-[#7a0c3a] bg-[#2b2b2b]" : "border-[#3a2517] bg-[#2d1b10]"}`,
        grid: GRID_18,
        header: {
            root: ({ subTheme }) =>
                `border-b px-4 py-4 sm:px-6 ${subTheme === "station" ? "border-[#10161c] bg-[#1b252f]" : subTheme === "scrapbook" ? "border-[#1a1a1a] bg-[#880e4f]" : "border-[#1d1008] bg-[#4a3525]"}`,
            inner: HEADER_INNER,
            backLink: "rounded-xl p-2 text-current transition hover:bg-white/10",
            eyebrow: "Nhà ga ký ức",
            eyebrowClass: (ctx) => `${EYEBROW} ${gradGroupAccent(ctx)}`,
            title: "Trạm thanh xuân nhóm",
            titleClass: "text-xl font-black",
            themeButton: "flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold",
            viewLink: "rounded-xl bg-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/20",
        },
        aside: {
            root: ({ subTheme }) =>
                `p-4 md:border-r-2 md:p-6 ${subTheme === "station" ? "border-[#10161c] bg-[#1b252f]" : subTheme === "scrapbook" ? "border-[#1a1a1a] bg-[#880e4f]" : "border-[#1d1008] bg-[#4a3525]"}`,
            card: "mb-6 rounded-2xl border border-white/10 bg-black/15 p-4",
            icon: Compass,
            iconClass: (ctx) => `mb-3 h-10 w-10 ${gradGroupAccent(ctx)}`,
            heading: "Đi cùng nhau",
            headingClass: "font-black",
            blurb: "Template này cần members, goals và roadmap rõ hơn một trang tốt nghiệp thông thường.",
            blurbClass: "mt-2 text-sm opacity-75",
            nav: NAV_GAP3,
            tab: ({ active }) =>
                `${tabBase("rounded-2xl")} ${active ? "bg-white text-slate-900 shadow-lg" : "text-current hover:bg-white/10"}`,
        },
        main: {
            root: "bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:100%_2.5rem] p-4 sm:p-6 md:p-8",
            section: "mb-6 rounded-2xl border border-white/10 bg-black/15 p-5",
            icon: Map,
            iconClass: (ctx) => `h-5 w-5 ${gradGroupAccent(ctx)}`,
            eyebrow: "Roadmap nhóm",
            eyebrowClass: (ctx) => `${MAIN_EYEBROW} ${gradGroupAccent(ctx)}`,
            titleClass: "text-lg font-black",
            descriptionClass: "text-sm opacity-70",
        },
    },

    WEDDING: {
        tabs: ["profile", "features", "timeline", "gallery", "letters", "settings"],
        supportsThemeMode: true,
        contentIsDark: ({ isDark }) => isDark,
        // Night palette matches WeddingTemplate's darkBg (#14100a).
        page: ({ isDark }) =>
            `min-h-screen py-6 ${isDark ? "bg-[#14100a] text-amber-50" : "bg-gradient-to-br from-amber-50 via-white to-rose-50 text-amber-950"}`,
        card: ({ isDark }) =>
            `mx-auto max-w-6xl overflow-hidden rounded-sm border ${isDark ? "border-amber-900/50 bg-[#1c1710]/95 shadow-[0_24px_70px_rgba(0,0,0,0.5)]" : "border-amber-200 bg-white/95 shadow-[0_24px_70px_rgba(180,83,9,0.12)]"}`,
        grid: GRID_18,
        header: {
            root: ({ isDark }) =>
                `border-b px-4 py-4 backdrop-blur sm:px-6 ${isDark ? "border-amber-900/50 bg-[#1c1710]/80" : "border-amber-200 bg-white/90"}`,
            inner: HEADER_INNER,
            backLink: ({ isDark }) =>
                `rounded-full p-2 transition ${isDark ? "text-amber-300 hover:bg-white/10" : "text-amber-700 hover:bg-amber-50"}`,
            eyebrow: "Invitation suite",
            eyebrowClass: "text-[10px] font-bold uppercase tracking-[0.32em] text-amber-500",
            title: "Thiệp cưới",
            titleClass: "font-serif text-xl font-bold",
            themeButton: ({ isDark }) =>
                `flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${isDark ? "bg-white/10 text-amber-200" : "bg-amber-50 text-amber-700"}`,
            viewLink: ({ isDark }) =>
                `rounded-full border px-4 py-2 text-sm font-bold ${isDark ? "border-amber-700 text-amber-200 hover:bg-white/10" : "border-amber-300 text-amber-700 hover:bg-amber-50"}`,
        },
        aside: {
            root: ({ isDark }) =>
                `p-4 md:border-r md:p-6 ${isDark ? "border-amber-900/50 bg-black/25" : "border-amber-100 bg-gradient-to-b from-amber-50 to-rose-50"}`,
            card: ({ isDark }) =>
                `mb-6 border p-5 text-center ${isDark ? "border-amber-900/50 bg-white/5" : "border-amber-200 bg-white/80"}`,
            icon: Gem,
            iconClass: "mx-auto mb-3 h-10 w-10 text-amber-500",
            heading: "Nghi thức & lời mời",
            headingClass: "font-serif text-xl font-bold",
            blurb: "Ưu tiên cô dâu chú rể, lịch sự kiện, lời mời và album ngày cưới.",
            blurbClass: ({ isDark }) => `mt-2 text-sm ${isDark ? "text-amber-200/70" : "text-amber-700"}`,
            nav: NAV,
            tab: ({ active, isDark }) =>
                `${tabBase("rounded-sm border")} ${active
                    ? isDark ? "border-amber-600 bg-amber-500/20 text-amber-100" : "border-amber-400 bg-amber-100 text-amber-950"
                    : isDark ? "border-amber-900/40 text-amber-200/80 hover:bg-white/5" : "border-amber-100 text-amber-700 hover:bg-white"
                }`,
        },
        main: {
            root: "p-4 sm:p-6 md:p-8",
            section: ({ isDark }) =>
                `mb-6 border p-5 ${isDark ? "border-amber-900/50 bg-white/5 shadow-[0_12px_28px_rgba(0,0,0,0.35)]" : "border-amber-200 bg-white/85 shadow-[0_12px_28px_rgba(180,83,9,0.08)]"}`,
            icon: Heart,
            iconClass: "h-5 w-5 text-amber-600",
            eyebrow: "Đang soạn thiệp",
            eyebrowClass: `${MAIN_EYEBROW} text-amber-500`,
            titleClass: "font-serif text-lg font-bold",
            descriptionClass: ({ isDark }) => `text-sm ${isDark ? "text-amber-200/70" : "text-amber-700"}`,
        },
    },

    TRAVEL: {
        tabs: ["profile", "trip", "settings"],
        supportsThemeMode: true,
        contentIsDark: ({ isDark }) => isDark,
        // Night palette matches TravelTemplate's darkBg (#0a1017).
        page: ({ isDark }) =>
            `min-h-screen py-6 ${isDark ? "bg-[#0a1017] text-sky-50" : "bg-gradient-to-br from-sky-50 via-white to-emerald-50 text-sky-950"}`,
        card: ({ isDark }) =>
            `mx-auto max-w-6xl overflow-hidden rounded-[2rem] border ${isDark ? "border-sky-900/60 bg-[#101a24]/95 shadow-[0_24px_60px_rgba(0,0,0,0.5)]" : "border-sky-100 bg-white/90 shadow-[0_24px_60px_rgba(14,165,233,0.14)]"}`,
        grid: GRID_18,
        header: {
            root: ({ isDark }) =>
                `border-b px-4 py-4 backdrop-blur sm:px-6 ${isDark ? "border-sky-900/60 bg-[#101a24]/80" : "border-sky-100 bg-white/85"}`,
            inner: HEADER_INNER,
            backLink: ({ isDark }) =>
                `rounded-full p-2 transition ${isDark ? "text-sky-300 hover:bg-white/10" : "text-sky-600 hover:bg-sky-50"}`,
            eyebrow: "Travel log",
            eyebrowClass: `${EYEBROW} text-sky-500`,
            title: "Bản đồ hành trình",
            titleClass: "text-xl font-black",
            themeButton: ({ isDark }) =>
                `flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${isDark ? "bg-white/10 text-sky-200" : "bg-sky-50 text-sky-700"}`,
            viewLink: "rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 px-4 py-2 text-sm font-bold text-white",
        },
        aside: {
            root: ({ isDark }) =>
                `p-4 md:border-r md:p-6 ${isDark ? "border-sky-900/60 bg-black/25" : "border-sky-100 bg-sky-50/50"}`,
            card: ({ isDark }) =>
                `mb-6 rounded-2xl border p-4 ${isDark ? "border-sky-900/60 bg-white/5" : "border-sky-100 bg-white"}`,
            icon: Compass,
            iconClass: "mb-3 h-10 w-10 text-sky-500",
            heading: "Điểm đến trước, hồ sơ sau",
            headingClass: "font-black",
            blurb: "Template du lịch cần timeline/chặng đi và ảnh hành trình nổi bật nhất.",
            blurbClass: ({ isDark }) => `mt-2 text-sm ${isDark ? "text-sky-200/70" : "text-sky-700"}`,
            nav: NAV_GAP3,
            tab: ({ active, isDark }) =>
                `${tabBase("rounded-2xl")} ${active
                    ? "bg-gradient-to-r from-sky-500 to-emerald-500 text-white shadow-md"
                    : isDark ? "text-sky-200/80 hover:bg-white/5" : "text-sky-700 hover:bg-white"
                }`,
        },
        main: {
            root: "bg-[linear-gradient(to_right,rgba(14,165,233,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(14,165,233,0.04)_1px,transparent_1px)] bg-[size:48px_48px] p-4 sm:p-6 md:p-8",
            section: ({ isDark }) =>
                `mb-6 rounded-2xl border p-5 shadow-sm ${isDark ? "border-sky-900/60 bg-white/5" : "border-sky-100 bg-gradient-to-r from-white/90 to-emerald-50/80"}`,
            icon: Map,
            iconClass: "h-5 w-5 text-emerald-500",
            eyebrow: "Đang đánh dấu",
            eyebrowClass: `${MAIN_EYEBROW} text-sky-500`,
            titleClass: "text-lg font-black",
            descriptionClass: ({ isDark }) => `text-sm ${isDark ? "text-sky-200/70" : "text-sky-700"}`,
        },
    },

    FRIENDSHIP: {
        tabs: ["profile", "features", "gallery", "timeline", "letters", "settings"],
        supportsThemeMode: true,
        contentIsDark: ({ isDark }) => isDark,
        // Night palette matches FriendshipTemplate's darkBg (#140f1c).
        page: ({ isDark }) =>
            `min-h-screen py-6 ${isDark ? "bg-[#140f1c] text-violet-50" : "bg-gradient-to-tr from-violet-50 via-pink-50 to-sky-50 text-violet-950"}`,
        card: ({ isDark }) =>
            `mx-auto max-w-6xl overflow-hidden rounded-[2rem] border ${isDark ? "border-violet-900/60 bg-[#1d1628]/95 shadow-[0_24px_60px_rgba(0,0,0,0.5)]" : "border-violet-100 bg-white/90 shadow-[0_24px_60px_rgba(147,51,234,0.14)]"}`,
        grid: GRID_18,
        header: {
            root: ({ isDark }) =>
                `border-b px-4 py-4 backdrop-blur sm:px-6 ${isDark ? "border-violet-900/60 bg-[#1d1628]/80" : "border-violet-100 bg-white/85"}`,
            inner: HEADER_INNER,
            backLink: ({ isDark }) =>
                `rounded-full p-2 transition ${isDark ? "text-violet-300 hover:bg-white/10" : "text-violet-600 hover:bg-violet-50"}`,
            eyebrow: "Friend hub",
            eyebrowClass: `${EYEBROW} text-pink-500`,
            title: "Phòng chat bạn thân",
            titleClass: "text-xl font-black",
            themeButton: ({ isDark }) =>
                `flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${isDark ? "bg-white/10 text-violet-200" : "bg-violet-50 text-violet-700"}`,
            viewLink: "rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 px-4 py-2 text-sm font-bold text-white",
        },
        aside: {
            root: ({ isDark }) =>
                `p-4 md:border-r md:p-6 ${isDark ? "border-violet-900/60 bg-black/25" : "border-violet-100 bg-violet-50/50"}`,
            card: ({ isDark }) =>
                `mb-6 rounded-3xl rounded-br-sm border p-4 shadow-sm ${isDark ? "border-violet-900/60 bg-white/5" : "border-violet-100 bg-white"}`,
            icon: Users,
            iconClass: "mb-3 h-10 w-10 text-pink-500",
            heading: "Nhóm là nhân vật chính",
            headingClass: "font-black",
            blurb: "Ưu tiên identity nhóm, ảnh vui và các khoảnh khắc có tính hội thoại.",
            blurbClass: ({ isDark }) => `mt-2 text-sm ${isDark ? "text-violet-200/70" : "text-violet-700"}`,
            nav: NAV,
            tab: ({ active, isDark }) =>
                `${tabBase("rounded-2xl rounded-br-sm")} ${active
                    ? "bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow-md"
                    : isDark ? "text-violet-200/80 hover:bg-white/5" : "text-violet-700 hover:bg-white"
                }`,
        },
        main: {
            root: "p-4 sm:p-6 md:p-8",
            section: ({ isDark }) =>
                `mb-6 rounded-3xl rounded-br-sm border p-5 shadow-sm ${isDark ? "border-violet-900/60 bg-white/5" : "border-violet-100 bg-white/85"}`,
            icon: MessageCircle,
            iconClass: "h-5 w-5 text-pink-500",
            eyebrow: "Đang gửi tin",
            eyebrowClass: `${MAIN_EYEBROW} text-pink-500`,
            titleClass: "text-lg font-black",
            descriptionClass: ({ isDark }) => `text-sm ${isDark ? "text-violet-200/70" : "text-violet-700"}`,
        },
    },

    BABY: {
        tabs: ["profile", "gallery", "timeline", "letters", "settings"],
        page: "min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-white py-6 text-amber-950",
        card: "mx-auto max-w-6xl overflow-hidden rounded-[2rem] border-2 border-amber-200 bg-white/95 shadow-[0_24px_60px_rgba(217,119,6,0.16)] backdrop-blur",
        grid: GRID_18,
        header: {
            root: "sticky top-0 z-20 border-b-2 border-amber-100 bg-white/90 backdrop-blur",
            inner: HEADER_INNER,
            backLink: "rounded-full p-2 text-amber-600 transition hover:bg-amber-50",
            eyebrow: "Baby diary",
            eyebrowClass: `${EYEBROW} text-amber-500`,
            title: "Nhật ký em bé",
            titleClass: "text-xl font-bold text-amber-800",
            viewLink: "text-sm font-semibold text-amber-600 hover:text-amber-800",
        },
        aside: {
            root: "border-amber-100 bg-gradient-to-b from-amber-50 to-orange-50 p-4 md:border-r-2 md:p-6",
            card: "mb-6 rounded-[1.5rem] border border-amber-100 bg-white/75 p-4 shadow-sm",
            icon: Baby,
            iconWrap: "mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600",
            iconClass: "h-6 w-6",
            heading: "Hành trình đầu đời",
            headingClass: "font-serif text-2xl font-bold text-amber-800",
            blurb: "Ưu tiên hồ sơ bé, hành trình 12 tháng và những khoảnh khắc đầu đời.",
            blurbClass: "mt-2 text-sm leading-relaxed text-amber-600",
            nav: NAV,
            tab: ({ active }) =>
                `${tabBase("rounded-2xl")} ${active
                    ? "bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-lg shadow-amber-200"
                    : "text-amber-700 hover:bg-white/80"
                }`,
        },
        main: {
            root: "bg-white/80 p-4 sm:p-6 md:p-8",
            section: "mb-6 rounded-[2rem] border border-amber-100 bg-gradient-to-r from-white to-amber-50/80 p-5 shadow-sm",
            icon: BookOpen,
            iconClass: "h-5 w-5 text-amber-500",
            eyebrow: "Đang chỉnh",
            eyebrowClass: `${MAIN_EYEBROW} text-amber-500`,
            titleClass: "text-lg font-bold text-amber-900",
            descriptionClass: "text-sm text-amber-600",
        },
    },

    FAMILY: {
        tabs: ["profile", "features", "gallery", "timeline", "letters", "settings"],
        page: "min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white py-6 text-orange-950",
        card: "mx-auto max-w-6xl overflow-hidden rounded-[2rem] border-2 border-orange-200 bg-white/95 shadow-[0_24px_60px_rgba(234,88,12,0.16)] backdrop-blur",
        grid: GRID_18,
        header: {
            root: "sticky top-0 z-20 border-b-2 border-orange-100 bg-white/90 backdrop-blur",
            inner: HEADER_INNER,
            backLink: "rounded-full p-2 text-orange-600 transition hover:bg-orange-50",
            eyebrow: "Family desk",
            eyebrowClass: `${EYEBROW} text-orange-500`,
            title: "Hồ sơ gia đình",
            titleClass: "text-xl font-bold text-orange-800",
            viewLink: "text-sm font-semibold text-orange-600 hover:text-orange-800",
        },
        aside: {
            root: "border-orange-100 bg-gradient-to-b from-orange-50 to-amber-50 p-4 md:border-r-2 md:p-6",
            card: "mb-6 rounded-[1.5rem] border border-orange-100 bg-white/75 p-4 shadow-sm",
            icon: Home,
            iconWrap: "mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600",
            iconClass: "h-6 w-6",
            heading: "Tổ ấm là trung tâm",
            headingClass: "font-serif text-2xl font-bold text-orange-800",
            blurb: "Ưu tiên hồ sơ gia đình, thành viên, ước mơ chung và những kỷ niệm đáng nhớ.",
            blurbClass: "mt-2 text-sm leading-relaxed text-orange-600",
            nav: NAV,
            tab: ({ active }) =>
                `${tabBase("rounded-2xl")} ${active
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200"
                    : "text-orange-700 hover:bg-white/80"
                }`,
        },
        main: {
            root: "bg-white/80 p-4 sm:p-6 md:p-8",
            section: "mb-6 rounded-[2rem] border border-orange-100 bg-gradient-to-r from-white to-orange-50/80 p-5 shadow-sm",
            icon: Users,
            iconClass: "h-5 w-5 text-orange-500",
            eyebrow: "Đang chỉnh",
            eyebrowClass: `${MAIN_EYEBROW} text-orange-500`,
            titleClass: "text-lg font-bold text-orange-900",
            descriptionClass: "text-sm text-orange-600",
        },
    },
};

function gradGroupAccent({ subTheme }: EditShellContext): string {
    if (subTheme === "station") return "text-cyan-300";
    if (subTheme === "scrapbook") return "text-pink-200";
    return "text-orange-200";
}

/** Resolves a `Slot` (literal or context function) to a class string. */
export function resolveSlot(slot: Slot | undefined, ctx: EditShellContext): string {
    if (slot === undefined) return "";
    return typeof slot === "function" ? slot(ctx) : slot;
}
