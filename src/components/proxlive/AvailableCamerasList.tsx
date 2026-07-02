import Image from "next/image";
import Link from "next/link";
import { MapPin, Video } from "lucide-react";
import type { Camera } from "@/lib/proxlive-data";

type AvailableCamerasListProps = {
  cameras: Camera[];
  currentSlug: string;
};

export function AvailableCamerasList({
  cameras,
  currentSlug
}: AvailableCamerasListProps) {
  return (
    <aside className="rounded-none bg-neutral-50 p-5 sm:p-6">
      <div className="mb-6 flex items-center gap-2">
        <Video className="h-4 w-4 text-proxlive-blue" />
        <h2 className="text-sm font-semibold text-neutral-900">
          Câmeras disponíveis
        </h2>
      </div>

      <div className="space-y-5">
        {cameras.map((camera) => {
          const isCurrent = camera.slug === currentSlug;

          return (
            <Link
              key={camera.id}
              href={`/camera/${camera.slug}`}
              className={`grid grid-cols-[120px_1fr] gap-4 rounded-lg p-2 transition hover:bg-white hover:shadow-sm ${
                isCurrent ? "bg-white shadow-sm" : ""
              }`}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <Image
                  src={camera.image}
                  alt={`Miniatura da camera ${camera.name}`}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 py-1">
                <h3 className="truncate text-lg font-bold text-neutral-950">
                  {camera.name}
                </h3>
                <p className="mt-2 flex gap-1.5 text-xs font-medium text-neutral-600">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-proxlive-blue" />
                  <span className="line-clamp-2">{camera.location}</span>
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
