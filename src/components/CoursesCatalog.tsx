"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  Lock,
  PlayCircle,
  Search,
  CheckCircle2,
  Music,
} from "lucide-react";
import { COURSE_LEVEL_LABELS } from "@/lib/utils";

export interface CatalogCourseItem {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  instrument: string;
  level: string;
  coverImage: string | null;
  teacherName: string | null;
  moduleCount: number;
  lessonCount: number;
  totalDurationMinutes: number;
  completedLessons: number;
  progressPercent: number;
  isEnrolled: boolean;
}

export function CoursesCatalog({
  courses,
  isLoggedIn,
}: {
  courses: CatalogCourseItem[];
  isLoggedIn: boolean;
}) {
  const [instrumentFilter, setInstrumentFilter] = useState("ALL");
  const [query, setQuery] = useState("");

  const instruments = useMemo(() => {
    const set = new Set(courses.map((c) => c.instrument));
    return ["ALL", ...Array.from(set)];
  }, [courses]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((c) => {
      const instMatch =
        instrumentFilter === "ALL" || c.instrument === instrumentFilter;
      const textMatch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        (c.subtitle || "").toLowerCase().includes(q) ||
        c.instrument.toLowerCase().includes(q);
      return instMatch && textMatch;
    });
  }, [courses, instrumentFilter, query]);

  return (
    <div>
      {/* Barra de Filtro */}
      <div className="mb-8 flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-2">
          {instruments.map((inst) => (
            <button
              key={inst}
              type="button"
              onClick={() => setInstrumentFilter(inst)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
                instrumentFilter === inst
                  ? "bg-[#f7941d] text-white shadow-sm"
                  : "bg-slate-100 text-[#243e4f] hover:bg-slate-200"
              }`}
            >
              <Music className="h-3.5 w-3.5" />
              {inst === "ALL" ? "Todos os Instrumentos" : inst}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar curso ou instrumento..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-[#f7941d] focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          Nenhum curso encontrado para este filtro.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <div
              key={course.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-video overflow-hidden bg-[#182b38]">
                <img
                  src={course.coverImage || "/images/hero-musica.jpg"}
                  alt={course.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute left-3 top-3 rounded-full bg-[#fbab00] px-3 py-1 text-[11px] font-extrabold uppercase text-[#182b38]">
                  {course.instrument}
                </span>
                <span className="absolute right-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white">
                  {COURSE_LEVEL_LABELS[course.level] || course.level}
                </span>

                {isLoggedIn && course.progressPercent > 0 && (
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="mb-1 flex items-center justify-between text-[11px] font-bold text-white">
                      <span>Seu Progresso</span>
                      <span>{course.progressPercent}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/30">
                      <div
                        className="h-full rounded-full bg-emerald-400 transition-all"
                        style={{ width: `${course.progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col p-6">
                <h3 className="heading-font text-lg font-extrabold text-[#243e4f] group-hover:text-[#f7941d]">
                  {course.title}
                </h3>
                <p className="mt-2 line-clamp-2 flex-1 text-sm text-[#5a6672]">
                  {course.subtitle}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5 text-[#f7941d]" />
                    {course.moduleCount} módulos • {course.lessonCount} aulas
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-[#f7941d]" />
                    {course.totalDurationMinutes} min
                  </span>
                </div>

                <p className="mt-2 text-xs font-semibold text-[#243e4f]">
                  Prof.: {course.teacherName || "Escola de Música Herdeiros"}
                </p>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  {isLoggedIn ? (
                    <Link
                      href={`/cursos/${course.slug}/assistir`}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#f7941d] py-3 text-xs font-extrabold uppercase tracking-wider text-white transition hover:bg-[#df7d09]"
                    >
                      {course.progressPercent === 100 ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Revisar Curso (100%)
                        </>
                      ) : course.progressPercent > 0 ? (
                        <>
                          <PlayCircle className="h-4 w-4" />
                          Continuar Assistindo ({course.progressPercent}%)
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-4 w-4" />
                          Acessar Aulas do Curso
                        </>
                      )}
                    </Link>
                  ) : (
                    <Link
                      href={`/login?next=/cursos/${course.slug}/assistir`}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#243e4f] py-3 text-xs font-extrabold uppercase tracking-wider text-white transition hover:bg-[#182b38]"
                    >
                      <Lock className="h-4 w-4 text-[#fcaf3d]" />
                      Entrar para Assistir Grátis
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

