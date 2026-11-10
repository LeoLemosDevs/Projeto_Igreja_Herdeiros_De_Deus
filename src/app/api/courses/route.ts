import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { desc, eq, and } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { courseLevels } from "@/db/schema";
import { getSessionUser, requireRole } from "@/lib/auth";
import { slugify } from "@/lib/utils";

const createCourseSchema = z.object({
  title: z.string().trim().min(3, "Informe o título do curso."),
  subtitle: z.string().trim().optional().nullable(),
  description: z
    .string()
    .trim()
    .min(10, "Descreva o conteúdo do curso (mín. 10 caracteres)."),
  instrument: z.string().trim().min(2, "Informe o instrumento ou área musical."),
  level: z.enum(courseLevels).default("INICIANTE"),
  coverImage: z.string().trim().optional().nullable(),
  promoVideoUrl: z.string().trim().optional().nullable(),
  isPublished: z.boolean().optional().default(false),
  isFeatured: z.boolean().optional().default(false),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const { searchParams } = new URL(req.url);
    const mine = searchParams.get("mine") === "1";
    const includeAll = searchParams.get("all") === "1";

    const conditions = [];
    if (mine && user && (user.role === "TEACHER" || user.role === "ADMIN")) {
      if (user.role === "TEACHER") {
        conditions.push(eq(schema.courses.teacherId, user.id));
      }
    } else if (includeAll && user?.role === "ADMIN") {
      // Admin sees all
    } else {
      conditions.push(eq(schema.courses.isPublished, true));
    }

    const courseRows = await db
      .select({
        id: schema.courses.id,
        title: schema.courses.title,
        slug: schema.courses.slug,
        subtitle: schema.courses.subtitle,
        description: schema.courses.description,
        instrument: schema.courses.instrument,
        level: schema.courses.level,
        coverImage: schema.courses.coverImage,
        promoVideoUrl: schema.courses.promoVideoUrl,
        isPublished: schema.courses.isPublished,
        isFeatured: schema.courses.isFeatured,
        teacherId: schema.courses.teacherId,
        teacherName: schema.users.name,
        createdAt: schema.courses.createdAt,
        updatedAt: schema.courses.updatedAt,
      })
      .from(schema.courses)
      .leftJoin(schema.users, eq(schema.courses.teacherId, schema.users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(schema.courses.createdAt));

    const allModules = await db.select().from(schema.courseModules);
    const allLessons = await db.select().from(schema.courseLessons);
    const allEnrollments = await db.select().from(schema.courseEnrollments);

    let userProgressRows: { courseId: string; completed: boolean }[] = [];
    let userEnrollments = new Set<string>();
    if (user) {
      userProgressRows = await db
        .select({
          courseId: schema.lessonProgress.courseId,
          completed: schema.lessonProgress.completed,
        })
        .from(schema.lessonProgress)
        .where(eq(schema.lessonProgress.studentId, user.id));

      userEnrollments = new Set(
        allEnrollments
          .filter((e) => e.studentId === user.id)
          .map((e) => e.courseId)
      );
    }

    const enriched = courseRows.map((c) => {
      const modCount = allModules.filter((m) => m.courseId === c.id).length;
      const lessons = allLessons.filter((l) => l.courseId === c.id);
      const totalDurationMinutes = lessons.reduce(
        (acc, l) => acc + (l.durationMinutes || 0),
        0
      );
      const enrollmentCount = allEnrollments.filter(
        (e) => e.courseId === c.id
      ).length;
      const completedCount = userProgressRows.filter(
        (p) => p.courseId === c.id && p.completed
      ).length;
      const progressPercent =
        lessons.length > 0
          ? Math.round((completedCount / lessons.length) * 100)
          : 0;

      return {
        ...c,
        moduleCount: modCount,
        lessonCount: lessons.length,
        totalDurationMinutes,
        enrollmentCount,
        isEnrolled: userEnrollments.has(c.id),
        completedLessons: completedCount,
        progressPercent,
      };
    });

    return NextResponse.json({ courses: enriched });
  } catch (error) {
    console.error("GET /api/courses error:", error);
    return NextResponse.json(
      { error: "Erro ao carregar cursos." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const user = await requireRole(["TEACHER", "ADMIN"]);
  if (!user) {
    return NextResponse.json(
      { error: "Apenas professores ou administradores podem criar cursos." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const parsed = createCourseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dados inválidos." },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const baseSlug = slugify(d.title) || `curso-${Date.now()}`;
    const existingSlug = await db
      .select({ id: schema.courses.id })
      .from(schema.courses)
      .where(eq(schema.courses.slug, baseSlug))
      .limit(1);

    const slug =
      existingSlug.length > 0
        ? `${baseSlug}-${crypto.randomBytes(2).toString("hex")}`
        : baseSlug;

    const now = new Date();
    const id = crypto.randomUUID();
    await db.insert(schema.courses).values({
      id,
      title: d.title,
      slug,
      subtitle: d.subtitle || null,
      description: d.description,
      instrument: d.instrument,
      level: d.level,
      coverImage: d.coverImage || "/images/hero-musica.jpg",
      promoVideoUrl: d.promoVideoUrl || null,
      isPublished: d.isPublished,
      isFeatured: d.isFeatured,
      teacherId: user.id,
      createdAt: now,
      updatedAt: now,
    });

    // Cria modulo inicial automaticamente no estilo Kiwify
    await db.insert(schema.courseModules).values({
      id: crypto.randomUUID(),
      courseId: id,
      title: "Módulo 1 — Introdução",
      description: "Primeiros passos do curso.",
      sortOrder: 1,
      createdAt: now,
    });

    return NextResponse.json({ id, slug }, { status: 201 });
  } catch (error) {
    console.error("POST /api/courses error:", error);
    return NextResponse.json(
      { error: "Erro ao criar curso." },
      { status: 500 }
    );
  }
}

