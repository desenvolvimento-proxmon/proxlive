import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { siteConfig } from "@/lib/proxlive-data";
import { JsonLd, organizationSchema, websiteSchema } from "@/lib/structured-data";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
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
    <html lang="pt-BR" className={inter.variable}>
      <head>
        {/*
          Marca <html> antes da primeira pintura. Enquanto essa classe nao
          existir, o CSS mantem os blocos `.reveal` visiveis — sem JS, nada
          desaparece.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')"
          }}
        />
        {/* Handshake antecipado com os CDNs de HLS, mapa e tiles. */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link rel="preconnect" href="https://unpkg.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://video04.logicahost.com.br" />
      </head>
      <body>
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-500 focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:shadow-e3"
        >
          Ir para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
