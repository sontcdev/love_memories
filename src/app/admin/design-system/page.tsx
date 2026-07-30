import type { Metadata } from "next";
import { DesignSystemClient } from "./design-system-client";

export const metadata: Metadata = {
    title: "Design system | Admin",
    description: "Bảng tham chiếu nội bộ cho các primitive UI",
    robots: { index: false, follow: false },
};

/**
 * Hạng mục A4 của UX_ROADMAP: một nơi render mọi primitive ở mọi state, để chống
 * trôi thiết kế giữa admin và trang sửa.
 *
 * Đặt dưới `/admin` là có chủ đích: middleware đã yêu cầu cookie `admin_session`
 * cho mọi route `/admin/*` (trừ login/setup), nên trang này không mở thêm bề mặt
 * công khai nào. Nó chỉ render UI tĩnh, không đọc/ghi dữ liệu.
 */
export default function DesignSystemPage() {
    return <DesignSystemClient />;
}
