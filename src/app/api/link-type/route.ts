import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
        return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    try {
        const link = await prisma.link.findUnique({
            where: { slug },
            select: { type: true },
        });

        if (!link) {
            return NextResponse.json({ error: "Link not found" }, { status: 404 });
        }

        return NextResponse.json({ type: link.type });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
