/**
 * Tải một object xuống dưới dạng tệp JSON, hoàn toàn ở client.
 *
 * Dùng Blob + object URL thay vì một route `/api/export`: dữ liệu đã có sẵn
 * trong kết quả của server action, thêm một route nữa chỉ để phát lại đúng dữ
 * liệu đó là thừa. Object URL **phải** được thu hồi, nếu không blob sẽ nằm
 * trong bộ nhớ tới khi tab bị đóng.
 */
export function downloadJson(filename: string, data: unknown): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);

    try {
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        anchor.rel = "noopener";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
    } finally {
        // Thu hồi sau một nhịp chứ không ngay trong cùng tick với click: Safari
        // huỷ luôn việc tải xuống nếu URL biến mất trước khi nó kịp đọc blob.
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
}

/** Tên tệp export: đủ để nhận ra liên kết nào, ngày nào. */
export function exportFileName(slug: string): string {
    const today = new Date().toISOString().slice(0, 10);
    return `link-${slug}-${today}.json`;
}
