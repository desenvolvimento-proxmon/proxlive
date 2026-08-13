import Link from "next/link";
import { ChevronRight, FileText, Map, MapPin } from "lucide-react";
import type { AdCreative, Camera } from "@/lib/proxlive-data";
import { AvailableCamerasList } from "./AvailableCamerasList";
import { AdSlot } from "./AdSlot";
import { CameraPlayer } from "./CameraPlayer";
import { Reveal } from "./Reveal";
import { ShareButton } from "./ShareButton";

type CameraDetailProps = {
  camera: Camera;
  cameras: Camera[];
  horizontalAd: AdCreative;
  sideAds: AdCreative[];
};

export function CameraDetail({
  camera,
  cameras,
  horizontalAd,
  sideAds
}: CameraDetailProps) {
  return (
    <main id="conteudo">
      <div className="relative isolate overflow-hidden bg-ink-950">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_20%_0%,rgba(0,114,255,0.20),transparent_60%)]"
        />

        <div className="proxlive-container py-5 lg:py-7">
          <nav aria-label="Trilha" className="mb-4">
            <ol className="flex items-center gap-1 text-xs text-white/45">
              <li>
                <Link
                  href="/"
                  className="proxlive-focus-dark rounded transition-colors hover:text-white/80"
                >
                  Câmeras ao vivo
                </Link>
              </li>
              <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
              <li aria-current="page" className="truncate text-white/75">
                {camera.name}
              </li>
            </ol>
          </nav>

          {/*
            A coluna da direita antes era um espaçador vazio de 390px, o que
            deixava um vão escuro ao lado do vídeo no desktop. Agora carrega a
            identificação da câmera e as ações.
          */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0">
              <div className="relative aspect-video overflow-hidden rounded-2xl shadow-e4 ring-1 ring-white/10">
                <CameraPlayer camera={camera} />
              </div>
            </div>

            <div className="flex flex-col lg:py-1">
              <h1 className="text-title text-balance text-white">
                {camera.name}
              </h1>

              <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-white/55">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                {camera.location}
              </p>

              <div className="mt-6 flex flex-wrap gap-2.5">
                <Link
                  href={`/?camera=${camera.slug}#mapa-cameras`}
                  className="btn btn-sm btn-on-dark-solid"
                >
                  <Map className="h-4 w-4" />
                  Ver no mapa
                </Link>
                <ShareButton
                  title={`Câmera ao vivo — ${camera.name}`}
                  text={camera.summary}
                  camera={camera.slug}
                />
              </div>

              {/* Ocupa o espaço vazio ao lado do vídeo e mantém o visitante
                  circulando entre as câmeras sem descer a página. */}
              <div className="mt-7 border-t border-white/10 pt-6">
                <AvailableCamerasList
                  cameras={cameras}
                  currentSlug={camera.slug}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="proxlive-container grid gap-8 py-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
        <div className="min-w-0">
          <Reveal>
            <h2 className="mb-4 flex items-center gap-2.5 text-sm font-semibold tracking-[-0.012em] text-ink-900">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-brand-50 text-brand-500 ring-1 ring-inset ring-brand-500/10">
                <FileText className="h-4 w-4" strokeWidth={2.1} />
              </span>
              Sobre este ponto
            </h2>
            {/*
              pl-[38px] = ícone (28px) + gap (10px) do título, para o corpo
              nascer na mesma vertical que "Sobre este ponto". Vale em toda
              largura: limitado a `sm`, desalinhava em janelas estreitas.
              `hyphens-auto` acompanha o `text-justify`: sem hifenização, a
              justificação abre buracos entre as palavras numa coluna estreita.
              Medida controlada: antes era `max-w-none` num container de 1200px.
            */}
            <div className="prose-measure hyphens-auto whitespace-pre-line break-words pl-[38px] text-justify">
              {camera.description}
            </div>
          </Reveal>

          <Reveal delay={80} className="mt-10">
            <AdSlot
              ads={[horizontalAd]}
              format="horizontal"
              placement="camera_detail_below_description"
            />
          </Reveal>
        </div>

        {/* Sticky: acompanha a rolagem enquanto a pessoa assiste. */}
        <div className="space-y-5 lg:sticky lg:top-[88px] lg:self-start">
          {sideAds.map((ad, index) => (
            <AdSlot
              key={ad.id}
              ads={[ad]}
              format="side"
              placement={`camera_detail_sidebar_${index + 1}`}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
