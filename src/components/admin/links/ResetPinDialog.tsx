"use client";

import { useEffect, useState } from "react";
import { KeyRound, Loader2, Shuffle } from "lucide-react";
import { resetLinkPin } from "@/app/actions/admin-actions";
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

export interface ResetPinTarget {
    linkId: string;
    username: string;
}

/**
 * Đặt lại mã PIN của một liên kết.
 *
 * Hai bước: nhập PIN mới (hoặc để trống cho hệ thống tự tạo) → hiển thị PIN
 * mới một lần duy nhất. Logic giữ nguyên như bản trước khi tách component,
 * chỉ chuyển state cục bộ vào đây để `links-table.tsx` không phải mang thêm
 * 5 biến state.
 */
export function ResetPinDialog({
    target,
    onClose,
}: {
    target: ResetPinTarget | null;
    onClose: () => void;
}) {
    const [pinInput, setPinInput] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isResetting, setIsResetting] = useState(false);
    const [result, setResult] = useState<{ username: string; newPin: string } | null>(null);

    // Dọn ô nhập mỗi lần mở cho một liên kết khác.
    useEffect(() => {
        setPinInput("");
        setError(null);
    }, [target]);

    function generateRandomPin() {
        setPinInput(Math.floor(100000 + Math.random() * 900000).toString());
    }

    async function handleReset() {
        if (!target) return;

        // Chỉ kiểm tra khi admin tự nhập; để trống là hợp lệ (server tự tạo).
        if (pinInput && !/^\d{6}$/.test(pinInput)) {
            setError("Mã PIN phải có đúng 6 chữ số");
            return;
        }

        setIsResetting(true);
        setError(null);

        const response = await resetLinkPin(target.linkId, pinInput || undefined);

        setIsResetting(false);

        if (response.success && response.data) {
            setResult({ username: response.data.username, newPin: response.data.newPin });
            onClose();
        } else {
            setError(response.error || "Không thể đặt lại PIN");
        }
    }

    return (
        <>
            <Dialog open={target !== null} onOpenChange={(next) => !next && onClose()}>
                <DialogContent className="border-slate-700 bg-slate-800 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <KeyRound className="h-5 w-5 text-amber-400" aria-hidden="true" />
                            Đặt lại PIN
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Nhập mã PIN 6 chữ số mới cho{" "}
                            <span className="font-medium text-white">{target?.username}</span> hoặc tạo ngẫu nhiên.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {error && (
                            <div
                                role="alert"
                                className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400"
                            >
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="reset-pin" className="text-slate-300">
                                Mã PIN mới (6 chữ số)
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    id="reset-pin"
                                    value={pinInput}
                                    onChange={(event) =>
                                        setPinInput(event.target.value.replace(/\D/g, "").slice(0, 6))
                                    }
                                    placeholder="Để trống để tự động tạo"
                                    maxLength={6}
                                    className="border-slate-600 bg-slate-900/50 font-mono text-lg tracking-widest text-white"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={generateRandomPin}
                                    className="border-slate-600 px-3 text-slate-300 hover:bg-slate-700"
                                    title="Tạo PIN ngẫu nhiên"
                                >
                                    <Shuffle className="h-4 w-4" aria-hidden="true" />
                                    <span className="sr-only">Tạo PIN ngẫu nhiên</span>
                                </Button>
                            </div>
                            <p className="text-xs text-slate-500">
                                Để trống để tự động tạo mã PIN 6 chữ số ngẫu nhiên
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleReset}
                            disabled={isResetting}
                            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                        >
                            {isResetting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                                    Đang đặt lại...
                                </>
                            ) : (
                                "Đặt lại PIN"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={result !== null} onOpenChange={(next) => !next && setResult(null)}>
                <DialogContent className="border-slate-700 bg-slate-800 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-amber-400">
                            <KeyRound className="h-5 w-5" aria-hidden="true" />
                            Đặt Lại PIN Thành Công!
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Lưu mã PIN mới này - sẽ không hiển thị lại.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-3 rounded-lg bg-slate-900/50 p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400">Tên người dùng:</span>
                                <span className="font-mono text-white">{result?.username}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400">Mã PIN mới:</span>
                                <span className="font-mono text-xl tracking-wider text-amber-400">
                                    {result?.newPin}
                                </span>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={() => setResult(null)}
                            variant="outline"
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
