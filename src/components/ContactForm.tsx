"use client";

import { useState } from "react";
import { Send, CheckCircle2, Loader2 } from "lucide-react";

const SUBJECT_PRESETS = [
  "Pedido de Oração",
  "Primeira Visita à Igreja",
  "Informações sobre Escola de Música",
  "Aconselhamento Pastoral",
  "Ação Social e Doações",
  "Eventos e Programação",
  "Outro Assunto",
];

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState(SUBJECT_PRESETS[0]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({
          type: "error",
          text: data.error || "Não foi possível enviar sua mensagem.",
        });
      } else {
        setStatus({ type: "success", text: data.message });
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
      }
    } catch {
      setStatus({
        type: "error",
        text: "Erro de conexão ao enviar mensagem. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#243e4f]">
            Nome Completo *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-[#f7941d] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#243e4f]">
            E-mail *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seuemail@exemplo.com"
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-[#f7941d] focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#243e4f]">
            Telefone / WhatsApp
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(11) 99999-9999"
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-[#f7941d] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#243e4f]">
            Assunto *
          </label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-[#f7941d] focus:outline-none"
          >
            {SUBJECT_PRESETS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#243e4f]">
          Mensagem *
        </label>
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escreva aqui sua mensagem, dúvida ou pedido de oração..."
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-[#f7941d] focus:outline-none"
        />
      </div>

      {status && (
        <div
          className={`flex items-center gap-2 rounded-lg p-3.5 text-sm font-medium ${
            status.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {status.type === "success" && <CheckCircle2 className="h-5 w-5 shrink-0" />}
          {status.text}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#f7941d] px-6 py-3.5 text-sm font-extrabold uppercase tracking-wider text-white shadow transition hover:bg-[#df7d09] disabled:opacity-60 sm:w-auto"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        Enviar Mensagem
      </button>
    </form>
  );
}

