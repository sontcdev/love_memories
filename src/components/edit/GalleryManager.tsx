"use client";

import { useState, useCallback } from "react";
import { Gallery } from "@prisma/client";
import { MultiImageUpload } from "@/components/ui/MultiImageUpload";
import { ShimmerImage } from "@/components/ui/ShimmerImage";
import {
    addGalleryImage,
    updateGalleryImage,
    deleteGalleryImage,
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
} from "lucide-react";

const MAX_PHOTOS = 20;

interface GalleryManagerProps {
    slug: string;
    initialGallery: Gallery[];
}

// Full-screen loading overlay component
function LoadingOverlay({ message }: { message: string }) {
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]">
            <div className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-pink-200 rounded-full animate-pulse" />
                    <Loader2 className="w-12 h-12 text-pink-500 animate-spin absolute inset-0" />
                </div>
                <p className="text-gray-700 font-medium">{message}</p>
            </div>
        </div>
    );
}

export function GalleryManager({ slug, initialGallery }: GalleryManagerProps) {
    const [gallery, setGallery] = useState<Gallery[]>(initialGallery);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [editingImage, setEditingImage] = useState<Gallery | null>(null);
    const [editCaption, setEditCaption] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Loading states
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [savingCaption, setSavingCaption] = useState(false);

    const isLimitReached = gallery.length >= MAX_PHOTOS;
    const remainingSlots = MAX_PHOTOS - gallery.length;

    // Handle multiple image uploads
    const handleUploadComplete = useCallback(
        async (urls: string[]) => {
            setIsLoading(true);
            setLoadingMessage(`Saving ${urls.length} photo${urls.length > 1 ? "s" : ""}...`);

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
            setIsLoading(false);
            setLoadingMessage("");
        },
        [slug]
    );

    // Handle delete
    const handleDelete = async (imageId: string) => {
        if (!confirm("Delete this photo?")) return;

        setDeletingId(imageId);
        setIsLoading(true);
        setLoadingMessage("Deleting photo...");

        const result = await deleteGalleryImage(slug, imageId);

        if (result.success) {
            setGallery((prev) => prev.filter((g) => g.id !== imageId));
        }

        setDeletingId(null);
        setIsLoading(false);
        setLoadingMessage("");
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
        setIsLoading(true);
        setLoadingMessage("Saving caption...");

        const result = await updateGalleryImage(slug, editingImage.id, editCaption);

        if (result.success) {
            setGallery((prev) =>
                prev.map((g) => (g.id === editingImage.id ? { ...g, caption: editCaption } : g))
            );
        }

        closeEditDialog();
        setSavingCaption(false);
        setIsLoading(false);
        setLoadingMessage("");
    };

    return (
        <div className="space-y-6">
            {/* Global Loading Overlay */}
            {isLoading && <LoadingOverlay message={loadingMessage} />}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">Gallery</h2>
                    <p className="text-sm text-gray-500">
                        {gallery.length} / {MAX_PHOTOS} photos
                    </p>
                </div>
                <button
                    onClick={() => setIsAddingNew(true)}
                    disabled={isLoading || isLimitReached}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus className="w-4 h-4" />
                    Add Photo
                </button>
            </div>

            {/* Limit Warning */}
            {isLimitReached && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    Maximum {MAX_PHOTOS} photos reached. Delete some photos to add more.
                </div>
            )}

            {/* Add New Photos Modal */}
            {isAddingNew && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold">Add Photos</h3>
                                <p className="text-sm text-gray-500">Select up to {Math.min(5, remainingSlots)} photos</p>
                            </div>
                            <button
                                onClick={() => setIsAddingNew(false)}
                                disabled={isLoading}
                                className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
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
                <div className="text-center py-16 bg-gray-50 rounded-2xl">
                    <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-4">No photos yet</p>
                    <button
                        onClick={() => setIsAddingNew(true)}
                        className="text-pink-500 hover:text-pink-600 font-medium"
                    >
                        Upload your first photo
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {gallery.map((image) => (
                        <div
                            key={image.id}
                            className={`group relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-md transition-opacity ${deletingId === image.id ? "opacity-50" : ""
                                }`}
                        >
                            <ShimmerImage
                                src={image.image_url}
                                alt={image.caption || "Gallery photo"}
                                fill
                                className="object-cover"
                            />

                            {/* Loading overlay for this image */}
                            {deletingId === image.id && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                </div>
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
                                {/* Actions */}
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => startEdit(image)}
                                        disabled={isLoading}
                                        className="p-2 bg-white/90 rounded-full hover:bg-white shadow-sm disabled:opacity-50"
                                        title="Edit caption"
                                    >
                                        <Edit3 className="w-4 h-4 text-gray-600" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(image.id)}
                                        disabled={isLoading || deletingId === image.id}
                                        className="p-2 bg-white/90 rounded-full hover:bg-red-50 shadow-sm disabled:opacity-50"
                                        title="Delete"
                                    >
                                        {deletingId === image.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                                        ) : (
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        )}
                                    </button>
                                </div>

                                {/* Caption */}
                                {image.caption && (
                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-sm truncate">{image.caption}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Caption Dialog */}
            {editingImage && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Edit Caption</h3>
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
                            <label className="text-sm font-medium text-gray-700">Caption</label>
                            <input
                                type="text"
                                value={editCaption}
                                onChange={(e) => setEditCaption(e.target.value)}
                                placeholder="Enter caption for this photo..."
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                autoFocus
                                disabled={savingCaption}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={saveCaption}
                                disabled={savingCaption}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium disabled:opacity-50"
                            >
                                {savingCaption ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Save Caption
                                    </>
                                )}
                            </button>
                            <button
                                onClick={closeEditDialog}
                                disabled={savingCaption}
                                className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
