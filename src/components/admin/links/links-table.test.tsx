import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Test hành vi cho bảng admin.
 *
 * Đặt trong `components/admin/links/` (dù component nằm ở `app/admin/links/`)
 * vì đây là nơi test được phép tồn tại theo phạm vi thay đổi, và vitest.config
 * đã include `src/**`.
 *
 * Mọi server action đều được mock: chúng có `"use server"` và nạp Prisma +
 * bcrypt, không chạy được trong jsdom, và điều cần kiểm là **phần UI gọi đúng
 * cái gì với đối số nào**.
 */

const mocks = vi.hoisted(() => ({
    refresh: vi.fn(),
    deleteLink: vi.fn(),
    toggleLinkStatus: vi.fn(),
    toggleFavorite: vi.fn(),
    setTags: vi.fn(),
    duplicateLink: vi.fn(),
    exportLink: vi.fn(),
    importLink: vi.fn(),
    createLink: vi.fn(),
    resetLinkPin: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({ refresh: mocks.refresh, push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/app/actions/admin-actions", () => ({
    createLink: mocks.createLink,
    deleteLink: mocks.deleteLink,
    toggleLinkStatus: mocks.toggleLinkStatus,
    resetLinkPin: mocks.resetLinkPin,
}));

vi.mock("@/app/actions/link-management-actions", () => ({
    toggleFavorite: mocks.toggleFavorite,
    setTags: mocks.setTags,
    duplicateLink: mocks.duplicateLink,
    exportLink: mocks.exportLink,
    importLink: mocks.importLink,
}));

import { LinksTable } from "@/app/admin/links/links-table";
import { ToastProvider } from "@/components/ui/toast";
import type { LinkWithUser } from "@/types";

function makeLink(overrides: Partial<LinkWithUser> & { slug: string }): LinkWithUser {
    return {
        id: `id-${overrides.slug}`,
        user_id: `user-${overrides.slug}`,
        type: "LOVE",
        is_active: true,
        qr_code_url: null,
        created_at: new Date("2026-01-01T00:00:00Z"),
        updated_at: new Date("2026-01-01T00:00:00Z"),
        is_published: true,
        published_at: null,
        is_favorite: false,
        tags: [],
        profile_data: null,
        user: { id: `user-${overrides.slug}`, username: `nguoi-${overrides.slug}` },
        ...overrides,
    };
}

const links: LinkWithUser[] = [
    makeLink({ slug: "alpha" }),
    makeLink({ slug: "beta", type: "IDOL", is_active: false, tags: ["vip"] }),
    makeLink({ slug: "gamma", is_favorite: true, is_published: false }),
];

function renderTable(initialLinks: LinkWithUser[] = links) {
    return render(
        <ToastProvider>
            <LinksTable initialLinks={initialLinks} />
        </ToastProvider>
    );
}

function rowFor(slug: string): HTMLElement {
    // Giới hạn trong bảng: toast và tiêu đề dialog cũng in ra "/slug".
    const code = within(screen.getByRole("table")).getByText(`/${slug}`);
    const row = code.closest("tr");
    if (!row) throw new Error(`Không tìm thấy dòng cho /${slug}`);
    return row;
}

/**
 * `ConfirmDialog` là div thuần, không có `role="dialog"`, nên phải lần từ tiêu
 * đề lên lớp overlay. Nhờ đó test phân biệt được nút "Xoá 3 liên kết" trong hộp
 * xác nhận với nút cùng tên trên thanh thao tác hàng loạt phía sau.
 */
function confirmDialog(title: string): HTMLElement {
    const heading = screen.getByRole("heading", { name: title });
    const overlay = heading.closest("div.fixed");
    if (!(overlay instanceof HTMLElement)) throw new Error(`Không tìm thấy hộp xác nhận "${title}"`);
    return overlay;
}

beforeEach(() => {
    mocks.deleteLink.mockResolvedValue({ success: true });
    mocks.toggleLinkStatus.mockImplementation(async (id: string) => ({
        success: true,
        data: { id, is_active: true },
    }));
    mocks.toggleFavorite.mockImplementation(async (id: string) => ({
        success: true,
        data: { id, is_favorite: true },
    }));
    mocks.exportLink.mockResolvedValue({ success: true, data: { version: 1, type: "LOVE" } });
});

// `restoreMocks` trong vitest.config chỉ khôi phục spy, không khôi phục global đã
// stub — nếu không dọn, bản `URL` giả của test export sẽ rò rỉ sang test sau.
afterEach(() => {
    vi.unstubAllGlobals();
});

describe("LinksTable — hiển thị", () => {
    it("hiện mọi liên kết của trang hiện tại", () => {
        renderTable();
        expect(screen.getByText("/alpha")).toBeInTheDocument();
        expect(screen.getByText("/beta")).toBeInTheDocument();
        expect(screen.getByText("/gamma")).toBeInTheDocument();
    });

    it("hiện nhãn dưới dạng badge", () => {
        renderTable();
        expect(within(rowFor("beta")).getByText("vip")).toBeInTheDocument();
    });

    it("đánh dấu liên kết chưa đăng là Nháp", () => {
        renderTable();
        expect(within(rowFor("gamma")).getByText("Nháp")).toBeInTheDocument();
        expect(within(rowFor("alpha")).queryByText("Nháp")).not.toBeInTheDocument();
    });

    it("dùng trạng thái rỗng riêng khi chưa có liên kết nào", () => {
        renderTable([]);
        expect(screen.getByText("Chưa có liên kết nào")).toBeInTheDocument();
    });
});

describe("LinksTable — tìm kiếm, lọc, sắp xếp", () => {
    it("lọc theo slug khi gõ vào ô tìm kiếm", async () => {
        const user = userEvent.setup();
        renderTable();

        await user.type(screen.getByLabelText(/Tìm theo slug/i), "beta");

        expect(screen.getByText("/beta")).toBeInTheDocument();
        expect(screen.queryByText("/alpha")).not.toBeInTheDocument();
    });

    it("lọc theo tên người dùng", async () => {
        const user = userEvent.setup();
        renderTable();

        await user.type(screen.getByLabelText(/Tìm theo slug/i), "nguoi-gamma");

        expect(screen.getByText("/gamma")).toBeInTheDocument();
        expect(screen.queryByText("/alpha")).not.toBeInTheDocument();
    });

    it("chỉ hiện liên kết yêu thích khi bật bộ lọc yêu thích", async () => {
        const user = userEvent.setup();
        renderTable();

        await user.click(screen.getByRole("button", { name: "Yêu thích" }));

        expect(screen.getByText("/gamma")).toBeInTheDocument();
        expect(screen.queryByText("/alpha")).not.toBeInTheDocument();
    });

    it("dùng trạng thái rỗng KHÁC khi bộ lọc không khớp gì", async () => {
        const user = userEvent.setup();
        renderTable();

        await user.type(screen.getByLabelText(/Tìm theo slug/i), "khong-ton-tai");

        expect(screen.getByText("Không có liên kết nào khớp bộ lọc")).toBeInTheDocument();
        expect(screen.queryByText("Chưa có liên kết nào")).not.toBeInTheDocument();
        // Nút "Xoá bộ lọc" xuất hiện cả trên thanh lọc và trong trạng thái rỗng —
        // trạng thái rỗng phải có nút của riêng nó để không cần đi tìm.
        expect(screen.getAllByRole("button", { name: "Xoá bộ lọc" })).toHaveLength(2);
    });
});

describe("LinksTable — thao tác hàng loạt", () => {
    it("chọn tất cả trong trang rồi hiện thanh thao tác kèm số lượng", async () => {
        const user = userEvent.setup();
        renderTable();

        expect(screen.queryByRole("region", { name: "Thao tác hàng loạt" })).not.toBeInTheDocument();

        await user.click(screen.getByLabelText("Chọn tất cả liên kết đang hiển thị"));

        const bar = screen.getByRole("region", { name: "Thao tác hàng loạt" });
        expect(within(bar).getByText("3")).toBeInTheDocument();
        expect(within(bar).getByRole("button", { name: /Xoá 3 liên kết/ })).toBeInTheDocument();
    });

    it("chỉ chọn những dòng đang hiển thị sau khi lọc", async () => {
        const user = userEvent.setup();
        renderTable();

        await user.type(screen.getByLabelText(/Tìm theo slug/i), "beta");
        await user.click(screen.getByLabelText("Chọn tất cả liên kết đang hiển thị"));

        const bar = screen.getByRole("region", { name: "Thao tác hàng loạt" });
        expect(within(bar).getByRole("button", { name: /Xoá 1 liên kết/ })).toBeInTheDocument();
    });

    it("bỏ chọn những dòng bị bộ lọc loại đi", async () => {
        const user = userEvent.setup();
        renderTable();

        await user.click(screen.getByLabelText("Chọn tất cả liên kết đang hiển thị"));
        await user.type(screen.getByLabelText(/Tìm theo slug/i), "beta");

        const bar = screen.getByRole("region", { name: "Thao tác hàng loạt" });
        expect(within(bar).getByRole("button", { name: /Xoá 1 liên kết/ })).toBeInTheDocument();
    });

    it("bắt buộc xác nhận và nêu rõ số liên kết sẽ bị xoá", async () => {
        const user = userEvent.setup();
        renderTable();

        await user.click(screen.getByLabelText("Chọn tất cả liên kết đang hiển thị"));
        await user.click(screen.getByRole("button", { name: /Xoá 3 liên kết/ }));

        const dialog = confirmDialog("Xoá 3 liên kết?");
        expect(within(dialog).getByText(/Xoá 3 liên kết đã chọn\?/)).toBeInTheDocument();
        expect(within(dialog).getByText(/không thể hoàn tác/)).toBeInTheDocument();
        expect(mocks.deleteLink).not.toHaveBeenCalled();
    });

    it("xoá lần lượt từng liên kết sau khi xác nhận", async () => {
        const user = userEvent.setup();
        renderTable();

        await user.click(screen.getByLabelText("Chọn tất cả liên kết đang hiển thị"));
        await user.click(screen.getByRole("button", { name: /Xoá 3 liên kết/ }));
        await user.click(
            within(confirmDialog("Xoá 3 liên kết?")).getByRole("button", { name: "Xoá 3 liên kết" })
        );

        await waitFor(() => expect(mocks.deleteLink).toHaveBeenCalledTimes(3));
        expect(mocks.deleteLink.mock.calls.map((call) => call[0])).toEqual([
            "id-alpha",
            "id-beta",
            "id-gamma",
        ]);
    });

    it("báo trung thực khi chỉ một phần thành công", async () => {
        const user = userEvent.setup();
        mocks.deleteLink.mockImplementation(async (id: string) =>
            id === "id-beta" ? { success: false, error: "Lỗi" } : { success: true }
        );
        renderTable();

        await user.click(screen.getByLabelText("Chọn tất cả liên kết đang hiển thị"));
        await user.click(screen.getByRole("button", { name: /Xoá 3 liên kết/ }));
        await user.click(
            within(confirmDialog("Xoá 3 liên kết?")).getByRole("button", { name: "Xoá 3 liên kết" })
        );

        await waitFor(() => expect(screen.getByText("Đã xoá 2/3 liên kết")).toBeInTheDocument());
        expect(screen.getByText(/1 liên kết thất bại/)).toBeInTheDocument();
    });

    it("bỏ qua những liên kết đã đúng trạng thái khi bật hàng loạt", async () => {
        const user = userEvent.setup();
        renderTable();

        await user.click(screen.getByLabelText("Chọn tất cả liên kết đang hiển thị"));
        await user.click(screen.getByRole("button", { name: "Bật hoạt động" }));

        // alpha + gamma đã hoạt động → chỉ beta cần gọi server.
        await waitFor(() => expect(mocks.toggleLinkStatus).toHaveBeenCalledTimes(1));
        expect(mocks.toggleLinkStatus).toHaveBeenCalledWith("id-beta");
        await waitFor(() => expect(screen.getByText("Đã bật 1 liên kết")).toBeInTheDocument());
        expect(screen.getByText(/2 liên kết đã ở trạng thái này/)).toBeInTheDocument();
    });
});

describe("LinksTable — thao tác từng dòng", () => {
    it("gọi toggleFavorite khi bấm ngôi sao", async () => {
        const user = userEvent.setup();
        renderTable();

        await user.click(
            within(rowFor("alpha")).getByRole("button", { name: "Đánh dấu yêu thích" })
        );

        await waitFor(() => expect(mocks.toggleFavorite).toHaveBeenCalledWith("id-alpha"));
    });

    it("xuất JSON qua Blob rồi thu hồi object URL", async () => {
        const user = userEvent.setup();
        const createObjectURL = vi.fn(() => "blob:fake");
        const revokeObjectURL = vi.fn();
        vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });

        renderTable();
        await user.click(within(rowFor("alpha")).getByRole("button", { name: "Xuất JSON" }));

        await waitFor(() => expect(mocks.exportLink).toHaveBeenCalledWith("id-alpha"));
        expect(createObjectURL).toHaveBeenCalledTimes(1);
        // Thu hồi diễn ra sau một nhịp để Safari kịp đọc blob.
        await waitFor(() => expect(revokeObjectURL).toHaveBeenCalledWith("blob:fake"), {
            timeout: 3000,
        });
    });

    it("mở dialog nhãn với đúng nhãn hiện có", async () => {
        const user = userEvent.setup();
        renderTable();

        await user.click(within(rowFor("beta")).getByRole("button", { name: /Sửa nhãn/ }));

        const dialog = screen.getByRole("dialog");
        expect(within(dialog).getByText("Nhãn cho /beta")).toBeInTheDocument();
        expect(within(dialog).getByRole("button", { name: "Xoá nhãn vip" })).toBeInTheDocument();
    });

    it("xác nhận trước khi xoá một liên kết, có nêu slug", async () => {
        const user = userEvent.setup();
        renderTable();

        await user.click(within(rowFor("alpha")).getByRole("button", { name: "Xoá liên kết" }));

        const dialog = confirmDialog("Xoá liên kết?");
        expect(within(dialog).getByText(/\/alpha/)).toBeInTheDocument();
        expect(within(dialog).getByText(/nguoi-alpha/)).toBeInTheDocument();
        expect(mocks.deleteLink).not.toHaveBeenCalled();
    });
});

