import { Video } from "lucide-react";

type SectionTitleProps = {
  children: React.ReactNode;
};

export function SectionTitle({ children }: SectionTitleProps) {
  return (
    <div className="mb-7 flex items-center gap-3">
      <Video className="h-5 w-5 text-proxlive-blue" strokeWidth={2.2} />
      <h2 className="text-lg font-semibold text-neutral-800">{children}</h2>
    </div>
  );
}
