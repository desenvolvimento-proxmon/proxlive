import { CameraMap } from "@/components/proxlive/CameraMap";
import { CameraGrid } from "@/components/proxlive/CameraGrid";
import { Footer } from "@/components/proxlive/Footer";
import { HeroSlider } from "@/components/proxlive/HeroSlider";
import { HorizontalAd } from "@/components/proxlive/HorizontalAd";
import { Navbar } from "@/components/proxlive/Navbar";
import { SectionTitle } from "@/components/proxlive/SectionTitle";
import { SideAd } from "@/components/proxlive/SideAd";
import { SoftwareSection } from "@/components/proxlive/SoftwareSection";
import {
  cameras,
  heroSlides,
  horizontalAds,
  sideAds,
  softwareSection
} from "@/lib/proxlive-data";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSlider slides={heroSlides} />

        <section className="proxlive-container py-12">
          <SectionTitle>Câmeras ao vivo</SectionTitle>
          <CameraGrid cameras={cameras} />
        </section>

        <section className="proxlive-container pb-14">
          <HorizontalAd ad={horizontalAds[0]} />
        </section>

        <section id="mapa-cameras" className="proxlive-container scroll-mt-8 py-8">
          <SectionTitle>Mapa de câmeras</SectionTitle>
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_330px]">
            <CameraMap cameras={cameras} />
            <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-1">
              {sideAds.map((ad) => (
                <SideAd key={ad.id} ad={ad} />
              ))}
            </div>
          </div>
        </section>

        <SoftwareSection section={softwareSection} />
      </main>
      <Footer variant="white" />
    </>
  );
}
