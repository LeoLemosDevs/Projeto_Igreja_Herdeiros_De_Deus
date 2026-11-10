import { NextRequest, NextResponse } from "next/server";
import { asc, eq, or, and } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { courseLevels } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { canManageCourse } from "@/lib/course-access";

const updateCourseSchema = z.object({
  title: z.string().trim().min(3).optional(),
  subtitle: z.string().trim().optional().nullable(),
  description: z.string().trim().min(10).optional(),
  instrument: z.string().trim().min(2).optional(),
  level: z.enum(courseLevels).optional(),
  coverImage: z.string().trim().optional().nullable(),
  promoVideoUrl: z.string().trim().optional().nullable(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getSessionUser();

  const rows = await db
    .select({
      id: schema.courses.id,
      title: schema.courses.title,
      slug: schema.courses.slug,
      subtitle: schema.courses.subtitle,
      description: schema.courses.description,
      instrument: schema.courses.instrument,
      level: schema.courses.level,
      coverImage: schema.courses.coverImage,
      promoVideoUrl: schema.courses.promoVideoUrl,
      isPublished: schema.courses.isPublished,
      isFeatured: schema.courses.isFeatured,
      teacherId: schema.courses.teacherId,
      teacherName: schema.users.name,
      teacherBio: schema.users.bio,
      createdAt: schema.courses.createdAt,
      updatedAt: schema.courses.updatedAt,
    })
    .from(schema.courses)
    .leftJoin(schema.users, eq(schema.courses.teacherId, schema.users.id))
    .where(or(eq(schema.courses.id, id), eq(schema.courses.slug, id)))
    .limit(1);

  const course = rows[0];
  if (!course) {
    return NextResponse.json(
      { error: "Curso não encontrado." },
      { status: 404 }
    );
  }

  const isManager =
    user?.role === "ADMIN" ||
    (user?.role === "TEACHER" && user.id === course.teacherId);

  if (!course.isPublished && !isManager) {
    return NextResponse.json(
      { error: "Curso não encontrado." },
      { status: 404 }
    );
  }

  const modules = await db
    .select()
    .from(schema.courseModules)
    .where(eq(schema.courseModules.courseId, course.id))
    .orderBy(asc(schema.courseModules.sortOrder), asc(schema.courseModules.createdAt));

  const lessons = await db
    .select()
    .from(schema.courseLessons)
    .where(eq(schema.courseLessons.courseId, course.id))
    .orderBy(asc(schema.courseLessons.sortOrder), asc(schema.courseLessons.createdAt));

  let enrollment = null;
  let progressList: {
    lessonId: string;
    completed: boolean;
    notes: string | null;
  }[] = [];

  if (user) {
    const enrollRows = await db
      .select()
      .from(schema.courseEnrollments)
      .where(
        and(
          eq(schema.courseEnrollments.courseId, course.id),
          eq(schema.courseEnrollments.studentId, user.id)
        )
      )
      .limit(1);
    enrollment = enrollRows[0] || null;

    progressList = await db
      .select({
        lessonId: schema.lessonProgress.lessonId,
        completed: schema.lessonProgress.completed,
        notes: schema.lessonProgress.notes,
      })
      .from(schema.lessonProgress)
      .where(
        and(
          eq(schema.lessonProgress.courseId, course.id),
          eq(schema.lessonProgress.studentId, user.id)
        )
      );
  }

  const completedMap = new Map(progressList.map((p) => [p.lessonId, p]));

  const structuredModules = modules.map((mod) => ({
    ...mod,
    lessons: lessons
      .filter((l) => l.moduleId === mod.id)
      .map((l) => {
        const canWatch = Boolean(user) || l.isFreePreview;
        const prog = completedMap.get(l.id);
        return {
          ...l,
          videoUrl: canWatch ? l.videoUrl : "",
          resourceUrl: canWatch ? l.resourceUrl : null,
          completed: Boolean(prog?.completed),
          studentNotes: prog?.notes || "",
        };
      }),
  }));

  const completedCount = progressList.filter((p) => p.completed).length;
  const totalLessons = lessons.length;

  return NextResponse.json({
    course,
    modules: structuredModules,
    enrollment,
    progress: {
      completedCount,
      totalLessons,
      percentage:
        totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0,
    },
  });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getSessionUser();
  if (!(await canManageCourse(id, user))) {
    return NextResponse.json({ error: "Sem permissão para editar este curso." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateCourseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Dados inválidos." },
      { status: 400 }
    );
  }

  await db
    .update(schema.courses)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(schema.courses.id, id));

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getSessionUser();
  if (!(await canManageCourse(id, user))) {
    return NextResponse.json({ error: "Sem permissão para excluir este curso." }, { status: 403 });
  }

  await db.delete(schema.courses).where(eq(schema.courses.id, id));
  return NextResponse.json({ ok: true });
}

