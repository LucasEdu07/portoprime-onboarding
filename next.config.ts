import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Schema/serviço da API interna já nasce REST; nada de rewrites mágicos.
  experimental: {
    // Permite uploads/streams maiores quando o Blob não estiver configurado (modo demo).
  },
};

export default nextConfig;
