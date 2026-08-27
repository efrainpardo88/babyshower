import Link from "next/link";
import { cargarResumen } from "@/lib/admin";

/** El resumen. Lo que ustedes van a querer mirar de un vistazo cada mañana. */
export const dynamic = "force-dynamic";

function Dato({
  valor,
  etiqueta,
  nota,
  destacado,
}: {
  valor: number;
  etiqueta: string;
  nota?: string;
  destacado?: boolean;
}) {
  return (
    <div
      className={`rounded-[20px] border p-5 ${
        destacado ? "border-azul-200 bg-azul-50" : "border-linea bg-papel"
      }`}
    >
      <p
        className={`m-0 font-serif text-[38px] leading-none font-bold tabular-nums lining-nums ${
          destacado ? "text-azul" : "text-tinta"
        }`}
      >
        {valor}
      </p>
      <p className="caps mt-2 mb-0 text-[10px]">{etiqueta}</p>
      {nota && <p className="mt-1.5 mb-0 font-ui text-[11px] leading-relaxed text-tinta-5">{nota}</p>}
    </div>
  );
}

export default async function Resumen() {
  const r = await cargarResumen();
  const faltan = r.regalosTotales - r.regalosCubiertos;

  return (
    <>
      <h1 className="m-0 font-serif text-[26px] font-bold text-tinta">Resumen</h1>
      <p className="mt-1.5 mb-0 font-ui text-[13px] text-tinta-5">
        {r.reservasActivas === 0
          ? "Todavía no hay reservas. En cuanto alguien escoja algo, aparece aquí."
          : `${r.personas} ${r.personas === 1 ? "persona ha" : "personas han"} reservado.`}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Dato
          valor={r.reservasActivas}
          etiqueta="Reservas activas"
          nota="Regalos que alguien va a traer"
          destacado
        />
        <Dato
          valor={r.unicosLibres}
          etiqueta="Sin reservar"
          nota="De los que salen de la lista al tomarlos"
        />
        <Dato valor={r.personas} etiqueta="Invitados" nota="Personas distintas que reservaron" />
        <Dato
          valor={r.conMensaje}
          etiqueta="Con mensaje"
          nota="Escribieron algo para ustedes"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
        <div className="rounded-[20px] border border-linea bg-papel p-5">
          <p className="caps m-0 text-[10px]">Avance de la lista</p>
          <p className="mt-2 mb-0 font-ui text-[14px] leading-relaxed text-tinta-3">
            {r.regalosCubiertos} de {r.regalosTotales} regalos ya tienen a alguien.
            {faltan > 0 && ` Faltan ${faltan}.`}
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-linea">
            <div
              className="h-full rounded-full bg-azul transition-all"
              style={{
                width: `${r.regalosTotales === 0 ? 0 : Math.round((r.regalosCubiertos / r.regalosTotales) * 100)}%`,
              }}
            />
          </div>
        </div>

        <div className="rounded-[20px] border border-linea bg-papel p-5">
          <p className="caps m-0 text-[10px]">Canceladas</p>
          <p className="mt-2 mb-0 font-ui text-[14px] leading-relaxed text-tinta-3">
            {r.reservasCanceladas === 0
              ? "Nadie ha cancelado."
              : `${r.reservasCanceladas} ${r.reservasCanceladas === 1 ? "reserva cancelada" : "reservas canceladas"}. Esos regalos volvieron a estar libres.`}
          </p>
        </div>
      </div>

      <Link
        href="/admin/reservas"
        className="caps mt-6 inline-flex h-12 items-center justify-center rounded-full bg-azul px-7 text-[12px] font-bold !text-papel no-underline transition hover:bg-[#456073]"
      >
        Ver quién reservó qué
      </Link>
    </>
  );
}
