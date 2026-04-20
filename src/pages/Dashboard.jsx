import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { useGoogleCalendar } from '../hooks/useGoogleCalendar'
import { usePlano } from '../hooks/usePlano'
import ModalUpgrade from '../components/ModalUpgrade'

const C = { primary: '#1a8a7b', dark: '#136b5e', light: '#f0fdf4', border: '#e8f0ed' }

const card = {
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,.06)',
  border: '1px solid #e8f0ed',
}

export default function Dashboard() {
  const { profile, user } = useAuth()
  const navigate = useNavigate()
  const { isFree, isBlocked, trialAtivo, trialExpirado, diasTrial, total, LIMITE_FREE, podeAdicionarPaciente } = usePlano()

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
  const nome = profile?.nome?.split(' ')[0] || user?.email?.split('@')[0] || 'Dentista'

  const { isConnected: gcConnected, getEvents } = useGoogleCalendar()

  const [resumo, setResumo] = useState({
    pacientes: 0,
    emAnalise: 0, emAnaliseValor: 0,
    aprovados: 0, aprovadosValor: 0,
    documentos: 0,
  })
  const [consultasMes, setConsultasMes] = useState(null) // null = ainda não carregou
  const [orcamentosAbertos, setOrcamentosAbertos] = useState([])
  const [ultimosPacientes, setUltimosPacientes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [showUpgrade, setShowUpgrade] = useState(false)

  useEffect(() => {
    if (user?.id) carregarDados()
  }, [user?.id])

  useEffect(() => {
    if (!gcConnected) { setConsultasMes(null); return }
    const agora = new Date()
    const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 1)
    getEvents(agora.toISOString(), fimMes.toISOString()).then(evs => {
      setConsultasMes(evs.length)
    })
  }, [gcConnected, getEvents])

  async function carregarDados() {
    setCarregando(true)
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

    try {
      const [
        { count: totalPac },
        { data: emAnaliseRows },
        { data: aprovadosRows },
        { data: abertos },
        { data: ultPac },
      ] = await Promise.all([
        supabase.from('pacientes').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('orcamentos').select('valor_total').eq('user_id', user.id).in('status', ['em_analise', 'pendente']),
        supabase.from('orcamentos').select('valor_total').eq('user_id', user.id).eq('status', 'aprovado').gte('created_at', inicioMes),
        supabase.from('orcamentos').select('*, pacientes(nome, telefone)').eq('user_id', user.id).in('status', ['em_analise', 'pendente']).order('created_at', { ascending: true }),
        supabase.from('pacientes').select('id, nome, created_at, convenio').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      ])

      // Documentos: tenta consultar tabelas opcionais
      let documentos = 0
      try {
        const [{ count: cRec }, { count: cAtes }, { count: cExam }] = await Promise.all([
          supabase.from('receituarios').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', inicioMes),
          supabase.from('atestados').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', inicioMes),
          supabase.from('exames').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', inicioMes),
        ])
        documentos = (cRec || 0) + (cAtes || 0) + (cExam || 0)
      } catch (_) {}

      setResumo({
        pacientes: totalPac || 0,
        emAnalise: emAnaliseRows?.length || 0,
        emAnaliseValor: emAnaliseRows?.reduce((s, o) => s + parseFloat(o.valor_total || 0), 0) || 0,
        aprovados: aprovadosRows?.length || 0,
        aprovadosValor: aprovadosRows?.reduce((s, o) => s + parseFloat(o.valor_total || 0), 0) || 0,
        documentos,
      })
      setOrcamentosAbertos(abertos || [])
      setUltimosPacientes(ultPac || [])
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err)
    } finally {
      setCarregando(false)
    }
  }

  function diasEmAberto(created_at) {
    return Math.floor((new Date() - new Date(created_at)) / 86400000)
  }

  function corDias(dias) {
    if (dias > 7)  return { color: '#dc2626', fontWeight: 700, background: '#fee2e2', borderRadius: 6, padding: '2px 8px' }
    if (dias >= 3) return { color: '#d97706', fontWeight: 600, background: '#fef3c7', borderRadius: 6, padding: '2px 8px' }
    return { color: '#16a34a', fontWeight: 500, background: '#dcfce7', borderRadius: 6, padding: '2px 8px' }
  }

  function abrirWhatsApp(telefone) {
    const num = (telefone || '').replace(/\D/g, '')
    if (!num) { alert('Telefone não cadastrado para este paciente.'); return }
    window.open(`https://wa.me/55${num}`, '_blank')
  }

  const mesAtual = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  // ── Dados dos cards resumo ──────────────────────────────────────────────────
  const cards = [
    {
      icon: '👥', label: 'Total de Pacientes',
      valor: resumo.pacientes, sub: 'cadastrados',
      cor: C.primary, bg: '#f0fdf4',
    },
    {
      icon: '💰', label: 'Em Análise',
      valor: resumo.emAnalise,
      sub: resumo.emAnalise > 0 ? `R$ ${resumo.emAnaliseValor.toFixed(2)} em aberto` : 'nenhum pendente',
      cor: '#d97706', bg: '#fffbeb',
    },
    {
      icon: '✅', label: 'Aprovados no Mês',
      valor: resumo.aprovados,
      sub: resumo.aprovados > 0 ? `R$ ${resumo.aprovadosValor.toFixed(2)} em ${mesAtual}` : `em ${mesAtual}`,
      cor: '#16a34a', bg: '#f0fdf4',
    },
    {
      icon: '📄', label: 'Documentos Gerados',
      valor: resumo.documentos, sub: `neste mês`,
      cor: '#7c3aed', bg: '#faf5ff',
    },
    {
      icon: '📅', label: 'Consultas Agendadas',
      valor: gcConnected ? (consultasMes ?? '…') : '—',
      sub: gcConnected ? 'restantes este mês' : 'Conecte o Google Calendar nas Configurações',
      cor: '#2563eb', bg: '#eff6ff',
    },
  ]

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100%' }}>
      {showUpgrade && <ModalUpgrade motivo={trialExpirado ? 'trial_expirado' : 'upgrade'} onClose={() => setShowUpgrade(false)} />}
      {/* Saudação */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{saudacao}, Dr(a). {nome}! 👋</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={carregarDados}
          style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13, color: '#6b7280' }}
        >
          🔄 Atualizar
        </button>
      </div>

      {/* Banner trial ativo */}
      {trialAtivo && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
          background: 'linear-gradient(135deg, #f0fdf9, #e6f7f4)',
          border: '1.5px solid #a7f3d0',
          borderRadius: 12, padding: '14px 20px', marginBottom: 20,
        }}>
          <div style={{ fontSize: 22 }}>⏳</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#065f46' }}>
              Teste gratuito — {diasTrial} dia{diasTrial !== 1 ? 's' : ''} restante{diasTrial !== 1 ? 's' : ''}
            </div>
            <div style={{ fontSize: 13, color: '#047857', marginTop: 2 }}>
              Você tem acesso completo a todos os recursos. Assine o Pro para continuar após o período de teste.
            </div>
          </div>
          <button
            onClick={() => setShowUpgrade(true)}
            style={{ padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', background: C.primary, color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0, boxShadow: '0 2px 8px rgba(26,138,123,.3)' }}
          >
            ⭐ Ver planos
          </button>
        </div>
      )}

      {/* Banner trial expirado */}
      {trialExpirado && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
          background: '#fff7ed',
          border: '1.5px solid #fb923c',
          borderRadius: 12, padding: '14px 20px', marginBottom: 20,
        }}>
          <div style={{ fontSize: 22 }}>🔒</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#9a3412' }}>
              Seu período de teste encerrou
            </div>
            <div style={{ fontSize: 13, color: '#c2410c', marginTop: 2 }}>
              Assine o plano Pro por R$ 59/mês para continuar usando o sistema completo.
            </div>
          </div>
          <button
            onClick={() => setShowUpgrade(true)}
            style={{ padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#ea580c', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}
          >
            🔓 Assinar Pro
          </button>
        </div>
      )}

      {/* Banner plano free (legado) */}
      {isFree && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
          background: !podeAdicionarPaciente ? '#fff7ed' : '#f0fdf4',
          border: `1.5px solid ${!podeAdicionarPaciente ? '#fb923c' : '#86efac'}`,
          borderRadius: 12, padding: '12px 18px', marginBottom: 20,
        }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: !podeAdicionarPaciente ? '#9a3412' : '#166534' }}>
                {!podeAdicionarPaciente ? '🚫 Limite atingido' : '👥 Plano Gratuito'}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: !podeAdicionarPaciente ? '#ea580c' : C.primary }}>
                {total}/{LIMITE_FREE} pacientes
              </span>
            </div>
            <div style={{ height: 5, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min((total / LIMITE_FREE) * 100, 100)}%`,
                background: !podeAdicionarPaciente ? 'linear-gradient(90deg, #f97316, #ef4444)' : 'linear-gradient(90deg, #1a8a7b, #34d399)',
                borderRadius: 99,
              }} />
            </div>
          </div>
          <button
            onClick={() => navigate('/configuracoes')}
            style={{ padding: '7px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', background: !podeAdicionarPaciente ? '#ea580c' : C.primary, color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}
          >
            ⭐ Fazer Upgrade
          </button>
        </div>
      )}

      {/* ── SEÇÃO 1: Cards de Resumo ──────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        {cards.map(c => (
          <div key={c.label} style={{ ...card, padding: '20px 22px', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', top: 14, right: 16,
              fontSize: 28, opacity: 0.18,
            }}>{c.icon}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8, fontWeight: 500 }}>{c.label}</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: c.cor, lineHeight: 1 }}>
              {carregando ? <span style={{ fontSize: 20, color: '#d1d5db' }}>…</span> : c.valor}
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>{c.sub}</div>
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: 3, background: c.cor, opacity: 0.25, borderRadius: '0 0 12px 12px',
            }} />
          </div>
        ))}
      </div>

      {/* ── SEÇÃO 2: Orçamentos em Análise ───────────────────────────────── */}
      <div style={{ ...card, marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 16, color: '#1f2937', margin: 0 }}>🔔 Orçamentos Aguardando Retorno</h2>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '2px 0 0' }}>Ordenados por prioridade — mais antigos primeiro</p>
          </div>
          <button
            onClick={() => navigate('/orcamento')}
            style={{ background: C.light, color: C.primary, border: `1px solid #a7f3d0`, borderRadius: 7, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            Ver todos →
          </button>
        </div>

        {carregando ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>Carregando...</div>
        ) : orcamentosAbertos.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
            <div style={{ fontSize: 14 }}>Nenhum orçamento aguardando retorno</div>
          </div>
        ) : (
          <>
            {/* Cabeçalho tabela */}
            <div style={{
              display: 'grid', gridTemplateColumns: '110px 1fr 120px 110px 44px',
              padding: '8px 22px', background: '#f8fafc',
              fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              <span>Data</span>
              <span>Paciente</span>
              <span style={{ textAlign: 'right' }}>Valor</span>
              <span style={{ textAlign: 'center' }}>Dias em aberto</span>
              <span />
            </div>

            {orcamentosAbertos.map((orc, idx) => {
              const dias = diasEmAberto(orc.created_at)
              const pacNome = orc.pacientes?.nome || '—'
              const telefone = orc.pacientes?.telefone || ''
              return (
                <div
                  key={orc.id}
                  style={{
                    display: 'grid', gridTemplateColumns: '110px 1fr 120px 110px 44px',
                    alignItems: 'center', padding: '12px 22px',
                    borderBottom: idx < orcamentosAbertos.length - 1 ? '1px solid #f9fafb' : 'none',
                    background: dias > 7 ? '#fff5f5' : '#fff',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = dias > 7 ? '#fee2e2' : '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = dias > 7 ? '#fff5f5' : '#fff'}
                >
                  <span style={{ fontSize: 13, color: '#6b7280' }}>
                    {new Date(orc.created_at).toLocaleDateString('pt-BR')}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>{pacNome}</span>
                  <span style={{ textAlign: 'right', fontWeight: 700, color: C.primary, fontSize: 14 }}>
                    R$ {parseFloat(orc.valor_total || 0).toFixed(2)}
                  </span>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: 12, ...corDias(dias) }}>
                      {dias === 0 ? 'hoje' : `${dias}d`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button
                      onClick={() => abrirWhatsApp(telefone)}
                      title={telefone ? `WhatsApp: ${telefone}` : 'Telefone não cadastrado'}
                      style={{
                        width: 32, height: 32, borderRadius: 8, border: 'none',
                        background: telefone ? '#25D366' : '#e5e7eb',
                        color: '#fff', fontSize: 15, cursor: telefone ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      💬
                    </button>
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>

      {/* ── SEÇÕES 3 e 4 em grid ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 8 }}>

        {/* Seção 3: Últimos Pacientes */}
        <div style={card}>
          <div style={{ padding: '18px 22px 12px', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ fontWeight: 700, fontSize: 16, color: '#1f2937', margin: 0 }}>👥 Últimos Pacientes Cadastrados</h2>
          </div>

          {carregando ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>Carregando...</div>
          ) : ultimosPacientes.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🦷</div>
              <div style={{ fontSize: 13 }}>Nenhum paciente cadastrado</div>
              <button
                onClick={() => navigate('/prontuario')}
                style={{ marginTop: 12, background: C.primary, color: '#fff', border: 'none', borderRadius: 7, padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                + Cadastrar paciente
              </button>
            </div>
          ) : (
            <div style={{ padding: '8px 0' }}>
              {ultimosPacientes.map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => navigate('/prontuario')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 22px', cursor: 'pointer',
                    borderBottom: idx < ultimosPacientes.length - 1 ? '1px solid #f9fafb' : 'none',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: `linear-gradient(135deg, ${C.primary}, #3182ce)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 14,
                  }}>
                    {p.nome?.charAt(0)?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.nome}
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>
                      {p.convenio ? `${p.convenio} · ` : ''}
                      {p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : ''}
                    </div>
                  </div>
                  <span style={{ fontSize: 14, color: '#d1d5db' }}>›</span>
                </div>
              ))}
              <div style={{ padding: '12px 22px' }}>
                <button
                  onClick={() => navigate('/prontuario')}
                  style={{ width: '100%', background: C.light, color: C.primary, border: `1px solid #a7f3d0`, borderRadius: 7, padding: '8px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Ver todos os pacientes →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Seção 4: Atalhos Rápidos */}
        <div style={card}>
          <div style={{ padding: '18px 22px 12px', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ fontWeight: 700, fontSize: 16, color: '#1f2937', margin: 0 }}>⚡ Acesso Rápido</h2>
          </div>
          <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: '+ Novo Paciente',  icon: '🦷', path: '/prontuario',  cor: C.primary, bg: C.light,    border: '#a7f3d0' },
              { label: '+ Novo Orçamento', icon: '💰', path: '/orcamento',   cor: '#d97706', bg: '#fffbeb',  border: '#fcd34d' },
              { label: '+ Receituário',    icon: '💊', path: '/receituario', cor: '#7c3aed', bg: '#faf5ff',  border: '#c4b5fd' },
              { label: '+ Atestado',       icon: '📋', path: '/atestado',    cor: '#ea580c', bg: '#fff7ed',  border: '#fed7aa' },
            ].map(a => (
              <button
                key={a.path}
                onClick={() => navigate(a.path)}
                style={{
                  background: a.bg, border: `1.5px solid ${a.border}`,
                  borderRadius: 10, padding: '16px 14px', textAlign: 'left',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.1)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>{a.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: a.cor }}>{a.label}</div>
              </button>
            ))}
          </div>

          {/* Exames como botão largo */}
          <div style={{ padding: '0 16px 16px' }}>
            <button
              onClick={() => navigate('/exames')}
              style={{
                width: '100%', background: '#f0f9ff', border: '1.5px solid #93c5fd',
                borderRadius: 10, padding: '14px 18px', textAlign: 'left',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.08)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <span style={{ fontSize: 22 }}>🔬</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: '#2563eb' }}>+ Solicitar Exames</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
