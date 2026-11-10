import Link from "next/link";
import { Calendar, MapPin, PlayCircle, ImageIcon, ArrowRight } from "lucide-react";
import { FEED_CATEGORY_LABELS, formatDatePtBr } from "@/lib/utils";

export interface FeedPostCardData {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  content: string;
  category: string;
  coverImage: string | null;
  mediaGallery: string[];
  videoUrl: string | null;
  eventDate: string | null;
  eventLocation: string | null;
  createdAt: Date | number | string;
}

export function FeedCard({ post }: { post: FeedPostCardData }) {
  const categoryLabel = FEED_CATEGORY_LABELS[post.category] || post.category;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/feed/${post.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={post.coverImage || "/images/hero-culto.jpg"}
          alt={post.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-[#f7941d] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow">
            {categoryLabel}
          </span>
        </div>

        <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
          {post.videoUrl && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/75 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              <PlayCircle className="h-3.5 w-3.5 text-[#fcaf3d]" />
              Vídeo
            </span>
          )}
          {post.mediaGallery.length > 1 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/75 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              <ImageIcon className="h-3.5 w-3.5 text-[#fcaf3d]" />
              {post.mediaGallery.length} fotos
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          <span>Publicado em {formatDatePtBr(post.createdAt)}</span>
          {post.eventDate && (
            <span className="inline-flex items-center gap-1 font-semibold text-[#243e4f]">
              <Calendar className="h-3.5 w-3.5 text-[#f7941d]" />
              {post.eventDate}
            </span>
          )}
        </div>

        <Link href={`/feed/${post.slug}`}>
          <h3 className="heading-font line-clamp-2 text-lg font-bold text-[#243e4f] transition group-hover:text-[#f7941d]">
            {post.title}
          </h3>
        </Link>

        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-[#5a6672]">
          {post.subtitle || post.content}
        </p>

        {post.eventLocation && (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#f7941d]" />
            {post.eventLocation}
          </p>
        )}

        <div className="mt-4 border-t border-slate-100 pt-3">
          <Link
            href={`/feed/${post.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#f7941d] transition hover:gap-2.5"
          >
            Ler publicação completa
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

