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
    Heart,
    ChevronDown,
    ChevronUp,
    MessageCircle,
    Lock,
    Calendar,
    Gem,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type LetterWithReplies = Letter & { replies: LetterReply[] };

interface WeddingLetterBoxProps {
    slug: string;
    initialLetters: LetterWithReplies[];
    /** Chế độ đêm, do WeddingTemplate truyền xuống (xem AGENTS.md › Night/Light Mode). */
    isDark?: boolean;
    onPopupOpenChange?: (isOpen: boolean) => void;
}

export function WeddingLetterBox({ slug, initialLetters, isDark = false, onPopupOpenChange }: WeddingLetterBoxProps) {
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

    // Bảng màu ngà–gold sang trọng, giữ đúng chất thiệp cưới ở cả hai chế độ.
    // Nền đêm #241a12 / #1a130d khớp với panelClass của WeddingTemplate.
    const cardClass = isDark
        ? "bg-[#241a12]/90 border-amber-900/50 shadow-lg shadow-black/40"
        : "bg-white/80 border-amber-100 shadow-sm";
    const emptyCardClass = isDark
        ? "bg-[#241a12]/70 border-amber-900/40"
        : "bg-white/60 border-amber-100";
    const headingClass = isDark ? "text-amber-100" : "text-amber-900";
    const bodyClass = isDark ? "text-amber-100/80" : "text-gray-700";
    const mutedClass = isDark ? "text-amber-200/55" : "text-gray-500";
    const faintClass = isDark ? "text-amber-200/40" : "text-gray-400";
    const accentClass = isDark ? "text-amber-300" : "text-amber-600";
    const gemClass = isDark ? "text-amber-300" : "text-amber-500";
    const fieldClass = isDark
        ? "bg-[#1a130d] border-amber-900/60 text-amber-50 placeholder:text-amber-200/35 focus:ring-amber-500/50"
        : "bg-white/80 border-amber-200 placeholder:text-gray-400 focus:ring-amber-300";
    const lockedBorderClass = isDark
        ? "bg-[#241a12]/70 border-amber-900/30 opacity-70 shadow-lg shadow-black/30"
        : "bg-white/80 border-gray-200 opacity-75 shadow-sm";
    const lockBadgeClass = isDark ? "bg-amber-900/40" : "bg-amber-100";
    const dividerClass = isDark ? "border-amber-900/50" : "border-amber-100";
    const replyStripClass = isDark
        ? "border-amber-900/40 bg-amber-950/25"
        : "border-amber-50 bg-amber-50/30";
    const replyFormClass = isDark
        ? "border-amber-900/50 bg-[#1f1610]"
        : "border-amber-100 bg-amber-50/50";
    const replyCardClass = isDark
        ? "bg-[#2c2016]/90 border-amber-900/45"
        : "bg-white/80 border-amber-100";
    const subtleHoverClass = isDark ? "hover:bg-amber-900/25" : "hover:bg-amber-50/50";
    const closeBtnClass = isDark
        ? "hover:bg-amber-900/30 text-amber-200/60"
        : "hover:bg-amber-50 text-gray-400";
    const ghostBtnClass = isDark
        ? "border-amber-900/60 text-amber-200 hover:bg-amber-900/30"
        : "border-amber-200 text-amber-600 hover:bg-amber-50";
    const trashBtnClass = isDark
        ? "text-amber-200/45 hover:bg-red-950/40 hover:text-red-400"
        : "text-gray-400 hover:bg-red-50 hover:text-red-500";
    const replySubmitClass = isDark
        ? "bg-amber-600 hover:bg-amber-500 text-amber-50"
        : "bg-amber-400 hover:bg-amber-500 text-white";

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
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-rose-400 text-white font-medium hover:from-amber-500 hover:to-rose-500 transition-all shadow-lg hover:shadow-xl hover:shadow-amber-400/30 relative overflow-hidden group"
                >
                    <Plus className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Gửi lời chúc</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </button>
            ) : (
                <div className={`backdrop-blur-sm rounded-xl border p-4 ${cardClass}`}>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className={`font-serif text-lg flex items-center gap-2 ${headingClass}`}>
                            <Gem className={`w-5 h-5 ${gemClass}`} />
                            Gửi lời chúc
                        </h3>
                        <button
                            onClick={() => {
                                setShowForm(false);
                                onPopupOpenChange?.(false);
                            }}
                            className={`p-1 rounded-lg transition-colors ${closeBtnClass}`}
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
                            className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 ${fieldClass}`}
                            required
                        />
                        <textarea
                            placeholder="Lời chúc của bạn..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            maxLength={1000}
                            rows={4}
                            className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 resize-none ${fieldClass}`}
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
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-rose-400 text-white font-medium hover:from-amber-500 hover:to-rose-500 transition-all disabled:opacity-50"
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
                <div className={`text-center py-12 backdrop-blur-sm rounded-xl border ${emptyCardClass}`}>
                    <Mail className={`w-12 h-12 mx-auto mb-3 ${isDark ? "text-amber-700/70" : "text-amber-300"}`} />
                    <p className={mutedClass}>Chưa có lời chúc nào</p>
                    <p className={`text-sm mt-1 ${faintClass}`}>Hãy là người đầu tiên gửi lời chúc!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {letters.map((letter) => (
                        <div
                            key={letter.id}
                            className={`backdrop-blur-sm rounded-xl border overflow-hidden ${
                                isLocked(letter) ? lockedBorderClass : cardClass
                            }`}
                        >
                            {isLocked(letter) ? (
                                <div className="p-4 text-center">
                                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${lockBadgeClass}`}>
                                        <Lock className={`w-6 h-6 ${gemClass}`} />
                                    </div>
                                    <p className={`text-sm mb-1 ${mutedClass}`}>Lời chúc này sẽ được mở khóa vào</p>
                                    <p className={`text-sm font-medium flex items-center justify-center gap-1 ${accentClass}`}>
                                        <Calendar className="w-4 h-4" />
                                        {letter.unlock_date && formatDate(letter.unlock_date)}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h4 className={`font-medium ${headingClass}`}>{letter.sender || "Ẩn danh"}</h4>
                                                <p className={`text-xs ${faintClass}`}>{formatDate(letter.created_at)}</p>
                                            </div>
                                            <button
                                                onClick={() => setDeleteConfirm({ id: letter.id, type: "letter" })}
                                                className={`p-1 rounded-lg transition-colors ${trashBtnClass}`}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className={`text-sm whitespace-pre-wrap ${bodyClass}`}>{letter.content}</p>
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
                                        <div className={`border-t ${replyStripClass}`}>
                                            <button
                                                onClick={() => toggleExpand(letter.id)}
                                                className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${accentClass} ${subtleHoverClass}`}
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
                                                            className={`rounded-lg p-3 border ${replyCardClass}`}
                                                        >
                                                            <div className="flex items-start justify-between mb-1">
                                                                <div>
                                                                    <span className={`font-medium text-sm ${headingClass}`}>{"Phản hồi"}</span>
                                                                    <span className={`text-xs ml-2 ${faintClass}`}>{formatDate(reply.created_at)}</span>
                                                                </div>
                                                                <button
                                                                    onClick={() => setDeleteConfirm({ id: reply.id, type: "reply" })}
                                                                    className={`p-1 rounded-lg transition-colors ${trashBtnClass}`}
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                            <p className={`text-sm whitespace-pre-wrap ${bodyClass}`}>{reply.content}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {replyingTo === letter.id ? (
                                        <div className={`border-t p-3 ${replyFormClass}`}>
                                            <form onSubmit={(e) => handleReply(e, letter.id)} className="space-y-2">
                                                <input
                                                    type="text"
                                                    placeholder="Tên của bạn"
                                                    value={replyName}
                                                    onChange={(e) => setReplyName(e.target.value)}
                                                    maxLength={50}
                                                    className={`w-full px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-2 text-sm ${fieldClass}`}
                                                    required
                                                />
                                                <textarea
                                                    placeholder="Phản hồi của bạn..."
                                                    value={replyContent}
                                                    onChange={(e) => setReplyContent(e.target.value)}
                                                    maxLength={1000}
                                                    rows={2}
                                                    className={`w-full px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-2 text-sm resize-none ${fieldClass}`}
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
                                                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${replySubmitClass}`}
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
                                                        className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${ghostBtnClass}`}
                                                    >
                                                        Hủy
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setReplyingTo(letter.id)}
                                            className={`w-full flex items-center justify-center gap-1 py-2 border-t text-sm transition-colors ${dividerClass} ${accentClass} ${subtleHoverClass}`}
                                        >
                                            <Heart className="w-4 h-4" />
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
                message={deleteConfirm?.type === "letter" ? "Bạn có chắc muốn xóa lời chúc này?" : "Bạn có chắc muốn xóa phản hồi này?"}
                confirmText="Xóa"
                cancelText="Hủy"
                onConfirm={handleDelete}
                variant="danger"
            />
        </div>
    );
}
