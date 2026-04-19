import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePacientes } from '../hooks/usePacientes'
import { usePlano } from '../hooks/usePlano'

const C = { primary: '#1a8a7b', dark: '#136b5e' }

function BannerFreemium({ total, limite, onUpgrade }) {
  const pct = Math.min((total / limite) * 100, 100)
  const restam = limite - total
  const cheio = total >= limite

  return (
    <div style={{
      background: cheio ? '#fff7ed' : '#f0fdf4',
      border: `1.5px solid ${cheio ? '#fb923c' : '#86efac'}`,
      borderRadius: 12,
      padding: '14px 18px',
      marginBottom: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      flexWrap: 'wrap',
    }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: cheio ? '#9a3412' : '#166534' }}>
            {cheio ? '🚫 Limite atingido — Plano Gratuito' : `👥 Plano Gratuito — ${restam} vaga${restam !== 1 ? 's' : ''} restante${restam !== 1 ? 's' : ''}`}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: cheio ? '#ea580c' : C.primary }}>
            {total}/{limite} pacientes
          </span>
        </div>
        <div style={{ height: 6, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            background: cheio ? 'linear-gradient(90deg, #f97316, #ef4444)' : 'linear-gradient(90deg, #1a8a7b, #34d399)',
            borderRadius: 99,
            transition: 'width .4s',
          }} />
        </div>
      </div>
      <button
        onClick={onUpgrade}
        style={{
          padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
          background: cheio ? '#ea580c' : C.primary,
          color: '#fff', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        ⭐ Fazer Upgrade
      </button>
    </div>
  )
}

function ModalUpgrade({ onClose }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: 20, padding: '36px 32px', maxWidth: 480, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,.18)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 52, marginBottom: 8 }}>⭐</div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1a202c', marginBottom: 6 }}>Desbloqueie o plano Pro</h3>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Cadastre pacientes ilimitados e use todos os recursos sem restrições.</p>
        </div>

        {/* Planos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
          {/* Free */}
          <div style={{ padding: '14px 18px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#f9fafb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontWeight: 700, color: '#374151' }}>Gratuito</span>
              <span style={{ fontWeight: 800, fontSize: 18, color: '#374151' }}>R$ 0<span style={{ fontSize: 12, fontWeight: 400 }}>/mês</span></span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {['Até 3 pacientes', 'Todos os módulos', 'Geração de PDF'].map(f => (
                <li key={f} style={{ fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#9ca3af' }}>•</span> {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div style={{ padding: '14px 18px', borderRadius: 12, border: `2px solid ${C.primary}`, background: '#f0fdf4', position: 'relative' }}>
            <div style={{
              position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
              background: C.primary, color: '#fff', fontSize: 11, fontWeight: 700,
              padding: '3px 14px', borderRadius: 99,
            }}>RECOMENDADO</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontWeight: 700, color: C.dark }}>Pro</span>
              <span style={{ fontWeight: 800, fontSize: 18, color: C.primary }}>R$ 59<span style={{ fontSize: 12, fontWeight: 400 }}>/mês</span></span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {['Pacientes ilimitados', 'Todos os módulos', 'PDFs com logo da clínica', 'Agenda + Google Calendar', 'Suporte por e-mail'].map(f => (
                <li key={f} style={{ fontSize: 13, color: '#166534', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: C.primary }}>✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Botões */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#fff', color: '#6b7280', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
          >
            Agora não
          </button>
          <button
            onClick={() => { alert('Em breve! Integração com pagamento será ativada.'); onClose() }}
            style={{ flex: 2, padding: '11px 0', borderRadius: 10, border: 'none', background: C.primary, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            Assinar Pro — R$ 59/mês
          </button>
        </div>
        <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 12 }}>
          Cancele quando quiser. Sem fidelidade.
        </p>
      </div>
    </div>
  )
}

function calcIdade(dataNasc) {
  if (!dataNasc) return null
  const nasc = new Date(dataNasc + 'T12:00:00')
  const hoje = new Date()
  let idade = hoje.getFullYear() - nasc.getFullYear()
  const m = hoje.getMonth() - nasc.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--
  return idade
}

function Avatar({ nome, size = 42 }) {
  const iniciais = (nome || '?').split(' ').filter(Boolean).map(w => w[0].toUpperCase()).slice(0, 2).join('')
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #3182ce, #63b3ed)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: size * 0.36, flexShrink: 0,
    }}>
      {iniciais}
    </div>
  )
}

export default function Pacientes() {
  const navigate = useNavigate()
  const { pacientes, loading } = usePacientes()
  const { podeAdicionarPaciente, isFree, total, LIMITE_FREE } = usePlano()
  const [busca, setBusca] = useState('')
  const [showUpgrade, setShowUpgrade] = useState(false)

  const filtrados = pacientes.filter(p =>
    p.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    (p.cpf && p.cpf.includes(busca))
  )

  function handleNovo() {
    if (!podeAdicionarPaciente) { setShowUpgrade(true); return }
    navigate('/pacientes/novo')
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">👥 Pacientes</h1>
          <p className="page-subtitle">Gerenciamento de pacientes e prontuários</p>
        </div>
        <button className="btn btn-primary" onClick={handleNovo}>
          + Novo Paciente
        </button>
      </div>

      {/* Banner freemium */}
      {isFree && (
        <BannerFreemium
          total={total}
          limite={LIMITE_FREE}
          onUpgrade={() => setShowUpgrade(true)}
        />
      )}

      {/* Busca */}
      <div className="card" style={{ padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            fontSize: 15, pointerEvents: 'none',
          }}>🔍</span>
          <input
            className="form-input"
            style={{ paddingLeft: 38, width: '100%', boxSizing: 'border-box' }}
            placeholder="Buscar por nome ou CPF..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#a0aec0', fontSize: 14 }}>Carregando...</div>
      ) : filtrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: '#a0aec0' }}>
          <div style={{ fontSize: 54, marginBottom: 14 }}>👤</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#718096' }}>
            {busca ? 'Nenhum resultado para sua busca.' : 'Nenhum paciente cadastrado.'}
          </p>
          {!busca && (
            <p style={{ fontSize: 13, marginTop: 4 }}>Clique em "+ Novo Paciente" para começar.</p>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtrados.map(p => {
            const idade = calcIdade(p.data_nascimento)
            const tel = p.telefone?.replace(/\D/g, '')
            const info = [
              idade != null && `${idade} anos`,
              p.telefone,
              p.convenio,
            ].filter(Boolean).join(' · ')

            return (
              <div
                key={p.id}
                className="card"
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 18px', borderLeft: `4px solid #3182ce`,
                  transition: 'transform .15s, box-shadow .15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,.12)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = ''
                }}
              >
                <Avatar nome={p.nome} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#1a202c', marginBottom: 2 }}>{p.nome}</p>
                  <p style={{ fontSize: 12, color: '#718096' }}>{info || 'Sem informações adicionais'}</p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {tel && (
                    <a
                      href={`https://wa.me/55${tel}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{
                        padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                        background: '#dcfce7', color: '#166534', border: '1.5px solid #86efac',
                        textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      📱 WhatsApp
                    </a>
                  )}
                  <button
                    onClick={() => navigate(`/pacientes/${p.id}`)}
                    style={{
                      padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                      background: C.primary, color: '#fff', border: 'none', cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Abrir →
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal upgrade */}
      {showUpgrade && <ModalUpgrade onClose={() => setShowUpgrade(false)} />}
    </div>
  )
}
