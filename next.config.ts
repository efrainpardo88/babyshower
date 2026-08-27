import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      /**
       * El defecto de Next es 1 MB y una foto de celular son 3–5 MB. Con el
       * tope por defecto, la petición se rompía ANTES de llegar a la acción:
       * el mensaje de error nunca se ejecutaba y el botón se quedaba en
       * «Subiendo…» para siempre. Pasó de verdad con la tercera foto de la
       * galería.
       *
       * 4 MB y no más: en Vercel el cuerpo de una petición no pasa de ~4,5 MB,
       * así que subirlo por encima solo cambiaría dónde falla. Lo que de
       * verdad resuelve el caso es achicar la foto en el navegador antes de
       * mandarla — ver `src/lib/reducir-imagen.ts`.
       */
      bodySizeLimit: "4mb",
    },
  },
  images: {
    // Las fotos de los regalos viven en Vercel Blob, no en el repo: el sistema
    // de archivos de Vercel es de solo lectura en ejecución. Sin esto,
    // next/image se niega a optimizar imágenes de un dominio externo.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
};

export default nextConfig;