describe("LinksTable — sửa nhãn", () => {
    it("thêm nhãn rồi gửi cả mảng cho setTags", async () => {
        const user = userEvent.setup();
        mocks.setTags.mockResolvedValue({ success: true, data: { id: "id-beta", tags: ["vip", "gấp"] } });
        renderTable();

        await user.click(within(rowFor("beta")).getByRole("button", { name: /Sửa nhãn/ }));
        const dialog = screen.getByRole("dialog");
        await user.type(within(dialog).getByLabelText("Thêm nhãn"), "gấp{Enter}");
        await user.click(within(dialog).getByRole("button", { name: "Lưu nhãn" }));

        await waitFor(() => expect(mocks.setTags).toHaveBeenCalledWith("id-beta", ["vip", "gấp"]));
        // Dòng hiển thị lại theo đúng giá trị server trả về.
        await waitFor(() => expect(within(rowFor("beta")).getByText("gấp")).toBeInTheDocument());
    });

    it("bỏ nhãn khỏi danh sách trước khi lưu", async () => {
        const user = userEvent.setup();
        mocks.setTags.mockResolvedValue({ success: true, data: { id: "id-beta", tags: [] } });
        renderTable();

        await user.click(within(rowFor("beta")).getByRole("button", { name: /Sửa nhãn/ }));
        const dialog = screen.getByRole("dialog");
        await user.click(within(dialog).getByRole("button", { name: "Xoá nhãn vip" }));
        await user.click(within(dialog).getByRole("button", { name: "Lưu nhãn" }));

        await waitFor(() => expect(mocks.setTags).toHaveBeenCalledWith("id-beta", []));
    });
});

