"use server";

import { prisma } from "@/lib/prisma";
import { GameLevel } from "@prisma/client";

export interface DrawnCard {
    id: string;
    content: string;
    level: GameLevel;
}

export async function drawCard(
    level: "EASY" | "MEDIUM" | "HARD",
    excludeId?: string // Can be comma-separated list of IDs
): Promise<{ success: boolean; card?: DrawnCard; error?: string }> {
    try {
        // Parse excludeId as comma-separated list
        const excludeIds = excludeId ? excludeId.split(",").filter(id => id.trim()) : [];

        const whereCondition = {
            level: level,
            is_active: true,
            ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
        };

        // Get total count of cards matching criteria
        const totalCount = await prisma.gameCard.count({
            where: whereCondition,
        });

        if (totalCount === 0) {
            // Check if ALL cards have been shown (no cards left after exclusion)
            if (excludeIds.length > 0) {
                return {
                    success: false,
                    error: "All cards shown"
                };
            }
            return {
                success: false,
                error: `No ${level.toLowerCase()} cards available`
            };
        }

        // Pick random card using skip
        const randomSkip = Math.floor(Math.random() * totalCount);
        const randomCard = await prisma.gameCard.findFirst({
            where: whereCondition,
            skip: randomSkip,
            select: {
                id: true,
                content: true,
                level: true,
            },
        });

        if (!randomCard) {
            return { success: false, error: "Failed to draw card" };
        }

        return { success: true, card: randomCard };
    } catch (error) {
        console.error("Draw card error:", error);
        return { success: false, error: "Failed to draw card" };
    }
}

// Get card counts by level
export async function getCardCounts() {
    const counts = await prisma.gameCard.groupBy({
        by: ["level"],
        where: { is_active: true },
        _count: true,
    });

    return counts.reduce((acc, item) => {
        acc[item.level] = item._count;
        return acc;
    }, {} as Record<GameLevel, number>);
}

export interface MemberVoteStat {
    memberId: string;
    memberName: string;
    count: number;
    percentage: number;
}

export async function submitQuizVote(
    slug: string,
    questionIndex: number,
    votedMemberId: string
) {
    try {
        // 1. Find Link by slug
        const link = await prisma.link.findUnique({
            where: { slug },
            select: { id: true, is_active: true, profile_data: true }
        });

        if (!link) {
            return { success: false, error: "Link không tồn tại" };
        }

        if (!link.is_active) {
            return { success: false, error: "Link này không hoạt động" };
        }

        // 2. Ghi nhận lượt bình chọn mới vào DB
        await prisma.quizVote.create({
            data: {
                link_id: link.id,
                question_index: questionIndex,
                voted_member_id: votedMemberId,
            }
        });

        // 3. Truy vấn tất cả lượt bình chọn hiện tại của câu hỏi này
        const allVotes = await prisma.quizVote.findMany({
            where: {
                link_id: link.id,
                question_index: questionIndex
            },
            select: {
                voted_member_id: true
            }
        });

        // 4. Trích xuất danh sách thành viên từ profile_data
        const profileData = link.profile_data as { members?: { id: string; name: string }[] } | null;
        const members = profileData?.members || [];

        // 5. Tính toán số lượng và tỷ lệ phần trăm cho từng thành viên
        const totalVotes = allVotes.length;
        const stats: MemberVoteStat[] = members.map((member) => {
            const count = allVotes.filter(v => v.voted_member_id === member.id).length;
            const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            return {
                memberId: member.id,
                memberName: member.name,
                count,
                percentage
            };
        });

        return {
            success: true,
            totalVotes,
            stats
        };
    } catch (error) {
        console.error("Lỗi khi submit vote:", error);
        return { success: false, error: "Không thể gửi bình chọn" };
    }
}

export async function getQuizStats(slug: string, questionIndex: number) {
    try {
        const link = await prisma.link.findUnique({
            where: { slug },
            select: { id: true, profile_data: true }
        });

        if (!link) return { success: false, error: "Link không tồn tại" };

        const allVotes = await prisma.quizVote.findMany({
            where: {
                link_id: link.id,
                question_index: questionIndex
            }
        });

        const profileData = link.profile_data as { members?: { id: string; name: string }[] } | null;
        const members = profileData?.members || [];
        const totalVotes = allVotes.length;

        const stats: MemberVoteStat[] = members.map((member) => {
            const count = allVotes.filter(v => v.voted_member_id === member.id).length;
            const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            return {
                memberId: member.id,
                memberName: member.name,
                count,
                percentage
            };
        });

        return { success: true, totalVotes, stats };
    } catch (error) {
        console.error("Lỗi lấy thống kê:", error);
        return { success: false, error: "Lỗi lấy thống kê" };
    }
}
