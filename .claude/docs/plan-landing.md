# Plan — landing final

`.claude/docs/diseno/LandingDesktop.png` era una versión **preliminar**. La referencia final es
**`.claude/docs/diseno/LandingDesktopNew.png`**. Este documento es el plan para que `/` quede igual
a esa imagen.

| Referencia | Qué es |
|---|---|
| `LandingDesktopNew.png` | **La especificación.** Referencia principal de `/` |
| `images-guide.png` | Qué PNG va en cada posición, con flechas |
| `remove-svg.png` | Qué SVG plano se elimina, con recuadros rojos |
| `LandingDesktop.png` | Preliminar. Se conserva como historia, ya no se construye contra ella |
| `LandingMovil.png` | Preliminar **y sin reemplazo** — ver riesgos |

---

## Lo que hay que entender antes de tocar código

Esto **no es solo cambiar dibujos**. Los ocho PNG no son figuras sueltas: cada uno es una
**columna decorativa completa** que ya trae su propio follaje, sus nubes y sus estrellas
horneadas dentro.

Por eso los SVG `Rama`, `Nube` y `Estrella` no se recolocan: se borran. Si se dejan, el
follaje queda duplicado y encimado.

Y hay **cambios de contenido** que la imagen trae y que es fácil pasar por alto si uno solo
mira las ilustraciones. Están listados abajo en su propia sección.

---

## Los ocho PNG

Todos en `public/img/`, PNG con transparencia. La ruta en el código es `/img/<archivo>`.

| Archivo | px | Qué trae | Banda | Lado |
|---|---|---|---|---|
| `ln-1-l.png` | 296×594 | Oso sentado + nube + ramas + estrella | Invitación | Izquierda |
| `ln-1-r.png` | 270×481 | Globo aerostático + nubes + rama | Invitación | Derecha |
| `ln-2-l.png` | 219×414 | Rama florecida + cubos «BABY» + estrellas | Detalles | Izquierda |
| `ln-2-r.png` | 266×502 | Conejo en cajón de madera + follaje | Detalles | Derecha |
| `ln-3-l.png` | 302×305 | Oso con globo de corazón + follaje | Mesa de regalos | Izquierda |
| `ln-3-r.png` | 406×333 | Tren de madera con corazón | Mesa de regalos | Derecha |
| `ln-4-l.png` | 383×206 | Oso recostado en nube | Pie | Izquierda |
| `ln-4-r.png` | 180×184 | Nube + estrella | Pie | Derecha |

La convención es `ln-<banda>-<lado>`: cuatro bandas, dos lados cada una.

---

## Qué se elimina

De `src/components/ilustraciones.tsx`, según los recuadros de `remove-svg.png`:

| SVG | Usos hoy en `page.tsx` | Qué pasa |
|---|---|---|
| `Oso` | 4 (hero escritorio, hero móvil, regalos, pie) | **Fuera.** Lo reemplazan `ln-1-l`, `ln-3-l`, `ln-4-l` |
| `Globo` | 1 (hero derecha) | **Fuera.** Lo reemplaza `ln-1-r` |
| `Conejo` | 1 (detalles derecha) | **Fuera.** Lo reemplaza `ln-2-r` |
| `Nube` | 2 (hero, pie) | **Fuera.** Va horneada en `ln-1-l`, `ln-4-l`, `ln-4-r` |
| `Rama` | 3 (follaje de fondo) | **Fuera.** Va horneada en los ocho PNG |
| `Estrella` | 1 (follaje de fondo) | **Fuera.** Va horneada en los PNG |
| `Corazon` | 8 (separadores y botones) | **Se queda.** Sigue en el diseño nuevo |
| `Divisor` | 2 (bajo el nombre, bajo el botón de asistencia) | **Se queda.** Sigue en el diseño nuevo |
| `OsoMarca` | 1 (nav, solo móvil) | **Pendiente**, depende del móvil — ver riesgos |

Los SVG que quedan sin uso se borran del archivo, no se dejan muertos.

---

## Cambios de contenido que trae el diseño nuevo

Esta sección es la que más fácil se pasa por alto.

**1 · La jerarquía del encabezado se invierte, y cambia la voz.**

| Antes (construido) | Ahora |
|---|---|
| `Bebé Benjamín` — script, grande | `Baby Benjamín` — script, **el más grande** |
| `TE INVITO A MI` — versalitas | `TE INVITA A SU` — versalitas |
| `Baby Shower` — script | `Baby Shower` — script, más pequeño |