describe("LinksTable — nhập JSON", () => {
    it("gửi nội dung dán được cho importLink rồi hiện slug + PIN", async () => {
        const user = userEvent.setup();
        mocks.importLink.mockResolvedValue({
            success: true,
            data: { slug: "moi-nhap", username: "khach-moi", pin: "135790" },
        });
        renderTable();

        await user.click(screen.getByRole("button", { name: /Nhập JSON/ }));
        const dialog = screen.getByRole("dialog");
        await user.type(
            within(dialog).getByLabelText(/dán nội dung JSON/i),
            '{{"version":1,"type":"LOVE"}'
        );
        await user.click(within(dialog).getByRole("button", { name: "Nhập liên kết" }));

        await waitFor(() => expect(mocks.importLink).toHaveBeenCalledTimes(1));
        expect(mocks.importLink.mock.calls[0][0]).toContain('"version":1');

        const result = await screen.findByText("Đã nhập liên kết từ JSON!");
        expect(result).toBeInTheDocument();
        const resultDialog = screen.getByRole("dialog");
        expect(within(resultDialog).getByText("135790")).toBeInTheDocument();
        expect(within(resultDialog).getByText(/một lần duy nhất/)).toBeInTheDocument();
    });

    it("giữ lỗi hiển thị trong dialog khi JSON sai", async () => {
        const user = userEvent.setup();
        mocks.importLink.mockResolvedValue({ success: false, error: "Tệp JSON không hợp lệ" });
        renderTable();

        await user.click(screen.getByRole("button", { name: /Nhập JSON/ }));
        const dialog = screen.getByRole("dialog");
        await user.type(within(dialog).getByLabelText(/dán nội dung JSON/i), "khong-phai-json");
        await user.click(within(dialog).getByRole("button", { name: "Nhập liên kết" }));

        expect(await within(dialog).findByRole("alert")).toHaveTextContent("Tệp JSON không hợp lệ");
    });
});

