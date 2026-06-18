import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyPlanner AI",
  description: "Cronogramas de estudos personalizados com IA real."
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
