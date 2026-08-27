/**
 * Prueba de concurrencia contra la base real.
 * Se corre con:  npm run prueba:reservas
 *
 * Es la única verificación automática del núcleo del proyecto: que dos invitados
 * no se lleven el mismo regalo. Usa correos `@prueba.local` y limpia lo suyo al
 * empezar y al terminar, así que no toca reservas de invitados de verdad.
 */
import { reservarSeleccion } from "../src/lib/reservar";
import { db } from "../src/lib/db";
import { reservas } from "../src/lib/db/schema";
import { like } from "drizzle-orm";

const MARCA = "@prueba.local";

async function limpiar() {
  await db.delete(reservas).where(like(reservas.email, `%${MARCA}`));
}

function inv(n: string) {
  return { nombre: n, email: `${n.toLowerCase()}${MARCA}` };
}

let fallos = 0;
function afirmar(cond: boolean, texto: string) {
  console.log(`${cond ? "  ok  " : "  FALLA"} ${texto}`);
  if (!cond) fallos++;
}

async function main() {
  await limpiar();

  // ---- 1 · Dos personas, el MISMO regalo único, a la vez ----
  console.log("\n1 · Dos invitados pelean por un 'unico' simultáneamente");
  const [a, b] = await Promise.all([
    reservarSeleccion([{ slug: "banera-con-soporte", cantidad: 1 }], inv("Ana")),
    reservarSeleccion([{ slug: "banera-con-soporte", cantidad: 1 }], inv("Luis")),
  ]);
  const ganadores = [a, b].filter((r) => r.confirmados.length === 1).length;
  const perdedores = [a, b].filter((r) => r.caidos.length === 1).length;
  afirmar(ganadores === 1, `exactamente UNO se lo lleva (fueron ${ganadores})`);
  afirmar(perdedores === 1, `exactamente UNO recibe la caída (fueron ${perdedores})`);
  const perdedor = [a, b].find((r) => r.caidos.length === 1);
  afirmar(perdedor?.caidos[0].motivo === "ya-reservado", "el motivo es 'ya-reservado'");
  afirmar(
    (perdedor?.caidos[0].quedanEnCategoria ?? 0) > 0,
    `se le ofrece salida: quedan ${perdedor?.caidos[0].quedanEnCategoria} en «${perdedor?.caidos[0].categoriaNombre}»`,
  );

  // ---- 2 · Los caros son 'unico' como cualquier otro ----
  console.log("\n2 · Un regalo caro ('Entre varios') se comporta como único");
  const [c1, c2] = await Promise.all([
    reservarSeleccion([{ slug: "silla-de-carro-grupo-0-nueva-nunca-usada", cantidad: 1 }], inv("C1")),
    reservarSeleccion([{ slug: "silla-de-carro-grupo-0-nueva-nunca-usada", cantidad: 1 }], inv("C2")),
  ]);
  afirmar(
    [c1, c2].filter((r) => r.confirmados.length === 1).length === 1,
    "solo uno del grupo lo reserva y sale de la lista",
  );

  // ---- 3 · Los repetibles NO tienen tope ----
  console.log("\n3 · Un 'multiple' admite a todos: ya no hay cupos");
  const seis = await Promise.all(
    ["R1", "R2", "R3", "R4", "R5", "R6"].map((n) =>
      reservarSeleccion([{ slug: "panales-talla-recien-nacido-talla-rn", cantidad: 1 }], inv(n)),
    ),
  );
  const entraron = seis.filter((r) => r.confirmados.length === 1).length;
  afirmar(entraron === 6, `entran los 6 (entraron ${entraron})`);
  afirmar(seis.every((r) => r.caidos.length === 0), "ninguno se cae por cupos");

  // ---- 4 · Cantidad libre en un repetible ----
  console.log("\n4 · Se puede llevar varias unidades de un repetible");
  const varias = await reservarSeleccion(
    [{ slug: "panitos-humedos-cualquier-marca", cantidad: 5 }],
    inv("Multi"),
  );
  afirmar(varias.confirmados[0]?.cantidad === 5, "se registran las 5 unidades pedidas");

  // ---- 5 · Éxito parcial: uno bueno + uno ya tomado ----
  console.log("\n5 · Éxito parcial — el «Reservamos 2 de 3» del diseño");
  const parcial = await reservarSeleccion(
    [
      { slug: "banera-con-soporte", cantidad: 1 }, // ya lo tomó alguien en 1
      { slug: "mantas-de-muselina-paquete-x3", cantidad: 1 },
      { slug: "sacos-de-dormir", cantidad: 1 },
    ],
    inv("Camila"),
  );
  afirmar(parcial.confirmados.length === 2, `2 confirmados (fueron ${parcial.confirmados.length})`);
  afirmar(parcial.caidos.length === 1, `1 caído (fueron ${parcial.caidos.length})`);
  afirmar(parcial.lote !== null, "se emite un lote: hay comprobante que mostrar");

  // ---- 6 · Interbloqueo: dos pedidos cruzados a la vez ----
  console.log("\n6 · Pedidos cruzados — si hubiera interbloqueo, esto se cuelga");
  const cruz = await Promise.race([
    Promise.all([
      reservarSeleccion(
        [
          { slug: "kit-de-cuidado-cortaunas-aspirador-nasal-y-cepillo", cantidad: 1 },
          { slug: "movil-para-colgar-sobre-el-espacio-de-colecho", cantidad: 1 },
        ],
        inv("X1"),
      ),
      reservarSeleccion(
        [
          { slug: "movil-para-colgar-sobre-el-espacio-de-colecho", cantidad: 1 },
          { slug: "kit-de-cuidado-cortaunas-aspirador-nasal-y-cepillo", cantidad: 1 },
        ],
        inv("X2"),
      ),
    ]),
    new Promise((r) => setTimeout(() => r("TIMEOUT"), 15000)),
  ]);
  afirmar(cruz !== "TIMEOUT", "no hay interbloqueo: ambas transacciones terminan");

  // ---- Estado final ----
  const filas = await db.select().from(reservas).where(like(reservas.email, `%${MARCA}`));
  console.log(`\nreservas de prueba creadas: ${filas.length}`);

  await limpiar();
  const quedan = await db.select().from(reservas).where(like(reservas.email, `%${MARCA}`));
  console.log(`tras limpiar: ${quedan.length}`);

  console.log(fallos === 0 ? "\nTODO OK" : `\n${fallos} FALLAS`);
  process.exit(fallos === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
