import { CameraMap } from "@/components/proxlive/CameraMap";
import { Footer } from "@/components/proxlive/Footer";
import { HeroX } from "@/components/proxlive/HeroX";
import { Navbar } from "@/components/proxlive/Navbar";
import { PlaceCard } from "@/components/proxlive/PlaceCard";
import { Reveal } from "@/components/proxlive/Reveal";
import { Section } from "@/components/proxlive/Section";
import {
  cameras,
  getCameraBySlug,
  getPlaceCameras,
  places
} from "@/lib/proxlive-data";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="conteudo">
        <section className="relative isolate flex min-h-[88vh] items-center justify-center overflow-hidden">
          <HeroX />

          <div className="shell relative w-full py-32 text-center">
            {/* TEXTO PROVISORIO — a frase definitiva entra aqui */}
            <h1 className="mx-auto max-w-2xl text-hero text-balance font-display text-white">
              Lugares que você pode ver agora
            </h1>
            <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-carbon-400">
              Câmeras ao vivo, abertas, em tempo real.
            </p>
          </div>
        </section>

        <Section
          id="lugares"
          eyebrow="Lugares"
          title="Onde estamos"
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {places.map((place, index) => (
              <Reveal key={place.slug} delay={index * 90} className="h-full">
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
