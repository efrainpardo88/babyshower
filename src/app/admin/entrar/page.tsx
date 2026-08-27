import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, esAdmin, signIn } from "@/lib/auth";
import { Corazon } from "@/components/ilustraciones";

/**
 * La única pantalla pública bajo `/admin`. Sin ella no habría por dónde entrar.
 * El middleware la deja pasar explícitamente.
 */
export const metadata: Metadata = {
  title: "Entrar · Panel",
  robots: { index: false, follow: false },
};

export default async function Entrar({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sesion = await auth();
  if (esAdmin(sesion?.user?.email)) redirect("/admin");

  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-crema px-5">
      <div className="w-full max-w-[380px] rounded-[26px] border border-linea bg-papel p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center text-[#B08D6A]">
          <Corazon className="h-7 w-7" />
        </span>
        <h1 className="mt-3 mb-0 font-serif text-[24px] font-bold text-tinta">Panel de la lista</h1>
        <p className="mt-2 mb-0 font-ui text-[13px] leading-relaxed text-tinta-5">
          Solo para los papás de Benjamín.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-5 mb-0 rounded-2xl border border-pardo-linea bg-pardo-100 px-4 py-3 font-ui text-[12px] leading-relaxed text-tinta-2"
          >
            Ese correo no tiene acceso al panel. Entra con la cuenta autorizada.
          </p>
        )}

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/admin" });
          }}
        >
          <button
            type="submit"
            className="caps mt-6 h-12 w-full rounded-full bg-azul text-[12px] font-bold !text-papel transition hover:bg-[#456073]"
          >
            Entrar con Google
          </button>
        </form>
      </div>
    </main>
  );
}
