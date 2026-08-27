/**
 * Las URL que los papás pegan dentro de la nota de un regalo.
 *
 * Este archivo es PURO a propósito: no hace peticiones ni toca la base, así que
 * puede viajar al navegador dentro de la tarjeta. Lo que sí sale a internet a
 * buscar el título vive en `titulo-enlace.ts`, que solo corre en el servidor.
 */

/**
 * Solo `http` y `https`. El texto lo escriben los papás desde el panel, y
 * aunque hoy sean ellos dos, un esquema como `javascript:` no tiene por qué
 * poder llegar nunca a un `href`. La lista blanca vive en la propia expresión.
 */
export const URL_EN_TEXTO = /https?:\/\/[^\s<>"']+/g;

/** El título de la página, si se pudo leer, junto a su dirección. */
export type EnlaceTitulado = { tienda: string; url: string };

/**
 * Le quita a la URL la puntuación que en realidad es de la frase.
 * En «…/dp/B0D9WHGD8C.» el punto final no es parte de la dirección.
 */
export function limpiarCola(url: string): string {
  const cola = url.match(/[.,;:!?)\]]+$/);
  return cola ? url.slice(0, url.length - cola[0].length) : url;
}

/** Las direcciones de un texto, sin repetidas y en el orden en que aparecen. */
export function extraerUrls(texto: string | null): string[] {
  if (!texto) return [];
  const vistas = new Set<string>();
  for (const encontrado of texto.matchAll(URL_EN_TEXTO)) {
    vistas.add(limpiarCola(encontrado[0]));
  }
  return [...vistas];
}

/**
 * Lee la columna `links_compra`, que es texto con JSON dentro.
 *
 * Nunca lanza: si el contenido no es lo que se espera —una fila vieja, algo
 * escrito a mano— la tarjeta se queda sin títulos y muestra la URL entera, que
 * es justo el respaldo previsto. Una lista de regalos no se puede caer por esto.
 */
export function leerEnlaces(json: string | null): EnlaceTitulado[] {
  if (!json) return [];
  try {
    const dato = JSON.parse(json);
    if (!Array.isArray(dato)) return [];
    return dato.filter(
      (e): e is EnlaceTitulado =>
        typeof e?.tienda === "string" && typeof e?.url === "string" && e.tienda.length > 0,
    );
  } catch {
    return [];
  }
}
