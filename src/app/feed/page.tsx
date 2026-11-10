import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { safeJsonParseArray } from "@/lib/utils";
import { SectionTitle } from "@/components/SectionTitle";
import { FeedBrowser } from "@/components/FeedBrowser";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Feed de Publicações & Eventos",
  description:
    "Acompanhe eventos, avisos, vídeos, fotos e ações sociais da Igreja Bíblica Herdeiros de Deus.",
};

export default async function FeedPage() {
  const rows = await db
    .select()
    .from(schema.feedPosts)
    .where(eq(schema.feedPosts.isPublished, true))
    .orderBy(desc(schema.feedPosts.createdAt));

  const posts = rows.map((r) => ({
    ...r,
    mediaGallery: safeJsonParseArray(r.mediaGallery),
  }));

  return (
    <div className="bg-[#f8f9fa] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Comunicação Oficial"
          title="Feed de Publicações e Eventos"
          subtitle="Fotos, vídeos, calendário de conferências, cultos especiais e comunicados publicados pela liderança da igreja."
        />

        <FeedBrowser posts={posts} />
      </div>
    </div>
  );
}

