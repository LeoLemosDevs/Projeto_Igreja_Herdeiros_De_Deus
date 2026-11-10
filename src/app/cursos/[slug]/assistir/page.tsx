import crypto from "node:crypto";
import { redirect, notFound } from "next/navigation";
import { and, asc, eq, or } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSessionUser } from "@/lib/auth";
import { KiwifyCoursePlayer } from "@/components/KiwifyCoursePlayer";

export const dynamic = "force-dynamic";

export default async function AssistirCursoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getSessionUser();

  if (!user) {
    redirect(`/login?next=/cursos/${slug}/assistir`);
  }

  const courseRows = await db
    .select({
      id: schema.courses.id,
      title: schema.courses.title,
      slug: schema.courses.slug,
      instrument: schema.courses.instrument,
      isPublished: schema.courses.isPublished,
      teacherId: schema.courses.teacherId,
      teacherName: schema.users.name,
    })
    .from(schema.courses)
    .leftJoin(schema.users, eq(schema.courses.teacherId, schema.users.id))
    .where(or(eq(schema.courses.slug, slug), eq(schema.courses.id, slug)))
    .limit(1);

  const course = courseRows[0];
  if (!course) {
    notFound();
  }

  const canBypassUnpublished =
    user.role === "ADMIN" ||
    (user.role === "TEACHER" && user.id === course.teacherId);

  if (!course.isPublished && !canBypassUnpublished) {
    notFound();
  }

  // Garante matricula automatica ao entrar no player
  const existingEnroll = await db
    .select()
    .from(schema.courseEnrollments)
    .where(
      and(
        eq(schema.courseEnrollments.courseId, course.id),
        eq(schema.courseEnrollments.studentId, user.id)
      )
    )
    .limit(1);

  const now = new Date();
  let lastLessonId: string | null = null;

  if (existingEnroll.length === 0) {
    await db.insert(schema.courseEnrollments).values({
      id: crypto.randomUUID(),
      courseId: course.id,
      studentId: user.id,
      enrolledAt: now,
      lastAccessedAt: now,
    });
  } else {
    lastLessonId = existingEnroll[0].lastLessonId;
    await db
      .update(schema.courseEnrollments)
      .set({ lastAccessedAt: now })
      .where(eq(schema.courseEnrollments.id, existingEnroll[0].id));
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

  const progressRows = await db
    .select()
    .from(schema.lessonProgress)
    .where(
      and(
        eq(schema.lessonProgress.courseId, course.id),
        eq(schema.lessonProgress.studentId, user.id)
      )
    );

  const progressMap = new Map(progressRows.map((p) => [p.lessonId, p]));

  const initialModules = modules.map((mod) => ({
    id: mod.id,
    title: mod.title,
    description: mod.description,
    lessons: lessons
      .filter((l) => l.moduleId === mod.id)
      .map((l) => {
        const prog = progressMap.get(l.id);
        return {
          id: l.id,
          title: l.title,
          description: l.description,
          videoUrl: l.videoUrl,
          durationMinutes: l.durationMinutes,
          resourceUrl: l.resourceUrl,
          resourceLabel: l.resourceLabel,
          completed: Boolean(prog?.completed),
          studentNotes: prog?.notes || "",
        };
      }),
  }));

  return (
    <KiwifyCoursePlayer
      course={{
        id: course.id,
        title: course.title,
        slug: course.slug,
        instrument: course.instrument,
        teacherName: course.teacherName,
      }}
      initialModules={initialModules}
      initialLessonId={lastLessonId}
    />
  );
}

