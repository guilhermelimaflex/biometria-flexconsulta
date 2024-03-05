import { useState } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/header";
import { TermsConsent } from "@/components/terms-consent";
import { FollowInstructions } from "@/components/follow-instructions";

export default function App() {
  const { hash } = useParams();
  const [step, setStep] = useState<number>(0);

  function nextStep() {
    setStep((prevStep: number) => prevStep + 1);
  }

  function showStepsTitle() {
    let title: string = "";
    let text: string = "";

    if (step === 0) {
      title = "TERMOS DE CONSENTIMENTO";
      text = "Nova validação: Biometria Facial";
    } else if (step === 1) {
      title = "ACEITE DA VALIDAÇÃO";
      text = "";
    }

    return {
      title,
      text,
    };
  }

  const { title, text } = showStepsTitle();

  return (
    <>
      {step === 0 && (
        <main className="w-full max-w-[600px] mx-auto p-5 flex flex-col">
          <Header title={title} text={text} />
          {step === 0 && (
            <TermsConsent hash={hash as string} handleNextStep={nextStep} />
          )}

          {/* <Stepper
            activeStep={step}
            steps={[
              { label: "Termos de consentimento" },
              { label: "Aceite de validação" },
              { label: "Instruções para a biometria" },
            ]}
            connectorStateColors
            connectorStyleConfig={{
              size: 2,
              activeColor: "#F9802D",
              completedColor: "#F9802D",
              stepSize: 30,
              disabledColor: "#F9802D",
              style: "#F9802D",
            }}
          /> */}
        </main>
      )}
      {step === 1 && <FollowInstructions handleNextStep={nextStep} />}
    </>
  );
}
