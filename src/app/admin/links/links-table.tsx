"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { deleteLink, toggleLinkStatus } from "@/app/actions/admin-actions";
import {
    duplicateLink,
    exportLink,
    toggleFavorite,
} from "@/app/actions/link-management-actions";
import { QRCodeDialog } from "@/components/admin/QRCodeDialog";
import { BulkActionBar } from "@/components/admin/links/BulkActionBar";
import {
    bulkDeleteConfirmMessage,
    summarizeBulk,
    type BulkAction,
} from "@/components/admin/links/bulk-actions";
import { copyText } from "@/components/admin/links/clipboard";
import { CreateLinkDialog } from "@/components/admin/links/CreateLinkDialog";
import {
    CredentialsDialog,
    type NewLinkCredentials,
} from "@/components/admin/links/CredentialsDialog";
import { downloadJson, exportFileName } from "@/components/admin/links/export-download";
import { ImportLinkDialog } from "@/components/admin/links/ImportLinkDialog";
import { LinkFilterBar } from "@/components/admin/links/LinkFilterBar";
import {
    DEFAULT_LINK_FILTERS,
    filterAndSortLinks,
    isFilterActive,
    type LinkFilterState,
} from "@/components/admin/links/link-filters";
import {
    LinkRow,
    type RowAction,
} from "@/components/admin/links/LinkRow";
import {
    ResetPinDialog,
    type ResetPinTarget,
} from "@/components/admin/links/ResetPinDialog";
import {
    TagEditorDialog,
    type TagEditorTarget,
} from "@/components/admin/links/TagEditorDialog";
import { useAdminShortcuts } from "@/components/admin/links/use-admin-shortcuts";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/empty-state";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import type { LinkWithUser } from "@/types";
import { Upload, LinkIcon, SearchX } from "lucide-react";

/** Số cột của bảng — dùng cho `colSpan` của dòng trạng thái rỗng. */
const COLUMN_COUNT = 9;

type ConfirmState =
    | { kind: "delete-one"; link: LinkWithUser }
    | { kind: "delete-bulk"; ids: string[] };

interface LinksTableProps {
    initialLinks: LinkWithUser[];
}

/**
 * Bảng quản lý liên kết.
 *
 * Chỉ còn giữ phần điều phối: state của danh sách, lựa chọn, bộ lọc và các lời
 * gọi server action. Toàn bộ phần hiển thị đã tách sang `components/admin/links/`
 * để tệp này không phình lại như bản 751 dòng trước đó.
 *
 * Phân trang vẫn thuộc server (`page.tsx` đọc `?page=`); mọi thứ ở đây chỉ tác
 * động lên **các dòng của trang hiện tại**.
 */
