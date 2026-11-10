import { MapPin, Navigation, ExternalLink, Compass } from "lucide-react";
import { CHURCH_INFO } from "@/lib/church-info";

interface ChurchLocationMapProps {
  compact?: boolean;
}

export function ChurchLocationMap({ compact = false }: ChurchLocationMapProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
      <div className={compact ? "grid" : "grid lg:grid-cols-12"}>
        {/* Painel de Informacoes do Endereco */}
        <div
          className={`flex flex-col justify-between bg-[#243e4f] p-6 text-white sm:p-7 ${
            compact ? "" : "lg:col-span-5"
          }`}
        >
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow">
                <img
                  src={CHURCH_INFO.logoSmall}
                  alt={CHURCH_INFO.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#fcaf3d]">
                  Venha nos Visitar
                </span>
                <h3 className="heading-font text-lg font-extrabold leading-tight text-white">
                  Templo Sede — Barra do Ceará
                </h3>
              </div>
            </div>

            <div className="mt-4 space-y-2 rounded-xl border border-white/10 bg-[#182b38] p-4 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#fcaf3d]" />
                <div>
                  <p className="font-bold text-white">
                    {CHURCH_INFO.streetAddress}
                  </p>
                  <p className="text-slate-300">
                    {CHURCH_INFO.neighborhood}, {CHURCH_INFO.cityState}
                  </p>
                  <p className="mt-1 inline-block rounded bg-[#243e4f] px-2 py-0.5 text-xs font-extrabold tracking-wide text-[#fcaf3d]">
                    CEP: {CHURCH_INFO.cep}
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-slate-300">
              Toque em um dos botões abaixo para abrir a rota GPS passo a passo
              direto até a porta da nossa igreja no seu celular ou computador.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row lg:flex-col">
            <a
              href={CHURCH_INFO.googleMapsDirectionsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#fbab00] px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-[#182b38] shadow transition hover:bg-[#fcaf3d]"
            >
              <Navigation className="h-4 w-4" />
              Traçar Rota no Google Maps
            </a>

            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={CHURCH_INFO.wazeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white hover:text-[#182b38]"
              >
                <Compass className="h-3.5 w-3.5 text-[#fcaf3d]" />
                Abrir no Waze
              </a>
              <a
                href={CHURCH_INFO.googleMapsPlaceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white hover:text-[#182b38]"
              >
                <ExternalLink className="h-3.5 w-3.5 text-[#fcaf3d]" />
                Ver Mapa Maior
              </a>
            </div>
          </div>
        </div>

        {/* Google Maps Embed Interativo */}
        <div
          className={`relative bg-slate-200 ${
            compact ? "h-72" : "min-h-[340px] lg:col-span-7 lg:min-h-[420px]"
          }`}
        >
          <iframe
            title="Localização da Igreja Bíblica Herdeiros de Deus no Google Maps"
            src={CHURCH_INFO.googleMapsEmbedUrl}
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

