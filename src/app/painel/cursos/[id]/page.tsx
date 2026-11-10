import { redirect, notFound } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSessionUser } from "@/lib/auth";
import { CourseBuilderKiwify } from "@/components/CourseBuilderKiwify";

export const dynamic = "force-dynamic";

export default async function PainelCursoEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?next=/painel/cursos/${id}`);
  }

  const courseRows = await db
    .select()
    .from(schema.courses)
    .where(eq(schema.courses.id, id))
    .limit(1);

  const course = courseRows[0];
  if (!course) {
    notFound();
  }

  const allowed =
    user.role === "ADMIN" ||
    (user.role === "TEACHER" && user.id === course.teacherId);

  if (!allowed) {
    redirect("/painel/cursos");
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

  const structuredModules = modules.map((mod) => ({
    ...mod,
    lessons: lessons.filter((l) => l.moduleId === mod.id),
  }));

  const enrollmentRows = await db
    .select({
      studentId: schema.courseEnrollments.studentId,
      lastAccessedAt: schema.courseEnrollments.lastAccessedAt,
      studentName: schema.users.name,
      studentEmail: schema.users.email,
    })
    .from(schema.courseEnrollments)
    .innerJoin(
      schema.users,
      eq(schema.courseEnrollments.studentId, schema.users.id)
    )
    .where(eq(schema.courseEnrollments.courseId, course.id))
    .orderBy(desc(schema.courseEnrollments.lastAccessedAt));

  const progressRows = await db
    .select()
    .from(schema.lessonProgress)
    .where(eq(schema.lessonProgress.courseId, course.id));

  const enrollments = enrollmentRows.map((enr) => ({
    ...enr,
    completedCount: progressRows.filter(
      (p) => p.studentId === enr.studentId && p.completed
    ).length,
    totalLessons: lessons.length,
  }));

  return (
    <CourseBuilderKiwify
      course={course}
      initialModules={structuredModules}
      enrollments={enrollments}
    />
  );
}

