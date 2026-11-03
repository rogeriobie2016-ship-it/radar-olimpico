import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { MotionProvider } from "@/components/MotionProvider";
import { Navegacao } from "@/components/Navegacao";
import { RegistrarSW } from "@/components/RegistrarSW";
import { Rodape } from "@/components/Rodape";
import { BASE_PATH, SITE_URL, asset } from "@/lib/base";
import { novidades } from "@/lib/dados";

// Uma só família, com eixo de largura: condensada nos títulos, normal no texto.
const fonte = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--fonte", display: "swap" });

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
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f100e" },
  ],
  width: "device-width",
  initialScale: 1,
};

const scriptTema = `try{var t=localStorage.getItem('radar-tema');document.documentElement.dataset.theme=t||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch(e){document.documentElement.dataset.theme='light'}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={fonte.variable} suppressHydrationWarning>
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
          <RegistrarSW />
        </MotionProvider>
      </body>
    </html>
  );
}
