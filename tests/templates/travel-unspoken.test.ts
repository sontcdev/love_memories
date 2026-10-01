import { describe, expect, it } from "vitest";
import {
    DEFAULT_TRAVEL_UNSPOKEN_QUESTIONS,
    getTravelUnspokenQuestions,
    normalizeTravelUnspokenQuestions,
    TRAVEL_UNSPOKEN_MAX_QUESTIONS,
    validateTravelUnspokenQuestions,
} from "@/lib/travel-unspoken";

describe("Travel unspoken questions", () => {
    it("uses stable built-in questions when an existing profile has no list", () => {
        const questions = getTravelUnspokenQuestions({ trip_name: "Ninh Bình" });

        expect(questions).toEqual(DEFAULT_TRAVEL_UNSPOKEN_QUESTIONS);
        expect(questions).not.toBe(DEFAULT_TRAVEL_UNSPOKEN_QUESTIONS);
    });

    it("keeps an explicitly empty list empty", () => {
        expect(getTravelUnspokenQuestions({ unspoken_questions: [] })).toEqual([]);
    });

    it("trims valid questions and ignores malformed or duplicate rows for rendering", () => {
        expect(normalizeTravelUnspokenQuestions([
            { id: " q-1 ", content: "  Câu hỏi đầu tiên  " },
            { id: "q-1", content: "Bản trùng" },
            { id: "q-2", content: "" },
            { id: "q-3", content: "Câu hỏi thứ ba" },
        ])).toEqual([
            { id: "q-1", content: "Câu hỏi đầu tiên" },
            { id: "q-3", content: "Câu hỏi thứ ba" },
        ]);
    });

    it("strictly validates owner writes and enforces the question cap", () => {
        const tooMany = Array.from({ length: TRAVEL_UNSPOKEN_MAX_QUESTIONS + 1 }, (_, index) => ({
            id: `q-${index}`,
            content: `Câu hỏi ${index}`,
        }));

        expect(validateTravelUnspokenQuestions(tooMany)).toMatchObject({
            success: false,
        });
        expect(validateTravelUnspokenQuestions([
            { id: "q-1", content: "Câu hỏi" },
            { id: "q-1", content: "Câu hỏi khác" },
        ])).toMatchObject({
            success: false,
        });
        expect(validateTravelUnspokenQuestions([
            { id: "q-1", content: "  Câu hỏi hợp lệ  " },
        ])).toEqual({
            success: true,
            questions: [{ id: "q-1", content: "Câu hỏi hợp lệ" }],
        });
    });
});
