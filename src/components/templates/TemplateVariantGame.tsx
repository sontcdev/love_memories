"use client";

import { useMemo, useState } from "react";
import type { LinkType } from "@prisma/client";
import { Check, Gamepad2, RefreshCw, RotateCcw, Sparkles, Trophy, X } from "lucide-react";
import type { GameVariantId } from "@/components/templates/game-registry";

type Photo = { id: string; url: string; caption?: string | null };
type TimelineItem = { id: string; title: string; description?: string | null };
type ProfileData = Record<string, unknown> | null;

interface TemplateVariantGameProps {
    linkType: LinkType;
    variantId: GameVariantId;
    profileData?: ProfileData;
    photos?: Photo[];
    timelines?: TimelineItem[];
    isDark?: boolean;
}

interface QuizQuestion {
    question: string;
    options: string[];
    correctIndex: number;
}

interface GameConfig {
    title: string;
    subtitle: string;
    badge: string;
    accent: string;
    questions: QuizQuestion[];
    prompts: string[];
}

const TEMPLATE_CONFIGS: Record<LinkType, Record<GameVariantId, GameConfig>> = {
    LOVE: {
        A: baseConfig("Lật ảnh đôi", "Tìm lại những khoảnh khắc trùng nhịp", "LOVE", "from-rose-400 to-pink-500"),
        B: quizConfig("Quiz tình yêu", "Trả lời nhanh về câu chuyện hai người", "LOVE QUIZ", "from-rose-400 to-fuchsia-500", [
            ["Điều quan trọng nhất trong trang này là gì?", ["Ảnh đẹp", "Câu chuyện thật của hai người", "Màu nền", "Hiệu ứng"], 1],
            ["Timeline nên kể theo hướng nào?", ["Ngẫu nhiên", "Từ lúc gặp nhau đến hiện tại", "Chỉ ngày gần nhất", "Chỉ ảnh"], 1],
            ["Một lời nhắn hay nên như thế nào?", ["Riêng tư và thật lòng", "Càng dài càng tốt", "Sao chép mẫu", "Không cần cảm xúc"], 0],
        ]),
        C: promptConfig("Ghép chữ tình yêu", "Bốc một mảnh ghép để nói thành câu", "WORD", "from-pink-400 to-rose-500", [
            "Nói một câu bắt đầu bằng: 'Từ ngày có em/anh...'",
            "Ghép 3 từ: nhớ, thương, nhà thành một câu dành cho người ấy.",
            "Viết lại tên hai người thành một câu slogan tình yêu.",
        ]),
    },
    LOVE2: {
        A: baseConfig("Xếp hình scrapbook", "Hoàn thiện bức ảnh polaroid", "SCRAP", "from-amber-300 to-rose-400"),
        B: quizConfig("Đoán chú thích", "Chọn caption hợp nhất cho album", "CAPTION", "from-amber-300 to-pink-400", [
            ["Caption scrapbook nên ưu tiên gì?", ["Ngắn, tự nhiên, có ký ức", "Dài như bài văn", "Toàn emoji", "Không cần caption"], 0],
            ["Ảnh đầu album nên là ảnh nào?", ["Ảnh rõ mặt/cảm xúc nhất", "Ảnh mờ nhất", "Ảnh bất kỳ", "Ảnh không liên quan"], 0],
        ]),
        C: promptConfig("Hũ kỷ niệm", "Bốc một note nhỏ trong album", "JAR", "from-yellow-300 to-orange-400", [
            "Kể lại khoảnh khắc đằng sau bức ảnh đầu tiên.",
            "Chọn một ảnh và viết caption chỉ 7 từ.",
            "Bốc một kỷ niệm vui nhất rồi gửi cho người ấy.",
        ]),
    },
    EVERY: {
        A: promptConfig("Vòng quay kỷ niệm", "Một câu hỏi cho cả nhóm/sự kiện", "MEMORY", "from-teal-400 to-cyan-500", [
            "Mỗi người kể một khoảnh khắc đáng nhớ nhất.",
            "Chọn một ảnh và nói lý do nó nên ở trang đầu.",
            "Đặt tên khác cho trang kỷ niệm này.",
        ]),
        B: quizConfig("Quiz sự kiện", "Kiểm tra độ hiểu không gian kỷ niệm", "EVENT", "from-cyan-400 to-blue-500", [
            ["Một trang kỷ niệm tốt cần gì trước tiên?", ["Thông điệp rõ", "Nhiều hiệu ứng", "Màu thật mạnh", "Nhạc thật to"], 0],
            ["Timeline nên dùng để làm gì?", ["Kể mốc quan trọng", "Trang trí cho đủ", "Ẩn nội dung", "Thay gallery"], 0],
        ]),
        C: promptConfig("Bingo khoảnh khắc", "Đánh dấu những điều từng xảy ra", "BINGO", "from-emerald-400 to-teal-500", [
            "Ai từng là người chụp ảnh nhiều nhất?",
            "Khoảnh khắc nào khiến mọi người cười lâu nhất?",
            "Một câu nói đại diện cho sự kiện này là gì?",
        ]),
    },
    IDOL: {
        A: baseConfig("Fan Quiz", "Kiểm tra độ fan cứng", "IDOL", "from-yellow-400 to-purple-500"),
        B: quizConfig("Danh sách biểu diễn", "Sắp xếp tinh thần một concert mini", "SETLIST", "from-violet-500 to-fuchsia-500", [
            ["Mở màn concert nên là gì?", ["Intro tạo khí thế", "Encore", "Lời chào kết", "Tắt đèn đi về"], 0],
            ["Phần giữa show nên ưu tiên gì?", ["Hit lớn và fan interaction", "Im lặng", "Chỉ nói chuyện", "Không có nhạc"], 0],
            ["Kết show nên để lại cảm giác gì?", ["Bùng nổ và biết ơn", "Lạnh nhạt", "Khó hiểu", "Vội vàng"], 0],
        ]),
        C: promptConfig("Fan chant", "Bốc một nhịp cổ vũ cho fandom", "CHANT", "from-yellow-400 to-orange-500", [
            "Tạo một fanchant 8 nhịp từ tên idol.",
            "Nói một câu cổ vũ như đang ở hàng ghế đầu.",
            "Viết slogan fandom dưới 10 từ.",
        ]),
    },
    GRAD_PERSONAL: {
        A: baseConfig("Quiz tốt nghiệp", "Nhìn lại hành trình học sinh", "GRAD", "from-emerald-400 to-teal-500"),
        B: quizConfig("Mục tiêu tương lai", "Chọn hướng đi phù hợp sau tốt nghiệp", "GOAL", "from-emerald-500 to-cyan-500", [
            ["Một mục tiêu tốt nên như thế nào?", ["Cụ thể và đo được", "Mơ hồ", "Không có hạn", "Theo người khác"], 0],
            ["Điều nên giữ sau tốt nghiệp là gì?", ["Tinh thần học tiếp", "Sợ sai", "Trì hoãn", "Bỏ cuộc"], 0],
        ]),
        C: promptConfig("Kỷ niệm tự chạy", "Bốc một mốc để kể lại", "MEMO", "from-lime-400 to-emerald-500", [
            "Kể một lần vượt qua áp lực học tập.",
            "Nhắc tên một người đã giúp mình trưởng thành.",
            "Viết lời nhắn cho bản thân 5 năm tới.",
        ]),
    },
    GRAD_CLASS: {
        A: baseConfig("Quiz lớp học", "Nhìn lại tập thể lớp", "CLASS", "from-amber-500 to-orange-500"),
        B: promptConfig("Ai đã nói vậy", "Bốc câu nói và đoán nhân vật", "QUOTE", "from-orange-400 to-amber-500", [
            "Ai hay nói câu: 'Làm bài chưa?'",
            "Ai thường rủ cả lớp đi ăn sau giờ học?",
            "Ai là người hay cứu team lúc kiểm tra nhất?",
        ]),
        C: promptConfig("Bình chọn danh hiệu", "Trao giải vui cho lớp", "AWARD", "from-yellow-400 to-orange-500", [
            "Bình chọn người đúng giờ nhất lớp.",
            "Bình chọn cây hài của tập thể.",
            "Bình chọn người truyền năng lượng tích cực nhất.",
        ]),
    },
    GRAD_GROUP: {
        A: baseConfig("Bình chọn thành viên", "Vote theo câu hỏi nhóm bạn", "GROUP", "from-amber-500 to-yellow-600"),
        B: quizConfig("Trivia chuyến xe", "Câu đố về hành trình thanh xuân", "TRIVIA", "from-amber-400 to-orange-500", [
            ["Một nhóm bạn bền cần gì?", ["Tin nhau và giữ lời", "Luôn thắng tranh luận", "Không gặp nhau", "Không chia sẻ"], 0],
            ["Kỷ yếu nhóm nên tập trung vào gì?", ["Thành viên và chặng đường chung", "Chỉ background", "Chỉ hiệu ứng", "Không cần câu chuyện"], 0],
        ]),
        C: promptConfig("Xếp hình tập thể", "Một nhiệm vụ cho ảnh nhóm", "PUZZLE", "from-orange-400 to-red-500", [
            "Chọn ảnh nhóm đại diện nhất và nói lý do.",
            "Mỗi người đặt một caption cho cùng một ảnh.",
            "Tạo tên chuyến xe thanh xuân bằng 5 từ.",
        ]),
    },
    WEDDING: {
        A: baseConfig("Thẻ cặp đôi", "Bốc thử thách cho khách mời và cô dâu chú rể", "WED", "from-amber-300 to-rose-400"),
        B: quizConfig("Quiz lời hứa", "Đoán tinh thần lời hứa ngày cưới", "VOW", "from-rose-300 to-amber-400", [
            ["Một lời hứa cưới nên có gì?", ["Chân thành và cụ thể", "Sáo rỗng", "Quá dài", "Không liên quan"], 0],
            ["Timeline cưới nên giúp khách mời biết gì?", ["Mốc lễ và giờ tiệc", "Chỉ ảnh", "Chỉ nhạc", "Không cần"], 0],
        ]),
        C: promptConfig("Điệu nhảy đầu tiên", "Bốc một bước nhỏ cho cặp đôi", "DANCE", "from-amber-300 to-yellow-500", [
            "Chọn bài hát cho first dance và nói lý do.",
            "Cô dâu/chú rể nói một câu cảm ơn khách mời.",
            "Kể lại khoảnh khắc biết đây là người mình chọn.",
        ]),
    },
    TRAVEL: {
        A: baseConfig("Thẻ phiêu lưu", "Bốc nhiệm vụ cho chuyến đi", "TRIP", "from-teal-400 to-cyan-500"),
        B: quizConfig("Đoán địa điểm", "Nhận diện tinh thần điểm đến", "PLACE", "from-sky-400 to-teal-500", [
            ["Một timeline du lịch tốt nên theo gì?", ["Theo ngày/chặng", "Theo màu ảnh", "Ngẫu nhiên", "Theo tên file"], 0],
            ["Ảnh travel nên ưu tiên gì?", ["Không khí địa điểm", "Ảnh lặp lại", "Ảnh quá mờ", "Không caption"], 0],
        ]),
        C: promptConfig("Đóng ba lô", "Ghi nhớ món cần mang", "PACK", "from-orange-400 to-teal-500", [
            "Kể 5 món không thể thiếu trong chuyến đi.",
            "Chọn một người làm trưởng đoàn và lý do.",
            "Bốc một địa điểm rồi đặt nhiệm vụ check-in.",
        ]),
    },
    FRIENDSHIP: {
        A: baseConfig("Thẻ bạn bè", "Bốc thử thách vui cho hội bạn", "FRIEND", "from-purple-400 to-pink-500"),
        B: promptConfig("Ai có khả năng nhất", "Bình chọn vui trong nhóm", "VOTE", "from-violet-400 to-fuchsia-500", [
            "Ai có khả năng đến muộn nhất?",
            "Ai có khả năng làm cả nhóm cười nhất?",
            "Ai có khả năng giữ bí mật tốt nhất?",
        ]),
        C: promptConfig("Câu nói nội bộ", "Điền tiếp câu chỉ nhóm hiểu", "JOKE", "from-pink-400 to-cyan-400", [
            "Điền tiếp câu cửa miệng của nhóm.",
            "Kể nguồn gốc một biệt danh nội bộ.",
            "Tạo một mật khẩu vui cho hội bạn.",
        ]),
    },
};

