import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Compass, Eye, Heart, Music, ShieldCheck } from "lucide-react";
import { SectionTitle } from "@/components/SectionTitle";

export const metadata: Metadata = {
  title: "Sobre a Igreja",
  description:
    "Conheça a história, missão, visão, valores e declaração de fé da Igreja Bíblica Herdeiros de Deus.",
};

const TIMELINE = [
  {
    year: "Fundação",
    title: "O Início em Pequenos Grupos nos Lares",
    text: "A Igreja Bíblica Herdeiros de Deus iniciou com reuniões familiares de oração e estudo expositivo da Palavra, movidas pelo desejo de viver o cristianismo bíblico com simplicidade e fervor.",
  },
  {
    year: "Consolidação",
    title: "Inauguração do Templo Sede e Ministérios",
    text: "Com o crescimento de famílias alcançadas pelo Evangelho, estabelecemos nosso templo sede e estruturamos os ministérios de Ensino Bíblico, Ação Social, Jovens e Intercessão.",
  },
  {
    year: "Expansão",
    title: "Escola de Música e Portal Digital",
    text: "Hoje unimos a comunhão presencial com ferramentas digitais gratuitas — oferecendo nosso acervo online de cursos de música para capacitar novos levitas e membros.",
  },
];

const FAITH_POINTS = [
  "A plena inspiração, inerrância e autoridade suprema das 66 Escrituras Sagradas (Antigo e Novo Testamento).",
  "Um único Deus eternamente subsistente em três pessoas: Pai, Filho e Espírito Santo.",
  "A salvação pela graça mediante a fé em Jesus Cristo, Seu sacrifício vicário na cruz e Sua ressurreição corporal.",
  "O batismo nas águas por imersão e a celebração contínua da Santa Ceia em memória do Senhor.",
  "O sacerdócio de todo crente, a formação de discípulos e o serviço amoroso à igreja e à comunidade.",
];

export default function SobrePage() {
  return (
    <div>
      {/* Header Banner */}
      <section className="relative overflow-hidden bg-[#243e4f] py-16 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage: "url('/images/sobre-igreja.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#f7941d] px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-white">
            <BookOpen className="h-3.5 w-3.5" />
            Quem Somos
          </span>
          <h1 className="heading-font mt-3 text-3xl font-extrabold uppercase sm:text-4xl lg:text-5xl">
            Igreja Bíblica Herdeiros de Deus
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-200">
            &ldquo;E, se nós somos filhos, somos logo herdeiros também, herdeiros
            de Deus e co-herdeiros com Cristo.&rdquo; — Romanos 8:17
          </p>
        </div>
      </section>

      {/* Nossa Historia */}
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <SectionTitle
                eyebrow="Nossa História"
                title="Uma Caminhada Alicerçada na Palavra"
              />
              <div className="space-y-4 text-base leading-relaxed text-[#5a6672]">
                <p>
                  A <strong>Igreja Bíblica Herdeiros de Deus</strong> nasceu do
                  chamado divino para levantar uma comunidade cristã centrada nas
                  Escrituras, acolhedora com os que sofrem e comprometida em
                  anunciar o Evangelho completo da salvação em Cristo Jesus.
                </p>
                <p>
                  Desde os primeiros encontros em lares até os cultos no templo
                  sede, nosso foco permanece inalterado: ensinar a Bíblia com
                  fidelidade, promover a restauração das famílias, apoiar projetos
                  sociais no bairro e capacitar os dons de cada membro — inclusive
                  por meio da nossa Escola de Música gratuita.
                </p>
                <p>
                  Acreditamos que cada pessoa que chega até nós possui um
                  propósito eterno em Deus e pode crescer espiritualmente através
                  da comunhão, da oração e do serviço cristão.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-6">
              <img
                src="/images/sobre-igreja.jpg"
                alt="Templo da Igreja"
                className="aspect-[4/5] w-full rounded-2xl object-cover shadow-lg"
              />
              <img
                src="/images/hero-comunidade.jpg"
                alt="Comunhão na Igreja"
                className="aspect-[4/5] w-full rounded-2xl object-cover shadow-lg sm:mt-8"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Missao, Visao e Valores */}
      <section id="valores" className="border-y border-slate-200 bg-[#f8f9fa] py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Identidade Ministerial"
            title="Missão, Visão e Valores"
          />

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="mb-4 inline-flex rounded-xl bg-orange-50 p-3 text-[#f7941d]">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="heading-font text-xl font-bold text-[#243e4f]">
                Missão
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5a6672]">
                Proclamar o Evangelho de Cristo com clareza bíblica, fazer
                discípulos maduros e servir às famílias e à sociedade com amor
                prático.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="mb-4 inline-flex rounded-xl bg-orange-50 p-3 text-[#f7941d]">
                <Eye className="h-6 w-6" />
              </div>
              <h3 className="heading-font text-xl font-bold text-[#243e4f]">
                Visão
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5a6672]">
                Ser uma igreja relevante, biblicamente saudável e acolhedora,
                onde cada crente descobre seu chamado e serve com alegria no
                Reino de Deus.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="mb-4 inline-flex rounded-xl bg-orange-50 p-3 text-[#f7941d]">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="heading-font text-xl font-bold text-[#243e4f]">
                Valores
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5a6672]">
                Fidelidade às Escrituras, vida de oração, integridade moral,
                adoração verdadeira, cuidado familiar e generosidade cristã.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Linha do Tempo */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Trajetória" title="Marcos da Nossa Jornada" />
          <div className="grid gap-6 md:grid-cols-3">
            {TIMELINE.map((step) => (
              <div
                key={step.year}
                className="rounded-2xl border border-slate-200 bg-[#f8f9fa] p-6"
              >
                <span className="inline-block rounded-full bg-[#243e4f] px-3 py-1 text-xs font-extrabold uppercase text-[#fcaf3d]">
                  {step.year}
                </span>
                <h3 className="heading-font mt-3 text-lg font-bold text-[#243e4f]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5a6672]">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Declaracao de Fe */}
      <section id="fe" className="bg-[#182b38] py-14 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Doutrina Bíblica"
            title="Em Que Cremos"
            light
          />
          <div className="grid gap-4 md:grid-cols-2">
            {FAITH_POINTS.map((point, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#243e4f] p-5"
              >
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#fcaf3d]" />
                <p className="text-sm leading-relaxed text-slate-200">{point}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#243e4f] p-6">
            <div className="flex items-center gap-3">
              <Music className="h-6 w-6 text-[#fcaf3d]" />
              <p className="text-sm text-slate-200">
                Quer conhecer nossos cultos ou participar da Escola de Música?
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/programacao"
                className="rounded-full bg-[#fbab00] px-5 py-2.5 text-xs font-extrabold uppercase text-[#182b38]"
              >
                Ver Cultos
              </Link>
              <Link
                href="/contato"
                className="rounded-full border border-white/30 px-5 py-2.5 text-xs font-bold uppercase text-white hover:bg-white hover:text-[#243e4f]"
              >
                Falar Conosco
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

