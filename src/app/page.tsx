import Link from "next/link";
import { Oso, OsoMarca, Conejo, Globo, Rama, Nube, Corazon, Estrella, Divisor } from "@/components/ilustraciones";
import { CuentaRegresiva } from "@/components/cuenta-regresiva";

const FECHA = process.env.NEXT_PUBLIC_FECHA_EVENTO ?? "2026-09-13T15:00:00-05:00";
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP ?? "573000000000";
const MENSAJE = encodeURIComponent("¡Hola! Confirmo mi asistencia al baby shower de Benjamín 🧸");

const NAV = [
  ["Detalles", "#detalles"],
  ["Mesa de regalos", "#regalos"],
  ["Galería", "#galeria"],
  ["Confirmar asistencia", "#asistencia"],
] as const;

const DATOS = [
  { icono: "calendario", etiqueta: "Domingo", valor: "13 de septiembre" },
  { icono: "reloj", etiqueta: "Hora", valor: "3:00 PM" },
  { icono: "lugar", etiqueta: "Salón Social", valor: "Urb. Puerto Ventura\nCr 57 #38-220" },
] as const;

const FOTOS = [
  { titulo: "Revelación de género", rot: "-rotate-3", tinte: "bg-[#EDE0CB]" },
  { titulo: "Humo azul", rot: "rotate-2", tinte: "bg-[#DFE7EC]" },
  { titulo: "Nosotros dos", rot: "-rotate-1", tinte: "bg-[#E7EADF]" },
  { titulo: "La torta", rot: "rotate-3", tinte: "bg-[#F0E4D2]" },
  { titulo: "Con la familia", rot: "-rotate-2", tinte: "bg-[#E4E9EE]" },
  { titulo: "El anuncio", rot: "rotate-1", tinte: "bg-[#EFE2CE]" },
] as const;

function Icono({ tipo }: { tipo: string }) {
  const comun = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true" {...comun}>
      {tipo === "calendario" && (<><rect x="3.5" y="5" width="17" height="16" rx="3" /><path d="M8 3v4M16 3v4M3.5 10h17" /></>)}
      {tipo === "reloj" && (<><circle cx="12" cy="12" r="8.6" /><path d="M12 6.8V12l3.6 2.1" /></>)}
      {tipo === "lugar" && (<><path d="M12 21.5s7.2-5.9 7.2-11.4A7.2 7.2 0 0 0 4.8 10c0 5.6 7.2 11.5 7.2 11.5Z" /><circle cx="12" cy="10" r="2.4" /></>)}
    </svg>
  );
}

