import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { siteConfig } from "@/lib/proxlive-data";
import { JsonLd, organizationSchema, websiteSchema } from "@/lib/structured-data";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

/**
 * Space Grotesk nos titulos. A Inter e otima para texto corrido, mas e
 * neutra demais para dar personalidade — e falta de personalidade foi
 * justamente a critica ao layout anterior.
 */
const display = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
  variable: "--font-display"
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Câmeras ao vivo em tempo real`,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "câmeras ao vivo",
    "câmera ao vivo",
    "ponte da amizade ao vivo",
    "trânsito ao vivo",
    "Foz do Iguaçu",
    "Ciudad del Este",
    "webcam ao vivo",
    "streaming ao vivo",
    "PROXLIVE"
  ],
  authors: [{ name: "PROXMON" }],
  creator: "PROXMON",
  publisher: "PROXMON",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Câmeras ao vivo em tempo real`,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        // Dimensão real de cam1.png. Trocar por uma arte 1200x630 dedicada
        // melhora o preview no WhatsApp e no Facebook.
        width: 800,
        height: 600,
        alt: "Câmeras ao vivo no PROXLIVE"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — Câmeras ao vivo em tempo real`,
    description: siteConfig.description,
    images: [siteConfig.ogImage]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1
    }
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/images/brand/proxlive-logo.png"
  },
  category: "news"
};

export const viewport: Viewport = {
  themeColor: "#0072ff",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${display.variable}`}>
      <head>
        {/*
          Rede de seguranca dos blocos `.reveal`, que nascem invisiveis e so
          aparecem quando o IntersectionObserver os alcanca: sem JS ninguem os
          revelaria. O <noscript> so entra em cena com script desligado, e por
          ser CSS puro nao mexe no DOM — a tentativa anterior marcava o <html>
          antes da hidratacao e quebrava o casamento servidor/cliente em todas
          as paginas.
        */}
        <noscript>
          <style>{".reveal{opacity:1;transform:none}"}</style>
        </noscript>
        {/* Handshake antecipado com os CDNs de HLS, mapa e tiles. */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link rel="preconnect" href="https://unpkg.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://stream.proxlive.com.br" />
        <link rel="dns-prefetch" href="https://server.arcgisonline.com" />
      </head>
      <body>
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-carbon-950 focus:shadow-lift"
        >
          Ir para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
