"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Loader2, Maximize, Minimize, RotateCw } from "lucide-react";
import type { Camera } from "@/lib/proxlive-data";
import { track } from "@/lib/analytics";
import { isHlsUrl } from "./hls-client";
import { useHlsPlayer } from "./useHlsPlayer";

type CameraPlayerProps = {
  camera: Camera;
  className?: string;
};

/** O iPhone nao implementa a Fullscreen API; o video tem metodo proprio. */
type VideoComFullscreenDaApple = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void;
};

export function CameraPlayer({ camera, className = "" }: CameraPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const streamUrl = camera.streamUrl?.trim();

  const { videoRef, status, retry } = useHlsPlayer({
    streamUrl,
    onPlaying: () => track("camera_play", { camera: camera.slug }),
    onError: () => track("camera_error", { camera: camera.slug }),
    onReconnect: (attempt) =>
      track("camera_reconnect", { camera: camera.slug, attempt })
  });

  useEffect(() => {
    const handleChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    const video = videoRef.current as VideoComFullscreenDaApple | null;

    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
      return;
    }

    track("camera_fullscreen", { camera: camera.slug });

    // No iPhone, `requestFullscreen` nao existe em elemento nenhum: so o
    // proprio video entra em tela cheia, pelo metodo da Apple. Sem este
    // caminho, o botao nao fazia nada no celular.
    if (container?.requestFullscreen) {
      void container.requestFullscreen().catch(() => {
        video?.webkitEnterFullscreen?.();
      });
      return;
    }

    video?.webkitEnterFullscreen?.();
  }, [camera.slug, videoRef]);

  if (!streamUrl) {
    return (
      <div className={`relative h-full w-full overflow-hidden bg-carbon-950 ${className}`}>
        <Image
          src={camera.image}
          alt={`Imagem da câmera ${camera.name}`}
          fill
          priority
          sizes="(min-width: 1024px) 70vw, 100vw"
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-carbon-950/55 p-6 text-center">
          <span className="eyebrow text-carbon-300">Em breve</span>
          <p className="max-w-sm text-sm text-carbon-400">
            Esta câmera ainda está sendo instalada.
          </p>
        </div>
      </div>
    );
  }

  if (!isHlsUrl(streamUrl)) {
    return (
      <div className={`relative h-full w-full bg-carbon-950 ${className}`}>
        <iframe
          src={streamUrl}
          title={`Transmissão da câmera ${camera.name}`}
          className="h-full w-full"
          allowFullScreen
        />
      </div>
    );
  }

  const showSpinner = status === "loading" || status === "idle";

  return (
    <div
      ref={containerRef}
      className={`group relative h-full w-full overflow-hidden bg-carbon-950 ${className}`}
    >
      <video
        ref={videoRef}
        className="h-full w-full bg-carbon-950 object-contain"
        muted
        playsInline
        autoPlay
        poster={camera.image}
      />

      {status === "reconnecting" ? (
        <span className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-300 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
          <RotateCw className="h-3 w-3 animate-spin" />
          Reconectando
        </span>
      ) : null}

      {/* Botao de tela cheia: no toque fica sempre visivel, porque nao existe
          hover para revelar. */}
      <button
        type="button"
        onClick={toggleFullscreen}
        aria-label={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
        className="focus-ring absolute bottom-4 right-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-carbon-950/55 text-white backdrop-blur-md transition-[background-color,border-color,opacity,transform] duration-300 ease-out-quint hover:scale-105 hover:border-white/35 hover:bg-carbon-950/80 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100"
      >
        {isFullscreen ? (
          <Minimize className="h-4 w-4" />
        ) : (
          <Maximize className="h-4 w-4" />
        )}
      </button>

      {showSpinner ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-carbon-950/40 backdrop-blur-[2px]">
          <Loader2 className="h-7 w-7 animate-spin text-white/70" />
        </div>
      ) : null}

      {status === "error" ? (
        <div className="animate-fade-in absolute inset-0 flex flex-col items-center justify-center gap-4 bg-carbon-950/88 p-6 text-center backdrop-blur-sm">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-amber-400/10 ring-1 ring-amber-400/30">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">
              Transmissão fora do ar
            </p>
            <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-carbon-400">
              Perdemos o sinal desta câmera. Tentamos reconectar várias vezes
              sem sucesso — normalmente volta sozinho em alguns minutos.
            </p>
          </div>
          <button type="button" onClick={retry} className="btn btn-sm btn-solid">
            <RotateCw className="h-3.5 w-3.5" />
            Tentar de novo
          </button>
        </div>
      ) : null}
    </div>
  );
}
