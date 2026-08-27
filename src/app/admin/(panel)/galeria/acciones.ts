"use server";

import { revalidatePath } from "next/cache";
import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { fotosGaleria } from "@/lib/db/schema";
import { auth, esAdmin } from "@/lib/auth";
import { borrarImagen, subirImagen } from "@/lib/imagenes";

/**
 * La galería de la revelación de género.
 *
 * Las fotos viven en Vercel Blob y sus URLs en `fotos_galeria`. La landing las
 * lee de ahí, así que subir una foto aquí la publica de inmediato — sin tocar
 * código ni desplegar.
 */

export type Respuesta = { ok: true } | { ok: false; mensaje: string };

async function exigirAdmin(): Promise<string | null> {
  const sesion = await auth();
  return esAdmin(sesion?.user?.email) ? null : "No tienes permiso.";
}

function refrescar(): void {
  revalidatePath("/admin/galeria");
  revalidatePath("/");
}

export async function subirFoto(datos: FormData): Promise<Respuesta> {
  const noPuede = await exigirAdmin();
  if (noPuede) return { ok: false, mensaje: noPuede };

  const archivo = datos.get("archivo");
  if (!(archivo instanceof File)) return { ok: false, mensaje: "No llegó ningún archivo." };

  const r = await subirImagen(archivo, "galeria");
  if (!r.ok) return r;

  const [{ ultimo }] = await db.execute<{ ultimo: number }>(
    sql`select coalesce(max(orden), 0)::int as ultimo from ${fotosGaleria}`,
  );

  await db.insert(fotosGaleria).values({
    url: r.url,
    descripcion: (datos.get("descripcion") as string | null)?.trim() || null,
    orden: ultimo + 1,
  });

  refrescar();
  return { ok: true };
}

export async function borrarFoto(id: string): Promise<Respuesta> {
  const noPuede = await exigirAdmin();
  if (noPuede) return { ok: false, mensaje: noPuede };

  const [fila] = await db
    .delete(fotosGaleria)
    .where(eq(fotosGaleria.id, id))
    .returning({ url: fotosGaleria.url });

  // Se borra también del almacenamiento: si no, las fotos quitadas seguirían
  // ocupando espacio para siempre.
  if (fila) await borrarImagen(fila.url);

  refrescar();
  return { ok: true };
}

/** Mover una foto en el orden que ven los invitados. */
export async function moverFoto(id: string, direccion: "arriba" | "abajo"): Promise<Respuesta> {
  const noPuede = await exigirAdmin();
  if (noPuede) return { ok: false, mensaje: noPuede };

  const todas = await db
    .select({ id: fotosGaleria.id, orden: fotosGaleria.orden })
    .from(fotosGaleria)
    .orderBy(asc(fotosGaleria.orden));

  const i = todas.findIndex((f) => f.id === id);
  const j = direccion === "arriba" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= todas.length) return { ok: true };

  // Se reescriben los dos órdenes en vez de intercambiarlos: los valores
  // pueden venir repetidos de cargas anteriores y un intercambio los dejaría
  // igual de ambiguos.
  await db.update(fotosGaleria).set({ orden: j + 1 }).where(eq(fotosGaleria.id, todas[i].id));
  await db.update(fotosGaleria).set({ orden: i + 1 }).where(eq(fotosGaleria.id, todas[j].id));

  refrescar();
  return { ok: true };
}

/**
 * Manda una foto al primer puesto.
 *
 * Existe porque con 47 fotos las flechas no alcanzan: llevar la del puesto 40
 * al principio serían 39 clics. Esto es lo que de verdad se quiere hacer cuando
 * uno mira la portada y piensa «esta debería salir primero».
 *
 * Se resuelve en DOS sentencias y no reescribiendo los 47 órdenes uno por uno:
 * cada `update` suelto es un viaje a Neon, y 47 viajes son segundos de espera.
 * Correr el bloque de arriba en una sola sentencia conserva el orden relativo
 * de las demás, que es justo lo que se espera.
 */
export async function destacarFoto(id: string): Promise<Respuesta> {
  const noPuede = await exigirAdmin();
  if (noPuede) return { ok: false, mensaje: noPuede };

  await db.transaction(async (tx) => {
    const [foto] = await tx
      .select({ orden: fotosGaleria.orden })
      .from(fotosGaleria)
      .where(eq(fotosGaleria.id, id));
    if (!foto) return;

    await tx.execute(
      sql`update ${fotosGaleria} set orden = orden + 1 where orden < ${foto.orden}`,
    );
    await tx.update(fotosGaleria).set({ orden: 1 }).where(eq(fotosGaleria.id, id));
  });

  refrescar();
  return { ok: true };
}
