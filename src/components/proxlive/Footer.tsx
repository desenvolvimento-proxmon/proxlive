import Image from "next/image";
import { Instagram, MessageCircle } from "lucide-react";
import { socialLinks } from "@/lib/proxlive-data";

type FooterProps = {
  variant?: "white" | "blue";
};

export function Footer({ variant = "white" }: FooterProps) {
  const isBlue = variant === "blue";

  return (
    <footer
      className={`py-16 sm:py-20 ${
        isBlue ? "bg-proxlive-blue text-white" : "bg-white text-neutral-900"
      }`}
    >
      <div className="proxlive-container">
        <Image
          src={
            isBlue
              ? "/images/brand/proxmon-logo-branca.png"
              : "/images/brand/proxmon-logo-colorida.png"
          }
          alt="PROXMON"
          width={9629}
          height={1689}
          className="h-auto w-[230px] sm:w-[280px]"
        />

        <div className="mt-14">
          <p className="text-base">Email:</p>
          <a
            href="mailto:atendimento@proxmon.com.br"
            className="mt-1 block text-lg font-medium"
          >
            atendimento@proxmon.com.br
          </a>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <a
            href={socialLinks.whatsapp}
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-white/10"
          >
            <MessageCircle className="h-6 w-6" />
          </a>
          <a
            href={socialLinks.instagram}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-white/10"
          >
            <Instagram className="h-6 w-6" />
          </a>
        </div>
      </div>
    </footer>
  );
}
