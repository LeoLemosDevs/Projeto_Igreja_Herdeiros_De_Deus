import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { userRoles } from "@/db/schema";
import { requireRole } from "@/lib/auth";

const updateSchema = z.object({
  role: z.enum(userRoles).optional(),
  isActive: z.boolean().optional(),
  name: z.string().trim().min(3).optional(),
  bio: z.string().trim().optional().nullable(),
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

  // Impede o admin logado de desativar ou rebaixar a si mesmo acidentalmente
  if (id === admin.id && (parsed.data.isActive === false || (parsed.data.role && parsed.data.role !== "ADMIN"))) {
    return NextResponse.json(
      { error: "Você não pode desativar ou remover sua própria permissão de Admin." },
      { status: 400 }
    );
  }

  await db
    .update(schema.users)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(schema.users.id, id));

  return NextResponse.json({ ok: true });
}

