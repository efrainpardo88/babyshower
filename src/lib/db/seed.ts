/**
 * Los 26 regalos de la lista, tal como quedaron después de los recortes.
 * Esta es la fuente de verdad del contenido: si la lista cambia, cambia aquí
 * y se vuelve a correr el seed.
 *
 *   npm run db:seed
 *
 * Reglas que hay detrás de estos datos (ver .claude/docs/decisiones.md):
 *  · Todo ítem lleva talla o cantidad EXPLÍCITA en el nombre. Eso evita los repetidos.
 *  · Solo hay dos modos: `unico` (uno lo toma y sale de la lista) y `multiple`
 *    (sin tope, nunca se agota). Los cupos se eliminaron el 26/08/2026.
 *  · `precioMin`/`precioMax` son PÚBLICOS: el invitado ve «Entre $20.000 y $80.000».
 *    Por eso tienen que ser rangos honestos y actuales — si están mal, el invitado
 *    compra mal. Revisarlos antes de cada seed.
 *  · `nivelPrecio` quedó de respaldo (regalos sin rango) y para agrupar en el panel.
 *    `$` hasta 80.000 · `$$` hasta 250.000 · `$$$` de ahí para arriba (COP).
 */
// El .env.local NO se carga aquí: los `import` se elevan por encima de cualquier
// llamada a dotenv, así que `./index` se cargaría antes y reventaría por falta de
// DATABASE_URL. Lo carga Node con `--env-file`, desde el script `db:seed`.
import { db } from "./index";
import { categorias, regalos } from "./schema";

type Semilla = {
  nombre: string;
  especificacion?: string;
  modo: "unico" | "multiple";
  precioMin: number;
  precioMax: number;
  nivelPrecio: "$" | "$$" | "$$$";
  notaPapas?: string;
};

const CATEGORIAS = [
  { slug: "entre-varios", nombre: "Entre varios", icono: "personas", orden: 1 },
  { slug: "panales", nombre: "Pañales", icono: "panal", orden: 2 },
  { slug: "bano", nombre: "Baño y cuidado", icono: "gota", orden: 3 },
  { slug: "sueno", nombre: "Sueño", icono: "luna", orden: 4 },
  { slug: "paseo", nombre: "Paseo", icono: "bolso", orden: 5 },
  { slug: "juego", nombre: "Juego", icono: "sonajero", orden: 6 },
] as const;

