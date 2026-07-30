"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Tag, X } from "lucide-react";
import { setTags } from "@/app/actions/link-management-actions";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/components/ui/toast";

/** Giới hạn phải khớp với phần chuẩn hoá trong `setTags()` ở server. */
const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 30;

export interface TagEditorTarget {
    id: string;
    slug: string;
    tags: string[];
}

export interface TagEditorDialogProps {
    target: TagEditorTarget | null;
    onClose: () => void;
    /** Gọi khi server đã lưu xong, kèm danh sách nhãn đã được chuẩn hoá. */
    onSaved: (linkId: string, tags: string[]) => void;
}

/**
 * Thêm/bớt nhãn cho một liên kết.
 *
 * Danh sách nhãn được sửa cục bộ rồi gửi một lần bằng `setTags()` — server nhận
 * cả mảng chứ không phải từng nhãn, nên đóng dialog mà chưa "Lưu" sẽ bỏ mọi
 * thay đổi. Trạng thái hiển thị sau khi lưu lấy từ kết quả server (đã trim,
 * bỏ trùng, cắt còn 10) để UI không hiện thứ mà DB không lưu.
 */
export function TagEditorDialog({ target, onClose, onSaved }: TagEditorDialogProps) {
    const toast = useToast();
    const [draft, setDraft] = useState<string[]>([]);
    const [input, setInput] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Nạp lại nhãn mỗi lần mở cho một liên kết khác.
    useEffect(() => {
        setDraft(target?.tags ?? []);
        setInput("");
    }, [target]);

    const isFull = draft.length >= MAX_TAGS;

    function addTag() {
        const tag = input.trim().slice(0, MAX_TAG_LENGTH);
        if (!tag) return;
        if (isFull) {
            toast.warning(`Tối đa ${MAX_TAGS} nhãn`, "Hãy xoá một nhãn trước khi thêm nhãn mới.");
            return;
        }
        if (draft.some((existing) => existing.toLowerCase() === tag.toLowerCase())) {
            toast.info("Nhãn đã tồn tại", `"${tag}" đã có trong danh sách.`);
            setInput("");
            return;
        }
        setDraft([...draft, tag]);
        setInput("");
    }

    function removeTag(tag: string) {
        setDraft(draft.filter((existing) => existing !== tag));
    }

    async function handleSave() {
        if (!target) return;

        setIsSaving(true);
        const result = await setTags(target.id, draft);
        setIsSaving(false);

        if (result.success && result.data) {
            onSaved(target.id, result.data.tags);
            toast.success(
                result.data.tags.length === 0 ? "Đã xoá toàn bộ nhãn" : "Đã lưu nhãn",
                `/${target.slug}`
            );
            onClose();
        } else {
            toast.error("Không thể lưu nhãn", result.error || "Vui lòng thử lại.");
        }
    }

    return (
        <Dialog open={target !== null} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="border-slate-700 bg-slate-800 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Tag className="h-5 w-5 text-violet-400" aria-hidden="true" />
                        Nhãn cho /{target?.slug}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Tối đa {MAX_TAGS} nhãn, mỗi nhãn {MAX_TAG_LENGTH} ký tự. Nhãn chỉ dùng cho việc quản lý
                        trong trang quản trị, khách không nhìn thấy.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="tag-input" className="text-slate-300">
                            Thêm nhãn
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="tag-input"
                                value={input}
                                maxLength={MAX_TAG_LENGTH}
                                disabled={isSaving}
                                onChange={(event) => setInput(event.target.value)}
                                onKeyDown={(event) => {
                                    // Enter/dấu phẩy thêm nhãn. `preventDefault` để Enter không
                                    // submit form cha (dialog nằm ngoài form, nhưng giữ cho chắc).
                                    if (event.key === "Enter" || event.key === ",") {
                                        event.preventDefault();
                                        addTag();
                                    }
                                }}
                                placeholder={isFull ? `Đã đủ ${MAX_TAGS} nhãn` : "Ví dụ: khách VIP, cần hỗ trợ…"}
                                className="border-slate-600 bg-slate-900/50 text-white placeholder:text-slate-500"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addTag}
                                disabled={isSaving || !input.trim()}
                                className="border-slate-600 px-3 text-slate-300 hover:bg-slate-700"
                            >
                                <Plus className="h-4 w-4" aria-hidden="true" />
                                <span className="sr-only">Thêm nhãn</span>
                            </Button>
                        </div>
                        <p className="text-xs text-slate-500">
                            Nhấn Enter hoặc dấu phẩy để thêm. Còn lại {MAX_TAGS - draft.length} nhãn.
                        </p>
                    </div>

                    <div className="min-h-[3rem] rounded-lg bg-slate-900/50 p-3">
                        {draft.length === 0 ? (
                            <p className="text-sm text-slate-500">Chưa có nhãn nào.</p>
                        ) : (
                            <ul className="flex flex-wrap gap-2">
                                {draft.map((tag) => (
                                    <li key={tag}>
                                        <Badge variant="violet" className="gap-1 pr-1">
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                disabled={isSaving}
                                                aria-label={`Xoá nhãn ${tag}`}
                                                className="rounded-full p-0.5 transition-colors hover:bg-violet-500/30"
                                            >
                                                <X className="h-3 w-3" aria-hidden="true" />
                                            </button>
                                        </Badge>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isSaving}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                        Hủy
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                                Đang lưu...
                            </>
                        ) : (
                            "Lưu nhãn"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
