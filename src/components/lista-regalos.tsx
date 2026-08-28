"use client";

/**
 * `/lista` — la grilla, los filtros y el panel de selección.
 *
 * Especificación visual: `.claude/docs/diseno/Main.png` (escritorio) y
 * `.claude/docs/diseno/ListaMovil.png` (390px, barra fija abajo).
 *
 * LA IDEA QUE SOSTIENE ESTA PANTALLA: nada queda apartado hasta el final. El
 * invitado acumula regalos en el panel —que vive en `localStorage`, no en la
 * base— y solo al confirmar escribe su nombre UNA vez. Ver .claude/docs/decisiones.md.
 *
 * Por eso el sexto estado de la tarjeta («En tu selección») es distinto de
 * «Reservado»: es el que evita que alguien crea que ya reservó y se vaya.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { TarjetaRegalo } from "@/components/tarjeta-regalo";
import { Corazon } from "@/components/ilustraciones";
import { calcularEstado, sePuedeEscoger } from "@/lib/estado-regalo";
import type { CategoriaConCuenta, RegaloDeLista } from "@/lib/regalos";
import { cambiarCantidad, escoger, quitar, useSeleccion } from "@/lib/seleccion";
import { BotonAsistencia } from "@/components/boton-asistencia";
import { useScrollBloqueado } from "@/lib/bloquear-scroll";

/* ------------------------------------------------------------------ */

function Pildora({
  activa,
  onClick,
  children,
}: {
  activa: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      className={`caps h-12 shrink-0 rounded-full border px-4 text-[11px] whitespace-nowrap transition sm:text-[12px] ${
        activa
          ? "border-azul bg-azul !text-papel"
          : "border-linea-fuerte bg-papel text-tinta-4 hover:bg-crema"
      }`}
    >
      {children}
    </button>
  );
}

/** Un renglón del panel. El paso de cantidad solo aparece donde tiene sentido. */
function RenglonSeleccion({
  regalo,
  cantidad,
  onCantidad,
  onQuitar,
}: {
  regalo: RegaloDeLista;
  cantidad: number;
  onCantidad: (n: number) => void;
  onQuitar: () => void;
}) {
  // Los repetibles no tienen tope. El 20 no es una regla del negocio: es un
  // límite de cordura para que nadie escriba 900 en el formulario.
  const tope = regalo.modo === "multiple" ? 20 : 1;

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-linea bg-papel p-2.5">
      <span
        className="h-11 w-11 shrink-0 rounded-xl bg-linear-to-br from-azul-50 to-azul-200"
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate font-serif text-[15px] font-bold text-tinta">{regalo.nombre}</p>
        <p className="m-0 truncate font-ui text-[11px] text-tinta-5">
          {regalo.especificacion ?? regalo.categoriaNombre}
        </p>
        {tope > 1 && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="caps text-[9px]">Cantidad</span>
            <button
              type="button"
              onClick={() => onCantidad(cantidad - 1)}
              disabled={cantidad <= 1}
              aria-label={`Quitar una unidad de ${regalo.nombre}`}
              className="h-11 w-11 rounded-full border border-linea-fuerte font-ui text-[15px] text-tinta-3 disabled:opacity-40"
            >
              −
            </button>
            <span className="w-6 text-center font-ui text-[13px] font-bold tabular-nums text-tinta-2">
              {cantidad}
            </span>
            <button
              type="button"
              onClick={() => onCantidad(cantidad + 1)}
              disabled={cantidad >= tope}
              aria-label={`Agregar una unidad de ${regalo.nombre}`}
              className="h-11 w-11 rounded-full border border-linea-fuerte font-ui text-[15px] text-tinta-3 disabled:opacity-40"
            >
              +
            </button>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onQuitar}
        aria-label={`Quitar ${regalo.nombre} de mi selección`}
        className="h-11 w-11 shrink-0 rounded-full bg-gris-fondo font-ui text-[15px] text-gris-texto transition hover:bg-linea-fuerte"
      >
        ×
      </button>
    </li>
  );
}

/* ------------------------------------------------------------------ */

