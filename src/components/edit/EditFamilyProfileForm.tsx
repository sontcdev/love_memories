"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateLinkProfile, FamilyProfileData, FamilyMember } from "@/app/actions/profile-actions";
import { Save, Loader2, Users, Camera, Plus, Trash2, HelpCircle, Map, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

const familyProfileSchema = z.object({
    family_name: z.string().min(1, "Bắt buộc").max(50),
    established_year: z.string().max(10).optional(),
    slogan: z.string().max(300).optional(),
    title: z.string().max(100).optional(),
});

type FamilyFormData = z.infer<typeof familyProfileSchema>;

interface EditFamilyProfileFormProps {
    slug: string;
    initialData: Record<string, unknown> | null;
    isDark?: boolean;
    onSuccess?: () => void;
}

// Helper to compress avatar images
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

export function EditFamilyProfileForm({ slug, initialData, isDark = false, onSuccess }: EditFamilyProfileFormProps) {
    const castData = (initialData as unknown as FamilyProfileData) || {};
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Dynamic states
    const [familyAvatar, setFamilyAvatar] = useState<string>(castData.family_avatar || "");
    const [theme, setTheme] = useState<Required<FamilyProfileData>["theme"]>(castData.theme || "home");
    const [members, setMembers] = useState<FamilyMember[]>(castData.members || []);
    const [quiz, setQuiz] = useState<Required<FamilyProfileData>["quiz"]>(castData.quiz || []);
    const [quizBadges] = useState<Required<FamilyProfileData>["quiz_badges"]>(
        castData.quiz_badges || {
            perfect_title: "Tri Kỷ Trong Nhà", perfect_desc: "Hiểu nhau đến từng chân tơ kẽ tóc!",
            good_title: "Gắn Bó Khăng Khít", good_desc: "Hiểu nhau đến 80% thế này là quá tuyệt vời rồi!",
            average_title: "Cũng Khá Ăn Ý", average_desc: "Cũng tạm hiểu sương sương đấy!",
            low_title: "Cần Gần Nhau Hơn", low_desc: "Cả nhà mình cần dành nhiều thời gian bên nhau hơn nè!",
        }
    );
    const [goals, setGoals] = useState<Required<FamilyProfileData>["goals"]>(castData.goals || []);

    // Expand panels states
    const [activePanel, setActivePanel] = useState<string>("general");
    const [uploadingAvatarId, setUploadingAvatarId] = useState<string | null>(null);
    const [uploadingFamilyAvatar, setUploadingFamilyAvatar] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FamilyFormData>({
        resolver: zodResolver(familyProfileSchema),
        defaultValues: {
            family_name: castData.family_name || "",
            established_year: castData.established_year || "",
            slogan: castData.slogan || "",
            title: castData.title || "",
        },
    });

    const handleAvatarUpload = async (file: File, memberId?: string) => {
        if (memberId) {
            setUploadingAvatarId(memberId);
        } else {
            setUploadingFamilyAvatar(true);
        }
        setMessage(null);

        try {
            const compressed = await compressImage(file, 50, 300);
            const formData = new FormData();
            formData.append("file", compressed);
            formData.append("slug", slug);
            formData.append("type", memberId ? `member_avatar_${memberId}` : "family_avatar");

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const result = await response.json();
            if (result.success && result.url) {
                if (memberId) {
                    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, avatar: result.url } : m));
                } else {
                    setFamilyAvatar(result.url);
                }
            } else {
                setMessage({ type: "error", text: result.error || "Tải ảnh thất bại" });
            }
        } catch (error) {
            console.error("Upload error:", error);
            setMessage({ type: "error", text: "Lỗi tải tập tin" });
        }

        setUploadingAvatarId(null);
        setUploadingFamilyAvatar(false);
    };

    // Members Handlers
    const addMember = () => {
        setMembers(prev => [...prev, {
            id: Math.random().toString(36).substring(2, 11),
            name: "",
            role: "",
            avatar: "",
            quote: "",
            birthday: "",
        }]);
    };

    const removeMember = (id: string) => {
        setMembers(prev => prev.filter(m => m.id !== id));
    };

    const updateMemberField = (id: string, field: keyof FamilyMember, val: string) => {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, [field]: val } : m));
    };

    // Quiz Handlers
    const addQuizQuestion = () => {
        if (quiz.length >= 10) return;
        setQuiz(prev => [...prev, { question: "", options: [], correctIndex: 0 }]);
    };

    const removeQuizQuestion = (idx: number) => {
        setQuiz(prev => prev.filter((_, i) => i !== idx));
    };

    const updateQuestionText = (idx: number, val: string) => {
        setQuiz(prev => prev.map((q, i) => i === idx ? { ...q, question: val } : q));
    };

    const loadSampleQuiz = () => {
        setQuiz([
            { question: "Trong nhà mình, ai là người hay ngủ nướng nhất vào cuối tuần?", options: [], correctIndex: 0 },
            { question: "Ai là người nấu ăn ngon nhất trong gia đình?", options: [], correctIndex: 0 },
            { question: "Ai là 'chuyên gia' hay quên đồ nhất nhà?", options: [], correctIndex: 0 },
            { question: "Ai là người hay lo lắng, nhắc nhở cả nhà nhiều nhất?", options: [], correctIndex: 0 },
            { question: "Khi cả nhà đi chơi xa, ai là người chuẩn bị đồ đạc kỹ nhất?", options: [], correctIndex: 0 }
        ]);
    };

    // Goals Handlers
    const addGoal = () => {
        setGoals(prev => [...prev, { id: Math.random().toString(36).substring(2, 11), title: "", description: "", status: "todo" }]);
    };

    const removeGoal = (id: string) => {
        setGoals(prev => prev.filter(g => g.id !== id));
    };

    const updateGoalField = (id: string, field: "title" | "description" | "status", val: string) => {
        setGoals(prev => prev.map(g => g.id === id ? { ...g, [field]: val } : g));
    };

    const loadSampleGoals = () => {
        setGoals([
            { id: "g1", title: "Ngày cả nhà sum vầy", description: "Khởi đầu cho những năm tháng yêu thương bên nhau", status: "done" },
            { id: "g2", title: "Chuyến du lịch đầu tiên", description: "Cả nhà cùng nhau khám phá vùng đất mới", status: "done" },
            { id: "g3", title: "Ngôi nhà mơ ước", description: "Cùng nhau xây dựng tổ ấm vững chắc cho tương lai", status: "todo" },
            { id: "g4", title: "Sum họp gia đình 2028", description: "Lịch hẹn quây quần đầy đủ các thành viên", status: "todo" }
        ]);
    };

    const onSubmit = async (data: FamilyFormData) => {
        setIsSubmitting(true);
        setMessage(null);

        const fullData: FamilyProfileData = {
            ...data,
            family_avatar: familyAvatar,
            theme: theme,
            members: members,
            quiz: quiz,
            quiz_badges: quizBadges,
            goals: goals,
        };

        const result = await updateLinkProfile(slug, fullData);

        if (result.success) {
            setMessage({ type: "success", text: "Đã cập nhật hồ sơ gia đình thành công!" });
            onSuccess?.();
        } else {
            setMessage({ type: "error", text: result.error || "Có lỗi xảy ra" });
        }
        setIsSubmitting(false);
    };

    const buttonBgColor = theme === "hearth" ? "#ea580c" : (theme === "album" ? "#855430" : "#d97706");

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Header Title */}
            <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5" style={{ color: buttonBgColor }} />
                <h3 className={`text-lg font-serif font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                    Hồ Sơ Kỷ Niệm Gia Đình
                </h3>
            </div>

            {/* Panel 1: Thông tin chung & Chọn chủ đề */}
            <div className={`border rounded-2xl p-4 transition-all ${isDark ? "border-slate-800 bg-slate-900/40" : "border-gray-200 bg-gray-50/50"}`}>
                <button
                    type="button"
                    onClick={() => setActivePanel(activePanel === "general" ? "" : "general")}
                    className="w-full flex items-center justify-between font-semibold text-sm"
                >
                    <span className="flex items-center gap-2" style={{ color: buttonBgColor }}>
                        <Plus className="w-4 h-4" /> Thông tin chung & Chọn chủ đề
                    </span>
                    {activePanel === "general" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {activePanel === "general" && (
                    <div className="mt-4 space-y-4">
                        {/* Family Avatar upload */}
                        <div className="flex flex-col items-center mb-4">
                            <label className={`block text-xs font-semibold mb-2 ${isDark ? "text-slate-400" : "text-gray-700"}`}>
                                Ảnh đại diện gia đình
                            </label>
                            <div className="relative group">
                                <div className="w-32 h-24 rounded-lg border-2 border-dashed border-slate-300 p-1 flex items-center justify-center overflow-hidden bg-slate-50">
                                    {familyAvatar ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={familyAvatar} alt="Family avatar" className="w-full h-full object-cover rounded" />
                                    ) : (
                                        <Users className="w-10 h-10 text-slate-400" />
                                    )}
                                </div>
                                <label className="absolute inset-0 flex items-center justify-center bg-black/45 text-white rounded-lg opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleAvatarUpload(file);
                                        }}
                                        disabled={uploadingFamilyAvatar}
                                    />
                                    {uploadingFamilyAvatar ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                                </label>
                            </div>
                        </div>

                        {/* Text inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold mb-1">Tên gia đình <span className="text-red-500">*</span></label>
                                <input
                                    {...register("family_name")}
                                    className={`w-full px-3 py-2 rounded-lg border text-sm outline-none ${isDark ? "bg-slate-950 border-slate-800 text-white" : "border-gray-300"}`}
                                    placeholder="Ví dụ: Gia Đình Nhà Nguyễn"
                                />
                                {errors.family_name && <p className="text-red-500 text-xs mt-1">{errors.family_name.message}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-1">Năm thành lập</label>
                                <input
                                    {...register("established_year")}
                                    className={`w-full px-3 py-2 rounded-lg border text-sm outline-none ${isDark ? "bg-slate-950 border-slate-800 text-white" : "border-gray-300"}`}
                                    placeholder="Ví dụ: 2010"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold mb-1">Tiêu đề lưu niệm của gia đình</label>
                                <input
                                    {...register("title")}
                                    className={`w-full px-3 py-2 rounded-lg border text-sm outline-none ${isDark ? "bg-slate-950 border-slate-800 text-white" : "border-gray-300"}`}
                                    placeholder="Ví dụ: Tổ Ấm Của Chúng Ta"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold mb-1">Slogan của gia đình</label>
                                <textarea
                                    {...register("slogan")}
                                    rows={2}
                                    className={`w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none ${isDark ? "bg-slate-950 border-slate-800 text-white" : "border-gray-300"}`}
                                    placeholder="Ví dụ: Nơi có gia đình, nơi đó là nhà..."
                                />
                            </div>
                        </div>

                        {/* Theme Picker */}
                        <div className="pt-2">
                            <label className="block text-xs font-bold mb-2">Chọn phong cách chủ đề (Sub-theme)</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: "home", label: "Tổ Ấm Của Ta", desc: "Ấm cúng, ấm áp", border: "border-amber-500", activeBg: "bg-amber-50" },
                                    { id: "album", label: "Album Ảnh", desc: "Giấy kraft cổ điển", border: "border-amber-800", activeBg: "bg-amber-50/50" },
                                    { id: "hearth", label: "Bên Bếp Lửa", desc: "Ấm áp sắc cam", border: "border-orange-500", activeBg: "bg-orange-50" },
                                ].map((item) => {
                                    const isActive = theme === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setTheme(item.id as typeof theme)}
                                            className={`p-3 rounded-xl border text-center transition-all ${
                                                isActive
                                                    ? `border-2 ${item.border} ${isDark ? "bg-white/5" : item.activeBg} scale-103 font-bold`
                                                    : "border-gray-200"
                                            }`}
                                        >
                                            <div className="text-xs">{item.label}</div>
                                            <div className="text-[9px] opacity-65 mt-0.5">{item.desc}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Panel 2: Danh sách thành viên */}
            <div className={`border rounded-2xl p-4 transition-all ${isDark ? "border-slate-800 bg-slate-900/40" : "border-gray-200 bg-gray-50/50"}`}>
                <button
                    type="button"
                    onClick={() => setActivePanel(activePanel === "members" ? "" : "members")}
                    className="w-full flex items-center justify-between font-semibold text-sm"
                >
                    <span className="flex items-center gap-2" style={{ color: buttonBgColor }}>
                        <Users className="w-4 h-4" /> Danh sách thành viên gia đình ({members.length})
                    </span>
                    {activePanel === "members" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {activePanel === "members" && (
                    <div className="mt-4 space-y-5">
                        {members.map((member, idx) => (
                            <div key={member.id} className={`p-4 rounded-xl border relative space-y-4 ${
                                isDark ? "bg-slate-950 border-slate-805" : "bg-white border-gray-200"
                            }`}>
                                <button
                                    type="button"
                                    onClick={() => removeMember(member.id)}
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"
                                    title="Xóa thành viên"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    {/* Member Avatar */}
                                    <div className="relative group shrink-0">
                                        <div className="w-20 h-20 rounded-full border border-dashed border-slate-300 p-0.5 flex items-center justify-center overflow-hidden bg-slate-50">
                                            {member.avatar ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={member.avatar} alt="Member avatar" className="w-full h-full object-cover rounded-full" />
                                            ) : (
                                                <Users className="w-8 h-8 text-slate-400" />
                                            )}
                                        </div>
                                        <label className="absolute inset-0 flex items-center justify-center bg-black/45 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleAvatarUpload(file, member.id);
                                                }}
                                                disabled={uploadingAvatarId === member.id}
                                            />
                                            {uploadingAvatarId === member.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                                        </label>
                                    </div>

                                    {/* Inputs */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 w-full">
                                        <div>
                                            <label className="block text-[10px] font-bold mb-0.5">Tên thành viên {idx + 1}</label>
                                            <input
                                                type="text"
                                                value={member.name}
                                                onChange={(e) => updateMemberField(member.id, "name", e.target.value)}
                                                placeholder="Nguyễn Văn A"
                                                className={`w-full px-2.5 py-1.5 rounded border text-xs outline-none ${isDark ? "bg-slate-900 border-slate-700 text-white" : "border-gray-300"}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold mb-0.5">Vai trò trong gia đình</label>
                                            <input
                                                type="text"
                                                value={member.role || ""}
                                                onChange={(e) => updateMemberField(member.id, "role", e.target.value)}
                                                placeholder="Ví dụ: Bố, Mẹ, Con gái..."
                                                className={`w-full px-2.5 py-1.5 rounded border text-xs outline-none ${isDark ? "bg-slate-900 border-slate-700 text-white" : "border-gray-300"}`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                                    <div>
                                        <label className="block text-[10px] font-bold mb-0.5">Ngày sinh</label>
                                        <input
                                            type="text"
                                            value={member.birthday || ""}
                                            onChange={(e) => updateMemberField(member.id, "birthday", e.target.value)}
                                            placeholder="Ví dụ: 12/05/1990"
                                            className={`w-full px-2.5 py-1.5 rounded border text-xs outline-none ${isDark ? "bg-slate-900 border-slate-700 text-white" : "border-gray-300"}`}
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-[10px] font-bold mb-0.5">Câu nói yêu thích (Quote)</label>
                                        <input
                                            type="text"
                                            value={member.quote || ""}
                                            onChange={(e) => updateMemberField(member.id, "quote", e.target.value)}
                                            placeholder="Gia đình là nơi cuộc sống bắt đầu..."
                                            className={`w-full px-2.5 py-1.5 rounded border text-xs outline-none ${isDark ? "bg-slate-900 border-slate-700 text-white" : "border-gray-300"}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addMember}
                            className="w-full py-2.5 border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                            style={{ color: buttonBgColor, borderColor: `${buttonBgColor}40` }}
                        >
                            <Plus className="w-4 h-4" /> Thêm thành viên gia đình
                        </button>
                    </div>
                )}
            </div>

            {/* Panel 3: Câu hỏi bình chọn */}
            <div className={`border rounded-2xl p-4 transition-all ${isDark ? "border-slate-800 bg-slate-900/40" : "border-gray-200 bg-gray-50/50"}`}>
                <button
                    type="button"
                    onClick={() => setActivePanel(activePanel === "quiz" ? "" : "quiz")}
                    className="w-full flex items-center justify-between font-semibold text-sm"
                >
                    <span className="flex items-center gap-2" style={{ color: buttonBgColor }}>
                        <HelpCircle className="w-4 h-4" /> Câu hỏi bình chọn
                    </span>
                    {activePanel === "quiz" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {activePanel === "quiz" && (
                    <div className="mt-4 space-y-4">
                        {/* Quiz Questions List */}
                        <div className="flex justify-between items-center border-t pt-3 border-amber-900/10">
                            <span className="text-xs text-gray-400">Danh sách câu hỏi bình chọn vui cho gia đình.</span>
                            <button
                                type="button"
                                onClick={loadSampleQuiz}
                                className="text-xs font-semibold hover:underline flex items-center gap-1"
                                style={{ color: buttonBgColor }}
                            >
                                <Sparkles className="w-3.5 h-3.5" /> Tải 5 câu đố vui mẫu
                            </button>
                        </div>

                        {quiz.map((item, qIdx) => (
                            <div key={qIdx} className={`p-4 rounded-lg border ${isDark ? "bg-slate-950 border-slate-800" : "bg-white border-gray-200"} space-y-3 relative`}>
                                <button
                                    type="button"
                                    onClick={() => removeQuizQuestion(qIdx)}
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"
                                    title="Xóa câu hỏi"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                <div>
                                    <label className="block text-xs font-semibold mb-1">Câu hỏi đố {qIdx + 1}</label>
                                    <input
                                        type="text"
                                        value={item.question}
                                        onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                                        placeholder="Nhập câu hỏi đố vui về gia đình..."
                                        className={`w-full px-3 py-1.5 rounded border text-sm outline-none ${isDark ? "bg-slate-900 border-slate-700 text-white focus:border-amber-500" : "border-gray-300"}`}
                                    />
                                </div>
                            </div>
                        ))}

                        {quiz.length < 10 && (
                            <button
                                type="button"
                                onClick={addQuizQuestion}
                                className="w-full py-2 border-2 border-dashed rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                                style={{ color: buttonBgColor, borderColor: `${buttonBgColor}40` }}
                            >
                                <Plus className="w-4 h-4" /> Thêm câu hỏi đố
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Panel 4: Ước mơ & Kỷ niệm gia đình */}
            <div className={`border rounded-2xl p-4 transition-all ${isDark ? "border-slate-800 bg-slate-900/40" : "border-gray-200 bg-gray-50/50"}`}>
                <button
                    type="button"
                    onClick={() => setActivePanel(activePanel === "goals" ? "" : "goals")}
                    className="w-full flex items-center justify-between font-semibold text-sm"
                >
                    <span className="flex items-center gap-2" style={{ color: buttonBgColor }}>
                        <Map className="w-4 h-4" /> Ước mơ & Kỷ niệm gia đình
                    </span>
                    {activePanel === "goals" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {activePanel === "goals" && (
                    <div className="mt-4 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400">Các cột mốc, kỷ niệm hay dự định tương lai của cả gia đình.</span>
                            <button
                                type="button"
                                onClick={loadSampleGoals}
                                className="text-xs font-semibold hover:underline flex items-center gap-1"
                                style={{ color: buttonBgColor }}
                            >
                                <Sparkles className="w-3.5 h-3.5" /> Khởi tạo lộ trình mẫu
                            </button>
                        </div>

                        {goals.map((g, gIdx) => (
                            <div key={g.id} className={`p-4 rounded-lg border ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-gray-200 text-gray-805"} space-y-3 relative`}>
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
                                            onChange={(e) => updateGoalField(g.id, "title", e.target.value)}
                                            placeholder="Tên cột mốc (ví dụ: Ngôi nhà mơ ước)..."
                                            className={`w-full px-3 py-1.5 rounded border text-sm outline-none ${isDark ? "bg-slate-900 border-slate-700 text-white" : "border-gray-300"}`}
                                        />
                                    </div>
                                    <div className="w-full md:w-44">
                                        <label className="block text-xs font-semibold mb-1">Trạng thái đạt</label>
                                        <select
                                            value={g.status}
                                            onChange={(e) => updateGoalField(g.id, "status", e.target.value)}
                                            className={`w-full px-3 py-1.5 rounded border text-sm outline-none ${isDark ? "bg-slate-900 border-slate-700 text-white" : "border-gray-300"}`}
                                        >
                                            <option value="todo">Chưa đạt (Dự kiến)</option>
                                            <option value="done">Đã đạt (Hoàn thành)</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold mb-1">Mô tả ngắn</label>
                                    <input
                                        type="text"
                                        value={g.description}
                                        onChange={(e) => updateGoalField(g.id, "description", e.target.value)}
                                        placeholder="Kỷ niệm hay chi tiết mục tiêu này..."
                                        className={`w-full px-3 py-1.5 rounded border text-sm outline-none ${isDark ? "bg-slate-900 border-slate-700 text-white" : "border-gray-300"}`}
                                    />
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addGoal}
                            className="w-full py-2 border-2 border-dashed rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                            style={{ color: buttonBgColor, borderColor: `${buttonBgColor}40` }}
                        >
                            <Plus className="w-4 h-4" /> Thêm cột mốc mới
                        </button>
                    </div>
                )}
            </div>

            {/* Message Alert */}
            {message && (
                <div
                    className={`p-3 rounded-lg text-sm ${
                        message.type === "success"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                >
                    {message.text}
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-lg text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:brightness-110"
                style={{ backgroundColor: buttonBgColor }}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang lưu...
                    </>
                ) : (
                    <>
                        <Save className="w-5 h-5" />
                        Lưu thay đổi hồ sơ gia đình
                    </>
                )}
            </button>
        </form>
    );
}
