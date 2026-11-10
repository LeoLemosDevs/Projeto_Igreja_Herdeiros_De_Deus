"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar, Music, BookOpen } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    badge: "Igreja Bíblica Herdeiros de Deus",
    title: "Firmados na Palavra, Edificando Famílias em Cristo",
    subtitle:
      "Venha adorar a Deus conosco! Cultos semanais de ensino bíblico, oração e celebração para toda a sua família.",
    image: "/images/hero-culto.jpg",
    ctaLabel: "Ver Programação dos Cultos",
    ctaHref: "/programacao",
    secondaryLabel: "Conheça Nossa História",
    secondaryHref: "/sobre",
    icon: "calendar",
  },
  {
    id: 2,
    badge: "Escola de Música Herdeiros",
    title: "Aprenda Música e Sirva no Altar com Excelência",
    subtitle:
      "Acesse nosso acervo gratuito de videoaulas organizadas em módulos — violão, teclado, canto e muito mais com progresso salvo!",
    image: "/images/hero-musica.jpg",
    ctaLabel: "Acessar Cursos de Música",
    ctaHref: "/cursos",
    secondaryLabel: "Criar Conta Gratuita",
    secondaryHref: "/cadastro",
    icon: "music",
  },
  {
    id: 3,
    badge: "Comunhão & Ação Social",
    title: "Acompanhe Nossos Eventos e Publicações",
    subtitle:
      "Confira as últimas notícias, congressos, campanhas solidárias e testemunhos do que Deus tem feito em nosso meio.",
    image: "/images/hero-comunidade.jpg",
    ctaLabel: "Explorar Feed de Eventos",
    ctaHref: "/feed",
    secondaryLabel: "Enviar Pedido de Oração",
    secondaryHref: "/contato",
    icon: "book",
  },
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[current];

  return (
    <section className="relative h-[470px] w-full overflow-hidden bg-[#182b38] sm:h-[520px] lg:h-[560px]">
      {SLIDES.map((item, idx) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            idx === current ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <img
            src={item.image}
            alt={item.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#182b38]/95 via-[#243e4f]/75 to-[#182b38]/35" />
        </div>
      ))}

      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#fcaf3d]/40 bg-[#182b38]/80 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#fcaf3d] backdrop-blur-sm">
            {slide.icon === "calendar" && <Calendar className="h-3.5 w-3.5" />}
            {slide.icon === "music" && <Music className="h-3.5 w-3.5" />}
            {slide.icon === "book" && <BookOpen className="h-3.5 w-3.5" />}
            {slide.badge}
          </span>

          <h1 className="heading-font text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
            {slide.title}
          </h1>

          <p className="mt-4 text-base leading-relaxed text-slate-200 sm:text-lg">
            {slide.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <Link
              href={slide.ctaHref}
              className="rounded-full bg-[#fbab00] px-7 py-3.5 text-sm font-extrabold uppercase tracking-wide text-[#182b38] shadow-lg transition hover:bg-[#fcaf3d]"
            >
              {slide.ctaLabel}
            </Link>
            <Link
              href={slide.secondaryHref}
              className="rounded-full border border-white/40 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white hover:text-[#243e4f]"
            >
              {slide.secondaryLabel}
            </Link>
          </div>
        </div>
      </div>

      {/* Controls */}
      <button
        type="button"
        aria-label="Slide anterior"
        onClick={() =>
          setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)
        }
        className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/40 p-2.5 text-white transition hover:bg-[#f7941d] sm:inline-flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Próximo slide"
        onClick={() => setCurrent((prev) => (prev + 1) % SLIDES.length)}
        className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/40 p-2.5 text-white transition hover:bg-[#f7941d] sm:inline-flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2.5">
        {SLIDES.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            aria-label={`Ir para slide ${idx + 1}`}
            onClick={() => setCurrent(idx)}
            className={`h-2.5 rounded-full transition-all ${
              idx === current
                ? "w-8 bg-[#fbab00]"
                : "w-2.5 bg-white/50 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

