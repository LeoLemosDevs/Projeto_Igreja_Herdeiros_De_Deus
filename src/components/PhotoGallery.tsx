"use client";

import { useState } from "react";
import { X, ImageIcon } from "lucide-react";

export function PhotoGallery({ images, title }: { images: string[]; title: string }) {
  const [selected, setSelected] = useState<string | null>(null);

  if (images.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#243e4f]">
        <ImageIcon className="h-5 w-5 text-[#f7941d]" />
        Galeria de Fotos
      </h3>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {images.map((src, idx) => (
          <button
            key={`${src}-${idx}`}
            type="button"
            onClick={() => setSelected(src)}
            className="group overflow-hidden rounded-xl border border-slate-200 bg-slate-100 text-left shadow-sm"
          >
            <img
              src={src}
              alt={`${title} — foto ${idx + 1}`}
              className="aspect-[16/10] w-full object-cover transition duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {selected && (
        <div
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
        >
          <button
            type="button"
            onClick={() => setSelected(null)}
            aria-label="Fechar foto"
            className="absolute right-5 top-5 rounded-full bg-white/15 p-2 text-white hover:bg-white/30"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={selected}
            alt={title}
            className="max-h-[88vh] max-w-full rounded-xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}

