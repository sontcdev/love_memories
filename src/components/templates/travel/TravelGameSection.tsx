"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ChevronLeft, ChevronRight, Loader2, Mail, Send } from "lucide-react";
import {
    getTravelUnspokenAnswers,
    submitTravelUnspokenAnswer,
} from "@/app/actions/travel-unspoken-actions";
import type { TravelUnspokenAnswerView } from "@/app/actions/travel-unspoken-actions";
import {
    TRAVEL_UNSPOKEN_ANSWER_MAX_LENGTH,
    TRAVEL_UNSPOKEN_NAME_MAX_LENGTH,
    type TravelUnspokenQuestion,
} from "@/lib/travel-unspoken";

interface TravelGameSectionProps {
    slug: string;
    questions: TravelUnspokenQuestion[];
    isDark?: boolean;
}

type AnswersByQuestion = Record<string, TravelUnspokenAnswerView[]>;
type TokensByQuestion = Record<string, string>;
type Feedback = { kind: "success" | "error"; message: string } | null;

function readStoredStringMap(key: string): Record<string, string> {
    if (typeof window === "undefined") return {};

    try {
        const value: unknown = JSON.parse(window.sessionStorage.getItem(key) || "{}");
        if (!value || typeof value !== "object" || Array.isArray(value)) return {};

        return Object.fromEntries(
            Object.entries(value).filter(
                ([mapKey, mapValue]) => typeof mapKey === "string" && typeof mapValue === "string"
            )
        );
    } catch {
        return {};
    }
}

function saveStoredStringMap(key: string, value: Record<string, string>): void {
    if (typeof window === "undefined") return;
    try {
        window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Storage may be unavailable in private browsing; the in-memory state
        // still keeps the current visit usable.
    }
}

