import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');`

const T = {
  bg:        '#F7F6F2',
  surface:   '#FFFFFF',
  sage:      '#2A5C52',
  sageMid:   '#3D7A6E',
  sagePale:  '#EBF2EF',
  dark:      '#161C1B',
  gold:      '#B8935A',
  goldPale:  'rgba(184,147,90,0.15)',
  muted:     '#6B7875',
  border:    'rgba(42,92,82,0.12)',
}

/* ── Inline SVG Icons ──────────────────────────────────────────────────────── */
const Icons = {
  prontuario: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2"/>
      <line x1="9" y1="8"  x2="15" y2="8"/>
      <line x1="9" y1="12" x2="15" y2="12"/>
      <line x1="9" y1="16" x2="12" y2="16"/>
      <line x1="12" y1="6" x2="12" y2="10"/>
    </svg>
  ),
  orcamento: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14,2 14,8 20,8"/>
      <line x1="9" y1="13" x2="15" y2="13"/>
      <line x1="9" y1="17" x2="13" y2="17"/>
    </svg>
  ),
  receituario: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/>
      <path d="M9 12h2l1 2 1-2h2"/>
      <line x1="9" y1="16" x2="13" y2="16"/>
    </svg>
  ),
  agenda: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="3"  y1="9" x2="21" y2="9"/>
      <line x1="8"  y1="2" x2="8"  y2="6"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <circle cx="8"  cy="14" r="1" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="14" r="1" fill="currentColor" stroke="none"/>
      <circle cx="16" cy="14" r="1" fill="currentColor" stroke="none"/>
    </svg>
  ),
  ia: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
      <path d="M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M19.07 4.93l-2.12 2.12M7.05 16.95l-2.12 2.12"/>
    </svg>
  ),
  whatsapp: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      <line x1="9" y1="11" x2="15" y2="11"/>
    </svg>
  ),
  check: (
    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
      <path d="M1 4l3 3 5-6" stroke={T.sage} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  checkWhite: (
    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
      <path d="M1 4l3 3 5-6" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  arrow: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="2" y1="7" x2="12" y2="7"/>
      <polyline points="8,3 12,7 8,11"/>
    </svg>
  ),
}

