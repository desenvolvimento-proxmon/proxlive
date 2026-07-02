"use client";

import { useState } from "react";
import { Copy, MessageCircle, Share2 } from "lucide-react";

type ShareButtonProps = {
  title: string;
};

export function ShareButton({ title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  function getShareUrl() {
    return window.location.href;
  }

  function handleWhatsapp() {
    const url = getShareUrl();
    const text = encodeURIComponent(`${title}\n${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  async function handleCopy() {
    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setOpen(false);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-proxlive-blue bg-white px-3 py-2 text-xs font-semibold text-proxlive-blue transition hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
      >
        <Share2 className="h-4 w-4" />
        <span>{copied ? "Link copiado" : "Compartilhar"}</span>
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 text-sm shadow-lg">
          <button
            type="button"
            onClick={handleWhatsapp}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-neutral-800 transition hover:bg-blue-50"
          >
            <MessageCircle className="h-4 w-4 text-proxlive-blue" />
            Enviar pelo WhatsApp
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-neutral-800 transition hover:bg-blue-50"
          >
            <Copy className="h-4 w-4 text-proxlive-blue" />
            Copiar link
          </button>
        </div>
      ) : null}
    </div>
  );
}
