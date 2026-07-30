"use client";

// TimelineManagerV2 — bản giữ nguyên implementation mới (toast, auto-save, undo/redo…).
// TimelineManager.tsx đã rollback về đúng phiên bản trên nhánh deploy và chỉ phục vụ
// các LinkType đã có trên deploy; file V2 này phục vụ WEDDING/TRAVEL/FRIENDSHIP.

import { useMemo, useState, useOptimistic, useTransition } from "react";
import Image from "next/image";
import { Timeline } from "@prisma/client";
import { ImageUpload } from "@/components/ui/ImageUpload";
import {
    upsertTimelineEvent,
    deleteTimelineEvent,
    reorderTimelineEvents,
} from "@/app/actions/timeline-actions";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type Announcements,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    Plus,
    Trash2,
    Loader2,
    X,
    Edit3,
    Calendar,
    Image as ImageIcon,
    AlertCircle,
    GripVertical,
} from "lucide-react";

interface TimelineManagerV2Props {
    slug: string;
    initialTimeline: Timeline[];
    isDark?: boolean;
}

interface FormData {
    id?: string;
    title: string;
    date: string;
    description: string;
    image_url: string;
    video_url: string;
    audio_url: string;
}

const MAX_EVENTS = 10;

const emptyForm: FormData = {
    title: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    image_url: "",
    video_url: "",
    audio_url: "",
};

/**
 * Sắp xếp theo THỨ TỰ KÉO THẢ, không theo ngày.
 *
 * Quan trọng: `getLinkData()` (auth-actions.ts) vẫn trả về timelines với
 * `orderBy: { date: "asc" }`, nên nếu để nguyên thứ tự nhận được từ server thì
 * mọi lần kéo thả sẽ bị ghi đè ngay ở lần tải lại trang. Vì vậy danh sách được
 * sắp lại tại client theo `sort_order`, còn `date` chỉ dùng để hiển thị và làm
 * tiêu chí phụ khi các bản ghi cũ còn chung `sort_order = 0`.
 */
function sortByOrder(events: Timeline[]): Timeline[] {
    return [...events].sort(
        (a, b) =>
            a.sort_order - b.sort_order ||
            new Date(a.date).getTime() - new Date(b.date).getTime()
    );
}

interface SortableEventProps {
    event: Timeline;
    isDeleting: boolean;
    /** Khóa kéo thả trong lúc chờ server lưu thứ tự, tránh chồng chéo yêu cầu. */
    isReorderPending: boolean;
    isDark: boolean;
    onEdit: () => void;
    onDelete: () => void;
}

