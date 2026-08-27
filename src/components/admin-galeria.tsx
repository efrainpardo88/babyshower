"use client";

/**
 * `/admin/galeria` — las fotos de la revelación de género.
 *
 * Lo que se sube aquí sale en la landing de inmediato: la galería lee de
 * `fotos_galeria`, no de una lista escrita en el código.
 */

import { useState, useTransition } from "react";
import { borrarFoto, destacarFoto, moverFoto, subirFoto } from "@/app/admin/(panel)/galeria/acciones";
import { EN_LA_PORTADA } from "@/lib/galeria";
import { prepararImagen } from "@/lib/reducir-imagen";

export type Foto = {
  id: string;
  url: string;
  descripcion: string | null;
  orden: number;
};

export function AdminGaleria({ fotos }: { fotos: Foto[] }) {
  const [aviso, setAviso] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [pendiente, empezar] = useTransition();
  const [confirmando, setConfirmando] = useState<string | null>(null);

  /**
   * El `try/finally` no es adorno: sin él, cualquier fallo de red o de tamaño
   * dejaba la promesa rota, `setSubiendo(false)` nunca corría y el botón se
   * quedaba en «Subiendo…» sin decir nada. Era exactamente lo que veía Erica.
   */
  async function subir(original: File) {
    setAviso(null);
    setSubiendo(true);
    try {
      const listo = await prepararImagen(original);
      if (!listo.ok) {
        setAviso(listo.mensaje);
        return;
      }
      const datos = new FormData();
      datos.set("archivo", listo.archivo);
      const r = await subirFoto(datos);
      if (!r.ok) setAviso(r.mensaje);
    } catch (e) {
      console.error("Falló la subida de la foto:", e);
      setAviso("No se pudo subir la foto. Revisa la conexión e intenta de nuevo.");
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="m-0 font-serif text-[26px] font-bold text-tinta">Galería</h1>
          <p className="mt-1.5 mb-0 font-ui text-[13px] text-tinta-5">
            {fotos.length === 0
              ? "Sin fotos todavía. La landing muestra marcadores de color mientras tanto."
              : `${fotos.length} ${fotos.length === 1 ? "foto" : "fotos"} · las primeras ${EN_LA_PORTADA} se ven en la landing; las demás, al abrir la galería`}
          </p>
        </div>

        <label
          className={`caps flex h-12 cursor-pointer items-center rounded-full bg-azul px-6 text-[11px] font-bold !text-papel transition hover:bg-[#456073] ${
            subiendo ? "pointer-events-none opacity-60" : ""
          }`}
        >
          {subiendo ? "Subiendo…" : "+ Subir foto"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const a = e.target.files?.[0];
              e.target.value = "";
              if (a) void subir(a);
            }}
          />
        </label>
      </div>

      {aviso && (
        <p
          role="alert"
          className="mt-4 mb-0 rounded-xl border border-pardo-linea bg-pardo-100 px-4 py-3 font-ui text-[13px] text-tinta-2"
        >
          {aviso}
        </p>
      )}

      {fotos.length === 0 ? (
        <p className="mt-8 mb-0 rounded-[20px] border border-dashed border-linea-fuerte px-6 py-14 text-center font-serif text-[17px] text-tinta-5">
          Sube las fotos del día de la revelación. Se redimensionan solas.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {fotos.map((f, i) => (
            <div
              key={f.id}
              className={`overflow-hidden rounded-[18px] bg-papel ${
                i < EN_LA_PORTADA ? "border-2 border-azul" : "border border-linea"
              }`}
            >
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element -- miniatura del panel */}
                <img src={f.url} alt={f.descripcion ?? ""} className="h-40 w-full object-cover" />
                {/* Que se vea de un vistazo cuáles son las que salen en la
                    landing: es la pregunta que uno se hace al abrir esto. */}
                {i < EN_LA_PORTADA && (
                  <span className="caps absolute top-2 left-2 rounded-full bg-azul px-2.5 py-1 text-[9px] !text-papel">
                    En la landing
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-1 p-2">
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={i === 0 || pendiente}
                    onClick={() => empezar(async () => void (await moverFoto(f.id, "arriba")))}
                    aria-label="Mover antes"
                    className="h-11 w-11 rounded-full border border-linea-fuerte font-ui text-[13px] text-tinta-3 disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    disabled={i === fotos.length - 1 || pendiente}
                    onClick={() => empezar(async () => void (await moverFoto(f.id, "abajo")))}
                    aria-label="Mover después"
                    className="h-11 w-11 rounded-full border border-linea-fuerte font-ui text-[13px] text-tinta-3 disabled:opacity-30"
                  >
                    →
                  </button>
                  {/* Con 47 fotos, llevar una al principio a punta de flechas
                      serían 39 clics. Esto es un clic. */}
                  <button
                    type="button"
                    disabled={i === 0 || pendiente}
                    onClick={() => empezar(async () => void (await destacarFoto(f.id)))}
                    aria-label="Poner esta foto de primera"
                    title="Poner de primera"
                    className="caps h-11 rounded-full border border-linea-fuerte px-3 text-[9px] text-tinta-3 disabled:opacity-30"
                  >
                    De primera
                  </button>
                </div>

                {confirmando === f.id ? (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={pendiente}
                      onClick={() =>
                        empezar(async () => {
                          await borrarFoto(f.id);
                          setConfirmando(null);
                        })
                      }
                      className="caps h-11 rounded-full bg-gris-fondo px-3 text-[9px] font-bold text-gris-texto"
                    >
                      Sí
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmando(null)}
                      className="caps h-11 rounded-full border border-linea-fuerte px-3 text-[9px] text-tinta-4"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmando(f.id)}
                    aria-label="Borrar esta foto"
                    className="caps h-11 rounded-full px-3 text-[9px] text-gris-texto hover:text-pardo"
                  >
                    Borrar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
