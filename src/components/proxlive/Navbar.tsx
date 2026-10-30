"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { places } from "@/lib/proxlive-data";
import { Logo } from "./Logo";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Início", href: "/" },
    ...places.map((place) => ({
      label: place.shortName,
      href: `/lugar/${place.slug}`
    }))
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500 ease-soft ${
        scrolled
          ? "border-b border-white/[0.07] bg-carbon-950/80 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <nav className="shell flex h-[72px] items-center justify-between gap-6">
        <Logo href="/" />

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`focus-ring relative rounded text-sm transition-colors duration-300 ${
                  active ? "text-white" : "text-carbon-400 hover:text-white"
                }`}
              >
                {link.label}
                <span
                  className={`pointer-events-none absolute -bottom-1.5 left-0 h-px w-full origin-left bg-white transition-transform duration-500 ease-out-quint ${
                    active ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          className="focus-ring -mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-carbon-200 transition-colors hover:bg-white/5 hover:text-white md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* grid-rows anima a altura sem precisar medir o conteudo */}
      <div
        className={`grid overflow-hidden border-t border-white/[0.07] bg-carbon-950/95 backdrop-blur-xl transition-[grid-template-rows,opacity] duration-400 ease-out-quint md:hidden ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0">
          <div className="shell flex flex-col py-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="focus-ring rounded-lg px-1 py-3.5 text-base text-carbon-200 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
