"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { Camera } from "@/lib/proxlive-data";
import { PREVIEW_HLS_SETTINGS } from "./hls-client";
import { useHlsPlayer } from "./useHlsPlayer";
import { ComingSoonBadge, LiveBadge } from "./LiveBadge";

type CameraCardProps = {
  camera: Camera;
  priority?: boolean;
};

/** Evita abrir stream quando o mouse só passa por cima do card. */
const HOVER_DELAY = 260;

export function CameraCard({ camera, priority = false }: CameraCardProps) {
  const [previewing, setPreviewing] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);
  const streamUrl = camera.streamUrl?.trim();
  const live = Boolean(streamUrl);

  const { videoRef, status } = useHlsPlayer({
    streamUrl,
    enabled: previewing,
    settings: PREVIEW_HLS_SETTINGS
  });

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  function startPreview() {
    if (!live) {
      return;
    }
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setPreviewing(true), HOVER_DELAY);
  }

  function stopPreview() {
    window.clearTimeout(timerRef.current);
    setPreviewing(false);
  }

  const showingPreview = previewing && status === "playing";

  return (
    <Link
      href={`/camera/${camera.slug}`}
      onMouseEnter={startPreview}
      onMouseLeave={stopPreview}
      onFocus={startPreview}
      onBlur={stopPreview}
      className="proxlive-focus group block h-full rounded-2xl"
    >
      {/* h-full + flex: todos os cards da linha terminam na mesma altura,
          mesmo quando o nome ou o endereço quebram em duas linhas. */}
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-e1 transition-[transform,box-shadow,border-color] duration-300 ease-out-quint group-hover:-translate-y-1 group-hover:border-ink-200 group-hover:shadow-e3">
        <div className="relative aspect-[4/3] shrink-0 overflow-hidden rounded-t-2xl bg-ink-900">
          <Image
            src={camera.image}
            alt={`Câmera ${camera.name}`}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className={`object-cover transition-transform duration-[900ms] ease-out-expo ${
              live ? "group-hover:scale-[1.06]" : "opacity-65 saturate-[0.6]"
            }`}
          />

          {/* Preview ao vivo por cima da miniatura, só enquanto o mouse está no card. */}
          {live ? (
            <video
              ref={videoRef}
              muted
              playsInline
              autoPlay
              aria-hidden="true"
              tabIndex={-1}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out-expo ${
                showingPreview ? "opacity-100" : "opacity-0"
              }`}
            />
          ) : null}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(10,17,32,0.62)_0%,rgba(10,17,32,0.12)_38%,transparent_65%)] opacity-70 transition-opacity duration-300 group-hover:opacity-100"
          />

          <div className="absolute left-3 top-3 z-10">
            {live ? <LiveBadge variant="soft" /> : <ComingSoonBadge />}
          </div>

          {/* Afordância discreta: sobe da base no hover, no lugar do
              antigo botão de play de 56px no centro da miniatura. */}
          {live ? (
            <div className="pointer-events-none absolute inset-x-3 bottom-3 z-10 flex justify-end">
              <span className="inline-flex translate-y-1.5 items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-ink-900 opacity-0 shadow-e2 backdrop-blur transition-[opacity,transform] duration-300 ease-out-quint group-hover:translate-y-0 group-hover:opacity-100">
                Assistir
                <ArrowUpRight className="h-3.5 w-3.5 text-brand-500" />
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col px-4 py-4">
          {/* Duas linhas reservadas: o endereço começa na mesma altura em todos. */}
          <h3 className="line-clamp-2 min-h-[2.5rem] text-[0.9375rem] font-semibold leading-tight tracking-[-0.012em] text-ink-900 transition-colors duration-200 group-hover:text-brand-600">
            {camera.name}
          </h3>
          <p className="mt-1.5 flex items-start gap-1.5 text-xs leading-relaxed text-ink-500">
            <MapPin className="mt-[3px] h-3.5 w-3.5 shrink-0 text-ink-400" />
            <span className="line-clamp-2">{camera.location}</span>
          </p>
        </div>
      </article>
    </Link>
  );
}
