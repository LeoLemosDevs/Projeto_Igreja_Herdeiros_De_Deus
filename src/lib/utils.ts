export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatDatePtBr(date: Date | number | string): string {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function safeJsonParseArray(raw?: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : [];
  } catch {
    return [];
  }
}

export const FEED_CATEGORY_LABELS: Record<string, string> = {
  EVENTO: "Evento",
  AVISO: "Aviso",
  CULTO: "Culto Especial",
  ACAO_SOCIAL: "Ação Social",
  TESTEMUNHO: "Testemunho",
  MUSICA: "Escola de Música",
};

export const COURSE_LEVEL_LABELS: Record<string, string> = {
  INICIANTE: "Iniciante",
  INTERMEDIARIO: "Intermediário",
  AVANCADO: "Avançado",
  TODOS: "Todos os Níveis",
};

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador Principal",
  TEACHER: "Professor(a) de Música",
  STUDENT: "Aluno / Membro",
};

