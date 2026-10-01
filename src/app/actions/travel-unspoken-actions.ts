"use server";

import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import {
    findTravelUnspokenQuestion,
    TRAVEL_UNSPOKEN_ANSWER_MAX_LENGTH,
    TRAVEL_UNSPOKEN_NAME_MAX_LENGTH,
} from "@/lib/travel-unspoken";

export interface TravelUnspokenAnswerView {
    id: string;
    questionId: string;
    respondentName: string;
    answer: string;
    createdAt: string;
}

interface RevealTokenPayload {
    version: 1;
    slug: string;
    linkId: string;
    questionId: string;
    answerId: string;
}

function getRevealSecret(): string {
    return process.env.AUTH_SECRET
        || process.env.NEXTAUTH_SECRET
        || process.env.ADMIN_SECRET
        || process.env.DATABASE_URL
        || "love_memories_dev_secret";
}

function signRevealPayload(payload: string): string {
    return crypto.createHmac("sha256", getRevealSecret()).update(payload).digest("hex");
}

function createRevealToken(payload: Omit<RevealTokenPayload, "version">): string {
    const encodedPayload = Buffer.from(JSON.stringify({ version: 1, ...payload }), "utf8")
        .toString("base64url");
    return `${encodedPayload}.${signRevealPayload(encodedPayload)}`;
}

function verifyRevealToken(
    token: string,
    expected: Omit<RevealTokenPayload, "version">
): boolean {
    const [encodedPayload, signature, ...extra] = token.split(".");
    if (!encodedPayload || !signature || extra.length > 0) return false;

    const expectedSignature = signRevealPayload(encodedPayload);
    const signatureBuffer = Buffer.from(signature, "utf8");
    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    if (
        signatureBuffer.length !== expectedBuffer.length
        || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
        return false;
    }

    try {
        const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as Partial<RevealTokenPayload>;
        return payload.version === 1
            && payload.slug === expected.slug
            && payload.linkId === expected.linkId
            && payload.questionId === expected.questionId
            && payload.answerId === expected.answerId;
    } catch {
        return false;
    }
}

function cleanBoundedText(value: unknown, maxLength: number): string | null {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed.length > 0 && trimmed.length <= maxLength ? trimmed : null;
}

function answerView(answer: {
    id: string;
    question_id: string;
    respondent_name: string;
    answer: string;
    created_at: Date;
}): TravelUnspokenAnswerView {
    return {
        id: answer.id,
        questionId: answer.question_id,
        respondentName: answer.respondent_name,
        answer: answer.answer,
        createdAt: answer.created_at.toISOString(),
    };
}

async function getPublishedTravelLink(slug: string) {
    const link = await prisma.link.findUnique({
        where: { slug },
        select: {
            id: true,
            type: true,
            is_active: true,
            is_published: true,
            profile_data: true,
        },
    });

    if (!link || link.type !== "TRAVEL") {
        return { link: null, error: "Không tìm thấy trang Travel" };
    }
    if (!link.is_active) {
        return { link: null, error: "Liên kết này không hoạt động" };
    }
    if (!link.is_published) {
        return { link: null, error: "Trang này chưa được xuất bản" };
    }

    return { link, error: undefined };
}

export async function submitTravelUnspokenAnswer(
    slug: string,
    questionId: string,
    respondentName: string,
    answer: string
): Promise<{
    success: boolean;
    answers?: TravelUnspokenAnswerView[];
    revealToken?: string;
    error?: string;
}> {
    try {
        const cleanQuestionId = cleanBoundedText(questionId, 100);
        const cleanName = cleanBoundedText(respondentName, TRAVEL_UNSPOKEN_NAME_MAX_LENGTH);
        const cleanAnswer = cleanBoundedText(answer, TRAVEL_UNSPOKEN_ANSWER_MAX_LENGTH);

        if (!cleanQuestionId) return { success: false, error: "Câu hỏi không hợp lệ" };
        if (!cleanName) {
            return {
                success: false,
                error: `Tên người trả lời phải dài từ 1 đến ${TRAVEL_UNSPOKEN_NAME_MAX_LENGTH} ký tự`,
            };
        }
        if (!cleanAnswer) {
            return {
                success: false,
                error: `Câu trả lời phải dài từ 1 đến ${TRAVEL_UNSPOKEN_ANSWER_MAX_LENGTH} ký tự`,
            };
        }

        const { link, error } = await getPublishedTravelLink(slug);
        if (!link) return { success: false, error };

        const question = findTravelUnspokenQuestion(link.profile_data, cleanQuestionId);
        if (!question) return { success: false, error: "Câu hỏi không còn tồn tại" };

        const saved = await prisma.travelUnspokenAnswer.create({
            data: {
                link_id: link.id,
                question_id: question.id,
                respondent_name: cleanName,
                answer: cleanAnswer,
            },
        });

        const answers = await prisma.travelUnspokenAnswer.findMany({
            where: { link_id: link.id, question_id: question.id },
            orderBy: [{ created_at: "asc" }, { id: "asc" }],
            select: {
                id: true,
                question_id: true,
                respondent_name: true,
                answer: true,
                created_at: true,
            },
        });

        return {
            success: true,
            revealToken: createRevealToken({
                slug,
                linkId: link.id,
                questionId: question.id,
                answerId: saved.id,
            }),
            answers: answers.map(answerView),
        };
    } catch (error) {
        console.error("Submit Travel unspoken answer error:", error);
        return { success: false, error: "Không thể lưu câu trả lời" };
    }
}

export async function getTravelUnspokenAnswers(
    slug: string,
    questionId: string,
    revealToken: string
): Promise<{
    success: boolean;
    answers?: TravelUnspokenAnswerView[];
    error?: string;
}> {
    try {
        const cleanQuestionId = cleanBoundedText(questionId, 100);
        if (!cleanQuestionId || typeof revealToken !== "string" || revealToken.length < 10) {
            return { success: false, error: "Không có quyền xem câu trả lời" };
        }

        const { link, error } = await getPublishedTravelLink(slug);
        if (!link) return { success: false, error };

        const question = findTravelUnspokenQuestion(link.profile_data, cleanQuestionId);
        if (!question) return { success: false, error: "Câu hỏi không còn tồn tại" };

        // A token is minted only after a successful submission and is scoped to
        // this exact link, question, and answer. A boolean/client flag is not
        // sufficient because this action is callable by an unauthenticated guest.
        const tokenParts = revealToken.split(".");
        let answerId = "";
        if (tokenParts.length === 2) {
            try {
                const payload = JSON.parse(Buffer.from(tokenParts[0], "base64url").toString("utf8")) as Partial<RevealTokenPayload>;
                answerId = typeof payload.answerId === "string" ? payload.answerId : "";
            } catch {
                answerId = "";
            }
        }
        if (!answerId || !verifyRevealToken(revealToken, {
            slug,
            linkId: link.id,
            questionId: question.id,
            answerId,
        })) {
            return { success: false, error: "Không có quyền xem câu trả lời" };
        }

        const answers = await prisma.travelUnspokenAnswer.findMany({
            where: { link_id: link.id, question_id: question.id },
            orderBy: [{ created_at: "asc" }, { id: "asc" }],
            select: {
                id: true,
                question_id: true,
                respondent_name: true,
                answer: true,
                created_at: true,
            },
        });

        return { success: true, answers: answers.map(answerView) };
    } catch (error) {
        console.error("Get Travel unspoken answers error:", error);
        return { success: false, error: "Không thể tải câu trả lời" };
    }
}
