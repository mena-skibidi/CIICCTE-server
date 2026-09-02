import { useNavigate } from "react-router-dom"

function UserScreen() {
  const navigate = useNavigate()
  const username = localStorage.getItem("username") || "usuario"

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("username")
    localStorage.removeItem("roles_id")
    localStorage.removeItem("nombre_completo")
    navigate("/login")
  }

  return (
    <div className="fixed inset-0 flex flex-col justify-center items-center bg-white gap-8 p-8">
      <h1 className="text-6xl text-sky-400 pt-6 pb-6 text-center">UserScreen</h1>
      <p className="text-lg text-neutral-600">Bienvenido {username}</p>
      <button
        onClick={handleLogout}
        className="px-6 pt-3 pb-3 rounded-lg bg-sky-400 text-white text-lg hover:opacity-90 cursor-pointer"
      >
        Cerrar sesion
      </button>
    </div>
  )
}

export default UserScreen
