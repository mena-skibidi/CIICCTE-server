import BottomComponent from "./BottomComponent"
import MainComponent from "./MainComponent"

function SidebarComponent() {
  return (
    <div className="h-full w-64 shrink-0 border-r border-neutral-300 rounded-t-lg flex flex-col justify-between">
      <MainComponent />
      <BottomComponent />
    </div>
  )
}

export default SidebarComponent
