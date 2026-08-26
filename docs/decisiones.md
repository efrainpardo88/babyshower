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

### El invitado ve el rango real de precios

**Revisado el 25 de agosto de 2026 — Efraín.** Antes era `$ · $$ · $$$` y nada más.

La tarjeta, la ficha y el panel de selección muestran el rango en pesos:
«Entre $20.000 y $80.000». `precioMin` y `precioMax` pasaron de privados a públicos.

*Por qué el cambio:* `$$` no le dice a nadie si un regalo cuesta 90 mil o 240 mil, y el
invitado terminaba abriendo la ficha o preguntando por WhatsApp para saber en qué se estaba
metiendo. El rango deja escoger por presupuesto sin tener que adivinar.

*Qué se conservó de la decisión original:* el rango orienta, no factura. Se muestra siempre
como intervalo, nunca como precio exacto de un producto concreto, y no hay totales a pagar
en ninguna parte — la página sigue sin manejar dinero.

`nivelPrecio` (`$ · $$ · $$$`) no se borró: es el respaldo cuando un regalo todavía no tiene
rango cargado, y sirve para agrupar en el panel. El corte sigue siendo
`$` hasta 80.000 · `$$` hasta 250.000 · `$$$` de ahí para arriba (COP).

*Pendiente visual:* las pantallas aprobadas (`docs/diseno/*.png`) todavía dibujan `$ $$ $$$`
en la tarjeta. El código diverge del PNG **a propósito** en esa línea y solo en esa línea.

---

### Confirmar asistencia es un enlace a WhatsApp

No hay tabla de RSVP, ni formulario, ni lista de confirmados en el panel.

*Por qué:* cero backend, cero días de desarrollo, y en Colombia la gente responde
mucho más por WhatsApp que por formulario. Si algún día se quiere de verdad, es
una tabla y un día de trabajo — pero no antes del 4 de septiembre.

---

### Tres modos de reserva, no dos

`unico` no alcanza: los pañales y los libros **no sobran nunca**, y los regalos grandes
necesitan que varias personas se sumen. De ahí `multiple` (con o sin cupo) y `grupo`.

Los cupos de pañales están repartidos a propósito: **talla RN solo 2**, porque se usa
tres semanas. El grueso va a tallas 1 y 2. Ese reparto es la mitad de la solución al
problema de los repetidos.

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

### El oso pardo es la marca

«Pardo» es el apellido de la familia. El oso no es decoración genérica de baby shower:
es el emblema. No cambiarlo por otro animal.

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
