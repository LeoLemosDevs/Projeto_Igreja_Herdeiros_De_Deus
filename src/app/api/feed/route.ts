import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { desc, eq, and } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { ensureDatabaseReady } from "@/db/bootstrap";
import { feedCategories } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { safeJsonParseArray, slugify } from "@/lib/utils";

const feedPostSchema = z.object({
  title: z.string().trim().min(3, "Título obrigatório (mín. 3 caracteres)."),
  subtitle: z.string().trim().optional().nullable(),
  content: z
    .string()
    .trim()
    .min(10, "Descrição/conteúdo deve ter pelo menos 10 caracteres."),
  category: z.enum(feedCategories).default("EVENTO"),
  coverImage: z.string().trim().optional().nullable(),
  mediaGallery: z.array(z.string().trim()).optional().default([]),
  videoUrl: z.string().trim().optional().nullable(),
  eventDate: z.string().trim().optional().nullable(),
  eventLocation: z.string().trim().optional().nullable(),
  isFeatured: z.boolean().optional().default(false),
  isPublished: z.boolean().optional().default(true),
});

export async function GET(req: NextRequest) {
  try {
    await ensureDatabaseReady();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const q = (searchParams.get("q") || "").trim().toLowerCase();
    const includeAll = searchParams.get("includeAll") === "1";

    let allowDrafts = false;
    if (includeAll) {
      const admin = await requireRole(["ADMIN"]);
      allowDrafts = Boolean(admin);
    }

    const conditions = [];
    if (!allowDrafts) {
      conditions.push(eq(schema.feedPosts.isPublished, true));
    }
    if (
      category &&
      feedCategories.includes(category as (typeof feedCategories)[number])
    ) {
      conditions.push(
        eq(
          schema.feedPosts.category,
          category as (typeof feedCategories)[number]
        )
      );
    }

    const rows = await db
      .select({
        id: schema.feedPosts.id,
        title: schema.feedPosts.title,
        slug: schema.feedPosts.slug,
        subtitle: schema.feedPosts.subtitle,
        content: schema.feedPosts.content,
        category: schema.feedPosts.category,
        coverImage: schema.feedPosts.coverImage,
        mediaGallery: schema.feedPosts.mediaGallery,
        videoUrl: schema.feedPosts.videoUrl,
        eventDate: schema.feedPosts.eventDate,
        eventLocation: schema.feedPosts.eventLocation,
        isFeatured: schema.feedPosts.isFeatured,
        isPublished: schema.feedPosts.isPublished,
        createdAt: schema.feedPosts.createdAt,
        updatedAt: schema.feedPosts.updatedAt,
        authorName: schema.users.name,
      })
      .from(schema.feedPosts)
      .leftJoin(schema.users, eq(schema.feedPosts.authorId, schema.users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(schema.feedPosts.createdAt));

    const filtered = rows
      .filter((row) => {
        if (!q) return true;
        return (
          row.title.toLowerCase().includes(q) ||
          (row.subtitle || "").toLowerCase().includes(q) ||
          row.content.toLowerCase().includes(q)
        );
      })
      .map((row) => ({
        ...row,
        mediaGallery: safeJsonParseArray(row.mediaGallery),
      }));

    return NextResponse.json({ posts: filtered });
  } catch (error) {
    console.error("GET /api/feed error:", error);
    return NextResponse.json(
      { error: "Erro ao carregar publicações." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireRole(["ADMIN"]);
  if (!admin) {
    return NextResponse.json(
      { error: "Apenas o Administrador Principal pode criar publicações." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const parsed = feedPostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dados inválidos." },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const baseSlug = slugify(data.title) || `post-${Date.now()}`;
    const existingSlug = await db
      .select({ id: schema.feedPosts.id })
      .from(schema.feedPosts)
      .where(eq(schema.feedPosts.slug, baseSlug))
      .limit(1);

    const slug =
      existingSlug.length > 0
        ? `${baseSlug}-${crypto.randomBytes(2).toString("hex")}`
        : baseSlug;

    const cleanGallery = data.mediaGallery.filter((u) => u.length > 0);
    const cover = data.coverImage || cleanGallery[0] || null;
    const now = new Date();
    const id = crypto.randomUUID();

    await db.insert(schema.feedPosts).values({
      id,
      title: data.title,
      slug,
      subtitle: data.subtitle || null,
      content: data.content,
      category: data.category,
      coverImage: cover,
      mediaGallery: JSON.stringify(cleanGallery),
      videoUrl: data.videoUrl || null,
      eventDate: data.eventDate || null,
      eventLocation: data.eventLocation || null,
      isFeatured: data.isFeatured,
      isPublished: data.isPublished,
      authorId: admin.id,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ id, slug }, { status: 201 });
  } catch (error) {
    console.error("POST /api/feed error:", error);
    return NextResponse.json(
      { error: "Erro ao criar publicação." },
      { status: 500 }
    );
  }
}

