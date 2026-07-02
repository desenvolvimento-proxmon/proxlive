import Image from "next/image";
import type { SideAd as SideAdData } from "@/lib/proxlive-data";

type SideAdProps = {
  ad: SideAdData;
};

export function SideAd({ ad }: SideAdProps) {
  const content = ad.image ? (
    <div className="overflow-hidden rounded-none bg-neutral-100">
      <Image
        src={ad.image}
        alt={ad.title}
        width={600}
        height={360}
        sizes="(min-width: 1024px) 330px, (min-width: 768px) 33vw, 100vw"
        className="h-auto w-full object-cover"
      />
    </div>
  ) : (
    <div
      className="flex min-h-[160px] flex-col justify-center gap-4 rounded-none px-7 py-8"
      style={{ backgroundColor: ad.backgroundColor, color: ad.textColor }}
    >
      <strong className="text-3xl font-black leading-tight sm:text-4xl">
        {ad.title}
      </strong>
      {ad.logoText ? (
        <span className="self-end text-xs font-bold opacity-90">{ad.logoText}</span>
      ) : null}
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
