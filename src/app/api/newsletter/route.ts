import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { ensureDatabaseReady } from "@/db/bootstrap";
import { requireRole } from "@/lib/auth";

const subSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome."),
  email: z.string().trim().email("Informe um e-mail válido."),
});

export async function GET() {
  const admin = await requireRole(["ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito ao Admin." }, { status: 403 });
  }

  const subscribers = await db
    .select()
    .from(schema.newsletterSubscribers)
    .orderBy(desc(schema.newsletterSubscribers.createdAt));

  return NextResponse.json({ subscribers });
}

export async function POST(req: NextRequest) {
  try {
    await ensureDatabaseReady();
    const body = await req.json();
    const parsed = subSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dados inválidos." },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase();
    const existing = await db
      .select({ id: schema.newsletterSubscribers.id })
      .from(schema.newsletterSubscribers)
      .where(eq(schema.newsletterSubscribers.email, email))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({
        ok: true,
        message: "Você já está inscrito para receber nossas novidades!",
      });
    }

    await db.insert(schema.newsletterSubscribers).values({
      id: crypto.randomUUID(),
      name: parsed.data.name,
      email,
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        ok: true,
        message: "Inscrição confirmada! Você receberá as novidades da igreja.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/newsletter error:", error);
    return NextResponse.json(
      { error: "Erro ao realizar inscrição." },
      { status: 500 }
    );
  }
}

