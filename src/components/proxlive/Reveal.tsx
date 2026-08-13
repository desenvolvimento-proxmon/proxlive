"use client";

import { useEffect, useRef } from "react";

type RevealProps = {
  children: React.ReactNode;
  /** Atraso em ms, usado para escalonar itens de uma mesma lista. */
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "header";
};

/**
 * Revela o conteudo quando ele entra na viewport.
 *
 * A regra que orienta o componente: falhar para visivel, sempre. Conteudo
 * escondido e muito pior que ausencia de animacao, entao ha tres redes de
 * protecao — o fallback CSS `html:not(.js)` para quando nao ha JavaScript, a
 * medicao direta na montagem, e uma nova medicao quando a aba volta a ficar
 * visivel (com a pagina oculta o navegador nao roda o passo de renderizacao e
 * o IntersectionObserver nao dispara).
 *
 * A classe e aplicada direto no DOM: e um efeito puramente visual, nao precisa
 * de estado nem provoca re-render. Anima so opacidade e transform, ambos
 * compostos na GPU.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as = "div"
}: RevealProps) {
  // `ElementType` mantém a tag dinâmica sem exigir uma união de tipos de ref.
  const Tag = as as React.ElementType;
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const show = () => element.classList.add("is-visible");

    const revealIfInView = () => {
      const { top, bottom } = element.getBoundingClientRect();

      if (top < window.innerHeight && bottom > 0) {
        show();
        return true;
      }

      return false;
    };

    if (typeof IntersectionObserver === "undefined") {
      show();
      return;
    }

    if (revealIfInView()) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          show();
          observer.disconnect();
        }
      },
      // Dispara um pouco antes do elemento encostar na borda inferior.
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );

    observer.observe(element);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        revealIfInView();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <Tag
      ref={ref}
      style={
        delay
          ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties)
          : undefined
      }
      className={`reveal ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}
