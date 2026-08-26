import {
  pgTable, pgEnum, uuid, text, integer, boolean, timestamp, index, uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/** Cómo se puede reservar un regalo. Lo decide el admin, regalo por regalo. */
export const modoReserva = pgEnum("modo_reserva", ["unico", "multiple", "grupo"]);

/**
 * Respaldo y agrupación. Desde el 25/08/2026 el invitado ve el rango real
 * (`precioMin`–`precioMax`); esto solo se muestra si el regalo no tiene rango.
 */
export const nivelPrecio = pgEnum("nivel_precio", ["$", "$$", "$$$"]);

export const prioridad = pgEnum("prioridad", ["alta", "media", "baja"]);
export const estadoReserva = pgEnum("estado_reserva", ["activa", "cancelada"]);

export const categorias = pgTable("categorias", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  nombre: text("nombre").notNull(),
  icono: text("icono").notNull().default("regalo"),
  orden: integer("orden").notNull().default(0),
});

export const regalos = pgTable(
  "regalos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    nombre: text("nombre").notNull(),
    /** Talla o cantidad explícita. Esto es lo que evita los repetidos. */
    especificacion: text("especificacion"),
    descripcion: text("descripcion"),
    notaPapas: text("nota_papas"),
    categoriaId: uuid("categoria_id").references(() => categorias.id, { onDelete: "restrict" }).notNull(),

    imagenUrl: text("imagen_url"),
    imagenes: text("imagenes").array().notNull().default(sql`ARRAY[]::text[]`),
    /** [{ tienda, url }] — sugerencias, no obligación. */
    linksCompra: text("links_compra").notNull().default("[]"),

    /**
     * PÚBLICO desde el 25/08/2026 (ver .claude/docs/decisiones.md): el invitado ve
     * «Entre $20.000 y $80.000» en la tarjeta y en la ficha. En COP, sin decimales.
     * Siguen siendo opcionales: un regalo puede existir sin rango mientras el admin
     * lo averigua, y ahí la tarjeta cae a `nivelPrecio`. Si hay uno, deben ir los dos.
     */
    precioMin: integer("precio_min"),
    precioMax: integer("precio_max"),
    /** Respaldo cuando no hay rango. Derivado del rango, con override manual. */
    nivelPrecio: nivelPrecio("nivel_precio").notNull().default("$$"),

    modo: modoReserva("modo").notNull().default("unico"),
    /** Solo modo 'multiple'. null = sin límite (pañitos, libros). */
    cuposMax: integer("cupos_max"),
    /** Solo modo 'grupo'. Cuántas personas esperamos que se apunten. */
    metaPersonas: integer("meta_personas"),

    prioridad: prioridad("prioridad").notNull().default("media"),
    publicado: boolean("publicado").notNull().default(false),
    orden: integer("orden").notNull().default(0),
    creadoEn: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("regalos_categoria_idx").on(t.categoriaId),
    index("regalos_publicado_orden_idx").on(t.publicado, t.orden),
  ],
);

export const reservas = pgTable(
  "reservas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    regaloId: uuid("regalo_id").references(() => regalos.id, { onDelete: "cascade" }).notNull(),
    /** Lo único que el invitado necesita guardar para cambiar o cancelar. */
    token: uuid("token").notNull().defaultRandom().unique(),

    nombre: text("nombre").notNull(),
    email: text("email").notNull(),
    telefono: text("telefono"),
    mensaje: text("mensaje"),

    /**
     * Agrupa las reservas de un mismo envío del formulario.
     *
     * El invitado recibe UN enlace para toda su selección, no uno por regalo
     * — ver .claude/docs/diseno/Reserva.png. `token` sigue siendo por fila
     * porque hace falta para cancelar un regalo suelto sin tocar los demás.
     */
    lote: uuid("lote").notNull().defaultRandom(),

    cantidad: integer("cantidad").notNull().default(1),
    estado: estadoReserva("estado").notNull().default("activa"),
    /**
     * Copia del `modo === 'unico'` del regalo. Está desnormalizada a propósito:
     * un índice parcial de Postgres no puede mirar otra tabla, y este índice es
     * la red de seguridad contra la doble reserva. Lo escribe la capa de reservas
     * leyendo el regalo dentro de la misma transacción.
     */
    esUnico: boolean("es_unico").notNull().default(false),
    creadoEn: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("reservas_regalo_idx").on(t.regaloId),
    index("reservas_email_idx").on(t.email),
    index("reservas_lote_idx").on(t.lote),
    /**
     * LA restricción del proyecto.
     * Un regalo de modo 'unico' admite UNA sola reserva activa. La garantía la da
     * Postgres, no el código: si dos invitados hacen clic al mismo tiempo, uno
     * recibe un error de constraint y le mostramos la pantalla de "reservamos 2 de 3".
     * El índice es parcial y depende de una columna desnormalizada — ver 0001_unico.sql.
     */
    uniqueIndex("reservas_unico_activo_idx")
      .on(t.regaloId)
      .where(sql`${t.estado} = 'activa' AND ${t.esUnico} = true`),
  ],
);

export const ajustes = pgTable("ajustes", {
  clave: text("clave").primaryKey(),
  valor: text("valor").notNull(),
});

export const fotosGaleria = pgTable("fotos_galeria", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: text("url").notNull(),
  descripcion: text("descripcion"),
  orden: integer("orden").notNull().default(0),
  creadoEn: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
});
