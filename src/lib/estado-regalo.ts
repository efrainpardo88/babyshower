/**
 * De los datos crudos al estado que se pinta en la tarjeta.
 *
 * Vive aparte del componente a propósito: la misma función la usan la grilla,
 * la ficha y el panel de administración, y así los tres cuentan igual.
 *
 * OJO: esto es para MOSTRAR. No es la validación de la reserva. La garantía
 * contra la doble reserva la da Postgres dentro de la transacción
 * (`SELECT ... FOR UPDATE` + `reservas_unico_activo_idx`) — ver CLAUDE.md.
 * Que aquí diga «disponible» no autoriza nada.
 */

/**
 * Una reserva activa. Solo la cantidad: quién reservó NO se manda al navegador.
 *
 * Antes la tarjeta decía «Lo reservó Carolina», así que el nombre de cada
 * invitado viajaba a la máquina de todos los demás. Se quitó el 26/08/2026 —
 * ver .claude/docs/decisiones.md.
 */
export type ReservaActiva = {
  cantidad: number;
};

export type RegaloParaEstado = {
  modo: "unico" | "multiple";
  reservas: ReservaActiva[];
};

/**
 * Los tres estados que puede tener un regalo en el servidor.
 *
 * El cuarto de la tarjeta («En tu selección») no está aquí: es del navegador de
 * cada invitado, se superpone y no cambia lo que otros ven.
 *
 * El 26/08/2026 desaparecieron dos estados: `grupo` (que llevaba la cuenta de
 * quiénes se apuntaban) y `cupos` (el «2 de 5»). Los repetibles ya no tienen
 * tope, así que nunca se agotan.
 */
export type EstadoRegalo =
  | { tipo: "disponible" }
  | { tipo: "reservado" }
  | { tipo: "sin-limite"; tomados: number };

/** Los repetibles cuentan por cantidad: uno puede llevar dos paquetes. */
function contarCupos(reservas: ReservaActiva[]): number {
  return reservas.reduce((suma, r) => suma + Math.max(1, r.cantidad), 0);
}

export function calcularEstado(regalo: RegaloParaEstado): EstadoRegalo {
  const { modo, reservas } = regalo;

  if (modo === "multiple") {
    // Sin tope: el contador es informativo, para que nadie sienta que llegó
    // tarde. Nunca se agota.
    return { tipo: "sin-limite", tomados: contarCupos(reservas) };
  }

  return reservas.length > 0 ? { tipo: "reservado" } : { tipo: "disponible" };
}

/** Si el invitado todavía puede sumarlo a su selección. */
export function sePuedeEscoger(estado: EstadoRegalo): boolean {
  return estado.tipo !== "reservado";
}
