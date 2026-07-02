import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CameraDetail } from "@/components/proxlive/CameraDetail";
import { Footer } from "@/components/proxlive/Footer";
import { Navbar } from "@/components/proxlive/Navbar";
import {
  cameras,
  cameraDetailHorizontalAd,
  cameraDetailSideAd,
  getCameraBySlug,
} from "@/lib/proxlive-data";

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
      title: "Câmera não encontrada | PROXLIVE"
    };
  }

  return {
    title: `${camera.name} | PROXLIVE`,
    description: camera.description
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
      <Navbar />
      <CameraDetail
        camera={camera}
        cameras={cameras}
        horizontalAd={cameraDetailHorizontalAd}
        sideAd={cameraDetailSideAd}
      />
      <Footer variant="blue" />
    </>
  );
}
