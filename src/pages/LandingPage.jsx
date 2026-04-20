import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

const C = {
  primary: '#1a8a7b',
  dark: '#136b5e',
  darker: '#0d4f46',
  bright: '#00d4aa',
  light: '#f0fdf9',
  navy: '#0a1628',
  navyMid: '#1a2e2b',
}

const WA_ATENDENTE = 'https://wa.me/5537999722971?text=Olá!%20Tenho%20interesse%20na%20SorrIA%20Atendente%20Virtual%20para%20minha%20clínica.%20Pode%20me%20explicar%20como%20funciona%20a%20implementação%3F'

// ── Navbar ─────────────────────────────────────────────────────────────────────
function Navbar({ onLogin }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(255,255,255,0.97)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,.08)' : 'none',
      transition: 'all .3s',
      padding: '0 5%', height: 68,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <img src="/assets/logo.png" alt="SorrIA" style={{ height: 52, objectFit: 'contain' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        {[['#ecossistema', 'Ecossistema'], ['#consultorio', 'Consultório'], ['#atendente', 'Atendente'], ['#precos', 'Preços']].map(([href, label]) => (
          <a key={label} href={href} style={{
            fontSize: 14, fontWeight: 500, color: '#374151',
            textDecoration: 'none', transition: 'color .2s',
          }}
            onMouseEnter={e => e.target.style.color = C.primary}
            onMouseLeave={e => e.target.style.color = '#374151'}
          >{label}</a>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onLogin} style={{
          padding: '8px 20px', borderRadius: 8, border: 'none',
          background: 'transparent', color: '#374151', fontWeight: 600, fontSize: 14, cursor: 'pointer',
        }}>Entrar</button>
        <button onClick={onLogin} style={{
          padding: '9px 22px', borderRadius: 9, border: 'none',
          background: `linear-gradient(135deg, ${C.primary}, ${C.dark})`,
          color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(26,138,123,.35)', transition: 'transform .15s, box-shadow .15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(26,138,123,.45)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(26,138,123,.35)' }}
        >Começar grátis →</button>
      </div>
    </nav>
  )
}

// ── Hero ───────────────────────────────────────────────────────────────────────
function Hero({ onLogin }) {
  return (
    <section style={{
      minHeight: '100vh',
      background: `linear-gradient(160deg, #ffffff 0%, #f0fdf9 50%, #e6f7f4 100%)`,
      display: 'flex', alignItems: 'center',
      padding: '100px 5% 60px', gap: 60,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -120, right: -120, width: 500, height: 500, borderRadius: '50%', background: 'rgba(26,138,123,.06)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -80, left: -80, width: 350, height: 350, borderRadius: '50%', background: 'rgba(26,138,123,.04)', pointerEvents: 'none' }} />

      {/* Texto */}
      <div style={{ flex: 1, maxWidth: 560, position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(26,138,123,.1)', borderRadius: 99,
          padding: '6px 16px', marginBottom: 24,
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.primary }}>✨ O ecossistema odontológico completo</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900,
          color: C.navy, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.02em',
        }}>
          Dentro e fora da clínica,{' '}
          <span style={{ color: C.primary }}>a SorrIA cuida de tudo</span>
        </h1>

        <p style={{ fontSize: 17, color: '#4b5563', lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}>
          Gestão interna completa + atendimento 24h pelo WhatsApp. Dois produtos integrados, uma clínica que funciona sozinha.
        </p>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 40 }}>
          <button onClick={onLogin} style={{
            padding: '14px 32px', borderRadius: 12, border: 'none',
            background: `linear-gradient(135deg, ${C.primary}, ${C.dark})`,
            color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(26,138,123,.4)', transition: 'transform .15s, box-shadow .15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(26,138,123,.5)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(26,138,123,.4)' }}
          >Começar grátis →</button>
          <a href={WA_ATENDENTE} target="_blank" rel="noopener noreferrer" style={{
            padding: '14px 28px', borderRadius: 12,
            border: '2px solid #e5e7eb', background: '#fff',
            color: '#374151', fontWeight: 600, fontSize: 15, cursor: 'pointer',
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            💬 Quero a Atendente
          </a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          {['✅ 14 dias grátis no Consultório', '✅ Implementação sob consulta', '✅ Sem fidelidade'].map(t => (
            <span key={t} style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Avatar */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', position: 'relative', zIndex: 1, minHeight: 520 }}>
        <div style={{
          position: 'absolute', top: 20, left: 0,
          background: '#fff', borderRadius: 16, padding: '14px 18px',
          boxShadow: '0 8px 30px rgba(0,0,0,.12)', maxWidth: 240, zIndex: 3,
          animation: 'float 3s ease-in-out infinite',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 4 }}>💬 SorrIA diz:</div>
          <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.5, margin: 0 }}>
            "Confirmei 3 consultas e gerei o orçamento enquanto você atendia. 😊"
          </p>
        </div>

        <div style={{
          position: 'absolute', bottom: 60, right: -10,
          background: C.primary, borderRadius: 16, padding: '12px 18px',
          boxShadow: '0 8px 24px rgba(26,138,123,.4)', zIndex: 3,
        }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>-70%</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.85)', fontWeight: 500 }}>de faltas na clínica</div>
        </div>

        <div style={{
          width: 380, height: 480, borderRadius: '24px 24px 0 0',
          overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,.18)',
          position: 'relative', border: '4px solid rgba(255,255,255,.8)',
        }}>
          <img src="/assets/sorria-avatar.jpg" alt="SorrIA — Assistente Virtual"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(transparent, rgba(26,46,43,.6))' }} />
          <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80' }} />
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>SorrIA • Online agora</span>
          </div>
        </div>
      </div>

      <style>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }`}</style>
    </section>
  )
}

// ── Ecossistema Visual ─────────────────────────────────────────────────────────
function Ecossistema() {
  const items = {
    consultorio: ['Prontuário + Odontograma', 'Orçamentos em PDF', 'Receituário e Atestados', 'Agenda Google Calendar', 'Exames e Documentos'],
    atendente:   ['WhatsApp 24h automático', 'Agendamentos pelo chat', 'Lembretes de consulta', 'Reativação de pacientes', 'Perguntas frequentes'],
  }

  return (
    <section id="ecossistema" style={{
      padding: '90px 5%',
      background: `linear-gradient(160deg, ${C.navy} 0%, ${C.navyMid} 100%)`,
    }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.bright, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>
          ECOSSISTEMA
        </div>
        <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 14 }}>
          Dois produtos. Uma clínica que funciona sozinha.
        </h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,.55)', maxWidth: 520, margin: '0 auto' }}>
          O Consultório gerencia o que acontece dentro. A Atendente gerencia o que acontece fora. Juntos, formam um ciclo completo.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, maxWidth: 900, margin: '0 auto', flexWrap: 'wrap' }}>

        {/* Consultório */}
        <div style={{
          flex: 1, minWidth: 260,
          background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
          borderRadius: '20px 0 0 20px', padding: '32px 28px',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.bright, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>DENTRO DA CLÍNICA</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 20 }}>Meu Consultório SorrIA</div>
          {items.consultorio.map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ color: C.bright, fontSize: 14, flexShrink: 0 }}>✓</span>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,.75)' }}>{f}</span>
            </div>
          ))}
        </div>

        {/* Conector */}
        <div style={{
          width: 80, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: `linear-gradient(180deg, rgba(0,212,170,.08) 0%, rgba(0,212,170,.15) 50%, rgba(0,212,170,.08) 100%)`,
          borderTop: '1px solid rgba(0,212,170,.2)', borderBottom: '1px solid rgba(0,212,170,.2)',
          padding: '20px 8px', gap: 8,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.bright, textAlign: 'center', letterSpacing: '.04em', textTransform: 'uppercase', lineHeight: 1.4 }}>SINCRONIZADOS</div>
          <div style={{ color: C.bright, fontSize: 22 }}>⇅</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.bright, textAlign: 'center', letterSpacing: '.04em', textTransform: 'uppercase', lineHeight: 1.4 }}>EM TEMPO REAL</div>
        </div>

        {/* Atendente */}
        <div style={{
          flex: 1, minWidth: 260,
          background: 'rgba(0,212,170,.06)', border: '1px solid rgba(0,212,170,.2)',
          borderRadius: '0 20px 20px 0', padding: '32px 28px',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.bright, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>FORA DA CLÍNICA</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 20 }}>SorrIA Atendente Virtual</div>
          {items.atendente.map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ color: C.bright, fontSize: 14, flexShrink: 0 }}>✓</span>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,.75)' }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Fluxo de integração */}
      <div style={{ maxWidth: 800, margin: '48px auto 0', display: 'flex', gap: 0, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { emoji: '💬', text: 'Paciente agenda pelo WhatsApp' },
          { emoji: '→', text: null },
          { emoji: '📋', text: 'Aparece no Consultório automaticamente' },
          { emoji: '→', text: null },
          { emoji: '🦷', text: 'Dentista atende com prontuário aberto' },
          { emoji: '→', text: null },
          { emoji: '📲', text: 'SorrIA envia retorno e follow-up' },
        ].map((item, i) => item.text ? (
          <div key={i} style={{
            background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
            borderRadius: 12, padding: '12px 16px', textAlign: 'center', minWidth: 150,
          }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{item.emoji}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', lineHeight: 1.4 }}>{item.text}</div>
          </div>
        ) : (
          <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '0 6px', color: 'rgba(255,255,255,.25)', fontSize: 20 }}>→</div>
        ))}
      </div>
    </section>
  )
}

// ── Produtos ───────────────────────────────────────────────────────────────────
function Produtos({ onLogin }) {
  const produtos = [
    {
      id: 'consultorio',
      badge: 'GESTÃO INTERNA',
      nome: 'Meu Consultório',
      tagline: 'Organize sua clínica por completo',
      preco: 'R$ 87/mês',
      detalhe: 'ou R$ 870/ano — equivale a R$ 72/mês',
      trial: '14 dias grátis, sem cartão',
      cta: 'Começar teste grátis',
      ctaAction: 'login',
      cor: C.primary,
      features: ['Prontuário + Odontograma FDI', 'Orçamentos em PDF', 'Receituário e Atestados', 'Agenda Google Calendar', 'Pacientes ilimitados (Pro)'],
      destaque: false,
    },
    {
      id: 'bundle',
      badge: '⭐ MAIS COMPLETO',
      nome: 'Clínica Conectada',
      tagline: 'Consultório + Atendente integrados',
      preco: 'R$ 247/mês',
      detalhe: 'Consultório + Atendente com integração nativa',
      trial: 'Fale com um especialista',
      cta: 'Quero a Clínica Conectada',
      ctaAction: 'bundle',
      cor: C.bright,
      features: ['Tudo do Consultório Pro', 'SorrIA Atendente configurada', 'Agenda sincronizada bidirecional', 'Orçamento aprovado → WhatsApp auto', 'Suporte dedicado na implementação'],
      destaque: true,
    },
    {
      id: 'atendente',
      badge: 'ATENDIMENTO EXTERNO',
      nome: 'SorrIA Atendente',
      tagline: 'WhatsApp 24h para sua clínica',
      preco: 'A partir de R$ 197/mês',
      detalhe: '+ taxa de implementação (consulte)',
      trial: 'Solicite uma demonstração',
      cta: 'Solicitar implementação',
      ctaAction: 'whatsapp',
      cor: '#25d366',
      features: ['Persona personalizada para sua clínica', 'Agendamento automático pelo WhatsApp', 'Lembretes de consulta automáticos', 'Reativação de pacientes inativos', 'Relatórios de atendimento mensais'],
      destaque: false,
    },
  ]

  function handleCta(action) {
    if (action === 'login') window.location.href = '/login'
    else if (action === 'whatsapp' || action === 'bundle') window.open(WA_ATENDENTE, '_blank')
  }

  return (
    <section id="consultorio" style={{ padding: '90px 5%', background: '#fff' }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>
          PRODUTOS
        </div>
        <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, color: C.navy, letterSpacing: '-0.02em', marginBottom: 14 }}>
          Escolha como a SorrIA vai trabalhar com você
        </h2>
        <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 500, margin: '0 auto' }}>
          Comece pela gestão, adicione o atendimento, ou assine o ecossistema completo de uma vez.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 1100, margin: '0 auto', alignItems: 'stretch' }}>
        {produtos.map(p => (
          <div key={p.id} style={{
            flex: 1, minWidth: 280, maxWidth: 340,
            borderRadius: 20, padding: '32px 28px',
            background: p.destaque ? `linear-gradient(160deg, ${C.navy} 0%, ${C.navyMid} 100%)` : '#fff',
            border: p.destaque ? 'none' : '1.5px solid #e5e7eb',
            boxShadow: p.destaque ? '0 20px 60px rgba(10,22,40,.35)' : '0 4px 20px rgba(0,0,0,.05)',
            position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            transform: p.destaque ? 'scale(1.03)' : 'none',
          }}>
            {p.destaque && (
              <div style={{ position: 'absolute', top: -60, right: -60, width: 180, height: 180, borderRadius: '50%', background: 'rgba(0,212,170,.07)', pointerEvents: 'none' }} />
            )}

            <div style={{
              display: 'inline-flex', alignItems: 'center',
              background: p.destaque ? 'rgba(0,212,170,.15)' : `${p.cor}15`,
              border: `1px solid ${p.destaque ? 'rgba(0,212,170,.3)' : p.cor + '30'}`,
              borderRadius: 99, padding: '4px 12px', marginBottom: 16, alignSelf: 'flex-start',
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: p.destaque ? C.bright : p.cor }}>{p.badge}</span>
            </div>

            <div style={{ fontSize: 22, fontWeight: 800, color: p.destaque ? '#fff' : C.navy, marginBottom: 6 }}>{p.nome}</div>
            <div style={{ fontSize: 14, color: p.destaque ? 'rgba(255,255,255,.6)' : '#6b7280', marginBottom: 24 }}>{p.tagline}</div>

            <div style={{ fontSize: 28, fontWeight: 900, color: p.destaque ? '#fff' : C.navy, marginBottom: 4 }}>{p.preco}</div>
            <div style={{ fontSize: 12, color: p.destaque ? 'rgba(255,255,255,.45)' : '#9ca3af', marginBottom: 24 }}>{p.detalhe}</div>

            <div style={{ flex: 1, marginBottom: 24 }}>
              {p.features.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                  <span style={{ color: p.destaque ? C.bright : p.cor, fontWeight: 700, flexShrink: 0, fontSize: 13 }}>✓</span>
                  <span style={{ fontSize: 13, color: p.destaque ? 'rgba(255,255,255,.8)' : '#4b5563', lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 12, color: p.destaque ? 'rgba(255,255,255,.4)' : '#9ca3af', marginBottom: 12, textAlign: 'center' }}>
              {p.trial}
            </div>

            <button onClick={() => handleCta(p.ctaAction)} style={{
              width: '100%', padding: '13px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: p.destaque ? `linear-gradient(135deg, ${C.primary}, ${C.bright})` : p.id === 'atendente' ? '#25d366' : C.primary,
              color: '#fff', fontWeight: 700, fontSize: 14,
              boxShadow: p.destaque ? '0 6px 20px rgba(0,212,170,.3)' : 'none',
              transition: 'opacity .15s',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >{p.cta}</button>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Features Consultório ───────────────────────────────────────────────────────
const FeatIcons = {
  prontuario: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>),
  orcamento:  (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>),
  documentos: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>),
  agenda:     (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>),
  ia:         (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>),
  whatsapp:   (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>),
}

const FEATURES_CONSULTORIO = [
  { icon: FeatIcons.prontuario, title: 'Prontuário + Odontograma', desc: 'Histórico completo com odontograma FDI interativo e anamnese digital.' },
  { icon: FeatIcons.orcamento,  title: 'Orçamentos profissionais', desc: 'PDF com 70+ procedimentos, desconto PIX e parcelamento configurável.' },
  { icon: FeatIcons.documentos, title: 'Receituário e Atestados',  desc: 'Documentos com cabeçalho da clínica prontos para impressão.' },
  { icon: FeatIcons.agenda,     title: 'Agenda Google Calendar',   desc: 'Consultas sincronizadas com seu Google Calendar em tempo real.' },
  { icon: FeatIcons.ia,         title: 'SorrIA integrada',         desc: 'A mesma IA que atende fora organiza tudo dentro da clínica.' },
  { icon: FeatIcons.whatsapp,   title: 'WhatsApp com 1 clique',    desc: 'Acesse o WhatsApp do paciente diretamente do prontuário.' },
]

function FeaturesConsultorio() {
  return (
    <section id="consultorio-features" style={{ padding: '90px 5%', background: C.light }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>
          MEU CONSULTÓRIO
        </div>
        <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, color: C.navy, letterSpacing: '-0.02em', marginBottom: 14 }}>
          Tudo que você precisa dentro da clínica
        </h2>
        <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 500, margin: '0 auto' }}>
          Sem as complicações dos concorrentes. Só o essencial, funcionando.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 20, maxWidth: 1100, margin: '0 auto' }}>
        {FEATURES_CONSULTORIO.map((f, i) => (
          <div key={i} style={{
            padding: '26px 22px', borderRadius: 18,
            border: '1.5px solid #e5efec', background: '#fff',
            transition: 'transform .2s, box-shadow .2s, border-color .2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(26,138,123,.1)'; e.currentTarget.style.borderColor = 'rgba(26,138,123,.25)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e5efec' }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 14, marginBottom: 18,
              background: 'linear-gradient(135deg, #d4f5ee 0%, #a8e8d8 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: C.primary, boxShadow: '0 4px 14px rgba(26,138,123,.15)',
            }}>{f.icon}</div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 8 }}>{f.title}</h3>
            <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.65 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Features Atendente ─────────────────────────────────────────────────────────
const AtendenteIcons = {
  whats:   (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>),
  clock:   (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>),
  bell:    (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>),
  users:   (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
  chart:   (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>),
  persona: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>),
}

const FEATURES_ATENDENTE = [
  { icon: AtendenteIcons.persona, title: 'Persona exclusiva da sua clínica', desc: 'A atendente fala com a identidade, o tom e as informações da sua clínica. Não é uma IA genérica.' },
  { icon: AtendenteIcons.clock,   title: 'Atendimento 24h, 7 dias por semana', desc: 'Responde em menos de 5 segundos, mesmo de madrugada. Sua recepção nunca dorme.' },
  { icon: AtendenteIcons.whats,   title: 'Agendamento direto pelo WhatsApp', desc: 'O paciente escolhe data e horário no chat. A consulta aparece direto na sua agenda.' },
  { icon: AtendenteIcons.bell,    title: 'Lembretes automáticos de consulta', desc: 'Reduz até 70% das faltas com lembretes enviados 24h e 1h antes do atendimento.' },
  { icon: AtendenteIcons.users,   title: 'Reativação de pacientes inativos', desc: 'Identifica quem não volta há meses e dispara campanhas personalizadas de retorno.' },
  { icon: AtendenteIcons.chart,   title: 'Relatórios mensais de atendimento', desc: 'Veja quantos pacientes foram atendidos, agendados e convertidos pela IA todo mês.' },
]

function FeaturesAtendente() {
  return (
    <section id="atendente" style={{ padding: '90px 5%', background: '#fff' }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>
          SORRIA ATENDENTE VIRTUAL
        </div>
        <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, color: C.navy, letterSpacing: '-0.02em', marginBottom: 14 }}>
          Sua recepcionista virtual, <span style={{ color: C.primary }}>24 horas por dia</span>
        </h2>
        <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 520, margin: '0 auto' }}>
          Configurada especificamente para a sua clínica, com sua persona, seus horários e seus procedimentos.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 20, maxWidth: 1100, margin: '0 auto 48px' }}>
        {FEATURES_ATENDENTE.map((f, i) => (
          <div key={i} style={{
            padding: '26px 22px', borderRadius: 18,
            border: '1.5px solid #e5efec', background: '#fff',
            transition: 'transform .2s, box-shadow .2s, border-color .2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(37,211,102,.1)'; e.currentTarget.style.borderColor = 'rgba(37,211,102,.3)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e5efec' }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 14, marginBottom: 18,
              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#16a34a', boxShadow: '0 4px 14px rgba(22,163,74,.12)',
            }}>{f.icon}</div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 8 }}>{f.title}</h3>
            <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.65 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA Atendente */}
      <div style={{
        maxWidth: 680, margin: '0 auto', textAlign: 'center',
        background: `linear-gradient(160deg, ${C.navy} 0%, ${C.navyMid} 100%)`,
        borderRadius: 24, padding: '44px 40px',
        boxShadow: '0 20px 60px rgba(10,22,40,.25)',
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.bright, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>
          IMPLEMENTAÇÃO SOB MEDIDA
        </div>
        <h3 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 14, letterSpacing: '-0.02em' }}>
          A SorrIA Atendente não é um produto de prateleira
        </h3>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,.6)', marginBottom: 28, lineHeight: 1.7 }}>
          Cada implementação inclui uma entrevista para configurar a persona, integrar o WhatsApp Business e treinar a IA com os dados reais da sua clínica. Me manda uma mensagem e vamos conversar.
        </p>
        <a href={WA_ATENDENTE} target="_blank" rel="noopener noreferrer" style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '14px 36px', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: '#25d366', color: '#fff', fontWeight: 700, fontSize: 16,
          textDecoration: 'none', boxShadow: '0 6px 20px rgba(37,211,102,.4)',
          transition: 'transform .15s, box-shadow .15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(37,211,102,.5)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,211,102,.4)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
          Solicitar implementação pelo WhatsApp
        </a>
        <div style={{ marginTop: 14, fontSize: 12, color: 'rgba(255,255,255,.35)' }}>
          Resposta em até 24h • Sem compromisso
        </div>
      </div>
    </section>
  )
}

// ── Preços Consultório ─────────────────────────────────────────────────────────
const FEATURES_PRO = [
  'Pacientes ilimitados',
  'Prontuário + Odontograma FDI',
  'Orçamentos em PDF com 70+ procedimentos',
  'Receituário, Atestados e Exames',
  'Agenda Google Calendar',
  'SorrIA assistente integrada',
  'Compartilhamento via WhatsApp',
  'Dados seguros na nuvem (LGPD)',
  'Suporte por e-mail',
]

function Precos({ onLogin }) {
  const [periodo, setPeriodo] = useState('anual')
  const anual = periodo === 'anual'
  const mensal = 87
  const anualTotal = 870
  const anualMes = (anualTotal / 12).toFixed(0)
  const economia = mensal * 12 - anualTotal

  return (
    <section id="precos" style={{ padding: '90px 5%', background: C.light }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>
          PREÇOS — CONSULTÓRIO
        </div>
        <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, color: C.navy, letterSpacing: '-0.02em', marginBottom: 12 }}>
          Um plano. Preço fixo. Sem surpresas.
        </h2>
        <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 480, margin: '0 auto' }}>
          Preço fixo, sem surpresas — sem reajuste após 3 meses como os concorrentes.
        </p>
      </div>

      {/* Toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
        <div style={{
          display: 'inline-flex', background: '#fff', borderRadius: 99, padding: 4,
          border: '1.5px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,.06)',
        }}>
          <button onClick={() => setPeriodo('mensal')} style={{
            padding: '9px 24px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
            background: !anual ? C.primary : 'transparent', color: !anual ? '#fff' : '#6b7280', transition: 'all .2s',
          }}>Mensal</button>
          <button onClick={() => setPeriodo('anual')} style={{
            padding: '9px 24px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 8,
            background: anual ? C.primary : 'transparent', color: anual ? '#fff' : '#6b7280', transition: 'all .2s',
          }}>
            Anual
            <span style={{
              background: anual ? 'rgba(255,255,255,.25)' : '#dcfce7',
              color: anual ? '#fff' : '#16a34a',
              fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
            }}>ECONOMIZE 2 MESES</span>
          </button>
        </div>
      </div>

      {/* Card */}
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{
          background: `linear-gradient(160deg, ${C.navy} 0%, ${C.navyMid} 100%)`,
          borderRadius: 24, padding: '40px 40px 36px',
          boxShadow: '0 20px 60px rgba(10,22,40,.35)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(0,212,170,.06)', pointerEvents: 'none' }} />

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(0,212,170,.15)', border: '1px solid rgba(0,212,170,.3)',
            borderRadius: 99, padding: '5px 14px', marginBottom: 20,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.bright, display: 'inline-block' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: C.bright }}>SorrIA Consultório Pro</span>
          </div>

          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 18, fontWeight: 600, color: 'rgba(255,255,255,.5)', verticalAlign: 'top', lineHeight: '52px' }}>R$</span>
            <span style={{ fontSize: 72, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.03em' }}>
              {anual ? anualMes : mensal}
            </span>
            <span style={{ fontSize: 16, fontWeight: 500, color: 'rgba(255,255,255,.5)', marginLeft: 4 }}>/mês</span>
          </div>

          <div style={{ marginBottom: 4 }}>
            {anual ? (
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,.5)' }}>
                cobrado anualmente — <strong style={{ color: 'rgba(255,255,255,.75)' }}>R$ {anualTotal}/ano</strong>
              </span>
            ) : (
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,.5)' }}>cobrado mensalmente, cancele quando quiser</span>
            )}
          </div>

          {anual && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(74,222,128,.12)', borderRadius: 8,
              padding: '6px 12px', marginBottom: 28, marginTop: 8,
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#4ade80' }}>
                ✓ Você economiza R$ {economia}/ano — 2 meses grátis
              </span>
            </div>
          )}
          {!anual && <div style={{ marginBottom: 28 }} />}

          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,.05)', borderRadius: 10,
            padding: '10px 14px', marginBottom: 28,
          }}>
            <span style={{ fontSize: 16 }}>🔒</span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,.6)' }}>
              Preço fixo, sem surpresas — sem reajuste após 3 meses
            </span>
          </div>

          <button onClick={onLogin} style={{
            width: '100%', padding: '15px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: `linear-gradient(135deg, ${C.primary}, ${C.bright})`,
            color: '#fff', fontWeight: 800, fontSize: 16,
            boxShadow: '0 6px 24px rgba(0,212,170,.35)', transition: 'transform .15s, box-shadow .15s',
            marginBottom: 14,
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(0,212,170,.45)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,212,170,.35)' }}
          >Começar 14 dias grátis →</button>
          <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,.35)' }}>
            Sem cartão de crédito • Cancele quando quiser
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', marginTop: 28, paddingTop: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 14 }}>O QUE ESTÁ INCLUÍDO</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 8px' }}>
              {FEATURES_PRO.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ color: C.bright, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <span style={{ fontSize: 13, color: '#9ca3af' }}>
            Concorrentes cobram{' '}
            <span style={{ textDecoration: 'line-through', color: '#d1d5db' }}>R$ 149–169/mês</span>
            {' '}pelo mesmo.
          </span>
        </div>
      </div>
    </section>
  )
}

// ── Depoimentos ────────────────────────────────────────────────────────────────
const DEPOIMENTOS = [
  { nome: 'Dra. Fernanda Lima', clinica: 'Clínica Odonto Smile · Belo Horizonte', texto: 'A agenda lotou em 3 semanas após ativar a SorrIA. Os pacientes adoram a praticidade de marcar pelo WhatsApp a qualquer hora.', produto: 'Atendente' },
  { nome: 'Dr. Ricardo Souza', clinica: 'OdontoPrime · Divinópolis', texto: 'Reduzi 70% das faltas com os lembretes automáticos. Antes eu perdia consultas toda semana — hoje quase não acontece mais.', produto: 'Atendente' },
  { nome: 'Dra. Patricia Nunes', clinica: 'Studio Dental · Pará de Minas', texto: 'O retorno veio em menos de 1 mês. O sistema de orçamentos em PDF impressiona os pacientes e o Consultório organizou tudo que eu tinha no papel.', produto: 'Clínica Conectada' },
]

function Depoimentos() {
  return (
    <section style={{ padding: '90px 5%', background: C.navy }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.bright, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>
          DEPOIMENTOS
        </div>
        <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
          Dentistas que já usam o ecossistema
        </h2>
      </div>

      <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 1100, margin: '0 auto' }}>
        {DEPOIMENTOS.map((d, i) => (
          <div key={i} style={{
            flex: 1, minWidth: 280, maxWidth: 340,
            background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
            borderRadius: 20, padding: '28px 24px',
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center',
              background: d.produto === 'Atendente' ? 'rgba(37,211,102,.15)' : 'rgba(0,212,170,.15)',
              border: `1px solid ${d.produto === 'Atendente' ? 'rgba(37,211,102,.3)' : 'rgba(0,212,170,.3)'}`,
              borderRadius: 99, padding: '3px 10px', marginBottom: 16,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: d.produto === 'Atendente' ? '#4ade80' : C.bright }}>
                {d.produto}
              </span>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.75)', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>
              "{d.texto}"
            </p>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>{d.nome}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', marginTop: 3 }}>{d.clinica}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: '#060f1c', padding: '48px 5% 32px', color: 'rgba(255,255,255,.5)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20, marginBottom: 32 }}>
        <img src="/assets/logo.png" alt="SorrIA" style={{ height: 38, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Produtos</div>
            {['Meu Consultório', 'SorrIA Atendente', 'Clínica Conectada'].map(p => (
              <div key={p} style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginBottom: 6 }}>{p}</div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Contato</div>
            <div style={{ fontSize: 13, marginBottom: 6 }}>consultoriosorria.com.br</div>
            <a href={WA_ATENDENTE} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#4ade80', textDecoration: 'none' }}>WhatsApp (37) 99972-2971</a>
          </div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: 24, textAlign: 'center', fontSize: 12 }}>
        © {new Date().getFullYear()} SorrIA — Ecossistema Odontológico Inteligente · Divinópolis, MG · Todos os direitos reservados.
      </div>
    </footer>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate()
  function irParaLogin() { navigate('/login') }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <Navbar onLogin={irParaLogin} />
      <Hero onLogin={irParaLogin} />
      <Ecossistema />
      <Produtos onLogin={irParaLogin} />
      <FeaturesConsultorio />
      <FeaturesAtendente />
      <Precos onLogin={irParaLogin} />
      <Depoimentos />
      <Footer />
    </div>
  )
}
