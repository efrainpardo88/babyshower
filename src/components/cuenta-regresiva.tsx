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
    <div className="panel mt-2 flex w-full flex-col items-center gap-4 px-6 py-6 sm:w-auto sm:px-9">
      <span className="caps text-[11px] sm:text-[13px]">Faltan para el gran día</span>
      <div className="flex items-center gap-5 sm:gap-8">
        {UNIDADES.map(([clave, etiqueta], i) => (
          <div key={clave} className="flex items-center gap-5 sm:gap-8">
            {i > 0 && <div className="h-9 w-px bg-linea-fuerte" aria-hidden="true" />}
            <div className="flex flex-col items-center gap-1">
              <span className="font-serif text-[30px] leading-none font-semibold tabular-nums text-tinta-2 sm:text-[38px]">
                {t ? String(t[clave]).padStart(2, "0") : "--"}
              </span>
              <span className="caps text-[9px] sm:text-[10px]">{etiqueta}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
