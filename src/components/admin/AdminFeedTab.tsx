"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Edit3,
  ExternalLink,
  ImagePlus,
  Loader2,
  Plus,
  Star,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";
import { FEED_CATEGORY_LABELS, formatDatePtBr } from "@/lib/utils";
import { VideoPlayer } from "@/components/VideoPlayer";

export interface AdminFeedPost {
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
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: Date | number | string;
}

const EMPTY_FORM = {
  id: "",
  title: "",
  subtitle: "",
  content: "",
  category: "EVENTO",
  coverImage: "",
  mediaGallery: [] as string[],
  videoUrl: "",
  eventDate: "",
  eventLocation: "",
  isFeatured: false,
  isPublished: true,
};

export function AdminFeedTab({
  initialPosts,
}: {
  initialPosts: AdminFeedPost[];
}) {
  const router = useRouter();
  const [posts, setPosts] = useState<AdminFeedPost[]>(initialPosts);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function openNew() {
    setForm(EMPTY_FORM);
    setError("");
    setEditing(true);
  }

  function openEdit(post: AdminFeedPost) {
    setForm({
      id: post.id,
      title: post.title,
      subtitle: post.subtitle || "",
      content: post.content,
      category: post.category,
      coverImage: post.coverImage || "",
      mediaGallery: post.mediaGallery || [],
      videoUrl: post.videoUrl || "",
      eventDate: post.eventDate || "",
      eventLocation: post.eventLocation || "",
      isFeatured: post.isFeatured,
      isPublished: post.isPublished,
    });
    setError("");
    setEditing(true);
  }

  async function reloadPosts() {
    const res = await fetch("/api/feed?includeAll=1");
    if (res.ok) {
      const data = await res.json();
      setPosts(data.posts);
    }
    router.refresh();
  }

  async function handleFileUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    target: "cover" | "gallery"
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.url) {
        alert(data.error || "Erro ao enviar foto.");
        return;
      }

      if (target === "cover") {
        setForm((prev) => ({
          ...prev,
          coverImage: data.url,
          mediaGallery: prev.mediaGallery.includes(data.url)
            ? prev.mediaGallery
            : [data.url, ...prev.mediaGallery],
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          mediaGallery: [...prev.mediaGallery, data.url],
          coverImage: prev.coverImage || data.url,
        }));
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function addGalleryUrl() {
    const trimmed = newGalleryUrl.trim();
    if (!trimmed) return;
    setForm((prev) => ({
      ...prev,
      mediaGallery: [...prev.mediaGallery, trimmed],
      coverImage: prev.coverImage || trimmed,
    }));
    setNewGalleryUrl("");
  }

  function removeGalleryItem(index: number) {
    setForm((prev) => ({
      ...prev,
      mediaGallery: prev.mediaGallery.filter((_, i) => i !== index),
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      title: form.title,
      subtitle: form.subtitle || null,
      content: form.content,
      category: form.category,
      coverImage: form.coverImage || form.mediaGallery[0] || null,
      mediaGallery: form.mediaGallery,
      videoUrl: form.videoUrl || null,
      eventDate: form.eventDate || null,
      eventLocation: form.eventLocation || null,
      isFeatured: form.isFeatured,
      isPublished: form.isPublished,
    };

    const url = form.id ? `/api/feed/${form.id}` : "/api/feed";
    const method = form.id ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erro ao salvar publicação.");
      return;
    }

    setEditing(false);
    await reloadPosts();
  }

  async function handleDelete(post: AdminFeedPost) {
    if (!confirm(`Excluir a publicação "${post.title}"?`)) return;
    const res = await fetch(`/api/feed/${post.id}`, { method: "DELETE" });
    if (res.ok) {
      await reloadPosts();
    }
  }

  async function togglePublished(post: AdminFeedPost) {
    await fetch(`/api/feed/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !post.isPublished }),
    });
    await reloadPosts();
  }

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="heading-font text-xl font-extrabold text-[#243e4f]">
            Gerenciar Publicações do Feed & Eventos
          </h2>
          <p className="text-sm text-[#5a6672]">
            Publique títulos, descrições, múltiplas fotos e vídeos (YouTube, Google Drive, Vimeo ou MP4).
          </p>
        </div>

        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-full bg-[#f7941d] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow hover:bg-[#df7d09]"
        >
          <Plus className="h-4 w-4" />
          Nova Publicação
        </button>
      </div>

      {/* Formulario Criar / Editar Publicacao */}
      {editing && (
        <form
          onSubmit={handleSave}
          className="mb-8 space-y-5 rounded-2xl border-2 border-[#fcaf3d] bg-white p-6 shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="heading-font text-lg font-extrabold text-[#243e4f]">
              {form.id ? "Editar Publicação" : "Criar Nova Publicação"}
            </h3>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold uppercase text-[#243e4f]">
                Título da Publicação *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex.: Culto Especial de Missões e Louvor"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#f7941d] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-[#243e4f]">
                Categoria *
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-[#f7941d] focus:outline-none"
              >
                {Object.entries(FEED_CATEGORY_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-[#243e4f]">
              Subtítulo / Resumo
            </label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              placeholder="Breve resumo que aparece no card do feed..."
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#f7941d] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-[#243e4f]">
              Descrição Completa / Texto da Publicação *
            </label>
            <textarea
              required
              rows={5}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Escreva todos os detalhes, programação, convite e informações..."
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#f7941d] focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-[#243e4f]">
                Data / Horário do Evento (opcional)
              </label>
              <input
                type="text"
                value={form.eventDate}
                onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                placeholder="Ex.: 22 de Novembro de 2026 • 19h30"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#f7941d] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-[#243e4f]">
                Local do Evento (opcional)
              </label>
              <input
                type="text"
                value={form.eventLocation}
                onChange={(e) =>
                  setForm({ ...form, eventLocation: e.target.value })
                }
                placeholder="Ex.: Templo Sede — Rua A, nº 90, Conj. Jaciara, Barra do Ceará"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#f7941d] focus:outline-none"
              />
            </div>
          </div>

          {/* Fotos (Capa + Galeria) */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#243e4f]">
                Fotos da Publicação (Capa & Galeria)
              </span>
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#243e4f] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#182b38]">
                {uploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5 text-[#fcaf3d]" />
                )}
                Enviar Foto do Computador
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "gallery")}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase text-slate-500">
                  Foto de Capa Principal (URL ou caminho)
                </label>
                <input
                  type="text"
                  value={form.coverImage}
                  onChange={(e) =>
                    setForm({ ...form, coverImage: e.target.value })
                  }
                  placeholder="/images/hero-culto.jpg ou https://..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-[#f7941d] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase text-slate-500">
                  Adicionar Foto Extra por URL na Galeria
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-[#f7941d] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addGalleryUrl}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#f7941d] px-3 py-2 text-xs font-bold text-white"
                  >
                    <ImagePlus className="h-3.5 w-3.5" />
                    Add
                  </button>
                </div>
              </div>
            </div>

            {form.mediaGallery.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-1">
                {form.mediaGallery.map((imgUrl, idx) => (
                  <div
                    key={`${imgUrl}-${idx}`}
                    className="relative h-20 w-32 overflow-hidden rounded-lg border border-slate-300 bg-white"
                  >
                    <img
                      src={imgUrl}
                      alt={`Foto ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryItem(idx)}
                      className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Video */}
          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <label className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#243e4f]">
              <Video className="h-4 w-4 text-[#f7941d]" />
              Vídeo da Publicação (YouTube, Google Drive, Vimeo ou MP4)
            </label>
            <input
              type="text"
              value={form.videoUrl}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=... ou https://drive.google.com/file/d/.../view"
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-[#f7941d] focus:outline-none"
            />
            {form.videoUrl && (
              <div className="max-w-lg">
                <VideoPlayer url={form.videoUrl} title={form.title || "Preview"} />
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-[#243e4f]">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) =>
                  setForm({ ...form, isPublished: e.target.checked })
                }
                className="h-4 w-4 accent-[#f7941d]"
              />
              Publicar imediatamente no Feed
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-[#243e4f]">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) =>
                  setForm({ ...form, isFeatured: e.target.checked })
                }
                className="h-4 w-4 accent-[#f7941d]"
              />
              Destacar na Página Inicial
            </label>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-xs font-bold text-red-700">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#f7941d] px-6 py-2.5 text-sm font-extrabold text-white hover:bg-[#df7d09]"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {form.id ? "Salvar Alterações" : "Publicar no Feed"}
            </button>
          </div>
        </form>
      )}

      {/* Listagem */}
      <div className="space-y-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
          >
            <div className="flex items-center gap-4">
              <img
                src={post.coverImage || "/images/hero-culto.jpg"}
                alt={post.title}
                className="h-16 w-24 shrink-0 rounded-lg object-cover bg-slate-100"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-extrabold uppercase text-[#f7941d]">
                    {FEED_CATEGORY_LABELS[post.category] || post.category}
                  </span>
                  {post.isFeatured && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                      <Star className="h-3 w-3" />
                      Destaque
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      post.isPublished
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {post.isPublished ? "Publicado" : "Rascunho"}
                  </span>
                </div>

                <h3 className="mt-1 font-bold text-[#243e4f]">{post.title}</h3>
                <p className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span>{formatDatePtBr(post.createdAt)}</span>
                  {post.eventDate && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-[#f7941d]" />
                      {post.eventDate}
                    </span>
                  )}
                  {post.videoUrl && (
                    <span className="inline-flex items-center gap-1 text-[#243e4f] font-medium">
                      <Video className="h-3 w-3 text-[#f7941d]" />
                      Com vídeo
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => togglePublished(post)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                {post.isPublished ? "Ocultar" : "Publicar"}
              </button>
              <button
                type="button"
                onClick={() => openEdit(post)}
                className="inline-flex items-center gap-1 rounded-lg bg-[#243e4f] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#182b38]"
              >
                <Edit3 className="h-3.5 w-3.5 text-[#fcaf3d]" />
                Editar
              </button>
              <Link
                href={`/feed/${post.slug}`}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:text-[#f7941d]"
                title="Abrir no site"
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(post)}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:border-red-200 hover:text-red-600"
                title="Excluir"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

