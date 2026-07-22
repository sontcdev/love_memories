import type { LinkType } from "@prisma/client";

export interface TemplateEditCapability {
    eyebrow: string;
    title: string;
    description: string;
    focus: string;
    workflow: string[];
}

const defaultWorkflow = ["Điền hồ sơ chính", "Thêm ảnh/timeline", "Chốt cài đặt nhạc và game"];

export const TEMPLATE_EDIT_CAPABILITIES: Record<LinkType, TemplateEditCapability> = {
    LOVE: {
        eyebrow: "Love story",
        title: "Điểm nhấn tình yêu",
        description: "Ưu tiên câu chuyện hai người, ngày kỷ niệm và lời nhắn ngắn xuất hiện ở trang đầu.",
        focus: "Timeline và lời nhắn là trung tâm. Ảnh dùng để bổ trợ cảm xúc.",
        workflow: ["Cập nhật tên và ngày kỷ niệm", "Viết lời nhắn ngắn", "Sắp timeline theo mốc yêu nhau", "Chọn nhạc nền nhẹ"],
    },
    LOVE2: {
        eyebrow: "Scrapbook",
        title: "Bàn dựng scrapbook",
        description: "Template này cần ảnh, caption và note có cảm giác thủ công như album polaroid.",
        focus: "Gallery-first. Ảnh đẹp và caption ngắn quyết định chất lượng.",
        workflow: ["Upload ảnh đẹp nhất trước", "Viết caption như giấy note", "Bổ sung timeline ngắn", "Chọn màu giấy và nhạc"],
    },
    EVERY: {
        eyebrow: "Memory hub",
        title: "Không gian kỷ niệm linh hoạt",
        description: "Dành cho trường hợp không thuộc một chủ đề cụ thể, tập trung vào tên nhóm và thông điệp chung.",
        focus: "Cấu trúc trung tính, dùng được cho gia đình, nhóm nhỏ hoặc sự kiện.",
        workflow: defaultWorkflow,
    },
    IDOL: {
        eyebrow: "Backstage",
        title: "Fanzone sân khấu",
        description: "Tối ưu trang như một concert mini: idol, fan, slogan, debut và tinh thần fandom.",
        focus: "Visual neon, gallery sân khấu và timeline comeback/award.",
        workflow: ["Hoàn thiện idol/fan profile", "Thêm timeline comeback hoặc award", "Chọn game fan quiz", "Bật màu neon/night mode"],
    },
    GRAD_PERSONAL: {
        eyebrow: "Graduate desk",
        title: "Hồ sơ tốt nghiệp cá nhân",
        description: "Tập trung vào chân dung học sinh, ước mơ và mục tiêu sau tốt nghiệp.",
        focus: "Profile, goals và lời tri ân quan trọng hơn gallery dàn trải.",
        workflow: ["Điền trường/lớp/năm", "Thêm ước mơ và slogan", "Tạo mục tiêu", "Thêm timeline trưởng thành"],
    },
    GRAD_CLASS: {
        eyebrow: "Yearbook board",
        title: "Bảng kỷ yếu tập thể",
        description: "Tập trung vào lớp, giáo viên chủ nhiệm, sĩ số và tinh thần chung của tập thể.",
        focus: "Members, thông điệp giáo viên và timeline lớp là lõi.",
        workflow: ["Cập nhật lớp/trường/sĩ số", "Viết lời nhắn giáo viên", "Thêm ảnh tập thể", "Sắp timeline sự kiện lớp"],
    },
    GRAD_GROUP: {
        eyebrow: "Youth road",
        title: "Chuyến xe thanh xuân",
        description: "Tập trung vào nhóm bạn, thành viên, đích đến và sub-theme riêng.",
        focus: "Members và goals là nội dung quan trọng nhất.",
        workflow: ["Chọn sub-theme", "Thêm thành viên", "Thêm đích đến", "Gắn ảnh/timeline theo chặng"],
    },
    WEDDING: {
        eyebrow: "Invitation suite",
        title: "Thiệp cưới & lịch lễ",
        description: "Template cưới cần rõ tên, ngày, địa điểm, timeline buổi lễ và câu chuyện tình yêu.",
        focus: "Thông tin sự kiện phải chính xác, sau đó mới đến gallery.",
        workflow: ["Nhập tên cô dâu/chú rể", "Kiểm tra ngày giờ địa điểm", "Viết love story", "Thêm timeline lễ"],
    },
    TRAVEL: {
        eyebrow: "Travel log",
        title: "Bản đồ hành trình",
        description: "Tối ưu như một itinerary: điểm đến, thời gian, người đồng hành và từng chặng.",
        focus: "Timeline là map stop. Gallery bổ sung cảm giác địa điểm.",
        workflow: ["Điền tên chuyến đi", "Thêm điểm đến chính", "Sắp timeline theo ngày", "Upload ảnh theo chặng"],
    },
    FRIENDSHIP: {
        eyebrow: "Friend hub",
        title: "Phòng chat bạn thân",
        description: "Tập trung vào vibe nhóm, motto, inside joke và những mốc đi chơi cùng nhau.",
        focus: "Motto và timeline vui quan trọng hơn thông tin trang trọng.",
        workflow: ["Đặt tên nhóm", "Viết motto/inside joke", "Thêm ảnh vui", "Tạo timeline các lần tụ họp"],
    },
};

export function getTemplateEditCapability(linkType: LinkType) {
    return TEMPLATE_EDIT_CAPABILITIES[linkType] ?? TEMPLATE_EDIT_CAPABILITIES.LOVE;
}
