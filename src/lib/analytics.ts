"use client";

/**
 * Camada fina de analytics, sem dependencia de fornecedor.
 *
 * Os eventos sao empurrados para `window.dataLayer` e, se existir, para o
 * `gtag`. Basta colar a tag do GA4 ou do Google Tag Manager no site que todo
 * evento disparado aqui passa a ser coletado — nao e preciso mudar componente.
 */

type EventPayload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (command: string, eventName: string, payload?: EventPayload) => void;
  }
}

export type ProxliveEvent =
  | "ad_impression"
  | "ad_click"
  | "camera_view"
  | "camera_play"
  | "camera_error"
  | "camera_reconnect"
  | "camera_unmute"
  | "camera_fullscreen"
  | "share_click";

export function track(event: ProxliveEvent, payload: EventPayload = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const data = { event, ...payload };

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(data);
  window.gtag?.("event", event, payload);

  if (process.env.NODE_ENV === "development") {
    console.debug("[proxlive:analytics]", event, payload);
  }
}
