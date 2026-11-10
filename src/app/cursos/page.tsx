import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { GraduationCap, Lock, Music, Settings2, UserPlus } from "lucide-react";
import { db, schema } from "@/db";
import { getSessionUser } from "@/lib/auth";
import { CoursesCatalog } from "@/components/CoursesCatalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cursos de Música",
  description:
    "Acervo gratuito de cursos de música da Igreja Bíblica Herdeiros de Deus com acompanhamento de progresso aula a aula.",
};

export default async function CursosPage() {
  const user = await getSessionUser();

  const courseRows = await db
    .select({
      id: schema.courses.id,
      title: schema.courses.title,
      slug: schema.courses.slug,
      subtitle: schema.courses.subtitle,
      instrument: schema.courses.instrument,
      level: schema.courses.level,
      coverImage: schema.courses.coverImage,
      teacherName: schema.users.name,
    })
    .from(schema.courses)
    .leftJoin(schema.users, eq(schema.courses.teacherId, schema.users.id))
    .where(eq(schema.courses.isPublished, true))
    .orderBy(desc(schema.courses.isFeatured), desc(schema.courses.createdAt));

  const allModules = await db.select().from(schema.courseModules);
  const allLessons = await db.select().from(schema.courseLessons);

  let userProgress: { courseId: string; completed: boolean }[] = [];
  let userEnrollments = new Set<string>();

  if (user) {
    userProgress = await db
      .select({
        courseId: schema.lessonProgress.courseId,
        completed: schema.lessonProgress.completed,
      })
      .from(schema.lessonProgress)
      .where(eq(schema.lessonProgress.studentId, user.id));

    const enrollRows = await db
      .select({ courseId: schema.courseEnrollments.courseId })
      .from(schema.courseEnrollments)
      .where(eq(schema.courseEnrollments.studentId, user.id));
    userEnrollments = new Set(enrollRows.map((e) => e.courseId));
  }

  const courses = courseRows.map((c) => {
    const modCount = allModules.filter((m) => m.courseId === c.id).length;
    const lessons = allLessons.filter((l) => l.courseId === c.id);
    const totalDurationMinutes = lessons.reduce(
      (acc, l) => acc + (l.durationMinutes || 0),
      0
    );
    const completedLessons = userProgress.filter(
      (p) => p.courseId === c.id && p.completed
    ).length;

    return {
      ...c,
      moduleCount: modCount,
      lessonCount: lessons.length,
      totalDurationMinutes,
      completedLessons,
      progressPercent:
        lessons.length > 0
          ? Math.round((completedLessons / lessons.length) * 100)
          : 0,
      isEnrolled: userEnrollments.has(c.id),
    };
  });

  return (
    <div>
      {/* Header Banner */}
      <section className="relative overflow-hidden bg-[#182b38] py-14 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage: "url('/images/hero-musica.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#fbab00] px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-[#182b38]">
              <Music className="h-3.5 w-3.5" />
              Escola de Música Herdeiros
            </span>
            <h1 className="heading-font mt-3 text-3xl font-extrabold uppercase sm:text-4xl">
              Acervo de Cursos de Música
            </h1>
            <p className="mt-2 text-base text-slate-200">
              Aulas em vídeo organizadas por módulos para preparar você e novos
              adoradores ao serviço no ministério de louvor.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {user && (user.role === "TEACHER" || user.role === "ADMIN") && (
              <Link
                href="/painel/cursos"
                className="inline-flex items-center gap-2 rounded-full bg-[#f7941d] px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg transition hover:bg-[#df7d09]"
              >
                <Settings2 className="h-4 w-4" />
                Estúdio de Cursos (Kiwify)
              </Link>
            )}
            {!user && (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-white hover:text-[#182b38]"
                >
                  <Lock className="h-4 w-4 text-[#fcaf3d]" />
                  Já tenho conta
                </Link>
                <Link
                  href="/cadastro"
                  className="inline-flex items-center gap-2 rounded-full bg-[#fbab00] px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-[#182b38] hover:bg-[#fcaf3d]"
                >
                  <UserPlus className="h-4 w-4" />
                  Criar Conta Grátis
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="bg-[#f8f9fa] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {!user ? (
            <div className="mb-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-orange-200 bg-orange-50 p-6 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3">
                <GraduationCap className="mt-0.5 h-7 w-7 shrink-0 text-[#f7941d]" />
                <div>
                  <h2 className="font-bold text-[#243e4f]">
                    Acesso exclusivo para usuários cadastrados (100% Gratuito)
                  </h2>
                  <p className="text-sm text-[#5a6672]">
                    Faça login ou crie sua conta gratuita em segundos para
                    liberar todas as videoaulas, baixar cifras e salvar seu
                    progresso de estudos.
                  </p>
                </div>
              </div>
              <Link
                href="/cadastro"
                className="shrink-0 rounded-full bg-[#f7941d] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white hover:bg-[#df7d09]"
              >
                Liberar Acesso Grátis
              </Link>
            </div>
          ) : null}

          <CoursesCatalog courses={courses} isLoggedIn={Boolean(user)} />
        </div>
      </section>
    </div>
  );
}

