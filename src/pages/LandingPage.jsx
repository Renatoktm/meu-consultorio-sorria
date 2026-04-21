import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/landing.css'

const SUPABASE_URL = 'https://nfkhnjglkvyduhzauavh.supabase.co'
const CHAT_URL = `${SUPABASE_URL}/functions/v1/sorria-chat`

const WA_ATENDENTE = 'https://wa.me/5537999722971?text=Ol%C3%A1!%20Tenho%20interesse%20na%20SorrIA%20Atendente%20Virtual%20para%20minha%20cl%C3%ADnica.%20Pode%20me%20explicar%20como%20funciona%20a%20implementa%C3%A7%C3%A3o%3F'

const NAV_ITEMS = [
  ['#consultorio', 'Consultorio'],
  ['#atendente', 'Atendente'],
  ['#precos', 'Precos'],
]

const HERO_PROMISES = [
  '14 dias gratis no Consultorio',
  'Implementacao sob consulta',
  'Sem fidelidade',
]

const SHOWCASE_SUMMARY = [
  {
    label: 'Consultorio',
    title: 'Prontuario, agenda e documentos com cara de clinica organizada.',
  },
  {
    label: 'Atendente',
    title: 'Confirmacoes, reativacao e WhatsApp trabalhando no mesmo fluxo.',
  },
]

const OPERATION_PILLARS = [
  {
    title: 'Dentro da clinica',
    eyebrow: 'Meu Consultorio',
    description: 'Prontuario, agenda, orcamentos e documentos em uma rotina mais limpa e rapida.',
    bullets: ['Prontuario com odontograma', 'PDFs profissionais', 'Agenda integrada ao Google Calendar'],
  },
  {
    title: 'Fora da clinica',
    eyebrow: 'SorrIA Atendente',
    description: 'WhatsApp ativo 24h para responder, confirmar, lembrar e reativar pacientes automaticamente.',
    bullets: ['Agendamento automatico', 'Confirmacoes e lembretes', 'Persona configurada para sua clinica'],
  },
]

const CONSULTORIO_FEATURES = [
  {
    title: 'Prontuario com odontograma',
    description: 'Historico clinico centralizado com anamnese, evolucao de atendimento e mapa dentario interativo.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8" />
        <path d="M8 17h6" />
      </svg>
    ),
  },
  {
    title: 'Orcamentos que parecem de clinica grande',
    description: 'Monte propostas com procedimentos, parcelamento e desconto PIX em PDF pronto para enviar.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2.5" y="5" width="19" height="14" rx="2" />
        <path d="M2.5 10h19" />
        <path d="M7 15h3" />
        <path d="M14 15h3" />
      </svg>
    ),
  },
  {
    title: 'Receituario, atestado e exames',
    description: 'Documentos clinicos em um fluxo muito mais rapido, com cabecalho da clinica e menos retrabalho.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 11l3 3 8-8" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    title: 'Agenda integrada de verdade',
    description: 'Visualize consultas, confirmacoes e sincronizacao com Google Calendar sem depender de planilhas.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <path d="M3 10h18" />
      </svg>
    ),
  },
  {
    title: 'WhatsApp direto do sistema',
    description: 'Abra a conversa com o paciente a partir do prontuario ou dos orcamentos em analise com um clique.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    title: 'Ecossistema pronto para crescer',
    description: 'A SorrIA conecta atendimento externo e gestao interna para a clinica operar com mais previsibilidade.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m13 2-9 12h7l-1 8 10-12h-7l0-8Z" />
      </svg>
    ),
  },
]

const ATENDENTE_FEATURES = [
  'Persona configurada para sua clinica',
  'Atendimento 24h pelo WhatsApp',
  'Agendamento e confirmacao automatica',
  'Lembretes antes da consulta',
  'Reativacao de pacientes inativos',
  'Relatorios e acompanhamento de atendimento',
]

