"use client";

import { useState } from "react";
import Image from "next/image";
import { Letter, LetterReply } from "@prisma/client";
import { VideoInput, VoiceRecorder, VideoPlayer } from "@/components/media";
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
    Video,
    Mic,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type LetterWithReplies = Letter & { replies: LetterReply[] };

interface LetterBoxProps {
    slug: string;
    initialLetters: LetterWithReplies[];
    theme?: "love" | "every" | "idol";
}

export function LetterBox({ slug, initialLetters, theme = "love" }: LetterBoxProps) {
    const [letters, setLetters] = useState<LetterWithReplies[]>(initialLetters);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState("");
    const [isSendingReply, setIsSendingReply] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: "letter" | "reply"; id: string; letterId?: string } | null>(null);

    // Form state
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const [newVideoUrl, setNewVideoUrl] = useState("");
    const [newAudioUrl, setNewAudioUrl] = useState("");

    const themeColors = {
        love: {
            primary: "from-rose-400 to-pink-500",
            secondary: "rose",
            bg: "bg-rose-50",
            border: "border-rose-200",
            text: "text-rose-600",
        },
        every: {
            primary: "from-blue-400 to-indigo-500",
            secondary: "blue",
            bg: "bg-blue-50",
            border: "border-blue-200",
            text: "text-blue-600",
        },
        idol: {
            primary: "from-amber-400 to-orange-500",
            secondary: "amber",
            bg: "bg-amber-50",
            border: "border-amber-200",
            text: "text-amber-600",
        },
    };

    const colors = themeColors[theme];

    async function handleCreate() {
        if (!newTitle.trim() || !newContent.trim()) return;

        setIsCreating(true);
        const result = await createLetter(slug, {
            title: newTitle.trim(),
            content: newContent.trim(),
            video_url: newVideoUrl || undefined,
            audio_url: newAudioUrl || undefined,
        });

        if (result.success && result.data) {
            setLetters([result.data, ...letters]);
            setNewTitle("");
            setNewContent("");
            setNewVideoUrl("");
            setNewAudioUrl("");
            setShowCreateForm(false);
        }
        setIsCreating(false);
    }

    async function handleReply(letterId: string) {
        if (!replyContent.trim()) return;
        if (replyContent.length > 300) return;

        setIsSendingReply(true);
        const result = await replyToLetter(letterId, replyContent.trim().slice(0, 300), slug);

        if (result.success && result.data) {
            setLetters(
                letters.map((l) =>
                    l.id === letterId
                        ? { ...l, replies: [...l.replies, result.data], is_read: true }
                        : l
                )
            );
            setReplyContent("");
            setReplyingTo(null);
        }
        setIsSendingReply(false);
    }

    async function handleDelete(letterId: string) {
        setDeletingId(letterId);
        const result = await deleteLetter(letterId, slug);

        if (result.success) {
            setLetters(letters.filter((l) => l.id !== letterId));
        }
        setDeletingId(null);
        setDeleteConfirm(null);
    }

    async function handleDeleteReply(replyId: string, letterId: string) {
        setDeletingId(replyId);
        const result = await deleteReply(replyId, slug);

        if (result.success) {
            setLetters(
                letters.map((l) =>
                    l.id === letterId
                        ? { ...l, replies: l.replies.filter((r) => r.id !== replyId) }
                        : l
                )
            );
        }
        setDeletingId(null);
        setDeleteConfirm(null);
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Mail className={`w-6 h-6 ${colors.text}`} />
                    <h2 className="text-xl font-bold text-gray-800">Thư Tình</h2>
                    <span className="text-sm text-gray-400">({letters.length})</span>
                </div>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${colors.primary} text-white font-medium shadow-md hover:shadow-lg transition-all`}
                >
                    <Plus className="w-4 h-4" />
                    Viết thư
                </button>
            </div>

            {/* Create Form Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className={`bg-gradient-to-r ${colors.primary} p-4 text-white`}>
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Viết thư tình</h3>
                                <button onClick={() => setShowCreateForm(false)}>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tiêu đề <span className="text-gray-400 text-xs">({newTitle.length}/50)</span>
                                </label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value.slice(0, 50))}
                                    placeholder="Tiêu đề bức thư..."
                                    maxLength={50}
                                    className={`w-full px-4 py-2 rounded-lg border ${colors.border} focus:ring-2 focus:ring-${colors.secondary}-300 focus:border-${colors.secondary}-400 outline-none`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nội dung <span className="text-gray-400 text-xs">({newContent.length}/1000)</span>
                                </label>
                                <textarea
                                    value={newContent}
                                    onChange={(e) => setNewContent(e.target.value.slice(0, 1000))}
                                    placeholder="Viết những lời yêu thương..."
                                    rows={6}
                                    maxLength={1000}
                                    className={`w-full px-4 py-2 rounded-lg border ${colors.border} focus:ring-2 focus:ring-${colors.secondary}-300 focus:border-${colors.secondary}-400 outline-none resize-none`}
                                />
                            </div>

                            {/* Video URL */}
                            <div>
                                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                                    <Video className="w-4 h-4" />
                                    Video (tùy chọn)
                                </label>
                                {newVideoUrl ? (
                                    <div className="space-y-2">
                                        <VideoPlayer url={newVideoUrl} className="rounded-lg" />
                                        <button
                                            onClick={() => setNewVideoUrl("")}
                                            className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                            Xóa video
                                        </button>
                                    </div>
                                ) : (
                                    <VideoInput
                                        value={newVideoUrl}
                                        onChange={setNewVideoUrl}
                                        placeholder="Dán link YouTube hoặc TikTok..."
                                    />
                                )}
                            </div>

                            {/* Voice Recording */}
                            <div>
                                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                                    <Mic className="w-4 h-4" />
                                    Ghi âm (tùy chọn)
                                </label>
                                {newAudioUrl ? (
                                    <div className="space-y-2">
                                        <audio src={newAudioUrl} controls className="w-full h-10" />
                                        <button
                                            onClick={() => setNewAudioUrl("")}
                                            className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                            Xóa ghi âm
                                        </button>
                                    </div>
                                ) : (
                                    <VoiceRecorder
                                        slug={slug}
                                        onUploadComplete={setNewAudioUrl}
                                    />
                                )}
                            </div>

                            <button
                                onClick={handleCreate}
                                disabled={isCreating || !newTitle.trim() || !newContent.trim()}
                                className={`w-full py-3 rounded-xl bg-gradient-to-r ${colors.primary} text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
                            >
                                {isCreating ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Gửi thư
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm !== null}
                title={deleteConfirm?.type === "letter" ? "Xóa thư" : "Xóa trả lời"}
                message={deleteConfirm?.type === "letter"
                    ? "Bạn có chắc muốn xóa bức thư này?"
                    : "Bạn có chắc muốn xóa câu trả lời này?"}
                confirmText="Xóa"
                cancelText="Hủy"
                variant="danger"
                isLoading={deletingId !== null}
                onConfirm={() => {
                    if (deleteConfirm?.type === "letter") {
                        handleDelete(deleteConfirm.id);
                    } else if (deleteConfirm) {
                        handleDeleteReply(deleteConfirm.id, deleteConfirm.letterId!);
                    }
                }}
                onCancel={() => setDeleteConfirm(null)}
            />

            {/* Letters List */}
            {letters.length === 0 ? (
                <div className={`text-center py-16 ${colors.bg} rounded-2xl`}>
                    <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-400">Chưa có thư nào...</p>
                    <p className="text-gray-400 text-sm">Hãy viết bức thư tình đầu tiên!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {letters.map((letter) => (
                        <div
                            key={letter.id}
                            className={`bg-white rounded-2xl shadow-md border ${colors.border} overflow-hidden transition-all`}
                        >
                            {/* Letter Header */}
                            <div
                                className={`p-4 cursor-pointer ${colors.bg} hover:bg-opacity-80 transition-colors`}
                                onClick={() =>
                                    setExpandedId(expandedId === letter.id ? null : letter.id)
                                }
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-800 break-words">{letter.title}</h3>
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2 break-words overflow-hidden">
                                            {letter.content}
                                        </p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                            <span>
                                                {new Date(letter.created_at).toLocaleDateString("vi-VN")}
                                            </span>
                                            {letter.replies.length > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <MessageCircle className="w-3 h-3" />
                                                    {letter.replies.length} trả lời
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteConfirm({ type: "letter", id: letter.id });
                                            }}
                                            disabled={deletingId === letter.id}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            {deletingId === letter.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>
                                        {expandedId === letter.id ? (
                                            <ChevronUp className="w-5 h-5 text-gray-400" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {expandedId === letter.id && (
                                <div className="p-4 border-t border-gray-100">
                                    {/* Letter Content */}
                                    <div className="prose prose-sm max-w-none mb-4 overflow-hidden">
                                        <p className="whitespace-pre-wrap break-words text-gray-700">{letter.content}</p>
                                    </div>

                                    {/* Image */}
                                    {letter.image_url && (
                                        <div className="mb-4">
                                            <Image
                                                src={letter.image_url}
                                                alt="Letter attachment"
                                                width={400}
                                                height={300}
                                                className="rounded-lg object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* Video */}
                                    {letter.video_url && (
                                        <div className="mb-4">
                                            <VideoPlayer url={letter.video_url} className="rounded-xl" />
                                        </div>
                                    )}

                                    {/* Audio */}
                                    {letter.audio_url && (
                                        <div className="mb-4">
                                            <div className={`${colors.bg} p-3 rounded-xl`}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Mic className={`w-4 h-4 ${colors.text}`} />
                                                    <span className="text-sm font-medium text-gray-700">Ghi âm đính kèm</span>
                                                </div>
                                                <audio
                                                    src={letter.audio_url}
                                                    controls
                                                    className="w-full h-10"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Replies Thread */}
                                    {letter.replies.length > 0 && (
                                        <div className="space-y-3 mb-4">
                                            <h4 className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                                <MessageCircle className="w-4 h-4" />
                                                Câu trả lời
                                            </h4>
                                            {letter.replies.map((reply) => (
                                                <div
                                                    key={reply.id}
                                                    className={`${colors.bg} rounded-xl p-3 relative group`}
                                                >
                                                    <p className="text-sm text-gray-700 pr-10 break-words overflow-hidden">{reply.content}</p>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(reply.created_at).toLocaleDateString("vi-VN", {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </span>
                                                        <button
                                                            onClick={() => setDeleteConfirm({ type: "reply", id: reply.id, letterId: letter.id })}
                                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-xs"
                                                            title="Xóa trả lời"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Reply Input */}
                                    <div className="flex flex-col gap-1">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={replyingTo === letter.id ? replyContent : ""}
                                                onChange={(e) => {
                                                    setReplyingTo(letter.id);
                                                    const value = e.target.value;
                                                    setReplyContent(value.length > 300 ? value.slice(0, 300) : value);
                                                }}
                                                onFocus={() => setReplyingTo(letter.id)}
                                                placeholder="Viết câu trả lời..."
                                                className={`flex-1 px-4 py-2 rounded-full border ${colors.border} text-sm focus:outline-none focus:ring-2 focus:ring-${colors.secondary}-300`}
                                            />
                                            <button
                                                onClick={() => handleReply(letter.id)}
                                                disabled={isSendingReply || !replyContent.trim() || replyContent.length > 300}
                                                className="p-2 rounded-full text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 hover:brightness-110"
                                                style={{ backgroundColor: 'var(--theme-accent, #ec4899)' }}
                                            >
                                                {isSendingReply ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <Send className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                        {replyingTo === letter.id && replyContent.length > 0 && (
                                            <span className={`text-xs text-right ${replyContent.length >= 280 ? 'text-red-500' : 'text-gray-400'}`}>
                                                {replyContent.length}/300
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Decorative */}
            <div className="text-center py-4">
                <Heart className={`w-6 h-6 mx-auto ${colors.text} fill-current opacity-30`} />
            </div>
        </div>
    );
}
