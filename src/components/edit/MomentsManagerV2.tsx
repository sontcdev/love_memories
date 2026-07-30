"use client";

// MomentsManagerV2 — bản giữ nguyên implementation mới (toast, auto-save, undo/redo…).
// MomentsManager.tsx đã rollback về đúng phiên bản trên nhánh deploy và chỉ phục vụ
// các LinkType đã có trên deploy; file V2 này phục vụ WEDDING/TRAVEL/FRIENDSHIP.

import { useState, useCallback } from "react";
import { Gallery } from "@prisma/client";
import { MultiImageUpload } from "@/components/ui/MultiImageUpload";
import { ShimmerImage } from "@/components/ui/ShimmerImage";
import {
    addGalleryImage,
    updateGalleryImage,
    deleteGalleryImage,
    reorderGalleryImages,
} from "@/app/actions/gallery-actions";
import {
    Plus,
    Trash2,
    Loader2,
    X,
    Edit3,
    Check,
    Image as ImageIcon,
    AlertCircle,
    GripVertical,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/empty-state";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const MAX_PHOTOS = 20;

interface MomentsManagerV2Props {
    slug: string;
    initialGallery: Gallery[];
}

// Sortable Image Component
interface SortableImageProps {
    image: Gallery;
    isDeleting: boolean;
    onEdit: () => void;
    onDelete: () => void;
}

function SortableImage({ image, isDeleting, onEdit, onDelete }: SortableImageProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: image.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-md transition-all ${isDeleting ? "opacity-50" : ""
                } ${isDragging ? "ring-2 ring-purple-500 shadow-xl scale-105" : ""}`}
        >
            <ShimmerImage
                src={image.image_url}
                alt={image.caption || "Gallery photo"}
                fill
                className="object-cover"
            />

            {/* Loading overlay for this image */}
            {isDeleting && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
                 {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="absolute top-2 left-2 p-2 bg-white/90 rounded-full cursor-grab active:cursor-grabbing shadow-sm md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity hover:bg-white"
                    title="Kéo để sắp xếp"
                >
                    <GripVertical className="w-4 h-4 text-gray-600" />
                </div>

                {/* Actions */}
                <div className="absolute top-2 right-2 flex gap-1 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity">
                    <button
                        onClick={onEdit}
                        className="p-2 bg-white/90 rounded-full hover:bg-white shadow-sm"
                        title="Sửa chú thích"
                    >
                        <Edit3 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                        onClick={onDelete}
                        disabled={isDeleting}
                        className="p-2 bg-white/90 rounded-full hover:bg-red-50 shadow-sm disabled:opacity-50"
                        title="Xóa"
                    >
                        {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                        ) : (
                            <Trash2 className="w-4 h-4 text-red-500" />
                        )}
                    </button>
                </div>

                {/* Caption */}
                {image.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity">
                        <p className="text-white text-sm truncate">{image.caption}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export function MomentsManagerV2({ slug, initialGallery }: MomentsManagerV2Props) {
    const [gallery, setGallery] = useState<Gallery[]>(initialGallery);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [editingImage, setEditingImage] = useState<Gallery | null>(null);
    const [editCaption, setEditCaption] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [savingCaption, setSavingCaption] = useState(false);

    const isLimitReached = gallery.length >= MAX_PHOTOS;
    const remainingSlots = MAX_PHOTOS - gallery.length;

    // Handle multiple image uploads
    const handleUploadComplete = useCallback(
        async (urls: string[]) => {
            // Add all images in parallel
            const results = await Promise.all(
                urls.map(url => addGalleryImage(slug, url))
            );

            const successfulImages = results
                .filter(r => r.success && r.data)
                .map(r => r.data as Gallery);

            if (successfulImages.length > 0) {
                setGallery(prev => [...prev, ...successfulImages]);
            }

            setIsAddingNew(false);
        },
        [slug]
    );

    // Handle delete
    const handleDelete = async (imageId: string) => {
        setDeleteConfirmId(null);
        setDeletingId(imageId);

        const result = await deleteGalleryImage(slug, imageId);

        if (result.success) {
            setGallery((prev) => prev.filter((g) => g.id !== imageId));
        }

        setDeletingId(null);
    };

    // Handle edit caption
    const startEdit = (image: Gallery) => {
        setEditingImage(image);
        setEditCaption(image.caption || "");
    };

    const closeEditDialog = () => {
        setEditingImage(null);
        setEditCaption("");
    };

    const saveCaption = async () => {
        if (!editingImage) return;

        setSavingCaption(true);

        const result = await updateGalleryImage(slug, editingImage.id, editCaption);

        if (result.success) {
            setGallery((prev) =>
                prev.map((g) => (g.id === editingImage.id ? { ...g, caption: editCaption } : g))
            );
        }

        closeEditDialog();
        setSavingCaption(false);
    };

    // Drag and drop sensors
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

    // Handle drag end
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = gallery.findIndex((item) => item.id === active.id);
            const newIndex = gallery.findIndex((item) => item.id === over.id);

            // Update local state immediately for smooth UX
            const newGallery = arrayMove(gallery, oldIndex, newIndex);
            setGallery(newGallery);

            const imageIds = newGallery.map((img) => img.id);
            await reorderGalleryImages(slug, imageIds);
        }
    };

    return (
        <div className="space-y-6">
            {/* Delete Confirm Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirmId !== null}
                title="Xóa ảnh"
                message="Bạn có chắc muốn xóa ảnh này khỏi bộ sưu tập?"
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
                    <h2 className="text-xl font-semibold text-gray-800">Khoảnh khắc</h2>
                    <p className="text-sm text-gray-500">
                        Đã sử dụng: {gallery.length} / {MAX_PHOTOS} ảnh
                    </p>
                </div>
                <button
                    onClick={() => setIsAddingNew(true)}
                    disabled={isLimitReached}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus className="w-4 h-4" />
                    Thêm ảnh
                </button>
            </div>

            {/* Limit Warning */}
            {isLimitReached && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    Đã đạt giới hạn {MAX_PHOTOS} ảnh. Xóa bớt ảnh để thêm mới.
                </div>
            )}

            {/* Add New Photos Modal */}
            {isAddingNew && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold">Thêm ảnh</h3>
                                <p className="text-sm text-gray-500">Chọn tối đa {Math.min(5, remainingSlots)} ảnh</p>
                            </div>
                            <button
                                onClick={() => setIsAddingNew(false)}
                                className="p-2 hover:bg-gray-100 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <MultiImageUpload
                            slug={slug}
                            onUploadComplete={handleUploadComplete}
                            maxFiles={Math.min(5, remainingSlots)}
                            maxSizeMB={5}
                        />
                    </div>
                </div>
            )}

            {/* Gallery Grid */}
            {gallery.length === 0 ? (
                <EmptyState
                    compact
                    icon={<ImageIcon className="w-5 h-5" />}
                    title="Chưa có khoảnh khắc nào"
                    description={`Tải ảnh lên để lưu lại những khoảnh khắc đáng nhớ. Bạn có thể thêm tối đa ${MAX_PHOTOS} ảnh, mỗi lần chọn tối đa 5 ảnh.`}
                    className="bg-gray-50"
                    action={
                        <button
                            onClick={() => setIsAddingNew(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-md"
                        >
                            <Plus className="w-4 h-4" />
                            Tải ảnh đầu tiên lên
                        </button>
                    }
                />
            ) : (
                <>
                    {/* Helper text */}
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                        <GripVertical className="w-3 h-3" />
                        Kéo thả để sắp xếp lại ảnh
                    </p>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={gallery.map((img) => img.id)}
                            strategy={rectSortingStrategy}
                        >
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {gallery.map((image) => (
                                    <SortableImage
                                        key={image.id}
                                        image={image}
                                        isDeleting={deletingId === image.id}
                                        onEdit={() => startEdit(image)}
                                        onDelete={() => setDeleteConfirmId(image.id)}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </>
            )}

            {/* Edit Caption Dialog */}
            {editingImage && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Sửa chú thích</h3>
                            <button
                                onClick={closeEditDialog}
                                disabled={savingCaption}
                                className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Image Preview */}
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 mb-4">
                            <ShimmerImage
                                src={editingImage.image_url}
                                alt="Preview"
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* Caption Input */}
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700">Chú thích</label>
                                <span className={`text-xs ${editCaption.length > 50 ? 'text-red-500' : 'text-gray-400'}`}>
                                    {editCaption.length}/50
                                </span>
                            </div>
                            <input
                                type="text"
                                value={editCaption}
                                onChange={(e) => setEditCaption(e.target.value.slice(0, 50))}
                                placeholder="Nhập chú thích cho ảnh này..."
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                autoFocus
                                disabled={savingCaption}
                                maxLength={50}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={saveCaption}
                                disabled={savingCaption}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium disabled:opacity-50"
                            >
                                {savingCaption ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Lưu
                                    </>
                                )}
                            </button>
                            <button
                                onClick={closeEditDialog}
                                disabled={savingCaption}
                                className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium disabled:opacity-50"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
