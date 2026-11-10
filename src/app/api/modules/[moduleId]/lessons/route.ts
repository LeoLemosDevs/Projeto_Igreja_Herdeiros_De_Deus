import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { getSessionUser } from "@/lib/auth";
import { canManageCourse, getCourseByModuleId } from "@/lib/course-access";
import { parseVideoUrl } from "@/lib/video";

const lessonSchema = z.object({
  title: z.string().trim().min(2, "Informe o título da aula."),
  description: z.string().trim().optional().nullable(),
  videoUrl: z.string().trim().url("Informe uma URL de vídeo válida (YouTube, Google Drive, Vimeo ou MP4)."),
  durationMinutes: z.number().int().min(1).max(600).optional().default(15),
  resourceUrl: z.string().trim().optional().nullable(),
  resourceLabel: z.string().trim().optional().nullable(),
  isFreePreview: z.boolean().optional().default(false),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ moduleId: string }> }
) {
  const { moduleId } = await context.params;
  const mod = await getCourseByModuleId(moduleId);
  if (!mod) {
    return NextResponse.json({ error: "Módulo não encontrado." }, { status: 404 });
  }

  const user = await getSessionUser();
  if (!(await canManageCourse(mod.courseId, user))) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = lessonSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Dados inválidos." },
      { status: 400 }
    );
  }

  const existing = await db
    .select({ id: schema.courseLessons.id })
    .from(schema.courseLessons)
    .where(eq(schema.courseLessons.moduleId, moduleId));

  const d = parsed.data;
  const videoMeta = parseVideoUrl(d.videoUrl);
  const now = new Date();
  const id = crypto.randomUUID();

  await db.insert(schema.courseLessons).values({
    id,
    courseId: mod.courseId,
    moduleId,
    title: d.title,
    description: d.description || null,
    videoUrl: d.videoUrl,
    videoProvider: videoMeta.provider,
    durationMinutes: d.durationMinutes,
    resourceUrl: d.resourceUrl || null,
    resourceLabel: d.resourceLabel || null,
    isFreePreview: d.isFreePreview,
    sortOrder: existing.length + 1,
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({ id, videoProvider: videoMeta.provider }, { status: 201 });
}

