import Image from "next/image";
import { Instagram, Mail, MessageCircle } from "lucide-react";
import { siteConfig, socialLinks } from "@/lib/proxlive-data";

/**
 * Rodape unico das duas paginas. Antes a Home usava a versao branca e a pagina
 * de camera a azul — a diferenca saltava ao navegar entre elas.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-4 border-t border-ink-100 bg-ink-50">
      <div className="proxlive-container py-14 sm:py-16">
        {/* `auto` na segunda coluna: o bloco de contato encosta na margem
            direita do container, alinhado com a barra inferior. */}
        <div className="grid gap-10 md:grid-cols-[1fr_auto]">
          <div>
            <Image
              src="/images/brand/proxmon-logo-colorida.png"
              alt="PROXMON"
              width={9629}
              height={1689}
              className="h-auto w-[190px]"
            />
            <p className="prose-measure mt-5 max-w-xs text-sm">
              Câmeras ao vivo abertas para acompanhar em tempo real.
            </p>

            <div className="mt-6 flex items-center gap-2">
              <a
                href={socialLinks.whatsapp}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="proxlive-focus inline-flex h-10 w-10 items-center justify-center rounded-lg border border-ink-200 bg-white text-ink-500 shadow-e1 transition-[color,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-600"
              >
                <MessageCircle className="h-[18px] w-[18px]" />
              </a>
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="proxlive-focus inline-flex h-10 w-10 items-center justify-center rounded-lg border border-ink-200 bg-white text-ink-500 shadow-e1 transition-[color,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-600"
              >
                <Instagram className="h-[18px] w-[18px]" />
              </a>
            </div>
          </div>

          {/* flex-col: o e-mail e o botão são inline-flex e, soltos, ficavam
              lado a lado na mesma linha. */}
          <div className="flex flex-col items-start">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
              Contato
            </h2>
            <a
              href={`mailto:${siteConfig.email}`}
              className="proxlive-focus mt-3 inline-flex items-start gap-2 rounded py-1 text-sm text-ink-600 transition-colors hover:text-brand-600"
            >
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
              <span className="break-all">{siteConfig.email}</span>
            </a>
            <a
              href={socialLinks.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm btn-secondary mt-5"
            >
              <MessageCircle className="h-4 w-4" />
              Falar no WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-12 border-t border-ink-200 pt-6">
          <p className="text-xs text-ink-500">
            © {year} PROXMON. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
