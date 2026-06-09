import { ShieldCheck } from "lucide-react";

/** Rodapé institucional com o disclaimer obrigatório de representante autorizado. */
export function Footer() {
  return (
    <footer className="mt-auto border-t border-soft bg-white">
      <div className="mx-auto flex max-w-3xl flex-col gap-2 px-5 py-6 text-sm text-ink/70">
        <div className="flex items-center gap-2 font-medium text-porto-deep">
          <ShieldCheck className="h-4 w-4" aria-hidden />
          Porto Prime Consórcios
        </div>
        <p>
          Representante autorizado <strong>Porto Bank</strong>. Consórcio de imóveis,
          automóveis, terrenos e veículos pesados — São José dos Campos/SP.
        </p>
        <p className="text-xs text-ink/50">
          Os valores apresentados são <strong>estimativas</strong> e não constituem o cálculo
          oficial do Porto Bank. Consórcio não é financiamento e não há cobrança de juros.
        </p>
      </div>
    </footer>
  );
}
