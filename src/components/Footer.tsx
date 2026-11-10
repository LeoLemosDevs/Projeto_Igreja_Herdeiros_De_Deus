import Link from "next/link";
import { Mail, MapPin, Phone, Clock, Music, HeartHandshake, Navigation } from "lucide-react";
import { CHURCH_INFO } from "@/lib/church-info";

export function Footer() {
  return (
    <footer className="bg-[#243e4f] text-slate-200">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Coluna Marca */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white p-1.5 shadow-md">
                <img
                  src={CHURCH_INFO.logoMedium}
                  alt={CHURCH_INFO.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="leading-tight">
                <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#fcaf3d]">
                  Igreja Bíblica
                </span>
                <span className="heading-font block text-lg font-extrabold text-white">
                  Herdeiros de Deus
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">
              Proclamando as verdades das Sagradas Escrituras, edificando famílias
              em Cristo Jesus e formando adoradores comprometidos com o Reino de
              Deus.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#182b38] px-3 py-1.5 text-xs font-semibold text-[#fcaf3d]">
              <HeartHandshake className="h-4 w-4" />
              Romanos 8:17 — Herdeiros de Deus
            </div>
          </div>

          {/* Conheça */}
          <div>
            <h3 className="mb-4 border-l-4 border-[#fcaf3d] pl-3 text-sm font-extrabold uppercase tracking-wider text-white">
              Conheça
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link href="/sobre" className="transition hover:text-[#fcaf3d]">
                  História da Igreja
                </Link>
              </li>
              <li>
                <Link href="/programacao" className="transition hover:text-[#fcaf3d]">
                  Programação dos Cultos
                </Link>
              </li>
              <li>
                <Link href="/feed" className="transition hover:text-[#fcaf3d]">
                  Feed de Publicações & Eventos
                </Link>
              </li>
              <li>
                <Link href="/contato" className="transition hover:text-[#fcaf3d]">
                  Fale Conosco & Oração
                </Link>
              </li>
            </ul>
          </div>

          {/* Escola de Música */}
          <div>
            <h3 className="mb-4 border-l-4 border-[#fcaf3d] pl-3 text-sm font-extrabold uppercase tracking-wider text-white">
              Escola de Música
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link href="/cursos" className="inline-flex items-center gap-1.5 transition hover:text-[#fcaf3d]">
                  <Music className="h-3.5 w-3.5 text-[#fcaf3d]" />
                  Acervo de Cursos Online
                </Link>
              </li>
              <li>
                <Link href="/cadastro" className="transition hover:text-[#fcaf3d]">
                  Matrícula Gratuita de Alunos
                </Link>
              </li>
              <li>
                <Link href="/painel/cursos" className="transition hover:text-[#fcaf3d]">
                  Estúdio do Professor
                </Link>
              </li>
              <li>
                <Link href="/admin" className="transition hover:text-[#fcaf3d]">
                  Administração Geral
                </Link>
              </li>
            </ul>
          </div>

          {/* Atendimento & Endereço */}
          <div>
            <h3 className="mb-4 border-l-4 border-[#fcaf3d] pl-3 text-sm font-extrabold uppercase tracking-wider text-white">
              Onde Estamos
            </h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#fcaf3d]" />
                <div>
                  <span className="block">
                    {CHURCH_INFO.streetAddress} — {CHURCH_INFO.neighborhood},{" "}
                    {CHURCH_INFO.cityState}
                  </span>
                  <span className="block text-xs font-bold text-[#fcaf3d]">
                    CEP: {CHURCH_INFO.cep}
                  </span>
                  <a
                    href={CHURCH_INFO.googleMapsDirectionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-white underline decoration-[#fcaf3d] underline-offset-4 hover:text-[#fcaf3d]"
                  >
                    <Navigation className="h-3 w-3 text-[#fcaf3d]" />
                    Abrir rota no Google Maps
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-[#fcaf3d]" />
                <span>{CHURCH_INFO.phoneDisplay}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-[#fcaf3d]" />
                <span>{CHURCH_INFO.email}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#fcaf3d]" />
                <span>Domingos às 09h00 e 18h30 • Quartas e Sextas às 19h30</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sub-footer copyright (estilo .copy do vitoriaemcristo.org) */}
      <div className="border-t border-white/10 bg-[#182b38]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-slate-400 sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} Igreja Bíblica Herdeiros de Deus. Todos os direitos reservados.
          </p>
          <p>
            Portal desenvolvido com recursos 100% gratuitos para o avanço do Evangelho.
          </p>
        </div>
      </div>
    </footer>
  );
}

