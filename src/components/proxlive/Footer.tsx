import Link from "next/link";
import { Instagram, MessageCircle } from "lucide-react";
import { places, siteConfig, socialLinks } from "@/lib/proxlive-data";
import { Logo } from "./Logo";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/[0.07]">
      {/* Marca gigante e quase apagada fechando a pagina. */}
      <span
        aria-hidden="true"
        className="ghost-type-fill pointer-events-none absolute -bottom-[0.18em] left-1/2 w-full -translate-x-1/2 text-center text-[clamp(4rem,17vw,16rem)]"
      >
        PROXLIVE
      </span>

      <div className="shell relative pb-14 pt-16">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-5 text-sm leading-relaxed text-carbon-400">
              Câmeras ao vivo abertas para acompanhar em tempo real.
            </p>
            <div className="mt-7 flex items-center gap-2">
              <a
                href={socialLinks.whatsapp}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-carbon-300 transition-[color,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:text-white"
              >
                <MessageCircle className="h-[18px] w-[18px]" />
              </a>
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-carbon-300 transition-[color,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:text-white"
              >
                <Instagram className="h-[18px] w-[18px]" />
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-10 sm:flex-row sm:gap-20">
            <nav aria-label="Lugares">
              <h2 className="eyebrow">Lugares</h2>
              <ul className="mt-5 space-y-3">
                {places.map((place) => (
                  <li key={place.slug}>
                    <Link
                      href={`/lugar/${place.slug}`}
                      className="focus-ring inline-block rounded py-1.5 text-sm text-carbon-300 transition-colors hover:text-white"
                    >
                      {place.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <h2 className="eyebrow">Contato</h2>
              <a
                href={`mailto:${siteConfig.email}`}
                className="focus-ring mt-4 block break-all rounded py-1.5 text-sm text-carbon-300 transition-colors hover:text-white"
              >
                {siteConfig.email}
              </a>
              <a
                href={socialLinks.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-outline mt-6"
              >
                Falar no WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="mt-20 border-t border-white/[0.07] pt-7">
          <p className="text-xs text-carbon-400">
            © {year} PROXMON. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
