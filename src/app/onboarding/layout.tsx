import { WizardHeader } from "@/components/wizard/WizardHeader";
import { WhatsAppCTA } from "@/components/WhatsAppCTA";
import { Footer } from "@/components/Footer";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <WizardHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-6 pb-28">{children}</main>
      <WhatsAppCTA />
      <Footer />
    </>
  );
}
