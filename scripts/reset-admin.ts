// Đặt lại tài khoản admin development.
// Chạy: npx tsx scripts/reset-admin.ts

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "123123";

async function main() {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const admin = await prisma.admin.upsert({
        where: { username: ADMIN_USERNAME },
        update: {
            password_hash: passwordHash,
            session_token: null,
        },
        create: {
            username: ADMIN_USERNAME,
            password_hash: passwordHash,
        },
    });

    console.log("✓ Đã đặt lại tài khoản admin:");
    console.log(`  Tên đăng nhập: ${ADMIN_USERNAME}`);
    console.log(`  Mật khẩu: ${ADMIN_PASSWORD}`);
    console.log("  Các phiên đăng nhập cũ đã bị vô hiệu.");
    console.log("  ID:", admin.id);
}

main()
    .catch((error) => {
        console.error("✗ Không thể đặt lại tài khoản admin:", error);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