function Polaroid({ titulo, rot, tinte }: { titulo: string; rot: string; tinte: string }) {
  return (
    <figure className={`${rot} rounded-sm bg-papel p-2 pb-7 shadow-[0_6px_20px_-10px_rgba(90,74,51,.45)]`}>
      <div className={`${tinte} flex h-[150px] w-[126px] flex-col items-center justify-center gap-1.5 text-tinta/30 sm:h-[210px] sm:w-[176px]`}>
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2.5" /><circle cx="8.5" cy="10" r="1.8" /><path d="m4 17 4.5-4.5 3.5 3.5 3-3L20 17" />
        </svg>
        <figcaption className="px-2 text-center font-ui text-[9px] font-bold tracking-[.12em] uppercase">{titulo}</figcaption>
      </div>
    </figure>
  );
}

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      {/* follaje de fondo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <Rama className="absolute -left-10 top-32 h-[190px] w-[95px] opacity-80 sm:-left-9 sm:h-[300px] sm:w-[150px]" />
        <Rama className="absolute -right-10 top-72 h-[180px] w-[90px] opacity-75 scale-x-[-1] sm:-right-9 sm:h-[280px] sm:w-[140px]" />
        <Rama className="hidden opacity-70 sm:absolute sm:-left-5 sm:top-[560px] sm:block sm:h-[260px] sm:w-[130px] sm:rotate-12" />
        <Estrella className="absolute left-[62%] top-24 h-4 w-4 text-[#EBD5B6] sm:left-[18%]" />
        <Corazon className="absolute left-[12%] top-[420px] h-3.5 w-3.5 text-azul-lazo" />
      </div>

      {/* ---------------- NAV ---------------- */}
      <nav className="relative flex items-center justify-between px-5 pt-4 sm:justify-center sm:gap-9 sm:px-16 sm:pt-7">
        <OsoMarca className="h-8 w-8 sm:hidden" />
        <span className="hidden border-b-[1.5px] border-[#B08D6A] pb-2 text-[#B08D6A] sm:block"><Corazon className="h-5 w-5" /></span>
        {NAV.map(([texto, href]) => (
          <Link key={href} href={href} className="caps hidden text-[13px] no-underline hover:text-tinta-3 sm:block">{texto}</Link>
        ))}
        <Link href="#regalos" className="caps rounded-full border border-linea-fuerte px-4 py-3 text-[11px] no-underline sm:hidden">Menú</Link>
      </nav>

      {/* ---------------- 1. INVITACIÓN ---------------- */}
      <section className="relative flex flex-col items-center gap-3 px-5 pb-10 pt-6 text-center sm:gap-3.5 sm:px-16 sm:pb-14 sm:pt-8">
        <Nube className="absolute left-16 top-4 hidden h-[70px] w-[150px] sm:block" aria-hidden="true" />
        <Oso className="absolute left-9 top-[150px] hidden h-[258px] w-[240px] sm:block" aria-hidden="true" />
        <Globo className="absolute right-14 top-5 hidden h-[274px] w-[190px] sm:block" aria-hidden="true" />

        <Corazon className="h-5 w-5 text-[#E0CBAE]" />
        <h1 className="script text-[68px] sm:text-[100px]">Bebé Benjamín</h1>
        <p className="caps text-[12px] sm:text-[15px]">Te invito a mi</p>
        <p className="script text-[54px] sm:text-[78px]">Baby Shower</p>
        <Divisor />
        <p className="mt-2 max-w-[44ch] text-[15px] leading-relaxed text-tinta-4 sm:text-[17px]">
          ¡Mis papás están muy emocionados de celebrar mi llegada!
        </p>
        <Oso className="mt-2 h-[161px] w-[150px] sm:hidden" aria-hidden="true" />
        <Corazon className="h-4 w-4 text-azul-lazo" />
        <CuentaRegresiva fechaIso={FECHA} />
      </section>

      {/* ---------------- 2. DETALLES DEL EVENTO ---------------- */}
      <section id="detalles" className="relative scroll-mt-8 px-5 pb-8 sm:px-16">
        <div className="panel relative flex flex-col items-center gap-6 overflow-hidden px-7 py-9 sm:px-9 sm:py-11">
          <Conejo className="absolute bottom-3 right-8 hidden h-[190px] w-[150px] sm:block" aria-hidden="true" />
          <Corazon className="h-4 w-4 text-azul-lazo" />
          <h2 className="caps m-0 text-[17px] text-tinta-2 sm:text-[21px]">Detalles del evento</h2>
          <div className="grid w-full max-w-[640px] grid-cols-1 justify-items-center gap-7 sm:grid-cols-3">
            {DATOS.map((d) => (
              <div key={d.icono} className="flex flex-col items-center gap-2.5">
                <span className="flex h-[74px] w-[74px] items-center justify-center rounded-full border border-linea-fuerte bg-[#FCF7EE] text-[#B08D6A]">
                  <Icono tipo={d.icono} />
                </span>
                <span className="caps text-[12px]">{d.etiqueta}</span>
                <span className="whitespace-pre-line text-center font-serif text-[16px] font-bold leading-snug text-tinta-2">{d.valor}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="panel relative z-10 mx-auto -mt-3.5 max-w-[620px] px-7 py-6 text-center">
          <p className="m-0 font-serif text-[20px] italic leading-relaxed text-tinta-3 sm:text-[24px]">
            Porque los mejores momentos se viven<br />y se celebran juntos
          </p>
        </div>
      </section>

      {/* ---------------- 3. MESA DE REGALOS ---------------- */}
      <section id="regalos" className="relative scroll-mt-8 px-5 py-8 sm:px-16">
        <div className="panel relative flex flex-col items-center gap-3.5 overflow-hidden px-7 py-9 text-center sm:px-9 sm:py-11">
          <Oso className="absolute bottom-2 left-10 hidden h-[161px] w-[150px] sm:block" aria-hidden="true" />
          <Corazon className="h-4 w-4 text-azul-lazo" />
          <h2 className="caps m-0 text-[17px] text-tinta-2 sm:text-[21px]">Mesa de regalos</h2>
          <p className="m-0 max-w-[40ch] font-serif text-[17px] leading-relaxed text-tinta-3 sm:text-[19px]">
            Tu presencia es el mejor regalo, pero si quieres tener un detalle con Benjamín, armamos una lista con cosas que de verdad vamos a usar.
          </p>
          <p className="m-0 max-w-[42ch] font-serif text-[15px] leading-relaxed text-tinta-5 sm:text-[16px]">
            Escoges una, la marcas como tuya, y así nadie repite ni gasta de más. Ya definimos tallas y cantidades.
          </p>
          <Link
            href="/lista"
            className="caps mt-2.5 inline-flex h-14 items-center justify-center gap-3 rounded-full border-[1.5px] border-[#D9C4A4] bg-[#FCF7EE] px-8 text-[13px] font-bold text-tinta-3 no-underline transition-colors hover:bg-[#F3E8D6] sm:text-[14px]"
          >
            Ver la lista de regalos
          </Link>
          <span className="font-ui text-[12px] text-tinta-6">26 regalos · 7 para dar entre varios · reservas hasta el 11 de septiembre</span>
        </div>
      </section>

      {/* ---------------- 4. GALERÍA ---------------- */}
      <section id="galeria" className="relative flex scroll-mt-8 flex-col items-center gap-2.5 px-5 py-8 sm:px-16">
        <Corazon className="h-4 w-4 text-azul-lazo" />
        <h2 className="caps m-0 text-[17px] text-tinta-2 sm:text-[21px]">Galería</h2>
        <p className="m-0 font-serif text-[16px] italic text-tinta-4 sm:text-[18px]">Del día en que supimos que eras un niño</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
          {FOTOS.map((f) => <Polaroid key={f.titulo} {...f} />)}
        </div>
      </section>

      {/* ---------------- 5. CONFIRMAR ASISTENCIA ---------------- */}
      <section id="asistencia" className="relative scroll-mt-8 px-5 pb-10 sm:px-16">
        <div className="panel flex flex-col items-center gap-3 px-7 py-9 text-center">
          <h2 className="caps m-0 text-[16px] text-tinta-2 sm:text-[20px]">Confirma tu asistencia</h2>
          <p className="m-0 font-serif text-[17px] text-tinta-4 sm:text-[18px]">¡Nos encantaría contar contigo!</p>
          <a
            href={`https://wa.me/${WHATSAPP}?text=${MENSAJE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="caps mt-1.5 inline-flex h-13 items-center justify-center gap-3 rounded-full border-[1.5px] border-[#D9C4A4] bg-[#FCF7EE] px-7 py-4 text-[12px] font-bold text-tinta-3 no-underline transition-colors hover:bg-[#F3E8D6] sm:text-[13px]"
          >
            <Corazon className="h-4 w-4 text-[#B08D6A]" />
            Confirmar por WhatsApp
          </a>
          <Divisor className="mt-2 scale-90" />
        </div>
      </section>

      {/* ---------------- PIE ---------------- */}
      <footer className="relative flex flex-col items-center gap-2.5 overflow-hidden px-5 pb-10 pt-6 sm:px-16">
        <div className="relative flex h-[120px] w-full items-end justify-center">
          <Nube className="absolute bottom-0 left-1/2 h-[108px] w-[230px] -translate-x-1/2" aria-hidden="true" />
          <Oso className="relative -mb-3.5 h-[118px] w-[110px]" aria-hidden="true" />
        </div>
        <p className="caps m-0 text-center text-[12px] leading-loose text-tinta-4 sm:text-[13px]">
          ¡Gracias por ser parte<br />de este momento tan especial!
        </p>
        <Corazon className="h-3.5 w-3.5 text-azul-lazo" />
      </footer>
    </main>
  );
}
