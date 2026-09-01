function MainButtonComponent({ label }: { label: string }) {
  return (
    <div className="w-9/10 rounded-r-lg rounded-l-lg bg-sky-400 text-white flex justify-center items-center pt-3 pb-3 text-lg
  hover:opacity-90 hover:cursor-pointer cursor-pointer">{label}</div>
  )
}

export default MainButtonComponent
