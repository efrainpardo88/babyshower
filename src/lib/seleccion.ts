"use client";

/**
 * La selección del invitado, guardada en el navegador.
 *
 * Vive aquí y no dentro de un componente porque la usan dos pantallas: `/lista`
 * la construye y `/reserva` la consume. Es la misma idea del proyecto: nada queda
 * apartado hasta el final, así que hasta el envío del formulario esto no toca la
 * base de datos. Ver .claude/docs/decisiones.md.
 *
 * Va con `useSyncExternalStore` y no con `useState` + `useEffect`: localStorage es
 * un almacén externo a React, y esta API es la que existe para eso. Nos da tres
 * cosas gratis: un valor distinto en servidor y cliente sin desajustar la
 * hidratación, ningún `setState` dentro de un efecto, y sincronización entre
 * pestañas — si el invitado abre la lista dos veces, ambas ven lo mismo.
 *
 * El snapshot va cacheado a propósito: `useSyncExternalStore` vuelve a leerlo en
 * cada render y exige que devuelva el MISMO objeto si nada cambió, o entra en un
 * bucle infinito de renders.
 */

import { useSyncExternalStore } from "react";

const CLAVE = "seleccion-benjamin-v1";

export type Seleccion = Record<string, number>;

const VACIA: Seleccion = {};
const oyentes = new Set<() => void>();
let crudaEnCache: string | null = null;
let valorEnCache: Seleccion = VACIA;

function normalizar(cruda: string | null): Seleccion {
  if (!cruda) return VACIA;
  try {
    const dato: unknown = JSON.parse(cruda);
    if (!dato || typeof dato !== "object") return VACIA;
    const limpia: Seleccion = {};
    for (const [slug, cant] of Object.entries(dato as Record<string, unknown>)) {
      if (typeof cant === "number" && Number.isFinite(cant) && cant > 0) {
        limpia[slug] = Math.min(Math.floor(cant), 20);
      }
    }
    return limpia;
  } catch {
    // JSON corrupto: se empieza limpio en vez de romper la página.
    return VACIA;
  }
}

function leerCruda(): string | null {
  try {
    return window.localStorage.getItem(CLAVE);
  } catch {
    // Modo privado o almacenamiento bloqueado.
    return null;
  }
}

export function snapshot(): Seleccion {
  const cruda = leerCruda();
  if (cruda !== crudaEnCache) {
    crudaEnCache = cruda;
    valorEnCache = normalizar(cruda);
  }
  return valorEnCache;
}

/** En el servidor no hay selección. El primer render del cliente coincide. */
function snapshotServidor(): Seleccion {
  return VACIA;
}

function suscribir(alCambiar: () => void): () => void {
  oyentes.add(alCambiar);
  window.addEventListener("storage", alCambiar);
  return () => {
    oyentes.delete(alCambiar);
    window.removeEventListener("storage", alCambiar);
  };
}

export function guardar(siguiente: Seleccion): void {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(siguiente));
  } catch {
    // Si no se puede persistir, al menos que la pantalla reaccione.
    crudaEnCache = " memoria";
    valorEnCache = siguiente;
  }
  for (const f of oyentes) f();
}

export function escoger(slug: string): void {
  guardar({ ...snapshot(), [slug]: snapshot()[slug] ?? 1 });
}

export function quitar(slug: string): void {
  guardar(Object.fromEntries(Object.entries(snapshot()).filter(([k]) => k !== slug)));
}

export function cambiarCantidad(slug: string, n: number): void {
  if (n < 1) return;
  guardar({ ...snapshot(), [slug]: n });
}

/** Se llama al confirmar: lo reservado ya no es una selección pendiente. */
export function limpiar(): void {
  guardar({});
}

export function useSeleccion(): Seleccion {
  return useSyncExternalStore(suscribir, snapshot, snapshotServidor);
}
