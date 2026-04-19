import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePacientes } from '../hooks/usePacientes'
import { usePlano } from '../hooks/usePlano'

const C = { primary: '#1a8a7b', dark: '#136b5e' }

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
  const { podeAdicionarPaciente } = usePlano()
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
      {showUpgrade && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setShowUpgrade(false)}
        >
          <div
            style={{ background: '#fff', borderRadius: 16, padding: 36, maxWidth: 400, width: '90%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,.15)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: 52, marginBottom: 12 }}>⭐</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Limite atingido</h3>
            <p style={{ fontSize: 14, color: '#718096', marginBottom: 24 }}>
              Você atingiu o limite de 3 pacientes no plano gratuito. Faça upgrade para cadastrar ilimitados.
            </p>
            <button
              onClick={() => setShowUpgrade(false)}
              style={{ padding: '9px 24px', borderRadius: 8, background: C.primary, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
