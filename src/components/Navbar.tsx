"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Music,
  ShieldCheck,
  UserPlus,
  X,
  Phone,
} from "lucide-react";
import type { SessionUser } from "@/lib/auth";

interface NavbarProps {
  user: SessionUser | null;
}

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/feed", label: "Feed & Eventos" },
  { href: "/programacao", label: "Programação" },
  { href: "/cursos", label: "Cursos de Música" },
  { href: "/sobre", label: "Sobre a Igreja" },
  { href: "/contato", label: "Contato" },
];

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMobileOpen(false);
    setMegaOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="relative z-40 bg-white shadow-sm">
      {/* Topo Institucional (inspirado na navbar-topo do vitoriaemcristo.org) */}
      <div className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/img/logo_transparente_300p.png"
              alt="Igreja Bíblica Herdeiros de Deus"
              className="h-14 w-14 object-contain sm:h-16 sm:w-16"
            />
            <div className="leading-tight">
              <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-[#f7941d]">
                Igreja Bíblica
              </span>
              <span className="heading-font block text-base font-extrabold tracking-tight text-[#243e4f] sm:text-lg">
                Herdeiros de Deus
              </span>
            </div>
          </Link>

          {/* Desktop Utility Controls */}
          <div className="hidden items-center gap-4 lg:flex">
            <div className="flex items-center gap-2 border-r border-slate-200 pr-4 text-slate-500">
              <a
                href="https://wa.me/5585999999999"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="rounded-full p-1.5 transition hover:bg-orange-50 hover:text-[#f7941d]"
              >
                <Phone className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="rounded-full p-1.5 transition hover:bg-orange-50 hover:text-[#f7941d]"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="rounded-full p-1.5 transition hover:bg-orange-50 hover:text-[#f7941d]"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="rounded-full p-1.5 transition hover:bg-orange-50 hover:text-[#f7941d]"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/cursos"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#243e4f] transition hover:text-[#f7941d]"
                >
                  <GraduationCap className="h-4 w-4 text-[#f7941d]" />
                  Área de Cursos
                </Link>

                {(user.role === "TEACHER" || user.role === "ADMIN") && (
                  <Link
                    href="/painel/cursos"
                    className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-[#243e4f] transition hover:bg-[#243e4f] hover:text-white"
                  >
                    <Music className="h-3.5 w-3.5 text-[#f7941d]" />
                    Estúdio Cursos
                  </Link>
                )}

                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#243e4f] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#182b38]"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-[#fcaf3d]" />
                    Painel Admin
                  </Link>
                )}

                <span className="text-xs text-slate-500">
                  Olá, <strong className="text-[#243e4f]">{user.name.split(" ")[0]}</strong>
                </span>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sair
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-[#243e4f] transition hover:border-[#f7941d] hover:text-[#f7941d]"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Área de Membros
                </Link>
                <Link
                  href="/cadastro"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#f7941d] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#df7d09]"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Criar Conta Grátis
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Abrir menu"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-[#243e4f] lg:hidden"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Barra Secundaria com Mega Menu (inspirada na navbar mid) */}
      <nav className="sticky top-0 hidden border-b border-slate-200 bg-[#f8f9fa] lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <button
              type="button"
              onClick={() => setMegaOpen(!megaOpen)}
              className="flex items-center gap-2.5 border-r border-slate-200 py-3.5 pr-6 text-sm font-bold uppercase tracking-wide text-[#243e4f] transition hover:text-[#f7941d]"
            >
              <span className="flex flex-col gap-1">
                <span className="block h-0.5 w-5 bg-[#f7941d]" />
                <span className="block h-0.5 w-4 bg-[#243e4f]" />
                <span className="block h-0.5 w-5 bg-[#f7941d]" />
              </span>
              Menu
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  megaOpen ? "rotate-180 text-[#f7941d]" : ""
                }`}
              />
            </button>

            {megaOpen && (
              <div
                onMouseLeave={() => setMegaOpen(false)}
                className="absolute left-0 top-full z-50 w-[760px] rounded-b-xl border border-slate-200 bg-white p-6 shadow-2xl"
              >
                <div className="grid grid-cols-4 gap-6">
                  <div>
                    <h4 className="mb-3 border-l-4 border-[#fcaf3d] pl-2 text-xs font-extrabold uppercase tracking-wider text-[#243e4f]">
                      Acesso Rápido
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li>
                        <Link href="/feed" onClick={() => setMegaOpen(false)} className="hover:text-[#f7941d]">
                          Feed de Eventos
                        </Link>
                      </li>
                      <li>
                        <Link href="/programacao" onClick={() => setMegaOpen(false)} className="hover:text-[#f7941d]">
                          Dias de Culto
                        </Link>
                      </li>
                      <li>
                        <Link href="/cursos" onClick={() => setMegaOpen(false)} className="hover:text-[#f7941d]">
                          Acervo de Cursos
                        </Link>
                      </li>
                      <li>
                        <Link href="/contato" onClick={() => setMegaOpen(false)} className="hover:text-[#f7941d]">
                          Pedidos de Oração
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="mb-3 border-l-4 border-[#fcaf3d] pl-2 text-xs font-extrabold uppercase tracking-wider text-[#243e4f]">
                      Sobre a Igreja
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li>
                        <Link href="/sobre" onClick={() => setMegaOpen(false)} className="hover:text-[#f7941d]">
                          Nossa História
                        </Link>
                      </li>
                      <li>
                        <Link href="/sobre#fe" onClick={() => setMegaOpen(false)} className="hover:text-[#f7941d]">
                          Declaração de Fé
                        </Link>
                      </li>
                      <li>
                        <Link href="/sobre#valores" onClick={() => setMegaOpen(false)} className="hover:text-[#f7941d]">
                          Missão e Valores
                        </Link>
                      </li>
                      <li>
                        <Link href="/contato" onClick={() => setMegaOpen(false)} className="hover:text-[#f7941d]">
                          Fale Conosco
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="mb-3 border-l-4 border-[#fcaf3d] pl-2 text-xs font-extrabold uppercase tracking-wider text-[#243e4f]">
                      Escola de Música
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li>
                        <Link href="/cursos" onClick={() => setMegaOpen(false)} className="hover:text-[#f7941d]">
                          Todos os Cursos
                        </Link>
                      </li>
                      <li>
                        <Link href="/login" onClick={() => setMegaOpen(false)} className="hover:text-[#f7941d]">
                          Portal do Aluno
                        </Link>
                      </li>
                      <li>
                        <Link href="/painel/cursos" onClick={() => setMegaOpen(false)} className="hover:text-[#f7941d]">
                          Área do Professor
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="mb-3 border-l-4 border-[#fcaf3d] pl-2 text-xs font-extrabold uppercase tracking-wider text-[#243e4f]">
                      Administração
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li>
                        <Link href="/admin" onClick={() => setMegaOpen(false)} className="inline-flex items-center gap-1.5 hover:text-[#f7941d]">
                          <LayoutDashboard className="h-3.5 w-3.5" />
                          Painel Principal
                        </Link>
                      </li>
                      <li>
                        <Link href="/login" onClick={() => setMegaOpen(false)} className="hover:text-[#f7941d]">
                          Entrar na Conta
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`block border-b-2 px-4 py-3.5 text-sm font-semibold transition ${
                      active
                        ? "border-[#f7941d] text-[#f7941d]"
                        : "border-transparent text-[#243e4f] hover:border-[#fcaf3d] hover:text-[#f7941d]"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 pb-5 pt-3 lg:hidden">
          <div className="space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-lg px-3 py-2.5 text-sm font-semibold ${
                  pathname === link.href
                    ? "bg-orange-50 text-[#f7941d]"
                    : "text-[#243e4f] hover:bg-slate-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4">
            {user ? (
              <div className="space-y-2">
                <p className="px-2 text-xs text-slate-500">
                  Conectado como <strong>{user.name}</strong>
                </p>
                {(user.role === "TEACHER" || user.role === "ADMIN") && (
                  <Link
                    href="/painel/cursos"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-[#243e4f]"
                  >
                    Estúdio de Cursos (Professor)
                  </Link>
                )}
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg bg-[#243e4f] px-3 py-2 text-sm font-bold text-white"
                  >
                    Painel Administrativo
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full rounded-lg border border-red-200 px-3 py-2 text-left text-sm font-semibold text-red-600"
                >
                  Sair da Conta
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg border border-slate-200 py-2.5 text-center text-sm font-bold text-[#243e4f]"
                >
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg bg-[#f7941d] py-2.5 text-center text-sm font-bold text-white"
                >
                  Criar Conta
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
