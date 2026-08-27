import { Corazon } from "@/components/ilustraciones";
import { ENLACE_WHATSAPP } from "@/lib/whatsapp";

/**
 * El botón flotante de «confirmar asistencia».
 *
 * Va en la landing y en la lista: son las dos pantallas donde el invitado pasa
 * tiempo, y confirmar es la acción que más fácil se olvida cuando alguien entró
 * a mirar regalos.
 *
 * Color tan/dorado a propósito, no azul. En `/lista` el azul **codifica estado**
 * —disponible, acción sobre un regalo— y este botón no tiene nada que ver con
 * los regalos. Mezclarlo rompería la lectura por color. Ver CLAUDE.md.
 *
 * En pantallas angostas el texto se acorta a «Confirmar», pero NO desaparece: un
 * corazón suelto flotando se lee como «favoritos», no como confirmar asistencia.
 */
export function BotonAsistencia({ clase = "" }: { clase?: string }) {
  return (
    <a
      href={ENLACE_WHATSAPP}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Confirmar mi asistencia por WhatsApp"
      className={`fixed z-40 flex h-14 items-center justify-center gap-2.5 rounded-full border-[1.5px] border-[#E1C8B1] bg-papel px-4 text-tinta-3 no-underline shadow-[0_6px_22px_-8px_rgba(90,74,51,.5)] transition hover:bg-[#F3E8D6] sm:px-6 ${clase}`}
    >
      <span className="text-[#B08D6A]">
        <Corazon className="h-5 w-5" />
      </span>
      <span className="caps text-[11px] font-bold sm:text-[12px]">
        Confirmar<span className="hidden sm:inline"> asistencia</span>
      </span>
    </a>
  );
}
