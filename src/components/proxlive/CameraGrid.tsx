import type { Camera } from "@/lib/proxlive-data";
import { CameraCard } from "./CameraCard";
import { Reveal } from "./Reveal";

type CameraGridProps = {
  cameras: Camera[];
};

export function CameraGrid({ cameras }: CameraGridProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {cameras.map((camera, index) => (
        // Escalonamento curto: a fileira entra como uma sequência, não em bloco.
        <Reveal key={camera.id} delay={index * 70} className="h-full">
          <CameraCard camera={camera} priority={index < 2} />
        </Reveal>
      ))}
    </div>
  );
}
