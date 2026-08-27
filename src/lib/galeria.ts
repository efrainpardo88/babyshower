/**
 * Cuántas polaroid se ven en la sección de galería de la landing.
 *
 * Vive aquí, y no dentro del componente, porque lo necesitan DOS sitios que no
 * se hablan: la landing, que pinta la tira, y `/admin/galeria`, que marca cuáles
 * están en portada. Si cada uno tuviera su número, un día dirían cosas distintas
 * y el panel prometería una portada que no es.
 *
 * No son todas a propósito: con 47 fotos la tira desequilibraría la sección
 * frente a la caja de confirmar asistencia. Las demás se ven en el visor.
 */
export const EN_LA_PORTADA = 8;
