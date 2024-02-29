import { useEffect, useState } from "react";
import { useGeolocated } from "react-geolocated";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useDriverTerms } from "@/hooks/use-driver-terms";
import { geoMaps } from "@/services/axios";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";

import logoFlex from "../assets/logo-laranja.png";

const SweetAlert = withReactContent(Swal);

type TermsConsentProps = {
  hash: string;
  handleNextStep: () => void;
};

export function TermsConsent({ hash, handleNextStep }: TermsConsentProps) {
  const [permissionsArray, setPermissionsArray] = useState({
    armazenamento_foto_validacao_cnh: false,
    exibicao_foto_historico_pesquisas: false,
    uso_dados_informativos: false,
    aceite_flex_consulta: false,
    aceite_transportadora: false,
  });
  const [loadingButton, setLoadingButton] = useState(false);

  const {
    permissions,
    driverTerms,
    loadingGetDriverTerms,
    locationTimer,
    getDriverTerms,
    createDriverTerms,
  } = useDriverTerms();
  const { coords, isGeolocationAvailable, getPosition } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 15000,
    },
    watchLocationPermissionChange: true,
    userDecisionTimeout: 5000,
    suppressLocationOnMount: true,
    isOptimisticGeolocationEnabled: false,
    watchPosition: true,
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state !== "granted") {
          SweetAlert.fire({
            title: "Precisamos da sua localização!",
            text: "Para prosseguir aceite a permissão de localização do seu navegador.",
            confirmButtonColor: "#142939",
            imageHeight: 60,
            imageAlt: "Custom image",
            showConfirmButton: true,
            confirmButtonText: "Fechar",
            allowOutsideClick: false,
          }).then((result) => {
            if (result.isConfirmed) {
              getPosition();
            }
          });
        } else {
          getPosition();
          SweetAlert.close();
        }
      });
    } else {
      console.log(
        "O serviço de geolocalização não é suportado pelo seu browser."
      );
    }
  }, [permissions, getPosition]);

  useEffect(() => {
    if (!isGeolocationAvailable) {
      SweetAlert.fire({
        icon: "error",
        title: "Atenção",
        text: "Este dispositivo não suporta serviços de Geolocalização!",
      });
    }
  }, [isGeolocationAvailable]);

  useEffect(() => {
    locationTimer();
  }, [locationTimer]);

  useEffect(() => {
    getPosition();
  }, [permissionsArray, getPosition]);

  async function acceptDriverTerms() {
    try {
      setLoadingButton(true);
      const latLong = `${coords?.latitude},${coords?.longitude}`;

      const responseMaps = await geoMaps.get("/json", {
        params: {
          key: "AIzaSyAq86ahNcJji2YKjqO_xwhNhjBMzol6-pg",
          latlng: latLong,
        },
      });

      if (responseMaps) {
        await createDriverTerms({
          hash,
          address: responseMaps.data.results[0].formatted_address,
          latitude: coords?.latitude,
          longitude: coords?.longitude,
        });

        handleNextStep();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingButton(false);
    }
  }

  async function handleConfirm() {
    getPosition();

    if (isGeolocationAvailable) {
      await acceptDriverTerms();
    } else {
      SweetAlert.fire({
        icon: "error",
        title: "Atenção",
        text: "Aceite as permissões de localização para continuar!",
      });
    }
  }

  function handleCancel() {
    SweetAlert.fire({
      title: "Cancelar?",
      text: "Deseja cancelar a solicitação?",
      icon: "question",
      confirmButtonText: "Sim confirmo!",
      cancelButtonText: "Não",
      showCancelButton: true,
      confirmButtonColor: "#F9802D",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = "https://flexconsulta.com.br/";
      }
    });
  }

  useEffect(() => {
    getDriverTerms(hash as string);
  }, [hash, getDriverTerms]);

  return (
    <>
      <div className="flex xl:flex-row flex-col items-center">
        <div className="flex items-center justify-start">
          <img
            className="w-[250px]"
            src={logoFlex}
            alt="Logotipo laranja da Flex Consulta"
          />
        </div>

        <div className="xl:ml-72">
          <h1 className="text-3xl font-semibold">TERMO DE CONSENTIMENTO</h1>
          <h3 className="text-xl xl:text-center mt-1 font-semibold">
            Nova validação: Biometria Facial
          </h3>
        </div>
      </div>

      {loadingGetDriverTerms ? (
        <div className="w-full flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col mt-10">
            <h3 className="font-semibold">
              Oi{" "}
              <span className="text-orange-500 font-bold">
                {driverTerms?.nome_mot}
              </span>
              , foi solicitado uma validação da biometria facial pela seguinte
              empresa:
            </h3>

            <div className="flex gap-1 font-bold mt-5">
              <span>Empresa Solicitante:</span>
              <span>{driverTerms?.empresa}</span>
            </div>

            <div className="flex gap-1 font-bold">
              <span>CNPJ:</span>
              <span>{driverTerms?.cnpj_empresa}</span>
            </div>

            <div className="flex gap-1 font-bold">
              <span>Usuário Solicitante:</span>
              <span>{driverTerms?.solicitante}</span>
            </div>

            <div className="flex gap-1 font-bold">
              <span>Contato:</span>
              <span>{driverTerms?.tel_transp}</span>
            </div>
          </div>

          <ScrollArea className="w-full h-[280px] rounded-md pr-5 mt-7">
            <div>
              <div className="mt-1">
                <p className="text-justify text-sm">
                  Eu, {driverTerms?.nome_mot}, inscrito no CPF nº
                  {driverTerms?.cpf_mot}, declaro que fui orientado(a) de forma
                  clara sobre o tratamento de Dados Pessoais pelo FLEX CONSULTA
                  (CASIMIRO & MIRANDA SERVICOS LTDA, inscrito no CNPJ
                  42.520.419/0001-14), conforme as disposições abaixo:
                </p>
              </div>
              <div>
                <h4 className="text-sm font-bold my-2">1. Autorização</h4>
                <p className="text-justify text-sm">
                  Em observância à Lei nº. 13.709/18 – Lei Geral de Proteção de
                  Dados Pessoais e demais normativas aplicáveis sobre proteção
                  de Dados Pessoais, manifesto-me de forma informada, livre,
                  expressa e consciente, no sentido de autorizar o FLEX CONSULTA
                  a realizar o tratamento de meus Dados Pessoais para as
                  finalidades e de acordo com as condições aqui estabelecidas.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-bold my-2">
                  2. Finalidades do tratamento
                </h4>
                <p className="text-justify text-sm mb-2">
                  Os meus Dados Pessoais poderão ser utilizados pelo FLEX
                  CONSULTA para:
                </p>
                <p className="pl-3 text-justify text-sm">
                  2.1 Cumprir as obrigações contratuais, legais e regulatórias
                  do SISTEMA FLEX, em razão de suas atividades;
                </p>
                <p className="pl-3 text-justify text-sm">
                  2.2. Execução de seus programas e prestação de serviços;
                </p>
                <p className="pl-3 text-justify text-sm">
                  2.3. Oferecer produtos e serviços que sejam do meu interesse;
                </p>
                <p className="pl-3 text-justify text-sm">
                  2.4. Compartilhar com os clientes Flex, histórico de viagens
                  realizadas junto a transportadora para qual houve prestação de
                  serviço que é cliente Flex.
                </p>
                <p className="pl-3 text-justify text-sm">
                  2.5. Realizar a comunicação oficial pelo SISTEMA FLEX ou por
                  seus prestadores de serviço, por meio de canais de comunicação
                  (telefone, e-mail, SMS e WhatsApp);
                </p>
                <p className="pl-3 text-justify text-sm">
                  2.6. Armazenar a foto coletada durante a validação de
                  biometria facial para fins de comprovação e histórico de
                  consulta realizada garantindo a veracidade da consulta;
                </p>
                <p className="pl-3 text-justify text-sm">
                  2.7. Armazenar meu número de telefone, utilizado durante a
                  validação de biometria facial para garantir a veracidade da
                  consulta;
                </p>
                <p className="pl-3 text-justify text-sm">
                  2.8. Armazenar número de registro e categoria da CNH,
                  utilizado para validação de biometria facial;
                </p>
                <p className="text-justify text-sm mt-2">
                  Estou ciente que a FLEX CONSULTA poderá compartilhar os meus
                  Dados Pessoais com seus parceiros e demais prestadores de
                  serviços, restringindo-se às funções e atividades por cada um
                  desempenhadas e em aderência às finalidades acima
                  estabelecidas.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-bold my-2">3. Confidencialidade</h4>
                <p className="text-sm text-justify">
                  Estou ciente do compromisso assumido pela FLEX CONSULTA de
                  tratar os meus Dados Pessoais de forma sigilosa e
                  confidencial, mantendo-os em ambiente seguro e não sendo
                  utilizados para qualquer fim que não os descritos acima.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-bold my-2">
                  4. Governança e Segurança dos Dados
                </h4>
                <p className="pl-3 text-justify text-sm">
                  4.1. A CONTRATADA compromete-se a adotar medidas, ferramentas
                  e tecnologias necessárias para garantir a segurança dos dados
                  e cumprir com suas obrigações, sempre considerando o estado da
                  técnica disponível e as bases contratuais originais.
                </p>
                <p className="pl-3 text-justify text-sm mt-2">
                  4.2. A CONTRATADA manterá registro das operações de tratamento
                  dos dados pessoais que realizar, implementando medidas
                  técnicas e organizacionais necessárias para proteger os dados
                  contra a destruição, acidental ou ilícita, a perda, a
                  alteração, a comunicação ou difusão ou o acesso não
                  autorizado, além de garantir que os ambientes (seja ele físico
                  ou lógico) utilizados por ela para o tratamento de dados
                  pessoais sejam estruturados de forma a atender os requisitos
                  de segurança, previstos em boas práticas e de governança e aos
                  princípios gerais previstos em Lei e às demais normas
                  regulamentares aplicáveis.
                </p>
                <p className="pl-3 text-justify text-sm mt-2">
                  4.3. Em que pese os melhores esforços da CONTRATADA em
                  proteger as informações, é dever de cada CONTRATANTE a
                  responsabilidade de garantir e assegurar que seus computadores
                  se encontrem adequadamente protegido contra softwares nocivos,
                  como vírus, spywares, adwares, acesso remoto não autorizado,
                  dentre outras atividades e programas maliciosos no meio
                  digital.
                </p>
                <p className="pl-3 text-justify text-sm mt-2">
                  4.4. A CONTRATANTE declara estar ciente de que é responsável
                  pela adoção de medidas de segurança adequadas, como, por
                  exemplo, a configuração segura de seu navegador, utilização de
                  programa antivírus atualizado, firewall, IPS, WAF (Web
                  Application Firewall), atualizar seus softwares dos servidores
                  e nos computadores, criar utilizar programas desenvolvidos com
                  técnicas que garantam segurança, não utilização de software de
                  origem ilegal ou duvidosa, utilizar senhas seguras e
                  complexas, e demais melhores práticas de segurança, dentre
                  outros, sem os quais o risco de os dados pessoais e senhas
                  serem acessados por terceiros, sem autorização para tal, é
                  consideravelmente maior.
                </p>
                <p className="pl-3 text-justify text-sm mt-2">
                  4.5. Diante disso, a CONTRATANTE exime expressamente a
                  CONTRATADA de quaisquer responsabilidades por eventuais
                  incidentes de vazamento de dados e dos danos e/ou prejuízos
                  decorrentes de eventual invasão no Portal de Acesso utilizado
                  pela CONTRATANTE para acessar os servidores da CONTRATADA, bem
                  como de demais falhas relacionadas à segurança dos dados
                  coletados, salvo na hipótese de dolo ou culpa da CONTRATADA.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-bold my-2">5. Revogação</h4>
                <p className="text-justify text-sm">
                  Estou ciente que, a qualquer tempo, posso retirar o
                  consentimento ora fornecido, hipótese em que as atividades
                  desenvolvidas pela FLEX CONSULTA, no âmbito de nossa relação,
                  poderão restar prejudicadas.
                </p>
                <p className="text-justify text-sm mt-2">
                  Declaro e concordo que os meus Dados Pessoais poderão ser
                  armazenados em até 5 anos, mesmo após o término do tratamento
                  – inclusive após a revogação do consentimento –, (i) para
                  cumprimento de obrigação legal ou regulatória pela FLEX
                  CONSULTA ou (ii) desde que tornados anônimos.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-bold my-2">
                  6. Comprometimento a LGPD
                </h4>
                <p className="text-justify text-sm">
                  Por meio do presente instrumento, a FLEX CONSULTA, seja na
                  condição de controladora ou operadora de dados, em decorrência
                  da relação contratual havida com a CONTRATANTE, reitera seu
                  compromisso com a estrita observância dos princípios
                  norteadores da Lei Geral de Proteção de Dados Pessoais (Lei
                  nº. 13.709/18), reafirmando tudo o quanto exposto em sua
                  Política de Privacidade e Proteção de Dados, à qual a
                  CONTRATANTE declara ter tido acesso e concordar com o seu
                  inteiro teor.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-bold my-2">
                  7. Canal de Atendimento
                </h4>
                <p className="text-justify text-sm">
                  Estou ciente que posso utilizar o canal de atendimento à LGPD
                  da FLEX CONSULTA, por meio do endereço
                  dpo@flexconsulta.com.br, para tirar dúvidas e/ou realizar
                  solicitações relacionadas ao tratamento dos meus Dados
                  Pessoais.
                </p>
                <p className="text-justify mt-2 text-sm">
                  Por fim, declaro ter lido e ter sido suficientemente informado
                  sobre o conteúdo deste Termo e concordo com o tratamento dos
                  meus Dados Pessoais aqui descrito de forma livre e
                  esclarecida, em observância à Lei Geral de Proteção de Dados e
                  às demais normativas sobre proteção de Dados Pessoais
                  aplicáveis.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-bold my-2">
                  8. Canal de Comunicação
                </h4>
                <p className="text-justify text-sm">
                  Manifesto-me de forma informada, livre, expressa e consciente,
                  no sentido de autorizar o SISTEMA FLEX CONSULTA a realizar
                  contato comigo através dos seguintes canais:
                </p>
                {driverTerms?.email_dpo_empresa && (
                  <p className="mb-1 text-justify">
                    {driverTerms?.email_dpo_empresa};
                  </p>
                )}
                <p className="text-justify mt-5 text-sm font-bold">
                  App Flex Consulta.
                </p>
              </div>
            </div>
          </ScrollArea>

          <div className="flex flex-col mt-10 gap-4 font-semibold text-gray-500">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                className="rounded-md"
                checked={
                  permissionsArray.armazenamento_foto_validacao_cnh &&
                  permissionsArray.exibicao_foto_historico_pesquisas &&
                  permissionsArray.uso_dados_informativos &&
                  permissionsArray.aceite_flex_consulta &&
                  permissionsArray.aceite_transportadora
                }
                onCheckedChange={(isChecked: boolean) => {
                  if (isChecked) {
                    setPermissionsArray({
                      armazenamento_foto_validacao_cnh: true,
                      exibicao_foto_historico_pesquisas: true,
                      uso_dados_informativos: true,
                      aceite_flex_consulta: true,
                      aceite_transportadora: true,
                    });
                  } else {
                    setPermissionsArray({
                      armazenamento_foto_validacao_cnh: false,
                      exibicao_foto_historico_pesquisas: false,
                      uso_dados_informativos: false,
                      aceite_flex_consulta: false,
                      aceite_transportadora: false,
                    });
                  }
                }}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Aceitar todos
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                className="rounded-md"
                checked={permissionsArray.armazenamento_foto_validacao_cnh}
                defaultChecked={
                  permissionsArray.armazenamento_foto_validacao_cnh
                }
                onCheckedChange={(isChecked: boolean) => {
                  if (isChecked) {
                    setPermissionsArray((prevPermissions) => {
                      return {
                        ...prevPermissions,
                        armazenamento_foto_validacao_cnh: true,
                      };
                    });
                  } else {
                    setPermissionsArray((prevPermissions) => {
                      return {
                        ...prevPermissions,
                        armazenamento_foto_validacao_cnh: false,
                      };
                    });
                  }
                }}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Armazenar foto da validação da CNH
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                className="rounded-md"
                checked={permissionsArray.exibicao_foto_historico_pesquisas}
                defaultChecked={
                  permissionsArray.exibicao_foto_historico_pesquisas
                }
                onCheckedChange={(isChecked: boolean) => {
                  if (isChecked) {
                    setPermissionsArray((prevPermissions) => {
                      return {
                        ...prevPermissions,
                        exibicao_foto_historico_pesquisas: true,
                      };
                    });
                  } else {
                    setPermissionsArray((prevPermissions) => {
                      return {
                        ...prevPermissions,
                        exibicao_foto_historico_pesquisas: false,
                      };
                    });
                  }
                }}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Exibição da foto na pesquisa de viagens realizadas
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                className="rounded-md"
                checked={permissionsArray.uso_dados_informativos}
                defaultChecked={permissionsArray.uso_dados_informativos}
                onCheckedChange={(isChecked: boolean) => {
                  if (isChecked) {
                    setPermissionsArray((prevPermissions) => {
                      return {
                        ...prevPermissions,
                        uso_dados_informativos: true,
                      };
                    });
                  } else {
                    setPermissionsArray((prevPermissions) => {
                      return {
                        ...prevPermissions,
                        uso_dados_informativos: false,
                      };
                    });
                  }
                }}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Coleta de dados pessoais (nome, CPF, celular e nº da CNH)
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                className="rounded-md"
                checked={permissionsArray.aceite_flex_consulta}
                defaultChecked={permissionsArray.aceite_flex_consulta}
                onCheckedChange={(isChecked: boolean) => {
                  if (isChecked) {
                    setPermissionsArray((prevPermissions) => {
                      return { ...prevPermissions, aceite_flex_consulta: true };
                    });
                  } else {
                    setPermissionsArray((prevPermissions) => {
                      return {
                        ...prevPermissions,
                        aceite_flex_consulta: false,
                      };
                    });
                  }
                }}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Li e concordo com os termos da Flex Consulta
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                className="rounded-md"
                checked={permissionsArray.aceite_transportadora}
                defaultChecked={permissionsArray.aceite_transportadora}
                onCheckedChange={(isChecked: boolean) => {
                  if (isChecked) {
                    setPermissionsArray((prevPermissions) => {
                      return {
                        ...prevPermissions,
                        aceite_transportadora: true,
                      };
                    });
                  } else {
                    setPermissionsArray((prevPermissions) => {
                      return {
                        ...prevPermissions,
                        aceite_transportadora: false,
                      };
                    });
                  }
                }}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Li e concordo com os termos - Flex Consulta
              </label>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-2 mt-2">
              <Button
                className="w-full md:w-40"
                onClick={handleConfirm}
                disabled={loadingButton}
              >
                {loadingButton ? "Confirmando..." : "Confirmar"}
              </Button>
              <Button
                className="w-full md:w-40"
                variant="outline"
                onClick={handleCancel}
                disabled={loadingButton}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
