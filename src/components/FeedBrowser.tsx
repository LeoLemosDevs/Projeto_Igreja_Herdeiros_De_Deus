"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { FEED_CATEGORY_LABELS } from "@/lib/utils";
import { FeedCard, type FeedPostCardData } from "@/components/FeedCard";

const FILTER_OPTIONS = [
  { value: "ALL", label: "Todos" },
  { value: "EVENTO", label: "Eventos" },
  { value: "AVISO", label: "Avisos" },
  { value: "CULTO", label: "Cultos Especiais" },
  { value: "MUSICA", label: "Escola de Música" },
  { value: "ACAO_SOCIAL", label: "Ação Social" },
  { value: "TESTEMUNHO", label: "Testemunhos" },
];

export function FeedBrowser({ posts }: { posts: FeedPostCardData[] }) {
  const [category, setCategory] = useState("ALL");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      const catMatch = category === "ALL" || post.category === category;
      const textMatch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        (post.subtitle || "").toLowerCase().includes(q) ||
        post.content.toLowerCase().includes(q);
      return catMatch && textMatch;
    });
  }, [posts, category, query]);

  return (
    <div>
      {/* Filtros e Busca */}
      <div className="mb-8 flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setCategory(opt.value)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
                category === opt.value
                  ? "bg-[#f7941d] text-white shadow-sm"
                  : "bg-slate-100 text-[#243e4f] hover:bg-slate-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar evento ou notícia..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-800 focus:border-[#f7941d] focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-base font-bold text-[#243e4f]">
            Nenhuma publicação encontrada para &ldquo;
            {category === "ALL" ? query : FEED_CATEGORY_LABELS[category]}
            &rdquo;.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Tente limpar a busca ou selecionar outra categoria.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <FeedCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

