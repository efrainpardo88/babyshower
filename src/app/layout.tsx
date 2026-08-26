import type { Metadata } from "next";
import { Great_Vibes, Cormorant_Garamond, Karla } from "next/font/google";
import "./globals.css";

const script = Great_Vibes({ weight: "400", subsets: ["latin"], variable: "--fuente-script", display: "swap" });
const serif = Cormorant_Garamond({ weight: ["500", "600", "700"], style: ["normal", "italic"], subsets: ["latin"], variable: "--fuente-serif", display: "swap" });
const ui = Karla({ weight: ["400", "600", "700"], subsets: ["latin"], variable: "--fuente-ui", display: "swap" });

export const metadata: Metadata = {
  title: "Baby shower de Benjamín",
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
    <html lang="es-CO" className={`${script.variable} ${serif.variable} ${ui.variable}`}>
      <body>{children}</body>
    </html>
  );
}
