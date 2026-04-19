import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { usePacientes } from '../hooks/usePacientes'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/Toast'
import Autocomplete from '../components/Autocomplete'
import { gerarExamesPDF } from '../lib/pdf'
import { fetchClinicaData } from '../lib/pdfHelper'

const GRUPOS = [
  {
    id: 'radio',
    label: 'Radiológicos',
    cor: '#dc2626',
    corBg: '#fef2f2',
    corBorder: '#fca5a5',
    exames: [
      'Radiografia Periapical',
      'Radiografia Panorâmica',
      'Radiografia Interproximal (Bite-Wing)',
      'Tomografia Computadorizada (CBCT)',
      'Telerradiografia de Perfil',
      'Radiografia Oclusal',
    ],
  },
  {
    id: 'lab',
    label: 'Laboratoriais',
    cor: '#2563eb',
    corBg: '#eff6ff',
    corBorder: '#93c5fd',
    exames: [
      'Hemograma Completo',
      'Glicemia em Jejum',
      'Coagulograma (TP/TTPA)',
      'Contagem de Plaquetas',
      'Creatinina',
      'TSH / T4 Livre',
      'Sorologias (HIV, Hepatite B e C)',
    ],
  },
  {
    id: 'comp',
    label: 'Complementares',
    cor: '#0d9488',
    corBg: '#f0fdf4',
    corBorder: '#6ee7b7',
    exames: [
      'Biópsia Incisional',
      'Biópsia Excisional',
      'Cultura e Antibiograma',
      'Citologia Esfoliativa',
      'Sialografia',
    ],
  },
]

