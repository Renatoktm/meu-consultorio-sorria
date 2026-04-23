import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { useGoogleCalendar } from '../hooks/useGoogleCalendar'
import { usePlano } from '../hooks/usePlano'
import ModalUpgrade from '../components/ModalUpgrade'
import '../styles/dashboard.css'

const moneyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const moneyShort = v => {
  if (v >= 1000) return `R$\u00a0${(v / 1000).toFixed(1)}k`
  return moneyFormatter.format(v)
}

// ── SVG Sparkline ─────────────────────────────────────────────────────────────
function Sparkline({ data = [], color = '#0f766e', height = 32, width = 80 }) {
  if (!data || data.length < 2) {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke={color} strokeWidth="1.5" strokeOpacity="0.3" strokeDasharray="3 3" />
      </svg>
    )
  }
  const max = Math.max(...data, 1)
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - (v / max) * (height - 4) - 2
    return `${x},${y}`
  })
  const pathD = `M${pts.join(' L')}`
  const areaD = `M0,${height} L${pts.join(' L')} L${width},${height} Z`
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#sg-${color.replace('#', '')})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1].split(',')[0]} cy={pts[pts.length - 1].split(',')[1]} r="3" fill={color} />
    </svg>
  )
}

// ── Trend Badge ───────────────────────────────────────────────────────────────
function TrendBadge({ atual, anterior, prefix = '' }) {
  if (anterior === null || anterior === undefined) return null
  const diff = atual - anterior
  if (diff === 0) return <span className="db-trend db-trend--neutral">= estável</span>
  const up = diff > 0
  const pct = anterior > 0 ? Math.round(Math.abs(diff / anterior) * 100) : null
  const label = pct !== null ? `${up ? '+' : '-'}${pct}%` : `${up ? '+' : ''}${prefix}${Math.abs(diff)}`
  return (
    <span className={`db-trend db-trend--${up ? 'up' : 'down'}`}>
      {up ? '↑' : '↓'} {label} vs mês anterior
    </span>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icons = {
  refresh: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 3v6h-6" /></svg>,
  patients: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  pipeline: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16" /><path d="M7 12h10" /><path d="M10 18h4" /></svg>,
  approved: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 12 2 2 4-4" /><circle cx="12" cy="12" r="9" /></svg>,
  documents: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>,
  calendar: <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" /></svg>,
  spark: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 9.3 9.3 3 12l6.3 2.7L12 21l2.7-6.3L21 12l-6.3-2.7z" /></svg>,
  arrow: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>,
  whatsapp: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 0 1-11.77 7.05L4 20l.95-4.23A8 8 0 1 1 20 12Z" /><path d="M8.5 9.5c.3-.7.6-.7.9-.7h.6c.2 0 .5.1.6.5l.6 1.5c.1.2 0 .4-.1.6l-.5.6c-.1.1-.2.2-.1.4.3.7 1 1.6 2.2 2.2.2.1.3 0 .4-.1l.6-.7c.2-.2.4-.2.6-.1l1.5.6c.4.2.5.4.5.6v.6c0 .3-.1.6-.7.9-.6.3-1.5.4-2.8-.1-1.3-.5-2.8-1.8-3.9-3.4-1.1-1.5-1.4-2.8-1-3.4Z" /></svg>,
  clock: <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>,
  userPlus: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="16" y1="11" x2="22" y2="11" /></svg>,
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function primeiroNome(nomeCompleto) {
  if (!nomeCompleto) return 'Dentista'
  const prefixos = ['dr.', 'dra.', 'dr', 'dra', 'prof.', 'prof']
  const partes = nomeCompleto.trim().split(/\s+/)
  for (const parte of partes) {
    if (!prefixos.includes(parte.toLowerCase())) return parte
  }
  return partes[partes.length - 1] || 'Dentista'
}

function diasEmAberto(createdAt) {
  return Math.floor((new Date() - new Date(createdAt)) / 86400000)
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { profile, user } = useAuth()
  const navigate = useNavigate()
  const { plano, isFree, trialAtivo, trialExpirado, diasTrial, total, LIMITE_FREE, podeAdicionarPaciente } = usePlano()
  const { isConnected: gcConnected, getEvents } = useGoogleCalendar()

  const [resumo, setResumo] = useState({ pacientes: 0, emAnalise: 0, emAnaliseValor: 0, aprovados: 0, aprovadosValor: 0, documentos: 0 })
  const [mesAnterior, setMesAnterior] = useState({ pacientes: null, aprovados: null, aprovadosValor: null, documentos: null })
  const [sparkline, setSparkline] = useState([])
  const [consultasMes, setConsultasMes] = useState(null)
  const [proximaConsulta, setProximaConsulta] = useState(null)
  const [orcamentosAbertos, setOrcamentosAbertos] = useState([])
  const [ultimosPacientes, setUltimosPacientes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [showUpgrade, setShowUpgrade] = useState(false)

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
  const nome = primeiroNome(profile?.nome) || user?.email?.split('@')[0] || 'Dentista'
  const clinica = profile?.clinica || 'Seu consultório'
  const mesAtual = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const dataCompleta = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  // Trial progress (dias usados / total trial)
  const TRIAL_DIAS_TOTAL = 14
  const diasUsados = trialAtivo ? Math.max(0, TRIAL_DIAS_TOTAL - diasTrial) : TRIAL_DIAS_TOTAL
  const trialPct = Math.min((diasUsados / TRIAL_DIAS_TOTAL) * 100, 100)

  useEffect(() => { if (user?.id) carregarDados() }, [user?.id])

  // Google Calendar — consultas do mês e próxima consulta
  useEffect(() => {
    if (!gcConnected) { setConsultasMes(null); setProximaConsulta(null); return }
    const agora = new Date()
    const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 1)
    const fimDia = new Date(agora)
    fimDia.setHours(23, 59, 59, 999)

    getEvents(agora.toISOString(), fimMes.toISOString()).then(eventos => {
      setConsultasMes(eventos.length)
    })
    // Próxima consulta hoje
    getEvents(agora.toISOString(), fimDia.toISOString()).then(eventos => {
      if (eventos.length > 0) setProximaConsulta(eventos[0])
    })
  }, [gcConnected, getEvents])

  async function carregarDados() {
    setCarregando(true)
    const agora = new Date()
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString()
    const inicioMesAnt = new Date(agora.getFullYear(), agora.getMonth() - 1, 1).toISOString()
    const fimMesAnt = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString()
    // Últimas 4 semanas para sparkline
    const semanas = Array.from({ length: 4 }, (_, i) => {
      const ini = new Date(agora); ini.setDate(ini.getDate() - (4 - i) * 7)
      const fim = new Date(agora); fim.setDate(fim.getDate() - (3 - i) * 7)
      return { ini: ini.toISOString(), fim: fim.toISOString() }
    })

    try {
      const [
        { count: totalPacientes },
        { data: emAnaliseRows },
        { data: aprovadosRows },
        { data: abertos },
        { data: ultimos },
        // Mês anterior
        { count: pacMesAnt },
        { data: aprovMesAnt },
      ] = await Promise.all([
        supabase.from('pacientes').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('orcamentos').select('valor_total, status').eq('user_id', user.id).in('status', ['em_analise', 'pendente']),
        supabase.from('orcamentos').select('valor_total').eq('user_id', user.id).eq('status', 'aprovado').gte('created_at', inicioMes),
        supabase.from('orcamentos').select('*, pacientes(nome, telefone)').eq('user_id', user.id).in('status', ['em_analise', 'pendente']).order('created_at', { ascending: false }).limit(5),
        supabase.from('pacientes').select('id, nome, created_at, convenio').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        // Mês anterior: pacientes adicionados
        supabase.from('pacientes').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', inicioMesAnt).lt('created_at', fimMesAnt),
        // Mês anterior: aprovados
        supabase.from('orcamentos').select('valor_total').eq('user_id', user.id).eq('status', 'aprovado').gte('created_at', inicioMesAnt).lt('created_at', fimMesAnt),
      ])

      // Documentos — mês atual vs anterior
      let documentos = 0, docsMesAnt = 0
      try {
        const [
          { count: r1 }, { count: a1 }, { count: e1 },
          { count: r2 }, { count: a2 }, { count: e2 },
        ] = await Promise.all([
          supabase.from('receituarios').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', inicioMes),
          supabase.from('atestados').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', inicioMes),
          supabase.from('exames').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', inicioMes),
          supabase.from('receituarios').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', inicioMesAnt).lt('created_at', fimMesAnt),
          supabase.from('atestados').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', inicioMesAnt).lt('created_at', fimMesAnt),
          supabase.from('exames').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', inicioMesAnt).lt('created_at', fimMesAnt),
        ])
        documentos = (r1 || 0) + (a1 || 0) + (e1 || 0)
        docsMesAnt = (r2 || 0) + (a2 || 0) + (e2 || 0)
      } catch (_) {}

      // Sparkline — receita semanal (últimas 4 semanas)
      const sparkVals = await Promise.all(semanas.map(async ({ ini, fim }) => {
        try {
          const { data } = await supabase.from('orcamentos').select('valor_total').eq('user_id', user.id).eq('status', 'aprovado').gte('created_at', ini).lt('created_at', fim)
          return (data || []).reduce((s, i) => s + parseFloat(i.valor_total || 0), 0)
        } catch (_) { return 0 }
      }))
      setSparkline(sparkVals)

      const aprovadosValor = aprovadosRows?.reduce((s, i) => s + parseFloat(i.valor_total || 0), 0) || 0
      const aprovMesAntValor = (aprovMesAnt || []).reduce((s, i) => s + parseFloat(i.valor_total || 0), 0)

      setResumo({
        pacientes: totalPacientes || 0,
        emAnalise: emAnaliseRows?.length || 0,
        emAnaliseValor: emAnaliseRows?.reduce((s, i) => s + parseFloat(i.valor_total || 0), 0) || 0,
        aprovados: aprovadosRows?.length || 0,
        aprovadosValor,
        documentos,
      })
      setMesAnterior({
        pacientes: pacMesAnt || 0,
        aprovados: aprovMesAnt?.length || 0,
        aprovadosValor: aprovMesAntValor,
        documentos: docsMesAnt,
      })
      setOrcamentosAbertos(abertos || [])
      setUltimosPacientes(ultimos || [])
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setCarregando(false)
    }
  }

  function abrirWhatsApp(telefone) {
    const numero = (telefone || '').replace(/\D/g, '')
    if (!numero) { alert('Telefone não cadastrado para este paciente.'); return }
    window.open(`https://wa.me/55${numero}`, '_blank')
  }

  const limitProgress = Math.min((total / LIMITE_FREE) * 100, 100)
  const followUpsUrgentes = orcamentosAbertos.filter(i => diasEmAberto(i.created_at) > 7).length
  const ticketMedioAprovado = resumo.aprovados > 0 ? resumo.aprovadosValor / resumo.aprovados : 0
  const ticketMedioEmAnalise = resumo.emAnalise > 0 ? resumo.emAnaliseValor / resumo.emAnalise : 0

  // Próxima consulta — label amigável
  const proximaLabel = proximaConsulta
    ? (() => {
        const hora = proximaConsulta.start?.dateTime
          ? new Date(proximaConsulta.start.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          : null
        return hora ? `${proximaConsulta.summary || 'Consulta'} — hoje às ${hora}` : (proximaConsulta.summary || 'Consulta hoje')
      })()
    : null

  const pulseTitle = trialExpirado
    ? 'Sua assinatura precisa de atenção'
    : resumo.emAnalise > 0
      ? `${resumo.emAnalise} orçamento${resumo.emAnalise === 1 ? '' : 's'} aguardando retorno`
      : 'Fluxo do consultório sob controle'

  const planLabel = plano === 'pro'
    ? 'Plano Pro ativo'
    : trialAtivo ? `Teste premium · ${diasTrial} dia${diasTrial === 1 ? '' : 's'}`
    : trialExpirado ? 'Trial encerrado'
    : 'Plano gratuito'

  // Cards de métricas
  const cards = [
    {
      icon: Icons.patients, label: 'Pacientes ativos', valor: resumo.pacientes,
      sub: 'base cadastrada', tone: 'teal',
      trend: <TrendBadge atual={resumo.pacientes} anterior={mesAnterior.pacientes} />,
    },
    {
      icon: Icons.pipeline, label: 'Em análise', valor: resumo.emAnalise,
      sub: resumo.emAnalise > 0 ? `${moneyFormatter.format(resumo.emAnaliseValor)} em aberto` : 'nenhum pendente',
      tone: 'amber',
      trend: null,
    },
    {
      icon: Icons.approved, label: 'Aprovados no mês', valor: resumo.aprovados,
      sub: resumo.aprovados > 0 ? `${moneyFormatter.format(resumo.aprovadosValor)} em ${mesAtual}` : `resultado de ${mesAtual}`,
      tone: 'green',
      trend: <TrendBadge atual={resumo.aprovadosValor} anterior={mesAnterior.aprovadosValor} prefix="R$" />,
      sparkline: <Sparkline data={sparkline} color="#15803d" />,
    },
    {
      icon: Icons.documents, label: 'Documentos gerados', valor: resumo.documentos,
      sub: 'emitidos neste mês', tone: 'purple',
      trend: <TrendBadge atual={resumo.documentos} anterior={mesAnterior.documentos} />,
    },
    {
      icon: Icons.calendar, label: 'Consultas agendadas',
      valor: gcConnected ? (consultasMes ?? '...') : '—',
      sub: gcConnected ? 'restantes neste mês' : 'Conecte o Google Calendar',
      tone: 'blue', trend: null,
    },
  ]

  const quickActions = [
    { label: 'Novo paciente',    caption: 'Abrir prontuário',         path: '/pacientes',   tone: 'teal'   },
    { label: 'Novo orçamento',   caption: 'Registrar proposta',       path: '/orcamento',   tone: 'amber'  },
    { label: 'Receituário',      caption: 'Gerar documento',          path: '/receituario', tone: 'purple' },
    { label: 'Solicitar exames', caption: 'Encaminhamento rápido',    path: '/exames',      tone: 'blue'   },
  ]

  // Banner de plano
  let banner = null
  if (trialAtivo) {
    banner = {
      tone: 'success',
      eyebrow: 'Teste premium ativo',
      title: `${diasTrial} dia${diasTrial === 1 ? '' : 's'} restantes no seu trial`,
      description: 'Você está usando todos os recursos liberados. Assine antes do fim para não perder o ritmo.',
      action: { label: 'Ver planos', onClick: () => setShowUpgrade(true) },
      showTrialBar: true,
    }
  } else if (trialExpirado) {
    banner = {
      tone: 'warning',
      eyebrow: 'Acesso pendente',
      title: 'Seu período de teste terminou',
      description: 'Assine o plano Pro para continuar com o sistema completo e sem bloqueios nas rotinas da clínica.',
      action: { label: 'Assinar Pro', onClick: () => setShowUpgrade(true) },
    }
  } else if (isFree) {
    banner = {
      tone: !podeAdicionarPaciente ? 'danger' : 'neutral',
      eyebrow: 'Plano gratuito',
      title: !podeAdicionarPaciente ? 'Limite de pacientes atingido' : `${total} de ${LIMITE_FREE} pacientes utilizados`,
      description: !podeAdicionarPaciente
        ? 'Faça upgrade para continuar cadastrando pacientes e manter o ritmo do consultório.'
        : 'Você ainda pode usar o modo gratuito, mas o plano Pro libera crescimento sem limite.',
      action: { label: 'Fazer upgrade', onClick: () => setShowUpgrade(true) },
    }
  }

  // Empty state de primeiro acesso
  const primeiroAcesso = !carregando && resumo.pacientes === 0

  return (
    <div className="db-page">
      {showUpgrade && <ModalUpgrade motivo={trialExpirado ? 'trial_expirado' : 'upgrade'} onClose={() => setShowUpgrade(false)} />}

      {/* ── Hero ── */}
      <section className="db-hero">
        <div className="db-hero-main">
          <div className="db-hero-kicker">Central do consultório</div>
          <h1 className="db-hero-title">{saudacao}, Dr(a). {nome}</h1>
          <p className="db-hero-text">
            {pulseTitle}. Acompanhe pacientes, agenda, documentos e orçamentos sem perder o contexto do dia.
          </p>

          {/* Próxima consulta — só aparece se gcConnected e houver evento hoje */}
          {proximaLabel && (
            <div className="db-proxima-consulta">
              <span className="db-proxima-icon">{Icons.clock}</span>
              <span className="db-proxima-text">
                <strong>Próxima consulta:</strong> {proximaLabel}
              </span>
            </div>
          )}

          <div className="db-chip-row">
            <span className="db-chip">{clinica}</span>
            <span className="db-chip">{planLabel}</span>
            <span className={`db-chip ${gcConnected ? 'is-live' : ''}`}>
              {gcConnected ? 'Google Calendar conectado' : 'Agenda não conectada'}
            </span>
          </div>
          <div className="db-hero-footer">
            <div className="db-hero-date">{dataCompleta}</div>
            <button type="button" className="db-secondary-button" onClick={carregarDados}>
              <span className="db-button-icon">{Icons.refresh}</span>
              Atualizar painel
            </button>
          </div>
        </div>

        <div className="db-hero-side">
          <div className="db-hero-side-label">Resumo executivo</div>
          <div className="db-hero-side-value">
            {carregando ? '...' : moneyFormatter.format(resumo.aprovadosValor)}
          </div>
          {/* Sparkline de receita */}
          <div className="db-sparkline-row">
            <Sparkline data={sparkline} color="#8df6e0" height={36} width={100} />
            <span className="db-sparkline-label">Últimas 4 semanas</span>
          </div>
          <p className="db-hero-side-text">
            Pipeline, urgências e ticket médio em destaque.
          </p>
          <div className="db-summary-grid">
            <div className="db-summary-card">
              <span className="db-summary-label">Pipeline aberto</span>
              <strong>{carregando ? '...' : moneyFormatter.format(resumo.emAnaliseValor)}</strong>
              <small>{resumo.emAnalise} proposta{resumo.emAnalise === 1 ? '' : 's'} em análise</small>
            </div>
            <div className="db-summary-card">
              <span className="db-summary-label">Follow-ups urgentes</span>
              <strong>{carregando ? '...' : followUpsUrgentes}</strong>
              <small>{followUpsUrgentes === 0 ? 'Nenhum contato atrasado' : 'Precisam de ação imediata'}</small>
            </div>
            <div className="db-summary-card">
              <span className="db-summary-label">Ticket médio aprovado</span>
              <strong>{carregando ? '...' : moneyFormatter.format(ticketMedioAprovado)}</strong>
              <small>{resumo.aprovados > 0 ? 'Média das aprovações do mês' : 'Ainda sem aprovações neste mês'}</small>
            </div>
            <div className="db-summary-card">
              <span className="db-summary-label">Ticket médio em análise</span>
              <strong>{carregando ? '...' : moneyFormatter.format(ticketMedioEmAnalise)}</strong>
              <small>{resumo.emAnalise > 0 ? 'Média do pipeline atual' : 'Sem pipeline em aberto agora'}</small>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ações rápidas ── */}
      <section className="db-quick-strip-panel db-panel">
        <div className="db-panel-head">
          <div>
            <span className="db-panel-kicker">Acesso rápido</span>
            <h2>O que você precisa fazer agora?</h2>
          </div>
        </div>
        <div className="db-actions-grid db-actions-grid--top">
          {quickActions.map(action => (
            <button key={action.path} type="button" className={`db-action-card is-${action.tone}`} onClick={() => navigate(action.path)}>
              <span className="db-action-label">{action.label}</span>
              <span className="db-action-caption">{action.caption}</span>
              <span className="db-inline-icon">{Icons.arrow}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Banner de plano ── */}
      {banner && (
        <section className={`db-plan-banner is-${banner.tone}`}>
          <div className="db-plan-banner-copy">
            <span className="db-plan-banner-kicker">{banner.eyebrow}</span>
            <strong>{banner.title}</strong>
            <p>{banner.description}</p>
            {/* Barra de progresso do trial */}
            {banner.showTrialBar && (
              <div className="db-trial-bar-wrap">
                <div className="db-trial-bar-track">
                  <div className="db-trial-bar-fill" style={{ width: `${trialPct}%` }} />
                </div>
                <span className="db-trial-bar-label">{diasUsados} de {TRIAL_DIAS_TOTAL} dias usados — {diasTrial} restante{diasTrial === 1 ? '' : 's'}</span>
              </div>
            )}
          </div>
          <div className="db-plan-banner-actions">
            {isFree && (
              <div className="db-plan-meter">
                <div className="db-plan-meter-track">
                  <div className="db-plan-meter-fill" style={{ width: `${limitProgress}%` }} />
                </div>
                <span>{total}/{LIMITE_FREE} pacientes</span>
              </div>
            )}
            <button type="button" className="db-primary-button" onClick={banner.action.onClick}>
              {banner.action.label}
            </button>
          </div>
        </section>
      )}

      {/* ── Métricas ── */}
      <section className="db-metrics-grid">
        {cards.map(card => (
          <article key={card.label} className={`db-metric-card is-${card.tone}`}>
            <div className="db-metric-icon">{card.icon}</div>
            <div className="db-metric-copy">
              <span className="db-metric-label">{card.label}</span>
              <strong className="db-metric-value">{carregando ? '...' : card.valor}</strong>
              <span className="db-metric-sub">{card.sub}</span>
              {!carregando && card.trend}
              {!carregando && card.sparkline && (
                <div className="db-metric-sparkline">{card.sparkline}</div>
              )}
            </div>
          </article>
        ))}
      </section>

      {/* ── Grid principal ── */}
      <section className="db-main-grid">

        {/* Orçamentos / Retornos pendentes */}
        <article className="db-panel">
          <div className="db-panel-head">
            <div>
              <span className="db-panel-kicker">Pipeline de conversão</span>
              <h2>Retornos pendentes</h2>
              <p>Priorize os contatos mais antigos para evitar propostas paradas.</p>
            </div>
            <button type="button" className="db-ghost-button" onClick={() => navigate('/orcamento')}>
              Ver orçamentos <span className="db-inline-icon">{Icons.arrow}</span>
            </button>
          </div>

          {carregando ? (
            <div className="db-empty-state">
              <div className="db-empty-icon db-empty-icon--spin">{Icons.refresh}</div>
              <strong>Carregando seus dados…</strong>
              <p>Buscando orçamentos em aberto para montar o painel.</p>
            </div>
          ) : primeiroAcesso ? (
            /* ── Empty state de primeiro acesso ── */
            <div className="db-empty-state db-empty-state--onboard">
              <div className="db-empty-onboard-illo">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                  <circle cx="32" cy="32" r="32" fill="#f0fdfa" />
                  <path d="M20 44v-2a8 8 0 0 1 8-8h8a8 8 0 0 1 8 8v2" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="32" cy="24" r="6" stroke="#0f766e" strokeWidth="2" />
                  <circle cx="46" cy="20" r="3" fill="#0f766e" opacity=".25" />
                  <line x1="46" y1="16" x2="46" y2="24" stroke="#0f766e" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="42" y1="20" x2="50" y2="20" stroke="#0f766e" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <strong>Cadastre seu primeiro paciente</strong>
              <p>O painel se preenche automaticamente conforme você registra pacientes, orçamentos e documentos.</p>
              <button type="button" className="db-primary-button" onClick={() => navigate('/pacientes')}>
                <span className="db-button-icon">{Icons.userPlus}</span>
                Cadastrar primeiro paciente
              </button>
            </div>
          ) : orcamentosAbertos.length === 0 ? (
            <div className="db-empty-state">
              <div className="db-empty-icon">{Icons.approved}</div>
              <strong>Pipeline limpo — nenhum retorno pendente</strong>
              <p>Todos os orçamentos foram respondidos. Aproveite para gerar novas oportunidades.</p>
              <button type="button" className="db-ghost-button" onClick={() => navigate('/orcamento')}>
                Criar orçamento <span className="db-inline-icon">{Icons.arrow}</span>
              </button>
            </div>
          ) : (
            <div className="db-budget-list">
              {orcamentosAbertos.map(orcamento => {
                const dias = diasEmAberto(orcamento.created_at)
                const telefone = orcamento.pacientes?.telefone || ''
                const urgency = dias > 7 ? 'critical' : dias >= 3 ? 'warm' : 'fresh'
                return (
                  <div key={orcamento.id} className={`db-budget-row is-${urgency}`}>
                    <div className="db-budget-col">
                      <span className="db-budget-label">Paciente</span>
                      <strong>{orcamento.pacientes?.nome || 'Paciente não identificado'}</strong>
                      <small>{new Date(orcamento.created_at).toLocaleDateString('pt-BR')}</small>
                    </div>
                    <div className="db-budget-col">
                      <span className="db-budget-label">Valor estimado</span>
                      <strong>{moneyFormatter.format(parseFloat(orcamento.valor_total || 0))}</strong>
                      <small>{orcamento.status === 'pendente' ? 'Pendente' : 'Em análise'}</small>
                    </div>
                    <div className="db-budget-col">
                      <span className="db-budget-label">Aguardando</span>
                      <strong className={`db-budget-pill is-${urgency}`}>
                        {dias === 0 ? 'Hoje' : `${dias} dia${dias === 1 ? '' : 's'}`}
                      </strong>
                      <small>{dias > 7 ? 'Ação imediata' : dias >= 3 ? 'Bom momento para follow-up' : 'Contato recente'}</small>
                    </div>
                    <button type="button" className="db-whatsapp-button" onClick={() => abrirWhatsApp(telefone)} disabled={!telefone}>
                      <span className="db-inline-icon">{Icons.whatsapp}</span>
                      WhatsApp
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </article>

        {/* Coluna lateral */}
        <div className="db-side-stack">

          {/* Status do sistema */}
          <article className="db-panel">
            <div className="db-panel-head">
              <div>
                <span className="db-panel-kicker">Integrações</span>
                <h2>Status do sistema</h2>
              </div>
            </div>
            <div className="db-status-card">
              <div>
                <span className="db-panel-kicker">Google Calendar</span>
                <strong>{gcConnected ? 'Agenda sincronizada' : 'Não conectado'}</strong>
                <p>{gcConnected ? `Você tem ${consultasMes ?? '...'} consulta${consultasMes === 1 ? '' : 's'} previstas para este mês.` : 'Conecte sua agenda para ver os compromissos direto no painel.'}</p>
              </div>
              <button type="button" className="db-ghost-button" onClick={() => navigate('/configuracoes')}>
                {gcConnected ? 'Gerenciar' : 'Conectar agenda'}
              </button>
            </div>
            <div className="db-status-card is-soft">
              <div>
                <span className="db-panel-kicker">Capacidade</span>
                <strong>{isFree ? 'Plano gratuito' : 'Crescimento liberado'}</strong>
                <p>{isFree ? `${total} de ${LIMITE_FREE} pacientes utilizados no plano atual.` : 'Seu plano permite cadastrar pacientes sem limite.'}</p>
              </div>
              {isFree && (
                <div className="db-plan-meter">
                  <div className="db-plan-meter-track">
                    <div className="db-plan-meter-fill" style={{ width: `${limitProgress}%` }} />
                  </div>
                  <span>{Math.round(limitProgress)}% usado</span>
                </div>
              )}
            </div>
          </article>

          {/* Últimos pacientes */}
          <article className="db-panel">
            <div className="db-panel-head">
              <div>
                <span className="db-panel-kicker">Relacionamento</span>
                <h2>Últimos pacientes cadastrados</h2>
              </div>
              <button type="button" className="db-ghost-button" onClick={() => navigate('/pacientes')}>
                Ver todos
              </button>
            </div>
            {carregando ? (
              <div className="db-empty-state compact">
                <div className="db-empty-icon db-empty-icon--spin">{Icons.refresh}</div>
                <strong>Carregando pacientes…</strong>
              </div>
            ) : ultimosPacientes.length === 0 ? (
              <div className="db-empty-state compact">
                <div className="db-empty-icon">{Icons.patients}</div>
                <strong>Nenhum paciente ainda</strong>
                <p>Adicione o primeiro cadastro para começar.</p>
                <button type="button" className="db-primary-button" onClick={() => navigate('/pacientes')}>
                  <span className="db-button-icon">{Icons.userPlus}</span>
                  Cadastrar paciente
                </button>
              </div>
            ) : (
              <div className="db-patient-list">
                {ultimosPacientes.map(patient => (
                  <button key={patient.id} type="button" className="db-patient-row" onClick={() => navigate('/pacientes')}>
                    <span className="db-patient-avatar">{patient.nome?.charAt(0)?.toUpperCase() || 'P'}</span>
                    <span className="db-patient-copy">
                      <strong>{patient.nome}</strong>
                      <small>{patient.convenio ? `${patient.convenio} · ` : ''}{patient.created_at ? new Date(patient.created_at).toLocaleDateString('pt-BR') : 'Cadastro recente'}</small>
                    </span>
                    <span className="db-inline-icon">{Icons.arrow}</span>
                  </button>
                ))}
              </div>
            )}
          </article>

        </div>
      </section>
    </div>
  )
}
