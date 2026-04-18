import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function RotaProtegida({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center', color: '#0d9488' }}>
          <div style={{ fontSize: 40 }}>🦷</div>
          <p style={{ marginTop: 12, fontWeight: 600 }}>Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return children
}
