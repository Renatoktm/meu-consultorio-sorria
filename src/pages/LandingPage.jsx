import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

const SUPABASE_URL = 'https://nfkhnjglkvyduhzauavh.supabase.co'
const CHAT_URL = `${SUPABASE_URL}/functions/v1/sorria-chat`

const C = {
  primary:  '#1a8a7b',
  dark:     '#136b5e',
  darker:   '#0d4f46',
  bright:   '#00d4aa',
  light:    '#f0fdf9',
  navy:     '#0a1628',
  navyMid:  '#1a2e2b',
}

const WA_ATENDENTE = 'https://wa.me/5537999722971?text=Olá!%20Tenho%20interesse%20na%20SorrIA%20Atendente%20Virtual%20para%20minha%20clínica.%20Pode%20me%20explicar%20como%20funciona%20a%20implementação%3F'

/* ── helpers ───────────────────────────────────────────────────────────────── */
const card = (hover = false) => ({
  padding: '32px',
  borderRadius: 16,
  border: `1.5px solid ${hover ? 'rgba(26,138,123,.28)' : '#e5efec'}`,
  background: '#fff',
  boxShadow: hover ? '0 12px 36px rgba(26,138,123,.12)' : '0 4px 24px rgba(0,0,0,.08)',
  transform: hover ? 'translateY(-4px)' : 'none',
  transition: 'transform .2s, box-shadow .2s, border-color .2s',
})

function FeatureCard({ icon, title, desc, accentColor = C.primary, accentBg = '#f0fdf9', hoverShadow = 'rgba(26,138,123,.12)', hoverBorder = 'rgba(26,138,123,.28)' }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '32px',
        borderRadius: 16,
        border: `1.5px solid ${hover ? hoverBorder : '#e5efec'}`,
        background: '#fff',
        boxShadow: hover ? `0 12px 36px ${hoverShadow}` : '0 4px 24px rgba(0,0,0,.08)',
        transform: hover ? 'translateY(-4px)' : 'none',
        transition: 'transform .2s, box-shadow .2s, border-color .2s',
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: '50%',
        background: accentBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: accentColor, marginBottom: 20, flexShrink: 0,
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: C.navy, marginBottom: 10, lineHeight: 1.3 }}>{title}</h3>
      <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>{desc}</p>
    </div>
  )
}

