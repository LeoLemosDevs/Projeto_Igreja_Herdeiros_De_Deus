import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { requireRole } from "@/lib/auth";

const scheduleSchema = z.object({
  title: z.string().trim().min(3, "Informe o nome do culto."),
  dayOfWeek: z.string().trim().min(3, "Informe o dia da semana."),
  startTime: z.string().trim().min(3, "Informe o horário de início."),
  endTime: z.string().trim().optional().nullable(),
  targetAudience: z.string().trim().optional().nullable(),
  location: z.string().trim().default("Templo Principal"),
  description: z.string().trim().min(10, "Explique sobre este culto."),
  leaderName: z.string().trim().optional().nullable(),
  highlightTag: z.string().trim().optional().nullable(),
  sortOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const includeAll = searchParams.get("includeAll") === "1";

  let allowInactive = false;
  if (includeAll) {
    allowInactive = Boolean(await requireRole(["ADMIN"]));
  }

  const rows = await db
    .select()
    .from(schema.worshipSchedules)
    .where(allowInactive ? undefined : eq(schema.worshipSchedules.isActive, true))
    .orderBy(asc(schema.worshipSchedules.sortOrder));

  return NextResponse.json({ schedules: rows });
}

export async function POST(req: NextRequest) {
  const admin = await requireRole(["ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito ao Admin." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = scheduleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Dados inválidos." },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const id = crypto.randomUUID();

  await db.insert(schema.worshipSchedules).values({
    id,
    title: d.title,
    dayOfWeek: d.dayOfWeek,
    startTime: d.startTime,
    endTime: d.endTime || null,
    targetAudience: d.targetAudience || null,
    location: d.location,
    description: d.description,
    leaderName: d.leaderName || null,
    highlightTag: d.highlightTag || null,
    sortOrder: d.sortOrder,
    isActive: d.isActive,
    createdAt: new Date(),
  });

  return NextResponse.json({ id }, { status: 201 });
}

