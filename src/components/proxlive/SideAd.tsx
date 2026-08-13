import type { AdCreative } from "@/lib/proxlive-data";
import { AdSlot } from "./AdSlot";

type SideAdProps = {
  ad: AdCreative;
  placement: string;
  className?: string;
};

export function SideAd({ ad, placement, className }: SideAdProps) {
  return (
    <AdSlot ads={[ad]} format="side" placement={placement} className={className} />
  );
}
