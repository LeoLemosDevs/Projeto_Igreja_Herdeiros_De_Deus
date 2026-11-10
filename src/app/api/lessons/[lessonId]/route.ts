import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { getSessionUser } from "@/lib/auth";
import { canManageCourse, getCourseByLessonId } from "@/lib/course-access";
import { parseVideoUrl } from "@/lib/video";

const updateSchema = z.object({
  title: z.string().trim().min(2).optional(),
  description: z.string().trim().optional().nullable(),
  videoUrl: z.string().trim().url().optional(),
  durationMinutes: z.number().int().min(1).max(600).optional(),
  resourceUrl: z.string().trim().optional().nullable(),
  resourceLabel: z.string().trim().optional().nullable(),
  isFreePreview: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await context.params;
  const lessonMeta = await getCourseByLessonId(lessonId);
  if (!lessonMeta) {
    return NextResponse.json({ error: "Aula não encontrada." }, { status: 404 });
  }

  const user = await getSessionUser();
  if (!(await canManageCourse(lessonMeta.courseId, user))) {
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

  const updates: Record<string, unknown> = {
    ...parsed.data,
    updatedAt: new Date(),
  };
  if (parsed.data.videoUrl) {
    updates.videoProvider = parseVideoUrl(parsed.data.videoUrl).provider;
  }

  await db
    .update(schema.courseLessons)
    .set(updates)
    .where(eq(schema.courseLessons.id, lessonId));

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await context.params;
  const lessonMeta = await getCourseByLessonId(lessonId);
  if (!lessonMeta) {
    return NextResponse.json({ error: "Aula não encontrada." }, { status: 404 });
  }

  const user = await getSessionUser();
  if (!(await canManageCourse(lessonMeta.courseId, user))) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  await db
    .delete(schema.courseLessons)
    .where(eq(schema.courseLessons.id, lessonId));

  return NextResponse.json({ ok: true });
}

