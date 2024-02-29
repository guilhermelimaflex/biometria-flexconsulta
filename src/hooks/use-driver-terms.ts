/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { api } from "@/services/axios";

const SweetAlert = withReactContent(Swal);

export type DriverTermsResponse = {
  nome_mot: string;
  celular_mot: string;
  cnpj_empresa: string;
  cpf_mot: string;
  data_validacao: string;
  email_dpo_empresa: string;
  empresa: string;
  etapas_concluidas: string;
  logo_transp: string;
  solicitante: string;
  tel_transp: string;
};

type CreateDriverTermsRequest = {
  hash: string;
  latitude?: number;
  longitude?: number;
  address: string;
};

export function useDriverTerms() {
  const [driverTerms, setDriverTerms] = useState<DriverTermsResponse>(
    {} as DriverTermsResponse
  );
  const [loadingGetDriverTerms, setLoadingGetDriverTerms] = useState(false);
  const [loadingCreateDriverTerms, setLoadingCreateDriverTerms] =
    useState(false);
  const [permissions, setPermissions] = useState<string>("");

  function locationTimer() {
    setInterval(() => {
      if (navigator.geolocation) {
        navigator.permissions
          .query({ name: "geolocation" })
          .then(function (result) {
            if (result.state == "granted") {
              setPermissions("granted");
            } else if (result.state == "prompt") {
              setPermissions("prompt");
            } else if (result.state == "denied") {
              setPermissions("denied");
            }
          });
      }
    }, 1000);
  }

  const getDriverTerms = useCallback(async (hash: string) => {
    try {
      setLoadingGetDriverTerms(true);

      const response = await api.get(`/acesso/motorista/termo/${hash}`);

      if (response) {
        const map = new Map(
          Object.entries(JSON.parse(response.data?.etapas_concluidas))
        );

        if (map.size === 4) {
          setDriverTerms(response.data);
          locationTimer();
        } else {
          SweetAlert.fire({
            icon: "error",
            title: "Atenção",
            text: "O termo deste processo já foi respondido!",
            confirmButtonColor: "#F9802D",
          }).then(() => {
            setTimeout(() => {
              window.location.href = "https://www.flexconsulta.com.br";
            }, 2000);
          });
        }
      }
    } catch (error) {
      SweetAlert.fire({
        icon: "error",
        title: "Atenção",
        text: "Erro ao carregar o termo!",
        confirmButtonColor: "#F9802D",
      }).then(() => {
        setTimeout(() => {
          window.location.href = "https://www.flexconsulta.com.br";
        }, 2000);
      });
    } finally {
      setLoadingGetDriverTerms(false);
    }
  }, []);

  const createDriverTerms = useCallback(
    async ({
      hash,
      latitude,
      longitude,
      address,
    }: CreateDriverTermsRequest) => {
      try {
        setLoadingCreateDriverTerms(true);

        await api.post("/acesso/motorista/termo", {
          hash_token: hash,
          aceito_termo: true,
          geo_localizacao: {
            endereço: address,
            latitude,
            longitude,
          },
        });
      } catch (error: any) {
        SweetAlert.fire({
          icon: "error",
          title: error?.response?.data.message || error,
        });
      } finally {
        setLoadingCreateDriverTerms(false);
      }
    },
    []
  );

  return {
    driverTerms,
    loadingGetDriverTerms,
    loadingCreateDriverTerms,
    permissions,
    locationTimer,
    getDriverTerms,
    createDriverTerms,
  };
}