describe("LinksTable — nhân bản", () => {
    it("hiện slug + PIN kèm cảnh báo sau khi nhân bản", async () => {
        const user = userEvent.setup();
        mocks.duplicateLink.mockResolvedValue({
            success: true,
            data: { slug: "ban-sao", username: "nguoi-alpha-copy", pin: "246813" },
        });
        renderTable();

        await user.click(within(rowFor("alpha")).getByRole("button", { name: "Nhân bản liên kết" }));

        await waitFor(() => expect(mocks.duplicateLink).toHaveBeenCalledWith("id-alpha"));
        const dialog = await screen.findByRole("dialog");
        expect(within(dialog).getByText("Đã nhân bản liên kết!")).toBeInTheDocument();
        expect(within(dialog).getByText("246813")).toBeInTheDocument();
        expect(within(dialog).getByText(/một lần duy nhất/)).toBeInTheDocument();
        expect(within(dialog).getByText(/trạng thái nháp/)).toBeInTheDocument();
    });
});

describe("LinksTable — phím tắt", () => {
    it("phím / đưa con trỏ vào ô tìm kiếm", async () => {
        const user = userEvent.setup();
        renderTable();
        const search = screen.getByLabelText(/Tìm theo slug/i);

        expect(search).not.toHaveFocus();
        await user.keyboard("/");
        expect(search).toHaveFocus();
    });

    it("không chiếm phím / khi đang gõ trong ô nhập", async () => {
        const user = userEvent.setup();
        renderTable();
        const search = screen.getByLabelText(/Tìm theo slug/i) as HTMLInputElement;

        await user.click(search);
        await user.keyboard("a/b");

        expect(search.value).toBe("a/b");
    });

    it("phím Esc xoá lựa chọn và từ khoá tìm kiếm", async () => {
        const user = userEvent.setup();
        renderTable();
        const search = screen.getByLabelText(/Tìm theo slug/i) as HTMLInputElement;

        await user.click(screen.getByLabelText("Chọn tất cả liên kết đang hiển thị"));
        await user.type(search, "alpha");
        expect(screen.getByRole("region", { name: "Thao tác hàng loạt" })).toBeInTheDocument();

        await user.keyboard("{Escape}");

        expect(search.value).toBe("");
        expect(screen.queryByRole("region", { name: "Thao tác hàng loạt" })).not.toBeInTheDocument();
    });

    it("hiện chú thích phím tắt để người dùng biết chúng tồn tại", () => {
        renderTable();
        expect(screen.getByText("tìm kiếm")).toBeInTheDocument();
        expect(screen.getByText("bỏ chọn")).toBeInTheDocument();
    });
});
