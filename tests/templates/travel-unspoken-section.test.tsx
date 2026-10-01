import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    getAnswers: vi.fn(),
    submitAnswer: vi.fn(),
}));

vi.mock("@/app/actions/travel-unspoken-actions", () => ({
    getTravelUnspokenAnswers: mocks.getAnswers,
    submitTravelUnspokenAnswer: mocks.submitAnswer,
}));

import { TravelGameSection } from "@/components/templates/travel/TravelGameSection";

const questions = [
    { id: "q-1", content: "Điều bạn nhớ nhất là gì?" },
    { id: "q-2", content: "Bạn muốn nhắn gì cho chuyến đi?" },
];

beforeEach(() => {
    window.sessionStorage.clear();
    mocks.getAnswers.mockReset().mockResolvedValue({ success: false, error: "Không có token" });
    mocks.submitAnswer.mockReset();
});

describe("TravelGameSection", () => {
    it("does not render other answers before the participant submits", () => {
        render(<TravelGameSection slug="ninh-binh" questions={questions} />);

        expect(screen.getByText(questions[0].content)).toBeInTheDocument();
        expect(screen.queryByText("Người khác")).not.toBeInTheDocument();
        expect(screen.queryByText("Một lời nhắn đã lưu")).not.toBeInTheDocument();
    });

    it("submits the name and current answer, then reveals answers only after success", async () => {
        const user = userEvent.setup();
        let resolveSubmit: ((result: {
            success: true;
            revealToken: string;
            answers: Array<{
                id: string;
                questionId: string;
                respondentName: string;
                answer: string;
                createdAt: string;
            }>;
        }) => void) | undefined;
        mocks.submitAnswer.mockImplementation(() => new Promise((resolve) => {
            resolveSubmit = resolve;
        }));

        render(<TravelGameSection slug="ninh-binh" questions={questions} />);

        await user.type(screen.getByLabelText("Tên người trả lời"), "Mai");
        await user.type(screen.getByLabelText("Câu trả lời"), "Mình nhớ buổi chiều bên sông.");
        await user.click(screen.getByRole("button", { name: "Gửi câu trả lời" }));

        await waitFor(() => expect(mocks.submitAnswer).toHaveBeenCalledWith(
            "ninh-binh",
            "q-1",
            "Mai",
            "Mình nhớ buổi chiều bên sông.",
        ));
        expect(screen.queryByText("Người khác")).not.toBeInTheDocument();
        expect(screen.queryByText("Một lời nhắn đã lưu")).not.toBeInTheDocument();

        resolveSubmit?.({
            success: true,
            revealToken: "signed-reveal-token",
            answers: [{
                id: "answer-1",
                questionId: "q-1",
                respondentName: "Người khác",
                answer: "Một lời nhắn đã lưu",
                createdAt: "2026-09-17T00:00:00.000Z",
            }],
        });

        expect(await screen.findByText("Người khác")).toBeInTheDocument();
        expect(screen.getByText("Một lời nhắn đã lưu")).toBeInTheDocument();
    });

    it("moves between questions without losing each question's draft", async () => {
        const user = userEvent.setup();
        render(<TravelGameSection slug="ninh-binh" questions={questions} />);

        const answer = screen.getByLabelText("Câu trả lời");
        await user.type(answer, "Bản nháp câu đầu");
        await user.click(screen.getByRole("button", { name: "Câu hỏi tiếp theo" }));

        expect(screen.getByText(questions[1].content)).toBeInTheDocument();
        expect(screen.getByLabelText("Câu trả lời")).toHaveValue("");

        await user.type(screen.getByLabelText("Câu trả lời"), "Bản nháp câu sau");
        await user.click(screen.getByRole("button", { name: "Câu hỏi trước" }));

        expect(screen.getByText(questions[0].content)).toBeInTheDocument();
        expect(screen.getByLabelText("Câu trả lời")).toHaveValue("Bản nháp câu đầu");
    });
});
