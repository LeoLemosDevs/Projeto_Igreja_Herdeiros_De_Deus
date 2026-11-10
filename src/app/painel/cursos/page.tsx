import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { ShieldAlert } from "lucide-react";
import { db, schema } from "@/db";
import { getSessionUser } from "@/lib/auth";
import { TeacherCoursesStudio } from "@/components/TeacherCoursesStudio";

export const dynamic = "force-dynamic";

export default async function PainelCursosPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/painel/cursos");
  }

  if (user.role !== "TEACHER" && user.role !== "ADMIN") {
    return (
      <div className="bg-[#f8f9fa] px-4 py-20">
        <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <ShieldAlert className="mx-auto mb-3 h-12 w-12 text-[#f7941d]" />
          <h1 className="heading-font text-xl font-extrabold text-[#243e4f]">
            Área Exclusiva para Professores
          </h1>
          <p className="mt-2 text-sm text-[#5a6672]">
            Sua conta atual é de <strong>Aluno / Membro</strong>. Se você é
            professor da Escola de Música, peça ao Administrador Principal para
            liberar seu perfil de Professor no painel administrativo.
          </p>
          <Link
            href="/cursos"
            className="mt-6 inline-block rounded-full bg-[#f7941d] px-6 py-2.5 text-xs font-extrabold uppercase text-white"
          >
            Ir para Meus Cursos
          </Link>
        </div>
      </div>
    );
  }

  const rows = await db
    .select({
      id: schema.courses.id,
      title: schema.courses.title,
      slug: schema.courses.slug,
      subtitle: schema.courses.subtitle,
      instrument: schema.courses.instrument,
      level: schema.courses.level,
      coverImage: schema.courses.coverImage,
      isPublished: schema.courses.isPublished,
      teacherName: schema.users.name,
    })
    .from(schema.courses)
    .leftJoin(schema.users, eq(schema.courses.teacherId, schema.users.id))
    .where(
      user.role === "ADMIN" ? undefined : eq(schema.courses.teacherId, user.id)
    )
    .orderBy(desc(schema.courses.createdAt));

  const allModules = await db.select().from(schema.courseModules);
  const allLessons = await db.select().from(schema.courseLessons);
  const allEnrollments = await db.select().from(schema.courseEnrollments);

  const summary = rows.map((c) => ({
    ...c,
    moduleCount: allModules.filter((m) => m.courseId === c.id).length,
    lessonCount: allLessons.filter((l) => l.courseId === c.id).length,
    enrollmentCount: allEnrollments.filter((e) => e.courseId === c.id).length,
  }));

  return (
    <div className="min-h-[80vh] bg-[#f8f9fa]">
      <TeacherCoursesStudio initialCourses={summary} userRole={user.role} />
    </div>
  );
}

