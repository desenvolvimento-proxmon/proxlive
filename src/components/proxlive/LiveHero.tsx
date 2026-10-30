"use client";

import Image from "next/image";
import { useState } from "react";
import type { Camera } from "@/lib/proxlive-data";
import { PREVIEW_HLS_SETTINGS } from "./hls-client";
import { useHlsPlayer } from "./useHlsPlayer";

type LiveHeroProps = {
  camera: Camera;
  /** Palavra gigante e quase invisivel no fundo, como o "DC" da referencia. */
  ghost: string;
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  children?: React.ReactNode;
  /** Altura menor para o hub; a home usa o padrao, quase tela cheia. */
  compact?: boolean;
};

/**
 * Imagem heroica do site: a propria transmissao ao vivo, em tela cheia.
 *
 * Enquanto o video nao decodifica o primeiro quadro, a miniatura segura o
 * lugar — sem isso o topo da pagina pisca preto no carregamento.
 */
export function LiveHero({
  camera,
  ghost,
  eyebrow,
  title,
  subtitle,
  children,
  compact = false
}: LiveHeroProps) {
  const [showPoster, setShowPoster] = useState(true);

  const { videoRef, status } = useHlsPlayer({
    streamUrl: camera.streamUrl,
    settings: PREVIEW_HLS_SETTINGS,
    onPlaying: () => setShowPoster(false)
  });

  const live = status === "playing";

  return (
    <section
      className={`relative isolate flex items-end overflow-hidden ${
        compact ? "min-h-[72vh] sm:min-h-[76vh]" : "min-h-[92vh]"
      }`}
    >
      <div className="absolute inset-0 -z-20">
        <Image
          src={camera.image}
          alt=""
          fill
          priority
          sizes="100vw"
          className={`animate-ken-burns object-cover transition-opacity duration-1000 ${
            showPoster ? "opacity-100" : "opacity-0"
          }`}
        />
        <video
          ref={videoRef}
          muted
          playsInline
          autoPlay
          aria-hidden="true"
          tabIndex={-1}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            showPoster ? "opacity-0" : "opacity-100"
          }`}
        />
      </div>

      {/* Dois scrims cruzados: um da base, outro da esquerda, para o texto
          ter contraste sem escurecer a imagem toda. */}
      <div aria-hidden="true" className="scrim-bottom absolute inset-0 -z-10" />
      <div aria-hidden="true" className="scrim-left absolute inset-0 -z-10" />

      <span
        aria-hidden="true"
        className="ghost-type absolute -bottom-[0.14em] left-0 -z-10 w-full text-[clamp(5rem,20vw,19rem)]"
      >
        {ghost}
      </span>

      <div className="shell relative w-full pb-16 pt-32 sm:pb-20">
        <div className="max-w-3xl">
          {eyebrow ? (
            <span className="eyebrow flex items-center gap-2.5 text-white/70">
              {live ? (
                <span className="h-1.5 w-1.5 animate-live-pulse rounded-full bg-live" />
              ) : null}
              {eyebrow}
            </span>
          ) : null}

          <h1 className="mt-5 text-hero text-balance font-display text-white">{title}</h1>

          {subtitle ? (
            <p className="mt-6 max-w-xl text-lead text-carbon-200">{subtitle}</p>
          ) : null}

          {children ? <div className="mt-9">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}