export function ListaRegalos({
  regalos,
  categorias,
}: {
  regalos: RegaloDeLista[];
  categorias: CategoriaConCuenta[];
}) {
  const seleccion = useSeleccion();
  const [categoria, setCategoria] = useState<string | null>(null);
  const [soloDisponible, setSoloDisponible] = useState(false);
  const [panelAbierto, setPanelAbierto] = useState(false);

  /* Como capa que es, en móvil: la grilla de atrás no se desplaza y Escape sale. */
  useScrollBloqueado(panelAbierto, "(max-width: 1023px)");

  useEffect(() => {
    if (!panelAbierto) return;
    const alTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanelAbierto(false);
    };
    window.addEventListener("keydown", alTecla);
    return () => window.removeEventListener("keydown", alTecla);
  }, [panelAbierto]);

  const porSlug = useMemo(() => new Map(regalos.map((r) => [r.slug, r])), [regalos]);

  const visibles = useMemo(
    () =>
      regalos.filter((r) => {
        if (categoria && r.categoriaSlug !== categoria) return false;
        if (soloDisponible && !sePuedeEscoger(calcularEstado(r))) return false;
        return true;
      }),
    [regalos, categoria, soloDisponible],
  );

  const escogidos = useMemo(
    () =>
      Object.entries(seleccion)
        .map(([slug, cantidad]) => ({ regalo: porSlug.get(slug), cantidad }))
        .filter((x): x is { regalo: RegaloDeLista; cantidad: number } => Boolean(x.regalo)),
    [seleccion, porSlug],
  );

  const cuantos = escogidos.length;

  return (
    <main className="min-h-screen bg-crema">
      {/* ---------------- ENCABEZADO ---------------- */}
      <header className="sticky top-0 z-30 border-b border-linea bg-crema/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <div className="flex min-w-0 items-center gap-2.5">
            {/* Salida explícita: el título ya llevaba al inicio, pero nadie
                asume que un título sea un enlace. */}
            <Link
              href="/"
              aria-label="Volver a la invitación"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-linea-fuerte bg-papel text-tinta-3 no-underline transition hover:bg-crema"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 5 8 12l7 7" />
              </svg>
            </Link>
            <Link href="/" className="flex min-w-0 items-center gap-2.5 no-underline">
              <span className="hidden text-[#B08D6A] sm:block">
                <Corazon className="h-5 w-5" />
              </span>
              <span className="truncate font-serif text-[17px] font-bold text-tinta sm:text-[20px]">
                La lista de Benjamín
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPanelAbierto((v) => !v)}
              className="caps flex h-12 items-center gap-2 rounded-full border border-azul-200 bg-azul-50 px-4 text-[11px] !text-azul lg:hidden"
            >
              Mi selección · {cuantos}
            </button>
          </div>
        </div>

        {/* ---------------- FILTROS ---------------- */}
        <div className="mx-auto flex max-w-[1400px] items-center gap-2 overflow-x-auto px-5 pb-3 sm:px-8">
          <Pildora activa={categoria === null} onClick={() => setCategoria(null)}>
            Todo · {regalos.length}
          </Pildora>
          {categorias.map((c) => (
            <Pildora
              key={c.slug}
              activa={categoria === c.slug}
              onClick={() => setCategoria(c.slug)}
            >
              {c.nombre} · {c.cuenta}
            </Pildora>
          ))}
          <Pildora activa={soloDisponible} onClick={() => setSoloDisponible((v) => !v)}>
            Solo lo disponible
          </Pildora>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[1fr_340px] lg:items-start">
        {/* ---------------- GRILLA ---------------- */}
        <div>
          {visibles.length === 0 ? (
            <p className="m-0 py-16 text-center font-serif text-[18px] text-tinta-4">
              No hay regalos que cumplan con ese filtro.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibles.map((r) => (
                <TarjetaRegalo
                  key={r.slug}
                  regalo={r}
                  enSeleccion={seleccion[r.slug] != null}
                  onEscoger={escoger}
                  onQuitar={quitar}
                />
              ))}
            </div>
          )}
        </div>

        {/* ---------------- PANEL DE SELECCIÓN ---------------- */}
        {/* Fondo que cierra al tocarlo. Solo en móvil: en escritorio el panel
            convive con la grilla, no la tapa. */}
        {panelAbierto && (
          <button
            type="button"
            aria-label="Cerrar mi selección"
            onClick={() => setPanelAbierto(false)}
            className="fixed inset-0 z-40 bg-tinta/30 lg:hidden"
          />
        )}
        <aside
          role={panelAbierto ? "dialog" : undefined}
          aria-modal={panelAbierto ? true : undefined}
          aria-label="Mi selección"
          /**
           * En móvil se abre COMO CAPA, anclada abajo. Antes era un bloque más
           * al final de la grilla: con 35 regalos quedaba en el píxel 8022 de
           * una página de 8316, así que tocar «Revisar» no movía nada y el
           * invitado creía que la página estaba rota. Varios reportaron que no
           * los dejaba reservar; era esto.
           *
           * El hueco de arriba no es decorativo: es lo único que se puede tocar
           * para cerrar sin buscar un botón.
           */
          className={`${
            panelAbierto
              ? "fixed inset-x-3 top-16 bottom-3 z-50 overflow-y-auto shadow-[0_12px_40px_-12px_rgba(90,74,51,.55)]"
              : "hidden"
          } rounded-[22px] border border-linea bg-papel p-5 lg:static lg:z-auto lg:block lg:overflow-visible lg:shadow-none lg:sticky lg:top-[132px]`}
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="m-0 font-serif text-[20px] font-bold text-tinta">Mi selección</h2>
            <div className="flex items-center gap-2">
              <span className="caps rounded-full bg-azul-50 px-3 py-1.5 text-[10px] !text-azul">
                {cuantos} {cuantos === 1 ? "regalo" : "regalos"}
              </span>
              <button
                type="button"
                onClick={() => setPanelAbierto(false)}
                aria-label="Cerrar mi selección"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-linea-fuerte text-[15px] text-tinta-4 lg:hidden"
              >
                ×
              </button>
            </div>
          </div>

          <p className="mt-2 mb-0 font-ui text-[12px] leading-relaxed text-tinta-5">
            Nada queda apartado hasta que confirmes con tu nombre.
          </p>

          {cuantos === 0 ? (
            <p className="mt-5 mb-0 rounded-2xl border border-dashed border-linea-fuerte px-4 py-6 text-center font-serif text-[15px] text-tinta-5">
              Todavía no has escogido nada. Toca «Lo regalo yo» en el que quieras.
            </p>
          ) : (
            <>
              <ul className="mt-4 mb-0 flex list-none flex-col gap-2.5 p-0">
                {escogidos.map(({ regalo, cantidad }) => (
                  <RenglonSeleccion
                    key={regalo.slug}
                    regalo={regalo}
                    cantidad={cantidad}
                    onCantidad={(n) => cambiarCantidad(regalo.slug, n)}
                    onQuitar={() => quitar(regalo.slug)}
                  />
                ))}
              </ul>

              <Link
                href="/reserva"
                className="caps mt-4 flex h-12 items-center justify-center rounded-full bg-azul text-[12px] font-bold !text-papel no-underline transition hover:bg-[#456073]"
              >
                Confirmar mi selección
              </Link>
              <p className="mt-2 mb-0 text-center font-ui text-[11px] text-tinta-5">
                Solo te pedimos nombre y correo.
              </p>
              {/* La salida de vuelta a la lista, para seguir sumando regalos
                  sin tener que adivinar cómo se cierra esto. */}
              <button
                type="button"
                onClick={() => setPanelAbierto(false)}
                className="caps mt-3 flex h-12 w-full items-center justify-center rounded-full border-[1.5px] border-azul bg-papel text-[11px] font-bold text-azul lg:hidden"
              >
                Seguir escogiendo
              </button>
            </>
          )}
        </aside>
      </div>

      {/* Se sube cuando aparece la barra de selección en móvil, o quedaría
          justo encima de «Revisar». */}
      {!panelAbierto && (
        <BotonAsistencia
          clase={`right-5 sm:right-7 ${cuantos > 0 ? "bottom-24 lg:bottom-7" : "bottom-5 sm:bottom-7"}`}
        />
      )}

      {/* ---------------- BARRA FIJA EN MÓVIL ---------------- */}
      {cuantos > 0 && !panelAbierto && (
        <div className="sticky bottom-0 z-30 border-t border-linea bg-papel/95 px-5 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="m-0 font-serif text-[15px] font-bold text-tinta">
                {cuantos} {cuantos === 1 ? "regalo escogido" : "regalos escogidos"}
              </p>
              <p className="m-0 font-ui text-[11px] text-tinta-5">Toca para revisarlos</p>
            </div>
            <button
              type="button"
              onClick={() => setPanelAbierto(true)}
              className="caps h-12 shrink-0 rounded-full bg-azul px-6 text-[12px] font-bold !text-papel"
            >
              Revisar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
