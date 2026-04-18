import { useState } from 'react'
import { usePacientes } from '../hooks/usePacientes'
import { usePlano } from '../hooks/usePlano'
import { useToast } from '../components/Toast'

// ─── Paleta ────────────────────────────────────────────────────────────────
const C = {
  primary:   '#1a8a7b',
  dark:      '#136b5e',
  bg:        '#f4faf8',
  cardShadow:'0 2px 10px rgba(0,0,0,.08)',
  avatarFrom:'#3182ce',
  avatarTo:  '#63b3ed',
  borderLeft:'#3182ce',
}

// ─── Cores dos estados dos dentes ───────────────────────────────────────────
const ESTADOS = [
  { id: 'saudavel',  label: 'Saudável',          bg: '#ffffff', border: '#cbd5e0', text: '#4a5568' },
  { id: 'carie',     label: 'Cárie',              bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
  { id: 'obturado',  label: 'Obturado',           bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
  { id: 'canal',     label: 'Canal',              bg: '#fce7f3', border: '#ec4899', text: '#9d174d' },
  { id: 'coroa',     label: 'Coroa',              bg: '#ccfbf1', border: '#14b8a6', text: '#134e4a' },
  { id: 'implante',  label: 'Implante',           bg: '#dcfce7', border: '#22c55e', text: '#14532d' },
  { id: 'protese',   label: 'Prótese',            bg: '#ede9fe', border: '#8b5cf6', text: '#4c1d95' },
  { id: 'extracao',  label: 'Extração Indicada',  bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
  { id: 'extraido',  label: 'Extraído',           bg: '#f1f5f9', border: '#94a3b8', text: '#475569' },
  { id: 'fratura',   label: 'Fratura',            bg: '#fff7ed', border: '#f97316', text: '#7c2d12' },
]

function getEstadoInfo(id) {
  return ESTADOS.find(e => e.id === id) || ESTADOS[0]
}

// ─── Odontograma ────────────────────────────────────────────────────────────
const Q1 = [18,17,16,15,14,13,12,11]
const Q2 = [21,22,23,24,25,26,27,28]
const Q3 = [31,32,33,34,35,36,37,38]
const Q4 = [48,47,46,45,44,43,42,41]

function DenteSup({ num, estado, selected, onClick }) {
  const info = getEstadoInfo(estado || 'saudavel')
  return (
    <div
      onClick={() => onClick(num)}
      title={`${num} — ${info.label}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        gap: 2,
      }}
    >
      <span style={{ fontSize: 9, color: '#718096', lineHeight: 1, fontWeight: 500 }}>{num}</span>
      <div style={{
        width: 30,
        height: 28,
        borderRadius: '4px 4px 6px 6px',
        background: info.bg,
        border: `2px solid ${selected ? C.primary : info.border}`,
        boxShadow: selected ? `0 0 0 2px ${C.primary}44` : 'none',
        transition: 'all .15s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 9,
        color: info.text,
        fontWeight: 700,
      }}>
        {estado && estado !== 'saudavel' && estado !== 'extraido' ? info.label.slice(0,2) : ''}
        {estado === 'extraido' ? '✕' : ''}
      </div>
    </div>
  )
}

function DenteInf({ num, estado, selected, onClick }) {
  const info = getEstadoInfo(estado || 'saudavel')
  return (
    <div
      onClick={() => onClick(num)}
      title={`${num} — ${info.label}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        gap: 2,
      }}
    >
      <div style={{
        width: 30,
        height: 28,
        borderRadius: '6px 6px 4px 4px',
        background: info.bg,
        border: `2px solid ${selected ? C.primary : info.border}`,
        boxShadow: selected ? `0 0 0 2px ${C.primary}44` : 'none',
        transition: 'all .15s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 9,
        color: info.text,
        fontWeight: 700,
      }}>
        {estado && estado !== 'saudavel' && estado !== 'extraido' ? info.label.slice(0,2) : ''}
        {estado === 'extraido' ? '✕' : ''}
      </div>
      <span style={{ fontSize: 9, color: '#718096', lineHeight: 1, fontWeight: 500 }}>{num}</span>
    </div>
  )
}

function Odontograma({ estados, onChange }) {
  const [sel, setSel] = useState(null)
  const [anotacao, setAnotacao] = useState('')

  function handleClick(num) {
    if (sel === num) { setSel(null); return }
    setSel(num)
    setAnotacao(estados[num]?.anotacao || '')
  }

  function aplicar(estadoId) {
    onChange({ ...estados, [sel]: { estado: estadoId, anotacao } })
  }

  function salvarAnotacao() {
    if (!sel) return
    onChange({ ...estados, [sel]: { ...(estados[sel] || {}), anotacao } })
    setSel(null)
  }

  function getE(num) { return estados[num]?.estado || 'saudavel' }

  const labelStyle = {
    fontSize: 10,
    fontWeight: 700,
    color: '#718096',
    textTransform: 'uppercase',
    letterSpacing: '.04em',
  }

  const quadrante = {
    display: 'flex',
    gap: 3,
    alignItems: 'flex-end',
  }

  const separador = {
    width: 1,
    background: '#e2e8f0',
    alignSelf: 'stretch',
    margin: '0 6px',
    flexShrink: 0,
  }

  return (
    <div>
      {/* Labels superiores */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={labelStyle}>Superior Direito (Q1)</span>
        <span style={labelStyle}>Superior Esquerdo (Q2)</span>
      </div>

      {/* Arcada superior */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 0 }}>
        <div style={quadrante}>
          {Q1.map(n => <DenteSup key={n} num={n} estado={getE(n)} selected={sel === n} onClick={handleClick} />)}
        </div>
        <div style={separador} />
        <div style={quadrante}>
          {Q2.map(n => <DenteSup key={n} num={n} estado={getE(n)} selected={sel === n} onClick={handleClick} />)}
        </div>
      </div>

      {/* Linha média */}
      <div style={{ textAlign: 'center', fontSize: 10, color: '#a0aec0', margin: '6px 0', letterSpacing: '.1em', fontWeight: 600 }}>
        — LINHA MÉDIA —
      </div>

      {/* Arcada inferior */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 0 }}>
        <div style={{ ...quadrante, alignItems: 'flex-start' }}>
          {Q4.map(n => <DenteInf key={n} num={n} estado={getE(n)} selected={sel === n} onClick={handleClick} />)}
        </div>
        <div style={{ ...separador, alignSelf: 'stretch' }} />
        <div style={{ ...quadrante, alignItems: 'flex-start' }}>
          {Q3.map(n => <DenteInf key={n} num={n} estado={getE(n)} selected={sel === n} onClick={handleClick} />)}
        </div>
      </div>

      {/* Labels inferiores */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={labelStyle}>Inferior Direito (Q4)</span>
        <span style={labelStyle}>Inferior Esquerdo (Q3)</span>
      </div>

      {/* Card de edição do dente selecionado */}
      {sel && (
        <div style={{
          marginTop: 16,
          padding: 16,
          background: '#f7fafc',
          borderRadius: 10,
          border: `1.5px solid ${C.primary}55`,
        }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 10 }}>
            Dente {sel} — {getEstadoInfo(getE(sel)).label}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {ESTADOS.map(e => {
              const ativo = getE(sel) === e.id
              return (
                <button
                  key={e.id}
                  onClick={() => aplicar(e.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: ativo ? 700 : 400,
                    border: `1.5px solid ${ativo ? C.primary : e.border}`,
                    background: ativo ? C.primary : e.bg,
                    color: ativo ? '#fff' : e.text,
                    cursor: 'pointer',
                    transition: 'all .12s',
                  }}
                >
                  {e.label}
                </button>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              style={{
                flex: 1,
                padding: '7px 10px',
                border: '1.5px solid #e2e8f0',
                borderRadius: 7,
                fontSize: 13,
                outline: 'none',
              }}
              placeholder="Anotação (ex: MOD, obturado 2024...)"
              value={anotacao}
              onChange={e => setAnotacao(e.target.value)}
            />
            <button
              onClick={salvarAnotacao}
              style={{
                padding: '7px 14px',
                background: C.primary,
                color: '#fff',
                border: 'none',
                borderRadius: 7,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Legenda */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginTop: 14 }}>
        {ESTADOS.map(e => (
          <span key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#4a5568' }}>
            <span style={{
              width: 12, height: 12, borderRadius: 3,
              background: e.bg, border: `1.5px solid ${e.border}`,
              display: 'inline-block', flexShrink: 0,
            }} />
            {e.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Avatar ─────────────────────────────────────────────────────────────────
function Avatar({ nome, size = 42 }) {
  const iniciais = (nome || '?')
    .split(' ')
    .filter(Boolean)
    .map(w => w[0].toUpperCase())
    .slice(0, 2)
    .join('')
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: `linear-gradient(135deg, ${C.avatarFrom}, ${C.avatarTo})`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontWeight: 700,
      fontSize: size * 0.36,
      flexShrink: 0,
      letterSpacing: '.02em',
    }}>
      {iniciais}
    </div>
  )
}

// ─── Campos auxiliares ───────────────────────────────────────────────────────
function Campo({ label, children, full }) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : undefined }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4a5568', marginBottom: 5 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function Input({ value, onChange, type = 'text', placeholder }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '9px 12px',
        border: '1.5px solid #e2e8f0',
        borderRadius: 8,
        fontSize: 14,
        color: '#2d3748',
        outline: 'none',
        transition: 'border-color .15s',
        boxSizing: 'border-box',
      }}
      onFocus={e => { e.target.style.borderColor = C.primary }}
      onBlur={e => { e.target.style.borderColor = '#e2e8f0' }}
    />
  )
}

function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: '100%',
        padding: '9px 12px',
        border: '1.5px solid #e2e8f0',
        borderRadius: 8,
        fontSize: 14,
        color: '#2d3748',
        outline: 'none',
        resize: 'vertical',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
      }}
      onFocus={e => { e.target.style.borderColor = C.primary }}
      onBlur={e => { e.target.style.borderColor = '#e2e8f0' }}
    />
  )
}

function BtnSalvar({ onClick, loading, children }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        padding: '10px 24px',
        background: C.primary,
        color: '#fff',
        border: 'none',
        borderRadius: 9,
        fontSize: 14,
        fontWeight: 700,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? .7 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        transition: 'background .15s',
      }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.background = C.dark }}
      onMouseLeave={e => { e.currentTarget.style.background = C.primary }}
    >
      {children}
    </button>
  )
}

