"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import type { HeroSlide } from "@/lib/proxlive-data";

type HeroSliderProps = {
  slides: HeroSlide[];
};

export function HeroSlider({ slides }: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slide = slides[activeIndex] ?? slides[0];

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  return (
    <section
      className="relative min-h-[430px] overflow-hidden bg-proxlive-blue"
      aria-label="Destaques"
    >
      {slides.map((item, index) => (
        <div
          key={item.id}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(0, 115, 255, 0.64), rgba(0, 115, 255, 0.58)), url(${item.image})`
          }}
          aria-hidden={index !== activeIndex}
        />
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_20%,rgba(255,255,255,0.18),transparent_32%)]" />

      <div className="proxlive-container relative flex min-h-[430px] items-center py-14">
        <div className="max-w-3xl text-white">
          <h1 className="text-2xl font-black leading-tight sm:text-3xl lg:text-3xl">
            {slide.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm font-normal leading-relaxed text-white/95 sm:text-base">
            {slide.subtitle}
          </p>
          <a
            href={slide.buttonUrl}
            target="_blank"
            rel="noreferrer"
            className=" mt-9 inline-flex items-center justify-center gap-2 rounded-lg border border-white bg-white/10 px-3 py-1.5 text-xs font-normal text-white transition hover:bg-white hover:text-proxlive-blue"
          >
            <MessageCircle className="h-4 w-4" />
            {slide.buttonText}
          </a>
        </div>

        {slide.cornerLogoImage ? (
          <Image
            src={slide.cornerLogoImage}
            alt={slide.cornerLogoAlt ?? ""}
            width={150}
            height={80}
            className="absolute bottom-9 right-8 hidden h-auto w-24 object-contain lg:block"
          />
        ) : slide.cornerLogoText ? (
          <div className="absolute bottom-9 right-8 hidden whitespace-pre-line text-right text-3xl font-black leading-none text-white lg:block">
            {slide.cornerLogoText}
          </div>
        ) : null}

      </div>
    </section>
  );
}