function SortableEvent({
    event,
    isDeleting,
    isReorderPending,
    isDark,
    onEdit,
    onDelete,
}: SortableEventProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: event.id, disabled: isReorderPending });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : "auto",
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group rounded-xl border p-4 transition-all ${
                isDark
                    ? "bg-slate-950/40 border-purple-500/20 hover:border-purple-500/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                    : "bg-white border-gray-200 hover:shadow-md"
            } ${isDeleting ? "opacity-50" : ""} ${
                isDragging
                    ? isDark
                        ? "ring-2 ring-purple-500 shadow-xl"
                        : "ring-2 ring-indigo-500 shadow-xl"
                    : ""
            }`}
        >
            <div className="flex gap-3 items-start">
                {/* Tay kéo — chỉ phần tử này nhận sự kiện kéo, nhờ vậy nút Sửa/Xóa
                    vẫn bấm được bình thường. Là <button> thật nên người dùng
                    bàn phím Tab tới được rồi dùng Space/Enter + mũi tên để đổi thứ tự. */}
                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    disabled={isReorderPending}
                    aria-label={`Kéo để sắp xếp lại sự kiện ${event.title}`}
                    title="Kéo để sắp xếp"
                    className={`shrink-0 mt-1 p-1.5 rounded-lg cursor-grab active:cursor-grabbing touch-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                        isDark
                            ? "text-purple-400/70 hover:text-purple-200 hover:bg-slate-800 focus-visible:outline-purple-400"
                            : "text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus-visible:outline-indigo-500"
                    }`}
                >
                    <GripVertical className="w-4 h-4" aria-hidden="true" />
                </button>

                {/* Date Badge */}
                <div
                    className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex flex-col items-center justify-center text-white ${
                        isDark
                            ? "bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-900/20"
                            : "bg-gradient-to-br from-indigo-400 to-purple-400"
                    }`}
                >
                    <span className="text-base sm:text-lg font-bold leading-none">
                        {new Date(event.date).getDate()}
                    </span>
                    <span className="text-xs opacity-80">
                        {new Date(event.date).toLocaleDateString("en", { month: "short" })}
                    </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold break-words ${isDark ? "text-purple-100" : "text-gray-800"}`}>{event.title}</h3>
                    <p className={`text-xs ${isDark ? "text-purple-400/60" : "text-gray-400"}`}>
                        {new Date(event.date).toLocaleDateString("vi-VN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        })}
                    </p>
                    {event.description && (
                        <p className={`text-sm mt-1 line-clamp-2 ${isDark ? "text-purple-300/80" : "text-gray-500"}`}>
                            {event.description}
                        </p>
                    )}
                </div>

                {/* Thumbnail */}
                {event.image_url && (
                    <div className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border bg-gray-100 ${
                        isDark ? "border-purple-500/20" : "border-gray-200"
                    }`}>
                        <Image
                            src={event.image_url}
                            alt={event.title}
                            width={56}
                            height={56}
                            className="object-cover"
                            style={{ width: '100%', height: '100%' }}
                        />
                    </div>
                )}
            </div>

            {/* Actions - Always visible on mobile */}
            <div className={`flex justify-end gap-1 mt-3 pt-3 border-t sm:border-t-0 sm:mt-0 sm:pt-0 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity ${
                isDark ? "border-purple-950/40" : "border-gray-100"
            }`}>
                <button
                    onClick={onEdit}
                    className={`p-2 rounded-lg text-sm flex items-center gap-1 transition-colors ${
                        isDark ? "text-purple-400 hover:bg-slate-800" : "text-indigo-500 hover:bg-gray-100"
                    }`}
                    title="Sửa"
                >
                    <Edit3 className="w-4 h-4" />
                    <span className="sm:hidden">Sửa</span>
                </button>
                <button
                    onClick={onDelete}
                    disabled={isDeleting}
                    className={`p-2 rounded-lg text-sm flex items-center gap-1 transition-colors ${
                        isDark ? "text-red-400 hover:bg-red-950/40" : "text-red-500 hover:bg-red-50"
                    }`}
                    title="Xóa"
                >
                    {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <>
                            <Trash2 className="w-4 h-4" />
                            <span className="sm:hidden">Xóa</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

export function TimelineManagerV2({ slug, initialTimeline, isDark = false }: TimelineManagerV2Props) {
    const [, startTransition] = useTransition();

    // Optimistic state for instant UI updates
    // Dùng `sortByOrder` thay vì so sánh `date` để cùng một quy tắc thứ tự
    // được áp dụng ở mọi nơi trong component.
    const [, addOptimistic] = useOptimistic(
        initialTimeline,
        (state: Timeline[], action: { type: "add" | "update" | "delete"; payload: Timeline | string }) => {
            switch (action.type) {
                case "add":
                    return sortByOrder([...state, action.payload as Timeline]);
                case "update":
                    return sortByOrder(
                        state.map((e) =>
                            e.id === (action.payload as Timeline).id ? (action.payload as Timeline) : e
                        )
                    );
                case "delete":
                    return state.filter((e) => e.id !== action.payload);
                default:
                    return state;
            }
        }
    );

    const [timeline, setTimeline] = useState<Timeline[]>(() => sortByOrder(initialTimeline));
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState<FormData>(emptyForm);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [showImageUpload, setShowImageUpload] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isReordering, setIsReordering] = useState(false);
    const toast = useToast();

    const isEditing = !!formData.id;
    const isLimitReached = timeline.length >= MAX_EVENTS;
    const isFormValid = formData.title.trim() !== "" && formData.date !== "";

    // Open dialog for new event
    const handleAddNew = () => {
        if (isLimitReached) return;
        setFormData(emptyForm);
        setError(null);
        setShowImageUpload(false);
        setIsDialogOpen(true);
    };

    // Open dialog for editing
    const handleEdit = (event: Timeline) => {
        setFormData({
            id: event.id,
            title: event.title,
            date: new Date(event.date).toISOString().split("T")[0],
            description: event.description || "",
            image_url: event.image_url || "",
            video_url: event.video_url || "",
            audio_url: event.audio_url || "",
        });
        setError(null);
        setShowImageUpload(false);
        setIsDialogOpen(true);
    };

    // Close dialog
    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setFormData(emptyForm);
        setError(null);
        setShowImageUpload(false);
    };

    // Save event (Create or Update)
    const handleSave = async () => {
        if (!isFormValid) return;

        setIsSaving(true);
        setError(null);

        // Create optimistic event for immediate UI update
        const tempId = `temp-${Date.now()}`;
        const optimisticEvent: Timeline = {
            id: formData.id || tempId,
            link_id: "",
            title: formData.title,
            date: new Date(formData.date),
            description: formData.description || null,
            image_url: formData.image_url || null,
            video_url: formData.video_url || null,
            audio_url: formData.audio_url || null,
            sort_order: 0,
            created_at: new Date(),
            updated_at: new Date(),
        };

        startTransition(() => {
            addOptimistic({
                type: isEditing ? "update" : "add",
                payload: optimisticEvent,
            });
        });

        const result = await upsertTimelineEvent(slug, {
            id: formData.id,
            title: formData.title,
            date: formData.date,
            description: formData.description || undefined,
            image_url: formData.image_url || undefined,
            video_url: formData.video_url || undefined,
            audio_url: formData.audio_url || undefined,
        });

        if (result.success && result.data) {
            // KHÔNG sắp xếp lại theo `date` ở đây: làm vậy sẽ xóa sạch thứ tự
            // người dùng vừa kéo thả. Sự kiện sửa được thay tại chỗ, sự kiện mới
            // luôn nối vào cuối — khớp với `sort_order = max + 1` mà server gán.
            if (isEditing) {
                setTimeline((prev) =>
                    prev.map((e) => (e.id === formData.id ? (result.data as Timeline) : e))
                );
            } else {
                setTimeline((prev) => [...prev, result.data as Timeline]);
            }
            handleCloseDialog();
        } else {
            setError(result.error || "Failed to save event");
        }

        setIsSaving(false);
    };

    // Delete event
    const handleDelete = async (eventId: string) => {
        setDeleteConfirmId(null);
        setDeletingId(eventId);

        startTransition(() => {
            addOptimistic({ type: "delete", payload: eventId });
        });

        const result = await deleteTimelineEvent(slug, eventId);

        if (result.success) {
            setTimeline((prev) => prev.filter((e) => e.id !== eventId));
        }

        setDeletingId(null);
    };

    // Handle image upload
    const handleImageUpload = (url: string) => {
        setFormData((prev) => ({ ...prev, image_url: url }));
        setShowImageUpload(false);
    };

    // Sensors — giữ đúng cấu hình của GalleryManager: PointerSensor cần di chuyển
    // 8px mới bắt đầu kéo (để không "ăn" cú bấm vào nút), KeyboardSensor cho phép
    // sắp xếp bằng bàn phím.
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Thông báo tiếng Việt cho trình đọc màn hình (mặc định của dnd-kit là tiếng Anh).
    const announcements = useMemo<Announcements>(() => {
        const titleOf = (id?: string | number) =>
            timeline.find((e) => e.id === id)?.title ?? "sự kiện";
        const positionOf = (id?: string | number) => {
            const index = timeline.findIndex((e) => e.id === id);
            return index === -1 ? 0 : index + 1;
        };

        return {
            onDragStart: ({ active }) =>
                `Bắt đầu di chuyển "${titleOf(active.id)}" từ vị trí ${positionOf(active.id)} trên ${timeline.length}.`,
            onDragOver: ({ active, over }) =>
                over
                    ? `"${titleOf(active.id)}" đang ở vị trí ${positionOf(over.id)} trên ${timeline.length}.`
                    : undefined,
            onDragEnd: ({ active, over }) =>
                over
                    ? `Đã đặt "${titleOf(active.id)}" vào vị trí ${positionOf(over.id)} trên ${timeline.length}.`
                    : `Đã bỏ "${titleOf(active.id)}" tại vị trí cũ.`,
            onDragCancel: ({ active }) =>
                `Đã hủy di chuyển "${titleOf(active.id)}", thứ tự không thay đổi.`,
        };
    }, [timeline]);

    // Kéo thả xong: cập nhật UI ngay, rồi lưu xuống DB. Thất bại thì trả lại
    // thứ tự cũ và hiện toast lỗi.
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = timeline.findIndex((e) => e.id === active.id);
        const newIndex = timeline.findIndex((e) => e.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        const previous = timeline; // ảnh chụp để hoàn tác khi lỗi

        // Ghi luôn sort_order phía client để các lần render/sắp xếp sau vẫn đúng.
        const reordered = arrayMove(timeline, oldIndex, newIndex).map((e, index) => ({
            ...e,
            sort_order: index + 1,
        }));

        setTimeline(reordered);
        setIsReordering(true);

        const result = await reorderTimelineEvents(
            slug,
            reordered.map((e) => e.id)
        );

        if (!result.success) {
            setTimeline(previous); // hoàn tác
            toast.error(
                "Không thể lưu thứ tự mới",
                result.error || "Thứ tự đã được trả về như trước. Vui lòng thử lại."
            );
        }

        setIsReordering(false);
    };


    return (
        <div className="space-y-6">
            {/* Delete Confirm Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirmId !== null}
                title="Xóa sự kiện"
                message="Bạn có chắc muốn xóa sự kiện này? Hành động này không thể hoàn tác."
                confirmText="Xóa"
                cancelText="Hủy"
                variant="danger"
                isLoading={deletingId !== null}
                onConfirm={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                onCancel={() => setDeleteConfirmId(null)}
            />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className={`text-xl font-semibold ${isDark ? "text-purple-100" : "text-gray-800"}`}>Dòng thời gian</h2>
                    <p className={`text-sm ${isDark ? "text-purple-300/70" : "text-gray-500"}`}>
                        {timeline.length} / {MAX_EVENTS} sự kiện
                    </p>
                </div>
                <Button
                    onClick={handleAddNew}
                    disabled={isLimitReached}
                    className={`text-white transition-all shadow-md ${
                        isDark 
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-900/35 hover:shadow-purple-500/20" 
                            : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 hover:shadow-indigo-500/20 hover:shadow-indigo-500/35"
                    }`}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm sự kiện
                </Button>
            </div>

            {/* Limit Warning */}
            {isLimitReached && (
                <div className={`flex items-center gap-2 p-3 border rounded-xl text-sm ${
                    isDark 
                        ? "bg-amber-950/40 border-amber-800/40 text-amber-300" 
                        : "bg-amber-50 border-amber-200 text-amber-700"
                }`}>
                    <AlertCircle className="w-4 h-4" />
                    Đã đạt giới hạn {MAX_EVENTS} sự kiện
                </div>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className={`sm:max-w-lg max-h-[85vh] overflow-hidden p-0 flex flex-col border transition-all ${
                    isDark 
                        ? "bg-slate-900 border-purple-500/20 text-white" 
                        : "bg-white border-gray-200 text-gray-800"
                }`}>
                    <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-0">
                        <DialogTitle className={isDark ? "text-purple-100" : "text-gray-950"}>
                            {isEditing ? "Sửa sự kiện" : "Thêm sự kiện mới"}
                        </DialogTitle>
                    </DialogHeader>

                    {/* Scrollable Content */}
                    <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4">
                        <div className="space-y-4">
                            {/* Error Message */}
                            {error && (
                                <div className={`p-3 border rounded-lg text-sm ${
                                    isDark ? "bg-red-950/40 border-red-800/40 text-red-300" : "bg-red-50 border-red-200 text-red-600"
                                }`}>
                                    {error}
                                </div>
                            )}

                            {/* Title Input */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="title" className={isDark ? "text-purple-200" : "text-gray-700"}>Tiêu đề *</Label>
                                    <span className={`text-xs ${formData.title.length > 50 ? 'text-red-500' : isDark ? 'text-purple-400/60' : 'text-gray-400'}`}>
                                        {formData.title.length}/50
                                    </span>
                                </div>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, title: e.target.value.slice(0, 50) }))
                                    }
                                    placeholder="Lần hẹn đầu tiên, Kỷ niệm, ..."
                                    maxLength={50}
                                    className={isDark ? "bg-slate-950/60 border-purple-500/30 text-white placeholder-purple-300/30 focus-visible:ring-purple-500/50 focus-visible:border-purple-400" : ""}
                                />
                            </div>

                            {/* Date Input */}
                            <div className="space-y-2">
                                <Label htmlFor="date" className={isDark ? "text-purple-200" : "text-gray-700"}>Ngày *</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={formData.date}
                                    style={{ colorScheme: isDark ? "dark" : "light" }}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, date: e.target.value }))
                                    }
                                    className={isDark ? "bg-slate-950/60 border-purple-500/30 text-white focus-visible:ring-purple-500/50 focus-visible:border-purple-400" : ""}
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="description" className={isDark ? "text-purple-200" : "text-gray-700"}>Mô tả (tùy chọn)</Label>
                                    <span className={`text-xs ${formData.description.length > 300 ? 'text-red-500' : isDark ? 'text-purple-400/60' : 'text-gray-400'}`}>
                                        {formData.description.length}/300
                                    </span>
                                </div>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, description: e.target.value.slice(0, 300) }))
                                    }
                                    placeholder="Chuyện gì đã xảy ra vào ngày này..."
                                    rows={3}
                                    maxLength={300}
                                    className={isDark ? "bg-slate-950/60 border-purple-500/30 text-white placeholder-purple-300/30 focus-visible:ring-purple-500/50 focus-visible:border-purple-400 resize-none" : "resize-none"}
                                />
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-2">
                                <Label className={isDark ? "text-purple-200" : "text-gray-700"}>Ảnh (tùy chọn)</Label>
                                {formData.image_url ? (
                                    <div className={`relative aspect-video rounded-lg overflow-hidden border ${isDark ? "border-purple-950/40 bg-slate-950" : "bg-gray-100 border-gray-200"}`}>
                                        <Image
                                            src={formData.image_url}
                                            alt="Event photo"
                                            fill
                                            className="object-cover"
                                        />
                                        <button
                                            onClick={() => setFormData((prev) => ({ ...prev, image_url: "" }))}
                                            className={`absolute top-2 right-2 p-2 rounded-full shadow transition-colors ${
                                                isDark ? "bg-slate-800 text-purple-300 hover:bg-slate-700 hover:text-white" : "bg-white/90 hover:bg-white text-gray-700"
                                            }`}
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : showImageUpload ? (
                                    <ImageUpload
                                        slug={slug}
                                        onUploadComplete={handleImageUpload}
                                        maxSizeMB={5}
                                    />
                                ) : (
                                    <button
                                        onClick={() => setShowImageUpload(true)}
                                        className={`w-full py-6 border-2 border-dashed rounded-lg transition-colors flex flex-col items-center justify-center ${
                                            isDark 
                                                ? "border-purple-500/20 text-purple-400/60 hover:text-purple-300 hover:border-purple-500/40 bg-slate-950/30 hover:bg-slate-950/50" 
                                                : "border-gray-300 text-gray-400 hover:text-gray-500 hover:border-gray-400 bg-gray-50/50 hover:bg-gray-50"
                                        }`}
                                    >
                                        <ImageIcon className="w-6 h-6 mx-auto mb-1 text-inherit" />
                                        <span className="text-sm font-medium">Thêm ảnh</span>
                                    </button>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* Fixed Footer Actions */}
                    <div className={`flex-shrink-0 border-t px-4 sm:px-6 py-4 ${isDark ? "bg-slate-900/60 border-purple-500/20" : "bg-white border-t border-gray-200"}`}>
                        <div className="flex gap-2 sm:gap-3">
                            <Button
                                onClick={handleSave}
                                disabled={!isFormValid || isSaving}
                                className={`flex-1 text-white font-medium ${
                                    isDark 
                                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-900/35" 
                                        : "bg-gradient-to-r from-indigo-500 to-purple-500"
                                }`}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    isEditing ? "Cập nhật" : "Thêm sự kiện"
                                )}
                            </Button>
                            <Button 
                                variant={isDark ? "secondary" : "outline"} 
                                onClick={handleCloseDialog}
                                className={isDark ? "bg-slate-800 text-purple-300 hover:bg-slate-700 hover:text-white border-purple-500/20" : ""}
                            >
                                Hủy
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Timeline List */}
            {timeline.length === 0 ? (
                /* Bọc trong `dark` để EmptyState dùng biến thể dark: khi nội dung nền tối
                   (trang sửa không gắn class `dark` lên <html> như trang công khai). */
                <div className={isDark ? "dark" : undefined}>
                    <EmptyState
                        compact
                        icon={<Calendar className="w-5 h-5" />}
                        title="Chưa có sự kiện nào"
                        description={`Thêm cột mốc đầu tiên để kể lại câu chuyện của bạn. Dòng thời gian chứa tối đa ${MAX_EVENTS} sự kiện.`}
                        className={isDark ? "dark:bg-slate-950/40 dark:border-purple-500/25" : "bg-gray-50"}
                        action={
                            <Button
                                onClick={handleAddNew}
                                className={`text-white transition-all shadow-md ${
                                    isDark
                                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-900/35"
                                        : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                                }`}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Thêm sự kiện đầu tiên
                            </Button>
                        }
                    />
                </div>
            ) : (
                <>
                    {/* Gợi ý + trạng thái lưu thứ tự */}
                    <div className={`flex items-center gap-1.5 text-xs ${isDark ? "text-purple-400/60" : "text-gray-400"}`}>
                        {isReordering ? (
                            <>
                                <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                                <span>Đang lưu thứ tự...</span>
                            </>
                        ) : (
                            <>
                                <GripVertical className="w-3 h-3" aria-hidden="true" />
                                <span>Kéo thả để sắp xếp lại sự kiện (ngày chỉ để hiển thị)</span>
                            </>
                        )}
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                        accessibility={{ announcements }}
                    >
                        <SortableContext
                            items={timeline.map((e) => e.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-3">
                                {timeline.map((event) => (
                                    <SortableEvent
                                        key={event.id}
                                        event={event}
                                        isDeleting={deletingId === event.id}
                                        isReorderPending={isReordering}
                                        isDark={isDark}
                                        onEdit={() => handleEdit(event)}
                                        onDelete={() => setDeleteConfirmId(event.id)}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </>
            )}
        </div>
    );
}
