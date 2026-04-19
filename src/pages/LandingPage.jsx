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
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: `linear-gradient(135deg, ${C.primary}, ${C.dark})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, boxShadow: '0 4px 12px rgba(26,138,123,.3)',
        }}>🦷</div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: C.navy, lineHeight: 1.1 }}>SorrIA</div>
          <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 500, letterSpacing: '.04em' }}>MEU CONSULTÓRIO</div>
        </div>
      </div>

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
          {['✅ Sem cartão de crédito', '✅ 3 pacientes grátis', '✅ Cancele quando quiser'].map(t => (
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

// ── Features ───────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: '🦷', title: 'Prontuário + Odontograma', desc: 'Histórico completo do paciente com odontograma interativo FDI e anamnese digital.' },
  { icon: '💰', title: 'Orçamentos profissionais', desc: 'Gere orçamentos em PDF com 70+ procedimentos, desconto PIX e parcelamento.' },
  { icon: '📋', title: 'Receituário e Atestados', desc: 'Documentos odontológicos completos com cabeçalho da clínica e PDF para impressão.' },
  { icon: '📅', title: 'Agenda integrada', desc: 'Sincronize consultas com Google Calendar e veja sua agenda direto no sistema.' },
  { icon: '🤖', title: 'SorrIA — IA receptora', desc: 'Assistente virtual que confirma consultas, responde pacientes e organiza sua rotina.' },
  { icon: '📱', title: 'WhatsApp integrado', desc: 'Acesse o WhatsApp do paciente com um clique diretamente do prontuário.' },
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
            padding: '28px 24px', borderRadius: 16,
            border: '1.5px solid #f1f5f9',
            background: '#fafafa',
            transition: 'transform .2s, box-shadow .2s, border-color .2s',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(26,138,123,.12)'
              e.currentTarget.style.borderColor = 'rgba(26,138,123,.3)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = '#f1f5f9'
            }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'rgba(26,138,123,.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, marginBottom: 18,
            }}>{f.icon}</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 8 }}>{f.title}</h3>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>{f.desc}</p>
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
          <div style={{ fontSize: 42, fontWeight: 900, color: C.navy, marginBottom: 4 }}>R$ 0</div>
          <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 28 }}>para sempre</div>
          {['Até 3 pacientes', 'Todos os módulos', 'Geração de PDF', 'Agenda Google Calendar'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ color: C.primary, fontWeight: 700 }}>✓</span>
              <span style={{ fontSize: 14, color: '#4b5563' }}>{f}</span>
            </div>
          ))}
          <button onClick={onLogin} style={{
            width: '100%', marginTop: 28, padding: '12px 0', borderRadius: 10,
            border: '2px solid #e5e7eb', background: '#fff',
            color: '#374151', fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}>Começar grátis</button>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: `linear-gradient(135deg, ${C.primary}, ${C.dark})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>🦷</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>SorrIA</div>
            <div style={{ fontSize: 10, letterSpacing: '.05em' }}>MEU CONSULTÓRIO</div>
          </div>
        </div>
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
