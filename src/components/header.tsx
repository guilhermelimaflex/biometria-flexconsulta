import logoFlex from "../assets/logo-laranja.png";

type HeaderProps = {
  title: string;
  text?: string;
};

export function Header({ title, text }: HeaderProps) {
  return (
    <div className="flex items-center justify-between gap-5">
      <div className="flex">
        <img
          className="w-[150px] lg:w-[200px]"
          src={logoFlex}
          alt="Logotipo laranja da Flex Consulta"
        />
      </div>

      <div className="">
        <h1 className="text-lg font-semibold">{title}</h1>
        {text && (
          <h3 className="text-sm mt-1 text-gray-500 font-semibold">{text}</h3>
        )}
      </div>
    </div>
  );
}
