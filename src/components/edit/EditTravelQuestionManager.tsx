"use client";

import { useRef, useState } from "react";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import { updateLinkProfile, type TravelProfileData } from "@/app/actions/profile-actions";
import {
    getTravelUnspokenQuestions,
    TRAVEL_UNSPOKEN_MAX_QUESTIONS,
    TRAVEL_UNSPOKEN_QUESTION_MAX_LENGTH,
    type TravelUnspokenQuestion,
} from "@/lib/travel-unspoken";
import { SaveStatusIndicator } from "./SaveStatusIndicator";
import { useAutoSave } from "./useAutoSave";
import { useFormFeedback } from "./useFormFeedback";

interface EditTravelQuestionManagerProps {
    slug: string;
    initialData: Record<string, unknown>;
    isDark: boolean;
}

function createQuestionId() {
    const randomUUID = globalThis.crypto?.randomUUID;
    if (typeof randomUUID === "function") return randomUUID.call(globalThis.crypto);

    return `travel-unspoken-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function EditTravelQuestionManager({ slug, initialData, isDark }: EditTravelQuestionManagerProps) {
    const castData = initialData as TravelProfileData;
    const hasMaterializedQuestions = Array.isArray(castData.unspoken_questions);
    const [questions, setQuestions] = useState<TravelUnspokenQuestion[]>(() =>
        getTravelUnspokenQuestions(castData)
    );
    const setMessage = useFormFeedback();
    const initialRef = useRef(JSON.stringify(questions));

    const save = async (value: TravelUnspokenQuestion[]) => {
        const result = await updateLinkProfile(slug, {
            unspoken_questions: value,
        });
        if (!result.success) {
            setMessage({ type: "error", text: result.error || "Không thể lưu câu hỏi" });
        }
        return result;
    };

    const isValid =
        questions.length <= TRAVEL_UNSPOKEN_MAX_QUESTIONS
        && questions.every(
            (question) =>
                question.id.trim().length > 0
                && question.content.trim().length > 0
                && question.content.trim().length <= TRAVEL_UNSPOKEN_QUESTION_MAX_LENGTH
        );
    const isDirty = JSON.stringify(questions) !== initialRef.current;
    const { status, lastSavedAt, error, saveNow } = useAutoSave({
        value: questions,
        save,
        enabled: isDirty && isValid,
    });

    const updateQuestion = (id: string, content: string) => {
        setQuestions((current) => current.map((question) =>
            question.id === id ? { ...question, content } : question
        ));
    };

    const addQuestion = () => {
        if (questions.length >= TRAVEL_UNSPOKEN_MAX_QUESTIONS) return;
        setQuestions((current) => [
            ...current,
            { id: createQuestionId(), content: "" },
        ]);
    };

    const removeQuestion = (id: string) => {
        setQuestions((current) => current.filter((question) => question.id !== id));
    };

    const inputClass = `w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${
        isDark
            ? "border-slate-700 bg-slate-950/70 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400/30"
            : "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500/20"
    }`;
    const mutedClass = isDark ? "text-slate-400" : "text-slate-500";
    const headingClass = isDark ? "text-slate-100" : "text-slate-800";

    return (
        <section
            aria-labelledby="travel-unspoken-settings-title"
            className={`mt-8 rounded-2xl border p-4 sm:p-6 ${
                isDark
                    ? "border-slate-800 bg-slate-900/60"
                    : "border-teal-100 bg-gradient-to-br from-white to-teal-50/50"
            }`}
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                    <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            isDark ? "bg-cyan-400/15 text-cyan-300" : "bg-teal-100 text-teal-700"
                        }`}
                        aria-hidden="true"
                    >
                        <BookOpen className="h-5 w-5" />
                    </span>
                    <div>
                        <h2 id="travel-unspoken-settings-title" className={`text-lg font-bold ${headingClass}`}>
                            Những điều chưa nói
                        </h2>
                        <p className={`mt-1 text-sm leading-relaxed ${mutedClass}`}>
                            Tạo những câu hỏi như các bưu thiếp chưa gửi. Thay đổi sẽ tự động lưu.
                        </p>
                        {!hasMaterializedQuestions && (
                            <p className={`mt-2 text-xs ${mutedClass}`}>
                                Đang dùng câu hỏi mẫu. Lần lưu đầu tiên sẽ tạo danh sách riêng cho trang này.
                            </p>
                        )}
                    </div>
                </div>
                <SaveStatusIndicator status={status} lastSavedAt={lastSavedAt} error={error} onRetry={saveNow} />
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
                <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${mutedClass}`}>
                    {questions.length}/{TRAVEL_UNSPOKEN_MAX_QUESTIONS} câu hỏi
                </p>
                <button
                    type="button"
                    onClick={addQuestion}
                    disabled={questions.length >= TRAVEL_UNSPOKEN_MAX_QUESTIONS}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-teal-600 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Thêm câu hỏi
                </button>
            </div>

            {questions.length === 0 ? (
                <div
                    className={`mt-4 rounded-xl border border-dashed p-6 text-center text-sm ${
                        isDark ? "border-slate-700 text-slate-400" : "border-teal-200 text-slate-500"
                    }`}
                >
                    Chưa có câu hỏi. Thêm một câu để người tham gia bắt đầu chia sẻ.
                </div>
            ) : (
                <div className="mt-4 space-y-3">
                    {questions.map((question, index) => (
                        <div
                            key={question.id}
                            className={`rounded-xl border p-3 sm:p-4 ${
                                isDark ? "border-slate-800 bg-slate-950/40" : "border-slate-200 bg-white"
                            }`}
                        >
                            <div className="mb-2 flex items-center justify-between gap-3">
                                <label
                                    htmlFor={`travel-unspoken-question-${question.id}`}
                                    className={`text-sm font-semibold ${headingClass}`}
                                >
                                    Câu hỏi {index + 1}
                                </label>
                                <button
                                    type="button"
                                    onClick={() => removeQuestion(question.id)}
                                    className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-400 dark:hover:bg-rose-900/30"
                                    aria-label={`Xóa câu hỏi ${index + 1}`}
                                >
                                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                                </button>
                            </div>
                            <textarea
                                id={`travel-unspoken-question-${question.id}`}
                                value={question.content}
                                onChange={(event) => updateQuestion(question.id, event.target.value)}
                                maxLength={TRAVEL_UNSPOKEN_QUESTION_MAX_LENGTH}
                                rows={3}
                                placeholder="Ví dụ: Khoảnh khắc nào trong chuyến đi khiến bạn nhớ nhất?"
                                aria-describedby={`travel-unspoken-question-help-${question.id}`}
                                className={inputClass}
                            />
                            <p id={`travel-unspoken-question-help-${question.id}`} className={`mt-1.5 text-xs ${mutedClass}`}>
                                {question.content.length}/{TRAVEL_UNSPOKEN_QUESTION_MAX_LENGTH} ký tự
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
