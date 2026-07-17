"use client";

import { useState, useOptimistic, useTransition } from "react";
import Image from "next/image";
import { Timeline } from "@prisma/client";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { VideoInput, VoiceRecorder, VideoPlayer } from "@/components/media";
import {
    upsertTimelineEvent,
    deleteTimelineEvent,
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
import {
    Plus,
    Trash2,
    Loader2,
    X,
    Edit3,
    Star,
    Image as ImageIcon,
    AlertCircle,
    Video,
    Mic,
} from "lucide-react";

interface CareerPathManagerProps {
    slug: string;
    initialTimeline: Timeline[];
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

export function CareerPathManager({ slug, initialTimeline }: CareerPathManagerProps) {
    const [, startTransition] = useTransition();

    // Optimistic state for instant UI updates
    const [, addOptimistic] = useOptimistic(
        initialTimeline,
        (state: Timeline[], action: { type: "add" | "update" | "delete"; payload: Timeline | string }) => {
            switch (action.type) {
                case "add":
                    return [...state, action.payload as Timeline].sort(
                        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                    );
                case "update":
                    return state
                        .map((e) => (e.id === (action.payload as Timeline).id ? (action.payload as Timeline) : e))
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                case "delete":
                    return state.filter((e) => e.id !== action.payload);
                default:
                    return state;
            }
        }
    );

    const [timeline, setTimeline] = useState<Timeline[]>(initialTimeline);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState<FormData>(emptyForm);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [showImageUpload, setShowImageUpload] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            // Update real state
            if (isEditing) {
                setTimeline((prev) =>
                    prev
                        .map((e) => (e.id === formData.id ? (result.data as Timeline) : e))
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                );
            } else {
                setTimeline((prev) =>
                    [...prev, result.data as Timeline].sort(
                        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                );
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


    return (
        <div className="space-y-6">
            {/* Delete Confirm Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirmId !== null}
                title="Xóa cột mốc"
                message="Bạn có chắc muốn xóa cột mốc này? Hành động này không thể hoàn tác."
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
                    <h2 className="text-xl font-semibold text-gray-800">Sự nghiệp Idol</h2>
                    <p className="text-sm text-gray-500">
                        {timeline.length} / {MAX_EVENTS} cột mốc
                    </p>
                </div>
                <Button
                    onClick={handleAddNew}
                    disabled={isLimitReached}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm cột mốc
                </Button>
            </div>

            {/* Limit Warning */}
            {isLimitReached && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Đã đạt giới hạn {MAX_EVENTS} cột mốc
                </div>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? "Sửa cột mốc" : "Thêm cột mốc mới"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Title Input */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="title">Tiêu đề *</Label>
                                <span className={`text-xs ${formData.title.length > 50 ? 'text-red-500' : 'text-gray-400'}`}>
                                    {formData.title.length}/50
                                </span>
                            </div>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, title: e.target.value.slice(0, 50) }))
                                }
                                placeholder="Debut, First Win, First Concert, ..."
                                maxLength={50}
                            />
                        </div>

                        {/* Date Input */}
                        <div className="space-y-2">
                            <Label htmlFor="date">Ngày *</Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                                }
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="description">Mô tả (tùy chọn)</Label>
                                <span className={`text-xs ${formData.description.length > 300 ? 'text-red-500' : 'text-gray-400'}`}>
                                    {formData.description.length}/300
                                </span>
                            </div>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, description: e.target.value.slice(0, 300) }))
                                }
                                placeholder="Miêu tả cột mốc quan trọng này..."
                                rows={3}
                                maxLength={300}
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-2">
                            <Label>Ảnh (tùy chọn)</Label>
                            {formData.image_url ? (
                                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                                    <Image
                                        src={formData.image_url}
                                        alt="Event photo"
                                        fill
                                        className="object-cover"
                                    />
                                    <button
                                        onClick={() => setFormData((prev) => ({ ...prev, image_url: "" }))}
                                        className="absolute top-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white shadow"
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
                                    className="w-full py-6 border-2 border-dashed rounded-lg text-gray-400 hover:text-gray-500 hover:border-gray-400 transition-colors"
                                >
                                    <ImageIcon className="w-6 h-6 mx-auto mb-1" />
                                    <span className="text-sm">Thêm ảnh</span>
                                </button>
                            )}
                        </div>

                        {/* Video URL Input */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-1">
                                <Video className="w-4 h-4" />
                                Video (YouTube/TikTok)
                            </Label>
                            {formData.video_url ? (
                                <div className="space-y-2">
                                    <VideoPlayer url={formData.video_url} className="rounded-lg" />
                                    <button
                                        onClick={() => setFormData((prev) => ({ ...prev, video_url: "" }))}
                                        className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
                                    >
                                        <X className="w-4 h-4" />
                                        Xóa video
                                    </button>
                                </div>
                            ) : (
                                <VideoInput
                                    value={formData.video_url}
                                    onChange={(url) => setFormData((prev) => ({ ...prev, video_url: url }))}
                                    placeholder="Dán link YouTube hoặc TikTok..."
                                />
                            )}
                        </div>

                        {/* Voice Recording */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-1">
                                <Mic className="w-4 h-4" />
                                Ghi âm (tùy chọn)
                            </Label>
                            {formData.audio_url ? (
                                <div className="space-y-2">
                                    <audio
                                        src={formData.audio_url}
                                        controls
                                        className="w-full h-10"
                                    />
                                    <button
                                        onClick={() => setFormData((prev) => ({ ...prev, audio_url: "" }))}
                                        className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
                                    >
                                        <X className="w-4 h-4" />
                                        Xóa ghi âm
                                    </button>
                                </div>
                            ) : (
                                <VoiceRecorder
                                    slug={slug}
                                    onUploadComplete={(url) => setFormData((prev) => ({ ...prev, audio_url: url }))}
                                />
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                onClick={handleSave}
                                disabled={!isFormValid || isSaving}
                                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
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
                            <Button variant="outline" onClick={handleCloseDialog}>
                                Hủy
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Timeline List */}
            {timeline.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl">
                    <Star className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-4">Chưa có cột mốc nào</p>
                    <button
                        onClick={handleAddNew}
                        className="text-purple-500 hover:text-purple-600 font-medium"
                    >
                        Thêm cột mốc đầu tiên
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {timeline.map((event) => (
                        <div
                            key={event.id}
                            className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex gap-3 items-start">
                                {/* Date Badge */}
                                <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex flex-col items-center justify-center text-white">
                                    <span className="text-base sm:text-lg font-bold leading-none">
                                        {new Date(event.date).getDate()}
                                    </span>
                                    <span className="text-xs opacity-80">
                                        {new Date(event.date).toLocaleDateString("en", { month: "short" })}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-800 break-words">{event.title}</h3>
                                    <p className="text-xs text-gray-400">
                                        {new Date(event.date).toLocaleDateString("vi-VN", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </p>
                                    {event.description && (
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                            {event.description}
                                        </p>
                                    )}
                                </div>

                                {/* Thumbnail */}
                                {event.image_url && (
                                    <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-gray-100">
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
                            <div className="flex justify-end gap-1 mt-3 pt-3 border-t border-gray-100 sm:border-t-0 sm:mt-0 sm:pt-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(event)}
                                    className="p-2 hover:bg-gray-100 rounded-lg text-sm text-purple-500 flex items-center gap-1"
                                    title="Sửa"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    <span className="sm:hidden">Sửa</span>
                                </button>
                                <button
                                    onClick={() => setDeleteConfirmId(event.id)}
                                    disabled={deletingId === event.id}
                                    className="p-2 hover:bg-red-50 rounded-lg text-sm text-red-500 flex items-center gap-1"
                                    title="Xóa"
                                >
                                    {deletingId === event.id ? (
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
                    ))}
                </div>
            )}
        </div>
    );
}
