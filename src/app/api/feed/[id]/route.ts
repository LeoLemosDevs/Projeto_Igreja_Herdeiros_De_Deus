import { NextRequest, NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { feedCategories } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { safeJsonParseArray } from "@/lib/utils";

const updateSchema = z.object({
  title: z.string().trim().min(3).optional(),
  subtitle: z.string().trim().optional().nullable(),
  content: z.string().trim().min(10).optional(),
  category: z.enum(feedCategories).optional(),
  coverImage: z.string().trim().optional().nullable(),
  mediaGallery: z.array(z.string().trim()).optional(),
  videoUrl: z.string().trim().optional().nullable(),
  eventDate: z.string().trim().optional().nullable(),
  eventLocation: z.string().trim().optional().nullable(),
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const rows = await db
    .select()
    .from(schema.feedPosts)
    .where(or(eq(schema.feedPosts.id, id), eq(schema.feedPosts.slug, id)))
    .limit(1);

  const post = rows[0];
  if (!post) {
    return NextResponse.json(
      { error: "Publicação não encontrada." },
      { status: 404 }
    );
  }

  if (!post.isPublished) {
    const admin = await requireRole(["ADMIN"]);
    if (!admin) {
      return NextResponse.json(
        { error: "Publicação não encontrada." },
        { status: 404 }
      );
    }
  }

  return NextResponse.json({
    post: {
      ...post,
      mediaGallery: safeJsonParseArray(post.mediaGallery),
    },
  });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireRole(["ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito ao Admin." }, { status: 403 });
  }

  const { id } = await context.params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Dados inválidos." },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (data.title !== undefined) updates.title = data.title;
  if (data.subtitle !== undefined) updates.subtitle = data.subtitle || null;
  if (data.content !== undefined) updates.content = data.content;
  if (data.category !== undefined) updates.category = data.category;
  if (data.coverImage !== undefined) updates.coverImage = data.coverImage || null;
  if (data.mediaGallery !== undefined) {
    updates.mediaGallery = JSON.stringify(
      data.mediaGallery.filter((u) => u.length > 0)
    );
  }
  if (data.videoUrl !== undefined) updates.videoUrl = data.videoUrl || null;
  if (data.eventDate !== undefined) updates.eventDate = data.eventDate || null;
  if (data.eventLocation !== undefined) {
    updates.eventLocation = data.eventLocation || null;
  }
  if (data.isFeatured !== undefined) updates.isFeatured = data.isFeatured;
  if (data.isPublished !== undefined) updates.isPublished = data.isPublished;

  await db
    .update(schema.feedPosts)
    .set(updates)
    .where(eq(schema.feedPosts.id, id));

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireRole(["ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito ao Admin." }, { status: 403 });
  }

  const { id } = await context.params;
  await db.delete(schema.feedPosts).where(eq(schema.feedPosts.id, id));
  return NextResponse.json({ ok: true });
}

