"use client";

// EditGradProfileFormV2 — bản giữ nguyên implementation mới (toast, auto-save, undo/redo…).
// EditGradProfileForm.tsx đã rollback về đúng phiên bản trên nhánh deploy và chỉ phục vụ
// các LinkType đã có trên deploy; file V2 này phục vụ WEDDING/TRAVEL/FRIENDSHIP.

import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LinkType } from "@prisma/client";
import { updateLinkProfile, GradPersonalProfileData, GradClassProfileData } from "@/app/actions/profile-actions";
import { Save, Loader2, GraduationCap, Users, Camera, Plus, Trash2, HelpCircle, Map, ChevronDown, ChevronUp, Sparkles, Undo2, Redo2 } from "lucide-react";
import { useFormFeedback } from "./useFormFeedback";
import { useFormAutoSave, type SaveStatus } from "./useAutoSave";
import { SaveStatusIndicator } from "./SaveStatusIndicator";
import { useUndoRedo } from "./useUndoRedo";

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

// Thông báo lỗi bằng tiếng Việt: với `mode: "onChange"` (xem bên dưới) các lỗi này
// hiện ngay khi người dùng đang gõ chứ không còn chỉ khi bấm Lưu, nên "Required" và
// các thông báo mặc định (tiếng Anh) của zod đều phải được viết lại.
const personalProfileSchema = z.object({
    student_name: z.string().min(1, "Bắt buộc").max(50, "Tối đa 50 ký tự"),
    class_name: z.string().min(1, "Bắt buộc").max(50, "Tối đa 50 ký tự"),
    school_name: z.string().min(1, "Bắt buộc").max(100, "Tối đa 100 ký tự"),
    graduation_year: z.string().max(10, "Tối đa 10 ký tự").optional(),
    slogan: z.string().max(200, "Tối đa 200 ký tự").optional(),
    dream_job: z.string().max(50, "Tối đa 50 ký tự").optional(),
    dream_university: z.string().max(100, "Tối đa 100 ký tự").optional(),
    title: z.string().max(100, "Tối đa 100 ký tự").optional(),
});

const classProfileSchema = z.object({
    class_name: z.string().min(1, "Bắt buộc").max(50, "Tối đa 50 ký tự"),
    school_name: z.string().min(1, "Bắt buộc").max(100, "Tối đa 100 ký tự"),
    graduation_year: z.string().max(10, "Tối đa 10 ký tự").optional(),
    slogan: z.string().max(200, "Tối đa 200 ký tự").optional(),
    members_count: z.number("Sĩ số phải là số").int("Sĩ số phải là số nguyên").min(1, "Sĩ số tối thiểu là 1").max(200, "Sĩ số tối đa là 200").optional(),
    homeroom_teacher_name: z.string().max(50, "Tối đa 50 ký tự").optional(),
    homeroom_teacher_message: z.string().max(300, "Tối đa 300 ký tự").optional(),
    class_officers_monitor: z.string().max(50, "Tối đa 50 ký tự").optional(),
    class_officers_vice_monitor: z.string().max(50, "Tối đa 50 ký tự").optional(),
    title: z.string().max(100, "Tối đa 100 ký tự").optional(),
});

type PersonalFormData = z.infer<typeof personalProfileSchema>;
type ClassFormData = z.infer<typeof classProfileSchema>;

// ============================================================================
// PROPS INTERFACE
// ============================================================================

interface EditGradProfileFormV2Props {
    slug: string;
    linkType: LinkType;
    initialData: Record<string, unknown> | null;
    isDark?: boolean;
    onSuccess?: () => void;
}

export function EditGradProfileFormV2({ slug, linkType, initialData, isDark = false, onSuccess }: EditGradProfileFormV2Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (linkType === "GRAD_PERSONAL") {
        return (
            <GradPersonalProfileForm
                slug={slug}
                initialData={initialData as unknown as GradPersonalProfileData}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
                onSuccess={onSuccess}
                isDark={isDark}
            />
        );
    }

    if (linkType === "GRAD_CLASS") {
        return (
            <GradClassProfileForm
                slug={slug}
                initialData={initialData as unknown as GradClassProfileData}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
                onSuccess={onSuccess}
                isDark={isDark}
            />
        );
    }

    return null;
}

// ============================================================================
// IMAGE COMPRESSION HELPER
// ============================================================================

const compressImage = async (file: File, maxSizeKB: number = 50, maxDimension: number = 300): Promise<File> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let { width, height } = img;

                if (width > height) {
                    if (width > maxDimension) {
                        height = (height * maxDimension) / width;
                        width = maxDimension;
                    }
                } else {
                    if (height > maxDimension) {
                        width = (width * maxDimension) / height;
                        height = maxDimension;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    resolve(file);
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                let quality = 0.9;
                const tryCompress = () => {
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                resolve(file);
                                return;
                            }

                            if (blob.size <= maxSizeKB * 1024 || quality <= 0.3) {
                                const compressedFile = new File([blob], file.name, {
                                    type: "image/jpeg",
                                    lastModified: Date.now(),
                                });
                                resolve(compressedFile);
                            } else {
                                quality -= 0.1;
                                tryCompress();
                            }
                        },
                        "image/jpeg",
                        quality
                    );
                };

                tryCompress();
            };
            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
    });
};

