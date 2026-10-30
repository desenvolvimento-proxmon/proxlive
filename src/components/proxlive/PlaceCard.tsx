"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Camera, Place } from "@/lib/proxlive-data";
import { PREVIEW_HLS_SETTINGS } from "./hls-client";
import { useHlsPlayer } from "./useHlsPlayer";

type PlaceCardProps = {
  place: Place;
  /** Ausente quando o lugar ainda não tem câmera no ar. */
  hero?: Camera;
  cameraCount: number;
};

const HOVER_DELAY = 240;

export function PlaceCard({ place, hero, cameraCount }: PlaceCardProps) {
  const [previewing, setPreviewing] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const { videoRef, status } = useHlsPlayer({
    streamUrl: hero?.streamUrl,
    enabled: previewing,
    settings: PREVIEW_HLS_SETTINGS
  });

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function start() {
    if (!hero) {
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
  const live = cameraCount > 0;

  return (
    <Link
      href={`/lugar/${place.slug}`}
      onMouseEnter={start}
      onMouseLeave={stop}
      onFocus={start}
      onBlur={stop}
      className="focus-ring group relative block overflow-hidden rounded-3xl bg-carbon-900 shadow-hair"
    >
      <div className="relative aspect-[16/10] sm:aspect-[21/9]">
        {hero ? (
          <>
            <Image
              src={hero.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 1280px, 100vw"
              className="object-cover transition-transform duration-[1200ms] ease-out-expo group-hover:scale-[1.04]"
            />
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
            <div aria-hidden="true" className="scrim-bottom absolute inset-0" />
          </>
        ) : (
          /* Lugar anunciado e ainda sem sinal: tipografia, nunca uma foto
             emprestada de outro lugar. */
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(120%_120%_at_20%_0%,rgba(0,114,255,0.12),transparent_60%)]"
          />
        )}

        <span
          aria-hidden="true"
          className={`absolute -bottom-[0.12em] left-5 text-[clamp(3.5rem,11vw,9rem)] ${
            hero ? "ghost-type-fill" : "ghost-type"
          }`}
        >
          {place.shortName}
        </span>

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-6 sm:p-9">
          <div className="min-w-0">
            <span className="eyebrow flex items-center gap-2 text-white/70">
              {live ? (
                <>
                  <span className="h-1.5 w-1.5 animate-live-pulse rounded-full bg-live" />
                  {cameraCount} {cameraCount === 1 ? "câmera" : "câmeras"} ao vivo
                </>
              ) : (
                "Em breve"
              )}
            </span>
            <h3 className="mt-3 text-title text-white">{place.name}</h3>
            <p className="mt-2 text-sm text-carbon-300">{place.tagline}</p>
          </div>

          <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/25 text-white transition-[background-color,color,transform] duration-500 ease-out-quint group-hover:scale-105 group-hover:bg-white group-hover:text-carbon-950 sm:inline-flex">
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
