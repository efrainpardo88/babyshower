"use client";

/**
 * La galería de la revelación de género, con visor a pantalla completa.
 *
 * LAS POLAROID SON EL ÍNDICE, NO LA FOTO. En la landing se ven a 92px de ancho
 * en celular: eso alcanza para saber que hay fotos, no para verlas. Al tocar una
 * se abre el visor, que es donde de verdad se miran.
 *
 * NAVEGAR TIENE QUE SER OBVIO EN CELULAR, que es como se va a abrir esto casi
 * siempre. Por eso hay tres formas de pasar de foto y ninguna depende de acertar
 * en un botón pequeño:
 *  · deslizar con el dedo a izquierda o derecha
 *  · las flechas ‹ › , de 48px, separadas del borde
 *  · las teclas ← → en computador
 * Y tres de salir: la ×, la tecla Escape y tocar el fondo.
 *
 * Da la vuelta a propósito: después de la última se vuelve a la primera. En una
 * galería de seis fotos, toparse con una pared es más raro que seguir de largo.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useScrollBloqueado } from "@/lib/bloquear-scroll";

export type FotoGaleria = {
  titulo: string;
  /** La inclinación de la polaroid. Decorativa. */
  rot: string;
  /** Color de relleno mientras no haya foto de verdad. */
  tinte: string;
  url?: string;
};

/** Menos que esto es un toque tembloroso, no un deslizamiento. */
const MINIMO_DESLIZ = 45;

/* ------------------------------------------------------------------ */

function MarcadorSinFoto({ titulo }: { titulo: string }) {
  return (
    <>
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <circle cx="8.5" cy="10" r="1.8" />
        <path d="m4 17 4.5-4.5 3.5 3.5 3-3L20 17" />
      </svg>
      <figcaption className="px-2 text-center font-ui text-[8px] font-bold tracking-[.12em] uppercase">
        {titulo}
      </figcaption>
    </>
  );
}

function Polaroid({ foto, onAbrir }: { foto: FotoGaleria; onAbrir?: () => void }) {
  const marco = (
    <div
      className={`${foto.url ? "" : foto.tinte} flex h-[112px] w-[92px] flex-col items-center justify-center gap-1.5 overflow-hidden text-tinta/30 sm:h-[clamp(164px,11.7vw,220px)] sm:w-[clamp(136px,9.7vw,182px)]`}
    >
      {foto.url ? (
        // eslint-disable-next-line @next/next/no-img-element -- la URL viene de la base, no del build
        <img src={foto.url} alt={foto.titulo} className="h-full w-full object-cover" />
      ) : (
        <MarcadorSinFoto titulo={foto.titulo} />
      )}
    </div>
  );

  return (
    <figure
      className={`${foto.rot} -ml-2 rounded-sm bg-papel p-2 pb-6 shadow-[0_6px_20px_-10px_rgba(90,74,51,.45)] first:ml-0`}
    >
      {/* Solo se puede abrir lo que existe: un marcador de color no tiene nada
          que ampliar, y hacerlo botón prometería algo que no va a pasar. */}
      {foto.url && onAbrir ? (
        <button
          type="button"
          onClick={onAbrir}
          aria-label={`Ver «${foto.titulo}» en grande`}
          className="block cursor-zoom-in"
        >
          {marco}
        </button>
      ) : (
        marco
      )}
    </figure>
  );
}

/* ------------------------------------------------------------------ */

