import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const slug = '7n8ybjex';
    const link = await prisma.link.findUnique({
        where: { slug },
        include: { config: true }
    });

    console.log('Link details for slug:', slug);
    console.log(JSON.stringify(link, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
