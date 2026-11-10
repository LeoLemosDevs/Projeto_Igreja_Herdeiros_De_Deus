"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, Loader2, Shield, GraduationCap, Music } from "lucide-react";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Falha ao entrar.");
        setLoading(false);
        return;
      }

      if (nextUrl) {
        router.push(nextUrl);
      } else if (data.user?.role === "ADMIN") {
        router.push("/admin");
      } else if (data.user?.role === "TEACHER") {
        router.push("/painel/cursos");
      } else {
        router.push("/cursos");
      }
      router.refresh();
    } catch {
      setError("Erro de conexão ao realizar login.");
      setLoading(false);
    }
  }

  function fillDemo(demoEmail: string, demoPass: string) {
    setEmail(demoEmail);
    setPassword(demoPass);
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-lg sm:p-9">
        <div className="mb-6 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#243e4f] text-[#fcaf3d]">
            <LogIn className="h-6 w-6" />
          </span>
          <h1 className="heading-font mt-3 text-2xl font-extrabold text-[#243e4f]">
            Entrar no Portal
          </h1>
          <p className="mt-1 text-sm text-[#5a6672]">
            Acesse o acervo de cursos de música, painel de professor ou administração.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#243e4f]">
              E-mail
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
              Senha
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
              "Acessar Conta"
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#5a6672]">
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="font-bold text-[#f7941d] hover:underline">
            Cadastre-se gratuitamente
          </Link>
        </p>

        {/* Atalhos de acesso rapido para ambiente local / demonstracao */}
        <div className="mt-6 border-t border-slate-100 pt-5">
          <p className="mb-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Contas de Demonstração (Seed Local)
          </p>
          <div className="grid gap-2">
            <button
              type="button"
              onClick={() => fillDemo("aluno@herdeirosdedeus.org", "Aluno@2026")}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs transition hover:border-[#f7941d]"
            >
              <span className="flex items-center gap-2 font-bold text-[#243e4f]">
                <GraduationCap className="h-4 w-4 text-[#f7941d]" />
                Aluno (Acervo de Cursos)
              </span>
              <span className="text-slate-500">Preencher</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemo("lucas.musica@herdeirosdedeus.org", "Professor@2026")}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs transition hover:border-[#f7941d]"
            >
              <span className="flex items-center gap-2 font-bold text-[#243e4f]">
                <Music className="h-4 w-4 text-[#f7941d]" />
                Professor de Música (Kiwify Studio)
              </span>
              <span className="text-slate-500">Preencher</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemo("admin@herdeirosdedeus.org", "Admin@2026")}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs transition hover:border-[#f7941d]"
            >
              <span className="flex items-center gap-2 font-bold text-[#243e4f]">
                <Shield className="h-4 w-4 text-[#f7941d]" />
                Admin Principal (Controle Total)
              </span>
              <span className="text-slate-500">Preencher</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="bg-[#f8f9fa] px-4 py-14 sm:py-20">
      <Suspense fallback={<div className="text-center text-sm text-slate-500">Carregando...</div>}>
        <LoginFormInner />
      </Suspense>
    </div>
  );
}

