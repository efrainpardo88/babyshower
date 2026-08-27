"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { regalos, reservas } from "@/lib/db/schema";
import { auth, esAdmin } from "@/lib/auth";

/**
 * El CRUD de regalos.
 *
 * CADA ACCIÓN VUELVE A COMPROBAR LA SESIÓN. El middleware ya cierra `/admin/*`,
 * pero una acción de servidor es un endpoint: se puede llamar desde fuera de la
 * página que la usa. Confiar solo en el middleware sería confiar en el cliente.
 *
 * Dos reglas de negocio que se validan aquí y no en el formulario:
 *
 *  · El `slug` NO cambia al renombrar. Es la URL del regalo y la clave con la
 *    que los invitados lo tienen guardado en su selección; cambiarlo les
 *    borraría lo que ya escogieron.
 *  · No se puede pasar de «varias veces» a «una sola vez» si ya hay más de una
 *    reserva activa: chocaría contra `reservas_unico_activo_idx` y dejaría el
 *    regalo en un estado imposible.
 */

export type Respuesta = { ok: true } | { ok: false; mensaje: string };

async function exigirAdmin(): Promise<string | null> {
  const sesion = await auth();
  return esAdmin(sesion?.user?.email) ? null : "No tienes permiso.";
}

function refrescar(): void {
  revalidatePath("/admin/regalos");
  revalidatePath("/admin");
  revalidatePath("/lista");
}

export type DatosRegalo = {
  nombre: string;
  especificacion: string;
  notaPapas: string;
  categoriaId: string;
  precioMin: string;
  precioMax: string;
  nivelPrecio: "$" | "$$" | "$$$";
  modo: "unico" | "multiple";
  imagenUrl: string;
  publicado: boolean;
};

function aEntero(v: string): number | null {
  const limpio = v.replace(/[^\d]/g, "");
  if (!limpio) return null;
  const n = Number.parseInt(limpio, 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function validar(d: DatosRegalo): string | null {
  if (d.nombre.trim().length < 3) return "El nombre es muy corto.";
  if (!d.categoriaId) return "Falta la categoría.";
  const min = aEntero(d.precioMin);
  const max = aEntero(d.precioMax);
  if ((min == null) !== (max == null)) return "Pon los dos precios o ninguno.";
  if (min != null && max != null && min > max) return "El precio mínimo es mayor que el máximo.";
  return null;
}

/** Solo para regalos nuevos: el de un regalo existente nunca cambia. */
function aSlug(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function crearRegalo(d: DatosRegalo): Promise<Respuesta> {
  const noPuede = await exigirAdmin();
  if (noPuede) return { ok: false, mensaje: noPuede };
  const malo = validar(d);
  if (malo) return { ok: false, mensaje: malo };

  const base = aSlug(d.nombre + (d.especificacion ? "-" + d.especificacion : ""));
  if (!base) return { ok: false, mensaje: "Ese nombre no da un identificador válido." };

  const [{ existe }] = await db.execute<{ existe: number }>(
    sql`select count(*)::int as existe from ${regalos} where slug = ${base}`,
  );
  const slug = existe > 0 ? `${base}-${Date.now().toString(36).slice(-4)}` : base;

  const [{ ultimo }] = await db.execute<{ ultimo: number }>(
    sql`select coalesce(max(orden), 0)::int as ultimo from ${regalos}`,
  );

  await db.insert(regalos).values({
    slug,
    nombre: d.nombre.trim(),
    especificacion: d.especificacion.trim() || null,
    notaPapas: d.notaPapas.trim() || null,
    categoriaId: d.categoriaId,
    precioMin: aEntero(d.precioMin),
    precioMax: aEntero(d.precioMax),
    nivelPrecio: d.nivelPrecio,
    modo: d.modo,
    imagenUrl: d.imagenUrl.trim() || null,
    publicado: d.publicado,
    orden: ultimo + 1,
  });

  refrescar();
  return { ok: true };
}

export async function guardarRegalo(id: string, d: DatosRegalo): Promise<Respuesta> {
  const noPuede = await exigirAdmin();
  if (noPuede) return { ok: false, mensaje: noPuede };
  const malo = validar(d);
  if (malo) return { ok: false, mensaje: malo };

  const [actual] = await db.select({ modo: regalos.modo }).from(regalos).where(eq(regalos.id, id));
  if (!actual) return { ok: false, mensaje: "Ese regalo ya no existe." };

  if (actual.modo === "multiple" && d.modo === "unico") {
    const [{ activas }] = await db.execute<{ activas: number }>(sql`
      select count(*)::int as activas from ${reservas}
      where regalo_id = ${id} and estado = 'activa'
    `);
    if (activas > 1) {
      return {
        ok: false,
        mensaje: `No se puede: ya hay ${activas} personas que lo van a traer, y «una sola vez» admite una. Cancela reservas primero.`,
      };
    }
  }

  await db
    .update(regalos)
    .set({
      // `slug` a propósito NO se toca: ver la nota de arriba.
      nombre: d.nombre.trim(),
      especificacion: d.especificacion.trim() || null,
      notaPapas: d.notaPapas.trim() || null,
      categoriaId: d.categoriaId,
      precioMin: aEntero(d.precioMin),
      precioMax: aEntero(d.precioMax),
      nivelPrecio: d.nivelPrecio,
      modo: d.modo,
      imagenUrl: d.imagenUrl.trim() || null,
      publicado: d.publicado,
    })
    .where(eq(regalos.id, id));

  // `esUnico` está copiado en cada reserva y el índice depende de él.
  await db.update(reservas).set({ esUnico: d.modo === "unico" }).where(eq(reservas.regaloId, id));

  refrescar();
  return { ok: true };
}

/** Publicar o esconder sin abrir el editor. */
export async function alternarPublicado(id: string, publicado: boolean): Promise<Respuesta> {
  const noPuede = await exigirAdmin();
  if (noPuede) return { ok: false, mensaje: noPuede };
  await db.update(regalos).set({ publicado }).where(eq(regalos.id, id));
  refrescar();
  return { ok: true };
}

/**
 * Borrar de verdad, solo si nadie lo reservó.
 *
 * Con reservas activas se niega: borrarlo dejaría a un invitado con un
 * comprobante de un regalo que ya no existe. Para sacarlo de circulación sin
 * romper nada está «publicado».
 */
export async function borrarRegalo(id: string): Promise<Respuesta> {
  const noPuede = await exigirAdmin();
  if (noPuede) return { ok: false, mensaje: noPuede };

  const [{ cuantas }] = await db.execute<{ cuantas: number }>(
    sql`select count(*)::int as cuantas from ${reservas} where regalo_id = ${id}`,
  );
  if (cuantas > 0) {
    return {
      ok: false,
      mensaje: "Tiene reservas. Escóndelo con «Publicado» en vez de borrarlo, o se rompería el comprobante de alguien.",
    };
  }

  await db.delete(regalos).where(and(eq(regalos.id, id)));
  refrescar();
  return { ok: true };
}