export function LinksTable({ initialLinks }: LinksTableProps) {
    const router = useRouter();
    const toast = useToast();

    const [links, setLinks] = useState<LinkWithUser[]>(initialLinks);
    const [filters, setFilters] = useState<LinkFilterState>(DEFAULT_LINK_FILTERS);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [rowBusy, setRowBusy] = useState<Record<string, RowAction>>({});
    const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

    const [qrDialog, setQrDialog] = useState<{ slug: string; username: string } | null>(null);
    const [resetPinTarget, setResetPinTarget] = useState<ResetPinTarget | null>(null);
    const [tagTarget, setTagTarget] = useState<TagEditorTarget | null>(null);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [newCredentials, setNewCredentials] = useState<NewLinkCredentials | null>(null);
    const [credentialsKind, setCredentialsKind] = useState<"duplicate" | "import">("duplicate");
    const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

    const [bulkAction, setBulkAction] = useState<BulkAction | null>(null);
    const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);

    const searchRef = useRef<HTMLInputElement>(null);
    const selectAllRef = useRef<HTMLInputElement>(null);

    // Server action nào cũng gọi `revalidatePath("/admin/links")`, nên sau
    // `router.refresh()` prop mới sẽ tới đây. State phải nhận lại dữ liệu đó,
    // nếu không bảng sẽ đứng yên ở ảnh chụp lần đầu.
    useEffect(() => {
        setLinks(initialLinks);
    }, [initialLinks]);

    const visibleLinks = useMemo(() => filterAndSortLinks(links, filters), [links, filters]);
    const visibleIds = useMemo(() => visibleLinks.map((link) => link.id), [visibleLinks]);

    // Không cho phép "chọn rồi lọc đi" — thao tác hàng loạt chỉ được chạm vào
    // những dòng admin đang thực sự nhìn thấy.
    useEffect(() => {
        setSelectedIds((previous) => {
            if (previous.size === 0) return previous;
            const allowed = new Set(visibleIds);
            const next = new Set(Array.from(previous).filter((id) => allowed.has(id)));
            return next.size === previous.size ? previous : next;
        });
    }, [visibleIds]);

    const selectedCount = selectedIds.size;
    const allVisibleSelected = visibleIds.length > 0 && selectedCount === visibleIds.length;

    useEffect(() => {
        if (selectAllRef.current) {
            selectAllRef.current.indeterminate = selectedCount > 0 && !allVisibleSelected;
        }
    }, [selectedCount, allVisibleSelected]);

    const isDialogOpen =
        qrDialog !== null ||
        resetPinTarget !== null ||
        tagTarget !== null ||
        isImportOpen ||
        newCredentials !== null ||
        confirmState !== null;

    const focusSearch = useCallback(() => {
        searchRef.current?.focus();
        searchRef.current?.select();
    }, []);

    const clearSelectionAndFilters = useCallback(() => {
        setSelectedIds(new Set());
        setFilters(DEFAULT_LINK_FILTERS);
        searchRef.current?.blur();
    }, []);

    useAdminShortcuts({
        enabled: !isDialogOpen && bulkAction === null,
        searchRef,
        onFocusSearch: focusSearch,
        onEscape: clearSelectionAndFilters,
    });

    function setRowAction(linkId: string, action: RowAction | null) {
        setRowBusy((previous) => {
            const next = { ...previous };
            if (action === null) delete next[linkId];
            else next[linkId] = action;
            return next;
        });
    }

    function patchLink(linkId: string, patch: Partial<LinkWithUser>) {
        setLinks((previous) =>
            previous.map((link) => (link.id === linkId ? { ...link, ...patch } : link))
        );
    }

    /* ---------------------------------------------------------------- lựa chọn */

    function handleToggleSelect(linkId: string, selected: boolean) {
        setSelectedIds((previous) => {
            const next = new Set(previous);
            if (selected) next.add(linkId);
            else next.delete(linkId);
            return next;
        });
    }

    function handleToggleSelectAll(selected: boolean) {
        setSelectedIds(selected ? new Set(visibleIds) : new Set());
    }

    /* ------------------------------------------------------- thao tác từng dòng */

    async function handleCopyLink(link: LinkWithUser) {
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const ok = await copyText(`${origin}/${link.slug}`);

        if (ok) {
            setCopiedSlug(link.slug);
            setTimeout(() => setCopiedSlug(null), 2000);
        } else {
            toast.error("Không thể sao chép", "Vui lòng sao chép thủ công.");
        }
    }

    async function handleToggleStatus(linkId: string) {
        setRowAction(linkId, "status");
        const result = await toggleLinkStatus(linkId);

        if (result.success && result.data) {
            patchLink(linkId, { is_active: result.data.is_active });
        } else {
            // Trước đây lỗi này bị bỏ qua hoàn toàn: dòng giữ nguyên trạng thái cũ
            // mà không có dấu hiệu nào cho thấy thao tác đã thất bại.
            toast.error("Không thể đổi trạng thái liên kết", "Vui lòng thử lại.");
        }

        setRowAction(linkId, null);
    }

    async function handleToggleFavorite(link: LinkWithUser) {
        setRowAction(link.id, "favorite");
        const result = await toggleFavorite(link.id);

        if (result.success && result.data) {
            patchLink(link.id, { is_favorite: result.data.is_favorite });
        } else {
            toast.error("Không thể cập nhật yêu thích", result.error || "Vui lòng thử lại.");
        }

        setRowAction(link.id, null);
    }

    async function handleDuplicate(link: LinkWithUser) {
        setRowAction(link.id, "duplicate");
        const result = await duplicateLink(link.id);

        if (result.success && result.data) {
            setCredentialsKind("duplicate");
            setNewCredentials(result.data);
        } else {
            toast.error("Không thể nhân bản liên kết", result.error || "Vui lòng thử lại.");
        }

        setRowAction(link.id, null);
    }

    async function handleExport(link: LinkWithUser) {
        setRowAction(link.id, "export");
        const result = await exportLink(link.id);

        if (result.success && result.data) {
            downloadJson(exportFileName(link.slug), result.data);
            toast.success("Đã xuất JSON", exportFileName(link.slug));
        } else {
            toast.error("Không thể xuất dữ liệu", result.error || "Vui lòng thử lại.");
        }

        setRowAction(link.id, null);
    }

    async function handleDeleteConfirmed(link: LinkWithUser) {
        setRowAction(link.id, "delete");
        const result = await deleteLink(link.id);

        if (result.success) {
            setLinks((previous) => previous.filter((item) => item.id !== link.id));
            setSelectedIds((previous) => {
                const next = new Set(previous);
                next.delete(link.id);
                return next;
            });
            toast.success("Đã xóa liên kết", `/${link.slug}`);
            setConfirmState(null);
        } else {
            toast.error("Không thể xóa liên kết", result.error || undefined);
        }

        setRowAction(link.id, null);
    }

    /* ------------------------------------------------------- thao tác hàng loạt */

    /**
     * Chạy tuần tự, mỗi liên kết một lời gọi server.
     *
     * Cố ý không dùng `Promise.all`: 20 transaction song song vào Supabase dễ
     * cạn pool, và tiến độ "3/5" chỉ có nghĩa khi các bước diễn ra lần lượt.
     */
    async function runBulkStatus(action: Exclude<BulkAction, "delete">, ids: string[]) {
        const target = action === "activate";

        setBulkAction(action);
        setBulkProgress({ done: 0, total: ids.length });
        toast.info(
            `Đang ${target ? "bật" : "tạm dừng"} ${ids.length} liên kết…`,
            "Xử lý lần lượt, vui lòng không đóng trang."
        );

        let ok = 0;
        let failed = 0;
        let skipped = 0;
        const patches: { id: string; is_active: boolean }[] = [];

        for (let index = 0; index < ids.length; index += 1) {
            const id = ids[index];
            const current = links.find((link) => link.id === id);

            // `toggleLinkStatus()` đảo trạng thái chứ không nhận giá trị đích, nên
            // những dòng đã đúng trạng thái phải được bỏ qua — gọi thêm sẽ lật ngược.
            if (current && current.is_active === target) {
                skipped += 1;
                setBulkProgress({ done: index + 1, total: ids.length });
                continue;
            }

            const result = await toggleLinkStatus(id);

            if (result.success && result.data && result.data.is_active === target) {
                ok += 1;
                patches.push({ id, is_active: result.data.is_active });
            } else {
                // Kể cả khi server trả về success: nếu trạng thái sau cùng không
                // phải trạng thái đích (do ai đó vừa đổi ở tab khác) thì vẫn tính
                // là thất bại, và lấy giá trị thật của server để hiển thị.
                failed += 1;
                if (result.success && result.data) {
                    patches.push({ id, is_active: result.data.is_active });
                }
            }

            setBulkProgress({ done: index + 1, total: ids.length });
        }

        if (patches.length > 0) {
            setLinks((previous) =>
                previous.map((link) => {
                    const patch = patches.find((item) => item.id === link.id);
                    return patch ? { ...link, is_active: patch.is_active } : link;
                })
            );
        }

        const summary = summarizeBulk(action, { total: ids.length, ok, failed, skipped });
        toast.show(summary);

        setBulkAction(null);
        setBulkProgress(null);
        if (failed === 0) setSelectedIds(new Set());
    }

    async function runBulkDelete(ids: string[]) {
        setBulkAction("delete");
        setBulkProgress({ done: 0, total: ids.length });
        toast.info(`Đang xoá ${ids.length} liên kết…`, "Xử lý lần lượt, vui lòng không đóng trang.");

        let ok = 0;
        let failed = 0;
        const deleted: string[] = [];

        for (let index = 0; index < ids.length; index += 1) {
            const result = await deleteLink(ids[index]);

            if (result.success) {
                ok += 1;
                deleted.push(ids[index]);
            } else {
                failed += 1;
            }

            setBulkProgress({ done: index + 1, total: ids.length });
        }

        if (deleted.length > 0) {
            const removed = new Set(deleted);
            setLinks((previous) => previous.filter((link) => !removed.has(link.id)));
            setSelectedIds(
                (previous) => new Set(Array.from(previous).filter((id) => !removed.has(id)))
            );
        }

        const summary = summarizeBulk("delete", { total: ids.length, ok, failed, skipped: 0 });
        toast.show(summary);

        setBulkAction(null);
        setBulkProgress(null);
        setConfirmState(null);

        // Xoá làm lệch phân trang phía server (tổng số trang có thể giảm), nên
        // lấy lại dữ liệu thay vì tin vào danh sách đã lọc cục bộ.
        if (deleted.length > 0) router.refresh();
    }

    /* ------------------------------------------------------------------ dialog */

    function handleCredentialsClose() {
        setNewCredentials(null);
        // Liên kết mới nằm ngoài trang hiện tại cho tới khi lấy lại dữ liệu.
        router.refresh();
    }

    // Một hộp xác nhận duy nhất phục vụ cả xoá 1 dòng và xoá hàng loạt. Mọi
    // nhánh trả về đủ các khoá để phần đọc bên dưới không phải kiểm tra từng cái.
    const confirmProps: {
        isOpen: boolean;
        title: string;
        message: string;
        confirmText: string;
        isLoading: boolean;
        onConfirm: () => void;
    } = (() => {
        if (confirmState?.kind === "delete-bulk") {
            return {
                isOpen: true,
                title: `Xoá ${confirmState.ids.length} liên kết?`,
                message: bulkDeleteConfirmMessage(confirmState.ids.length),
                confirmText: `Xoá ${confirmState.ids.length} liên kết`,
                isLoading: bulkAction === "delete",
                onConfirm: () => runBulkDelete(confirmState.ids),
            };
        }

        if (confirmState?.kind === "delete-one") {
            const { link } = confirmState;
            return {
                isOpen: true,
                title: "Xoá liên kết?",
                message: `Xoá liên kết /${link.slug} của ${link.user.username}? Toàn bộ ảnh, dòng thời gian và lời nhắn sẽ bị xoá vĩnh viễn và không thể hoàn tác.`,
                confirmText: "Xoá liên kết",
                isLoading: rowBusy[link.id] === "delete",
                onConfirm: () => handleDeleteConfirmed(link),
            };
        }

        return {
            isOpen: false,
            title: "Xác nhận",
            message: "",
            confirmText: "Xác nhận",
            isLoading: false,
            onConfirm: () => undefined,
        };
    })();

    const filtersActive = isFilterActive(filters);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Quản Lý Liên Kết</h2>
                    <p className="mt-1 text-slate-400">Tạo và quản lý liên kết người dùng</p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsImportOpen(true)}
                        className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-600 bg-slate-800/60 px-4 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500 hover:text-white"
                    >
                        <Upload className="h-4 w-4" aria-hidden="true" />
                        Nhập JSON
                    </button>

                    <CreateLinkDialog />
                </div>
            </div>

            <LinkFilterBar
                ref={searchRef}
                filters={filters}
                onChange={setFilters}
                onReset={() => setFilters(DEFAULT_LINK_FILTERS)}
                resultCount={visibleLinks.length}
                totalCount={links.length}
            />

            <BulkActionBar
                selectedCount={selectedCount}
                runningAction={bulkAction}
                progress={bulkProgress}
                onActivate={() => runBulkStatus("activate", Array.from(selectedIds))}
                onDeactivate={() => runBulkStatus("deactivate", Array.from(selectedIds))}
                onDelete={() => setConfirmState({ kind: "delete-bulk", ids: Array.from(selectedIds) })}
                onClear={() => setSelectedIds(new Set())}
            />

            <div className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-xl">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-700/50 hover:bg-slate-700/20">
                            <TableHead className="w-10 pr-0">
                                <input
                                    ref={selectAllRef}
                                    type="checkbox"
                                    checked={allVisibleSelected}
                                    disabled={visibleLinks.length === 0}
                                    onChange={(event) => handleToggleSelectAll(event.target.checked)}
                                    aria-label="Chọn tất cả liên kết đang hiển thị"
                                    className="h-4 w-4 cursor-pointer rounded border-slate-500 bg-slate-900 accent-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
                                />
                            </TableHead>
                            <TableHead className="w-10 px-2">
                                <span className="sr-only">Yêu thích</span>
                            </TableHead>
                            <TableHead className="text-slate-400">Tên người dùng</TableHead>
                            <TableHead className="text-slate-400">Liên kết</TableHead>
                            <TableHead className="text-slate-400">Giao diện</TableHead>
                            <TableHead className="text-slate-400">Nhãn</TableHead>
                            <TableHead className="text-slate-400">Trạng thái</TableHead>
                            <TableHead className="text-slate-400">Ngày tạo</TableHead>
                            <TableHead className="text-right text-slate-400">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {links.length === 0 ? (
                            <TableRow className="border-slate-700/50 hover:bg-transparent">
                                <TableCell colSpan={COLUMN_COUNT} className="py-10">
                                    <EmptyState
                                        icon={<LinkIcon className="h-6 w-6" />}
                                        title="Chưa có liên kết nào"
                                        description="Tạo liên kết đầu tiên để bắt đầu, hoặc nhập một liên kết từ tệp JSON đã xuất trước đó."
                                        className="border-slate-700 bg-transparent"
                                    />
                                </TableCell>
                            </TableRow>
                        ) : visibleLinks.length === 0 ? (
                            <TableRow className="border-slate-700/50 hover:bg-transparent">
                                <TableCell colSpan={COLUMN_COUNT} className="py-10">
                                    <EmptyState
                                        icon={<SearchX className="h-6 w-6" />}
                                        title="Không có liên kết nào khớp bộ lọc"
                                        description={`${links.length} liên kết trong trang này đều bị lọc bỏ. Bộ lọc chỉ áp dụng cho trang hiện tại — liên kết cần tìm có thể đang ở trang khác.`}
                                        action={
                                            filtersActive ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setFilters(DEFAULT_LINK_FILTERS)}
                                                    className="rounded-md border border-slate-600 px-3 py-1.5 text-sm text-slate-200 transition-colors hover:border-slate-500 hover:text-white"
                                                >
                                                    Xoá bộ lọc
                                                </button>
                                            ) : undefined
                                        }
                                        className="border-slate-700 bg-transparent"
                                    />
                                </TableCell>
                            </TableRow>
                        ) : (
                            visibleLinks.map((link) => (
                                <LinkRow
                                    key={link.id}
                                    link={link}
                                    selected={selectedIds.has(link.id)}
                                    locked={bulkAction !== null}
                                    busyAction={rowBusy[link.id] ?? null}
                                    copied={copiedSlug === link.slug}
                                    onToggleSelect={handleToggleSelect}
                                    onCopyLink={handleCopyLink}
                                    onToggleStatus={handleToggleStatus}
                                    onToggleFavorite={handleToggleFavorite}
                                    onEditTags={(target) =>
                                        setTagTarget({ id: target.id, slug: target.slug, tags: target.tags })
                                    }
                                    onShowQr={(target) =>
                                        setQrDialog({ slug: target.slug, username: target.user.username })
                                    }
                                    onResetPin={(target) =>
                                        setResetPinTarget({
                                            linkId: target.id,
                                            username: target.user.username,
                                        })
                                    }
                                    onDuplicate={handleDuplicate}
                                    onExport={handleExport}
                                    onDelete={(target) => setConfirmState({ kind: "delete-one", link: target })}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <QRCodeDialog
                slug={qrDialog?.slug || ""}
                username={qrDialog?.username}
                isOpen={!!qrDialog}
                onClose={() => setQrDialog(null)}
            />

            <ResetPinDialog target={resetPinTarget} onClose={() => setResetPinTarget(null)} />

            <TagEditorDialog
                target={tagTarget}
                onClose={() => setTagTarget(null)}
                onSaved={(linkId, tags) => patchLink(linkId, { tags })}
            />

            <ImportLinkDialog
                open={isImportOpen}
                onOpenChange={setIsImportOpen}
                onImported={(credentials) => {
                    setCredentialsKind("import");
                    setNewCredentials(credentials);
                }}
            />

            <CredentialsDialog
                credentials={newCredentials}
                title={
                    credentialsKind === "duplicate"
                        ? "Đã nhân bản liên kết!"
                        : "Đã nhập liên kết từ JSON!"
                }
                description="Đây là thông tin đăng nhập của liên kết mới. Hãy bàn giao cho khách."
                note={
                    credentialsKind === "duplicate"
                        ? "Bản nhân bản sao chép nội dung, ảnh và dòng thời gian, nhưng bắt đầu ở trạng thái nháp để chủ trang mới kiểm tra trước khi đăng."
                        : "Liên kết vừa nhập bắt đầu ở trạng thái nháp để bạn kiểm tra nội dung trước khi đăng."
                }
                onClose={handleCredentialsClose}
            />

            <ConfirmDialog
                isOpen={confirmProps.isOpen}
                title={confirmProps.title}
                message={confirmProps.message}
                confirmText={confirmProps.confirmText}
                cancelText="Hủy"
                variant="danger"
                isLoading={confirmProps.isLoading}
                onConfirm={confirmProps.onConfirm}
                onCancel={() => setConfirmState(null)}
            />
        </div>
    );
}
