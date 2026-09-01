function MainButtonComponent({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`w-9/10 rounded-lg flex justify-center items-center pt-3 pb-3 text-lg hover:opacity-90 hover:cursor-pointer cursor-pointer ${active ? "bg-sky-700 text-white" : "bg-sky-400 text-white"}`}
    >
      {label}
    </div>
  )
}

export default MainButtonComponent
