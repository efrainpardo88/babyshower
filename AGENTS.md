# La lista de Benjamín — mesa de regalos de baby shower

Sitio de invitación + mesa de regalos para el baby shower de **Benjamín Pardo**.
**Domingo 13 de septiembre de 2026, 3:00 pm.** Salón Social, Urb. Puerto Ventura, Cr 57 #38-220.

## Fecha límite real

El evento es el 13, pero **la página tiene que estar viva el viernes 4 de septiembre**.
Los invitados necesitan una semana para reservar y comprar. Las reservas cierran el viernes 11.
Cualquier decisión de alcance se toma contra el 4 de septiembre, no contra el 13.

## Dónde está cada cosa

| Archivo | Qué tiene |
|---|---|
| `docs/decisiones.md` | **Léelo antes de cambiar algo.** Por qué el proyecto es así, y qué NO hacer |
| `docs/plan.md` | Calendario, plan B de recortes, riesgos y pendientes |
| `src/lib/db/seed.ts` | Los 26 regalos con modo, cupos y precios — fuente de verdad del contenido |
| `src/lib/db/schema.ts` | Esquema; los comentarios explican la restricción de concurrencia |
| `src/app/globals.css` | Todos los colores y tipografías bajo `@theme` |
| `src/components/ilustraciones.tsx` | SVG de guía; se reemplazan por las acuarelas |
| `docs/diseno/*.png` | **Las 10 pantallas aprobadas.** Míralas antes de construir |

## El problema que resuelve

Los papás no quieren regalos repetidos, ni costosos, ni cosas que no van a usar.
La lista tiene **26 ítems** con talla y cantidad ya definidas. La página impide los repetidos.

## Reglas de negocio (esto es lo que importa)

Cada regalo tiene un `modo` que define cómo se puede reservar:

| Modo | Qué hace | Ejemplos |
|---|---|---|
| `unico` | Una persona lo reserva y sale de circulación | Bañera, pañalera, mantas |
| `multiple` | Se puede reservar varias veces. `cuposMax` limita; `null` = sin límite | Pañales por talla (5 cupos), pañitos y libros (sin límite) |
| `grupo` | Varias personas se apuntan al mismo regalo | Silla de carro, coche, monitor |

**La página NUNCA maneja dinero.** En los regalos de grupo solo muestra quiénes se apuntaron
y cómo contactarlos; el recaudo lo resuelven ellos por fuera. No integrar pasarelas de pago.

**Precios: el invitado ve el rango real.** «Entre $20.000 y $80.000» (COP), en la tarjeta,
en la ficha y en el panel de selección. `precioMin`/`precioMax` son públicos.

Es un **cambio del 25 de agosto** sobre la decisión original de mostrar solo `$ · $$ · $$$`
— ver `docs/decisiones.md`. `nivelPrecio` se queda, pero degradado: sirve de respaldo
cuando un regalo no tiene rango cargado, y para agrupar en el panel.
El rango siempre se arma con `formatearRango()` de `src/lib/precio.ts`; no formatear cifras a mano.

**Todo ítem lleva talla o cantidad explícita en el nombre.** «Pañales talla 2», no «pañales».
Esta regla sola evita la mayoría de los repetidos.

**Confirmar asistencia = enlace a WhatsApp.** No hay tabla de RSVP ni formulario. Es deliberado.

## La restricción técnica que no se puede romper

Dos invitados pueden hacer clic en el mismo regalo al mismo segundo. La garantía la da Postgres:

1. `SELECT ... FROM regalos WHERE id = $1 FOR UPDATE` dentro de la transacción (serializa por regalo)
2. Contar reservas activas y validar contra `modo`/`cuposMax`
3. Insertar con `esUnico` copiado del regalo
4. El índice único parcial `reservas_unico_activo_idx` es la red de seguridad

Cuando la reserva falla por conflicto, **no mostrar un error genérico**: se confirma lo que sí
quedó y se dice con claridad qué se cayó. Está diseñado — ver `docs/diseno/Reserva.png`.

## Diseño

**El diseño está aprobado y está en el repo como imágenes: `docs/diseno/`.**
Ábrelas — son la especificación visual. Empieza por `docs/diseno/README.md`.

El canvas en vivo está en https://claude.ai/code/artifact/bc37c50b-c0dd-473e-8396-2cd30068e9f5
pero **no lo leas con una herramienta**: son ~2 MB de código del editor. Usa las imágenes.

Viene de la invitación impresa que ya se envió a los invitados. No inventar una dirección nueva.

