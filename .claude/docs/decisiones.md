# Registro de decisiones

Por qué el proyecto es como es. **Léelo antes de "mejorar" algo** — varias de estas
decisiones parecen limitaciones y son intencionales.

---

### La página no maneja dinero. Nunca.

En los regalos de grupo la página solo muestra quiénes se apuntaron y cómo contactarlos.
El recaudo lo resuelven ellos por WhatsApp, Nequi, o como quieran.

*Por qué:* Efraín lo pidió explícitamente y está fuera de alcance. Una pasarela de pagos
suma semanas, comisiones y responsabilidad legal sobre plata ajena, en un proyecto que
tiene 19 días. **No integrar Wompi, Mercado Pago, PayU ni nada parecido.**

---

### El invitado no ve precios

**Decidido el 27 de agosto de 2026 — Erica.** Deshace la revisión del 25 de agosto,
que a su vez había reemplazado el `$ · $ · $# Registro de decisiones

Por qué el proyecto es como es. **Léelo antes de "mejorar" algo** — varias de estas
decisiones parecen limitaciones y son intencionales.

---

### La página no maneja dinero. Nunca.

En los regalos de grupo la página solo muestra quiénes se apuntaron y cómo contactarlos.
El recaudo lo resuelven ellos por WhatsApp, Nequi, o como quieran.

*Por qué:* Efraín lo pidió explícitamente y está fuera de alcance. Una pasarela de pagos
suma semanas, comisiones y responsabilidad legal sobre plata ajena, en un proyecto que
tiene 19 días. **No integrar Wompi, Mercado Pago, PayU ni nada parecido.**

---

 original por el rango en pesos.

Donde estaba el precio va ahora la **especificación** y la **nota de los papás**.
Ningún precio sale hacia el invitado: ni en la tarjeta, ni en la ficha, ni como
total del panel de selección.

*Por qué:* poner cifras al lado de cada regalo convierte la lista en una vitrina y
mete a los invitados en una comparación que nadie pidió — quién trajo lo caro y quién
lo barato. La especificación («Talla 2», «Grupo 0+») y la nota («Solo dos, de verdad:
esta talla se usa unas tres semanas») dicen lo que de verdad ayuda a escoger.

*Qué se quitó de la página, no de la base:* `precioMin`, `precioMax` y `nivelPrecio`
siguen en la tabla y se siguen editando desde `/admin/regalos`, donde la tabla muestra
el rango debajo del nombre. Los papás necesitan la referencia para cotizar; el invitado no.

*Y no solo se escondió:* `cargarLista()` dejó de seleccionar las tres columnas, así que
las cifras ya no viajan en el HTML de `/lista`. Esconder con CSS habría dejado los números
a un clic derecho de distancia.

`src/lib/precio.ts` sigue vivo — lo usa el panel de admin — pero ninguna página pública
lo importa. Si algún día vuelve el precio al invitado, se vuelve a llamar desde ahí.

*Efecto de borde que hubo que arreglar:* como todas las tarjetas traían el renglón del
precio, median casi lo mismo y los botones quedaban parejos. Con la nota, que unas tienen
y otras no, la tarjeta necesitó `sm:flex-col` para que el `mt-auto` del botón funcione.

*Pendiente visual:* las pantallas aprobadas (`.claude/docs/diseno/*.png`) dibujan `$ $ $# Registro de decisiones

Por qué el proyecto es como es. **Léelo antes de "mejorar" algo** — varias de estas
decisiones parecen limitaciones y son intencionales.

---

### La página no maneja dinero. Nunca.

En los regalos de grupo la página solo muestra quiénes se apuntaron y cómo contactarlos.
El recaudo lo resuelven ellos por WhatsApp, Nequi, o como quieran.

*Por qué:* Efraín lo pidió explícitamente y está fuera de alcance. Una pasarela de pagos
suma semanas, comisiones y responsabilidad legal sobre plata ajena, en un proyecto que
tiene 19 días. **No integrar Wompi, Mercado Pago, PayU ni nada parecido.**

---


en la tarjeta. El código diverge del PNG **a propósito** en esa línea y solo en esa línea.

---

### La lista no dice quién reservó qué

**Decidido el 26 de agosto de 2026 — Efraín.** Antes la tarjeta decía «Lo reservó Carolina».

Ahora dice solo **«Ya lo reservaron»**. Y no es un cambio de texto: el nombre dejó de
salir de la base. La consulta de `/lista` ya no lo trae, así que el nombre de cada
invitado tampoco viaja al navegador de todos los demás.

*Por qué:* saber que un regalo está tomado es información útil; saber quién lo tomó no le
sirve a nadie para decidir, y en una lista que van a abrir treinta personas es exponer a
cada invitado sin motivo.

*Dónde sí se ve:* en el panel de administración. Los papás necesitan saber quién trae qué
para agradecer — esa es justamente la razón de que el panel exista.

---

### Confirmar asistencia es un enlace a WhatsApp

No hay tabla de RSVP, ni formulario, ni lista de confirmados en el panel.

*Por qué:* cero backend, cero días de desarrollo, y en Colombia la gente responde
mucho más por WhatsApp que por formulario. Si algún día se quiere de verdad, es
una tabla y un día de trabajo — pero no antes del 4 de septiembre.

---

### Dos modos de reserva, no tres

**Revisado el 26 de agosto de 2026 — Efraín.** Antes había tres modos y cupos por regalo.

Quedan dos:

- `unico` — una persona lo reserva y sale de la lista.
- `multiple` — sin tope, nunca se agota.

*Qué se eliminó y por qué:*

**El modo `grupo`**, que llevaba la cuenta de quiénes se apuntaban a un regalo caro y
mostraba sus nombres. No hace falta: si un grupo se organiza para dar el coche, uno de
ellos lo reserva y ya. Saber quiénes son los demás no le sirve a nadie dentro de la
página, y se arregla por WhatsApp igual que el dinero. La **categoría** «Entre varios»
se queda: agrupa los regalos caros, que es información útil.

**Los cupos de `multiple`.** Antes los pañales tenían un reparto —talla RN solo 2, el
grueso en tallas 1 y 2— pensado para evitar que llegaran seis paquetes de la misma
talla. Ahora cualquiera puede llevar los que quiera de la talla que quiera.

*El costo, dicho en voz alta:* ese reparto era la mitad de la solución al problema de
los repetidos. Sin él, la única defensa que queda es que **cada ítem lleve la talla en
el nombre**. Es un riesgo aceptado: la idea es que quien tenga poco presupuesto pueda
traer algo pequeño y de mucho uso sin toparse con un cupo lleno.

---

### La concurrencia se resuelve en Postgres, no en el código

`SELECT ... FOR UPDATE` sobre la fila del regalo dentro de la transacción, más un índice
único parcial como red de seguridad.

*Por qué:* validar en el cliente o con un `SELECT` previo sin lock deja una ventana real.
Con 30 invitados abriendo el link el mismo día no es teórico.

Y cuando falla: **nunca un error genérico.** Se confirma lo que sí quedó, se dice con
claridad qué se cayó y se ofrece alternativa. Ver el artboard «Flujo de reserva».

---

### Un solo formulario para toda la selección

El invitado acumula regalos en un panel lateral (`localStorage`) y al final llena
**un** formulario. Escribe su nombre una vez, no cinco.

---

### El panel borra de verdad; el invitado solo cancela

**Decidido el 30 de agosto de 2026 — Efraín.**

En `/admin/reservas` cada fila tiene **Reenviar** y **Eliminar**. Son dos acciones que
existen solo en el panel, y cada una se comporta distinto de lo que hace el invitado:

**Eliminar borra la fila** (`DELETE`), mientras que cancelar desde el comprobante la deja
en `estado = 'cancelada'`. No es una incoherencia: son dos casos distintos. Cuando el
invitado cancela, interesa el rastro de quién había reservado qué. Cuando los papás
borran, es porque la fila **sobra** — la prueba que hicimos nosotros, el duplicado, lo que
alguien pidió por WhatsApp que quitáramos — y dejarla como «cancelada» solo ensucia la
tabla y el CSV. Como el índice parcial solo cuenta las activas, borrar una reserva de un
regalo `unico` lo devuelve a la lista. **No hay deshacer**, por eso pide confirmación.

**Reenviar manda el correo del lote entero**, no el del regalo de esa fila. El invitado
recibió UN correo con toda su selección y UN enlace; reenviarle solo la bañera le llegaría
cojo. Se rearma el mismo correo del primer día con los regalos que sigan activos.

**El destinatario se puede cambiar, y por defecto también se guarda.** El motivo número
uno para reenviar es que el correo estaba mal escrito. Si solo se cambiara el destino de
ese envío, la dirección mala seguiría en la base, en el CSV y en el siguiente reenvío — y
no hay otro sitio en el panel donde arreglarla. Se actualizan todas las filas del lote,
porque el contacto es del envío y no de cada regalo. La casilla solo aparece cuando el
correo cambió: con el correo intacto no decide nada.

*Lo que NO cambió:* el correo sigue sin poder tumbar nada. `enviarCorreoDeReserva`
devuelve un booleano en vez de lanzar, y si el envío falla el cambio de dirección ya quedó
guardado — se guarda antes de enviar, justo para que el reintento salga con la buena.

---

### El oso pardo es la marca

«Pardo» es el apellido de la familia. El oso no es decoración genérica de baby shower:
es el emblema. No cambiarlo por otro animal.

---

### La landing tiene una versión final que reemplaza a la preliminar

**Decidido el 25 de agosto de 2026 — Efraín.**

`LandingDesktop.png` era un diseño preliminar. La versión final es
**`LandingDesktopNew.png`** y es contra esa que se construye `/`.

Trae tres cosas, no una:

1. **Las acuarelas reales** en vez de los SVG planos. Están en `public/img` y cada archivo
   es una columna decorativa completa, con su follaje y sus estrellas ya horneados.
2. **Otro encabezado**: «Baby Benjamín» arriba y grande, «Te invita a su» en versalitas, y
   «Baby Shower» debajo. El nombre encabeza; el evento va después.
3. **La voz se mantiene en el bebé** («Te invita a su»), pero el subtítulo habla en plural de
   los papás («¡Estamos emocionados de celebrar la llegada de nuestro pequeño!»).

*Qué NO cambió:* el orden de las secciones, el enlace a WhatsApp para confirmar, la
dirección de la invitación impresa y el oso como marca.

*Sin resolver:* no hay diseño móvil nuevo. `LandingMovil.png` sigue siendo el preliminar.
El plan y los riesgos están en `.claude/docs/plan-landing.md`.

---

### El diseño viene de la invitación impresa

Los invitados ya recibieron una invitación en acuarela. La página la continúa: mismo
crema, mismo arco, mismas hojas, mismas tipografías. **No inventar una dirección nueva.**

Las versalitas espaciadas (`.caps`) son lo que le da el aire de invitación impresa.
Cuando algo se sienta "app" y no "invitación", casi siempre es porque una etiqueta
quedó en sans en vez de Cormorant en versalitas.

---

### El evento va antes que los regalos

Orden de la landing: invitación → evento → mesa de regalos → galería → confirmar asistencia.
Es una invitación, no una tienda. Los regalos son la tercera sección a propósito.

---

## Qué se sacó de la lista, y por qué

| Se quitó | Razón |
|---|---|
| Cuna, colchón, sábanas de cuna | Benjamín duerme en colecho |
| Silla vibradora, extractor de leche | No los quieren |
| **Toda la ropa** | Decisión de los papás; era la mitad de la lista original |
| Alimentación y lactancia | Solo sobrevivió la almohada, que subió a «entre varios» |
| Termómetro, crema antipañalitis | Ya los tienen |
| Humidificador, cobertor de coche | No aplican |
| Sección «para la mamá» | Ella prefiere comprar esas cosas |

El **móvil sí se quedó**: se cuelga sobre el espacio de colecho, no necesita cuna.