const css = `
  ${FONTS}

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       ${T.bg};
    --surface:  ${T.surface};
    --sage:     ${T.sage};
    --sage-mid: ${T.sageMid};
    --sage-pale:${T.sagePale};
    --dark:     ${T.dark};
    --gold:     ${T.gold};
    --muted:    ${T.muted};
    --border:   ${T.border};
  }

  body { background: var(--bg); }

  .sorria-land { font-family: 'DM Sans', sans-serif; }

  /* Navbar */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 200;
    height: 72px; padding: 0 6%;
    display: flex; align-items: center; justify-content: space-between;
    transition: background 0.4s ease, border-bottom 0.4s ease, backdrop-filter 0.4s ease;
  }
  .nav.scrolled {
    background: rgba(247,246,242,0.93);
    backdrop-filter: blur(18px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo { display: flex; align-items: baseline; gap: 2px; text-decoration: none; }
  .nav-logo-serif { font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 600; color: var(--dark); letter-spacing: -0.01em; }
  .nav-logo-accent { font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 600; color: var(--sage); letter-spacing: -0.01em; }
  .nav-logo-sub { font-size: 10px; font-weight: 500; color: var(--muted); letter-spacing: 0.12em; text-transform: uppercase; margin-left: 6px; padding-bottom: 1px; }
  .nav-links { display: flex; align-items: center; gap: 36px; }
  .nav-link { font-size: 14px; font-weight: 400; color: var(--muted); text-decoration: none; letter-spacing: 0.01em; transition: color 0.2s; }
  .nav-link:hover { color: var(--dark); }
  .nav-actions { display: flex; align-items: center; gap: 12px; }
  .btn-ghost { padding: 8px 20px; border-radius: 6px; border: none; background: transparent; color: var(--muted); font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 400; cursor: pointer; transition: color 0.2s; }
  .btn-ghost:hover { color: var(--dark); }
  .btn-primary { padding: 9px 24px; border-radius: 6px; border: 1.5px solid var(--sage); background: var(--sage); color: #fff; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; letter-spacing: 0.02em; cursor: pointer; transition: background 0.2s, border-color 0.2s; }
  .btn-primary:hover { background: var(--sage-mid); border-color: var(--sage-mid); }

  /* Hero */
  .hero {
    min-height: 100vh; background: var(--bg);
    display: flex; align-items: center; gap: 80px;
    padding: 100px 6% 80px; position: relative; overflow: hidden;
  }
  .hero-noise {
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E");
    opacity: 0.6;
  }
  .hero-blob-a {
    position: absolute; top: 5%; right: 2%; width: 640px; height: 640px; pointer-events: none; z-index: 0;
    background: radial-gradient(ellipse, rgba(42,92,82,0.08) 0%, transparent 68%);
  }
  .hero-blob-b {
    position: absolute; bottom: -5%; left: 15%; width: 440px; height: 440px; pointer-events: none; z-index: 0;
    background: radial-gradient(ellipse, rgba(184,147,90,0.07) 0%, transparent 68%);
  }
  .hero-left { flex: 0 0 auto; max-width: 560px; position: relative; z-index: 1; }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px; margin-bottom: 32px;
    padding: 5px 14px 5px 8px; border: 1px solid var(--border); border-radius: 99px;
    background: var(--surface);
  }
  .hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--sage); }
  .hero-badge-text { font-size: 12px; font-weight: 500; color: var(--muted); letter-spacing: 0.03em; }
  .hero-h1 { font-family: 'Cormorant Garamond', serif; font-size: clamp(44px, 5.5vw, 70px); font-weight: 600; color: var(--dark); line-height: 1.05; margin-bottom: 28px; letter-spacing: -0.025em; }
  .hero-h1 em { font-style: italic; color: var(--sage); }
  .hero-p { font-size: 16px; color: var(--muted); line-height: 1.8; margin-bottom: 44px; max-width: 420px; font-weight: 300; }
  .hero-ctas { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 44px; }
  .btn-dark { padding: 14px 36px; border-radius: 6px; border: none; background: var(--dark); color: #fff; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500; letter-spacing: 0.02em; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: background 0.2s; }
  .btn-dark:hover { background: var(--sage); }
  .btn-outline { padding: 14px 28px; border-radius: 6px; border: 1.5px solid var(--border); background: transparent; color: var(--muted); font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 400; letter-spacing: 0.02em; cursor: pointer; transition: border-color 0.2s, color 0.2s; }
  .btn-outline:hover { border-color: var(--sage); color: var(--sage); }
  .hero-trust { display: flex; align-items: center; gap: 0; flex-wrap: wrap; }
  .hero-trust-item { font-size: 12px; color: var(--muted); font-weight: 400; letter-spacing: 0.01em; padding: 0 20px; border-right: 1px solid var(--border); }
  .hero-trust-item:first-child { padding-left: 0; }
  .hero-trust-item:last-child { border-right: none; }

  /* Hero right */
  .hero-right { flex: 1; display: flex; justify-content: center; align-items: center; position: relative; z-index: 1; min-height: 580px; }
  .hero-bg-circle { position: absolute; width: 460px; height: 460px; border-radius: 50%; background: var(--sage-pale); top: 50%; left: 50%; transform: translate(-50%, -50%); }
  .hero-img-wrap {
    width: 360px; height: 480px; border-radius: 20px; overflow: hidden; position: relative;
    box-shadow: 0 40px 100px rgba(22,28,27,0.18);
    border: 1px solid rgba(255,255,255,0.6);
  }
  .hero-img { width: 100%; height: 100%; object-fit: cover; object-position: top center; }
  .hero-img-overlay { position: absolute; bottom: 0; left: 0; right: 0; height: 140px; background: linear-gradient(transparent, rgba(22,28,27,0.55)); }
  .hero-img-status { position: absolute; bottom: 18px; left: 18px; display: flex; align-items: center; gap: 8px; }
  .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #6ee7b7; box-shadow: 0 0 0 3px rgba(110,231,183,0.2); }
  .status-text { font-size: 13px; color: #fff; font-weight: 400; letter-spacing: 0.02em; }

  /* Floating cards */
  .float-card-a {
    position: absolute; top: 28px; left: -10px; z-index: 3;
    background: var(--surface); border-radius: 14px; padding: 18px 22px;
    border: 1px solid var(--border); box-shadow: 0 8px 32px rgba(22,28,27,0.08);
    animation: floatA 4.5s ease-in-out infinite;
  }
  .float-card-a-num { font-family: 'Cormorant Garamond', serif; font-size: 38px; font-weight: 600; color: var(--dark); line-height: 1; }
  .float-card-a-label { font-size: 12px; color: var(--muted); margin-top: 4px; font-weight: 400; }
  .float-card-b {
    position: absolute; bottom: 70px; right: -16px; z-index: 3;
    background: var(--sage); border-radius: 14px; padding: 16px 20px; max-width: 200px;
    box-shadow: 0 12px 36px rgba(42,92,82,0.28);
    animation: floatB 5.5s ease-in-out infinite;
  }
  .float-card-b-label { font-size: 10px; font-weight: 500; color: rgba(255,255,255,0.55); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px; }
  .float-card-b-text { font-size: 13px; color: #fff; line-height: 1.55; font-weight: 300; }

  /* Features */
  .features { padding: 130px 6%; background: var(--surface); }
  .features-inner { max-width: 1100px; margin: 0 auto; }
  .section-eyebrow { font-size: 11px; font-weight: 500; color: var(--sage); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 18px; }
  .features-header { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 24px; margin-bottom: 72px; }
  .features-h2 { font-family: 'Cormorant Garamond', serif; font-size: clamp(32px, 4vw, 52px); font-weight: 600; color: var(--dark); letter-spacing: -0.025em; line-height: 1.1; max-width: 440px; }
  .features-sub { font-size: 15px; color: var(--muted); max-width: 300px; line-height: 1.75; font-weight: 300; }
  .features-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
  .feature-card { padding: 32px 28px; border-radius: 14px; border: 1px solid var(--border); background: var(--bg); transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease; cursor: default; }
  .feature-card:hover { transform: translateY(-5px); box-shadow: 0 20px 48px rgba(22,28,27,0.08); border-color: rgba(42,92,82,0.22); background: var(--surface); }
  .feature-icon { width: 46px; height: 46px; border-radius: 10px; background: rgba(42,92,82,0.07); display: flex; align-items: center; justify-content: center; color: var(--sage); margin-bottom: 22px; transition: background 0.3s; }
  .feature-card:hover .feature-icon { background: var(--sage-pale); }
  .feature-title { font-size: 15px; font-weight: 600; color: var(--dark); margin-bottom: 10px; letter-spacing: -0.01em; }
  .feature-desc { font-size: 14px; color: var(--muted); line-height: 1.65; font-weight: 300; }

  /* Precos */
  .precos { padding: 130px 6%; background: var(--bg); }
  .precos-inner { max-width: 860px; margin: 0 auto; }
  .precos-header { text-align: center; margin-bottom: 64px; }
  .precos-h2 { font-family: 'Cormorant Garamond', serif; font-size: clamp(32px, 4vw, 52px); font-weight: 600; color: var(--dark); letter-spacing: -0.025em; line-height: 1.1; }
  .precos-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; }

  .plan-free { background: var(--surface); border-radius: 18px; padding: 44px 40px; border: 1px solid var(--border); }
  .plan-pro { background: var(--dark); border-radius: 18px; padding: 44px 40px; position: relative; overflow: hidden; }
  .plan-pro-glow { position: absolute; top: -80px; right: -80px; width: 260px; height: 260px; border-radius: 50%; background: radial-gradient(circle, rgba(42,92,82,0.25) 0%, transparent 70%); pointer-events: none; }
  .plan-label { font-size: 12px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 20px; }
  .plan-label.free { color: var(--muted); }
  .plan-label.pro { color: rgba(255,255,255,0.45); }
  .plan-badge { position: absolute; top: 20px; right: 20px; background: rgba(184,147,90,0.15); border: 1px solid rgba(184,147,90,0.3); color: var(--gold); font-size: 10px; font-weight: 500; padding: 4px 10px; border-radius: 99px; letter-spacing: 0.07em; text-transform: uppercase; font-family: 'DM Sans', sans-serif; }
  .plan-price { font-family: 'Cormorant Garamond', serif; font-size: 56px; font-weight: 600; line-height: 1; margin-bottom: 8px; }
  .plan-price.free { color: var(--dark); }
  .plan-price.pro { color: #fff; }
  .plan-cycle { font-size: 13px; font-weight: 300; margin-bottom: 36px; }
  .plan-cycle.free { color: var(--muted); }
  .plan-cycle.pro { color: rgba(255,255,255,0.35); }
  .plan-divider.free { border: none; border-top: 1px solid var(--border); margin-bottom: 28px; }
  .plan-divider.pro { border: none; border-top: 1px solid rgba(255,255,255,0.07); margin-bottom: 28px; }
  .plan-features { margin-bottom: 32px; }
  .plan-feature { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
  .plan-check { width: 18px; height: 18px; border-radius: 4px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .plan-check.free { border: 1.5px solid var(--sage); }
  .plan-check.pro { border: 1.5px solid rgba(42,92,82,0.5); }
  .plan-feature-text { font-size: 14px; font-weight: 400; }
  .plan-feature-text.free { color: var(--dark); }
  .plan-feature-text.pro { color: rgba(255,255,255,0.75); font-weight: 300; }
  .btn-plan-free { width: 100%; padding: 13px 0; border-radius: 8px; border: 1.5px solid var(--border); background: transparent; color: var(--dark); font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; letter-spacing: 0.02em; cursor: pointer; transition: border-color 0.2s, color 0.2s; }
  .btn-plan-free:hover { border-color: var(--sage); color: var(--sage); }
  .btn-plan-pro { width: 100%; padding: 13px 0; border-radius: 8px; border: none; background: var(--sage); color: #fff; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; letter-spacing: 0.02em; cursor: pointer; transition: background 0.2s; }
  .btn-plan-pro:hover { background: var(--sage-mid); }

  /* Footer */
  .footer { background: var(--dark); padding: 56px 6% 36px; }
  .footer-top { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 36px; margin-bottom: 56px; }
  .footer-logo { display: flex; align-items: baseline; gap: 2px; margin-bottom: 14px; }
  .footer-logo-s { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 600; color: #fff; }
  .footer-logo-a { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 600; color: var(--sage); }
  .footer-desc { font-size: 13px; color: rgba(255,255,255,0.3); font-weight: 300; max-width: 260px; line-height: 1.75; }
  .footer-url { font-size: 13px; color: rgba(255,255,255,0.2); font-weight: 300; letter-spacing: 0.02em; }
  .footer-bottom { border-top: 1px solid rgba(255,255,255,0.06); padding-top: 28px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
  .footer-copy { font-size: 12px; color: rgba(255,255,255,0.18); font-weight: 300; }

  /* Keyframes */
  @keyframes floatA {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-10px); }
  }
  @keyframes floatB {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-8px); }
  }

  /* Responsive */
  @media (max-width: 860px) {
    .hero { flex-direction: column; gap: 60px; padding-top: 110px; }
    .hero-right { min-height: 400px; width: 100%; }
    .hero-bg-circle { width: 340px; height: 340px; }
    .hero-img-wrap { width: 280px; height: 360px; }
    .float-card-a { left: 0; }
    .float-card-b { right: 0; }
    .nav-links { display: none; }
  }
`

