"use client";

import { useState } from "react";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";

export function NewsletterBanner() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", text: data.error || "Erro ao cadastrar." });
      } else {
        setFeedback({ type: "success", text: data.message });
        setName("");
        setEmail("");
      }
    } catch {
      setFeedback({
        type: "error",
        text: "Falha de conexão. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative overflow-hidden bg-[#243e4f] py-12 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, #fcaf3d 0%, transparent 45%), radial-gradient(circle at 85% 30%, #f7941d 0%, transparent 40%)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <div className="mb-1 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#fcaf3d]">
              <Mail className="h-4 w-4" />
              Informativo Semanal
            </div>
            <h2 className="heading-font text-2xl font-extrabold uppercase tracking-tight">
              Receba Nossas Novidades
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              Fique por dentro da programação de cultos, eventos especiais e novos
              cursos gratuitos da nossa Escola de Música.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto"
          >
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              className="rounded-md bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#fcaf3d] sm:w-52"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu melhor e-mail"
              className="rounded-md bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#fcaf3d] sm:w-64"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#f7941d] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow transition hover:bg-[#df7d09] disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Inscrever-se"
              )}
            </button>
          </form>
        </div>

        {feedback && (
          <div
            className={`mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
              feedback.type === "success"
                ? "bg-emerald-500/20 text-emerald-200"
                : "bg-red-500/20 text-red-200"
            }`}
          >
            {feedback.type === "success" && <CheckCircle2 className="h-4 w-4" />}
            {feedback.text}
          </div>
        )}
      </div>
    </section>
  );
}

