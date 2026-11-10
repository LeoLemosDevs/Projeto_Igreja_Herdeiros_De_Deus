import type { Metadata } from "next";
import { Mail, MapPin, Phone, Clock, MessageSquareHeart, Navigation } from "lucide-react";
import { SectionTitle } from "@/components/SectionTitle";
import { ContactForm } from "@/components/ContactForm";
import { ChurchLocationMap } from "@/components/ChurchLocationMap";
import { CHURCH_INFO } from "@/lib/church-info";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Entre em contato com a Igreja Bíblica Herdeiros de Deus, envie seu pedido de oração ou tire dúvidas sobre nossos cultos e cursos de música.",
};

export default function ContatoPage() {
  return (
    <div className="bg-[#f8f9fa] py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Atendimento & Oração"
          title="Entre em Contato Conosco"
          subtitle="Nossa equipe pastoral e secretaria estão prontas para ouvir você, orar por sua família e orientar sobre nossos cultos e cursos."
        />

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ContactForm />
          </div>

          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-2xl bg-[#243e4f] p-7 text-white shadow-md">
              <h2 className="heading-font text-xl font-bold">
                Canais Diretos da Igreja
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                Você também pode falar diretamente pelos canais abaixo ou nos
                visitar presencialmente.
              </p>

              <ul className="mt-6 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#fcaf3d]" />
                  <div>
                    <strong className="block text-white">Endereço</strong>
                    <span className="block text-slate-300">
                      {CHURCH_INFO.streetAddress}
                    </span>
                    <span className="block text-slate-300">
                      {CHURCH_INFO.neighborhood}, {CHURCH_INFO.cityState} — CEP:{" "}
                      <strong className="text-[#fcaf3d]">{CHURCH_INFO.cep}</strong>
                    </span>
                    <a
                      href={CHURCH_INFO.googleMapsDirectionsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-[#fcaf3d] underline underline-offset-4 hover:text-white"
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      Traçar rota no Google Maps
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-[#fcaf3d]" />
                  <div>
                    <strong className="block text-white">Telefone / WhatsApp</strong>
                    <span className="text-slate-300">{CHURCH_INFO.phoneDisplay}</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[#fcaf3d]" />
                  <div>
                    <strong className="block text-white">E-mail</strong>
                    <span className="text-slate-300">
                      {CHURCH_INFO.email}
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[#fcaf3d]" />
                  <div>
                    <strong className="block text-white">Secretaria</strong>
                    <span className="text-slate-300">
                      Terça a Sexta, das 14h às 19h • Domingos durante os cultos
                    </span>
                  </div>
                </li>
              </ul>

              <a
                href={`https://wa.me/${CHURCH_INFO.whatsappNumber}?text=Olá!%20Gostaria%20de%20mais%20informações%20sobre%20a%20Igreja%20Bíblica%20Herdeiros%20de%20Deus.`}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#fbab00] px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-[#182b38] transition hover:bg-[#fcaf3d]"
              >
                <MessageSquareHeart className="h-4 w-4" />
                Chamar no WhatsApp
              </a>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-[#243e4f]">
                Pedidos de Oração São Confidenciais
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5a6672]">
                Todas as mensagens enviadas por este formulário são recebidas no
                painel seguro da liderança para intercessão e retorno pastoral.
              </p>
            </div>
          </div>
        </div>

        {/* Mapa Interativo Google Maps para Visitantes */}
        <div className="mt-12">
          <ChurchLocationMap />
        </div>
      </div>
    </div>
  );
}

