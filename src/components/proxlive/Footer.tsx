import Image from "next/image";
import Link from "next/link";
import { Instagram, MessageCircle } from "lucide-react";
import { partners, places, socialLinks } from "@/lib/proxlive-data";
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
            <div className="mt-7 flex items-center gap-3">
              <a
                href={socialLinks.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-carbon-300 transition-[color,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:text-white"
                aria-label="Falar no WhatsApp"
              >
                <MessageCircle className="h-[18px] w-[18px]" />
              </a>
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noreferrer"
                className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-carbon-300 transition-[color,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:text-white"
                aria-label="Seguir no Instagram"
              >
                <Instagram className="h-[18px] w-[18px]" />
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-12 sm:flex-row sm:gap-20">
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
              <h2 className="eyebrow">Empresas parceiras</h2>
              {/*
                Os arquivos tem fundo transparente, entao `brightness-0 invert`
                reduz cada um a uma silhueta branca. Assim as quatro marcas
                convivem sem competir por cor, que e o que mantem o rodape
                minimalista.
              */}
              <ul className="mt-6 flex flex-wrap items-center gap-x-9 gap-y-7">
                {partners.map((partner) => {
                  const mark = (
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      width={400}
                      height={100}
                      className="h-5 w-auto opacity-60 brightness-0 invert transition-opacity duration-300 group-hover/p:opacity-100 sm:h-[22px]"
                    />
                  );

                  return (
                    <li key={partner.id}>
                      {partner.url ? (
                        <a
                          href={partner.url}
                          target="_blank"
                          rel="noreferrer"
                          className="focus-ring group/p inline-flex rounded py-1.5"
                        >
                          {mark}
                        </a>
                      ) : (
                        <span className="group/p inline-flex">{mark}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
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
