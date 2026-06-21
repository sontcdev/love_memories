import { LinkConfig } from "@prisma/client";

interface PageSkeletonProps {
    themeConfig: LinkConfig | null;
    type?: string;
}

export function PageSkeleton({ themeConfig, type }: PageSkeletonProps) {
    const bgColor = themeConfig?.background_color || "#ffffff";
    const accentColor = themeConfig?.accent_color || "#ec4899";

    return (
        <div
            className="min-h-screen flex items-center justify-center transition-colors duration-300"
            style={{ backgroundColor: bgColor }}
        >
            <div className="text-center px-6">
                <div
                    className="w-12 h-12 mx-auto mb-4 border-4 border-transparent rounded-full animate-spin"
                    style={{
                        borderTopColor: accentColor,
                        borderRightColor: accentColor,
                    }}
                />
                <p className="text-sm opacity-60" style={{ color: accentColor }}>
                    Đang tải {type === "IDOL" ? "fanpage" : "trang kỷ niệm"}...
                </p>
            </div>
        </div>
    );
}