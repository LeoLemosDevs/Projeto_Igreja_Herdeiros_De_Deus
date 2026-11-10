"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Edit3,
  ExternalLink,
  FolderPlus,
  Layers,
  Loader2,
  Plus,
  Save,
  Settings,
  Trash2,
  Upload,
  Users,
  Video,
} from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { parseVideoUrl } from "@/lib/video";
import { formatDatePtBr } from "@/lib/utils";

export interface BuilderLesson {
  id: string;
  moduleId: string;
  title: string;
  description: string | null;
  videoUrl: string;
  durationMinutes: number;
  resourceUrl: string | null;
  resourceLabel: string | null;
  isFreePreview: boolean;
  sortOrder: number;
}

export interface BuilderModule {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  lessons: BuilderLesson[];
}

export interface BuilderEnrollment {
  studentId: string;
  studentName: string;
  studentEmail: string;
  completedCount: number;
  totalLessons: number;
  lastAccessedAt: Date | number | string;
}

interface CourseBuilderKiwifyProps {
  course: {
    id: string;
    title: string;
    slug: string;
    subtitle: string | null;
    description: string;
    instrument: string;
    level: string;
    coverImage: string | null;
    promoVideoUrl: string | null;
    isPublished: boolean;
    isFeatured: boolean;
  };
  initialModules: BuilderModule[];
  enrollments: BuilderEnrollment[];
}

