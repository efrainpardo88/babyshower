"use client";

/**
 * `/admin/regalos` — la tabla y el editor lateral.
 *
 * Especificación visual: `.claude/docs/diseno/AdminRegalos.png`, adaptada a las
 * reglas de hoy: dos modos en vez de tres, y sin columna de cupos.
 *
 * El editor vive al lado de la tabla, no en un modal: así se ve qué se está
 * cambiando y contra qué se compara.
 */

import { useState, useTransition } from "react";
import {
  alternarPublicado,
  borrarRegalo,
  crearRegalo,
  guardarRegalo,
  type DatosRegalo,
} from "@/app/admin/(panel)/regalos/acciones";

export type RegaloAdmin = {
  id: string;
  slug: string;
  nombre: string;
  especificacion: string | null;
  notaPapas: string | null;
  categoriaId: string;
  categoriaNombre: string;
  precioMin: number | null;
  precioMax: number | null;
  nivelPrecio: "$" | "$$" | "$$$";
  modo: "unico" | "multiple";
  imagenUrl: string | null;
  publicado: boolean;
  reservasActivas: number;
};

export type Categoria = { id: string; nombre: string };

const VACIO: DatosRegalo = {
  nombre: "",
  especificacion: "",
  notaPapas: "",
  categoriaId: "",
  precioMin: "",
  precioMax: "",
  nivelPrecio: "$$",
  modo: "unico",
  imagenUrl: "",
  publicado: true,
};

function aFormulario(r: RegaloAdmin): DatosRegalo {
  return {
    nombre: r.nombre,
    especificacion: r.especificacion ?? "",
    notaPapas: r.notaPapas ?? "",
    categoriaId: r.categoriaId,
    precioMin: r.precioMin?.toString() ?? "",
    precioMax: r.precioMax?.toString() ?? "",
    nivelPrecio: r.nivelPrecio,
    modo: r.modo,
    imagenUrl: r.imagenUrl ?? "",
    publicado: r.publicado,
  };
}

const ENTRADA =
  "w-full rounded-xl border border-linea-fuerte bg-papel px-3 py-2.5 font-ui text-[13px] text-tinta focus:border-azul focus:outline-none";

const MODOS = [
  {
    valor: "unico" as const,
    titulo: "Una sola vez",
    nota: "Sale de la lista al reservarse. También los caros.",
  },
  {
    valor: "multiple" as const,
    titulo: "Varias veces",
    nota: "Sin tope. Nunca se agota: pañales, pañitos, libros.",
  },
];

