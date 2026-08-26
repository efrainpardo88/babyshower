import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { regalos, reservas } from "@/lib/db/schema";
import { Corazon, Divisor } from "@/components/ilustraciones";
import { BotonCancelar } from "@/components/boton-cancelar";

/**
 * `/reserva/[token]` — el comprobante del invitado.
 *
 * El token es un UUID que solo conoce quien recibió el enlace: no hay cuenta ni
 * contraseña, y es a propósito. Ver .claude/docs/decisiones.md.
 *
 * `[token]` es el **lote**, no el token de una fila: el invitado recibe UN
 * enlace para toda su selección, así que aquí se muestran todas las reservas de
 * ese envío juntas.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tu reserva · La lista de Benjamín",
  robots: { index: false },
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function Comprobante({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  // Sin esto, un token con forma rara llega hasta Postgres y revienta con un
  // error de casteo en vez de un 404 limpio.
  if (!UUID.test(token)) notFound();

  const filas = await db
    .select({
      id: reservas.id,
      nombre: reservas.nombre,
      cantidad: reservas.cantidad,
      estado: reservas.estado,
      creadoEn: reservas.creadoEn,
      regaloNombre: regalos.nombre,
      regaloModo: regalos.modo,
    })
    .from(reservas)
    .innerJoin(regalos, eq(reservas.regaloId, regalos.id))
    .where(eq(reservas.lote, token));

  if (filas.length === 0) notFound();

  const quien = filas[0].nombre.split(" ")[0];
  const activas = filas.filter((f) => f.estado === "activa");
  const canceladas = filas.filter((f) => f.estado === "cancelada");

  return (
    <main className="min-h-screen bg-crema">
      <div className="mx-auto max-w-[560px] px-5 py-10">
        <div className="rounded-[26px] border border-linea bg-papel p-7 text-center">
          <p className="caps m-0 text-[10px]">Tu reserva</p>
          <h1 className="mt-2 mb-0 font-serif text-[28px] font-bold text-azul">
            {activas.length > 0 ? `Gracias, ${quien}` : `Reserva cancelada`}
          </h1>
          <p className="mt-3 mb-0 font-ui text-[14px] leading-relaxed text-tinta-4">
            {activas.length > 0
              ? `${activas.length === 1 ? "Este regalo está" : `Estos ${activas.length} regalos están`} a tu nombre. Guarda este enlace para volver cuando quieras.`
              : "Ya no tienes regalos reservados en este enlace. Si quieres, vuelve a la lista y escoge de nuevo."}
          </p>
        </div>

        {activas.length > 0 && (
          <ul className="mt-4 mb-0 flex list-none flex-col gap-0 rounded-[22px] border border-linea bg-papel p-4">
            {activas.map((f) => (
              <li
                key={f.id}
                className="flex items-center justify-between gap-3 border-b border-linea py-3 last:border-0"
              >
                <span className="min-w-0">
                  <span className="block font-serif text-[16px] font-bold text-tinta">
                    {f.regaloNombre}
                    {f.cantidad > 1 && ` · x${f.cantidad}`}
                  </span>
                  {f.regaloModo === "grupo" && (
                    <span className="block font-ui text-[12px] text-tinta-5">Entre varios</span>
                  )}
                </span>
                <BotonCancelar id={f.id} nombre={f.regaloNombre} />
              </li>
            ))}
          </ul>
        )}

        {canceladas.length > 0 && (
          <ul className="mt-3 mb-0 flex list-none flex-col gap-0 rounded-[22px] border border-linea bg-gris-fondo/40 p-4">
            {canceladas.map((f) => (
              <li key={f.id} className="border-b border-linea py-2.5 last:border-0">
                <span className="block font-serif text-[15px] font-bold text-gris-texto line-through">
                  {f.regaloNombre}
                </span>
                <span className="block font-ui text-[11px] text-tinta-5">
                  Lo liberaste — ya puede escogerlo alguien más
                </span>
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/lista"
          className="caps mt-5 flex h-12 items-center justify-center rounded-full border-[1.5px] border-azul bg-papel text-[12px] font-bold !text-azul no-underline"
        >
          Volver a la lista
        </Link>

        <Divisor className="mt-8" />
        <div className="mt-4 flex justify-center">
          <Corazon className="h-4 w-4 text-azul-lazo" />
        </div>
      </div>
    </main>
  );
}
