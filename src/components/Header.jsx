import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function Header() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const initials = (profile?.nome || user?.email || 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="header">
      <div className="header-logo">
        <img src="/assets/logo.png" alt="SorrIA" style={{ height: 44, objectFit: 'contain' }} />
      </div>
      <div className="header-user">
        <span className="header-user-name">
          {profile?.clinica || profile?.nome || user?.email}
        </span>
        <div className="header-avatar">{initials}</div>
        <button className="btn-logout" onClick={handleLogout}>Sair</button>
      </div>
    </header>
  )
}
