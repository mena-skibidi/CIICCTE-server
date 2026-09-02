import { useState } from "react"
import ContentProxyComponent from "../components/ContentProxy/ContentProxyComponent"
import SidebarComponent from "../components/Sidebar/SidebarComponent"

function DashboardScreen() {
  const [active, setActive] = useState("Dashboard")
  return (
    <div className="fixed inset-0 flex justify-center bg-white">
      <div className="flex w-full">
        <SidebarComponent active={active} onSelect={setActive} />
        <ContentProxyComponent active={active} />
      </div>
    </div>
  )
}

export default DashboardScreen
