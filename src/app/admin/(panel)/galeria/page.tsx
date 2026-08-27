import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { fotosGaleria } from "@/lib/db/schema";
import { AdminGaleria } from "@/components/admin-galeria";

/** Las fotos de la revelación. Lo que se sube aquí sale en la landing. */
export const dynamic = "force-dynamic";

export default async function Galeria() {
  const fotos = await db
    .select({
      id: fotosGaleria.id,
      url: fotosGaleria.url,
      descripcion: fotosGaleria.descripcion,
      orden: fotosGaleria.orden,
    })
    .from(fotosGaleria)
    .orderBy(asc(fotosGaleria.orden));

  return <AdminGaleria fotos={fotos} />;
}
