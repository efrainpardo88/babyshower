import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { categorias, regalos, reservas } from "@/lib/db/schema";
import { AdminRegalos, type RegaloAdmin } from "@/components/admin-regalos";

/** El CRUD de regalos. Ver `.claude/docs/diseno/AdminRegalos.png`. */
export const dynamic = "force-dynamic";

export default async function Regalos() {
  const filas = await db
    .select({
      id: regalos.id,
      slug: regalos.slug,
      nombre: regalos.nombre,
      especificacion: regalos.especificacion,
      notaPapas: regalos.notaPapas,
      linksCompra: regalos.linksCompra,
      categoriaId: regalos.categoriaId,
      categoriaNombre: categorias.nombre,
      precioMin: regalos.precioMin,
      precioMax: regalos.precioMax,
      nivelPrecio: regalos.nivelPrecio,
      modo: regalos.modo,
      imagenUrl: regalos.imagenUrl,
      publicado: regalos.publicado,
      // Se cuenta aquí para no hacer una consulta por fila en el cliente.
      reservasActivas: sql<number>`(
        select count(*)::int from ${reservas} v
        where v.regalo_id = ${regalos.id} and v.estado = 'activa'
      )`,
    })
    .from(regalos)
    .innerJoin(categorias, eq(regalos.categoriaId, categorias.id))
    .orderBy(asc(categorias.orden), asc(regalos.orden));

  const cats = await db
    .select({ id: categorias.id, nombre: categorias.nombre })
    .from(categorias)
    .orderBy(asc(categorias.orden));

  return <AdminRegalos regalos={filas as RegaloAdmin[]} categorias={cats} />;
}
