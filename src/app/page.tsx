import Link from "next/link";
import { ArrowRight, Home, Car, Trees, Truck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";

const modalidades = [
  { icon: Home, label: "Imóvel" },
  { icon: Car, label: "Automóvel" },
  { icon: Trees, label: "Terreno" },
  { icon: Truck, label: "Pesados" },
];

const beneficios = [
  "Sem juros — você paga o valor da carta diluído em parcelas",
  "Parcela reduzida até ser contemplado",
  "Use a carta para comprar à vista e negociar melhor",
];

export default function HomePage() {
  return (
    <>
      <header className="bg-porto text-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <span className="font-heading text-lg font-bold tracking-tight">
            Porto Prime <span className="text-prime">Consórcios</span>
          </span>
          <span className="hidden text-xs text-white/70 sm:block">
            Representante autorizado Porto Bank
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5">
        <section className="py-10 sm:py-14">
          <p className="mb-3 inline-block rounded-pill bg-prime/15 px-3 py-1 text-xs font-semibold text-porto-deep">
            Imóveis · Autos · Terrenos · Pesados
          </p>
          <h1 className="font-heading text-3xl font-bold leading-tight text-porto-deep sm:text-4xl">
            Você realiza seu próximo bem com o consórcio Porto.
          </h1>
          <p className="mt-4 text-lg text-ink/80">
            Simule sua carta de crédito em menos de 2 minutos. Sem juros, parcelas que
            cabem no bolso e a segurança de quem é{" "}
            <strong>representante autorizado Porto Bank</strong>.
          </p>

          <div className="mt-7">
            <Button asChild size="lg">
              <Link href="/onboarding/simulacao">
                Simular agora <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
            </Button>
            <p className="mt-2 text-xs text-ink/50">
              Estimativa transparente — não é o cálculo oficial do Porto Bank.
            </p>
          </div>

          <ul className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {modalidades.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex flex-col items-center gap-2 rounded-2xl border border-soft bg-white p-4 text-center"
              >
                <Icon className="h-7 w-7 text-porto" aria-hidden />
                <span className="text-sm font-medium text-ink">{label}</span>
              </li>
            ))}
          </ul>

          <ul className="mt-9 space-y-3">
            {beneficios.map((b) => (
              <li key={b} className="flex items-start gap-3 text-ink/85">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <Footer />
    </>
  );
}