// ─── Dados iniciais ──────────────────────────────────────────────────────────
const DADOS_VAZIO = {
  nome: '', data_nascimento: '', cpf: '',
  telefone: '', email: '', endereco: '', convenio: '',
}

const ANAMNESE_VAZIA = {
  alergias: '', doencas: '', medicamentos: '',
  fumante: false, alcool: false, gestante: false,
  anticoagulante: false, bifosfonato: false,
  observacoes: '',
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function Prontuario() {
  const { pacientes, loading, addPaciente, updatePaciente } = usePacientes()
  const { podeAdicionarPaciente } = usePlano()
  const toast = useToast()

  // Navegação interna: null = lista, objeto = detalhe
  const [pacienteAtual, setPacienteAtual] = useState(null)
  const [aba, setAba] = useState('dados')
  const [busca, setBusca] = useState('')
  const [saving, setSaving] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)

  // Formulário dados pessoais
  const [dados, setDados] = useState(DADOS_VAZIO)
  // Anamnese
  const [anamnese, setAnamnese] = useState(ANAMNESE_VAZIA)
  // Odontograma
  const [odontograma, setOdontograma] = useState({})

  const filtrados = pacientes.filter(p =>
    p.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    (p.cpf && p.cpf.includes(busca))
  )

  function abrirPaciente(p) {
    setPacienteAtual(p)
    setAba('dados')
    setDados({
      nome:            p.nome            || '',
      data_nascimento: p.data_nascimento || '',
      cpf:             p.cpf             || '',
      telefone:        p.telefone        || '',
      email:           p.email           || '',
      endereco:        p.endereco        || '',
      convenio:        p.convenio        || '',
    })
    setAnamnese({ ...ANAMNESE_VAZIA, ...(p.anamnese || {}) })
    setOdontograma(p.odontograma || {})
  }

  function voltar() {
    setPacienteAtual(null)
    setAba('dados')
  }

  function novoForm() {
    if (!podeAdicionarPaciente) { setShowUpgrade(true); return }
    setPacienteAtual({ _novo: true })
    setAba('dados')
    setDados(DADOS_VAZIO)
    setAnamnese(ANAMNESE_VAZIA)
    setOdontograma({})
  }

  async function salvarDados() {
    if (!dados.nome.trim()) { toast('Nome é obrigatório.', 'error'); return }
    setSaving(true)
    try {
      if (pacienteAtual._novo) {
        const novo = await addPaciente({ ...dados, anamnese, odontograma })
        setPacienteAtual(novo)
        toast('Paciente cadastrado!', 'success')
      } else {
        await updatePaciente(pacienteAtual.id, { ...dados })
        setPacienteAtual(prev => ({ ...prev, ...dados }))
        toast('Dados salvos!', 'success')
      }
    } catch (e) {
      toast(e.message || 'Erro ao salvar.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function salvarAnamnese() {
    if (pacienteAtual?._novo) { toast('Salve os dados pessoais primeiro.', 'error'); return }
    setSaving(true)
    try {
      await updatePaciente(pacienteAtual.id, { anamnese })
      toast('Anamnese salva!', 'success')
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function salvarOdontograma() {
    if (pacienteAtual?._novo) { toast('Salve os dados pessoais primeiro.', 'error'); return }
    setSaving(true)
    try {
      await updatePaciente(pacienteAtual.id, { odontograma })
      toast('Odontograma salvo!', 'success')
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  function setD(f) { return e => setDados(p => ({ ...p, [f]: e.target.value })) }
  function setA(f) { return e => setAnamnese(p => ({ ...p, [f]: e.target.value })) }
  function setCheck(f) { return e => setAnamnese(p => ({ ...p, [f]: e.target.checked })) }

  // ── Estilos reutilizáveis ──────────────────────────────────────────────────
  const pageStyle = { background: C.bg, minHeight: '100%', padding: 2 }

  const cardStyle = {
    background: '#fff',
    borderRadius: 14,
    boxShadow: C.cardShadow,
    padding: 20,
    marginBottom: 14,
  }

  const abaStyle = (id) => ({
    padding: '8px 18px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: aba === id ? 700 : 500,
    border: `2px solid ${aba === id ? C.primary : '#e2e8f0'}`,
    background: aba === id ? C.primary : '#fff',
    color: aba === id ? '#fff' : '#4a5568',
    cursor: 'pointer',
    transition: 'all .15s',
  })

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 14,
  }

  const checkStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
    color: '#4a5568',
    cursor: 'pointer',
  }

  // ── MODAL UPGRADE ──────────────────────────────────────────────────────────
  const ModalUpgrade = showUpgrade && (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }} onClick={() => setShowUpgrade(false)}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 36, maxWidth: 400,
        width: '90%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,.15)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>⭐</div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Limite atingido</h3>
        <p style={{ fontSize: 14, color: '#718096', marginBottom: 24 }}>
          Você atingiu o limite de 3 pacientes no plano gratuito.
          Faça upgrade para cadastrar ilimitados.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={() => setShowUpgrade(false)} style={{
            padding: '9px 20px', borderRadius: 8, border: '1.5px solid #e2e8f0',
            background: '#fff', color: '#4a5568', cursor: 'pointer', fontSize: 14,
          }}>
            Agora não
          </button>
          <button onClick={() => setShowUpgrade(false)} style={{
            padding: '9px 20px', borderRadius: 8, border: 'none',
            background: C.primary, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700,
          }}>
            ⭐ Fazer upgrade
          </button>
        </div>
      </div>
    </div>
  )

  // ── LISTA DE PACIENTES ─────────────────────────────────────────────────────
  if (!pacienteAtual) {
    return (
      <div style={pageStyle}>
        {ModalUpgrade}

        {/* Header da página */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a202c' }}>🦷 Prontuário</h1>
            <p style={{ fontSize: 13, color: '#718096', marginTop: 2 }}>Cadastro de pacientes e odontograma</p>
          </div>
          <button
            onClick={novoForm}
            style={{
              padding: '10px 20px',
              background: C.primary,
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'background .15s',
              boxShadow: '0 2px 8px rgba(26,138,123,.3)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = C.dark }}
            onMouseLeave={e => { e.currentTarget.style.background = C.primary }}
          >
            + Novo Paciente
          </button>
        </div>

        {/* Busca */}
        <div style={{ ...cardStyle, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              fontSize: 15, pointerEvents: 'none',
            }}>🔍</span>
            <input
              style={{
                width: '100%',
                paddingLeft: 38,
                paddingRight: 14,
                paddingTop: 9,
                paddingBottom: 9,
                border: '1.5px solid #e2e8f0',
                borderRadius: 9,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color .15s',
              }}
              placeholder="Buscar paciente por nome ou CPF..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              onFocus={e => { e.target.style.borderColor = C.primary }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0' }}
            />
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#a0aec0', fontSize: 14 }}>Carregando...</div>
        ) : filtrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: '#a0aec0' }}>
            <div style={{ fontSize: 54, marginBottom: 14 }}>👤</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#718096' }}>Nenhum paciente cadastrado</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>
              {busca ? 'Nenhum resultado para sua busca.' : 'Clique em "+ Novo Paciente" para começar.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtrados.map(p => (
              <div
                key={p.id}
                onClick={() => abrirPaciente(p)}
                style={{
                  background: '#fff',
                  borderRadius: 14,
                  boxShadow: C.cardShadow,
                  borderLeft: `4px solid ${C.borderLeft}`,
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  cursor: 'pointer',
                  transition: 'transform .15s, box-shadow .15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,.12)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = C.cardShadow
                }}
              >
                <Avatar nome={p.nome} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#1a202c', marginBottom: 3 }}>{p.nome}</p>
                  <p style={{ fontSize: 12, color: '#718096' }}>
                    {[p.telefone, p.convenio].filter(Boolean).join(' · ') || 'Sem informações adicionais'}
                  </p>
                </div>
                <span style={{ fontSize: 20, color: '#a0aec0', flexShrink: 0 }}>›</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── DETALHE DO PACIENTE ────────────────────────────────────────────────────
  const ehNovo = !!pacienteAtual._novo

  return (
    <div style={pageStyle}>
      {ModalUpgrade}

      {/* Header detalhe */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 18,
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={voltar}
            style={{
              padding: '8px 14px',
              background: '#fff',
              border: '1.5px solid #e2e8f0',
              borderRadius: 9,
              fontSize: 14,
              fontWeight: 600,
              color: '#4a5568',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              boxShadow: '0 1px 4px rgba(0,0,0,.06)',
            }}
          >
            ‹ Voltar
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar nome={ehNovo ? '?' : (pacienteAtual.nome || '?')} size={36} />
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a202c', lineHeight: 1.2 }}>
                {ehNovo ? 'Novo Paciente' : (dados.nome || pacienteAtual.nome)}
              </h2>
              {!ehNovo && (
                <p style={{ fontSize: 12, color: '#718096', marginTop: 1 }}>
                  {pacienteAtual.cpf || pacienteAtual.telefone || 'Sem contato'}
                </p>
              )}
            </div>
          </div>
        </div>

        {!ehNovo && (
          <button
            style={{
              padding: '8px 14px',
              background: '#fff5f5',
              border: '1.5px solid #fed7d7',
              borderRadius: 9,
              fontSize: 13,
              fontWeight: 600,
              color: '#e53e3e',
              cursor: 'pointer',
            }}
          >
            🗑️ Excluir
          </button>
        )}
      </div>

      {/* Abas */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {[
          { id: 'dados',      label: '👤 Dados' },
          { id: 'anamnese',   label: '📝 Anamnese' },
          { id: 'odontograma',label: '🦷 Odontograma' },
          { id: 'historico',  label: '📅 Histórico' },
        ].map(a => (
          <button key={a.id} style={abaStyle(a.id)} onClick={() => setAba(a.id)}>
            {a.label}
          </button>
        ))}
      </div>

      {/* ── ABA DADOS ─────────────────────────────────────────────────── */}
      {aba === 'dados' && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#2d3748', marginBottom: 18 }}>Dados Pessoais</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Campo label="Nome completo *" full>
              <Input value={dados.nome} onChange={setD('nome')} placeholder="Nome do paciente" />
            </Campo>
            <Campo label="Data de nascimento">
              <Input type="date" value={dados.data_nascimento} onChange={setD('data_nascimento')} />
            </Campo>
            <Campo label="CPF">
              <Input value={dados.cpf} onChange={setD('cpf')} placeholder="000.000.000-00" />
            </Campo>
            <Campo label="Telefone">
              <Input value={dados.telefone} onChange={setD('telefone')} placeholder="(11) 99999-9999" />
            </Campo>
            <Campo label="E-mail">
              <Input type="email" value={dados.email} onChange={setD('email')} placeholder="paciente@email.com" />
            </Campo>
            <Campo label="Endereço" full>
              <Input value={dados.endereco} onChange={setD('endereco')} placeholder="Rua, número, bairro, cidade" />
            </Campo>
            <Campo label="Convênio" full>
              <Input value={dados.convenio} onChange={setD('convenio')} placeholder="Unimed, Bradesco, particular..." />
            </Campo>
          </div>
          <div style={{ marginTop: 20 }}>
            <BtnSalvar onClick={salvarDados} loading={saving}>💾 Salvar Dados</BtnSalvar>
          </div>
        </div>
      )}

      {/* ── ABA ANAMNESE ──────────────────────────────────────────────── */}
      {aba === 'anamnese' && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#2d3748', marginBottom: 18 }}>Anamnese</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Campo label="Alergias">
              <Textarea
                value={anamnese.alergias}
                onChange={setA('alergias')}
                placeholder="Ex: penicilina, látex, anestésicos..."
                rows={2}
              />
            </Campo>
            <Campo label="Doenças Sistêmicas">
              <Textarea
                value={anamnese.doencas}
                onChange={setA('doencas')}
                placeholder="Ex: diabetes, hipertensão, cardiopatia..."
                rows={2}
              />
            </Campo>
            <Campo label="Medicamentos em Uso">
              <Textarea
                value={anamnese.medicamentos}
                onChange={setA('medicamentos')}
                placeholder="Ex: metformina 500mg, losartana 50mg..."
                rows={2}
              />
            </Campo>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4a5568', marginBottom: 10 }}>
                Condições
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 28px' }}>
                {[
                  { f: 'fumante',       label: 'Fumante' },
                  { f: 'alcool',        label: 'Uso de álcool' },
                  { f: 'gestante',      label: 'Gestante' },
                  { f: 'anticoagulante',label: 'Anticoagulante' },
                  { f: 'bifosfonato',   label: 'Bifosfonato' },
                ].map(({ f, label }) => (
                  <label key={f} style={checkStyle}>
                    <input
                      type="checkbox"
                      checked={!!anamnese[f]}
                      onChange={setCheck(f)}
                      style={{ width: 16, height: 16, accentColor: C.primary, cursor: 'pointer' }}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <Campo label="Observações Gerais">
              <Textarea
                value={anamnese.observacoes}
                onChange={setA('observacoes')}
                placeholder="Informações relevantes sobre o paciente..."
                rows={4}
              />
            </Campo>
          </div>

          <div style={{ marginTop: 20 }}>
            <BtnSalvar onClick={salvarAnamnese} loading={saving}>💾 Salvar Anamnese</BtnSalvar>
          </div>
        </div>
      )}

      {/* ── ABA ODONTOGRAMA ───────────────────────────────────────────── */}
      {aba === 'odontograma' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#2d3748' }}>Odontograma FDI</h3>
            <span style={{ fontSize: 12, color: '#a0aec0' }}>Clique em um dente para editar</span>
          </div>
          <Odontograma estados={odontograma} onChange={setOdontograma} />
          <div style={{ marginTop: 20 }}>
            <BtnSalvar onClick={salvarOdontograma} loading={saving}>💾 Salvar Odontograma</BtnSalvar>
          </div>
        </div>
      )}

      {/* ── ABA HISTÓRICO ─────────────────────────────────────────────── */}
      {aba === 'historico' && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#2d3748', marginBottom: 18 }}>Histórico de Atendimentos</h3>
          <div style={{ textAlign: 'center', padding: '40px 24px', color: '#a0aec0' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>📅</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#718096' }}>Nenhum atendimento registrado</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Os registros de atendimentos aparecerão aqui.</p>
          </div>
        </div>
      )}
    </div>
  )
}
