import type { Camera } from "@/lib/proxlive-data";
import { CameraCard } from "./CameraCard";

type CameraGridProps = {
  cameras: Camera[];
};

export function CameraGrid({ cameras }: CameraGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cameras.map((camera) => (
        <CameraCard key={camera.id} camera={camera} />
      ))}
    </div>
  );
}
