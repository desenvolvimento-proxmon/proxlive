import Link from "next/link";

type LogoProps = {
  href?: string;
  className?: string;
};

/**
 * Marca em texto, nao em imagem.
 *
 * O PNG do PROXLIVE e azul-escuro sobre transparente e desapareceria no fundo
 * preto. Filtrar para branco mataria o X azul, que e o unico tra\u00e7o da marca.
 * Em texto ele fica nitido em qualquer tamanho e mantem o acento.
 */
export function Logo({ href, className = "" }: LogoProps) {
  const mark = (
    <span
      aria-label="PROXLIVE"
      className={`inline-flex select-none items-center text-[1.3rem] font-extrabold leading-none tracking-[-0.045em] text-white sm:text-[1.45rem] ${className}`}
    >
      <span aria-hidden="true">PRO</span>
      <span aria-hidden="true" className="text-brand-500">
        X
      </span>
      <span aria-hidden="true">LIVE</span>
    </span>
  );

  if (!href) {
    return mark;
  }

  return (
    <Link href={href} aria-label="Ir para a home" className="focus-ring -my-2 inline-flex items-center rounded py-2">
      {mark}
    </Link>
  );
}
