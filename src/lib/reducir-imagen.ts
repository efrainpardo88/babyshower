"use client";

/**
 * Achica la foto EN EL NAVEGADOR, antes de mandarla al servidor.
 *
 * POR QUÉ EXISTE ESTO, si el servidor ya redimensiona con sharp: porque la foto
 * tiene que LLEGAR primero. Las Server Actions de Next traen un tope de 1 MB por
 * defecto, y una foto de celular son 3–7 MB. El resultado era el peor posible:
 * la petición se rompía antes de llegar a la acción, así que el mensaje de error
 * de `imagenes.ts` nunca se ejecutaba y el botón se quedaba en «Subiendo…» para
 * siempre. Fue justo lo que pasó en `/admin/galeria` con la tercera foto.
 *
 * El tope se subió a 4 MB en `next.config.ts`, pero eso solo no basta: en Vercel
 * el cuerpo de una petición no puede pasar de ~4,5 MB, así que una foto de 6,8 MB
 * seguiría sin entrar. Achicarla aquí resuelve las dos cosas y de paso le ahorra
 * datos a quien sube desde el celular, que es como se van a subir casi todas.
 *
 * El servidor SIGUE MANDANDO: valida tipo, peso y vuelve a redimensionar. Esto
 * es una comodidad del cliente, nunca la garantía — un navegador se puede saltar.
 */

/**
 * Escalones, del que mejor se ve al que seguro entra.
 *
 * El primero va holgado a propósito: el servidor guarda la galería a 2400px, así
 * que achicar por debajo de eso sería recortar calidad ANTES de que él decida, y
 * estas son las fotos de la revelación, que se van a ver a pantalla completa.
 * Los siguientes solo entran en juego si el anterior no cupo — una cámara de
 * muchos megapíxeles puede dar archivos enormes incluso ya reducidos.
 *
 * Se prueba en orden y gana el PRIMERO que quepa, no el más pequeño: bajar más
 * de lo necesario sería perder calidad de balde.
 */
const ESCALONES = [
  { ancho: 2600, calidad: 0.92 },
  { ancho: 2400, calidad: 0.85 },
  { ancho: 1800, calidad: 0.8 },
] as const;

/** Por debajo de esto se manda tal cual: recomprimir solo la empeoraría. */
const UMBRAL_BYTES = 2 * 1024 * 1024;

/** Lo que de verdad acepta la petición. Ver `next.config.ts`. */
const TOPE_ENVIO = 4 * 1024 * 1024;

export type Preparada = { ok: true; archivo: File } | { ok: false; mensaje: string };

function aBlob(lienzo: HTMLCanvasElement, calidad: number): Promise<Blob | null> {
  return new Promise((resolver) => lienzo.toBlob(resolver, "image/jpeg", calidad));
}

/**
 * Devuelve la foto lista para enviar, o el motivo por el que no se puede.
 *
 * Si algo falla al recomprimir —un formato que el navegador no sabe dibujar, un
 * lienzo bloqueado— se devuelve el archivo original en vez de romper: el
 * servidor dirá si lo acepta. Solo se rechaza aquí lo que seguro no va a llegar.
 */
export async function prepararImagen(archivo: File): Promise<Preparada> {
  if (archivo.size <= UMBRAL_BYTES) return { ok: true, archivo };

  let mejor: File | null = null;

  try {
    // `from-image` respeta la orientación EXIF. Sin esto, las fotos tomadas en
    // vertical con el celular se suben acostadas.
    const mapa = await createImageBitmap(archivo, { imageOrientation: "from-image" });

    for (const { ancho, calidad } of ESCALONES) {
      const escala = Math.min(1, ancho / mapa.width);
      const lienzo = document.createElement("canvas");
      lienzo.width = Math.round(mapa.width * escala);
      lienzo.height = Math.round(mapa.height * escala);

      const pincel = lienzo.getContext("2d");
      if (!pincel) break;
      pincel.drawImage(mapa, 0, 0, lienzo.width, lienzo.height);

      const blob = await aBlob(lienzo, calidad);
      if (!blob) continue;

      mejor = new File([blob], archivo.name.replace(/\.[^.]+$/, "") + ".jpg", {
        type: "image/jpeg",
      });
      if (mejor.size <= TOPE_ENVIO) break;
    }

    mapa.close();
  } catch {
    // Un formato que el navegador no sabe dibujar —un HEIC en Chrome, por
    // ejemplo—. Se manda el original y que decida el servidor.
  }

  const listo = mejor && mejor.size < archivo.size ? mejor : archivo;

  if (listo.size > TOPE_ENVIO) {
    return {
      ok: false,
      mensaje:
        "No se pudo achicar esta foto en el navegador y así como está no cabe en la subida. Si es un HEIC de iPhone, compártela como JPG y sube esa.",
    };
  }

  return { ok: true, archivo: listo };
}
