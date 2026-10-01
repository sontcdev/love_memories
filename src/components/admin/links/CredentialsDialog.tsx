"use client";

import { useState } from "react";
import { Check, Copy, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { copyText } from "./clipboard";

export interface NewLinkCredentials {
    slug: string;
    username: string;
    pin: string;
}

export interface CredentialsDialogProps {
    credentials: NewLinkCredentials | null;
    title: string;
    description: string;
    /** Ghi chú thêm, ví dụ "bản nhân bản bắt đầu ở trạng thái nháp". */
    note?: string;
    onClose: () => void;
}

/**
 * Hiển thị slug + tên người dùng + PIN của liên kết vừa được tạo
 * (nhân bản hoặc nhập từ JSON).
 *
 * PIN chỉ tồn tại ở dạng rõ **một lần duy nhất** — server chỉ lưu bcrypt hash —
 * nên dialog này cảnh báo rõ và cho sao chép từng trường cũng như cả khối, để
 * admin không phải chép tay rồi sai một chữ số.
 */
export function CredentialsDialog({
    credentials,
    title,
    description,
    note,
    onClose,
}: CredentialsDialogProps) {
    const open = credentials !== null;

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const fullUrl = credentials ? `${origin}/${credentials.slug}` : "";
    const handoverText = credentials
        ? [
            `Liên kết: ${fullUrl}`,
            `Tên người dùng: ${credentials.username}`,
            `Mã PIN: ${credentials.pin}`,
        ].join("\n")
        : "";

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="border-slate-700 bg-slate-800 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-emerald-400">
                        <Check className="h-5 w-5" aria-hidden="true" />
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">{description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
                        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        <p>
                            Mã PIN chỉ hiển thị <strong>một lần duy nhất</strong>. Hãy sao chép và gửi cho khách
                            trước khi đóng — sau đó chỉ có thể đặt lại PIN mới, không xem lại được PIN này.
                        </p>
                    </div>

                    {note && <p className="text-sm text-slate-400">{note}</p>}

                    <div className="space-y-2 rounded-lg bg-slate-900/50 p-3">
                        <CredentialRow label="Liên kết" value={`/${credentials?.slug ?? ""}`} copyValue={fullUrl} />
                        <CredentialRow label="Tên người dùng" value={credentials?.username ?? ""} />
                        <CredentialRow label="Mã PIN" value={credentials?.pin ?? ""} highlight />
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <CopyAllButton text={handoverText} />
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                        Tôi đã lưu, đóng lại
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function CredentialRow({
    label,
    value,
    copyValue,
    highlight = false,
}: {
    label: string;
    value: string;
    copyValue?: string;
    highlight?: boolean;
}) {
    const toast = useToast();
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        const ok = await copyText(copyValue ?? value);
        if (ok) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } else {
            toast.error("Không thể sao chép", "Vui lòng chọn và sao chép thủ công.");
        }
    }

    return (
        <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-slate-400">{label}:</span>
            <span className="flex min-w-0 items-center gap-2">
                <code
                    className={cn(
                        "truncate font-mono",
                        highlight ? "text-lg tracking-widest text-amber-300" : "text-white"
                    )}
                >
                    {value}
                </code>
                <button
                    type="button"
                    onClick={handleCopy}
                    aria-label={`Sao chép ${label.toLowerCase()}`}
                    className="shrink-0 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
                >
                    {copied ? (
                        <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                    ) : (
                        <Copy className="h-4 w-4" aria-hidden="true" />
                    )}
                </button>
            </span>
        </div>
    );
}

function CopyAllButton({ text }: { text: string }) {
    const toast = useToast();
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        const ok = await copyText(text);
        if (ok) {
            setCopied(true);
            toast.success("Đã sao chép thông tin bàn giao");
            setTimeout(() => setCopied(false), 2000);
        } else {
            toast.error("Không thể sao chép", "Vui lòng chọn và sao chép thủ công.");
        }
    }

    return (
        <Button
            type="button"
            onClick={handleCopy}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
        >
            {copied ? (
                <Check className="mr-2 h-4 w-4" aria-hidden="true" />
            ) : (
                <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            Sao chép cả 3 dòng
        </Button>
    );
}
