import Image, { type StaticImageData } from "next/image";
import Link from "next/link";

// Importación ESTÁTICA a propósito, no rutas en texto: así Next lee el ancho y el
// alto reales del archivo. Con la ruta en texto había que declararlos a mano, y al
// reemplazar una acuarela por otra de distinto tamaño la imagen quedaba deformada
// dentro de la caja vieja — un cambio invisible que parecía problema de caché.
import ln1l from "../../public/img/ln-1-l.png";
import ln1c from "../../public/img/ln-1-c.png";
import ln1r from "../../public/img/ln-1-r.png";
import ln2l from "../../public/img/ln-2-l.png";
import ln2r from "../../public/img/ln-2-r.png";
import ln3l from "../../public/img/ln-3-l.png";
import ln3r from "../../public/img/ln-3-r.png";
import ln4l from "../../public/img/ln-4-l.png";
import ln4r from "../../public/img/ln-4-r.png";
import { Corazon, Divisor } from "@/components/ilustraciones";
import { CuentaRegresiva } from "@/components/cuenta-regresiva";
import { Galeria } from "@/components/galeria";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { fotosGaleria } from "@/lib/db/schema";
import { BotonAsistencia } from "@/components/boton-asistencia";
import { ENLACE_WHATSAPP } from "@/lib/whatsapp";

/**
 * Landing — construida contra `.claude/docs/diseno/LandingDesktopNew.png` (versión final).
 * El plan, el mapeo de imágenes y las decisiones están en `.claude/docs/plan-landing.md`.
 *
 * Las ocho acuarelas de `public/img` son columnas decorativas completas: cada PNG
 * ya trae su follaje, sus nubes y sus estrellas. Por eso aquí no hay SVG de ramas
 * ni de estrellas sueltas — se eliminaron para que el follaje no quede duplicado.
 *
 * DOS REGLAS DE MAQUETACIÓN QUE SE REPITEN EN TODA LA PÁGINA:
 *
 * 1. Las decoraciones cuelgan de la SECCIÓN, no del contenedor de texto. Así llegan
 *    al borde de la pantalla, que está metido hacia adentro por el padding. El texto
 *    va en `z-10` y el fondo de la banda en `-z-10`, así que la decoración queda
 *    siempre entre los dos: por delante del color, por detrás de lo que se lee.
 *
 * 2. Tamaños fluidos con `clamp()`: hasta ~1400px la página se ve como el diseño;
 *    de ahí para arriba los textos y las imágenes crecen con el ancho, para que en
 *    una pantalla de 1920 no quede un vacío entre las columnas y el texto.
 *    El `vw` de cada clamp está calculado para valer el tamaño base justo en 1400.
 */

const FECHA = process.env.NEXT_PUBLIC_FECHA_EVENTO ?? "2026-09-13T15:00:00-05:00";

/** El menú sigue el orden de las secciones en la página, no el del mockup. */
const NAV = [
  ["Detalles", "#detalles"],
  ["Mesa de regalos", "#regalos"],
  ["Galería", "#galeria"],
  ["Confirmar asistencia", "#asistencia"],
] as const;

/** La hora no lleva etiqueta: en el diseño va sola, en la fila de las etiquetas. */
const DATOS = [
  { icono: "calendario", etiqueta: "Domingo", valor: "13 de septiembre" },
  { icono: "reloj", etiqueta: null, valor: "3:00 PM" },
  { icono: "lugar", etiqueta: "Salón Social", valor: "Urb. Puerto Ventura\nCr 57 #38-220" },
] as const;

/**
 * Marcadores de color: solo se usan mientras no haya fotos cargadas desde el
 * panel. En cuanto se sube la primera, la galería sale de `fotos_galeria`.
 */
const MARCADORES = [
  { titulo: "Revelación de género", tinte: "bg-[#EDE0CB]" },
  { titulo: "Humo azul", tinte: "bg-[#DFE7EC]" },
  { titulo: "Nosotros dos", tinte: "bg-[#E7EADF]" },
  { titulo: "La torta", tinte: "bg-[#F0E4D2]" },
] as const;

/** La inclinación de cada polaroid, para que no se vean alineadas a escuadra. */
const GIROS = ["-rotate-3", "rotate-2", "-rotate-2", "rotate-3", "rotate-1", "-rotate-1"] as const;

/* ------------------------------------------------------------------ */

