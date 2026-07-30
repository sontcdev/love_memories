"use client";

import { useState } from "react";
import { GameCard, GameLevel } from "@prisma/client";
import { deleteGameCard, createGameCard, toggleGameCardStatus } from "@/app/actions/game-card-actions";
import { EmptyState } from "@/components/ui/empty-state";
import { Trash2, Loader2, Plus, Eye, EyeOff, Layers, SearchX } from "lucide-react";

interface GameCardsTableProps {
    initialCards: GameCard[];
}

const levelColors = {
    EASY: "bg-green-500/10 text-green-400 border-green-500/30",
    MEDIUM: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    HARD: "bg-red-500/10 text-red-400 border-red-500/30",
};

// Nhãn tiếng Việt của mức độ, dùng cho phần mô tả khi lọc không ra thẻ nào.
const levelLabels: Record<GameLevel, string> = {
    EASY: "DỄ",
    MEDIUM: "TRUNG BÌNH",
    HARD: "KHÓ",
};

export function GameCardsTable({ initialCards }: GameCardsTableProps) {
    const [cards, setCards] = useState<GameCard[]>(initialCards);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newContent, setNewContent] = useState("");
    const [newLevel, setNewLevel] = useState<GameLevel>("EASY");
    const [filter, setFilter] = useState<GameLevel | "ALL">("ALL");

    async function handleDelete(cardId: string) {
        if (!confirm("Xóa thẻ này?")) return;

        setDeletingId(cardId);
        const result = await deleteGameCard(cardId);

        if (result.success) {
            setCards(cards.filter((c) => c.id !== cardId));
        } else {
            alert(result.error);
        }
        setDeletingId(null);
    }

    async function handleToggle(cardId: string) {
        setTogglingId(cardId);
        const result = await toggleGameCardStatus(cardId);

        if (result.success && result.data) {
            setCards(
                cards.map((c) =>
                    c.id === cardId ? { ...c, is_active: result.data.is_active } : c
                )
            );
        }
        setTogglingId(null);
    }

    async function handleAdd() {
        if (!newContent.trim()) return;

        setIsAdding(true);
        const result = await createGameCard(newContent.trim(), newLevel);

        if (result.success && result.data) {
            setCards([result.data, ...cards]);
            setNewContent("");
            setShowAddForm(false);
        } else {
            alert(result.error);
        }
        setIsAdding(false);
    }

    const filteredCards = filter === "ALL"
        ? cards
        : cards.filter((c) => c.level === filter);

    return (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                {/* Filter */}
                <div className="flex gap-2">
                    {(["ALL", "EASY", "MEDIUM", "HARD"] as const).map((level) => (
                        <button
                            key={level}
                            onClick={() => setFilter(level)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === level
                                ? "bg-violet-600 text-white"
                                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                }`}
                        >
                            {level}
                        </button>
                    ))}
                </div>

                {/* Add Button */}
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Thêm thẻ
                </button>
            </div>

            {/* Add Form */}
            {showAddForm && (
                <div className="p-4 bg-slate-700/30 border-b border-slate-700/50">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            placeholder="Nhập nội dung câu hỏi..."
                            className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-violet-500"
                        />
                        <select
                            value={newLevel}
                            onChange={(e) => setNewLevel(e.target.value as GameLevel)}
                            className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-violet-500"
                        >
                            <option value="EASY">DỄ</option>
                            <option value="MEDIUM">TRUNG BÌNH</option>
                            <option value="HARD">KHÓ</option>
                        </select>
                        <button
                            onClick={handleAdd}
                            disabled={isAdding || !newContent.trim()}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            {isAdding ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                "Thêm"
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-700/30">
                        <tr>
                            <th className="text-left p-4 text-sm font-semibold text-slate-300">Nội dung</th>
                            <th className="text-center p-4 text-sm font-semibold text-slate-300 w-32">Mức độ</th>
                            <th className="text-center p-4 text-sm font-semibold text-slate-300 w-24">Trạng thái</th>
                            <th className="text-center p-4 text-sm font-semibold text-slate-300 w-24">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {filteredCards.map((card) => (
                            <tr
                                key={card.id}
                                className={`hover:bg-slate-700/20 ${!card.is_active ? "opacity-50" : ""
                                    }`}
                            >
                                <td className="p-4 text-white">{card.content}</td>
                                <td className="p-4 text-center">
                                    <span
                                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${levelColors[card.level]
                                            }`}
                                    >
                                        {card.level}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <button
                                        onClick={() => handleToggle(card.id)}
                                        disabled={togglingId === card.id}
                                        className={`p-2 rounded-lg transition-colors ${card.is_active
                                            ? "text-green-400 hover:bg-green-500/10"
                                            : "text-slate-500 hover:bg-slate-700"
                                            }`}
                                        title={card.is_active ? "Hoạt động - Nhấp để tắt" : "Đã tắt - Nhấp để bật"}
                                    >
                                        {togglingId === card.id ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : card.is_active ? (
                                            <Eye className="w-5 h-5" />
                                        ) : (
                                            <EyeOff className="w-5 h-5" />
                                        )}
                                    </button>
                                </td>
                                <td className="p-4 text-center">
                                    <button
                                        onClick={() => handleDelete(card.id)}
                                        disabled={deletingId === card.id}
                                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Xóa"
                                    >
                                        {deletingId === card.id ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-5 h-5" />
                                        )}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Bọc trong `dark` để EmptyState dùng biến thể dark: trên nền slate của
                    trang quản trị (trang này không gắn class `dark` lên <html>). */}
                {filteredCards.length === 0 && (
                    <div className="dark p-6">
                        {cards.length === 0 ? (
                            <EmptyState
                                compact
                                icon={<Layers className="w-5 h-5" />}
                                title="Chưa có thẻ trò chơi nào"
                                description="Thêm thẻ đầu tiên để người chơi có câu hỏi. Mỗi thẻ gồm nội dung câu hỏi và mức độ DỄ / TRUNG BÌNH / KHÓ."
                                action={
                                    <button
                                        onClick={() => setShowAddForm(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Thêm thẻ đầu tiên
                                    </button>
                                }
                            />
                        ) : (
                            <EmptyState
                                compact
                                icon={<SearchX className="w-5 h-5" />}
                                title="Không tìm thấy thẻ nào"
                                description={
                                    filter === "ALL"
                                        ? "Không có thẻ nào khớp với bộ lọc hiện tại."
                                        : `Không có thẻ nào ở mức độ ${levelLabels[filter]}. Chọn mức độ khác hoặc xem tất cả ${cards.length} thẻ.`
                                }
                                action={
                                    <button
                                        onClick={() => setFilter("ALL")}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition-colors"
                                    >
                                        Xem tất cả thẻ
                                    </button>
                                }
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700/50 text-sm text-slate-400">
                Hiển thị {filteredCards.length} / {cards.length} thẻ
            </div>
        </div>
    );
}
