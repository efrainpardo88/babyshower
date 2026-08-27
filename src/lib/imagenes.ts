import { del, put } from "@vercel/blob";
import sharp from "sharp";

/**
 * La subida de imágenes, contra Vercel Blob.
 *
 * POR QUÉ NO SE GUARDAN EN `public/`: el sistema de archivos de Vercel es de
 * SOLO LECTURA en ejecución, y cada despliegue crea un entorno nuevo. Lo que se
 * escribiera ahí desaparecería al siguiente push. Las acuarelas de la landing sí
 * viven en `public/` porque las puso Efraín con git, no la aplicación.
 *
 * TODO EL TRATO CON EL PROVEEDOR VIVE AQUÍ. Si algún día se pasa a otro
 * almacenamiento, se cambia este archivo y nada más.
 *
 * SE REDIMENSIONA ANTES DE SUBIR, y no es un lujo: una foto de celular son 3–4 MB
 * y en la tarjeta se ve a 300px de ancho. Servir el original haría que la lista
 * tardara una eternidad en datos móviles, que es como la van a abrir casi todos
 * los invitados.
 */

/** Lo más grande que se muestra una foto es la ficha; 1200px sobra. */
const ANCHO_MAX = 1200;
const CALIDAD = 78;

/** Antes de procesar: si alguien sube un video de 200 MB, se corta aquí. */
const PESO_MAX = 12 * 1024 * 1024;

const TIPOS = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);

export type ResultadoSubida = { ok: true; url: string } | { ok: false; mensaje: string };

/**
 * Recibe el archivo del formulario, lo normaliza a WebP y lo sube.
 *
 * `carpeta` separa lo de los regalos de lo de la galería, para que se puedan
 * mirar por separado en el panel de Vercel.
 */
export async function subirImagen(archivo: File, carpeta: "regalos" | "galeria"): Promise<ResultadoSubida> {
  if (!archivo || archivo.size === 0) return { ok: false, mensaje: "No llegó ningún archivo." };
  if (archivo.size > PESO_MAX) {
    return { ok: false, mensaje: "La imagen pesa más de 12 MB. Usa una más liviana." };
  }
  if (!TIPOS.has(archivo.type)) {
    return { ok: false, mensaje: "Solo se aceptan imágenes (JPG, PNG, WebP, AVIF o GIF)." };
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { ok: false, mensaje: "Falta BLOB_READ_WRITE_TOKEN. Revisa las variables de entorno." };
  }

  try {
    const original = Buffer.from(await archivo.arrayBuffer());

    // `withoutEnlargement` evita agrandar una foto ya pequeña, que solo la
    // haría pesar más sin verse mejor.
    const optimizada = await sharp(original)
      .rotate() // respeta la orientación EXIF: si no, las fotos de celular salen acostadas
      .resize({ width: ANCHO_MAX, withoutEnlargement: true })
      .webp({ quality: CALIDAD })
      .toBuffer();

    // `addRandomSuffix` evita que dos fotos con el mismo nombre se pisen, y de
    // paso hace que la URL cambie al reemplazar una imagen — así ningún
    // navegador se queda mostrando la vieja desde su caché.
    const { url } = await put(`${carpeta}/${Date.now()}.webp`, optimizada, {
      access: "public",
      contentType: "image/webp",
      addRandomSuffix: true,
    });

    return { ok: true, url };
  } catch (e) {
    console.error("Falló la subida de la imagen:", e);
    return { ok: false, mensaje: "No se pudo subir la imagen. Intenta de nuevo." };
  }
}

/**
 * Borra del almacenamiento. Se traga los errores a propósito: si el archivo ya
 * no existe, o el borrado falla, no hay razón para bloquear la operación que lo
 * pidió — lo peor que pasa es que quede un archivo huérfano ocupando unos KB.
 */
export async function borrarImagen(url: string | null | undefined): Promise<void> {
  if (!url || !url.includes("blob.vercel-storage.com")) return;
  try {
    await del(url);
  } catch (e) {
    console.warn("No se pudo borrar la imagen (se ignora):", e);
  }
}
