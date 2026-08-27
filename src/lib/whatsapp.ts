/**
 * El enlace de «confirmar asistencia».
 *
 * Vive aquí porque lo usan tres pantallas: la landing, la lista y el botón
 * flotante. Antes estaba copiado en cada una, y el número de placeholder se
 * quedó sin cambiar más tiempo del que debía.
 *
 * No hay tabla de RSVP ni formulario, y es deliberado: en Colombia la gente
 * responde por WhatsApp mucho más que por formulario. Ver
 * .claude/docs/decisiones.md.
 */

const MENSAJE = "¡Hola! Confirmo mi asistencia al baby shower de Benjamín 🧸";

/** Sin `+` ni espacios: así lo quiere wa.me. */
export const NUMERO = process.env.NEXT_PUBLIC_WHATSAPP ?? "573182633297";

export const ENLACE_WHATSAPP = `https://wa.me/${NUMERO}?text=${encodeURIComponent(MENSAJE)}`;
