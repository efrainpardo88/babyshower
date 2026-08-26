# Pantallas aprobadas

**Estas imágenes son la especificación visual.** Ábrelas antes de construir cada pantalla.
Salieron del canvas de diseño aprobado el 25 de agosto.

> **La landing tiene versión final.** `LandingDesktop.png` era preliminar; la referencia que
> manda es **`LandingDesktopNew.png`**. El plan de trabajo para llegar a ella está en
> `.claude/docs/plan-landing.md`, junto con los ocho PNG de `public/img` y los SVG que se eliminan.

| Imagen | Qué muestra | Para construir |
|---|---|---|
| `Sistema.png` | Paleta completa, tipografías, píldoras de estado, botones, iconos | Cualquier cosa |
| `LandingDesktopNew.png` | **Invitación en escritorio — VERSIÓN FINAL** | `/` ← construir contra esta |
| `images-guide.png` | Qué PNG de `public/img` va en cada posición | `/` |
| `remove-svg.png` | Qué SVG plano se elimina | `/` |
| `LandingDesktop.png` | Invitación en escritorio — **preliminar, superada** | Solo historia |
| `LandingMovil.png` | Invitación en móvil, 390px — **preliminar, sin reemplazo** | Ver riesgos del plan |
| `Main.png` | Lista de regalos en escritorio, con panel de selección | `/lista` |
| `ListaMovil.png` | Lista en móvil, con barra fija de selección abajo | `/lista` |
| `EstadosTarjeta.png` | **Los seis estados de la tarjeta de regalo** | `/lista` — mirar primero |
| `DetalleRegalo.png` | Ficha completa de un regalo «entre varios» | `/regalo/[slug]` |
| `Reserva.png` | Formulario, comprobante con token, y el caso de conflicto | Flujo de reserva |
| `AdminRegalos.png` | CRUD de regalos con editor lateral | `/admin/regalos` |
| `AdminReservas.png` | Tabla de reservas con KPIs y alertas | `/admin/reservas` |

## Empieza por `EstadosTarjeta.png`

Es el componente más importante del proyecto. Los seis estados:

1. **Disponible** — azul, botón lleno
2. **Reservado** — atenuado pero visible; se ve quién lo reservó
3. **Múltiple con cupo** — segmentos que muestran cuántos van (2 de 5)
4. **Múltiple sin límite** — pañitos y libros; contador informativo, nunca se agota
5. **Entre varios** — botón pardo, no azul: es otra acción. Muestra quiénes se apuntaron
6. **En tu selección** — borde azul y check. Evita el error de creer que ya reservaste

El estado se lee **por color y por texto**, nunca solo por color.

## Alturas de control

Los PNG de este directorio se exportaron antes de unificar la regla, así que
algunos botones se ven a 46px y los de móvil a 44px. La diferencia es de
2px y no cambia el diseño. **La regla que manda es la de CLAUDE.md**:
48px para acciones, 44px para auxiliares.

Al construir, usa 48px aunque el PNG muestre 46.

## Dónde el código ya no sigue al PNG

Una sola divergencia, aprobada el 25 de agosto: **el precio**.

Las pantallas dibujan el glifo `$ $$ $$$` (con la parte sobrante atenuada) debajo del nombre.
El código muestra en ese mismo renglón el rango real: «Entre $20.000 y $80.000».
Cambia el contenido de esa línea, **no la posición ni el tamaño**: sigue siendo el renglón
entre el nombre y la píldora de estado, en Karla, en `tinta-4`.

Afecta a `EstadosTarjeta.png`, `Main.png`, `ListaMovil.png` y `DetalleRegalo.png`. En
`Main.png`, el renglón «Rango de la selección · $$$» del panel pasa a ser la suma de los
rangos: «$155.000 – $335.000». Todo lo demás de esas pantallas se construye tal cual.

## Fondo plano en bandas — 26 de agosto de 2026

`LandingDesktopNew.png` dibuja cada sección como una **tarjeta de borde redondeado**
sobre un fondo crema. Eso ya no se construye así.

El fondo es plano y las bandas **alternan**, a todo el ancho y sin bordes:

| Banda | Color |
|---|---|
| 1 · Invitación | `#FBF1E8` (crema) |
| 2 · Detalles | blanco |
| 3 · Mesa de regalos | `#FBF1E8` |
| 4 · Galería + asistencia | blanco |
| 5 · Pie | blanco, con `public/waves.svg` al fondo |

El pie no lleva color de banda: es blanco y la forma la pone **`public/waves.svg`**.
Antes era una elipse de CSS más ancha que la pantalla que se montaba sobre la sección
anterior.

Tres reglas al tocarlo:

- **El alto de la banda no es un número: es la proporción del SVG.** El contenedor lleva
  `aspect-[2191/294]`, así que la banda crece y se encoge con el ancho. Si el archivo cambia
  de forma, se vuelve a medir la franja visible y se actualiza esa proporción.
- **De dónde sale `294`:** el lienzo es 2191×718, pero la ola ocupa solo la franja inferior
  — los primeros 424px de alto son transparentes. 718 − 424 = 294. El `overflow-hidden`
  recorta ese sobrante, y eso es lo que impide que la ola se salga de su sección.
- **Se respeta su proporción horizontal.** Estirado en vertical la ola se aplasta y pierde
  la curva. El `<img>` va a ancho completo y el alto sale solo. En móvil va al 240% del
  ancho: el archivo es muy alargado y a 390px la banda quedaría demasiado delgada para que
  el texto caiga encima.

El oso y la nube van absolutos con `bottom-0` y pegados a su borde (`left-0` / `right-0`).
No usan `<Decoracion>` a propósito: esa regla manda la columna izquierda a la esquina
**superior** en móvil, y en el pie las dos tienen que quedar sobre la ola.

La clase `.panel` se eliminó de `globals.css`. Sobreviven dos recuadros, y a propósito:
la caja de la cuenta regresiva y la tarjeta de confirmar asistencia, ambas solo con filo,
sin relleno.

**Detalle de implementación que no se puede cambiar a la ligera:** el color va en una capa
`-z-10` dentro de cada sección, no como `bg-*` de la sección. Las columnas decorativas se
asoman de una banda a la vecina, y si el color viviera en la sección, la banda siguiente
las taparía al pintarse encima. Ver el componente `Fondo` en `src/app/page.tsx`.

## El canvas en vivo

https://claude.ai/code/artifact/bc37c50b-c0dd-473e-8396-2cd30068e9f5

Ábrelo en el navegador para hacer zoom, ver las notas al margen o exportar en alta.
**No lo leas con una herramienta automática**: son ~2 MB de los cuales casi todo es
código del editor, no el diseño. Para eso están estas imágenes.
