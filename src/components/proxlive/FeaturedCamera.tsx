"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, MapPin, Radio } from "lucide-react";
import type { Camera } from "@/lib/proxlive-data";
import { track } from "@/lib/analytics";
import { CameraPlayer } from "./CameraPlayer";
import { LiveBadge } from "./LiveBadge";

type FeaturedCameraProps = {
  cameras: Camera[];
};

/**
 * Primeira tela da Home. Antes o topo era banner institucional e as cameras
 * ficavam abaixo da dobra — quem chegava buscando "transito ao vivo" nao via
 * camera nenhuma. Agora a transmissao comeca a tocar de cara.
 */
export function FeaturedCamera({ cameras }: FeaturedCameraProps) {
  const liveCameras = cameras.filter((camera) => camera.streamUrl?.trim());
  const [activeSlug, setActiveSlug] = useState(liveCameras[0]?.slug ?? "");
  const active =
    liveCameras.find((camera) => camera.slug === activeSlug) ?? liveCameras[0];

  if (!active) {
    return null;
  }

  return (
    <section
      className="relative overflow-hidden bg-ink-950 text-white"
      aria-label="Câmera ao vivo em destaque"
    >
      {/* Brilho azul difuso, dá profundidade sem pesar. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-10%,rgba(0,114,255,0.28),transparent_55%),radial-gradient(circle_at_85%_110%,rgba(0,114,255,0.16),transparent_50%)]"
      />

      <div className="proxlive-container relative py-8 lg:py-12">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white/80 backdrop-blur">
            <Radio className="h-3.5 w-3.5 text-proxlive-blue-soft" />
            Transmitindo agora
          </span>
          <span className="text-xs font-medium text-white/50">
            {liveCameras.length}{" "}
            {liveCameras.length === 1 ? "câmera no ar" : "câmeras no ar"}
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <div className="relative aspect-video overflow-hidden rounded-2xl shadow-glow ring-1 ring-white/10">
              <CameraPlayer camera={active} />
            </div>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <h1 className="text-2xl font-black leading-tight sm:text-3xl">
                  {active.name}
                </h1>
                <p className="mt-2 flex items-center gap-2 text-sm text-white/60">
                  <MapPin className="h-4 w-4 shrink-0 text-proxlive-blue-soft" />
                  <span className="truncate">{active.location}</span>
                </p>
              </div>

              <Link
                href={`/camera/${active.slug}`}
                onClick={() =>
                  track("camera_view", { camera: active.slug, from: "featured" })
                }
                className="proxlive-focus inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-proxlive-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Abrir página da câmera
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Trocar de câmera sem sair da página segura o visitante por mais tempo. */}
          <aside className="lg:max-h-[calc(100%-0px)]">
            <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">
              Outras câmeras
            </h2>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
              {liveCameras.map((camera) => {
                const isActive = camera.slug === active.slug;

                return (
                  <button
                    key={camera.id}
                    type="button"
                    onClick={() => {
                      setActiveSlug(camera.slug);
                      track("camera_view", {
                        camera: camera.slug,
                        from: "featured_switch"
                      });
                    }}
                    aria-pressed={isActive}
                    className={`proxlive-focus grid w-full grid-cols-[96px_1fr] items-center gap-3 rounded-xl border p-2 text-left transition ${
                      isActive
                        ? "border-proxlive-blue/60 bg-proxlive-blue/15"
                        : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.07]"
                    }`}
                  >
                    <div className="relative aspect-video overflow-hidden rounded-lg bg-ink-900">
                      <Image
                        src={camera.image}
                        alt=""
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                      {isActive ? (
                        <span className="absolute inset-0 flex items-center justify-center bg-ink-950/45">
                          <LiveBadge />
                        </span>
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {camera.name}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-white/50">
                        {camera.city}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
