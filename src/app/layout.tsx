import type { Metadata, Viewport } from "next";
import { Exo_2, Nunito } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { MotionProvider } from "@/components/MotionProvider";
import { GuiaFlutuante } from "@/components/GuiaFlutuante";
import { Navegacao } from "@/components/Navegacao";
import { RegistrarSW } from "@/components/RegistrarSW";
import { Rodape } from "@/components/Rodape";
import { BASE_PATH, SITE_URL, asset } from "@/lib/base";
import { novidades } from "@/lib/dados";

// Exo 2 traz o clima de ficção científica nos títulos. Nunito é redonda e amigável no texto.
const titulo = Exo_2({ subsets: ["latin"], variable: "--fonte-titulo", display: "swap" });
const texto = Nunito({ subsets: ["latin"], variable: "--fonte-texto", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(`${SITE_URL}${BASE_PATH}/`),
  title: { default: "Radar Olímpico | SEDUC Ceará", template: "%s | Radar Olímpico" },
  description: "Olimpíadas do conhecimento, feiras e eventos científicos para estudantes da rede pública estadual do Ceará. Publicação da COPES/SEDUC.",
  applicationName: "Radar Olímpico",
  icons: { icon: asset("/icons/favicon-48.png"), apple: asset("/icons/apple-touch-icon.png") },
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
    { color: "#071a2e" },
  ],
  width: "device-width",
  initialScale: 1,
};

const scriptTema = `try{var t=localStorage.getItem('radar-tema');document.documentElement.dataset.theme=t||'dark'}catch(e){document.documentElement.dataset.theme='dark'}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${titulo.variable} ${texto.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body className="min-h-dvh">
        <a href="#conteudo" className="pular-link">
          Pular para o conteúdo
        </a>
        <MotionProvider>
          <Navegacao ultimaNovidade={novidades.itens[0]?.detectadoEm ?? null} />
          <main id="conteudo">{children}</main>
          <Rodape />
          <GuiaFlutuante />
          <RegistrarSW />
        </MotionProvider>
      </body>
    </html>
  );
}
