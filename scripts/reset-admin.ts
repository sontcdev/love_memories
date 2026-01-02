// Script to reset admin account
// Run with: npx ts-node --skip-project scripts/reset-admin.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // Delete all existing admins
    await prisma.admin.deleteMany();
    console.log('✓ Deleted all existing admins');

    // Create new admin
    const password_hash = await bcrypt.hash('admin123', 10);
    const admin = await prisma.admin.create({
        data: {
            username: 'admin',
            password_hash,
        },
    });

    console.log('✓ Created new admin:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('  ID:', admin.id);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
