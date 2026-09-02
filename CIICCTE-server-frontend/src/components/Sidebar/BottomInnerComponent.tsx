import { useNavigate } from "react-router-dom"

function BottomInnerComponent() {
  const navigate = useNavigate()
  const username = localStorage.getItem("username") || "usuario"
  const rolesId = localStorage.getItem("roles_id")
  const rol = rolesId === "1" ? "admin" : rolesId === "2" ? "usuario" : "usuario"

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("username")
    localStorage.removeItem("roles_id")
    localStorage.removeItem("nombre_completo")
    navigate("/login")
  }

  return (
    <div className="w-full flex flex-col justify-center items-center text-center">
      <div className="w-full flex flex-row justify-center items-center pt-3 pb-2 border-t rounded-t-lg border-t-neutral-300">
        <span className="text-lg text-neutral-500">{username}</span>
        <span className="text-lg text-sky-700 select-none">#</span>
        <span className="text-lg underline text-sky-700 select-none">{rol}</span>
      </div>
      <button
        onClick={handleLogout}
        className="min-h-4 w-full bg-sky-400 flex justify-center items-center pb-3 pt-3 text-xl select-none text-white hover:opacity-90 hover:bg-red-500 hover:cursor-pointer cursor-pointer"
      >
        Cerrar sesion
      </button>
    </div>
  )
}

export default BottomInnerComponent
