import { notFound } from "next/navigation";
import { STEP_SLUGS, type StepSlug } from "@/lib/consts";
import { SimulacaoStep } from "@/components/steps/SimulacaoStep";
import { ResultadoStep } from "@/components/steps/ResultadoStep";
import { CadastroStep } from "@/components/steps/CadastroStep";
import { QualificacaoStep } from "@/components/steps/QualificacaoStep";
import { ConfirmacaoStep } from "@/components/steps/ConfirmacaoStep";

export function generateStaticParams() {
  return STEP_SLUGS.map((step) => ({ step }));
}

const COMPONENTS: Record<StepSlug, React.ComponentType> = {
  simulacao: SimulacaoStep,
  resultado: ResultadoStep,
  cadastro: CadastroStep,
  qualificacao: QualificacaoStep,
  confirmacao: ConfirmacaoStep,
};

export default async function OnboardingStepPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = await params;
  if (!STEP_SLUGS.includes(step as StepSlug)) notFound();
  const StepComponent = COMPONENTS[step as StepSlug];
  return <StepComponent />;
}
