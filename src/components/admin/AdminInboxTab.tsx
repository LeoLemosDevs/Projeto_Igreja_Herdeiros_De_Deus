"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Trash2 } from "lucide-react";
import { formatDatePtBr } from "@/lib/utils";
import type { ContactStatus } from "@/db/schema";

export interface AdminContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt: Date | number | string;
}

export interface AdminSubscriber {
  id: string;
  name: string;
  email: string;
  createdAt: Date | number | string;
}

export function AdminInboxTab({
  initialMessages,
  subscribers,
}: {
  initialMessages: AdminContactMessage[];
  subscribers: AdminSubscriber[];
}) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);

  async function updateStatus(id: string, status: ContactStatus) {
    const res = await fetch(`/api/contact/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status } : m))
      );
      router.refresh();
    }
  }

  async function deleteMessage(id: string) {
    if (!confirm("Remover esta mensagem?")) return;
    const res = await fetch(`/api/contact/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      router.refresh();
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="space-y-4 lg:col-span-8">
        <h2 className="heading-font text-xl font-extrabold text-[#243e4f]">
          Mensagens de Contato & Pedidos de Oração
        </h2>

        {messages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
            Nenhuma mensagem recebida ainda.
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase ${
                      msg.status === "NOVA"
                        ? "bg-orange-100 text-[#f7941d]"
                        : msg.status === "LIDA"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {msg.status}
                  </span>
                  <h3 className="mt-1 font-bold text-[#243e4f]">
                    {msg.subject}
                  </h3>
                  <p className="text-xs text-slate-500">
                    De <strong>{msg.name}</strong> ({msg.email})
                    {msg.phone ? ` • ${msg.phone}` : ""} •{" "}
                    {formatDatePtBr(msg.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={msg.status}
                    onChange={(e) =>
                      updateStatus(msg.id, e.target.value as ContactStatus)
                    }
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-[#243e4f]"
                  >
                    <option value="NOVA">Nova</option>
                    <option value="LIDA">Lida</option>
                    <option value="RESPONDIDA">Respondida</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => deleteMessage(msg.id)}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="mt-3 rounded-lg bg-slate-50 p-3.5 text-sm leading-relaxed text-slate-700">
                {msg.message}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="space-y-4 lg:col-span-4">
        <h2 className="heading-font text-xl font-extrabold text-[#243e4f]">
          Inscritos na Newsletter ({subscribers.length})
        </h2>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          {subscribers.length === 0 ? (
            <p className="text-center text-sm text-slate-500">
              Nenhum inscrito ainda.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {subscribers.map((sub) => (
                <li key={sub.id} className="py-2.5 text-sm">
                  <div className="flex items-center gap-2 font-bold text-[#243e4f]">
                    <Mail className="h-3.5 w-3.5 text-[#f7941d]" />
                    {sub.name}
                  </div>
                  <p className="text-xs text-slate-500">{sub.email}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