function Flecha({
  hacia,
  onClick,
}: {
  hacia: "anterior" | "siguiente";
  onClick: () => void;
}) {
  const anterior = hacia === "anterior";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={anterior ? "Foto anterior" : "Foto siguiente"}
      className={`absolute top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-linea bg-papel/90 text-tinta-3 transition hover:bg-papel ${
        anterior ? "left-2 sm:left-5" : "right-2 sm:right-5"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={anterior ? "m15 5-7 7 7 7" : "m9 5 7 7-7 7"} />
      </svg>
    </button>
  );
}

function Visor({
  fotos,
  indice,
  onIr,
  onCerrar,
}: {
  fotos: FotoGaleria[];
  indice: number;
  onIr: (i: number) => void;
  onCerrar: () => void;
}) {
  const foto = fotos[indice];
  const sola = fotos.length < 2;

  const mover = useCallback(
    (paso: number) => onIr((indice + paso + fotos.length) % fotos.length),
    [indice, fotos.length, onIr],
  );

  useScrollBloqueado(true);

  useEffect(() => {
    const alTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
      else if (e.key === "ArrowLeft") mover(-1);
      else if (e.key === "ArrowRight") mover(1);
    };
    window.addEventListener("keydown", alTecla);
    return () => window.removeEventListener("keydown", alTecla);
  }, [mover, onCerrar]);

  /**
   * La siguiente y la anterior se piden por adelantado. Son fotos de 2400px:
   * sin esto, cada paso en datos móviles deja un hueco en blanco de un segundo.
   */
  useEffect(() => {
    for (const paso of [-1, 1]) {
      const vecina = fotos[(indice + paso + fotos.length) % fotos.length];
      if (vecina?.url) new Image().src = vecina.url;
    }
  }, [indice, fotos]);

  const inicioX = useRef<number | null>(null);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Foto ${indice + 1} de ${fotos.length}: ${foto.titulo}`}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      onTouchStart={(e) => {
        inicioX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (inicioX.current === null) return;
        const recorrido = e.changedTouches[0].clientX - inicioX.current;
        inicioX.current = null;
        if (!sola && Math.abs(recorrido) > MINIMO_DESLIZ) mover(recorrido < 0 ? 1 : -1);
      }}
    >
      {/* El fondo cierra. Va antes en el DOM para quedar por debajo de la foto. */}
      <button
        type="button"
        aria-label="Cerrar la galería"
        onClick={onCerrar}
        className="absolute inset-0 cursor-zoom-out bg-tinta/85"
      />

      <figure className="relative m-0 flex max-h-full max-w-full flex-col items-center gap-3 px-4 py-4">
        {foto.url && (
          // eslint-disable-next-line @next/next/no-img-element -- la URL viene de la base, no del build
          <img
            key={foto.url}
            src={foto.url}
            alt={foto.titulo}
            /* `object-contain` y nada de recorte: es el único sitio donde la
               foto se ve entera. Se le da todo el alto que queda libre después
               del pie y los márgenes. */
            className="max-h-[82vh] w-auto max-w-full rounded-[10px] object-contain shadow-[0_18px_60px_-20px_rgba(0,0,0,.8)] select-none"
            draggable={false}
          />
        )}
        <figcaption className="flex flex-col items-center gap-1 text-center">
          <span className="caps text-[11px] !text-papel">{foto.titulo}</span>
          {!sola && (
            <span className="font-ui text-[12px] tabular-nums text-papel/60">
              {indice + 1} / {fotos.length}
            </span>
          )}
        </figcaption>
      </figure>

      {!sola && (
        <>
          <Flecha hacia="anterior" onClick={() => mover(-1)} />
          <Flecha hacia="siguiente" onClick={() => mover(1)} />
        </>
      )}

      <button
        type="button"
        onClick={onCerrar}
        aria-label="Cerrar la galería"
        className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full border border-linea bg-papel text-[17px] text-tinta-3"
      >
        ×
      </button>

      {!sola && (
        <p className="absolute bottom-4 m-0 px-4 text-center font-ui text-[11px] text-papel/45 sm:hidden">
          Desliza para ver las demás
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function Galeria({ fotos }: { fotos: FotoGaleria[] }) {
  const [abierta, setAbierta] = useState<number | null>(null);

  /**
   * El visor solo navega entre fotos DE VERDAD. Mientras no hayan subido nada,
   * la landing muestra marcadores de color y no hay nada que abrir.
   */
  const reales = fotos.filter((f) => f.url);

  return (
    <>
      <div className="mt-5 flex flex-wrap items-center justify-center pl-2 lg:justify-start">
        {fotos.map((f, i) => (
          <Polaroid
            key={`${f.titulo}-${i}`}
            foto={f}
            onAbrir={f.url ? () => setAbierta(reales.indexOf(f)) : undefined}
          />
        ))}
      </div>

      {abierta !== null && reales[abierta] && (
        <Visor
          fotos={reales}
          indice={abierta}
          onIr={setAbierta}
          onCerrar={() => setAbierta(null)}
        />
      )}
    </>
  );
}
