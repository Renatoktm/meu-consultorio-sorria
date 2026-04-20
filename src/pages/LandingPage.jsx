import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

const C = {
  primary: '#1a8a7b',
  dark: '#136b5e',
  darker: '#0d4f46',
  light: '#f0fdf9',
  navy: '#1a2e2b',
}

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
      padding: '0 5%',
      height: 68,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      {/* Logo */}
      <img src="/assets/logo.png" alt="SorrIA" style={{ height: 52, objectFit: 'contain' }} />

      {/* Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        {['Funcionalidades', 'Preços', 'Depoimentos'].map(l => (
          <a key={l} href={`#${l.toLowerCase()}`} style={{
            fontSize: 14, fontWeight: 500, color: '#374151',
            textDecoration: 'none', transition: 'color .2s',
          }}
            onMouseEnter={e => e.target.style.color = C.primary}
            onMouseLeave={e => e.target.style.color = '#374151'}
          >{l}</a>
        ))}
      </div>

      {/* CTAs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onLogin} style={{
          padding: '8px 20px', borderRadius: 8, border: 'none',
          background: 'transparent', color: '#374151', fontWeight: 600,
          fontSize: 14, cursor: 'pointer',
        }}>Entrar</button>
        <button onClick={onLogin} style={{
          padding: '9px 22px', borderRadius: 9, border: 'none',
          background: `linear-gradient(135deg, ${C.primary}, ${C.dark})`,
          color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(26,138,123,.35)',
          transition: 'transform .15s, box-shadow .15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(26,138,123,.45)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(26,138,123,.35)' }}
        >Teste grátis →</button>
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
      padding: '100px 5% 60px',
      gap: 60,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Círculos decorativos de fundo */}
      <div style={{
        position: 'absolute', top: -120, right: -120, width: 500, height: 500,
        borderRadius: '50%', background: 'rgba(26,138,123,.06)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -80, left: -80, width: 350, height: 350,
        borderRadius: '50%', background: 'rgba(26,138,123,.04)', pointerEvents: 'none',
      }} />

      {/* Coluna esquerda — texto */}
      <div style={{ flex: 1, maxWidth: 560, position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(26,138,123,.1)', borderRadius: 99,
          padding: '6px 16px', marginBottom: 24,
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.primary }}>✨ Sistema completo para clínicas odontológicas</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900,
          color: C.navy, lineHeight: 1.1, marginBottom: 24,
          letterSpacing: '-0.02em',
        }}>
          Gestão inteligente para clínicas que querem{' '}
          <span style={{ color: C.primary }}>mais resultados</span>
        </h1>

        <p style={{
          fontSize: 17, color: '#4b5563', lineHeight: 1.7, marginBottom: 36, maxWidth: 480,
        }}>
          Prontuário, orçamentos, receituário, atestado e agenda em um só lugar.
          Menos burocracia, mais tempo para seus pacientes.
        </p>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 40 }}>
          <button onClick={onLogin} style={{
            padding: '14px 32px', borderRadius: 12, border: 'none',
            background: `linear-gradient(135deg, ${C.primary}, ${C.dark})`,
            color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(26,138,123,.4)',
            display: 'flex', alignItems: 'center', gap: 8,
            transition: 'transform .15s, box-shadow .15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(26,138,123,.5)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(26,138,123,.4)' }}
          >
            Começar grátis →
          </button>
          <button onClick={onLogin} style={{
            padding: '14px 28px', borderRadius: 12,
            border: '2px solid #e5e7eb', background: '#fff',
            color: '#374151', fontWeight: 600, fontSize: 15, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            ▶ Ver demonstração
          </button>
        </div>

        {/* Social proof */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          {['✅ Sem cartão de crédito', '✅ 7 dias grátis', '✅ Cancele quando quiser'].map(t => (
            <span key={t} style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Coluna direita — SorrIA */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', position: 'relative', zIndex: 1, minHeight: 520 }}>

        {/* Card de boas-vindas flutuante */}
        <div style={{
          position: 'absolute', top: 20, left: 0,
          background: '#fff', borderRadius: 16,
          padding: '14px 18px', boxShadow: '0 8px 30px rgba(0,0,0,.12)',
          maxWidth: 240, zIndex: 3,
          animation: 'float 3s ease-in-out infinite',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 4 }}>
            💬 SorrIA diz:
          </div>
          <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.5, margin: 0 }}>
            "Olá! Posso organizar sua agenda, confirmar consultas e gerar documentos para você. 😊"
          </p>
        </div>

        {/* Card de estatística flutuante */}
        <div style={{
          position: 'absolute', bottom: 60, right: -10,
          background: C.primary, borderRadius: 16,
          padding: '12px 18px', boxShadow: '0 8px 24px rgba(26,138,123,.4)',
          zIndex: 3,
        }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>98%</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.85)', fontWeight: 500 }}>dentistas satisfeitos</div>
        </div>

        {/* Foto da SorrIA */}
        <div style={{
          width: 380, height: 480,
          borderRadius: '24px 24px 0 0',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,.18)',
          position: 'relative',
          border: '4px solid rgba(255,255,255,.8)',
        }}>
          <img
            src="/assets/sorria-avatar.jpg"
            alt="SorrIA — Assistente Virtual"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
          />
          {/* Gradient overlay bottom */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
            background: 'linear-gradient(transparent, rgba(26,46,43,.6))',
          }} />
          <div style={{
            position: 'absolute', bottom: 16, left: 16, right: 16,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: '#4ade80', boxShadow: '0 0 8px #4ade80',
            }} />
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>SorrIA • Online agora</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </section>
  )
}