// ============================================================================
// THANH TRẠNG THÁI LƯU + HOÀN TÁC
// ============================================================================

/**
 * Hàng điều khiển đặt ngay trên nút "Lưu thay đổi": trạng thái tự động lưu +
 * hoàn tác/làm lại.
 *
 * Gom chung vào một component vì cả hồ sơ cá nhân và tập thể lớp đều cần y hệt
 * nhau. Có `isDark` vì khung sửa của GRAD_* chạy cả ở chế độ nền tối.
 *
 * Cả hai nút đều là `type="button"` — nếu để mặc định, bấm hoàn tác sẽ submit form.
 */
function FormSaveToolbar({
    status,
    lastSavedAt,
    error,
    onRetry,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    isDark,
}: {
    status: SaveStatus;
    lastSavedAt: Date | null;
    error: string | null;
    onRetry: () => void;
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
    isDark: boolean;
}) {
    const buttonClass = `inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        isDark
            ? "border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
            : "border-gray-300 text-gray-600 hover:bg-gray-50"
    }`;

    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <SaveStatusIndicator status={status} lastSavedAt={lastSavedAt} error={error} onRetry={onRetry} />
            <div className="ml-auto flex items-center gap-2">
                <button type="button" onClick={onUndo} disabled={!canUndo} className={buttonClass} title="Hoàn tác (Ctrl+Z)">
                    <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Hoàn tác
                </button>
                <button type="button" onClick={onRedo} disabled={!canRedo} className={buttonClass} title="Làm lại (Ctrl+Shift+Z)">
                    <Redo2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Làm lại
                </button>
            </div>
        </div>
    );
}

// ============================================================================
// GRAD PERSONAL PROFILE FORM
// ============================================================================

interface FormProps<T> {
    slug: string;
    initialData: T | null;
    isSubmitting: boolean;
    setIsSubmitting: (v: boolean) => void;
    onSuccess?: () => void;
    isDark?: boolean;
}

