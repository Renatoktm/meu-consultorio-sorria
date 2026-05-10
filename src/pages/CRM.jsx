import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
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

export default function CRM() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  const [carregando, setCarregando] = useState(true)
  const [resumo, setResumo] = useState({
    pacientesMes: 0,
    emAnalise: 0,
    emAnaliseValor: 0,
    aprovados: 0,
    aprovadosValor: 0,
    documentos: 0,
  })
  const [orcamentosAbertos, setOrcamentosAbertos] = useState([])
  const [ultimosPacientes, setUltimosPacientes] = useState([])

  useEffect(() => {
    if (user?.id) {
      carregarDados()
    }
  }, [user?.id])

  async function carregarDados() {
    if (!user?.id) return
    setCarregando(true)

    const inicioMes = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    ).toISOString()

    try {
      const [
        { count: pacientesMesTotal },
        { data: emAnaliseRows },
        { data: aprovadosRows },
        { data: abertos },
        { data: ultimos },
      ] = await Promise.all([
        supabase.from('pacientes').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', inicioMes),
        supabase.from('orcamentos').select('valor_total, status').eq('user_id', user.id).in('status', ['em_analise', 'pendente']),
        supabase.from('orcamentos').select('valor_total').eq('user_id', user.id).eq('status', 'aprovado').gte('created_at', inicioMes),
        supabase
          .from('orcamentos')
          .select('*, pacientes(nome, telefone)')
          .eq('user_id', user.id)
          .in('status', ['em_analise', 'pendente'])
          .order('created_at', { ascending: false })
          .limit(12),
        supabase
          .from('pacientes')
          .select('id, nome, created_at, convenio')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(8),
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
        pacientesMes: pacientesMesTotal || 0,
        emAnalise: emAnaliseRows?.length || 0,
        emAnaliseValor: emAnaliseRows?.reduce((soma, item) => soma + parseFloat(item.valor_total || 0), 0) || 0,
        aprovados: aprovadosRows?.length || 0,
        aprovadosValor: aprovadosRows?.reduce((soma, item) => soma + parseFloat(item.valor_total || 0), 0) || 0,
        documentos,
      })
      setOrcamentosAbertos(abertos || [])
      setUltimosPacientes(ultimos || [])
    } catch (error) {
      console.error('Erro ao carregar CRM:', error)
    } finally {
      setCarregando(false)
    }
  }

  function diasEmAberto(createdAt) {
    return Math.floor((new Date() - new Date(createdAt)) / 86400000)
  }

  function abrirWhatsApp(telefone) {
    const numero = (telefone || '').replace(/\D/g, '')
    if (!numero) {
      alert('Telefone nao cadastrado para este paciente.')
      return
    }
    window.open(`https://wa.me/55${numero}`, '_blank')
  }

  const crmRecentPatients = ultimosPacientes.slice(0, 4)
  const crmOpenOpportunities = orcamentosAbertos.slice(0, 4)
  const crmFollowUpQueue = [...orcamentosAbertos]
    .sort((a, b) => diasEmAberto(b.created_at) - diasEmAberto(a.created_at))
    .slice(0, 4)
  const crmConversionBase = resumo.aprovados + resumo.emAnalise
  const crmConversionRate = crmConversionBase > 0
    ? Math.round((resumo.aprovados / crmConversionBase) * 100)
    : 0
  const ticketMedioAprovado = resumo.aprovados > 0 ? resumo.aprovadosValor / resumo.aprovados : 0
  const followUpsUrgentes = crmFollowUpQueue.filter(item => diasEmAberto(item.created_at) > 7).length

  const headlineCards = [
    {
      label: 'Novos contatos',
      value: carregando ? '...' : resumo.pacientesMes,
      detail: 'cadastros no mes atual',
      tone: 'teal',
    },
    {
      label: 'Pipeline aberto',
      value: carregando ? '...' : moneyFormatter.format(resumo.emAnaliseValor),
      detail: `${resumo.emAnalise} oportunidade${resumo.emAnalise === 1 ? '' : 's'} em andamento`,
      tone: 'amber',
    },
    {
      label: 'Follow-ups urgentes',
      value: carregando ? '...' : followUpsUrgentes,
      detail: 'retornos que pedem acao imediata',
      tone: 'rose',
    },
    {
      label: 'Conversao do mes',
      value: carregando ? '...' : `${crmConversionRate}%`,
      detail: 'relacao entre propostas abertas e ganhas',
      tone: 'dark',
    },
  ]

  return (
    <div className="db-page">
      <section className="db-panel crm-page-hero">
        <div className="db-panel-head">
          <div>
            <span className="db-panel-kicker">CRM integrado</span>
            <h2>Painel comercial da clinica</h2>
            <p>
              Acompanhe entrada, proposta, follow-up e fechamento em uma area propria, sem sobrecarregar o dashboard principal.
            </p>
          </div>

          <div className="crm-page-actions">
            <button type="button" className="db-secondary-button" onClick={carregarDados}>
              <span className="db-button-icon">{Icons.refresh}</span>
              Atualizar CRM
            </button>
            <button type="button" className="db-primary-button" onClick={() => navigate('/orcamento')}>
              Novo orcamento
              <span className="db-inline-icon">{Icons.arrow}</span>
            </button>
          </div>
        </div>

        <div className="crm-page-summary-grid">
          {headlineCards.map(card => (
            <article key={card.label} className={`crm-page-summary-card is-${card.tone}`}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <small>{card.detail}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="db-panel db-crm-panel">
        <div className="db-panel-head">
          <div>
            <span className="db-panel-kicker">Pipeline visual</span>
            <h2>Etapas que a recepcao e a clinica conseguem ler rapido</h2>
            <p>O CRM foi desenhado para conectar relacionamento, proposta e conversao usando os dados que ja nascem no sistema.</p>
          </div>
        </div>

        <div className="db-crm-grid">
          <article className="db-crm-lane is-teal">
            <div className="db-crm-lane-head">
              <div>
                <span className="db-crm-kicker">Entrada</span>
                <strong>Novos contatos</strong>
              </div>
              <span className="db-crm-count">{carregando ? '...' : resumo.pacientesMes}</span>
            </div>

            <p className="db-crm-copy">
              Pacientes cadastrados neste mes e prontos para ganhar contexto comercial e clinico.
            </p>

            {carregando ? (
              <div className="db-crm-empty">Carregando cadastros recentes...</div>
            ) : crmRecentPatients.length === 0 ? (
              <div className="db-crm-empty">Sem novos cadastros recentes.</div>
            ) : (
              <div className="db-crm-list">
                {crmRecentPatients.map(patient => (
                  <button
                    key={patient.id}
                    type="button"
                    className="db-crm-item"
                    onClick={() => navigate('/pacientes')}
                  >
                    <div className="db-crm-item-top">
                      <strong>{patient.nome}</strong>
                      <span className="db-crm-item-tag">Novo</span>
                    </div>
                    <small>
                      {patient.convenio ? `${patient.convenio} - ` : ''}
                      {patient.created_at ? new Date(patient.created_at).toLocaleDateString('pt-BR') : 'Cadastro recente'}
                    </small>
                  </button>
                ))}
              </div>
            )}

            <div className="db-crm-footer">
              <button type="button" className="db-ghost-button" onClick={() => navigate('/pacientes')}>
                Ver pacientes
              </button>
            </div>
          </article>

          <article className="db-crm-lane is-amber">
            <div className="db-crm-lane-head">
              <div>
                <span className="db-crm-kicker">Proposta</span>
                <strong>Oportunidades abertas</strong>
              </div>
              <span className="db-crm-count">{carregando ? '...' : resumo.emAnalise}</span>
            </div>

            <p className="db-crm-copy">
              Orcamentos ativos com valor visivel para a recepcao acompanhar sem depender de planilha.
            </p>

            {carregando ? (
              <div className="db-crm-empty">Carregando oportunidades...</div>
            ) : crmOpenOpportunities.length === 0 ? (
              <div className="db-crm-empty">Nenhuma proposta ativa neste momento.</div>
            ) : (
              <div className="db-crm-list">
                {crmOpenOpportunities.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    className="db-crm-item"
                    onClick={() => navigate('/orcamento')}
                  >
                    <div className="db-crm-item-top">
                      <strong>{item.pacientes?.nome || 'Paciente nao identificado'}</strong>
                      <span className="db-crm-item-value">
                        {moneyFormatter.format(parseFloat(item.valor_total || 0))}
                      </span>
                    </div>
                    <small>{diasEmAberto(item.created_at)} dia{diasEmAberto(item.created_at) === 1 ? '' : 's'} no pipeline</small>
                  </button>
                ))}
              </div>
            )}

            <div className="db-crm-footer">
              <button type="button" className="db-ghost-button" onClick={() => navigate('/orcamento')}>
                Ver orcamentos
              </button>
            </div>
          </article>

          <article className="db-crm-lane is-rose">
            <div className="db-crm-lane-head">
              <div>
                <span className="db-crm-kicker">Follow-up</span>
                <strong>Fila de retorno</strong>
              </div>
              <span className="db-crm-count">{carregando ? '...' : followUpsUrgentes}</span>
            </div>

            <p className="db-crm-copy">
              Contatos que pedem acao rapida para evitar esfriamento da conversa e perda de fechamento.
            </p>

            {carregando ? (
              <div className="db-crm-empty">Carregando follow-ups...</div>
            ) : crmFollowUpQueue.length === 0 ? (
              <div className="db-crm-empty">Sem follow-ups pendentes agora.</div>
            ) : (
              <div className="db-crm-list">
                {crmFollowUpQueue.map(item => {
                  const dias = diasEmAberto(item.created_at)
                  const phone = item.pacientes?.telefone || ''
                  return (
                    <div key={item.id} className="db-crm-item">
                      <div className="db-crm-item-top">
                        <strong>{item.pacientes?.nome || 'Paciente nao identificado'}</strong>
                        <span className={`db-budget-pill is-${dias > 7 ? 'critical' : dias >= 3 ? 'warm' : 'fresh'}`}>
                          {dias === 0 ? 'Hoje' : `${dias}d`}
                        </span>
                      </div>
                      <small>{dias > 7 ? 'Retorno vencido' : dias >= 3 ? 'Follow-up recomendado' : 'Contato novo'}</small>
                      <button
                        type="button"
                        className="db-crm-inline-action"
                        onClick={() => abrirWhatsApp(phone)}
                        disabled={!phone}
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

          <article className="db-crm-lane is-dark">
            <div className="db-crm-lane-head">
              <div>
                <span className="db-crm-kicker">Fechamento</span>
                <strong>Resultado do mes</strong>
              </div>
              <span className="db-crm-count">{carregando ? '...' : `${crmConversionRate}%`}</span>
            </div>

            <p className="db-crm-copy">
              Resumo de performance para saber se a operacao comercial esta convertendo com qualidade.
            </p>

            <div className="db-crm-outcome-grid">
              <div className="db-crm-outcome-card">
                <span>Aprovado</span>
                <strong>{carregando ? '...' : moneyFormatter.format(resumo.aprovadosValor)}</strong>
              </div>
              <div className="db-crm-outcome-card">
                <span>Ticket medio</span>
                <strong>{carregando ? '...' : moneyFormatter.format(ticketMedioAprovado)}</strong>
              </div>
              <div className="db-crm-outcome-card">
                <span>Propostas ganhas</span>
                <strong>{carregando ? '...' : resumo.aprovados}</strong>
              </div>
              <div className="db-crm-outcome-card">
                <span>Documentos</span>
                <strong>{carregando ? '...' : resumo.documentos}</strong>
              </div>
            </div>

            <div className="db-crm-footer">
              <button type="button" className="db-primary-button" onClick={() => navigate('/dashboard')}>
                Ver dashboard
              </button>
            </div>
          </article>
        </div>
      </section>

      <section className="db-main-grid">
        <article className="db-panel">
          <div className="db-panel-head">
            <div>
              <span className="db-panel-kicker">Acoes recomendadas</span>
              <h2>Prioridades para o time hoje</h2>
              <p>Uma leitura rapida do que destrava fechamento e melhora a resposta comercial da clinica.</p>
            </div>
          </div>

          <div className="crm-actions-list">
            <article className="crm-action-card">
              <span className="crm-action-step">1</span>
              <div>
                <strong>Retornar oportunidades antigas</strong>
                <p>Comece pelos casos com mais de 7 dias sem resposta para reduzir perda de interesse.</p>
              </div>
            </article>

            <article className="crm-action-card">
              <span className="crm-action-step">2</span>
              <div>
                <strong>Converter cadastros recentes em proposta</strong>
                <p>Pacientes novos sem proposta aberta podem virar oportunidade com pouca friccao.</p>
              </div>
            </article>

            <article className="crm-action-card">
              <span className="crm-action-step">3</span>
              <div>
                <strong>Usar documentos como apoio de fechamento</strong>
                <p>Receitas, exames e anexos ajudam a clinica a transmitir seguranca e profissionalismo.</p>
              </div>
            </article>
          </div>
        </article>

        <article className="db-panel">
          <div className="db-panel-head">
            <div>
              <span className="db-panel-kicker">Navegacao rapida</span>
              <h2>Entradas do comercial</h2>
              <p>Atalhos para o que a recepcao mais usa na rotina de relacionamento e proposta.</p>
            </div>
          </div>

          <div className="db-actions-grid">
            <button type="button" className="db-action-card is-teal" onClick={() => navigate('/pacientes')}>
              <span className="db-action-label">Pacientes</span>
              <span className="db-action-caption">Cadastros e historico</span>
              <span className="db-inline-icon">{Icons.arrow}</span>
            </button>

            <button type="button" className="db-action-card is-amber" onClick={() => navigate('/orcamento')}>
              <span className="db-action-label">Propostas</span>
              <span className="db-action-caption">Abrir e acompanhar</span>
              <span className="db-inline-icon">{Icons.arrow}</span>
            </button>

            <button type="button" className="db-action-card is-blue" onClick={() => navigate('/agenda')}>
              <span className="db-action-label">Agenda</span>
              <span className="db-action-caption">Confirmacoes do dia</span>
              <span className="db-inline-icon">{Icons.arrow}</span>
            </button>

            <button type="button" className="db-action-card is-purple" onClick={() => navigate('/dashboard')}>
              <span className="db-action-label">Resumo geral</span>
              <span className="db-action-caption">Voltar ao painel executivo</span>
              <span className="db-inline-icon">{Icons.arrow}</span>
            </button>
          </div>
        </article>
      </section>
    </div>
  )
}
