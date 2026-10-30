import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";
import { AdSlot } from "@/components/proxlive/AdSlot";
import { CameraCard } from "@/components/proxlive/CameraCard";
import { Footer } from "@/components/proxlive/Footer";
import { LiveHero } from "@/components/proxlive/LiveHero";
import { Navbar } from "@/components/proxlive/Navbar";
import { Reveal } from "@/components/proxlive/Reveal";
import { Section } from "@/components/proxlive/Section";
import {
  cameraDetailHorizontalAd,
  getCameraBySlug,
  getPlaceBySlug,
  getPlaceCameras,
  places
} from "@/lib/proxlive-data";

type PlacePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return places.map((place) => ({ slug: place.slug }));
}

export async function generateMetadata({
  params
}: PlacePageProps): Promise<Metadata> {
  const { slug } = await params;
  const place = getPlaceBySlug(slug);

  if (!place) {
    return { title: "Lugar não encontrado" };
  }

  const hero = getCameraBySlug(place.heroCamera);
  const title = `${place.name} ao vivo`;
  const description = `${place.tagline} Câmeras ao vivo em ${place.location}, sem cadastro.`;

  return {
    title,
    description,
    alternates: { canonical: `/lugar/${place.slug}/` },
    openGraph: {
      type: "website",
      url: `/lugar/${place.slug}/`,
      title: `${title} | PROXLIVE`,
      description,
      images: hero ? [{ url: hero.image, width: 800, height: 600, alt: place.name }] : []
    }
  };
}

export default async function PlacePage({ params }: PlacePageProps) {
  const { slug } = await params;
  const place = getPlaceBySlug(slug);

  if (!place) {
    notFound();
  }

  const hero = getCameraBySlug(place.heroCamera);
  const placeCameras = getPlaceCameras(place);

  return (
    <>
      <Navbar />
      <main id="conteudo">
        {hero ? (
          <LiveHero
            compact
            camera={hero}
            ghost={place.shortName}
            eyebrow={place.location}
            title={place.name}
            subtitle={place.tagline}
          />
        ) : null}

        <Section
          id="cameras"
          eyebrow="Ao vivo"
          title="As câmeras daqui"
          meta={
            <span className="inline-flex items-center gap-2 text-sm text-carbon-400">
              <MapPin className="h-4 w-4" />
              {place.location}
            </span>
          }
          className="pt-4"
        >
          <div className="grid gap-5 md:grid-cols-2">
            {placeCameras.map((camera, index) => (
              <Reveal key={camera.id} delay={index * 80} className="h-full">
                <CameraCard camera={camera} priority={index < 2} />
              </Reveal>
            ))}
          </div>
        </Section>

        {place.agenda.length > 0 ? (
          <Section
            id="agenda"
            eyebrow="Agenda"
            title="O que vem por aí"
            className="pt-10"
          >
            <ul className="space-y-px overflow-hidden rounded-2xl bg-carbon-900 shadow-hair">
              {place.agenda.map((item, index) => (
                <Reveal as="li" key={item.id} delay={index * 60}>
                  <div className="flex flex-col gap-2 border-b border-white/[0.06] px-6 py-6 transition-colors duration-300 hover:bg-carbon-850 sm:flex-row sm:items-center sm:gap-8">
                    <span className="eyebrow flex w-32 shrink-0 items-center gap-2 text-brand-400">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {item.date}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-white">
                        {item.title}
                      </h3>
                      {item.detail ? (
                        <p className="mt-1 text-sm text-carbon-400">{item.detail}</p>
                      ) : null}
                    </div>
                  </div>
                </Reveal>
              ))}
            </ul>
          </Section>
        ) : null}

        <Section
          id="projeto"
          eyebrow="O projeto"
          title={`Por que o ${place.shortName} está no ar`}
          className="pt-10"
        >
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px]">
            <Reveal>
              <div className="prose-measure whitespace-pre-line text-base">
                {place.about}
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div className="space-y-px overflow-hidden rounded-2xl bg-carbon-900 shadow-hair">
                {place.tech.map((item) => (
                  <div
                    key={item.id}
                    className="border-b border-white/[0.06] p-6 last:border-0"
                  >
                    <h3 className="text-sm font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-carbon-400">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </Section>

        <Reveal as="section" className="shell mt-20">
          <AdSlot
            ads={[cameraDetailHorizontalAd]}
            format="horizontal"
            placement={`lugar_${place.slug}`}
          />
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
