import { useState } from 'react'
import { usePacientes } from '../hooks/usePacientes'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/Toast'
import Autocomplete from '../components/Autocomplete'
import { gerarReceituarioPDF } from '../lib/pdf'

const MEDICAMENTOS_PADRAO = [
  'Amoxicilina 500mg',
  'Nimesulida 100mg',
  'Ibuprofeno 600mg',
  'Dipirona 500mg',
  'Metronidazol 250mg',
  'Paracetamol 750mg',
  'Clindamicina 300mg',
  'Diclofenaco 50mg',
]

const VIA_OPCOES = ['Oral', 'Sublingual', 'Tópica', 'Injetável']

const MED_VAZIO = { medicamento: '', posologia: '', via: 'Oral', quantidade: '1' }

export default function Receituario() {
  const { pacientes } = usePacientes()
  const { profile } = useAuth()
  const toast = useToast()

  const [busca, setBusca] = useState('')
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null)
  const [medicamentos, setMedicamentos] = useState([{ ...MED_VAZIO }])

  function addMed() {
    setMedicamentos(prev => [...prev, { ...MED_VAZIO }])
  }

  function removeMed(i) {
    setMedicamentos(prev => prev.filter((_, idx) => idx !== i))
  }

  function setMedField(i, field, value) {
    setMedicamentos(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m))
  }

  function gerarPDF() {
    if (!pacienteSelecionado) { toast('Selecione um paciente.', 'error'); return }
    const validos = medicamentos.filter(m => m.medicamento.trim())
    if (validos.length === 0) { toast('Adicione pelo menos um medicamento.', 'error'); return }
    gerarReceituarioPDF({
      paciente: pacienteSelecionado.nome,
      medicamentos: validos,
      dentista: profile?.nome || 'Dentista',
      cro: profile?.cro || '',
      clinica: profile?.clinica || 'Meu Consultório SorrIA'
    })
    toast('Receituário gerado!', 'success')
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">💊 Receituário</h1>
          <p className="page-subtitle">Prescrição de medicamentos</p>
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

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 className="card-title">Medicamentos</h3>
          <button className="btn btn-sm btn-secondary" onClick={addMed}>+ Adicionar</button>
        </div>

        {medicamentos.map((med, i) => (
          <div key={i} style={{ background: 'var(--gray-50)', borderRadius: 8, padding: 14, marginBottom: 12, border: '1px solid var(--gray-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <strong style={{ fontSize: 13, color: 'var(--gray-600)' }}>Medicamento {i + 1}</strong>
              {medicamentos.length > 1 && (
                <button className="btn btn-sm btn-danger" onClick={() => removeMed(i)}>× Remover</button>
              )}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Medicamento</label>
                <input
                  className="form-input"
                  list={`med-list-${i}`}
                  value={med.medicamento}
                  onChange={e => setMedField(i, 'medicamento', e.target.value)}
                  placeholder="Nome do medicamento"
                />
                <datalist id={`med-list-${i}`}>
                  {MEDICAMENTOS_PADRAO.map(m => <option key={m} value={m} />)}
                </datalist>
              </div>
              <div className="form-group">
                <label className="form-label">Via</label>
                <select className="form-input" value={med.via} onChange={e => setMedField(i, 'via', e.target.value)}>
                  {VIA_OPCOES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Posologia</label>
                <input
                  className="form-input"
                  value={med.posologia}
                  onChange={e => setMedField(i, 'posologia', e.target.value)}
                  placeholder="Ex: 1 comprimido de 8/8h por 7 dias"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Quantidade</label>
                <input
                  className="form-input"
                  value={med.quantidade}
                  onChange={e => setMedField(i, 'quantidade', e.target.value)}
                  placeholder="Ex: 21 comprimidos"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
