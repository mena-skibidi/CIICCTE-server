import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import AdminScreen from "./screens/AdminScreen"
import LoginScreen from "./screens/LoginScreen"
import UserScreen from "./screens/UserScreen"

function ProtectedRoute() {
  const token = localStorage.getItem("token")
  const rolesId = localStorage.getItem("roles_id")
  if (!token) {
    return <Navigate to="/login" replace />
  }
  if (rolesId === "1") {
    return <AdminScreen />
  }
  return <UserScreen />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/" element={<ProtectedRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
