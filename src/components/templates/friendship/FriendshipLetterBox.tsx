"use client";

import { useState } from "react";
import { Letter, LetterReply } from "@prisma/client";
import { VideoInput, VoiceRecorder } from "@/components/media";
import {
    createLetter,
    replyToLetter,
    deleteLetter,
    deleteReply,
} from "@/app/actions/letter-actions";
import {
    Mail,
    Plus,
    X,
    Send,
    Trash2,
    Loader2,
    ChevronDown,
    ChevronUp,
    MessageCircle,
    Lock,
    Calendar,
    Smile,
    Zap,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type LetterWithReplies = Letter & { replies: LetterReply[] };

interface FriendshipLetterBoxProps {
    slug: string;
    initialLetters: LetterWithReplies[];
    onPopupOpenChange?: (isOpen: boolean) => void;
}

export function FriendshipLetterBox({ slug, initialLetters, onPopupOpenChange }: FriendshipLetterBoxProps) {
    const [letters, setLetters] = useState<LetterWithReplies[]>(initialLetters);
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");
    const [content, setContent] = useState("");
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyName, setReplyName] = useState("");
    const [replyContent, setReplyContent] = useState("");
    const [expandedLetters, setExpandedLetters] = useState<Set<string>>(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; type: "letter" | "reply" } | null>(null);
    const [newVideoUrl, setNewVideoUrl] = useState<string>("");
    const [newAudioUrl, setNewAudioUrl] = useState<string>("");
    const [replyVideoUrl, setReplyVideoUrl] = useState<string>("");
    const [showVideoRecorder, setShowVideoRecorder] = useState(false);
    const [showReplyVideoRecorder, setShowReplyVideoRecorder] = useState(false);

    const isLocked = (letter: LetterWithReplies): boolean => {
        if (!letter.unlock_date) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const unlockDate = new Date(letter.unlock_date);
        unlockDate.setHours(0, 0, 0, 0);
        return today < unlockDate;
    };

    const toggleExpand = (letterId: string) => {
        const newExpanded = new Set(expandedLetters);
        if (newExpanded.has(letterId)) {
            newExpanded.delete(letterId);
        } else {
            newExpanded.add(letterId);
        }
        setExpandedLetters(newExpanded);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !content.trim()) return;

        setIsSubmitting(true);
        try {
            const result = await createLetter(slug, { title: name.trim(), sender: name.trim(), content: content.trim(), video_url: newVideoUrl || undefined, audio_url: newAudioUrl || undefined });
            if (result.success && result.data) {
                setLetters([{ ...result.data, replies: [] }, ...letters]);
                setName("");
                setContent("");
                setNewVideoUrl("");
                setNewAudioUrl("");
                setShowForm(false);
                setShowVideoRecorder(false);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReply = async (e: React.FormEvent, letterId: string) => {
        e.preventDefault();
        if (!replyName.trim() || !replyContent.trim()) return;

        setIsSubmitting(true);
        try {
            const result = await replyToLetter(letterId, replyContent.trim(), slug);
            if (result.success && result.data) {
                setLetters(
                    letters.map((l) =>
                        l.id === letterId
                            ? { ...l, replies: [...l.replies, result.data!] }
                            : l
                    )
                );
                setReplyName("");
                setReplyContent("");
                setReplyVideoUrl("");
                setReplyingTo(null);
                setShowReplyVideoRecorder(false);
                const newExpanded = new Set(expandedLetters);
                newExpanded.add(letterId);
                setExpandedLetters(newExpanded);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;

        if (deleteConfirm.type === "letter") {
            const result = await deleteLetter(deleteConfirm.id, slug);
            if (result.success) {
                setLetters(letters.filter((l) => l.id !== deleteConfirm.id));
            }
        } else {
            const result = await deleteReply(deleteConfirm.id, slug);
            if (result.success) {
                setLetters(
                    letters.map((l) => ({
                        ...l,
                        replies: l.replies.filter((r) => r.id !== deleteConfirm.id),
                    }))
                );
            }
        }
        setDeleteConfirm(null);
    };

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    return (
        <div className="space-y-4">
            {!showForm ? (
                <button
                    onClick={() => {
                        setShowForm(true);
                        onPopupOpenChange?.(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-400 to-pink-400 text-white font-medium hover:from-violet-500 hover:to-pink-500 transition-all shadow-lg hover:shadow-xl hover:shadow-violet-400/30 relative overflow-hidden group"
                >
                    <Plus className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Chia sẻ kỷ niệm</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </button>
            ) : (
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-violet-100 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-lg text-violet-900 flex items-center gap-2">
                            <Smile className="w-5 h-5 text-violet-500" />
                            Chia sẻ kỷ niệm
                        </h3>
                        <button
                            onClick={() => {
                                setShowForm(false);
                                onPopupOpenChange?.(false);
                            }}
                            className="p-1 rounded-lg hover:bg-violet-50 text-gray-400"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <input
                            type="text"
                            placeholder="Tên của bạn"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={50}
                            className="w-full px-4 py-2 rounded-lg border border-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white/80"
                            required
                        />
                        <textarea
                            placeholder="Kỷ niệm của bạn..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            maxLength={1000}
                            rows={4}
                            className="w-full px-4 py-2 rounded-lg border border-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white/80 resize-none"
                            required
                        />
                        <div className="flex gap-2">
                            {!showVideoRecorder ? (
                                <VideoInput
                                    value={newVideoUrl}
                                    onChange={setNewVideoUrl}
                                />
                            ) : (
                                <div className="flex-1">
                                    <VoiceRecorder
                                        slug={slug}
                                        onUploadComplete={setNewAudioUrl}
                                    />
                                </div>
                            )}
                        </div>
                        {newVideoUrl && (
                            <div className="relative rounded-lg overflow-hidden">
                                <video src={newVideoUrl} controls className="w-full max-h-48" />
                                <button
                                    type="button"
                                    onClick={() => setNewVideoUrl("")}
                                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-violet-400 to-pink-400 text-white font-medium hover:from-violet-500 hover:to-pink-500 transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Gửi
                                </>
                            )}
                        </button>
                    </form>
                </div>
            )}

            {letters.length === 0 ? (
                <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-xl border border-violet-100">
                    <Mail className="w-12 h-12 text-violet-300 mx-auto mb-3" />
                    <p className="text-gray-500">Chưa có kỷ niệm nào</p>
                    <p className="text-sm text-gray-400 mt-1">Hãy là người đầu tiên chia sẻ!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {letters.map((letter) => (
                        <div
                            key={letter.id}
                            className={`bg-white/80 backdrop-blur-sm rounded-xl border ${
                                isLocked(letter) ? "border-gray-200 opacity-75" : "border-violet-100"
                            } overflow-hidden shadow-sm`}
                        >
                            {isLocked(letter) ? (
                                <div className="p-4 text-center">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-violet-100 mb-3">
                                        <Lock className="w-6 h-6 text-violet-500" />
                                    </div>
                                    <p className="text-sm text-gray-500 mb-1">Kỷ niệm này sẽ được mở khóa vào</p>
                                    <p className="text-sm font-medium text-violet-600 flex items-center justify-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {letter.unlock_date && formatDate(letter.unlock_date)}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h4 className="font-medium text-violet-900">{letter.sender || "Ẩn danh"}</h4>
                                                <p className="text-xs text-gray-400">{formatDate(letter.created_at)}</p>
                                            </div>
                                            <button
                                                onClick={() => setDeleteConfirm({ id: letter.id, type: "letter" })}
                                                className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className="text-gray-700 text-sm whitespace-pre-wrap">{letter.content}</p>
                                        {letter.video_url && (
                                            <div className="mt-3 rounded-lg overflow-hidden">
                                                <video src={letter.video_url} controls className="w-full max-h-64" />
                                            </div>
                                        )}
                                        {letter.audio_url && (
                                            <div className="mt-3">
                                                <audio src={letter.audio_url} controls className="w-full" />
                                            </div>
                                        )}
                                    </div>

                                    {letter.replies.length > 0 && (
                                        <div className="border-t border-violet-50 bg-violet-50/30">
                                            <button
                                                onClick={() => toggleExpand(letter.id)}
                                                className="w-full flex items-center justify-between px-4 py-2 text-sm text-violet-600 hover:bg-violet-50/50 transition-colors"
                                            >
                                                <span className="flex items-center gap-1">
                                                    <MessageCircle className="w-4 h-4" />
                                                    {letter.replies.length} phản hồi
                                                </span>
                                                {expandedLetters.has(letter.id) ? (
                                                    <ChevronUp className="w-4 h-4" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4" />
                                                )}
                                            </button>
                                            {expandedLetters.has(letter.id) && (
                                                <div className="px-4 pb-3 space-y-2">
                                                    {letter.replies.map((reply) => (
                                                        <div
                                                            key={reply.id}
                                                            className="bg-white/80 rounded-lg p-3 border border-violet-100"
                                                        >
                                                            <div className="flex items-start justify-between mb-1">
                                                                <div>
                                                                    <span className="font-medium text-violet-900 text-sm">{"Phản hồi"}</span>
                                                                    <span className="text-xs text-gray-400 ml-2">{formatDate(reply.created_at)}</span>
                                                                </div>
                                                                <button
                                                                    onClick={() => setDeleteConfirm({ id: reply.id, type: "reply" })}
                                                                    className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                            <p className="text-gray-700 text-sm whitespace-pre-wrap">{reply.content}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {replyingTo === letter.id ? (
                                        <div className="border-t border-violet-100 bg-violet-50/50 p-3">
                                            <form onSubmit={(e) => handleReply(e, letter.id)} className="space-y-2">
                                                <input
                                                    type="text"
                                                    placeholder="Tên của bạn"
                                                    value={replyName}
                                                    onChange={(e) => setReplyName(e.target.value)}
                                                    maxLength={50}
                                                    className="w-full px-3 py-1.5 rounded-lg border border-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm bg-white/80"
                                                    required
                                                />
                                                <textarea
                                                    placeholder="Phản hồi của bạn..."
                                                    value={replyContent}
                                                    onChange={(e) => setReplyContent(e.target.value)}
                                                    maxLength={1000}
                                                    rows={2}
                                                    className="w-full px-3 py-1.5 rounded-lg border border-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm resize-none bg-white/80"
                                                    required
                                                />
                                                <div className="flex gap-2">
                                                    {!showReplyVideoRecorder ? (
                                                        <VideoInput
                                                            value={replyVideoUrl}
                                                            onChange={setReplyVideoUrl}
                                                        />
                                                    ) : (
                                                        <div className="flex-1">
                                                            <VoiceRecorder
                                                                slug={slug}
                                                                onUploadComplete={() => {}}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                {replyVideoUrl && (
                                                    <div className="relative rounded-lg overflow-hidden">
                                                        <video src={replyVideoUrl} controls className="w-full max-h-32" />
                                                        <button
                                                            type="button"
                                                            onClick={() => setReplyVideoUrl("")}
                                                            className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                                <div className="flex gap-2">
                                                    <button
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-violet-400 text-white text-sm font-medium hover:bg-violet-500 transition-colors disabled:opacity-50"
                                                    >
                                                        {isSubmitting ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Send className="w-3 h-3" />
                                                                Gửi
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setReplyingTo(null);
                                                            setShowReplyVideoRecorder(false);
                                                        }}
                                                        className="px-3 py-1.5 rounded-lg border border-violet-200 text-violet-600 text-sm hover:bg-violet-50 transition-colors"
                                                    >
                                                        Hủy
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setReplyingTo(letter.id)}
                                            className="w-full flex items-center justify-center gap-1 py-2 border-t border-violet-100 text-violet-600 text-sm hover:bg-violet-50/50 transition-colors"
                                        >
                                            <Zap className="w-4 h-4" />
                                            Phản hồi
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <ConfirmDialog
                isOpen={!!deleteConfirm}
                onCancel={() => setDeleteConfirm(null)}
                title="Xác nhận xóa"
                message={deleteConfirm?.type === "letter" ? "Bạn có chắc muốn xóa kỷ niệm này?" : "Bạn có chắc muốn xóa phản hồi này?"}
                confirmText="Xóa"
                cancelText="Hủy"
                onConfirm={handleDelete}
                variant="danger"
            />
        </div>
    );
}