function baseConfig(title: string, subtitle: string, badge: string, accent: string): GameConfig {
    return promptConfig(title, subtitle, badge, accent, []);
}

function quizConfig(title: string, subtitle: string, badge: string, accent: string, questions: [string, string[], number][]): GameConfig {
    return { title, subtitle, badge, accent, questions: questions.map(([question, options, correctIndex]) => ({ question, options, correctIndex })), prompts: [] };
}

function promptConfig(title: string, subtitle: string, badge: string, accent: string, prompts: string[]): GameConfig {
    return { title, subtitle, badge, accent, questions: [], prompts };
}

function getProfileText(profileData: ProfileData, keys: string[], fallback: string) {
    for (const key of keys) {
        const value = profileData?.[key];
        if (typeof value === "string" && value.trim()) return value.trim();
    }
    return fallback;
}

function buildDynamicPrompts(linkType: LinkType, profileData: ProfileData, photos: Photo[], timelines: TimelineItem[]) {
    const title = getProfileText(profileData, ["title", "group_name", "trip_name", "class_name"], "trang này");
    const photoPrompt = photos[0]?.caption ? `Đoán câu chuyện đằng sau ảnh: "${photos[0].caption}"` : "Chọn một ảnh trong gallery và đặt caption mới.";
    const timelinePrompt = timelines[0]?.title ? `Kể lại mốc timeline: "${timelines[0].title}"` : `Tạo một mốc timeline mới cho ${title}.`;

    if (linkType === "EVERY") return [`Nói một điều khiến ${title} đáng nhớ.`, photoPrompt, timelinePrompt];
    return [photoPrompt, timelinePrompt];
}

