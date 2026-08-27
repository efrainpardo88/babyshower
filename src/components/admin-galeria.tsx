"use client";

/**
 * `/admin/galeria` — las fotos de la revelación de género.
 *
 * Lo que se sube aquí sale en la landing de inmediato: la galería lee de
 * `fotos_galeria`, no de una lista escrita en el código.
 */

import { useState, useTransition } from "react";
import { borrarFoto, moverFoto, subirFoto } from "@/app/admin/(panel)/galeria/acciones";

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

  async function subir(archivo: File) {
    setAviso(null);
    setSubiendo(true);
    const datos = new FormData();
    datos.set("archivo", archivo);
    const r = await subirFoto(datos);
    setSubiendo(false);
    if (!r.ok) setAviso(r.mensaje);
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="m-0 font-serif text-[26px] font-bold text-tinta">Galería</h1>
          <p className="mt-1.5 mb-0 font-ui text-[13px] text-tinta-5">
            {fotos.length === 0
              ? "Sin fotos todavía. La landing muestra marcadores de color mientras tanto."
              : `${fotos.length} ${fotos.length === 1 ? "foto" : "fotos"} · salen en la landing en este orden`}
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
            <div key={f.id} className="overflow-hidden rounded-[18px] border border-linea bg-papel">
              {/* eslint-disable-next-line @next/next/no-img-element -- miniatura del panel */}
              <img src={f.url} alt={f.descripcion ?? ""} className="h-40 w-full object-cover" />

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