- **Tipografías**: Great Vibes (solo nombres), Cormorant Garamond (titulares y versalitas), Karla (UI y datos)
- **Las versalitas espaciadas** (`.caps`) son lo que le da el aire de invitación impresa. Usarlas para toda etiqueta.
- **Colores**: definidos en `src/app/globals.css` bajo `@theme`. **No inventar colores nuevos**; derivar de los que hay.
- **El color codifica estado**: azul = disponible/acción · salvia = se puede escoger varias veces · pardo = entre varios · gris cálido = reservado
- **El estado se lee por color Y por texto**, nunca solo por color.
- **El oso pardo es la marca**: «Pardo» es el apellido de la familia. No cambiarlo por otro animal.

### Ilustraciones — importante

`src/components/ilustraciones.tsx` tiene SVG planos que son **guía de posición y tamaño**, no el arte final.
Efraín va a entregar PNG de acuarela (los mismos de la invitación). Cuando lleguen, cada SVG se
reemplaza por su `<Image>` respetando la caja y la posición. No rediseñar el layout al hacerlo.

### Orden de la landing (decidido, no reordenar)

1. Invitación — «Bebé Benjamín» / «Te invito a mi» / «Baby Shower» + cuenta regresiva
2. Detalles del evento
3. Mesa de regalos
4. Galería (fotos de la revelación de género)
5. Confirmar asistencia

**El evento va antes que los regalos.** Es una invitación, no una tienda.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind 4
- Neon Postgres + Drizzle ORM
- Auth.js v5 con Google, restringido por lista blanca (`ADMIN_EMAILS`)
- Vercel para desplegar. Subdominio `.vercel.app` al lanzar; dominio propio se puede agregar después.

## Rutas

| Ruta | Acceso | Qué hace |
|---|---|---|
| `/` | Pública | Invitación (ver orden arriba) |
| `/lista` | Pública | Grilla de regalos, filtros, panel de selección |
| `/regalo/[slug]` | Pública | Ficha completa |
| `/reserva/[token]` | Pública con token | Comprobante; cancelar o cambiar |
| `/admin` | Google + lista blanca | Resumen |
| `/admin/regalos` | Privada | CRUD, modo, cupos, fotos |
| `/admin/reservas` | Privada | Quién reservó qué, exportar CSV |
| `/admin/galeria` | Privada | Fotos de la revelación |
| `/admin/ajustes` | Privada | Textos, fechas, correos admin |

## Flujo del invitado

Explora → agrega al panel lateral (`localStorage`) → **un solo formulario** al final
(nombre, correo, teléfono y mensaje opcionales) → recibe enlace con token.
Escribe su nombre una vez, no cinco. No se crea cuenta.

## Empezar

```bash
npm install
cp .env.example .env.local   # llenar valores
npm run db:push              # crear las tablas en Neon
npm run db:seed              # cargar los 26 regalos
npm run dev
```

## Lo que NO se debe hacer

Cada una de estas fue una decisión, no un olvido. Ver `docs/decisiones.md`.

- **No integrar pasarelas de pago.** La página nunca maneja dinero.
- **No mostrar precios sueltos ni inventados.** El rango sale de `precioMin`/`precioMax` vía `formatearRango()`; sin rango se cae a `nivelPrecio`.
- **No agregar tabla ni formulario de RSVP.** Confirmar asistencia es un enlace a WhatsApp.
- **No inventar colores ni tipografías nuevas.** Todo sale de `globals.css`.
- **No reordenar las secciones de la landing.** El evento va antes que los regalos.
- **No cambiar el oso por otro animal.** Es el apellido de la familia.
- **No validar la concurrencia solo en el cliente.** La garantía la da Postgres.
- **No mostrar un error genérico** cuando una reserva choca. Está diseñado, ver `docs/diseno/Reserva.png`.

## Estado actual

- [x] Scaffold, tokens de diseño, esquema de datos
- [x] Landing (`/`) completa
- [ ] `/lista` con estados de tarjeta y panel de selección
- [ ] Lógica de reserva con transacción
- [ ] `/regalo/[slug]` y `/reserva/[token]`
- [ ] Auth con Google y panel de administración
- [x] Los 26 regalos escritos en `seed.ts` (falta correrlo contra Neon)
- [ ] Reemplazar SVG por las acuarelas

## Convenciones

- Código y comentarios en **español**. Es un proyecto familiar, no corporativo.
- Nombres de columnas en snake_case, propiedades TS en camelCase.
- **Alturas de control** (una sola regla, sin excepciones):
  - Acciones principales — reservar, apuntarse, confirmar, filtrar: **48px**
  - Auxiliares — quitar del panel, cantidad +/−, cerrar: **44px**
  - Nada por debajo de 44px es tocable.
- Sin modo oscuro. Es una invitación impresa, tiene un solo modo.
- `node_modules` y `.env.local` nunca se suben.
