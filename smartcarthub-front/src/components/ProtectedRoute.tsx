import React from "react" // 👈 ADICIONE ESTA LINHA
import { Navigate } from "react-router-dom"

interface ProtectedRouteProps {
  element: React.ReactElement // 👈 troque JSX.Element por React.ReactElement
  allowedRoles: string[]
}

export default function ProtectedRoute({
  element,
  allowedRoles,
}: ProtectedRouteProps) {
  const token = localStorage.getItem("token")
  const role = localStorage.getItem("role")

  if (!token) {
    return <Navigate to="/" replace />
  }

  if (role && !allowedRoles.includes(role)) {
    return <Navigate to="/cart" replace />
  }

  return element
}
