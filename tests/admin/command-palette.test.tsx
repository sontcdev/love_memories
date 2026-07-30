import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Test hành vi cho bảng lệnh admin.
 *
 * Phần lớn test truyền `actions` vào để kiểm đúng phần cơ chế (phím tắt, lọc,
 * điều hướng bàn phím, focus) mà không phụ thuộc vào bộ lệnh thật. Một nhóm
 * riêng ở cuối kiểm bộ lệnh mặc định đã nối đúng vào router.
 */

const state = vi.hoisted(() => ({ pathname: "/admin/links" }));
const mocks = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: mocks.push, replace: vi.fn(), refresh: mocks.refresh }),
    usePathname: () => state.pathname,
}));

import { CommandPalette, filterCommands, foldVietnamese, type CommandAction } from "@/components/admin/CommandPalette";
import { ToastProvider } from "@/components/ui/toast";

/** jsdom không cài `scrollIntoView`, nên phải tự gắn để khẳng định nó được gọi. */
const scrollIntoView = vi.fn();

beforeEach(() => {
    state.pathname = "/admin/links";
    Element.prototype.scrollIntoView = scrollIntoView;
    scrollIntoView.mockClear();
});

afterEach(() => {
    Reflect.deleteProperty(Element.prototype, "scrollIntoView");
});

function makeActions(run: Record<string, () => void> = {}): CommandAction[] {
    return [
        { id: "links", label: "Liên kết", description: "Danh sách liên kết", run: run.links ?? vi.fn() },
        { id: "cards", label: "Thẻ trò chơi", description: "Quản lý thẻ", run: run.cards ?? vi.fn() },
        { id: "logout", label: "Đăng xuất", description: "Kết thúc phiên", run: run.logout ?? vi.fn() },
    ];
}

function renderPalette(actions?: CommandAction[]) {
    return render(
        <ToastProvider>
            <button type="button">Nút ngoài bảng lệnh</button>
            <input aria-label="Ô nhập ngoài bảng lệnh" />
            <CommandPalette actions={actions} />
        </ToastProvider>
    );
}

const openPalette = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.keyboard("{Meta>}k{/Meta}");
    return screen.getByRole("dialog");
};

/** Nhãn của các mục đang hiện, theo thứ tự. Tên trợ năng của option = nhãn lệnh. */
const optionLabels = () =>
    screen.getAllByRole("option").map((option) => option.getAttribute("aria-label") ?? "");