type Lado = "izq" | "der";

/**
 * Una columna decorativa. En escritorio va al borde de la pantalla, al tamaño del
 * diseño. En móvil no se esconde: se encoge a una esquina — la izquierda arriba,
 * la derecha abajo — para que la página conserve su carácter a 390px.
 *
 * Nunca va a opacidad plena: a 0.7 la ilustración acompaña al texto en vez de
 * competir con él.
 */
function Decoracion({
  src,
  lado,
  clase,
}: {
  /** Import estático: Next saca de aquí el ancho y el alto reales del archivo. */
  src: StaticImageData;
  lado: Lado;
  clase: string;
}) {
  const esquina = lado === "izq" ? "left-1 top-1" : "bottom-1 right-1";
  return (
    <Image
      src={src}
      alt=""
      aria-hidden
      sizes="(max-width: 1023px) 110px, 40vw"
      className={`pointer-events-none absolute z-0 select-none ${esquina} w-[80px] opacity-60 sm:w-[110px] lg:opacity-70 ${clase}`}
    />
  );
}

/**
 * El fondo plano de una banda. Va en una capa `-z-10`, detrás de TODO, y no como
 * `bg-*` de la sección. La diferencia importa: las columnas decorativas se asoman
 * de una banda a la vecina (el oso de regalos sube, los del pie suben a la
 * galería), y si el color viviera en la sección, la banda siguiente los taparía
 * al pintarse encima. Con el color en su propia capa de fondo, las decoraciones
 * quedan siempre por delante de todos los fondos.
 *
 * Las bandas alternan: 1 crema · 2 blanco · 3 crema · 4 blanco · 5 crema.
 */
function Fondo({ color }: { color: string }) {
  return <div className={`absolute inset-0 -z-10 ${color}`} aria-hidden="true" />;
}

/**
 * Las olas del pie — `public/waves.svg`.
 *
 * EL ALTO NO ES UN NÚMERO FIJO: sale de la proporción del propio archivo, así
 * que la banda crece y se encoge con el ancho de la pantalla. Si mañana la ola
 * cambia de forma, se recalcula la proporción y ya.
 *
 * De dónde sale `2191/294`: el lienzo del SVG es 2191x718, pero la ola ocupa
 * solo la franja inferior — medido, los primeros 424px de alto son transparentes.
 * 718 − 424 = 294. El contenedor recorta ese sobrante, y eso es lo que garantiza
 * que la ola nunca se salga de su sección.
 *
 * En móvil el archivo va al 240% del ancho: es muy alargado y a 390px la ola
 * quedaría tan delgada que el texto no alcanzaría a caer encima de ella.
 */
function Olas() {
  return (
    <div className="relative aspect-[2191/294] min-h-[130px] w-full overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element -- SVG: next/image no lo optimiza */}
      <img
        src="/waves.svg"
        alt=""
        aria-hidden
        className="absolute bottom-0 left-1/2 w-[240%] max-w-none -translate-x-1/2 sm:left-0 sm:w-full sm:translate-x-0"
      />
    </div>
  );
}

function Icono({ tipo }: { tipo: string }) {
  const comun = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7 sm:h-[clamp(28px,2vw,38px)] sm:w-[clamp(28px,2vw,38px)]"
      aria-hidden="true"
      {...comun}
    >
      {tipo === "calendario" && (
        <>
          <rect x="3.5" y="5" width="17" height="16" rx="3" />
          <path d="M8 3v4M16 3v4M3.5 10h17" />
          <path d="M12 16.4c-1-.9-2.1-1.6-2.1-2.6a1.3 1.3 0 0 1 2.1-1 1.3 1.3 0 0 1 2.1 1c0 1-1.1 1.7-2.1 2.6Z" />
        </>
      )}
      {tipo === "reloj" && (
        <>
          <circle cx="12" cy="12" r="8.6" />
          <path d="M12 6.8V12l3.6 2.1" />
        </>
      )}
      {tipo === "lugar" && (
        <>
          <path d="M12 21.5s7.2-5.9 7.2-11.4A7.2 7.2 0 0 0 4.8 10c0 5.6 7.2 11.5 7.2 11.5Z" />
          <path d="M12 12.4c-.9-.8-1.9-1.4-1.9-2.3a1.2 1.2 0 0 1 1.9-.9 1.2 1.2 0 0 1 1.9.9c0 .9-1 1.5-1.9 2.3Z" />
        </>
      )}
      {tipo === "regalo" && (
        <>
          <rect x="3.5" y="9.5" width="17" height="11" rx="2" />
          <path d="M3.5 13.5h17M12 9.5v11" />
          <path d="M12 9.5S10.5 4 8 4a2.2 2.2 0 0 0 0 4.4h4M12 9.5S13.5 4 16 4a2.2 2.2 0 0 1 0 4.4h-4" />
        </>
      )}
    </svg>
  );
}


