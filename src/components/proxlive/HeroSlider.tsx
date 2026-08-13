"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import type { HeroSlide } from "@/lib/proxlive-data";

type HeroSliderProps = {
  slides: HeroSlide[];
};

const SLIDE_DURATION = 6500;

/** Banner institucional dos produtos PROXMON, no topo da Home. */
export function HeroSlider({ slides }: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const parallaxRef = useRef<HTMLDivElement | null>(null);
  const slide = slides[activeIndex] ?? slides[0];

  useEffect(() => {
    if (slides.length <= 1 || paused) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, SLIDE_DURATION);

    return () => window.clearInterval(timer);
  }, [slides.length, paused]);

  // Parallax: a camada de fundo desce mais devagar que a página.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let frame = 0;

    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      const layer = parallaxRef.current;

      if (!section || !layer) {
        return;
      }

      const { top, bottom } = section.getBoundingClientRect();

      if (bottom < 0 || top > window.innerHeight) {
        return;
      }

      // Escrito direto no DOM: evita re-render a cada evento de scroll.
      layer.style.transform = `translate3d(0, ${Math.max(-top, 0) * 0.16}px, 0)`;
    };

    const onScroll = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  if (!slide) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="relative isolate min-h-[430px] overflow-hidden bg-ink-950"
      aria-label="Soluções PROXMON"
      aria-roledescription="carrossel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div ref={parallaxRef} className="absolute inset-0 -z-10 will-change-transform">
        {/* Escala lenta só no slide ativo: dá vida sem chamar atenção. */}
        {slides.map((item, index) => (
          <div
            key={item.id}
            aria-hidden={index !== activeIndex}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[900ms] ease-out-expo ${
              index === activeIndex
                ? "animate-ken-burns opacity-100"
                : "opacity-0"
            }`}
            style={{ backgroundImage: `url(${item.image})` }}
          />
        ))}
      </div>

      {/* Profundidade: navy fechado atrás do texto, abrindo para o azul da marca. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(102deg,rgba(10,17,32,0.94)_0%,rgba(0,58,140,0.80)_42%,rgba(0,114,255,0.44)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_78%_12%,rgba(77,155,255,0.28),transparent_58%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-ink-950/55 to-transparent"
      />

      <div className="proxlive-container relative flex min-h-[430px] items-center py-14">
        <div className="max-w-2xl text-white">
          {/* key força o reflow da animação a cada troca de slide. */}
          <div key={slide.id} className="animate-fade-in">
            <h2 className="text-title text-balance text-white">
              {slide.title}
            </h2>
            <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-white/75 sm:text-base">
              {slide.subtitle}
            </p>
          </div>

          <a
            href={slide.buttonUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-md btn-on-dark mt-8"
          >
            <MessageCircle className="h-4 w-4" />
            {slide.buttonText}
          </a>

          {slides.length > 1 ? (
            <div className="mt-9 flex items-center gap-2.5">
              {slides.map((item, index) => {
                const active = index === activeIndex;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Ver ${item.cornerLogoAlt ?? item.title}`}
                    aria-current={active}
                    // h-11: área de toque de 44px sem engordar a barra visível.
                    className="proxlive-focus-dark group flex h-11 items-center"
                  >
                    <span
                      className={`block h-[3px] overflow-hidden rounded-full transition-all duration-500 ease-out-quint ${
                        active
                          ? "w-10 bg-white/25"
                          : "w-5 bg-white/25 group-hover:bg-white/45"
                      }`}
                    >
                      {/* Barra que preenche no ritmo do slide. */}
                      {active ? (
                        <span
                          key={`${item.id}-${paused}`}
                          className="block h-full w-full origin-left rounded-full bg-white"
                          style={{
                            animation: `slide-progress ${SLIDE_DURATION}ms linear forwards`,
                            animationPlayState: paused ? "paused" : "running"
                          }}
                        />
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        {slide.cornerLogoImage ? (
          <Image
            key={slide.cornerLogoImage}
            src={slide.cornerLogoImage}
            alt={slide.cornerLogoAlt ?? ""}
            width={150}
            height={80}
            className="absolute bottom-10 right-10 hidden h-auto w-24 animate-fade-in object-contain opacity-90 lg:block"
          />
        ) : slide.cornerLogoText ? (
          <div className="absolute bottom-10 right-10 hidden whitespace-pre-line text-right text-3xl font-bold leading-none tracking-tight text-white lg:block">
            {slide.cornerLogoText}
          </div>
        ) : null}
      </div>
    </section>
  );
}
