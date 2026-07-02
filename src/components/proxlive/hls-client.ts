"use client";

export type HlsInstance = {
  loadSource: (source: string) => void;
  attachMedia: (media: HTMLVideoElement) => void;
  stopLoad?: () => void;
  destroy: () => void;
  on: (
    eventName: string,
    callback: (
      eventName: string,
      data: {
        fatal?: boolean;
      }
    ) => void
  ) => void;
};

type HlsConstructor = {
  new (): HlsInstance;
  isSupported: () => boolean;
  Events: {
    ERROR: string;
  };
};

declare global {
  interface Window {
    Hls?: HlsConstructor;
    proxliveHlsPromise?: Promise<HlsConstructor>;
  }
}

const hlsScriptUrl = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";

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
