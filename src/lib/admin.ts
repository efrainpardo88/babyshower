import { desc, eq, sql } from "drizzle-orm";
import { db } from "./db";
import { categorias, regalos, reservas } from "./db/schema";

/**
 * Las consultas del panel.
 *
 * Aquí SÍ salen los nombres y correos de los invitados: es exactamente para lo
 * que existe el panel. En `/lista` no salen — ver .claude/docs/decisiones.md.
 *
 * Ninguna de estas funciones comprueba permisos. La puerta la cierra el
 * middleware sobre `/admin/*`, y las páginas vuelven a verificar la sesión.
 */

export type FilaReserva = {
  id: string;
  lote: string;
  nombre: string;
  email: string;
  telefono: string | null;
  mensaje: string | null;
  cantidad: number;
  estado: "activa" | "cancelada";
  creadoEn: Date;
  regaloNombre: string;
  categoriaNombre: string;
};

export async function listarReservas(): Promise<FilaReserva[]> {
  return db
    .select({
      id: reservas.id,
      lote: reservas.lote,
      nombre: reservas.nombre,
      email: reservas.email,
      telefono: reservas.telefono,
      mensaje: reservas.mensaje,
      cantidad: reservas.cantidad,
      estado: reservas.estado,
      creadoEn: reservas.creadoEn,
      regaloNombre: regalos.nombre,
      categoriaNombre: categorias.nombre,
    })
    .from(reservas)
    .innerJoin(regalos, eq(reservas.regaloId, regalos.id))
    .innerJoin(categorias, eq(regalos.categoriaId, categorias.id))
    .orderBy(desc(reservas.creadoEn));
}

export type Resumen = {
  regalosTotales: number;
  regalosCubiertos: number;
  unicosLibres: number;
  reservasActivas: number;
  reservasCanceladas: number;
  personas: number;
  conMensaje: number;
};

export async function cargarResumen(): Promise<Resumen> {
  const [r] = await db.execute<{
    regalos_totales: number;
    regalos_cubiertos: number;
    unicos_libres: number;
    reservas_activas: number;
    reservas_canceladas: number;
    personas: number;
    con_mensaje: number;
  }>(sql`
    select
      (select count(*)::int from ${regalos} where publicado = true) as regalos_totales,
      -- Un regalo «cubierto» es uno que ya tiene al menos una reserva activa.
      (select count(distinct v.regalo_id)::int from ${reservas} v where v.estado = 'activa') as regalos_cubiertos,
      -- Lo que de verdad importa el 4 de septiembre: qué queda por tomar.
      (select count(*)::int from ${regalos} r
        where r.publicado = true and r.modo = 'unico'
          and not exists (select 1 from ${reservas} v where v.regalo_id = r.id and v.estado = 'activa')
      ) as unicos_libres,
      (select count(*)::int from ${reservas} where estado = 'activa') as reservas_activas,
      (select count(*)::int from ${reservas} where estado = 'cancelada') as reservas_canceladas,
      (select count(distinct email)::int from ${reservas} where estado = 'activa') as personas,
      (select count(*)::int from ${reservas} where estado = 'activa' and mensaje is not null and mensaje <> '') as con_mensaje
  `);

  return {
    regalosTotales: r.regalos_totales,
    regalosCubiertos: r.regalos_cubiertos,
    unicosLibres: r.unicos_libres,
    reservasActivas: r.reservas_activas,
    reservasCanceladas: r.reservas_canceladas,
    personas: r.personas,
    conMensaje: r.con_mensaje,
  };
}

/**
 * El CSV para abrir en Excel o Google Sheets.
 *
 * Va con punto y coma y con BOM porque el Excel en español lo espera así: con
 * coma mete todo en una sola columna, y sin BOM las tildes salen rotas.
 */
export function aCsv(filas: FilaReserva[]): string {
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const cabecera = [
    "Fecha",
    "Estado",
    "Nombre",
    "Correo",
    "Teléfono",
    "Regalo",
    "Categoría",
    "Cantidad",
    "Mensaje",
  ];
  const cuerpo = filas.map((f) =>
    [
      new Intl.DateTimeFormat("es-CO", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "America/Bogota",
      }).format(f.creadoEn),
      f.estado,
      f.nombre,
      f.email,
      f.telefono ?? "",
      f.regaloNombre,
      f.categoriaNombre,
      f.cantidad,
      f.mensaje ?? "",
    ]
      .map(esc)
      .join(";"),
  );
  return "﻿" + [cabecera.join(";"), ...cuerpo].join("\r\n");
}
