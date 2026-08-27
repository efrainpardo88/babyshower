/**
 * Manda un correo de prueba a la dirección que le pases.
 *
 *   npm run prueba:correo                       → a ADMIN_EMAILS
 *   npm run prueba:correo -- otro@correo.com    → a esa dirección
 *
 * Sirve para confirmar que la contraseña de aplicación de Gmail sigue viva
 * después de cambiarla, o para ver cómo se ve el correo en un cliente real.
 * No toca la base de datos: no crea ni borra reservas.
 */
import { enviarCorreoDeReserva, urlDelSitio } from "../src/lib/correo";

async function main() {
  const para = process.argv[2] ?? process.env.ADMIN_EMAILS?.split(",")[0]?.trim();

  if (!para) {
    console.error("No sé a quién mandarlo. Pasa un correo o define ADMIN_EMAILS en .env.local.");
    process.exit(1);
  }
  if (!process.env.GMAIL_CLAVE_APP) {
    console.error("Falta GMAIL_CLAVE_APP en .env.local. Genérala en https://myaccount.google.com/apppasswords");
    process.exit(1);
  }

  console.log(`enviando a ${para}`);
  console.log(`los enlaces apuntarán a ${urlDelSitio()}`);

  const ok = await enviarCorreoDeReserva({
    para,
    nombre: "Invitado de prueba",
    // Un lote inventado: el correo se ve igual, pero ese enlace dará 404.
    lote: "00000000-0000-4000-8000-000000000000",
    regalos: [
      { nombre: "Pañales talla 2", cantidad: 3 },
      { nombre: "Mantas de muselina", cantidad: 1 },
    ],
  });

  console.log(ok ? "OK — revisa la bandeja" : "FALLÓ — revisa la clave de aplicación");
  process.exit(ok ? 0 : 1);
}

main();
