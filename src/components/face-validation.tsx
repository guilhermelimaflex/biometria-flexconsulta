/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-inner-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MultiStep from "react-multistep";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Webcam from "react-webcam";
import * as faceapi from "@vladmandic/face-api";

const SweetAlert = withReactContent(Swal);

let fase = 1;

let timerTimeout: any;
let time: any;

const steps = ["Captura rosto", "Prova de vida", "Validando informações"];

export function FaceValidation() {
  const [status, setStatus] = useState("Iniciando processo");
  const [photo, setPhoto] = useState<any>(null);
  const [processData, setProcessData] = useState<any>(null);
  const [tentativas, setTentativas] = useState(1);
  const [steps, setSteps] = useState(0);
  const [inicia, setInicia] = useState(false);
  const [isMobile, setIsMobile] = useState(
    window.innerWidth < 720 ? true : false
  );
  const navigate = useNavigate();
  const videoRef = useRef<any>();
  const canvasRef = useRef<any>();
  const dataUser = useLocation().state;

  window.addEventListener("popstate", function () {
    this.window.location.reload();
  });

  const exit = useCallback(() => {
    clearInterval(time);
    canvasRef.current = null;

    const videoAux = document?.getElementById("my-video") as HTMLVideoElement;

    videoAux?.srcObject?.getTracks()?.forEach((track: any) => track.stop());
    videoAux?.remove();

    document.getElementById("canvas")?.remove();
    fase = 1;

    navigate("/confirmacao_validacao_remota", {
      state: { data: { ...dataUser } },
    });

    clearTimeout(timerTimeout);
  }, [dataUser, navigate]);

  const runTimer = useCallback(() => {
    timerTimeout = window.setTimeout(() => {
      clearInterval(time);

      SweetAlert.fire({ icon: "error", title: "Tempo excedido!" });
      exit();
    }, 20000);
  }, [exit]);

  const handleResize = () => {
    if (window.innerWidth < 720) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  };

  const faceDetection = useCallback(() => {
    const videoAux = document?.getElementById("my-video") as HTMLVideoElement;

    if (tentativas >= 3 && status != "Processo concluído com sucesso") {
      SweetAlert.fire({
        icon: "error",
        title: "Atenção",
        text: "Não foi possível prosseguir com a validação!",
      });

      exit();

      return;
    }

    time = setInterval(async () => {
      if (fase === 1) setStatus("Detectando rosto");

      const detections = await faceapi
        .detectAllFaces(videoAux, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();
      setInicia(true);

      if (!detections || detections.length === 0) {
        return;
      } else if (detections.length > 1) {
        setStatus("Foi detectado mais de um rosto");
        return;
      }

      canvasRef.current.innerHtml = faceapi.createCanvasFromMedia(videoAux);

      const canvas = document?.createElement("canvas") as any;
      canvas.width = videoAux?.videoWidth;
      canvas.height = videoAux?.videoHeight;
      canvas.getContext("2d").drawImage(videoAux, 0, 0);

      const face = detections[0] as any;

      switch (fase) {
        case 1: {
          function getTop(l: any) {
            return l
              .map((a: any) => a.y)
              .reduce((a: any, b: any) => Math.min(a, b));
          }

          function getMeanPosition(l: any) {
            return l
              .map((a: any) => [a.x, a.y])
              .reduce((a: any, b: any) => [a[0] + b[0], a[1] + b[1]])
              .map((a: any) => a / l.length);
          }

          const eye_right = getMeanPosition(face.landmarks.getRightEye());
          const eye_left = getMeanPosition(face.landmarks.getLeftEye());
          const nose = getMeanPosition(face.landmarks.getNose());
          const mouth = getMeanPosition(face.landmarks.getMouth());
          const jaw = getTop(face.landmarks.getJawOutline());

          const rx = (jaw - mouth[1]) / face.detection.box.height;
          const ry =
            (eye_left[0] + (eye_right[0] - eye_left[0]) / 2 - nose[0]) /
            face.detection.box.width;

          const y = ry.toFixed(2) as any;
          const x = rx.toFixed(2) as any;

          if (y >= -0.03 && y <= 0.3 && x <= -0.3 && x >= -0.5) {
            setStatus("Imagem capturada");
            clearTimeout(timerTimeout);
            setInicia(false);
            clearInterval(time);
            setPhoto(() => canvas);
          } else setStatus("Posicione o rosto dentro do círculo");

          break;
        }
        case 2: {
          if (status != "Pronto, aguarde mais um pouco") {
            setStatus("Agora sorria");

            if (face.expressions.happy.toFixed(2) >= 0.97) {
              setStatus("Imagem capturada");
              clearTimeout(timerTimeout);
              setInicia(false);

              clearInterval(time);
              let id = window.setTimeout(function () {}, 0);

              while (id--) {
                window.clearTimeout(id); // will do nothing if no timeout with id is present
              }
              setPhoto(() => canvas);
            }
          }
          break;
        }
        default:
          console.log("nenhuma fase encontrada!");
          break;
      }
    }, 800);
  }, [exit, status, tentativas]);

  const loadModels = useCallback(() => {
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    ]).then(() => {
      faceDetection();
    });
  }, [faceDetection]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("TOKEN-BIO") || !dataUser) {
      window.location.href = "https://www.flexconsulta.com.br";
    }
    loadModels();
    setStatus("Carregando a câmera");
  }, [dataUser, loadModels]);

  useEffect(() => {
    if (inicia) {
      runTimer();
    }
  }, [inicia, runTimer]);

  useEffect(() => {
    const videoAux = document?.getElementById("my-video") as HTMLVideoElement;

    if (!photo) return;
    clearTimeout(timerTimeout);
    setStatus("Processando a foto");

    if (photo.toBlob) {
      photo.toBlob(async function (blob: any) {
        const formData = new FormData();

        if (fase === 2) {
          setSteps(2);

          setStatus("Pronto, aguarde mais um pouco");

          formData.append("image", blob, "image.jpg");
          formData.append("processo", processData.data);

          await ApiBiometria.post(
            `/validacaocnh/remoto/biometria/basica/fase-02/${dataUser.id}`,
            formData
          )
            .then(() => {
              videoAux?.srcObject
                ?.getTracks()
                ?.forEach((track: any) => track.stop());

              setStatus("Processo concluído com sucesso");
              navigate("/sucesso_validacao");
            })
            .catch((error: any) => {
              const d = error?.response?.data;
              if (d?.error)
                setStatus(d?.message || "Ocorreu um erro na biometria!");
              faceDetection();
              clearTimeout(timerTimeout);

              setTentativas(tentativas + 1);
            });
        }

        if (fase === 1) {
          formData.append("image", blob, "image.jpg");

          await ApiBiometria.post(
            "/validacaocnh/remoto/biometria/basica/fase-01",
            formData
          )
            .then(({ data }: any) => {
              setSteps(1);

              fase = 2;
              setProcessData(data);
              //  appendPhoto();
              setStatus("Fase 1 concluído");
              setTimeout(() => faceDetection(), 1000);
            })
            .catch((error: any) => {
              const d = error?.response?.data;
              if (d?.error)
                setStatus(d?.message || "Ocorreu um erro na biometria!");
              faceDetection();
              clearTimeout(timerTimeout);

              setTentativas(tentativas + 1);
            });
        }
      }, "image/jpeg");
    }
  }, [
    photo,
    dataUser.id,
    faceDetection,
    navigate,
    processData.data,
    tentativas,
  ]);

  return {
    /* <div className="bodyValidRemota backgroundThemeCnh">
      <div
        className="header-validacao"
        style={isMobile ? { marginBottom: "12px" } : {}}
      >
        <img
          style={{ width: 150 }}
          className="logo"
          src={LogoExtended}
          alt=""
        />
      </div>
      <MultiStep activeStep={0} steps={steps} showNavigation={false} />

      <div style={{ display: "flex", alignItems: "center" }}>
        {(status === "Processando a foto" ||
          status === "Pronto, aguarde mais um pouco") && (
          <Spinner animation="border" variant="light" />
        )}

        {isMobile ? (
          <h3
            style={{ marginBottom: "0px", color: "white", marginLeft: "3px" }}
            className="titleFaceApi"
          >
            {" "}
            {status}
          </h3>
        ) : (
          <h1
            style={{ marginBottom: "0px", color: "white", marginLeft: "3px" }}
            className="titleFaceApi"
          >
            {" "}
            {status}
          </h1>
        )}
      </div>

      <div
        className="app__video"
        style={{ width: "100%", display: "flex", justifyContent: "center" }}
      >
        <Webcam
          id="my-video"
          crossOrigin="anonymous"
          ref={videoRef}
          autoPlay
          audio={false}
        ></Webcam>
      </div>
      <h4
        style={{ marginTop: "20px", color: "white" }}
        className="titleFaceApi"
      >
        Validação Facial
      </h4>
      <canvas
        id="canvas"
        ref={canvasRef}
        style={{ display: "none" }}
        className="app__canvas"
      />
      <div
        id="screenshot"
        style={{ width: "100%", display: "flex", justifyContent: "center" }}
      ></div>
    </div> */
  };
}