const FEATURES_DATA = [
  { icon: 'prontuario', title: 'Prontuário & Odontograma',    desc: 'Histórico completo com odontograma FDI interativo e anamnese digital.' },
  { icon: 'orcamento',  title: 'Orçamentos profissionais',    desc: 'PDF com 70+ procedimentos, desconto PIX e parcelamento automático.' },
  { icon: 'receituario',title: 'Receituário e Atestados',     desc: 'Documentos odontológicos com cabeçalho da clínica, prontos para impressão.' },
  { icon: 'agenda',     title: 'Agenda integrada',            desc: 'Sincronização com Google Calendar e visão semanal completa.' },
  { icon: 'ia',         title: 'SorrIA — IA Receptora',       desc: 'Assistente que confirma consultas, responde pacientes e organiza sua rotina.' },
  { icon: 'whatsapp',   title: 'Acesso direto ao WhatsApp',   desc: 'Contate o paciente com um clique direto do prontuário.' },
]

/* ── Navbar ─────────────────────────────────────────────────────────────────── */
function Navbar({ onLogin }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
      <span className="nav-logo">
        <span className="nav-logo-serif">Sorr</span>
        <span className="nav-logo-accent">IA</span>
        <span className="nav-logo-sub">Consultório</span>
      </span>
      <div className="nav-links">
        <a href="#funcionalidades" className="nav-link">Funcionalidades</a>
        <a href="#precos" className="nav-link">Preços</a>
      </div>
      <div className="nav-actions">
        <button onClick={onLogin} className="btn-ghost">Entrar</button>
        <button onClick={onLogin} className="btn-primary">Começar grátis</button>
      </div>
    </nav>
  )
}

