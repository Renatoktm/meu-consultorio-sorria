import { useState, useEffect, useCallback, useMemo } from 'react'
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

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

function startOfMonth(year, month) {
  return new Date(year, month, 1)
}

function toLocalDateStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatHour(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function addMinutes(dateStr, timeStr, minutes) {
  const dt = new Date(`${dateStr}T${timeStr}:00`)
  dt.setMinutes(dt.getMinutes() + minutes)
  return dt.toISOString()
}

function isAppEvent(ev) {
  return ev.extendedProperties?.private?.source === 'sorria'
}

export default function Agenda() {
  const { user } = useAuth()
  const { pacientes } = usePacientes()
  const toast = useToast()
  const { isConnected, loading: gcLoading, connectGoogle, getEvents, createEvent, deleteEvent } = useGoogleCalendar()

  const hoje = useMemo(() => new Date(), [])

  const [ano, setAno] = useState(hoje.getFullYear())
  const [mes, setMes] = useState(hoje.getMonth())
  const [eventos, setEventos] = useState([])
  const [loadingEventos, setLoadingEventos] = useState(false)

  // Modal dia
  const [diaSel, setDiaSel] = useState(null) // Date
  const [eventoSel, setEventoSel] = useState(null)

  // Modal nova consulta
  const [modalConsulta, setModalConsulta] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [busca, setBusca] = useState('')
  const [pacienteSel, setPacienteSel] = useState(null)
  const [procedimento, setProcedimento] = useState('')
  const [data, setData] = useState(toLocalDateStr(hoje))
  const [horario, setHorario] = useState('08:00')
  const [duracao, setDuracao] = useState(60)
  const [observacoes, setObservacoes] = useState('')

  // Células do calendário: dias do mês anterior (padding) + dias do mês + dias do mês seguinte
  const celulas = useMemo(() => {
    const primeiro = startOfMonth(ano, mes)
    const ultimo = new Date(ano, mes + 1, 0)
    const cells = []
    // Padding início
    for (let i = 0; i < primeiro.getDay(); i++) {
      const d = new Date(ano, mes, -primeiro.getDay() + i + 1)
      cells.push({ date: d, outOfMonth: true })
    }
    // Dias do mês
    for (let d = 1; d <= ultimo.getDate(); d++) {
      cells.push({ date: new Date(ano, mes, d), outOfMonth: false })
    }
    // Padding fim (completar última semana)
    const rem = 7 - (cells.length % 7)
    if (rem < 7) {
      for (let i = 1; i <= rem; i++) {
        cells.push({ date: new Date(ano, mes + 1, i), outOfMonth: true })
      }
    }
    return cells
  }, [ano, mes])

  const carregarEventos = useCallback(async () => {
    if (!isConnected) return
    setLoadingEventos(true)
    try {
      const inicio = new Date(ano, mes, 1)
      const fim = new Date(ano, mes + 1, 1)
      const evs = await getEvents(inicio.toISOString(), fim.toISOString())
      setEventos(evs)
    } finally {
      setLoadingEventos(false)
    }
  }, [isConnected, ano, mes, getEvents])

  useEffect(() => { carregarEventos() }, [carregarEventos])

  function eventosNoDia(date) {
    const key = toLocalDateStr(date)
    return eventos.filter(ev => {
      const start = ev.start?.dateTime || ev.start?.date || ''
      return start.startsWith(key)
    }).sort((a, b) => {
      const sa = a.start?.dateTime || a.start?.date || ''
      const sb = b.start?.dateTime || b.start?.date || ''
      return sa.localeCompare(sb)
    })
  }

  function mesAnterior() {
    if (mes === 0) { setAno(a => a - 1); setMes(11) }
    else setMes(m => m - 1)
  }

  function mesSeguinte() {
    if (mes === 11) { setAno(a => a + 1); setMes(0) }
    else setMes(m => m + 1)
  }

  function irHoje() {
    setAno(hoje.getFullYear())
    setMes(hoje.getMonth())
  }

  function abrirConsultaComDia(date) {
    setData(toLocalDateStr(date))
    setDiaSel(null)
    setModalConsulta(true)
  }

  function fecharModalConsulta() {
    setModalConsulta(false)
    setBusca('')
    setPacienteSel(null)
    setProcedimento('')
    setData(toLocalDateStr(hoje))
    setHorario('08:00')
    setDuracao(60)
    setObservacoes('')
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
      toast('Consulta agendada!', 'success')
      fecharModalConsulta()
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
      setEventoSel(null)
      toast('Evento removido.', 'success')
    } catch {
      toast('Erro ao remover evento.', 'error')
    }
  }

  const isHoje = (date) =>
    date.getDate() === hoje.getDate() &&
    date.getMonth() === hoje.getMonth() &&
    date.getFullYear() === hoje.getFullYear()

  // ─── Não conectado ────────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">📅 Agenda</h1>
            <p className="page-subtitle">Gerencie suas consultas integradas ao Google Calendar</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 360 }}>
          <div className="card" style={{ textAlign: 'center', maxWidth: 420, padding: '40px 32px' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>📅</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#1f2937' }}>Agenda não conectada</h2>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              Conecte seu Google Calendar para visualizar e gerenciar consultas diretamente pelo sistema.
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
      </div>
    )
  }

  // ─── Calendário mensal ────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">📅 Agenda</h1>
          <p className="page-subtitle">Gerencie suas consultas integradas ao Google Calendar</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setData(toLocalDateStr(hoje)); setModalConsulta(true) }}>
          + Nova Consulta
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Navegação do mês */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px',
          borderBottom: '1px solid #f1f5f9',
        }}>
          <button className="btn btn-secondary" style={{ padding: '6px 14px' }} onClick={mesAnterior}>←</button>
          <button className="btn btn-secondary" style={{ padding: '6px 14px' }} onClick={irHoje}>Hoje</button>
          <button className="btn btn-secondary" style={{ padding: '6px 14px' }} onClick={mesSeguinte}>→</button>
          <span style={{ fontWeight: 700, fontSize: 17, color: '#1f2937', marginLeft: 6 }}>
            {MESES[mes]} {ano}
          </span>
          {(loadingEventos || gcLoading) && (
            <span style={{ marginLeft: 8, fontSize: 12, color: '#9ca3af' }}>Atualizando...</span>
          )}
        </div>

        {/* Cabeçalho dias da semana */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
          borderBottom: '1px solid #f1f5f9',
        }}>
          {DIAS_SEMANA.map(d => (
            <div key={d} style={{
              textAlign: 'center', padding: '8px 0', fontSize: 12,
              fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5,
            }}>
              {d}
            </div>
          ))}
        </div>

        {/* Grade de dias */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {celulas.map(({ date, outOfMonth }, idx) => {
            const evsDia = eventosNoDia(date)
            const visiveis = evsDia.slice(0, 3)
            const extras = evsDia.length - 3
            const ehHoje = isHoje(date)

            return (
              <div
                key={idx}
                onClick={() => { if (evsDia.length > 0 || !outOfMonth) setDiaSel(date) }}
                style={{
                  minHeight: 96, padding: '6px 6px 4px',
                  borderRight: (idx + 1) % 7 !== 0 ? '1px solid #f1f5f9' : 'none',
                  borderBottom: idx < celulas.length - 7 ? '1px solid #f1f5f9' : 'none',
                  background: ehHoje ? '#f0fdf4' : '#fff',
                  cursor: outOfMonth && evsDia.length === 0 ? 'default' : 'pointer',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (!outOfMonth) e.currentTarget.style.background = ehHoje ? '#dcfce7' : '#f8fafc' }}
                onMouseLeave={e => { e.currentTarget.style.background = ehHoje ? '#f0fdf4' : '#fff' }}
              >
                {/* Número do dia */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 26, height: 26, borderRadius: '50%', fontSize: 13, fontWeight: 600,
                    background: ehHoje ? '#0d9488' : 'transparent',
                    color: ehHoje ? '#fff' : outOfMonth ? '#d1d5db' : '#374151',
                  }}>
                    {date.getDate()}
                  </span>
                </div>

                {/* Pills de eventos */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {visiveis.map(ev => {
                    const app = isAppEvent(ev)
                    const start = ev.start?.dateTime || ev.start?.date || ''
                    const hora = ev.start?.dateTime ? formatHour(ev.start.dateTime) : ''
                    return (
                      <div
                        key={ev.id}
                        onClick={e => { e.stopPropagation(); setEventoSel(ev); setDiaSel(null) }}
                        style={{
                          background: app ? '#0d9488' : '#6b7280',
                          color: '#fff', borderRadius: 4, padding: '2px 5px',
                          fontSize: 11, fontWeight: 500,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          cursor: 'pointer',
                        }}
                        title={ev.summary}
                      >
                        {hora && <span style={{ opacity: 0.85, marginRight: 3 }}>{hora}</span>}
                        {ev.summary}
                      </div>
                    )
                  })}
                  {extras > 0 && (
                    <div style={{
                      fontSize: 11, color: '#0d9488', fontWeight: 600, paddingLeft: 2, cursor: 'pointer',
                    }}>
                      +{extras} mais
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Legenda */}
        <div style={{
          display: 'flex', gap: 16, padding: '10px 16px',
          borderTop: '1px solid #f1f5f9', fontSize: 12, color: '#9ca3af',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: '#0d9488', display: 'inline-block' }} />
            Consultas do sistema
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: '#6b7280', display: 'inline-block' }} />
            Outros eventos do Google
          </span>
        </div>
      </div>

      {/* ── Modal: eventos do dia ─────────────────────────────────────────── */}
      {diaSel && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
          onClick={() => setDiaSel(null)}
        >
          <div className="card" style={{ width: '100%', maxWidth: 420, maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                {diaSel.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
              </h3>
              <button onClick={() => setDiaSel(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6b7280' }}>×</button>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: 14 }}
              onClick={() => abrirConsultaComDia(diaSel)}
            >
              + Nova Consulta neste dia
            </button>

            {eventosNoDia(diaSel).length === 0 ? (
              <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 14, padding: '16px 0' }}>
                Nenhum evento neste dia.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {eventosNoDia(diaSel).map(ev => {
                  const app = isAppEvent(ev)
                  const start = ev.start?.dateTime
                  const end = ev.end?.dateTime
                  return (
                    <div key={ev.id} style={{
                      padding: '10px 14px', borderRadius: 8,
                      border: `1.5px solid ${app ? '#99f6e4' : '#e5e7eb'}`,
                      borderLeft: `4px solid ${app ? '#0d9488' : '#6b7280'}`,
                      background: app ? '#f0fdfa' : '#fafafa',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#1f2937', marginBottom: 3 }}>
                          {ev.summary}
                        </div>
                        {start && (
                          <div style={{ fontSize: 12, color: '#6b7280' }}>
                            {formatHour(start)}{end ? ` – ${formatHour(end)}` : ''}
                          </div>
                        )}
                        {ev.description && (
                          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>{ev.description}</div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteEvent(ev)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 16, padding: '0 0 0 8px', opacity: 0.7 }}
                        title="Remover"
                      >
                        🗑
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal: detalhe de evento (pill click) ────────────────────────── */}
      {eventoSel && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
          onClick={() => setEventoSel(null)}
        >
          <div className="card" style={{ width: '100%', maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Detalhes do Evento</h3>
              <button onClick={() => setEventoSel(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6b7280' }}>×</button>
            </div>
            <div style={{
              padding: '12px 16px', borderRadius: 8,
              borderLeft: `4px solid ${isAppEvent(eventoSel) ? '#0d9488' : '#6b7280'}`,
              background: isAppEvent(eventoSel) ? '#f0fdfa' : '#fafafa',
              marginBottom: 14,
            }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1f2937', marginBottom: 6 }}>{eventoSel.summary}</div>
              {eventoSel.start?.dateTime && (
                <div style={{ fontSize: 13, color: '#6b7280' }}>
                  🕐 {formatHour(eventoSel.start.dateTime)}
                  {eventoSel.end?.dateTime && ` – ${formatHour(eventoSel.end.dateTime)}`}
                </div>
              )}
              {eventoSel.description && (
                <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>📝 {eventoSel.description}</div>
              )}
            </div>
            <button
              onClick={() => handleDeleteEvent(eventoSel)}
              style={{
                width: '100%', padding: '9px 0', borderRadius: 8, border: '1.5px solid #fca5a5',
                background: '#fff', color: '#dc2626', fontWeight: 600, fontSize: 14, cursor: 'pointer',
              }}
            >
              🗑 Remover Evento
            </button>
          </div>
        </div>
      )}

      {/* ── Modal: nova consulta ─────────────────────────────────────────── */}
      {modalConsulta && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
          onClick={fecharModalConsulta}
        >
          <div className="card" style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>📅 Nova Consulta</h3>
              <button onClick={fecharModalConsulta} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6b7280' }}>×</button>
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
                  <div style={{ marginTop: 6, fontSize: 12, color: '#0d9488', fontWeight: 600 }}>✅ {pacienteSel.nome}</div>
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
                  <input className="form-input" type="date" value={data} onChange={e => setData(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Horário *</label>
                  <input className="form-input" type="time" value={horario} onChange={e => setHorario(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Duração</label>
                <select className="form-input" value={duracao} onChange={e => setDuracao(Number(e.target.value))}>
                  {DURACOES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Observações</label>
                <textarea
                  className="form-input" rows={3}
                  placeholder="Informações adicionais para a consulta..."
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="btn btn-secondary" onClick={fecharModalConsulta}>Cancelar</button>
                <button className="btn btn-primary" onClick={agendar} disabled={salvando} style={{ opacity: salvando ? 0.6 : 1 }}>
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
