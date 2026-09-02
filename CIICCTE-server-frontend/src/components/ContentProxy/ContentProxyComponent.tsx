import DashboardComponent from "../Dashboard/DashboardComponent"
import DockerComponent from "../Docker/DockerComponent"
import LinuxUsersComponent from "../LinuxUsers/LinuxUsersComponent"
import UsersComponent from "../Users/UsersComponent"

function ContentProxyComponent({ active }: { active: string }) {
  return (
    <div className="flex-1 bg-white pt-8 pb-8 flex flex-col gap-8 overflow-auto px-8">
      {active === "Dashboard" && <DashboardComponent />}
      {active === "Gestion Linux" && <LinuxUsersComponent />}
      {active === "Gestion Usuarios" && <UsersComponent />}
      {active === "Gestion Docker" && <DockerComponent />}
    </div>
  )
}

export default ContentProxyComponent
