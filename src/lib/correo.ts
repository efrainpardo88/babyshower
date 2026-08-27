import nodemailer from "nodemailer";

/**
 * El envío del correo con el enlace de la reserva.
 *
 * Todo el trato con el proveedor está encerrado aquí a propósito. Hoy salimos
 * por el Gmail personal de Efraín, que no necesita dominio propio y alcanza de
 * sobra para ~30 invitados. Si algún día se compra el dominio y se pasa a Resend
 * o similar, se cambia este archivo y nada más.
 *
 * REGLA QUE NO SE PUEDE ROMPER: un fallo del correo NUNCA puede tumbar una
 * reserva. La reserva ya está guardada y el enlace ya se le muestra al invitado
 * en pantalla; el correo es un extra para quien no lo copie. Por eso todo lo de
 * aquí devuelve un booleano en vez de lanzar.
 */

const USUARIO = process.env.GMAIL_USUARIO;
const CLAVE = process.env.GMAIL_CLAVE_APP;

/** Gmail limita a ~500 correos diarios. Con 26 regalos, sobra. */
function transporte() {
  if (!USUARIO || !CLAVE) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: USUARIO, pass: CLAVE.replace(/\s+/g, "") },
  });
}

/**
 * La URL absoluta del sitio. En el correo no sirve una ruta relativa: el enlace
 * se abre desde el cliente de correo, que no sabe de dónde salió.
 */
export function urlDelSitio(): string {
  if (process.env.SITIO_URL) return process.env.SITIO_URL.replace(/\/+$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3005";
}

export type CorreoDeReserva = {
  para: string;
  nombre: string;
  lote: string;
  regalos: { nombre: string; cantidad: number }[];
};

/** Escapa lo que viene del invitado: su nombre entra en el HTML del correo. */
function escapar(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cuerpoHtml({ nombre, lote, regalos }: CorreoDeReserva): string {
  const enlace = `${urlDelSitio()}/reserva/${lote}`;
  const lista = regalos
    .map(
      (r) =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid #E9DCC6;font-family:Georgia,serif;font-size:16px;color:#5A4A33">${escapar(
          r.nombre,
        )}${r.cantidad > 1 ? ` &middot; x${r.cantidad}` : ""}</td></tr>`,
    )
    .join("");

  // Estilos en línea y tablas: los clientes de correo ignoran casi todo el CSS
  // moderno. Nada de flex, nada de clases.
  return `<!doctype html>
<html lang="es"><body style="margin:0;padding:0;background:#FBF1E8">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FBF1E8;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FDFAF4;border:1px solid #E9DCC6;border-radius:20px;padding:32px">
        <tr><td align="center" style="font-family:Georgia,serif;font-size:26px;color:#4F6E85;padding-bottom:8px">
          Gracias, ${escapar(nombre.split(" ")[0])}
        </td></tr>
        <tr><td align="center" style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#8A7355;padding-bottom:24px">
          ${regalos.length === 1 ? "Este regalo quedó" : `Estos ${regalos.length} regalos quedaron`} a tu nombre
          para el baby shower de Benjamín.
        </td></tr>
        <tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${lista}</table></td></tr>
        <tr><td align="center" style="padding-top:28px">
          <a href="${enlace}" style="display:inline-block;background:#4F6E85;color:#FDFAF4;text-decoration:none;font-family:Helvetica,Arial,sans-serif;font-size:13px;font-weight:bold;letter-spacing:.12em;text-transform:uppercase;padding:16px 28px;border-radius:999px">
            Ver o cambiar mi reserva
          </a>
        </td></tr>
        <tr><td align="center" style="font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#9C8563;padding-top:20px">
          Desde ahí puedes cambiar o cancelar cuando quieras.<br>
          Guarda este correo: es tu comprobante.
        </td></tr>
        <tr><td align="center" style="font-family:Georgia,serif;font-style:italic;font-size:17px;color:#7C6647;padding-top:28px">
          gracias, de verdad
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function cuerpoTexto({ nombre, lote, regalos }: CorreoDeReserva): string {
  const enlace = `${urlDelSitio()}/reserva/${lote}`;
  return [
    `Gracias, ${nombre.split(" ")[0]}`,
    "",
    `${regalos.length === 1 ? "Este regalo quedó" : `Estos ${regalos.length} regalos quedaron`} a tu nombre para el baby shower de Benjamín:`,
    "",
    ...regalos.map((r) => `  - ${r.nombre}${r.cantidad > 1 ? ` x${r.cantidad}` : ""}`),
    "",
    "Ver o cambiar tu reserva:",
    enlace,
    "",
    "Desde ahí puedes cambiar o cancelar cuando quieras.",
    "Guarda este correo: es tu comprobante.",
  ].join("\n");
}

/**
 * Devuelve `true` si el correo salió. Nunca lanza: quien llama no debe cambiar
 * de comportamiento porque el correo haya fallado.
 */
export async function enviarCorreoDeReserva(datos: CorreoDeReserva): Promise<boolean> {
  const t = transporte();
  if (!t) {
    console.warn("Correo no configurado (falta GMAIL_USUARIO o GMAIL_CLAVE_APP). Reserva guardada igual.");
    return false;
  }

  try {
    await t.sendMail({
      from: `"La lista de Benjamín" <${USUARIO}>`,
      to: datos.para,
      subject:
        datos.regalos.length === 1
          ? "Tu regalo para el baby shower de Benjamín"
          : `Tus ${datos.regalos.length} regalos para el baby shower de Benjamín`,
      text: cuerpoTexto(datos),
      html: cuerpoHtml(datos),
    });
    return true;
  } catch (e) {
    // A propósito no se relanza: la reserva ya está hecha.
    console.error("No se pudo enviar el correo de la reserva:", e);
    return false;
  }
}
