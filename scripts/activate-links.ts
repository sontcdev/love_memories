// Script to activate all links
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Get all links
    const links = await prisma.link.findMany({
        include: { user: { select: { username: true } } }
    });

    console.log('Current links:');
    links.forEach(link => {
        console.log(`- ${link.user.username}: /${link.slug} (active: ${link.is_active})`);
    });

    // Activate all links
    const result = await prisma.link.updateMany({
        data: { is_active: true }
    });

    console.log(`\n✓ Activated ${result.count} link(s)`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
