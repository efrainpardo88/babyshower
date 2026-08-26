# Pantallas aprobadas

**Estas imágenes son la especificación visual.** Ábrelas antes de construir cada pantalla.
Salieron del canvas de diseño aprobado el 25 de agosto.

| Imagen | Qué muestra | Para construir |
|---|---|---|
| `Sistema.png` | Paleta completa, tipografías, píldoras de estado, botones, iconos | Cualquier cosa |
| `LandingDesktop.png` | Invitación en escritorio | `/` ✅ ya construida |
| `LandingMovil.png` | Invitación en móvil, 390px | `/` ✅ ya construida |
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

## El canvas en vivo

https://claude.ai/code/artifact/bc37c50b-c0dd-473e-8396-2cd30068e9f5

Ábrelo en el navegador para hacer zoom, ver las notas al margen o exportar en alta.
**No lo leas con una herramienta automática**: son ~2 MB de los cuales casi todo es
código del editor, no el diseño. Para eso están estas imágenes.
