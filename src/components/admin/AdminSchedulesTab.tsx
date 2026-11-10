"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Edit3, Loader2, MapPin, Plus, Trash2, X } from "lucide-react";

export interface AdminScheduleItem {
  id: string;
  title: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string | null;
  targetAudience: string | null;
  location: string;
  description: string;
  leaderName: string | null;
  highlightTag: string | null;
  sortOrder: number;
  isActive: boolean;
}

const EMPTY_SCHEDULE = {
  id: "",
  title: "",
  dayOfWeek: "Domingo",
  startTime: "18:30",
  endTime: "20:30",
  targetAudience: "Toda a família",
  location: "Templo Principal",
  description: "",
  leaderName: "",
  highlightTag: "",
  sortOrder: 1,
  isActive: true,
};

export function AdminSchedulesTab({
  initialSchedules,
}: {
  initialSchedules: AdminScheduleItem[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialSchedules);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(EMPTY_SCHEDULE);
  const [saving, setSaving] = useState(false);

  async function reload() {
    const res = await fetch("/api/schedules?includeAll=1");
    if (res.ok) {
      const data = await res.json();
      setItems(data.schedules);
    }
    router.refresh();
  }

  function openNew() {
    setForm({ ...EMPTY_SCHEDULE, sortOrder: items.length + 1 });
    setEditing(true);
  }

  function openEdit(item: AdminScheduleItem) {
    setForm({
      id: item.id,
      title: item.title,
      dayOfWeek: item.dayOfWeek,
      startTime: item.startTime,
      endTime: item.endTime || "",
      targetAudience: item.targetAudience || "",
      location: item.location,
      description: item.description,
      leaderName: item.leaderName || "",
      highlightTag: item.highlightTag || "",
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    setEditing(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title: form.title,
      dayOfWeek: form.dayOfWeek,
      startTime: form.startTime,
      endTime: form.endTime || null,
      targetAudience: form.targetAudience || null,
      location: form.location,
      description: form.description,
      leaderName: form.leaderName || null,
      highlightTag: form.highlightTag || null,
      sortOrder: Number(form.sortOrder) || 1,
      isActive: form.isActive,
    };

    const url = form.id ? `/api/schedules/${form.id}` : "/api/schedules";
    const method = form.id ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (res.ok) {
      setEditing(false);
      await reload();
    } else {
      alert("Erro ao salvar culto.");
    }
  }

  async function handleDelete(item: AdminScheduleItem) {
    if (!confirm(`Excluir o culto "${item.title}"?`)) return;
    await fetch(`/api/schedules/${item.id}`, { method: "DELETE" });
    await reload();
  }

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="heading-font text-xl font-extrabold text-[#243e4f]">
            Programação Semanal dos Cultos
          </h2>
          <p className="text-sm text-[#5a6672]">
            Defina os dias, horários e a explicação de cada reunião exibida na Home e em Programação.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-full bg-[#f7941d] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white hover:bg-[#df7d09]"
        >
          <Plus className="h-4 w-4" />
          Adicionar Culto
        </button>
      </div>

      {editing && (
        <form
          onSubmit={handleSave}
          className="mb-8 space-y-4 rounded-2xl border-2 border-[#fcaf3d] bg-white p-6 shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-[#243e4f]">
              {form.id ? "Editar Culto" : "Novo Culto na Programação"}
            </h3>
            <button type="button" onClick={() => setEditing(false)}>
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold uppercase text-[#243e4f]">
                Nome do Culto *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-[#243e4f]">
                Dia da Semana *
              </label>
              <select
                value={form.dayOfWeek}
                onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                {[
                  "Domingo",
                  "Segunda-feira",
                  "Terça-feira",
                  "Quarta-feira",
                  "Quinta-feira",
                  "Sexta-feira",
                  "Sábado",
                ].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-[#243e4f]">
                Início *
              </label>
              <input
                type="text"
                required
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                placeholder="18:30"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-[#243e4f]">
                Término
              </label>
              <input
                type="text"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                placeholder="20:30"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-[#243e4f]">
                Local *
              </label>
              <input
                type="text"
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-[#243e4f]">
                Ordem
              </label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm({ ...form, sortOrder: Number(e.target.value) })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-[#243e4f]">
                Público-alvo
              </label>
              <input
                type="text"
                value={form.targetAudience}
                onChange={(e) =>
                  setForm({ ...form, targetAudience: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-[#243e4f]">
                Etiqueta de Destaque (opcional)
              </label>
              <input
                type="text"
                value={form.highlightTag}
                onChange={(e) =>
                  setForm({ ...form, highlightTag: e.target.value })
                }
                placeholder="Ex.: Espaço Kids Disponível"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-[#243e4f]">
              Explicação sobre este Culto *
            </label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditing(false)}
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
              Salvar Culto
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-full bg-[#243e4f] px-3 py-0.5 text-xs font-bold text-[#fcaf3d]">
                  {item.dayOfWeek}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#f7941d]">
                  <Clock className="h-3.5 w-3.5" />
                  {item.startTime}
                  {item.endTime ? ` - ${item.endTime}` : ""}
                </span>
              </div>
              <h3 className="font-bold text-[#243e4f]">{item.title}</h3>
              <p className="mt-1.5 text-sm text-[#5a6672]">{item.description}</p>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="h-3.5 w-3.5 text-[#f7941d]" />
                {item.location}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1 text-xs font-bold text-[#243e4f] hover:border-[#f7941d]"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  className="rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