const REGALOS: Record<string, Semilla[]> = {
  "entre-varios": [
    { nombre: "Silla de carro", especificacion: "Grupo 0+ · nueva, nunca usada", modo: "unico", precioMin: 400_000, precioMax: 1_200_000, nivelPrecio: "$$$",
      notaPapas: "Es el único obligatorio por ley: sin silla no nos dejan salir de la clínica. Preferimos con base Isofix porque la vamos a mover entre dos carros." },
    { nombre: "Coche / carriola", modo: "unico", precioMin: 500_000, precioMax: 1_500_000, nivelPrecio: "$$$" },
    { nombre: "Ular (cargador)", modo: "unico", precioMin: 200_000, precioMax: 600_000, nivelPrecio: "$$$" },
    { nombre: "Cambiador / cómoda", modo: "unico", precioMin: 300_000, precioMax: 800_000, nivelPrecio: "$$$" },
    { nombre: "Monitor de bebé", especificacion: "Con cámara", modo: "unico", precioMin: 200_000, precioMax: 500_000, nivelPrecio: "$$$" },
    { nombre: "Silla alta de comer", especificacion: "Se usa desde los 6 meses", modo: "unico", precioMin: 200_000, precioMax: 600_000, nivelPrecio: "$$$" },
    { nombre: "Almohada de lactancia", modo: "unico", precioMin: 80_000, precioMax: 180_000, nivelPrecio: "$$" },
  ],
  panales: [
    { nombre: "Pañales talla recién nacido", especificacion: "Talla RN", modo: "multiple", precioMin: 45_000, precioMax: 90_000, nivelPrecio: "$",
      notaPapas: "Solo dos, de verdad: esta talla se usa unas tres semanas y después estorba." },
    { nombre: "Pañales talla 1", especificacion: "Etapa 1", modo: "multiple", precioMin: 45_000, precioMax: 90_000, nivelPrecio: "$" },
    { nombre: "Pañales talla 2", especificacion: "Etapa 2", modo: "multiple", precioMin: 45_000, precioMax: 90_000, nivelPrecio: "$" },
    { nombre: "Pañales talla 3", especificacion: "Etapa 3", modo: "multiple", precioMin: 45_000, precioMax: 90_000, nivelPrecio: "$" },
    { nombre: "Pañales talla 4", especificacion: "Etapa 4", modo: "multiple", precioMin: 45_000, precioMax: 90_000, nivelPrecio: "$" },
    { nombre: "Pañitos húmedos", especificacion: "Cualquier marca", modo: "multiple", precioMin: 20_000, precioMax: 45_000, nivelPrecio: "$",
      notaPapas: "Nunca sobran. Escógelo las veces que quieras." },
  ],
  bano: [
    { nombre: "Bañera con soporte", modo: "unico", precioMin: 80_000, precioMax: 250_000, nivelPrecio: "$$" },
    { nombre: "Toallas con capota", especificacion: "Paquete x2", modo: "unico", precioMin: 50_000, precioMax: 120_000, nivelPrecio: "$$" },
    { nombre: "Kit de cuidado", especificacion: "Cortaúñas, aspirador nasal y cepillo", modo: "unico", precioMin: 50_000, precioMax: 130_000, nivelPrecio: "$$",
      notaPapas: "Sin termómetro — ese ya lo tenemos." },
    { nombre: "Shampoo y jabón neutro", modo: "unico", precioMin: 40_000, precioMax: 90_000, nivelPrecio: "$" },
    { nombre: "Organizador de cambiador", modo: "unico", precioMin: 50_000, precioMax: 100_000, nivelPrecio: "$$" },
  ],
  sueno: [
    { nombre: "Sacos de dormir", modo: "unico", precioMin: 80_000, precioMax: 150_000, nivelPrecio: "$$" },
    { nombre: "Mantas de muselina", especificacion: "Paquete x3", modo: "unico", precioMin: 70_000, precioMax: 140_000, nivelPrecio: "$$" },
    { nombre: "Luz nocturna con dimmer", modo: "unico", precioMin: 50_000, precioMax: 120_000, nivelPrecio: "$$" },
  ],
  paseo: [
    { nombre: "Pañalera grande", modo: "unico", precioMin: 150_000, precioMax: 400_000, nivelPrecio: "$$$" },
  ],
  juego: [
    { nombre: "Gimnasio de piso / manta de actividades", modo: "unico", precioMin: 120_000, precioMax: 300_000, nivelPrecio: "$$$" },
    { nombre: "Móvil", especificacion: "Para colgar sobre el espacio de colecho", modo: "unico", precioMin: 80_000, precioMax: 200_000, nivelPrecio: "$$",
      notaPapas: "Benjamín va a dormir en colecho, así que no necesita ser de cuna." },
    { nombre: "Sonajeros y mordedores", modo: "unico", precioMin: 30_000, precioMax: 80_000, nivelPrecio: "$" },
    { nombre: "Libros con ilustraciones para bebés", especificacion: "Cartón o tela", modo: "multiple", precioMin: 30_000, precioMax: 90_000, nivelPrecio: "$",
      notaPapas: "Tampoco sobran. Entre más, mejor." },
  ],
};

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
   .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

async function main() {
  console.log("Sembrando categorías…");
  await db.insert(categorias).values([...CATEGORIAS]).onConflictDoNothing();

  // El mapa slug→id se lee DESPUÉS de insertar, con un SELECT aparte. No se puede
  // usar el `returning()` del insert: con `onConflictDoNothing`, las filas que ya
  // existían no se devuelven, así que en la segunda corrida el mapa venía vacío y
  // los regalos entraban sin `categoria_id`. El seed tiene que poder repetirse.
  const cats = await db.select().from(categorias);
  const porSlug = new Map(cats.map((c) => [c.slug, c.id]));
  for (const c of CATEGORIAS) {
    if (!porSlug.has(c.slug)) throw new Error(`Falta la categoría ${c.slug}`);
  }

  let orden = 0;
  const filas = Object.entries(REGALOS).flatMap(([catSlug, items]) =>
    items.map((r) => ({
      slug: slugify(r.nombre + (r.especificacion ? "-" + r.especificacion : "")),
      nombre: r.nombre,
      especificacion: r.especificacion ?? null,
      notaPapas: r.notaPapas ?? null,
      categoriaId: porSlug.get(catSlug)!,
      precioMin: r.precioMin,
      precioMax: r.precioMax,
      nivelPrecio: r.nivelPrecio,
      modo: r.modo,
      publicado: true,
      orden: orden++,
    })),
  );

  await db.insert(regalos).values(filas).onConflictDoNothing();
  console.log(`Listo: ${filas.length} regalos en ${CATEGORIAS.length} categorías.`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
