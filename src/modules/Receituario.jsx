import { useState } from 'react'
import { usePacientes } from '../hooks/usePacientes'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/Toast'
import Autocomplete from '../components/Autocomplete'
import Modal from '../components/Modal'
import { gerarReceituarioPDF } from '../lib/pdf'

const P = {
  primary: '#7c3aed', dark: '#5b21b6', bg: '#faf5ff',
  border: '#c4b5fd', text: '#4c1d95', light: '#ede9fe',
}

const MEDICAMENTOS_LISTA = [
  { nome: 'Amoxicilina 500mg',    posologia: '1 cápsula de 8/8h por 7 dias',                  via: 'Via oral',        quantidade: '21 cápsulas'    },
  { nome: 'Amoxicilina 875mg',    posologia: '1 comprimido de 12/12h por 7 dias',             via: 'Via oral',        quantidade: '14 comprimidos' },
  { nome: 'Nimesulida 100mg',     posologia: '1 comprimido de 12/12h por 5 dias',             via: 'Via oral',        quantidade: '10 comprimidos' },
  { nome: 'Ibuprofeno 600mg',     posologia: '1 comprimido de 8/8h por 3 dias',               via: 'Via oral',        quantidade: '9 comprimidos'  },
  { nome: 'Dipirona 500mg',       posologia: '1 comprimido de 6/6h se dor',                   via: 'Via oral',        quantidade: '20 comprimidos' },
  { nome: 'Paracetamol 750mg',    posologia: '1 comprimido de 6/6h se dor',                   via: 'Via oral',        quantidade: '20 comprimidos' },
  { nome: 'Metronidazol 250mg',   posologia: '1 comprimido de 8/8h por 7 dias',               via: 'Via oral',        quantidade: '21 comprimidos' },
  { nome: 'Metronidazol 400mg',   posologia: '1 comprimido de 8/8h por 7 dias',               via: 'Via oral',        quantidade: '21 comprimidos' },
  { nome: 'Clindamicina 300mg',   posologia: '1 cápsula de 8/8h por 7 dias',                  via: 'Via oral',        quantidade: '21 cápsulas'    },
  { nome: 'Cefalexina 500mg',     posologia: '1 cápsula de 6/6h por 7 dias',                   via: 'Via oral',        quantidade: '28 cápsulas'    },
  { nome: 'Dexametasona 4mg',     posologia: '1 comprimido de 12/12h por 3 dias',             via: 'Via oral',        quantidade: '6 comprimidos'  },
  { nome: 'Cataflam 50mg',        posologia: '1 comprimido de 8/8h por 3 dias',               via: 'Via oral',        quantidade: '9 comprimidos'  },
  { nome: 'Triazolam 0,25mg',     posologia: '1 comprimido 1h antes do procedimento',         via: 'Via oral',        quantidade: '1 comprimido'   },
  { nome: 'Nistatina suspensão',  posologia: 'Aplicar 4x ao dia por 14 dias',                 via: 'Uso tópico bucal', quantidade: '1 frasco'      },
]

const MED_VAZIO = { nome: '', posologia: '', via: 'Via oral', quantidade: '' }

