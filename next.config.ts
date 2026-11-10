import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Evita bloqueios de dominios externos em uploads do Admin/Professores
    // e preserva 100% da cota gratuita na hospedagem Vercel.
    unoptimized: true,
  },
  serverExternalPackages: ["@libsql/client"],
};

export default nextConfig;

