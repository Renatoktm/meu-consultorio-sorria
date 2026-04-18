import { useNavigate, useLocation } from 'react-router-dom'

const modulos = [
  { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/prontuario', icon: '🦷', label: 'Prontuário' },
  { path: '/agenda', icon: '📅', label: 'Agenda' },
  { path: '/orcamento', icon: '💰', label: 'Orçamento' },
  { path: '/receituario', icon: '💊', label: 'Receituário' },
  { path: '/atestado', icon: '📋', label: 'Atestado' },
  { path: '/exames', icon: '🔬', label: 'Exames' },
  { path: '/configuracoes', icon: '⚙️', label: 'Configurações' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <aside className="sidebar">
      <div className="sidebar-label">Menu</div>
      {modulos.map(m => (
        <button
          key={m.path}
          className={`sidebar-item ${location.pathname === m.path ? 'active' : ''}`}
          onClick={() => navigate(m.path)}
        >
          <span className="sidebar-icon">{m.icon}</span>
          {m.label}
        </button>
      ))}
    </aside>
  )
}
