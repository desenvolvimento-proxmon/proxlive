import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";
import { CameraCard } from "@/components/proxlive/CameraCard";
import { Footer } from "@/components/proxlive/Footer";
import { Navbar } from "@/components/proxlive/Navbar";
import { Reveal } from "@/components/proxlive/Reveal";
import { Section } from "@/components/proxlive/Section";
import { getPlaceBySlug, getPlaceCameras, places } from "@/lib/proxlive-data";

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
      images: [{ url: place.heroImage ?? place.cover, alt: place.name }]
    }
  };
}

export default async function PlacePage({ params }: PlacePageProps) {
  const { slug } = await params;
  const place = getPlaceBySlug(slug);

  if (!place) {
    notFound();
  }

  const placeCameras = getPlaceCameras(place);

  return (
    <>
      <Navbar />
      <main id="conteudo">
        {/*
          Topo com um frame congelado da camera, nao com o sinal ao vivo. O
          enquadramento e o verdadeiro, mas nao abre stream nenhum para quem
          ainda nem decidiu olhar — a transmissao comeca nos cards abaixo.
        */}
        <section className="relative isolate flex min-h-[62vh] items-end overflow-hidden sm:min-h-[68vh]">
          <Image
            src={place.heroImage ?? place.cover}
            alt=""
            fill
            priority
            sizes="100vw"
            className="-z-20 object-cover"
          />
          <div aria-hidden="true" className="scrim-bottom absolute inset-0 -z-10" />
          <div aria-hidden="true" className="scrim-left absolute inset-0 -z-10" />

          <span
            aria-hidden="true"
            className="ghost-type absolute -bottom-[0.15em] left-0 -z-10 w-full text-[clamp(4rem,17vw,15rem)]"
          >
            {place.shortName}
          </span>

          <div className="shell relative w-full pb-14 pt-36">
            <span className="eyebrow flex items-center gap-2 text-white/70">
              <MapPin className="h-3.5 w-3.5" />
              {place.location}
            </span>
            <h1 className="mt-5 text-hero text-balance font-display text-white">
              {place.name}
            </h1>
            <p className="mt-5 max-w-xl text-lead text-carbon-200">
              {place.tagline}
            </p>
          </div>
        </section>

        {placeCameras.length > 0 ? (
          <Section id="cameras" eyebrow="Ao vivo" title="As câmeras daqui">
            <div className="grid gap-5 md:grid-cols-2">
              {placeCameras.map((camera, index) => (
                <Reveal key={camera.id} delay={index * 80} className="h-full">
                  <CameraCard camera={camera} priority={index < 2} />
                </Reveal>
              ))}
            </div>
          </Section>
        ) : null}

        <Section
          id="projeto"
          eyebrow="O projeto"
          title="O que a Proxmon executou nesse projeto"
          className="pt-10"
        >
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
            <Reveal>
              {/*
                Justificado com hifenizacao: sem os hifens, justificar em
                portugues abre buracos entre as palavras.
              */}
              <div className="prose-measure hyphens-auto whitespace-pre-line text-justify text-base">
                {place.about}
              </div>
            </Reveal>

            {place.nextEvent ? (
              <Reveal delay={80}>
                <div className="rounded-2xl bg-carbon-900 p-7 shadow-hair">
                  <span className="eyebrow flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Próximo evento
                  </span>
                  <p className="mt-5 font-display text-title text-white">
                    {place.nextEvent.title}
                  </p>
                  <p className="mt-2 text-sm text-carbon-400">
                    {place.nextEvent.date}
                  </p>
                </div>
              </Reveal>
            ) : null}
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