export default function Receituario() {
  const { pacientes } = usePacientes()
  const { profile } = useAuth()
  const toast = useToast()

  const [busca, setBusca] = useState('')
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null)
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [idade, setIdade] = useState('')
  const [medicamentos, setMedicamentos] = useState([])
  const [observacoes, setObservacoes] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [medAtual, setMedAtual] = useState({ ...MED_VAZIO })
  const [selectMed, setSelectMed] = useState('')

  function selecionarPadrao(nome) {
    setSelectMed(nome)
    const encontrado = MEDICAMENTOS_LISTA.find(m => m.nome === nome)
    if (encontrado) setMedAtual({ ...encontrado })
    else setMedAtual(p => ({ ...p, nome }))
  }

  function abrirModal() {
    setMedAtual({ ...MED_VAZIO })
    setSelectMed('')
    setModalAberto(true)
  }

  function confirmarMed() {
    if (!medAtual.nome.trim()) { toast('Informe o nome do medicamento.', 'error'); return }
    setMedicamentos(prev => [...prev, { ...medAtual, id: Date.now() }])
    setModalAberto(false)
  }

  function removerMed(id) {
    setMedicamentos(prev => prev.filter(m => m.id !== id))
  }

  function limpar() {
    setBusca('')
    setPacienteSelecionado(null)
    setData(new Date().toISOString().split('T')[0])
    setIdade('')
    setMedicamentos([])
    setObservacoes('')
  }

  function gerarPDF() {
    if (!pacienteSelecionado) { toast('Selecione um paciente.', 'error'); return }
    if (medicamentos.length === 0) { toast('Adicione pelo menos um medicamento.', 'error'); return }
    gerarReceituarioPDF({
      paciente: pacienteSelecionado.nome,
      data: new Date(data + 'T12:00:00').toLocaleDateString('pt-BR'),
      idade,
      medicamentos,
      observacoes,
      dentista: profile?.nome || 'Dentista',
      cro: profile?.cro || '',
      clinica: profile?.clinica || 'Meu Consultório SorrIA',
    })
    toast('Receituário gerado!', 'success')
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">💊 Receituário</h1>
          <p className="page-subtitle">Prescrição de medicamentos odontológicos</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={limpar}>🗑️ Limpar</button>
          <button
            style={{ background: P.primary, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            onClick={gerarPDF}
          >
            📄 Gerar Receituário
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
          onSelect={p => {
            setPacienteSelecionado(p)
            setBusca(p.nome)
            if (p.data_nascimento) {
              const anos = Math.floor((new Date() - new Date(p.data_nascimento)) / 31557600000)
              setIdade(`${anos} anos`)
            }
          }}
        />
        {pacienteSelecionado && (
          <div style={{ marginTop: 10, padding: '8px 12px', background: P.bg, borderRadius: 6, fontSize: 13, color: P.text }}>
            ✅ {pacienteSelecionado.nome}
          </div>
        )}
        <div className="form-row" style={{ marginTop: 14 }}>
          <div className="form-group">
            <label className="form-label">Data</label>
            <input className="form-input" type="date" value={data} onChange={e => setData(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Idade</label>
            <input
              className="form-input"
              value={idade}
              onChange={e => setIdade(e.target.value)}
              placeholder="Ex: 32 anos"
            />
          </div>
        </div>
      </div>

      {/* Medicamentos Prescritos */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 className="card-title">💊 Medicamentos Prescritos</h3>
          <button
            style={{ background: P.primary, color: '#fff', border: 'none', borderRadius: 7, padding: '7px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
            onClick={abrirModal}
          >
            + Adicionar
          </button>
        </div>

        {medicamentos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px 0', color: '#9ca3af' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>💊</div>
            <div style={{ fontSize: 14 }}>Nenhum medicamento adicionado</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Clique em "+ Adicionar" para prescrever</div>
          </div>
        ) : (
          medicamentos.map((med, i) => (
            <div
              key={med.id}
              style={{
                background: P.bg, border: `1.5px solid ${P.border}`,
                borderRadius: 10, padding: '12px 16px', marginBottom: 10,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <strong style={{ fontSize: 14, color: P.dark }}>{i + 1}. {med.nome}</strong>
                <button
                  onClick={() => removerMed(med.id)}
                  style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1, flexShrink: 0 }}
                  title="Remover"
                >🗑️</button>
              </div>
              <div style={{ fontSize: 13, color: '#374151', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                <div><span style={{ color: '#7c3aed', fontWeight: 600 }}>Posologia:</span> {med.posologia || '—'}</div>
                <div><span style={{ color: '#7c3aed', fontWeight: 600 }}>Qtd:</span> {med.quantidade || '—'}</div>
                <div style={{ gridColumn: '1/-1' }}><span style={{ color: '#7c3aed', fontWeight: 600 }}>Via:</span> {med.via || '—'}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Observações */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 12 }}>📝 Observações</h3>
        <textarea
          className="form-input"
          rows={3}
          value={observacoes}
          onChange={e => setObservacoes(e.target.value)}
          placeholder="Alergias conhecidas, instruções especiais, restrições..."
        />
      </div>

      {/* Modal de medicamento */}
      <Modal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        title="💊 Adicionar Medicamento"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button className="btn btn-secondary" onClick={() => setModalAberto(false)}>Cancelar</button>
            <button
              style={{ background: P.primary, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
              onClick={confirmarMed}
            >
              + Adicionar
            </button>
          </div>
        }
      >
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Medicamento pré-definido</label>
          <select
            className="form-input"
            value={selectMed}
            onChange={e => selecionarPadrao(e.target.value)}
          >
            <option value="">— Selecione para preencher automaticamente —</option>
            {MEDICAMENTOS_LISTA.map(m => (
              <option key={m.nome} value={m.nome}>{m.nome}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 12 }}>
          <label className="form-label">Nome do Medicamento *</label>
          <input
            className="form-input"
            value={medAtual.nome}
            onChange={e => setMedAtual(p => ({ ...p, nome: e.target.value }))}
            placeholder="Ex: Amoxicilina 500mg"
          />
        </div>

        <div className="form-group" style={{ marginBottom: 12 }}>
          <label className="form-label">Posologia</label>
          <input
            className="form-input"
            value={medAtual.posologia}
            onChange={e => setMedAtual(p => ({ ...p, posologia: e.target.value }))}
            placeholder="Ex: 1 cápsula de 8/8h por 7 dias"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Via de Administração</label>
            <input
              className="form-input"
              value={medAtual.via}
              onChange={e => setMedAtual(p => ({ ...p, via: e.target.value }))}
              placeholder="Via oral"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Quantidade</label>
            <input
              className="form-input"
              value={medAtual.quantidade}
              onChange={e => setMedAtual(p => ({ ...p, quantidade: e.target.value }))}
              placeholder="Ex: 21 cápsulas"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
