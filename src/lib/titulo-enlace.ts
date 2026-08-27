import { extraerUrls, type EnlaceTitulado } from "./enlaces";

/**
 * Va a la página que enlazó el papá y le saca el `<title>`.
 *
 * POR QUÉ SE RESUELVE AL GUARDAR Y NO AL PINTAR LA LISTA:
 * medido contra las tiendas reales, cada consulta tarda entre 0,1 y 1,9
 * segundos. Con varios enlaces, hacerlo mientras el invitado abre `/lista`
 * sumaría segundos a una página que casi todos van a abrir con datos móviles.
 * Se pide UNA vez, cuando el papá guarda el regalo, y se deja escrito en
 * `regalos.links_compra`.
 *
 * QUÉ PASA CUANDO NO SE PUEDE: nada grave. La tienda puede responder con una
 * pantalla de robot, tardar de más o no tener `<title>`. En ese caso el enlace
 * se guarda igual, con la URL de `tienda`, y la tarjeta la enseña completa. Lo
 * que NO puede pasar es que el enlace desaparezca: el papá lo escribió a
 * propósito y el invitado tiene que poder llegar a la tienda de todas formas.
 *
 * OJO con lo que devuelven de verdad: Amazon manda títulos de 281 caracteres
 * —más largos que la propia URL— e IKEA manda «Products - IKEA», que no dice
 * qué producto es. Por eso se recorta, y por eso el título es una ayuda, no
 * una promesa de que va a quedar bonito.
 */

const ESPERA_MS = 6000;
/** Cabe en dos renglones de la tarjeta sin empujar al botón. */
const LARGO_MAXIMO = 70;
/** Tope por nota: es una nota de regalo, no una lista de compras. */
const MAXIMO_ENLACES = 4;

/** Un navegador de verdad: varias tiendas responden distinto a un cliente sin `user-agent`. */
const CABECERAS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  "accept-language": "es-CO,es;q=0.9",
};

/** Las cuatro entidades que aparecen de verdad en un `<title>`. */
function decodificar(texto: string): string {
  return texto
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

/** Recorta por palabra, no a la mitad de una. */
function recortar(texto: string): string {
  if (texto.length <= LARGO_MAXIMO) return texto;
  const cortado = texto.slice(0, LARGO_MAXIMO);
  const espacio = cortado.lastIndexOf(" ");
  return (espacio > LARGO_MAXIMO * 0.6 ? cortado.slice(0, espacio) : cortado).trimEnd() + "…";
}

/** El título de una página, o `null` si no se pudo. Nunca lanza. */
export async function obtenerTitulo(url: string): Promise<string | null> {
  try {
    const respuesta = await fetch(url, {
      signal: AbortSignal.timeout(ESPERA_MS),
      redirect: "follow",
      headers: CABECERAS,
    });
    if (!respuesta.ok) return null;

    // Un `<title>` va en la cabecera del documento; leer el HTML entero de una
    // ficha de producto serían cientos de kilobytes para nada.
    const html = (await respuesta.text()).slice(0, 200_000);
    const encontrado = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (!encontrado) return null;

    const limpio = recortar(decodificar(encontrado[1]).replace(/\s+/g, " ").trim());
    return limpio.length > 0 ? limpio : null;
  } catch {
    return null;
  }
}

/**
 * Resuelve todas las URL de un texto. Ninguna se pierde: la que no da título se
 * queda con su propia dirección de etiqueta.
 *
 * En paralelo: son como mucho cuatro y esperar una detrás de otra convertiría
 * un guardado en seis segundos de reloj.
 */
export async function resolverEnlaces(texto: string | null): Promise<EnlaceTitulado[]> {
  const urls = extraerUrls(texto).slice(0, MAXIMO_ENLACES);
  if (urls.length === 0) return [];

  return Promise.all(
    urls.map(async (url) => ({ tienda: (await obtenerTitulo(url)) ?? url, url })),
  );
}
