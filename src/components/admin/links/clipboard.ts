/**
 * Sao chép văn bản vào clipboard, trả về `true` nếu thành công.
 *
 * Tách khỏi `links-table.tsx` vì dialog thông tin đăng nhập (slug + PIN) cũng
 * cần đúng cơ chế dự phòng này. `navigator.clipboard` chỉ tồn tại trong ngữ
 * cảnh bảo mật (https hoặc localhost); admin thường mở panel qua IP LAN, nơi
 * API đó vắng mặt — nên phần `execCommand("copy")` bên dưới không phải mã chết.
 */
export async function copyText(text: string): Promise<boolean> {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error("navigator.clipboard.writeText thất bại", error);
        }
    }

    try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        return successful;
    } catch (error) {
        console.error("Cơ chế sao chép dự phòng thất bại", error);
        return false;
    }
}
