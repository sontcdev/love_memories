export async function copyToClipboard(text: string): Promise<boolean> {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            // Fall through to fallback
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
    } catch {
        return false;
    }
}
