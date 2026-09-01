import MainButtonComponent from "./MainButtonComponent"

type Props = {
  active: string
  onSelect: (label: string) => void
}

function MainComponent({ active, onSelect }: Props) {
  return (
    <div className="w-full h-full flex flex-col justify-center">
      <div className="justify-center items-center flex flex-1 flex-col gap-8">
        <MainButtonComponent label="Dashboard" active={active === "Dashboard"} onClick={() => onSelect("Dashboard")} />
        <MainButtonComponent label="Gestion Usuarios" active={active === "Gestion Usuarios"} onClick={() => onSelect("Gestion Usuarios")} />
        <MainButtonComponent label="Gestion Linux" active={active === "Gestion Linux"} onClick={() => onSelect("Gestion Linux")} />
        <MainButtonComponent label="Gestion Docker" active={active === "Gestion Docker"} onClick={() => onSelect("Gestion Docker")} />
      </div>
    </div>
  )
}

export default MainComponent
