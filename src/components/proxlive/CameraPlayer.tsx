"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Loader2,
  Maximize,
  Minimize,
  RotateCw,
  Volume2,
  VolumeX
} from "lucide-react";
import type { Camera } from "@/lib/proxlive-data";
import { track } from "@/lib/analytics";
import { isHlsUrl } from "./hls-client";
import { useHlsPlayer } from "./useHlsPlayer";

type CameraPlayerProps = {
  camera: Camera;
  /** Vídeo em destaque na Home usa cantos arredondados próprios. */
  className?: string;
};

export function CameraPlayer({ camera, className = "" }: CameraPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [muted, setMuted] = useState(true);
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
    const handleChange = () =>
      setIsFullscreen(Boolean(document.fullscreenElement));

    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const next = !video.muted;
    video.muted = next;
    setMuted(next);

    if (!next) {
      // Alguns navegadores só liberam o áudio depois de um gesto do usuário.
      void video.play().catch(() => undefined);
      track("camera_unmute", { camera: camera.slug });
    }
  }, [camera.slug, videoRef]);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
      return;
    }

    void container.requestFullscreen?.().catch(() => undefined);
    track("camera_fullscreen", { camera: camera.slug });
  }, [camera.slug]);

  // Sem transmissão configurada: mostra a foto do ponto.
  if (!streamUrl) {
    return (
      <div
        className={`relative h-full w-full overflow-hidden bg-ink-950 ${className}`}
      >
        <Image
          src={camera.image}
          alt={`Imagem da câmera ${camera.name}`}
          fill
          priority
          sizes="(min-width: 1024px) 70vw, 100vw"
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink-950/55 p-6 text-center">
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/90 backdrop-blur">
            Em breve
          </span>
          <p className="max-w-sm text-sm text-white/75">
            Esta câmera ainda está sendo instalada e entra no ar em breve.
          </p>
        </div>
      </div>
    );
  }

  // Fonte que não é HLS (player de terceiro) continua embutida via iframe.
  if (!isHlsUrl(streamUrl)) {
    return (
      <div className={`relative h-full w-full bg-ink-950 ${className}`}>
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
  const controlClass =
    "proxlive-focus-dark inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-ink-950/50 text-white backdrop-blur-md transition-[background-color,border-color,transform] duration-200 ease-out-quint hover:scale-105 hover:border-white/30 hover:bg-ink-950/75";

  return (
    <div
      ref={containerRef}
      className={`group relative h-full w-full overflow-hidden bg-ink-950 ${className}`}
    >
      <video
        ref={videoRef}
        className="h-full w-full bg-ink-950 object-contain"
        muted
        playsInline
        autoPlay
        poster={camera.image}
      />

      {/* Selo de status, canto superior esquerdo. */}
      <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2">
        {status === "playing" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-proxlive-live px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg">
            <span className="h-1.5 w-1.5 animate-live-pulse rounded-full bg-white" />
            Ao vivo
          </span>
        ) : null}
        {status === "reconnecting" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg">
            <RotateCw className="h-3 w-3 animate-spin" />
            Reconectando
          </span>
        ) : null}
      </div>

      {/* Barra de controles: aparece no hover e sempre no toque. */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-2 bg-gradient-to-t from-ink-950/85 via-ink-950/40 to-transparent p-4 opacity-100 transition-opacity duration-200 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
        <button
          type="button"
          onClick={toggleMute}
          className={controlClass}
          aria-label={muted ? "Ativar som" : "Desativar som"}
        >
          {muted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </button>
        <button
          type="button"
          onClick={toggleFullscreen}
          className={controlClass}
          aria-label={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
        >
          {isFullscreen ? (
            <Minimize className="h-4 w-4" />
          ) : (
            <Maximize className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Convite para ligar o som — o autoplay obriga a começar mudo. */}
      {muted && status === "playing" ? (
        <button
          type="button"
          onClick={toggleMute}
          className="proxlive-focus-dark animate-fade-in absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-2 text-xs font-semibold text-ink-900 shadow-e3 backdrop-blur transition-[background-color,transform] duration-200 ease-out-quint hover:-translate-y-0.5 hover:bg-white"
        >
          <VolumeX className="h-3.5 w-3.5" />
          Ativar som
        </button>
      ) : null}

      {showSpinner ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink-950/40 backdrop-blur-[2px]">
          <Loader2 className="h-7 w-7 animate-spin text-white/70" />
        </div>
      ) : null}

      {status === "error" ? (
        <div className="animate-fade-in absolute inset-0 flex flex-col items-center justify-center gap-4 bg-ink-950/88 p-6 text-center backdrop-blur-sm">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-amber-400/10 ring-1 ring-amber-400/30">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">
              Transmissão fora do ar
            </p>
            <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-white/60">
              Perdemos o sinal desta câmera. Tentamos reconectar várias vezes
              sem sucesso — normalmente volta sozinho em alguns minutos.
            </p>
          </div>
          <button
            type="button"
            onClick={retry}
            className="btn btn-sm btn-on-dark-solid"
          >
            <RotateCw className="h-3.5 w-3.5" />
            Tentar de novo
          </button>
        </div>
      ) : null}
    </div>
  );
}