export default function Exames() {
  const { pacientes } = usePacientes()
  const { profile, user } = useAuth()
  const toast = useToast()
  const location = useLocation()

  const [busca, setBusca] = useState('')
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null)

  useEffect(() => {
    const p = location.state?.paciente
    if (p) { setPacienteSelecionado(p); setBusca(p.nome) }
  }, [])
  const [dataSolicitacao, setDataSolicitacao] = useState(new Date().toISOString().split('T')[0])
  const [selecionados, setSelecionados] = useState(new Set())
  const [obs, setObs] = useState({})
  const [obsGeral, setObsGeral] = useState('')
  const [novoExame, setNovoExame] = useState('')
  const [examesPersonalizados, setExamesPersonalizados] = useState([])

  function toggle(nome) {
    setSelecionados(prev => {
      const next = new Set(prev)
      if (next.has(nome)) next.delete(nome)
      else next.add(nome)
      return next
    })
  }

  function setObsItem(nome, value) {
    setObs(prev => ({ ...prev, [nome]: value }))
  }

  function adicionarPersonalizado() {
    const nome = novoExame.trim()
    if (!nome) return
    if ([...GRUPOS.flatMap(g => g.exames), ...examesPersonalizados].includes(nome)) {
      toast('Exame já existe na lista.', 'error'); return
    }
    setExamesPersonalizados(prev => [...prev, nome])
    setSelecionados(prev => new Set([...prev, nome]))
    setNovoExame('')
  }

  function limpar() {
    setBusca('')
    setPacienteSelecionado(null)
    setDataSolicitacao(new Date().toISOString().split('T')[0])
    setSelecionados(new Set())
    setObs({})
    setObsGeral('')
    setExamesPersonalizados([])
    setNovoExame('')
  }

  async function gerarPDF() {
    if (!pacienteSelecionado) { toast('Selecione um paciente.', 'error'); return }
    if (selecionados.size === 0) { toast('Selecione pelo menos um exame.', 'error'); return }

    const examesList = [
      ...GRUPOS.flatMap(g => g.exames.filter(e => selecionados.has(e)).map(e => ({ nome: e, obs: obs[e] || '', grupo: g.label }))),
      ...examesPersonalizados.filter(e => selecionados.has(e)).map(e => ({ nome: e, obs: obs[e] || '', grupo: 'Outros' })),
    ]

    const clinicaData = await fetchClinicaData(user?.id)
    gerarExamesPDF({
      paciente: pacienteSelecionado.nome,
      data: new Date(dataSolicitacao + 'T12:00:00').toLocaleDateString('pt-BR'),
      exames: examesList,
      obsGeral,
      dentista: profile?.nome || 'Dentista',
      cro: profile?.cro || '',
      clinica: profile?.clinica || 'Meu Consultório SorrIA',
      clinicaData,
    })
    toast('Solicitação de exames gerada!', 'success')
  }

  const totalSelecionados = selecionados.size

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🔬 Exames</h1>
          <p className="page-subtitle">Solicitação de exames complementares</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={limpar}>🗑️ Limpar</button>
          <button className="btn btn-success" onClick={gerarPDF}>
            📄 Gerar Solicitação{totalSelecionados > 0 && ` (${totalSelecionados})`}
          </button>
        </div>
      </div>

      {/* Dados do Paciente */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 className="card-title" style={{ marginBottom: 14 }}>👤 Dados do Paciente</h3>
        <Autocomplete
          pacientes={pacientes}
          value={busca}
          onChange={v => { setBusca(v); if (!v) setPacienteSelecionado(null) }}
          onSelect={p => { setPacienteSelecionado(p); setBusca(p.nome) }}
        />
        {pacienteSelecionado && (
          <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--teal-50)', borderRadius: 6, fontSize: 13, color: 'var(--teal-700)' }}>
            ✅ {pacienteSelecionado.nome}
          </div>
        )}
        <div className="form-group" style={{ marginTop: 14, maxWidth: 260 }}>
          <label className="form-label">Data da Solicitação</label>
          <input
            className="form-input"
            type="date"
            value={dataSolicitacao}
            onChange={e => setDataSolicitacao(e.target.value)}
          />
        </div>
      </div>

      {/* Exames por categoria */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 className="card-title" style={{ marginBottom: 18 }}>🔬 Exames Solicitados</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {GRUPOS.map(grupo => (
            <div key={grupo.id}>
              {/* Cabeçalho do grupo */}
              <div style={{
                background: grupo.corBg, border: `1.5px solid ${grupo.corBorder}`,
                borderRadius: 8, padding: '8px 14px', marginBottom: 10,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: grupo.cor }}>
                  ● {grupo.label.toUpperCase()}
                </span>
                <span style={{ fontSize: 12, color: grupo.cor, opacity: 0.7 }}>
                  ({grupo.exames.filter(e => selecionados.has(e)).length} de {grupo.exames.length} selecionados)
                </span>
              </div>

              {/* Checkboxes */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 6, paddingLeft: 4 }}>
                {grupo.exames.map(exame => {
                  const sel = selecionados.has(exame)
                  return (
                    <div key={exame}>
                      <label
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '8px 12px', borderRadius: 7, cursor: 'pointer',
                          border: `1.5px solid ${sel ? grupo.corBorder : '#e5e7eb'}`,
                          background: sel ? grupo.corBg : '#fafafa',
                          transition: 'all 0.1s',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={sel}
                          onChange={() => toggle(exame)}
                          style={{ accentColor: grupo.cor, width: 15, height: 15, cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: 13, fontWeight: sel ? 600 : 400, color: sel ? grupo.cor : '#374151' }}>
                          {exame}
                        </span>
                      </label>
                      {sel && (
                        <input
                          className="form-input"
                          value={obs[exame] || ''}
                          onChange={e => setObsItem(exame, e.target.value)}
                          placeholder="Obs. (opcional)"
                          style={{ marginTop: 4, marginLeft: 4, fontSize: 12, padding: '5px 10px' }}
                          onClick={e => e.stopPropagation()}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Exames personalizados */}
          {examesPersonalizados.length > 0 && (
            <div>
              <div style={{
                background: '#f8fafc', border: '1.5px solid #e2e8f0',
                borderRadius: 8, padding: '8px 14px', marginBottom: 10,
              }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: '#475569' }}>● OUTROS</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 6, paddingLeft: 4 }}>
                {examesPersonalizados.map(exame => {
                  const sel = selecionados.has(exame)
                  return (
                    <label
                      key={exame}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 12px', borderRadius: 7, cursor: 'pointer',
                        border: `1.5px solid ${sel ? '#94a3b8' : '#e5e7eb'}`,
                        background: sel ? '#f1f5f9' : '#fafafa',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={sel}
                        onChange={() => toggle(exame)}
                        style={{ width: 15, height: 15, cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: 13, fontWeight: sel ? 600 : 400, color: '#374151' }}>{exame}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          {/* Adicionar exame personalizado */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
            <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 600, marginBottom: 8 }}>+ Exame personalizado</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="form-input"
                value={novoExame}
                onChange={e => setNovoExame(e.target.value)}
                placeholder="Nome do exame"
                onKeyDown={e => e.key === 'Enter' && adicionarPersonalizado()}
                style={{ flex: 1 }}
              />
              <button
                className="btn btn-secondary"
                onClick={adicionarPersonalizado}
                style={{ whiteSpace: 'nowrap' }}
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Observações gerais */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 12 }}>📝 Observações Gerais</h3>
        <textarea
          className="form-input"
          rows={3}
          value={obsGeral}
          onChange={e => setObsGeral(e.target.value)}
          placeholder="Informações adicionais para o laboratório ou clínica de imagem..."
        />
      </div>
    </div>
  )
}
