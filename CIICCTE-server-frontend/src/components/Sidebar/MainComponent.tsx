import MainButtonComponent from "./MainButtonComponent"

function MainComponent() {
  return (
    <div className="w-full h-full flex flex-col justify-center">
      <div className="justify-center items-center flex flex-1 flex-col gap-8">
      <MainButtonComponent label="Dashboard" />
      <MainButtonComponent label="Gestion Usuarios" />
      <MainButtonComponent label="Gestion Linux" />
      <MainButtonComponent label="Gestion Docker" />
      </div>
    </div>
  )
}

export default MainComponent
