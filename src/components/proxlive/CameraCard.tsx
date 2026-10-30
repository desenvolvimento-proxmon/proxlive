"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { Camera } from "@/lib/proxlive-data";
import { PREVIEW_HLS_SETTINGS } from "./hls-client";
import { useHlsPlayer } from "./useHlsPlayer";

type CameraCardProps = {
  camera: Camera;
  priority?: boolean;
};

/** Evita abrir stream quando o mouse so passa por cima do card. */
const HOVER_DELAY = 260;

export function CameraCard({ camera, priority = false }: CameraCardProps) {
  const [previewing, setPreviewing] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const live = Boolean(camera.streamUrl?.trim());

  const { videoRef, status } = useHlsPlayer({
    streamUrl: camera.streamUrl,
    enabled: previewing,
    settings: PREVIEW_HLS_SETTINGS
  });

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function start() {
    if (!live) {
      return;
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setPreviewing(true), HOVER_DELAY);
  }

  function stop() {
    window.clearTimeout(timer.current);
    setPreviewing(false);
  }

  const playing = previewing && status === "playing";

  return (
    <Link
      href={`/camera/${camera.slug}`}
      onMouseEnter={start}
      onMouseLeave={stop}
      onFocus={start}
      onBlur={stop}
      className="focus-ring group block h-full rounded-2xl"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-carbon-900 shadow-hair transition-[background-color,box-shadow,transform] duration-500 ease-out-quint group-hover:-translate-y-1 group-hover:bg-carbon-850 group-hover:shadow-hair-strong">
        <div className="relative aspect-video shrink-0 overflow-hidden bg-carbon-800">
          <Image
            src={camera.image}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 768px) 50vw, 100vw"
            className={`object-cover transition-transform duration-[1100ms] ease-out-expo ${
              live ? "group-hover:scale-[1.05]" : "opacity-50 saturate-0"
            }`}
          />

          {live ? (
            <video
              ref={videoRef}
              muted
              playsInline
              autoPlay
              aria-hidden="true"
              tabIndex={-1}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                playing ? "opacity-100" : "opacity-0"
              }`}
            />
          ) : null}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-carbon-950/75 via-transparent to-carbon-950/30"
          />

          {/*
            Sem pilula escura: o selo vive direto sobre a imagem. A legibilidade
            vem do degrade acima e de uma sombra de contorno, nao de um fundo —
            assim o card mostra mais da cena.
          */}
          <span className="absolute left-4 top-4">
            {live ? (
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white [text-shadow:0_0_4px_rgba(0,0,0,0.95),0_1px_2px_rgba(0,0,0,1),0_-1px_2px_rgba(0,0,0,0.75)]">
                <span className="h-[7px] w-[7px] animate-live-pulse rounded-full bg-live shadow-[0_0_7px_rgba(255,59,48,0.95)]" />
                Ao vivo
              </span>
            ) : (
              <span className="inline-flex items-center text-[11px] font-semibold uppercase tracking-[0.12em] text-carbon-200 [text-shadow:0_0_4px_rgba(0,0,0,0.95),0_1px_2px_rgba(0,0,0,1)]">
                Em breve
              </span>
            )}
          </span>
        </div>

        <div className="flex flex-1 items-start justify-between gap-4 p-5">
          <div className="min-w-0">
            <h3 className="font-display text-[0.9375rem] font-semibold leading-tight tracking-[-0.015em] text-white">
              {camera.name}
            </h3>
            <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-carbon-400">
              <MapPin className="mt-[3px] h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-2">{camera.location}</span>
            </p>
          </div>
          <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-carbon-500 transition-[color,transform] duration-500 ease-out-quint group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
        </div>
      </article>
    </Link>
  );
}
