"use client";

import { MessageCircle } from "lucide-react";

const numero = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5512999999999";

/** CTA flutuante sempre visível para falar com um consultor. */
export function WhatsAppCTA() {
  const href = `https://wa.me/${numero}?text=${encodeURIComponent(
    "Olá! Quero falar sobre o consórcio Porto Prime.",
  )}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-pill bg-success px-4 py-3 font-semibold text-white shadow-lg transition-transform hover:scale-105"
    >
      <MessageCircle className="h-5 w-5" aria-hidden />
      <span className="hidden sm:inline">Falar no WhatsApp</span>
    </a>
  );
}
