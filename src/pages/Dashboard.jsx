import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { usePacientes } from '../hooks/usePacientes'

const atalhos = [
  { path: '/prontuario', icon: '🦷', label: 'Prontuário', desc: 'Cadastro e odontograma' },
  { path: '/orcamento', icon: '💰', label: 'Orçamento', desc: 'Procedimentos e PDF' },
  { path: '/receituario', icon: '💊', label: 'Receituário', desc: 'Prescrições e medicamentos' },
  { path: '/atestado', icon: '📋', label: 'Atestado', desc: 'Afastamento do paciente' },
  { path: '/exames', icon: '🔬', label: 'Exames', desc: 'Solicitação de exames' },
]

export default function Dashboard() {
  const { profile, user } = useAuth()
  const { pacientes } = usePacientes()
  const navigate = useNavigate()

  const nome = profile?.nome || user?.email?.split('@')[0] || 'Dentista'
  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{saudacao}, Dr(a). {nome.split(' ')[0]}! 👋</h1>
          <p className="page-subtitle">Bem-vindo ao Meu Consultório SorrIA</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-teal">🦷</div>
          <div>
            <div className="stat-value">{pacientes.length}</div>
            <div className="stat-label">Pacientes cadastrados</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green">📋</div>
          <div>
            <div className="stat-value">{profile?.plano === 'pro' ? 'PRO' : 'FREE'}</div>
            <div className="stat-label">Plano atual</div>
          </div>
        </div>
        {profile?.clinica && (
          <div className="stat-card">
            <div className="stat-icon stat-icon-blue">🏥</div>
            <div>
              <div className="stat-value" style={{ fontSize: 16, marginTop: 4 }}>{profile.clinica}</div>
              <div className="stat-label">Clínica</div>
            </div>
          </div>
        )}
        {profile?.cro && (
          <div className="stat-card">
            <div className="stat-icon stat-icon-purple">🪪</div>
            <div>
              <div className="stat-value" style={{ fontSize: 16, marginTop: 4 }}>{profile.cro}</div>
              <div className="stat-label">CRO</div>
            </div>
          </div>
        )}
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 14 }}>
        Módulos do sistema
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
        {atalhos.map(a => (
          <button
            key={a.path}
            onClick={() => navigate(a.path)}
            style={{
              background: 'white',
              border: '1px solid var(--gray-200)',
              borderRadius: 12,
              padding: 20,
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.15s',
              boxShadow: 'var(--shadow)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--teal-400)'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = 'var(--shadow-md)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--gray-200)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'var(--shadow)'
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>{a.icon}</div>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--gray-800)' }}>{a.label}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 3 }}>{a.desc}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
