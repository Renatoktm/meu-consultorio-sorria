import { useGoogleCalendar } from '../hooks/useGoogleCalendar'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/Toast'

export default function Configuracoes() {
  const { profile } = useAuth()
  const { isConnected, connectGoogle, disconnectGoogle } = useGoogleCalendar()
  const toast = useToast()

  async function handleDisconnect() {
    await disconnectGoogle()
    toast('Google Calendar desconectado.', 'success')
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">⚙️ Configurações</h1>
          <p className="page-subtitle">Gerencie as integrações e preferências do sistema</p>
        </div>
      </div>

      {/* Perfil */}
      {profile && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 className="card-title" style={{ marginBottom: 14 }}>👤 Perfil</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>Nome</div>
              <div style={{ fontWeight: 600 }}>{profile.nome || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>Clínica</div>
              <div style={{ fontWeight: 600 }}>{profile.clinica || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>CRO</div>
              <div style={{ fontWeight: 600 }}>{profile.cro || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>Plano</div>
              <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{profile.plano || 'free'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Integrações */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 18 }}>🔗 Integrações</h3>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', border: '1.5px solid #e5e7eb', borderRadius: 10,
          background: isConnected ? '#f0fdf4' : '#fafafa',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Google Calendar icon */}
            <div style={{
              width: 44, height: 44, borderRadius: 10, background: '#fff',
              border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 22, boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}>
              📅
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Google Calendar</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                {isConnected
                  ? 'Sua agenda está sincronizada com o Google Calendar'
                  : 'Sincronize consultas com seu Google Calendar'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isConnected ? (
              <>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                  background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0',
                }}>
                  ✅ Conectado
                </span>
                <button
                  className="btn btn-secondary"
                  onClick={handleDisconnect}
                  style={{ fontSize: 13 }}
                >
                  Desconectar
                </button>
              </>
            ) : (
              <button
                onClick={() => connectGoogle()}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '9px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: '#16a34a', color: '#fff', fontWeight: 600, fontSize: 14,
                }}
              >
                🔗 Conectar Google Calendar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
