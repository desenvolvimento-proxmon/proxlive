"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { AdCreative } from "@/lib/proxlive-data";
import { track } from "@/lib/analytics";

type AdSlotProps = {
  ads: AdCreative[];
  format: "horizontal" | "side";
  /** Onde o slot está na página. Vira dimensão no relatório. */
  placement: string;
  /** Com mais de um criativo, alterna nesse intervalo. */
  rotateMs?: number;
  className?: string;
};

/** Padrão IAB: 50% visível por 1s conta como impressão. */
const VIEWABLE_RATIO = 0.5;
const VIEWABLE_DWELL = 1000;

export function AdSlot({
  ads,
  format,
  placement,
  rotateMs = 8000,
  className = ""
}: AdSlotProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);
  const countedRef = useRef<Set<string>>(new Set());
  const visibleRef = useRef(false);

  const ad = ads[index];

  // Rotação entre criativos do mesmo slot.
  useEffect(() => {
    if (ads.length <= 1) {
      return;
    }

    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % ads.length),
      rotateMs
    );

    return () => window.clearInterval(timer);
  }, [ads.length, rotateMs]);

  // Impressão só quando o anúncio esteve de fato visível.
  useEffect(() => {
    const element = containerRef.current;

    if (!element || !ad) {
      return;
    }

    let dwellTimer: number | undefined;

    const countImpression = () => {
      if (countedRef.current.has(ad.id)) {
        return;
      }
      countedRef.current.add(ad.id);
      track("ad_impression", {
        ad_id: ad.id,
        advertiser: ad.advertiser ?? ad.title,
        placement,
        format
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;

        if (entry.isIntersecting) {
          dwellTimer = window.setTimeout(countImpression, VIEWABLE_DWELL);
        } else {
          window.clearTimeout(dwellTimer);
        }
      },
      { threshold: VIEWABLE_RATIO }
    );

    observer.observe(element);

    return () => {
      window.clearTimeout(dwellTimer);
      observer.disconnect();
    };
  }, [ad, placement, format]);

  if (!ad) {
    return null;
  }

  const isHorizontal = format === "horizontal";

  const creative = ad.image ? (
    <Image
      src={ad.image}
      alt={ad.title}
      width={isHorizontal ? 1920 : 600}
      height={isHorizontal ? 360 : 360}
      loading="lazy"
      sizes={
        isHorizontal
          ? "(min-width: 1280px) 1240px, 100vw"
          : "(min-width: 1024px) 330px, (min-width: 768px) 33vw, 100vw"
      }
      className="h-auto w-full object-cover"
    />
  ) : (
    <div
      className={`flex ${
        isHorizontal
          ? "min-h-[170px] items-center justify-between gap-8 px-7 py-8 sm:px-12 lg:px-16"
          : "min-h-[160px] flex-col justify-center gap-4 px-7 py-8"
      }`}
      style={{ backgroundColor: ad.backgroundColor, color: ad.textColor }}
    >
      {isHorizontal ? (
        <>
          <span className="text-2xl font-black sm:text-3xl">
            {ad.logoText ?? ad.advertiser ?? "Anunciante"}
          </span>
          <strong className="text-right text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            {ad.title}
          </strong>
        </>
      ) : (
        <>
          <strong className="text-3xl font-black leading-tight sm:text-4xl">
            {ad.title}
          </strong>
          {ad.logoText ? (
            <span className="self-end text-xs font-bold opacity-90">
              {ad.logoText}
            </span>
          ) : null}
        </>
      )}
    </div>
  );

  const body = (
    <div className="overflow-hidden rounded-xl border border-ink-100 bg-ink-50 transition-[border-color,box-shadow,transform] duration-300 ease-out-quint group-hover/ad:-translate-y-0.5 group-hover/ad:border-brand-200 group-hover/ad:shadow-e2">
      {creative}
    </div>
  );

  return (
    <div ref={containerRef} className={className}>
      {/* Identificação exigida para conteúdo pago e boa prática de UX. */}
      <div className="mb-2 flex items-center gap-2.5">
        {/* Aviso obrigatório: precisa ser discreto, mas legível (AA). */}
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-500">
          Publicidade
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-ink-100" />
        {ads.length > 1 ? (
          <span className="flex gap-1" aria-hidden="true">
            {ads.map((item, itemIndex) => (
              <span
                key={item.id}
                className={`h-1 w-3 rounded-full transition-colors duration-300 ${
                  itemIndex === index ? "bg-brand-500" : "bg-ink-200"
                }`}
              />
            ))}
          </span>
        ) : null}
      </div>

      {ad.link ? (
        <a
          href={ad.link}
          target="_blank"
          rel="noreferrer sponsored"
          onClick={() =>
            track("ad_click", {
              ad_id: ad.id,
              advertiser: ad.advertiser ?? ad.title,
              placement,
              format
            })
          }
          className="proxlive-focus group/ad block rounded-xl"
        >
          {body}
        </a>
      ) : (
        <div className="group/ad">{body}</div>
      )}
    </div>
  );
}
