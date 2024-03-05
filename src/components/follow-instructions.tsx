import { Button } from "./ui/button";

import logoFlexBranco from "@/assets/logo-branco.png";
import imagemPasso01 from "@/assets/image-passo-01.svg";

type FollowInstructionsProps = {
  handleNextStep: () => void;
};

export function FollowInstructions({
  handleNextStep,
}: FollowInstructionsProps) {
  return (
    <div className="bg-orange-500 w-full min-h-screen flex flex-col items-center p-5">
      <header className="w-full flex mb-40">
        <img
          className="w-[150px]"
          src={logoFlexBranco}
          alt="Logotipo da Flex Consulta branco"
        />
      </header>

      <div className="flex flex-col items-center gap-2">
        <img
          className="w-60 mb-5"
          src={imagemPasso01}
          alt="Uma mão segurando um smartphone"
        />

        <h2 className="text-lg text-white font-bold">
          Vamos tirar uma selfie?
        </h2>

        <div className="flex flex-col items-start mt-5 gap-3">
          <h4 className="text-gray-50 text-sm">
            - Com essa foto faremos a validação da sua identidade
          </h4>
          <h4 className="text-gray-50 text-sm">- Evite lugares escuros</h4>
          <h4 className="text-gray-50 text-sm">
            - Não use óculos escuros, bonés ou outros acessórios que escondam o
            seu rosto
          </h4>
          <h4 className="text-gray-50 text-sm">
            - Centralize o rosto no círculo e olhe fixamente na câmera do
            celular
          </h4>
        </div>

        <Button
          variant="secondary"
          className="w-60 mt-5"
          onClick={handleNextStep}
        >
          Iniciar
        </Button>
      </div>
    </div>
  );
}