export function AdminRegalos({
  regalos,
  categorias,
}: {
  regalos: RegaloAdmin[];
  categorias: Categoria[];
}) {
  const [editando, setEditando] = useState<RegaloAdmin | null>(null);
  const [creando, setCreando] = useState(false);
  const [form, setForm] = useState<DatosRegalo>(VACIO);
  const [aviso, setAviso] = useState<string | null>(null);
  const [pendiente, empezar] = useTransition();

  const abierto = creando || editando !== null;
  const publicados = regalos.filter((r) => r.publicado).length;
  const conReservas = regalos.filter((r) => r.reservasActivas > 0).length;

  const cambiar = <K extends keyof DatosRegalo>(k: K, v: DatosRegalo[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  function abrirNuevo() {
    setForm({ ...VACIO, categoriaId: categorias[0]?.id ?? "" });
    setEditando(null);
    setCreando(true);
    setAviso(null);
  }

  function abrirEditar(r: RegaloAdmin) {
    setForm(aFormulario(r));
    setCreando(false);
    setEditando(r);
    setAviso(null);
  }

  function cerrar() {
    setCreando(false);
    setEditando(null);
    setAviso(null);
  }

  function guardar() {
    setAviso(null);
    empezar(async () => {
      const r = creando ? await crearRegalo(form) : await guardarRegalo(editando!.id, form);
      if (r.ok) cerrar();
      else setAviso(r.mensaje);
    });
  }

  function borrar() {
    if (!editando) return;
    setAviso(null);
    empezar(async () => {
      const r = await borrarRegalo(editando.id);
      if (r.ok) cerrar();
      else setAviso(r.mensaje);
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="m-0 font-serif text-[26px] font-bold text-tinta">Regalos</h1>
          <p className="mt-1.5 mb-0 font-ui text-[13px] text-tinta-5">
            {publicados} publicados · {regalos.length - publicados} en borrador · {conReservas} ya
            reservados
          </p>
        </div>
        <button
          type="button"
          onClick={abrirNuevo}
          className="caps h-12 rounded-full bg-azul px-6 text-[11px] font-bold !text-papel transition hover:bg-[#456073]"
        >
          + Nuevo regalo
        </button>
      </div>

      <div className={`mt-6 grid gap-5 ${abierto ? "lg:grid-cols-[1fr_380px]" : ""}`}>
        {/* ---------------- Tabla ---------------- */}
        <div className="overflow-x-auto rounded-[20px] border border-linea bg-papel">
          <table className="w-full min-w-[620px] border-collapse text-left">
            <thead>
              <tr className="border-b border-linea">
                {["Regalo", "Categoría", "Modo", "Reservas", "Estado", ""].map((h) => (
                  <th key={h} className="caps px-4 py-3 text-[10px] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {regalos.map((r) => (
                <tr
                  key={r.id}
                  className={`border-b border-linea last:border-0 ${
                    editando?.id === r.id ? "bg-azul-50" : ""
                  }`}
                >
                  <td className="px-4 py-3 align-top">
                    <span className="block font-serif text-[15px] font-bold text-tinta">
                      {r.nombre}
                    </span>
                    {r.especificacion && (
                      <span className="block font-ui text-[11px] text-tinta-5">
                        {r.especificacion}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top font-ui text-[12px] text-tinta-4">
                    {r.categoriaNombre}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 font-ui text-[11px] font-semibold ${
                        r.modo === "unico"
                          ? "border-azul-200 bg-azul-50 text-azul"
                          : "border-salvia-linea bg-salvia-100 text-salvia"
                      }`}
                    >
                      {r.modo === "unico" ? "Una vez" : "Varias veces"}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top font-ui text-[13px] tabular-nums text-tinta-3">
                    {r.reservasActivas}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <button
                      type="button"
                      disabled={pendiente}
                      onClick={() => empezar(async () => void (await alternarPublicado(r.id, !r.publicado)))}
                      title={r.publicado ? "Esconder de la lista" : "Mostrar en la lista"}
                      className={`inline-flex rounded-full border px-2.5 py-1 font-ui text-[11px] font-semibold transition ${
                        r.publicado
                          ? "border-salvia-linea bg-salvia-100 text-salvia"
                          : "border-linea-fuerte bg-gris-fondo text-gris-texto"
                      }`}
                    >
                      {r.publicado ? "Publicado" : "Borrador"}
                    </button>
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    <button
                      type="button"
                      onClick={() => abrirEditar(r)}
                      className="font-ui text-[13px] font-bold text-azul hover:underline"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ---------------- Editor ---------------- */}
        {abierto && (
          <aside className="rounded-[20px] border border-linea bg-papel p-5 lg:sticky lg:top-6 lg:self-start">
            <div className="flex items-center justify-between gap-3">
              <h2 className="m-0 font-serif text-[18px] font-bold text-tinta">
                {creando ? "Nuevo regalo" : "Editar regalo"}
              </h2>
              {editando && editando.reservasActivas > 0 && (
                <span className="caps rounded-full bg-oso-claro px-2.5 py-1 text-[9px] text-tinta-3">
                  {editando.reservasActivas} reservas
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-3.5">
              <label className="block">
                <span className="font-ui text-[12px] font-bold text-tinta-2">Nombre</span>
                <input
                  value={form.nombre}
                  onChange={(e) => cambiar("nombre", e.target.value)}
                  className={`${ENTRADA} mt-1`}
                />
              </label>

              <label className="block">
                <span className="font-ui text-[12px] font-bold text-tinta-2">
                  Especificación <span className="font-normal text-tinta-5">— talla o cantidad</span>
                </span>
                <input
                  value={form.especificacion}
                  onChange={(e) => cambiar("especificacion", e.target.value)}
                  placeholder="Paquete x3"
                  className={`${ENTRADA} mt-1`}
                />
              </label>

              <label className="block">
                <span className="font-ui text-[12px] font-bold text-tinta-2">Categoría</span>
                <select
                  value={form.categoriaId}
                  onChange={(e) => cambiar("categoriaId", e.target.value)}
                  className={`${ENTRADA} mt-1`}
                >
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="font-ui text-[12px] font-bold text-tinta-2">Precio mín.</span>
                  <input
                    inputMode="numeric"
                    value={form.precioMin}
                    onChange={(e) => cambiar("precioMin", e.target.value)}
                    placeholder="45000"
                    className={`${ENTRADA} mt-1 tabular-nums`}
                  />
                </label>
                <label className="block">
                  <span className="font-ui text-[12px] font-bold text-tinta-2">Precio máx.</span>
                  <input
                    inputMode="numeric"
                    value={form.precioMax}
                    onChange={(e) => cambiar("precioMax", e.target.value)}
                    placeholder="90000"
                    className={`${ENTRADA} mt-1 tabular-nums`}
                  />
                </label>
              </div>

              <div>
                <span className="font-ui text-[12px] font-bold text-tinta-2">
                  Cómo se puede reservar
                </span>
                <div className="mt-1.5 flex flex-col gap-2">
                  {MODOS.map((m) => (
                    <button
                      key={m.valor}
                      type="button"
                      onClick={() => cambiar("modo", m.valor)}
                      className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                        form.modo === m.valor
                          ? "border-azul bg-azul-50"
                          : "border-linea-fuerte bg-papel hover:bg-crema"
                      }`}
                    >
                      <span
                        className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-[5px] ${
                          form.modo === m.valor ? "border-azul" : "border-linea-fuerte"
                        }`}
                        aria-hidden="true"
                      />
                      <span>
                        <span className="block font-ui text-[13px] font-bold text-tinta-2">
                          {m.titulo}
                        </span>
                        <span className="block font-ui text-[11px] leading-relaxed text-tinta-5">
                          {m.nota}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="font-ui text-[12px] font-bold text-tinta-2">
                  Foto <span className="font-normal text-tinta-5">— ruta o URL</span>
                </span>
                <input
                  value={form.imagenUrl}
                  onChange={(e) => cambiar("imagenUrl", e.target.value)}
                  placeholder="/img/regalos/banera.webp"
                  className={`${ENTRADA} mt-1`}
                />
              </label>

              <label className="block">
                <span className="font-ui text-[12px] font-bold text-tinta-2">
                  Nota de los papás <span className="font-normal text-tinta-5">— opcional</span>
                </span>
                <textarea
                  value={form.notaPapas}
                  onChange={(e) => cambiar("notaPapas", e.target.value)}
                  rows={2}
                  className={`${ENTRADA} mt-1 resize-none`}
                />
              </label>

              <button
                type="button"
                onClick={() => cambiar("publicado", !form.publicado)}
                className="flex items-center justify-between gap-3 rounded-xl border border-linea-fuerte p-3 text-left"
              >
                <span>
                  <span className="block font-ui text-[13px] font-bold text-tinta-2">Publicado</span>
                  <span className="block font-ui text-[11px] text-tinta-5">
                    Visible para los invitados
                  </span>
                </span>
                <span
                  className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                    form.publicado ? "bg-azul" : "bg-linea-fuerte"
                  }`}
                  aria-hidden="true"
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-papel transition-all ${
                      form.publicado ? "left-6" : "left-1"
                    }`}
                  />
                </span>
              </button>

              {aviso && (
                <p
                  role="alert"
                  className="m-0 rounded-xl border border-pardo-linea bg-pardo-100 px-3 py-2.5 font-ui text-[12px] leading-relaxed text-tinta-2"
                >
                  {aviso}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={guardar}
                  disabled={pendiente}
                  className="caps h-12 flex-1 rounded-full bg-azul text-[11px] font-bold !text-papel disabled:opacity-60"
                >
                  {pendiente ? "Guardando…" : "Guardar"}
                </button>
                <button
                  type="button"
                  onClick={cerrar}
                  className="caps h-12 rounded-full border border-linea-fuerte px-5 text-[11px] text-tinta-4"
                >
                  Cancelar
                </button>
              </div>

              {editando && (
                <button
                  type="button"
                  onClick={borrar}
                  disabled={pendiente}
                  className="caps h-11 rounded-full text-[10px] text-gris-texto hover:text-pardo"
                >
                  Borrar este regalo
                </button>
              )}
            </div>
          </aside>
        )}
      </div>
    </>
  );
}
