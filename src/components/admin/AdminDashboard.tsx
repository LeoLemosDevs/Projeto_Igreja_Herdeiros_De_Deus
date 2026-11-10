"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Mail,
  Music,
  Newspaper,
  ShieldCheck,
  Users,
} from "lucide-react";
import { AdminFeedTab, type AdminFeedPost } from "@/components/admin/AdminFeedTab";
import {
  AdminSchedulesTab,
  type AdminScheduleItem,
} from "@/components/admin/AdminSchedulesTab";
import {
  AdminUsersTab,
  type AdminUserItem,
} from "@/components/admin/AdminUsersTab";
import {
  AdminInboxTab,
  type AdminContactMessage,
  type AdminSubscriber,
} from "@/components/admin/AdminInboxTab";

interface AdminDashboardProps {
  currentAdminId: string;
  stats: {
    postsCount: number;
    coursesCount: number;
    usersCount: number;
    unreadMessagesCount: number;
  };
  posts: AdminFeedPost[];
  schedules: AdminScheduleItem[];
  users: AdminUserItem[];
  messages: AdminContactMessage[];
  subscribers: AdminSubscriber[];
}

export function AdminDashboard({
  currentAdminId,
  stats,
  posts,
  schedules,
  users,
  messages,
  subscribers,
}: AdminDashboardProps) {
  const [tab, setTab] = useState<"feed" | "schedules" | "users" | "inbox">(
    "feed"
  );

  return (
    <div className="min-h-[85vh] bg-[#f8f9fa]">
      {/* Header Admin */}
      <div className="bg-[#243e4f] py-8 text-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#fbab00] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#182b38]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Administração Principal
              </span>
              <h1 className="heading-font mt-2 text-2xl font-extrabold sm:text-3xl">
                Painel de Controle — Igreja Bíblica Herdeiros de Deus
              </h1>
            </div>

            <Link
              href="/painel/cursos"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#f7941d] px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow transition hover:bg-[#df7d09]"
            >
              <Music className="h-4 w-4" />
              Gerenciar Cursos (Kiwify)
            </Link>
          </div>

          {/* Metricas */}
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-xl bg-[#182b38] p-4 border border-white/10">
              <span className="text-xs font-semibold text-slate-300">
                Publicações no Feed
              </span>
              <p className="mt-1 text-2xl font-extrabold text-[#fcaf3d]">
                {stats.postsCount}
              </p>
            </div>
            <div className="rounded-xl bg-[#182b38] p-4 border border-white/10">
              <span className="text-xs font-semibold text-slate-300">
                Cursos de Música
              </span>
              <p className="mt-1 text-2xl font-extrabold text-[#fcaf3d]">
                {stats.coursesCount}
              </p>
            </div>
            <div className="rounded-xl bg-[#182b38] p-4 border border-white/10">
              <span className="text-xs font-semibold text-slate-300">
                Usuários Cadastrados
              </span>
              <p className="mt-1 text-2xl font-extrabold text-[#fcaf3d]">
                {stats.usersCount}
              </p>
            </div>
            <div className="rounded-xl bg-[#182b38] p-4 border border-white/10">
              <span className="text-xs font-semibold text-slate-300">
                Contatos Não Lidos
              </span>
              <p className="mt-1 text-2xl font-extrabold text-[#fcaf3d]">
                {stats.unreadMessagesCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-2 px-4 sm:gap-6 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setTab("feed")}
            className={`inline-flex items-center gap-2 border-b-2 py-3.5 text-sm font-bold transition ${
              tab === "feed"
                ? "border-[#f7941d] text-[#243e4f]"
                : "border-transparent text-slate-500 hover:text-[#243e4f]"
            }`}
          >
            <Newspaper className="h-4 w-4 text-[#f7941d]" />
            Feed de Publicações
          </button>

          <button
            type="button"
            onClick={() => setTab("schedules")}
            className={`inline-flex items-center gap-2 border-b-2 py-3.5 text-sm font-bold transition ${
              tab === "schedules"
                ? "border-[#f7941d] text-[#243e4f]"
                : "border-transparent text-slate-500 hover:text-[#243e4f]"
            }`}
          >
            <Calendar className="h-4 w-4 text-[#f7941d]" />
            Programação de Cultos
          </button>

          <button
            type="button"
            onClick={() => setTab("users")}
            className={`inline-flex items-center gap-2 border-b-2 py-3.5 text-sm font-bold transition ${
              tab === "users"
                ? "border-[#f7941d] text-[#243e4f]"
                : "border-transparent text-slate-500 hover:text-[#243e4f]"
            }`}
          >
            <Users className="h-4 w-4 text-[#f7941d]" />
            Usuários & Professores
          </button>

          <button
            type="button"
            onClick={() => setTab("inbox")}
            className={`inline-flex items-center gap-2 border-b-2 py-3.5 text-sm font-bold transition ${
              tab === "inbox"
                ? "border-[#f7941d] text-[#243e4f]"
                : "border-transparent text-slate-500 hover:text-[#243e4f]"
            }`}
          >
            <Mail className="h-4 w-4 text-[#f7941d]" />
            Contatos & Newsletter ({stats.unreadMessagesCount} novas)
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {tab === "feed" && <AdminFeedTab initialPosts={posts} />}
        {tab === "schedules" && (
          <AdminSchedulesTab initialSchedules={schedules} />
        )}
        {tab === "users" && (
          <AdminUsersTab
            initialUsers={users}
            currentAdminId={currentAdminId}
          />
        )}
        {tab === "inbox" && (
          <AdminInboxTab
            initialMessages={messages}
            subscribers={subscribers}
          />
        )}
      </div>
    </div>
  );
}

