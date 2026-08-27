"use client";

import { useEffect } from "react";

/**
 * Congela el fondo mientras hay una capa abierta encima.
 *
 * Fija el body en su posición en vez de usar `body { overflow: hidden }`.
 * Medido en Chromium, las dos formas funcionan igual; la razón de preferir esta
 * es **Safari en iOS**, que ignora el `overflow` del body y deja el fondo
 * desplazándose bajo la capa. No está comprobado aquí —no hay iPhone en el
 * banco de pruebas— pero es un comportamiento conocido y esta página se va a
 * abrir sobre todo desde celulares.
 *
 * El precio de fijar el body es que hay que guardar y devolver la posición a
 * mano: mientras dura el bloqueo `window.scrollY` vale 0, porque el desplazado
 * es el body y no el documento.
 *
 * @param activo   si la capa está abierta
 * @param consulta media query opcional: bloquea solo si se cumple. El editor
 *                 del panel la usa para no congelar la tabla en escritorio,
 *                 donde el formulario va al lado y no encima.
 */
export function useScrollBloqueado(activo: boolean, consulta?: string) {
  useEffect(() => {
    if (!activo) return;
    if (consulta && !window.matchMedia(consulta).matches) return;

    const y = window.scrollY;
    const previo = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
    };

    document.body.style.position = "fixed";
    document.body.style.top = `-${y}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    return () => {
      Object.assign(document.body.style, previo);
      window.scrollTo(0, y);
    };
  }, [activo, consulta]);
}
