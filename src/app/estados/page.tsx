import { notFound } from "next/navigation";
import { TarjetaRegalo, type RegaloTarjeta } from "@/components/tarjeta-regalo";

/**
 * Banco de pruebas de la tarjeta — para comparar contra
 * `.claude/docs/diseno/EstadosTarjeta.png` con la página al lado del PNG.
 * **Solo en desarrollo**: en producción no existe.
 *
 * El PNG dibuja seis estados. Quedan CUATRO: el 26/08/2026 se eliminaron el modo
 * de grupo («Entre varios · N apuntados») y los cupos («2 de 5 cupos»). Ver
 * .claude/docs/decisiones.md.
 *
 * Los datos son los regalos reales de `src/lib/db/seed.ts`, con sus precios reales.
 */

type Caso = { titulo: string; nota: string; regalo: RegaloTarjeta; enSeleccion?: boolean };

const CASOS: Caso[] = [
  {
    titulo: "1 · Disponible",
    nota: "Estado por defecto. Azul, botón lleno. La única tarjeta que invita a actuar sin condiciones.",
    regalo: {
      slug: "mantas-de-muselina",
      nombre: "Mantas de muselina",
      categoriaNombre: "Sueño",
      imagenUrl: null,
      precioMin: 70_000,
      precioMax: 140_000,
      nivelPrecio: "$$",
      modo: "unico",
      reservas: [],
    },
  },
  {
    titulo: "2 · Reservado",
    nota: "Se atenúa pero no se esconde: ver lo que ya está cubierto es parte de la información. No se dice quién lo reservó.",
    regalo: {
      slug: "banera-con-soporte",
      nombre: "Bañera con soporte",
      categoriaNombre: "Baño y cuidado",
      imagenUrl: null,
      precioMin: 80_000,
      precioMax: 250_000,
      nivelPrecio: "$$",
      modo: "unico",
      reservas: [{ cantidad: 1 }],
    },
  },
  {
    titulo: "3 · Repetible",
    nota: "Pañales, pañitos y libros. Nunca se agota; el contador está solo para que nadie sienta que llegó tarde.",
    regalo: {
      slug: "panales-talla-1",
      nombre: "Pañales talla 1",
      categoriaNombre: "Pañales",
      imagenUrl: null,
      precioMin: 45_000,
      precioMax: 90_000,
      nivelPrecio: "$",
      modo: "multiple",
      reservas: Array.from({ length: 7 }, () => ({ cantidad: 1 })),
    },
  },
  {
    titulo: "4 · En tu selección",
    nota: "El que evita el error más común: creer que ya reservaste. Nada queda apartado hasta confirmar.",
    enSeleccion: true,
    regalo: {
      slug: "panalera-grande",
      nombre: "Pañalera grande",
      categoriaNombre: "Paseo",
      imagenUrl: null,
      precioMin: 150_000,
      precioMax: 400_000,
      nivelPrecio: "$$$",
      modo: "unico",
      reservas: [],
    },
  },
  {
    titulo: "Borde · Un caro, sin tomar",
    nota: "Los de «Entre varios» ya no son un modo aparte: quien del grupo lo reserve, lo saca de la lista.",
    regalo: {
      slug: "silla-de-carro",
      nombre: "Silla de carro",
      categoriaNombre: "Entre varios",
      imagenUrl: null,
      precioMin: 400_000,
      precioMax: 1_200_000,
      nivelPrecio: "$$$",
      modo: "unico",
      reservas: [],
    },
  },
  {
    titulo: "Borde · Repetible sin estrenar",
    nota: "Sin nadie todavía: la píldora dice «Siempre disponible», sin contador.",
    regalo: {
      slug: "panitos-humedos",
      nombre: "Pañitos húmedos",
      categoriaNombre: "Pañales",
      imagenUrl: null,
      precioMin: 20_000,
      precioMax: 45_000,
      nivelPrecio: "$",
      modo: "multiple",
      reservas: [],
    },
  },
  {
    titulo: "Borde · Sin rango cargado",
    nota: "Regalo que el admin todavía no cotizó: el renglón cae a nivelPrecio en vez de inventar cifras.",
    regalo: {
      slug: "movil",
      nombre: "Móvil",
      categoriaNombre: "Sueño",
      imagenUrl: null,
      precioMin: null,
      precioMax: null,
      nivelPrecio: "$$",
      modo: "unico",
      reservas: [],
    },
  },
];

export default function BancoDeEstados() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="min-h-screen bg-crema px-5 py-10 sm:px-10">
      <header className="mx-auto mb-8 max-w-6xl">
        <p className="caps text-[10px]">Componente clave · solo desarrollo</p>
        <h1 className="mt-2 font-serif text-4xl font-bold text-azul">Los estados de una tarjeta</h1>
        <p className="mt-3 max-w-2xl font-ui text-[14px] leading-relaxed text-tinta-4">
          Comparar contra <code>.claude/docs/diseno/EstadosTarjeta.png</code>, teniendo en cuenta que
          el PNG dibuja seis estados y hoy quedan cuatro. El estado se lee por color y por texto. La
          píldora dice qué pasó; el botón dice qué va a pasar.
        </p>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
        {CASOS.map((caso) => (
          <div key={caso.regalo.slug}>
            <TarjetaRegalo regalo={caso.regalo} enSeleccion={caso.enSeleccion} />
            <p className="mt-3 font-ui text-[12px] leading-relaxed text-tinta-5">
              <span className="font-bold text-tinta-3">{caso.titulo}.</span> {caso.nota}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
