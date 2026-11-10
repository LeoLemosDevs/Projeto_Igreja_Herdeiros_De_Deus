import type { Metadata } from "next";
import { Open_Sans, Montserrat } from "next/font/google";
import "./globals.css";
import { getSessionUser } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  weight: ["400", "500", "600", "700"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Igreja Bíblica Herdeiros de Deus | Portal Oficial",
    template: "%s | Igreja Bíblica Herdeiros de Deus",
  },
  description:
    "Portal oficial da Igreja Bíblica Herdeiros de Deus: programação de cultos, feed de eventos, história da igreja e Escola de Música online.",
  icons: {
    icon: "/img/logo_transparente_300p.png",
    apple: "/img/logo_transparente_500p.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();

  return (
    <html lang="pt-BR" className={`${openSans.variable} ${montserrat.variable}`}>
      <body className="flex min-h-screen flex-col bg-white text-[#212529]">
        <Navbar user={user} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

