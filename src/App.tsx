import { useState } from "react";
import { useParams } from "react-router-dom";
import { Stepper } from "react-form-stepper";
import { Header } from "@/components/header";
import { TermsConsent } from "@/components/terms-consent";
import { AcceptOrRefuseTerms } from "@/components/accept-or-refuse-terms";
import { FollowInstructions } from "@/components/follow-instructions";

export default function App() {
  const { hash } = useParams();
  const [step, setStep] = useState<number>(1);

  function nextStep() {
    setStep((prevStep: number) => prevStep + 1);
  }

  function prevStep() {
    setStep((prevStep: number) => prevStep - 1);
  }

  function showStepsTitle() {
    let title: string = "";
    let text: string = "";

    if (step === 1) {
      title = "TERMOS DE CONSENTIMENTO";
      text = "Nova validação: Biometria Facial";
    } else if (step === 2) {
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
      {(step === 1 || step === 2) && (
        <main className="w-full max-w-[1200px] mx-auto p-5 flex flex-col">
          <Header title={title} text={text} />

          <Stepper
            activeStep={step}
            steps={[
              { label: "Termos de consentimento" },
              { label: "Aceite de validação" },
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
          />

          {step === 1 && (
            <TermsConsent hash={hash as string} handleNextStep={nextStep} />
          )}
          {step === 2 && <AcceptOrRefuseTerms handleNextStep={nextStep} />}
        </main>
      )}
      {step === 3 && (
        <FollowInstructions
          handlePrevStep={prevStep}
          handleNextStep={nextStep}
        />
      )}
    </>
  );
}
