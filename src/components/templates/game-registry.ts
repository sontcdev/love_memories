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
        { id: "B", label: "Quiz tình yêu", description: "Bạn hiểu chúng mình đến đâu? Trắc nghiệm về cặp đôi", status: "coming-soon" },
        { id: "C", label: "Ghép chữ tình yêu", description: "Sắp xếp lại các chữ cái để ra từ tình yêu", status: "coming-soon" },
    ],
    LOVE2: [
        { id: "A", label: "Xếp hình 3×3", description: "Xếp lại ô trượt để hoàn thiện bức ảnh", status: "ready" },
        { id: "B", label: "Đoán chú thích", description: "Đoán chú thích cho ảnh trong album", status: "coming-soon" },
        { id: "C", label: "Hũ kỷ niệm", description: "Bốc thẻ kỷ niệm ngẫu nhiên từ hũ", status: "coming-soon" },
    ],
    EVERY: [
        { id: "A", label: "Mặc định", description: "Trò chơi mặc định", status: "ready" },
        { id: "B", label: "Sắp có", description: "Đang phát triển", status: "coming-soon" },
        { id: "C", label: "Sắp có", description: "Đang phát triển", status: "coming-soon" },
    ],
    IDOL: [
        { id: "A", label: "Fan Quiz", description: "5 câu hỏi về thần tượng — bạn là fan cứng đến đâu?", status: "ready" },
        { id: "B", label: "Danh sách biểu diễn", description: "Sắp xếp bài hát theo đúng thứ tự concert", status: "coming-soon" },
        { id: "C", label: "Fan chant", description: "Gõ nhịp cổ vũ theo điệu nhạc", status: "coming-soon" },
    ],
    GRAD_PERSONAL: [
        { id: "A", label: "Quiz tốt nghiệp", description: "Câu hỏi về học sinh từ dữ liệu đã nhập", status: "ready" },
        { id: "B", label: "Mục tiêu tương lai", description: "Ghép mục tiêu với nhóm phù hợp", status: "coming-soon" },
        { id: "C", label: "Kỷ niệm tự chạy", description: "Slideshow kỷ niệm tự phát hiện", status: "coming-soon" },
    ],
    GRAD_CLASS: [
        { id: "A", label: "Quiz lớp học", description: "5 câu hỏi mặc định về lớp", status: "ready" },
        { id: "B", label: "Ai đã nói vậy", description: "Ghép câu nói với bạn cùng lớp", status: "coming-soon" },
        { id: "C", label: "Bình chọn giải thưởng", description: "Bầu chọn 'giỏi nhất', 'hài nhất'...", status: "coming-soon" },
    ],
    GRAD_GROUP: [
        { id: "A", label: "Bình chọn thành viên", description: "Bình chọn cho thành viên theo câu hỏi", status: "ready" },
        { id: "B", label: "Trivia chuyến đi", description: "Câu đố về hành trình nhóm", status: "coming-soon" },
        { id: "C", label: "Xếp hình tập thể", description: "Xếp ảnh nhóm cùng nhau", status: "coming-soon" },
    ],
    WEDDING: [
        { id: "A", label: "Thẻ cặp đôi", description: "Bốc thẻ thử thách EASY/MEDIUM/HARD", status: "ready" },
        { id: "B", label: "Quiz lời hứa", description: "Đoán ai đã nói lời hứa này", status: "coming-soon" },
        { id: "C", label: "Điệu nhảy đầu tiên", description: "Nhớ thứ tự các bước nhảy", status: "coming-soon" },
    ],
    TRAVEL: [
        { id: "A", label: "Thẻ phiêu lưu", description: "Bốc thẻ thử thách du lịch", status: "ready" },
        { id: "B", label: "Đoán địa điểm", description: "Nhận dạng địa điểm từ ảnh", status: "coming-soon" },
        { id: "C", label: "Đóng ba lô", description: "Trò chơi ghi nhớ danh sách đồ mang", status: "coming-soon" },
    ],
    FRIENDSHIP: [
        { id: "A", label: "Thẻ bạn bè", description: "Bốc thẻ thử thách nhóm bạn", status: "ready" },
        { id: "B", label: "Ai có khả năng nhất", description: "Bầu chọn 'ai có khả năng nhất...'", status: "coming-soon" },
        { id: "C", label: "Câu nói nội bộ", description: "Điền vào chỗ trống câu nói nội bộ", status: "coming-soon" },
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
