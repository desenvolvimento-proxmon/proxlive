import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  brand: "proxlive" | "proxmon";
  href?: string;
  variant?: "dark" | "light";
  className?: string;
};

export function Logo({
  brand,
  href,
  variant = "dark",
  className = ""
}: LogoProps) {
  if (brand === "proxlive") {
    const content = (
      <Image
        src="/images/brand/proxlive-logo.png"
        alt="PROXLIVE"
        width={3806}
        height={703}
        priority
        className={`h-auto w-[190px] sm:w-[220px] ${className}`}
      />
    );

    if (!href) {
      return content;
    }

    return (
      <Link href={href} aria-label="Ir para Home" className="inline-flex">
        {content}
      </Link>
    );
  }

  const textColor = variant === "light" ? "text-white" : "text-proxlive-navy";
  const xColor = variant === "light" ? "text-white" : "text-proxlive-blue";
  const content = (
    <span
      className={`inline-flex items-center text-3xl font-black leading-none sm:text-4xl ${textColor} ${className}`}
      aria-label="PROXMON"
    >
      <span>PRO</span>
      <span className={xColor}>X</span>
      <span>MON</span>
    </span>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} aria-label="PROXMON">
      {content}
    </Link>
  );
}
