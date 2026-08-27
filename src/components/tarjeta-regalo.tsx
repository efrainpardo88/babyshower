"use client";

/**
 * La tarjeta de regalo — el componente del que cuelga todo el sitio público.
 *
 * Especificación visual: `.claude/docs/diseno/EstadosTarjeta.png` (los estados),
 * `.claude/docs/diseno/Main.png` (escritorio) y `.claude/docs/diseno/ListaMovil.png`
 * (390px, donde la tarjeta se acuesta: foto a la izquierda y contenido a la derecha).
 *
 * Dos reglas que no se negocian:
 *  · El estado se lee por COLOR y por TEXTO. Nadie tiene que distinguir verde de
 *    azul para entender qué pasa: la píldora siempre lo dice con letras.
 *  · La píldora dice qué PASÓ; el botón dice qué VA A PASAR.
 *
 * DOS DIVERGENCIAS CON EL PNG, ambas deliberadas:
 *  · Donde el diseño dibuja el glifo de tres pesos va el rango real
 *    («Entre $20.000 y $80.000») — decisión del 25/08/2026.
 *  · Los estados «entre varios» y «N de M cupos» ya no existen: el 26/08/2026 se
 *    eliminaron el modo de grupo y los cupos. Quedan cuatro estados, no seis.
 *
 * Ver .claude/docs/decisiones.md.
 */

import { calcularEstado, type EstadoRegalo, type RegaloParaEstado } from "@/lib/estado-regalo";
import { formatearRango, type RangoPrecio } from "@/lib/precio";

export type RegaloTarjeta = RegaloParaEstado &
  RangoPrecio & {
    slug: string;
    nombre: string;
    categoriaNombre: string;
    imagenUrl: string | null;
    /** Respaldo cuando el regalo todavía no tiene rango cargado. */
    nivelPrecio: "$" | "$$" | "$$$";
  };

type Props = {
  regalo: RegaloTarjeta;
  /** El cuarto estado. Es del navegador de este invitado, no del servidor. */
  enSeleccion?: boolean;
  onEscoger?: (slug: string) => void;
  onQuitar?: (slug: string) => void;
};

/* ------------------------------------------------------------------ */
/* Paleta por estado. Todo sale de globals.css; aquí no hay colores nuevos. */

type Familia = "azul" | "gris" | "salvia";

const PALETA: Record<Familia, { foto: string; pildora: string; boton: string }> = {
  azul: {
    foto: "bg-linear-to-br from-azul-50 to-azul-200",
    pildora: "bg-azul-50 text-azul border-azul-200",
    boton: "bg-azul text-papel hover:bg-[#456073]",
  },
  gris: {
    foto: "bg-linear-to-br from-oso-claro to-gris-fondo",
    pildora: "bg-gris-fondo text-gris-texto border-linea-fuerte",
    boton: "bg-gris-fondo text-gris-texto cursor-not-allowed",
  },
  salvia: {
    foto: "bg-linear-to-br from-salvia-100 to-salvia-linea",
    pildora: "bg-salvia-100 text-salvia border-salvia-linea",
    boton: "bg-azul text-papel hover:bg-[#456073]",
  },
};

/** Qué familia de color le toca a cada estado. El color codifica, no decora. */
function familiaDe(estado: EstadoRegalo): Familia {
  switch (estado.tipo) {
    case "reservado":
      return "gris";
    case "sin-limite":
      return "salvia";
    default:
      return "azul";
  }
}

/**
 * El texto de la píldora: qué pasó con este regalo.
 * Cuando está en la selección, la píldora la reemplaza «En tu selección». Es
 * justo el estado que evita el error de creer que ya reservaste, así que no
 * puede seguir diciendo «Disponible».
 */
function textoPildora(estado: EstadoRegalo): string {
  switch (estado.tipo) {
    case "disponible":
      return "Disponible";
    case "reservado":
      return "Ya lo reservaron";
    case "sin-limite":
      return estado.tomados > 0
        ? `Siempre disponible · ${estado.tomados} ya lo escogieron`
        : "Siempre disponible";
  }
}

/* ------------------------------------------------------------------ */
/* Piezas */

function Foto({
  tinte,
  imagenUrl,
  nombre,
}: {
  tinte: string;
  imagenUrl: string | null;
  nombre: string;
}) {
  if (imagenUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- las fotos de producto son URLs externas que carga el panel
    return <img src={imagenUrl} alt={nombre} className="h-full w-full object-cover" />;
  }
  return (
    <div className={`flex h-full w-full flex-col items-center justify-center gap-1 text-tinta/25 ${tinte}`}>
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
      <span className="caps text-[9px] text-tinta/35">Foto</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function TarjetaRegalo({ regalo, enSeleccion = false, onEscoger, onQuitar }: Props) {
  const estado = calcularEstado(regalo);
  const paleta = PALETA[familiaDe(estado)];
  const reservado = estado.tipo === "reservado";

  // El rango real reemplaza al glifo del PNG. Sin rango cargado, cae a nivelPrecio.
  const rango = formatearRango(regalo);

  return (
    <article
      className={`flex gap-4 overflow-hidden rounded-[20px] bg-papel p-3 text-left transition sm:block sm:p-0 ${
        enSeleccion
          ? "border-2 border-azul shadow-[0_4px_18px_-8px_rgba(79,110,133,.5)]"
          : "border border-linea shadow-[0_3px_14px_-10px_rgba(90,74,51,.5)]"
      } ${reservado ? "opacity-80" : ""}`}
    >
      {/* Foto: a la izquierda en móvil, arriba desde sm — ver ListaMovil.png */}
      <div className="relative h-[125px] w-[86px] shrink-0 overflow-hidden rounded-xl sm:h-[130px] sm:w-full sm:rounded-none">
        <Foto tinte={paleta.foto} imagenUrl={regalo.imagenUrl} nombre={regalo.nombre} />
        {enSeleccion && (
          <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-azul text-papel">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m5 12.5 4.5 4.5L19 7.5" />
            </svg>
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:gap-2.5 sm:p-4 sm:pt-3.5">
        <p className="caps text-[10px]">{regalo.categoriaNombre}</p>

        <h3 className="font-serif text-[19px] leading-tight font-bold text-tinta">{regalo.nombre}</h3>

        {/* El renglón del precio: rango real, no glifo. */}
        <p className="font-ui text-[13px] text-tinta-4">
          {rango ?? (
            <>
              <span aria-hidden="true">{regalo.nivelPrecio}</span>
              <span className="sr-only">Precio por confirmar</span>
            </>
          )}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1.5 font-ui text-[12px] font-semibold ${
              enSeleccion ? PALETA.azul.pildora : paleta.pildora
            }`}
          >
            {enSeleccion ? "En tu selección" : textoPildora(estado)}
          </span>
        </div>

        <div className="mt-auto pt-1">
          {enSeleccion ? (
            <button
              type="button"
              onClick={() => onQuitar?.(regalo.slug)}
              className="h-12 w-full rounded-full border-[1.5px] border-azul bg-papel font-ui text-[15px] font-semibold text-azul transition hover:bg-azul-50"
            >
              Quitar de mi selección
            </button>
          ) : (
            <button
              type="button"
              disabled={reservado}
              onClick={() => onEscoger?.(regalo.slug)}
              className={`h-12 w-full rounded-full font-ui text-[15px] font-semibold transition ${paleta.boton}`}
            >
              {reservado ? "Ya lo reservaron" : "Lo regalo yo"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
