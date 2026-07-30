import { describe, expect, it } from "vitest";
import type { LinkType } from "@prisma/client";
import { EDIT_SHELL_CONFIG, type EditShellContext } from "@/components/edit/templates/edit-shell-config";

/**
 * Quy tắc bất biến của Night/Light ở khu edit:
 *
 * - `supportsThemeMode` chỉ được bật khi chrome của entry đó thực sự có biến thể
 *   tối. Bật nó lên mà slot vẫn là chuỗi tĩnh sẽ tạo ra một nút bấm không đổi gì
 *   trên màn hình.
 * - LOVE và EVERY phải để tắt: template công khai của chúng là code deploy
 *   (không có palette tối), nên bật chế độ tối chỉ làm tối nền qua ThemeWrapper
 *   trong khi mọi thẻ/chữ vẫn màu sáng.
 */

const LIGHT: EditShellContext = { isDark: false, subTheme: "" };
const DARK: EditShellContext = { isDark: true, subTheme: "" };

const THEMED: LinkType[] = [
    "IDOL",
    "GRAD_PERSONAL",
    "GRAD_CLASS",
    "GRAD_GROUP",
    "WEDDING",
    "TRAVEL",
    "FRIENDSHIP",
];
/** Shell tối vĩnh viễn: chrome không đổi theo chế độ, nút chỉ đổi chế độ trang công khai. */
const ALWAYS_DARK: LinkType[] = ["GRAD_CLASS", "GRAD_GROUP"];
/** Có cả hai chế độ, nên chrome buộc phải khác nhau giữa sáng và tối. */
const TWO_MODE = THEMED.filter((t) => !ALWAYS_DARK.includes(t));
const NOT_THEMED: LinkType[] = ["LOVE", "LOVE2", "EVERY"];

function resolve(slot: unknown, ctx: EditShellContext): string {
    return typeof slot === "function" ? (slot as (c: EditShellContext) => string)(ctx) : String(slot);
}

describe("edit-shell-config — Night/Light", () => {
    it.each(THEMED)("%s bật supportsThemeMode", (type) => {
        expect(EDIT_SHELL_CONFIG[type].supportsThemeMode).toBe(true);
    });

    it.each(NOT_THEMED)("%s để tắt supportsThemeMode", (type) => {
        expect(EDIT_SHELL_CONFIG[type].supportsThemeMode ?? false).toBe(false);
    });

    it.each(TWO_MODE)("%s có chrome khác nhau giữa sáng và tối", (type) => {
        const config = EDIT_SHELL_CONFIG[type];

        // Nền trang và thẻ là hai slot bắt buộc phải đổi, vì chúng quyết định
        // toàn bộ cảm nhận sáng/tối của màn hình.
        expect(resolve(config.page, DARK)).not.toBe(resolve(config.page, LIGHT));
        expect(resolve(config.card, DARK)).not.toBe(resolve(config.card, LIGHT));
        expect(resolve(config.header.root, DARK)).not.toBe(resolve(config.header.root, LIGHT));
    });

    it.each(ALWAYS_DARK)("%s là shell tối vĩnh viễn", (type) => {
        expect(EDIT_SHELL_CONFIG[type].contentIsDark).toBe(true);
    });

    it.each(THEMED)("%s render được nút đổi chế độ", (type) => {
        // Không có themeButton thì TemplateEditShell không có class nào để dựng nút.
        expect(EDIT_SHELL_CONFIG[type].header.themeButton).toBeDefined();
    });

    it.each(TWO_MODE)("%s truyền isDark xuống nội dung form", (type) => {
        const { contentIsDark } = EDIT_SHELL_CONFIG[type];
        const read = (ctx: EditShellContext) =>
            typeof contentIsDark === "function" ? contentIsDark(ctx) : contentIsDark ?? false;

        expect(read(DARK)).toBe(true);
        expect(read(LIGHT)).toBe(false);
    });

    it("nền tối của WEDDING/TRAVEL/FRIENDSHIP khớp darkBg của template", () => {
        // Các giá trị này phải trùng `darkBg` mà template truyền cho useThemeToggle
        // và case tương ứng trong ThemeWrapper, nếu không nền trang và chrome lệch nhau.
        expect(resolve(EDIT_SHELL_CONFIG.WEDDING.page, DARK)).toContain("#14100a");
        expect(resolve(EDIT_SHELL_CONFIG.TRAVEL.page, DARK)).toContain("#0a1017");
        expect(resolve(EDIT_SHELL_CONFIG.FRIENDSHIP.page, DARK)).toContain("#140f1c");
    });
});
