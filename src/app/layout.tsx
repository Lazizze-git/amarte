import type { Metadata } from "next";
import { Instrument_Serif, DM_Sans } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Amarte — Yoga & Pilates à Épalinges",
  description:
    "Studio de yoga, pilates et bien-être à Épalinges. Un espace bienveillant, sans jugement, pour tous les niveaux.",
  keywords: ["yoga", "pilates", "bien-être", "Épalinges", "Lausanne", "studio", "méditation"],
  openGraph: {
    title: "Amarte — Yoga & Pilates à Épalinges",
    description: "Un studio de bien-être bienveillant au cœur d'Épalinges.",
    locale: "fr_CH",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${instrumentSerif.variable} ${dmSans.variable}`}>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
