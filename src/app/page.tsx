import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import {
  Calendar,
  Clock,
  GraduationCap,
  HeartHandshake,
  MapPin,
  Music,
  BookOpen,
  PlayCircle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { db, schema } from "@/db";
import { getSessionUser } from "@/lib/auth";
import { COURSE_LEVEL_LABELS, safeJsonParseArray } from "@/lib/utils";
import { HeroCarousel } from "@/components/HeroCarousel";
import { NewsletterBanner } from "@/components/NewsletterBanner";
import { SectionTitle } from "@/components/SectionTitle";
import { FeedCard } from "@/components/FeedCard";
import { ChurchLocationMap } from "@/components/ChurchLocationMap";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getSessionUser();

  const recentPosts = await db
    .select()
    .from(schema.feedPosts)
    .where(eq(schema.feedPosts.isPublished, true))
    .orderBy(desc(schema.feedPosts.isFeatured), desc(schema.feedPosts.createdAt))
    .limit(4);

  const schedules = await db
    .select()
    .from(schema.worshipSchedules)
    .where(eq(schema.worshipSchedules.isActive, true))
    .orderBy(asc(schema.worshipSchedules.sortOrder))
    .limit(4);

  const featuredCourses = await db
    .select({
      id: schema.courses.id,
      title: schema.courses.title,
      slug: schema.courses.slug,
      subtitle: schema.courses.subtitle,
      instrument: schema.courses.instrument,
      level: schema.courses.level,
      coverImage: schema.courses.coverImage,
      teacherName: schema.users.name,
    })
    .from(schema.courses)
    .leftJoin(schema.users, eq(schema.courses.teacherId, schema.users.id))
    .where(eq(schema.courses.isPublished, true))
    .orderBy(desc(schema.courses.isFeatured), desc(schema.courses.createdAt))
    .limit(3);

  return (
    <div>
      {/* 1. Hero Banner Carousel */}
      <HeroCarousel />

      {/* 2. Faixa de Boas-vindas e Atalhos (inspirada na danation-home da vitoriaemcristo.org) */}
      <section className="border-b border-slate-200 bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-6 rounded-2xl border border-slate-200 bg-[#f8f9fa] p-6 shadow-sm lg:grid-cols-12 lg:p-8">
            <div className="lg:col-span-6">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#f7941d]">
                Bem-vindo à Família
              </span>
              <h2 className="heading-font mt-1 text-2xl font-extrabold text-[#243e4f] sm:text-3xl">
                Um lugar de fé, ensino bíblico e comunhão em Cristo
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#5a6672]">
                Na <strong>Igreja Bíblica Herdeiros de Deus</strong>, cremos no poder transformador do Evangelho, no cuidado mútuo e no preparo de novos discípulos e adoradores.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:col-span-6">
              <Link
                href="/programacao"
                className="flex flex-col items-start rounded-xl border border-slate-200 bg-white p-4 transition hover:border-[#f7941d] hover:shadow-md"
              >
                <Calendar className="mb-2 h-6 w-6 text-[#f7941d]" />
                <span className="text-sm font-bold text-[#243e4f]">Cultos da Semana</span>
                <span className="mt-0.5 text-xs text-slate-500">Dias, horários e propósitos</span>
              </Link>

              <Link
                href="/cursos"
                className="flex flex-col items-start rounded-xl border border-slate-200 bg-white p-4 transition hover:border-[#f7941d] hover:shadow-md"
              >
                <Music className="mb-2 h-6 w-6 text-[#f7941d]" />
                <span className="text-sm font-bold text-[#243e4f]">Cursos de Música</span>
                <span className="mt-0.5 text-xs text-slate-500">Acervo gratuito para membros</span>
              </Link>

              <Link
                href="/contato"
                className="flex flex-col items-start rounded-xl border border-slate-200 bg-white p-4 transition hover:border-[#f7941d] hover:shadow-md"
              >
                <HeartHandshake className="mb-2 h-6 w-6 text-[#f7941d]" />
                <span className="text-sm font-bold text-[#243e4f]">Pedido de Oração</span>
                <span className="mt-0.5 text-xs text-slate-500">Fale com nossa equipe</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Newsletter Dark Strip (estilo news-home) */}
      <NewsletterBanner />

      {/* 4. Feed de Publicacoes e Eventos em Destaque */}
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Acontece na Igreja"
            title="Feed de Publicações e Eventos"
            subtitle="Confira os próximos encontros, ações sociais, vídeos e comunicados oficiais publicados pela administração."
            actionLabel="Ver todo o Feed"
            actionHref="/feed"
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {recentPosts.map((post) => (
              <FeedCard
                key={post.id}
                post={{
                  ...post,
                  mediaGallery: safeJsonParseArray(post.mediaGallery),
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Programacao de Cultos (inspirada na projetos-home) */}
      <section className="border-y border-slate-200 bg-[#f4f4f4] py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Nossos Encontros"
            title="Programação dos Cultos"
            subtitle="Cada reunião tem um propósito especial para o seu crescimento espiritual e da sua família."
            actionLabel="Programação Completa"
            actionHref="/programacao"
          />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {schedules.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#fcaf3d] hover:shadow-md"
              >
                <div>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#f7941d]">
                      {item.dayOfWeek}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#243e4f]">
                      <Clock className="h-3.5 w-3.5 text-[#f7941d]" />
                      {item.startTime}
                    </span>
                  </div>
                  <h3 className="heading-font text-lg font-bold text-[#243e4f]">
                    {item.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#5a6672]">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#f7941d]" />
                    {item.location}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Escola de Musica & Acervo de Cursos (inspirado na secao YouTube/Membros em fundo escuro) */}
      <section className="bg-[#182b38] py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Capacitação Ministerial"
            title="Escola de Música — Acervo de Cursos"
            subtitle="Faça login gratuito para acessar nossas aulas em vídeo organizadas em módulos, acompanhar seu progresso e aprender com nossos professores."
            actionLabel={user ? "Acessar Acervo" : "Entrar / Cadastrar Grátis"}
            actionHref={user ? "/cursos" : "/login"}
            light
          />

          <div className="grid gap-6 md:grid-cols-3">
            {featuredCourses.map((course) => (
              <div
                key={course.id}
                className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#243e4f] shadow-xl transition hover:-translate-y-1 hover:border-[#fcaf3d]/60"
              >
                <div className="relative aspect-video overflow-hidden bg-slate-900">
                  <img
                    src={course.coverImage || "/images/hero-musica.jpg"}
                    alt={course.title}
                    className="h-full w-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#182b38] via-transparent to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full bg-[#fbab00] px-3 py-1 text-[11px] font-extrabold uppercase text-[#182b38]">
                    {course.instrument}
                  </span>
                  <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white">
                    {COURSE_LEVEL_LABELS[course.level] || course.level}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="heading-font text-lg font-bold text-white">
                    {course.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm text-slate-300">
                    {course.subtitle}
                  </p>
                  <p className="mt-3 text-xs text-[#fcaf3d]">
                    Professor(a): {course.teacherName || "Ministério de Louvor"}
                  </p>

                  <Link
                    href={user ? `/cursos/${course.slug}/assistir` : `/cursos`}
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-[#f7941d] px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white transition hover:bg-[#df7d09]"
                  >
                    <PlayCircle className="h-4 w-4" />
                    {user ? "Assistir Aulas" : "Ver Curso e Entrar"}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-xl border border-[#fcaf3d]/30 bg-[#243e4f]/70 p-6 sm:flex-row">
            <div className="flex items-start gap-3">
              <GraduationCap className="mt-0.5 h-7 w-7 shrink-0 text-[#fcaf3d]" />
              <div>
                <h4 className="font-bold text-white">
                  Plataforma de Aulas com Progresso Salvo (Estilo Kiwify)
                </h4>
                <p className="text-sm text-slate-300">
                  Aulas do YouTube e Google Drive reunidas em módulos, com marcadores de conclusão e anotações pessoais.
                </p>
              </div>
            </div>
            <Link
              href={user ? "/cursos" : "/cadastro"}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#fbab00] px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-[#182b38] transition hover:bg-[#fcaf3d]"
            >
              {user ? "Abrir Minha Área de Cursos" : "Criar Conta de Aluno Grátis"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Sobre a Igreja Resumo */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <div className="overflow-hidden rounded-2xl shadow-xl">
                <img
                  src="/images/sobre-igreja.jpg"
                  alt="Templo da Igreja Bíblica Herdeiros de Deus"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="avec-section-title mb-5">
                <span className="block text-xs font-bold uppercase tracking-widest text-[#f7941d]">
                  Quem Somos
                </span>
                <h2 className="heading-font text-3xl font-extrabold uppercase text-[#243e4f]">
                  Nossa História e Chamado
                </h2>
              </div>

              <p className="text-base leading-relaxed text-[#5a6672]">
                A <strong>Igreja Bíblica Herdeiros de Deus</strong> nasceu do desejo profundo de pregar o Evangelho genuíno de Jesus Cristo, fundamentado exclusivamente nas Sagradas Escrituras e no amor ao próximo.
              </p>

              <ul className="mt-5 space-y-3 text-sm text-[#243e4f]">
                <li className="flex items-center gap-2.5 font-medium">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[#f7941d]" />
                  Pregação expositiva e fiel à Palavra de Deus
                </li>
                <li className="flex items-center gap-2.5 font-medium">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[#f7941d]" />
                  Discipulado acolhedor para famílias, jovens e crianças
                </li>
                <li className="flex items-center gap-2.5 font-medium">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[#f7941d]" />
                  Formação gratuita de músicos cristãos e ações sociais ativas
                </li>
              </ul>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/sobre"
                  className="inline-flex items-center gap-2 rounded-full bg-[#243e4f] px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-white transition hover:bg-[#182b38]"
                >
                  <BookOpen className="h-4 w-4 text-[#fcaf3d]" />
                  Conhecer Nossa História
                </Link>
                <Link
                  href="/contato"
                  className="inline-flex items-center gap-2 rounded-full border border-[#243e4f]/25 px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-[#243e4f] transition hover:border-[#f7941d] hover:text-[#f7941d]"
                >
                  Fale Conosco
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Localizacao e Navegacao Google Maps */}
      <section className="border-t border-slate-200 bg-[#f8f9fa] py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Localização & Como Chegar"
            title="Venha Nos Visitar"
            subtitle="Estamos de braços abertos para receber você e sua família em nosso templo na Barra do Ceará, Fortaleza - CE."
          />
          <ChurchLocationMap />
        </div>
      </section>
    </div>
  );
}

