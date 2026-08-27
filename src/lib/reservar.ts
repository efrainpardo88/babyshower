// A propósito SIN `import "server-only"`: ese paquete lanza al importarse fuera
// de Next, y dejaría sin poder probar la pieza más crítica del proyecto. Lo que
// impide que esto llegue al navegador es que importa `postgres`, que no compila
// en cliente. La prueba vive en `scripts/prueba-reservas.ts`.
import { and, eq, sql } from "drizzle-orm";
import { db } from "./db";
import { categorias, regalos, reservas } from "./db/schema";

/**
 * LA pieza crítica del proyecto: convertir una selección en reservas sin que dos
 * invitados se lleven el mismo regalo.
 *
 * La garantía NO la da este código, la da Postgres. Tres capas, en orden:
 *
 *  1. `SELECT … FOR UPDATE` sobre la fila del regalo, dentro de la transacción.
 *     Serializa a todos los que intenten ese mismo regalo: el segundo espera a
 *     que el primero termine, y cuando entra ya ve la reserva del primero.
 *  2. Se cuentan las reservas activas y se valida contra el `modo`.
 *  3. El índice parcial `reservas_unico_activo_idx` es la red de seguridad. Si
 *     algo se nos escapa, el INSERT falla y el regalo se reporta como caído.
 *
 * DOS DECISIONES QUE PARECEN DETALLE Y NO LO SON:
 *
 * · **Se bloquea en orden alfabético de slug.** Si Ana pide [bañera, coche] y
 *   Luis pide [coche, bañera] al mismo tiempo, y cada uno bloquea en el orden en
 *   que los pidió, se quedan esperándose mutuamente para siempre. Ordenar hace
 *   que todos tomen los candados en la misma secuencia, y el interbloqueo deja
 *   de ser posible.
 *
 * · **Cada regalo va en su propio SAVEPOINT.** Un error de constraint aborta la
 *   transacción entera en Postgres; con el savepoint solo se deshace ESE regalo
 *   y los demás siguen. Es lo que permite el «Reservamos 2 de 3» del diseño en
 *   vez de perder todo el envío. Ver .claude/docs/diseno/Reserva.png.
 *
 * Solo hay dos modos: `unico` (uno lo toma y sale de circulación) y `multiple`
 * (sin tope, nunca se agota). Un `multiple`, por tanto, nunca puede caerse.
 */

export type ItemSolicitado = {
  slug: string;
  cantidad: number;
};

export type DatosInvitado = {
  nombre: string;
  email: string;
  telefono?: string | null;
  mensaje?: string | null;
};

export type Confirmado = {
  slug: string;
  nombre: string;
  cantidad: number;
  modo: "unico" | "multiple";
};

export type Caido = {
  slug: string;
  nombre: string;
  motivo: "ya-reservado" | "no-existe";
  categoriaNombre: string;
  /** Cuántos regalos siguen disponibles en esa misma categoría. */
  quedanEnCategoria: number;
};

export type Resultado = {
  /** El identificador del envío. Es la URL del comprobante: `/reserva/{lote}`. */
  lote: string | null;
  confirmados: Confirmado[];
  caidos: Caido[];
};

/** El 23505 de Postgres es «unique_violation»: chocó contra el índice parcial. */
function esChoqueDeUnicidad(e: unknown): boolean {
  return typeof e === "object" && e !== null && "code" in e && (e as { code: unknown }).code === "23505";
}

