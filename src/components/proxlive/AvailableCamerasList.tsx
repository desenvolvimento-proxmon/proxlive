import Image from "next/image";
import Link from "next/link";
import type { Camera } from "@/lib/proxlive-data";
import { ComingSoonBadge, LiveBadge } from "./LiveBadge";

type AvailableCamerasListProps = {
  cameras: Camera[];
  currentSlug: string;
};

/**
 * Lista das demais cameras. Fica na faixa escura da pagina de detalhe, ao lado
 * do video, entao e estilizada para superficie escura — sem moldura de card,
 * para ler como parte do painel.
 */
export function AvailableCamerasList({
  cameras,
  currentSlug
}: AvailableCamerasListProps) {
  const ordered = cameras
    // O titulo e "Outras cameras": a que esta sendo assistida fica de fora.
    .filter((camera) => camera.slug !== currentSlug)
    // Quem ja esta no ar aparece primeiro.
    .sort((a, b) => {
      const aLive = a.streamUrl?.trim() ? 0 : 1;
      const bLive = b.streamUrl?.trim() ? 0 : 1;
      return aLive - bLive;
    });

  if (ordered.length === 0) {
    return null;
  }

  return (
    <aside>
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
        Outras câmeras
      </h2>

      <div className="space-y-1">
        {ordered.map((camera) => {
          const live = Boolean(camera.streamUrl?.trim());

          return (
            <Link
              key={camera.id}
              href={`/camera/${camera.slug}`}
              className="proxlive-focus-dark group grid grid-cols-[84px_1fr] items-center gap-3 rounded-xl border border-transparent p-1.5 transition-colors duration-200 hover:border-white/15 hover:bg-white/[0.06]"
            >
              <div className="relative aspect-video overflow-hidden rounded-lg bg-ink-900">
                <Image
                  src={camera.image}
                  alt=""
                  fill
                  sizes="84px"
                  className={`object-cover transition-transform duration-500 ease-out-expo ${
                    live ? "group-hover:scale-105" : "opacity-55 saturate-[0.6]"
                  }`}
                />
                <span className="absolute left-1 top-1 origin-top-left scale-90">
                  {live ? <LiveBadge variant="soft" /> : <ComingSoonBadge />}
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-[13px] font-semibold leading-tight text-white transition-colors group-hover:text-brand-300">
                  {camera.name}
                </h3>
                <p className="mt-0.5 truncate text-[11px] leading-snug text-white/60">
                  {camera.city}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