function GradPersonalProfileForm({
    slug,
    initialData,
    isSubmitting,
    setIsSubmitting,
    onSuccess,
    isDark = false,
}: FormProps<GradPersonalProfileData>) {
    const setMessage = useFormFeedback();
    const [studentAvatar, setStudentAvatar] = useState<string>(initialData?.student_avatar || "");
    const [uploading, setUploading] = useState(false);
    const [quiz, setQuiz] = useState<Required<GradPersonalProfileData>["quiz"]>(initialData?.quiz || []);
    const [goals, setGoals] = useState<Required<GradPersonalProfileData>["goals"]>(initialData?.goals || []);
    const [showQuizEditor, setShowQuizEditor] = useState(false);
    const [showGoalsEditor, setShowGoalsEditor] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        reset: resetFormValues,
        formState: { errors, isDirty, isValid },
    } = useForm<PersonalFormData>({
        resolver: zodResolver(personalProfileSchema),
        // `mode: "onChange"` là BẮT BUỘC, không phải tùy chọn thẩm mỹ: cổng chặn của
        // tự động lưu là `isDirty && isValid`, mà với mode mặc định ("onSubmit") thì
        // `isValid` chỉ được cập nhật sau lần submit đầu tiên — tự động lưu sẽ hoặc
        // không bao giờ chạy, hoặc chạy với dữ liệu chưa hợp lệ. Đổi mode KHÔNG ảnh
        // hưởng nút "Lưu thay đổi": `handleSubmit` vẫn validate như trước.
        mode: "onChange",
        defaultValues: {
            student_name: initialData?.student_name || "",
            class_name: initialData?.class_name || "",
            school_name: initialData?.school_name || "",
            graduation_year: initialData?.graduation_year || "",
            slogan: initialData?.slogan || "",
            dream_job: initialData?.dream_job || "",
            dream_university: initialData?.dream_university || "",
            title: initialData?.title || "",
        },
    });

    const addQuizQuestion = () => {
        if (quiz.length >= 10) return;
        setQuiz([...quiz, { question: "", options: ["", "", "", ""], correctIndex: 0 }]);
    };

    const removeQuizQuestion = (index: number) => {
        setQuiz(quiz.filter((_, i) => i !== index));
    };

    const updateQuestionText = (index: number, val: string) => {
        const updated = [...quiz];
        updated[index] = { ...updated[index], question: val };
        setQuiz(updated);
    };

    const updateOptionText = (qIndex: number, oIndex: number, val: string) => {
        const updated = [...quiz];
        const updatedOptions = [...updated[qIndex].options];
        updatedOptions[oIndex] = val;
        updated[qIndex] = { ...updated[qIndex], options: updatedOptions };
        setQuiz(updated);
    };

    const updateCorrectIndex = (qIndex: number, val: number) => {
        const updated = [...quiz];
        updated[qIndex] = { ...updated[qIndex], correctIndex: val };
        setQuiz(updated);
    };

    const loadSampleQuiz = () => {
        setQuiz([
            { question: "Môn học nào làm tôi 'ám ảnh' nhất những năm cấp 3?", options: ["Toán", "Vật lý", "Hóa học", "Ngữ văn"], correctIndex: 0 },
            { question: "Hoạt động ngoại khóa nào để lại kỷ niệm sâu sắc nhất?", options: ["Hội trại trường", "Giải bóng đá lớp", "Chuyến đi từ thiện", "Văn nghệ chào mừng"], correctIndex: 0 },
            { question: "Tôi thường làm gì nhất trong giờ ra chơi?", options: ["Xuống căng tin ăn vặt", "Ngủ bù trên bàn", "Tám chuyện với bạn bè", "Đọc truyện/Lướt điện thoại"], correctIndex: 2 },
            { question: "Môn thi đại học tôi tự tin nhất là gì?", options: ["Toán học", "Ngữ văn", "Tiếng Anh", "Tự nhiên/Xã hội"], correctIndex: 0 },
            { question: "Sau này khi ra trường, điều tôi sẽ nhớ nhất là gì?", options: ["Thầy cô giáo", "Đám bạn thân siêu nghịch", "Góc ghế đá sân trường", "Những buổi học muộn"], correctIndex: 1 }
        ]);
    };

    const addGoal = () => {
        setGoals([...goals, { id: Math.random().toString(36).substring(2, 11), title: "", description: "", status: "todo" }]);
    };

    const removeGoal = (id: string) => {
        setGoals(goals.filter(g => g.id !== id));
    };

    const updateGoal = (id: string, updates: Partial<Required<GradPersonalProfileData>["goals"][0]>) => {
        setGoals(goals.map(g => g.id === id ? { ...g, ...updates } : g));
    };

    const loadSampleGoals = () => {
        setGoals([
            { id: "g1", title: "Tốt nghiệp THPT", description: "Vượt qua kỳ thi tốt nghiệp với điểm số mong ước", status: "done" },
            { id: "g2", title: "Đỗ trường đại học mơ ước", description: `Đỗ vào trường đại học mơ ước`, status: "todo" },
            { id: "g3", title: "Khám phá cuộc sống sinh viên", description: "Học tập, kết bạn và tham gia các hoạt động ngoại khóa", status: "todo" },
            { id: "g4", title: "Chạm tay vào công việc mơ ước", description: `Trở thành chuyên gia xuất sắc`, status: "todo" }
        ]);
    };

    const handleAvatarUpload = async (file: File) => {
        setUploading(true);
        try {
            const compressedFile = await compressImage(file, 50, 300);
            const formData = new FormData();
            formData.append("file", compressedFile);
            formData.append("slug", slug);
            formData.append("type", "student_avatar");

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            if (result.success && result.url) {
                setStudentAvatar(result.url);
            } else {
                setMessage({ type: "error", text: result.error || "Tải ảnh thất bại" });
            }
        } catch (error) {
            console.error("Upload error:", error);
            setMessage({ type: "error", text: "Không thể tải ảnh đại diện" });
        }
        setUploading(false);
    };

    /**
     * ĐƯỜNG DUY NHẤT ghi hồ sơ xuống server.
     *
     * Cả nút "Lưu thay đổi" và tự động lưu đều đi qua đây, nên không có chỗ nào gọi
     * `updateLinkProfile` lần thứ hai — hai luồng không thể lệch nhau về payload
     * (ảnh đại diện, trắc nghiệm, bản đồ mục tiêu) hay về cách xử lý lỗi.
     */
    const persist = useCallback(
        async (data: PersonalFormData) => {
            const fullData: GradPersonalProfileData = {
                ...data,
                student_avatar: studentAvatar,
                quiz: quiz,
                goals: goals,
            };
            return updateLinkProfile(slug, fullData);
        },
        [slug, studentAvatar, quiz, goals]
    );

    /**
     * Ảnh đại diện, trắc nghiệm và bản đồ mục tiêu KHÔNG nằm trong react-hook-form
     * (chúng là state riêng), nên `isDirty` của form không biết chúng đã đổi. Nếu chỉ
     * nghe `watch()` thì thêm/sửa/xóa một câu hỏi sẽ không bao giờ được tự động lưu —
     * đúng loại thay đổi dễ mất nhất vì nó nằm trong panel gập lại. Ảnh cũng vậy: file
     * đã nằm trên storage nhưng hồ sơ vẫn trỏ vào ảnh cũ.
     *
     * So sánh theo nội dung với dữ liệu lúc mở trang (giữ trong ref để mốc so sánh
     * không đổi giữa các lần render).
     */
    const initialExtras = useRef(
        JSON.stringify({
            studentAvatar: initialData?.student_avatar || "",
            quiz: initialData?.quiz || [],
            goals: initialData?.goals || [],
        })
    );
    const extrasDirty = JSON.stringify({ studentAvatar, quiz, goals }) !== initialExtras.current;

    /**
     * Tự động lưu — BỔ SUNG cho nút Lưu, không thay thế.
     *
     * Cổng `enabled` chặn mọi trường hợp không nên ghi:
     * - `isDirty || extrasDirty`: chưa ai chạm vào gì thì không ghi (mở trang không
     *   phải là sửa).
     * - `isValid`: dữ liệu sai thì không ghi (server cũng sẽ từ chối).
     * - `!isSubmitting`: đang lưu tay thì không chen ngang.
     * - `!uploading`: đang tải ảnh thì `studentAvatar` còn là URL cũ, ghi lúc này sẽ
     *   đè mất ảnh vừa tải lên.
     */
    const autoSave = useFormAutoSave({
        watch: () => ({ ...watch(), studentAvatar, quiz, goals }),
        isDirty: isDirty || extrasDirty,
        isValid,
        save: persist,
        enabled: (isDirty || extrasDirty) && isValid && !isSubmitting && !uploading,
    });

    /**
     * Hoàn tác/làm lại cho các ô chữ của form.
     *
     * `keepDefaultValues: true` để react-hook-form tính lại `isDirty` bằng cách so
     * với giá trị gốc: hoàn tác về đúng dữ liệu ban đầu thì form trở lại "sạch".
     *
     * Ảnh đại diện, trắc nghiệm và bản đồ mục tiêu nằm ngoài lịch sử này: chúng là
     * state riêng với thao tác thêm/xóa của riêng chúng, gộp vào một ngăn xếp undo
     * dùng chung sẽ khiến Ctrl+Z nhảy lung tung giữa hai vùng khác nhau của form.
     */
    const undoRedo = useUndoRedo<PersonalFormData>({
        value: watch(),
        onChange: (previous) => resetFormValues(previous, { keepDefaultValues: true }),
    });

    const onSubmit = async (data: PersonalFormData) => {
        setIsSubmitting(true);

        const result = await persist(data);

        if (result.success) {
            setMessage({ type: "success", text: "Đã cập nhật hồ sơ cá nhân!" });
            onSuccess?.();
        } else {
            setMessage({ type: "error", text: result.error || "Không thể cập nhật" });
        }
        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-5 h-5 text-emerald-500" />
                <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
                    Hồ sơ tốt nghiệp cá nhân
                </h3>
            </div>

            {/* Avatar Upload */}
            <div className="flex flex-col items-center mb-6">
                <label className={`block text-sm font-medium mb-3 text-center ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                    Ảnh đại diện tốt nghiệp
                </label>
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-300 to-teal-400 p-1 shadow-lg">
                        {studentAvatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={studentAvatar}
                                alt="Student avatar"
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-2xl font-bold text-emerald-500">
                                {initialData?.student_name?.charAt(0) || "🎓"}
                            </div>
                        )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleAvatarUpload(file);
                            }}
                            disabled={uploading}
                        />
                        {uploading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <Camera className="w-6 h-6" />
                        )}
                    </label>
                </div>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                        Tọ và tên học sinh <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register("student_name")}
                        className={`w-full px-4 py-2 rounded-lg border outline-none transition-all ${
                            isDark 
                                ? "bg-slate-900 border-slate-700 text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                                : "border-gray-300 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
                        }`}
                        placeholder="Nguyễn Văn A"
                    />
                    {errors.student_name && (
                        <p className="mt-1 text-sm text-red-500">{errors.student_name.message}</p>
                    )}
                </div>

                <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                        Tên lớp <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register("class_name")}
                        className={`w-full px-4 py-2 rounded-lg border outline-none transition-all ${
                            isDark 
                                ? "bg-slate-900 border-slate-700 text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                                : "border-gray-300 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
                        }`}
                        placeholder="12A1"
                    />
                    {errors.class_name && (
                        <p className="mt-1 text-sm text-red-500">{errors.class_name.message}</p>
                    )}
                </div>

                <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                        Tên trường <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register("school_name")}
                        className={`w-full px-4 py-2 rounded-lg border outline-none transition-all ${
                            isDark 
                                ? "bg-slate-900 border-slate-700 text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                                : "border-gray-300 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
                        }`}
                        placeholder="THPT Chuyên Hà Nội - Amsterdam"
                    />
                    {errors.school_name && (
                        <p className="mt-1 text-sm text-red-500">{errors.school_name.message}</p>
                    )}
                </div>

                <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                        Niên khóa
                    </label>
                    <input
                        {...register("graduation_year")}
                        className={`w-full px-4 py-2 rounded-lg border outline-none transition-all ${
                            isDark 
                                ? "bg-slate-900 border-slate-700 text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                                : "border-gray-300 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
                        }`}
                        placeholder="2023 - 2026"
                    />
                </div>

                <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                        Tiêu đề trang
                    </label>
                    <input
                        {...register("title")}
                        className={`w-full px-4 py-2 rounded-lg border outline-none transition-all ${
                            isDark 
                                ? "bg-slate-900 border-slate-700 text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                                : "border-gray-300 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
                        }`}
                        placeholder="Kỷ niệm của tôi"
                    />
                </div>

                <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                        Công việc mơ ước
                    </label>
                    <input
                        {...register("dream_job")}
                        className={`w-full px-4 py-2 rounded-lg border outline-none transition-all ${
                            isDark 
                                ? "bg-slate-900 border-slate-700 text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                                : "border-gray-300 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
                        }`}
                        placeholder="Kỹ sư Trí tuệ Nhân tạo"
                    />
                </div>

                <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                        Trường đại học mơ ước
                    </label>
                    <input
                        {...register("dream_university")}
                        className={`w-full px-4 py-2 rounded-lg border outline-none transition-all ${
                            isDark 
                                ? "bg-slate-900 border-slate-700 text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                                : "border-gray-300 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
                        }`}
                        placeholder="Đại học Bách Khoa Hà Nội"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                        Châm ngôn cá nhân (Slogan)
                    </label>
                    <textarea
                        {...register("slogan")}
                        rows={3}
                        className={`w-full px-4 py-2 rounded-lg border outline-none transition-all resize-none ${
                            isDark 
                                ? "bg-slate-900 border-slate-700 text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                                : "border-gray-300 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
                        }`}
                        placeholder="Hãy hướng về phía mặt trời..."
                    />
                </div>
            </div>

            {/* Gói 3: Trắc nghiệm Editor */}
            <div className={`border rounded-xl p-4 transition-all ${isDark ? "border-slate-800 bg-slate-900/40" : "border-gray-200 bg-gray-50/50"}`}>
                <button
                    type="button"
                    onClick={() => setShowQuizEditor(!showQuizEditor)}
                    className="w-full flex items-center justify-between font-semibold text-sm"
                >
                    <span className="flex items-center gap-2 text-emerald-500">
                        <HelpCircle className="w-5 h-5" />
                        Trắc nghiệm độ hiểu nhau (Tối đa 10 câu)
                    </span>
                    {showQuizEditor ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showQuizEditor && (
                    <div className="mt-4 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400">Tạo câu hỏi trắc nghiệm để bạn bè thử thách độ hiểu bạn.</span>
                            <button
                                type="button"
                                onClick={loadSampleQuiz}
                                className="text-xs text-emerald-500 hover:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                            >
                                <Sparkles className="w-3.5 h-3.5" /> Tải 5 câu mẫu
                            </button>
                        </div>

                        {quiz.map((item, qIdx) => (
                            <div key={qIdx} className={`p-4 rounded-lg border ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-gray-200 text-gray-800"} space-y-3 relative`}>
                                <button
                                    type="button"
                                    onClick={() => removeQuizQuestion(qIdx)}
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"
                                    title="Xóa câu hỏi"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                
                                <div>
                                    <label className="block text-xs font-semibold mb-1">Câu hỏi {qIdx + 1}</label>
                                    <input
                                        type="text"
                                        value={item.question}
                                        onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                                        placeholder="Nhập câu hỏi (ví dụ: Môn học tôi ám ảnh nhất?)..."
                                        className={`w-full px-3 py-1.5 rounded border text-sm outline-none ${isDark ? "bg-slate-900 border-slate-700 text-white focus:border-emerald-500" : "border-gray-300 focus:border-emerald-400"}`}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {item.options.map((opt, oIdx) => (
                                        <div key={oIdx} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name={`correct-${qIdx}`}
                                                checked={item.correctIndex === oIdx}
                                                onChange={() => updateCorrectIndex(qIdx, oIdx)}
                                                className="text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                                                title="Đánh dấu đáp án đúng"
                                            />
                                            <input
                                                type="text"
                                                value={opt}
                                                onChange={(e) => updateOptionText(qIdx, oIdx, e.target.value)}
                                                placeholder={`Đáp án ${oIdx + 1}`}
                                                className={`flex-1 px-3 py-1 rounded border text-xs outline-none ${isDark ? "bg-slate-900 border-slate-700 text-white focus:border-emerald-500" : "border-gray-300 focus:border-emerald-400"}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {quiz.length < 10 && (
                            <button
                                type="button"
                                onClick={addQuizQuestion}
                                className="w-full py-2 border-2 border-dashed border-emerald-500/30 rounded-xl text-emerald-500 text-xs font-semibold hover:bg-emerald-500/5 transition-all flex items-center justify-center gap-1.5"
                            >
                                <Plus className="w-4 h-4" /> Thêm câu hỏi
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Gói 4: Bản đồ Mục tiêu Editor */}
            <div className={`border rounded-xl p-4 transition-all ${isDark ? "border-slate-800 bg-slate-900/40" : "border-gray-200 bg-gray-50/50"}`}>
                <button
                    type="button"
                    onClick={() => setShowGoalsEditor(!showGoalsEditor)}
                    className="w-full flex items-center justify-between font-semibold text-sm"
                >
                    <span className="flex items-center gap-2 text-indigo-500">
                        <Map className="w-5 h-5" />
                        Bản đồ mục tiêu tương lai
                    </span>
                    {showGoalsEditor ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showGoalsEditor && (
                    <div className="mt-4 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400">Vẽ ra lộ trình học tập, ước mơ và công việc tương lai.</span>
                            <button
                                type="button"
                                onClick={loadSampleGoals}
                                className="text-xs text-indigo-500 hover:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                            >
                                <Sparkles className="w-3.5 h-3.5" /> Khởi tạo lộ trình mẫu
                            </button>
                        </div>

                        {goals.map((g, gIdx) => (
                            <div key={g.id} className={`p-4 rounded-lg border ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-gray-200 text-gray-800"} space-y-3 relative`}>
                                <button
                                    type="button"
                                    onClick={() => removeGoal(g.id)}
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"
                                    title="Xóa cột mốc"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                
                                <div className="flex flex-col md:flex-row gap-3">
                                    <div className="flex-1">
                                        <label className="block text-xs font-semibold mb-1">Cột mốc {gIdx + 1}</label>
                                        <input
                                            type="text"
                                            value={g.title}
                                            onChange={(e) => updateGoal(g.id, { title: e.target.value })}
                                            placeholder="Tên mục tiêu (ví dụ: Đỗ Đại Học Bách Khoa)..."
                                            className={`w-full px-3 py-1.5 rounded border text-sm outline-none ${isDark ? "bg-slate-900 border-slate-700 text-white focus:border-indigo-500" : "border-gray-300 focus:border-indigo-400"}`}
                                        />
                                    </div>
                                    <div className="w-full md:w-44">
                                        <label className="block text-xs font-semibold mb-1">Trạng thái</label>
                                        <select
                                            value={g.status}
                                            onChange={(e) => updateGoal(g.id, { status: e.target.value as "todo" | "done" })}
                                            className={`w-full px-3 py-1.5 rounded border text-sm outline-none ${isDark ? "bg-slate-900 border-slate-700 text-white focus:border-indigo-500" : "border-gray-300 focus:border-indigo-400"}`}
                                        >
                                            <option value="todo">Chưa hoàn thành</option>
                                            <option value="done">Đã hoàn thành</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold mb-1">Mô tả ngắn</label>
                                    <input
                                        type="text"
                                        value={g.description}
                                        onChange={(e) => updateGoal(g.id, { description: e.target.value })}
                                        placeholder="Mô tả về mục tiêu này..."
                                        className={`w-full px-3 py-1.5 rounded border text-sm outline-none ${isDark ? "bg-slate-900 border-slate-700 text-white focus:border-indigo-500" : "border-gray-300 focus:border-indigo-400"}`}
                                    />
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addGoal}
                            className="w-full py-2 border-2 border-dashed border-indigo-500/30 rounded-xl text-indigo-500 text-xs font-semibold hover:bg-indigo-500/5 transition-all flex items-center justify-center gap-1.5"
                        >
                            <Plus className="w-4 h-4" /> Thêm cột mốc
                        </button>
                    </div>
                )}
            </div>

            {/* Trạng thái tự động lưu + hoàn tác, đặt ngay trên nút Lưu */}
            <FormSaveToolbar
                status={autoSave.status}
                lastSavedAt={autoSave.lastSavedAt}
                error={autoSave.error}
                onRetry={autoSave.saveNow}
                canUndo={undoRedo.canUndo}
                canRedo={undoRedo.canRedo}
                onUndo={undoRedo.undo}
                onRedo={undoRedo.redo}
                isDark={isDark}
            />

            <button
                type="submit"
                disabled={isSubmitting || uploading}
                className="w-full py-3 rounded-lg text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:brightness-110"
                style={{ backgroundColor: "var(--theme-accent, #10b981)" }}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang lưu...
                    </>
                ) : (
                    <>
                        <Save className="w-5 h-5" />
                        Lưu thay đổi
                    </>
                )}
            </button>
        </form>
    );
}

