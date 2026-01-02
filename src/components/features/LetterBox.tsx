"use client";

import { useState } from "react";
import Image from "next/image";
import { Letter, LetterReply } from "@prisma/client";
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
} from "lucide-react";

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

    // Form state
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");

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
        });

        if (result.success && result.data) {
            setLetters([result.data, ...letters]);
            setNewTitle("");
            setNewContent("");
            setShowCreateForm(false);
        }
        setIsCreating(false);
    }

    async function handleReply(letterId: string) {
        if (!replyContent.trim()) return;

        setIsSendingReply(true);
        const result = await replyToLetter(letterId, replyContent.trim(), slug);

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
        if (!confirm("Delete this letter?")) return;

        setDeletingId(letterId);
        const result = await deleteLetter(letterId, slug);

        if (result.success) {
            setLetters(letters.filter((l) => l.id !== letterId));
        }
        setDeletingId(null);
    }

    async function handleDeleteReply(replyId: string, letterId: string) {
        if (!confirm("Delete this reply?")) return;

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
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Mail className={`w-6 h-6 ${colors.text}`} />
                    <h2 className="text-xl font-bold text-gray-800">Love Letters</h2>
                    <span className="text-sm text-gray-400">({letters.length})</span>
                </div>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${colors.primary} text-white font-medium shadow-md hover:shadow-lg transition-all`}
                >
                    <Plus className="w-4 h-4" />
                    Write Letter
                </button>
            </div>

            {/* Create Form Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className={`bg-gradient-to-r ${colors.primary} p-4 text-white`}>
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Write a Love Letter</h3>
                                <button onClick={() => setShowCreateForm(false)}>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="Subject of your letter..."
                                    className={`w-full px-4 py-2 rounded-lg border ${colors.border} focus:ring-2 focus:ring-${colors.secondary}-300 focus:border-${colors.secondary}-400 outline-none`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Content
                                </label>
                                <textarea
                                    value={newContent}
                                    onChange={(e) => setNewContent(e.target.value)}
                                    placeholder="Write your heartfelt message..."
                                    rows={6}
                                    className={`w-full px-4 py-2 rounded-lg border ${colors.border} focus:ring-2 focus:ring-${colors.secondary}-300 focus:border-${colors.secondary}-400 outline-none resize-none`}
                                />
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
                                        Send Letter
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Letters List */}
            {letters.length === 0 ? (
                <div className={`text-center py-16 ${colors.bg} rounded-2xl`}>
                    <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-400">No letters yet...</p>
                    <p className="text-gray-400 text-sm">Write your first love letter!</p>
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
                                        <div className="flex items-center gap-2">
                                            {!letter.is_read && (
                                                <span className={`w-2 h-2 rounded-full bg-${colors.secondary}-500`} />
                                            )}
                                            <h3 className="font-semibold text-gray-800">{letter.title}</h3>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                            {letter.content}
                                        </p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                            <span>
                                                {new Date(letter.created_at).toLocaleDateString("vi-VN")}
                                            </span>
                                            {letter.replies.length > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <MessageCircle className="w-3 h-3" />
                                                    {letter.replies.length} replies
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(letter.id);
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
                                    <div className="prose prose-sm max-w-none mb-4">
                                        <p className="whitespace-pre-wrap text-gray-700">{letter.content}</p>
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

                                    {/* Replies Thread */}
                                    {letter.replies.length > 0 && (
                                        <div className="space-y-3 mb-4">
                                            <h4 className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                                <MessageCircle className="w-4 h-4" />
                                                Replies
                                            </h4>
                                            {letter.replies.map((reply) => (
                                                <div
                                                    key={reply.id}
                                                    className={`${colors.bg} rounded-xl p-3 relative group`}
                                                >
                                                    <p className="text-sm text-gray-700">{reply.content}</p>
                                                    <span className="text-xs text-gray-400 mt-1 block">
                                                        {new Date(reply.created_at).toLocaleDateString("vi-VN", {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </span>
                                                    <button
                                                        onClick={() => handleDeleteReply(reply.id, letter.id)}
                                                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Reply Input */}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={replyingTo === letter.id ? replyContent : ""}
                                            onChange={(e) => {
                                                setReplyingTo(letter.id);
                                                setReplyContent(e.target.value);
                                            }}
                                            onFocus={() => setReplyingTo(letter.id)}
                                            placeholder="Write a reply..."
                                            className={`flex-1 px-4 py-2 rounded-full border ${colors.border} text-sm focus:outline-none focus:ring-2 focus:ring-${colors.secondary}-300`}
                                        />
                                        <button
                                            onClick={() => handleReply(letter.id)}
                                            disabled={isSendingReply || !replyContent.trim()}
                                            className={`p-2 rounded-full bg-gradient-to-r ${colors.primary} text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50`}
                                        >
                                            {isSendingReply ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Send className="w-5 h-5" />
                                            )}
                                        </button>
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
