import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, esAdmin, signOut } from "@/lib/auth";
import { Corazon } from "@/components/ilustraciones";

/**
 * El armazón del panel: encabezado, navegación y salir.
 *
 * Vuelve a comprobar la sesión aunque el middleware ya cubra `/admin/*`. No es
 * redundancia por gusto: el middleware puede quedar mal configurado en un
 * despliegue y esto seguiría en pie. Dos capas para los datos de los invitados.
 */
export const metadata: Metadata = {
  title: "Panel · La lista de Benjamín",
  robots: { index: false, follow: false },
};

const NAV = [
  ["Resumen", "/admin"],
  ["Regalos", "/admin/regalos"],
  ["Reservas", "/admin/reservas"],
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sesion = await auth();
  if (!esAdmin(sesion?.user?.email)) redirect("/admin/entrar");

  return (
    <div className="min-h-screen bg-crema">
      <header className="border-b border-linea bg-papel">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
          <div className="flex items-center gap-2.5">
            <span className="text-[#B08D6A]">
              <Corazon className="h-5 w-5" />
            </span>
            <span className="font-serif text-[18px] font-bold text-tinta">Panel</span>
            <nav className="ml-3 flex gap-1">
              {NAV.map(([texto, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="caps rounded-full px-3 py-2 text-[11px] text-tinta-4 no-underline transition hover:bg-crema"
                >
                  {texto}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/lista"
              className="caps rounded-full px-3 py-2 text-[11px] text-tinta-5 no-underline hover:text-tinta-3"
            >
              Ver el sitio
            </Link>
            <span className="hidden font-ui text-[12px] text-tinta-5 sm:block">
              {sesion?.user?.email}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/entrar" });
              }}
            >
              <button
                type="submit"
                className="caps h-11 rounded-full border border-linea-fuerte px-4 text-[11px] text-tinta-4 transition hover:bg-crema"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8">{children}</main>
    </div>
  );
}
