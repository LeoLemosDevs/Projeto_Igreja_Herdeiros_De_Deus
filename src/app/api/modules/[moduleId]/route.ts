import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { getSessionUser } from "@/lib/auth";
import { canManageCourse, getCourseByModuleId } from "@/lib/course-access";

const updateSchema = z.object({
  title: z.string().trim().min(2).optional(),
  description: z.string().trim().optional().nullable(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ moduleId: string }> }
) {
  const { moduleId } = await context.params;
  const mod = await getCourseByModuleId(moduleId);
  if (!mod) {
    return NextResponse.json({ error: "Módulo não encontrado." }, { status: 404 });
  }

  const user = await getSessionUser();
  if (!(await canManageCourse(mod.courseId, user))) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Dados inválidos." },
      { status: 400 }
    );
  }

  await db
    .update(schema.courseModules)
    .set(parsed.data)
    .where(eq(schema.courseModules.id, moduleId));

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ moduleId: string }> }
) {
  const { moduleId } = await context.params;
  const mod = await getCourseByModuleId(moduleId);
  if (!mod) {
    return NextResponse.json({ error: "Módulo não encontrado." }, { status: 404 });
  }

  const user = await getSessionUser();
  if (!(await canManageCourse(mod.courseId, user))) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  await db
    .delete(schema.courseModules)
    .where(eq(schema.courseModules.id, moduleId));

  return NextResponse.json({ ok: true });
}

