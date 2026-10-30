import Link from "next/link";
import { ChevronRight, Map, MapPin } from "lucide-react";
import type { Camera } from "@/lib/proxlive-data";
import { getPlaceOfCamera } from "@/lib/proxlive-data";
import { CameraCard } from "./CameraCard";
import { CameraPlayer } from "./CameraPlayer";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { ShareButton } from "./ShareButton";

type CameraDetailProps = {
  camera: Camera;
  cameras: Camera[];
};

export function CameraDetail({
  camera,
  cameras
}: CameraDetailProps) {
  const live = Boolean(camera.streamUrl?.trim());
  const place = getPlaceOfCamera(camera.slug);
  const siblings = cameras.filter((item) => item.slug !== camera.slug);

  return (
    <main id="conteudo">
      <div className="shell pt-24 sm:pt-28">
        <nav aria-label="Trilha" className="mb-7">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-carbon-500">
            <li>
              <Link
                href="/"
                className="focus-ring inline-block rounded py-1.5 transition-colors hover:text-white"
              >
                Início
              </Link>
            </li>
            {place ? (
              <>
                <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
                <li>
                  <Link
                    href={`/lugar/${place.slug}`}
                    className="focus-ring inline-block rounded py-1.5 transition-colors hover:text-white"
                  >
                    {place.shortName}
                  </Link>
                </li>
              </>
            ) : null}
            <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
            <li aria-current="page" className="truncate text-carbon-300">
              {camera.name}
            </li>
          </ol>
        </nav>

        <div className="flex flex-col gap-5 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <span className="eyebrow flex items-center gap-2.5">
              {live ? (
                <span className="h-1.5 w-1.5 animate-live-pulse rounded-full bg-live" />
              ) : null}
              {live ? "Ao vivo agora" : "Em breve"}
            </span>
            <h1 className="mt-4 text-display text-balance font-display text-white">
              {camera.name}
            </h1>
            <p className="mt-4 flex items-center gap-2 text-sm text-carbon-400">
              <MapPin className="h-4 w-4 shrink-0" />
              {camera.location}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link href="/#mapa" className="btn btn-sm btn-outline">
              <Map className="h-4 w-4" />
              Ver no mapa
            </Link>
            <ShareButton
              title={`Câmera ao vivo — ${camera.name}`}
              text={camera.summary}
              camera={camera.slug}
            />
          </div>
        </div>

        {/*
          No celular o player sangra ate as bordas: a margem lateral do `shell`
          custava ~10% da largura da imagem, que e a unica coisa que a pessoa
          veio ver.
        */}
        <div className="relative -mx-5 aspect-video overflow-hidden shadow-glow sm:mx-0 sm:rounded-3xl">
          <CameraPlayer camera={camera} />
        </div>
      </div>

      {siblings.length > 0 ? (
        <Section eyebrow="Também ao vivo" title="Outras câmeras" className="pt-12">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {siblings.map((item, index) => (
              <Reveal key={item.id} delay={index * 70} className="h-full">
                <CameraCard camera={item} />
              </Reveal>
            ))}
          </div>
        </Section>
      ) : null}
    </main>
  );
}
