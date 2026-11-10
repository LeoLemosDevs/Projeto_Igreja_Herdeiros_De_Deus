import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { requireRole } from "@/lib/auth";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome."),
  email: z.string().trim().email("Informe um e-mail válido."),
  phone: z.string().trim().optional().nullable(),
  subject: z.string().trim().min(3, "Informe o assunto da mensagem."),
  message: z
    .string()
    .trim()
    .min(10, "Escreva uma mensagem com pelo menos 10 caracteres."),
});

export async function GET() {
  const admin = await requireRole(["ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito ao Admin." }, { status: 403 });
  }

  const messages = await db
    .select()
    .from(schema.contactMessages)
    .orderBy(desc(schema.contactMessages.createdAt));

  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dados inválidos." },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const id = crypto.randomUUID();
    await db.insert(schema.contactMessages).values({
      id,
      name: d.name,
      email: d.email,
      phone: d.phone || null,
      subject: d.subject,
      message: d.message,
      status: "NOVA",
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        id,
        message: "Mensagem recebida! Nossa equipe responderá em breve.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/contact error:", error);
    return NextResponse.json(
      { error: "Erro ao enviar mensagem." },
      { status: 500 }
    );
  }
}