export function TemplateVariantGame({ linkType, variantId, profileData = null, photos = [], timelines = [], isDark = false }: TemplateVariantGameProps) {
    const config = TEMPLATE_CONFIGS[linkType]?.[variantId] ?? TEMPLATE_CONFIGS.EVERY[variantId];
    const prompts = useMemo(() => [...config.prompts, ...buildDynamicPrompts(linkType, profileData, photos, timelines)], [config.prompts, linkType, profileData, photos, timelines]);
    const [started, setStarted] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [promptIndex, setPromptIndex] = useState(0);
    const [finished, setFinished] = useState(false);

    const isQuiz = config.questions.length > 0;
    const currentQuestion = config.questions[currentIndex];
    const currentPrompt = prompts[promptIndex % Math.max(prompts.length, 1)] ?? "Bốc một nhiệm vụ mới cho template này.";

    const reset = () => {
        setStarted(false);
        setCurrentIndex(0);
        setSelectedIndex(null);
        setScore(0);
        setPromptIndex(0);
        setFinished(false);
    };

    const start = () => {
        setCurrentIndex(0);
        setSelectedIndex(null);
        setScore(0);
        setFinished(false);
        setStarted(true);
    };

    const chooseAnswer = (answerIndex: number) => {
        if (selectedIndex !== null) return;
        setSelectedIndex(answerIndex);
        if (answerIndex === currentQuestion.correctIndex) setScore((value) => value + 1);
    };

    const nextQuestion = () => {
        if (currentIndex < config.questions.length - 1) {
            setCurrentIndex((value) => value + 1);
            setSelectedIndex(null);
        } else {
            setStarted(false);
            setFinished(true);
        }
    };

    const finalScore = Math.round((score / Math.max(config.questions.length, 1)) * 100);

    return (
        <div className={`rounded-3xl border p-6 md:p-8 ${isDark ? "border-white/10 bg-slate-950/60 text-white" : "border-slate-200 bg-white text-slate-900"}`}>
            <div className="mb-6 text-center">
                <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${config.accent} text-white shadow-lg`}>
                    <Gamepad2 className="h-7 w-7" />
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-white bg-gradient-to-r ${config.accent}`}>
                    <Sparkles className="h-3 w-3" />
                    {config.badge} · {variantId}
                </span>
                <h3 className="mt-3 text-2xl font-black">{config.title}</h3>
                <p className={`mt-1 text-sm ${isDark ? "text-white/60" : "text-slate-500"}`}>{config.subtitle}</p>
            </div>

            {!started ? (
                <div className="space-y-4 text-center">
                    {isQuiz && finished ? (
                        <div className={`rounded-3xl p-6 ${isDark ? "bg-white/10" : "bg-slate-50"}`}>
                            <Trophy className="mx-auto mb-3 h-12 w-12 text-amber-400" />
                            <h4 className="text-2xl font-black">Hoàn thành thử thách</h4>
                            <p className={`mt-2 text-sm font-semibold ${isDark ? "text-white/70" : "text-slate-500"}`}>
                                Bạn đạt {score}/{config.questions.length} câu đúng · {finalScore}%
                            </p>
                        </div>
                    ) : (
                        <p className={`rounded-2xl p-5 text-lg font-semibold leading-relaxed ${isDark ? "bg-white/10" : "bg-slate-50"}`}>
                            {isQuiz ? "Sẵn sàng trả lời thử thách riêng của template này?" : currentPrompt}
                        </p>
                    )}
                    <div className="flex flex-col justify-center gap-3 sm:flex-row">
                        <button onClick={isQuiz ? start : () => setStarted(true)} className={`rounded-xl bg-gradient-to-r ${config.accent} px-6 py-3 font-bold text-white shadow-lg transition hover:scale-105`}>
                            {isQuiz ? (finished ? "Chơi lại" : "Bắt đầu quiz") : "Nhận thử thách"}
                        </button>
                        {!isQuiz && (
                            <button
                                onClick={() => setPromptIndex((value) => value + 1)}
                                className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-bold ${isDark ? "bg-white/10 text-white" : "bg-slate-100 text-slate-700"}`}
                            >
                                <RefreshCw className="h-4 w-4" />
                                Đổi thẻ
                            </button>
                        )}
                    </div>
                </div>
            ) : isQuiz ? (
                <div className="space-y-5">
                    <div className="flex items-center justify-between text-sm font-bold">
                        <span>Câu {currentIndex + 1}/{config.questions.length}</span>
                        <span>Điểm: {score}</span>
                    </div>
                    <h4 className="text-xl font-black">{currentQuestion.question}</h4>
                    <div className="grid gap-3">
                        {currentQuestion.options.map((option, index) => {
                            const selected = selectedIndex === index;
                            const correct = currentQuestion.correctIndex === index;
                            const revealed = selectedIndex !== null;
                            return (
                                <button
                                    key={option}
                                    onClick={() => chooseAnswer(index)}
                                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left font-semibold transition ${
                                        revealed && correct
                                            ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                                            : revealed && selected
                                            ? "border-red-300 bg-red-50 text-red-600"
                                            : isDark
                                            ? "border-white/10 bg-white/10 text-white hover:bg-white/15"
                                            : "border-slate-200 bg-white hover:bg-slate-50"
                                    }`}
                                >
                                    {option}
                                    {revealed && correct && <Check className="h-5 w-5" />}
                                    {revealed && selected && !correct && <X className="h-5 w-5" />}
                                </button>
                            );
                        })}
                    </div>
                    <button disabled={selectedIndex === null} onClick={nextQuestion} className={`w-full rounded-xl bg-gradient-to-r ${config.accent} px-5 py-3 font-bold text-white disabled:opacity-50`}>
                        {currentIndex < config.questions.length - 1 ? "Câu tiếp theo" : "Hoàn tất"}
                    </button>
                </div>
            ) : (
                <div className="space-y-5 text-center">
                    <div className={`rounded-3xl p-6 ${isDark ? "bg-white/10" : "bg-slate-50"}`}>
                        <Trophy className="mx-auto mb-3 h-10 w-10 text-amber-400" />
                        <p className="text-xl font-black leading-relaxed">{currentPrompt}</p>
                    </div>
                    <div className="flex flex-col justify-center gap-3 sm:flex-row">
                        <button onClick={() => setPromptIndex((value) => value + 1)} className={`inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${config.accent} px-6 py-3 font-bold text-white`}>
                            <RefreshCw className="h-4 w-4" />
                            Thẻ khác
                        </button>
                        <button onClick={reset} className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-bold ${isDark ? "bg-white/10 text-white" : "bg-slate-100 text-slate-700"}`}>
                            <RotateCcw className="h-4 w-4" />
                            Chơi lại
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
