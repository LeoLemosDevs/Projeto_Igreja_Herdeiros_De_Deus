import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { contactStatuses } from "@/db/schema";
import { requireRole } from "@/lib/auth";

const updateSchema = z.object({
  status: z.enum(contactStatuses).optional(),
  adminNotes: z.string().trim().optional().nullable(),
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
    .update(schema.contactMessages)
    .set(parsed.data)
    .where(eq(schema.contactMessages.id, id));

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
    .delete(schema.contactMessages)
    .where(eq(schema.contactMessages.id, id));

  return NextResponse.json({ ok: true });
}

