import { useEffect, useState } from "react"

type LinuxUser = {
  id: number
  username: string
  uid: number
  gid: number
  home_dir: string
  user_id: number | null
}

function LinuxUsersComponent() {
  const [users, setUsers] = useState<LinuxUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("http://localhost:8000/api/telemetry/linux-users")
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status))
        return res.json()
      })
      .then((json) => {
        setUsers(json.data)
      })
      .catch((e) => {
        console.error(e)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <p className="text-lg text-neutral-500">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col justify-center items-center gap-4">
      {users.map((u) => (
        <div
          key={u.uid}
          className="w-full flex flex-row justify-between items-center p-4 rounded-lg border border-neutral-300 bg-white gap-4"
        >
          <div className="flex flex-col items-start text-left gap-1">
            <span className="text-lg text-neutral-600">{u.username} ({u.uid})</span>
            <span className="text-sm text-neutral-500">gid: {u.gid} · home: {u.home_dir}</span>
          </div>
          <div className="shrink-0">
            <button className="px-4 pt-2 pb-2 rounded-lg bg-sky-400 text-white text-lg hover:opacity-90 hover:cursor-pointer cursor-pointer">Gestionar</button>
          </div>
        </div>
      ))}
      {users.length === 0 && <p className="text-lg text-neutral-500">Sin usuarios</p>}
    </div>
  )
}

export default LinuxUsersComponent
