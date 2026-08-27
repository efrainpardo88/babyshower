"use client";

import { useSyncExternalStore } from "react";

/**
 * La cuenta regresiva de la invitación.
 *
 * El reloj es un almacén EXTERNO a React, igual que `localStorage`, así que va
 * con `useSyncExternalStore` y no con `useState` + `useEffect`. Esa era la forma
 * obvia y tenía dos problemas: disparaba `setState` dentro de un efecto —lo que
 * provoca renders en cascada y ESLint marca— y obligaba a un doble render para
 * no desajustar la hidratación.
 *
 * Con esta API el servidor devuelve 0 (se pinta «--»), el cliente toma la hora
 * real después de hidratar, y React se encarga de que no haya desajuste.
 *
 * El intervalo es UNO solo para toda la página, no uno por instancia: se crea
 * con el primer suscriptor y se apaga cuando se va el último.
 */

const UNIDADES = [
  ["dias", "Días"],
  ["horas", "Horas"],
  ["minutos", "Minutos"],
  ["segundos", "Segundos"],
] as const;

/* ------------------------------------------------------------------ */
/* El reloj como almacén externo */

const oyentes = new Set<() => void>();
let reloj: ReturnType<typeof setInterval> | null = null;
let ahora = 0;

function suscribir(alCambiar: () => void): () => void {
  oyentes.add(alCambiar);
  if (!reloj) {
    reloj = setInterval(() => {
      ahora = Date.now();
      for (const f of oyentes) f();
    }, 1000);
  }
  return () => {
    oyentes.delete(alCambiar);
    if (oyentes.size === 0 && reloj) {
      clearInterval(reloj);
      reloj = null;
    }
  };
}

/**
 * Tiene que devolver el MISMO valor mientras nada cambie, o React entra en un
 * bucle infinito de renders. Por eso `Date.now()` se guarda en `ahora` y solo
 * se actualiza desde el intervalo, nunca aquí.
 */
function snapshot(): number {
  if (ahora === 0) ahora = Date.now();
  return ahora;
}

/** En el servidor no hay reloj que valga: se pinta el marcador. */
function snapshotServidor(): number {
  return 0;
}

function restante(hasta: number, desde: number) {
  const ms = Math.max(0, hasta - desde);
  const s = Math.floor(ms / 1000);
  return {
    dias: Math.floor(s / 86400),
    horas: Math.floor((s % 86400) / 3600),
    minutos: Math.floor((s % 3600) / 60),
    segundos: s % 60,
  };
}

/* ------------------------------------------------------------------ */

export function CuentaRegresiva({ fechaIso }: { fechaIso: string }) {
  const hasta = new Date(fechaIso).getTime();
  const desde = useSyncExternalStore(suscribir, snapshot, snapshotServidor);
  const t = desde === 0 ? null : restante(hasta, desde);

  return (
    <div className="mt-2 flex w-full flex-col items-center gap-4 rounded-[26px] border border-linea px-6 py-6 sm:w-auto sm:px-[clamp(36px,2.6vw,52px)]">
      <span className="caps text-[11px] sm:text-[clamp(13px,0.93vw,18px)]">
        Faltan para el gran día
      </span>
      <div className="flex items-center gap-5 sm:gap-[clamp(32px,2.3vw,48px)]">
        {UNIDADES.map(([clave, etiqueta], i) => (
          <div key={clave} className="flex items-center gap-5 sm:gap-[clamp(32px,2.3vw,48px)]">
            {i > 0 && <div className="h-9 w-px bg-linea-fuerte" aria-hidden="true" />}
            <div className="flex flex-col items-center gap-1">
              <span className="font-serif text-[30px] leading-none font-semibold tabular-nums lining-nums text-tinta-2 sm:text-[clamp(38px,2.71vw,53px)]">
                {t ? String(t[clave]).padStart(2, "0") : "--"}
              </span>
              <span className="caps text-[9px] sm:text-[clamp(10px,0.71vw,14px)]">{etiqueta}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
