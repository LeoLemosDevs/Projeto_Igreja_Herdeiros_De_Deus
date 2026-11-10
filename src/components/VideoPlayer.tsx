"use client";

import { Video } from "lucide-react";
import { parseVideoUrl } from "@/lib/video";

interface VideoPlayerProps {
  url?: string | null;
  title?: string;
  className?: string;
}

export function VideoPlayer({
  url,
  title = "Player de vídeo",
  className = "",
}: VideoPlayerProps) {
  const parsed = parseVideoUrl(url);

  if (!parsed.embedUrl) {
    return (
      <div
        className={`flex aspect-video w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-900/95 p-6 text-center text-slate-300 ${className}`}
      >
        <Video className="mb-3 h-10 w-10 text-[#fcaf3d]" />
        <p className="text-sm font-semibold text-white">
          Vídeo disponível somente após login ou ainda não configurado
        </p>
        <p className="mt-1 max-w-md text-xs text-slate-400">
          Suportamos vídeos do YouTube, Google Drive, Vimeo e links diretos MP4.
        </p>
      </div>
    );
  }

  if (parsed.isDirectVideo) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-black ${className}`}>
        <video
          src={parsed.embedUrl}
          controls
          playsInline
          className="aspect-video w-full"
          title={title}
        />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-xl bg-black shadow-lg ${className}`}>
      <iframe
        src={parsed.embedUrl}
        title={title}
        className="aspect-video w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}

