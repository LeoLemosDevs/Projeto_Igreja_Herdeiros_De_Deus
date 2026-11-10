import { NextResponse } from "next/server";
import { count } from "drizzle-orm";
import { db, schema } from "@/db";
import { ensureDatabaseReady } from "@/db/bootstrap";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureDatabaseReady();
    const [{ value }] = await db
      .select({ value: count() })
      .from(schema.users);

    return NextResponse.json({
      ok: true,
      usersCount: value,
      mode: (process.env.DATABASE_URL || "").trim().startsWith("file:")
        ? "local-file"
        : "turso-remote",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Health check error:", message);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}

