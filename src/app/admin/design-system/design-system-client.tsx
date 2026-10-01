"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ImageIcon, Info, Moon, Plus, Sun } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton, SkeletonRow, SkeletonText } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip } from "@/components/ui/tooltip";
import { useToast, type ToastVariant } from "@/components/ui/toast";

const BUTTON_VARIANTS = ["default", "secondary", "outline", "ghost", "link", "destructive"] as const;
const BUTTON_SIZES = ["sm", "default", "lg"] as const;
const BADGE_VARIANTS = ["default", "success", "warning", "danger", "info", "violet", "outline"] as const;
const TOAST_VARIANTS: ToastVariant[] = ["success", "error", "warning", "info"];

/** Mỗi mục render trên cả nền sáng và nền tối, vì `dark:` là nơi hay bị trôi nhất. */
function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
    return (
        <section className="mb-10">
            <h2 className="mb-1 text-lg font-bold text-slate-100">{title}</h2>
            {note && <p className="mb-3 text-sm text-slate-400">{note}</p>}
            <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl bg-white p-5 text-slate-900">{children}</div>
                <div className="dark rounded-xl bg-slate-900 p-5 text-slate-100 ring-1 ring-slate-700">
                    {children}
                </div>
            </div>
        </section>
    );
}

export function DesignSystemClient() {
    const toast = useToast();
    const [pending, setPending] = useState(false);

    return (
        <div className="min-h-screen px-4 py-8 sm:px-8">
            <div className="mx-auto max-w-5xl">
                <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
                            Nội bộ · không index
                        </p>
                        <h1 className="text-2xl font-black text-white">Design system</h1>
                        <p className="mt-1 text-sm text-slate-400">
                            Mọi primitive trong <code className="text-slate-300">src/components/ui/</code> ở mọi
                            state. Cột trái là nền sáng, cột phải bọc trong <code className="text-slate-300">.dark</code>.
                        </p>
                    </div>
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-2 rounded-full border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Về admin
                    </Link>
                </header>

                <Section title="Button" note="6 variant × 3 size, kèm trạng thái disabled và icon-only.">
                    <div className="space-y-3">
                        {BUTTON_VARIANTS.map((variant) => (
                            <div key={variant} className="flex flex-wrap items-center gap-2">
                                <span className="w-20 shrink-0 text-xs font-mono opacity-60">{variant}</span>
                                {BUTTON_SIZES.map((size) => (
                                    <Button key={size} variant={variant} size={size}>
                                        {size}
                                    </Button>
                                ))}
                                <Button variant={variant} disabled>
                                    disabled
                                </Button>
                                <Button variant={variant} size="icon" aria-label="Thêm">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </Section>

                <Section title="Badge" note="Dùng cho trạng thái link (đang đăng, tạm dừng, nháp…).">
                    <div className="flex flex-wrap items-center gap-2">
                        {BADGE_VARIANTS.map((variant) => (
                            <Badge key={variant} variant={variant}>
                                {variant}
                            </Badge>
                        ))}
                        {BADGE_VARIANTS.map((variant) => (
                            <Badge key={`${variant}-sm`} variant={variant} size="sm">
                                {variant} sm
                            </Badge>
                        ))}
                    </div>
                </Section>

                <Section title="Card">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tiêu đề thẻ</CardTitle>
                            <CardDescription>Mô tả ngắn nằm dưới tiêu đề.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm opacity-80">
                                Nội dung thẻ. Dùng cho panel trong admin và trang sửa.
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button size="sm">Hành động</Button>
                        </CardFooter>
                    </Card>
                </Section>

                <Section title="Skeleton" note="Bọc container bằng role=status/aria-busy, không gắn lên từng skeleton.">
                    <div role="status" aria-busy="true" className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Skeleton circle className="h-12 w-12" />
                            <Skeleton className="h-4 w-40" />
                        </div>
                        <SkeletonText lines={3} />
                        <SkeletonRow columns={4} />
                    </div>
                </Section>

                <Section title="EmptyState" note="Luôn nói rõ đây là gì và cách tạo cái đầu tiên.">
                    <div className="space-y-4">
                        <EmptyState
                            icon={<ImageIcon className="h-5 w-5" />}
                            title="Chưa có ảnh nào"
                            description="Thêm ảnh đầu tiên để thư viện bắt đầu có nội dung."
                            action={<Button size="sm">Thêm ảnh</Button>}
                        />
                        <EmptyState compact title="Chưa có mốc thời gian" description="Bản compact, dùng trong tab." />
                    </div>
                </Section>

                <Section title="Tooltip" note="4 hướng; dùng cho trường không hiển nhiên (giới hạn ảnh, nguồn nhạc…).">
                    <div className="flex flex-wrap items-center gap-6 py-6">
                        {(["top", "right", "bottom", "left"] as const).map((side) => (
                            <Tooltip key={side} side={side} content={`Tooltip ${side}`}>
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm"
                                >
                                    <Info className="h-4 w-4" />
                                    {side}
                                </button>
                            </Tooltip>
                        ))}
                    </div>
                </Section>

                <Section title="Form control" note="Input / Textarea / Label, gồm cả disabled và invalid.">
                    <div className="space-y-3">
                        <div>
                            <Label htmlFor="ds-input">Nhãn trường</Label>
                            <Input id="ds-input" placeholder="Nhập nội dung" />
                        </div>
                        <div>
                            <Label htmlFor="ds-input-invalid">Trường lỗi</Label>
                            <Input id="ds-input-invalid" aria-invalid defaultValue="giá trị không hợp lệ" />
                        </div>
                        <div>
                            <Label htmlFor="ds-input-disabled">Trường bị vô hiệu</Label>
                            <Input id="ds-input-disabled" disabled defaultValue="disabled" />
                        </div>
                        <div>
                            <Label htmlFor="ds-textarea">Textarea</Label>
                            <Textarea id="ds-textarea" rows={3} placeholder="Nội dung dài" />
                        </div>
                    </div>
                </Section>

                <Section title="Toast" note="Cơ chế phản hồi duy nhất của app. Bấm để phát thử.">
                    <div className="flex flex-wrap gap-2">
                        {TOAST_VARIANTS.map((variant) => (
                            <Button
                                key={variant}
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                    toast.show({
                                        variant,
                                        title: `Toast ${variant}`,
                                        description: "Ví dụ mô tả kèm theo.",
                                    })
                                }
                            >
                                {variant}
                            </Button>
                        ))}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toast.show({ variant: "info", title: "Không tự tắt", duration: 0 })}
                        >
                            duration 0
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => toast.dismissAll()}>
                            Đóng tất cả
                        </Button>
                    </div>
                </Section>

                <Section title="Trạng thái chờ" note="Ví dụ nút có pending state, dùng chung với auto-save.">
                    <Button
                        onClick={() => {
                            setPending(true);
                            setTimeout(() => setPending(false), 1200);
                        }}
                        disabled={pending}
                    >
                        {pending ? "Đang lưu…" : "Lưu"}
                    </Button>
                </Section>

                <Section title="Night / Light" note="ThemeToggleButton của template, hiển thị cả hai state.">
                    <div className="flex items-center gap-4">
                        <span className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm">
                            <Moon className="h-4 w-4" /> chế độ sáng đang bật
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm">
                            <Sun className="h-4 w-4" /> chế độ tối đang bật
                        </span>
                    </div>
                </Section>
            </div>
        </div>
    );
}
