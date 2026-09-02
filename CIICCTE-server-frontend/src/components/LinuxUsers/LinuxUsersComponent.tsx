import { useEffect, useState } from "react"

type LinuxUser = {
  id: number
  username: string
  uid: number
  gid: number
  home_dir: string
  user_id: number | null
}

type AppUser = {
  id: number
  username: string
  nombre_completo: string
  account_status: string
  roles_id: number
}

function LinuxUsersComponent() {
  const [users, setUsers] = useState<LinuxUser[]>([])
  const [appUsers, setAppUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedUid, setExpandedUid] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = () => {
    setLoading(true)
    Promise.all([
      fetch("http://localhost:8000/api/telemetry/linux-users").then((r) => {
        if (!r.ok) throw new Error(String(r.status))
        return r.json()
      }),
      fetch("http://localhost:8000/api/db/users").then((r) => {
        if (!r.ok) throw new Error(String(r.status))
        return r.json()
      }),
    ])
      .then(([lj, uj]) => {
        setUsers(lj.data)
        setAppUsers(uj.data)
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
    fetchAll()
  }, [])

  const handleLink = (linuxUid: number, userId: number | null) => {
    setError(null)
    fetch("http://localhost:8000/api/db/linux-users/link", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ linux_uid: linuxUid, user_id: userId }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          throw new Error(j.detail || String(res.status))
        }
        return res.json()
      })
      .then(() => {
        setExpandedUid(null)
        fetchAll()
      })
      .catch((e) => {
        console.error(e)
        setError(e.message)
      })
  }

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <p className="text-lg text-neutral-500">Cargando...</p>
      </div>
    )
  }

  const linkedUserIds = new Set(users.map((u) => u.user_id).filter((v) => v !== null))
  const appUserMap = new Map(appUsers.map((u) => [u.id, u.username]))

  return (
    <div className="w-full flex flex-col justify-center items-center gap-8">
      <h1 className="w-full text-6xl text-sky-400 pt-6 pb-6 text-center">Gestión Linux</h1>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="w-full flex flex-col justify-center items-center gap-4">
        {users.map((u) => {
          const isLinked = u.user_id !== null
          const linkedName = u.user_id ? appUserMap.get(u.user_id) : null
          const isExpanded = expandedUid === u.uid
          const availableAppUsers = appUsers.filter(
            (au) => au.roles_id === 2 && au.account_status === "activa" && !linkedUserIds.has(au.id),
          )

          return (
            <div key={u.uid} className="w-full flex flex-col gap-4">
              <div className="w-full flex flex-row justify-between items-center p-4 rounded-lg border border-neutral-300 bg-white gap-4">
                <div className="flex flex-col items-start text-left gap-1">
                  <span className="text-lg text-neutral-600">{u.username} ({u.uid})</span>
                  <span className="text-sm text-neutral-500">
                    gid: {u.gid} · home: {u.home_dir} {isLinked ? `· vinculado a: ${linkedName ?? u.user_id}` : "· sin vincular"}
                  </span>
                </div>
                <div className="shrink-0 flex gap-2">
                  {isLinked ? (
                    <button
                      onClick={() => handleLink(u.uid, null)}
                      className="px-4 pt-2 pb-2 rounded-lg bg-sky-400 text-white text-sm hover:opacity-90 cursor-pointer"
                    >
                      Desvincular
                    </button>
                  ) : (
                    <button
                      onClick={() => setExpandedUid(isExpanded ? null : u.uid)}
                      className="px-4 pt-2 pb-2 rounded-lg bg-sky-400 text-white text-sm hover:opacity-90 cursor-pointer"
                    >
                      Vincular
                    </button>
                  )}
                </div>
              </div>

              {isExpanded && !isLinked && (
                <div className="w-full flex justify-center">
                  <div className="flex flex-col gap-4 p-4 rounded-lg border border-neutral-300 bg-white w-full max-w-2xl">
                    <h3 className="text-sm text-neutral-600 font-medium">Selecciona usuario regular (1-1)</h3>
                    <div className="h-px bg-neutral-300" />
                    {availableAppUsers.length === 0 ? (
                      <p className="text-sm text-neutral-500">Sin usuarios regulares disponibles</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {availableAppUsers.map((au) => (
                          <div
                            key={au.id}
                            className="w-full flex flex-row justify-between items-center p-2 rounded-lg border border-neutral-300 gap-2"
                          >
                            <span className="text-sm text-neutral-600">
                              {au.username} — {au.nombre_completo}
                            </span>
                            <button
                              onClick={() => handleLink(u.uid, au.id)}
                              className="px-3 pt-1 pb-1 rounded-lg bg-sky-700 text-white text-sm hover:opacity-90 cursor-pointer"
                            >
                              Vincular
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-center">
                      <button
                        onClick={() => setExpandedUid(null)}
                        className="px-4 pt-1 pb-1 rounded-lg border border-neutral-300 bg-white text-sm hover:opacity-90 cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
        {users.length === 0 && <p className="text-lg text-neutral-500">Sin usuarios</p>}
      </div>
    </div>
  )
}

export default LinuxUsersComponent
