import { eq, asc } from "drizzle-orm";
import { leerEnlaces } from "./enlaces";
import { db } from "./db";
import { categorias, regalos, reservas } from "./db/schema";
import type { RegaloTarjeta } from "@/components/tarjeta-regalo";

/**
 * La consulta de la que vive `/lista`.
 *
 * Se lee en DOS consultas y se agrupa en memoria, en vez de un `leftJoin` de
 * regalos con reservas. Con el join, un regalo con 5 reservas vuelve 5 veces y
 * hay que desduplicar igual; con 26 regalos y unas decenas de reservas, dos
 * consultas y un `Map` son más simples de leer y más difíciles de equivocar.
 *
 * OJO: aquí NO se decide si un regalo se puede reservar. Esto es para pintar.
 * La validación real vive en la transacción de reserva, con `SELECT … FOR UPDATE`
 * y el índice `reservas_unico_activo_idx`. Ver CLAUDE.md.
 */

export type RegaloDeLista = RegaloTarjeta & {
  /** Para filtrar por categoría sin depender del nombre visible. */
  categoriaSlug: string;
};

export type CategoriaConCuenta = {
  slug: string;
  nombre: string;
  cuenta: number;
};

export type Lista = {
  regalos: RegaloDeLista[];
  categorias: CategoriaConCuenta[];
};

export async function cargarLista(): Promise<Lista> {
  const filas = await db
    .select({
      slug: regalos.slug,
      nombre: regalos.nombre,
      especificacion: regalos.especificacion,
      notaPapas: regalos.notaPapas,
      linksCompra: regalos.linksCompra,
      imagenUrl: regalos.imagenUrl,
      modo: regalos.modo,
      categoriaSlug: categorias.slug,
      categoriaNombre: categorias.nombre,
      categoriaOrden: categorias.orden,
    })
    .from(regalos)
    .innerJoin(categorias, eq(regalos.categoriaId, categorias.id))
    .where(eq(regalos.publicado, true))
    .orderBy(asc(categorias.orden), asc(regalos.orden));

  // Solo las activas: una reserva cancelada libera el cupo y no debe contarse.
  // Sin `nombre`: quién reservó no le importa a la lista y no tiene por qué
  // salir de la base hacia el navegador de todos los invitados.
  const activas = await db
    .select({ regaloId: reservas.regaloId, cantidad: reservas.cantidad })
    .from(reservas)
    .where(eq(reservas.estado, "activa"));

  const ids = await db.select({ id: regalos.id, slug: regalos.slug }).from(regalos);
  const slugPorId = new Map(ids.map((r) => [r.id, r.slug]));

  const porSlug = new Map<string, { cantidad: number }[]>();
  for (const r of activas) {
    const slug = slugPorId.get(r.regaloId);
    if (!slug) continue;
    const lista = porSlug.get(slug) ?? [];
    lista.push({ cantidad: r.cantidad });
    porSlug.set(slug, lista);
  }

  const lista: RegaloDeLista[] = filas.map((f) => ({
    slug: f.slug,
    nombre: f.nombre,
    especificacion: f.especificacion,
    notaPapas: f.notaPapas,
    enlaces: leerEnlaces(f.linksCompra),
    categoriaSlug: f.categoriaSlug,
    categoriaNombre: f.categoriaNombre,
    imagenUrl: f.imagenUrl,
    modo: f.modo,
    reservas: porSlug.get(f.slug) ?? [],
  }));

  // El orden de las píldoras es el de `categorias.orden`, no el alfabético:
  // «Entre varios» va primero a propósito, es lo que más ayuda a los papás.
  const cuentas = new Map<string, CategoriaConCuenta>();
  for (const f of filas) {
    const c = cuentas.get(f.categoriaSlug);
    if (c) c.cuenta += 1;
    else cuentas.set(f.categoriaSlug, { slug: f.categoriaSlug, nombre: f.categoriaNombre, cuenta: 1 });
  }

  return { regalos: lista, categorias: [...cuentas.values()] };
}
