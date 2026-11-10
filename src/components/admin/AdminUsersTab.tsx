"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus, X } from "lucide-react";
import { ROLE_LABELS, formatDatePtBr } from "@/lib/utils";
import type { UserRole } from "@/db/schema";

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  isActive: boolean;
  createdAt: Date | number | string;
}

export function AdminUsersTab({
  initialUsers,
  currentAdminId,
}: {
  initialUsers: AdminUserItem[];
  currentAdminId: string;
}) {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserItem[]>(initialUsers);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("TEACHER");
  const [bio, setBio] = useState("");

  async function reloadUsers() {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
    }
    router.refresh();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role, bio }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Erro ao criar conta.");
      return;
    }

    setShowCreate(false);
    setName("");
    setEmail("");
    setPassword("");
    setBio("");
    await reloadUsers();
  }

  async function changeRole(userId: string, newRole: UserRole) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Não foi possível alterar papel.");
      return;
    }
    await reloadUsers();
  }

  async function toggleActive(u: AdminUserItem) {
    const res = await fetch(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !u.isActive }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Não foi possível atualizar status.");
      return;
    }
    await reloadUsers();
  }

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="heading-font text-xl font-extrabold text-[#243e4f]">
            Contas, Professores de Música e Alunos
          </h2>
          <p className="text-sm text-[#5a6672]">
            Crie contas de Professores ou promova membros cadastrados para publicarem cursos no painel estilo Kiwify.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-full bg-[#f7941d] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white hover:bg-[#df7d09]"
        >
          <UserPlus className="h-4 w-4" />
          Criar Conta de Professor / Usuário
        </button>
      </div>

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="mb-8 space-y-4 rounded-2xl border-2 border-[#fcaf3d] bg-white p-6 shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-[#243e4f]">
              Cadastrar Novo Professor ou Usuário
            </h3>
            <button type="button" onClick={() => setShowCreate(false)}>
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-[#243e4f]">
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-[#243e4f]">
                E-mail *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-[#243e4f]">
                Senha Inicial *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-[#243e4f]">
                Perfil / Permissão *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="TEACHER">Professor(a) de Música</option>
                <option value="STUDENT">Aluno / Membro</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-[#243e4f]">
              Biografia Curta (para Professores)
            </label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ex.: Ministro de louvor, professor de contrabaixo e harmonia"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#f7941d] px-5 py-2 text-sm font-bold text-white"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Cadastrar Usuário
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-extrabold uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Nome</th>
                <th className="px-5 py-3">E-mail</th>
                <th className="px-5 py-3">Papel no Sistema</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Cadastro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-5 py-3.5 font-bold text-[#243e4f]">
                    {u.name}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <select
                      disabled={u.id === currentAdminId}
                      value={u.role}
                      onChange={(e) =>
                        changeRole(u.id, e.target.value as UserRole)
                      }
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-[#243e4f] disabled:opacity-60"
                    >
                      <option value="STUDENT">{ROLE_LABELS.STUDENT}</option>
                      <option value="TEACHER">{ROLE_LABELS.TEACHER}</option>
                      <option value="ADMIN">{ROLE_LABELS.ADMIN}</option>
                    </select>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      type="button"
                      disabled={u.id === currentAdminId}
                      onClick={() => toggleActive(u)}
                      className={`rounded-full px-3 py-1 text-xs font-bold disabled:opacity-50 ${
                        u.isActive
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {u.isActive ? "Ativo" : "Inativo"}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-500">
                    {formatDatePtBr(u.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

