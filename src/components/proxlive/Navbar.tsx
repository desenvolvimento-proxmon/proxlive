"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Map, Menu, PlayCircle, X } from "lucide-react";
import { Logo } from "./Logo";

const navItems = [
  { label: "Home", href: "/", icon: Home, soon: false },
  { label: "Mapa de câmeras", href: "/#mapa-cameras", icon: Map, soon: false },
  {
    // Ainda não existe página de time lapse: sinalizado como "breve" em vez
    // de apontar para "/" e dar a impressão de link quebrado.
    label: "Time Lapse",
    href: "/#cameras",
    icon: PlayCircle,
    soon: true
  }
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 4);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-[background-color,border-color,backdrop-filter] duration-300 ease-soft ${
        scrolled
          ? "border-ink-100 bg-white/80 backdrop-blur-xl"
          : "border-transparent bg-white"
      }`}
    >
      <nav className="proxlive-container flex h-[72px] items-center justify-between gap-6">
        <Logo brand="proxlive" href="/" />

        <div className="hidden items-center gap-0.5 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/" && pathname === "/";

            return (
              <a
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`proxlive-focus group relative inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  active
                    ? "text-ink-900"
                    : "text-ink-500 hover:text-ink-900"
                }`}
              >
                <Icon
                  className={`h-4 w-4 transition-colors duration-200 ${
                    active
                      ? "text-brand-500"
                      : "text-ink-400 group-hover:text-brand-500"
                  }`}
                  strokeWidth={1.9}
                />
                <span>{item.label}</span>
                {item.soon ? (
                  <span className="rounded bg-ink-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-ink-600">
                    Breve
                  </span>
                ) : null}
                {/* Sublinhado curto marcando a página atual. */}
                <span
                  className={`pointer-events-none absolute inset-x-3 -bottom-px h-px origin-left bg-brand-500 transition-transform duration-300 ease-out-quint ${
                    active ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </a>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          className="proxlive-focus -mr-2 inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Abertura por grid-rows evita altura fixa e anima suavemente. */}
      <div
        className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out-quint md:hidden ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0">
          <div className="proxlive-container flex flex-col gap-0.5 border-t border-ink-100 py-3">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="proxlive-focus inline-flex items-center gap-3 rounded-lg px-2 py-3 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900"
                >
                  <Icon className="h-4 w-4 text-ink-400" strokeWidth={1.9} />
                  <span>{item.label}</span>
                  {item.soon ? (
                    <span className="rounded bg-ink-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-ink-600">
                      Breve
                    </span>
                  ) : null}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
