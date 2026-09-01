import DashboardComponent from "./Dashboard/DashboardComponent"
import LinuxUsersComponent from "./LinuxUsers/LinuxUsersComponent"

function DashboardMainContentComponent({ active }: { active: string }) {
  return (
    <div className="flex-1 bg-white p-8 flex flex-col gap-8 overflow-auto">
      {active === "Dashboard" && <DashboardComponent />}
      {active === "Gestion Linux" && <LinuxUsersComponent />}
      {active === "Gestion Usuarios" && <div className="text-lg text-neutral-500">Gestion Usuarios — por implementar</div>}
      {active === "Gestion Docker" && <div className="text-lg text-neutral-500">Gestion Docker — por implementar</div>}
    </div>
  )
}

export default DashboardMainContentComponent
