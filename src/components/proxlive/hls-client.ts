"use client";

export type HlsErrorData = {
  fatal?: boolean;
  type?: string;
  details?: string;
};

export type HlsInstance = {
  loadSource: (source: string) => void;
  attachMedia: (media: HTMLVideoElement) => void;
  startLoad: (startPosition?: number) => void;
  stopLoad: () => void;
  recoverMediaError: () => void;
  swapAudioCodec: () => void;
  destroy: () => void;
  on: (
    eventName: string,
    callback: (eventName: string, data: HlsErrorData) => void
  ) => void;
  liveSyncPosition?: number | null;
};

export type HlsSettings = {
  lowLatencyMode?: boolean;
  enableWorker?: boolean;
  backBufferLength?: number;
  liveSyncDurationCount?: number;
  liveMaxLatencyDurationCount?: number;
  maxBufferLength?: number;
  manifestLoadingMaxRetry?: number;
  manifestLoadingRetryDelay?: number;
  levelLoadingMaxRetry?: number;
  fragLoadingMaxRetry?: number;
};

type HlsConstructor = {
  new (config?: HlsSettings): HlsInstance;
  isSupported: () => boolean;
  Events: {
    ERROR: string;
    MANIFEST_PARSED: string;
    FRAG_BUFFERED: string;
  };
  ErrorTypes: {
    NETWORK_ERROR: string;
    MEDIA_ERROR: string;
    OTHER_ERROR: string;
  };
};

declare global {
  interface Window {
    Hls?: HlsConstructor;
    proxliveHlsPromise?: Promise<HlsConstructor>;
  }
}

const hlsScriptUrl = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";

/**
 * Config voltada para transmissao ao vivo: mantem o espectador colado na
 * borda do live em vez de deixar acumular buffer e ir atrasando.
 */
export const LIVE_HLS_SETTINGS: HlsSettings = {
  enableWorker: true,
  lowLatencyMode: true,
  backBufferLength: 30,
  liveSyncDurationCount: 3,
  liveMaxLatencyDurationCount: 10,
  maxBufferLength: 20,
  manifestLoadingMaxRetry: 4,
  manifestLoadingRetryDelay: 1000,
  levelLoadingMaxRetry: 4,
  fragLoadingMaxRetry: 6
};

/** Preview de card e popup: buffer curto, sem gastar banda a toa. */
export const PREVIEW_HLS_SETTINGS: HlsSettings = {
  ...LIVE_HLS_SETTINGS,
  maxBufferLength: 6,
  backBufferLength: 0
};

export function isHlsUrl(url: string) {
  return url.includes(".m3u8");
}

export function loadHls() {
  if (window.Hls) {
    return Promise.resolve(window.Hls);
  }

  if (window.proxliveHlsPromise) {
    return window.proxliveHlsPromise;
  }

  window.proxliveHlsPromise = new Promise<HlsConstructor>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-proxlive-hls]"
    );

    if (existing) {
      existing.addEventListener("load", () => {
        if (window.Hls) {
          resolve(window.Hls);
        }
      });
      existing.addEventListener("error", () => reject(new Error("hls.js")));
      return;
    }

    const script = document.createElement("script");
    script.src = hlsScriptUrl;
    script.async = true;
    script.dataset.proxliveHls = "true";
    script.onload = () => {
      if (window.Hls) {
        resolve(window.Hls);
      } else {
        reject(new Error("hls.js"));
      }
    };
    script.onerror = () => reject(new Error("hls.js"));
    document.body.appendChild(script);
  });

  return window.proxliveHlsPromise;
}

export function supportsNativeHls(video: HTMLVideoElement) {
  return video.canPlayType("application/vnd.apple.mpegurl") !== "";
}
