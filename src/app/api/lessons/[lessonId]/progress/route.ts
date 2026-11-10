import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { getSessionUser } from "@/lib/auth";
import { getCourseByLessonId } from "@/lib/course-access";

const progressSchema = z.object({
  completed: z.boolean().optional(),
  notes: z.string().optional().nullable(),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ lessonId: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "Faça login para registrar seu progresso." },
      { status: 401 }
    );
  }

  const { lessonId } = await context.params;
  const lessonMeta = await getCourseByLessonId(lessonId);
  if (!lessonMeta) {
    return NextResponse.json({ error: "Aula não encontrada." }, { status: 404 });
  }

  const body = await req.json();
  const parsed = progressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Dados inválidos." },
      { status: 400 }
    );
  }

  const now = new Date();

  // Garante matricula automatica e atualiza ultima aula acessada
  const enrollment = await db
    .select({ id: schema.courseEnrollments.id })
    .from(schema.courseEnrollments)
    .where(
      and(
        eq(schema.courseEnrollments.courseId, lessonMeta.courseId),
        eq(schema.courseEnrollments.studentId, user.id)
      )
    )
    .limit(1);

  if (enrollment.length === 0) {
    await db.insert(schema.courseEnrollments).values({
      id: crypto.randomUUID(),
      courseId: lessonMeta.courseId,
      studentId: user.id,
      lastLessonId: lessonId,
      enrolledAt: now,
      lastAccessedAt: now,
    });
  } else {
    await db
      .update(schema.courseEnrollments)
      .set({ lastLessonId: lessonId, lastAccessedAt: now })
      .where(eq(schema.courseEnrollments.id, enrollment[0].id));
  }

  const existing = await db
    .select()
    .from(schema.lessonProgress)
    .where(
      and(
        eq(schema.lessonProgress.studentId, user.id),
        eq(schema.lessonProgress.lessonId, lessonId)
      )
    )
    .limit(1);

  const completedValue =
    parsed.data.completed !== undefined
      ? parsed.data.completed
      : existing[0]?.completed ?? true;

  if (existing.length === 0) {
    await db.insert(schema.lessonProgress).values({
      id: crypto.randomUUID(),
      studentId: user.id,
      courseId: lessonMeta.courseId,
      lessonId,
      completed: completedValue,
      notes: parsed.data.notes ?? null,
      completedAt: completedValue ? now : null,
      updatedAt: now,
    });
  } else {
    await db
      .update(schema.lessonProgress)
      .set({
        completed: completedValue,
        notes:
          parsed.data.notes !== undefined
            ? parsed.data.notes
            : existing[0].notes,
        completedAt: completedValue ? now : null,
        updatedAt: now,
      })
      .where(eq(schema.lessonProgress.id, existing[0].id));
  }

  // Recalcula progresso geral no curso
  const totalLessonsRows = await db
    .select({ id: schema.courseLessons.id })
    .from(schema.courseLessons)
    .where(eq(schema.courseLessons.courseId, lessonMeta.courseId));

  const completedRows = await db
    .select({ id: schema.lessonProgress.id })
    .from(schema.lessonProgress)
    .where(
      and(
        eq(schema.lessonProgress.courseId, lessonMeta.courseId),
        eq(schema.lessonProgress.studentId, user.id),
        eq(schema.lessonProgress.completed, true)
      )
    );

  const totalCount = totalLessonsRows.length;
  const completedCount = completedRows.length;

  return NextResponse.json({
    ok: true,
    completed: completedValue,
    progress: {
      completedCount,
      totalLessons: totalCount,
      percentage:
        totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
    },
  });
}

