import { useState } from "react"
import { useNavigate } from "react-router-dom"

function LoginComponent() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleLogin = () => {
    setError(null)
    if (!username || !password) {
      setError("usuario y contraseña requeridos")
      return
    }
    setLoading(true)
    fetch("http://localhost:8000/api/db/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          throw new Error(j.detail || "credenciales invalidas")
        }
        return res.json()
      })
      .then((data) => {
        localStorage.setItem("token", data.access_token)
        localStorage.setItem("username", data.username)
        localStorage.setItem("roles_id", String(data.roles_id))
        localStorage.setItem("nombre_completo", data.nombre_completo || "")
        navigate("/")
      })
      .catch((e) => {
        console.error(e)
        setError(e.message)
      })
      .finally(() => setLoading(false))
  }

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-white p-8">
      <div className="w-full max-w-md flex flex-col gap-4 p-8 rounded-lg border border-neutral-300 bg-white shadow">
        <h1 className="w-full text-center text-4xl text-sky-700 font-bold select-none">CIICCTE</h1>
        <h2 className="w-full text-center text-2xl text-neutral-600">Inicio de sesion</h2>
        <div className="h-px bg-neutral-300" />
        <input
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && handleLogin()}
          className="w-full p-2 rounded-lg border border-neutral-300 text-sm"
          disabled={loading}
        />
        <input
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && handleLogin()}
          className="w-full p-2 rounded-lg border border-neutral-300 text-sm"
          disabled={loading}
        />
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full pt-3 pb-3 rounded-lg text-lg text-white cursor-pointer ${loading ? "bg-neutral-400 cursor-not-allowed" : "bg-sky-400 hover:opacity-90"}`}
        >
          {loading ? "Cargando..." : "Iniciar sesion"}
        </button>
      </div>
    </div>
  )
}

export default LoginComponent
