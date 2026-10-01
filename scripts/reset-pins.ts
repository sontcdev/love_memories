import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const links = await prisma.link.findMany({
        include: { user: true },
    });

    const password_hash = await bcrypt.hash('123123', 10);

    for (const link of links) {
        await prisma.user.update({
            where: { id: link.user_id },
            data: { password_hash },
        });
        console.log(`✓ Reset PIN for slug: ${link.slug} (type: ${link.type})`);
    }

    console.log(`\n✓ Done! Reset ${links.length} links to PIN: 123123`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
