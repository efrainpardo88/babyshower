import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Las fotos de los regalos viven en Vercel Blob, no en el repo: el sistema
    // de archivos de Vercel es de solo lectura en ejecución. Sin esto,
    // next/image se niega a optimizar imágenes de un dominio externo.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
};

export default nextConfig;