export function TravelGameSection({ slug, questions, isDark = false }: TravelGameSectionProps) {
    const [participantName, setParticipantName] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [drafts, setDrafts] = useState<Record<string, string>>({});
    const [answersByQuestion, setAnswersByQuestion] = useState<AnswersByQuestion>({});
    const [tokensByQuestion, setTokensByQuestion] = useState<TokensByQuestion>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingQuestionId, setLoadingQuestionId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<Feedback>(null);

    const storageNameKey = useMemo(() => `travel_unspoken_name_${slug}`, [slug]);
    const storageTokenKey = useMemo(() => `travel_unspoken_tokens_${slug}`, [slug]);
    const question = questions[currentIndex];
    const questionId = question?.id;
    const currentDraft = questionId ? drafts[questionId] || "" : "";
    const currentAnswers = questionId ? answersByQuestion[questionId] : undefined;
    const hasRevealedAnswers = questionId ? Object.prototype.hasOwnProperty.call(answersByQuestion, questionId) : false;

    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            setParticipantName(window.sessionStorage.getItem(storageNameKey) || "");
        } catch {
            // Keep the empty name when session storage is unavailable.
        }
        setTokensByQuestion(readStoredStringMap(storageTokenKey));
    }, [storageNameKey, storageTokenKey]);

    useEffect(() => {
        if (!questionId) return;
        const token = tokensByQuestion[questionId];
        if (!token || Object.prototype.hasOwnProperty.call(answersByQuestion, questionId)) return;

        let cancelled = false;
        setLoadingQuestionId(questionId);
        void getTravelUnspokenAnswers(slug, questionId, token).then((result) => {
            if (cancelled) return;
            if (result.success) {
                setAnswersByQuestion((previous) => ({
                    ...previous,
                    [questionId]: result.answers || [],
                }));
            } else {
                setFeedback({ kind: "error", message: result.error || "Không thể tải câu trả lời" });
            }
            setLoadingQuestionId((current) => current === questionId ? null : current);
        }).catch(() => {
            if (!cancelled) {
                setFeedback({ kind: "error", message: "Không thể tải câu trả lời" });
                setLoadingQuestionId((current) => current === questionId ? null : current);
            }
        });

        return () => {
            cancelled = true;
            setLoadingQuestionId((current) => current === questionId ? null : current);
        };
    }, [answersByQuestion, questionId, slug, tokensByQuestion]);

    const rememberName = (value: string) => {
        setParticipantName(value);
        try {
            window.sessionStorage.setItem(storageNameKey, value);
        } catch {
            // The component state remains the source of truth for this visit.
        }
    };

    const updateDraft = (value: string) => {
        if (!questionId) return;
        setDrafts((previous) => ({ ...previous, [questionId]: value }));
        if (feedback?.kind === "error") setFeedback(null);
    };

    const goToQuestion = (nextIndex: number) => {
        if (isSubmitting || nextIndex < 0 || nextIndex >= questions.length) return;
        setCurrentIndex(nextIndex);
        setFeedback(null);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!questionId || isSubmitting) return;

        const cleanName = participantName.trim();
        const cleanAnswer = currentDraft.trim();
        if (!cleanName) {
            setFeedback({ kind: "error", message: "Bạn hãy nhập tên trước khi gửi." });
            return;
        }
        if (cleanName.length > TRAVEL_UNSPOKEN_NAME_MAX_LENGTH) {
            setFeedback({ kind: "error", message: `Tên tối đa ${TRAVEL_UNSPOKEN_NAME_MAX_LENGTH} ký tự.` });
            return;
        }
        if (!cleanAnswer) {
            setFeedback({ kind: "error", message: "Bạn hãy viết một câu trả lời trước khi gửi." });
            return;
        }
        if (cleanAnswer.length > TRAVEL_UNSPOKEN_ANSWER_MAX_LENGTH) {
            setFeedback({ kind: "error", message: `Câu trả lời tối đa ${TRAVEL_UNSPOKEN_ANSWER_MAX_LENGTH} ký tự.` });
            return;
        }

        setIsSubmitting(true);
        setFeedback(null);
        try {
            const result = await submitTravelUnspokenAnswer(slug, questionId, cleanName, cleanAnswer);
            if (!result.success || !result.revealToken) {
                setFeedback({ kind: "error", message: result.error || "Không thể lưu câu trả lời" });
                return;
            }

            const nextTokens = { ...tokensByQuestion, [questionId]: result.revealToken };
            setTokensByQuestion(nextTokens);
            saveStoredStringMap(storageTokenKey, nextTokens);
            setAnswersByQuestion((previous) => ({
                ...previous,
                [questionId]: result.answers || [],
            }));
            setFeedback({ kind: "success", message: "Đã gửi câu trả lời. Bạn có thể đọc những chia sẻ khác." });
        } catch {
            setFeedback({ kind: "error", message: "Không thể lưu câu trả lời" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const shellClass = isDark
        ? "border border-teal-400/20 bg-slate-950/85 text-white shadow-[0_20px_60px_rgba(15,118,110,0.16)]"
        : "border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-amber-50 text-slate-800 shadow-[0_20px_60px_rgba(13,148,136,0.12)]";
    const mutedClass = isDark ? "text-teal-100/70" : "text-slate-500";
    const fieldClass = isDark
        ? "border-teal-400/30 bg-slate-900 text-white placeholder:text-slate-500 focus:border-teal-300 focus:ring-teal-300/40"
        : "border-teal-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500/30";

    if (questions.length === 0) {
        return (
            <section className={`mx-auto w-full max-w-3xl rounded-3xl p-6 md:p-8 ${shellClass}`} aria-labelledby="travel-unspoken-title">
                <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                    <span className="rounded-full bg-teal-500/15 p-4 text-teal-400" aria-hidden="true">
                        <Mail className="h-8 w-8" />
                    </span>
                    <h2 id="travel-unspoken-title" className="text-2xl font-bold">Những điều chưa nói</h2>
                    <p className={`max-w-md text-sm ${mutedClass}`}>
                        Chủ trang chưa thêm câu hỏi nào. Hãy quay lại sau nhé.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className={`mx-auto w-full max-w-3xl rounded-3xl p-5 sm:p-6 md:p-8 ${shellClass}`} aria-labelledby="travel-unspoken-title">
            <header className="mb-6 text-center">
                <div className="mb-2 inline-flex items-center gap-2 text-teal-400">
                    <Mail className="h-6 w-6" aria-hidden="true" />
                    <span className="text-xs font-semibold uppercase tracking-[0.2em]">Bưu thiếp chưa gửi</span>
                </div>
                <h2 id="travel-unspoken-title" className="text-2xl font-bold sm:text-3xl">Những điều chưa nói</h2>
                <p className={`mt-2 text-sm ${mutedClass}`}>
                    Viết tên và chia sẻ thật lòng. Sau khi gửi, bạn sẽ đọc được những lời nhắn khác.
                </p>
            </header>

            <div className="mb-5 rounded-2xl border border-teal-400/20 bg-teal-500/5 p-4">
                <label htmlFor="travel-unspoken-name" className="mb-2 block text-sm font-semibold">
                    Tên người trả lời
                </label>
                <input
                    id="travel-unspoken-name"
                    type="text"
                    value={participantName}
                    onChange={(event) => rememberName(event.target.value)}
                    maxLength={TRAVEL_UNSPOKEN_NAME_MAX_LENGTH}
                    autoComplete="nickname"
                    required
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-4 ${fieldClass}`}
                    placeholder="Ví dụ: An"
                />
                <p className={`mt-2 text-xs ${mutedClass}`}>Tên được giữ trong phiên này để bạn trả lời các câu tiếp theo.</p>
            </div>

            <div className="mb-4 flex items-center justify-between gap-3">
                <button
                    type="button"
                    onClick={() => goToQuestion(currentIndex - 1)}
                    disabled={currentIndex === 0 || isSubmitting}
                    className={`inline-flex min-h-11 items-center gap-1 rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${isDark ? "border-slate-700 bg-slate-900 hover:border-teal-400" : "border-teal-200 bg-white hover:border-teal-400"}`}
                    aria-label="Câu hỏi trước"
                >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Câu trước</span>
                </button>
                <span className={`text-sm font-semibold ${mutedClass}`} aria-live="polite">
                    Câu {currentIndex + 1} / {questions.length}
                </span>
                <button
                    type="button"
                    onClick={() => goToQuestion(currentIndex + 1)}
                    disabled={currentIndex === questions.length - 1 || isSubmitting}
                    className={`inline-flex min-h-11 items-center gap-1 rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${isDark ? "border-slate-700 bg-slate-900 hover:border-teal-400" : "border-teal-200 bg-white hover:border-teal-400"}`}
                    aria-label="Câu hỏi tiếp theo"
                >
                    <span className="hidden sm:inline">Câu tiếp</span>
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>

            <div className={`rounded-2xl border p-5 sm:p-6 ${isDark ? "border-teal-400/25 bg-slate-900/80" : "border-amber-200 bg-white/80"}`}>
                <p className={`mb-5 text-lg font-semibold leading-relaxed sm:text-xl ${isDark ? "text-white" : "text-slate-800"}`}>
                    {question?.content}
                </p>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="travel-unspoken-answer" className="sr-only">Câu trả lời</label>
                    <textarea
                        id="travel-unspoken-answer"
                        value={currentDraft}
                        onChange={(event) => updateDraft(event.target.value)}
                        maxLength={TRAVEL_UNSPOKEN_ANSWER_MAX_LENGTH}
                        required
                        rows={5}
                        disabled={isSubmitting}
                        className={`w-full resize-y rounded-xl border px-4 py-3 text-sm leading-relaxed outline-none transition focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${fieldClass}`}
                        placeholder="Điều bạn muốn gửi lại cho chuyến đi này..."
                    />
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <span className={`text-xs ${mutedClass}`}>{currentDraft.length}/{TRAVEL_UNSPOKEN_ANSWER_MAX_LENGTH}</span>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-900/15 transition hover:from-teal-400 hover:to-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
                            {isSubmitting ? "Đang gửi..." : "Gửi câu trả lời"}
                        </button>
                    </div>
                </form>
            </div>

            <div className="mt-5" aria-live="polite">
                {feedback && (
                    <p
                        role={feedback.kind === "error" ? "alert" : "status"}
                        className={`mb-4 rounded-xl border px-4 py-3 text-sm ${feedback.kind === "error" ? "border-red-400/40 bg-red-500/10 text-red-500" : "border-teal-400/30 bg-teal-500/10 text-teal-400"}`}
                    >
                        {feedback.message}
                    </p>
                )}

                {loadingQuestionId === questionId && (
                    <div className={`flex items-center justify-center gap-2 py-5 text-sm ${mutedClass}`}>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Đang tải lời nhắn...
                    </div>
                )}

                {hasRevealedAnswers && loadingQuestionId !== questionId && (
                    <div>
                        <h3 className="mb-3 text-base font-semibold">Những lời nhắn đã gửi ({currentAnswers?.length || 0})</h3>
                        {currentAnswers && currentAnswers.length > 0 ? (
                            <div className="space-y-3">
                                {currentAnswers.map((savedAnswer) => (
                                    <article key={savedAnswer.id} className={`rounded-2xl border p-4 ${isDark ? "border-slate-700 bg-slate-900/75" : "border-teal-100 bg-white"}`}>
                                        <p className="text-sm font-semibold text-teal-500">{savedAnswer.respondentName}</p>
                                        <p className={`mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                                            {savedAnswer.answer}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <p className={`rounded-xl border border-dashed px-4 py-3 text-sm ${mutedClass}`}>
                                Chưa có lời nhắn nào khác cho câu hỏi này.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
