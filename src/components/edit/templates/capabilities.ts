import type { LinkType } from "@prisma/client";

export type FeatureFieldType = "text" | "textarea" | "date" | "number" | "select";

export interface TemplateFeatureField {
    key: string;
    label: string;
    type: FeatureFieldType;
    placeholder?: string;
    maxLength?: number;
    min?: number;
    options?: { label: string; value: string }[];
}

export interface TemplateEditCapability {
    eyebrow: string;
    title: string;
    description: string;
    focus: string;
    workflow: string[];
    fields: TemplateFeatureField[];
}

const defaultWorkflow = ["Điền hồ sơ chính", "Thêm ảnh/timeline", "Chốt cài đặt nhạc và game"];

export const TEMPLATE_EDIT_CAPABILITIES: Record<LinkType, TemplateEditCapability> = {
    LOVE: {
        eyebrow: "Love story",
        title: "Điểm nhấn tình yêu",
        description: "Ưu tiên câu chuyện hai người, ngày kỷ niệm và lời nhắn ngắn xuất hiện ở trang đầu.",
        focus: "Timeline và lời nhắn là trung tâm. Ảnh dùng để bổ trợ cảm xúc.",
        workflow: ["Cập nhật tên và ngày kỷ niệm", "Viết lời nhắn ngắn", "Sắp timeline theo mốc yêu nhau", "Chọn nhạc nền nhẹ"],
        fields: [
            { key: "title", label: "Tiêu đề trang", type: "text", maxLength: 100, placeholder: "Câu chuyện của chúng mình" },
            { key: "short_note", label: "Lời nhắn mở đầu", type: "textarea", maxLength: 200, placeholder: "Một câu thật riêng cho người ấy..." },
            { key: "anniversary_date", label: "Ngày kỷ niệm chính", type: "date" },
        ],
    },
    LOVE2: {
        eyebrow: "Scrapbook",
        title: "Bàn dựng scrapbook",
        description: "Template này cần ảnh, caption và note có cảm giác thủ công như album polaroid.",
        focus: "Gallery-first. Ảnh đẹp và caption ngắn quyết định chất lượng.",
        workflow: ["Upload ảnh đẹp nhất trước", "Viết caption như giấy note", "Bổ sung timeline ngắn", "Chọn màu giấy và nhạc"],
        fields: [
            { key: "title", label: "Tên album scrapbook", type: "text", maxLength: 100, placeholder: "Our little scrapbook" },
            { key: "short_note", label: "Sticky note mở đầu", type: "textarea", maxLength: 200, placeholder: "Một mẩu giấy nhỏ cho ký ức này..." },
            { key: "anniversary_date", label: "Ngày bắt đầu album", type: "date" },
        ],
    },
    EVERY: {
        eyebrow: "Memory hub",
        title: "Không gian kỷ niệm linh hoạt",
        description: "Dành cho trường hợp không thuộc một chủ đề cụ thể, tập trung vào tên nhóm và thông điệp chung.",
        focus: "Cấu trúc trung tính, dùng được cho gia đình, nhóm nhỏ hoặc sự kiện.",
        workflow: defaultWorkflow,
        fields: [
            { key: "group_name", label: "Tên nhóm/sự kiện", type: "text", maxLength: 50, placeholder: "Gia đình, đội nhóm, sự kiện..." },
            { key: "title", label: "Tiêu đề trang", type: "text", maxLength: 100, placeholder: "Our Memories" },
            { key: "short_note", label: "Mô tả ngắn", type: "textarea", maxLength: 200, placeholder: "Trang này lưu lại điều gì?" },
        ],
    },
    IDOL: {
        eyebrow: "Backstage",
        title: "Fanzone sân khấu",
        description: "Tối ưu trang như một concert mini: idol, fan, slogan, debut và tinh thần fandom.",
        focus: "Visual neon, gallery sân khấu và timeline comeback/award.",
        workflow: ["Hoàn thiện idol/fan profile", "Thêm timeline comeback hoặc award", "Chọn game fan quiz", "Bật màu neon/night mode"],
        fields: [
            { key: "title", label: "Tên fanpage", type: "text", maxLength: 100, placeholder: "Tên idol Fan Page" },
            { key: "slogan", label: "Fanchant / slogan", type: "textarea", maxLength: 200, placeholder: "Một câu cổ vũ thật đặc trưng..." },
            { key: "debut_date", label: "Ngày debut / ngày bias", type: "date" },
        ],
    },
    GRAD_PERSONAL: {
        eyebrow: "Graduate desk",
        title: "Hồ sơ tốt nghiệp cá nhân",
        description: "Tập trung vào chân dung học sinh, ước mơ và mục tiêu sau tốt nghiệp.",
        focus: "Profile, goals và lời tri ân quan trọng hơn gallery dàn trải.",
        workflow: ["Điền trường/lớp/năm", "Thêm ước mơ và slogan", "Tạo mục tiêu", "Thêm timeline trưởng thành"],
        fields: [
            { key: "slogan", label: "Câu quote tốt nghiệp", type: "textarea", maxLength: 200, placeholder: "Hành trình mới bắt đầu..." },
            { key: "dream_university", label: "Trường mơ ước", type: "text", maxLength: 80, placeholder: "Tên trường / nơi muốn đến" },
            { key: "dream_job", label: "Nghề nghiệp mơ ước", type: "text", maxLength: 80, placeholder: "Designer, engineer, doctor..." },
        ],
    },
    GRAD_CLASS: {
        eyebrow: "Yearbook board",
        title: "Bảng kỷ yếu tập thể",
        description: "Tập trung vào lớp, giáo viên chủ nhiệm, sĩ số và tinh thần chung của tập thể.",
        focus: "Members, thông điệp giáo viên và timeline lớp là lõi.",
        workflow: ["Cập nhật lớp/trường/sĩ số", "Viết lời nhắn giáo viên", "Thêm ảnh tập thể", "Sắp timeline sự kiện lớp"],
        fields: [
            { key: "members_count", label: "Sĩ số", type: "number", min: 1, placeholder: "40" },
            { key: "homeroom_teacher_message", label: "Lời nhắn giáo viên", type: "textarea", maxLength: 250, placeholder: "Một lời chúc cho cả lớp..." },
            { key: "slogan", label: "Khẩu hiệu lớp", type: "textarea", maxLength: 200, placeholder: "Sinh ra để cùng nhau tỏa sáng" },
        ],
    },
    GRAD_GROUP: {
        eyebrow: "Youth road",
        title: "Chuyến xe thanh xuân",
        description: "Tập trung vào nhóm bạn, thành viên, đích đến và sub-theme riêng.",
        focus: "Members và goals là nội dung quan trọng nhất.",
        workflow: ["Chọn sub-theme", "Thêm thành viên", "Thêm đích đến", "Gắn ảnh/timeline theo chặng"],
        fields: [
            {
                key: "theme",
                label: "Sub-theme",
                type: "select",
                options: [
                    { label: "Caravan gỗ/amber", value: "caravan" },
                    { label: "Scrapbook kraft", value: "scrapbook" },
                    { label: "Station neon", value: "station" },
                ],
            },
            { key: "slogan", label: "Khẩu hiệu nhóm", type: "textarea", maxLength: 200, placeholder: "Thanh xuân rực rỡ cùng nhau" },
            { key: "graduation_year", label: "Năm tốt nghiệp", type: "text", maxLength: 4, placeholder: "2026" },
        ],
    },
    WEDDING: {
        eyebrow: "Invitation suite",
        title: "Thiệp cưới & lịch lễ",
        description: "Template cưới cần rõ tên, ngày, địa điểm, timeline buổi lễ và câu chuyện tình yêu.",
        focus: "Thông tin sự kiện phải chính xác, sau đó mới đến gallery.",
        workflow: ["Nhập tên cô dâu/chú rể", "Kiểm tra ngày giờ địa điểm", "Viết love story", "Thêm timeline lễ"],
        fields: [
            { key: "ceremony_time", label: "Giờ làm lễ", type: "text", maxLength: 30, placeholder: "09:00" },
            { key: "reception_time", label: "Giờ tiệc", type: "text", maxLength: 30, placeholder: "18:00" },
            { key: "love_story", label: "Câu chuyện tình yêu", type: "textarea", maxLength: 500, placeholder: "Hai người đã gặp nhau như thế nào?" },
        ],
    },
    TRAVEL: {
        eyebrow: "Travel log",
        title: "Bản đồ hành trình",
        description: "Tối ưu như một itinerary: điểm đến, thời gian, người đồng hành và từng chặng.",
        focus: "Timeline là map stop. Gallery bổ sung cảm giác địa điểm.",
        workflow: ["Điền tên chuyến đi", "Thêm điểm đến chính", "Sắp timeline theo ngày", "Upload ảnh theo chặng"],
        fields: [
            { key: "destination", label: "Điểm đến chính", type: "text", maxLength: 100, placeholder: "Đà Lạt, Seoul, Tokyo..." },
            { key: "travelers", label: "Người đồng hành", type: "text", maxLength: 100, placeholder: "Gia đình, bạn bè..." },
            { key: "short_note", label: "Ghi chú hành trình", type: "textarea", maxLength: 200, placeholder: "Điều đáng nhớ nhất của chuyến đi..." },
        ],
    },
    FRIENDSHIP: {
        eyebrow: "Friend hub",
        title: "Phòng chat bạn thân",
        description: "Tập trung vào vibe nhóm, motto, inside joke và những mốc đi chơi cùng nhau.",
        focus: "Motto và timeline vui quan trọng hơn thông tin trang trọng.",
        workflow: ["Đặt tên nhóm", "Viết motto/inside joke", "Thêm ảnh vui", "Tạo timeline các lần tụ họp"],
        fields: [
            { key: "motto", label: "Motto nhóm", type: "textarea", maxLength: 120, placeholder: "Bạn bè là mãi mãi" },
            { key: "inside_joke", label: "Inside joke", type: "textarea", maxLength: 160, placeholder: "Chỉ nhóm mình mới hiểu..." },
            { key: "since_date", label: "Ngày quen nhau", type: "date" },
        ],
    },
};

export function getTemplateEditCapability(linkType: LinkType) {
    return TEMPLATE_EDIT_CAPABILITIES[linkType] ?? TEMPLATE_EDIT_CAPABILITIES.LOVE;
}
