import { PrismaClient, GameLevel } from "@prisma/client";

const prisma = new PrismaClient();

// Sample questions for the Card Game
const gameQuestions = [
    // ============== EASY (10 questions) ==============
    { level: GameLevel.EASY, content: "Món ăn yêu thích của người kia là gì?" },
    { level: GameLevel.EASY, content: "Kỷ niệm lần đầu gặp nhau như thế nào?" },
    { level: GameLevel.EASY, content: "Màu sắc yêu thích của đối phương là gì?" },
    { level: GameLevel.EASY, content: "Bộ phim hai người cùng xem đầu tiên là gì?" },
    { level: GameLevel.EASY, content: "Địa điểm hẹn hò đầu tiên của hai người ở đâu?" },
    { level: GameLevel.EASY, content: "Bài hát nào khiến bạn nhớ đến người kia?" },
    { level: GameLevel.EASY, content: "Thói quen dễ thương nhất của đối phương là gì?" },
    { level: GameLevel.EASY, content: "Món quà ý nghĩa nhất bạn từng tặng/nhận là gì?" },
    { level: GameLevel.EASY, content: "Biệt danh hai người gọi nhau là gì?" },
    { level: GameLevel.EASY, content: "Hoạt động hai người thích làm cùng nhau nhất là gì?" },

    // ============== MEDIUM (10 questions) ==============
    { level: GameLevel.MEDIUM, content: "Điều gì ở đối phương khiến bạn rung động nhất?" },
    { level: GameLevel.MEDIUM, content: "Tật xấu nào bạn muốn người kia sửa?" },
    { level: GameLevel.MEDIUM, content: "Khoảnh khắc nào bạn thấy yêu người kia nhất?" },
    { level: GameLevel.MEDIUM, content: "Điều gì khiến bạn ngưỡng mộ đối phương?" },
    { level: GameLevel.MEDIUM, content: "Nếu có 1 ngày không có người kia, bạn sẽ làm gì?" },
    { level: GameLevel.MEDIUM, content: "Điều bí mật nào bạn chưa từng kể cho người kia?" },
    { level: GameLevel.MEDIUM, content: "Bạn thấy hai người giống nhau ở điểm nào nhất?" },
    { level: GameLevel.MEDIUM, content: "Điều gì ở mối quan hệ này khiến bạn tự hào?" },
    { level: GameLevel.MEDIUM, content: "Kỷ niệm buồn nhất của hai người là gì?" },
    { level: GameLevel.MEDIUM, content: "Bạn học được điều gì từ mối quan hệ này?" },

    // ============== HARD (10 questions) ==============
    { level: GameLevel.HARD, content: "Nếu có thể quay ngược thời gian, bạn muốn thay đổi điều gì?" },
    { level: GameLevel.HARD, content: "Lời hứa nào bạn chưa thực hiện được?" },
    { level: GameLevel.HARD, content: "Điều gì khiến bạn sợ mất đối phương nhất?" },
    { level: GameLevel.HARD, content: "Bạn đã từng nghi ngờ tình cảm của người kia chưa?" },
    { level: GameLevel.HARD, content: "Điều gì bạn chưa dám nói thật với đối phương?" },
    { level: GameLevel.HARD, content: "Nếu phải xa nhau 1 năm, bạn có chờ được không?" },
    { level: GameLevel.HARD, content: "Điều hối tiếc lớn nhất trong mối quan hệ này là gì?" },
    { level: GameLevel.HARD, content: "Bạn sẵn sàng hy sinh điều gì vì đối phương?" },
    { level: GameLevel.HARD, content: "Điều gì khiến bạn stress nhất trong mối quan hệ?" },
    { level: GameLevel.HARD, content: "5 năm sau, bạn hình dung mối quan hệ này như thế nào?" },
];

async function main() {
    console.log("🎴 Seeding Game Cards...\n");

    // Check if cards already exist
    const existingCount = await prisma.gameCard.count();

    if (existingCount > 0) {
        console.log(`⚠️  Found ${existingCount} existing cards. Skipping seed.`);
        console.log("   To reset, delete all cards first.\n");
        return;
    }

    // Insert all cards
    const result = await prisma.gameCard.createMany({
        data: gameQuestions.map((q) => ({
            level: q.level,
            content: q.content,
            is_active: true,
        })),
    });

    console.log(`✅ Created ${result.count} game cards!`);
    console.log(`   - EASY: 10 cards`);
    console.log(`   - MEDIUM: 10 cards`);
    console.log(`   - HARD: 10 cards\n`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error("❌ Seed failed:", e);
        await prisma.$disconnect();
        process.exit(1);
    });
