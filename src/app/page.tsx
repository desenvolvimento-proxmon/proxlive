import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AdSlot } from "@/components/proxlive/AdSlot";
import { CameraMap } from "@/components/proxlive/CameraMap";
import { Footer } from "@/components/proxlive/Footer";
import { LiveHero } from "@/components/proxlive/LiveHero";
import { Navbar } from "@/components/proxlive/Navbar";
import { PlaceCard } from "@/components/proxlive/PlaceCard";
import { Reveal } from "@/components/proxlive/Reveal";
import { Section } from "@/components/proxlive/Section";
import {
  cameras,
  getCameraBySlug,
  getLiveCameras,
  getPlaceCameras,
  places,
  sideAds
} from "@/lib/proxlive-data";

export default function HomePage() {
  const liveCount = getLiveCameras().length;
  const first = places[0];
  const hero = first ? getCameraBySlug(first.heroCamera) : undefined;

  return (
    <>
      <Navbar />
      <main id="conteudo">
        {hero ? (
          <LiveHero
            camera={hero}
            ghost="AO VIVO"
            eyebrow={`${liveCount} ${liveCount === 1 ? "câmera" : "câmeras"} transmitindo agora`}
            title={
              <>
                O que está
                <br />
                acontecendo agora.
              </>
            }
            subtitle="Câmeras abertas, em tempo real, sem cadastro e sem instalar nada. Escolha um lugar e assista."
          >
            <Link href={`/lugar/${first.slug}`} className="btn btn-md btn-solid">
              Ver o {first.shortName}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </LiveHero>
        ) : null}

        <Section
          id="lugares"
          eyebrow="Lugares"
          title="Onde estamos"
          description="Cada lugar reúne suas câmeras e o que acontece por lá."
          className="pt-4"
        >
          <div className="space-y-6">
            {places.map((place, index) => {
              const placeCameras = getPlaceCameras(place);
              const placeHero = getCameraBySlug(place.heroCamera);

              if (!placeHero) {
                return null;
              }

              return (
                <Reveal key={place.slug} delay={index * 90}>
                  <PlaceCard
                    place={place}
                    hero={placeHero}
                    cameraCount={placeCameras.length}
                  />
                </Reveal>
              );
            })}
          </div>
        </Section>

        <Section
          id="mapa"
          eyebrow="Mapa"
          title="Onde cada câmera está"
          className="pt-10"
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            <Reveal className="h-full min-w-0">
              <CameraMap cameras={cameras} />
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {sideAds.slice(0, 3).map((ad, index) => (
                <Reveal key={ad.id} delay={index * 80}>
                  <AdSlot ads={[ad]} format="side" placement="home_map_sidebar" />
                </Reveal>
              ))}
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
