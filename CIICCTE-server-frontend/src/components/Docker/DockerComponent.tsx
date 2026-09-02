import { useEffect, useState } from "react"
import Card from "../Dashboard/Card"

type Container = {
  id: string
  name: string
  image: string
  state: string
  status: string
  project: string | null
}

type Network = {
  name: string
  driver: string
  scope: string
  project: string | null
}

type Volume = {
  name: string
  driver: string
  mountpoint: string
  project: string | null
}

type DockerSection = {
  containers: Container[]
  networks: Network[]
  volumes: Volume[]
  compose_projects: { name: string }[]
}

type Overview = {
  operacional: DockerSection
  usuario: DockerSection
  error: string | null
}

function Section({
  title,
  data,
}: {
  title: string
  data: DockerSection
}) {
  return (
    <div className="w-full flex flex-col gap-8">
      <h2 className="w-full text-2xl text-sky-400 pt-6 pb-6">{title}</h2>

      <div className="w-full flex flex-col lg:flex-row gap-8">
        <Card
          title="Compose"
          rows={
            data.compose_projects.length > 0
              ? data.compose_projects.map((p) => [p.name, ""] as [string, string])
              : [["Estado", "Sin proyectos"] as [string, string]]
          }
        />
        <Card
          title="Contenedores"
          rows={
            data.containers.length > 0
              ? [[`Total (${data.containers.length})`, `${data.containers.filter((c) => c.state === "running").length} corriendo`] as [string, string]]
              : [["Estado", "Sin contenedores"] as [string, string]]
          }
        />
        <Card
          title="Networks / Volumes"
          rows={[
            ["Networks", data.networks.length],
            ["Volumes", data.volumes.length],
          ]}
        />
      </div>

      <div className="w-full flex flex-col gap-4">
        <h3 className="text-lg text-neutral-600 font-medium">Contenedores (corriendo y detenidos)</h3>
        {data.containers.length === 0 ? (
          <p className="text-sm text-neutral-500">Sin contenedores en esta sección</p>
        ) : (
          <div className="w-full flex flex-col gap-4">
            {data.containers.map((c) => (
              <div
                key={c.id}
                className="w-full flex flex-row justify-between items-center p-4 rounded-lg border border-neutral-300 bg-white gap-4"
              >
                <div className="flex flex-col items-start text-left gap-1">
                  <span className="text-lg text-neutral-600">{c.name} — {c.image}</span>
                  <span className="text-sm text-neutral-500">
                    {c.state} {c.status ? `· ${c.status}` : ""} {c.project ? `· proyecto: ${c.project}` : ""} · {c.id}
                  </span>
                </div>
                <span className={`px-3 pt-1 pb-1 rounded-lg text-sm text-white ${c.state === "running" ? "bg-sky-400" : "bg-neutral-400"}`}>
                  {c.state}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-full flex flex-col gap-4">
        <h3 className="text-lg text-neutral-600 font-medium">Networks</h3>
        {data.networks.length === 0 ? (
          <p className="text-sm text-neutral-500">Sin networks</p>
        ) : (
          <div className="w-full flex flex-col gap-4">
            {data.networks.map((n) => (
              <div key={n.name} className="w-full flex flex-row justify-between items-center p-4 rounded-lg border border-neutral-300 bg-white gap-4">
                <div className="flex flex-col items-start text-left gap-1">
                  <span className="text-lg text-neutral-600">{n.name}</span>
                  <span className="text-sm text-neutral-500">driver: {n.driver || "—"} · scope: {n.scope || "—"} {n.project ? `· proyecto: ${n.project}` : ""}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-full flex flex-col gap-4">
        <h3 className="text-lg text-neutral-600 font-medium">Volumes</h3>
        {data.volumes.length === 0 ? (
          <p className="text-sm text-neutral-500">Sin volumes</p>
        ) : (
          <div className="w-full flex flex-col gap-4">
            {data.volumes.map((v) => (
              <div key={v.name} className="w-full flex flex-row justify-between items-center p-4 rounded-lg border border-neutral-300 bg-white gap-4">
                <div className="flex flex-col items-start text-left gap-1">
                  <span className="text-lg text-neutral-600">{v.name}</span>
                  <span className="text-sm text-neutral-500">driver: {v.driver || "—"} {v.project ? `· proyecto: ${v.project}` : ""}</span>
                  <span className="text-sm text-neutral-500 break-all">{v.mountpoint}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DockerComponent() {
  const [data, setData] = useState<Overview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("http://localhost:8000/api/telemetry/docker/overview")
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status))
        return res.json()
      })
      .then((json) => {
        setData(json)
        if (json.error) console.error(json.error)
      })
      .catch((e) => {
        console.error(e)
        setError("Algo salio mal, consulta los logs.")
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

  if (error || !data) {
    return (
      <div className="w-full flex flex-col justify-center items-center gap-8">
        <h1 className="w-full text-6xl text-sky-400 pt-6 pb-6 text-center">Gestión Docker</h1>
        <p className="text-lg text-neutral-600">Algo salio mal, consulta los logs.</p>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col justify-center items-center gap-8">
      <h1 className="w-full text-6xl text-sky-400 pt-6 pb-6 text-center">Gestión Docker</h1>
      {data.error && (
        <div className="w-full p-4 rounded-lg border border-amber-300 bg-amber-50">
          <p className="text-sm text-amber-700">Docker: {data.error} (verifica /var/run/docker.sock:ro)</p>
        </div>
      )}
      <div className="w-full h-px bg-neutral-300" />

      <Section title="Nivel Operacional — CIICCTE-server" data={data.operacional} />
      <div className="w-full h-px bg-neutral-300" />
      <Section title="Nivel Usuario — workspaces user-*" data={data.usuario} />
    </div>
  )
}

export default DockerComponent
