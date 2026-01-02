"use client";

import { useState, useOptimistic, useTransition } from "react";
import Image from "next/image";
import { Timeline } from "@prisma/client";
import { ImageUpload } from "@/components/ui/ImageUpload";
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
import {
    Plus,
    Trash2,
    Loader2,
    X,
    Edit3,
    Calendar,
    Image as ImageIcon,
    AlertCircle,
} from "lucide-react";

interface TimelineManagerProps {
    slug: string;
    initialTimeline: Timeline[];
}

interface FormData {
    id?: string;
    title: string;
    date: string;
    description: string;
    image_url: string;
}

const MAX_EVENTS = 10;

const emptyForm: FormData = {
    title: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    image_url: "",
};

export function TimelineManager({ slug, initialTimeline }: TimelineManagerProps) {
    const [, startTransition] = useTransition();

    // Optimistic state for instant UI updates
    const [, addOptimistic] = useOptimistic(
        initialTimeline,
        (state: Timeline[], action: { type: "add" | "update" | "delete"; payload: Timeline | string }) => {
            switch (action.type) {
                case "add":
                    return [...state, action.payload as Timeline].sort(
                        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
                    );
                case "update":
                    return state
                        .map((e) => (e.id === (action.payload as Timeline).id ? (action.payload as Timeline) : e))
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
    const [showImageUpload, setShowImageUpload] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Global loading state
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

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
        setIsLoading(true);
        setLoadingMessage(isEditing ? "Updating event..." : "Adding event...");
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
        });

        if (result.success && result.data) {
            // Update real state
            if (isEditing) {
                setTimeline((prev) =>
                    prev
                        .map((e) => (e.id === formData.id ? (result.data as Timeline) : e))
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                );
            } else {
                setTimeline((prev) =>
                    [...prev, result.data as Timeline].sort(
                        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
                    )
                );
            }
            handleCloseDialog();
        } else {
            setError(result.error || "Failed to save event");
        }

        setIsSaving(false);
        setIsLoading(false);
        setLoadingMessage("");
    };

    // Delete event
    const handleDelete = async (eventId: string) => {
        if (!confirm("Delete this event?")) return;

        setDeletingId(eventId);
        setIsLoading(true);
        setLoadingMessage("Deleting event...");

        startTransition(() => {
            addOptimistic({ type: "delete", payload: eventId });
        });

        const result = await deleteTimelineEvent(slug, eventId);

        if (result.success) {
            setTimeline((prev) => prev.filter((e) => e.id !== eventId));
        }

        setDeletingId(null);
        setIsLoading(false);
        setLoadingMessage("");
    };

    // Handle image upload
    const handleImageUpload = (url: string) => {
        setFormData((prev) => ({ ...prev, image_url: url }));
        setShowImageUpload(false);
    };


    return (
        <div className="space-y-6">
            {/* Global Loading Overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]">
                    <div className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 border-4 border-indigo-200 rounded-full animate-pulse" />
                            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin absolute inset-0" />
                        </div>
                        <p className="text-gray-700 font-medium">{loadingMessage}</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">Timeline</h2>
                    <p className="text-sm text-gray-500">
                        {timeline.length} / {MAX_EVENTS} events
                    </p>
                </div>
                <Button
                    onClick={handleAddNew}
                    disabled={isLimitReached || isLoading}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                </Button>
            </div>

            {/* Limit Warning */}
            {isLimitReached && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Maximum {MAX_EVENTS} events reached
                </div>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? "Edit Event" : "Add New Event"}
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
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                                }
                                placeholder="First Date, Anniversary, etc."
                            />
                        </div>

                        {/* Date Input */}
                        <div className="space-y-2">
                            <Label htmlFor="date">Date *</Label>
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
                            <Label htmlFor="description">Description (optional)</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                                }
                                placeholder="What happened on this day..."
                                rows={3}
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-2">
                            <Label>Photo (optional)</Label>
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
                                    <span className="text-sm">Add photo</span>
                                </button>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                onClick={handleSave}
                                disabled={!isFormValid || isSaving}
                                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    isEditing ? "Update Event" : "Add Event"
                                )}
                            </Button>
                            <Button variant="outline" onClick={handleCloseDialog}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Timeline List */}
            {timeline.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl">
                    <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-4">No events yet</p>
                    <button
                        onClick={handleAddNew}
                        className="text-indigo-500 hover:text-indigo-600 font-medium"
                    >
                        Add your first event
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
                                <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-400 flex flex-col items-center justify-center text-white">
                                    <span className="text-base sm:text-lg font-bold leading-none">
                                        {new Date(event.date).getDate()}
                                    </span>
                                    <span className="text-xs opacity-80">
                                        {new Date(event.date).toLocaleDateString("en", { month: "short" })}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 overflow-hidden">
                                    <h3 className="font-semibold text-gray-800 truncate">{event.title}</h3>
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
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Actions - Always visible on mobile */}
                            <div className="flex justify-end gap-1 mt-3 pt-3 border-t border-gray-100 sm:border-t-0 sm:mt-0 sm:pt-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(event)}
                                    className="p-2 hover:bg-gray-100 rounded-lg text-sm text-indigo-500 flex items-center gap-1"
                                    title="Edit"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    <span className="sm:hidden">Edit</span>
                                </button>
                                <button
                                    onClick={() => handleDelete(event.id)}
                                    disabled={deletingId === event.id}
                                    className="p-2 hover:bg-red-50 rounded-lg text-sm text-red-500 flex items-center gap-1"
                                    title="Delete"
                                >
                                    {deletingId === event.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            <span className="sm:hidden">Delete</span>
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
