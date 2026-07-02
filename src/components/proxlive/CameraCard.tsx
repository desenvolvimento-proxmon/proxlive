import Image from "next/image";
import Link from "next/link";
import { MapPin, Play } from "lucide-react";
import type { Camera } from "@/lib/proxlive-data";
import { LiveBadge } from "./LiveBadge";

type CameraCardProps = {
  camera: Camera;
};

export function CameraCard({ camera }: CameraCardProps) {
  return (
    <Link
      href={`/camera/${camera.slug}`}
      className="group block rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100"
    >
      <article className="overflow-hidden rounded-lg bg-white shadow-sm transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-soft">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
          <Image
            src={camera.image}
            alt={`Camera ${camera.name}`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3">
            {camera.streamUrl ? (
              <LiveBadge />
            ) : (
              <span className="inline-flex rounded-full bg-neutral-950/75 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                Indisponivel
              </span>
            )}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/50 bg-white/65 text-proxlive-blue shadow-lg backdrop-blur-md transition duration-300 group-hover:scale-110 group-hover:bg-white/85">
              <Play className="ml-0.5 h-6 w-6 fill-current" />
            </span>
          </div>
        </div>

        <div className="px-1 py-4">
          <h3 className="text-lg font-bold leading-tight text-neutral-950">
            {camera.name}
          </h3>
          <p className="mt-2 flex items-start gap-1.5 text-xs font-medium text-neutral-600">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-proxlive-blue" />
            <span>{camera.location}</span>
          </p>
        </div>
      </article>
    </Link>
  );
}
