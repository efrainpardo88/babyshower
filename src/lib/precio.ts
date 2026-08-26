/**
 * Precios para el invitado.
 *
 * Desde el 25/08/2026 mostramos el rango real en pesos — ver .claude/docs/decisiones.md.
 * Toda cifra que vea el invitado pasa por aquí: si se formatea a mano en un
 * componente, tarde o temprano un renglón queda con separador distinto.
 *
 * El rango orienta, no factura. Nunca sale de aquí un "total a pagar".
 */

/** Como viene de la base. O van los dos, o no va ninguno. */
export type RangoPrecio = {
  precioMin: number | null;
  precioMax: number | null;
};

const MILES = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });

/** `$20.000`. COP no usa decimales en la práctica. */
export function formatearPeso(valor: number): string {
  return `$${MILES.format(Math.round(valor))}`;
}

/** Ambos extremos cargados, en el orden correcto. `null` si el regalo no tiene rango. */
function extremos(rango: RangoPrecio): [number, number] | null {
  const { precioMin: min, precioMax: max } = rango;
  if (min == null || max == null) return null;
  return min <= max ? [min, max] : [max, min];
}

/**
 * «Entre $20.000 y $80.000» — el renglón de la tarjeta y de la ficha.
 * `null` cuando el regalo todavía no tiene rango: ahí la tarjeta cae a `nivelPrecio`.
 */
export function formatearRango(rango: RangoPrecio): string | null {
  const par = extremos(rango);
  if (!par) return null;
  const [min, max] = par;
  if (min === max) return `Alrededor de ${formatearPeso(min)}`;
  return `Entre ${formatearPeso(min)} y ${formatearPeso(max)}`;
}

/** «$20.000 – $80.000» — para el panel de selección, donde no cabe el renglón largo. */
export function formatearRangoCorto(rango: RangoPrecio): string | null {
  const par = extremos(rango);
  if (!par) return null;
  const [min, max] = par;
  if (min === max) return formatearPeso(min);
  return `${formatearPeso(min)} – ${formatearPeso(max)}`;
}

export type RangoSumado = {
  min: number;
  max: number;
  /** Cuántos de la selección no tienen rango cargado. El panel lo dice en voz alta. */
  sinRango: number;
};

/**
 * Suma los rangos de la selección para el renglón «Rango de la selección».
 * Los regalos sin rango no se inventan: se cuentan aparte y el panel avisa
 * que el estimado se queda corto. `null` si ninguno tenía rango.
 */
export function sumarRangos(items: RangoPrecio[]): RangoSumado | null {
  let min = 0;
  let max = 0;
  let sinRango = 0;
  let algunoConRango = false;

  for (const item of items) {
    const par = extremos(item);
    if (!par) {
      sinRango += 1;
      continue;
    }
    algunoConRango = true;
    min += par[0];
    max += par[1];
  }

  return algunoConRango ? { min, max, sinRango } : null;
}