// ── SVG Icons para features ────────────────────────────────────────────────────
const FeatIcons = {
  prontuario: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  orcamento: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
    </svg>
  ),
  documentos: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  ),
  agenda: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
    </svg>
  ),
  ia: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
      <circle cx="7.5" cy="14.5" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="16.5" cy="14.5" r="1.5" fill="currentColor" stroke="none"/>
    </svg>
  ),
  whatsapp: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
}

const FEATURES = [
  { icon: FeatIcons.prontuario, title: 'Prontuário + Odontograma', desc: 'Histórico completo do paciente com odontograma interativo FDI e anamnese digital.' },
  { icon: FeatIcons.orcamento,  title: 'Orçamentos profissionais', desc: 'Gere orçamentos em PDF com 70+ procedimentos, desconto PIX e parcelamento.' },
  { icon: FeatIcons.documentos, title: 'Receituário e Atestados',  desc: 'Documentos odontológicos completos com cabeçalho da clínica e PDF para impressão.' },
  { icon: FeatIcons.agenda,     title: 'Agenda integrada',         desc: 'Sincronize consultas com Google Calendar e veja sua agenda direto no sistema.' },
  { icon: FeatIcons.ia,         title: 'SorrIA — IA receptora',   desc: 'Assistente virtual que confirma consultas, responde pacientes e organiza sua rotina.' },
  { icon: FeatIcons.whatsapp,   title: 'WhatsApp integrado',       desc: 'Acesse o WhatsApp do paciente com um clique diretamente do prontuário.' },
]

function Features() {
  return (
    <section id="funcionalidades" style={{ padding: '100px 5%', background: '#fff' }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>
          FUNCIONALIDADES
        </div>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, color: C.navy, marginBottom: 16, letterSpacing: '-0.02em' }}>
          Tudo que sua clínica precisa
        </h2>
        <p style={{ fontSize: 17, color: '#6b7280', maxWidth: 520, margin: '0 auto' }}>
          Um sistema completo e simples — sem as complicações dos concorrentes.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24, maxWidth: 1100, margin: '0 auto' }}>
        {FEATURES.map((f, i) => (
          <div key={i} style={{
            padding: '28px 24px', borderRadius: 18,
            border: '1.5px solid #edf2f0',
            background: '#fff',
            transition: 'transform .2s, box-shadow .2s, border-color .2s',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 16px 40px rgba(26,138,123,.1)'
              e.currentTarget.style.borderColor = 'rgba(26,138,123,.25)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = '#edf2f0'
            }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: 16, marginBottom: 20,
              background: 'linear-gradient(135deg, #d4f5ee 0%, #a8e8d8 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: C.primary,
              boxShadow: '0 4px 14px rgba(26,138,123,.15)',
            }}>{f.icon}</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 8 }}>{f.title}</h3>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.65 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Preços ────────────────────────────────────────────────────────────────────
