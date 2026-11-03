import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { Cabecalho } from "@/components/Cabecalho";
import { MotionProvider } from "@/components/MotionProvider";
import { NavInferior } from "@/components/NavInferior";
import { Rodape } from "@/components/Rodape";
import { BASE_PATH, SITE_URL, asset } from "@/lib/base";

const display = Montserrat({
  subsets: ["latin"],
  weight: ["800", "900"],
  variable: "--fonte-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(`${SITE_URL}${BASE_PATH}/`),
  title: { default: "Radar Olímpico | SEDUC Ceará", template: "%s | Radar Olímpico" },
  description:
    "Olimpíadas do conhecimento, feiras científicas e oportunidades para estudantes da rede pública estadual do Ceará, em um só lugar.",
  applicationName: "Radar Olímpico",
  manifest: asset("/manifest.webmanifest"),
  icons: {
    icon: asset("/icons/favicon-48.png"),
    apple: asset("/icons/apple-touch-icon.png"),
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Radar Olímpico",
    images: [{ url: "og/padrao.png", width: 1200, height: 630, alt: "Radar Olímpico" }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fffaf3" },
    { media: "(prefers-color-scheme: dark)", color: "#16100b" },
  ],
  width: "device-width",
  initialScale: 1,
};

// Aplica o tema antes da primeira pintura para não piscar.
const scriptTema = `try{var t=localStorage.getItem('radar-tema');document.documentElement.dataset.theme=t||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch(e){document.documentElement.dataset.theme='light'}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={display.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body className="min-h-dvh">
        <a href="#conteudo" className="pular-link">
          Pular para o conteúdo
        </a>
        <MotionProvider>
          <Cabecalho />
          <main id="conteudo">{children}</main>
          <Rodape />
          <NavInferior />
        </MotionProvider>
      </body>
    </html>
  );
}
