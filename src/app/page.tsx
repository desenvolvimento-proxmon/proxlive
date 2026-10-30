import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { CameraMap } from "@/components/proxlive/CameraMap";
import { Footer } from "@/components/proxlive/Footer";
import { Navbar } from "@/components/proxlive/Navbar";
import { PlaceCard } from "@/components/proxlive/PlaceCard";
import { Reveal } from "@/components/proxlive/Reveal";
import { Section } from "@/components/proxlive/Section";
import {
  cameras,
  getCameraBySlug,
  getLiveCameras,
  getPlaceCameras,
  places
} from "@/lib/proxlive-data";

export default function HomePage() {
  const liveCount = getLiveCameras().length;

  return (
    <>
      <Navbar />
      <main id="conteudo">
        {/*
          O hero nao usa mais o sinal de uma camera como fundo: uma unica
          imagem fazia a home inteira parecer ser daquele lugar. Quem carrega
          video agora sao os paineis de lugar, cada um com o seu.
        */}
        <section className="relative isolate flex min-h-[86vh] items-center overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(90%_70%_at_18%_-10%,rgba(0,114,255,0.16),transparent_58%),radial-gradient(70%_60%_at_92%_108%,rgba(0,114,255,0.08),transparent_55%)]"
          />
          <span
            aria-hidden="true"
            className="ghost-type absolute -bottom-[0.16em] left-0 -z-10 w-full text-[clamp(5rem,20vw,19rem)]"
          >
            PROXLIVE
          </span>

          <div className="shell relative w-full py-32">
            <div className="max-w-4xl">
              <span className="eyebrow flex items-center gap-2.5 text-white/70">
                <span className="h-1.5 w-1.5 animate-live-pulse rounded-full bg-live" />
                {liveCount} {liveCount === 1 ? "câmera" : "câmeras"} transmitindo
                agora
              </span>

              <h1 className="mt-7 text-hero text-balance text-white">
                Lugares que você
                <br />
                pode ver agora.
              </h1>

              <p className="mt-8 max-w-xl text-lead text-carbon-300">
                Câmeras ao vivo, abertas, sem cadastro e sem instalar nada.
                Escolha um lugar e acompanhe em tempo real.
              </p>

              <Link href="#lugares" className="btn btn-md btn-solid mt-10">
                Ver os lugares
                <ArrowDown className="h-4 w-4 animate-scroll-cue" />
              </Link>
            </div>
          </div>
        </section>

        <Section
          id="lugares"
          eyebrow="Lugares"
          title="Onde estamos"
          description="Cada lugar reúne suas câmeras e o que acontece por lá."
        >
          <div className="space-y-6">
            {places.map((place, index) => (
              <Reveal key={place.slug} delay={index * 90}>
                <PlaceCard
                  place={place}
                  hero={
                    place.heroCamera ? getCameraBySlug(place.heroCamera) : undefined
                  }
                  cameraCount={getPlaceCameras(place).length}
                />
              </Reveal>
            ))}
          </div>
        </Section>

        <Section id="mapa" eyebrow="Mapa" title="Onde cada câmera está" className="pt-10">
          <Reveal>
            <CameraMap cameras={cameras} />
          </Reveal>
        </Section>
      </main>
      <Footer />
    </>
  );
}
