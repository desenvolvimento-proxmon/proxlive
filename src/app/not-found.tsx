import Link from "next/link";
import { ArrowLeft, VideoOff } from "lucide-react";
import { Footer } from "@/components/proxlive/Footer";
import { Navbar } from "@/components/proxlive/Navbar";

export const metadata = {
  title: "Página não encontrada",
  robots: { index: false, follow: true }
};

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main
        id="conteudo"
        className="proxlive-container flex min-h-[52vh] flex-col items-center justify-center py-20 text-center"
      >
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 ring-1 ring-inset ring-brand-500/10">
          <VideoOff className="h-6 w-6" strokeWidth={1.8} />
        </span>
        <h1 className="mt-6 text-title text-ink-900">Página não encontrada</h1>
        <p className="prose-measure mt-3 text-center">
          A câmera ou o endereço que você tentou abrir não existe mais. Volte
          para a home e veja as transmissões que estão no ar agora.
        </p>
        <Link href="/" className="btn btn-md btn-primary mt-8">
          <ArrowLeft className="h-4 w-4" />
          Ver câmeras ao vivo
        </Link>
      </main>
      <Footer />
    </>
  );
}
