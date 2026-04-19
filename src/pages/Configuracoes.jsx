import { useState, useEffect } from 'react'
import { useGoogleCalendar } from '../hooks/useGoogleCalendar'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/Toast'
import { supabase } from '../lib/supabase'

const labelStyle = { fontSize: 12, color: '#6b7280', marginBottom: 4, display: 'block', fontWeight: 500 }

export default function Configuracoes() {
  const { profile, user } = useAuth()
  const { isConnected, connectGoogle, disconnectGoogle } = useGoogleCalendar()
  const toast = useToast()

  const [form, setForm] = useState({
    nome_clinica: '',
    nome_dentista: '',
    cro: '',
    endereco: '',
    telefone: '',
    email_clinica: '',
    desconto_pix_padrao: '',
  })
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    supabase.from('clinicas').select('*').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setForm({
            nome_clinica: data.nome_clinica || '',
            nome_dentista: data.nome_dentista || '',
            cro: data.cro || '',
            endereco: data.endereco || '',
            telefone: data.telefone || '',
            email_clinica: data.email_clinica || '',
            desconto_pix_padrao: data.desconto_pix_padrao ?? '',
          })
        }
        setCarregando(false)
      })
  }, [user?.id])

  function set(field) {
    return e => setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function salvar() {
    if (!user?.id) return
    setSalvando(true)
    const { error } = await supabase.from('clinicas').upsert({
      user_id: user.id,
      nome_clinica: form.nome_clinica,
      nome_dentista: form.nome_dentista,
      cro: form.cro,
      endereco: form.endereco,
      telefone: form.telefone,
      email_clinica: form.email_clinica,
      desconto_pix_padrao: form.desconto_pix_padrao !== '' ? parseFloat(form.desconto_pix_padrao) : null,
    }, { onConflict: 'user_id' })
    setSalvando(false)
    if (error) toast('Erro ao salvar: ' + error.message, 'error')
    else toast('Configurações salvas com sucesso!', 'success')
  }

  async function handleDisconnect() {
    await disconnectGoogle()
    toast('Google Calendar desconectado.', 'success')
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">⚙️ Configurações</h1>
          <p className="page-subtitle">Gerencie os dados da clínica, integrações e preferências</p>
        </div>
      </div>

      {/* Dados da Clínica */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 className="card-title" style={{ marginBottom: 18 }}>🏥 Dados da Clínica</h3>

        {carregando ? (
          <div style={{ color: '#9ca3af', fontSize: 14, padding: '20px 0' }}>Carregando...</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>Nome da Clínica</label>
                <input
                  className="input"
                  value={form.nome_clinica}
                  onChange={set('nome_clinica')}
                  placeholder="Ex: Clínica SorrIA Odontologia"
                />
              </div>
              <div>
                <label style={labelStyle}>Dentista Responsável</label>
                <input
                  className="input"
                  value={form.nome_dentista}
                  onChange={set('nome_dentista')}
                  placeholder="Ex: Dr. João Silva"
                />
              </div>
              <div>
                <label style={labelStyle}>CRO (número e estado)</label>
                <input
                  className="input"
                  value={form.cro}
                  onChange={set('cro')}
                  placeholder="Ex: CRO-MG 12345"
                />
              </div>
              <div>
                <label style={labelStyle}>Telefone</label>
                <input
                  className="input"
                  value={form.telefone}
                  onChange={set('telefone')}
                  placeholder="Ex: (31) 99999-9999"
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Endereço Completo</label>
                <input
                  className="input"
                  value={form.endereco}
                  onChange={set('endereco')}
                  placeholder="Ex: Rua das Flores, 123, Centro, Belo Horizonte - MG, CEP 30000-000"
                />
              </div>
              <div>
                <label style={labelStyle}>E-mail da Clínica</label>
                <input
                  className="input"
                  type="email"
                  value={form.email_clinica}
                  onChange={set('email_clinica')}
                  placeholder="Ex: contato@clinicasorria.com.br"
                />
              </div>
              <div>
                <label style={labelStyle}>Desconto Padrão PIX (%)</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={form.desconto_pix_padrao}
                  onChange={set('desconto_pix_padrao')}
                  placeholder="Ex: 5"
                />
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                  Aparece como sugestão nos orçamentos com pagamento PIX
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-primary"
                onClick={salvar}
                disabled={salvando}
                style={{ minWidth: 180 }}
              >
                {salvando ? 'Salvando...' : '💾 Salvar Configurações'}
              </button>
            </div>
          </>
        )}
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
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>Clínica (conta)</div>
              <div style={{ fontWeight: 600 }}>{profile.clinica || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>CRO (conta)</div>
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
