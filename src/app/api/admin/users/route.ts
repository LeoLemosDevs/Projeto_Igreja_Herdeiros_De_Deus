import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { userRoles } from "@/db/schema";
import { hashPassword, requireRole } from "@/lib/auth";

const createUserSchema = z.object({
  name: z.string().trim().min(3, "Nome obrigatório."),
  email: z.string().trim().email("E-mail inválido."),
  password: z.string().min(6, "Senha mínima de 6 caracteres."),
  role: z.enum(userRoles).default("TEACHER"),
  bio: z.string().trim().optional().nullable(),
  phone: z.string().trim().optional().nullable(),
});

export async function GET() {
  const admin = await requireRole(["ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito ao Admin." }, { status: 403 });
  }

  const users = await db
    .select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      role: schema.users.role,
      bio: schema.users.bio,
      phone: schema.users.phone,
      isActive: schema.users.isActive,
      createdAt: schema.users.createdAt,
    })
    .from(schema.users)
    .orderBy(desc(schema.users.createdAt));

  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const admin = await requireRole(["ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito ao Admin." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Dados inválidos." },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const email = d.email.toLowerCase();
  const existing = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json(
      { error: "Já existe um usuário com este e-mail." },
      { status: 409 }
    );
  }

  const now = new Date();
  const id = crypto.randomUUID();
  await db.insert(schema.users).values({
    id,
    name: d.name,
    email,
    passwordHash: await hashPassword(d.password),
    role: d.role,
    bio: d.bio || null,
    phone: d.phone || null,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({ id }, { status: 201 });
}

