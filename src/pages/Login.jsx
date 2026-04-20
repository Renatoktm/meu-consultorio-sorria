import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/Toast'

/* ── Tokens ─────────────────────────────────────────────────────────────────── */
const C = {
  dark:     '#1a2e2b',
  darker:   '#0f1d1b',
  teal:     '#1a8a7b',
  tealDark: '#147068',
  tealPale: 'rgba(26,138,123,0.1)',
  white:    '#ffffff',
  bg:       '#f8fffe',
  muted:    '#6b7875',
  border:   '#e2e8e7',
  error:    '#dc2626',
}

/* ── CSS ────────────────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .lr { display: flex; min-height: 100vh; font-family: 'Plus Jakarta Sans', sans-serif; }

  /* ── Left panel ── */
  .lr-left {
    width: 44%; flex-shrink: 0; position: relative; overflow: hidden;
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 40px;
  }
  .lr-left-bg {
    position: absolute; inset: 0; z-index: 0;
    background-image: url('/assets/sorria-avatar.jpg');
    background-size: cover; background-position: top center;
  }
  .lr-left-overlay {
    position: absolute; inset: 0; z-index: 1;
    background: linear-gradient(
      to bottom,
      rgba(10,22,20,0.72) 0%,
      rgba(15,29,27,0.45) 40%,
      rgba(10,22,20,0.85) 100%
    );
  }
  .lr-left-top { position: relative; z-index: 2; }
  .lr-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
  .lr-logo-mark {
    width: 36px; height: 36px; border-radius: 9px;
    background: linear-gradient(135deg, ${C.teal}, ${C.tealDark});
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 14px rgba(26,138,123,0.5);
    flex-shrink: 0;
  }
  .lr-logo-name { font-size: 17px; font-weight: 800; color: #fff; letter-spacing: -0.01em; }
  .lr-logo-sub  { font-size: 10px; font-weight: 500; color: rgba(255,255,255,0.55); letter-spacing: 0.07em; text-transform: uppercase; }

  .lr-left-bottom { position: relative; z-index: 2; }
  .lr-quote {
    font-size: clamp(22px, 2.4vw, 30px); font-weight: 700; color: #fff;
    line-height: 1.25; letter-spacing: -0.02em; margin-bottom: 16px;
  }
  .lr-quote em { color: ${C.teal}; font-style: normal; }
  .lr-quote-sub { font-size: 14px; color: rgba(255,255,255,0.5); font-weight: 400; line-height: 1.6; }
  .lr-badge {
    display: inline-flex; align-items: center; gap: 6px; margin-top: 24px;
    padding: 6px 14px 6px 8px; border-radius: 99px;
    background: rgba(26,138,123,0.2); border: 1px solid rgba(26,138,123,0.35);
  }
  .lr-badge-dot { width: 7px; height: 7px; border-radius: 50%; background: ${C.teal}; box-shadow: 0 0 0 3px rgba(26,138,123,0.3); }
  .lr-badge-text { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.8); letter-spacing: 0.02em; }

  /* ── Right panel ── */
  .lr-right {
    flex: 1; background: ${C.white}; display: flex; align-items: center; justify-content: center;
    padding: 48px 40px; position: relative;
  }
  .lr-right::before {
    content: ''; position: absolute; top: 0; left: 0; bottom: 0; width: 1px;
    background: linear-gradient(to bottom, transparent, ${C.border}, transparent);
  }
  .lr-form-wrap { width: 100%; max-width: 380px; }

  .lr-form-head { margin-bottom: 36px; }
  .lr-form-eyebrow { font-size: 11px; font-weight: 600; color: ${C.teal}; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 10px; }
  .lr-form-h1 { font-size: 28px; font-weight: 800; color: ${C.dark}; letter-spacing: -0.025em; margin-bottom: 8px; }
  .lr-form-sub { font-size: 14px; color: ${C.muted}; font-weight: 400; line-height: 1.6; }

  /* Google button */
  .btn-google {
    width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
    padding: 11px 20px; border-radius: 10px;
    border: 1.5px solid ${C.border}; background: ${C.white};
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 600;
    color: ${C.dark}; cursor: pointer; transition: border-color .2s, background .2s, box-shadow .2s;
    margin-bottom: 24px;
  }
  .btn-google:hover { border-color: #c5d0cf; background: ${C.bg}; box-shadow: 0 2px 10px rgba(0,0,0,0.06); }

  /* Divider */
  .lr-divider { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
  .lr-divider-line { flex: 1; height: 1px; background: ${C.border}; }
  .lr-divider-text { font-size: 12px; color: #b0bab9; font-weight: 500; letter-spacing: 0.04em; }

  /* Form fields */
  .lr-field { margin-bottom: 16px; }
  .lr-label {
    display: block; font-size: 13px; font-weight: 600; color: ${C.dark};
    margin-bottom: 6px; letter-spacing: -0.01em;
  }
  .lr-input {
    width: 100%; padding: 11px 14px; border-radius: 9px;
    border: 1.5px solid ${C.border}; background: ${C.bg};
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; color: ${C.dark};
    outline: none; transition: border-color .2s, box-shadow .2s, background .2s;
    -webkit-appearance: none;
  }
  .lr-input::placeholder { color: #b0bab9; }
  .lr-input:focus { border-color: ${C.teal}; background: ${C.white}; box-shadow: 0 0 0 3px rgba(26,138,123,0.12); }

  .lr-field-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
  .lr-forgot { font-size: 12px; color: ${C.muted}; text-decoration: none; font-weight: 500; transition: color .2s; }
  .lr-forgot:hover { color: ${C.teal}; }

  /* Submit button */
  .btn-submit {
    width: 100%; margin-top: 8px; padding: 13px; border-radius: 10px; border: none;
    background: linear-gradient(135deg, ${C.teal}, ${C.tealDark});
    color: ${C.white}; font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 15px; font-weight: 700; cursor: pointer; letter-spacing: 0.01em;
    box-shadow: 0 6px 20px rgba(26,138,123,0.38);
    transition: opacity .2s, transform .15s, box-shadow .15s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(26,138,123,0.46); }
  .btn-submit:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

  .lr-footer-link {
    text-align: center; margin-top: 24px;
    font-size: 13px; color: ${C.muted}; font-weight: 400;
  }
  .lr-footer-link a { color: ${C.teal}; font-weight: 600; text-decoration: none; margin-left: 4px; }
  .lr-footer-link a:hover { text-decoration: underline; }

  /* Spinner */
  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner {
    width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.35);
    border-top-color: #fff; border-radius: 50%;
    animation: spin .7s linear infinite; flex-shrink: 0;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .lr { flex-direction: column; }
    .lr-left { width: 100%; min-height: 260px; padding: 28px; }
    .lr-quote { font-size: 20px; }
    .lr-right { padding: 36px 24px; }
    .lr-right::before { display: none; }
  }
`

/* ── Google SVG ─────────────────────────────────────────────────────────────── */
const GoogleSVG = (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
    <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.32-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
    <path fill="#FBBC05" d="M11.68 28.18A13.9 13.9 0 0 1 10.8 24c0-1.45.25-2.86.68-4.18v-5.7H4.34A23.93 23.93 0 0 0 0 24c0 3.87.93 7.53 2.56 10.77l7.12-5.52-.52-1.07z"/>
    <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.34 5.7C13.42 14.62 18.27 10.75 24 10.75z"/>
  </svg>
)

/* ── Logo mark SVG ──────────────────────────────────────────────────────────── */
const ToothSVG = (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <path d="M10 2C7 2 4.5 4.5 4.5 7.5c0 2 1 3.8 2.5 4.8L10 18l3-5.7c1.5-1 2.5-2.8 2.5-4.8C15.5 4.5 13 2 10 2z" fill="white"/>
  </svg>
)

/* ── Component ──────────────────────────────────────────────────────────────── */
export default function Login() {
  const { signIn, signInWithGoogle } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [email, setEmail]   = useState('')
  const [senha, setSenha]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn(email, senha)
      navigate('/dashboard')
    } catch (err) {
      toast(err.message || 'E-mail ou senha incorretos.', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    try {
      await signInWithGoogle()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  return (
    <div className="lr">
      <style>{CSS}</style>

      {/* ── Left panel ── */}
      <div className="lr-left">
        <div className="lr-left-bg" />
        <div className="lr-left-overlay" />

        <div className="lr-left-top">
          <Link to="/" className="lr-logo">
            <div className="lr-logo-mark">{ToothSVG}</div>
            <div>
              <div className="lr-logo-name">SorrIA</div>
              <div className="lr-logo-sub">Meu Consultório</div>
            </div>
          </Link>
        </div>

        <div className="lr-left-bottom">
          <div className="lr-quote">
            Sua clínica merece um sistema <em>inteligente</em>
          </div>
          <p className="lr-quote-sub">
            Prontuário, agenda, orçamentos e IA receptora —<br/>
            tudo em um só lugar, feito para dentistas brasileiros.
          </p>
          <div className="lr-badge">
            <div className="lr-badge-dot" />
            <span className="lr-badge-text">SorrIA online e disponível</span>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="lr-right">
        <div className="lr-form-wrap">
          <div className="lr-form-head">
            <div className="lr-form-eyebrow">Acesso seguro</div>
            <h1 className="lr-form-h1">Bem-vindo de volta</h1>
            <p className="lr-form-sub">Entre na sua conta para acessar o consultório.</p>
          </div>

          <button className="btn-google" onClick={handleGoogle} type="button">
            {GoogleSVG}
            Continuar com Google
          </button>

          <div className="lr-divider">
            <div className="lr-divider-line" />
            <span className="lr-divider-text">ou</span>
            <div className="lr-divider-line" />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="lr-field">
              <label className="lr-label">E-mail</label>
              <input
                className="lr-input"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="lr-field">
              <div className="lr-field-row">
                <label className="lr-label" style={{ margin: 0 }}>Senha</label>
                <a href="#" className="lr-forgot">Esqueceu a senha?</a>
              </div>
              <input
                className="lr-input"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? <><span className="spinner" /> Entrando...</> : 'Entrar na conta'}
            </button>
          </form>

          <p className="lr-footer-link">
            Ainda não tem conta?
            <Link to="/cadastro">Criar conta gratuita</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