/* ------------------------------------------------------------------ */

export default async function Home() {
  // Si todavía no han subido fotos, se muestran los marcadores de color.
  const galeria = await db
    .select({ url: fotosGaleria.url, descripcion: fotosGaleria.descripcion })
    .from(fotosGaleria)
    .orderBy(asc(fotosGaleria.orden))
    .limit(6);

  const polaroids =
    galeria.length > 0
      ? galeria.map((f, i) => ({
          titulo: f.descripcion ?? "Benjamín",
          rot: GIROS[i % GIROS.length],
          tinte: "",
          url: f.url,
        }))
      : MARCADORES.map((m, i) => ({ ...m, rot: GIROS[i % GIROS.length], url: undefined }));

  return (
    <main className="relative overflow-hidden">
      {/* ---------------- NAV ---------------- */}
      <nav className="relative z-20 flex items-center justify-between px-5 pt-4 sm:justify-center sm:gap-9 sm:px-16 sm:pt-7">
        <span className="border-b-[1.5px] border-[#B08D6A] pb-2 text-[#B08D6A]">
          <Corazon className="h-5 w-5" />
        </span>
        {NAV.map(([texto, href]) => (
          <Link
            key={href}
            href={href}
            className="hidden font-ui text-[14px] text-tinta-3 no-underline hover:text-tinta-2 sm:block sm:text-[clamp(14px,1vw,19px)]"
          >
            {texto}
          </Link>
        ))}
        <Link
          href="#regalos"
          className="caps rounded-full border border-linea-fuerte px-4 py-3 text-[11px] no-underline sm:hidden"
        >
          Menú
        </Link>
      </nav>

      {/* ---------------- 1. INVITACIÓN ---------------- */}
      <section className="relative flex flex-col items-center gap-2 px-5 pb-12 pt-6 text-center sm:px-16 sm:pb-16 sm:pt-9 lg:min-h-[clamp(730px,52.2vw,890px)]">
        <Fondo color="bg-crema" />
        <Decoracion
          src={ln1l}
          lado="izq"
          clase="lg:left-0 lg:top-0 lg:w-[26%] lg:max-w-[440px]"
        />
        <Decoracion
          src={ln1r}
          lado="der"
          clase="lg:bottom-auto lg:right-2 lg:top-0 lg:w-[24%] lg:max-w-[400px]"
        />

        {/* z-10: el texto siempre por encima de las columnas decorativas */}
        <div className="relative z-10 flex w-full flex-col items-center gap-2">
          <h1 className="nombre m-0 text-[70px] leading-none sm:text-[clamp(130px,9.3vw,181px)]">
            Baby Benjamín
          </h1>
          <p className="caps mt-2 text-[11px] sm:text-[clamp(13px,0.93vw,18px)]">Te invita a su</p>
          <p className="evento m-0 text-[62px] leading-none sm:text-[clamp(92px,6.57vw,110px)]">
            Baby Shower
          </p>
          {/* Divisor de acuarela (356x85). Reemplaza al SVG plano solo aquí: el de
              confirmar asistencia es distinto en el diseño, sin línea punteada. */}
          <Image
            src={ln1c}
            alt=""
            aria-hidden
            sizes="(max-width: 639px) 240px, 30vw"
            className="mt-1 h-auto w-[240px] sm:w-[clamp(300px,21.4vw,420px)]"
          />
          <p className="m-0 mt-1 max-w-[62ch] text-[14px] leading-relaxed text-tinta-4 sm:text-[clamp(15px,1.07vw,21px)]">
            ¡Estamos emocionados de celebrar la llegada de nuestro pequeño!
          </p>
          <CuentaRegresiva fechaIso={FECHA} />
        </div>
      </section>

      {/* ---------------- 2. DETALLES DEL EVENTO ---------------- */}
      <section id="detalles" className="relative scroll-mt-8 px-5 pb-8 sm:px-16">
        <Fondo color="bg-white" />
        <div className="relative flex flex-col items-center gap-6 px-7 py-9 pb-16 sm:px-9 sm:py-11 sm:pb-20">
          <Corazon className="relative z-10 h-4 w-4 text-azul-lazo" />
          <h2 className="caps relative z-10 m-0 text-[17px] text-tinta-2 sm:text-[clamp(21px,1.5vw,30px)]">
            Detalles del evento
          </h2>

          <div className="relative z-10 grid w-full max-w-[600px] grid-cols-1 justify-items-center gap-7 sm:max-w-[clamp(600px,43vw,820px)] sm:grid-cols-3">
            {DATOS.map((d) => (
              <div key={d.icono} className="flex flex-col items-center gap-2.5">
                <span className="flex h-[74px] w-[74px] items-center justify-center rounded-full border border-linea-fuerte bg-[#FCF7EE] text-[#B08D6A] sm:h-[clamp(74px,5.3vw,100px)] sm:w-[clamp(74px,5.3vw,100px)]">
                  <Icono tipo={d.icono} />
                </span>
                {d.etiqueta && (
                  <span className="caps text-[12px] sm:text-[clamp(12px,0.86vw,17px)]">
                    {d.etiqueta}
                  </span>
                )}
                <span className="caps whitespace-pre-line text-center text-[12px] font-bold text-tinta-2 sm:text-[clamp(12px,0.86vw,17px)]">
                  {d.valor}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Al borde de la pantalla: cuelgan de la sección, no del contenedor de texto */}
        <Decoracion
          src={ln2l}
          lado="izq"
          clase="lg:left-0 lg:top-0 lg:w-[19%] lg:max-w-[300px]"
        />
        <Decoracion
          src={ln2r}
          lado="der"
          clase="lg:bottom-8 lg:right-0 lg:w-[26%] lg:max-w-[300px]"
        />

        {/* Cierra la banda de detalles, ya sin tarjeta: texto suelto sobre el fondo */}
        <div className="relative z-10 mx-auto max-w-[560px] px-7 pb-10 text-center sm:max-w-[clamp(560px,40vw,760px)]">
          <p className="m-0 font-serif text-[19px] italic leading-relaxed text-tinta-3 sm:text-[clamp(23px,1.64vw,33px)]">
            Porque los mejores momentos se viven
            <br />y se celebran juntos
          </p>
        </div>
      </section>

      {/* ---------------- 3. MESA DE REGALOS ---------------- */}
      <section id="regalos" className="relative scroll-mt-8 px-5 pb-8 pt-2 sm:px-16">
        <Fondo color="bg-crema" />
        <div className="relative flex min-h-[300px] flex-col items-center gap-3.5 px-7 py-9 text-center sm:px-9 sm:py-12 lg:min-h-[clamp(390px,27.9vw,480px)]">
          <Corazon className="relative z-10 h-4 w-4 text-azul-lazo" />
          <h2 className="caps relative z-10 m-0 text-[17px] text-tinta-2 sm:text-[clamp(21px,1.5vw,30px)]">
            Mesa de regalos
          </h2>
          <p className="relative z-10 m-0 max-w-[52ch] text-[14px] leading-relaxed text-balance text-tinta-4 sm:text-[clamp(15px,1.07vw,21px)]">
            Tu presencia es nuestro mejor regalo. Sin embargo, si deseas tener un detalle y no
            sabes qué regalarle a Benjamín, aquí te dejamos algunas ideas que nos serán de gran
            ayuda.
          </p>
          <Link
            href="/lista"
            className="caps relative z-10 mt-2.5 inline-flex h-12 items-center justify-center gap-3 rounded-full border-[1.5px] border-[#E1C8B1] bg-[#FCF7EE] px-7 text-[12px] font-bold text-tinta-3 no-underline transition-colors hover:bg-[#F3E8D6] sm:h-[clamp(48px,3.4vw,64px)] sm:px-[clamp(28px,2vw,40px)] sm:text-[clamp(13px,0.93vw,18px)]"
          >
            <span className="text-[#B08D6A]">
              <Icono tipo="regalo" />
            </span>
            Ver opciones de regalo
          </Link>
        </div>

        <Decoracion
          src={ln3l}
          lado="izq"
          clase="lg:bottom-0 lg:left-0 lg:top-auto lg:w-[27%] lg:max-w-[450px]"
        />
        <Decoracion
          src={ln3r}
          lado="der"
          clase="lg:bottom-0 lg:right-0 lg:w-[36%] lg:max-w-[590px]"
        />
      </section>

      {/* ---------------- 4. GALERÍA + CONFIRMAR ASISTENCIA ---------------- */}
      <section className="relative px-5 sm:px-16">
        <Fondo color="bg-white" />
        <div className="relative grid grid-cols-1 gap-8 px-7 py-9 sm:px-9 sm:py-11 lg:grid-cols-[1.35fr_1fr] lg:items-center lg:gap-10">
          {/* Galería */}
          <div id="galeria" className="scroll-mt-8">
            <div className="flex flex-col items-center gap-2 lg:items-start">
              <Corazon className="h-4 w-4 text-azul-lazo" />
              <h2 className="caps m-0 text-[17px] text-tinta-2 sm:text-[clamp(21px,1.5vw,30px)]">
                Galería
              </h2>
            </div>
            <Galeria fotos={polaroids} />
          </div>

          {/* Confirmar asistencia */}
          <div
            id="asistencia"
            className="flex scroll-mt-8 flex-col items-center gap-3 rounded-[22px] border border-linea bg-[#FCF7EE]/70 px-6 py-8 text-center sm:py-[clamp(32px,2.3vw,48px)]"
          >
            <h2 className="caps m-0 text-[16px] text-tinta-2 sm:text-[clamp(19px,1.36vw,27px)]">
              Confirma tu asistencia
            </h2>
            <p className="m-0 max-w-[52ch] text-[14px] leading-relaxed text-balance text-tinta-4 sm:text-[clamp(15px,1.07vw,21px)]">
              Para nosotros es muy importante contar con tu presencia y celebrar juntos la próxima
              llegada de Benjamín. Por favor, confírmanos tu asistencia antes del 31 de agosto.
            </p>
            <a
              href={ENLACE_WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="caps mt-1 inline-flex h-12 items-center justify-center gap-3 rounded-full border-[1.5px] border-[#E1C8B1] bg-papel px-7 text-[12px] font-bold text-tinta-3 no-underline transition-colors hover:bg-[#F3E8D6] sm:h-[clamp(48px,3.4vw,64px)] sm:px-[clamp(28px,2vw,40px)] sm:text-[clamp(13px,0.93vw,18px)]"
            >
              <Corazon className="h-4 w-4 text-[#B08D6A]" />
              Confirmar asistencia
            </a>
            <Divisor className="mt-2 scale-90" />
          </div>
        </div>
      </section>

      {/* ---------------- 5. PIE ----------------
          El alto de la banda lo fija su contenido —la proporción de las olas—,
          no un valor en píxeles. El oso y la nube van absolutos, pegados al
          fondo y a su borde. */}
      <footer className="relative">
        <Fondo color="bg-white" />
        <Olas />

        {/* No usan <Decoracion>: esa regla manda la columna izquierda a la esquina
            SUPERIOR en móvil, y aquí las dos tienen que quedar sobre las olas. */}
        <Image
          src={ln4l}
          alt=""
          aria-hidden
          sizes="(max-width: 1023px) 140px, 30vw"
          className="pointer-events-none absolute bottom-0 left-0 z-0 w-[34%] max-w-[540px] select-none opacity-70 sm:w-[26%]"
        />
        <Image
          src={ln4r}
          alt=""
          aria-hidden
          sizes="(max-width: 1023px) 95px, 16vw"
          className="pointer-events-none absolute bottom-0 right-0 z-0 w-[22%] max-w-[250px] select-none opacity-70 sm:w-[14%]"
        />

        <div className="absolute inset-x-0 bottom-4 z-10 flex flex-col items-center gap-2 px-5 sm:bottom-7 sm:px-16">
          <p className="caps m-0 text-center text-[12px] leading-loose text-tinta-4 sm:text-[clamp(13px,0.93vw,18px)]">
            ¡Gracias por ser parte
            <br />
            de este momento tan especial!
          </p>
          <Corazon className="h-3.5 w-3.5 text-azul-lazo" />
        </div>
      </footer>

      {/* Flota sobre todo: confirmar es lo que más se olvida cuando alguien
          entró solo a mirar. */}
      <BotonAsistencia clase="bottom-5 right-5 sm:bottom-7 sm:right-7" />
    </main>
  );
}
