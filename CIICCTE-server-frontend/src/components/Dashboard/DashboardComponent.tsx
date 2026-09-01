import { useEffect, useState } from "react"
import Card from "./Card"

type ServerData = {
  cpu_name: string
  cpu_physical_cores: number
  cpu_logical_cores: number
  gpu_name: string | null
  ram_amount: number
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
    <div className="w-full flex flex-col gap-8">
      <div className="w-full flex flex-col lg:flex-row gap-8">
        <Card
          title="CPU"
          error={error || !data}
          rows={
            data
              ? [
                  ["Nombre", data.cpu_name],
                  ["Núcleos físicos", data.cpu_physical_cores],
                  ["Núcleos lógicos", data.cpu_logical_cores],
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
          rows={data ? [["Total (GB)", data.ram_amount]] : []}
        />
      </div>
    </div>
  )
}

export default DashboardComponent
