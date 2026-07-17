"use client";

import { useState, useEffect } from "react";
import { Letter, LetterReply } from "@prisma/client";
import { VideoInput, VoiceRecorder, VideoPlayer } from "@/components/media";
import {
    createLetter,
    replyToLetter,
    deleteLetter,
    deleteReply,
} from "@/app/actions/letter-actions";
import {

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
    Camera,
    StickyNote,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type LetterWithReplies = Letter & { replies: LetterReply[] };

interface Love2LetterBoxProps {
    slug: string;
    initialLetters: LetterWithReplies[];
    isDark?: boolean;
    onPopupOpenChange?: (isOpen: boolean) => void;
}

export function Love2LetterBox({ slug, initialLetters, isDark = false, onPopupOpenChange }: Love2LetterBoxProps) {
    const [letters, setLetters] = useState<LetterWithReplies[]>(initialLetters);

    const isLocked = (letter: LetterWithReplies): boolean => {
        if (!letter.unlock_date) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const unlockDate = new Date(letter.unlock_date);
        unlockDate.setHours(0, 0, 0, 0);
        return today < unlockDate;
    };
    
    const [showCreateForm, setShowCreateForm] = useState(false);
    useEffect(() => {
        onPopupOpenChange?.(showCreateForm);
    }, [showCreateForm, onPopupOpenChange]);

    const sortedLetters = [...letters].sort((a, b) => {
        const aLocked = isLocked(a);
        const bLocked = isLocked(b);

        if (!aLocked && !bLocked) {
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }

        if (aLocked && bLocked) {
            return new Date(a.unlock_date!).getTime() - new Date(b.unlock_date!).getTime();
        }

        return aLocked ? 1 : -1;
    });
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState("");
    const [isSendingReply, setIsSendingReply] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: "letter" | "reply"; id: string; letterId?: string } | null>(null);

    const [newTitle, setNewTitle] = useState("");
    const [newSender, setNewSender] = useState("");
    const [newContent, setNewContent] = useState("");
    const [newVideoUrl, setNewVideoUrl] = useState("");
    const [newAudioUrl, setNewAudioUrl] = useState("");
    const [newUnlockDate, setNewUnlockDate] = useState<string>("");

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const isLetterLocked = (letter: LetterWithReplies): boolean => {
        if (!letter.unlock_date) return false;
        const today = new Date(currentTime);
        today.setHours(0, 0, 0, 0);
        const unlockDate = new Date(letter.unlock_date);
        unlockDate.setHours(0, 0, 0, 0);
        return today < unlockDate;
    };

    const formatUnlockDate = (date: Date): string => {
        return new Date(date).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    async function handleCreate() {
        if (!newTitle.trim() || !newContent.trim()) return;

        setIsCreating(true);
        const result = await createLetter(slug, {
            title: newTitle.trim(),
            sender: newSender.trim() || undefined,
            content: newContent.trim(),
            video_url: newVideoUrl || undefined,
            audio_url: newAudioUrl || undefined,
            unlock_date: newUnlockDate ? new Date(newUnlockDate) : null,
        });

        if (result.success && result.data) {
            setLetters([result.data, ...letters]);
            setNewTitle("");
            setNewSender("");
            setNewContent("");
            setNewVideoUrl("");
            setNewAudioUrl("");
            setNewUnlockDate("");
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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className="absolute inset-0 bg-amber-400 rounded-full blur-lg opacity-40 animate-pulse"></div>
                        <div className="relative w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                            <StickyNote className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div>
                        <h2 className={`text-xl font-bold font-serif ${isDark ? "text-slate-100" : "text-amber-900"}`}>
                            Scrapbook Notes
                        </h2>
                        <span className={`text-sm ${isDark ? "text-slate-400" : "text-amber-600"}`}>({letters.length})</span>
                    </div>
                </div>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-medium shadow-md hover:shadow-xl transition-all hover:scale-105 font-serif relative overflow-hidden group"
                >
                    <Plus className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">Add Note</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </button>
            </div>

            {showCreateForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className={`${isDark ? "bg-[#1f1e1c] text-slate-100 border border-slate-800" : "bg-amber-50 text-gray-900"} rounded-lg w-full max-w-lg max-h-[90vh] shadow-2xl overflow-hidden flex flex-col border-8 border-white`} style={{
                        backgroundImage: isDark ? 'none' : 'repeating-linear-gradient(transparent, transparent 31px, #d4a374 31px, #d4a374 32px)',
                    }}>
                        <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-4 text-white flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Camera className="w-5 h-5" />
                                    <h3 className="text-lg font-semibold font-serif">Add Scrapbook Note</h3>
                                </div>
                                <button onClick={() => setShowCreateForm(false)}>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
                            <div>
                                <label className={`block text-sm font-medium ${isDark ? "text-slate-300" : "text-amber-800"} mb-1 font-serif`}>
                                    From <span className="text-gray-400 text-xs ml-1">({newSender.length}/50)</span>
                                </label>
                                <input
                                    type="text"
                                    value={newSender}
                                    onChange={(e) => setNewSender(e.target.value.slice(0, 50))}
                                    placeholder="Your name..."
                                    maxLength={50}
                                    className={`w-full px-4 py-2 rounded-lg border border-amber-200 ${isDark ? "bg-[#121110] text-white" : "bg-white/80 text-gray-900"} focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none mb-3 font-serif`}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${isDark ? "text-slate-300" : "text-amber-800"} mb-1 font-serif`}>
                                    Title <span className="text-gray-400 text-xs">({newTitle.length}/50)</span>
                                </label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value.slice(0, 50))}
                                    placeholder="Note title..."
                                    maxLength={50}
                                    className={`w-full px-4 py-2 rounded-lg border border-amber-200 ${isDark ? "bg-[#121110] text-white" : "bg-white/80 text-gray-900"} focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none font-serif`}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${isDark ? "text-slate-300" : "text-amber-800"} mb-1 font-serif`}>
                                    Content <span className="text-gray-400 text-xs">({newContent.length}/1000)</span>
                                </label>
                                <textarea
                                    value={newContent}
                                    onChange={(e) => setNewContent(e.target.value.slice(0, 1000))}
                                    placeholder="Write your memories..."
                                    maxLength={1000}
                                    rows={6}
                                    className={`w-full px-4 py-2 rounded-lg border border-amber-200 ${isDark ? "bg-[#121110] text-white" : "bg-white/80 text-gray-900"} focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none resize-none font-serif`}
                                />
                            </div>
                            <VideoInput value={newVideoUrl} onChange={setNewVideoUrl} />
                            <VoiceRecorder slug={slug} onUploadComplete={setNewAudioUrl} />
                            <div>
                                <label className={`block text-sm font-medium ${isDark ? "text-slate-300" : "text-amber-800"} mb-1 flex items-center gap-2 font-serif`}>
                                    <Calendar className="w-4 h-4" />
                                    Unlock date (optional)
                                </label>
                                <input
                                    type="date"
                                    value={newUnlockDate}
                                    onChange={(e) => setNewUnlockDate(e.target.value)}
                                    min={new Date().toISOString().split("T")[0]}
                                    className={`w-full px-4 py-2 rounded-lg border border-amber-200 ${isDark ? "bg-[#121110] text-white" : "bg-white/80 text-gray-900"} focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none font-serif`}
                                />
                            </div>
                        </div>
                        <div className={`p-4 border-t ${isDark ? "border-slate-800" : "border-amber-200"} flex justify-end gap-2 flex-shrink-0`}>
                            <button
                                onClick={() => setShowCreateForm(false)}
                                className={`px-4 py-2 rounded-lg ${isDark ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"} transition-colors font-serif`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={isCreating || !newTitle.trim() || !newContent.trim()}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-amber-500 hover:to-orange-600 transition-all font-serif"
                            >
                                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                Save Note
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {sortedLetters.map((letter, index) => {
                    const locked = isLetterLocked(letter);
                    const expanded = expandedId === letter.id;
                    const isReplying = replyingTo === letter.id;
                    const rotation = (index % 2 === 0) ? -2 : 2;

                    return (
                        <div
                            key={letter.id}
                            className={`relative group transition-all duration-300 hover:scale-[1.02]`}
                            style={{ transform: `rotate(${rotation}deg)` }}
                        >
                            <div className={`relative rounded-lg overflow-hidden transition-all duration-300 ${
                                locked 
                                    ? "bg-gradient-to-br from-gray-100 to-gray-200 opacity-70" 
                                    : isDark 
                                        ? "bg-[#1f1e1c] border border-slate-800" 
                                        : "bg-gradient-to-br from-amber-50 to-orange-50 border-8 border-white shadow-xl hover:shadow-2xl"
                            }`}>
                                {locked && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-amber-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                                            <div className="relative w-16 h-16 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full flex items-center justify-center mb-3 shadow-lg border-4 border-white">
                                                <Lock className="w-8 h-8 text-white" />
                                            </div>
                                        </div>
                                        <p className={`text-sm font-medium font-serif ${isDark ? "text-slate-400" : "text-amber-800"} mt-2`}>
                                            Opens on {formatUnlockDate(letter.unlock_date!)}
                                        </p>
                                    </div>
                                )}

                                <div className={`p-4 sm:p-6 ${locked ? "opacity-30" : ""}`}>
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-amber-400 rounded-full blur-md opacity-40"></div>
                                                    <StickyNote className="relative w-4 h-4 text-amber-600" />
                                                </div>
                                                <h3 className={`font-bold text-lg font-serif ${isDark ? "text-slate-100" : "text-amber-900"}`}>
                                                    {letter.title}
                                                </h3>
                                            </div>
                                            {letter.sender && (
                                                <p className={`text-sm ${isDark ? "text-slate-400" : "text-amber-600"} italic font-serif`}>
                                                    From: {letter.sender}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {letter.replies.length > 0 && (
                                                <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                                                    <MessageCircle className="w-3 h-3" />
                                                    {letter.replies.length}
                                                </span>
                                            )}
                                            <button
                                                onClick={() => setExpandedId(expanded ? null : letter.id)}
                                                className={`p-1.5 rounded-lg ${isDark ? "hover:bg-slate-800" : "hover:bg-amber-100"} transition-colors`}
                                            >
                                                {expanded ? (
                                                    <ChevronUp className={`w-5 h-5 ${isDark ? "text-slate-400" : "text-amber-600"}`} />
                                                ) : (
                                                    <ChevronDown className={`w-5 h-5 ${isDark ? "text-slate-400" : "text-amber-600"}`} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {expanded && !locked && (
                                        <div className="space-y-4 mt-4">
                                            <div className={`prose prose-sm max-w-none ${isDark ? "text-slate-200" : "text-amber-900"} whitespace-pre-wrap leading-relaxed font-serif`}>
                                                {letter.content}
                                            </div>

                                            {letter.video_url && (
                                                <div className="rounded-lg overflow-hidden">
                                                    <VideoPlayer url={letter.video_url} />
                                                </div>
                                            )}

                                            {letter.audio_url && (
                                                <div className={`rounded-lg p-4 ${isDark ? "bg-slate-800" : "bg-amber-100"}`}>
                                                    <audio controls className="w-full" src={letter.audio_url} />
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between pt-2 border-t border-amber-200">
                                                <span className={`text-xs ${isDark ? "text-slate-500" : "text-amber-500"} font-serif`}>
                                                    {new Date(letter.created_at).toLocaleDateString("vi-VN")}
                                                </span>
                                                <button
                                                    onClick={() => setDeleteConfirm({ type: "letter", id: letter.id })}
                                                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {letter.replies.length > 0 && (
                                                <div className="space-y-3 pt-3">
                                                    <h4 className={`text-sm font-semibold ${isDark ? "text-slate-300" : "text-amber-800"} font-serif`}>
                                                        Replies ({letter.replies.length})
                                                    </h4>
                                                    {letter.replies.map((reply) => (
                                                        <div
                                                            key={reply.id}
                                                            className={`flex gap-3 ${isDark ? "bg-slate-800" : "bg-white/80"} rounded-lg p-3`}
                                                        >
                                                            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white">
                                                                <Heart className="w-4 h-4 text-white fill-current" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className={`text-sm ${isDark ? "text-slate-200" : "text-amber-900"} font-serif`}>{reply.content}</p>
                                                                <div className="flex items-center justify-between mt-1">
                                                                    <span className={`text-xs ${isDark ? "text-slate-500" : "text-amber-500"} font-serif`}>
                                                                        {new Date(reply.created_at).toLocaleDateString("vi-VN")}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => setDeleteConfirm({ type: "reply", id: reply.id, letterId: letter.id })}
                                                                        className="text-red-500 hover:text-red-600"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {!isReplying ? (
                                                <button
                                                    onClick={() => setReplyingTo(letter.id)}
                                                    className="w-full py-2 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-white font-medium hover:from-amber-500 hover:to-orange-600 transition-all font-serif"
                                                >
                                                    <div className="flex items-center justify-center gap-2">
                                                        <MessageCircle className="w-4 h-4" />
                                                        Reply
                                                    </div>
                                                </button>
                                            ) : (
                                                <div className="space-y-2">
                                                    <textarea
                                                        value={replyContent}
                                                        onChange={(e) => setReplyContent(e.target.value.slice(0, 300))}
                                                        placeholder="Write a reply..."
                                                        maxLength={300}
                                                        rows={3}
                                                        className={`w-full px-3 py-2 rounded-lg border border-amber-200 ${isDark ? "bg-[#121110] text-white" : "bg-white text-gray-900"} focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none resize-none text-sm font-serif`}
                                                    />
                                                    <div className="flex items-center justify-between">
                                                        <span className={`text-xs ${isDark ? "text-slate-500" : "text-amber-500"} font-serif`}>
                                                            {replyContent.length}/300
                                                        </span>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setReplyingTo(null);
                                                                    setReplyContent("");
                                                                }}
                                                                className={`px-3 py-1.5 rounded-lg ${isDark ? "bg-slate-800 text-slate-300" : "bg-gray-100 text-gray-700"} text-sm font-serif`}
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={() => handleReply(letter.id)}
                                                                disabled={isSendingReply || !replyContent.trim()}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-medium disabled:opacity-50 font-serif"
                                                            >
                                                                {isSendingReply ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                                                Send
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {letters.length === 0 && (
                    <div className={`text-center py-12 ${isDark ? "text-slate-400" : "text-amber-600"}`}>
                        <StickyNote className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="font-serif">No notes yet</p>
                        <p className="text-sm mt-1 font-serif">Be the first to add a memory!</p>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={!!deleteConfirm}
                onCancel={() => setDeleteConfirm(null)}
                title="Confirm Delete"
                message={deleteConfirm?.type === "letter" ? "Are you sure you want to delete this note?" : "Are you sure you want to delete this reply?"}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={() => {
                    if (deleteConfirm?.type === "letter") {
                        handleDelete(deleteConfirm.id);
                    } else if (deleteConfirm?.type === "reply" && deleteConfirm.letterId) {
                        handleDeleteReply(deleteConfirm.id, deleteConfirm.letterId);
                    }
                }}
                isLoading={!!deletingId}
            />
        </div>
    );
}
