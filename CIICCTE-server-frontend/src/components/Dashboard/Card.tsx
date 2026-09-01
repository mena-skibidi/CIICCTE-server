type Row = [string, string | number]

function Card({ title, rows, error }: { title: string; rows: Row[]; error?: boolean }) {
  return (
    <div className="flex-1 bg-white rounded-lg border border-neutral-300 p-4 flex flex-col gap-4">
      <h2 className="text-lg text-neutral-600 font-medium">{title}</h2>
      <div className="h-px bg-neutral-300" />
      {error ? (
        <p className="text-lg text-neutral-600">Algo salio mal, consulta los logs.</p>
      ) : (
        <table className="w-full text-left">
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k} className="border-b border-neutral-300 last:border-0">
                <td className="py-2 text-sm text-neutral-500">{k}</td>
                <td className="py-2 text-sm text-black text-right break-all">{String(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Card
