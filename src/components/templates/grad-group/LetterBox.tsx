"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { Letter, LetterReply } from "@prisma/client";
import { VideoInput } from "@/components/media/VideoInput";
import { VoiceRecorder } from "@/components/media/VoiceRecorder";
import { VideoPlayer } from "@/components/media/VideoPlayer";
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
    MessageCircle,
    Video,
    Mic,
    Lock,
    Calendar,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatDate, tomorrowMinInput } from "@/lib/date-utils"

type LetterWithReplies = Letter & { replies: LetterReply[] };

interface LetterBoxProps {
    slug: string;
    initialLetters: LetterWithReplies[];
    isDark?: boolean;
    accentColor?: string;
    onPopupOpenChange?: (isOpen: boolean) => void;
}

export function LetterBox({ slug, initialLetters, isDark = false, accentColor = "#d97706", onPopupOpenChange }: LetterBoxProps) {
    const [letters, setLetters] = useState<LetterWithReplies[]>(initialLetters);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    useEffect(() => {
        onPopupOpenChange?.(showCreateForm);
    }, [showCreateForm, onPopupOpenChange]);
    const [isCreating, setIsCreating] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState("");
    const [isSendingReply, setIsSendingReply] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: "letter" | "reply"; id: string; letterId?: string } | null>(null);

    // Form state
    const [newTitle, setNewTitle] = useState("");
    const [newSender, setNewSender] = useState("");
    const [newContent, setNewContent] = useState("");
    const [newVideoUrl, setNewVideoUrl] = useState("");
    const [newAudioUrl, setNewAudioUrl] = useState("");
    const [newUnlockDate, setNewUnlockDate] = useState<string>("");

    // State for realtime unlock check
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every minute for realtime unlock
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    // Helper to check if letter is locked
    const isLetterLocked = (letter: LetterWithReplies): boolean => {
        if (!letter.unlock_date) return false;
        const today = new Date(currentTime);
        today.setHours(0, 0, 0, 0);
        const unlockDate = new Date(letter.unlock_date);
        unlockDate.setHours(0, 0, 0, 0);
        return today < unlockDate;
    };

    // Helper to format unlock date
    const formatUnlockDate = (date: Date | string) => formatDate(date, { day: "2-digit", month: "2-digit", year: "numeric" })

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

    // Colors for Sticky Notes
    const stickyNoteColors = [
        { bg: "bg-[#fff9db]", border: "border-[#ffe066]", text: "text-amber-900" }, // Yellow
        { bg: "bg-[#fff0f6]", border: "border-[#ffdeeb]", text: "text-rose-900" },  // Pink
        { bg: "bg-[#f3f0ff]", border: "border-[#e5dbff]", text: "text-violet-900" }, // Purple
        { bg: "bg-[#e7f5ff]", border: "border-[#d0ebff]", text: "text-blue-900" },   // Blue
        { bg: "bg-[#e6fcf5]", border: "border-[#c3fae8]", text: "text-emerald-950" }, // Teal
    ];

    return (
        <div className="space-y-6">
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes note-pop {
                    from { transform: scale(0.9) rotate(var(--rot, 0deg)); opacity: 0; }
                    to { transform: scale(1) rotate(var(--rot, 0deg)); opacity: 1; }
                }
                .animate-note-pop {
                    animation: note-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
            `}} />

            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3 border-amber-900/10">
                <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-amber-700" />
                    <h3 className={`text-lg font-serif font-bold ${isDark ? "text-slate-100" : "text-amber-950"}`}>
                        Bảng Ghim Lưu Bút Nhóm
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? "bg-zinc-800 text-slate-300" : "bg-amber-100 text-amber-800"}`}>
                        ({letters.length})
                    </span>
                </div>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-4 py-2 rounded-full text-white font-semibold text-xs shadow transition-all hover:scale-103 active:scale-97 flex items-center gap-1.5"
                    style={{ backgroundColor: accentColor }}
                >
                    <Plus className="w-3.5 h-3.5" /> Ghim lưu bút
                </button>
            </div>

            {/* Corkboard Container */}
            <div className={`rounded-3xl p-6 transition-all border relative min-h-[400px] ${
                isDark 
                    ? "bg-[#18120e] border-[#302118] shadow-[inset_0_4px_16px_rgba(0,0,0,0.6)]" 
                    : "bg-[#d7a15c]/20 border-[#855430]/30 shadow-[inset_0_4px_16px_rgba(133,84,48,0.15)]"
            }`}
                style={{ 
                    backgroundImage: isDark 
                        ? "radial-gradient(#2c1a11 20%, transparent 20%), radial-gradient(#2c1a11 20%, transparent 20%)"
                        : "radial-gradient(#cf9249 20%, transparent 20%), radial-gradient(#cf9249 20%, transparent 20%)",
                    backgroundSize: "24px 24px",
                    backgroundPosition: "0 0, 12px 12px"
                }}
            >
                {/* Board Frame (PC/Desktop overlay border) */}
                <div className="absolute inset-2 border-2 border-dashed border-amber-900/10 pointer-events-none rounded-2xl" />

                {letters.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 relative z-10">
                        <Mail className="w-12 h-12 text-slate-400 opacity-60 animate-bounce" />
                        <p className={`text-sm font-serif italic ${isDark ? "text-slate-400" : "text-amber-900"}`}>
                            Bảng ghim chưa có lời lưu bút nào...
                        </p>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="text-xs font-semibold hover:underline"
                            style={{ color: accentColor }}
                        >
                            Hãy là người đầu tiên ghim tin nhắn!
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 relative z-10">
                        {letters.map((letter, idx) => {
                            const rotationAngles = [-3, 2, -1, 4, -2, 3, -4, 1];
                            const rot = rotationAngles[idx % rotationAngles.length];
                            const noteColor = stickyNoteColors[idx % stickyNoteColors.length];

                            return (
                                <div
                                    key={letter.id}
                                    onClick={() => setExpandedId(letter.id)}
                                    style={{
                                        '--rot': `${rot}deg`,
                                    } as React.CSSProperties}
                                    className={`p-4 rounded shadow-md border ${noteColor.bg} ${noteColor.border} ${noteColor.text} relative cursor-pointer transform hover:scale-105 active:scale-95 transition-all hover:shadow-lg min-h-[140px] flex flex-col justify-between animate-note-pop`}
                                >
                                    {/* Red pushpin at the top */}
                                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow border border-red-700 z-10" />

                                    <div className="space-y-1.5 flex-1 overflow-hidden">
                                        {letter.sender && (
                                            <div className="text-[9px] font-mono uppercase tracking-wider opacity-60 truncate">
                                                Từ: {letter.sender}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1 font-serif font-bold text-xs sm:text-sm truncate">
                                            <span>{letter.title}</span>
                                            {isLetterLocked(letter) && (
                                                <Lock className="w-3.5 h-3.5 flex-shrink-0 opacity-80" />
                                            )}
                                        </div>
                                        <p className="text-[10px] leading-relaxed line-clamp-4 break-words font-serif font-medium">
                                            {isLetterLocked(letter) 
                                                ? `🔒 Chỉ mở vào ngày ${formatUnlockDate(letter.unlock_date!)}` 
                                                : letter.content}
                                        </p>
                                    </div>
                                    
                                    <div className="flex justify-between items-center text-[8px] font-mono opacity-60 border-t pt-1.5 mt-2 border-black/5">
                                        <span>{new Date(letter.created_at).toLocaleDateString("vi-VN")}</span>
                                        {letter.replies.length > 0 && (
                                            <span className="flex items-center gap-0.5">
                                                💬 {letter.replies.length}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create Form Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className={`${isDark ? "bg-[#1f1e1c] text-slate-100 border border-slate-800" : "bg-white text-gray-900"} rounded-2xl w-full max-w-lg max-h-[90vh] shadow-2xl overflow-hidden flex flex-col`}>
                        <div className="p-4 text-white flex-shrink-0 flex items-center justify-between" style={{ backgroundColor: accentColor }}>
                            <h3 className="text-base font-serif font-bold">Ghim tin nhắn lưu bút mới</h3>
                            <button onClick={() => setShowCreateForm(false)} className="p-1 hover:bg-black/10 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
                            <div>
                                <label className={`block text-xs font-semibold ${isDark ? "text-slate-300" : "text-gray-700"} mb-1`}>
                                    Người gửi <span className="text-gray-400 text-[10px]">({newSender.length}/50)</span>
                                </label>
                                <input
                                    type="text"
                                    value={newSender}
                                    onChange={(e) => setNewSender(e.target.value.slice(0, 50))}
                                    placeholder="Nhập tên người gửi (tên của bạn hoặc ẩn danh)..."
                                    maxLength={50}
                                    className={`w-full px-4 py-2 rounded-lg border border-amber-900/15 ${isDark ? "bg-[#121110] text-white" : "bg-white text-gray-950"} text-sm outline-none mb-3`}
                                />
                            </div>
                            <div>
                                <label className={`block text-xs font-semibold ${isDark ? "text-slate-300" : "text-gray-700"} mb-1`}>
                                    Tiêu đề mảnh giấy <span className="text-gray-400 text-[10px]">({newTitle.length}/50)</span>
                                </label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value.slice(0, 50))}
                                    placeholder="Nhập tiêu đề..."
                                    maxLength={50}
                                    className={`w-full px-4 py-2 rounded-lg border border-amber-900/15 ${isDark ? "bg-[#121110] text-white" : "bg-white text-gray-950"} text-sm outline-none`}
                                />
                            </div>
                            <div>
                                <label className={`block text-xs font-semibold ${isDark ? "text-slate-300" : "text-gray-700"} mb-1`}>
                                    Nội dung tin nhắn <span className="text-gray-400 text-[10px]">({newContent.length}/1000)</span>
                                </label>
                                <textarea
                                    value={newContent}
                                    onChange={(e) => setNewContent(e.target.value.slice(0, 1000))}
                                    placeholder="Ghi chú những kỷ niệm, chúc mừng hoặc lời nhắn gửi..."
                                    rows={5}
                                    maxLength={1000}
                                    className={`w-full px-4 py-2 rounded-lg border border-amber-900/15 ${isDark ? "bg-[#121110] text-white" : "bg-white text-gray-950"} text-sm outline-none resize-none`}
                                />
                            </div>

                            {/* Video */}
                            <div>
                                <label className={`flex items-center gap-1 text-xs font-semibold ${isDark ? "text-slate-300" : "text-gray-700"} mb-1`}>
                                    <Video className="w-4 h-4 text-amber-700" />
                                    Đính kèm Video (YouTube/TikTok - tùy chọn)
                                </label>
                                {newVideoUrl ? (
                                    <div className="space-y-2">
                                        <VideoPlayer url={newVideoUrl} className="rounded-lg" />
                                        <button
                                            onClick={() => setNewVideoUrl("")}
                                            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-semibold"
                                        >
                                            <X className="w-3.5 h-3.5" /> Xóa video
                                        </button>
                                    </div>
                                ) : (
                                    <VideoInput value={newVideoUrl} onChange={setNewVideoUrl} placeholder="Dán link video..." />
                                )}
                            </div>

                            {/* Audio */}
                            <div>
                                <label className={`flex items-center gap-1 text-xs font-semibold ${isDark ? "text-slate-300" : "text-gray-700"} mb-1`}>
                                    <Mic className="w-4 h-4 text-amber-700" />
                                    Đính kèm Ghi âm giọng nói (tùy chọn)
                                </label>
                                {newAudioUrl ? (
                                    <div className="space-y-2">
                                        <audio src={newAudioUrl} controls className="w-full h-10" />
                                        <button
                                            onClick={() => setNewAudioUrl("")}
                                            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-semibold"
                                        >
                                            <X className="w-3.5 h-3.5" /> Xóa ghi âm
                                        </button>
                                    </div>
                                ) : (
                                    <VoiceRecorder slug={slug} onUploadComplete={setNewAudioUrl} />
                                )}
                            </div>

                            {/* Unlock Date */}
                            <div>
                                <label className={`flex items-center gap-1 text-xs font-semibold ${isDark ? "text-slate-300" : "text-gray-700"} mb-1`}>
                                    <Calendar className="w-4 h-4 text-amber-700" />
                                    Hẹn ngày mở khóa ghim (tùy chọn)
                                </label>
                                <input
                                    type="date"
                                    value={newUnlockDate}
                                    onChange={(e) => {
                                        const selectedDate = new Date(e.target.value);
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        if (selectedDate > today) {
                                            setNewUnlockDate(e.target.value);
                                        }
                                    }}
min={tomorrowMinInput()}
                                    className={`w-full px-4 py-2 rounded-lg border border-amber-900/15 ${isDark ? "bg-[#121110] text-white" : "bg-white"} text-sm`}
                                />
                            </div>

                            <button
                                onClick={handleCreate}
                                disabled={isCreating || !newTitle.trim() || !newContent.trim()}
                                className="w-full py-3 rounded-xl text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:brightness-110 font-serif"
                                style={{ backgroundColor: accentColor }}
                            >
                                {isCreating ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" /> Ghim giấy lên bảng
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteConfirm !== null}
                title={deleteConfirm?.type === "letter" ? "Xóa lưu bút" : "Xóa câu trả lời"}
                message={deleteConfirm?.type === "letter" ? "Xóa ghim thư này?" : "Xóa câu trả lời?"}
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

            {/* Postcard/Letter Unrolled Modal Details (Corkboard layout style) */}
            {expandedId !== null && (
                (() => {
                    const letter = letters.find(l => l.id === expandedId);
                    if (!letter) return null;

                    return (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setExpandedId(null)}>
                            <div 
                                className="w-full max-w-lg relative bg-[#fffdf5] text-amber-950 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh] border-8 border-[#e2d5b6] p-6 sm:p-8"
                                style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px)", backgroundSize: "100% 20px" }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Pinned needle graphic */}
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-600 shadow border border-red-800 z-10" />

                                <button 
                                    onClick={() => setExpandedId(null)}
                                    className="absolute top-6 right-6 p-1.5 rounded-full hover:bg-black/5 text-amber-800 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="border-b border-amber-900/10 pb-3 pr-8 mt-2">
                                    <div className="flex items-center justify-between text-[10px] text-amber-800/60 font-mono mb-1">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
<span>{formatDate(letter.created_at)}</span>
                                        </div>
                                        {letter.sender && (
                                            <span className="font-bold text-amber-900">Người gửi: {letter.sender}</span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold font-serif text-amber-950 flex items-center gap-2">
                                        📌 {letter.title}
                                        {isLetterLocked(letter) && <Lock className="w-4 h-4 text-red-500" />}
                                    </h3>
                                </div>

                                <div className="py-4 flex-1 overflow-y-auto font-serif space-y-4">
                                    {isLetterLocked(letter) ? (
                                        <div className="bg-amber-100/30 rounded-xl p-6 text-center border border-amber-900/10">
                                            <Lock className="w-10 h-10 mx-auto mb-3 text-amber-700" />
                                            <h4 className="font-bold text-amber-950 mb-1">Mảnh ghim chưa mở</h4>
                                            <p className="text-xs text-amber-800">
                                                Cần đợi đến ngày <span className="font-bold">{formatUnlockDate(letter.unlock_date!)}</span> để ghim hé lộ thông tin.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 text-sm leading-relaxed italic text-amber-950/90 pr-1">
                                            <p className="whitespace-pre-wrap break-words">&ldquo;{letter.content}&rdquo;</p>

                                            {letter.image_url && (
                                                <div className="rounded-xl overflow-hidden border border-amber-900/10 shadow-sm">
                                                    <Image src={letter.image_url} alt="Ghim" width={450} height={300} className="w-full object-cover max-h-60" />
                                                </div>
                                            )}
                                            {letter.video_url && (
                                                <VideoPlayer url={letter.video_url} className="rounded-xl border border-amber-900/10" />
                                            )}
                                            {letter.audio_url && (
                                                <div className="bg-amber-100/40 p-3 rounded-xl border border-amber-900/5 shadow-inner">
                                                    <div className="flex items-center gap-1.5 mb-1.5">
                                                        <Mic className="w-4 h-4 text-amber-700" />
                                                        <span className="text-xs font-bold text-amber-900">Ghi âm kèm theo</span>
                                                    </div>
                                                    <audio src={letter.audio_url} controls className="w-full h-8" onPlay={() => window.dispatchEvent(new CustomEvent('pause-music'))} />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {!isLetterLocked(letter) && (
                                        <div className="border-t border-amber-900/10 pt-4 space-y-3">
                                            {letter.replies.length > 0 && (
                                                <div className="space-y-2">
                                                    <h4 className="text-xs font-bold text-amber-800/70 flex items-center gap-1 uppercase tracking-widest">
                                                        <MessageCircle className="w-3.5 h-3.5" /> Phản hồi ({letter.replies.length})
                                                    </h4>
                                                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                                                        {letter.replies.map((reply) => (
                                                            <div key={reply.id} className="bg-white/50 p-2.5 rounded-lg border border-amber-900/5 relative group">
                                                                <p className="text-xs text-amber-950 break-words pr-8">{reply.content}</p>
                                                                <div className="flex justify-between items-center mt-1 text-[9px] text-amber-800/50">
                                                                    <span>{formatDate(reply.created_at)}</span>
                                                                    <button
                                                                        onClick={() => setDeleteConfirm({ type: "reply", id: reply.id, letterId: letter.id })}
                                                                        className="text-red-700 opacity-50 hover:opacity-100"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={replyingTo === letter.id ? replyContent : ""}
                                                    onChange={(e) => {
                                                        setReplyingTo(letter.id);
                                                        setReplyContent(e.target.value.slice(0, 300));
                                                    }}
                                                    placeholder="Trả lời lưu bút..."
                                                    className="flex-1 px-3 py-1.5 rounded-full border border-amber-900/10 bg-white/70 text-xs outline-none"
                                                />
                                                <button
                                                    onClick={() => handleReply(letter.id)}
                                                    disabled={isSendingReply || !replyContent.trim()}
                                                    className="p-1.5 rounded-full text-white shadow flex items-center justify-center disabled:opacity-50"
                                                    style={{ backgroundColor: accentColor }}
                                                >
                                                    {isSendingReply ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Send className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between items-center border-t border-amber-900/10 pt-2.5">
                                    <button
                                        onClick={() => setDeleteConfirm({ type: "letter", id: letter.id })}
                                        className="text-[10px] text-red-700 hover:underline flex items-center gap-1 font-sans font-semibold"
                                    >
                                        <Trash2 className="w-3 h-3" /> Gỡ tin nhắn này
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })()
            )}
        </div>
    );
}
