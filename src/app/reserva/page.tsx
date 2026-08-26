import type { Metadata } from "next";
import { FormularioReserva } from "@/components/formulario-reserva";
import { cargarLista } from "@/lib/regalos";

/**
 * `/reserva` — el formulario, uno solo para toda la selección.
 *
 * La selección vive en `localStorage`, así que el servidor no sabe qué escogió
 * el invitado: manda los 26 regalos y el cliente arma el resumen con los que
 * tenga guardados. Son datos públicos y ya viajaron a `/lista`, así que no hay
 * nada que proteger aquí.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Confirmar tu selección · La lista de Benjamín",
  robots: { index: false },
};

export default async function Reserva() {
  const { regalos } = await cargarLista();
  return (
    <main className="min-h-screen bg-crema">
      <FormularioReserva regalos={regalos} />
    </main>
  );
}
