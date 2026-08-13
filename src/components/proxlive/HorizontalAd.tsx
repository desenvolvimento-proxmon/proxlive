import type { AdCreative } from "@/lib/proxlive-data";
import { AdSlot } from "./AdSlot";

type HorizontalAdProps = {
  ad: AdCreative;
  placement: string;
  className?: string;
};

export function HorizontalAd({ ad, placement, className }: HorizontalAdProps) {
  return (
    <AdSlot
      ads={[ad]}
      format="horizontal"
      placement={placement}
      className={className}
    />
  );
}
