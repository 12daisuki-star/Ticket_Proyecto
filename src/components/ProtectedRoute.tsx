
import { useAuth } from '@/context/AuthContext'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/" replace />
  return <>{children}</>
}