export async function reservarSeleccion(
  items: ItemSolicitado[],
  invitado: DatosInvitado,
): Promise<Resultado> {
  const pedidos = items
    .filter((i) => i.cantidad > 0)
    // Ver la nota de arriba: el orden evita el interbloqueo.
    .sort((a, b) => a.slug.localeCompare(b.slug));

  if (pedidos.length === 0) return { lote: null, confirmados: [], caidos: [] };

  const confirmados: Confirmado[] = [];
  const caidos: Caido[] = [];
  const email = invitado.email.trim().toLowerCase();

  const lote = await db.transaction(async (tx) => {
    const [{ nuevo }] = await tx.execute<{ nuevo: string }>(sql`select gen_random_uuid() as nuevo`);

    for (const pedido of pedidos) {
      // 1 · Bloquear la fila del regalo. Todo lo que sigue ve un estado estable.
      const [regalo] = await tx
        .select({ id: regalos.id, nombre: regalos.nombre, modo: regalos.modo })
        .from(regalos)
        .where(and(eq(regalos.slug, pedido.slug), eq(regalos.publicado, true)))
        .for("update");

      if (!regalo) {
        caidos.push({
          slug: pedido.slug,
          nombre: pedido.slug,
          motivo: "no-existe",
          categoriaNombre: "",
          quedanEnCategoria: 0,
        });
        continue;
      }

      // 2 · Un 'unico' ya tomado se cae. Un 'multiple' nunca: no tiene tope.
      if (regalo.modo === "unico") {
        const [{ tomadas }] = await tx.execute<{ tomadas: number }>(sql`
          select count(*)::int as tomadas from ${reservas}
          where regalo_id = ${regalo.id} and estado = 'activa'
        `);
        if (tomadas > 0) {
          caidos.push(await describirCaida(tx, regalo.id, regalo.nombre, pedido.slug));
          continue;
        }
      }

      // 3 · Insertar, con la red de seguridad puesta.
      try {
        await tx.transaction(async (paso) => {
          await paso.insert(reservas).values({
            regaloId: regalo.id,
            lote: nuevo,
            nombre: invitado.nombre.trim(),
            email,
            telefono: invitado.telefono?.trim() || null,
            mensaje: invitado.mensaje?.trim() || null,
            cantidad: regalo.modo === "multiple" ? pedido.cantidad : 1,
            // Desnormalizado a propósito: el índice parcial no puede mirar otra tabla.
            esUnico: regalo.modo === "unico",
          });
        });
      } catch (e) {
        if (!esChoqueDeUnicidad(e)) throw e;
        caidos.push(await describirCaida(tx, regalo.id, regalo.nombre, pedido.slug));
        continue;
      }

      confirmados.push({
        slug: pedido.slug,
        nombre: regalo.nombre,
        cantidad: regalo.modo === "multiple" ? pedido.cantidad : 1,
        modo: regalo.modo,
      });
    }

    return nuevo;
  });

  return {
    lote: confirmados.length > 0 ? lote : null,
    confirmados,
    caidos,
  };
}

/**
 * Un regalo que se cayó necesita más que un «no se pudo»: el diseño ofrece salida
 * inmediata («Quedan 4 regalos disponibles en Baño y cuidado»). Para eso hace
 * falta saber en qué categoría estaba y cuántos siguen libres ahí.
 */
async function describirCaida(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  regaloId: string,
  nombreRegalo: string,
  slug: string,
): Promise<Caido> {
  const [cat] = await tx
    .select({ id: categorias.id, nombre: categorias.nombre })
    .from(categorias)
    .innerJoin(regalos, eq(regalos.categoriaId, categorias.id))
    .where(eq(regalos.id, regaloId));

  if (!cat) {
    return {
      slug,
      nombre: nombreRegalo,
      motivo: "ya-reservado",
      categoriaNombre: "",
      quedanEnCategoria: 0,
    };
  }

  // Un 'multiple' siempre está disponible; un 'unico' solo si nadie lo tomó.
  const [{ quedan }] = await tx.execute<{ quedan: number }>(sql`
    select count(*)::int as quedan
    from ${regalos} r
    where r.categoria_id = ${cat.id}
      and r.publicado = true
      and r.id <> ${regaloId}
      and (
        r.modo = 'multiple'
        or not exists (
          select 1 from ${reservas} v
          where v.regalo_id = r.id and v.estado = 'activa')
      )
  `);

  return {
    slug,
    nombre: nombreRegalo,
    motivo: "ya-reservado",
    categoriaNombre: cat.nombre,
    quedanEnCategoria: quedan,
  };
}
