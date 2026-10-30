import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  href?: string;
  /** Largura em pixels; a altura acompanha a proporção 2000x370. */
  width?: number;
  className?: string;
  priority?: boolean;
};

export function Logo({
  href,
  width = 148,
  className = "",
  priority = false
}: LogoProps) {
  const mark = (
    <Image
      src="/images/brand/proxlive-logo-branca.webp"
      alt="PROXLIVE"
      width={2000}
      height={370}
      priority={priority}
      sizes={`${width}px`}
      style={{ width, height: "auto" }}
      className={`select-none ${className}`}
    />
  );

  if (!href) {
    return mark;
  }

  return (
    <Link
      href={href}
      aria-label="Ir para a home"
      className="focus-ring -my-2 inline-flex items-center rounded py-2"
    >
      {mark}
    </Link>
  );
}
