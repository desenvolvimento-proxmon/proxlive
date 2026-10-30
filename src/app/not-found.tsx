import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
        className="shell relative flex min-h-[70vh] flex-col justify-center overflow-hidden py-28"
      >
        <span
          aria-hidden="true"
          className="ghost-type pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-[clamp(7rem,28vw,24rem)]"
        >
          404
        </span>

        <div className="relative max-w-xl">
          <span className="eyebrow">Erro 404</span>
          <h1 className="mt-5 text-display text-balance font-display text-white">
            Essa página saiu do ar.
          </h1>
          <p className="prose-measure mt-6">
            O endereço que você tentou abrir não existe mais. Volte para o
            início e veja o que está transmitindo agora.
          </p>
          <Link href="/" className="btn btn-md btn-solid mt-9">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao início
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
