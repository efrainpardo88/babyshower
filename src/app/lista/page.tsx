import type { Metadata } from "next";
import { ListaRegalos } from "@/components/lista-regalos";
import { cargarLista } from "@/lib/regalos";

/**
 * `/lista` — la mesa de regalos.
 *
 * Se renderiza en cada visita, no en el build: los estados de las tarjetas
 * dependen de las reservas, y una lista cacheada le mostraría a un invitado un
 * regalo como disponible cuando otro ya lo tomó. Es justo el error que este
 * proyecto existe para evitar.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "La lista de regalos",
  description:
    "Escoge un regalo y márcalo como tuyo. Así nadie repite y ya definimos tallas y cantidades.",
};

export default async function Lista() {
  const { regalos, categorias } = await cargarLista();

  return <ListaRegalos regalos={regalos} categorias={categorias} />;
}
