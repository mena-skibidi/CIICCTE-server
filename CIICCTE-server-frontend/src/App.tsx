import { BrowserRouter, Route, Routes } from "react-router-dom"
import DashboardScreen from "./screens/DashboardScreen"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardScreen />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
