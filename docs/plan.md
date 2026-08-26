# Plan y calendario

**Evento:** domingo 13 de septiembre de 2026, 3:00 pm.
Salón Social, Urb. Puerto Ventura, Cr 57 #38-220.

## La fecha que manda no es el 13

La lista tiene que estar viva el **viernes 4 de septiembre**. Los invitados necesitan
una semana para reservar y comprar. Si sale el mismo día del evento, no sirvió de nada.

Todo el calendario está armado hacia atrás desde esa fecha.

| Cuándo | Qué |
|---|---|
| 25–26 ago | Definición, referencias, moodboard |
| 27–28 ago | **Diseño y aprobación** ✅ *aprobado el 25, tres días antes* |
| 29–30 ago | Cimientos: repo, Vercel, Neon, login con Google |
| 31 ago – 1 sep | Panel de administración |
| 2–3 sep | Sitio público y lógica de reserva |
| 3 sep | Cargar los 26 regalos y QA |
| **4 sep** | **Lanzamiento** — se manda el link a los invitados |
| 4–11 sep | Ventana de reservas |
| 11 sep | Cierre de reservas |
| **13 sep** | **Baby shower** |

## Plan B: qué se recorta si aprieta

En orden. Empezar por arriba y bajar solo lo necesario.

| Se recorta | Se gana | Qué se pierde |
|---|---|---|
| Página de detalle | ~1 día | Pasa a un modal sobre la lista. Casi no se nota |
| Subida de imágenes | ~½ día | Se pegan URLs a mano en el panel |
| Correos automáticos | ~1 día | El invitado guarda su enlace de la pantalla de confirmación |
| Dashboard del admin | ~½ día | Solo la tabla de reservas |
| Dominio propio | ~½ día | Queda en `.vercel.app`. Funciona igual |
| Filtros en la lista | ~½ día | Con 26 ítems y buenas categorías se navega bien |

**Lo que no se recorta nunca:** landing, lista, reserva con transacción, y panel para
editar regalos y ver quién reservó. Ese es el mínimo que resuelve el problema original.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Reserva doble | Transacción con `FOR UPDATE` + índice único parcial |
| Bots o reservas falsas | Rate limit por IP; si hace falta, código de acceso en la invitación |
| Invitado se equivoca | Enlace con token para cancelar o cambiar |
| Neon se duerme (plan gratis) | Tarda ~1 s en despertar. Aceptable |
| Se acaba el tiempo | Ver plan B arriba |

## Pendientes de Efraín

- [ ] Neon: crear proyecto y poner `DATABASE_URL` en `.env.local`
- [ ] Google OAuth: Client ID y Secret (Google Cloud Console)
- [ ] Número de WhatsApp para el botón de confirmar asistencia
- [ ] Correos de Google con acceso al panel
- [ ] **Assets de acuarela** — los PNG de la invitación, fondo transparente, ~2x
- [ ] Fotos de la revelación de género para la galería (4–6)
- [ ] Fotos de producto de los 26 regalos (es la tarea más larga)

## Referencias

- **Diseño aprobado:** https://claude.ai/code/artifact/bc37c50b-c0dd-473e-8396-2cd30068e9f5
- **Plan completo:** https://claude.ai/code/artifact/7169dbb5-7733-4e1c-80f8-6d3a729bd1f5

*(Estos links los abre Efraín en el navegador; un agente local no puede leerlos —
por eso lo importante está copiado en estos archivos.)*

**Producto que vale la pena mirar:** [Babylist](https://www.babylist.com) — es el estándar
del sector para mesas de regalos con reserva y aporte en grupo.
