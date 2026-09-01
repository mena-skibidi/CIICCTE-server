function BottomInnerComponent() {
  return (
    <div className="w-full flex flex-col justify-center items-center text-center">  
      <div className="w-full flex flex-row justify-center items-center pt-3 pb-2 border-t rounded-t-lg border-t-neutral-300">
        <span className="text-lg text-neutral-500">skibidi</span>
        <span className="text-lg text-sky-700 select-none">#</span>
        <span className="text-lg underline text-sky-700 select-none">admin</span>
      </div>
      <button className="min-h-4 w-full bg-sky-400 flex justify-center items-center pb-3 pt-3 text-xl select-none text-white hover:opacity-90 hover:bg-red-500 hover:cursor-pointer cursor-pointer">Cerrar sesion</button>
    </div>
  )
}

export default BottomInnerComponent
