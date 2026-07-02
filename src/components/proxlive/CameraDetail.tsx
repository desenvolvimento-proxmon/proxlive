import Link from "next/link";
import { FileText, Map, MapPin } from "lucide-react";
import type {
  Camera,
  HorizontalAd as HorizontalAdData,
  SideAd as SideAdData
} from "@/lib/proxlive-data";
import { AvailableCamerasList } from "./AvailableCamerasList";
import { HorizontalAd } from "./HorizontalAd";
import { CameraPlayer } from "./CameraPlayer";
import { ShareButton } from "./ShareButton";
import { SideAd } from "./SideAd";

type CameraDetailProps = {
  camera: Camera;
  cameras: Camera[];
  horizontalAd: HorizontalAdData;
  sideAd: SideAdData;
};

export function CameraDetail({
  camera,
  cameras,
  horizontalAd,
  sideAd
}: CameraDetailProps) {
  return (
    <main>
      <section className="proxlive-container grid gap-7 py-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:py-10">
        <div className="min-w-0">
          <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-neutral-100 shadow-sm">
            <CameraPlayer camera={camera} />
          </div>

          <div className="mt-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-2xl font-black text-neutral-950">
                {camera.name}
              </h1>
              <p className="mt-2 flex items-center gap-2 text-sm font-medium text-neutral-700">
                <MapPin className="h-4 w-4 text-proxlive-blue" />
                {camera.location}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/?camera=${camera.slug}#mapa-cameras`}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-proxlive-blue px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                <Map className="h-4 w-4" />
                Ver no mapa
              </Link>
              <ShareButton title={`Câmera ${camera.name}`} />
            </div>
          </div>

          <section className="mt-10">
            <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-neutral-900">
              <FileText className="h-4 w-4 text-proxlive-blue" />
              Descrição
            </p>
            <p className="max-w-none whitespace-pre-line break-words text-sm leading-relaxed text-neutral-800">
              {camera.description}
            </p>
          </section>
        </div>

        <div className="space-y-7">
          <AvailableCamerasList cameras={cameras} currentSlug={camera.slug} />
          <SideAd ad={sideAd} />
        </div>
      </section>

      <section className="proxlive-container pb-12 pt-6">
        <HorizontalAd ad={horizontalAd} />
      </section>
    </main>
  );
}
