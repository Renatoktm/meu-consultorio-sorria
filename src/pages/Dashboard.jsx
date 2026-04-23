import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { useGoogleCalendar } from '../hooks/useGoogleCalendar'
import { usePlano } from '../hooks/usePlano'
import ModalUpgrade from '../components/ModalUpgrade'
import '../styles/dashboard.css'

const moneyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

// ── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ data = [], color = '#0f766e', height = 28, width = 72 }) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data, 1)
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - (v / max) * (height - 4) - 2
    return `${x},${y}`
  })
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M0,${height} L${pts.join(' L')} L${width},${height} Z`} fill={`url(#sg${color.replace('#','')})`} />
      <path d={`M${pts.join(' L')}`} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length-1].split(',')[0]} cy={pts[pts.length-1].split(',')[1]} r="3" fill={color} />
    </svg>
  )
}

// ── Trend Badge ───────────────────────────────────────────────────────────────
function TrendBadge({ atual, anterior }) {
  if (anterior === null || anterior === undefined) return null
  const diff = atual - anterior
  if (diff === 0) return <span className="db-trend db-trend--neutral">= estável</span>
  const up = diff > 0
  const pct = anterior > 0 ? Math.round(Math.abs(diff / anterior) * 100) : null
  const label = pct !== null ? `${up ? '+' : '-'}${pct}%` : `${up ? '+' : ''}${Math.abs(diff)}`
  return <span className={`db-trend db-trend--${up ? 'up' : 'down'}`}>{up ? '↑' : '↓'} {label} vs mês ant.</span>
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const I = {
  dashboard: <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  patients:  <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  pipeline:  <svg viewBox="0 0 24 24"><path d="M4 6h16"/><path d="M7 12h10"/><path d="M10 18h4"/></svg>,
  approved:  <svg viewBox="0 0 24 24"><path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>,
  documents: <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>,
  calendar:  <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>,
  refresh:   <svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/></svg>,
  arrow:     <svg viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>,
  whatsapp:  <svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 0 1-11.77 7.05L4 20l.95-4.23A8 8 0 1 1 20 12Z"/><path d="M8.5 9.5c.3-.7.6-.7.9-.7h.6c.2 0 .5.1.6.5l.6 1.5c.1.2 0 .4-.1.6l-.5.6c-.1.1-.2.2-.1.4.3.7 1 1.6 2.2 2.2.2.1.3 0 .4-.1l.6-.7c.2-.2.4-.2.6-.1l1.5.6c.4.2.5.4.5.6v.6c0 .3-.1.6-.7.9-.6.3-1.5.4-2.8-.1-1.3-.5-2.8-1.8-3.9-3.4-1.1-1.5-1.4-2.8-1-3.4Z"/></svg>,
  spark:     <svg viewBox="0 0 24 24"><path d="M12 3 9.3 9.3 3 12l6.3 2.7L12 21l2.7-6.3L21 12l-6.3-2.7z"/></svg>,
  clock:     <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>,
  userPlus:  <svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>,
}

function primeiroNome(n) {
  if (!n) return 'Dentista'
  const prefixos = ['dr.','dra.','dr','dra','prof.','prof']
  const partes = n.trim().split(/\s+/)
  for (const p of partes) if (!prefixos.includes(p.toLowerCase())) return p
  return partes[partes.length - 1] || 'Dentista'
}

function diasEmAberto(d) { return Math.floor((new Date() - new Date(d)) / 86400000) }

// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { profile, user } = useAuth()
  const navigate = useNavigate()
  const { plano, isFree, trialAtivo, trialExpirado, diasTrial, total, LIMITE_FREE, podeAdicionarPaciente } = usePlano()
  const { isConnected: gcConnected, getEvents } = useGoogleCalendar()

  const [resumo, setResumo]           = useState({ pacientes: 0, emAnalise: 0, emAnaliseValor: 0, aprovados: 0, aprovadosValor: 0, documentos: 0 })
  const [mesAnt, setMesAnt]           = useState({ pacientes: null, aprovadosValor: null, documentos: null })
  const [sparkline, setSparkline]     = useState([])
  const [consultasMes, setConsultasMes] = useState(null)
  const [proximaConsulta, setProximaConsulta] = useState(null)
  const [orcamentosAbertos, setOrcamentosAbertos] = useState([])
  const [ultimosPacientes, setUltimosPacientes]   = useState([])
  const [carregando, setCarregando]   = useState(true)
  const [showUpgrade, setShowUpgrade] = useState(false)

  const hora       = new Date().getHours()
  const saudacao   = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
  const nome       = primeiroNome(profile?.nome) || user?.email?.split('@')[0] || 'Dentista'
  const clinica    = profile?.clinica || 'Seu consultório'
  const mesAtual   = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const dataCompleta = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const TRIAL_TOTAL = 14
  const diasUsados  = trialAtivo ? Math.max(0, TRIAL_TOTAL - diasTrial) : TRIAL_TOTAL
  const trialPct    = Math.min((diasUsados / TRIAL_TOTAL) * 100, 100)
  const limitPct    = Math.min((total / LIMITE_FREE) * 100, 100)

  useEffect(() => { if (user?.id) carregarDados() }, [user?.id])

  useEffect(() => {
    if (!gcConnected) { setConsultasMes(null); setProximaConsulta(null); return }
    const agora   = new Date()
    const fimMes  = new Date(agora.getFullYear(), agora.getMonth() + 1, 1)
    const fimDia  = new Date(agora); fimDia.setHours(23, 59, 59, 999)
    getEvents(agora.toISOString(), fimMes.toISOString()).then(ev => setConsultasMes(ev.length))
    getEvents(agora.toISOString(), fimDia.toISOString()).then(ev => { if (ev.length > 0) setProximaConsulta(ev[0]) })
  }, [gcConnected, getEvents])

  async function carregarDados() {
    setCarregando(true)
    const agora   = new Date()
    const inicioMes    = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString()
    const inicioMesAnt = new Date(agora.getFullYear(), agora.getMonth() - 1, 1).toISOString()
    const fimMesAnt    = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString()
    const semanas = Array.from({ length: 4 }, (_, i) => {
      const ini = new Date(agora); ini.setDate(ini.getDate() - (4 - i) * 7)
      const fim = new Date(agora); fim.setDate(fim.getDate() - (3 - i) * 7)
      return { ini: ini.toISOString(), fim: fim.toISOString() }
    })

    try {
      const [
        { count: totalPac },
        { data: emAnaliseRows },
        { data: aprovRows },
        { data: abertos },
        { data: ultimos },
        { count: pacAnt },
        { data: aprovAnt },
      ] = await Promise.all([
        supabase.from('pacientes').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('orcamentos').select('valor_total,status').eq('user_id', user.id).in('status', ['em_analise','pendente']),
        supabase.from('orcamentos').select('valor_total').eq('user_id', user.id).eq('status','aprovado').gte('created_at', inicioMes),
        supabase.from('orcamentos').select('*,pacientes(nome,telefone)').eq('user_id', user.id).in('status', ['em_analise','pendente']).order('created_at', { ascending: false }).limit(5),
        supabase.from('pacientes').select('id,nome,created_at,convenio').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('pacientes').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', inicioMesAnt).lt('created_at', fimMesAnt),
        supabase.from('orcamentos').select('valor_total').eq('user_id', user.id).eq('status','aprovado').gte('created_at', inicioMesAnt).lt('created_at', fimMesAnt),
      ])

      let docs = 0, docsAnt = 0
      try {
        const [{ count: r1 },{ count: a1 },{ count: e1 },{ count: r2 },{ count: a2 },{ count: e2 }] = await Promise.all([
          supabase.from('receituarios').select('*',{count:'exact',head:true}).eq('user_id',user.id).gte('created_at',inicioMes),
          supabase.from('atestados').select('*',{count:'exact',head:true}).eq('user_id',user.id).gte('created_at',inicioMes),
          supabase.from('exames').select('*',{count:'exact',head:true}).eq('user_id',user.id).gte('created_at',inicioMes),
          supabase.from('receituarios').select('*',{count:'exact',head:true}).eq('user_id',user.id).gte('created_at',inicioMesAnt).lt('created_at',fimMesAnt),
          supabase.from('atestados').select('*',{count:'exact',head:true}).eq('user_id',user.id).gte('created_at',inicioMesAnt).lt('created_at',fimMesAnt),
          supabase.from('exames').select('*',{count:'exact',head:true}).eq('user_id',user.id).gte('created_at',inicioMesAnt).lt('created_at',fimMesAnt),
        ])
        docs = (r1||0)+(a1||0)+(e1||0)
        docsAnt = (r2||0)+(a2||0)+(e2||0)
      } catch (_) {}

      const sparkVals = await Promise.all(semanas.map(async ({ini,fim}) => {
        try {
          const { data } = await supabase.from('orcamentos').select('valor_total').eq('user_id',user.id).eq('status','aprovado').gte('created_at',ini).lt('created_at',fim)
          return (data||[]).reduce((s,i)=>s+parseFloat(i.valor_total||0),0)
        } catch(_){ return 0 }
      }))

      const aprovadosValor    = (aprovRows||[]).reduce((s,i)=>s+parseFloat(i.valor_total||0),0)
      const aprovAntValor     = (aprovAnt||[]).reduce((s,i)=>s+parseFloat(i.valor_total||0),0)

      setResumo({ pacientes: totalPac||0, emAnalise: emAnaliseRows?.length||0, emAnaliseValor: (emAnaliseRows||[]).reduce((s,i)=>s+parseFloat(i.valor_total||0),0), aprovados: aprovRows?.length||0, aprovadosValor, documentos: docs })
      setMesAnt({ pacientes: pacAnt||0, aprovadosValor: aprovAntValor, documentos: docsAnt })
      setSparkline(sparkVals)
      setOrcamentosAbertos(abertos||[])
      setUltimosPacientes(ultimos||[])
    } catch(e) { console.error(e) }
    finally { setCarregando(false) }
  }

  function abrirWhatsApp(tel) {
    const n = (tel||'').replace(/\D/g,'')
    if (!n) { alert('Telefone não cadastrado.'); return }
    window.open(`https://wa.me/55${n}`,'_blank')
  }

  // Próxima consulta — texto curto
  const proximaLabel = proximaConsulta
    ? (() => {
        const h = proximaConsulta.start?.dateTime
          ? new Date(proximaConsulta.start.dateTime).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})
          : null
        return h ? `${proximaConsulta.summary||'Consulta'} — hoje às ${h}` : (proximaConsulta.summary||'Consulta hoje')
      })()
    : null

  const planLabel = plano==='pro' ? 'Plano Pro ativo'
    : trialAtivo ? `Teste premium · ${diasTrial} dia${diasTrial===1?'':'s'}`
    : trialExpirado ? 'Trial encerrado'
    : 'Plano gratuito'

  // Metric cards
  const cards = [
    { icon: I.patients,  label: 'Pacientes ativos',    valor: resumo.pacientes,  sub: 'base cadastrada',                                                                                     tone: 'teal',   trend: <TrendBadge atual={resumo.pacientes} anterior={mesAnt.pacientes} /> },
    { icon: I.pipeline,  label: 'Em análise',          valor: resumo.emAnalise,  sub: resumo.emAnalise>0 ? `${moneyFormatter.format(resumo.emAnaliseValor)} em aberto` : 'nenhum pendente',   tone: 'amber',  trend: null },
    { icon: I.approved,  label: 'Aprovados no mês',    valor: resumo.aprovados,  sub: resumo.aprovados>0 ? moneyFormatter.format(resumo.aprovadosValor) : `resultado de ${mesAtual}`,         tone: 'green',  trend: <TrendBadge atual={resumo.aprovadosValor} anterior={mesAnt.aprovadosValor} />, sparkline: <Sparkline data={sparkline} color="#15803d" /> },
    { icon: I.documents, label: 'Documentos gerados',  valor: resumo.documentos, sub: 'emitidos neste mês',                                                                                   tone: 'purple', trend: <TrendBadge atual={resumo.documentos} anterior={mesAnt.documentos} /> },
    { icon: I.calendar,  label: 'Consultas agendadas', valor: gcConnected ? (consultasMes??'...') : '—', sub: gcConnected ? 'restantes neste mês' : 'Conecte o Google Calendar',              tone: 'blue',   trend: null },
  ]

  const quickActions = [
    { label: 'Novo paciente',    caption: 'Abrir prontuário',      path: '/pacientes',   color: '#0f766e', bg: 'rgba(15,118,110,0.08)' },
    { label: 'Novo orçamento',   caption: 'Registrar proposta',    path: '/orcamento',   color: '#d97706', bg: 'rgba(217,119,6,0.08)'  },
    { label: 'Ver agenda',       caption: 'Consultas do dia',      path: '/agenda',      color: '#2563eb', bg: 'rgba(37,99,235,0.08)'  },
    { label: 'Solicitar exames', caption: 'Encaminhamento rápido', path: '/exames',      color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
  ]

  // Banner
  let banner = null
  if (trialAtivo) {
    banner = { tone:'success', eyebrow:'Teste premium ativo', title:`${diasTrial} dia${diasTrial===1?'':'s'} restantes no seu trial`, desc:'Assine antes do fim para não perder o ritmo do consultório.', cta:'Ver planos', showBar: true }
  } else if (trialExpirado) {
    banner = { tone:'warning', eyebrow:'Acesso pendente', title:'Seu período de teste terminou', desc:'Assine o plano Pro para continuar com o sistema completo.', cta:'Assinar Pro' }
  } else if (isFree) {
    banner = { tone: !podeAdicionarPaciente ? 'danger' : 'neutral', eyebrow:'Plano gratuito', title: !podeAdicionarPaciente ? 'Limite atingido' : `${total} de ${LIMITE_FREE} pacientes`, desc: !podeAdicionarPaciente ? 'Faça upgrade para continuar cadastrando.' : 'Plano Pro libera crescimento sem limite.', cta:'Fazer upgrade' }
  }

  const primeiroAcesso = !carregando && resumo.pacientes === 0

  return (
    <div className="db-page">
      {showUpgrade && <ModalUpgrade motivo={trialExpirado?'trial_expirado':'upgrade'} onClose={()=>setShowUpgrade(false)} />}

      {/* ── HERO ── */}
      <section className="db-hero">
        <div className="db-hero-left">
          <div className="db-hero-kicker">
            <span className="db-hero-kicker-dot" />
            {dataCompleta}
          </div>
          <h1 className="db-hero-title">{saudacao}, Dr(a). {nome}</h1>
          <p className="db-hero-desc">
            {resumo.emAnalise > 0
              ? `Você tem ${resumo.emAnalise} orçamento${resumo.emAnalise===1?'':'s'} aguardando retorno.`
              : 'Fluxo do consultório sob controle.'}{' '}
            Acompanhe tudo sem perder o contexto.
          </p>
          {proximaLabel && (
            <div className="db-proxima">
              <span className="db-proxima-ico">{I.clock}</span>
              <span><strong>Próxima consulta:</strong> {proximaLabel}</span>
            </div>
          )}
          <div className="db-chip-row">
            <span className="db-chip">{clinica}</span>
            <span className="db-chip">{planLabel}</span>
            <span className={`db-chip${gcConnected?' is-live':''}`}>
              {gcConnected ? 'Google Calendar conectado' : 'Agenda não conectada'}
            </span>
          </div>
        </div>
        <div className="db-hero-right">
          <button type="button" className="db-btn-refresh" onClick={carregarDados}>
            {I.refresh} Atualizar
          </button>
        </div>
      </section>

      {/* ── MÉTRICAS ── */}
      <section className="db-metrics-grid">
        {cards.map(card => (
          <article key={card.label} className={`db-metric-card is-${card.tone}`}>
            <div className="db-metric-icon">{card.icon}</div>
            <div className="db-metric-body">
              <span className="db-metric-label">{card.label}</span>
              <strong className="db-metric-value">{carregando ? '…' : card.valor}</strong>
              <span className="db-metric-sub">{card.sub}</span>
              {!carregando && card.trend}
              {!carregando && card.sparkline && <div className="db-metric-spark">{card.sparkline}</div>}
            </div>
          </article>
        ))}
      </section>

      {/* ── GRID PRINCIPAL ── */}
      <div className="db-main-grid">

        {/* Coluna esquerda */}
        <div className="db-col-left">

          {/* Ações rápidas */}
          <div className="db-card">
            <div className="db-card-head">
              <div>
                <div className="db-card-kicker">Acesso rápido</div>
                <div className="db-card-title">Ações rápidas</div>
              </div>
            </div>
            <div className="db-actions-grid">
              {quickActions.map(a => (
                <button key={a.path} type="button" className="db-action-btn" style={{'--ac':a.color,'--ab':a.bg}} onClick={()=>navigate(a.path)}>
                  <div className="db-action-ico">{I.arrow}</div>
                  <div>
                    <div className="db-action-label">{a.label}</div>
                    <div className="db-action-caption">{a.caption}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Retornos pendentes */}
          <div className="db-card">
            <div className="db-card-head">
              <div>
                <div className="db-card-kicker">Pipeline de conversão</div>
                <div className="db-card-title">Retornos pendentes</div>
              </div>
              <button type="button" className="db-card-link" onClick={()=>navigate('/orcamento')}>
                Ver todos {I.arrow}
              </button>
            </div>

            {carregando ? (
              <div className="db-empty">
                <div className="db-empty-ico db-spin">{I.refresh}</div>
                <strong>Carregando…</strong>
              </div>
            ) : primeiroAcesso ? (
              <div className="db-empty db-empty--onboard">
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
                  <circle cx="28" cy="28" r="28" fill="#f0fdfa"/>
                  <path d="M18 40v-2a7 7 0 0 1 7-7h6a7 7 0 0 1 7 7v2" stroke="#0f766e" strokeWidth="1.8" strokeLinecap="round"/>
                  <circle cx="28" cy="21" r="5" stroke="#0f766e" strokeWidth="1.8"/>
                  <line x1="40" y1="14" x2="40" y2="22" stroke="#0f766e" strokeWidth="1.8" strokeLinecap="round"/>
                  <line x1="36" y1="18" x2="44" y2="18" stroke="#0f766e" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                <strong>Cadastre seu primeiro paciente</strong>
                <p>O painel se preenche automaticamente conforme você registra pacientes e orçamentos.</p>
                <button type="button" className="db-btn-primary" onClick={()=>navigate('/pacientes')}>
                  {I.userPlus} Cadastrar agora
                </button>
              </div>
            ) : orcamentosAbertos.length === 0 ? (
              <div className="db-empty">
                <div className="db-empty-ico">{I.approved}</div>
                <strong>Pipeline limpo</strong>
                <p>Nenhum orçamento aguardando. Aproveite para gerar novas oportunidades.</p>
                <button type="button" className="db-btn-ghost" onClick={()=>navigate('/orcamento')}>
                  Criar orçamento {I.arrow}
                </button>
              </div>
            ) : (
              <div className="db-budget-list">
                {orcamentosAbertos.map(orc => {
                  const dias = diasEmAberto(orc.created_at)
                  const tel  = orc.pacientes?.telefone||''
                  const urg  = dias>7 ? 'critical' : dias>=3 ? 'warm' : 'fresh'
                  return (
                    <div key={orc.id} className={`db-budget-row is-${urg}`}>
                      <div className="db-budget-col">
                        <span className="db-budget-lbl">Paciente</span>
                        <strong>{orc.pacientes?.nome||'Paciente'}</strong>
                        <small>{new Date(orc.created_at).toLocaleDateString('pt-BR')}</small>
                      </div>
                      <div className="db-budget-col">
                        <span className="db-budget-lbl">Valor</span>
                        <strong>{moneyFormatter.format(parseFloat(orc.valor_total||0))}</strong>
                        <small>{orc.status==='pendente'?'Pendente':'Em análise'}</small>
                      </div>
                      <div className="db-budget-col">
                        <span className="db-budget-lbl">Aguardando</span>
                        <strong className={`db-badge is-${urg}`}>{dias===0?'Hoje':`${dias}d`}</strong>
                        <small>{dias>7?'Ação imediata':dias>=3?'Follow-up':'Recente'}</small>
                      </div>
                      <button type="button" className="db-btn-whatsapp" onClick={()=>abrirWhatsApp(tel)} disabled={!tel}>
                        {I.whatsapp} WhatsApp
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Coluna direita */}
        <div className="db-col-right">

          {/* Banner de upgrade */}
          {banner ? (
            <div className={`db-banner is-${banner.tone}`}>
              <div className="db-banner-kicker">⚡ {banner.eyebrow}</div>
              <div className="db-banner-title">{banner.title}</div>
              <p className="db-banner-desc">{banner.desc}</p>
              {banner.showBar && (
                <div className="db-trial-bar">
                  <div className="db-trial-track">
                    <div className="db-trial-fill" style={{width:`${trialPct}%`}}/>
                  </div>
                  <span>{diasUsados} de {TRIAL_TOTAL} dias usados — {diasTrial} restante{diasTrial===1?'':'s'}</span>
                </div>
              )}
              {isFree && (
                <div className="db-trial-bar">
                  <div className="db-trial-track">
                    <div className="db-trial-fill" style={{width:`${limitPct}%`}}/>
                  </div>
                  <span>{total}/{LIMITE_FREE} pacientes</span>
                </div>
              )}
              <button type="button" className="db-btn-upgrade" onClick={()=>setShowUpgrade(true)}>
                {I.spark} {banner.cta}
              </button>
            </div>
          ) : (
            <div className="db-banner is-pro">
              <div className="db-banner-kicker">✓ Plano Pro ativo</div>
              <div className="db-banner-title">Crescimento sem limites</div>
              <p className="db-banner-desc">Pacientes ilimitados, agenda integrada e relatórios completos.</p>
            </div>
          )}

          {/* Últimos pacientes */}
          <div className="db-card">
            <div className="db-card-head">
              <div>
                <div className="db-card-kicker">Relacionamento</div>
                <div className="db-card-title">Últimos pacientes</div>
              </div>
              <button type="button" className="db-card-link" onClick={()=>navigate('/pacientes')}>
                Ver todos {I.arrow}
              </button>
            </div>
            {carregando ? (
              <div className="db-empty compact">
                <div className="db-empty-ico db-spin">{I.refresh}</div>
                <strong>Carregando…</strong>
              </div>
            ) : ultimosPacientes.length === 0 ? (
              <div className="db-empty compact">
                <div className="db-empty-ico">{I.patients}</div>
                <strong>Nenhum paciente ainda</strong>
                <p>Cadastre o primeiro para começar.</p>
                <button type="button" className="db-btn-primary" onClick={()=>navigate('/pacientes')}>
                  {I.userPlus} Cadastrar
                </button>
              </div>
            ) : (
              <div className="db-patient-list">
                {ultimosPacientes.map(p => (
                  <button key={p.id} type="button" className="db-patient-row" onClick={()=>navigate('/pacientes')}>
                    <span className="db-patient-avatar">{p.nome?.charAt(0)?.toUpperCase()||'P'}</span>
                    <span className="db-patient-info">
                      <strong>{p.nome}</strong>
                      <small>{p.convenio?`${p.convenio} · `:''}{p.created_at?new Date(p.created_at).toLocaleDateString('pt-BR'):'Recente'}</small>
                    </span>
                    <span className="db-patient-arrow">{I.arrow}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
