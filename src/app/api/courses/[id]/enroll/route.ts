import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "Faça login para se matricular no curso." },
      { status: 401 }
    );
  }

  const { id: courseId } = await context.params;
  const existing = await db
    .select({ id: schema.courseEnrollments.id })
    .from(schema.courseEnrollments)
    .where(
      and(
        eq(schema.courseEnrollments.courseId, courseId),
        eq(schema.courseEnrollments.studentId, user.id)
      )
    )
    .limit(1);

  const now = new Date();
  if (existing.length > 0) {
    await db
      .update(schema.courseEnrollments)
      .set({ lastAccessedAt: now })
      .where(eq(schema.courseEnrollments.id, existing[0].id));
    return NextResponse.json({ id: existing[0].id, alreadyEnrolled: true });
  }

  const id = crypto.randomUUID();
  await db.insert(schema.courseEnrollments).values({
    id,
    courseId,
    studentId: user.id,
    enrolledAt: now,
    lastAccessedAt: now,
  });

  return NextResponse.json({ id }, { status: 201 });
}

