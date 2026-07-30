"use client";

import { useRef, useState } from "react";
import { FileJson, Loader2, Upload } from "lucide-react";
import { importLink } from "@/app/actions/link-management-actions";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import type { NewLinkCredentials } from "./CredentialsDialog";

export interface ImportLinkDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Gọi khi nhập xong — thông tin đăng nhập được bàn giao cho component cha. */
    onImported: (credentials: NewLinkCredentials) => void;
}

/**
 * Nhập một liên kết từ JSON do `exportLink()` xuất ra.
 *
 * Nhận cả hai đường vào: dán trực tiếp hoặc chọn tệp. Tệp được đọc ở client
 * bằng `File.text()` rồi gửi kèm như một chuỗi, nên server action vẫn chỉ nhận
 * `string` — không cần `multipart/form-data` và không vướng hạn mức 10 MB của
 * FormData.
 */
export function ImportLinkDialog({ open, onOpenChange, onImported }: ImportLinkDialogProps) {
    const toast = useToast();
    const fileRef = useRef<HTMLInputElement>(null);
    const [raw, setRaw] = useState("");
    const [username, setUsername] = useState("");
    const [fileName, setFileName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isImporting, setIsImporting] = useState(false);

    function reset() {
        setRaw("");
        setUsername("");
        setFileName(null);
        setError(null);
        if (fileRef.current) fileRef.current.value = "";
    }

    function handleClose() {
        reset();
        onOpenChange(false);
    }

    async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            setRaw(text);
            setFileName(file.name);
            setError(null);
        } catch (readError) {
            console.error("Không đọc được tệp JSON", readError);
            setError("Không đọc được tệp. Hãy thử dán trực tiếp nội dung JSON.");
        }
    }

    async function handleImport() {
        const payload = raw.trim();
        if (!payload) {
            setError("Hãy dán nội dung JSON hoặc chọn một tệp.");
            return;
        }

        setIsImporting(true);
        setError(null);

        const result = await importLink(payload, username.trim() || undefined);

        setIsImporting(false);

        if (result.success && result.data) {
            onImported(result.data);
            toast.success("Đã nhập liên kết", `/${result.data.slug}`);
            reset();
            onOpenChange(false);
        } else {
            // Lỗi hiển thị ngay trong dialog: người dùng cần sửa JSON tại chỗ,
            // một toast bay đi sau 8 giây không đủ.
            setError(result.error || "Không thể nhập dữ liệu");
        }
    }

    return (
        <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : handleClose())}>
            <DialogContent className="border-slate-700 bg-slate-800 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5 text-sky-400" aria-hidden="true" />
                        Nhập liên kết từ JSON
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Dùng tệp JSON được xuất từ bảng này. Hệ thống sẽ tạo một người dùng mới kèm mã PIN mới, ở
                        trạng thái nháp cho tới khi được đăng.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {error && (
                        <div
                            role="alert"
                            className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400"
                        >
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="import-file" className="text-slate-300">
                            Chọn tệp JSON
                        </Label>
                        <Input
                            id="import-file"
                            ref={fileRef}
                            type="file"
                            accept="application/json,.json"
                            disabled={isImporting}
                            onChange={handleFile}
                            className="border-slate-600 bg-slate-900/50 text-white file:mr-3 file:rounded file:bg-slate-700 file:px-2 file:py-1 file:text-slate-200"
                        />
                        {fileName && (
                            <p className="flex items-center gap-1.5 text-xs text-emerald-400">
                                <FileJson className="h-3.5 w-3.5" aria-hidden="true" />
                                Đã đọc {fileName} ({raw.length.toLocaleString("vi-VN")} ký tự)
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="import-json" className="text-slate-300">
                            Hoặc dán nội dung JSON
                        </Label>
                        <Textarea
                            id="import-json"
                            value={raw}
                            disabled={isImporting}
                            onChange={(event) => {
                                setRaw(event.target.value);
                                setFileName(null);
                            }}
                            placeholder='{"version":1,"type":"LOVE", ...}'
                            className="min-h-[140px] border-slate-600 bg-slate-900/50 font-mono text-xs text-white placeholder:text-slate-600"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="import-username" className="text-slate-300">
                            Tên người dùng mới - Tùy chọn
                        </Label>
                        <Input
                            id="import-username"
                            value={username}
                            maxLength={50}
                            disabled={isImporting}
                            onChange={(event) => setUsername(event.target.value)}
                            placeholder="Để trống để tự động tạo"
                            className="border-slate-600 bg-slate-900/50 text-white placeholder:text-slate-500"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isImporting}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                        Hủy
                    </Button>
                    <Button
                        type="button"
                        onClick={handleImport}
                        disabled={isImporting || !raw.trim()}
                        className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700"
                    >
                        {isImporting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                                Đang nhập...
                            </>
                        ) : (
                            "Nhập liên kết"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
