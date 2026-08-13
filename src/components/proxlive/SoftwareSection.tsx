import Image from "next/image";
import { MessageCircle } from "lucide-react";
import type { SoftwareSection as SoftwareSectionData } from "@/lib/proxlive-data";
import { Reveal } from "./Reveal";

type SoftwareSectionProps = {
  section: SoftwareSectionData;
};

export function SoftwareSection({ section }: SoftwareSectionProps) {
  return (
    <section className="relative isolate overflow-hidden bg-ink-950 py-16 text-white sm:py-20">
      {/* Azul como iluminação sobre superfície profunda, em vez de fundo chapado. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(90%_70%_at_12%_0%,rgba(0,114,255,0.30),transparent_60%),radial-gradient(80%_80%_at_95%_100%,rgba(0,114,255,0.16),transparent_55%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />

      <div className="proxlive-container grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <Reveal>
          <h2 className="text-title text-balance text-white">
            {section.title}
          </h2>
          {/* Antes: `text-lg sm:text-base` — a fonte encolhia em telas maiores. */}
          <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-white/70 sm:text-base">
            {section.description}
          </p>
          <a
            href={section.buttonUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-md btn-on-dark-solid mt-8"
          >
            <MessageCircle className="h-4 w-4" />
            {section.buttonText}
          </a>
        </Reveal>

        <Reveal delay={120} className="flex justify-center lg:justify-end">
          <Image
            src={section.image}
            alt="Mockup da plataforma web e app"
            width={1920}
            height={1080}
            sizes="(min-width: 1280px) 720px, (min-width: 1024px) 58vw, 100vw"
            unoptimized
            className="h-auto w-full max-w-[720px] object-contain drop-shadow-[0_36px_60px_rgba(0,0,0,0.45)]"
          />
        </Reveal>
      </div>
    </section>
  );
}
