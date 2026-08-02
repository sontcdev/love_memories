import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [dbInfo] = await prisma.$queryRawUnsafe<{ current_database: string; host: string }[]>(
    "SELECT current_database(), inet_server_addr()::text as host"
  );
  const admins = await prisma.admin.findMany({ select: { username: true, session_token: true } });
  return NextResponse.json({ dbInfo, admins });
}
