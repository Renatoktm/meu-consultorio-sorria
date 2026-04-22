import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { useGoogleCalendar } from '../hooks/useGoogleCalendar'
import { usePlano } from '../hooks/usePlano'
import ModalUpgrade from '../components/ModalUpgrade'
import { sanitizePhoneForWhatsApp } from '../lib/utils'
import '../styles/dashboard.css'

const moneyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const Icons = {
  refresh: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  ),
  patients: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  pipeline: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </svg>
  ),
  approved: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 12 2 2 4-4" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  ),
  documents: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  ),
  spark: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 9.3 9.3 3 12l6.3 2.7L12 21l2.7-6.3L21 12l-6.3-2.7z" />
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 12a8 8 0 0 1-11.77 7.05L4 20l.95-4.23A8 8 0 1 1 20 12Z" />
      <path d="M8.5 9.5c.3-.7.6-.7.9-.7h.6c.2 0 .5.1.6.5l.6 1.5c.1.2 0 .4-.1.6l-.5.6c-.1.1-.2.2-.1.4.3.7 1 1.6 2.2 2.2.2.1.3 0 .4-.1l.6-.7c.2-.2.4-.2.6-.1l1.5.6c.4.2.5.4.5.6v.6c0 .3-.1.6-.7.9-.6.3-1.5.4-2.8-.1-1.3-.5-2.8-1.8-3.9-3.4-1.1-1.5-1.4-2.8-1-3.4Z" />
    </svg>
  ),
}

