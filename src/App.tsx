import { useState } from "react";
import { useParams } from "react-router-dom";
import { TermsConsent } from "./components/terms-consent";
import { AcceptOrRefuseTerms } from "./components/accept-or-refuse-terms";
import { FollowInstructions } from "./components/follow-instructions";

export default function App() {
  const { hash } = useParams();
  const [step, setStep] = useState(1);

  function nextStep() {
    setStep((prevStep) => prevStep + 1);
  }

  function prevStep() {
    setStep((prevStep) => prevStep - 1);
  }

  return (
    <>
      {(step === 1 || step === 2) && (
        <main className="w-full max-w-[1200px] mx-auto p-5 flex flex-col">
          {step === 1 && (
            <TermsConsent hash={hash as string} handleNextStep={nextStep} />
          )}
          {step === 2 && (
            <AcceptOrRefuseTerms
              handlePrevStep={prevStep}
              handleNextStep={nextStep}
            />
          )}
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
