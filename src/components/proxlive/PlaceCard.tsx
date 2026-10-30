"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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

/**
 * Card vertical do lugar.
 *
 * O formato alto dá a cada lugar a presenca de um poster, e o `tint` proprio
 * faz um card nao parecer o outro — sem introduzir cor forte, que quebraria a
 * paleta do site.
 */
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
      className="focus-ring group block h-full rounded-3xl"
    >
      <article className="relative flex h-full min-h-[26rem] flex-col justify-end overflow-hidden rounded-3xl bg-carbon-900 shadow-hair transition-[box-shadow,transform] duration-500 ease-out-quint group-hover:-translate-y-1 group-hover:shadow-hair-strong sm:min-h-[30rem]">
        <Image
          src={place.cover}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover opacity-60 transition-[transform,opacity] duration-[1200ms] ease-out-expo group-hover:scale-[1.05] group-hover:opacity-75"
        />
        {hero ? (
          <video
            ref={videoRef}
            muted
            playsInline
            autoPlay
            aria-hidden="true"
            tabIndex={-1}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              playing ? "opacity-70" : "opacity-0"
            }`}
          />
        ) : null}

        {/* Tom do lugar, bem rebaixado: identidade sem virar cor de marca. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 transition-opacity duration-700 group-hover:opacity-80"
          style={{
            background: `radial-gradient(120% 90% at 50% 100%, ${place.tint}26, transparent 62%)`
          }}
        />
        <div aria-hidden="true" className="scrim-bottom absolute inset-0" />

        <span
          aria-hidden="true"
          className="ghost-type absolute left-4 top-6 text-[clamp(2.75rem,7vw,4.5rem)]"
        >
          {place.shortName}
        </span>

        <div className="relative p-7">
          {!live ? (
            <span className="eyebrow block text-carbon-400">Em breve</span>
          ) : null}
          <h3
            className={`text-title font-display text-white ${live ? "" : "mt-3"}`}
          >
            {place.name}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-carbon-300">
            {place.tagline}
          </p>
          <span className="mt-5 block h-px w-10 origin-left bg-white/30 transition-transform duration-500 ease-out-quint group-hover:scale-x-[2.6]" />
        </div>
      </article>
    </Link>
  );
}
