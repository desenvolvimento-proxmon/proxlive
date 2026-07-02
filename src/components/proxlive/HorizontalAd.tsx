import Image from "next/image";
import type { HorizontalAd as HorizontalAdData } from "@/lib/proxlive-data";

type HorizontalAdProps = {
  ad: HorizontalAdData;
};

export function HorizontalAd({ ad }: HorizontalAdProps) {
  const content = ad.image ? (
    <div className="overflow-hidden rounded-none bg-neutral-100">
      <Image
        src={ad.image}
        alt={ad.title}
        width={1920}
        height={360}
        sizes="(min-width: 1280px) 1240px, 100vw"
        className="h-auto w-full object-contain"
      />
    </div>
  ) : (
    <div
      className="flex min-h-[170px] items-center justify-between gap-8 rounded-none px-7 py-8 sm:px-12 lg:px-16"
      style={{ backgroundColor: ad.backgroundColor, color: ad.textColor }}
    >
      <div className="flex min-w-0 items-center gap-4">
        <span className="text-2xl font-black sm:text-3xl">
          {ad.logoText ?? "Anunciante"}
        </span>
      </div>
      <strong className="text-right text-4xl font-black leading-tight sm:text-5xl lg:text-7xl">
        {ad.title}
      </strong>
    </div>
  );

  if (!ad.link) {
    return content;
  }

  return (
    <a href={ad.link} target="_blank" rel="noreferrer" className="block">
      {content}
    </a>
  );
}
