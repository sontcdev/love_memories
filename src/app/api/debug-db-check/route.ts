import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const [dbInfo] = await prisma.$queryRawUnsafe<{ current_database: string; host: string }[]>(
    "SELECT current_database(), current_setting('cluster_name', true) as cluster"
  );
  const admins = await prisma.admin.findMany({ select: { username: true, password_hash: true } });
  const check = await Promise.all(
    admins.map(async (a) => ({
      username: a.username,
      hashPrefix: a.password_hash.slice(0, 10),
      matches123123: await bcrypt.compare("123123", a.password_hash),
    }))
  );
  return NextResponse.json({ dbInfo, databaseUrlHost: process.env.DATABASE_URL?.split("@")[1]?.split("/")[0], check });
}
