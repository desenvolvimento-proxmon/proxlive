"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Radio } from "lucide-react";
import type { Camera } from "@/lib/proxlive-data";
import { isHlsUrl, loadHls, type HlsInstance } from "./hls-client";

type CameraPlayerProps = {
  camera: Camera;
};

export function CameraPlayer({ camera }: CameraPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [failed, setFailed] = useState(false);
  const streamUrl = camera.streamUrl?.trim();

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !streamUrl || !isHlsUrl(streamUrl)) {
      return;
    }

    let hls: HlsInstance | null = null;
    let cancelled = false;

    setFailed(false);

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.onerror = () => setFailed(true);
      return;
    }

    loadHls()
      .then((Hls) => {
        if (cancelled || !Hls.isSupported()) {
          setFailed(true);
          return;
        }

        hls = new Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_eventName, data) => {
          if (data.fatal) {
            setFailed(true);
          }
        });
      })
      .catch(() => setFailed(true));

    return () => {
      cancelled = true;
      if (hls) {
        hls.destroy();
      }
    };
  }, [streamUrl]);

  let content: React.ReactNode;

  if (!streamUrl) {
    content = (
      <Image
        src={camera.image}
        alt={`Imagem da camera ${camera.name}`}
        fill
        priority
        sizes="(min-width: 1024px) 70vw, 100vw"
        className="object-cover"
      />
    );
  } else if (!isHlsUrl(streamUrl)) {
    content = (
      <iframe
        src={streamUrl}
        title={`Transmissao da camera ${camera.name}`}
        className="h-full w-full"
        allowFullScreen
      />
    );
  } else {
    content = (
      <>
        <video
          ref={videoRef}
          className="h-full w-full bg-black object-contain"
          controls
          crossOrigin="anonymous"
          muted
          playsInline
          autoPlay
          poster={camera.image}
          onError={() => setFailed(true)}
        />
        {failed ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 p-6 text-center text-white">
            <Radio className="h-7 w-7 text-proxlive-blue" />
            <p className="max-w-md text-sm font-medium">
              Nao foi possivel carregar esta transmissao HLS. O link pode estar
              expirado ou bloqueado por CORS, token ou referer.
            </p>
            <a
              href={streamUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-neutral-950"
            >
              Abrir link direto
            </a>
          </div>
        ) : null}
      </>
    );
  }

  return <div className="relative h-full w-full bg-black">{content}</div>;
}