const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Paciente chama no WhatsApp',
    description: 'A SorrIA responde em segundos, apresenta a clinica e conduz o atendimento inicial.',
  },
  {
    step: '02',
    title: 'Agenda e confirma automaticamente',
    description: 'A consulta entra no fluxo certo, com menos faltas e menos dependencia de recepcao humana.',
  },
  {
    step: '03',
    title: 'Clinica opera com tudo sincronizado',
    description: 'No Consultorio, voce continua o atendimento com historico, orcamento e documentos em ordem.',
  },
]

const TESTIMONIALS = [
  {
    name: 'Dra. Fernanda Lima',
    product: 'Atendente',
    text: 'A SorrIA comecou a responder pacientes no WhatsApp no mesmo dia da implementacao. Agendou consultas enquanto eu estava atendendo.',
  },
  {
    name: 'Dr. Ricardo Souza',
    product: 'Atendente',
    text: 'Minha recepcionista entrou de ferias e a clinica nao parou. Nenhum paciente ficou sem resposta.',
  },
  {
    name: 'Dra. Patricia Nunes',
    product: 'Consultorio Pro',
    text: 'Hoje gero receita, atestado e orcamento em poucos minutos. A percepcao profissional da clinica mudou muito.',
  },
]

function Navbar({ onLogin }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`lp-nav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="lp-container lp-nav-inner">
        <a href="#topo" className="lp-nav-brand" aria-label="SorrIA">
          <img src="/assets/logo.png" alt="SorrIA" />
        </a>

        <div className="lp-nav-links">
          {NAV_ITEMS.map(([href, label]) => (
            <a key={label} href={href} className="lp-nav-link">
              {label}
            </a>
          ))}
        </div>

        <div className="lp-nav-actions">
          <button type="button" className="lp-button lp-button--ghost" onClick={onLogin}>
            Entrar
          </button>
          <button type="button" className="lp-button lp-button--primary" onClick={onLogin}>
            Comecar gratis
          </button>
        </div>
      </div>
    </nav>
  )
}

function Hero({ onLogin }) {
  return (
    <section className="lp-hero" id="topo">
      <div className="lp-container lp-hero-grid">
        <div className="lp-hero-copy">
          <span className="lp-hero-badge">O ecossistema odontologico completo</span>
          <h1>
            Dentro e fora da clinica,{' '}
            <span className="lp-brand-word">
              <span className="lp-brand-sorr">a Sorr</span>
              <span className="lp-brand-ia">IA</span>
            </span>{' '}
            cuida de tudo
          </h1>
          <p className="lp-hero-text">
            Gestao interna completa + atendimento 24h pelo WhatsApp. Dois produtos integrados, uma clinica que
            funciona com mais previsibilidade, mais velocidade e menos improviso.
          </p>

          <div className="lp-hero-actions">
            <button type="button" className="lp-button lp-button--primary" onClick={onLogin}>
              Comecar gratis
            </button>
            <a className="lp-button lp-button--secondary" href={WA_ATENDENTE} target="_blank" rel="noreferrer">
              Quero a Atendente
            </a>
          </div>

          <div className="lp-hero-proof-row">
            {HERO_PROMISES.map((item) => (
              <span key={item} className="lp-proof-pill">
                {item}
              </span>
            ))}
          </div>

        </div>

        <div className="lp-hero-visual">
          <div className="lp-hero-chat-card">
            <span>SorrIA diz:</span>
            <strong>"Confirmei 3 consultas e gerei o orcamento enquanto voce atendia."</strong>
          </div>

          <div className="lp-hero-avatar-shell">
            <img src="/assets/sorria-avatar.jpg" alt="SorrIA em atendimento" />
            <div className="lp-hero-avatar-footer">
              <i />
              <span>SorrIA - Online agora</span>
            </div>
          </div>

          <div className="lp-hero-impact-card">
            <strong>-70%</strong>
            <span>de faltas na clinica</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function ShowcaseSection() {
  return (
    <section className="lp-section lp-section--showcase">
      <div className="lp-container lp-showcase-layout">
        <div className="lp-showcase-copy">
          <span className="lp-section-kicker">Painel da clinica</span>
          <h2>Gestao e atendimento no mesmo ecossistema, sem perder a cara humana da SorrIA.</h2>
          <p>
            O painel entra como reforco da proposta: mais organizacao, mais clareza e uma operacao que conecta
            consultorio, agenda, documentos e WhatsApp no mesmo fluxo.
          </p>

          <div className="lp-showcase-notes">
            {SHOWCASE_SUMMARY.map((item) => (
              <article key={item.label} className="lp-showcase-note">
                <span>{item.label}</span>
                <strong>{item.title}</strong>
              </article>
            ))}
          </div>
        </div>

        <div className="lp-showcase-panel">
          <div className="lp-app-preview">
            <div className="lp-app-preview-top">
              <div>
                <span className="lp-app-chip">Painel da clinica</span>
                <h2>Operacao centralizada</h2>
              </div>
              <span className="lp-app-status">Online</span>
            </div>

            <div className="lp-app-preview-grid">
              <article>
                <span>Pacientes ativos</span>
                <strong>128</strong>
              </article>
              <article>
                <span>Orcamentos em analise</span>
                <strong>7</strong>
              </article>
              <article>
                <span>Consultas confirmadas</span>
                <strong>19</strong>
              </article>
            </div>

            <div className="lp-app-preview-panels">
              <div className="lp-preview-card">
                <span className="lp-preview-kicker">Agenda de hoje</span>
                <ul>
                  <li>09:30 Clareamento - confirmado</li>
                  <li>11:00 Avaliacao - lembrete enviado</li>
                  <li>15:40 Revisao - em andamento</li>
                </ul>
              </div>
              <div className="lp-preview-card">
                <span className="lp-preview-kicker">SorrIA Atendente</span>
                <ul>
                  <li>3 consultas confirmadas enquanto voce atendia</li>
                  <li>2 pacientes reativados no WhatsApp</li>
                  <li>1 orcamento encaminhado para fechamento</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function EcosystemSection() {
  return (
    <section className="lp-section lp-section--soft">
      <div className="lp-container">
        <div className="lp-section-heading">
          <span className="lp-section-kicker">Uma proposta clara</span>
          <h2>Dois produtos, uma experiencia de clinica muito mais madura.</h2>
          <p>
            A SorrIA nao vende so "mais uma IA" ou "mais um sistema". Ela organiza o que acontece dentro e fora da clinica.
          </p>
        </div>

        <div className="lp-pillars-grid">
          {OPERATION_PILLARS.map((pillar) => (
            <article key={pillar.title} className="lp-pillar-card">
              <span className="lp-pillars-eyebrow">{pillar.eyebrow}</span>
              <h3>{pillar.title}</h3>
              <p>{pillar.description}</p>
              <ul>
                {pillar.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ feature }) {
  return (
    <article className="lp-feature-card">
      <div className="lp-feature-icon">{feature.icon}</div>
      <h3>{feature.title}</h3>
      <p>{feature.description}</p>
    </article>
  )
}

function ConsultorioSection() {
  return (
    <section className="lp-section" id="consultorio">
      <div className="lp-container">
        <div className="lp-section-heading">
          <span className="lp-section-kicker">Meu Consultorio</span>
          <h2>O sistema interno precisa parecer uma extensao da sua rotina, nao um obstaculo.</h2>
          <p>
            A interface foi pensada para dentistas que precisam de velocidade, clareza e apresentacao profissional sem excesso de complexidade.
          </p>
        </div>

        <div className="lp-features-grid">
          {CONSULTORIO_FEATURES.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  )
}

function AtendenteSection() {
  return (
    <section className="lp-section lp-section--dark" id="atendente">
      <div className="lp-container lp-atendente-layout">
        <div className="lp-atendente-copy">
          <span className="lp-section-kicker lp-section-kicker--dark">SorrIA Atendente</span>
          <h2>Sua recepcao virtual trabalha enquanto voce foca em atendimento clinico.</h2>
          <p>
            Ela responde, confirma, relembra, reage a objecoes e ajuda a recuperar pacientes sem deixar sua operacao depender de horario comercial.
          </p>

          <div className="lp-atendente-cta">
            <a className="lp-button lp-button--primary-bright" href={WA_ATENDENTE} target="_blank" rel="noreferrer">
              Falar sobre implementacao
            </a>
          </div>
        </div>

        <div className="lp-atendente-panel">
          <div className="lp-atendente-panel-top">
            <span>Fluxo de atendimento</span>
            <strong>24 horas por dia</strong>
          </div>
          <ul className="lp-atendente-list">
            {ATENDENTE_FEATURES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function WorkflowSection() {
  return (
    <section className="lp-section lp-section--workflow">
      <div className="lp-container">
        <div className="lp-section-heading">
          <span className="lp-section-kicker">Como funciona</span>
          <h2>Um fluxo mais limpo, do primeiro contato ao atendimento na cadeira.</h2>
        </div>

        <div className="lp-workflow-grid">
          {WORKFLOW_STEPS.map((step) => (
            <article key={step.step} className="lp-workflow-card">
              <span className="lp-workflow-step">{step.step}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingSection({ onLogin }) {
  const [periodo, setPeriodo] = useState('anual')
  const anual = periodo === 'anual'

  const precoMensal = 87
  const precoAnualTotal = 870
  const precoAnualMes = Math.round(precoAnualTotal / 12)
  const economia = precoMensal * 12 - precoAnualTotal

  const bundleMensal = 247
  const bundleAnualTotal = 2470
  const bundleAnualMes = Math.round(bundleAnualTotal / 12)
  const bundleEconomia = bundleMensal * 12 - bundleAnualTotal

  const plans = [
    {
      id: 'consultorio',
      label: 'Gestao interna',
      title: 'Meu Consultorio',
      description: 'Organize a clinica por completo com a rotina interna em um painel so.',
      cta: 'Comecar teste gratis',
      ctaAction: 'login',
      trial: '14 dias gratis, sem cartao',
      notes: ['Prontuario + odontograma FDI', 'Orcamentos em PDF', 'Receituario e atestados', 'Agenda Google Calendar', 'Pacientes ilimitados no Pro'],
    },
    {
      id: 'bundle',
      label: 'Mais completo',
      title: 'Clinica Conectada',
      description: 'Consultorio + Atendente integrados no mesmo ecossistema.',
      cta: 'Quero a Clinica Conectada',
      ctaAction: 'whatsapp',
      trial: 'Fale com um especialista',
      highlight: true,
      notes: ['Tudo do Consultorio Pro', 'SorrIA Atendente configurada', 'Agenda sincronizada bidirecional', 'Acompanhamento de implementacao', 'Fluxo comercial e operacional conectados'],
    },
    {
      id: 'atendente',
      label: 'Atendimento externo',
      title: 'SorrIA Atendente',
      description: 'WhatsApp 24h para sua clinica com configuracao personalizada.',
      customPrice: 'A partir de R$ 197/mes',
      detail: '+ taxa de implementacao (consulte)',
      badge: 'Solicite uma demonstracao',
      cta: 'Solicitar implementacao',
      ctaAction: 'whatsapp',
      notes: ['Persona personalizada para a clinica', 'Agendamento automatico no WhatsApp', 'Lembretes de consulta', 'Reativacao de pacientes inativos', 'Relatorios de atendimento'],
    },
  ]

  function handleCta(action) {
    if (action === 'login') {
      onLogin()
      return
    }

    window.open(WA_ATENDENTE, '_blank', 'noopener,noreferrer')
  }

  return (
    <section className="lp-section lp-section--pricing" id="precos">
      <div className="lp-container">
        <div className="lp-section-heading">
          <span className="lp-section-kicker">Precos</span>
          <h2>Escolha como a SorrIA vai trabalhar com voce.</h2>
          <p>
            Comece pela gestao, adicione o atendimento, ou assine o ecossistema completo de uma vez.
          </p>
        </div>

        <div className="lp-pricing-toggle">
          <button
            type="button"
            className={!anual ? 'is-active' : ''}
            onClick={() => setPeriodo('mensal')}
          >
            Mensal
          </button>
          <button
            type="button"
            className={anual ? 'is-active' : ''}
            onClick={() => setPeriodo('anual')}
          >
            Anual
            <span className="lp-pricing-discount-tag">Economize 17%</span>
          </button>
        </div>

        <div className="lp-pricing-grid">
          {plans.map((plan) => (
            <article key={plan.id} className={`lp-pricing-card ${plan.highlight ? 'is-highlight' : ''}`}>
              <span className="lp-pricing-label">{plan.label}</span>
              <h3>{plan.title}</h3>
              <p className="lp-pricing-description">{plan.description}</p>

              <div className="lp-pricing-price-block">
                {plan.id === 'consultorio' ? (
                  <>
                    <div className="lp-pricing-price-line">
                      <span>R$</span>
                      <strong>{anual ? precoAnualMes : precoMensal}</strong>
                      <em>/mes</em>
                    </div>
                    <p>{anual ? `cobrado anualmente - R$ ${precoAnualTotal}/ano` : 'cobrado mensalmente'}</p>
                    {anual && <span className="lp-pricing-badge">Economize R$ {economia}/ano</span>}
                  </>
                ) : plan.id === 'bundle' ? (
                  <>
                    <div className="lp-pricing-price-line">
                      <span>R$</span>
                      <strong>{anual ? bundleAnualMes : bundleMensal}</strong>
                      <em>/mes</em>
                    </div>
                    <p>{anual ? `cobrado anualmente - R$ ${bundleAnualTotal}/ano` : 'Consultorio + Atendente com integracao nativa'}</p>
                    {anual ? (
                      <div className="lp-pricing-badge-stack">
                        <span className="lp-pricing-badge">Economize R$ {bundleEconomia}/ano</span>
                        <span className="lp-pricing-badge lp-pricing-badge--gift">Bonus de implementacao para clinica integrada</span>
                      </div>
                    ) : (
                      <span className="lp-pricing-badge lp-pricing-badge--muted">+ taxa de implementacao (consulte)</span>
                    )}
                  </>
                ) : plan.customPrice ? (
                  <strong className="lp-pricing-custom">{plan.customPrice}</strong>
                ) : (
                  <div className="lp-pricing-price-line">
                    <span>R$</span>
                    <strong>{plan.price}</strong>
                    <em>{plan.suffix}</em>
                  </div>
                )}
                {plan.id === 'atendente' && (
                  <>
                    <p>{plan.detail}</p>
                    <span className="lp-pricing-badge">{plan.badge}</span>
                  </>
                )}
              </div>

              <ul className="lp-pricing-list">
                {plan.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>

              <button
                type="button"
                className={`lp-button ${
                  plan.highlight ? 'lp-button--primary-bright' : plan.id === 'atendente' ? 'lp-button--whatsapp' : 'lp-button--primary'
                }`}
                onClick={() => handleCta(plan.ctaAction)}
              >
                {plan.cta}
              </button>
            </article>
          ))}
        </div>

        <p className="lp-pricing-footnote">
          Concorrentes cobram mais pela parte interna. Aqui a proposta e organizar o ecossistema inteiro da clinica.
        </p>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  return (
    <section className="lp-section lp-section--testimonials">
      <div className="lp-container">
        <div className="lp-section-heading lp-section-heading--centered">
          <span className="lp-section-kicker lp-section-kicker--dark">Depoimentos</span>
          <h2>Relatos de quem quer operar melhor e atender com menos caos.</h2>
        </div>

        <div className="lp-testimonials-grid">
          {TESTIMONIALS.map((item) => (
            <article key={item.name} className="lp-testimonial-card">
              <span className="lp-testimonial-product">{item.product}</span>
              <p>{item.text}</p>
              <strong>{item.name}</strong>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="lp-footer">
      <div className="lp-container lp-footer-inner">
        <div className="lp-footer-brand">
          <img src="/assets/logo.png" alt="SorrIA" />
          <p>Ecossistema odontologico inteligente para clinicas que querem operar com mais clareza.</p>
        </div>

        <div className="lp-footer-links">
          <div>
            <span>Produtos</span>
            <a href="#consultorio">Meu Consultorio</a>
            <a href="#atendente">SorrIA Atendente</a>
          </div>
          <div>
            <span>Contato</span>
            <a href={WA_ATENDENTE} target="_blank" rel="noreferrer">WhatsApp (37) 99972-2971</a>
            <a href="https://www.consultoriosorria.com.br" target="_blank" rel="noreferrer">consultoriosorria.com.br</a>
          </div>
        </div>
      </div>
      <div className="lp-footer-bottom">
        © {new Date().getFullYear()} SorrIA - Divinopolis, MG - Todos os direitos reservados.
      </div>
    </footer>
  )
}

function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Ola! Sou a SorrIA. Posso te ajudar a entender como o ecossistema pode transformar a sua clinica.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pulse, setPulse] = useState(true)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!open) {
      return
    }

    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    setTimeout(() => inputRef.current?.focus(), 150)
    setPulse(false)
  }, [open, messages])

  async function send() {
    const text = input.trim()
    if (!text || loading) {
      return
    }

    const userMessage = { role: 'user', content: text }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      })

      const data = await response.json()
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: data.reply || 'Desculpe, tente novamente em instantes.',
        },
      ])
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: 'Tive um problema de conexao. Se preferir, me chame direto no WhatsApp: (37) 99972-2971.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="lp-chat-widget">
      {!open && (
        <div className="lp-chat-launcher-wrap">
          {pulse && <span className="lp-chat-pulse" aria-hidden="true" />}
          <button type="button" className="lp-chat-launcher" title="Fale com a SorrIA" onClick={() => setOpen(true)}>
            <img src="/assets/sorria-polo.png" alt="Abrir chat da SorrIA" />
          </button>
        </div>
      )}

      {open && (
        <div className="lp-chat-panel">
          <div className="lp-chat-header">
            <div className="lp-chat-avatar">
              <img src="/assets/sorria-polo.png" alt="SorrIA" />
            </div>
            <div className="lp-chat-header-copy">
              <strong>SorrIA</strong>
              <span>Online agora</span>
            </div>
            <button type="button" className="lp-chat-close" onClick={() => setOpen(false)}>
              x
            </button>
          </div>

          <div className="lp-chat-messages">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`lp-chat-row ${message.role === 'user' ? 'is-user' : ''}`}
              >
                {message.role === 'assistant' && (
                  <div className="lp-chat-row-avatar">
                    <img src="/assets/sorria-polo.png" alt="SorrIA" />
                  </div>
                )}
                <div className={`lp-chat-bubble ${message.role === 'user' ? 'is-user' : ''}`}>
                  {message.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="lp-chat-row">
                <div className="lp-chat-row-avatar">
                  <img src="/assets/sorria-polo.png" alt="SorrIA" />
                </div>
                <div className="lp-chat-bubble">
                  <span className="lp-chat-loading">
                    <i />
                    <i />
                    <i />
                  </span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="lp-chat-input-row">
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  send()
                }
              }}
              placeholder="Escreva sua duvida..."
              disabled={loading}
            />
            <button type="button" className="lp-chat-send" onClick={send} disabled={loading || !input.trim()}>
              Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()

  function goToLogin() {
    navigate('/login')
  }

  return (
    <div className="lp-page-shell">
      <Navbar onLogin={goToLogin} />
      <Hero onLogin={goToLogin} />
      <ShowcaseSection />
      <EcosystemSection />
      <ConsultorioSection />
      <AtendenteSection />
      <WorkflowSection />
      <PricingSection onLogin={goToLogin} />
      <TestimonialsSection />
      <Footer />
      <ChatWidget />
    </div>
  )
}
