import { useEffect, useState } from "react"

type UserPublic = {
  id: number
  username: string
  nombre_completo: string
  account_status: string
  roles_id: number
}

function UsersComponent() {
  const [users, setUsers] = useState<UserPublic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)

  const [createForm, setCreateForm] = useState({
    username: "",
    nombre_completo: "",
    password: "",
    rolLabel: "usuario",
  })
  const [editForm, setEditForm] = useState({
    nombre_completo: "",
    password: "",
    rolLabel: "usuario",
  })
  const [formError, setFormError] = useState<string | null>(null)

  const rolLabelToId = (label: string) => (label === "admin" ? 1 : 2)

  const fetchUsers = () => {
    setLoading(true)
    fetch("http://localhost:8000/api/db/users")
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status))
        return res.json()
      })
      .then((json) => {
        setUsers(json.data)
        setError(null)
      })
      .catch((e) => {
        console.error(e)
        setError("Algo salio mal, consulta los logs.")
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers()
  }, [])

  const handleCreateConfirm = () => {
    setFormError(null)
    if (!createForm.username || !createForm.password) {
      setFormError("username y password son obligatorios")
      return
    }
    fetch("http://localhost:8000/api/db/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: createForm.username,
        nombre_completo: createForm.nombre_completo || createForm.username,
        password: createForm.password,
        rol: rolLabelToId(createForm.rolLabel),
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          throw new Error(j.detail || String(res.status))
        }
        return res.json()
      })
      .then(() => {
        setShowCreate(false)
        setCreateForm({ username: "", nombre_completo: "", password: "", rolLabel: "usuario" })
        fetchUsers()
      })
      .catch((e) => {
        console.error(e)
        setFormError(e.message)
      })
  }

  const startEdit = (u: UserPublic) => {
    setEditing(u.username)
    setEditForm({
      nombre_completo: u.nombre_completo,
      password: "",
      rolLabel: u.roles_id === 1 ? "admin" : "usuario",
    })
    setFormError(null)
  }

  const handleEditConfirm = () => {
    if (!editing) return
    setFormError(null)
    const payload: Record<string, unknown> = {
      username: editing,
    }
    if (editForm.nombre_completo) payload.nombre_completo = editForm.nombre_completo
    if (editForm.password) payload.password = editForm.password
    payload.rol = rolLabelToId(editForm.rolLabel)

    fetch("http://localhost:8000/api/db/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          throw new Error(j.detail || String(res.status))
        }
        return res.json()
      })
      .then(() => {
        setEditing(null)
        fetchUsers()
      })
      .catch((e) => {
        console.error(e)
        setFormError(e.message)
      })
  }

  const handleToggle = (username: string) => {
    fetch(`http://localhost:8000/api/db/users?username=${encodeURIComponent(username)}`, {
      method: "DELETE",
    })
      .then(async (res) => {
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          throw new Error(j.detail || String(res.status))
        }
        return res.json()
      })
      .then(() => fetchUsers())
      .catch((e) => console.error(e))
  }

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <p className="text-lg text-neutral-500">Cargando...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full flex flex-col justify-center items-center gap-8">
        <h1 className="w-full text-6xl text-sky-400 pt-6 pb-6 text-center">Gestión Usuarios</h1>
        <p className="text-lg text-neutral-600">Algo salio mal, consulta los logs.</p>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col justify-center items-center gap-8">
      <div className="w-full flex flex-row justify-between items-center">
        <h1 className="text-6xl text-sky-400 pt-6 pb-6">Gestión Usuarios</h1>
        <button
          onClick={() => {
            setShowCreate(!showCreate)
            setEditing(null)
            setFormError(null)
          }}
          className="px-4 pt-2 pb-2 rounded-lg bg-sky-400 text-white text-lg hover:opacity-90 hover:cursor-pointer cursor-pointer"
        >
          Crear usuario
        </button>
      </div>

      {showCreate && (
        <div className="w-full flex justify-center">
          <div className="flex flex-col gap-4 p-4 rounded-lg border border-neutral-300 bg-white w-full max-w-2xl">
            <h2 className="text-lg text-neutral-600 font-medium">Nuevo usuario</h2>
            <div className="h-px bg-neutral-300" />
            <input
              placeholder="username"
              value={createForm.username}
              onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
              className="w-full p-2 rounded-lg border border-neutral-300 text-sm"
            />
            <input
              placeholder="nombre completo"
              value={createForm.nombre_completo}
              onChange={(e) => setCreateForm({ ...createForm, nombre_completo: e.target.value })}
              className="w-full p-2 rounded-lg border border-neutral-300 text-sm"
            />
            <input
              placeholder="password"
              type="password"
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              className="w-full p-2 rounded-lg border border-neutral-300 text-sm"
            />
            <select
              value={createForm.rolLabel}
              onChange={(e) => setCreateForm({ ...createForm, rolLabel: e.target.value })}
              className="w-full p-2 rounded-lg border border-neutral-300 text-sm bg-white"
            >
              <option value="usuario">usuario</option>
              <option value="admin">admin</option>
            </select>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleCreateConfirm}
                className="px-4 pt-2 pb-2 rounded-lg bg-sky-700 text-white text-sm hover:opacity-90 cursor-pointer"
              >
                Confirmar
              </button>
              <button
                onClick={() => {
                  setShowCreate(false)
                  setFormError(null)
                }}
                className="px-4 pt-2 pb-2 rounded-lg border border-neutral-300 bg-white text-sm hover:opacity-90 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="w-full flex justify-center">
          <div className="flex flex-col gap-4 p-4 rounded-lg border border-neutral-300 bg-white w-full max-w-2xl">
            <h2 className="text-lg text-neutral-600 font-medium">Modificar {editing}</h2>
            <div className="h-px bg-neutral-300" />
            <input
              placeholder="nombre completo"
              value={editForm.nombre_completo}
              onChange={(e) => setEditForm({ ...editForm, nombre_completo: e.target.value })}
              className="w-full p-2 rounded-lg border border-neutral-300 text-sm"
            />
            <input
              placeholder="nueva password (dejar vacío para no cambiar)"
              type="password"
              value={editForm.password}
              onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
              className="w-full p-2 rounded-lg border border-neutral-300 text-sm"
            />
            <select
              value={editForm.rolLabel}
              onChange={(e) => setEditForm({ ...editForm, rolLabel: e.target.value })}
              className="w-full p-2 rounded-lg border border-neutral-300 text-sm bg-white"
            >
              <option value="usuario">usuario</option>
              <option value="admin">admin</option>
            </select>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleEditConfirm}
                className="px-4 pt-2 pb-2 rounded-lg bg-sky-700 text-white text-sm hover:opacity-90 cursor-pointer"
              >
                Confirmar
              </button>
              <button
                onClick={() => {
                  setEditing(null)
                  setFormError(null)
                }}
                className="px-4 pt-2 pb-2 rounded-lg border border-neutral-300 bg-white text-sm hover:opacity-90 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full flex flex-col gap-4">
        {users.map((u) => (
          <div
            key={u.id}
            className="w-full flex flex-row justify-between items-center p-4 rounded-lg border border-neutral-300 bg-white gap-4"
          >
            <div className="flex flex-col items-start text-left gap-1">
              <span className="text-lg text-neutral-600">
                {u.username} — {u.nombre_completo}
              </span>
              <span className="text-sm text-neutral-500">
                rol: {u.roles_id === 1 ? "admin" : "usuario"} · estado: {u.account_status} · id: {u.id}
              </span>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => startEdit(u)}
                className="px-4 pt-2 pb-2 rounded-lg bg-sky-400 text-white text-sm hover:opacity-90 cursor-pointer"
              >
                Modificar
              </button>
              <button
                onClick={() => handleToggle(u.username)}
                className="px-4 pt-2 pb-2 rounded-lg bg-sky-400 text-white text-sm hover:opacity-90 cursor-pointer"
              >
                {u.account_status === "activa" ? "Desactivar" : "Activar"}
              </button>
            </div>
          </div>
        ))}
        {users.length === 0 && <p className="text-lg text-neutral-500">Sin usuarios</p>}
      </div>
    </div>
  )
}

export default UsersComponent
