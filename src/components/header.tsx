import logoFlex from "../assets/logo-laranja.png";

type HeaderProps = {
  title: string;
  text?: string;
};

export function Header({ title, text }: HeaderProps) {
  return (
    <div className="flex xl:flex-row flex-col items-center">
      <div className="flex items-center justify-start">
        <img
          className="w-[250px]"
          src={logoFlex}
          alt="Logotipo laranja da Flex Consulta"
        />
      </div>

      <div className="xl:ml-72">
        <h1 className="text-3xl font-semibold">{title}</h1>
        {text && (
          <h3 className="text-xl xl:text-center mt-1 font-semibold">{text}</h3>
        )}
      </div>
    </div>
  );
}
