import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import type { SessionUser } from "@/lib/auth";

export async function canManageCourse(
  courseId: string,
  user: SessionUser | null
): Promise<boolean> {
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  if (user.role !== "TEACHER") return false;

  const rows = await db
    .select({ teacherId: schema.courses.teacherId })
    .from(schema.courses)
    .where(eq(schema.courses.id, courseId))
    .limit(1);

  return rows[0]?.teacherId === user.id;
}

export async function getCourseByModuleId(moduleId: string) {
  const rows = await db
    .select({
      moduleId: schema.courseModules.id,
      courseId: schema.courseModules.courseId,
      teacherId: schema.courses.teacherId,
    })
    .from(schema.courseModules)
    .innerJoin(
      schema.courses,
      eq(schema.courseModules.courseId, schema.courses.id)
    )
    .where(eq(schema.courseModules.id, moduleId))
    .limit(1);

  return rows[0] || null;
}

export async function getCourseByLessonId(lessonId: string) {
  const rows = await db
    .select({
      lessonId: schema.courseLessons.id,
      courseId: schema.courseLessons.courseId,
      moduleId: schema.courseLessons.moduleId,
      teacherId: schema.courses.teacherId,
    })
    .from(schema.courseLessons)
    .innerJoin(
      schema.courses,
      eq(schema.courseLessons.courseId, schema.courses.id)
    )
    .where(eq(schema.courseLessons.id, lessonId))
    .limit(1);

  return rows[0] || null;
}

