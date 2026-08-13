"use client";

import { useEffect, useRef, useState } from "react";
import type { Camera } from "@/lib/proxlive-data";
import {
  isHlsUrl,
  loadHls,
  PREVIEW_HLS_SETTINGS,
  type HlsInstance
} from "./hls-client";

type CameraMapProps = {
  cameras: Camera[];
};

type LeafletPopupEvent = {
  popup?: {
    getElement: () => HTMLElement | null;
  };
};

type LeafletMap = {
  remove: () => void;
  invalidateSize: () => void;
  fitBounds: (bounds: unknown, options?: { padding?: [number, number] }) => void;
  setView: (center: [number, number], zoom: number) => LeafletMap;
  on: (
    eventName: "popupopen" | "popupclose",
    handler: (event: LeafletPopupEvent) => void
  ) => LeafletMap;
  off: (
    eventName: "popupopen" | "popupclose",
    handler: (event: LeafletPopupEvent) => void
  ) => LeafletMap;
};

type LeafletLayer = {
  addTo: (map: LeafletMap) => LeafletLayer;
  bindPopup: (html: string) => LeafletLayer;
};

type LeafletMarker = LeafletLayer & {
  addTo: (map: LeafletMap) => LeafletMarker;
  bindPopup: (html: string) => LeafletMarker;
  openPopup: () => LeafletMarker;
};

type LeafletNamespace = {
  map: (element: HTMLElement, options?: Record<string, unknown>) => LeafletMap;
  tileLayer: (url: string, options?: Record<string, unknown>) => LeafletLayer;
  marker: (
    coordinates: [number, number],
    options?: Record<string, unknown>
  ) => LeafletMarker;
  icon: (options: Record<string, unknown>) => unknown;
  divIcon: (options: Record<string, unknown>) => unknown;
  latLngBounds: (coordinates: [number, number][]) => unknown;
};

declare global {
  interface Window {
    L?: LeafletNamespace;
    proxliveLeafletPromise?: Promise<LeafletNamespace>;
  }
}

const leafletCssUrl = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const leafletJsUrl = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildPopup(camera: Camera) {
  const name = escapeHtml(camera.name);
  const location = escapeHtml(camera.location);
  const image = escapeHtml(camera.image);
  const streamUrl = escapeHtml(camera.streamUrl?.trim() ?? "");
  const cameraUrl = `/camera/${escapeHtml(camera.slug)}`;
  const hasHls = streamUrl !== "" && isHlsUrl(streamUrl);
  const preview = hasHls
    ? `<video data-stream-url="${streamUrl}" poster="${image}" muted autoplay playsinline preload="auto" crossorigin="anonymous" style="display:block;width:100%;height:145px;object-fit:cover;background:#000;border-radius:10px;"></video>`
    : `<img src="${image}" alt="${name}" style="display:block;width:100%;height:145px;object-fit:cover;border-radius:10px;" />`;

  const liveBadge = hasHls
    ? `<span style="position:absolute;left:8px;top:8px;display:inline-flex;align-items:center;gap:5px;background:#ff3b30;color:#fff;padding:3px 8px;border-radius:999px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">
         <span style="width:5px;height:5px;border-radius:999px;background:#fff;"></span>Ao vivo
       </span>`
    : "";

  return `
    <div style="width:260px;">
      <div style="position:relative;">
        ${preview}
        ${liveBadge}
      </div>
      <strong style="display:block;margin-top:12px;font-size:14px;font-weight:600;line-height:1.3;letter-spacing:-0.012em;color:#131c2e;">${name}</strong>
      <p style="margin:4px 0 12px;color:#65728d;font-size:11.5px;line-height:1.4;">${location}</p>
      <a href="${cameraUrl}" style="display:block;text-align:center;background:#0072ff;color:#fff;padding:9px 13px;border-radius:8px;text-decoration:none;font-weight:600;font-size:12.5px;">Assistir ao vivo</a>
    </div>
  `;
}

function loadLeaflet() {
  if (window.L) {
    return Promise.resolve(window.L);
  }

  if (window.proxliveLeafletPromise) {
    return window.proxliveLeafletPromise;
  }

  window.proxliveLeafletPromise = new Promise<LeafletNamespace>((resolve, reject) => {
    if (!document.querySelector("link[data-proxlive-leaflet]")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = leafletCssUrl;
      link.dataset.proxliveLeaflet = "true";
      document.head.appendChild(link);
    }

    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-proxlive-leaflet]"
    );

    if (existing) {
      existing.addEventListener("load", () => {
        if (window.L) {
          resolve(window.L);
        }
      });
      existing.addEventListener("error", () => reject(new Error("Leaflet")));
      return;
    }

    const script = document.createElement("script");
    script.src = leafletJsUrl;
    script.async = true;
    script.dataset.proxliveLeaflet = "true";
    script.onload = () => {
      if (window.L) {
        resolve(window.L);
      } else {
        reject(new Error("Leaflet"));
      }
    };
    script.onerror = () => reject(new Error("Leaflet"));
    document.body.appendChild(script);
  });

  return window.proxliveLeafletPromise;
}

