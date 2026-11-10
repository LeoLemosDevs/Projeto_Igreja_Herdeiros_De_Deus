"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ExternalLink,
  Loader2,
  Music,
  Plus,
  Settings,
  Trash2,
  Users,
  CheckCircle2,
  EyeOff,
} from "lucide-react";
import { COURSE_LEVEL_LABELS } from "@/lib/utils";

export interface StudioCourseSummary {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  instrument: string;
  level: string;
  coverImage: string | null;
  isPublished: boolean;
  teacherName: string | null;
  moduleCount: number;
  lessonCount: number;
  enrollmentCount: number;
}

const INSTRUMENTS = [
  "Violão",
  "Teclado & Piano",
  "Canto & Técnica Vocal",
  "Guitarra",
  "Contrabaixo",
  "Bateria & Percussão",
  "Teoria Musical & Regência",
  "Instrumentos de Sopro / Cordas",
];

export function TeacherCoursesStudio({
  initialCourses,
  userRole,
}: {
  initialCourses: StudioCourseSummary[];
  userRole: string;
}) {
  const router = useRouter();
  const [courses, setCourses] = useState(initialCourses);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [instrument, setInstrument] = useState(INSTRUMENTS[0]);
  const [level, setLevel] = useState("INICIANTE");
  const [description, setDescription] = useState("");

  async function handleCreateCourse(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          instrument,
          level,
          description,
          isPublished: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao criar curso.");
        setCreating(false);
        return;
      }

      setShowModal(false);
      router.push(`/painel/cursos/${data.id}`);
      router.refresh();
    } catch {
      setError("Falha de conexão.");
      setCreating(false);
    }
  }

  async function handleDelete(courseId: string, courseTitle: string) {
    if (
      !confirm(
        `Tem certeza que deseja excluir o curso "${courseTitle}" e todas as suas aulas?`
      )
    ) {
      return;
    }

    const res = await fetch(`/api/courses/${courseId}`, { method: "DELETE" });
    if (res.ok) {
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header do Estudio */}
      <div className="mb-8 flex flex-col justify-between gap-4 rounded-2xl bg-[#182b38] p-6 text-white shadow-lg sm:flex-row sm:items-center sm:p-8">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#fbab00] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#182b38]">
            <Music className="h-3.5 w-3.5" />
            Estúdio Kiwify • Escola de Música
          </span>
          <h1 className="heading-font mt-2 text-2xl font-extrabold sm:text-3xl">
            Painel de Configuração de Cursos
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            {userRole === "ADMIN"
              ? "Visão Administrativa: gerencie todos os cursos, módulos e videoaulas dos professores."
              : "Crie seus cursos de música, organize módulos, adicione vídeos do YouTube ou Google Drive e acompanhe seus alunos."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#f7941d] px-6 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow transition hover:bg-[#df7d09]"
        >
          <Plus className="h-4 w-4" />
          Novo Curso de Música
        </button>
      </div>

      {/* Lista de Cursos */}
      {courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Music className="mx-auto mb-3 h-10 w-10 text-[#f7941d]" />
          <h2 className="text-lg font-bold text-[#243e4f]">
            Você ainda não cadastrou nenhum curso
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Clique em &ldquo;Novo Curso de Música&rdquo; para montar seu primeiro
            treinamento em módulos.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-video bg-slate-900">
                <img
                  src={course.coverImage || "/images/hero-musica.jpg"}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
                <span
                  className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase ${
                    course.isPublished
                      ? "bg-emerald-500 text-white"
                      : "bg-amber-400 text-slate-900"
                  }`}
                >
                  {course.isPublished ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      Publicado
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3 w-3" />
                      Rascunho
                    </>
                  )}
                </span>
                <span className="absolute right-3 top-3 rounded-full bg-black/75 px-2.5 py-1 text-[11px] font-semibold text-white">
                  {course.instrument}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h2 className="heading-font line-clamp-2 text-lg font-bold text-[#243e4f]">
                  {course.title}
                </h2>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  {COURSE_LEVEL_LABELS[course.level] || course.level} • Prof.{" "}
                  {course.teacherName}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-[#f7941d]" />
                    <span>
                      {course.moduleCount} mód. / {course.lessonCount} aulas
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-[#f7941d]" />
                    <span>{course.enrollmentCount} alunos</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
                  <Link
                    href={`/painel/cursos/${course.id}`}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#243e4f] py-2.5 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-[#182b38]"
                  >
                    <Settings className="h-3.5 w-3.5 text-[#fcaf3d]" />
                    Configurar (Kiwify)
                  </Link>
                  <Link
                    href={`/cursos/${course.slug}/assistir`}
                    title="Visualizar Player do Aluno"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:border-[#f7941d] hover:text-[#f7941d]"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(course.id, course.title)}
                    title="Excluir Curso"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Criar Curso */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <h2 className="heading-font text-xl font-extrabold text-[#243e4f]">
              Criar Novo Curso de Música
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Após criar, você será levado para o construtor de módulos e aulas estilo Kiwify.
            </p>

            <form onSubmit={handleCreateCourse} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-[#243e4f]">
                  Título do Curso *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex.: Bateria no Louvor — Ritmos e Dinâmica"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#f7941d] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-[#243e4f]">
                  Subtítulo Curto
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Resumo atrativo para o card do acervo"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#f7941d] focus:outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-[#243e4f]">
                    Instrumento / Área *
                  </label>
                  <select
                    value={instrument}
                    onChange={(e) => setInstrument(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-[#f7941d] focus:outline-none"
                  >
                    {INSTRUMENTS.map((inst) => (
                      <option key={inst} value={inst}>
                        {inst}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-[#243e4f]">
                    Nível *
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-[#f7941d] focus:outline-none"
                  >
                    <option value="INICIANTE">Iniciante</option>
                    <option value="INTERMEDIARIO">Intermediário</option>
                    <option value="AVANCADO">Avançado</option>
                    <option value="TODOS">Todos os Níveis</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-[#243e4f]">
                  Descrição Completa *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explique o que o aluno vai aprender neste curso..."
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#f7941d] focus:outline-none"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 p-2.5 text-xs font-semibold text-red-700">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#f7941d] px-5 py-2 text-sm font-bold text-white hover:bg-[#df7d09] disabled:opacity-60"
                >
                  {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Criar e Configurar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

