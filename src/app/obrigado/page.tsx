"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { useOnboarding, useHasHydrated } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/Footer";

const numero = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5512999999999";

export default function ObrigadoPage() {
  const router = useRouter();
  const hydrated = useHasHydrated();
  const { submittedProtocolo, reset } = useOnboarding();

  useEffect(() => {
    // Espera a reidratação: sem isto, um F5 nesta página não acha o protocolo (ainda não
    // lido do localStorage) e redireciona para a home antes de mostrar a confirmação.
    if (hydrated && !submittedProtocolo) router.replace("/");
  }, [hydrated, submittedProtocolo, router]);

  if (!hydrated || !submittedProtocolo) return null;

  const waHref = `https://wa.me/${numero}?text=${encodeURIComponent(
    `Olá! Acabei de enviar meu interesse. Protocolo ${submittedProtocolo}.`,
  )}`;

  return (
    <>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-5 py-12 text-center">
        <CheckCircle2 className="h-16 w-16 text-success" aria-hidden />
        <h1 className="mt-4 font-heading text-3xl font-bold text-porto-deep">
          Interesse enviado!
        </h1>
        <p className="mt-2 max-w-md text-ink/70">
          Recebemos seus dados. Um consultor Porto Prime vai falar com você em breve para
          dar continuidade — sem compromisso.
        </p>

        <Card className="mt-6 w-full max-w-sm">
          <div className="text-xs text-ink/55">Seu protocolo</div>
          <div className="font-heading text-2xl font-bold tracking-wide text-porto">
            {submittedProtocolo}
          </div>
        </Card>

        <div className="mt-8 flex flex-col items-center gap-3">
          <Button asChild size="lg" className="bg-success hover:brightness-95">
            <a href={waHref} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5" aria-hidden /> Adiantar pelo WhatsApp
            </a>
          </Button>
          <Button asChild variant="ghost" onClick={() => reset()}>
            <Link href="/">Voltar ao início</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
