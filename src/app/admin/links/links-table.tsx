"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link, LinkType } from "@prisma/client";
import {
    createLink,
    deleteLink,
    toggleLinkStatus,
    resetLinkPin,
} from "@/app/actions/admin-actions";
import { QRCodeDialog } from "@/components/admin/QRCodeDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Plus,
    Trash2,
    ExternalLink,
    Copy,
    Check,
    Loader2,
    Power,
    Heart,
    Star,
    Users,
    QrCode,
    KeyRound,
    Shuffle,
} from "lucide-react";

type LinkWithUser = Link & {
    user: {
        id: string;
        username: string;
    };
};

interface LinksTableProps {
    initialLinks: LinkWithUser[];
}

export function LinksTable({ initialLinks }: LinksTableProps) {
    const router = useRouter();
    const [links, setLinks] = useState<LinkWithUser[]>(initialLinks);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [createdCredentials, setCreatedCredentials] = useState<{
        username: string;
        password: string;
        slug: string;
    } | null>(null);
    const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [qrDialog, setQrDialog] = useState<{ slug: string; username: string } | null>(null);
    const [resettingPinId, setResettingPinId] = useState<string | null>(null);
    const [resetPinResult, setResetPinResult] = useState<{ username: string; newPin: string } | null>(null);
    const [resetPinDialog, setResetPinDialog] = useState<{ linkId: string; username: string } | null>(null);
    const [resetPinInput, setResetPinInput] = useState("");
    const [resetPinError, setResetPinError] = useState<string | null>(null);

    const getTypeIcon = (type: LinkType) => {
        switch (type) {
            case "LOVE":
                return <Heart className="w-4 h-4 text-pink-400" />;
            case "IDOL":
                return <Star className="w-4 h-4 text-yellow-400" />;
            case "EVERY":
                return <Users className="w-4 h-4 text-blue-400" />;
        }
    };

    const getTypeBadgeColor = (type: LinkType) => {
        switch (type) {
            case "LOVE":
                return "bg-pink-500/10 text-pink-400 border-pink-500/30";
            case "IDOL":
                return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
            case "EVERY":
                return "bg-blue-500/10 text-blue-400 border-blue-500/30";
        }
    };

    async function handleCreate(formData: FormData) {
        setIsCreating(true);
        setCreateError(null);

        const result = await createLink(formData);

        if (result.success && result.data) {
            setCreatedCredentials({
                username: result.data.username,
                password: result.data.password,
                slug: result.data.slug,
            });
            router.refresh();
            // Refresh the links list
            const updatedLinks = await fetch("/admin/links").then((res) => res.json());
            if (updatedLinks) {
                router.refresh();
            }
        } else {
            setCreateError(result.error || "Failed to create link");
        }

        setIsCreating(false);
    }

    async function handleDelete(linkId: string) {
        if (!confirm("Are you sure you want to delete this link? This action cannot be undone.")) {
            return;
        }

        setDeletingId(linkId);
        const result = await deleteLink(linkId);

        if (result.success) {
            setLinks(links.filter((link) => link.id !== linkId));
        } else {
            alert(result.error || "Failed to delete link");
        }

        setDeletingId(null);
    }

    async function handleToggleStatus(linkId: string) {
        setTogglingId(linkId);
        const result = await toggleLinkStatus(linkId);

        if (result.success && result.data) {
            setLinks(
                links.map((link) =>
                    link.id === linkId ? { ...link, is_active: result.data.is_active } : link
                )
            );
        }

        setTogglingId(null);
    }

    function copyToClipboard(text: string, slug: string) {
        navigator.clipboard.writeText(text);
        setCopiedSlug(slug);
        setTimeout(() => setCopiedSlug(null), 2000);
    }

    function generateRandomPin() {
        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        setResetPinInput(pin);
    }

    function openResetPinDialog(linkId: string, username: string) {
        setResetPinDialog({ linkId, username });
        setResetPinInput("");
        setResetPinError(null);
    }

    function closeResetPinDialog() {
        setResetPinDialog(null);
        setResetPinInput("");
        setResetPinError(null);
    }

    async function handleResetPin() {
        if (!resetPinDialog) return;

        // Validate if custom PIN is provided
        if (resetPinInput && !/^\d{6}$/.test(resetPinInput)) {
            setResetPinError("PIN must be exactly 6 digits");
            return;
        }

        setResettingPinId(resetPinDialog.linkId);
        setResetPinError(null);

        const result = await resetLinkPin(resetPinDialog.linkId, resetPinInput || undefined);

        if (result.success && result.data) {
            setResetPinResult({
                username: result.data.username,
                newPin: result.data.newPin,
            });
            closeResetPinDialog();
        } else {
            setResetPinError(result.error || "Failed to reset PIN");
        }

        setResettingPinId(null);
    }

    function handleDialogClose() {
        setIsCreateOpen(false);
        setCreateError(null);
        setCreatedCredentials(null);
    }

    return (
        <div className="space-y-6">
            {/* Actions Bar */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Links Management</h2>
                    <p className="text-slate-400 mt-1">Create and manage user links</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Create New Link
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700 text-white">
                        {createdCredentials ? (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="text-green-400 flex items-center gap-2">
                                        <Check className="w-5 h-5" />
                                        Link Created Successfully!
                                    </DialogTitle>
                                    <DialogDescription className="text-slate-400">
                                        Save these credentials - they won&apos;t be shown again.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Username:</span>
                                            <span className="font-mono text-white">{createdCredentials.username}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">PIN:</span>
                                            <span className="font-mono text-white text-lg tracking-wider">
                                                {createdCredentials.password}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Link:</span>
                                            <span className="font-mono text-violet-400">
                                                /{createdCredentials.slug}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleDialogClose} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                                        Close
                                    </Button>
                                </DialogFooter>
                            </>
                        ) : (
                            <>
                                <DialogHeader>
                                    <DialogTitle>Create New Link</DialogTitle>
                                    <DialogDescription className="text-slate-400">
                                        Create a new user with their personalized link.
                                    </DialogDescription>
                                </DialogHeader>
                                <form action={handleCreate}>
                                    <div className="space-y-4 py-4">
                                        {createError && (
                                            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                                                {createError}
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Label htmlFor="create-username" className="text-slate-300">
                                                Username
                                            </Label>
                                            <Input
                                                id="create-username"
                                                name="username"
                                                placeholder="Enter username"
                                                required
                                                className="bg-slate-900/50 border-slate-600 text-white"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="create-password" className="text-slate-300">
                                                PIN (6 digits) - Optional
                                            </Label>
                                            <Input
                                                id="create-password"
                                                name="password"
                                                placeholder="Auto-generate if empty"
                                                maxLength={6}
                                                pattern="[0-9]{6}"
                                                className="bg-slate-900/50 border-slate-600 text-white"
                                            />
                                            <p className="text-xs text-slate-500">
                                                Leave empty to auto-generate a 6-digit PIN
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="create-type" className="text-slate-300">
                                                Template Type
                                            </Label>
                                            <Select name="linkType" defaultValue="LOVE">
                                                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                                                    <SelectValue placeholder="Select template" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-800 border-slate-700">
                                                    <SelectItem value="LOVE" className="text-white focus:bg-slate-700 focus:text-white">
                                                        <div className="flex items-center gap-2">
                                                            <Heart className="w-4 h-4 text-pink-400" />
                                                            Love Template
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="IDOL" className="text-white focus:bg-slate-700 focus:text-white">
                                                        <div className="flex items-center gap-2">
                                                            <Star className="w-4 h-4 text-yellow-400" />
                                                            Idol Template
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="EVERY" className="text-white focus:bg-slate-700 focus:text-white">
                                                        <div className="flex items-center gap-2">
                                                            <Users className="w-4 h-4 text-blue-400" />
                                                            Every Template
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleDialogClose}
                                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isCreating}
                                            className="bg-gradient-to-r from-violet-600 to-purple-600"
                                        >
                                            {isCreating ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Creating...
                                                </>
                                            ) : (
                                                "Create Link"
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            {/* Table */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-700/50 hover:bg-slate-700/20">
                            <TableHead className="text-slate-400">Username</TableHead>
                            <TableHead className="text-slate-400">Slug</TableHead>
                            <TableHead className="text-slate-400">Template</TableHead>
                            <TableHead className="text-slate-400">Status</TableHead>
                            <TableHead className="text-slate-400">Created</TableHead>
                            <TableHead className="text-slate-400 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {links.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                                    No links found. Create your first link to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            links.map((link) => (
                                <TableRow key={link.id} className="border-slate-700/50 hover:bg-slate-700/20">
                                    <TableCell className="font-medium text-white">
                                        {link.user.username}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <code className="text-violet-400 bg-violet-500/10 px-2 py-1 rounded text-sm">
                                                /{link.slug}
                                            </code>
                                            <button
                                                onClick={() =>
                                                    copyToClipboard(
                                                        `${typeof window !== "undefined" ? window.location.origin : ""}/${link.slug}`,
                                                        link.slug
                                                    )
                                                }
                                                className="text-slate-400 hover:text-white transition-colors"
                                            >
                                                {copiedSlug === link.slug ? (
                                                    <Check className="w-4 h-4 text-green-400" />
                                                ) : (
                                                    <Copy className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getTypeBadgeColor(
                                                link.type
                                            )}`}
                                        >
                                            {getTypeIcon(link.type)}
                                            {link.type}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <button
                                            onClick={() => handleToggleStatus(link.id)}
                                            disabled={togglingId === link.id}
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${link.is_active
                                                ? "bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20"
                                                : "bg-slate-500/10 text-slate-400 border border-slate-500/30 hover:bg-slate-500/20"
                                                }`}
                                        >
                                            {togglingId === link.id ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <Power className="w-3 h-3" />
                                            )}
                                            {link.is_active ? "Active" : "Inactive"}
                                        </button>
                                    </TableCell>
                                    <TableCell className="text-slate-400 text-sm">
                                        {new Date(link.created_at).toLocaleDateString("vi-VN")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setQrDialog({ slug: link.slug, username: link.user.username })}
                                                className="p-2 text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-colors"
                                                title="Show QR Code"
                                            >
                                                <QrCode className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openResetPinDialog(link.id, link.user.username)}
                                                disabled={resettingPinId === link.id}
                                                className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                                                title="Reset PIN"
                                            >
                                                {resettingPinId === link.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <KeyRound className="w-4 h-4" />
                                                )}
                                            </button>
                                            <a
                                                href={`/${link.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                            <button
                                                onClick={() => handleDelete(link.id)}
                                                disabled={deletingId === link.id}
                                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                {deletingId === link.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* QR Code Dialog */}
            <QRCodeDialog
                slug={qrDialog?.slug || ""}
                username={qrDialog?.username}
                isOpen={!!qrDialog}
                onClose={() => setQrDialog(null)}
            />

            {/* Reset PIN Input Dialog */}
            <Dialog open={!!resetPinDialog} onOpenChange={() => closeResetPinDialog()}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <KeyRound className="w-5 h-5 text-amber-400" />
                            Reset PIN
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Enter a new 6-digit PIN for <span className="text-white font-medium">{resetPinDialog?.username}</span> or generate a random one.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {resetPinError && (
                            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                                {resetPinError}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="reset-pin" className="text-slate-300">
                                New PIN (6 digits)
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    id="reset-pin"
                                    value={resetPinInput}
                                    onChange={(e) => setResetPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="Leave empty to auto-generate"
                                    maxLength={6}
                                    className="bg-slate-900/50 border-slate-600 text-white font-mono text-lg tracking-widest"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={generateRandomPin}
                                    className="border-slate-600 text-slate-300 hover:bg-slate-700 px-3"
                                    title="Generate Random PIN"
                                >
                                    <Shuffle className="w-4 h-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-slate-500">
                                Leave empty to auto-generate a random 6-digit PIN
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={closeResetPinDialog}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleResetPin}
                            disabled={!!resettingPinId}
                            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                        >
                            {resettingPinId ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Resetting...
                                </>
                            ) : (
                                "Reset PIN"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reset PIN Result Dialog */}
            <Dialog open={!!resetPinResult} onOpenChange={() => setResetPinResult(null)}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-amber-400 flex items-center gap-2">
                            <KeyRound className="w-5 h-5" />
                            PIN Reset Successfully!
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Save this new PIN - it won&apos;t be shown again.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Username:</span>
                                <span className="font-mono text-white">{resetPinResult?.username}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">New PIN:</span>
                                <span className="font-mono text-amber-400 text-xl tracking-wider">
                                    {resetPinResult?.newPin}
                                </span>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={() => setResetPinResult(null)}
                            variant="outline"
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
