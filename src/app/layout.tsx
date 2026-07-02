import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PROXLIVE | Câmeras ao vivo",
  description: "Câmeras ao vivo, mapa interativo e plataforma inteligente de vídeo."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
