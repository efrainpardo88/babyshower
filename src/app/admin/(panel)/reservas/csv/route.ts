import { auth, esAdmin } from "@/lib/auth";
import { aCsv, listarReservas } from "@/lib/admin";

/**
 * La descarga del CSV.
 *
 * Vuelve a comprobar la sesión aunque el middleware ya cubra `/admin/*`: una
 * ruta que devuelve los datos de todos los invitados no debe depender de una
 * sola capa.
 */
export async function GET() {
  const sesion = await auth();
  if (!esAdmin(sesion?.user?.email)) {
    return new Response("No autorizado", { status: 401 });
  }

  const filas = await listarReservas();
  const hoy = new Date().toISOString().slice(0, 10);

  return new Response(aCsv(filas), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="reservas-${hoy}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
