import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

/* ── Tokens ─────────────────────────────────────────────────────────────────── */
const C = {
  white:    '#FFFFFF',
  bg:       '#F7FFFE',
  dark:     '#1a2e2b',
  teal:     '#1a8a7b',
  tealDark: '#147068',
  tealPale: '#E6F4F2',
  tealGlow: 'rgba(26,138,123,0.14)',
  text:     '#1a2e2b',
  muted:    '#5d7370',
  border:   'rgba(26,138,123,0.13)',
  gray:     '#F1F7F6',
}

/* ── Global CSS ─────────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .lp { font-family: 'DM Sans', sans-serif; color: ${C.text}; background: ${C.white}; }

  /* ── Navbar ── */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 200;
    height: 68px; padding: 0 5%;
    display: flex; align-items: center; justify-content: space-between;
    transition: background .35s ease, box-shadow .35s ease;
  }
  .nav.scrolled {
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(14px);
    box-shadow: 0 1px 0 ${C.border};
  }
  .nav-logo { display: flex; align-items: center; gap: 9px; text-decoration: none; }
  .nav-logo-mark {
    width: 34px; height: 34px; border-radius: 9px;
    background: linear-gradient(135deg, ${C.teal}, ${C.tealDark});
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 12px rgba(26,138,123,0.35);
  }
  .nav-logo-text { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 17px; font-weight: 800; color: ${C.dark}; letter-spacing: -0.01em; }
  .nav-logo-sub { font-size: 10px; font-weight: 500; color: ${C.muted}; letter-spacing: .06em; text-transform: uppercase; }
  .nav-links { display: flex; align-items: center; gap: 32px; }
  .nav-link { font-size: 14px; font-weight: 500; color: ${C.muted}; text-decoration: none; transition: color .2s; }
  .nav-link:hover { color: ${C.teal}; }
  .nav-actions { display: flex; align-items: center; gap: 10px; }
  .btn-nav-ghost { padding: 7px 18px; border: none; background: transparent; color: ${C.muted}; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; border-radius: 7px; transition: color .2s, background .2s; }
  .btn-nav-ghost:hover { color: ${C.teal}; background: ${C.tealPale}; }
  .btn-nav-cta { padding: 8px 22px; border: none; border-radius: 8px; background: ${C.teal}; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; letter-spacing: .01em; box-shadow: 0 3px 12px rgba(26,138,123,.3); transition: background .2s, transform .15s, box-shadow .15s; }
  .btn-nav-cta:hover { background: ${C.tealDark}; transform: translateY(-1px); box-shadow: 0 5px 18px rgba(26,138,123,.38); }

  /* ── Hero ── */
  .hero {
    min-height: 100vh; padding: 100px 5% 80px;
    display: flex; align-items: center; gap: 60px;
    background: linear-gradient(150deg, #ffffff 0%, ${C.bg} 60%, #e8f4f2 100%);
    position: relative; overflow: hidden;
  }
  .hero::before {
    content: ''; position: absolute; top: -180px; right: -180px;
    width: 700px; height: 700px; border-radius: 50%;
    background: radial-gradient(circle, rgba(26,138,123,.07) 0%, transparent 65%);
    pointer-events: none;
  }
  .hero::after {
    content: ''; position: absolute; bottom: -100px; left: 5%;
    width: 400px; height: 400px; border-radius: 50%;
    background: radial-gradient(circle, rgba(26,138,123,.05) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-left { flex: 0 0 auto; max-width: 520px; position: relative; z-index: 1; }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 7px; margin-bottom: 28px;
    padding: 5px 14px 5px 7px; border-radius: 99px;
    background: ${C.tealPale}; border: 1px solid ${C.border};
  }
  .hero-badge-dot { width: 7px; height: 7px; border-radius: 50%; background: ${C.teal}; }
  .hero-badge-text { font-size: 12px; font-weight: 600; color: ${C.teal}; letter-spacing: .02em; }
  .hero-h1 {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: clamp(36px, 4.5vw, 58px); font-weight: 800;
    color: ${C.dark}; line-height: 1.08; margin-bottom: 22px; letter-spacing: -0.03em;
  }
  .hero-h1 span { color: ${C.teal}; }
  .hero-p { font-size: 16px; color: ${C.muted}; line-height: 1.75; margin-bottom: 38px; max-width: 440px; font-weight: 400; }
  .hero-ctas { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 36px; }
  .btn-hero-primary {
    padding: 13px 30px; border-radius: 10px; border: none;
    background: ${C.teal}; color: #fff; font-family: 'DM Sans', sans-serif;
    font-size: 15px; font-weight: 600; cursor: pointer; letter-spacing: .01em;
    box-shadow: 0 6px 22px rgba(26,138,123,.38);
    transition: background .2s, transform .15s, box-shadow .15s;
    display: flex; align-items: center; gap: 8px;
  }
  .btn-hero-primary:hover { background: ${C.tealDark}; transform: translateY(-2px); box-shadow: 0 10px 30px rgba(26,138,123,.45); }
  .btn-hero-outline {
    padding: 13px 26px; border-radius: 10px;
    border: 1.5px solid ${C.border}; background: #fff;
    color: ${C.dark}; font-family: 'DM Sans', sans-serif;
    font-size: 15px; font-weight: 500; cursor: pointer;
    transition: border-color .2s, color .2s, background .2s;
    display: flex; align-items: center; gap: 8px;
  }
  .btn-hero-outline:hover { border-color: ${C.teal}; color: ${C.teal}; background: ${C.tealPale}; }
  .hero-trust { display: flex; align-items: center; gap: 16px; }
  .hero-stars { color: #F59E0B; font-size: 14px; letter-spacing: 1px; }
  .hero-trust-text { font-size: 13px; color: ${C.muted}; font-weight: 400; }

  /* ── Hero right / Mockup ── */
  .hero-right { flex: 1; position: relative; z-index: 1; display: flex; justify-content: center; }
  .mockup-wrap {
    width: 100%; max-width: 560px;
    border-radius: 18px; overflow: hidden;
    box-shadow: 0 32px 80px rgba(26,46,43,.2), 0 0 0 1px rgba(26,46,43,.06);
    animation: mockupFloat 5s ease-in-out infinite;
    position: relative;
  }
  .mockup-bar {
    background: #e8eae9; padding: 10px 14px;
    display: flex; align-items: center; gap: 12px;
  }
  .mockup-dots { display: flex; gap: 5px; }
  .mockup-dot { width: 10px; height: 10px; border-radius: 50%; }
  .mockup-url {
    flex: 1; background: #f5f5f4; border-radius: 5px; padding: 4px 10px;
    font-family: 'DM Sans', sans-serif; font-size: 11px; color: #7a7a78; max-width: 260px; margin: 0 auto;
    display: flex; align-items: center; gap: 5px;
  }
  .mockup-body { display: flex; height: 380px; }
  /* Mini sidebar */
  .mock-sidebar {
    width: 88px; background: ${C.dark};
    display: flex; flex-direction: column; align-items: center;
    padding: 14px 0; gap: 6px; flex-shrink: 0;
  }
  .mock-logo {
    width: 34px; height: 34px; border-radius: 8px;
    background: linear-gradient(135deg,${C.teal},${C.tealDark});
    margin-bottom: 12px; display: flex; align-items: center; justify-content: center;
  }
  .mock-nav-item {
    width: 68px; padding: 7px 0; border-radius: 8px;
    display: flex; flex-direction: column; align-items: center; gap: 3px; cursor: default;
    transition: background .2s;
  }
  .mock-nav-item.active { background: rgba(255,255,255,.1); }
  .mock-nav-dot { width: 16px; height: 16px; border-radius: 4px; }
  .mock-nav-label { font-family: 'DM Sans', sans-serif; font-size: 8px; color: rgba(255,255,255,.5); text-align: center; }
  .mock-nav-item.active .mock-nav-label { color: rgba(255,255,255,.9); }
  /* Mini main */
  .mock-main { flex: 1; background: ${C.bg}; padding: 14px; overflow: hidden; }
  .mock-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .mock-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 700; color: ${C.dark}; }
  .mock-avatar { width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg,${C.teal},${C.tealDark}); }
  .mock-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-bottom: 10px; }
  .mock-stat { background: #fff; border-radius: 10px; padding: 10px; border: 1px solid ${C.border}; }
  .mock-stat-val { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 16px; font-weight: 800; color: ${C.dark}; line-height: 1; margin-bottom: 3px; }
  .mock-stat-label { font-size: 8px; color: ${C.muted}; font-weight: 400; }
  .mock-stat-icon { width: 18px; height: 18px; border-radius: 4px; background: ${C.tealPale}; margin-bottom: 6px; }
  .mock-panel { background: #fff; border-radius: 10px; padding: 10px 12px; border: 1px solid ${C.border}; }
  .mock-panel-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 9px; font-weight: 700; color: ${C.dark}; margin-bottom: 8px; text-transform: uppercase; letter-spacing: .05em; }
  .mock-row { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; }
  .mock-row + .mock-row { border-top: 1px solid ${C.gray}; }
  .mock-row-left { display: flex; align-items: center; gap: 7px; }
  .mock-avatar-sm { width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0; }
  .mock-row-name { font-size: 9px; font-weight: 500; color: ${C.dark}; }
  .mock-row-date { font-size: 8px; color: ${C.muted}; }
  .mock-tag { font-size: 7px; font-weight: 600; padding: 2px 6px; border-radius: 4px; }
  .mock-tag.c { background: ${C.tealPale}; color: ${C.teal}; }
  .mock-tag.o { background: rgba(245,158,11,.1); color: #d97706; }
  .mock-tag.r { background: rgba(139,92,246,.1); color: #7c3aed; }

  /* ── Features ── */
  .features { padding: 120px 5%; background: ${C.white}; }
  .features-inner { max-width: 1100px; margin: 0 auto; }
  .section-label { font-size: 11px; font-weight: 700; color: ${C.teal}; letter-spacing: .1em; text-transform: uppercase; margin-bottom: 14px; }
  .section-h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(28px,3.5vw,44px); font-weight: 800; color: ${C.dark}; letter-spacing: -0.025em; line-height: 1.1; margin-bottom: 14px; }
  .section-sub { font-size: 16px; color: ${C.muted}; max-width: 480px; line-height: 1.7; margin-bottom: 64px; }
  .features-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
  .feat-card {
    padding: 28px 24px; border-radius: 16px;
    border: 1.5px solid ${C.border}; background: ${C.white};
    transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease, background .25s ease;
    cursor: default;
  }
  .feat-card:hover { transform: translateY(-5px); box-shadow: 0 16px 40px rgba(26,138,123,.1); border-color: rgba(26,138,123,.28); background: ${C.bg}; }
  .feat-icon { width: 48px; height: 48px; border-radius: 13px; background: ${C.tealPale}; display: flex; align-items: center; justify-content: center; color: ${C.teal}; margin-bottom: 18px; transition: background .25s; }
  .feat-card:hover .feat-icon { background: rgba(26,138,123,.18); }
  .feat-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; font-weight: 700; color: ${C.dark}; margin-bottom: 8px; letter-spacing: -0.01em; }
  .feat-desc { font-size: 14px; color: ${C.muted}; line-height: 1.65; font-weight: 400; }

  /* ── CTA Banner ── */
  .cta-banner {
    margin: 0 5% 100px; border-radius: 24px;
    background: linear-gradient(135deg, ${C.dark} 0%, #243f3b 100%);
    padding: 80px 8%; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 40px;
    position: relative; overflow: hidden;
  }
  .cta-banner::before {
    content: ''; position: absolute; top: -80px; right: -80px;
    width: 320px; height: 320px; border-radius: 50%;
    background: radial-gradient(circle, rgba(26,138,123,.25) 0%, transparent 70%);
  }
  .cta-banner::after {
    content: ''; position: absolute; bottom: -60px; left: 10%;
    width: 220px; height: 220px; border-radius: 50%;
    background: radial-gradient(circle, rgba(26,138,123,.15) 0%, transparent 70%);
  }
  .cta-banner-text { position: relative; z-index: 1; }
  .cta-banner-h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(24px,3vw,38px); font-weight: 800; color: #fff; letter-spacing: -0.025em; margin-bottom: 12px; }
  .cta-banner-p { font-size: 15px; color: rgba(255,255,255,.6); max-width: 400px; line-height: 1.7; }
  .cta-banner-actions { display: flex; gap: 12px; flex-wrap: wrap; position: relative; z-index: 1; }
  .btn-cta-white { padding: 13px 30px; border-radius: 10px; border: none; background: #fff; color: ${C.dark}; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; transition: transform .15s, box-shadow .15s; }
  .btn-cta-white:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.15); }
  .btn-cta-outline { padding: 13px 26px; border-radius: 10px; border: 1.5px solid rgba(255,255,255,.25); background: transparent; color: rgba(255,255,255,.85); font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500; cursor: pointer; transition: border-color .2s, color .2s; }
  .btn-cta-outline:hover { border-color: rgba(255,255,255,.6); color: #fff; }

  /* ── Footer ── */
  .footer { background: ${C.dark}; padding: 60px 5% 36px; }
  .footer-top { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 36px; margin-bottom: 56px; }
  .footer-brand-name { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
  .footer-brand-desc { font-size: 13px; color: rgba(255,255,255,.35); max-width: 240px; line-height: 1.75; font-weight: 300; }
  .footer-col-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; font-weight: 700; color: rgba(255,255,255,.5); letter-spacing: .07em; text-transform: uppercase; margin-bottom: 16px; }
  .footer-links { display: flex; flex-direction: column; gap: 10px; }
  .footer-link { font-size: 13px; color: rgba(255,255,255,.4); text-decoration: none; font-weight: 400; transition: color .2s; }
  .footer-link:hover { color: rgba(255,255,255,.8); }
  .footer-bottom { border-top: 1px solid rgba(255,255,255,.07); padding-top: 28px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
  .footer-copy { font-size: 12px; color: rgba(255,255,255,.2); font-weight: 300; }
  .footer-badge { font-size: 11px; color: ${C.teal}; background: rgba(26,138,123,.15); padding: 4px 10px; border-radius: 99px; font-weight: 500; }

  /* ── Keyframes ── */
  @keyframes mockupFloat {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-10px); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .hero-left > * { animation: fadeUp .6s ease both; }
  .hero-left > *:nth-child(1) { animation-delay: .05s; }
  .hero-left > *:nth-child(2) { animation-delay: .12s; }
  .hero-left > *:nth-child(3) { animation-delay: .19s; }
  .hero-left > *:nth-child(4) { animation-delay: .26s; }
  .hero-left > *:nth-child(5) { animation-delay: .33s; }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .hero { flex-direction: column; padding-top: 110px; gap: 48px; }
    .hero-right { width: 100%; }
    .mockup-wrap { max-width: 100%; }
    .nav-links { display: none; }
    .cta-banner { text-align: center; justify-content: center; }
    .cta-banner-p { margin: 0 auto; }
    .features-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 560px) {
    .features-grid { grid-template-columns: 1fr; }
    .precos-grid { grid-template-columns: 1fr; }
  }
`

/* ── SVG Icons ──────────────────────────────────────────────────────────────── */
const Icon = {
  prontuario: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="12" y2="16"/><line x1="12" y1="6" x2="12" y2="10"/></svg>,
  orcamento:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>,
  receituario:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h2l2 4 2-4h2"/><line x1="9" y1="17" x2="13" y2="17"/></svg>,
  agenda:     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/><circle cx="8" cy="14" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="14" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="14" r="1" fill="currentColor" stroke="none"/></svg>,
  ia:         <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M19.07 4.93l-2.12 2.12M7.05 16.95l-2.12 2.12"/></svg>,
  whatsapp:   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="11" x2="15" y2="11"/></svg>,
  arrow:      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="2" y1="7" x2="12" y2="7"/><polyline points="8,3 12,7 8,11"/></svg>,
  play:       <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><polygon points="3,2 12,7 3,12"/></svg>,
  lock:       <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><rect x="1.5" y="4.5" width="7" height="5" rx="1"/><path d="M3 4.5V3a2 2 0 0 1 4 0v1.5"/></svg>,
}

/* ── Dashboard Mockup ───────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { label: 'Dashboard',  color: C.teal,            active: true },
  { label: 'Pacientes',  color: 'rgba(255,255,255,.3)', active: false },
  { label: 'Agenda',     color: 'rgba(255,255,255,.3)', active: false },
  { label: 'Orçamentos', color: 'rgba(255,255,255,.3)', active: false },
  { label: 'Documentos', color: 'rgba(255,255,255,.3)', active: false },
]
const STATS = [
  { val: '47',   label: 'Pacientes',    col: C.teal },
  { val: '12',   label: 'Consultas',    col: '#7c3aed' },
  { val: 'R$8k', label: 'Orçamentos',   col: '#d97706' },
]
const PATIENTS = [
  { name: 'Ana Souza',   date: '14/04', tag: 'Consulta',  tc: 'c', bg: 'rgba(100,168,156,.15)' },
  { name: 'Pedro Lima',  date: '12/04', tag: 'Orçamento', tc: 'o', bg: 'rgba(217,119,6,.13)' },
  { name: 'Carla Melo',  date: '10/04', tag: 'Retorno',   tc: 'r', bg: 'rgba(124,58,237,.13)' },
]

function DashboardMockup() {
  return (
    <div className="mockup-wrap">
      {/* Browser chrome */}
      <div className="mockup-bar">
        <div className="mockup-dots">
          {['#FF5F57','#FFBD2E','#28C940'].map(c => (
            <div key={c} className="mockup-dot" style={{ background: c }} />
          ))}
        </div>
        <div className="mockup-url">
          <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round"><rect x="1.5" y="4.5" width="7" height="5" rx="1"/><path d="M3 4.5V3a2 2 0 0 1 4 0v1.5"/></svg>
          meu-consultorio.app/dashboard
        </div>
      </div>

      {/* App body */}
      <div className="mockup-body">
        {/* Mini sidebar */}
        <div className="mock-sidebar">
          <div className="mock-logo">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M10 2C7 2 4.5 4.5 4.5 7.5c0 2 1 3.8 2.5 4.8L10 18l3-5.7c1.5-1 2.5-2.8 2.5-4.8C15.5 4.5 13 2 10 2z" fill="white" opacity=".9"/>
            </svg>
          </div>
          {NAV_ITEMS.map(item => (
            <div key={item.label} className={`mock-nav-item${item.active ? ' active' : ''}`}>
              <div className="mock-nav-dot" style={{ background: item.active ? C.teal : 'rgba(255,255,255,.15)' }} />
              <span className="mock-nav-label">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="mock-main">
          <div className="mock-header">
            <div>
              <div className="mock-title">Bom dia, Dr. Silva 👋</div>
              <div style={{ fontSize: 8, color: C.muted, marginTop: 1 }}>Sábado, 19 de abril</div>
            </div>
            <div className="mock-avatar" />
          </div>

          <div className="mock-stats">
            {STATS.map(s => (
              <div key={s.label} className="mock-stat">
                <div className="mock-stat-icon" style={{ background: `${s.col}22` }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: 4, background: `${s.col}33` }} />
                </div>
                <div className="mock-stat-val" style={{ color: s.col }}>{s.val}</div>
                <div className="mock-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="mock-panel">
            <div className="mock-panel-title">Pacientes recentes</div>
            {PATIENTS.map(p => (
              <div key={p.name} className="mock-row">
                <div className="mock-row-left">
                  <div className="mock-avatar-sm" style={{ background: p.bg }} />
                  <div>
                    <div className="mock-row-name">{p.name}</div>
                    <div className="mock-row-date">{p.date}</div>
                  </div>
                </div>
                <span className={`mock-tag ${p.tc}`}>{p.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Navbar ─────────────────────────────────────────────────────────────────── */
function Navbar({ onLogin }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 36)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
      <a href="/" className="nav-logo">
        <div className="nav-logo-mark">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M10 2C7 2 4.5 4.5 4.5 7.5c0 2 1 3.8 2.5 4.8L10 18l3-5.7c1.5-1 2.5-2.8 2.5-4.8C15.5 4.5 13 2 10 2z" fill="white"/>
          </svg>
        </div>
        <div>
          <div className="nav-logo-text">SorrIA</div>
          <div className="nav-logo-sub">Meu Consultório</div>
        </div>
      </a>

      <div className="nav-links">
        <a href="#funcionalidades" className="nav-link">Funcionalidades</a>
        <a href="#precos"          className="nav-link">Preços</a>
        <a href="#contato"         className="nav-link">Contato</a>
      </div>

      <div className="nav-actions">
        <button onClick={onLogin} className="btn-nav-ghost">Entrar</button>
        <button onClick={onLogin} className="btn-nav-cta">Começar grátis</button>
      </div>
    </nav>
  )
}

/* ── Hero ───────────────────────────────────────────────────────────────────── */
function Hero({ onLogin }) {
  return (
    <section className="hero">
      <div className="hero-left">
        <div className="hero-badge">
          <div className="hero-badge-dot" />
          <span className="hero-badge-text">Novo · Sistema com IA para dentistas</span>
        </div>

        <h1 className="hero-h1">
          Gerencie sua clínica com <span>inteligência artificial</span>
        </h1>

        <p className="hero-p">
          Prontuário, agenda, orçamentos, receituário e a SorrIA — sua assistente virtual —
          tudo em um sistema simples, rápido e elegante.
        </p>

        <div className="hero-ctas">
          <button onClick={onLogin} className="btn-hero-primary">
            Começar gratuitamente {Icon.arrow}
          </button>
          <button onClick={onLogin} className="btn-hero-outline">
            {Icon.play} Ver demonstração
          </button>
        </div>

        <div className="hero-trust">
          <span className="hero-stars">★★★★★</span>
          <span className="hero-trust-text">Mais de 200 dentistas confiam no SorrIA</span>
        </div>
      </div>

      <div className="hero-right">
        <DashboardMockup />
      </div>
    </section>
  )
}

/* ── Features ───────────────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: 'prontuario',  title: 'Prontuário & Odontograma',   desc: 'Histórico completo com odontograma FDI interativo, anamnese digital e evolução clínica.' },
  { icon: 'orcamento',   title: 'Orçamentos profissionais',   desc: 'Gere orçamentos em PDF com 70+ procedimentos, desconto PIX e parcelamento automático.' },
  { icon: 'receituario', title: 'Receituário e Atestados',    desc: 'Documentos odontológicos com cabeçalho da clínica, assinatura digital e pronto para imprimir.' },
  { icon: 'agenda',      title: 'Agenda integrada',           desc: 'Sincronize com Google Calendar, veja a semana completa e gerencie confirmações de consulta.' },
  { icon: 'ia',          title: 'SorrIA — Sua IA Receptora',  desc: 'Assistente virtual que confirma consultas, responde pacientes e organiza sua rotina automaticamente.' },
  { icon: 'whatsapp',    title: 'WhatsApp integrado',         desc: 'Acesse o WhatsApp do paciente com um clique direto do prontuário ou da agenda.' },
]

function Features() {
  return (
    <section id="funcionalidades" className="features">
      <div className="features-inner">
        <div className="section-label">Funcionalidades</div>
        <h2 className="section-h2">Tudo que sua clínica precisa</h2>
        <p className="section-sub">
          Um sistema completo e sem complicações — construído por quem entende a rotina odontológica.
        </p>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="feat-card">
              <div className="feat-icon">{Icon[f.icon]}</div>
              <div className="feat-title">{f.title}</div>
              <p className="feat-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── CTA Banner ─────────────────────────────────────────────────────────────── */
function CtaBanner({ onLogin }) {
  return (
    <div className="cta-banner" id="precos">
      <div className="cta-banner-text">
        <h2 className="cta-banner-h2">
          Comece grátis hoje mesmo
        </h2>
        <p className="cta-banner-p">
          Até 3 pacientes sem custo. Sem cartão de crédito. Sem burocracia.
          Quando precisar de mais, assine o Pro por R$&nbsp;59/mês.
        </p>
      </div>
      <div className="cta-banner-actions">
        <button onClick={onLogin} className="btn-cta-white">
          Criar conta grátis
        </button>
        <button onClick={onLogin} className="btn-cta-outline">
          Já tenho conta
        </button>
      </div>
    </div>
  )
}

/* ── Footer ─────────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="footer" id="contato">
      <div className="footer-top">
        <div>
          <div className="footer-brand-name">
            <div style={{ width: 28, height: 28, borderRadius: 7, background: `linear-gradient(135deg,${C.teal},${C.tealDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M10 2C7 2 4.5 4.5 4.5 7.5c0 2 1 3.8 2.5 4.8L10 18l3-5.7c1.5-1 2.5-2.8 2.5-4.8C15.5 4.5 13 2 10 2z" fill="white"/></svg>
            </div>
            SorrIA — Meu Consultório
          </div>
          <p className="footer-brand-desc">
            Sistema odontológico inteligente para dentistas brasileiros que querem mais resultado com menos trabalho.
          </p>
        </div>
        <div>
          <div className="footer-col-title">Sistema</div>
          <div className="footer-links">
            {['Prontuário','Agenda','Orçamentos','Receituário','SorrIA IA'].map(l => (
              <a key={l} href="#" className="footer-link">{l}</a>
            ))}
          </div>
        </div>
        <div>
          <div className="footer-col-title">Empresa</div>
          <div className="footer-links">
            {['Sobre','Preços','Contato','Blog','Suporte'].map(l => (
              <a key={l} href="#" className="footer-link">{l}</a>
            ))}
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span className="footer-copy">© {new Date().getFullYear()} SorrIA — Meu Consultório. Todos os direitos reservados.</span>
        <span className="footer-badge">consultoriosorria.com.br</span>
      </div>
    </footer>
  )
}

/* ── Page ───────────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate()
  const irParaLogin = () => navigate('/login')

  return (
    <div className="lp">
      <style>{CSS}</style>
      <Navbar   onLogin={irParaLogin} />
      <Hero     onLogin={irParaLogin} />
      <Features />
      <CtaBanner onLogin={irParaLogin} />
      <Footer />
    </div>
  )
}
