type LiveBadgeProps = {
  /** `solid` destaca na página da câmera; `soft` é o selo discreto dos cards. */
  variant?: "solid" | "soft";
};

export function LiveBadge({ variant = "solid" }: LiveBadgeProps) {
  if (variant === "soft") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-carbon-950/60 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/90 backdrop-blur-sm">
        <span className="h-1 w-1 animate-live-pulse rounded-full bg-live" />
        Ao vivo
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-live px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg">
      <span className="h-1.5 w-1.5 animate-live-pulse rounded-full bg-white" />
      Ao vivo
    </span>
  );
}

export function ComingSoonBadge() {
  return (
    <span className="inline-flex rounded-md bg-carbon-950/60 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/70 backdrop-blur-sm">
      Em breve
    </span>
  );
}
