"use server";

import { auth, esAdmin } from "@/lib/auth";
import { subirImagen, type ResultadoSubida } from "@/lib/imagenes";

/**
 * Recibe la imagen desde el panel.
 *
 * Va en su propio archivo y recibe `FormData` porque una acción de servidor no
 * puede aceptar un `File` dentro de un objeto plano: el archivo tiene que viajar
 * como parte del formulario.
 *
 * Comprueba la sesión igual que las demás acciones: subir archivos sin permiso
 * sería una puerta abierta a llenar el almacenamiento con lo que sea.
 */
export async function subirImagenDeRegalo(datos: FormData): Promise<ResultadoSubida> {
  const sesion = await auth();
  if (!esAdmin(sesion?.user?.email)) return { ok: false, mensaje: "No tienes permiso." };

  const archivo = datos.get("archivo");
  if (!(archivo instanceof File)) return { ok: false, mensaje: "No llegó ningún archivo." };

  return subirImagen(archivo, "regalos");
}
