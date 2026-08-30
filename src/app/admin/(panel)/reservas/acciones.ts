"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { regalos, reservas } from "@/lib/db/schema";
import { auth, esAdmin } from "@/lib/auth";
import { enviarCorreoDeReserva } from "@/lib/correo";

/**
 * Las dos acciones que los papás necesitan sobre una reserva ya hecha:
 * volver a mandarle el correo al invitado y borrarla.
 *
 * Ninguna de las dos existe en la parte pública, y es a propósito: el invitado
 * cancela (`estado = 'cancelada'`, queda el rastro) pero nunca borra ni reenvía.
 * Esto es el panel, que sí puede hacer las dos cosas.
 *
 * Cada acción vuelve a comprobar la sesión. El middleware ya cubre `/admin/*`,
 * pero una Server Action es una URL más: si mañana el middleware queda mal
 * configurado, esto sigue en pie. Misma regla que en `galeria/acciones.ts`.
 */

export type Respuesta = { ok: true; mensaje: string } | { ok: false; mensaje: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function exigirAdmin(): Promise<string | null> {
  const sesion = await auth();
  return esAdmin(sesion?.user?.email) ? null : "No tienes permiso.";
}

function refrescar(lote?: string): void {
  revalidatePath("/admin/reservas");
  revalidatePath("/admin");
  revalidatePath("/lista");
  if (lote) revalidatePath(`/reserva/${lote}`);
}

/**
 * Vuelve a mandar el correo del comprobante, opcionalmente a otra dirección.
 *
 * Se reenvía el LOTE entero, no la fila: el invitado recibió un solo correo con
 * toda su selección y un solo enlace, así que reenviar «la reserva de la bañera»
 * a secas le llegaría cojo. Se rearma el mismo correo que recibió el primer día.
 *
 * `guardarCorreo` existe porque el motivo número uno para reenviar es que el
 * correo estaba mal escrito. Si solo se cambiara el destinatario del envío, la
 * dirección equivocada seguiría en la base, en el CSV y en el próximo reenvío;
 * no hay otro sitio en el panel donde arreglarla. Se actualizan todas las filas
 * del lote porque el contacto es del envío, no de cada regalo.
 */
export async function reenviarReserva(
  id: string,
  destinatario: string,
  guardarCorreo: boolean,
): Promise<Respuesta> {
  const noPuede = await exigirAdmin();
  if (noPuede) return { ok: false, mensaje: noPuede };

  if (!UUID.test(id)) return { ok: false, mensaje: "Reserva no válida." };

  const para = destinatario.trim().toLowerCase();
  if (!CORREO.test(para)) return { ok: false, mensaje: "Revisa el correo del destinatario." };

  try {
    const [fila] = await db
      .select({ lote: reservas.lote, nombre: reservas.nombre })
      .from(reservas)
      .where(eq(reservas.id, id));

    if (!fila) return { ok: false, mensaje: "Esa reserva ya no existe." };

    const activas = await db
      .select({ nombre: regalos.nombre, cantidad: reservas.cantidad })
      .from(reservas)
      .innerJoin(regalos, eq(reservas.regaloId, regalos.id))
      .where(and(eq(reservas.lote, fila.lote), eq(reservas.estado, "activa")));

    if (activas.length === 0) {
      return {
        ok: false,
        mensaje: "No quedan regalos activos en esta reserva: no hay nada que reenviar.",
      };
    }

    // El correo se guarda ANTES de enviar: si el envío falla, la corrección de
    // la dirección no se pierde y el reintento ya sale con la buena.
    if (guardarCorreo) {
      await db.update(reservas).set({ email: para }).where(eq(reservas.lote, fila.lote));
      refrescar(fila.lote);
    }

    const salio = await enviarCorreoDeReserva({
      para,
      nombre: fila.nombre,
      lote: fila.lote,
      regalos: activas,
    });

    // `enviarCorreoDeReserva` nunca lanza: devuelve false y ya. Aquí sí importa
    // decirlo, porque el único fin de esta acción es que el correo salga.
    return salio
      ? { ok: true, mensaje: `Reenviado a ${para}` }
      : { ok: false, mensaje: "No se pudo enviar el correo. Revisa la configuración de Gmail." };
  } catch (e) {
    console.error("Falló el reenvío de la reserva:", e);
    return { ok: false, mensaje: "No se pudo reenviar. Intenta de nuevo." };
  }
}

/**
 * Borra la fila de verdad, no la marca como cancelada.
 *
 * Es la diferencia con `cancelarReserva`, que usa el invitado: ahí interesa el
 * rastro de quién había reservado qué. Esto es para lo otro — la prueba que
 * hicimos nosotros, el duplicado, la reserva que alguien pidió por WhatsApp que
 * quitáramos — donde dejar una fila «cancelada» solo ensucia la tabla y el CSV.
 *
 * Como el índice parcial solo cuenta las activas, borrar una reserva de un
 * regalo `unico` lo devuelve a la lista de inmediato. No hay deshacer.
 */
export async function eliminarReserva(id: string): Promise<Respuesta> {
  const noPuede = await exigirAdmin();
  if (noPuede) return { ok: false, mensaje: noPuede };

  if (!UUID.test(id)) return { ok: false, mensaje: "Reserva no válida." };

  try {
    const [fila] = await db
      .delete(reservas)
      .where(eq(reservas.id, id))
      .returning({ lote: reservas.lote });

    if (!fila) return { ok: false, mensaje: "Esa reserva ya no existe." };

    refrescar(fila.lote);
    return { ok: true, mensaje: "Reserva eliminada" };
  } catch (e) {
    console.error("Falló al eliminar la reserva:", e);
    return { ok: false, mensaje: "No se pudo eliminar. Intenta de nuevo." };
  }
}
