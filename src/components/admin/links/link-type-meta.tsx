import type { ReactNode } from "react";
import { LinkType } from "@prisma/client";
import { Baby, Gem, GraduationCap, Heart, Home, MapPin, Smile, Star, Users } from "lucide-react";

/**
 * Nhãn + màu + biểu tượng cho từng `LinkType`.
 *
 * Trước đây bảng admin tự khai báo `getTypeIcon()` / `getTypeBadgeColor()` ngay
 * trong `links-table.tsx`; giờ bộ lọc và dialog nhập/nhân bản cũng cần đúng bộ
 * màu đó nên tách ra một chỗ duy nhất.
 */

/** Thứ tự hiển thị trong bộ lọc — nhóm theo họ giao diện, không theo thứ tự enum. */
export const LINK_TYPE_ORDER: LinkType[] = [
    "LOVE",
    "LOVE2",
    "EVERY",
    "IDOL",
    "GRAD_PERSONAL",
    "GRAD_CLASS",
    "GRAD_GROUP",
    "WEDDING",
    "TRAVEL",
    "FRIENDSHIP",
    "BABY",
    "FAMILY",
];

export const LINK_TYPE_LABELS: Record<LinkType, string> = {
    LOVE: "Tình yêu (Cũ)",
    LOVE2: "Tình yêu 2 (Lưu bút)",
    EVERY: "Kỷ niệm chung",
    IDOL: "Idol",
    GRAD_PERSONAL: "Tốt nghiệp cá nhân",
    GRAD_CLASS: "Tốt nghiệp tập thể",
    GRAD_GROUP: "Tốt nghiệp nhóm bạn",
    WEDDING: "Đám cưới",
    TRAVEL: "Du lịch",
    FRIENDSHIP: "Tình bạn",
    BABY: "Em bé",
    FAMILY: "Gia đình",
};

export function getTypeIcon(type: LinkType, className = "w-4 h-4"): ReactNode {
    switch (type) {
        case "LOVE":
            return <Heart className={`${className} text-pink-400`} />;
        case "LOVE2":
            return <Heart className={`${className} text-rose-400`} />;
        case "IDOL":
            return <Star className={`${className} text-yellow-400`} />;
        case "EVERY":
            return <Users className={`${className} text-blue-400`} />;
        case "GRAD_PERSONAL":
            return <GraduationCap className={`${className} text-emerald-400`} />;
        case "GRAD_CLASS":
            return <Users className={`${className} text-cyan-400`} />;
        case "GRAD_GROUP":
            return <Users className={`${className} text-orange-400`} />;
        case "WEDDING":
            return <Gem className={`${className} text-amber-400`} />;
        case "TRAVEL":
            return <MapPin className={`${className} text-teal-400`} />;
        case "FRIENDSHIP":
            return <Smile className={`${className} text-purple-400`} />;
        case "BABY":
            return <Baby className={`${className} text-amber-400`} />;
        case "FAMILY":
            return <Home className={`${className} text-orange-500`} />;
    }
}

export function getTypeBadgeColor(type: LinkType): string {
    switch (type) {
        case "LOVE":
            return "bg-pink-500/10 text-pink-400 border-pink-500/30";
        case "LOVE2":
            return "bg-rose-500/10 text-rose-400 border-rose-500/30";
        case "IDOL":
            return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
        case "EVERY":
            return "bg-blue-500/10 text-blue-400 border-blue-500/30";
        case "GRAD_PERSONAL":
            return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
        case "GRAD_CLASS":
            return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
        case "GRAD_GROUP":
            return "bg-orange-500/10 text-orange-400 border-orange-500/30";
        case "WEDDING":
            return "bg-amber-500/10 text-amber-400 border-amber-500/30";
        case "TRAVEL":
            return "bg-teal-500/10 text-teal-400 border-teal-500/30";
        case "FRIENDSHIP":
            return "bg-purple-500/10 text-purple-400 border-purple-500/30";
        case "BABY":
            return "bg-amber-500/10 text-amber-400 border-amber-500/30";
        case "FAMILY":
            return "bg-orange-500/10 text-orange-500 border-orange-500/30";
    }
}
