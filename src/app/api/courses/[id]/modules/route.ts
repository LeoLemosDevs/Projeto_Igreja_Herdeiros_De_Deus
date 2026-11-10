import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { getSessionUser } from "@/lib/auth";
import { canManageCourse } from "@/lib/course-access";

const moduleSchema = z.object({
  title: z.string().trim().min(2, "Informe o título do módulo."),
  description: z.string().trim().optional().nullable(),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: courseId } = await context.params;
  const user = await getSessionUser();
  if (!(await canManageCourse(courseId, user))) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = moduleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Dados inválidos." },
      { status: 400 }
    );
  }

  const existing = await db
    .select({ id: schema.courseModules.id })
    .from(schema.courseModules)
    .where(eq(schema.courseModules.courseId, courseId));

  const id = crypto.randomUUID();
  await db.insert(schema.courseModules).values({
    id,
    courseId,
    title: parsed.data.title,
    description: parsed.data.description || null,
    sortOrder: existing.length + 1,
    createdAt: new Date(),
  });

  return NextResponse.json({ id }, { status: 201 });
}

