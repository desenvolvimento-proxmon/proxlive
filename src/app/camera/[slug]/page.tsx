import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CameraDetail } from "@/components/proxlive/CameraDetail";
import { Footer } from "@/components/proxlive/Footer";
import { Navbar } from "@/components/proxlive/Navbar";
import {
  cameras,
  cameraDetailHorizontalAd,
  cameraDetailSideAds,
  getCameraBySlug,
  isLive
} from "@/lib/proxlive-data";
import {
  JsonLd,
  breadcrumbSchema,
  liveCameraSchema
} from "@/lib/structured-data";

type CameraPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return cameras.map((camera) => ({
    slug: camera.slug
  }));
}

export async function generateMetadata({
  params
}: CameraPageProps): Promise<Metadata> {
  const { slug } = await params;
  const camera = getCameraBySlug(slug);

  if (!camera) {
    return {
      title: "Câmera não encontrada"
    };
  }

  // Título pensado para a busca real: "câmera ao vivo <lugar>".
  const title = `${camera.name} — câmera ao vivo`;
  const description = `${camera.summary} Transmissão ao vivo e gratuita, direto de ${camera.location}.`;
  const path = `/camera/${camera.slug}/`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "video.other",
      url: path,
      title: `${title} | PROXLIVE`,
      description,
      images: [
        {
          url: camera.image,
          // Dimensão real do arquivo. Declarar valor errado faz o WhatsApp e o
          // Facebook montarem o preview com o enquadramento trocado.
          width: 800,
          height: 600,
          alt: `Câmera ao vivo em ${camera.location}`
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | PROXLIVE`,
      description,
      images: [camera.image]
    }
  };
}

export default async function CameraPage({ params }: CameraPageProps) {
  const { slug } = await params;
  const camera = getCameraBySlug(slug);

  if (!camera) {
    notFound();
  }

  return (
    <>
      {isLive(camera) ? <JsonLd data={liveCameraSchema(camera)} /> : null}
      <JsonLd data={breadcrumbSchema(camera)} />
      <Navbar />
      <CameraDetail
        camera={camera}
        cameras={cameras}
        horizontalAd={cameraDetailHorizontalAd}
        sideAds={cameraDetailSideAds}
      />
      <Footer />
    </>
  );
}
