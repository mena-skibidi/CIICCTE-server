import { useEffect, useState } from "react"
import Card from "./Card"

type PhysicalDisk = {
  name: string
  dev_path: string
  kind: string
  interconnect: string
  size_gb: number
  temperature: number | null
}

type ServerData = {
  cpu_name: string | null
  cpu_physical_cores: number | null
  cpu_logical_cores: number | null
  gpu_name: string | null
  ram_amount: number | null
  disks: PhysicalDisk[]
  disks_count: number
  storage_total_gb: number
  storage_available_gb: number
}

function DashboardComponent() {
  const [data, setData] = useState<ServerData | null>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("http://localhost:8000/api/telemetry/linux-server-details")
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status))
        return res.json()
      })
      .then((json) => {
        setData(json.data)
        if (json.error) console.error(json.error)
        setError(false)
      })
      .catch((e) => {
        console.error(e)
        setError(true)
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
    <div className="w-full flex flex-col justify-center items-center gap-8">
      <h1 className="w-full text-6xl text-sky-400 pt-6 pb-6 text-center">Dashboard</h1>

      <div className="w-full flex flex-col lg:flex-row gap-8">
        <Card
          title="CPU"
          error={error || !data}
          rows={
            data
              ? [
                  ["Nombre", data.cpu_name ?? "—"],
                  ["Núcleos físicos", String(data.cpu_physical_cores ?? "—")],
                  ["Núcleos lógicos", String(data.cpu_logical_cores ?? "—")],
                ]
              : []
          }
        />
        <Card
          title="GPU"
          error={error || !data}
          rows={data ? [["Nombre", data.gpu_name ?? "—"]] : []}
        />
        <Card
          title="Memoria"
          error={error || !data}
          rows={data ? [["Total (GB)", String(data.ram_amount ?? "—")]] : []}
        />
      </div>

      <div className="w-full flex flex-col lg:flex-row gap-8">
        <Card
          title="Almacenamiento"
          error={error || !data}
          rows={
            data
              ? [
                  ["Unidades físicas", data.disks_count],
                  ["Espacio total (GB)", data.storage_total_gb],
                  ["Espacio disponible (GB)", data.storage_available_gb],
                ]
              : []
          }
        />
        {data && data.disks.length > 0 ? (
          data.disks.map((d) => (
            <Card
              key={d.dev_path || d.name}
              title={d.name}
              error={false}
              rows={[
                ["Ruta", d.dev_path || "—"],
                ["Tipo", d.kind || "—"],
                ["Interconexión", d.interconnect || "—"],
                ["Tamaño (GB)", d.size_gb],
                ["Temperatura", d.temperature !== null && d.temperature !== undefined ? `${d.temperature} °C` : "—"],
              ]}
            />
          ))
        ) : (
          <Card
            title="Disco Físico"
            error={false}
            rows={[["Estado", "Sin discos físicos detectados"]]}
          />
        )}
      </div>
    </div>
  )
}

export default DashboardComponent
