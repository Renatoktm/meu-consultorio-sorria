import { useState, useEffect, useCallback } from 'react'
import { useGoogleCalendar } from '../hooks/useGoogleCalendar'
import { useAuth } from '../hooks/useAuth'
import { usePacientes } from '../hooks/usePacientes'
import { useToast } from '../components/Toast'
import { supabase } from '../lib/supabase'
import Autocomplete from '../components/Autocomplete'

const DURACOES = [
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1h', value: 60 },
  { label: '1h30', value: 90 },
  { label: '2h', value: 120 },
]

function addMinutes(dateStr, timeStr, minutes) {
  const dt = new Date(`${dateStr}T${timeStr}:00`)
  dt.setMinutes(dt.getMinutes() + minutes)
  return dt.toISOString()
}

function startOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatHour(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function formatDateHeader(date) {
  return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
}

export default function Agenda() {
  const { user } = useAuth()
  const { pacientes } = usePacientes()
  const toast = useToast()
  const { isConnected, loading, connectGoogle, getEvents, createEvent, deleteEvent } = useGoogleCalendar()

  const [semanaBase, setSemanaBase] = useState(() => startOfWeek(new Date()))
  const [eventos, setEventos] = useState([])
  const [loadingEventos, setLoadingEventos] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)

  // Formulário nova consulta
  const [busca, setBusca] = useState('')
  const [pacienteSel, setPacienteSel] = useState(null)
  const [procedimento, setProcedimento] = useState('')
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [horario, setHorario] = useState('08:00')
  const [duracao, setDuracao] = useState(60)
  const [observacoes, setObservacoes] = useState('')

  const diasDaSemana = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(semanaBase)
    d.setDate(semanaBase.getDate() + i)
    return d
  })

  const carregarEventos = useCallback(async () => {
    if (!isConnected) return
    setLoadingEventos(true)
    try {
      const fim = new Date(semanaBase)
      fim.setDate(fim.getDate() + 7)
      const evs = await getEvents(semanaBase.toISOString(), fim.toISOString())
      setEventos(evs)
    } finally {
      setLoadingEventos(false)
    }
  }, [isConnected, semanaBase, getEvents])

  useEffect(() => { carregarEventos() }, [carregarEventos])

  function eventosNoDia(dia) {
    return eventos.filter(ev => {
      const start = ev.start?.dateTime || ev.start?.date
      if (!start) return false
      const d = new Date(start)
      return d.toDateString() === dia.toDateString()
    })
  }

  function isAppEvent(ev) {
    return ev.extendedProperties?.private?.source === 'sorria'
  }

  async function agendar() {
    if (!pacienteSel) { toast('Selecione um paciente.', 'error'); return }
    if (!procedimento.trim()) { toast('Informe o procedimento.', 'error'); return }

    setSalvando(true)
    try {
      const startIso = new Date(`${data}T${horario}:00`).toISOString()
      const endIso = addMinutes(data, horario, duracao)

      const gcEvent = {
        summary: `${pacienteSel.nome} - ${procedimento}`,
        description: observacoes || undefined,
        start: { dateTime: startIso, timeZone: 'America/Sao_Paulo' },
        end: { dateTime: endIso, timeZone: 'America/Sao_Paulo' },
        extendedProperties: { private: { source: 'sorria' } },
      }

      const created = await createEvent(gcEvent)

      await supabase.from('consultas').insert({
        user_id: user.id,
        paciente_id: pacienteSel.id,
        google_event_id: created.id,
        procedimento,
        data_hora: startIso,
        duracao_min: duracao,
        observacoes: observacoes || null,
      }).throwOnError()

      toast('Consulta agendada com sucesso!', 'success')
      fecharModal()
      carregarEventos()
    } catch (err) {
      toast('Erro ao agendar: ' + (err.message || 'tente novamente'), 'error')
    } finally {
      setSalvando(false)
    }
  }

  async function handleDeleteEvent(ev) {
    if (!confirm(`Remover "${ev.summary}"?`)) return
    try {
      await deleteEvent(ev.id)
      setEventos(prev => prev.filter(e => e.id !== ev.id))
      toast('Evento removido.', 'success')
    } catch {
      toast('Erro ao remover evento.', 'error')
    }
  }

  function fecharModal() {
    setModalAberto(false)
    setBusca('')
    setPacienteSel(null)
    setProcedimento('')
    setData(new Date().toISOString().split('T')[0])
    setHorario('08:00')
    setDuracao(60)
    setObservacoes('')
  }

  const hoje = new Date()

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">📅 Agenda</h1>
          <p className="page-subtitle">Gerencie suas consultas integradas ao Google Calendar</p>
        </div>
        {isConnected && (
          <button className="btn btn-primary" onClick={() => setModalAberto(true)}>
            + Nova Consulta
          </button>
        )}
      </div>

      {/* Não conectado */}
      {!isConnected && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: 360, gap: 20,
        }}>
          <div className="card" style={{
            textAlign: 'center', maxWidth: 420, padding: '40px 32px',
          }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>📅</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#1f2937' }}>
              Agenda não conectada
            </h2>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              Conecte seu Google Calendar para visualizar e gerenciar suas consultas diretamente pelo sistema.
            </p>
            <button
              onClick={() => connectGoogle()}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '11px 24px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: '#16a34a', color: '#fff', fontWeight: 600, fontSize: 15,
              }}
            >
              🔗 Conectar Google Calendar
            </button>
          </div>
        </div>
      )}

      {/* Agenda semanal */}
      {isConnected && (
        <div className="card">
          {/* Navegação */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <button className="btn btn-secondary" style={{ padding: '6px 14px' }}
              onClick={() => setSemanaBase(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n })}>
              ← Anterior
            </button>
            <button className="btn btn-secondary" style={{ padding: '6px 14px' }}
              onClick={() => setSemanaBase(startOfWeek(new Date()))}>
              Hoje
            </button>
            <button className="btn btn-secondary" style={{ padding: '6px 14px' }}
              onClick={() => setSemanaBase(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n })}>
              Próxima →
            </button>
            <span style={{ marginLeft: 10, fontWeight: 600, color: '#374151', fontSize: 14 }}>
              {diasDaSemana[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} —{' '}
              {diasDaSemana[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
            {(loadingEventos || loading) && (
              <span style={{ marginLeft: 8, fontSize: 12, color: '#9ca3af' }}>Carregando...</span>
            )}
          </div>

          {/* Grade semanal */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, overflowX: 'auto',
          }}>
            {diasDaSemana.map((dia, i) => {
              const isHoje = dia.toDateString() === hoje.toDateString()
              const evsDia = eventosNoDia(dia)
              return (
                <div key={i} style={{
                  border: `1.5px solid ${isHoje ? '#0d9488' : '#e5e7eb'}`,
                  borderRadius: 10, padding: 10, minHeight: 140,
                  background: isHoje ? '#f0fdf4' : '#fafafa',
                }}>
                  {/* Cabeçalho do dia */}
                  <div style={{
                    textAlign: 'center', marginBottom: 8, paddingBottom: 6,
                    borderBottom: `1px solid ${isHoje ? '#99f6e4' : '#f3f4f6'}`,
                  }}>
                    <div style={{
                      fontSize: 11, fontWeight: 600, color: isHoje ? '#0d9488' : '#9ca3af',
                      textTransform: 'uppercase', letterSpacing: 0.5,
                    }}>
                      {dia.toLocaleDateString('pt-BR', { weekday: 'short' })}
                    </div>
                    <div style={{
                      fontSize: 20, fontWeight: 700,
                      color: isHoje ? '#0d9488' : '#374151',
                      lineHeight: 1.2,
                    }}>
                      {dia.getDate()}
                    </div>
                  </div>

                  {/* Eventos */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {evsDia.length === 0 && (
                      <div style={{ fontSize: 11, color: '#d1d5db', textAlign: 'center', marginTop: 8 }}>
                        —
                      </div>
                    )}
                    {evsDia.map(ev => {
                      const app = isAppEvent(ev)
                      const start = ev.start?.dateTime || ev.start?.date
                      return (
                        <div key={ev.id} style={{
                          background: app ? '#f0fdfa' : '#f3f4f6',
                          border: `1px solid ${app ? '#99f6e4' : '#e5e7eb'}`,
                          borderLeft: `3px solid ${app ? '#0d9488' : '#9ca3af'}`,
                          borderRadius: 6, padding: '5px 7px', fontSize: 11,
                          position: 'relative',
                        }}>
                          <div style={{ fontWeight: 600, color: app ? '#0d9488' : '#6b7280', marginBottom: 2 }}>
                            {formatHour(start)}
                          </div>
                          <div style={{
                            color: '#374151', fontWeight: 500, fontSize: 11,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {ev.summary}
                          </div>
                          <button
                            onClick={() => handleDeleteEvent(ev)}
                            style={{
                              position: 'absolute', top: 4, right: 4, background: 'none',
                              border: 'none', cursor: 'pointer', fontSize: 11,
                              color: '#dc2626', opacity: 0.5, padding: 0, lineHeight: 1,
                            }}
                            title="Remover"
                          >
                            🗑
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legenda */}
          <div style={{ display: 'flex', gap: 16, marginTop: 14, fontSize: 12, color: '#6b7280' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#0d9488', display: 'inline-block' }} />
              Consultas do sistema
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#9ca3af', display: 'inline-block' }} />
              Outros eventos do Google Calendar
            </span>
          </div>
        </div>
      )}

      {/* Modal Nova Consulta */}
      {modalAberto && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16,
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>📅 Nova Consulta</h3>
              <button onClick={fecharModal} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6b7280' }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Paciente *</label>
                <Autocomplete
                  pacientes={pacientes}
                  value={busca}
                  onChange={v => { setBusca(v); if (!v) setPacienteSel(null) }}
                  onSelect={p => { setPacienteSel(p); setBusca(p.nome) }}
                />
                {pacienteSel && (
                  <div style={{ marginTop: 6, fontSize: 12, color: '#0d9488', fontWeight: 600 }}>
                    ✅ {pacienteSel.nome}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Procedimento *</label>
                <input
                  className="form-input"
                  placeholder="Ex: Limpeza, Extração, Restauração..."
                  value={procedimento}
                  onChange={e => setProcedimento(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Data *</label>
                  <input
                    className="form-input"
                    type="date"
                    value={data}
                    onChange={e => setData(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Horário *</label>
                  <input
                    className="form-input"
                    type="time"
                    value={horario}
                    onChange={e => setHorario(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Duração</label>
                <select
                  className="form-input"
                  value={duracao}
                  onChange={e => setDuracao(Number(e.target.value))}
                >
                  {DURACOES.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Observações</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Informações adicionais para a consulta..."
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="btn btn-secondary" onClick={fecharModal}>Cancelar</button>
                <button
                  className="btn btn-primary"
                  onClick={agendar}
                  disabled={salvando}
                  style={{ opacity: salvando ? 0.6 : 1 }}
                >
                  {salvando ? 'Agendando...' : '✅ Agendar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
