"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  isHlsUrl,
  loadHls,
  supportsNativeHls,
  LIVE_HLS_SETTINGS,
  type HlsInstance,
  type HlsSettings
} from "./hls-client";

export type PlayerStatus =
  | "idle"
  | "loading"
  | "playing"
  | "reconnecting"
  | "error";

const BASE_RETRY_DELAY = 1200;
const MAX_RETRY_DELAY = 20000;
const MAX_RETRIES = 8;

function backoffDelay(attempt: number) {
  const exponential = BASE_RETRY_DELAY * 2 ** (attempt - 1);
  // O jitter evita que todos os players da pagina reconectem no mesmo instante.
  const jitter = Math.random() * 400;
  return Math.min(exponential, MAX_RETRY_DELAY) + jitter;
}

type UseHlsPlayerOptions = {
  streamUrl?: string;
  /** Permite ligar e desligar o player, usado no preview por hover. */
  enabled?: boolean;
  settings?: HlsSettings;
  onPlaying?: () => void;
  onError?: () => void;
  onReconnect?: (attempt: number) => void;
};

/**
 * Player HLS com reconexao automatica.
 *
 * Transmissao ao vivo cai o tempo todo: encoder reinicia, rede oscila, o CDN
 * derruba o segmento. Sem reconexao, qualquer soluco da fonte custa o
 * visitante. Aqui, erro fatal de rede volta com `startLoad`, erro de midia com
 * `recoverMediaError` e o resto reconstroi a instancia — sempre com backoff
 * exponencial. Quando a rede volta ou a aba reaparece, tenta na hora.
 */
export function useHlsPlayer({
  streamUrl,
  enabled = true,
  settings,
  onPlaying,
  onError,
  onReconnect
}: UseHlsPlayerOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [status, setStatus] = useState<PlayerStatus>("idle");
  const [rebuildToken, setRebuildToken] = useState(0);

  // Mantidos em ref para nao reiniciar o player a cada render do componente pai.
  const callbacksRef = useRef({ onPlaying, onError, onReconnect });
  const settingsRef = useRef(settings);

  // Declarado antes do efeito do player para que os valores ja estejam
  // atualizados quando ele rodar no mesmo commit.
  useEffect(() => {
    callbacksRef.current = { onPlaying, onError, onReconnect };
    settingsRef.current = settings;
  });

  const url = streamUrl?.trim();
  const isHls = Boolean(url && isHlsUrl(url));

  const retry = useCallback(() => {
    setStatus("loading");
    setRebuildToken((token) => token + 1);
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    if (!enabled || !video || !url || !isHls) {
      return;
    }

    let cancelled = false;
    let hls: HlsInstance | null = null;
    let retries = 0;
    let timer: number | undefined;
    const teardown: Array<() => void> = [];

    function scheduleRetry(action: () => void) {
      if (cancelled) {
        return;
      }

      retries += 1;

      if (retries > MAX_RETRIES) {
        setStatus("error");
        callbacksRef.current.onError?.();
        return;
      }

      setStatus("reconnecting");
      callbacksRef.current.onReconnect?.(retries);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (!cancelled) {
          action();
        }
      }, backoffDelay(retries));
    }

    function handlePlaying() {
      if (cancelled) {
        return;
      }
      retries = 0;
      setStatus("playing");
      callbacksRef.current.onPlaying?.();
    }

    function handleWaiting() {
      if (!cancelled) {
        setStatus((current) => (current === "playing" ? "loading" : current));
      }
    }

    video.addEventListener("playing", handlePlaying);
    video.addEventListener("waiting", handleWaiting);
    teardown.push(() => {
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("waiting", handleWaiting);
    });

    setStatus("loading");

    const startNative = () => {
      video.src = url;
      video.load();
      void video.play().catch(() => undefined);
    };

    const attachNativePlayer = () => {
      const handleNativeError = () => scheduleRetry(startNative);
      video.addEventListener("error", handleNativeError);
      teardown.push(() => video.removeEventListener("error", handleNativeError));
      startNative();
    };

    // Cuidado: no Chrome, `canPlayType("application/vnd.apple.mpegurl")`
    // devolve "maybe" — string truthy — mas o navegador nao toca HLS nativo.
    // Confiar nisso deixava o video parado em readyState 0. Como hls.js exige
    // MediaSource, a ausencia dela e o unico sinal confiavel de que so resta o
    // player nativo (iPhone). Fora isso, hls.js sempre: e ele que emite os
    // eventos de erro que alimentam a reconexao.
    if (!("MediaSource" in window) && supportsNativeHls(video)) {
      attachNativePlayer();
    } else {
      const build = () => {
        loadHls()
          .then((Hls) => {
            if (cancelled) {
              return;
            }

            if (!Hls.isSupported()) {
              if (supportsNativeHls(video)) {
                attachNativePlayer();
              } else {
                setStatus("error");
                callbacksRef.current.onError?.();
              }
              return;
            }

            hls?.destroy();

            const instance = new Hls(settingsRef.current ?? LIVE_HLS_SETTINGS);
            hls = instance;

            instance.attachMedia(video);
            instance.loadSource(url);

            instance.on(Hls.Events.ERROR, (_eventName, data) => {
              if (cancelled || !data.fatal) {
                return;
              }

              if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                scheduleRetry(() => instance.startLoad());
                return;
              }

              if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                scheduleRetry(() => instance.recoverMediaError());
                return;
              }

              // Erro irrecuperavel na instancia: reconstroi do zero.
              scheduleRetry(build);
            });

            void video.play().catch(() => undefined);
          })
          .catch(() => scheduleRetry(build));
      };

      build();
      teardown.push(() => hls?.destroy());
    }

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      teardown.forEach((fn) => fn());
    };
  }, [url, isHls, enabled, rebuildToken]);

  // Rede voltou ou o usuario voltou para a aba: tenta imediatamente.
  useEffect(() => {
    if (status !== "error") {
      return;
    }

    const handleOnline = () => retry();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        retry();
      }
    };

    window.addEventListener("online", handleOnline);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("online", handleOnline);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [status, retry]);

  return {
    videoRef,
    status,
    retry,
    isHls,
    hasStream: Boolean(url)
  };
}
