"use client";

/**
 * El flujo de reserva, las tres pantallas de `.claude/docs/diseno/Reserva.png`:
 *
 *  1. El formulario — UNO para toda la selección. El invitado escribe su nombre
 *     una vez, no cinco.
 *  2. El comprobante — el enlace con el token, grande, porque es lo único que
 *     necesita guardar.
 *  3. El caso feo — cuando alguien escogió lo mismo mientras llenaba el
 *     formulario. NUNCA un error genérico: se confirma lo que sí quedó, se dice
 *     con claridad qué se cayó, y se ofrece salida inmediata.
 *
 * La tercera es la que casi siempre se olvida diseñar, y es donde la página se
 * gana o se pierde la confianza.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { Corazon, Divisor } from "@/components/ilustraciones";
import { limpiar, useSeleccion } from "@/lib/seleccion";
import { formatearRangoCorto, sumarRangos } from "@/lib/precio";
import type { RegaloDeLista } from "@/lib/regalos";
import type { Resultado } from "@/lib/reservar";
import { confirmarReserva } from "@/app/reserva/acciones";

type Estado =
  | { paso: "formulario" }
  | { paso: "enviando" }
  | { paso: "listo"; resultado: Resultado; correoEnviado: boolean }
  | { paso: "error"; mensaje: string };

function Campo({
  etiqueta,
  opcional,
  nota,
  children,
}: {
  etiqueta: string;
  opcional?: boolean;
  nota?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-ui text-[13px] font-bold text-tinta-2">
        {etiqueta}
        {opcional && <span className="font-normal text-tinta-5"> — opcional</span>}
      </span>
      <div className="mt-1.5">{children}</div>
      {nota && <span className="mt-1 block font-ui text-[11px] text-tinta-5">{nota}</span>}
    </label>
  );
}

const ENTRADA =
  "w-full rounded-2xl border border-linea-fuerte bg-papel px-4 font-ui text-[15px] text-tinta placeholder:text-tinta-6 focus:border-azul focus:outline-none";

export function FormularioReserva({ regalos }: { regalos: RegaloDeLista[] }) {
  const seleccion = useSeleccion();
  const [estado, setEstado] = useState<Estado>({ paso: "formulario" });
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);

  const porSlug = useMemo(() => new Map(regalos.map((r) => [r.slug, r])), [regalos]);

  const escogidos = useMemo(
    () =>
      Object.entries(seleccion)
        .map(([slug, cantidad]) => ({ regalo: porSlug.get(slug), cantidad }))
        .filter((x): x is { regalo: RegaloDeLista; cantidad: number } => Boolean(x.regalo)),
    [seleccion, porSlug],
  );

  const rango = useMemo(() => {
    const items = escogidos.flatMap(({ regalo, cantidad }) =>
      Array.from({ length: cantidad }, () => ({
        precioMin: regalo.precioMin,
        precioMax: regalo.precioMax,
      })),
    );
    return sumarRangos(items);
  }, [escogidos]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setAviso(null);
    setEstado({ paso: "enviando" });

    const respuesta = await confirmarReserva(
      escogidos.map(({ regalo, cantidad }) => ({ slug: regalo.slug, cantidad })),
      { nombre, email, telefono, mensaje },
    );

    if (respuesta.estado === "invalido") {
      setAviso(respuesta.mensaje);
      setEstado({ paso: "formulario" });
      return;
    }
    if (respuesta.estado === "error") {
      setEstado({ paso: "error", mensaje: respuesta.mensaje });
      return;
    }

    // Lo que quedó reservado ya no es una selección pendiente. Lo que se cayó
    // tampoco: el invitado tendrá que escoger otra cosa, no reintentar lo mismo.
    limpiar();
    setEstado({
      paso: "listo",
      resultado: respuesta.resultado,
      correoEnviado: respuesta.correoEnviado,
    });
  }

  /* ---------------- 2 y 3 · La respuesta ---------------- */
  if (estado.paso === "listo") {
    const { confirmados, caidos, lote } = estado.resultado;
    const hubo = confirmados.length;
    const total = hubo + caidos.length;
    const parcial = caidos.length > 0 && hubo > 0;
    const nada = hubo === 0;

    return (
      <div className="mx-auto max-w-[560px] px-5 py-10">
        <div className="rounded-[26px] border border-linea bg-papel p-7 text-center">
          <span
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
              nada || parcial ? "bg-oso text-tinta-2" : "bg-azul text-papel"
            }`}
            aria-hidden="true"
          >
            {nada || parcial ? (
              <span className="font-serif text-[30px] leading-none">!</span>
            ) : (
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12.5 4.5 4.5L19 7.5" />
              </svg>
            )}
          </span>

          <h1 className="mt-4 mb-0 font-serif text-[30px] font-bold text-azul">
            {nada
              ? "No alcanzamos a reservar"
              : parcial
                ? `Reservamos ${hubo} de ${total}`
                : `¡Listo, ${nombre.split(" ")[0]}!`}
          </h1>

          <p className="mt-3 mb-0 font-ui text-[14px] leading-relaxed text-tinta-4">
            {nada
              ? "Alguien más escogió lo que tenías seleccionado mientras llenabas el formulario. No se guardó nada a tu nombre."
              : parcial
                ? `Alguien escogió ${caidos.length === 1 ? caidos[0].nombre.toLowerCase() : "algo de tu selección"} mientras llenabas el formulario. Lo demás quedó a tu nombre.`
                : `${hubo === 1 ? "Este regalo ya quedó" : `Estos ${hubo} regalos ya quedaron`} a tu nombre. Nadie más ${hubo === 1 ? "lo" : "los"} va a escoger.`}
          </p>
        </div>

        {/* Qué quedó y qué no */}
        <ul className="mt-4 mb-0 flex list-none flex-col gap-0 rounded-[22px] border border-linea bg-papel p-4">
          {confirmados.map((c) => (
            <li key={c.slug} className="flex items-start gap-3 border-b border-linea py-3 last:border-0">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-salvia-100 text-salvia">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 12.5 4.5 4.5L19 7.5" />
                </svg>
              </span>
              <span className="min-w-0">
                <span className="block font-serif text-[16px] font-bold text-tinta">
                  {c.nombre}
                  {c.cantidad > 1 && ` · x${c.cantidad}`}
                </span>
              </span>
            </li>
          ))}
          {caidos.map((c) => (
            <li key={c.slug} className="flex items-start gap-3 border-b border-linea py-3 last:border-0">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gris-fondo font-ui text-[13px] text-gris-texto">
                ×
              </span>
              <span className="min-w-0">
                <span className="block font-serif text-[16px] font-bold text-gris-texto">{c.nombre}</span>
                <span className="block font-ui text-[12px] text-tinta-5">
                  La reservó otra persona hace un momento
                </span>
              </span>
            </li>
          ))}
        </ul>

        {/* El enlace: lo único que el invitado necesita guardar */}
        {lote && (
          <div className="mt-4 rounded-[22px] border border-azul-200 bg-azul-50 p-5">
            <p className="caps m-0 text-[10px] !text-azul">Guarda este enlace</p>
            <Link
              href={`/reserva/${lote}`}
              className="mt-2 block truncate rounded-xl border border-azul-200 bg-papel px-3 py-2.5 font-ui text-[13px] text-tinta-2 no-underline"
            >
              /reserva/{lote}
            </Link>
            <p className="mt-2.5 mb-0 font-ui text-[12px] leading-relaxed text-tinta-4">
              Desde ahí puedes cambiar o cancelar cuando quieras.
              {estado.correoEnviado
                ? ` También te lo mandamos a ${email}.`
                : " Cópialo o guarda esta página."}
            </p>
          </div>
        )}

        {/* La salida: si algo se cayó, se ofrece alternativa concreta */}
        {caidos.length > 0 && caidos[0].quedanEnCategoria > 0 && (
          <div className="mt-4 rounded-[22px] border border-pardo-linea bg-pardo-100 p-5 text-center">
            <p className="m-0 font-serif text-[17px] font-bold text-tinta-2">¿Quieres escoger otra cosa?</p>
            <p className="mt-1.5 mb-0 font-ui text-[13px] text-tinta-4">
              {caidos[0].quedanEnCategoria === 1
                ? `Queda 1 regalo disponible en ${caidos[0].categoriaNombre}.`
                : `Quedan ${caidos[0].quedanEnCategoria} regalos disponibles en ${caidos[0].categoriaNombre}.`}
            </p>
            <Link
              href="/lista"
              className="caps mt-3.5 inline-flex h-12 items-center justify-center rounded-full bg-pardo px-7 text-[12px] font-bold !text-papel no-underline"
            >
              Ver qué queda
            </Link>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2.5">
          <Link
            href="/lista"
            className="caps flex h-12 items-center justify-center rounded-full border-[1.5px] border-azul bg-papel text-[12px] font-bold !text-azul no-underline"
          >
            {caidos.length > 0 ? "Así está bien, gracias" : "Volver a la lista"}
          </Link>
        </div>

        {hubo > 0 && (
          <>
            <Divisor className="mt-7" />
            <p className="mt-3 mb-0 text-center font-serif text-[19px] italic text-tinta-3">
              gracias, de verdad
            </p>
          </>
        )}
      </div>
    );
  }

  if (estado.paso === "error") {
    return (
      <div className="mx-auto max-w-[560px] px-5 py-16 text-center">
        <h1 className="m-0 font-serif text-[26px] font-bold text-tinta">No se pudo guardar</h1>
        <p className="mt-3 font-ui text-[14px] leading-relaxed text-tinta-4">{estado.mensaje}</p>
        <p className="mt-1 font-ui text-[13px] text-tinta-5">
          Tu selección sigue guardada, no la perdiste.
        </p>
        <button
          type="button"
          onClick={() => setEstado({ paso: "formulario" })}
          className="caps mt-5 h-12 rounded-full bg-azul px-7 text-[12px] font-bold !text-papel"
        >
          Volver a intentar
        </button>
      </div>
    );
  }

  /* ---------------- 1 · El formulario ---------------- */
  if (escogidos.length === 0) {
    return (
      <div className="mx-auto max-w-[560px] px-5 py-16 text-center">
        <h1 className="m-0 font-serif text-[26px] font-bold text-tinta">No hay nada seleccionado</h1>
        <p className="mt-3 font-ui text-[14px] text-tinta-4">
          Vuelve a la lista y escoge lo que quieras regalar.
        </p>
        <Link
          href="/lista"
          className="caps mt-5 inline-flex h-12 items-center justify-center rounded-full bg-azul px-7 text-[12px] font-bold !text-papel no-underline"
        >
          Ver la lista
        </Link>
      </div>
    );
  }

  const enviando = estado.paso === "enviando";

  return (
    <div className="mx-auto max-w-[560px] px-5 py-8">
      <div className="flex items-center gap-3">
        <Link
          href="/lista"
          aria-label="Volver a la lista"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-linea-fuerte bg-papel text-tinta-3 no-underline"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5 8 12l7 7" />
          </svg>
        </Link>
        <h1 className="m-0 font-serif text-[22px] font-bold text-tinta">Confirmar tu selección</h1>
      </div>

      {/* Lo que va a reservar */}
      <div className="mt-5 rounded-[22px] border border-linea bg-papel p-4">
        <p className="caps m-0 text-[10px]">Vas a reservar</p>
        <ul className="mt-2.5 mb-0 flex list-none flex-col gap-0 p-0">
          {escogidos.map(({ regalo, cantidad }) => (
            <li
              key={regalo.slug}
              className="flex items-center justify-between gap-3 border-b border-linea py-2.5 last:border-0"
            >
              <span className="min-w-0 truncate font-serif text-[16px] font-bold text-tinta">
                {regalo.nombre}
              </span>
              <span className="shrink-0 font-ui text-[12px] text-tinta-5">
                {`x${cantidad}`}
              </span>
            </li>
          ))}
        </ul>
        {rango && (
          <p className="mt-3 mb-0 flex items-baseline justify-between gap-3 border-t border-linea pt-3">
            <span className="caps text-[10px]">Rango</span>
            <span className="font-ui text-[13px] font-bold text-tinta-2">
              {formatearRangoCorto({ precioMin: rango.min, precioMax: rango.max })}
            </span>
          </p>
        )}
      </div>

      <form onSubmit={enviar} className="mt-5 flex flex-col gap-4">
        <Campo etiqueta="Tu nombre">
          <input
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Camila Restrepo"
            autoComplete="name"
            className={`${ENTRADA} h-12`}
          />
        </Campo>

        <Campo etiqueta="Tu correo" nota="Solo para mandarte el enlace de tu reserva.">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="camila.restrepo@gmail.com"
            autoComplete="email"
            className={`${ENTRADA} h-12`}
          />
        </Campo>

        <Campo etiqueta="Celular" opcional>
          <input
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="300 000 0000"
            inputMode="tel"
            autoComplete="tel"
            className={`${ENTRADA} h-12`}
          />
        </Campo>

        <Campo etiqueta="Un mensaje para los papás" opcional>
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Escribe algo lindo…"
            rows={3}
            className={`${ENTRADA} resize-none py-3`}
          />
        </Campo>

        {aviso && (
          <p
            role="alert"
            className="m-0 rounded-2xl border border-pardo-linea bg-pardo-100 px-4 py-3 font-ui text-[13px] text-tinta-2"
          >
            {aviso}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="caps h-12 rounded-full bg-azul text-[12px] font-bold !text-papel transition hover:bg-[#456073] disabled:opacity-60"
        >
          {enviando
            ? "Reservando…"
            : `Reservar ${escogidos.length === 1 ? "este regalo" : `estos ${escogidos.length} regalos`}`}
        </button>

        <p className="m-0 text-center font-ui text-[11px] leading-relaxed text-tinta-5">
          No creas ninguna cuenta. Puedes cambiar o cancelar después.
        </p>
      </form>

      <div className="mt-8 flex justify-center">
        <Corazon className="h-4 w-4 text-azul-lazo" />
      </div>
    </div>
  );
}
