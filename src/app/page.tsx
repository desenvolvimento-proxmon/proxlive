import { Map } from "lucide-react";
import { AdSlot } from "@/components/proxlive/AdSlot";
import { CameraGrid } from "@/components/proxlive/CameraGrid";
import { CameraMap } from "@/components/proxlive/CameraMap";
import { Footer } from "@/components/proxlive/Footer";
import { HeroSlider } from "@/components/proxlive/HeroSlider";
import { HorizontalAd } from "@/components/proxlive/HorizontalAd";
import { Navbar } from "@/components/proxlive/Navbar";
import { Reveal } from "@/components/proxlive/Reveal";
import { SectionTitle } from "@/components/proxlive/SectionTitle";
import { SoftwareSection } from "@/components/proxlive/SoftwareSection";
import {
  cameras,
  getLiveCameras,
  heroSlides,
  horizontalAds,
  sideAds,
  softwareSection
} from "@/lib/proxlive-data";

export default function HomePage() {
  const liveCount = getLiveCameras().length;

  return (
    <>
      <Navbar />
      <main id="conteudo">
        <HeroSlider slides={heroSlides} />

        <section id="cameras" className="proxlive-container scroll-mt-24 py-14">
          <Reveal>
            {/* h1 da Home: é o assunto real da página para a busca. */}
            <SectionTitle
              as="h1"
              meta={
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-500">
                  <span className="h-1.5 w-1.5 animate-live-pulse rounded-full bg-proxlive-live" />
                  {liveCount} no ar agora
                </span>
              }
            >
              Câmeras ao vivo
            </SectionTitle>
          </Reveal>
          <CameraGrid cameras={cameras} />
        </section>

        <Reveal as="section" className="proxlive-container pb-14">
          <HorizontalAd ad={horizontalAds[0]} placement="home_below_grid" />
        </Reveal>

        <section
          id="mapa-cameras"
          className="proxlive-container scroll-mt-24 pb-16"
        >
          <Reveal>
            <SectionTitle icon={Map}>Mapa de câmeras</SectionTitle>
          </Reveal>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            {/* h-full: o mapa acompanha a altura da coluna de anúncios,
                para as duas colunas terminarem alinhadas. */}
            <Reveal className="h-full min-w-0">
              <CameraMap cameras={cameras} />
            </Reveal>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
              {sideAds.map((ad, index) => (
                <Reveal key={ad.id} delay={index * 80}>
                  <AdSlot
                    ads={[ad]}
                    format="side"
                    placement="home_map_sidebar"
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <SoftwareSection section={softwareSection} />
      </main>
      <Footer />
    </>
  );
}
