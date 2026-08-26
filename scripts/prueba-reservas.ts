/**
 * Prueba de concurrencia contra la base real.
 * Se corre con:  npm run prueba:reservas
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
  afirmar(perdedor?.caidos[0].motivo === "ya-reservado", `el motivo es 'ya-reservado'`);
  afirmar(
    (perdedor?.caidos[0].quedanEnCategoria ?? 0) > 0,
    `se le ofrece salida: quedan ${perdedor?.caidos[0].quedanEnCategoria} en «${perdedor?.caidos[0].categoriaNombre}»`,
  );

  // ---- 2 · Cupos: cinco personas para 'Pañales talla 4', que tiene 2 ----
  console.log("\n2 · Cinco invitados para un 'multiple' con 2 cupos");
  const cinco = await Promise.all(
    ["C1", "C2", "C3", "C4", "C5"].map((n) =>
      reservarSeleccion([{ slug: "panales-talla-4-etapa-4", cantidad: 1 }], inv(n)),
    ),
  );
  const entraron = cinco.filter((r) => r.confirmados.length === 1).length;
  afirmar(entraron === 2, `entran exactamente 2 (entraron ${entraron})`);
  afirmar(
    cinco.filter((r) => r.caidos[0]?.motivo === "sin-cupos").length === 3,
    "los otros 3 caen por 'sin-cupos'",
  );

  // ---- 3 · Éxito parcial: uno bueno + uno ya tomado ----
  console.log("\n3 · Éxito parcial — el «Reservamos 2 de 3» del diseño");
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

  // ---- 4 · Grupo: varios sí, pero el mismo no dos veces ----
  console.log("\n4 · 'grupo' admite varios, pero no al mismo dos veces");
  const g1 = await reservarSeleccion([{ slug: "silla-de-carro-grupo-0-nueva-nunca-usada", cantidad: 1 }], inv("G1"));
  const g2 = await reservarSeleccion([{ slug: "silla-de-carro-grupo-0-nueva-nunca-usada", cantidad: 1 }], inv("G2"));
  const g1bis = await reservarSeleccion([{ slug: "silla-de-carro-grupo-0-nueva-nunca-usada", cantidad: 1 }], inv("G1"));
  afirmar(g1.confirmados.length === 1 && g2.confirmados.length === 1, "dos personas distintas se apuntan");
  afirmar(g2.confirmados[0]?.acompanantes.includes("G1"), "al segundo se le dice con quién comparte");
  afirmar(g1bis.caidos[0]?.motivo === "ya-te-apuntaste", "el repetido se rechaza");

  // ---- 5 · Interbloqueo: dos pedidos cruzados a la vez ----
  console.log("\n5 · Pedidos cruzados — si hubiera interbloqueo, esto se cuelga");
  const cruz = await Promise.race([
    Promise.all([
      reservarSeleccion(
        [{ slug: "kit-de-cuidado-cortaunas-aspirador-nasal-y-cepillo", cantidad: 1 }, { slug: "movil-para-colgar-sobre-el-espacio-de-colecho", cantidad: 1 }],
        inv("X1"),
      ),
      reservarSeleccion(
        [{ slug: "movil-para-colgar-sobre-el-espacio-de-colecho", cantidad: 1 }, { slug: "kit-de-cuidado-cortaunas-aspirador-nasal-y-cepillo", cantidad: 1 }],
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
