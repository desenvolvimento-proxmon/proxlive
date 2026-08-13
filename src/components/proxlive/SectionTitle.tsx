import type { LucideIcon } from "lucide-react";
import { Video } from "lucide-react";

type SectionTitleProps = {
  children: React.ReactNode;
  subtitle?: string;
  icon?: LucideIcon;
  /** Só a Home usa `h1`; as demais seções seguem em `h2`. */
  as?: "h1" | "h2";
  /** Conteúdo alinhado à direita (contagem, filtro, link). */
  meta?: React.ReactNode;
};

export function SectionTitle({
  children,
  subtitle,
  icon: Icon = Video,
  as: Heading = "h2",
  meta
}: SectionTitleProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-brand-50 text-brand-500 ring-1 ring-inset ring-brand-500/10">
            <Icon className="h-4 w-4" strokeWidth={2.1} />
          </span>
          <Heading className="text-base font-semibold tracking-[-0.015em] text-ink-900">
            {children}
          </Heading>
        </div>
        {meta ? <div className="shrink-0">{meta}</div> : null}
      </div>
      {subtitle ? (
        <p className="mt-2 max-w-2xl pl-[38px] text-sm text-ink-500">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