El mockup traía «Te invitamos a nuestro / Baby Shower / En honor a / Benjamín». Efraín lo
ajustó el 25 de agosto: se quita el primer renglón de versalitas y se intercambian los dos
textos grandes, de modo que el nombre encabeza y el evento va debajo.

El texto pasa de **primera persona del bebé** («Te invito a mi», «Mis papás están muy
emocionados de celebrar mi llegada») a **plural de los papás** («Te invitamos a nuestro»,
«¡Estamos emocionados de celebrar la llegada de nuestro pequeño!»). Es un cambio editorial,
no tipográfico: hay que cambiar los textos, no solo los tamaños.

Esto contradice el orden que hoy declara `CLAUDE.md` para la sección 1. Ese documento se
actualiza como parte de este plan.

**2 · El orden del menú cambia**: `Detalles · Confirmar asistencia · Galería · Mesa de regalos`.
Ojo: ya **no coincide** con el orden de las secciones en la página. Ver riesgos.

**3 · La mesa de regalos se acorta.** De dos párrafos a tres renglones:
«Tu presencia es el mejor regalo, pero si deseas tener un detalle con nosotros, aquí tienes
algunas opciones.» El botón pasa a `VER OPCIONES DE REGALO` con un icono de regalo.
**Desaparece** la línea «26 regalos · 7 para dar entre varios · reservas hasta el 11 de
septiembre». Ver riesgos.

**4 · Galería y confirmar asistencia se funden en una sola banda de dos columnas.**
Galería a la izquierda (4 polaroids traslapadas, no 6, y **sin** el subtítulo «Del día en que
supimos que eras un niño»); la tarjeta de asistencia a la derecha.

**5 · El botón de asistencia dice `CONFIRMAR ASISTENCIA`**, no «Confirmar por WhatsApp».
El destino no cambia: sigue siendo el enlace a WhatsApp.

**6 · En detalles, la fecha va en versalitas**: `DOMINGO` / `13 DE SEPTIEMBRE`.

**7 · El pie se apoya sobre una colina suave** (una curva clara al fondo de la página) con el
oso en nube a la izquierda y una nube a la derecha.

---

## Los pasos

### Paso 1 — Fundaciones
- Comparar el crema del diseño nuevo contra `--color-crema` en `globals.css`. El fondo del
  diseño final se ve más cálido. Si hay diferencia, **ajustar el token existente**, no crear
  uno nuevo.
- Crear un componente `<Decoracion>` que envuelva `next/image` con `position: absolute`,
  `aria-hidden`, `pointer-events-none` y `sizes` explícito. Los ocho PNG entran por ahí.
- Definir la regla de visibilidad en móvil: encogidas a la esquina de su banda, tenues y
  por detrás del texto (ver decisión 3).

**Listo cuando:** el componente existe y renderiza un PNG en su caja sin desbordar la página.

### Paso 2 — Borrar el follaje viejo
- Quitar el bloque «follaje de fondo» completo de `page.tsx` (3 `Rama` + `Estrella` + `Corazon`).
- Quitar `Nube`, `Oso`, `Globo` y `Conejo` de todas las secciones.

**Listo cuando:** la página se ve pelada, sin ninguna ilustración, y no hay errores de import.

### Paso 3 — Invitación
- Colocar `ln-1-l` y `ln-1-r` como columnas laterales.
- Reescribir el encabezado con la jerarquía y la voz nuevas.
- Ajustar la cuenta regresiva: números grandes, etiquetas en versalitas debajo, separadores finos.

**Listo cuando:** el hero coincide con el tercio superior de `LandingDesktopNew.png`.

### Paso 4 — Detalles del evento
- Colocar `ln-2-l` y `ln-2-r`.
- Fecha en versalitas. Conservar la dirección real: `Cr 57 #38-220`.
- La frase «Porque los mejores momentos…» se mantiene como está.

### Paso 5 — Mesa de regalos
- Colocar `ln-3-l` y `ln-3-r`.
- Acortar el texto, agregar el icono de regalo al botón.
- Decidir qué pasa con la línea de la fecha límite (ver riesgos) antes de borrarla.

### Paso 6 — Galería + asistencia
- Reestructurar en una banda de dos columnas. Es el cambio de maquetación más grande.
- Galería: 4 polaroids traslapadas, sin subtítulo.
- Tarjeta de asistencia con `Divisor` debajo del botón.

