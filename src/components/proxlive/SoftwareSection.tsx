import Image from "next/image";
import { MessageCircle } from "lucide-react";
import type { SoftwareSection as SoftwareSectionData } from "@/lib/proxlive-data";

type SoftwareSectionProps = {
  section: SoftwareSectionData;
};

export function SoftwareSection({ section }: SoftwareSectionProps) {
  return (
    <section className="bg-proxlive-blue py-16 text-white sm:py-20">
      <div className="proxlive-container grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h2 className="text-2xl font-black leading-tight sm:text-3xl lg:text-[42px]">
            {section.title}
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/95 sm:text-base">
            {section.description}
          </p>
          <a
            href={section.buttonUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-9 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-normal text-proxlive-blue transition hover:bg-blue-50"
          >
            <MessageCircle className="h-4 w-4" />
            {section.buttonText}
          </a>
        </div>

        <div className="flex justify-center lg:justify-end">
          <Image
            src={section.image}
            alt="Mockup da plataforma web e app"
            width={1920}
            height={1080}
            sizes="(min-width: 1280px) 760px, (min-width: 1024px) 58vw, 100vw"
            unoptimized
            className="h-auto w-full max-w-[760px] object-contain"
          />
        </div>
      </div>
    </section>
  );
}
