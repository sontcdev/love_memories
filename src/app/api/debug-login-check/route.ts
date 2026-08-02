import { NextResponse } from "next/server";
import { loginAdmin } from "@/app/actions/admin-actions";

export async function GET() {
  const fd = new FormData();
  fd.set("username", "admin");
  fd.set("password", "123123");
  const result = await loginAdmin(fd);
  return NextResponse.json({ result, nodeEnv: process.env.NODE_ENV });
}
