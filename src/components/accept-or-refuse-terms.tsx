import { Button } from "./ui/button";

import logoFlex from "../assets/logo-laranja.png";

type AcceptOrRefuseTermsProps = {
  handlePrevStep: () => void;
  handleNextStep: () => void;
};

export function AcceptOrRefuseTerms({
  handlePrevStep,
  handleNextStep,
}: AcceptOrRefuseTermsProps) {
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <header className="w-full mb-40">
        <img
          className="w-[200px]"
          src={logoFlex}
          alt="Logotipo laranja da Flex Consulta"
        />
      </header>

      <div className="flex flex-col p-5">
        <h3 className="text-sm mb-5 text-gray-500">
          Oi{" "}
          <span className="text-orange-500 font-bold">
            GUILHERME FREITAS DE LIMA
          </span>
          , foi solicitado
          <br /> uma validação da biometria facial pela seguinte
          <br />
          empresa:
        </h3>

        <h3 className="font-semibold text-sm text-gray-500">
          Razão social: <span className="font-normal">Flex Consulta</span>
        </h3>
        <h3 className="font-semibold text-sm text-gray-500">
          Nome fantasia: <span className="font-normal">Flex Consulta</span>
        </h3>
        <h3 className="font-semibold text-sm text-gray-500">
          CNPJ da empresa:{" "}
          <span className="font-normal">42.520.419/0001-14</span>
        </h3>

        <h3 className="font-semibold text-sm text-gray-500 my-5">
          Solicitante: <span className="font-normal">Guilherme Lima</span>
        </h3>

        <div className="flex flex-col gap-2">
          <Button onClick={handleNextStep}>Aceitar validação</Button>
          <Button variant="outline">Recusar validação</Button>
          <Button variant="destructive" onClick={handlePrevStep} disabled>
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
}
