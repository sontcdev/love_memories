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
    theme?: "love" | "every" | "idol";
    isDark?: boolean;
    onPopupOpenChange?: (isOpen: boolean) => void;
}

export function LetterBox({ slug, initialLetters, isDark = false, onPopupOpenChange }: LetterBoxProps) {
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

    return (
        <div className="space-y-6">
            {/* Inject custom keyframe styles safely */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes float-scroll {
                    0% { transform: translateY(0px) rotate(var(--rot, 0deg)); }
                    50% { transform: translateY(-8px) rotate(calc(var(--rot, 0deg) + 3deg)); }
                    100% { transform: translateY(0px) rotate(var(--rot, 0deg)); }
                }
                .animate-float-scroll {
                    animation: float-scroll 4s ease-in-out infinite;
                }
                @keyframes unfold-scroll {
                    from { transform: scaleY(0.1); opacity: 0; }
                    to { transform: scaleY(1); opacity: 1; }
                }
                .animate-unfold {
                    animation: unfold-scroll 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    transform-origin: top;
                }
            `}} />

            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3 border-amber-900/10">
                <div className="flex items-center gap-2">
                    <Mail className={`w-5 h-5 text-amber-700`} />
                    <h3 className={`text-lg font-serif font-bold ${isDark ? "text-slate-100" : "text-amber-950"}`}>Hòm Lưu Bút & Điều Ước</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? "bg-zinc-800 text-slate-300" : "bg-amber-100 text-amber-800"}`}>({letters.length})</span>
                </div>
            </div>

            {/* Gói 2: Wish Jar Section */}
            <div className={`rounded-2xl p-6 transition-all border ${
                isDark ? "bg-zinc-900/50 border-zinc-700" : "bg-amber-50/20 border-amber-900/10"
            }`}>
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-4">
                    {/* Glass Wish Jar Visual */}
                    <div className="relative flex flex-col items-center flex-shrink-0">
                        {/* Cork Lid */}
                        <div className="w-16 h-5 bg-gradient-to-r from-amber-800 to-amber-700 rounded-t-md border-b-2 border-amber-950 z-10 shadow-md" />
                        {/* Jar Neck */}
                        <div className="w-20 h-3 bg-white/10 border-x-2 border-white/20 z-10" />
                        {/* Jar Body */}
                        <div className="relative w-56 h-72 bg-gradient-to-b from-white/15 to-white/5 border-2 border-white/25 rounded-[3rem] shadow-[inset_0_4px_20px_rgba(255,255,255,0.15),0_10px_25px_rgba(0,0,0,0.3)] backdrop-blur-sm overflow-hidden flex items-end justify-center pb-6">
                            {/* Glass reflection */}
                            <div className="absolute top-0 left-4 w-6 h-full bg-gradient-to-r from-white/10 to-transparent rotate-[15deg] origin-top pointer-events-none" />
                            <div className="absolute top-0 right-4 w-3 h-full bg-gradient-to-l from-white/5 to-transparent rotate-[-15deg] origin-top pointer-events-none" />
                            
                            {/* Wish Jar Text Ribbon */}
                            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-50/90 text-amber-950 text-[10px] font-bold px-3 py-1 rounded-sm shadow-md border border-amber-900/15 rotate-[-2deg] font-serif z-10 uppercase tracking-wider whitespace-nowrap">
                                Hũ Điều Ước ✨
                            </div>

                            {/* Rolled scrolls inside the jar (max 12) */}
                            <div className="absolute inset-0 p-6 flex flex-wrap justify-center items-end gap-2.5 content-end pb-8">
                                {letters.length === 0 ? (
                                    <div className="text-center text-[10px] text-amber-100/60 font-serif italic px-2 pb-8">
                                        Chưa có điều ước nào... Hãy thả điều ước đầu tiên!
                                    </div>
                                ) : (
                                    letters.slice(0, 12).map((letter, idx) => {
                                        const rotations = [-15, 10, -5, 20, -25, 15, -10, 5, -20, 25];
                                        const rot = rotations[idx % rotations.length];
                                        const delay = idx * 0.3;
                                        return (
                                            <button
                                                key={letter.id}
                                                onClick={() => setExpandedId(letter.id)}
                                                style={{
                                                    '--rot': `${rot}deg`,
                                                    animationDelay: `${delay}s`,
                                                } as React.CSSProperties}
                                                className="w-9 h-9 flex items-center justify-center bg-amber-50 hover:bg-amber-100 hover:scale-110 active:scale-95 border border-amber-900/15 rounded-full shadow-md transition-all animate-float-scroll cursor-pointer group relative"
                                                title={letter.title}
                                            >
                                                📜
                                                <span className="absolute -top-7 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 bg-black/85 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap transition-all z-20 pointer-events-none">
                                                    {letter.title}
                                                </span>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                        {/* Shadow under jar */}
                        <div className="w-40 h-3 bg-black/20 rounded-full blur-sm mt-1" />
                    </div>

                    {/* Write wish & jar details */}
                    <div className="flex-1 text-center md:text-left space-y-4 max-w-sm">
                        <h4 className={`text-base font-serif font-bold ${isDark ? "text-amber-300" : "text-amber-900"}`}>
                            Gửi Gắm Yêu Thương Vào Hũ
                        </h4>
                        <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                            Mỗi bức thư lưu bút được cuộn tròn lại như một cuộn sớ cổ phong nằm trong hũ thủy tinh này. Hãy gửi gắm những ước mơ, lời chúc tốt đẹp nhất gửi tới bạn mình nhé!
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-1">
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-serif font-semibold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 hover:scale-[1.03] active:scale-95"
                            >
                                <Plus className="w-4 h-4" />
                                Thả điều ước vào hũ
                            </button>
                        </div>
                    </div>
                </div>

                {/* Wooden Shelves Display (shows all letters) */}
                {letters.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-amber-900/10">
                        <h4 className={`text-center text-[10px] font-serif font-bold tracking-widest uppercase mb-6 ${isDark ? "text-slate-400" : "text-amber-900/70"}`}>
                            Kệ sớ lưu bút tốt nghiệp
                        </h4>
                        <div className="max-w-xl mx-auto space-y-2">
                            {Array.from({ length: Math.ceil(letters.length / 4) }).map((_, shelfIdx) => {
                                const shelfLetters = letters.slice(shelfIdx * 4, shelfIdx * 4 + 4);
                                return (
                                    <div key={shelfIdx} className="flex flex-col items-center w-full my-6">
                                        <div className="flex justify-around items-end w-full px-4 h-14 relative">
                                            {shelfLetters.map((letter) => (
                                                <button
                                                    key={letter.id}
                                                    onClick={() => setExpandedId(letter.id)}
                                                    className="flex flex-col items-center transition-all hover:scale-110 active:scale-95 group relative mb-1 cursor-pointer"
                                                >
                                                    <div className="text-3xl relative filter drop-shadow-md">
                                                        📜
                                                        {isLetterLocked(letter) && (
                                                            <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 text-[8px] text-white">
                                                                🔒
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className={`text-[10px] truncate max-w-[75px] mt-1 font-serif ${isDark ? "text-slate-400" : "text-amber-950"} font-medium`}>
                                                        {letter.title}
                                                    </span>
                                                    <span className="absolute -top-12 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 bg-black/85 text-white text-[9px] px-2 py-1 rounded whitespace-nowrap transition-all z-20 pointer-events-none flex flex-col items-center">
                                                        {letter.sender && <span className="font-bold text-amber-300">Từ: {letter.sender}</span>}
                                                        <span>{letter.title} {isLetterLocked(letter) ? "(🔒)" : ""}</span>
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                        {/* Wooden shelf board */}
                                        <div className="w-full h-3 bg-gradient-to-r from-[#5c3a21] via-[#855430] to-[#5c3a21] rounded-full shadow-md border-t border-amber-300/10" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Create Form Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className={`${isDark ? "bg-[#1f1e1c] text-slate-100 border border-slate-800" : "bg-white text-gray-900"} rounded-2xl w-full max-w-lg max-h-[90vh] shadow-2xl overflow-hidden flex flex-col`}>
                        <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-4 text-white flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-serif font-bold">Thả điều ước mới</h3>
                                <button onClick={() => setShowCreateForm(false)} className="p-1 hover:bg-black/10 rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
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
                                    className={`w-full px-4 py-2 rounded-lg border border-amber-900/15 ${isDark ? "bg-[#121110] text-white focus:ring-amber-500/20" : "bg-white text-gray-950"} focus:ring-2 focus:ring-amber-300 outline-none text-sm mb-3`}
                                />
                            </div>
                            <div>
                                <label className={`block text-xs font-semibold ${isDark ? "text-slate-300" : "text-gray-700"} mb-1`}>
                                    Tiêu đề điều ước <span className="text-gray-400 text-[10px]">({newTitle.length}/50)</span>
                                </label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value.slice(0, 50))}
                                    placeholder="Ví dụ: Lời chúc thi tốt..."
                                    maxLength={50}
                                    className={`w-full px-4 py-2 rounded-lg border border-amber-900/15 ${isDark ? "bg-[#121110] text-white focus:ring-amber-500/20" : "bg-white text-gray-950"} focus:ring-2 focus:ring-amber-300 outline-none text-sm`}
                                />
                            </div>
                            <div>
                                <label className={`block text-xs font-semibold ${isDark ? "text-slate-300" : "text-gray-700"} mb-1`}>
                                    Nội dung lời chúc <span className="text-gray-400 text-[10px]">({newContent.length}/1000)</span>
                                </label>
                                <textarea
                                    value={newContent}
                                    onChange={(e) => setNewContent(e.target.value.slice(0, 1000))}
                                    placeholder="Viết những lời lưu bút gửi bạn mình..."
                                    rows={5}
                                    maxLength={1000}
                                    className={`w-full px-4 py-2 rounded-lg border border-amber-900/15 ${isDark ? "bg-[#121110] text-white focus:ring-amber-500/20" : "bg-white text-gray-950"} focus:ring-2 focus:ring-amber-300 outline-none text-sm resize-none`}
                                />
                            </div>

                            {/* Video URL */}
                            <div>
                                <label className={`flex items-center gap-1 text-xs font-semibold ${isDark ? "text-slate-300" : "text-gray-700"} mb-1`}>
                                    <Video className="w-4 h-4 text-amber-700" />
                                    Video đính kèm (YouTube/TikTok - tùy chọn)
                                </label>
                                {newVideoUrl ? (
                                    <div className="space-y-2">
                                        <VideoPlayer url={newVideoUrl} className="rounded-lg" />
                                        <button
                                            onClick={() => setNewVideoUrl("")}
                                            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-semibold"
                                        >
                                            <X className="w-3.5 h-3.5" />
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
                                <label className={`flex items-center gap-1 text-xs font-semibold ${isDark ? "text-slate-300" : "text-gray-700"} mb-1`}>
                                    <Mic className="w-4 h-4 text-amber-700" />
                                    Ghi âm đính kèm (tùy chọn)
                                </label>
                                {newAudioUrl ? (
                                    <div className="space-y-2">
                                        <audio src={newAudioUrl} controls className="w-full h-10" />
                                        <button
                                            onClick={() => setNewAudioUrl("")}
                                            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-semibold"
                                        >
                                            <X className="w-3.5 h-3.5" />
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

                            {/* Unlock Date Picker */}
                            <div>
                                <label className={`flex items-center gap-1 text-xs font-semibold ${isDark ? "text-slate-300" : "text-gray-700"} mb-1`}>
                                    <Calendar className="w-4 h-4 text-amber-700" />
                                    Hẹn ngày mở khóa (tùy chọn)
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
                                    className={`w-full px-4 py-2 rounded-lg border border-amber-900/15 ${isDark ? "bg-[#121110] text-white" : "bg-white"} outline-none text-sm`}
                                />
                                <p className="text-[10px] text-gray-400 mt-1">
                                    Thư sẽ hiển thị dưới dạng khóa 🔒 cho tới ngày được hẹn mở.
                                </p>
                            </div>

                            <button
                                onClick={handleCreate}
                                disabled={isCreating || !newTitle.trim() || !newContent.trim()}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:brightness-110 font-serif"
                            >
                                {isCreating ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Gửi điều ước
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
                title={deleteConfirm?.type === "letter" ? "Xóa điều ước" : "Xóa câu trả lời"}
                message={deleteConfirm?.type === "letter"
                    ? "Bạn có chắc chắn muốn xóa điều ước này khỏi hũ?"
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

            {/* Parchment Scroll Unrolled Modal */}
            {expandedId !== null && (
                (() => {
                    const letter = letters.find(l => l.id === expandedId);
                    if (!letter) return null;
                    
                    return (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setExpandedId(null)}>
                            <div 
                                className="w-full max-w-lg relative bg-[#faf3e0] text-[#3a2213] rounded-sm shadow-2xl flex flex-col overflow-hidden max-h-[85vh] animate-unfold border-x-[12px] border-amber-900/10"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Top Scroll Wood Cylinder */}
                                <div className="h-4 w-full bg-gradient-to-r from-[#4a2e1b] via-[#855430] to-[#4a2e1b] rounded-full shadow-md z-10 flex-shrink-0" />
                                
                                {/* Parchment Body */}
                                <div className="p-6 sm:p-8 flex-1 overflow-y-auto font-serif space-y-4" style={{ backgroundImage: "radial-gradient(#fbf8eb 30%, #f4e8c1 100%)" }}>
                                    {/* Close button inside parchment */}
                                    <button 
                                        onClick={() => setExpandedId(null)}
                                        className="absolute top-6 right-6 p-1 rounded-full hover:bg-black/5 text-[#5c3a21] transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>

                                    <div className="border-b border-[#dacdbf] pb-3 pr-8">
                                        <div className="flex items-center justify-between text-xs text-[#8c6239] font-mono mb-1">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{formatDate(letter.created_at)}</span>
                                            </div>
                                            {letter.sender && (
                                                <span className="font-semibold text-amber-800">Người gửi: {letter.sender}</span>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold font-serif text-[#4a2e1b] leading-tight flex items-center gap-2">
                                            📜 {letter.title}
                                            {isLetterLocked(letter) && <Lock className="w-4 h-4 text-red-500" />}
                                        </h3>
                                    </div>

                                    {/* Content area */}
                                    <div className="py-2">
                                        {isLetterLocked(letter) ? (
                                            <div className="bg-[#ebd9b4]/50 rounded-xl p-6 text-center border border-[#dacdbf]">
                                                <Lock className="w-12 h-12 mx-auto mb-3 text-amber-800" />
                                                <h4 className="font-bold text-[#4a2e1b] mb-1">Thư này đang bị khóa</h4>
                                                <p className="text-sm text-[#705238]">
                                                    Hãy quay lại vào ngày <span className="font-bold">{formatUnlockDate(letter.unlock_date!)}</span> để mở khóa xem điều ước này.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[#3a2213] italic font-medium pr-1">
                                                    &ldquo;{letter.content}&rdquo;
                                                </p>

                                                {/* Image */}
                                                {letter.image_url && (
                                                    <div className="my-3 rounded-lg overflow-hidden border border-[#dacdbf] shadow-sm">
                                                        <Image
                                                            src={letter.image_url}
                                                            alt="Letter attachment"
                                                            width={450}
                                                            height={300}
                                                            className="w-full object-cover max-h-60"
                                                        />
                                                    </div>
                                                )}

                                                {/* Video */}
                                                {letter.video_url && (
                                                    <div className="my-3">
                                                        <VideoPlayer url={letter.video_url} className="rounded-xl border border-[#dacdbf]" />
                                                    </div>
                                                )}

                                                {/* Audio */}
                                                {letter.audio_url && (
                                                    <div className="my-3 bg-[#fdfaf2] p-3 rounded-xl border border-[#dacdbf]/60 shadow-inner">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Mic className="w-4 h-4 text-amber-700" />
                                                            <span className="text-xs font-semibold text-amber-900">Ghi âm đính kèm</span>
                                                        </div>
                                                        <audio
                                                            src={letter.audio_url}
                                                            controls
                                                            className="w-full h-8"
                                                            onPlay={() => window.dispatchEvent(new CustomEvent('pause-music'))}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Reply Section (only if unlocked) */}
                                    {!isLetterLocked(letter) && (
                                        <div className="border-t border-[#dacdbf] pt-4 space-y-4">
                                            {/* Replies List */}
                                            {letter.replies.length > 0 && (
                                                <div className="space-y-2">
                                                    <h4 className="text-xs font-bold text-[#8c6239] flex items-center gap-1 uppercase tracking-wider">
                                                        <MessageCircle className="w-3.5 h-3.5" />
                                                        Các phản hồi ({letter.replies.length})
                                                    </h4>
                                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                                        {letter.replies.map((reply) => (
                                                            <div key={reply.id} className="bg-[#fcf7ec] p-3 rounded-lg border border-[#e8dfc7] relative group">
                                                                <p className="text-xs text-[#3a2213] leading-relaxed break-words pr-8">
                                                                    {reply.content}
                                                                </p>
                                                                <div className="flex justify-between items-center mt-1 text-[10px] text-[#a08060]">
                                                                    <span>{formatDate(reply.created_at)}</span>
                                                                    <button
                                                                        onClick={() => setDeleteConfirm({ type: "reply", id: reply.id, letterId: letter.id })}
                                                                        className="text-red-600 hover:text-red-800 opacity-60 group-hover:opacity-100 transition-opacity"
                                                                        title="Xóa phản hồi"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Write Reply */}
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={replyingTo === letter.id ? replyContent : ""}
                                                    onChange={(e) => {
                                                        setReplyingTo(letter.id);
                                                        setReplyContent(e.target.value.slice(0, 300));
                                                    }}
                                                    placeholder="Nhập câu trả lời..."
                                                    className="flex-1 px-3 py-2 rounded-full border border-[#c8bfa7] bg-[#fdfdfb] text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
                                                />
                                                <button
                                                    onClick={() => handleReply(letter.id)}
                                                    disabled={isSendingReply || !replyContent.trim()}
                                                    className="p-2 rounded-full bg-amber-700 hover:bg-amber-800 text-white shadow-md disabled:opacity-50 transition-colors flex items-center justify-center"
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
                                    
                                    {/* Delete Letter Option */}
                                    <div className="flex justify-end pt-2">
                                        <button
                                            onClick={() => setDeleteConfirm({ type: "letter", id: letter.id })}
                                            className="flex items-center gap-1 text-[10px] text-red-700 hover:text-red-900 font-sans hover:underline"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Xóa điều ước này
                                        </button>
                                    </div>
                                </div>

                                {/* Bottom Scroll Wood Cylinder */}
                                <div className="h-4 w-full bg-gradient-to-r from-[#4a2e1b] via-[#855430] to-[#4a2e1b] rounded-full shadow-md z-10 flex-shrink-0" />
                            </div>
                        </div>
                    );
                })()
            )}
        </div>
    );
}
