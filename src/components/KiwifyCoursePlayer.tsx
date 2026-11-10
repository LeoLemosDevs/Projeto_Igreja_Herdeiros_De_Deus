"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  FileText,
  Loader2,
  Play,
  Save,
  Video,
} from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { parseVideoUrl } from "@/lib/video";

export interface PlayerLesson {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  durationMinutes: number;
  resourceUrl: string | null;
  resourceLabel: string | null;
  completed: boolean;
  studentNotes: string;
}

export interface PlayerModule {
  id: string;
  title: string;
  description: string | null;
  lessons: PlayerLesson[];
}

interface KiwifyCoursePlayerProps {
  course: {
    id: string;
    title: string;
    slug: string;
    instrument: string;
    teacherName: string | null;
  };
  initialModules: PlayerModule[];
  initialLessonId?: string | null;
}

export function KiwifyCoursePlayer({
  course,
  initialModules,
  initialLessonId,
}: KiwifyCoursePlayerProps) {
  const [modules, setModules] = useState<PlayerModule[]>(initialModules);

  const flatLessons = useMemo(
    () => modules.flatMap((m) => m.lessons),
    [modules]
  );

  const defaultLesson =
    flatLessons.find((l) => l.id === initialLessonId) ||
    flatLessons.find((l) => !l.completed) ||
    flatLessons[0] ||
    null;

  const [activeLessonId, setActiveLessonId] = useState<string | null>(
    defaultLesson?.id || null
  );
  const [openModuleIds, setOpenModuleIds] = useState<Record<string, boolean>>(
    () => {
      const map: Record<string, boolean> = {};
      initialModules.forEach((m) => {
        map[m.id] = true;
      });
      return map;
    }
  );
  const [activeTab, setActiveTab] = useState<"sobre" | "notas">("sobre");
  const [savingProgress, setSavingProgress] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesFeedback, setNotesFeedback] = useState("");

  const activeLesson =
    flatLessons.find((l) => l.id === activeLessonId) || flatLessons[0] || null;

  const [noteDraft, setNoteDraft] = useState(activeLesson?.studentNotes || "");

  const completedCount = flatLessons.filter((l) => l.completed).length;
  const totalCount = flatLessons.length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const currentIdx = flatLessons.findIndex((l) => l.id === activeLesson?.id);
  const nextLesson =
    currentIdx >= 0 && currentIdx < flatLessons.length - 1
      ? flatLessons[currentIdx + 1]
      : null;

  function selectLesson(lesson: PlayerLesson) {
    setActiveLessonId(lesson.id);
    setNoteDraft(lesson.studentNotes || "");
    setNotesFeedback("");
  }

  function toggleModule(id: string) {
    setOpenModuleIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function toggleLessonCompleted(lesson: PlayerLesson) {
    const targetCompleted = !lesson.completed;
    setSavingProgress(true);

    try {
      const res = await fetch(`/api/lessons/${lesson.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: targetCompleted }),
      });
      if (res.ok) {
        setModules((prev) =>
          prev.map((m) => ({
            ...m,
            lessons: m.lessons.map((l) =>
              l.id === lesson.id ? { ...l, completed: targetCompleted } : l
            ),
          }))
        );
      }
    } finally {
      setSavingProgress(false);
    }
  }

  async function saveLessonNotes() {
    if (!activeLesson) return;
    setSavingNotes(true);
    setNotesFeedback("");

    try {
      const res = await fetch(`/api/lessons/${activeLesson.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completed: activeLesson.completed,
          notes: noteDraft,
        }),
      });
      if (res.ok) {
        setModules((prev) =>
          prev.map((m) => ({
            ...m,
            lessons: m.lessons.map((l) =>
              l.id === activeLesson.id ? { ...l, studentNotes: noteDraft } : l
            ),
          }))
        );
        setNotesFeedback("Anotação salva com sucesso!");
      }
    } finally {
      setSavingNotes(false);
    }
  }

  const videoInfo = parseVideoUrl(activeLesson?.videoUrl);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#0f172a] text-slate-100">
      {/* Barra superior estilo Kiwify */}
      <div className="border-b border-slate-800 bg-[#182b38] px-4 py-3.5 sm:px-6">
        <div className="mx-auto flex max-w-[1600px] flex-col justify-between gap-3 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/cursos"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs font-bold text-slate-200 transition hover:border-[#fcaf3d] hover:text-[#fcaf3d]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Acervo
            </Link>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#fcaf3d]">
                {course.instrument} • {course.teacherName || "Escola de Música"}
              </span>
              <h1 className="heading-font text-base font-bold text-white sm:text-lg">
                {course.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-56">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">
                  {completedCount} de {totalCount} aulas
                </span>
                <span className="font-extrabold text-[#fcaf3d]">
                  {progressPercent}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#f7941d] to-emerald-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {progressPercent === 100 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-extrabold text-emerald-300 border border-emerald-500/40">
                <Award className="h-4 w-4" />
                Concluído!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Corpo Principal (Player + Sidebar estilo Kiwify) */}
      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-12">
        {/* Coluna Esquerda: Video & Controles */}
        <div className="p-4 sm:p-6 lg:col-span-8 xl:col-span-9">
          {activeLesson ? (
            <>
              <VideoPlayer
                url={activeLesson.videoUrl}
                title={activeLesson.title}
              />

              <div className="mt-5 flex flex-col justify-between gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-center">
                <div>
                  <div className="mb-1 flex items-center gap-2 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 font-semibold text-[#fcaf3d]">
                      <Video className="h-3 w-3" />
                      {videoInfo.label}
                    </span>
                    <span>• {activeLesson.durationMinutes} min</span>
                  </div>
                  <h2 className="heading-font text-xl font-extrabold text-white sm:text-2xl">
                    {activeLesson.title}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    disabled={savingProgress}
                    onClick={() => toggleLessonCompleted(activeLesson)}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide transition ${
                      activeLesson.completed
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-[#f7941d] text-white hover:bg-[#df7d09]"
                    }`}
                  >
                    {savingProgress ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    {activeLesson.completed
                      ? "Aula Concluída"
                      : "Marcar como Concluída"}
                  </button>

                  {nextLesson && (
                    <button
                      type="button"
                      onClick={() => selectLesson(nextLesson)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:border-[#fcaf3d] hover:text-[#fcaf3d]"
                    >
                      Próxima Aula
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Abas Sobre / Anotacoes */}
              <div className="mt-5">
                <div className="flex gap-4 border-b border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab("sobre")}
                    className={`border-b-2 pb-3 text-sm font-bold transition ${
                      activeTab === "sobre"
                        ? "border-[#f7941d] text-white"
                        : "border-transparent text-slate-400 hover:text-white"
                    }`}
                  >
                    Descrição & Materiais
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("notas")}
                    className={`border-b-2 pb-3 text-sm font-bold transition ${
                      activeTab === "notas"
                        ? "border-[#f7941d] text-white"
                        : "border-transparent text-slate-400 hover:text-white"
                    }`}
                  >
                    Minhas Anotações
                  </button>
                </div>

                {activeTab === "sobre" ? (
                  <div className="mt-4 space-y-4">
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-sm leading-relaxed text-slate-300">
                      {activeLesson.description ||
                        "Assista à aula completa com atenção e pratique os exercícios propostos pelo professor."}
                    </div>

                    {activeLesson.resourceUrl && (
                      <a
                        href={activeLesson.resourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-[#fcaf3d]/40 bg-[#243e4f] px-4 py-3 text-sm font-bold text-[#fcaf3d] transition hover:bg-[#182b38]"
                      >
                        <FileText className="h-4 w-4" />
                        {activeLesson.resourceLabel ||
                          "Acessar Material Complementar / Cifra"}
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    <textarea
                      rows={5}
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      placeholder="Anote aqui acordes, tempos, dúvidas ou dicas desta aula..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm text-white placeholder:text-slate-500 focus:border-[#f7941d] focus:outline-none"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={savingNotes}
                        onClick={saveLessonNotes}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#f7941d] px-4 py-2 text-xs font-bold uppercase text-white hover:bg-[#df7d09]"
                      >
                        {savingNotes ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Save className="h-3.5 w-3.5" />
                        )}
                        Salvar Anotações
                      </button>
                      {notesFeedback && (
                        <span className="text-xs font-semibold text-emerald-400">
                          {notesFeedback}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">
              <p className="text-base font-bold text-white">
                Este curso ainda não possui aulas cadastradas pelo professor.
              </p>
            </div>
          )}
        </div>

        {/* Coluna Direita: Lista de Modulos e Aulas estilo Kiwify */}
        <aside className="border-t border-slate-800 bg-[#111c2d] lg:col-span-4 lg:border-l lg:border-t-0 xl:col-span-3">
          <div className="border-b border-slate-800 px-5 py-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
              Conteúdo do Curso
            </h3>
            <p className="mt-0.5 text-xs text-slate-400">
              {modules.length} módulos • {totalCount} videoaulas
            </p>
          </div>

          <div className="kiwify-scroll max-h-[75vh] overflow-y-auto divide-y divide-slate-800">
            {modules.map((mod) => {
              const isOpen = openModuleIds[mod.id] ?? true;
              const modCompleted = mod.lessons.filter((l) => l.completed).length;

              return (
                <div key={mod.id}>
                  <button
                    type="button"
                    onClick={() => toggleModule(mod.id)}
                    className="flex w-full items-center justify-between bg-slate-900/70 px-5 py-3.5 text-left transition hover:bg-slate-800/80"
                  >
                    <div>
                      <span className="block text-xs font-extrabold text-white">
                        {mod.title}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {modCompleted}/{mod.lessons.length} concluídas
                      </span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="divide-y divide-slate-800/60 bg-[#0d1522]">
                      {mod.lessons.map((lesson) => {
                        const isActive = activeLesson?.id === lesson.id;
                        return (
                          <button
                            key={lesson.id}
                            type="button"
                            onClick={() => selectLesson(lesson)}
                            className={`flex w-full items-start gap-3 px-5 py-3 text-left transition ${
                              isActive
                                ? "border-l-4 border-[#f7941d] bg-[#243e4f]/60"
                                : "border-l-4 border-transparent hover:bg-slate-800/50"
                            }`}
                          >
                            <span className="mt-0.5 shrink-0">
                              {lesson.completed ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                              ) : isActive ? (
                                <Play className="h-4 w-4 text-[#fcaf3d]" />
                              ) : (
                                <Circle className="h-4 w-4 text-slate-500" />
                              )}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p
                                className={`text-xs font-semibold leading-snug ${
                                  isActive ? "text-white" : "text-slate-300"
                                }`}
                              >
                                {lesson.title}
                              </p>
                              <span className="mt-1 block text-[11px] text-slate-500">
                                {lesson.durationMinutes} min •{" "}
                                {parseVideoUrl(lesson.videoUrl).label}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}

