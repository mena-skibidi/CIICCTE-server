function App() {
  return (
    <>
      <div className="bg-white w-dvw h-dvh flex justify-center items-center">
        <div className="w-[15vw] h-[40vh] shadow-2xl rounded-4xl flex flex-col justify-center items-center">

          <div className="p-10 w-full h-2/6 rounded-tl-4xl rounded-tr-4xl bg-blue-600 flex flex-col justify-center items-center">
            <h1 className="text-4xl p-5 text-white text-shadow-2xs">CIICCTE</h1>
            <h2 className="text-2xl text-white text-shadow-2xs">Inicio de Sesion</h2>
          </div>

          <div className="p-10 w-full h-4/6 rounded-bl-4xl rounded-br-4xl border flex flex-col justify-center items-center">

            <div className="p-5 w-full flex flex-col justify-center items-center">
              <h3 className="text-2xl p-4">Nombre de usuario</h3>
              <input type="text" className="bg-white w-3/4 p-3 rounded-2xl border text-center placeholder:text-gray-500" placeholder="Usuario" />
            </div>

            <div className="p-5 mb-10 w-full flex flex-col justify-center items-center">
              <h3 className="text-2xl p-4">Password</h3>
              <input type="password" className="bg-white w-3/4 p-3 rounded-2xl border text-center placeholder:text-gray-500" placeholder="Password" />
            </div>

            <button className="w-1/2 bg-blue-600 p-4 text-2xl text-white rounded-2xl hover:opacity-90 hover:cursor-pointer">Ingresar</button>

          </div>
        </div>
      </div>

    </>
  )
}

export default App
