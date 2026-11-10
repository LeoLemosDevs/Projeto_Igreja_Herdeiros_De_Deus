import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";

const ALLOWED_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "svg",
]);

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  const user = await requireRole(["ADMIN", "TEACHER"]);
  if (!user) {
    return NextResponse.json(
      { error: "Faça login como Administrador ou Professor para enviar fotos." },
      { status: 403 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Nenhum arquivo de imagem enviado." },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "A imagem deve ter no máximo 5 MB." },
        { status: 400 }
      );
    }

    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: "Formato inválido. Envie JPG, PNG, WebP ou GIF." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 1. Se Cloudinary gratuito estiver configurado (recomendado para Vercel), envia direto para a nuvem
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      const timestamp = Math.floor(Date.now() / 1000);
      const folder = "herdeiros-de-deus";
      const signaturePayload = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto
        .createHash("sha1")
        .update(signaturePayload)
        .digest("hex");

      const cloudForm = new FormData();
      cloudForm.append(
        "file",
        `data:${file.type || "image/png"};base64,${buffer.toString("base64")}`
      );
      cloudForm.append("api_key", apiKey);
      cloudForm.append("timestamp", String(timestamp));
      cloudForm.append("folder", folder);
      cloudForm.append("signature", signature);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: cloudForm }
      );
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.secure_url) {
        return NextResponse.json(
          { error: "Falha ao enviar imagem ao Cloudinary." },
          { status: 502 }
        );
      }

      return NextResponse.json({
        url: uploadData.secure_url,
        storage: "cloudinary",
      });
    }

    // 2. Fallback local: salva em /public/uploads para uso local imediato
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    const filename = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
    await fs.writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({
      url: `/uploads/${filename}`,
      storage: "local",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error:
          "Não foi possível salvar o arquivo no disco (em produção gratuita, configure as variáveis do Cloudinary ou cole a URL da imagem).",
      },
      { status: 500 }
    );
  }
}

