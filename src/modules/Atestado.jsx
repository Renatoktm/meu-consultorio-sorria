import { useState } from 'react'
import { usePacientes } from '../hooks/usePacientes'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/Toast'
import Autocomplete from '../components/Autocomplete'
import { gerarAtestadoPDF } from '../lib/pdf'

export default function Atestado() {
  const { pacientes } = usePacientes()
  const { profile } = useAuth()
  const toast = useToast()

  const [busca, setBusca] = useState('')
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null)
  const [form, setForm] = useState({
    data: new Date().toISOString().split('T')[0],
    dias: '1',
    cid: '',
    observacoes: ''
  })

  function set(field) {
    return e => setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  function gerarPDF() {
    if (!pacienteSelecionado) { toast('Selecione um paciente.', 'error'); return }
    if (!form.dias || form.dias < 1) { toast('Informe os dias de afastamento.', 'error'); return }
    gerarAtestadoPDF({
      paciente: pacienteSelecionado.nome,
      dias: form.dias,
      data: new Date(form.data + 'T12:00:00').toLocaleDateString('pt-BR'),
      cid: form.cid,
      observacoes: form.observacoes,
      dentista: profile?.nome || 'Dentista',
      cro: profile?.cro || '',
      clinica: profile?.clinica || 'Meu Consultório SorrIA'
    })
    toast('Atestado gerado!', 'success')
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">📋 Atestado</h1>
          <p className="page-subtitle">Atestado de afastamento odontológico</p>
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
        <h3 className="card-title" style={{ marginBottom: 16 }}>Dados do Atestado</h3>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Data do atendimento *</label>
            <input className="form-input" type="date" value={form.data} onChange={set('data')} />
          </div>
          <div className="form-group">
            <label className="form-label">Dias de afastamento *</label>
            <input
              className="form-input"
              type="number"
              min={1}
              value={form.dias}
              onChange={set('dias')}
              placeholder="1"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">CID-10 (opcional)</label>
          <input
            className="form-input"
            value={form.cid}
            onChange={set('cid')}
            placeholder="Ex: K04.0 — Pulpite"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Observações (opcional)</label>
          <textarea
            className="form-input"
            rows={4}
            value={form.observacoes}
            onChange={set('observacoes')}
            placeholder="Informações adicionais sobre o procedimento ou restrições..."
          />
        </div>

        <div style={{ background: 'var(--teal-50)', border: '1px solid var(--teal-200)', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: 'var(--teal-800)' }}>
          <strong>Prévia:</strong> Atesto que{' '}
          <strong>{pacienteSelecionado?.nome || '[paciente]'}</strong>{' '}
          necessita de afastamento por{' '}
          <strong>{form.dias} dia(s)</strong>{' '}
          a partir de{' '}
          <strong>
            {form.data
              ? new Date(form.data + 'T12:00:00').toLocaleDateString('pt-BR')
              : '[data]'}
          </strong>.
        </div>
      </div>
    </div>
  )
}
