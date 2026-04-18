import { useState } from 'react'
import { usePacientes } from '../hooks/usePacientes'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/Toast'
import Autocomplete from '../components/Autocomplete'
import { gerarExamesPDF } from '../lib/pdf'

const EXAMES_PADRAO = [
  { id: 1, nome: 'Radiografia Periapical', obs: '' },
  { id: 2, nome: 'Radiografia Panorâmica', obs: '' },
  { id: 3, nome: 'Hemograma Completo', obs: '' },
  { id: 4, nome: 'Glicemia de Jejum', obs: '' },
  { id: 5, nome: 'Coagulograma (TP, TTPA)', obs: '' },
]

export default function Exames() {
  const { pacientes } = usePacientes()
  const { profile } = useAuth()
  const toast = useToast()

  const [busca, setBusca] = useState('')
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null)
  const [catalogo, setCatalogo] = useState(EXAMES_PADRAO)
  const [selecionados, setSelecionados] = useState([])
  const [novoExame, setNovoExame] = useState('')
  const [adicionando, setAdicionando] = useState(false)

  function toggleExame(exame) {
    setSelecionados(prev =>
      prev.find(e => e.id === exame.id)
        ? prev.filter(e => e.id !== exame.id)
        : [...prev, { ...exame }]
    )
  }

  function setObs(id, obs) {
    setSelecionados(prev => prev.map(e => e.id === id ? { ...e, obs } : e))
  }

  function adicionarExame() {
    if (!novoExame.trim()) return
    const novo = { id: Date.now(), nome: novoExame.trim(), obs: '' }
    setCatalogo(prev => [...prev, novo])
    setNovoExame('')
    setAdicionando(false)
  }

  function gerarPDF() {
    if (!pacienteSelecionado) { toast('Selecione um paciente.', 'error'); return }
    if (selecionados.length === 0) { toast('Selecione pelo menos um exame.', 'error'); return }
    gerarExamesPDF({
      paciente: pacienteSelecionado.nome,
      exames: selecionados,
      dentista: profile?.nome || 'Dentista',
      clinica: profile?.clinica || 'Meu Consultório SorrIA'
    })
    toast('Solicitação de exames gerada!', 'success')
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🔬 Exames</h1>
          <p className="page-subtitle">Solicitação de exames complementares</p>
        </div>
        <button className="btn btn-success" onClick={gerarPDF}>📄 Gerar PDF</button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 className="card-title" style={{ marginBottom: 12 }}>Paciente</h3>
        <Autocomplete
          pacientes={pacientes}
          value={busca}
          onChange={v => { setBusca(v); if (!v) setPacienteSelecionado(null) }}
          onSelect={p => { setPacienteSelecionado(p); setBusca(p.nome) }}
        />
        {pacienteSelecionado && (
          <div style={{ marginTop: 8, padding: '6px 12px', background: 'var(--teal-50)', borderRadius: 6, fontSize: 13, color: 'var(--teal-700)' }}>
            ✅ {pacienteSelecionado.nome}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Catálogo */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 className="card-title">Catálogo de Exames</h3>
            <button className="btn btn-sm btn-secondary" onClick={() => setAdicionando(!adicionando)}>
              + Personalizado
            </button>
          </div>

          {adicionando && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input
                className="form-input"
                value={novoExame}
                onChange={e => setNovoExame(e.target.value)}
                placeholder="Nome do exame"
                onKeyDown={e => e.key === 'Enter' && adicionarExame()}
              />
              <button className="btn btn-sm btn-primary" onClick={adicionarExame}>Add</button>
              <button className="btn btn-sm btn-secondary" onClick={() => setAdicionando(false)}>×</button>
            </div>
          )}

          {catalogo.map(exame => {
            const sel = !!selecionados.find(e => e.id === exame.id)
            return (
              <div
                key={exame.id}
                onClick={() => toggleExame(exame)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  marginBottom: 6,
                  borderRadius: 8,
                  border: `1.5px solid ${sel ? 'var(--teal-500)' : 'var(--gray-200)'}`,
                  background: sel ? 'var(--teal-50)' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <span style={{ fontSize: 18 }}>{sel ? '✅' : '⬜'}</span>
                <span style={{ fontSize: 14, fontWeight: sel ? 600 : 400 }}>{exame.nome}</span>
              </div>
            )
          })}
        </div>

        {/* Selecionados */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 14 }}>
            Exames Selecionados ({selecionados.length})
          </h3>

          {selecionados.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}>
              <div className="empty-state-icon" style={{ fontSize: 32 }}>🔬</div>
              <p className="empty-state-sub">Nenhum exame selecionado</p>
            </div>
          ) : (
            selecionados.map((exame, i) => (
              <div key={exame.id} style={{ marginBottom: 14, padding: 12, background: 'var(--gray-50)', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <strong style={{ fontSize: 14 }}>{i + 1}. {exame.nome}</strong>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => setSelecionados(prev => prev.filter(e => e.id !== exame.id))}
                  >
                    × Remover
                  </button>
                </div>
                <input
                  className="form-input"
                  value={exame.obs}
                  onChange={e => setObs(exame.id, e.target.value)}
                  placeholder="Observações (opcional)"
                  onClick={e => e.stopPropagation()}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
