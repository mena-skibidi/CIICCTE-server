import { useState } from "react"
import DashboardMainContentComponent from "../components/DashboardMainContentComponent"
import SidebarComponent from "../components/Sidebar/SidebarComponent"

function DashboardScreen() {
  const [active, setActive] = useState("Dashboard")
  return (
    <div className="fixed inset-0 flex justify-center bg-white">
      <div className="flex w-full">
        <SidebarComponent active={active} onSelect={setActive} />
        <DashboardMainContentComponent active={active} />
      </div>
    </div>
  )
}

export default DashboardScreen
