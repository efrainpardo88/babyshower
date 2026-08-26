import { notFound } from "next/navigation";
import { TarjetaRegalo, type RegaloTarjeta } from "@/components/tarjeta-regalo";

/**
 * Banco de pruebas de la tarjeta — para comparar contra `docs/diseno/EstadosTarjeta.png`
 * con la página al lado del PNG. **Solo en desarrollo**: en producción no existe.
 *
 * No es una pantalla del producto y no va en el menú. Se puede borrar el día que
 * `/lista` esté armada; mientras tanto es la forma de ver los seis estados sin Neon.
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
      cuposMax: null,
      metaPersonas: null,
      reservas: [],
    },
  },
  {
    titulo: "2 · Reservado",
    nota: "Se atenúa pero no se esconde: ver lo que ya está cubierto es parte de la información.",
    regalo: {
      slug: "banera-con-soporte",
      nombre: "Bañera con soporte",
      categoriaNombre: "Baño y cuidado",
      imagenUrl: null,
      precioMin: 80_000,
      precioMax: 250_000,
      nivelPrecio: "$$",
      modo: "unico",
      cuposMax: null,
      metaPersonas: null,
      reservas: [{ nombre: "Carolina", cantidad: 1 }],
    },
  },
  {
    titulo: "3 · Múltiple con cupo",
    nota: "Los segmentos hacen visible cuánto falta sin pedirle al invitado que haga cuentas.",
    regalo: {
      slug: "panales-talla-1",
      nombre: "Pañales talla 1",
      categoriaNombre: "Pañales",
      imagenUrl: null,
      precioMin: 45_000,
      precioMax: 90_000,
      nivelPrecio: "$",
      modo: "multiple",
      cuposMax: 5,
      metaPersonas: null,
      reservas: [
        { nombre: "Ana", cantidad: 1 },
        { nombre: "Luis", cantidad: 1 },
      ],
    },
  },
  {
    titulo: "4 · Múltiple sin límite",
    nota: "Pañitos y libros. Nunca se agota; el contador está solo para que nadie sienta que llegó tarde.",
    regalo: {
      slug: "libros-ilustrados",
      nombre: "Libros ilustrados",
      categoriaNombre: "Juego",
      imagenUrl: null,
      precioMin: 30_000,
      precioMax: 90_000,
      nivelPrecio: "$",
      modo: "multiple",
      cuposMax: null,
      metaPersonas: null,
      reservas: Array.from({ length: 7 }, (_, i) => ({ nombre: `Invitado ${i + 1}`, cantidad: 1 })),
    },
  },
  {
    titulo: "5 · Entre varios",
    nota: "Botón pardo, no azul: es otra acción. La página muestra quiénes están — el dinero lo resuelven ellos.",
    regalo: {
      slug: "silla-de-carro",
      nombre: "Silla de carro",
      categoriaNombre: "Entre varios",
      imagenUrl: null,
      precioMin: 400_000,
      precioMax: 1_200_000,
      nivelPrecio: "$$$",
      modo: "grupo",
      cuposMax: null,
      metaPersonas: 4,
      reservas: [
        { nombre: "María José", cantidad: 1 },
        { nombre: "Andrés Ruiz", cantidad: 1 },
        { nombre: "Tatiana Cano", cantidad: 1 },
      ],
    },
  },
  {
    titulo: "6 · En tu selección",
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
      cuposMax: null,
      metaPersonas: null,
      reservas: [],
    },
  },
  {
    titulo: "Borde · Cupos llenos",
    nota: "No está en el PNG. Un 'múltiple' que se llenó cae al tratamiento gris, pero el texto dice otra cosa.",
    regalo: {
      slug: "panales-talla-rn",
      nombre: "Pañales talla recién nacido",
      categoriaNombre: "Pañales",
      imagenUrl: null,
      precioMin: 45_000,
      precioMax: 90_000,
      nivelPrecio: "$",
      modo: "multiple",
      cuposMax: 2,
      metaPersonas: null,
      reservas: [{ nombre: "Sara", cantidad: 2 }],
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
      cuposMax: null,
      metaPersonas: null,
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
        <h1 className="mt-2 font-serif text-4xl font-bold text-azul">Los seis estados de una tarjeta</h1>
        <p className="mt-3 max-w-2xl font-ui text-[14px] leading-relaxed text-tinta-4">
          Comparar contra <code>docs/diseno/EstadosTarjeta.png</code>. El estado se lee por color y por
          texto. La píldora dice qué pasó; el botón dice qué va a pasar. El renglón del precio muestra
          el rango real — es la única divergencia con el PNG, aprobada el 25 de agosto.
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
