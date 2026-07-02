import { Home, Map, PlayCircle } from "lucide-react";
import { Logo } from "./Logo";

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: Home,
    disabled: false
  },
  {
    label: "Mapa de câmeras",
    href: "/#mapa-cameras",
    icon: Map,
    disabled: false
  },
  {
    label: "Time Lapse",
    href: "/",
    icon: PlayCircle,
    disabled: false
  }
];

export function Navbar() {
  return (
    <header className="bg-white">
      <nav className="proxlive-container flex min-h-24 flex-col items-center justify-between gap-5 py-5 sm:flex-row">
        <div className="w-full sm:w-auto">
          <Logo brand="proxlive" href="/" />
        </div>

        <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto sm:gap-7">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <a
                key={item.label}
                href={item.href}
                aria-disabled={item.disabled}
                className={`inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition sm:px-3 ${
                  item.disabled
                    ? "cursor-default text-blue-300"
                    : "text-[#4f70b6] hover:bg-blue-50 hover:text-proxlive-blue"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.8} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </div>

        <div className="hidden w-40 sm:block" aria-hidden="true" />
      </nav>
    </header>
  );
}
