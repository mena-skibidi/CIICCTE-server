import DashboardMainContentComponent from "../components/DashboardMainContentComponent"
import DashboardSidebarComponent from "../components/DashboardSidebarComponent"

function DashboardScreen() {
  return (
    <div className="fixed inset-0 flex justify-center bg-white">
      <div className="flex w-full">
        <DashboardSidebarComponent />
        <DashboardMainContentComponent />
      </div>
    </div>
  )
}

export default DashboardScreen
