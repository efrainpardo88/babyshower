"use client";

/**
 * `/admin/reservas` — la tabla de quién reservó qué, con las dos acciones que
 * los papás necesitan sobre una reserva ya hecha: reenviar el correo y borrarla.
 *
 * Las dos piden confirmación en la misma fila, sin diálogos flotantes: en una
 * tabla, un modal tapa justo la fila que uno está mirando y hay que cerrarlo
 * para comprobar que se apuntó a la correcta.
 */

import { useState, useTransition } from "react";
import type { FilaReserva } from "@/lib/admin";
import { eliminarReserva, reenviarReserva } from "@/app/admin/(panel)/reservas/acciones";

const FECHA = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Bogota",
});

const COLUMNAS = ["Quién", "Regalo", "Cantidad", "Cuándo", "Contacto", "Mensaje", "Acciones"];

type Aviso = { id: string; ok: boolean; texto: string };

export function AdminReservas({ filas }: { filas: FilaReserva[] }) {
  /** Qué fila tiene abierto el formulario de reenvío, y cuál pide confirmar el borrado. */
  const [reenviando, setReenviando] = useState<string | null>(null);
  const [borrando, setBorrando] = useState<string | null>(null);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [pendiente, empezar] = useTransition();

  function cerrarTodo() {
    setReenviando(null);
    setBorrando(null);
  }

  return (
    /* La tabla se desborda a lo ancho en móvil: se desliza sola en vez de
       encoger las columnas hasta que no se lea nada. */
    <div className="mt-6 overflow-x-auto rounded-[20px] border border-linea bg-papel">
      <table className="w-full min-w-[1000px] border-collapse text-left">
        <thead>
          <tr className="border-b border-linea">
            {COLUMNAS.map((h) => (
              <th key={h} className="caps px-4 py-3 text-[10px] whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => {
            const cancelada = f.estado === "cancelada";
            const miAviso = aviso?.id === f.id ? aviso : null;

            return (
              <tr
                key={f.id}
                className={`border-b border-linea last:border-0 align-top ${
                  cancelada ? "opacity-55" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <span
                    className={`block font-serif text-[15px] font-bold text-tinta ${
                      cancelada ? "line-through" : ""
                    }`}
                  >
                    {f.nombre}
                  </span>
                  {cancelada && (
                    <span className="caps mt-0.5 block text-[9px] text-gris-texto">Cancelada</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="block font-ui text-[13px] text-tinta-2">{f.regaloNombre}</span>
                  <span className="block font-ui text-[11px] text-tinta-5">{f.categoriaNombre}</span>
                </td>
                <td className="px-4 py-3 font-ui text-[13px] tabular-nums text-tinta-3">
                  {f.cantidad > 1 ? `x${f.cantidad}` : "1"}
                </td>
                <td className="px-4 py-3 font-ui text-[12px] whitespace-nowrap text-tinta-4">
                  {FECHA.format(f.creadoEn)}
                </td>
                <td className="px-4 py-3">
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
                <td className="max-w-[240px] px-4 py-3 font-serif text-[13px] leading-relaxed text-tinta-3 italic">
                  {f.mensaje || <span className="text-tinta-6 not-italic">—</span>}
                </td>

                <td className="w-[300px] px-4 py-3">
                  {reenviando === f.id ? (
                    <FormularioReenvio
                      idReserva={f.id}
                      correoActual={f.email}
                      pendiente={pendiente}
                      onCancelar={() => setReenviando(null)}
                      onEnviar={(destinatario, guardarCorreo) =>
                        empezar(async () => {
                          const r = await reenviarReserva(f.id, destinatario, guardarCorreo);
                          setAviso({ id: f.id, ok: r.ok, texto: r.mensaje });
                          if (r.ok) setReenviando(null);
                        })
                      }
                    />
                  ) : borrando === f.id ? (
                    <div className="flex flex-col gap-2">
                      <p className="m-0 font-ui text-[12px] leading-snug text-tinta-3">
                        ¿Borrar esta reserva? No se puede deshacer y el regalo vuelve a la lista.
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          disabled={pendiente}
                          onClick={() =>
                            empezar(async () => {
                              const r = await eliminarReserva(f.id);
                              // Si sale bien, la fila desaparece con el refresco:
                              // el aviso solo hace falta cuando algo se cae.
                              if (!r.ok) setAviso({ id: f.id, ok: false, texto: r.mensaje });
                              setBorrando(null);
                            })
                          }
                          className="caps h-11 rounded-full bg-pardo px-3.5 text-[10px] font-bold !text-papel disabled:opacity-60"
                        >
                          {pendiente ? "Borrando…" : "Sí, borrar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setBorrando(null)}
                          className="caps h-11 rounded-full border border-linea-fuerte px-3.5 text-[10px] text-tinta-4"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          cerrarTodo();
                          setAviso(null);
                          setReenviando(f.id);
                        }}
                        className="caps h-11 rounded-full border-[1.5px] border-azul px-3.5 text-[10px] font-bold !text-azul transition hover:bg-azul-50"
                      >
                        Reenviar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          cerrarTodo();
                          setAviso(null);
                          setBorrando(f.id);
                        }}
                        className="caps h-11 rounded-full border border-linea-fuerte px-3.5 text-[10px] text-tinta-4 transition hover:bg-crema"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}

                  {miAviso && (
                    <p
                      role="status"
                      className={`mt-2 mb-0 font-ui text-[11px] leading-snug ${
                        miAviso.ok ? "text-salvia" : "text-pardo"
                      }`}
                    >
                      {miAviso.texto}
                    </p>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * El formulario de reenvío.
 *
 * El destinatario viene lleno con el correo de la reserva pero se puede cambiar:
 * el motivo número uno para reenviar es que estaba mal escrito. Y por eso mismo
 * la casilla de guardarlo viene marcada — si solo se cambiara el destino de este
 * envío, la dirección mala seguiría en la tabla y en el CSV.
 *
 * Se reenvía el correo del envío completo (todos los regalos de ese lote), que
 * es el que el invitado recibió el primer día.
 */
function FormularioReenvio({
  idReserva,
  correoActual,
  pendiente,
  onEnviar,
  onCancelar,
}: {
  idReserva: string;
  correoActual: string;
  pendiente: boolean;
  onEnviar: (destinatario: string, guardarCorreo: boolean) => void;
  onCancelar: () => void;
}) {
  const [destinatario, setDestinatario] = useState(correoActual);
  const [guardarCorreo, setGuardarCorreo] = useState(true);
  const cambio = destinatario.trim().toLowerCase() !== correoActual.trim().toLowerCase();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onEnviar(destinatario, guardarCorreo);
      }}
      className="flex flex-col gap-2"
    >
      <label className="caps m-0 text-[9px]" htmlFor={`para-${idReserva}`}>
        Enviar a
      </label>
      <input
        id={`para-${idReserva}`}
        type="email"
        required
        autoFocus
        value={destinatario}
        onChange={(e) => setDestinatario(e.target.value)}
        className="h-11 w-full rounded-xl border border-linea-fuerte bg-papel px-3 font-ui text-[13px] text-tinta-2"
      />

      {/* Solo aparece cuando de verdad hay un cambio que guardar: con el correo
          intacto, la casilla no decide nada y solo estorba. */}
      {cambio && (
        <label className="flex items-start gap-2 font-ui text-[11px] leading-snug text-tinta-4">
          <input
            type="checkbox"
            checked={guardarCorreo}
            onChange={(e) => setGuardarCorreo(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-azul"
          />
          Cambiar también el correo de la reserva
        </label>
      )}

      <div className="flex flex-wrap gap-1.5">
        <button
          type="submit"
          disabled={pendiente}
          className="caps h-12 rounded-full bg-azul px-4 text-[10px] font-bold !text-papel transition hover:bg-[#456073] disabled:opacity-60"
        >
          {pendiente ? "Enviando…" : "Enviar"}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="caps h-11 rounded-full border border-linea-fuerte px-3.5 text-[10px] text-tinta-4"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
