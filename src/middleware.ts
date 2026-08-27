/**
 * Cierra `/admin/*` entero.
 *
 * Va en middleware y no en cada página a propósito: si mañana alguien agrega
 * `/admin/loquesea` y olvida la comprobación, esta ruta ya está cubierta. Una
 * pantalla desprotegida por descuido es el error clásico de los paneles.
 *
 * Quién puede pasar lo decide el callback `authorized` de `@/lib/auth`.
 */
export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/admin/:path*"],
};
