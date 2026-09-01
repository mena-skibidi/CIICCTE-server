import BottomComponent from "./BottomComponent"
import MainComponent from "./MainComponent"

type Props = {
  active: string
  onSelect: (label: string) => void
}

function SidebarComponent({ active, onSelect }: Props) {
  return (
    <div className="h-full w-64 shrink-0 border-r border-neutral-300 rounded-t-lg flex flex-col justify-between">
      <MainComponent active={active} onSelect={onSelect} />
      <BottomComponent />
    </div>
  )
}

export default SidebarComponent