export function CourseBuilderKiwify({
  course: initialCourse,
  initialModules,
  enrollments,
}: CourseBuilderKiwifyProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"conteudo" | "config" | "alunos">("conteudo");

  const [course, setCourse] = useState(initialCourse);
  const [modules, setModules] = useState<BuilderModule[]>(initialModules);

  // Modulo novo
  const [newModTitle, setNewModTitle] = useState("");
  const [addingModule, setAddingModule] = useState(false);

  // Modal / Drawer de Aula
  const [lessonModal, setLessonModal] = useState<{
    mode: "create" | "edit";
    moduleId: string;
    lessonId?: string;
  } | null>(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [lessonDuration, setLessonDuration] = useState(15);
  const [lessonResourceUrl, setLessonResourceUrl] = useState("");
  const [lessonResourceLabel, setLessonResourceLabel] = useState("");
  const [lessonFreePreview, setLessonFreePreview] = useState(false);
  const [savingLesson, setSavingLesson] = useState(false);

  // Configuracoes do curso
  const [savingCourse, setSavingCourse] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function refreshCourseData() {
    const res = await fetch(`/api/courses/${course.id}`);
    if (res.ok) {
      const data = await res.json();
      setCourse(data.course);
      setModules(data.modules);
    }
    router.refresh();
  }

  async function handleSaveCourseSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingCourse(true);
    setFeedback("");

    const res = await fetch(`/api/courses/${course.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: course.title,
        subtitle: course.subtitle,
        description: course.description,
        instrument: course.instrument,
        level: course.level,
        coverImage: course.coverImage,
        promoVideoUrl: course.promoVideoUrl,
        isPublished: course.isPublished,
        isFeatured: course.isFeatured,
      }),
    });

    setSavingCourse(false);
    if (res.ok) {
      setFeedback("Configurações do curso salvas!");
      router.refresh();
    } else {
      setFeedback("Erro ao salvar configurações.");
    }
  }

  async function handleTogglePublish() {
    const nextPub = !course.isPublished;
    const res = await fetch(`/api/courses/${course.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: nextPub }),
    });
    if (res.ok) {
      setCourse((prev) => ({ ...prev, isPublished: nextPub }));
      router.refresh();
    }
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        setCourse((prev) => ({ ...prev, coverImage: data.url }));
      } else {
        alert(data.error || "Erro ao enviar imagem.");
      }
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleAddModule(e: React.FormEvent) {
    e.preventDefault();
    if (!newModTitle.trim()) return;
    setAddingModule(true);
    const res = await fetch(`/api/courses/${course.id}/modules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newModTitle }),
    });
    setAddingModule(false);
    if (res.ok) {
      setNewModTitle("");
      await refreshCourseData();
    }
  }

  async function handleRenameModule(mod: BuilderModule) {
    const nextTitle = prompt("Novo nome do módulo:", mod.title);
    if (!nextTitle || nextTitle.trim() === mod.title) return;
    await fetch(`/api/modules/${mod.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: nextTitle.trim() }),
    });
    await refreshCourseData();
  }

  async function handleDeleteModule(moduleId: string, title: string) {
    if (!confirm(`Excluir o módulo "${title}" e todas as aulas dentro dele?`)) {
      return;
    }
    await fetch(`/api/modules/${moduleId}`, { method: "DELETE" });
    await refreshCourseData();
  }

  async function moveModule(index: number, direction: -1 | 1) {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= modules.length) return;
    const currentMod = modules[index];
    const swapMod = modules[targetIdx];

    await Promise.all([
      fetch(`/api/modules/${currentMod.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: targetIdx + 1 }),
      }),
      fetch(`/api/modules/${swapMod.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: index + 1 }),
      }),
    ]);
    await refreshCourseData();
  }

  function openCreateLesson(moduleId: string) {
    setLessonModal({ mode: "create", moduleId });
    setLessonTitle("");
    setLessonDescription("");
    setLessonVideoUrl("");
    setLessonDuration(15);
    setLessonResourceUrl("");
    setLessonResourceLabel("");
    setLessonFreePreview(false);
  }

  function openEditLesson(lesson: BuilderLesson) {
    setLessonModal({
      mode: "edit",
      moduleId: lesson.moduleId,
      lessonId: lesson.id,
    });
    setLessonTitle(lesson.title);
    setLessonDescription(lesson.description || "");
    setLessonVideoUrl(lesson.videoUrl);
    setLessonDuration(lesson.durationMinutes);
    setLessonResourceUrl(lesson.resourceUrl || "");
    setLessonResourceLabel(lesson.resourceLabel || "");
    setLessonFreePreview(lesson.isFreePreview);
  }

  async function handleSaveLesson(e: React.FormEvent) {
    e.preventDefault();
    if (!lessonModal) return;
    setSavingLesson(true);

    const payload = {
      title: lessonTitle,
      description: lessonDescription || null,
      videoUrl: lessonVideoUrl,
      durationMinutes: Number(lessonDuration) || 15,
      resourceUrl: lessonResourceUrl || null,
      resourceLabel: lessonResourceLabel || null,
      isFreePreview: lessonFreePreview,
    };

    const url =
      lessonModal.mode === "create"
        ? `/api/modules/${lessonModal.moduleId}/lessons`
        : `/api/lessons/${lessonModal.lessonId}`;
    const method = lessonModal.mode === "create" ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSavingLesson(false);
    if (res.ok) {
      setLessonModal(null);
      await refreshCourseData();
    } else {
      const data = await res.json();
      alert(data.error || "Verifique os dados da aula (URL de vídeo válida).");
    }
  }

  async function handleDeleteLesson(lessonId: string, title: string) {
    if (!confirm(`Remover a aula "${title}"?`)) return;
    await fetch(`/api/lessons/${lessonId}`, { method: "DELETE" });
    await refreshCourseData();
  }

  async function moveLesson(mod: BuilderModule, index: number, direction: -1 | 1) {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= mod.lessons.length) return;
    const currentL = mod.lessons[index];
    const swapL = mod.lessons[targetIdx];

    await Promise.all([
      fetch(`/api/lessons/${currentL.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: targetIdx + 1 }),
      }),
      fetch(`/api/lessons/${swapL.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: index + 1 }),
      }),
    ]);
    await refreshCourseData();
  }

  const parsedPreview = parseVideoUrl(lessonVideoUrl);

  return (
    <div className="min-h-[85vh] bg-[#f3f5f8]">
      {/* Top Studio Header estilo Kiwify */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-4 py-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/painel/cursos"
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-[#f7941d] hover:text-[#f7941d]"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#f7941d]">
                Editor de Curso (Estilo Kiwify)
              </span>
              <h1 className="heading-font text-lg font-extrabold text-[#243e4f] sm:text-xl">
                {course.title}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleTogglePublish}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-wide transition ${
                course.isPublished
                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                  : "bg-amber-100 text-amber-800 hover:bg-amber-200"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {course.isPublished ? "Publicado (Clique p/ Ocultar)" : "Rascunho (Publicar)"}
            </button>

            <Link
              href={`/cursos/${course.slug}/assistir`}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#243e4f] px-4 py-2 text-xs font-bold uppercase text-white hover:bg-[#182b38]"
            >
              <ExternalLink className="h-3.5 w-3.5 text-[#fcaf3d]" />
              Ver como Aluno
            </Link>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="mx-auto flex max-w-7xl gap-6 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setTab("conteudo")}
            className={`inline-flex items-center gap-2 border-b-2 py-3 text-sm font-bold transition ${
              tab === "conteudo"
                ? "border-[#f7941d] text-[#243e4f]"
                : "border-transparent text-slate-500 hover:text-[#243e4f]"
            }`}
          >
            <Layers className="h-4 w-4" />
            Módulos e Aulas ({modules.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("config")}
            className={`inline-flex items-center gap-2 border-b-2 py-3 text-sm font-bold transition ${
              tab === "config"
                ? "border-[#f7941d] text-[#243e4f]"
                : "border-transparent text-slate-500 hover:text-[#243e4f]"
            }`}
          >
            <Settings className="h-4 w-4" />
            Configurações & Capa
          </button>
          <button
            type="button"
            onClick={() => setTab("alunos")}
            className={`inline-flex items-center gap-2 border-b-2 py-3 text-sm font-bold transition ${
              tab === "alunos"
                ? "border-[#f7941d] text-[#243e4f]"
                : "border-transparent text-slate-500 hover:text-[#243e4f]"
            }`}
          >
            <Users className="h-4 w-4" />
            Alunos e Progresso ({enrollments.length})
          </button>
        </div>
      </div>

      {/* Conteudo das Abas */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {tab === "conteudo" && (
          <div className="space-y-6">
            {/* Barra adicionar modulo */}
            <form
              onSubmit={handleAddModule}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row"
            >
              <input
                type="text"
                required
                value={newModTitle}
                onChange={(e) => setNewModTitle(e.target.value)}
                placeholder="Nome do novo módulo (ex.: Módulo 2 — Campo Harmônico na Prática)"
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-[#f7941d] focus:outline-none"
              />
              <button
                type="submit"
                disabled={addingModule}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f7941d] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white transition hover:bg-[#df7d09]"
              >
                {addingModule ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FolderPlus className="h-4 w-4" />
                )}
                Adicionar Módulo
              </button>
            </form>

            {/* Modulos e Aulas */}
            {modules.map((mod, modIdx) => (
              <div
                key={mod.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#243e4f] text-xs font-extrabold text-[#fcaf3d]">
                      {modIdx + 1}
                    </span>
                    <div>
                      <h2 className="font-bold text-[#243e4f]">{mod.title}</h2>
                      <p className="text-xs text-slate-500">
                        {mod.lessons.length} videoaula(s)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => moveModule(modIdx, -1)}
                      disabled={modIdx === 0}
                      title="Mover módulo para cima"
                      className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:text-[#243e4f] disabled:opacity-30"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveModule(modIdx, 1)}
                      disabled={modIdx === modules.length - 1}
                      title="Mover módulo para baixo"
                      className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:text-[#243e4f] disabled:opacity-30"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRenameModule(mod)}
                      title="Renomear módulo"
                      className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:text-[#f7941d]"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteModule(mod.id, mod.title)}
                      title="Excluir módulo"
                      className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openCreateLesson(mod.id)}
                      className="ml-2 inline-flex items-center gap-1.5 rounded-lg bg-[#243e4f] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#182b38]"
                    >
                      <Plus className="h-3.5 w-3.5 text-[#fcaf3d]" />
                      Nova Aula
                    </button>
                  </div>
                </div>

                {/* Aulas do Modulo */}
                <div className="divide-y divide-slate-100">
                  {mod.lessons.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-400">
                      Nenhuma aula neste módulo ainda. Clique em &ldquo;Nova Aula&rdquo; acima para incluir vídeos do YouTube ou Google Drive.
                    </div>
                  ) : (
                    mod.lessons.map((lesson, lIdx) => {
                      const vMeta = parseVideoUrl(lesson.videoUrl);
                      return (
                        <div
                          key={lesson.id}
                          className="flex flex-col justify-between gap-3 px-5 py-3.5 transition hover:bg-slate-50 sm:flex-row sm:items-center"
                        >
                          <div className="flex items-start gap-3">
                            <Video className="mt-0.5 h-5 w-5 shrink-0 text-[#f7941d]" />
                            <div>
                              <p className="text-sm font-bold text-[#243e4f]">
                                {lesson.title}
                              </p>
                              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                <span className="rounded bg-orange-50 px-2 py-0.5 font-semibold text-[#f7941d]">
                                  {vMeta.label}
                                </span>
                                <span>{lesson.durationMinutes} min</span>
                                {lesson.resourceUrl && (
                                  <span className="text-emerald-700 font-medium">
                                    • Com material anexo
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => moveLesson(mod, lIdx, -1)}
                              disabled={lIdx === 0}
                              className="rounded-lg border border-slate-200 p-1.5 text-slate-500 disabled:opacity-30"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveLesson(mod, lIdx, 1)}
                              disabled={lIdx === mod.lessons.length - 1}
                              className="rounded-lg border border-slate-200 p-1.5 text-slate-500 disabled:opacity-30"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditLesson(lesson)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-[#243e4f] hover:border-[#f7941d] hover:text-[#f7941d]"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteLesson(lesson.id, lesson.title)
                              }
                              className="rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:border-red-200 hover:text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "config" && (
          <form
            onSubmit={handleSaveCourseSettings}
            className="grid gap-6 lg:grid-cols-12"
          >
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-8">
              <h2 className="heading-font text-lg font-extrabold text-[#243e4f]">
                Informações Gerais do Curso
              </h2>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-[#243e4f]">
                  Título do Curso
                </label>
                <input
                  type="text"
                  required
                  value={course.title}
                  onChange={(e) =>
                    setCourse({ ...course, title: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#f7941d] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-[#243e4f]">
                  Subtítulo
                </label>
                <input
                  type="text"
                  value={course.subtitle || ""}
                  onChange={(e) =>
                    setCourse({ ...course, subtitle: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#f7941d] focus:outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-[#243e4f]">
                    Instrumento / Área
                  </label>
                  <input
                    type="text"
                    required
                    value={course.instrument}
                    onChange={(e) =>
                      setCourse({ ...course, instrument: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#f7941d] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-[#243e4f]">
                    Nível
                  </label>
                  <select
                    value={course.level}
                    onChange={(e) =>
                      setCourse({ ...course, level: e.target.value })
                    }
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
                  Descrição Detalhada
                </label>
                <textarea
                  rows={5}
                  required
                  value={course.description}
                  onChange={(e) =>
                    setCourse({ ...course, description: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#f7941d] focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-[#243e4f]">
                  <input
                    type="checkbox"
                    checked={course.isPublished}
                    onChange={(e) =>
                      setCourse({ ...course, isPublished: e.target.checked })
                    }
                    className="h-4 w-4 accent-[#f7941d]"
                  />
                  Curso Publicado (Visível aos alunos)
                </label>

                <label className="flex items-center gap-2 text-sm font-semibold text-[#243e4f]">
                  <input
                    type="checkbox"
                    checked={course.isFeatured}
                    onChange={(e) =>
                      setCourse({ ...course, isFeatured: e.target.checked })
                    }
                    className="h-4 w-4 accent-[#f7941d]"
                  />
                  Destaque na Página Inicial
                </label>
              </div>

              {feedback && (
                <p className="rounded-lg bg-emerald-50 p-3 text-xs font-bold text-emerald-700">
                  {feedback}
                </p>
              )}

              <button
                type="submit"
                disabled={savingCourse}
                className="inline-flex items-center gap-2 rounded-xl bg-[#f7941d] px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-white hover:bg-[#df7d09]"
              >
                {savingCourse ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Salvar Configurações
              </button>
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-4">
              <h2 className="heading-font text-lg font-extrabold text-[#243e4f]">
                Capa do Curso
              </h2>
              <div className="aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <img
                  src={course.coverImage || "/images/hero-musica.jpg"}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#f7941d] bg-orange-50/60 py-2.5 text-xs font-bold text-[#f7941d] hover:bg-orange-50">
                {uploadingCover ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Enviar Nova Capa
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
              </label>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                  Ou URL da Imagem de Capa
                </label>
                <input
                  type="text"
                  value={course.coverImage || ""}
                  onChange={(e) =>
                    setCourse({ ...course, coverImage: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#f7941d] focus:outline-none"
                />
              </div>
            </div>
          </form>
        )}

        {tab === "alunos" && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="heading-font text-lg font-extrabold text-[#243e4f]">
                Progresso dos Alunos Matriculados
              </h2>
            </div>

            {enrollments.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500">
                Nenhum aluno iniciou este curso ainda.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-extrabold uppercase text-slate-500">
                    <tr>
                      <th className="px-6 py-3">Aluno</th>
                      <th className="px-6 py-3">E-mail</th>
                      <th className="px-6 py-3">Progresso</th>
                      <th className="px-6 py-3">Último Acesso</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {enrollments.map((enr) => {
                      const pct =
                        enr.totalLessons > 0
                          ? Math.round(
                              (enr.completedCount / enr.totalLessons) * 100
                            )
                          : 0;
                      return (
                        <tr key={enr.studentId}>
                          <td className="px-6 py-4 font-bold text-[#243e4f]">
                            {enr.studentName}
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {enr.studentEmail}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-200">
                                <div
                                  className="h-full rounded-full bg-[#f7941d]"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-[#243e4f]">
                                {pct}% ({enr.completedCount}/{enr.totalLessons})
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500">
                            {formatDatePtBr(enr.lastAccessedAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Adicionar / Editar Videoaula */}
      {lessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/65 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <h2 className="heading-font text-xl font-extrabold text-[#243e4f]">
              {lessonModal.mode === "create"
                ? "Adicionar Nova Videoaula"
                : "Editar Videoaula"}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Cole links do <strong>YouTube</strong>, <strong>Google Drive</strong> (compartilhado para visualização), <strong>Vimeo</strong> ou MP4 direto.
            </p>

            <form onSubmit={handleSaveLesson} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-[#243e4f]">
                  Título da Aula *
                </label>
                <input
                  type="text"
                  required
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="Ex.: Aula 03 — Batida Pop Worship no Violão"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#f7941d] focus:outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-bold uppercase text-[#243e4f]">
                    Link do Vídeo (YouTube / Google Drive / Vimeo) *
                  </label>
                  <input
                    type="url"
                    required
                    value={lessonVideoUrl}
                    onChange={(e) => setLessonVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... ou https://drive.google.com/file/d/.../view"
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#f7941d] focus:outline-none"
                  />
                  {lessonVideoUrl && (
                    <p className="mt-1 text-[11px] font-bold text-[#f7941d]">
                      Plataforma detectada: {parsedPreview.label}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-[#243e4f]">
                    Duração (min)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={600}
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#f7941d] focus:outline-none"
                  />
                </div>
              </div>

              {parsedPreview.embedUrl && (
                <div>
                  <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Pré-visualização Instantânea do Player
                  </span>
                  <VideoPlayer url={lessonVideoUrl} title={lessonTitle || "Preview"} />
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-[#243e4f]">
                  Descrição / Exercícios da Aula
                </label>
                <textarea
                  rows={3}
                  value={lessonDescription}
                  onChange={(e) => setLessonDescription(e.target.value)}
                  placeholder="Instruções, progressão de acordes ou tarefa prática..."
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#f7941d] focus:outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-[#243e4f]">
                    Link de Material / Cifra PDF (opcional)
                  </label>
                  <input
                    type="text"
                    value={lessonResourceUrl}
                    onChange={(e) => setLessonResourceUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#f7941d] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-[#243e4f]">
                    Título do Botão de Material
                  </label>
                  <input
                    type="text"
                    value={lessonResourceLabel}
                    onChange={(e) => setLessonResourceLabel(e.target.value)}
                    placeholder="Ex.: Baixar Cifra e Playback"
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#f7941d] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setLessonModal(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingLesson}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#f7941d] px-5 py-2 text-sm font-bold text-white hover:bg-[#df7d09]"
                >
                  {savingLesson && <Loader2 className="h-4 w-4 animate-spin" />}
                  Salvar Aula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

