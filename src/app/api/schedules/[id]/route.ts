import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { requireRole } from "@/lib/auth";

const updateSchema = z.object({
  title: z.string().trim().min(3).optional(),
  dayOfWeek: z.string().trim().min(3).optional(),
  startTime: z.string().trim().min(3).optional(),
  endTime: z.string().trim().optional().nullable(),
  targetAudience: z.string().trim().optional().nullable(),
  location: z.string().trim().optional(),
  description: z.string().trim().min(10).optional(),
  leaderName: z.string().trim().optional().nullable(),
  highlightTag: z.string().trim().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireRole(["ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito ao Admin." }, { status: 403 });
  }

  const { id } = await context.params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Dados inválidos." },
      { status: 400 }
    );
  }

  await db
    .update(schema.worshipSchedules)
    .set(parsed.data)
    .where(eq(schema.worshipSchedules.id, id));

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireRole(["ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito ao Admin." }, { status: 403 });
  }

  const { id } = await context.params;
  await db
    .delete(schema.worshipSchedules)
    .where(eq(schema.worshipSchedules.id, id));

  return NextResponse.json({ ok: true });
}

