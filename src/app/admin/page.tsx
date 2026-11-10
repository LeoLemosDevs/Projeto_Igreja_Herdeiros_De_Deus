import Link from "next/link";
import { redirect } from "next/navigation";
import { asc, desc } from "drizzle-orm";
import { ShieldAlert } from "lucide-react";
import { db, schema } from "@/db";
import { getSessionUser } from "@/lib/auth";
import { safeJsonParseArray } from "@/lib/utils";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/admin");
  }

  if (user.role !== "ADMIN") {
    return (
      <div className="bg-[#f8f9fa] px-4 py-20">
        <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <ShieldAlert className="mx-auto mb-3 h-12 w-12 text-[#f7941d]" />
          <h1 className="heading-font text-xl font-extrabold text-[#243e4f]">
            Acesso Restrito ao Administrador Principal
          </h1>
          <p className="mt-2 text-sm text-[#5a6672]">
            Você está autenticado como <strong>{user.role}</strong>. Apenas o
            Administrador Principal pode acessar o painel geral da igreja.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-full bg-[#243e4f] px-6 py-2.5 text-xs font-extrabold uppercase text-white"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  const [postsRows, coursesRows, schedulesRows, usersRows, messagesRows, subsRows] =
    await Promise.all([
      db
        .select()
        .from(schema.feedPosts)
        .orderBy(desc(schema.feedPosts.createdAt)),
      db.select({ id: schema.courses.id }).from(schema.courses),
      db
        .select()
        .from(schema.worshipSchedules)
        .orderBy(asc(schema.worshipSchedules.sortOrder)),
      db
        .select({
          id: schema.users.id,
          name: schema.users.name,
          email: schema.users.email,
          role: schema.users.role,
          phone: schema.users.phone,
          isActive: schema.users.isActive,
          createdAt: schema.users.createdAt,
        })
        .from(schema.users)
        .orderBy(desc(schema.users.createdAt)),
      db
        .select()
        .from(schema.contactMessages)
        .orderBy(desc(schema.contactMessages.createdAt)),
      db
        .select()
        .from(schema.newsletterSubscribers)
        .orderBy(desc(schema.newsletterSubscribers.createdAt)),
    ]);

  const posts = postsRows.map((p) => ({
    ...p,
    mediaGallery: safeJsonParseArray(p.mediaGallery),
  }));

  const unreadMessagesCount = messagesRows.filter(
    (m) => m.status === "NOVA"
  ).length;

  return (
    <AdminDashboard
      currentAdminId={user.id}
      stats={{
        postsCount: posts.length,
        coursesCount: coursesRows.length,
        usersCount: usersRows.length,
        unreadMessagesCount,
      }}
      posts={posts}
      schedules={schedulesRows}
      users={usersRows}
      messages={messagesRows}
      subscribers={subsRows}
    />
  );
}

