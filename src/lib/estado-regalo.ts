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

/** Una reserva activa, con lo mínimo para contar y para decir quién fue. */
export type ReservaActiva = {
  nombre: string;
  cantidad: number;
};

export type RegaloParaEstado = {
  modo: "unico" | "multiple" | "grupo";
  /** Solo 'multiple'. null = sin límite (pañitos, libros). */
  cuposMax: number | null;
  /** Solo 'grupo'. Cuántas personas esperamos que se apunten. */
  metaPersonas: number | null;
  reservas: ReservaActiva[];
};

/**
 * Los cinco estados que puede tener un regalo en el servidor.
 * El sexto de `.claude/docs/diseno/EstadosTarjeta.png` («En tu selección») no está aquí:
 * es del navegador de cada invitado, se superpone y no cambia lo que otros ven.
 */
export type EstadoRegalo =
  | { tipo: "disponible" }
  | { tipo: "reservado"; porQuien: string | null; motivo: "unico" | "sin-cupos" }
  | { tipo: "cupos"; tomados: number; total: number }
  | { tipo: "sin-limite"; tomados: number }
  | { tipo: "grupo"; apuntados: string[]; meta: number | null };

/** Los cupos los consume la cantidad, no el número de reservas: uno puede llevar dos. */
function contarCupos(reservas: ReservaActiva[]): number {
  return reservas.reduce((suma, r) => suma + Math.max(1, r.cantidad), 0);
}

export function calcularEstado(regalo: RegaloParaEstado): EstadoRegalo {
  const { modo, cuposMax, metaPersonas, reservas } = regalo;

  if (modo === "grupo") {
    return {
      tipo: "grupo",
      apuntados: reservas.map((r) => r.nombre),
      meta: metaPersonas,
    };
  }

  if (modo === "multiple") {
    const tomados = contarCupos(reservas);
    if (cuposMax == null) return { tipo: "sin-limite", tomados };
    if (tomados >= cuposMax) {
      // Se llenó. Se pinta como reservado — gris y atenuado — pero el texto
      // dice otra cosa: «Ya no quedan cupos», no «Ya lo reservaron».
      return { tipo: "reservado", porQuien: null, motivo: "sin-cupos" };
    }
    return { tipo: "cupos", tomados, total: cuposMax };
  }

  const primera = reservas[0];
  if (primera) {
    return { tipo: "reservado", porQuien: primera.nombre, motivo: "unico" };
  }
  return { tipo: "disponible" };
}

/** Si el invitado todavía puede sumarlo a su selección. */
export function sePuedeEscoger(estado: EstadoRegalo): boolean {
  return estado.tipo !== "reservado";
}
