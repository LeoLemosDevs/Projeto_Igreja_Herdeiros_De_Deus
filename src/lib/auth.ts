import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import type { UserRole } from "@/db/schema";

const SESSION_COOKIE_NAME = "herdeiros_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 dias

function getJwtSecret(): Uint8Array {
  const secret =
    process.env.JWT_SECRET ||
    "herdeiros-de-deus-local-dev-secret-2026-change-in-prod";
  return new TextEncoder().encode(secret);
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  bio: string | null;
  avatarUrl: string | null;
  phone: string | null;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createSessionToken(
  userId: string,
  role: UserRole
): Promise<string> {
  return new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getJwtSecret());
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, getJwtSecret());
    const userId = payload.sub;
    if (!userId) return null;

    const rows = await db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        role: schema.users.role,
        bio: schema.users.bio,
        avatarUrl: schema.users.avatarUrl,
        phone: schema.users.phone,
        isActive: schema.users.isActive,
      })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    const user = rows[0];
    if (!user || !user.isActive) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
    };
  } catch {
    return null;
  }
}

export async function requireRole(
  allowedRoles: UserRole[]
): Promise<SessionUser | null> {
  const user = await getSessionUser();
  if (!user) return null;
  if (!allowedRoles.includes(user.role)) return null;
  return user;
}