export default function Dashboard() {
  const { profile, user } = useAuth()
  const navigate = useNavigate()
  const { plano, isFree, trialAtivo, trialExpirado, diasTrial, total, LIMITE_FREE, podeAdicionarPaciente } = usePlano()
  const { isConnected: gcConnected, getEvents } = useGoogleCalendar()

  const [resumo, setResumo] = useState({
    pacientes: 0,
    emAnalise: 0,
    emAnaliseValor: 0,
    aprovados: 0,
    aprovadosValor: 0,
    documentos: 0,
  })
  const [consultasMes, setConsultasMes] = useState(null)
  const [orcamentosAbertos, setOrcamentosAbertos] = useState([])
  const [ultimosPacientes, setUltimosPacientes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [showUpgrade, setShowUpgrade] = useState(false)

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
  const nome = profile?.nome?.split(' ')[0] || user?.email?.split('@')[0] || 'Dentista'
  const clinica = profile?.clinica || 'Seu consultorio'

  useEffect(() => {
    if (user?.id) carregarDados()
  }, [user?.id])

  useEffect(() => {
    if (!gcConnected) {
      setConsultasMes(null)
      return
    }

    const agora = new Date()
    const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 1)

    getEvents(agora.toISOString(), fimMes.toISOString()).then(eventos => {
      setConsultasMes(eventos.length)
    })
  }, [gcConnected, getEvents])

  async function carregarDados() {
    setCarregando(true)

    const inicioMes = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    ).toISOString()

    try {
      const [
        { count: totalPacientes },
        { data: emAnaliseRows },
        { data: aprovadosRows },
        { data: abertos },
        { data: ultimos },
      ] = await Promise.all([
        supabase.from('pacientes').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('orcamentos').select('valor_total, status').eq('user_id', user.id).in('status', ['em_analise', 'pendente']),
        supabase.from('orcamentos').select('valor_total').eq('user_id', user.id).eq('status', 'aprovado').gte('created_at', inicioMes),
        supabase
          .from('orcamentos')
          .select('*, pacientes(nome, telefone)')
          .eq('user_id', user.id)
          .in('status', ['em_analise', 'pendente'])
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('pacientes')
          .select('id, nome, created_at, convenio')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      let documentos = 0

      try {
        const [{ count: receituarios }, { count: atestados }, { count: exames }] = await Promise.all([
          supabase.from('receituarios').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', inicioMes),
          supabase.from('atestados').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', inicioMes),
          supabase.from('exames').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', inicioMes),
        ])

        documentos = (receituarios || 0) + (atestados || 0) + (exames || 0)
      } catch (_) {}

      setResumo({
        pacientes: totalPacientes || 0,
        emAnalise: emAnaliseRows?.length || 0,
        emAnaliseValor: emAnaliseRows?.reduce((soma, item) => soma + parseFloat(item.valor_total || 0), 0) || 0,
        aprovados: aprovadosRows?.length || 0,
        aprovadosValor: aprovadosRows?.reduce((soma, item) => soma + parseFloat(item.valor_total || 0), 0) || 0,
        documentos,
      })
      setOrcamentosAbertos(abertos || [])
      setUltimosPacientes(ultimos || [])
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setCarregando(false)
    }
  }

  function diasEmAberto(createdAt) {
    return Math.floor((new Date() - new Date(createdAt)) / 86400000)
  }

  function abrirWhatsApp(telefone) {
    const numero = sanitizePhoneForWhatsApp(telefone)
    if (!numero) {
      alert('Telefone inválido ou não cadastrado para este paciente.')
      return
    }
    window.open(`https://wa.me/55${numero}`, '_blank', 'noopener,noreferrer')
  }

  const mesAtual = new Date().toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })

  const dataCompleta = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const planLabel = plano === 'pro'
    ? 'Plano Pro ativo'
    : trialAtivo
      ? `Teste premium · ${diasTrial} dia${diasTrial === 1 ? '' : 's'}`
      : trialExpirado
        ? 'Trial encerrado'
        : 'Plano gratuito'

  const pulseTitle = trialExpirado
    ? 'Sua assinatura precisa de atencao'
    : resumo.emAnalise > 0
      ? `${resumo.emAnalise} orcamento${resumo.emAnalise === 1 ? '' : 's'} aguardando retorno`
      : 'Fluxo do consultorio sob controle'

  const pulseText = trialExpirado
    ? 'Renove o plano Pro para continuar usando todos os modulos sem bloqueios.'
    : resumo.emAnalise > 0
      ? 'Acompanhe os contatos pendentes para transformar analises em aprovacoes.'
      : 'Hoje voce esta com a fila limpa e pode focar no atendimento.'

  const limitProgress = Math.min((total / LIMITE_FREE) * 100, 100)
  const followUpsUrgentes = orcamentosAbertos.filter(item => diasEmAberto(item.created_at) > 7).length
  const ticketMedioAprovado = resumo.aprovados > 0 ? resumo.aprovadosValor / resumo.aprovados : 0
  const ticketMedioEmAnalise = resumo.emAnalise > 0 ? resumo.emAnaliseValor / resumo.emAnalise : 0

  const cards = [
    {
      icon: Icons.patients,
      label: 'Pacientes ativos',
      valor: resumo.pacientes,
      sub: 'base cadastrada',
      tone: 'teal',
    },
    {
      icon: Icons.pipeline,
      label: 'Em analise',
      valor: resumo.emAnalise,
      sub: resumo.emAnalise > 0 ? `${moneyFormatter.format(resumo.emAnaliseValor)} em aberto` : 'nenhum pendente',
      tone: 'amber',
    },
    {
      icon: Icons.approved,
      label: 'Aprovados no mes',
      valor: resumo.aprovados,
      sub: resumo.aprovados > 0 ? `${moneyFormatter.format(resumo.aprovadosValor)} em ${mesAtual}` : `resultado de ${mesAtual}`,
      tone: 'green',
    },
    {
      icon: Icons.documents,
      label: 'Documentos gerados',
      valor: resumo.documentos,
      sub: 'emitidos neste mes',
      tone: 'purple',
    },
    {
      icon: Icons.calendar,
      label: 'Consultas agendadas',
      valor: gcConnected ? (consultasMes ?? '...') : '—',
      sub: gcConnected ? 'restantes neste mes' : 'Conecte o Google Calendar',
      tone: 'blue',
    },
  ]

  const quickActions = [
    { label: 'Novo paciente', caption: 'Abrir prontuario', path: '/prontuario', tone: 'teal' },
    { label: 'Novo orcamento', caption: 'Registrar proposta', path: '/orcamento', tone: 'amber' },
    { label: 'Receituario', caption: 'Gerar documento', path: '/receituario', tone: 'purple' },
    { label: 'Solicitar exames', caption: 'Encaminhamento rapido', path: '/exames', tone: 'blue' },
  ]

  let banner = null

  if (trialAtivo) {
    banner = {
      tone: 'success',
      eyebrow: 'Teste premium ativo',
      title: `${diasTrial} dia${diasTrial === 1 ? '' : 's'} para experimentar tudo`,
      description: 'Voce esta usando todos os recursos liberados. Aproveite para validar agenda, orcamentos e documentos.',
      action: { label: 'Ver planos', onClick: () => setShowUpgrade(true) },
    }
  } else if (trialExpirado) {
    banner = {
      tone: 'warning',
      eyebrow: 'Acesso pendente',
      title: 'Seu periodo de teste terminou',
      description: 'Assine o plano Pro para continuar com o sistema completo e sem bloqueios nas rotinas da clinica.',
      action: { label: 'Assinar Pro', onClick: () => setShowUpgrade(true) },
    }
  } else if (isFree) {
    banner = {
      tone: !podeAdicionarPaciente ? 'danger' : 'neutral',
      eyebrow: 'Plano gratuito',
      title: !podeAdicionarPaciente ? 'Limite de pacientes atingido' : `${total} de ${LIMITE_FREE} pacientes utilizados`,
      description: !podeAdicionarPaciente
        ? 'Faca upgrade para continuar cadastrando pacientes e manter o ritmo do consultorio.'
        : 'Voce ainda pode usar o modo gratuito, mas o plano Pro libera crescimento sem limite.',
      action: { label: 'Fazer upgrade', onClick: () => setShowUpgrade(true) },
    }
  }

  return (
    <div className="db-page">
      {showUpgrade && <ModalUpgrade motivo={trialExpirado ? 'trial_expirado' : 'upgrade'} onClose={() => setShowUpgrade(false)} />}

      <section className="db-hero">
        <div className="db-hero-main">
          <div className="db-hero-kicker">Central do consultorio</div>
          <h1 className="db-hero-title">{saudacao}, Dr(a). {nome}</h1>
          <p className="db-hero-text">
            {pulseTitle}. Acompanhe pacientes, agenda, documentos e orcamentos sem perder o contexto do dia.
          </p>

          <div className="db-chip-row">
            <span className="db-chip">{clinica}</span>
            <span className="db-chip">{planLabel}</span>
            <span className={`db-chip ${gcConnected ? 'is-live' : ''}`}>
              {gcConnected ? 'Google Calendar conectado' : 'Agenda ainda nao conectada'}
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
          <p className="db-hero-side-text">
            Valor aprovado em {mesAtual}. O quadro abaixo resume pipeline, urgencias e ticket medio sem repetir os cards do painel.
          </p>

          <div className="db-summary-grid">
            <div className="db-summary-card">
              <span className="db-summary-label">Pipeline aberto</span>
              <strong>{carregando ? '...' : moneyFormatter.format(resumo.emAnaliseValor)}</strong>
              <small>{resumo.emAnalise} proposta{resumo.emAnalise === 1 ? '' : 's'} em analise</small>
            </div>

            <div className="db-summary-card">
              <span className="db-summary-label">Follow-ups urgentes</span>
              <strong>{carregando ? '...' : followUpsUrgentes}</strong>
              <small>{followUpsUrgentes === 0 ? 'Nenhum contato atrasado' : 'Precisam de acao imediata'}</small>
            </div>

            <div className="db-summary-card">
              <span className="db-summary-label">Ticket medio aprovado</span>
              <strong>{carregando ? '...' : moneyFormatter.format(ticketMedioAprovado)}</strong>
              <small>{resumo.aprovados > 0 ? 'Media das aprovacoes do mes' : 'Ainda sem aprovacoes neste mes'}</small>
            </div>

            <div className="db-summary-card">
              <span className="db-summary-label">Ticket medio em analise</span>
              <strong>{carregando ? '...' : moneyFormatter.format(ticketMedioEmAnalise)}</strong>
              <small>{resumo.emAnalise > 0 ? 'Media do pipeline atual' : 'Sem pipeline em aberto agora'}</small>
            </div>
          </div>
        </div>
      </section>

      <section className="db-quick-strip-panel db-panel">
        <div className="db-panel-head">
          <div>
            <span className="db-panel-kicker">Acesso rapido</span>
            <h2>Entradas mais usadas do dia</h2>
            <p>Os atalhos principais ficam no topo para acelerar a rotina da recepcao e do dentista.</p>
          </div>
        </div>

        <div className="db-actions-grid db-actions-grid--top">
          {quickActions.map(action => (
            <button
              key={action.path}
              type="button"
              className={`db-action-card is-${action.tone}`}
              onClick={() => navigate(action.path)}
            >
              <span className="db-action-label">{action.label}</span>
              <span className="db-action-caption">{action.caption}</span>
              <span className="db-inline-icon">{Icons.arrow}</span>
            </button>
          ))}
        </div>
      </section>

      {banner && (
        <section className={`db-plan-banner is-${banner.tone}`}>
          <div className="db-plan-banner-copy">
            <span className="db-plan-banner-kicker">{banner.eyebrow}</span>
            <strong>{banner.title}</strong>
            <p>{banner.description}</p>
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

      <section className="db-metrics-grid">
        {cards.map(card => (
          <article key={card.label} className={`db-metric-card is-${card.tone}`}>
            <div className="db-metric-icon">{card.icon}</div>
            <div className="db-metric-copy">
              <span className="db-metric-label">{card.label}</span>
              <strong className="db-metric-value">{carregando ? '...' : card.valor}</strong>
              <span className="db-metric-sub">{card.sub}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="db-main-grid">
        <article className="db-panel">
          <div className="db-panel-head">
            <div>
              <span className="db-panel-kicker">Pipeline de conversao</span>
              <h2>Orcamentos aguardando retorno</h2>
              <p>Priorize os contatos mais antigos para evitar propostas paradas.</p>
            </div>

            <button type="button" className="db-ghost-button" onClick={() => navigate('/orcamento')}>
              Ver orcamentos
              <span className="db-inline-icon">{Icons.arrow}</span>
            </button>
          </div>

          {carregando ? (
            <div className="db-empty-state">
              <div className="db-empty-icon">{Icons.spark}</div>
              <strong>Carregando seus dados</strong>
              <p>Estou buscando os orcamentos em aberto para montar o painel.</p>
            </div>
          ) : orcamentosAbertos.length === 0 ? (
            <div className="db-empty-state">
              <div className="db-empty-icon">{Icons.approved}</div>
              <strong>Nenhum orcamento aguardando retorno</strong>
              <p>Seu pipeline esta limpo agora. Aproveite para gerar novas oportunidades.</p>
            </div>
          ) : (
            <div className="db-budget-list">
              {orcamentosAbertos.map(orcamento => {
                const dias = diasEmAberto(orcamento.created_at)
                const telefone = orcamento.pacientes?.telefone || ''
                const urgency = dias > 7 ? 'critical' : dias >= 3 ? 'warm' : 'fresh'
                const patientName = orcamento.pacientes?.nome || 'Paciente nao identificado'

                return (
                  <div key={orcamento.id} className={`db-budget-row is-${urgency}`}>
                    <div className="db-budget-col">
                      <span className="db-budget-label">Paciente</span>
                      <strong>{patientName}</strong>
                      <small>{new Date(orcamento.created_at).toLocaleDateString('pt-BR')}</small>
                    </div>

                    <div className="db-budget-col">
                      <span className="db-budget-label">Valor estimado</span>
                      <strong>{moneyFormatter.format(parseFloat(orcamento.valor_total || 0))}</strong>
                      <small>{orcamento.status === 'pendente' ? 'Pendente' : 'Em analise'}</small>
                    </div>

                    <div className="db-budget-col">
                      <span className="db-budget-label">Janela de retorno</span>
                      <strong className={`db-budget-pill is-${urgency}`}>
                        {dias === 0 ? 'Hoje' : `${dias} dia${dias === 1 ? '' : 's'}`}
                      </strong>
                      <small>
                        {dias > 7
                          ? 'Precisa de acao imediata'
                          : dias >= 3
                            ? 'Bom momento para follow-up'
                            : 'Contato recente'}
                      </small>
                    </div>

                    <button
                      type="button"
                      className="db-whatsapp-button"
                      onClick={() => abrirWhatsApp(telefone)}
                      disabled={!telefone}
                      title={telefone ? `WhatsApp: ${telefone}` : 'Telefone nao cadastrado'}
                    >
                      <span className="db-inline-icon">{Icons.whatsapp}</span>
                      WhatsApp
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </article>

        <div className="db-side-stack">
          <article className="db-panel">
            <div className="db-panel-head">
              <div>
                <span className="db-panel-kicker">Status do sistema</span>
                <h2>Operacao auxiliar</h2>
                <p>Informacoes de integracao e capacidade ficam separadas do acesso rapido para manter o topo mais objetivo.</p>
              </div>
            </div>

            <div className="db-status-card">
              <div>
                <span className="db-panel-kicker">Integracao</span>
                <strong>{gcConnected ? 'Agenda sincronizada' : 'Google Calendar desconectado'}</strong>
                <p>
                  {gcConnected
                    ? `Voce tem ${consultasMes ?? '...'} consulta${consultasMes === 1 ? '' : 's'} previstas para este mes.`
                    : 'Conecte sua agenda para acompanhar os compromissos direto no painel.'}
                </p>
              </div>

              <button type="button" className="db-ghost-button" onClick={() => navigate('/configuracoes')}>
                {gcConnected ? 'Gerenciar integracao' : 'Conectar agenda'}
              </button>
            </div>

            <div className="db-status-card is-soft">
              <div>
                <span className="db-panel-kicker">Capacidade</span>
                <strong>{isFree ? 'Limite do plano gratuito' : 'Crescimento liberado'}</strong>
                <p>
                  {isFree
                    ? `${total} de ${LIMITE_FREE} pacientes ocupados no plano atual.`
                    : 'Seu plano atual permite seguir cadastrando pacientes sem limite.'}
                </p>
              </div>

              {isFree ? (
                <div className="db-plan-meter">
                  <div className="db-plan-meter-track">
                    <div className="db-plan-meter-fill" style={{ width: `${limitProgress}%` }} />
                  </div>
                  <span>{Math.round(limitProgress)}% usado</span>
                </div>
              ) : null}
            </div>
          </article>

          <article className="db-panel">
            <div className="db-panel-head">
              <div>
                <span className="db-panel-kicker">Relacionamento</span>
                <h2>Ultimos pacientes cadastrados</h2>
                <p>Um atalho para retomar historicos e voltar ao prontuario rapidamente.</p>
              </div>

              <button type="button" className="db-ghost-button" onClick={() => navigate('/prontuario')}>
                Ver pacientes
              </button>
            </div>

            {carregando ? (
              <div className="db-empty-state compact">
                <div className="db-empty-icon">{Icons.patients}</div>
                <strong>Carregando pacientes</strong>
              </div>
            ) : ultimosPacientes.length === 0 ? (
              <div className="db-empty-state compact">
                <div className="db-empty-icon">{Icons.patients}</div>
                <strong>Nenhum paciente cadastrado</strong>
                <p>Comece adicionando o primeiro cadastro para alimentar o consultorio.</p>
                <button type="button" className="db-primary-button" onClick={() => navigate('/prontuario')}>
                  Cadastrar paciente
                </button>
              </div>
            ) : (
              <div className="db-patient-list">
                {ultimosPacientes.map(patient => (
                  <button
                    key={patient.id}
                    type="button"
                    className="db-patient-row"
                    onClick={() => navigate('/prontuario')}
                  >
                    <span className="db-patient-avatar">
                      {patient.nome?.charAt(0)?.toUpperCase() || 'P'}
                    </span>
                    <span className="db-patient-copy">
                      <strong>{patient.nome}</strong>
                      <small>
                        {patient.convenio ? `${patient.convenio} · ` : ''}
                        {patient.created_at ? new Date(patient.created_at).toLocaleDateString('pt-BR') : 'Cadastro recente'}
                      </small>
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
