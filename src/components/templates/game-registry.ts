import { LinkType } from "@prisma/client";

// ============================================================================
// GAME TEMPLATE REGISTRY
// ----------------------------------------------------------------------------
// Each LinkType has 3 game variants: A (current/default), B, C.
// The selector UI reads this metadata; each GameSection dispatches on the
// chosen variant id ("A" | "B" | "C").
// ============================================================================

export type GameVariantId = "A" | "B" | "C";

export interface GameVariant {
    id: GameVariantId;
    label: string;
    description: string;
    /** Marker showing whether this variant is fully implemented or a stub */
    status: "ready" | "coming-soon";
}

export const GAME_REGISTRY: Record<LinkType, GameVariant[]> = {
    LOVE: [
        { id: "A", label: "Lật ảnh đôi", description: "Lật thẻ tìm cặp ảnh giống nhau từ album", status: "ready" },
        { id: "B", label: "Quiz tình yêu", description: "Bạn hiểu chúng mình đến đâu? Trắc nghiệm về cặp đôi", status: "ready" },
        { id: "C", label: "Ghép chữ tình yêu", description: "Sắp xếp lại các chữ cái để ra từ tình yêu", status: "ready" },
    ],
    LOVE2: [
        { id: "A", label: "Xếp hình 3×3", description: "Xếp lại ô trượt để hoàn thiện bức ảnh", status: "ready" },
        { id: "B", label: "Đoán chú thích", description: "Đoán chú thích cho ảnh trong album", status: "ready" },
        { id: "C", label: "Hũ kỷ niệm", description: "Bốc thẻ kỷ niệm ngẫu nhiên từ hũ", status: "ready" },
    ],
    EVERY: [
        { id: "A", label: "Vòng quay kỷ niệm", description: "Bốc một câu hỏi hoặc nhiệm vụ cho mọi người", status: "ready" },
        { id: "B", label: "Quiz sự kiện", description: "Trắc nghiệm nhanh về trang kỷ niệm chung", status: "ready" },
        { id: "C", label: "Bingo khoảnh khắc", description: "Đánh dấu những điều đã cùng trải qua", status: "ready" },
    ],
    IDOL: [
        { id: "A", label: "Quiz kỷ niệm cá nhân hoá", description: "Câu hỏi dựa trên ngày debut, sinh nhật idol và ngày bạn thành fan", status: "ready" },
        { id: "B", label: "Danh sách biểu diễn", description: "Sắp xếp bài hát theo đúng thứ tự concert", status: "ready" },
        { id: "C", label: "Fan chant", description: "Gõ nhịp cổ vũ theo điệu nhạc", status: "ready" },
    ],
    GRAD_PERSONAL: [
        { id: "A", label: "Quiz tốt nghiệp", description: "Câu hỏi về học sinh từ dữ liệu đã nhập", status: "ready" },
        { id: "B", label: "Mục tiêu tương lai", description: "Ghép mục tiêu với nhóm phù hợp", status: "ready" },
        { id: "C", label: "Kỷ niệm tự chạy", description: "Slideshow kỷ niệm tự phát hiện", status: "ready" },
    ],
    GRAD_CLASS: [
        { id: "A", label: "Quiz lớp học", description: "5 câu hỏi mặc định về lớp", status: "ready" },
        { id: "B", label: "Ai đã nói vậy", description: "Ghép câu nói với bạn cùng lớp", status: "ready" },
        { id: "C", label: "Bình chọn giải thưởng", description: "Bầu chọn 'giỏi nhất', 'hài nhất'...", status: "ready" },
    ],
    GRAD_GROUP: [
        { id: "A", label: "Bình chọn thành viên", description: "Bình chọn cho thành viên theo câu hỏi", status: "ready" },
        { id: "B", label: "Trivia chuyến đi", description: "Câu đố về hành trình nhóm", status: "ready" },
        { id: "C", label: "Xếp hình tập thể", description: "Xếp ảnh nhóm cùng nhau", status: "ready" },
    ],
    WEDDING: [
        { id: "A", label: "Thẻ cặp đôi", description: "Bốc thẻ thử thách EASY/MEDIUM/HARD", status: "ready" },
        { id: "B", label: "Quiz lời hứa", description: "Đoán ai đã nói lời hứa này", status: "ready" },
        { id: "C", label: "Điệu nhảy đầu tiên", description: "Nhớ thứ tự các bước nhảy", status: "ready" },
    ],
    TRAVEL: [
        { id: "A", label: "Thẻ phiêu lưu", description: "Bốc thẻ thử thách du lịch", status: "ready" },
        { id: "B", label: "Đoán địa điểm", description: "Nhận dạng địa điểm từ ảnh", status: "ready" },
        { id: "C", label: "Đóng ba lô", description: "Trò chơi ghi nhớ danh sách đồ mang", status: "ready" },
    ],
    FRIENDSHIP: [
        { id: "A", label: "Thẻ bạn bè", description: "Bốc thẻ thử thách nhóm bạn", status: "ready" },
        { id: "B", label: "Ai có khả năng nhất", description: "Bầu chọn 'ai có khả năng nhất...'", status: "ready" },
        { id: "C", label: "Câu nói nội bộ", description: "Điền vào chỗ trống câu nói nội bộ", status: "ready" },
    ],
    BABY: [],
    FAMILY: [
        { id: "A", label: "Bình chọn thành viên", description: "Bình chọn cho thành viên gia đình theo câu hỏi", status: "ready" },
        { id: "B", label: "Trivia gia đình", description: "Câu đố vui về những kỷ niệm của cả nhà", status: "ready" },
        { id: "C", label: "Xếp hình gia đình", description: "Xếp ảnh gia đình cùng nhau", status: "ready" },
    ],
};

/** Returns variants for a link type, falling back to EVERY. */
export function getGameVariants(linkType: LinkType): GameVariant[] {
    return GAME_REGISTRY[linkType] ?? GAME_REGISTRY.EVERY;
}

/** Returns a single variant by id, falling back to variant A. */
export function getGameVariant(linkType: LinkType, id: GameVariantId): GameVariant {
    const variants = getGameVariants(linkType);
    return variants.find(v => v.id === id) ?? variants[0] ?? variants[0];
}

/** Returns the default game template id for a link type. */
export function getDefaultGameTemplate(): GameVariantId {
    return "A";
}

/** Coerces an arbitrary stored value to a valid GameVariantId. */
export function normalizeGameTemplate(value: string | null | undefined): GameVariantId {
    if (value === "A" || value === "B" || value === "C") return value;
    return getDefaultGameTemplate();
}
