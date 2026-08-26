"use client";

/**
 * Cancelar una reserva suelta desde el comprobante.
 *
 * Pide confirmación antes de soltar el regalo: al cancelar, otro invitado puede
 * tomarlo de inmediato y no hay forma de deshacerlo.
 */

import { useState, useTransition } from "react";
import { cancelarReserva } from "@/app/reserva/acciones";

export function BotonCancelar({ id, nombre }: { id: string; nombre: string }) {
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, empezar] = useTransition();

  if (confirmando) {
    return (
      <span className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          disabled={pendiente}
          onClick={() =>
            empezar(async () => {
              const r = await cancelarReserva(id);
              if (!r.ok) {
                setError(r.mensaje);
                setConfirmando(false);
              }
            })
          }
          className="caps h-11 rounded-full bg-gris-fondo px-3.5 text-[10px] font-bold text-gris-texto"
        >
          {pendiente ? "Soltando…" : "Sí, soltarlo"}
        </button>
        <button
          type="button"
          onClick={() => setConfirmando(false)}
          className="caps h-11 rounded-full border border-linea-fuerte px-3.5 text-[10px] text-tinta-4"
        >
          No
        </button>
      </span>
    );
  }

  return (
    <span className="flex shrink-0 flex-col items-end">
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        aria-label={`Cancelar la reserva de ${nombre}`}
        className="caps h-11 rounded-full border border-linea-fuerte px-3.5 text-[10px] text-tinta-4 transition hover:bg-crema"
      >
        Cancelar
      </button>
      {error && <span className="mt-1 font-ui text-[10px] text-pardo">{error}</span>}
    </span>
  );
}
