"use client";

import { useEffect, useRef } from "react";

/**
 * O X da marca como assunto da home.
 *
 * A forma vem do arquivo oficial, usado como mascara CSS — assim o traco e
 * exatamente o da marca, e o preenchimento fica livre. Dentro dele vai um
 * duotone azul-grafite: a cor passa a ser nossa e nao depende de nenhuma cena.
 *
 * O movimento acompanha o mouse com interpolacao suave, nao salto direto.
 * Deslocamento pequeno de proposito: o pedido era algo sutil, nao um efeito.
 */

/** Quanto o X caminha, em pixels, do centro ate a borda da tela. */
const RANGE = 18;
/** Quao rapido ele alcanca o alvo a cada quadro. Menor = mais preguicoso. */
const EASING = 0.055;

export function HeroX() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const alvo = { x: 0, y: 0 };
    const atual = { x: 0, y: 0 };
    let frame = 0;

    const onMove = (event: PointerEvent) => {
      alvo.x = (event.clientX / window.innerWidth - 0.5) * 2;
      alvo.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const loop = () => {
      atual.x += (alvo.x - atual.x) * EASING;
      atual.y += (alvo.y - atual.y) * EASING;

      if (wrapRef.current) {
        // Inclinacao minima junto do deslocamento: da volume sem parecer 3D.
        wrapRef.current.style.transform =
          `translate3d(${atual.x * RANGE}px, ${atual.y * RANGE}px, 0)` +
          ` rotate(${atual.x * 0.6}deg)`;
      }
      // O brilho anda no sentido oposto, o que separa os planos.
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${atual.x * -26}px, ${atual.y * -26}px, 0)`;
      }

      frame = window.requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    frame = window.requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <div
        ref={glowRef}
        className="absolute left-1/2 top-1/2 h-[86vmin] w-[86vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,114,255,0.17),transparent_68%)] blur-2xl will-change-transform"
      />

      <div
        ref={wrapRef}
        className="absolute left-1/2 top-1/2 h-[76vmin] w-[76vmin] -translate-x-1/2 -translate-y-1/2 will-change-transform"
      >
        <div
          className="h-full w-full"
          style={{
            // Duotone azul-grafite: escuro o bastante para nao competir com o
            // texto, vivo o bastante para nao parecer um borrao.
            backgroundImage:
              "linear-gradient(142deg, #0f1a2c 0%, #16304f 32%, #205284 58%, #14263f 82%, #0c1320 100%)",
            WebkitMaskImage: "url(/images/brand/x.webp)",
            maskImage: "url(/images/brand/x.webp)",
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center"
          }}
        />
      </div>
    </div>
  );
}
