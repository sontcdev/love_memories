// One-time migration: convert old TRAVEL profile_data shape
// (`destination`/`destinations` string + linked Timeline rows) into the new
// `destinations: TravelDestination[]` shape (Trip -> Destination -> Milestone).
//
// Usage: npx tsx scripts/migrate-travel-destinations.ts [--dry-run]
//
// Always run with --dry-run first, review the printed diff, then run for real
// on staging before touching production. Every link gets a LinkRevision backup
// (label "Trước khi tái cấu trúc Travel") inserted before its profile_data is
// overwritten, so a bad migration can be rolled back from that snapshot.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MAX_MILESTONES = 10;
const isDryRun = process.argv.includes("--dry-run");

function randomId() {
    return Math.random().toString(36).substring(2, 11);
}

async function main() {
    const links = await prisma.link.findMany({
        where: { type: "TRAVEL" },
        include: {
            timelines: { orderBy: [{ sort_order: "asc" }, { date: "asc" }] },
        },
    });

    console.log(`Found ${links.length} TRAVEL link(s).${isDryRun ? " (dry run — no writes)" : ""}`);

    for (const link of links) {
        const data = (link.profile_data as Record<string, unknown>) || {};

        // Already migrated (has an array `destinations`) — skip.
        if (Array.isArray(data.destinations)) {
            console.log(`[skip] ${link.slug}: already has destinations[]`);
            continue;
        }

        const oldDestinationName =
            (typeof data.destination === "string" && data.destination) ||
            (typeof data.destinations === "string" && data.destinations) ||
            "";

        const milestones = link.timelines.slice(0, MAX_MILESTONES).map((t, i) => ({
            id: randomId(),
            title: t.title || `Cột mốc ${i + 1}`,
            date: t.date ? t.date.toISOString().slice(0, 10) : undefined,
            description: t.description || undefined,
            image_url: t.image_url || undefined,
            sort_order: i,
        }));

        if (link.timelines.length > MAX_MILESTONES) {
            console.warn(
                `[warn] ${link.slug}: had ${link.timelines.length} timeline entries, truncated to ${MAX_MILESTONES}`
            );
        }

        const newDestinations =
            oldDestinationName || milestones.length > 0
                ? [
                      {
                          id: randomId(),
                          name: oldDestinationName || "Điểm đến",
                          milestones,
                          sort_order: 0,
                      },
                  ]
                : [];

        const newData = {
            ...data,
            destinations: newDestinations,
        };
        delete newData.destination;
        delete (newData as Record<string, unknown>).travelers;
        delete (newData as Record<string, unknown>).quiz;

        console.log(`[migrate] ${link.slug}: "${oldDestinationName || "(no destination)"}" -> 1 destination, ${milestones.length} milestone(s)`);

        if (isDryRun) continue;

        await prisma.linkRevision.create({
            data: {
                link_id: link.id,
                profile_data: data,
                label: "Trước khi tái cấu trúc Travel",
            },
        });

        await prisma.link.update({
            where: { id: link.id },
            data: { profile_data: newData },
        });
    }

    console.log("Done.");
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
