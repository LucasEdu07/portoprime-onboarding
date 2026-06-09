"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check } from "lucide-react";
import { STEPS, stepIndex } from "@/lib/consts";
import { cn } from "@/lib/utils";

/** Cabeçalho do wizard: marca + stepper acessível + barra de progresso. */
export function WizardHeader() {
  const pathname = usePathname();
  const slug = pathname.split("/").pop() ?? "simulacao";
  const current = Math.max(0, stepIndex(slug));
  const pct = ((current + 1) / STEPS.length) * 100;

  return (
    <header className="sticky top-0 z-40 border-b border-soft bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-3xl px-5 py-3">
        <div className="mb-3 flex items-center justify-between">
          <Link href="/" className="font-heading text-base font-bold text-porto-deep">
            Porto Prime <span className="text-prime">Consórcios</span>
          </Link>
          <span className="text-xs text-ink/60">
            Etapa {current + 1} de {STEPS.length}
          </span>
        </div>

        <ol className="flex items-center gap-1" aria-label="Progresso do cadastro">
          {STEPS.map((step, i) => {
            const done = i < current;
            const active = i === current;
            return (
              <li key={step.slug} className="flex flex-1 items-center gap-1">
                <span
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    done && "bg-success text-white",
                    active && "bg-porto text-white",
                    !done && !active && "bg-canvas text-ink/50 ring-1 ring-soft",
                  )}
                >
                  {done ? <Check className="h-4 w-4" aria-hidden /> : i + 1}
                </span>
                <span
                  className={cn(
                    "hidden truncate text-xs sm:inline",
                    active ? "font-semibold text-porto-deep" : "text-ink/50",
                  )}
                >
                  {step.curto}
                </span>
                {i < STEPS.length - 1 && (
                  <span
                    className={cn(
                      "ml-1 hidden h-px flex-1 sm:block",
                      done ? "bg-success" : "bg-soft",
                    )}
                    aria-hidden
                  />
                )}
              </li>
            );
          })}
        </ol>

        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-pill bg-canvas sm:hidden">
          <div
            className="h-full rounded-pill bg-porto transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </header>
  );
}
