"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2 } from "lucide-react";

export default function CadastroPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao criar conta.");
        setLoading(false);
        return;
      }

      router.push("/cursos");
      router.refresh();
    } catch {
      setError("Falha de conexão ao criar conta.");
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#f8f9fa] px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-lg sm:p-9">
        <div className="mb-6 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#f7941d] text-white">
            <UserPlus className="h-6 w-6" />
          </span>
          <h1 className="heading-font mt-3 text-2xl font-extrabold text-[#243e4f]">
            Criar Conta Gratuita
          </h1>
          <p className="mt-1 text-sm text-[#5a6672]">
            Cadastre-se para liberar acesso completo ao acervo de Cursos de Música e acompanhar seu progresso.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#243e4f]">
              Nome Completo *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-[#f7941d] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#243e4f]">
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

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#243e4f]">
              WhatsApp (opcional)
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
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#243e4f]">
              Senha (mín. 6 caracteres) *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Crie uma senha segura"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-[#f7941d] focus:outline-none"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#f7941d] py-3 text-sm font-extrabold uppercase tracking-wider text-white shadow transition hover:bg-[#df7d09] disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Criar Conta e Acessar Cursos"
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#5a6672]">
          Já possui cadastro?{" "}
          <Link href="/login" className="font-bold text-[#f7941d] hover:underline">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}

