import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * El login del panel: Auth.js con Google, restringido por lista blanca.
 *
 * DOS CANDADOS, y ninguno sobra:
 *
 *  1. Google, en estado «Prueba», solo deja entrar a los correos que estén en su
 *     lista de usuarios de prueba.
 *  2. `ADMIN_EMAILS`, aquí. Google certifica QUIÉN eres; esto decide si TIENES
 *     PERMISO. Son cosas distintas y la segunda es la que de verdad protege el
 *     panel: si mañana la app se publica, el primer candado desaparece y este
 *     sigue en pie.
 *
 * La comprobación va en `signIn` y en `authorized`, no en el cliente. Es la
 * misma regla que la concurrencia: la garantía la da el servidor.
 *
 * OJO: este archivo NO puede importar la base de datos. El middleware corre en
 * el runtime Edge y `postgres` no compila ahí.
 */

/**
 * Compara ignorando mayúsculas a propósito.
 *
 * Google devuelve el correo con la capitalización que tenga registrada — en la
 * consola aparece como `JcP.EfrainPardo@gmail.com` — y `ADMIN_EMAILS` está en
 * minúsculas. Sin esto, el dueño del sitio quedaría fuera de su propio panel.
 */
export function esAdmin(email?: string | null): boolean {
  if (!email) return false;
  const permitidos = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (permitidos.length === 0) return false;
  return permitidos.includes(email.trim().toLowerCase());
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: {
    signIn: "/admin/entrar",
    error: "/admin/entrar",
  },
  callbacks: {
    /** Corta el login antes de crear sesión si el correo no está autorizado. */
    signIn({ profile, user }) {
      return esAdmin(profile?.email ?? user?.email);
    },

    /**
     * Lo que usa el middleware para dejar pasar o no. Se vuelve a verificar
     * aquí: una sesión emitida antes de sacar a alguien de `ADMIN_EMAILS`
     * dejaría de servir en la siguiente petición.
     */
    authorized({ auth: sesion, request }) {
      const ruta = request.nextUrl.pathname;
      if (!ruta.startsWith("/admin")) return true;
      // La pantalla de entrar tiene que ser pública, o no habría por dónde entrar.
      if (ruta === "/admin/entrar") return true;
      return esAdmin(sesion?.user?.email);
    },
  },
});
