"use client";

import { useEffect, useRef, useState } from "react";
import type { Camera } from "@/lib/proxlive-data";
import { isHlsUrl, loadHls, type HlsInstance } from "./hls-client";

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

  return `
    <div style="width:260px;">
      ${preview}
      <strong style="display:block;margin-top:12px;font-size:16px;line-height:1.2;color:#111827;">${name}</strong>
      <p style="margin:6px 0 12px;color:#525252;font-size:12px;line-height:1.35;">${location}</p>
      <a href="${cameraUrl}" style="display:inline-block;background:#0072ff;color:#fff;padding:9px 13px;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px;">Ver camera</a>
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

            const hls = new Hls();
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

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap"
        }).addTo(map);

        const icon = L.icon({
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconRetinaUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
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

      if (map) {
        map.off("popupopen", handlePopupOpen);
        map.off("popupclose", handlePopupClose);
        map.remove();
      }
    };
  }, [cameras]);

  return (
    <div className="relative min-h-[350px] overflow-hidden rounded-lg bg-neutral-100 shadow-sm lg:min-h-[500px]">
      <div ref={mapElementRef} className="absolute inset-0" />
      {failed ? (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm font-medium text-neutral-600">
          Nao foi possivel carregar o mapa interativo agora.
        </div>
      ) : null}
    </div>
  );
}
