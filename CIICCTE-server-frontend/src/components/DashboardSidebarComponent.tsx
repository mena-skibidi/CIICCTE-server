function DashboardSidebarComponent() {
  return (
    <div className="h-full w-64 bg-white border-r border-neutral-500 p-4 flex flex-col gap-4">
      <div className="h-8 flex items-center">
        <span className="text-blue-700 text-base font-semibold">CIICCTE</span>
      </div>
      <div className="h-px bg-neutral-500" />
      <nav className="flex flex-col gap-2">
        <div className="h-8 px-4 flex items-center rounded bg-blue-700">
          <span className="text-white text-sm">Dashboard</span>
        </div>
        <div className="h-8 px-4 flex items-center">
          <span className="text-neutral-500 text-sm">Placeholder</span>
        </div>
      </nav>
    </div>
  )
}

export default DashboardSidebarComponent
