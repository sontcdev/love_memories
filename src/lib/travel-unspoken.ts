/**
 * Shared domain rules for the Travel "Những điều chưa nói" feature.
 *
 * This module is intentionally free of server-only imports so the public
 * template and the editor can use the same limits and fallback questions.
 */

export const TRAVEL_UNSPOKEN_MAX_QUESTIONS = 20;
export const TRAVEL_UNSPOKEN_QUESTION_MAX_LENGTH = 300;
export const TRAVEL_UNSPOKEN_NAME_MAX_LENGTH = 50;
export const TRAVEL_UNSPOKEN_ANSWER_MAX_LENGTH = 1000;

export interface TravelUnspokenQuestion {
    id: string;
    content: string;
}

/** Stable ids keep answers attached to a question when a visitor navigates. */
export const DEFAULT_TRAVEL_UNSPOKEN_QUESTIONS: readonly TravelUnspokenQuestion[] = [
    {
        id: "travel-unspoken-1",
        content: "Khoảnh khắc nào trong chuyến đi khiến bạn nhớ nhất?",
    },
    {
        id: "travel-unspoken-2",
        content: "Điều gì bạn muốn nói với một người đồng hành nhưng chưa kịp nói?",
    },
    {
        id: "travel-unspoken-3",
        content: "Nếu được quay lại một điểm dừng, bạn sẽ chọn nơi nào và vì sao?",
    },
    {
        id: "travel-unspoken-4",
        content: "Có chi tiết nhỏ nào của chuyến đi làm bạn mỉm cười mỗi khi nhớ lại?",
    },
    {
        id: "travel-unspoken-5",
        content: "Bạn biết ơn ai hoặc điều gì nhất trong hành trình này?",
    },
    {
        id: "travel-unspoken-6",
        content: "Bạn mong chuyến đi tiếp theo của chúng ta sẽ có thêm điều gì?",
    },
];

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
    return value !== null && typeof value === "object" && !Array.isArray(value)
        ? value as UnknownRecord
        : null;
}

function isValidQuestion(value: unknown): value is TravelUnspokenQuestion {
    const record = asRecord(value);
    return Boolean(
        record
        && typeof record.id === "string"
        && record.id.trim().length > 0
        && record.id.trim().length <= 100
        && typeof record.content === "string"
        && record.content.trim().length > 0
        && record.content.trim().length <= TRAVEL_UNSPOKEN_QUESTION_MAX_LENGTH
    );
}

/**
 * Normalize an already extracted list. Invalid rows are ignored for public
 * rendering; writes use `validateTravelUnspokenQuestions` below and reject
 * them instead so an owner never silently loses an edit.
 */
export function normalizeTravelUnspokenQuestions(value: unknown): TravelUnspokenQuestion[] {
    if (!Array.isArray(value)) return [];

    const seen = new Set<string>();
    const normalized: TravelUnspokenQuestion[] = [];

    for (const item of value) {
        if (!isValidQuestion(item)) continue;
        const id = item.id.trim();
        if (seen.has(id)) continue;
        seen.add(id);
        normalized.push({ id, content: item.content.trim() });
        if (normalized.length >= TRAVEL_UNSPOKEN_MAX_QUESTIONS) break;
    }

    return normalized;
}

/**
 * Existing Travel links have no question field yet. They get stable built-ins;
 * an explicitly saved empty list remains empty so an owner can remove all
 * prompts intentionally.
 */
export function getTravelUnspokenQuestions(profileData: unknown): TravelUnspokenQuestion[] {
    const record = asRecord(profileData);
    const raw = record?.unspoken_questions;
    if (!Array.isArray(raw)) return DEFAULT_TRAVEL_UNSPOKEN_QUESTIONS.map((question) => ({ ...question }));
    return normalizeTravelUnspokenQuestions(raw);
}

export interface TravelUnspokenQuestionsValidation {
    success: boolean;
    questions?: TravelUnspokenQuestion[];
    error?: string;
}

/** Strict validation for owner writes and server-side question lookup. */
export function validateTravelUnspokenQuestions(value: unknown): TravelUnspokenQuestionsValidation {
    if (!Array.isArray(value)) {
        return { success: false, error: "Danh sách câu hỏi không hợp lệ" };
    }

    if (value.length > TRAVEL_UNSPOKEN_MAX_QUESTIONS) {
        return { success: false, error: `Tối đa ${TRAVEL_UNSPOKEN_MAX_QUESTIONS} câu hỏi` };
    }

    const seen = new Set<string>();
    const questions: TravelUnspokenQuestion[] = [];

    for (const item of value) {
        if (!isValidQuestion(item)) {
            return {
                success: false,
                error: `Nội dung câu hỏi phải dài từ 1 đến ${TRAVEL_UNSPOKEN_QUESTION_MAX_LENGTH} ký tự`,
            };
        }

        const id = item.id.trim();
        const content = item.content.trim();
        if (seen.has(id)) {
            return { success: false, error: "Mỗi câu hỏi cần có mã riêng" };
        }
        seen.add(id);
        questions.push({ id, content });
    }

    return { success: true, questions };
}

export function findTravelUnspokenQuestion(
    profileData: unknown,
    questionId: string
): TravelUnspokenQuestion | undefined {
    const normalizedId = questionId.trim();
    return getTravelUnspokenQuestions(profileData).find((question) => question.id === normalizedId);
}
