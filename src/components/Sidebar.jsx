import { useNavigate, useLocation } from 'react-router-dom'

const modulos = [
  { path: '/dashboard',    icon: '🏠', label: 'Dashboard' },
  { path: '/pacientes',    icon: '👥', label: 'Pacientes' },
  { path: '/agenda',       icon: '📅', label: 'Agenda' },
  { path: '/orcamento',    icon: '💰', label: 'Orçamento' },
  { path: '/configuracoes',icon: '⚙️', label: 'Configurações' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  function isActive(m) {
    if (m.path === '/pacientes') return location.pathname.startsWith('/pacientes')
    return location.pathname === m.path
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-label">Menu</div>
      {modulos.map(m => (
        <button
          key={m.path}
          className={`sidebar-item ${isActive(m) ? 'active' : ''}`}
          onClick={() => navigate(m.path)}
        >
          <span className="sidebar-icon">{m.icon}</span>
          {m.label}
        </button>
      ))}
    </aside>
  )
}
