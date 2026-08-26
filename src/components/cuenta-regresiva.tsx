"use client";

import { useEffect, useState } from "react";

const UNIDADES = [
  ["dias", "Días"],
  ["horas", "Horas"],
  ["minutos", "Minutos"],
  ["segundos", "Segundos"],
] as const;

function restante(hasta: number) {
  const ms = Math.max(0, hasta - Date.now());
  const s = Math.floor(ms / 1000);
  return {
    dias: Math.floor(s / 86400),
    horas: Math.floor((s % 86400) / 3600),
    minutos: Math.floor((s % 3600) / 60),
    segundos: s % 60,
  };
}

export function CuentaRegresiva({ fechaIso }: { fechaIso: string }) {
  const hasta = new Date(fechaIso).getTime();
  // Arranca en null para que el servidor y el cliente pinten lo mismo en el primer render.
  const [t, setT] = useState<ReturnType<typeof restante> | null>(null);

  useEffect(() => {
    setT(restante(hasta));
    const id = setInterval(() => setT(restante(hasta)), 1000);
    return () => clearInterval(id);
  }, [hasta]);

  return (
    <div className="mt-2 flex w-full flex-col items-center gap-4 rounded-[26px] border border-linea px-6 py-6 sm:w-auto sm:px-[clamp(36px,2.6vw,52px)]">
      <span className="caps text-[11px] sm:text-[clamp(13px,0.93vw,18px)]">Faltan para el gran día</span>
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