/* ── Navbar ────────────────────────────────────────────────────────────────── */
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
        {[['#consultorio', 'Consultório'], ['#atendente', 'Atendente'], ['#precos', 'Preços']].map(([href, label]) => (
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

/* ── Hero ──────────────────────────────────────────────────────────────────── */
function Hero({ onLogin }) {
  return (
    <section style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #ffffff 0%, #f0fdf9 50%, #e6f7f4 100%)',
      display: 'flex', alignItems: 'center',
      padding: '100px 5% 60px', gap: 60,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -120, right: -120, width: 500, height: 500, borderRadius: '50%', background: 'rgba(26,138,123,.06)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -80, left: -80, width: 350, height: 350, borderRadius: '50%', background: 'rgba(26,138,123,.04)', pointerEvents: 'none' }} />

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
            color: '#374151', fontWeight: 600, fontSize: 15,
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8,
          }}>💬 Quero a Atendente</a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          {['✅ 14 dias grátis no Consultório', '✅ Implementação sob consulta', '✅ Sem fidelidade'].map(t => (
            <span key={t} style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{t}</span>
          ))}
        </div>
      </div>

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
          <img src="/assets/sorria-polo.png" alt="SorrIA"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(transparent, rgba(26,46,43,.6))' }} />
          <div style={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80' }} />
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>SorrIA • Online agora</span>
          </div>
        </div>
      </div>

      <style>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }`}</style>
    </section>
  )
}

/* ── SVG Icons ─────────────────────────────────────────────────────────────── */
const Ico = {
  prontuario: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  orcamento:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  docs:       <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  agenda:     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  ia:         <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
  whatsapp:   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  clock:      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  bell:       <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  users:      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  chart:      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  persona:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  mic:        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  spark:      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
}

/* ── Features Consultório ──────────────────────────────────────────────────── */
const FEATS_CONSULTORIO = [
  { icon: Ico.prontuario, title: 'Prontuário + Odontograma FDI',          desc: 'Histórico completo com odontograma interativo, anamnese digital e evolução por consulta.' },
  { icon: Ico.orcamento,  title: 'Orçamentos profissionais em PDF',        desc: 'Gere orçamentos com 70+ procedimentos, desconto PIX e parcelamento — prontos para enviar.' },
  { icon: Ico.docs,       title: 'Receituário e Atestados',                desc: 'Documentos com cabeçalho da clínica gerados em 1 clique. Prontos para imprimir e assinar.' },
  { icon: Ico.agenda,     title: 'Agenda com confirmações pelo WhatsApp',  desc: 'Consultas no Google Calendar com confirmações e lembretes automáticos enviados ao paciente.' },
  { icon: Ico.spark,      title: 'Inteligência Artificial integrada',      desc: 'IA que conecta o atendimento externo com a gestão interna — tudo sincronizado em tempo real.' },
  { icon: Ico.whatsapp,   title: 'WhatsApp direto do prontuário',          desc: 'Abra a conversa com o paciente no WhatsApp sem sair do sistema, com 1 clique.' },
]

function FeaturesConsultorio() {
  return (
    <section id="consultorio" style={{ padding: '100px 5%', background: C.light }}>
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 14 }}>
          MEU CONSULTÓRIO
        </div>
        <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 900, color: C.navy, letterSpacing: '-0.02em', marginBottom: 16 }}>
          Tudo que você precisa dentro da clínica
        </h2>
        <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 500, margin: '0 auto', lineHeight: 1.65 }}>
          Sem as complicações dos concorrentes. Só o essencial, funcionando.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24, maxWidth: 1100, margin: '0 auto' }}>
        {FEATS_CONSULTORIO.map((f, i) => (
          <FeatureCard key={i} {...f} />
        ))}
      </div>
    </section>
  )
}

/* ── Features Atendente ────────────────────────────────────────────────────── */
const FEATS_ATENDENTE = [
  { icon: Ico.persona,  title: 'Persona exclusiva da sua clínica',         desc: 'A atendente fala com a identidade e o tom da sua clínica — não é uma IA genérica.' },
  { icon: Ico.clock,    title: 'Atendimento 24h, 7 dias por semana',       desc: 'Responde em menos de 5 segundos, mesmo de madrugada. Sua recepção nunca dorme.' },
  { icon: Ico.whatsapp, title: 'Agendamento + confirmações automáticas',   desc: 'O paciente agenda pelo chat, recebe confirmação na hora e lembrete antes da consulta.' },
  { icon: Ico.mic,      title: 'Entende mensagens de voz',                 desc: 'A SorrIA lê áudios do WhatsApp e responde normalmente — o paciente pode falar em vez de digitar.' },
  { icon: Ico.spark,    title: 'IA que aprende com a sua clínica',         desc: 'Quanto mais usa, mais precisa fica. Aprende seus procedimentos, preços e horários disponíveis.' },
  { icon: Ico.users,    title: 'Reativação de pacientes inativos',         desc: 'Identifica quem não volta há meses e dispara campanhas personalizadas de retorno.' },
]

function FeaturesAtendente() {
  return (
    <section id="atendente" style={{ padding: '100px 5%', background: '#fff' }}>
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 14 }}>
          SORRIA ATENDENTE VIRTUAL
        </div>
        <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 900, color: C.navy, letterSpacing: '-0.02em', marginBottom: 16 }}>
          Sua recepcionista virtual,{' '}
          <span style={{ color: C.primary }}>24 horas por dia</span>
        </h2>
        <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 520, margin: '0 auto', lineHeight: 1.65 }}>
          Configurada especificamente para a sua clínica — com sua persona, seus horários e seus procedimentos.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24, maxWidth: 1100, margin: '0 auto 64px' }}>
        {FEATS_ATENDENTE.map((f, i) => (
          <FeatureCard
            key={i} {...f}
            accentColor="#16a34a"
            accentBg="#f0fdf4"
            hoverShadow="rgba(22,163,74,.12)"
            hoverBorder="rgba(22,163,74,.3)"
          />
        ))}
      </div>

      {/* CTA Atendente */}
      <div style={{
        maxWidth: 700, margin: '0 auto', textAlign: 'center',
        background: `linear-gradient(160deg, ${C.navy} 0%, ${C.navyMid} 100%)`,
        borderRadius: 24, padding: '48px 44px',
        boxShadow: '0 20px 60px rgba(10,22,40,.25)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(0,212,170,.06)', pointerEvents: 'none' }} />
        <div style={{ fontSize: 12, fontWeight: 700, color: C.bright, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 14 }}>
          IMPLEMENTAÇÃO SOB MEDIDA
        </div>
        <h3 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 14, letterSpacing: '-0.02em' }}>
          A SorrIA Atendente não é um produto de prateleira
        </h3>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,.6)', marginBottom: 32, lineHeight: 1.7, maxWidth: 500, margin: '0 auto 32px' }}>
          Cada implementação inclui entrevista, configuração da persona, integração WhatsApp Business e treinamento com os dados da sua clínica.
        </p>
        <a href={WA_ATENDENTE} target="_blank" rel="noopener noreferrer" style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '14px 36px', borderRadius: 12, cursor: 'pointer',
          background: '#25d366', color: '#fff', fontWeight: 700, fontSize: 16,
          textDecoration: 'none', boxShadow: '0 6px 20px rgba(37,211,102,.4)',
          transition: 'transform .15s, box-shadow .15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(37,211,102,.5)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,211,102,.4)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
          Solicitar pelo WhatsApp
        </a>
        <div style={{ marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,.3)' }}>
          Resposta em até 24h • Sem compromisso
        </div>
      </div>
    </section>
  )
}

/* ── Preços ────────────────────────────────────────────────────────────────── */
const WA_SVG = <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>

function Precos({ onLogin }) {
  const [periodo, setPeriodo] = useState('anual')
  const anual = periodo === 'anual'

  // Consultório
  const precoMensal = 87
  const precoAnualTotal = 870
  const precoAnualMes = Math.round(precoAnualTotal / 12)
  const economia = precoMensal * 12 - precoAnualTotal

  // Clínica Conectada
  const bundleMensal = 247
  const bundleAnualTotal = 2470
  const bundleAnualMes = Math.round(bundleAnualTotal / 12)
  const bundleEconomia = bundleMensal * 12 - bundleAnualTotal

  const produtos = [
    {
      id: 'consultorio',
      badge: 'GESTÃO INTERNA',
      nome: 'Meu Consultório',
      tagline: 'Organize sua clínica por completo',
      trial: '14 dias grátis, sem cartão',
      cta: 'Começar teste grátis',
      ctaAction: 'login',
      cor: C.primary,
      destaque: false,
      features: ['Prontuário + Odontograma FDI', 'Orçamentos em PDF', 'Receituário e Atestados', 'Agenda Google Calendar', 'Pacientes ilimitados (Pro)'],
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
      destaque: true,
      features: ['Tudo do Consultório Pro', 'SorrIA Atendente configurada', 'Agenda sincronizada bidirecional', 'Orçamento aprovado → WhatsApp auto', 'Suporte dedicado na implementação'],
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
      destaque: false,
      features: ['Persona personalizada para sua clínica', 'Agendamento automático pelo WhatsApp', 'Lembretes de consulta automáticos', 'Reativação de pacientes inativos', 'Relatórios de atendimento mensais'],
    },
  ]

  function handleCta(action) {
    if (action === 'login') window.location.href = '/login'
    else window.open(WA_ATENDENTE, '_blank')
  }

  return (
    <section id="precos" style={{ padding: '100px 5%', background: C.light }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 14 }}>
          PREÇOS
        </div>
        <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 900, color: C.navy, letterSpacing: '-0.02em', marginBottom: 14 }}>
          Escolha como a SorrIA vai trabalhar com você
        </h2>
        <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 500, margin: '0 auto' }}>
          Comece pela gestão, adicione o atendimento, ou assine o ecossistema completo de uma vez.
        </p>
      </div>

      {/* Toggle mensal/anual */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 48 }}>
        <div style={{
          display: 'inline-flex', background: '#fff', borderRadius: 99, padding: 4,
          border: '1.5px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,.06)',
        }}>
          <button onClick={() => setPeriodo('mensal')} style={{
            padding: '9px 28px', borderRadius: 99, border: 'none', cursor: 'pointer',
            fontSize: 14, fontWeight: 600, transition: 'all .2s',
            background: !anual ? C.primary : 'transparent',
            color: !anual ? '#fff' : '#6b7280',
          }}>Mensal</button>
          <button onClick={() => setPeriodo('anual')} style={{
            padding: '9px 28px', borderRadius: 99, border: 'none', cursor: 'pointer',
            fontSize: 14, fontWeight: 600, transition: 'all .2s',
            display: 'flex', alignItems: 'center', gap: 8,
            background: anual ? C.primary : 'transparent',
            color: anual ? '#fff' : '#6b7280',
          }}>
            Anual
            <span style={{
              background: anual ? 'rgba(255,255,255,.22)' : '#dcfce7',
              color: anual ? '#fff' : '#16a34a',
              fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 99,
            }}>Economize 17%</span>
          </button>
        </div>
      </div>

      {/* 3 cards */}
      <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 1100, margin: '0 auto', alignItems: 'stretch' }}>
        {produtos.map(p => (
          <div key={p.id} style={{
            flex: 1, minWidth: 280, maxWidth: 340,
            borderRadius: 20, padding: '32px 28px',
            background: p.destaque ? `linear-gradient(160deg, ${C.navy} 0%, ${C.navyMid} 100%)` : '#fff',
            border: p.destaque ? 'none' : '1.5px solid #e5e7eb',
            boxShadow: p.destaque ? '0 20px 60px rgba(10,22,40,.35)' : '0 4px 24px rgba(0,0,0,.08)',
            position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            transform: p.destaque ? 'scale(1.03)' : 'none',
          }}>
            {p.destaque && (
              <div style={{ position: 'absolute', top: -60, right: -60, width: 180, height: 180, borderRadius: '50%', background: 'rgba(0,212,170,.07)', pointerEvents: 'none' }} />
            )}

            <div style={{
              display: 'inline-flex', alignItems: 'center',
              background: p.destaque ? 'rgba(0,212,170,.15)' : `${p.cor}18`,
              border: `1px solid ${p.destaque ? 'rgba(0,212,170,.3)' : p.cor + '35'}`,
              borderRadius: 99, padding: '4px 12px', marginBottom: 16, alignSelf: 'flex-start',
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: p.destaque ? C.bright : p.cor }}>{p.badge}</span>
            </div>

            <div style={{ fontSize: 22, fontWeight: 800, color: p.destaque ? '#fff' : C.navy, marginBottom: 6 }}>{p.nome}</div>
            <div style={{ fontSize: 14, color: p.destaque ? 'rgba(255,255,255,.6)' : '#6b7280', marginBottom: 20 }}>{p.tagline}</div>

            {/* Preço dinâmico para Consultório e Clínica Conectada */}
            {p.id === 'consultorio' ? (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#6b7280' }}>R$</span>
                  <span style={{ fontSize: 40, fontWeight: 900, color: C.navy, lineHeight: 1, letterSpacing: '-0.03em' }}>
                    {anual ? precoAnualMes : precoMensal}
                  </span>
                  <span style={{ fontSize: 14, color: '#9ca3af', marginLeft: 2 }}>/mês</span>
                </div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>
                  {anual
                    ? <>cobrado anualmente — <strong style={{ color: '#6b7280' }}>R$ {precoAnualTotal}/ano</strong></>
                    : 'cobrado mensalmente'}
                </div>
                {anual && (
                  <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f0fdf4', borderRadius: 8, padding: '5px 10px' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a' }}>✓ Economize R$ {economia}/ano</span>
                  </div>
                )}
              </div>
            ) : p.id === 'bundle' ? (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,.6)' }}>R$</span>
                  <span style={{ fontSize: 40, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.03em' }}>
                    {anual ? bundleAnualMes : bundleMensal}
                  </span>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', marginLeft: 2 }}>/mês</span>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginBottom: 6 }}>
                  {anual
                    ? <>cobrado anualmente — <strong style={{ color: 'rgba(255,255,255,.65)' }}>R$ {bundleAnualTotal}/ano</strong></>
                    : 'Consultório + Atendente com integração nativa'}
                </div>
                {anual ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,212,170,.15)', border: '1px solid rgba(0,212,170,.25)', borderRadius: 8, padding: '5px 10px' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.bright }}>✓ Economize R$ {bundleEconomia}/ano</span>
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,212,170,.12)', border: '1px solid rgba(0,212,170,.22)', borderRadius: 8, padding: '5px 10px' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.bright }}>🎁 Setup e implementação GRÁTIS</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8, padding: '5px 10px' }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>+ taxa de implementação (consulte)</span>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: C.navy, marginBottom: 4 }}>{p.preco}</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>{p.detalhe}</div>
              </div>
            )}

            <div style={{ flex: 1, marginBottom: 20 }}>
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

            {p.ctaAction === 'whatsapp' || p.ctaAction === 'bundle' ? (
              <a href={WA_ATENDENTE} target="_blank" rel="noopener noreferrer" style={{
                width: '100%', padding: '13px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: p.destaque ? `linear-gradient(135deg, ${C.primary}, ${C.bright})` : '#25d366',
                color: '#fff', fontWeight: 700, fontSize: 14,
                textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: p.destaque ? '0 6px 20px rgba(0,212,170,.3)' : '0 4px 14px rgba(37,211,102,.3)',
                transition: 'opacity .15s',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {p.ctaAction === 'whatsapp' && WA_SVG}
                {p.cta}
              </a>
            ) : (
              <button onClick={() => handleCta(p.ctaAction)} style={{
                width: '100%', padding: '13px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: `linear-gradient(135deg, ${C.primary}, ${C.dark})`,
                color: '#fff', fontWeight: 700, fontSize: 14,
                boxShadow: '0 4px 14px rgba(26,138,123,.3)',
                transition: 'opacity .15s',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >{p.cta}</button>
            )}
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <span style={{ fontSize: 13, color: '#9ca3af' }}>
          Concorrentes cobram{' '}
          <span style={{ textDecoration: 'line-through', color: '#d1d5db' }}>R$ 149–169/mês</span>
          {' '}pelo Consultório.
        </span>
      </div>
    </section>
  )
}

/* ── Depoimentos ───────────────────────────────────────────────────────────── */
const DEPOIMENTOS = [
  { nome: 'Dra. Fernanda Lima',  produto: 'Atendente',       texto: 'Sério, achei que ia ser complicado. Mas a SorrIA começou a responder pacientes no WhatsApp no mesmo dia da implementação. Agendou 4 consultas enquanto eu estava atendendo.' },
  { nome: 'Dr. Ricardo Souza',   produto: 'Atendente',       texto: 'Minha recepcionista entrou de férias e eu quase entrei em pânico. Aí lembrei que a SorrIA tava lá. Nenhum paciente ficou sem resposta. Voltei até mais tranquilo rs' },
  { nome: 'Dra. Patricia Nunes', produto: 'Consultório Pro', texto: 'Eu vivia com caderno e post-it. Hoje gero receita, atestado e orçamento em menos de 2 minutos. Os pacientes ficam impressionados com o PDF. Parece clínica grande.' },
]

function Depoimentos() {
  return (
    <section style={{ padding: '100px 5%', background: C.navy }}>
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.bright, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 14 }}>
          DEPOIMENTOS
        </div>
        <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
          Dentistas que já usam o ecossistema
        </h2>
      </div>

      <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 1100, margin: '0 auto' }}>
        {DEPOIMENTOS.map((d, i) => (
          <div key={i} style={{
            flex: 1, minWidth: 280, maxWidth: 340,
            background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.09)',
            borderRadius: 20, padding: '32px 28px',
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: d.produto === 'Atendente' ? 'rgba(37,211,102,.15)' : 'rgba(0,212,170,.15)',
              border: `1px solid ${d.produto === 'Atendente' ? 'rgba(37,211,102,.3)' : 'rgba(0,212,170,.3)'}`,
              borderRadius: 99, padding: '4px 12px', marginBottom: 20,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: d.produto === 'Atendente' ? '#4ade80' : C.bright }}>
                {d.produto}
              </span>
            </div>
            <div style={{ color: C.bright, fontSize: 22, marginBottom: 12, lineHeight: 1 }}>❝</div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.75)', lineHeight: 1.7, marginBottom: 24 }}>
              {d.texto}
            </p>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>{d.nome}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── Footer ────────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ background: '#060f1c', padding: '52px 5% 32px', color: 'rgba(255,255,255,.5)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 32, marginBottom: 40 }}>
        <img src="/assets/logo.png" alt="SorrIA" style={{ height: 38, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.28)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12 }}>Produtos</div>
            {['Meu Consultório SorrIA', 'SorrIA Atendente Virtual'].map(p => (
              <div key={p} style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', marginBottom: 8 }}>{p}</div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.28)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12 }}>Contato</div>
            <div style={{ fontSize: 13, marginBottom: 8 }}>consultoriosorria.com.br</div>
            <a href={WA_ATENDENTE} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#4ade80', textDecoration: 'none' }}>
              WhatsApp (37) 99972-2971
            </a>
          </div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,.07)', paddingTop: 24, textAlign: 'center', fontSize: 12 }}>
        © {new Date().getFullYear()} SorrIA — Ecossistema Odontológico Inteligente · Divinópolis, MG · Todos os direitos reservados.
      </div>
    </footer>
  )
}

/* ── Chat Widget ───────────────────────────────────────────────────────────── */
function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Olá! 😊 Sou a SorrIA, sua assistente virtual. Posso te ajudar a entender como o nosso ecossistema pode transformar sua clínica. O que você gostaria de saber?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pulse, setPulse] = useState(true)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      setTimeout(() => inputRef.current?.focus(), 150)
      setPulse(false)
    }
  }, [open, messages])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    const userMsg = { role: 'user', content: text }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages.map(m => ({ role: m.role, content: m.content })) }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Desculpe, tente novamente!' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Ops, tive um problema de conexão 😅 Tenta de novo ou chama pelo WhatsApp: (37) 99972-2971' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Botão flutuante */}
      <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 999 }}>
        {!open && (
          <div style={{ position: 'relative' }}>
            {pulse && (
              <div style={{
                position: 'absolute', top: -4, right: -4,
                width: 16, height: 16, borderRadius: '50%',
                background: '#4ade80',
                boxShadow: '0 0 0 0 rgba(74,222,128,.4)',
                animation: 'chatPulse 2s infinite',
                zIndex: 2,
              }} />
            )}
            <button
              onClick={() => setOpen(true)}
              title="Fale com a SorrIA"
              style={{
                width: 62, height: 62, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: `linear-gradient(135deg, ${C.primary}, ${C.dark})`,
                boxShadow: '0 6px 24px rgba(26,138,123,.5)',
                padding: 0, overflow: 'hidden',
                transition: 'transform .2s, box-shadow .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(26,138,123,.6)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(26,138,123,.5)' }}
            >
              <img src="/assets/sorria-polo.png" alt="SorrIA"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
            </button>
          </div>
        )}

        {/* Painel do chat */}
        {open && (
          <div style={{
            width: 360, height: 520,
            borderRadius: 20, overflow: 'hidden',
            background: '#fff',
            boxShadow: '0 24px 64px rgba(0,0,0,.18)',
            display: 'flex', flexDirection: 'column',
            border: '1px solid #e5e7eb',
            animation: 'chatSlide .25s ease-out',
          }}>
            {/* Header */}
            <div style={{
              background: `linear-gradient(135deg, ${C.primary}, ${C.dark})`,
              padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
              flexShrink: 0,
            }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,.4)', flexShrink: 0 }}>
                <img src="/assets/sorria-polo.png" alt="SorrIA"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>SorrIA</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,.8)' }}>Online agora</span>
                </div>
              </div>
              <button onClick={() => setOpen(false)} style={{
                background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: '50%',
                width: 28, height: 28, cursor: 'pointer', color: '#fff', fontSize: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>×</button>
            </div>

            {/* Mensagens */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 12, background: '#f9fafb' }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                  {m.role === 'assistant' && (
                    <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: `1.5px solid ${C.primary}` }}>
                      <img src="/assets/sorria-polo.png" alt="SorrIA"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
                    </div>
                  )}
                  <div style={{
                    maxWidth: '75%', padding: '10px 13px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: m.role === 'user' ? `linear-gradient(135deg, ${C.primary}, ${C.dark})` : '#fff',
                    color: m.role === 'user' ? '#fff' : '#1a2e2b',
                    fontSize: 13.5, lineHeight: 1.55,
                    boxShadow: '0 2px 8px rgba(0,0,0,.07)',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    whiteSpace: 'pre-wrap',
                  }}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: `1.5px solid ${C.primary}` }}>
                    <img src="/assets/sorria-polo.png" alt="SorrIA"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
                  </div>
                  <div style={{ background: '#fff', borderRadius: '16px 16px 16px 4px', padding: '12px 16px', boxShadow: '0 2px 8px rgba(0,0,0,.07)', display: 'flex', gap: 4, alignItems: 'center' }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: C.primary, animation: `chatDot 1.2s ${i * 0.2}s infinite ease-in-out` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '12px 14px', borderTop: '1px solid #f0f0f0', background: '#fff', display: 'flex', gap: 8, flexShrink: 0 }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Escreva sua dúvida..."
                disabled={loading}
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: 12, border: '1.5px solid #e5e7eb',
                  fontSize: 13.5, outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif",
                  background: loading ? '#f9fafb' : '#fff', color: '#1a2e2b',
                  transition: 'border-color .2s',
                }}
                onFocus={e => e.target.style.borderColor = C.primary}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                style={{
                  width: 40, height: 40, borderRadius: 12, border: 'none', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                  background: loading || !input.trim() ? '#e5e7eb' : `linear-gradient(135deg, ${C.primary}, ${C.dark})`,
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background .2s', flexShrink: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes chatPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.4);opacity:.6} }
        @keyframes chatSlide { from{opacity:0;transform:translateY(16px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes chatDot { 0%,80%,100%{transform:scale(0.6);opacity:.4} 40%{transform:scale(1);opacity:1} }
      `}</style>
    </>
  )
}

/* ── Page ──────────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate()
  function irParaLogin() { navigate('/login') }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <Navbar onLogin={irParaLogin} />
      <Hero onLogin={irParaLogin} />
      <FeaturesConsultorio />
      <FeaturesAtendente />
      <Precos onLogin={irParaLogin} />
      <Depoimentos />
      <Footer />
      <ChatWidget />
    </div>
  )
}
