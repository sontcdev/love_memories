"use client";

import { useState } from "react";
import { Check, Loader2, Plus } from "lucide-react";
import { createLink } from "@/app/actions/admin-actions";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { LINK_TYPE_LABELS, getTypeIcon } from "./link-type-meta";

/**
 * Danh sách giao diện được phép tạo mới.
 *
 * Cố tình **không** dùng cả `LinkType`: `EVERY` không có template công khai
 * riêng (nó dùng lại của `LOVE`) nên chưa bao giờ là một lựa chọn khi tạo link.
 * Giữ nguyên danh sách như trước để không đổi hành vi.
 */
const CREATABLE_TYPES = [
    "LOVE",
    "LOVE2",
    "IDOL",
    "GRAD_PERSONAL",
    "GRAD_CLASS",
    "GRAD_GROUP",
    "WEDDING",
    "TRAVEL",
    "FRIENDSHIP",
] as const;

/**
 * Tạo liên kết mới.
 *
 * Sau khi tạo thành công, dialog hiển thị thông tin đăng nhập rồi **tải lại
 * trang** khi đóng — bảng nhận `initialLinks` từ server nên đây là cách chắc
 * chắn nhất để dòng mới xuất hiện đúng vị trí phân trang. Hành vi này giữ y như
 * bản trước khi tách component.
 */
export function CreateLinkDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isReloading, setIsReloading] = useState(false);
    const [credentials, setCredentials] = useState<{
        username: string;
        password: string;
        slug: string;
    } | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsCreating(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const result = await createLink(formData);

        if (result.success && result.data) {
            setCredentials({
                username: result.data.username,
                password: result.data.password,
                slug: result.data.slug,
            });
        } else {
            setError(result.error || "Không thể tạo liên kết");
        }

        setIsCreating(false);
    }

    function handleClose() {
        const wasSuccessful = credentials !== null;
        setIsOpen(false);
        setError(null);
        setCredentials(null);

        if (wasSuccessful) {
            setIsReloading(true);
            // Chờ một nhịp để trạng thái "Đang tải..." kịp hiển thị.
            setTimeout(() => {
                window.location.reload();
            }, 300);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                    <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                    Tạo Liên Kết Mới
                </Button>
            </DialogTrigger>
            <DialogContent className="border-slate-700 bg-slate-800 text-white">
                {credentials ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-green-400">
                                <Check className="h-5 w-5" aria-hidden="true" />
                                Đã Tạo Liên Kết Thành Công!
                            </DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Lưu thông tin này - sẽ không hiển thị lại.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-3 rounded-lg bg-slate-900/50 p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Tên người dùng:</span>
                                    <span className="font-mono text-white">{credentials.username}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Mã PIN:</span>
                                    <span className="font-mono text-lg tracking-wider text-white">
                                        {credentials.password}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Liên kết:</span>
                                    <span className="font-mono text-violet-400">/{credentials.slug}</span>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={handleClose}
                                variant="outline"
                                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                disabled={isReloading}
                            >
                                {isReloading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                                        Đang tải...
                                    </>
                                ) : (
                                    "Đóng"
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Tạo Liên Kết Mới</DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Tạo người dùng mới với liên kết cá nhân hóa.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
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
                                    <Label htmlFor="create-username" className="text-slate-300">
                                        Tên người dùng
                                    </Label>
                                    <Input
                                        id="create-username"
                                        name="username"
                                        placeholder="Nhập tên người dùng"
                                        required
                                        disabled={isCreating}
                                        className="border-slate-600 bg-slate-900/50 text-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="create-password" className="text-slate-300">
                                        Mã PIN (6 chữ số) - Tùy chọn
                                    </Label>
                                    <Input
                                        id="create-password"
                                        name="password"
                                        placeholder="Tự động tạo nếu để trống"
                                        maxLength={6}
                                        pattern="[0-9]{6}"
                                        disabled={isCreating}
                                        className="border-slate-600 bg-slate-900/50 text-white"
                                    />
                                    <p className="text-xs text-slate-500">
                                        Để trống để tự động tạo mã PIN 6 chữ số
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="create-type" className="text-slate-300">
                                        Loại giao diện
                                    </Label>
                                    <Select name="linkType" defaultValue="LOVE" disabled={isCreating}>
                                        <SelectTrigger
                                            id="create-type"
                                            className="border-slate-600 bg-slate-900/50 text-white"
                                        >
                                            <SelectValue placeholder="Chọn giao diện" />
                                        </SelectTrigger>
                                        <SelectContent className="border-slate-700 bg-slate-800">
                                            {CREATABLE_TYPES.map((type) => (
                                                <SelectItem
                                                    key={type}
                                                    value={type}
                                                    className="text-white focus:bg-slate-700 focus:text-white"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {getTypeIcon(type)}
                                                        {LINK_TYPE_LABELS[type]}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClose}
                                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isCreating}
                                    className="bg-gradient-to-r from-violet-600 to-purple-600"
                                >
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                                            Đang tạo...
                                        </>
                                    ) : (
                                        "Tạo liên kết"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
