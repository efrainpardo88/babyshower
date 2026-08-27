import { listarReservas } from "@/lib/admin";

/** Quién reservó qué. Es la pantalla por la que existe el panel. */
export const dynamic = "force-dynamic";

const FECHA = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Bogota",
});

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
        /* La tabla se desborda a lo ancho en móvil: se desliza sola en vez de
           encoger las columnas hasta que no se lea nada. */
        <div className="mt-6 overflow-x-auto rounded-[20px] border border-linea bg-papel">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead>
              <tr className="border-b border-linea">
                {["Quién", "Regalo", "Cantidad", "Cuándo", "Contacto", "Mensaje"].map((h) => (
                  <th key={h} className="caps px-4 py-3 text-[10px] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => {
                const cancelada = f.estado === "cancelada";
                return (
                  <tr
                    key={f.id}
                    className={`border-b border-linea last:border-0 ${cancelada ? "opacity-55" : ""}`}
                  >
                    <td className="px-4 py-3 align-top">
                      <span
                        className={`block font-serif text-[15px] font-bold text-tinta ${cancelada ? "line-through" : ""}`}
                      >
                        {f.nombre}
                      </span>
                      {cancelada && (
                        <span className="caps mt-0.5 block text-[9px] text-gris-texto">Cancelada</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="block font-ui text-[13px] text-tinta-2">{f.regaloNombre}</span>
                      <span className="block font-ui text-[11px] text-tinta-5">
                        {f.categoriaNombre}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top font-ui text-[13px] tabular-nums text-tinta-3">
                      {f.cantidad > 1 ? `x${f.cantidad}` : "1"}
                    </td>
                    <td className="px-4 py-3 align-top font-ui text-[12px] whitespace-nowrap text-tinta-4">
                      {FECHA.format(f.creadoEn)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <a
                        href={`mailto:${f.email}`}
                        className="block font-ui text-[12px] text-azul no-underline hover:underline"
                      >
                        {f.email}
                      </a>
                      {f.telefono && (
                        <a
                          href={`https://wa.me/${f.telefono.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block font-ui text-[12px] text-tinta-4 no-underline hover:underline"
                        >
                          {f.telefono}
                        </a>
                      )}
                    </td>
                    <td className="max-w-[280px] px-4 py-3 align-top font-serif text-[13px] leading-relaxed text-tinta-3 italic">
                      {f.mensaje || <span className="text-tinta-6 not-italic">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
