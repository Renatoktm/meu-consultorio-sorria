import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { usePlano } from '../hooks/usePlano'

const Icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  pacientes: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  agenda: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  orcamento: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  config: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  logout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
}

const modulos = [
  { path: '/dashboard', icon: Icons.dashboard, label: 'Dashboard', hint: 'Resumo da operacao' },
  { path: '/pacientes', icon: Icons.pacientes, label: 'Pacientes', hint: 'Cadastros e prontuarios' },
  { path: '/agenda', icon: Icons.agenda, label: 'Agenda', hint: 'Consultas e rotina diaria' },
  { path: '/orcamento', icon: Icons.orcamento, label: 'Orcamentos', hint: 'Propostas e retornos' },
  { path: '/configuracoes', icon: Icons.config, label: 'Configuracoes', hint: 'Plano e integracoes' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, user, signOut } = useAuth()
  const { plano } = usePlano()

  function isActive(modulo) {
    if (modulo.path === '/pacientes') return location.pathname.startsWith('/pacientes')
    return location.pathname === modulo.path
  }

  const iniciais = (profile?.nome || user?.email || 'U')
    .split(' ')
    .map(parte => parte[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const clinica = profile?.clinica || 'Meu consultorio'
  const nome = profile?.nome || user?.email?.split('@')[0] || 'Dentista'
  const planLabel = plano === 'pro'
    ? 'Plano Pro ativo'
    : plano === 'trial'
      ? 'Periodo de teste'
      : 'Plano gratuito'

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/assets/logo.png" alt="SorrIA" style={{ height: 38, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        <div className="sidebar-brand-copy">
          <span className="sidebar-brand-kicker">Consultorio inteligente</span>
          <strong className="sidebar-brand-title">Painel SorrIA</strong>
        </div>
      </div>

      <div className="sidebar-status">
        <span className="sidebar-status-dot" />
        <div className="sidebar-status-copy">
          <div className="sidebar-status-label">Operacao ativa</div>
          <div className="sidebar-status-text">{clinica}</div>
        </div>
      </div>

      <div className="sidebar-nav">
        <div className="sidebar-label">Navegacao</div>
        {modulos.map(modulo => (
          <button
            key={modulo.path}
            className={`sidebar-item ${isActive(modulo) ? 'active' : ''}`}
            onClick={() => navigate(modulo.path)}
          >
            <span className="sidebar-icon">{modulo.icon}</span>
            <span className="sidebar-item-copy">
              <span className="sidebar-item-label">{modulo.label}</span>
              <span className="sidebar-item-hint">{modulo.hint}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-footer-avatar">{iniciais}</div>
        <div className="sidebar-footer-info">
          <div className="sidebar-footer-name">{nome}</div>
          <div className="sidebar-footer-plan">{planLabel}</div>
        </div>
        <button onClick={handleLogout} title="Sair" className="sidebar-logout">
          {Icons.logout}
        </button>
      </div>
    </aside>
  )
}
