import { NextResponse } from "next/server";
import { clearSessionCookie, getSessionUser } from "@/lib/auth";

export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({ user });
}