export function CameraMap({ cameras }: CameraMapProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let map: LeafletMap | null = null;
    let cancelled = false;
    let popupHlsInstances: HlsInstance[] = [];
    let resizeObserver: ResizeObserver | null = null;

    function destroyPopupStreams() {
      popupHlsInstances.forEach((hls) => hls.destroy());
      popupHlsInstances = [];
    }

    function startPopupStreams(container: HTMLElement | null) {
      if (!container) {
        return;
      }

      destroyPopupStreams();

      const videos = Array.from(
        container.querySelectorAll<HTMLVideoElement>("video[data-stream-url]")
      );

      videos.forEach((video) => {
        const streamUrl = video.dataset.streamUrl;

        if (!streamUrl || !isHlsUrl(streamUrl)) {
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
          video.play().catch(() => undefined);
          return;
        }

        loadHls()
          .then((Hls) => {
            if (cancelled || !Hls.isSupported()) {
              return;
            }

            const hls = new Hls(PREVIEW_HLS_SETTINGS);
            popupHlsInstances.push(hls);
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            video.play().catch(() => undefined);
          })
          .catch(() => undefined);
      });
    }

    function handlePopupOpen(event: LeafletPopupEvent) {
      startPopupStreams(event.popup?.getElement() ?? null);
    }

    function handlePopupClose() {
      destroyPopupStreams();
    }

    loadLeaflet()
      .then((L) => {
        if (!mapElementRef.current || cancelled) {
          return;
        }

        const visibleCameras = cameras.filter((camera) => camera.streamUrl?.trim());

        if (visibleCameras.length === 0) {
          setFailed(true);
          return;
        }

        const coordinates = visibleCameras.map(
          (camera) => [camera.latitude, camera.longitude] as [number, number]
        );
        const center = coordinates.reduce(
          (acc, coordinate) => [acc[0] + coordinate[0], acc[1] + coordinate[1]],
          [0, 0]
        ) as [number, number];
        center[0] = center[0] / coordinates.length;
        center[1] = center[1] / coordinates.length;

        map = L.map(mapElementRef.current, {
          center,
          zoom: 14,
          scrollWheelZoom: true
        });

        map.on("popupopen", handlePopupOpen);
        map.on("popupclose", handlePopupClose);

        // O mapa acompanha a altura da coluna de anuncios, que muda quando as
        // imagens carregam. Sem avisar o Leaflet, ele mantem o tamanho antigo
        // e deixa faixas cinza onde faltam tiles.
        resizeObserver = new ResizeObserver(() => map?.invalidateSize());
        resizeObserver.observe(mapElementRef.current);

        // Base colorida. Para voltar ao OSM padrao, troque a URL por
        // "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" e remova `subdomains`.
        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
          {
            attribution: "&copy; OpenStreetMap &copy; CARTO",
            subdomains: "abcd",
            maxZoom: 20
          }
        ).addTo(map);

        // Marcador proprio no lugar do pin padrao do Leaflet.
        const icon = L.divIcon({
          className: "proxlive-marker",
          html: `
            <span class="proxlive-marker__pulse"></span>
            <span class="proxlive-marker__dot">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none"
                   stroke="currentColor" stroke-width="2.2"
                   stroke-linecap="round" stroke-linejoin="round">
                <path d="m22 8-6 4 6 4V8Z"/>
                <rect width="14" height="12" x="2" y="6" rx="2"/>
              </svg>
            </span>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
          popupAnchor: [0, -16]
        });

        const markers = new Map<string, LeafletMarker>();

        visibleCameras.forEach((camera) => {
          const marker = L.marker([camera.latitude, camera.longitude], { icon });
          marker.addTo(map as LeafletMap);
          marker.bindPopup(buildPopup(camera));

          markers.set(camera.slug, marker);
        });

        if (coordinates.length > 1) {
          map.fitBounds(L.latLngBounds(coordinates), { padding: [34, 34] });
        }

        const selectedSlug = new URLSearchParams(window.location.search).get(
          "camera"
        );
        const selectedCamera = visibleCameras.find(
          (camera) => camera.slug === selectedSlug
        );
        const selectedMarker = selectedSlug ? markers.get(selectedSlug) : null;

        if (selectedCamera && selectedMarker) {
          map.setView([selectedCamera.latitude, selectedCamera.longitude], 16);
          window.setTimeout(() => selectedMarker.openPopup(), 250);
        }
      })
      .catch(() => setFailed(true));

    return () => {
      cancelled = true;
      destroyPopupStreams();
      resizeObserver?.disconnect();

      if (map) {
        map.off("popupopen", handlePopupOpen);
        map.off("popupclose", handlePopupClose);
        map.remove();
      }
    };
  }, [cameras]);

  return (
    <div className="relative h-full min-h-[360px] overflow-hidden rounded-2xl border border-ink-100 bg-ink-50 shadow-e1 lg:min-h-[500px]">
      <div ref={mapElementRef} className="absolute inset-0" />
      {failed ? (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-ink-500">
          Não foi possível carregar o mapa interativo agora.
        </div>
      ) : null}
    </div>
  );
}
