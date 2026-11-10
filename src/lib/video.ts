import type { VideoProvider } from "@/db/schema";

export interface ParsedVideo {
  provider: VideoProvider;
  embedUrl: string | null;
  thumbnailUrl: string | null;
  isDirectVideo: boolean;
  label: string;
}

/**
 * Converte URLs do YouTube, Google Drive, Vimeo ou links diretos (MP4/WebM)
 * em URLs prontas para reproducao em iframe/player HTML5.
 */
export function parseVideoUrl(rawUrl?: string | null): ParsedVideo {
  const url = (rawUrl || "").trim();
  if (!url) {
    return {
      provider: "OTHER",
      embedUrl: null,
      thumbnailUrl: null,
      isDirectVideo: false,
      label: "Sem vídeo",
    };
  }

  // 1. YouTube (watch, youtu.be, shorts, live, embed)
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  if (ytMatch?.[1]) {
    const id = ytMatch[1];
    return {
      provider: "YOUTUBE",
      embedUrl: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
      isDirectVideo: false,
      label: "YouTube",
    };
  }

  // 2. Google Drive (/file/d/ID/view, open?id=ID, uc?id=ID, /preview)
  const driveFileMatch =
    url.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/) ||
    url.match(/drive\.google\.com\/(?:open|uc)\?(?:.*&)?id=([A-Za-z0-9_-]+)/);
  if (driveFileMatch?.[1]) {
    const id = driveFileMatch[1];
    return {
      provider: "GOOGLE_DRIVE",
      embedUrl: `https://drive.google.com/file/d/${id}/preview`,
      thumbnailUrl: null,
      isDirectVideo: false,
      label: "Google Drive",
    };
  }

  // 3. Vimeo (vimeo.com/123456 ou player.vimeo.com/video/123456)
  const vimeoMatch = url.match(
    /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/
  );
  if (vimeoMatch?.[1]) {
    const id = vimeoMatch[1];
    return {
      provider: "VIMEO",
      embedUrl: `https://player.vimeo.com/video/${id}`,
      thumbnailUrl: null,
      isDirectVideo: false,
      label: "Vimeo",
    };
  }

  // 4. Direct video file (.mp4, .webm, .ogg)
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) {
    return {
      provider: "DIRECT",
      embedUrl: url,
      thumbnailUrl: null,
      isDirectVideo: true,
      label: "Vídeo Direto (MP4/WebM)",
    };
  }

  // 5. Fallback for OneDrive / PandaVideo / custom iframe embeds
  if (/^https?:\/\//i.test(url)) {
    return {
      provider: "OTHER",
      embedUrl: url,
      thumbnailUrl: null,
      isDirectVideo: false,
      label: "Player Externo",
    };
  }

  return {
    provider: "OTHER",
    embedUrl: null,
    thumbnailUrl: null,
    isDirectVideo: false,
    label: "Link inválido",
  };
}