/* ── Hero ───────────────────────────────────────────────────────────────────── */
function Hero({ onLogin }) {
  return (
    <section className="hero">
      <div className="hero-noise" />
      <div className="hero-blob-a" />
      <div className="hero-blob-b" />

      <div className="hero-left">
        <div className="hero-badge">
          <div className="hero-badge-dot" />
          <span className="hero-badge-text">Sistema para clínicas odontológicas</span>
        </div>

        <h1 className="hero-h1">
          Gestão inteligente<br />
          para clínicas que<br />
          <em>respiram excelência</em>
        </h1>

        <p className="hero-p">
          Prontuário, orçamentos, receituário e agenda em um só lugar.
          A SorrIA cuida da rotina — você cuida dos pacientes.
        </p>

        <div className="hero-ctas">
          <button onClick={onLogin} className="btn-dark">
            Começar gratuitamente {Icons.arrow}
          </button>
          <button onClick={onLogin} className="btn-outline">
            Ver demonstração
          </button>
        </div>

        <div className="hero-trust">
          {['3 pacientes grátis', 'Sem cartão de crédito', 'Cancele quando quiser'].map(t => (
            <span key={t} className="hero-trust-item">{t}</span>
          ))}
        </div>
      </div>

      <div className="hero-right">
        <div className="hero-bg-circle" />

        <div className="float-card-a">
          <div className="float-card-a-num">98%</div>
          <div className="float-card-a-label">dentistas satisfeitos</div>
        </div>

        <div className="hero-img-wrap">
          <img src="/assets/sorria-avatar.jpg" alt="SorrIA — Assistente Virtual" className="hero-img" />
          <div className="hero-img-overlay" />
          <div className="hero-img-status">
            <div className="status-dot" />
            <span className="status-text">SorrIA — disponível agora</span>
          </div>
        </div>

        <div className="float-card-b">
          <div className="float-card-b-label">SorrIA</div>
          <p className="float-card-b-text">"Agenda confirmada para amanhã às 14h, Dr. Silva."</p>
        </div>
      </div>
    </section>
  )
}

