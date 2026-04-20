const C = {
  primary: '#1a8a7b',
  dark:    '#136b5e',
  navy:    '#0a1628',
  bright:  '#00d4aa',
}

const LINK_MENSAL = 'https://www.asaas.com/c/4epvfjvcrd972nhj'
const LINK_ANUAL  = 'https://www.asaas.com/c/wunwu9j1pwe69aj9'

export default function ModalUpgrade({ onClose, motivo = 'upgrade' }) {
  const titulo = motivo === 'trial_expirado'
    ? 'Seu período de teste encerrou'
    : 'Desbloqueie o plano Pro'

  const subtitulo = motivo === 'trial_expirado'
    ? 'Continue usando o Meu Consultório SorrIA com acesso completo e ilimitado.'
    : 'Acesso ilimitado a todos os módulos por menos do que uma consulta por mês.'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(10,22,40,.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 24, padding: '40px 36px',
          maxWidth: 520, width: '100%',
          boxShadow: '0 32px 80px rgba(10,22,40,.25)',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          position: 'relative',
        }}
      >
        {/* Fechar */}
        {motivo !== 'trial_expirado' && (
          <button onClick={onClose} style={{
            position: 'absolute', top: 16, right: 16,
            background: '#f3f4f6', border: 'none', borderRadius: '50%',
            width: 32, height: 32, cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280',
          }}>×</button>
        )}

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #f0fdf9, #dcfce7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
          }}>⭐</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, marginBottom: 8, letterSpacing: '-0.02em' }}>
            {titulo}
          </h2>
          <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, maxWidth: 380, margin: '0 auto' }}>
            {subtitulo}
          </p>
        </div>

        {/* Planos */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
          {/* Anual — destaque */}
          <a href={LINK_ANUAL} target="_blank" rel="noopener noreferrer" style={{
            flex: 1, textDecoration: 'none',
            background: `linear-gradient(160deg, ${C.navy} 0%, #1a2e2b 100%)`,
            borderRadius: 16, padding: '20px 18px',
            border: `2px solid ${C.bright}`,
            position: 'relative', overflow: 'hidden',
            transition: 'transform .15s, box-shadow .15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(10,22,40,.3)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <div style={{
              position: 'absolute', top: -30, right: -30, width: 100, height: 100,
              borderRadius: '50%', background: 'rgba(0,212,170,.08)',
            }} />
            <div style={{
              display: 'inline-flex', background: 'rgba(0,212,170,.15)', border: '1px solid rgba(0,212,170,.3)',
              borderRadius: 99, padding: '3px 10px', marginBottom: 10,
            }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.bright }}>⭐ MAIS POPULAR</span>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginBottom: 4 }}>Plano Anual</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', fontWeight: 600 }}>R$</span>
              <span style={{ fontSize: 34, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.03em' }}>72</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>/mês</span>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 14 }}>
              R$870/ano — pague 10, use 12
            </div>
            <div style={{
              width: '100%', padding: '10px 0', borderRadius: 10, border: 'none',
              background: `linear-gradient(135deg, ${C.primary}, ${C.bright})`,
              color: '#fff', fontWeight: 700, fontSize: 13, textAlign: 'center',
              display: 'block',
            }}>
              Assinar Anual →
            </div>
          </a>

          {/* Mensal */}
          <a href={LINK_MENSAL} target="_blank" rel="noopener noreferrer" style={{
            flex: 1, textDecoration: 'none',
            background: '#fff', borderRadius: 16, padding: '20px 18px',
            border: '1.5px solid #e5e7eb',
            transition: 'transform .15s, box-shadow .15s, border-color .15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = C.primary }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#e5e7eb' }}
          >
            <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4, marginTop: 28 }}>Plano Mensal</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>R$</span>
              <span style={{ fontSize: 34, fontWeight: 900, color: C.navy, lineHeight: 1, letterSpacing: '-0.03em' }}>87</span>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>/mês</span>
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 14 }}>
              cobrado mensalmente
            </div>
            <div style={{
              width: '100%', padding: '10px 0', borderRadius: 10,
              background: `linear-gradient(135deg, ${C.primary}, ${C.dark})`,
              color: '#fff', fontWeight: 700, fontSize: 13, textAlign: 'center',
              display: 'block',
            }}>
              Assinar Mensal →
            </div>
          </a>
        </div>

        {/* Benefícios */}
        <div style={{ background: '#f9fafb', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
          {[
            '✓ Pacientes ilimitados',
            '✓ Todos os módulos liberados',
            '✓ Agenda + WhatsApp integrados',
            '✓ Suporte por e-mail',
          ].map(b => (
            <div key={b} style={{ fontSize: 13, color: '#374151', marginBottom: 6, fontWeight: 500 }}>{b}</div>
          ))}
        </div>

        <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
          Pagamento seguro via Asaas · PIX, cartão ou boleto · Cancele quando quiser
        </p>
      </div>
    </div>
  )
}