function Precos({ onLogin }) {
  return (
    <section id="preços" style={{ padding: '100px 5%', background: C.light }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>
          PREÇOS
        </div>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, color: C.navy, letterSpacing: '-0.02em' }}>
          Simples e transparente
        </h2>
      </div>

      <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 800, margin: '0 auto' }}>
        {/* Free */}
        <div style={{
          flex: 1, minWidth: 280, maxWidth: 340,
          background: '#fff', borderRadius: 20, padding: '36px 32px',
          border: '1.5px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,.05)',
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Gratuito</div>
          <div style={{ fontSize: 42, fontWeight: 900, color: C.navy, marginBottom: 4 }}>7 dias</div>
          <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 28 }}>grátis, sem cartão</div>
          {['Acesso completo ao sistema', 'Todos os módulos liberados', 'Geração de PDF', 'Agenda Google Calendar'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ color: C.primary, fontWeight: 700 }}>✓</span>
              <span style={{ fontSize: 14, color: '#4b5563' }}>{f}</span>
            </div>
          ))}
          <button onClick={onLogin} style={{
            width: '100%', marginTop: 28, padding: '12px 0', borderRadius: 10,
            border: '2px solid #e5e7eb', background: '#fff',
            color: '#374151', fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}>Começar teste grátis</button>
        </div>

        {/* Pro */}
        <div style={{
          flex: 1, minWidth: 280, maxWidth: 340,
          background: `linear-gradient(160deg, ${C.navy}, ${C.darker})`,
          borderRadius: 20, padding: '36px 32px',
          boxShadow: '0 12px 40px rgba(26,46,43,.35)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 18, right: 18,
            background: C.primary, color: '#fff',
            fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 99,
          }}>RECOMENDADO</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,.7)', marginBottom: 8 }}>Pro</div>
          <div style={{ fontSize: 42, fontWeight: 900, color: '#fff', marginBottom: 4 }}>R$ 59</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginBottom: 28 }}>por mês</div>
          {['Pacientes ilimitados', 'Tudo do plano gratuito', 'SorrIA IA receptora', 'Suporte por e-mail', 'Histórico ilimitado'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ color: '#4ade80', fontWeight: 700 }}>✓</span>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,.85)' }}>{f}</span>
            </div>
          ))}
          <button onClick={onLogin} style={{
            width: '100%', marginTop: 28, padding: '12px 0', borderRadius: 10,
            border: 'none', background: C.primary,
            color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(26,138,123,.5)',
          }}>Assinar Pro</button>
        </div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: C.navy, padding: '48px 5% 32px', color: 'rgba(255,255,255,.6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20, marginBottom: 32 }}>
        <img src="/assets/logo.png" alt="SorrIA" style={{ height: 38, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        <p style={{ fontSize: 13, margin: 0 }}>Sistema odontológico inteligente para dentistas brasileiros.</p>
        <p style={{ fontSize: 13, margin: 0 }}>consultoriosorria.com.br</p>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: 24, textAlign: 'center', fontSize: 12 }}>
        © {new Date().getFullYear()} SorrIA — Meu Consultório. Todos os direitos reservados.
      </div>
    </footer>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate()

  function irParaLogin() {
    navigate('/login')
  }

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <Navbar onLogin={irParaLogin} />
      <Hero onLogin={irParaLogin} />
      <Features />
      <Precos onLogin={irParaLogin} />
      <Footer />
    </div>
  )
}