/* ── Features ───────────────────────────────────────────────────────────────── */
function Features() {
  return (
    <section id="funcionalidades" className="features">
      <div className="features-inner">
        <div className="section-eyebrow">Funcionalidades</div>
        <div className="features-header">
          <h2 className="features-h2">
            Tudo que sua clínica<br />precisa, sem o excesso
          </h2>
          <p className="features-sub">
            Um sistema completo e elegante, pensado para dentistas que valorizam seu tempo.
          </p>
        </div>
        <div className="features-grid">
          {FEATURES_DATA.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{Icons[f.icon]}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Preços ─────────────────────────────────────────────────────────────────── */
function Precos({ onLogin }) {
  const freeItems = ['Até 3 pacientes', 'Todos os módulos', 'Geração de PDF', 'Agenda Google Calendar']
  const proItems  = ['Pacientes ilimitados', 'Tudo do plano gratuito', 'SorrIA IA receptora', 'Suporte por e-mail', 'Histórico ilimitado']

  return (
    <section id="precos" className="precos">
      <div className="precos-inner">
        <div className="precos-header">
          <div className="section-eyebrow">Preços</div>
          <h2 className="precos-h2">Simples e transparente</h2>
        </div>
        <div className="precos-grid">
          {/* Free */}
          <div className="plan-free">
            <div className="plan-label free">Gratuito</div>
            <div className="plan-price free">R$ 0</div>
            <div className="plan-cycle free">para sempre</div>
            <hr className="plan-divider free" />
            <div className="plan-features">
              {freeItems.map(item => (
                <div key={item} className="plan-feature">
                  <div className="plan-check free">{Icons.check}</div>
                  <span className="plan-feature-text free">{item}</span>
                </div>
              ))}
            </div>
            <button onClick={onLogin} className="btn-plan-free">Começar grátis</button>
          </div>

          {/* Pro */}
          <div className="plan-pro">
            <div className="plan-pro-glow" />
            <div className="plan-badge">Recomendado</div>
            <div className="plan-label pro">Pro</div>
            <div className="plan-price pro">R$ 59</div>
            <div className="plan-cycle pro">por mês</div>
            <hr className="plan-divider pro" />
            <div className="plan-features">
              {proItems.map(item => (
                <div key={item} className="plan-feature">
                  <div className="plan-check pro">{Icons.checkWhite}</div>
                  <span className="plan-feature-text pro">{item}</span>
                </div>
              ))}
            </div>
            <button onClick={onLogin} className="btn-plan-pro">Assinar Pro</button>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Footer ─────────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <div className="footer-logo">
            <span className="footer-logo-s">Sorr</span>
            <span className="footer-logo-a">IA</span>
          </div>
          <p className="footer-desc">
            Sistema odontológico inteligente para dentistas que valorizam qualidade e elegância.
          </p>
        </div>
        <span className="footer-url">consultoriosorria.com.br</span>
      </div>
      <div className="footer-bottom">
        <span className="footer-copy">© {new Date().getFullYear()} SorrIA — Meu Consultório. Todos os direitos reservados.</span>
      </div>
    </footer>
  )
}

/* ── Page ───────────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate()
  const irParaLogin = () => navigate('/login')

  return (
    <div className="sorria-land">
      <style>{css}</style>
      <Navbar onLogin={irParaLogin} />
      <Hero onLogin={irParaLogin} />
      <Features />
      <Precos onLogin={irParaLogin} />
      <Footer />
    </div>
  )
}