describe("<CommandPalette /> — mở và đóng", () => {
    it("mở bằng Cmd+K và đưa con trỏ vào ô tìm lệnh", async () => {
        const user = userEvent.setup();
        renderPalette(makeActions());

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

        const dialog = await openPalette(user);

        expect(dialog).toHaveAttribute("aria-modal", "true");
        expect(screen.getByRole("combobox", { name: "Tìm lệnh" })).toHaveFocus();
    });

    it("mở bằng Ctrl+K cho bàn phím Windows/Linux", async () => {
        const user = userEvent.setup();
        renderPalette(makeActions());

        await user.keyboard("{Control>}k{/Control}");

        expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("Cmd+K lần thứ hai thì đóng lại", async () => {
        const user = userEvent.setup();
        renderPalette(makeActions());

        await openPalette(user);
        await user.keyboard("{Meta>}k{/Meta}");

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("không mở khi gõ phím k trơn trong một ô nhập", async () => {
        const user = userEvent.setup();
        renderPalette(makeActions());

        const outsideInput = screen.getByLabelText("Ô nhập ngoài bảng lệnh");
        await user.click(outsideInput);
        await user.keyboard("k");

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        // Ký tự phải vào ô nhập, không bị phím tắt chiếm.
        expect(outsideInput).toHaveValue("k");
    });

    it("vẫn mở được bằng Cmd+K khi con trỏ đang ở trong ô nhập", async () => {
        const user = userEvent.setup();
        renderPalette(makeActions());

        await user.click(screen.getByLabelText("Ô nhập ngoài bảng lệnh"));
        await user.keyboard("{Meta>}k{/Meta}");

        expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("đóng bằng Escape", async () => {
        const user = userEvent.setup();
        renderPalette(makeActions());

        await openPalette(user);
        await user.keyboard("{Escape}");

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("đóng bằng nút X", async () => {
        const user = userEvent.setup();
        renderPalette(makeActions());

        await openPalette(user);
        await user.click(screen.getByRole("button", { name: "Đóng bảng lệnh" }));

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("không hiện trên trang đăng nhập", async () => {
        state.pathname = "/admin/login";
        const user = userEvent.setup();
        renderPalette(makeActions());

        await user.keyboard("{Meta>}k{/Meta}");

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
});

describe("<CommandPalette /> — lọc danh sách", () => {
    it("thu hẹp danh sách theo từ khoá", async () => {
        const user = userEvent.setup();
        renderPalette(makeActions());

        await openPalette(user);
        expect(screen.getAllByRole("option")).toHaveLength(3);

        await user.keyboard("thẻ");

        const options = screen.getAllByRole("option");
        expect(options).toHaveLength(1);
        expect(options[0]).toHaveTextContent("Thẻ trò chơi");
    });

    it("bỏ dấu khi so khớp, nên gõ không dấu vẫn tìm ra", async () => {
        const user = userEvent.setup();
        renderPalette(makeActions());

        await openPalette(user);
        await user.keyboard("dang xuat");

        expect(screen.getAllByRole("option")).toHaveLength(1);
        expect(screen.getAllByRole("option")[0]).toHaveTextContent("Đăng xuất");
    });

    it("nói rõ khi không có lệnh nào khớp", async () => {
        const user = userEvent.setup();
        renderPalette(makeActions());

        await openPalette(user);
        await user.keyboard("zzzz");

        expect(screen.queryAllByRole("option")).toHaveLength(0);
        expect(screen.getByText(/Không có lệnh nào khớp/)).toBeInTheDocument();
    });

    it("Enter không làm gì khi danh sách rỗng", async () => {
        const links = vi.fn();
        const user = userEvent.setup();
        renderPalette(makeActions({ links }));

        await openPalette(user);
        await user.keyboard("zzzz{Enter}");

        expect(links).not.toHaveBeenCalled();
        expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
});

describe("<CommandPalette /> — điều hướng bàn phím", () => {
    it("mũi tên xuống/lên đổi mục đang chọn", async () => {
        const user = userEvent.setup();
        renderPalette(makeActions());

        await openPalette(user);
        const input = screen.getByRole("combobox", { name: "Tìm lệnh" });

        // Mặc định là mục đầu tiên.
        expect(screen.getAllByRole("option")[0]).toHaveAttribute("aria-selected", "true");
        expect(input).toHaveAttribute("aria-activedescendant", "admin-command-option-0");

        await user.keyboard("{ArrowDown}");
        expect(screen.getAllByRole("option")[1]).toHaveAttribute("aria-selected", "true");
        expect(screen.getAllByRole("option")[0]).toHaveAttribute("aria-selected", "false");
        expect(input).toHaveAttribute("aria-activedescendant", "admin-command-option-1");

        await user.keyboard("{ArrowUp}");
        expect(screen.getAllByRole("option")[0]).toHaveAttribute("aria-selected", "true");
        expect(input).toHaveAttribute("aria-activedescendant", "admin-command-option-0");
    });

    it("đi vòng lại từ cuối lên đầu và ngược lại", async () => {
        const user = userEvent.setup();
        renderPalette(makeActions());

        await openPalette(user);

        // Từ mục đầu, mũi tên lên nhảy xuống mục cuối.
        await user.keyboard("{ArrowUp}");
        expect(screen.getAllByRole("option")[2]).toHaveAttribute("aria-selected", "true");

        // Từ mục cuối, mũi tên xuống quay về mục đầu.
        await user.keyboard("{ArrowDown}");
        expect(screen.getAllByRole("option")[0]).toHaveAttribute("aria-selected", "true");
    });

    it("Home và End nhảy về hai đầu danh sách", async () => {
        const user = userEvent.setup();
        renderPalette(makeActions());

        await openPalette(user);

        await user.keyboard("{End}");
        expect(screen.getAllByRole("option")[2]).toHaveAttribute("aria-selected", "true");

        await user.keyboard("{Home}");
        expect(screen.getAllByRole("option")[0]).toHaveAttribute("aria-selected", "true");
    });

    it("gõ thêm ký tự thì lựa chọn về lại mục đầu của danh sách mới", async () => {
        const user = userEvent.setup();
        renderPalette(makeActions());

        await openPalette(user);
        await user.keyboard("{ArrowDown}{ArrowDown}");
        expect(screen.getAllByRole("option")[2]).toHaveAttribute("aria-selected", "true");

        await user.keyboard("t");
        const options = screen.getAllByRole("option");
        expect(options[0]).toHaveAttribute("aria-selected", "true");
        expect(screen.getByRole("combobox", { name: "Tìm lệnh" })).toHaveAttribute(
            "aria-activedescendant",
            "admin-command-option-0"
        );
    });

    it("cuộn mục đang chọn vào vùng nhìn thấy", async () => {
        const user = userEvent.setup();
        renderPalette(makeActions());

        await openPalette(user);
        scrollIntoView.mockClear();

        await user.keyboard("{ArrowDown}");

        expect(scrollIntoView).toHaveBeenCalled();
        // `this` của lần gọi cuối chính là mục đang chọn.
        const instances = scrollIntoView.mock.instances;
        expect(instances[instances.length - 1]).toBe(screen.getAllByRole("option")[1]);
    });
});

describe("<CommandPalette /> — chạy lệnh", () => {
    it("Enter chạy lệnh đang chọn rồi đóng bảng", async () => {
        const cards = vi.fn();
        const user = userEvent.setup();
        renderPalette(makeActions({ cards }));

        await openPalette(user);
        await user.keyboard("{ArrowDown}{Enter}");

        expect(cards).toHaveBeenCalledTimes(1);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("Enter sau khi lọc chạy đúng lệnh còn lại", async () => {
        const logout = vi.fn();
        const links = vi.fn();
        const user = userEvent.setup();
        renderPalette(makeActions({ logout, links }));

        await openPalette(user);
        await user.keyboard("dang xuat{Enter}");

        expect(logout).toHaveBeenCalledTimes(1);
        expect(links).not.toHaveBeenCalled();
    });

    it("bấm chuột vào một mục cũng chạy lệnh đó", async () => {
        const cards = vi.fn();
        const user = userEvent.setup();
        renderPalette(makeActions({ cards }));

        await openPalette(user);
        await user.click(screen.getByRole("option", { name: /Thẻ trò chơi/ }));

        expect(cards).toHaveBeenCalledTimes(1);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("bấm ra ngoài nền mờ thì đóng mà không chạy lệnh nào", async () => {
        const links = vi.fn();
        const user = userEvent.setup();
        const { container } = renderPalette(makeActions({ links }));

        await openPalette(user);
        const backdrop = container.querySelector("[aria-hidden='true'].absolute");
        expect(backdrop).not.toBeNull();
        await user.click(backdrop as Element);

        expect(links).not.toHaveBeenCalled();
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
});

describe("<CommandPalette /> — focus", () => {
    it("trả focus về phần tử trước đó khi đóng bằng Escape", async () => {
        const user = userEvent.setup();
        renderPalette(makeActions());

        const trigger = screen.getByRole("button", { name: "Nút ngoài bảng lệnh" });
        trigger.focus();
        expect(trigger).toHaveFocus();

        await openPalette(user);
        expect(screen.getByRole("combobox", { name: "Tìm lệnh" })).toHaveFocus();

        await user.keyboard("{Escape}");

        await waitFor(() => expect(trigger).toHaveFocus());
    });

    it("trả focus về phần tử trước đó sau khi chạy một lệnh thường", async () => {
        const user = userEvent.setup();
        renderPalette(makeActions());

        const trigger = screen.getByRole("button", { name: "Nút ngoài bảng lệnh" });
        trigger.focus();

        await openPalette(user);
        await user.keyboard("{Enter}");

        await waitFor(() => expect(trigger).toHaveFocus());
    });

    it("nhường focus cho lệnh tự chuyển focus (movesFocus)", async () => {
        const user = userEvent.setup();
        const target = screen.queryByLabelText("Ô nhập ngoài bảng lệnh");
        expect(target).toBeNull();

        renderPalette([
            {
                id: "focus-search",
                label: "Tìm kiếm trong trang",
                movesFocus: true,
                run: () => screen.getByLabelText("Ô nhập ngoài bảng lệnh").focus(),
            },
        ]);

        const trigger = screen.getByRole("button", { name: "Nút ngoài bảng lệnh" });
        trigger.focus();

        await openPalette(user);
        await user.keyboard("{Enter}");

        await waitFor(() =>
            expect(screen.getByLabelText("Ô nhập ngoài bảng lệnh")).toHaveFocus()
        );
        expect(trigger).not.toHaveFocus();
    });

    it("giữ Tab ở trong hộp thoại", async () => {
        const user = userEvent.setup();
        renderPalette(makeActions());

        await openPalette(user);
        const input = screen.getByRole("combobox", { name: "Tìm lệnh" });
        const closeButton = screen.getByRole("button", { name: "Đóng bảng lệnh" });

        await user.tab();
        expect(closeButton).toHaveFocus();

        await user.tab();
        expect(input).toHaveFocus();

        await user.tab({ shift: true });
        expect(closeButton).toHaveFocus();
    });
});

describe("<CommandPalette /> — cấu trúc trợ năng", () => {
    it("dùng đúng cặp combobox + listbox với aria-activedescendant", async () => {
        const user = userEvent.setup();
        renderPalette(makeActions());

        const dialog = await openPalette(user);
        const input = screen.getByRole("combobox", { name: "Tìm lệnh" });
        const listbox = screen.getByRole("listbox", { name: "Danh sách lệnh" });

        expect(dialog).toHaveAttribute("role", "dialog");
        expect(input).toHaveAttribute("aria-controls", listbox.id);
        expect(input).toHaveAttribute("aria-autocomplete", "list");
        expect(input).toHaveAttribute("aria-expanded", "true");

        // aria-activedescendant phải trỏ tới một option thật đang tồn tại.
        const activeId = input.getAttribute("aria-activedescendant");
        expect(activeId).toBeTruthy();
        const active = document.getElementById(activeId as string);
        expect(active).not.toBeNull();
        expect(active).toHaveAttribute("role", "option");
        expect(within(listbox).getAllByRole("option")).toContain(active);
    });

    it("mỗi mục đều có aria-selected, đúng một mục là true", async () => {
        const user = userEvent.setup();
        renderPalette(makeActions());

        await openPalette(user);
        const options = screen.getAllByRole("option");

        expect(options).toHaveLength(3);
        expect(options.filter((option) => option.getAttribute("aria-selected") === "true")).toHaveLength(1);
    });
});

describe("<CommandPalette /> — bộ lệnh mặc định", () => {
    it("có đủ sáu lệnh quản trị", async () => {
        const user = userEvent.setup();
        renderPalette();

        await openPalette(user);

        expect(optionLabels()).toEqual([
            "Liên kết",
            "Thẻ trò chơi",
            "Design system",
            "Tìm kiếm trong trang",
            "Tạo liên kết mới",
            "Đăng xuất",
        ]);
    });

    it("lệnh design system điều hướng tới trang nội bộ", async () => {
        const user = userEvent.setup();
        renderPalette();

        await openPalette(user);
        await user.keyboard("design system{Enter}");

        expect(mocks.push).toHaveBeenCalledWith("/admin/design-system");
    });

    it("lệnh điều hướng gọi router.push", async () => {
        const user = userEvent.setup();
        renderPalette();

        await openPalette(user);
        await user.keyboard("the tro choi{Enter}");

        expect(mocks.push).toHaveBeenCalledWith("/admin/game-cards");
    });

    it("lệnh tìm kiếm focus vào ô tìm kiếm của bảng admin", async () => {
        const user = userEvent.setup();
        render(
            <ToastProvider>
                <input aria-label="Tìm theo slug hoặc tên người dùng trong trang này" />
                <CommandPalette />
            </ToastProvider>
        );

        await openPalette(user);
        await user.keyboard("tim kiem{Enter}");

        await waitFor(() =>
            expect(
                screen.getByLabelText("Tìm theo slug hoặc tên người dùng trong trang này")
            ).toHaveFocus()
        );
    });

    it("lệnh tạo liên kết bấm vào nút mở hộp thoại đang có trên trang", async () => {
        const onCreate = vi.fn();
        const user = userEvent.setup();
        render(
            <ToastProvider>
                <button type="button" onClick={onCreate}>
                    Tạo Liên Kết Mới
                </button>
                <CommandPalette />
            </ToastProvider>
        );

        await openPalette(user);
        await user.keyboard("tao lien ket{Enter}");

        expect(onCreate).toHaveBeenCalledTimes(1);
        expect(mocks.push).not.toHaveBeenCalled();
    });

    it("không tìm thấy nút tạo thì chuyển sang trang Liên kết", async () => {
        const user = userEvent.setup();
        renderPalette();

        await openPalette(user);
        await user.keyboard("tao lien ket moi{Enter}");

        expect(mocks.push).toHaveBeenCalledWith("/admin/links");
    });

    it("lệnh đăng xuất gửi POST tới /admin/logout rồi về trang đăng nhập", async () => {
        const fetchMock = vi.fn().mockResolvedValue({ ok: true });
        vi.stubGlobal("fetch", fetchMock);

        const user = userEvent.setup();
        renderPalette();

        await openPalette(user);
        await user.keyboard("dang xuat{Enter}");

        await waitFor(() =>
            expect(fetchMock).toHaveBeenCalledWith("/admin/logout", { method: "POST" })
        );
        await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/admin/login"));

        vi.unstubAllGlobals();
    });
});

describe("filterCommands()", () => {
    const actions: CommandAction[] = [
        { id: "a", label: "Liên kết", keywords: ["links"], run: vi.fn() },
        { id: "b", label: "Thẻ trò chơi", description: "quiz", run: vi.fn() },
        { id: "c", label: "Đăng xuất", keywords: ["logout"], run: vi.fn() },
    ];

    it("trả về nguyên danh sách khi không có từ khoá", () => {
        expect(filterCommands(actions, "")).toHaveLength(3);
        expect(filterCommands(actions, "   ")).toHaveLength(3);
    });

    it("khớp theo từ khoá phụ tiếng Anh", () => {
        expect(filterCommands(actions, "logout").map((a) => a.id)).toEqual(["c"]);
        expect(filterCommands(actions, "quiz").map((a) => a.id)).toEqual(["b"]);
    });

    it("ưu tiên khớp trong nhãn hơn khớp trong từ khoá phụ", () => {
        const withOverlap: CommandAction[] = [
            { id: "keyword-only", label: "Tạo liên kết mới", keywords: ["link"], run: vi.fn() },
            { id: "label-hit", label: "Link", run: vi.fn() },
        ];
        expect(filterCommands(withOverlap, "link")[0].id).toBe("label-hit");
    });

    it("khớp mờ theo thứ tự ký tự", () => {
        expect(filterCommands(actions, "lk").map((a) => a.id)).toEqual(["a"]);
    });

    it("bỏ lệnh không khớp", () => {
        expect(filterCommands(actions, "xyzw")).toHaveLength(0);
    });
});

describe("foldVietnamese()", () => {
    it("bỏ dấu thanh và dấu mũ", () => {
        expect(foldVietnamese("Thẻ trò chơi")).toBe("the tro choi");
        expect(foldVietnamese("Liên kết")).toBe("lien ket");
    });

    it("đổi đ/Đ thành d — NFD không tách được chữ này", () => {
        expect(foldVietnamese("Đăng xuất")).toBe("dang xuat");
        expect(foldVietnamese("đỏ")).toBe("do");
    });
});