// ============================================================================
// GRAD CLASS PROFILE FORM
// ============================================================================

function GradClassProfileForm({
    slug,
    initialData,
    isSubmitting,
    setIsSubmitting,
    onSuccess,
    isDark = false,
}: FormProps<GradClassProfileData>) {
    const setMessage = useFormFeedback();
    const [teacherAvatar, setTeacherAvatar] = useState<string>(initialData?.homeroom_teacher_avatar || "");
    const [uploading, setUploading] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        reset: resetFormValues,
        formState: { errors, isDirty, isValid },
    } = useForm<ClassFormData>({
        resolver: zodResolver(classProfileSchema),
        // Xem giải thích ở GradPersonalProfileForm: cổng của tự động lưu dựa vào
        // `isValid`, giá trị này chỉ đáng tin với mode "onChange".
        mode: "onChange",
        defaultValues: {
            class_name: initialData?.class_name || "",
            school_name: initialData?.school_name || "",
            graduation_year: initialData?.graduation_year || "",
            slogan: initialData?.slogan || "",
            members_count: initialData?.members_count || undefined,
            homeroom_teacher_name: initialData?.homeroom_teacher_name || "",
            homeroom_teacher_message: initialData?.homeroom_teacher_message || "",
            class_officers_monitor: initialData?.class_officers_monitor || "",
            class_officers_vice_monitor: initialData?.class_officers_vice_monitor || "",
            title: initialData?.title || "",
        },
    });

    const handleAvatarUpload = async (file: File) => {
        setUploading(true);
        try {
            const compressedFile = await compressImage(file, 50, 300);
            const formData = new FormData();
            formData.append("file", compressedFile);
            formData.append("slug", slug);
            formData.append("type", "teacher_avatar");

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            if (result.success && result.url) {
                setTeacherAvatar(result.url);
            } else {
                setMessage({ type: "error", text: result.error || "Tải ảnh thất bại" });
            }
        } catch (error) {
            console.error("Upload error:", error);
            setMessage({ type: "error", text: "Không thể tải ảnh giáo viên" });
        }
        setUploading(false);
    };

    /** ĐƯỜNG DUY NHẤT ghi hồ sơ — dùng chung cho nút Lưu và tự động lưu. */
    const persist = useCallback(
        async (data: ClassFormData) => {
            const fullData: GradClassProfileData = {
                ...data,
                homeroom_teacher_avatar: teacherAvatar,
            };
            return updateLinkProfile(slug, fullData);
        },
        [slug, teacherAvatar]
    );

    /**
     * Ảnh GVCN không nằm trong react-hook-form, nên `isDirty` không biết nó đã đổi —
     * xem ghi chú ở GradPersonalProfileForm.
     */
    const initialAvatar = useRef(initialData?.homeroom_teacher_avatar || "");
    const avatarDirty = teacherAvatar !== initialAvatar.current;

    /**
     * Tự động lưu — BỔ SUNG cho nút Lưu, không thay thế.
     *
     * - `isDirty || avatarDirty`: chưa ai chạm vào gì thì không ghi.
     * - `isValid`: dữ liệu sai thì không ghi.
     * - `!isSubmitting`: đang lưu tay thì không chen ngang.
     * - `!uploading`: đang tải ảnh GVCN thì `teacherAvatar` còn là URL cũ, ghi lúc
     *   này sẽ đè mất ảnh vừa tải lên.
     */
    const autoSave = useFormAutoSave({
        watch: () => ({ ...watch(), teacherAvatar }),
        isDirty: isDirty || avatarDirty,
        isValid,
        save: persist,
        enabled: (isDirty || avatarDirty) && isValid && !isSubmitting && !uploading,
    });

    /**
     * Hoàn tác/làm lại. `keepDefaultValues: true` để hoàn tác về đúng dữ liệu ban đầu
     * thì form trở lại "sạch" và tự động lưu tự dừng. Ảnh GVCN nằm ngoài lịch sử này.
     */
    const undoRedo = useUndoRedo<ClassFormData>({
        value: watch(),
        onChange: (previous) => resetFormValues(previous, { keepDefaultValues: true }),
    });

    const onSubmit = async (data: ClassFormData) => {
        setIsSubmitting(true);

        const result = await persist(data);

        if (result.success) {
            setMessage({ type: "success", text: "Đã cập nhật hồ sơ tập thể lớp!" });
            onSuccess?.();
        } else {
            setMessage({ type: "error", text: result.error || "Không thể cập nhật" });
        }
        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-cyan-500" />
                <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
                    Hồ sơ tốt nghiệp tập thể lớp
                </h3>
            </div>

            {/* Teacher Avatar Upload */}
            <div className="flex flex-col items-center mb-6">
                <label className={`block text-sm font-medium mb-3 text-center ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                    Ảnh Giáo viên chủ nhiệm (GVCN)
                </label>
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-300 to-blue-400 p-1 shadow-lg">
                        {teacherAvatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={teacherAvatar}
                                alt="Homeroom teacher avatar"
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-2xl font-bold text-cyan-500">
                                {initialData?.homeroom_teacher_name?.charAt(0) || "👩‍🏫"}
                            </div>
                        )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleAvatarUpload(file);
                            }}
                            disabled={uploading}
                        />
                        {uploading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <Camera className="w-6 h-6" />
                        )}
                    </label>
                </div>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                        Tên lớp <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register("class_name")}
                        className={`w-full px-4 py-2 rounded-lg border outline-none transition-all ${
                            isDark 
                                ? "bg-slate-900 border-slate-700 text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500" 
                                : "border-gray-300 focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400"
                        }`}
                        placeholder="12A1"
                    />
                    {errors.class_name && (
                        <p className="mt-1 text-sm text-red-500">{errors.class_name.message}</p>
                    )}
                </div>

                <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                        Sĩ số thành viên
                    </label>
                    <input
                        {...register("members_count", {
                            // Không dùng `valueAsNumber`: xóa trắng ô số sẽ cho NaN,
                            // zod coi đó là dữ liệu sai và `isValid` hóa false — tự
                            // động lưu sẽ đứng im mà người dùng không thấy lý do vì
                            // sĩ số là trường không bắt buộc. Ô trống ⇒ `undefined`.
                            setValueAs: (v) => (v === "" || v === null ? undefined : Number(v)),
                        })}
                        type="number"
                        className={`w-full px-4 py-2 rounded-lg border outline-none transition-all ${
                            isDark 
                                ? "bg-slate-900 border-slate-700 text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500" 
                                : "border-gray-300 focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400"
                        }`}
                        placeholder="40"
                    />
                    {errors.members_count && (
                        <p className="mt-1 text-sm text-red-500">{errors.members_count.message}</p>
                    )}
                </div>

                <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                        Tên trường <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register("school_name")}
                        className={`w-full px-4 py-2 rounded-lg border outline-none transition-all ${
                            isDark 
                                ? "bg-slate-900 border-slate-700 text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500" 
                                : "border-gray-300 focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400"
                        }`}
                        placeholder="THPT Chuyên Hà Nội - Amsterdam"
                    />
                    {errors.school_name && (
                        <p className="mt-1 text-sm text-red-500">{errors.school_name.message}</p>
                    )}
                </div>

                <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                        Niên khóa
                    </label>
                    <input
                        {...register("graduation_year")}
                        className={`w-full px-4 py-2 rounded-lg border outline-none transition-all ${
                            isDark 
                                ? "bg-slate-900 border-slate-700 text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500" 
                                : "border-gray-300 focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400"
                        }`}
                        placeholder="2023 - 2026"
                    />
                </div>

                <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                        Tiêu đề trang
                    </label>
                    <input
                        {...register("title")}
                        className={`w-full px-4 py-2 rounded-lg border outline-none transition-all ${
                            isDark 
                                ? "bg-slate-900 border-slate-700 text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500" 
                                : "border-gray-300 focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400"
                        }`}
                        placeholder="Cuốn lưu bút số 12A1"
                    />
                </div>

                <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                        Tên Lớp trưởng
                    </label>
                    <input
                        {...register("class_officers_monitor")}
                        className={`w-full px-4 py-2 rounded-lg border outline-none transition-all ${
                            isDark 
                                ? "bg-slate-900 border-slate-700 text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500" 
                                : "border-gray-300 focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400"
                        }`}
                        placeholder="Lớp trưởng"
                    />
                </div>

                <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                        Tên Lớp phó
                    </label>
                    <input
                        {...register("class_officers_vice_monitor")}
                        className={`w-full px-4 py-2 rounded-lg border outline-none transition-all ${
                            isDark 
                                ? "bg-slate-900 border-slate-700 text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500" 
                                : "border-gray-300 focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400"
                        }`}
                        placeholder="Lớp phó"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                        Slogan của lớp
                    </label>
                    <textarea
                        {...register("slogan")}
                        rows={2}
                        className={`w-full px-4 py-2 rounded-lg border outline-none transition-all resize-none ${
                            isDark 
                                ? "bg-slate-900 border-slate-700 text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500" 
                                : "border-gray-300 focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400"
                        }`}
                        placeholder="Sinh ra để tỏa sáng..."
                    />
                </div>

                <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                        Tên GVCN
                    </label>
                    <input
                        {...register("homeroom_teacher_name")}
                        className={`w-full px-4 py-2 rounded-lg border outline-none transition-all ${
                            isDark 
                                ? "bg-slate-900 border-slate-700 text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500" 
                                : "border-gray-300 focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400"
                        }`}
                        placeholder="Cô Nguyễn Thị B"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                        Lời nhắn gửi của GVCN tới lớp
                    </label>
                    <textarea
                        {...register("homeroom_teacher_message")}
                        rows={3}
                        className={`w-full px-4 py-2 rounded-lg border outline-none transition-all resize-none ${
                            isDark 
                                ? "bg-slate-900 border-slate-700 text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500" 
                                : "border-gray-300 focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400"
                        }`}
                        placeholder="Chúc tập thể lớp luôn vững tin..."
                    />
                </div>
            </div>

            {/* Trạng thái tự động lưu + hoàn tác, đặt ngay trên nút Lưu */}
            <FormSaveToolbar
                status={autoSave.status}
                lastSavedAt={autoSave.lastSavedAt}
                error={autoSave.error}
                onRetry={autoSave.saveNow}
                canUndo={undoRedo.canUndo}
                canRedo={undoRedo.canRedo}
                onUndo={undoRedo.undo}
                onRedo={undoRedo.redo}
                isDark={isDark}
            />

            <button
                type="submit"
                disabled={isSubmitting || uploading}
                className="w-full py-3 rounded-lg text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:brightness-110"
                style={{ backgroundColor: "var(--theme-accent, #06b6d4)" }}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang lưu...
                    </>
                ) : (
                    <>
                        <Save className="w-5 h-5" />
                        Lưu thay đổi
                    </>
                )}
            </button>
        </form>
    );
}
