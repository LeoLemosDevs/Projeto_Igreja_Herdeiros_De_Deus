import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { ensureDatabaseReady } from "@/db/bootstrap";
import {
  createSessionToken,
  hashPassword,
  setSessionCookie,
} from "@/lib/auth";

const registerSchema = z.object({
  name: z.string().trim().min(3, "Informe seu nome completo (mín. 3 letras)."),
  email: z.string().trim().email("Informe um e-mail válido."),
  phone: z.string().trim().optional(),
  password: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres."),
});

export async function POST(req: NextRequest) {
  try {
    await ensureDatabaseReady();
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dados inválidos." },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase();
    const existing = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Já existe uma conta cadastrada com este e-mail." },
        { status: 409 }
      );
    }

    const now = new Date();
    const id = crypto.randomUUID();
    const passwordHash = await hashPassword(parsed.data.password);

    // Registro publico sempre cria conta de Aluno/Membro por seguranca.
    // Professores sao promovidos ou criados pelo Administrador Principal.
    await db.insert(schema.users).values({
      id,
      name: parsed.data.name,
      email,
      phone: parsed.data.phone || null,
      passwordHash,
      role: "STUDENT",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    const token = await createSessionToken(id, "STUDENT");
    await setSessionCookie(token);

    return NextResponse.json(
      {
        user: {
          id,
          name: parsed.data.name,
          email,
          role: "STUDENT",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar conta." },
      { status: 500 }
    );
  }
}

