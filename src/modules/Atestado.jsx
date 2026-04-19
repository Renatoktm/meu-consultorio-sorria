import { useState } from 'react'
import { usePacientes } from '../hooks/usePacientes'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/Toast'
import Autocomplete from '../components/Autocomplete'
import { gerarAtestadoPDF } from '../lib/pdf'
import { fetchClinicaData } from '../lib/pdfHelper'

const O = {
  primary: '#ea580c', dark: '#c2410c', bg: '#fff7ed',
  border: '#fed7aa', text: '#7c2d12', light: '#ffedd5',
}

const PERIODOS = [
  '1 hora', '2 horas', '3 horas', '4 horas',
  'Meio período manhã', 'Meio período tarde',
  '1 dia', '2 dias', '3 dias', '5 dias', '7 dias',
]

export default function Atestado() {
  const { pacientes } = usePacientes()
  const { profile, user } = useAuth()
  const toast = useToast()

  const [busca, setBusca] = useState('')
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null)
  const [form, setForm] = useState({
    data: new Date().toISOString().split('T')[0],
    periodo: '1 dia',
    cid: '',
    observacoes: '',
  })

  function set(field) {
    return e => setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  function limpar() {
    setBusca('')
    setPacienteSelecionado(null)
    setForm({ data: new Date().toISOString().split('T')[0], periodo: '1 dia', cid: '', observacoes: '' })
  }

  async function gerarPDF() {
    if (!pacienteSelecionado) { toast('Selecione um paciente.', 'error'); return }
    const clinicaData = await fetchClinicaData(user?.id)
    gerarAtestadoPDF({
      paciente: pacienteSelecionado.nome,
      cpf: pacienteSelecionado.cpf || '',
      periodo: form.periodo,
      data: new Date(form.data + 'T12:00:00').toLocaleDateString('pt-BR'),
      cid: form.cid,
      observacoes: form.observacoes,
      dentista: profile?.nome || 'Dentista',
      cro: profile?.cro || '',
      clinica: profile?.clinica || 'Meu Consultório SorrIA',
      clinicaData,
    })
    toast('Atestado gerado!', 'success')
  }

  const dataFormatada = form.data
    ? new Date(form.data + 'T12:00:00').toLocaleDateString('pt-BR')
    : '[data]'

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">📋 Atestado</h1>
          <p className="page-subtitle">Atestado de afastamento odontológico</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={limpar}>🗑️ Limpar</button>
          <button
            style={{ background: O.primary, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            onClick={gerarPDF}
          >
            📄 Gerar Atestado
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
          <div style={{ marginTop: 10, padding: '8px 12px', background: O.bg, borderRadius: 6, fontSize: 13, color: O.text }}>
            ✅ {pacienteSelecionado.nome}
            {pacienteSelecionado.cpf && <> · CPF: <strong>{pacienteSelecionado.cpf}</strong></>}
          </div>
        )}
        <div className="form-row" style={{ marginTop: 14 }}>
          <div className="form-group">
            <label className="form-label">Data do Atendimento</label>
            <input className="form-input" type="date" value={form.data} onChange={set('data')} />
          </div>
          <div className="form-group">
            <label className="form-label">Período de Afastamento</label>
            <select className="form-input" value={form.periodo} onChange={set('periodo')}>
              {PERIODOS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group" style={{ marginTop: 4 }}>
          <label className="form-label">CID-10 (opcional)</label>
          <input
            className="form-input"
            value={form.cid}
            onChange={set('cid')}
            placeholder="Ex: K02.1, K04.0, K05.2"
          />
        </div>
      </div>

      {/* Motivo / Observações */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 className="card-title" style={{ marginBottom: 12 }}>📝 Motivo / Observações</h3>
        <textarea
          className="form-input"
          rows={4}
          value={form.observacoes}
          onChange={set('observacoes')}
          placeholder="Descreva o procedimento realizado, motivo do afastamento, restrições ou orientações ao paciente..."
        />
      </div>

      {/* Prévia do texto formal */}
      <div style={{ background: O.bg, border: `1px solid ${O.border}`, borderRadius: 10, padding: '16px 20px', fontSize: 13, color: O.text, lineHeight: 1.8 }}>
        <strong style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>Prévia do texto formal:</strong>
        <p style={{ margin: 0 }}>
          Atesto para os devidos fins que o(a) paciente{' '}
          <strong>{pacienteSelecionado?.nome || '[nome do paciente]'}</strong>
          {pacienteSelecionado?.cpf
            ? <>, portador(a) do CPF <strong>{pacienteSelecionado.cpf}</strong>,</>
            : ','
          }
          {' '}esteve sob meus cuidados odontológicos no dia{' '}
          <strong>{dataFormatada}</strong>, necessitando de afastamento de suas
          atividades pelo período de <strong>{form.periodo}</strong>.
          {form.cid && <> CID-10: <strong>{form.cid}</strong>.</>}
        </p>
      </div>
    </div>
  )
}
