import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const musicUrl = 'https://www.youtube.com/watch?v=Gfa5cbj1hGA';
    
    // Update all link configs to use this music URL and enable auto_play
    const result = await prisma.linkConfig.updateMany({
        data: {
            music_url: musicUrl,
            auto_play: true
        }
    });

    console.log(`✓ Updated music_url to "${musicUrl}" for ${result.count} link config(s)`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
