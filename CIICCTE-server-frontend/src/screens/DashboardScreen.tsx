import DashboardSidebarComponent from "../components/DashboardSidebarComponent"
import DashboardMainContentComponent from "../components/DashboardMainContentComponent"
import DashboardTelemetryComponent from "../components/DashboardTelemetryComponent"
import DashboardLinuxUsersComponent from "../components/DashboardLinuxUsersComponent"

function DashboardScreen() {
  return (
    <div className="min-h-screen bg-white flex">
      <div className="w-64 shrink-0">
        <DashboardSidebarComponent />
      </div>
      <div className="flex-1 p-8 flex flex-col gap-8 bg-white">
        <div className="h-16 bg-white border border-neutral-500 flex items-center px-8">
          <h1 className="text-blue-700 text-lg font-semibold">Dashboard</h1>
        </div>
        <div className="flex flex-col gap-8">
          <DashboardMainContentComponent />
          <DashboardTelemetryComponent />
          <DashboardLinuxUsersComponent />
        </div>
      </div>
    </div>
  )
}

export default DashboardScreen
