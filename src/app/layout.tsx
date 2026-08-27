import type { Metadata } from "next";
import { The_Nautigal, Style_Script, Cormorant_Garamond, Karla } from "next/font/google";
import "./globals.css";

// Los dos textos grandes de la invitación llevan script distinto a propósito:
// el nombre en The Nautigal, el evento en Style Script. Great Vibes salió del proyecto.
//
// PESOS REALES DE CADA UNA (según el catálogo de next/font):
//  · The Nautigal → 400 y 700. Ambos se descargan, así que `font-bold` usa el
//    archivo real y no un engrosado sintético del navegador.
//  · Style Script → SOLO 400. No existe negrita. Ver la nota en globals.css.
const nombre = The_Nautigal({ weight: ["400", "700"], subsets: ["latin"], variable: "--fuente-nombre", display: "swap" });
const evento = Style_Script({ weight: "400", subsets: ["latin"], variable: "--fuente-evento", display: "swap" });
const serif = Cormorant_Garamond({ weight: ["500", "600", "700"], style: ["normal", "italic"], subsets: ["latin"], variable: "--fuente-serif", display: "swap" });
const ui = Karla({ weight: ["400", "600", "700"], subsets: ["latin"], variable: "--fuente-ui", display: "swap" });

export const metadata: Metadata = {
  /**
   * `template` hace que cada página solo declare SU parte y el nombre del sitio
   * se agregue solo. Antes cada una repetía el nombre a mano y ya se habían
   * desviado dos variantes: «Baby shower de Benjamín» y «La lista de Benjamín».
   */
  title: {
    default: "Baby shower de Benjamín",
    template: "%s · Baby shower de Benjamín",
  },
  description: "Domingo 13 de septiembre, 3:00 pm. Salón Social, Urb. Puerto Ventura. Acompáñanos a celebrar la llegada de Benjamín.",
  openGraph: {
    title: "Baby shower de Benjamín",
    description: "Domingo 13 de septiembre, 3:00 pm. Acompáñanos a celebrar la llegada de Benjamín.",
    locale: "es_CO",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" className={`${nombre.variable} ${evento.variable} ${serif.variable} ${ui.variable}`}>
      <body>{children}</body>
    </html>
  );
}
