"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { reservas } from "@/lib/db/schema";
import { reservarSeleccion, type ItemSolicitado, type Resultado } from "@/lib/reservar";

/**
 * La acción de servidor que ejecuta la reserva.
 *
 * TODO lo que llega del navegador se valida aquí otra vez. El formulario ya
 * valida, pero eso es cortesía para el invitado, no seguridad: cualquiera puede
 * llamar a esta acción con lo que quiera. Ver CLAUDE.md — la garantía la da el
 * servidor, nunca el cliente.
 */

export type RespuestaReserva =
  | { estado: "ok"; resultado: Resultado }
  | { estado: "invalido"; mensaje: string }
  | { estado: "error"; mensaje: string };

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function confirmarReserva(
  items: ItemSolicitado[],
  invitado: { nombre: string; email: string; telefono: string; mensaje: string },
): Promise<RespuestaReserva> {
  const nombre = invitado.nombre?.trim() ?? "";
  const email = invitado.email?.trim() ?? "";

  if (nombre.length < 2) {
    return { estado: "invalido", mensaje: "Escribe tu nombre para saber de quién es el regalo." };
  }
  if (!CORREO.test(email)) {
    return { estado: "invalido", mensaje: "Revisa el correo: ahí te mandamos el enlace de tu reserva." };
  }
  if (!Array.isArray(items) || items.length === 0) {
    return { estado: "invalido", mensaje: "No hay nada seleccionado." };
  }

  // Un envío no puede traer 500 regalos: la lista tiene 26.
  const limpios: ItemSolicitado[] = items
    .filter((i) => typeof i?.slug === "string" && i.slug.length > 0)
    .slice(0, 26)
    .map((i) => ({
      slug: i.slug,
      cantidad: Number.isFinite(i.cantidad) ? Math.min(Math.max(1, Math.floor(i.cantidad)), 20) : 1,
    }));

  if (limpios.length === 0) {
    return { estado: "invalido", mensaje: "No hay nada seleccionado." };
  }

  try {
    const resultado = await reservarSeleccion(limpios, {
      nombre,
      email,
      telefono: invitado.telefono?.trim() || null,
      mensaje: invitado.mensaje?.trim() || null,
    });

    // La lista muestra estados que acaban de cambiar: hay que refrescarla.
    revalidatePath("/lista");

    return { estado: "ok", resultado };
  } catch (e) {
    console.error("Falló la reserva:", e);
    return {
      estado: "error",
      mensaje: "Algo se cayó de nuestro lado y no se guardó nada. Vuelve a intentarlo en un momento.",
    };
  }
}

/**
 * Cancelar una reserva libera el regalo: el índice parcial solo cuenta las
 * activas, así que en cuanto pasa a 'cancelada' otro invitado puede tomarlo.
 *
 * No se borra la fila. Queda el rastro de quién había reservado qué, que es
 * justo lo que los papás van a querer mirar después.
 */
export async function cancelarReserva(id: string): Promise<{ ok: boolean; mensaje: string }> {
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID.test(id)) return { ok: false, mensaje: "Reserva no válida." };

  try {
    const filas = await db
      .update(reservas)
      .set({ estado: "cancelada" })
      .where(and(eq(reservas.id, id), eq(reservas.estado, "activa")))
      .returning({ lote: reservas.lote });

    if (filas.length === 0) return { ok: false, mensaje: "Esa reserva ya no estaba activa." };

    revalidatePath("/lista");
    revalidatePath(`/reserva/${filas[0].lote}`);
    return { ok: true, mensaje: "Listo" };
  } catch (e) {
    console.error("Falló la cancelación:", e);
    return { ok: false, mensaje: "No se pudo. Intenta de nuevo." };
  }
}
