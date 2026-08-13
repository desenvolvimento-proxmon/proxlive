"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle, Share2 } from "lucide-react";
import { track } from "@/lib/analytics";

type ShareButtonProps = {
  title: string;
  text?: string;
  /** Slug da câmera, para saber o que mais é compartilhado. */
  camera?: string;
};

export function ShareButton({ title, text, camera }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  function report(method: string) {
    track("share_click", { camera, method });
  }

  async function handleClick() {
    const url = window.location.href;

    // No celular, o menu nativo é o caminho mais curto para o WhatsApp.
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        report("native");
        return;
      } catch {
        // Usuário cancelou ou o navegador recusou: cai no menu próprio.
      }
    }

    setOpen((current) => !current);
  }

  function handleWhatsapp() {
    const message = encodeURIComponent(`${title}\n${window.location.href}`);
    window.open(
      `https://wa.me/?text=${message}`,
      "_blank",
      "noopener,noreferrer"
    );
    report("whatsapp");
    setOpen(false);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      report("copy");
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
        onClick={handleClick}
        aria-expanded={open}
        className="btn btn-sm btn-on-dark"
      >
        {copied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
        <span>{copied ? "Link copiado" : "Compartilhar"}</span>
      </button>

      {open ? (
        <div className="animate-fade-in absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-ink-100 bg-white p-1 text-sm shadow-e4">
          <button
            type="button"
            onClick={handleWhatsapp}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-ink-700 transition-colors hover:bg-ink-50 hover:text-ink-900"
          >
            <MessageCircle className="h-4 w-4 text-brand-500" />
            Enviar pelo WhatsApp
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-ink-700 transition-colors hover:bg-ink-50 hover:text-ink-900"
          >
            <Copy className="h-4 w-4 text-brand-500" />
            Copiar link
          </button>
        </div>
      ) : null}
    </div>
  );
}
