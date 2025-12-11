import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"

import Sections from "./pages/Sections"
import Products from "./pages/Products"
import DashboardAnalytics from "./pages/DashboardAnalytics"

import Cart from "./pages/client/Cart"
import ProtectedRoute from "./components/ProtectedRoute"
import Dashboard from "./pages/Dashboard"
import Ruptures from "./pages/Ruptures"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/" element={<Login />} />

        {/* Cliente */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute element={<Cart />} allowedRoles={["CLIENTE"]} />
          }
        />

        {/* Gerente */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              element={<Dashboard />}
              allowedRoles={["GERENTE"]}
            />
          }
        />
        <Route
          path="/sections"
          element={
            <ProtectedRoute element={<Sections />} allowedRoles={["GERENTE"]} />
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute element={<Products />} allowedRoles={["GERENTE"]} />
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute
              element={<DashboardAnalytics />}
              allowedRoles={["GERENTE"]}
            />
          }
        />
        <Route
          path="/ruptures"
          element={
            <ProtectedRoute element={<Ruptures />} allowedRoles={["GERENTE"]} />
          }
        />

        {/* Rota padrão */}
        <Route
          path="*"
          element={
            <h2 style={{ color: "white" }}>404 - Página não encontrada</h2>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
