import type { Metadata } from "next";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { Calendar, Clock, MapPin, Users, Sparkles, ArrowRight } from "lucide-react";
import { db, schema } from "@/db";
import { ensureDatabaseReady } from "@/db/bootstrap";
import { SectionTitle } from "@/components/SectionTitle";
import { ChurchLocationMap } from "@/components/ChurchLocationMap";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Programação dos Cultos",
  description:
    "Confira os dias, horários e o propósito de cada culto semanal na Igreja Bíblica Herdeiros de Deus.",
};

export default async function ProgramacaoPage() {
  await ensureDatabaseReady();
  const schedules = await db
    .select()
    .from(schema.worshipSchedules)
    .where(eq(schema.worshipSchedules.isActive, true))
    .orderBy(asc(schema.worshipSchedules.sortOrder));

  return (
    <div>
      {/* Hero Banner da Pagina */}
      <section className="relative overflow-hidden bg-[#243e4f] py-16 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage: "url('/images/hero-culto.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#f7941d] px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-white">
            <Calendar className="h-3.5 w-3.5" />
            Agenda Semanal
          </span>
          <h1 className="heading-font mt-3 text-3xl font-extrabold uppercase sm:text-4xl lg:text-5xl">
            Programação dos Cultos
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-200">
            Conheça cada reunião semanal da{" "}
            <strong>Igreja Bíblica Herdeiros de Deus</strong>, seus horários e
            como Deus trabalha em cada encontro para edificar sua fé.
          </p>
        </div>
      </section>

      {/* Lista Explicada dos Cultos */}
      <section className="bg-[#f8f9fa] py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Dias e Horários"
            title="Nossos Encontros Semanais"
            subtitle="Você e sua família são sempre muito bem-vindos. Escolha o dia e venha nos visitar!"
          />

          <div className="grid gap-6 md:grid-cols-2">
            {schedules.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#fcaf3d] hover:shadow-md sm:p-7"
              >
                <div>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#243e4f] px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-white">
                        {item.dayOfWeek}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-[#f7941d]">
                        <Clock className="h-3.5 w-3.5" />
                        {item.startTime}
                        {item.endTime ? ` às ${item.endTime}` : ""}
                      </span>
                    </div>

                    {item.highlightTag && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#fcaf3d]/40 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800">
                        <Sparkles className="h-3 w-3 text-[#f7941d]" />
                        {item.highlightTag}
                      </span>
                    )}
                  </div>

                  <h2 className="heading-font text-xl font-extrabold text-[#243e4f]">
                    {item.title}
                  </h2>

                  <p className="mt-3 text-sm leading-relaxed text-[#5a6672] sm:text-base">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 grid gap-2 border-t border-slate-100 pt-4 text-xs text-slate-600 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-[#f7941d]" />
                    <span>{item.location}</span>
                  </div>
                  {item.targetAudience && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 shrink-0 text-[#f7941d]" />
                      <span>{item.targetAudience}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <ChurchLocationMap />
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl bg-[#243e4f] p-8 text-white sm:flex-row">
            <div>
              <h3 className="heading-font text-xl font-extrabold">
                Vai nos visitar pela primeira vez?
              </h3>
              <p className="mt-1 text-sm text-slate-300">
                Envie uma mensagem para nossa recepção ou deixe seu pedido de oração!
              </p>
            </div>
            <Link
              href="/contato"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#fbab00] px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-[#182b38] transition hover:bg-[#fcaf3d]"
            >
              Falar com a Igreja
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

