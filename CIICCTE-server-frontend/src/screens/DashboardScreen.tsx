import DashboardMainContentComponent from "../components/DashboardMainContentComponent"
import SidebarComponent from "../components/Sidebar/SidebarComponent"

function DashboardScreen() {
  return (
    <div className="fixed inset-0 flex justify-center bg-white">
      <div className="flex w-full">
        <SidebarComponent />
        <DashboardMainContentComponent />
      </div>
    </div>
  )
}

export default DashboardScreen
