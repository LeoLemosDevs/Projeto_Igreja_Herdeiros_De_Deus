import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, or } from "drizzle-orm";
import { ArrowLeft, Calendar, MapPin, User } from "lucide-react";
import { db, schema } from "@/db";
import { FEED_CATEGORY_LABELS, formatDatePtBr, safeJsonParseArray } from "@/lib/utils";
import { VideoPlayer } from "@/components/VideoPlayer";
import { PhotoGallery } from "@/components/PhotoGallery";

export const dynamic = "force-dynamic";

export default async function FeedDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

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
      isPublished: schema.feedPosts.isPublished,
      createdAt: schema.feedPosts.createdAt,
      authorName: schema.users.name,
    })
    .from(schema.feedPosts)
    .leftJoin(schema.users, eq(schema.feedPosts.authorId, schema.users.id))
    .where(or(eq(schema.feedPosts.slug, slug), eq(schema.feedPosts.id, slug)))
    .limit(1);

  const post = rows[0];
  if (!post || !post.isPublished) {
    notFound();
  }

  const gallery = safeJsonParseArray(post.mediaGallery);
  const categoryLabel = FEED_CATEGORY_LABELS[post.category] || post.category;

  return (
    <article className="bg-[#f8f9fa] py-10 sm:py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/feed"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#243e4f] transition hover:text-[#f7941d]"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para o Feed de Eventos
        </Link>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
          {post.coverImage && (
            <div className="aspect-[16/8] w-full overflow-hidden bg-slate-900">
              <img
                src={post.coverImage}
                alt={post.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="p-6 sm:p-10">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#f7941d] px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-white">
                {categoryLabel}
              </span>
              <span className="text-xs font-medium text-slate-500">
                Publicado em {formatDatePtBr(post.createdAt)}
              </span>
              {post.authorName && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <User className="h-3.5 w-3.5 text-[#f7941d]" />
                  {post.authorName}
                </span>
              )}
            </div>

            <h1 className="heading-font text-2xl font-extrabold leading-tight text-[#243e4f] sm:text-4xl">
              {post.title}
            </h1>

            {post.subtitle && (
              <p className="mt-3 text-lg font-medium leading-relaxed text-[#5a6672]">
                {post.subtitle}
              </p>
            )}

            {(post.eventDate || post.eventLocation) && (
              <div className="mt-6 grid gap-3 rounded-xl border border-orange-100 bg-orange-50/70 p-4 sm:grid-cols-2">
                {post.eventDate && (
                  <div className="flex items-center gap-2.5 text-sm font-semibold text-[#243e4f]">
                    <Calendar className="h-5 w-5 text-[#f7941d]" />
                    <span>{post.eventDate}</span>
                  </div>
                )}
                {post.eventLocation && (
                  <div className="flex items-center gap-2.5 text-sm font-semibold text-[#243e4f]">
                    <MapPin className="h-5 w-5 text-[#f7941d]" />
                    <span>{post.eventLocation}</span>
                  </div>
                )}
              </div>
            )}

            {post.videoUrl && (
              <div className="mt-8">
                <VideoPlayer url={post.videoUrl} title={post.title} />
              </div>
            )}

            <div className="mt-8 space-y-4 text-base leading-relaxed text-slate-700">
              {post.content.split("\n").map((paragraph, i) =>
                paragraph.trim() ? <p key={i}>{paragraph}</p> : null
              )}
            </div>

            <PhotoGallery images={gallery} title={post.title} />
          </div>
        </div>
      </div>
    </article>
  );
}

