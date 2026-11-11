import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

export default function AuthProvider({ children }: { children: ReactNode }) {
  return localStorage.getItem('accessToken') ? children : <Navigate to="/login" replace />
}