### Paso 7 — Pie
- Colocar `ln-4-l` y `ln-4-r` sobre la colina.
- La colina es forma, no ilustración: se hace con CSS o un SVG de fondo, no con un PNG.

### Paso 8 — Limpieza
- Borrar de `ilustraciones.tsx` los componentes que quedaron sin uso.
- `npx tsc --noEmit` y `npm run lint` limpios.

### Paso 9 — Verificación
- Levantar el sitio y capturar con Playwright a 1240px.
- Comparar contra `LandingDesktopNew.png` banda por banda.
- Revisar también a 390px, aunque no haya diseño móvil: que no se rompa.

---

## Dos reglas de maquetación que se repiten en toda la página

Están comentadas en `src/app/page.tsx`, pero conviene tenerlas aquí porque explican
por qué la página está armada como está.

**1 · Las decoraciones cuelgan de la SECCIÓN, no del panel.** Y van *después* del panel en
el DOM. Así llegan al borde de la pantalla —el panel está metido hacia adentro— y se pintan
encima del panel pero debajo del texto, que siempre va en `z-10`. Si se meten dentro del
panel quedan a 64px del borde y el diseño se rompe.

**2 · Tamaños fluidos con `clamp()`.** Hasta ~1400px la página se ve exactamente como el
diseño. De ahí para arriba los textos y las columnas crecen con el ancho, porque en una
pantalla de 1920 el diseño fijo dejaba un vacío grande entre las columnas y el texto.
El `vw` de cada `clamp()` está calculado para valer el tamaño base justo en 1400px, de modo
que por debajo de ese ancho nada cambia.

**Cuidado con el alto de banda.** Cada columna es más alta que ancha —el oso del hero mide
2x su ancho— así que al crecer se derrama sobre la sección siguiente. Por eso las bandas
llevan `min-h` fluido calculado contra la altura de su columna. Si se agranda una imagen,
hay que revisar el `min-h` de su banda.

## Decisiones tomadas — 25 de agosto de 2026, Efraín

**1 · El menú sigue el orden de la página**, no el del mockup:
Detalles · Mesa de regalos · Galería · Confirmar asistencia. Un menú cuyo orden no coincide
con el de las secciones desorienta al bajar.

**2 · La línea de la fecha límite se quita**, como en el diseño. «Reservas hasta el 11 de
septiembre» ya no aparece en la landing; queda solo dentro de `/lista`.

**3 · En móvil las columnas NO se ocultan.** Se encogen a una esquina de su banda —la
izquierda arriba, la derecha abajo—, tenues y por detrás del texto. Así la página conserva
su carácter a 390px sin que la ilustración compita con lo que hay que leer.

---

## Estado

Pasos 1 al 9: **hechos**. La landing está construida contra el diseño final y verificada con
capturas a 1280px y a 390px.

Lo que sigue pendiente no es de esta tanda:

- Las fotos reales de la galería (hoy hay cuatro marcadores de color).
- La banda de galería + asistencia no lleva decoración: `images-guide.png` no mapea ningún
  PNG ahí. Si debía llevar, falta el asset.

---

## Riesgos que siguen abiertos

**1 · Sigue sin haber diseño móvil.**
`LandingMovil.png` es del diseño preliminar. Lo que hay hoy en móvil es la solución acordada
(columnas encogidas a las esquinas), no una pantalla diseñada. Si llega un diseño móvil
nuevo, esa parte se rehace.

**2 · Los botones de la landing son tan/dorados, no azules.**
`CLAUDE.md` dice «azul = acción». En la landing final los CTA son de contorno dorado. Se
puede sostener que la regla del color aplica a `/lista` (donde el color **codifica estado**)
y no a la landing, que es una invitación. Conviene dejarlo escrito para que nadie lo
«corrija» después. **Pregunta abierta.**

**~~5 · La tipografía script~~ — RESUELTO el 26/08.** Great Vibes salió del proyecto. El
nombre va en The Nautigal y el evento en Style Script, ambas autoalojadas por Next.

**~~6 · Peso de las imágenes~~ — RESUELTO el 26/08.** Las ocho acuarelas entran por
`next/image` con importación estática, así que se sirven en WebP y redimensionadas.

---

## Qué NO cambia

- El orden de las secciones: invitación → detalles → mesa de regalos → galería → asistencia.
  El evento sigue antes que los regalos.
- Confirmar asistencia sigue siendo un enlace a WhatsApp. No hay formulario ni tabla.
- La dirección es la de la invitación impresa. No se inventa una nueva.
- El oso pardo sigue siendo la marca.
