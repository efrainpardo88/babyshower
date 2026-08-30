import { listarReservas } from "@/lib/admin";
import { AdminReservas } from "@/components/admin-reservas";

/** Quién reservó qué. Es la pantalla por la que existe el panel. */
export const dynamic = "force-dynamic";

export default async function Reservas() {
  const filas = await listarReservas();
  const activas = filas.filter((f) => f.estado === "activa");

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="m-0 font-serif text-[26px] font-bold text-tinta">Reservas</h1>
          <p className="mt-1.5 mb-0 font-ui text-[13px] text-tinta-5">
            {activas.length} {activas.length === 1 ? "activa" : "activas"}
            {filas.length !== activas.length && ` · ${filas.length - activas.length} cancelada(s)`}
          </p>
        </div>

        {filas.length > 0 && (
          <a
            href="/admin/reservas/csv"
            className="caps flex h-12 items-center rounded-full border-[1.5px] border-azul bg-papel px-5 text-[11px] font-bold !text-azul no-underline transition hover:bg-azul-50"
          >
            Descargar CSV
          </a>
        )}
      </div>

      {filas.length === 0 ? (
        <p className="mt-8 mb-0 rounded-[20px] border border-dashed border-linea-fuerte px-6 py-12 text-center font-serif text-[17px] text-tinta-5">
          Todavía no hay reservas. Cuando alguien escoja un regalo, aparece aquí.
        </p>
      ) : (
        /* La tabla es un componente de cliente porque cada fila lleva reenviar y
           eliminar, que necesitan estado. Los datos se siguen leyendo aquí, en el
           servidor: al cliente solo bajan las filas ya resueltas. */
        <AdminReservas filas={filas} />
      )}
    </>
  );
}
