import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePacientes } from '../hooks/usePacientes'
import { usePlano } from '../hooks/usePlano'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/Toast'
import { supabase } from '../lib/supabase'
import { fetchClinicaData } from '../lib/pdfHelper'
import { gerarOrcamentoPDF } from '../lib/pdf'

// ─── Paleta ──────────────────────────────────────────────────────────────────
const C = { primary: '#1a8a7b', dark: '#136b5e', bg: '#f4faf8' }

// ─── Utilitários ─────────────────────────────────────────────────────────────
function calcIdade(dataNasc) {
  if (!dataNasc) return null
  const nasc = new Date(dataNasc + 'T12:00:00')
  const hoje = new Date()
  let idade = hoje.getFullYear() - nasc.getFullYear()
  const m = hoje.getMonth() - nasc.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--
  return idade
}

function calcValorParcela(subtotal, parcelas) {
  const TAXAS = { 1: 0, 2: 1.99, 3: 2.49, 4: 2.99, 5: 3.49, 6: 3.99, 7: 4.49, 8: 4.99, 9: 5.49, 10: 5.99, 11: 6.49, 12: 6.99 }
  return (subtotal * (1 + (TAXAS[parcelas] || 0) / 100)) / parcelas
}

const STATUS_CONFIG = {
  em_analise: { label: 'Em Análise', cor: '#b45309', bg: '#fef3c7', border: '#fcd34d' },
  aprovado:   { label: 'Aprovado',   cor: '#15803d', bg: '#dcfce7', border: '#86efac' },
  recusado:   { label: 'Recusado',   cor: '#dc2626', bg: '#fee2e2', border: '#fca5a5' },
  pendente:   { label: 'Em Análise', cor: '#b45309', bg: '#fef3c7', border: '#fcd34d' },
}
const FORMA_LABEL = { pix: 'PIX', avista: 'À Vista', cartao: 'Cartão', convenio: 'Convênio' }

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ nome, size = 52 }) {
  const iniciais = (nome || '?').split(' ').filter(Boolean).map(w => w[0].toUpperCase()).slice(0, 2).join('')
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #3182ce, #63b3ed)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: size * 0.36, flexShrink: 0,
    }}>
      {iniciais}
    </div>
  )
}

// ─── Componentes de formulário ────────────────────────────────────────────────
function Campo({ label, children, full }) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : undefined }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4a5568', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0',
  borderRadius: 8, fontSize: 14, color: '#2d3748', outline: 'none',
  transition: 'border-color .15s', boxSizing: 'border-box',
}

function FInput({ value, onChange, type = 'text', placeholder }) {
  return (
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={inputStyle}
      onFocus={e => { e.target.style.borderColor = C.primary }}
      onBlur={e => { e.target.style.borderColor = '#e2e8f0' }}
    />
  )
}

function FTextarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
      onFocus={e => { e.target.style.borderColor = C.primary }}
      onBlur={e => { e.target.style.borderColor = '#e2e8f0' }}
    />
  )
}

function BtnSalvar({ onClick, loading, children }) {
  return (
    <button
      onClick={onClick} disabled={loading}
      style={{
        padding: '10px 24px', background: C.primary, color: '#fff', border: 'none',
        borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 6,
      }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.background = C.dark }}
      onMouseLeave={e => { e.currentTarget.style.background = C.primary }}
    >
      {children}
    </button>
  )
}

// ─── Odontograma ─────────────────────────────────────────────────────────────
const ESTADOS_DENTE = [
  { id: 'saudavel',  label: 'Saudável',         bg: '#ffffff', border: '#cbd5e0', text: '#4a5568' },
  { id: 'carie',     label: 'Cárie',             bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
  { id: 'obturado',  label: 'Obturado',          bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
  { id: 'canal',     label: 'Canal',             bg: '#fce7f3', border: '#ec4899', text: '#9d174d' },
  { id: 'coroa',     label: 'Coroa',             bg: '#ccfbf1', border: '#14b8a6', text: '#134e4a' },
  { id: 'implante',  label: 'Implante',          bg: '#dcfce7', border: '#22c55e', text: '#14532d' },
  { id: 'protese',   label: 'Prótese',           bg: '#ede9fe', border: '#8b5cf6', text: '#4c1d95' },
  { id: 'extracao',  label: 'Extração Indicada', bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
  { id: 'extraido',  label: 'Extraído',          bg: '#f1f5f9', border: '#94a3b8', text: '#475569' },
  { id: 'fratura',   label: 'Fratura',           bg: '#fff7ed', border: '#f97316', text: '#7c2d12' },
]
function getEstInfo(id) { return ESTADOS_DENTE.find(e => e.id === id) || ESTADOS_DENTE[0] }

const Q1 = [18,17,16,15,14,13,12,11]
const Q2 = [21,22,23,24,25,26,27,28]
const Q3 = [31,32,33,34,35,36,37,38]
const Q4 = [48,47,46,45,44,43,42,41]

function DenteSup({ num, estado, selected, onClick }) {
  const info = getEstInfo(estado || 'saudavel')
  return (
    <div onClick={() => onClick(num)} title={`${num} — ${info.label}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', gap: 2 }}>
      <span style={{ fontSize: 9, color: '#718096', lineHeight: 1, fontWeight: 500 }}>{num}</span>
      <div style={{ width: 30, height: 28, borderRadius: '4px 4px 6px 6px', background: info.bg, border: `2px solid ${selected ? C.primary : info.border}`, boxShadow: selected ? `0 0 0 2px ${C.primary}44` : 'none', transition: 'all .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: info.text, fontWeight: 700 }}>
        {estado && estado !== 'saudavel' && estado !== 'extraido' ? info.label.slice(0, 2) : ''}
        {estado === 'extraido' ? '✕' : ''}
      </div>
    </div>
  )
}

function DenteInf({ num, estado, selected, onClick }) {
  const info = getEstInfo(estado || 'saudavel')
  return (
    <div onClick={() => onClick(num)} title={`${num} — ${info.label}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', gap: 2 }}>
      <div style={{ width: 30, height: 28, borderRadius: '6px 6px 4px 4px', background: info.bg, border: `2px solid ${selected ? C.primary : info.border}`, boxShadow: selected ? `0 0 0 2px ${C.primary}44` : 'none', transition: 'all .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: info.text, fontWeight: 700 }}>
        {estado && estado !== 'saudavel' && estado !== 'extraido' ? info.label.slice(0, 2) : ''}
        {estado === 'extraido' ? '✕' : ''}
      </div>
      <span style={{ fontSize: 9, color: '#718096', lineHeight: 1, fontWeight: 500 }}>{num}</span>
    </div>
  )
}

function Odontograma({ estados, onChange }) {
  const [sel, setSel] = useState(null)
  const [anotacao, setAnotacao] = useState('')
  const getE = num => estados[num]?.estado || 'saudavel'
  const sep = { width: 1, background: '#e2e8f0', alignSelf: 'stretch', margin: '0 6px', flexShrink: 0 }
  const quad = { display: 'flex', gap: 3, alignItems: 'flex-end' }

  function handleClick(num) {
    if (sel === num) { setSel(null); return }
    setSel(num)
    setAnotacao(estados[num]?.anotacao || '')
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: '.04em' }}>Superior Direito (Q1)</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: '.04em' }}>Superior Esquerdo (Q2)</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        <div style={quad}>{Q1.map(n => <DenteSup key={n} num={n} estado={getE(n)} selected={sel === n} onClick={handleClick} />)}</div>
        <div style={sep} />
        <div style={quad}>{Q2.map(n => <DenteSup key={n} num={n} estado={getE(n)} selected={sel === n} onClick={handleClick} />)}</div>
      </div>
      <div style={{ textAlign: 'center', fontSize: 10, color: '#a0aec0', margin: '6px 0', letterSpacing: '.1em', fontWeight: 600 }}>— LINHA MÉDIA —</div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
        <div style={{ ...quad, alignItems: 'flex-start' }}>{Q4.map(n => <DenteInf key={n} num={n} estado={getE(n)} selected={sel === n} onClick={handleClick} />)}</div>
        <div style={{ ...sep, alignSelf: 'stretch' }} />
        <div style={{ ...quad, alignItems: 'flex-start' }}>{Q3.map(n => <DenteInf key={n} num={n} estado={getE(n)} selected={sel === n} onClick={handleClick} />)}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: '.04em' }}>Inferior Direito (Q4)</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: '.04em' }}>Inferior Esquerdo (Q3)</span>
      </div>

      {sel && (
        <div style={{ marginTop: 16, padding: 16, background: '#f7fafc', borderRadius: 10, border: `1.5px solid ${C.primary}55` }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 10 }}>
            Dente {sel} — {getEstInfo(getE(sel)).label}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {ESTADOS_DENTE.map(e => {
              const ativo = getE(sel) === e.id
              return (
                <button key={e.id} onClick={() => onChange({ ...estados, [sel]: { estado: e.id, anotacao } })}
                  style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: ativo ? 700 : 400, border: `1.5px solid ${ativo ? C.primary : e.border}`, background: ativo ? C.primary : e.bg, color: ativo ? '#fff' : e.text, cursor: 'pointer' }}
                >{e.label}</button>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input style={{ flex: 1, padding: '7px 10px', border: '1.5px solid #e2e8f0', borderRadius: 7, fontSize: 13, outline: 'none' }} placeholder="Anotação (ex: MOD, obturado 2024...)" value={anotacao} onChange={e => setAnotacao(e.target.value)} />
            <button onClick={() => { onChange({ ...estados, [sel]: { ...(estados[sel] || {}), anotacao } }); setSel(null) }} style={{ padding: '7px 14px', background: C.primary, color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>OK</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginTop: 14 }}>
        {ESTADOS_DENTE.map(e => (
          <span key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#4a5568' }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: e.bg, border: `1.5px solid ${e.border}`, display: 'inline-block', flexShrink: 0 }} />
            {e.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Dados iniciais ───────────────────────────────────────────────────────────
const DADOS_VAZIO    = { nome: '', data_nascimento: '', cpf: '', telefone: '', email: '', endereco: '', convenio: '' }
const ANAMNESE_VAZIA = { alergias: '', doencas: '', medicamentos: '', fumante: false, alcool: false, gestante: false, anticoagulante: false, bifosfonato: false, observacoes: '' }

// ─── Componente principal ─────────────────────────────────────────────────────
export default function PacienteDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { pacientes, loading: loadingPac, addPaciente, updatePaciente } = usePacientes()
  const { podeAdicionarPaciente } = usePlano()
  const { profile, user } = useAuth()
  const toast = useToast()

  const ehNovo = id === 'novo'
  const paciente = ehNovo ? null : pacientes.find(p => p.id === id)

  const [aba, setAba] = useState('dados')
  const [saving, setSaving] = useState(false)

  // ── Dados / Anamnese / Odontograma ──────────────────────────────────────────
  const [dados, setDados] = useState(DADOS_VAZIO)
  const [anamnese, setAnamnese] = useState(ANAMNESE_VAZIA)
  const [odontograma, setOdontograma] = useState({})

  useEffect(() => {
    if (paciente) {
      setDados({ nome: paciente.nome || '', data_nascimento: paciente.data_nascimento || '', cpf: paciente.cpf || '', telefone: paciente.telefone || '', email: paciente.email || '', endereco: paciente.endereco || '', convenio: paciente.convenio || '' })
      setAnamnese({ ...ANAMNESE_VAZIA, ...(paciente.anamnese || {}) })
      setOdontograma(paciente.odontograma || {})
    }
  }, [paciente?.id])

  function setD(f) { return e => setDados(p => ({ ...p, [f]: e.target.value })) }
  function setA(f) { return e => setAnamnese(p => ({ ...p, [f]: e.target.value })) }
  function setCheck(f) { return e => setAnamnese(p => ({ ...p, [f]: e.target.checked })) }

  async function salvarDados() {
    if (!dados.nome.trim()) { toast('Nome é obrigatório.', 'error'); return }
    if (ehNovo && !podeAdicionarPaciente) { toast('Limite de pacientes atingido. Faça upgrade.', 'error'); return }
    setSaving(true)
    try {
      if (ehNovo) {
        const novo = await addPaciente({ ...dados, anamnese, odontograma })
        toast('Paciente cadastrado!', 'success')
        navigate(`/pacientes/${novo.id}`, { replace: true })
      } else {
        await updatePaciente(paciente.id, { ...dados })
        toast('Dados salvos!', 'success')
      }
    } catch (e) { toast(e.message || 'Erro ao salvar.', 'error') }
    finally { setSaving(false) }
  }

  async function salvarAnamnese() {
    if (ehNovo) { toast('Salve os dados pessoais primeiro.', 'error'); return }
    setSaving(true)
    try { await updatePaciente(paciente.id, { anamnese }); toast('Anamnese salva!', 'success') }
    catch (e) { toast(e.message, 'error') }
    finally { setSaving(false) }
  }

  async function salvarOdontograma() {
    if (ehNovo) { toast('Salve os dados pessoais primeiro.', 'error'); return }
    setSaving(true)
    try { await updatePaciente(paciente.id, { odontograma }); toast('Odontograma salvo!', 'success') }
    catch (e) { toast(e.message, 'error') }
    finally { setSaving(false) }
  }

  // ── Evolução ────────────────────────────────────────────────────────────────
  const [evolucoes, setEvolucoes] = useState([])
  const [carregandoEvol, setCarregandoEvol] = useState(false)
  const [modalEvol, setModalEvol] = useState(false)
  const [novaEvol, setNovaEvol] = useState({ data_atendimento: new Date().toISOString().split('T')[0], descricao: '' })
  const [salvandoEvol, setSalvandoEvol] = useState(false)

  const carregarEvolucoes = useCallback(async () => {
    if (!paciente?.id) return
    setCarregandoEvol(true)
    const { data, error } = await supabase.from('evolucoes').select('*').eq('paciente_id', paciente.id).order('data_atendimento', { ascending: false })
    if (!error) setEvolucoes(data || [])
    else setEvolucoes([])
    setCarregandoEvol(false)
  }, [paciente?.id])

  async function salvarEvolucao() {
    if (!novaEvol.descricao.trim()) { toast('Informe a descrição do atendimento.', 'error'); return }
    setSalvandoEvol(true)
    const { error } = await supabase.from('evolucoes').insert({
      user_id: user.id,
      paciente_id: paciente.id,
      data_atendimento: novaEvol.data_atendimento,
      descricao: novaEvol.descricao,
      dentista_nome: profile?.nome || '',
    })
    setSalvandoEvol(false)
    if (error) { toast('Erro ao salvar evolução: ' + error.message, 'error'); return }
    toast('Evolução registrada!', 'success')
    setModalEvol(false)
    setNovaEvol({ data_atendimento: new Date().toISOString().split('T')[0], descricao: '' })
    carregarEvolucoes()
  }

  // ── Orçamentos ──────────────────────────────────────────────────────────────
  const [orcamentos, setOrcamentos] = useState([])
  const [carregandoOrc, setCarregandoOrc] = useState(false)

  const carregarOrcamentos = useCallback(async () => {
    if (!paciente?.id) return
    setCarregandoOrc(true)
    const { data } = await supabase.from('orcamentos').select('*').eq('paciente_id', paciente.id).order('created_at', { ascending: false })
    setOrcamentos(data || [])
    setCarregandoOrc(false)
  }, [paciente?.id])

  async function atualizarStatusOrc(id, novoStatus) {
    const { error } = await supabase.from('orcamentos').update({ status: novoStatus }).eq('id', id)
    if (error) { toast('Erro ao atualizar status.', 'error'); return }
    setOrcamentos(prev => prev.map(o => o.id === id ? { ...o, status: novoStatus } : o))
  }

  async function gerarPDFOrcamento(orc) {
    const { data: itensData, error } = await supabase.from('orcamento_itens').select('*').eq('orcamento_id', orc.id)
    if (error) { toast('Erro ao carregar itens.', 'error'); return }
    const fp   = orc.forma_pagamento || 'pix'
    const isPx = fp === 'pix' || fp === 'avista'
    const isCt = fp === 'cartao'
    const disc = orc.desconto_pct || 0
    const parc = orc.parcelas || 1
    const sub  = itensData.reduce((s, i) => s + parseFloat(i.preco_unitario) * i.quantidade, 0)
    const vDesc = isPx ? sub * (disc / 100) : 0
    const vParc = isCt ? calcValorParcela(sub, parc) : 0
    const total = isCt ? vParc * parc : sub - vDesc
    const clinicaData = await fetchClinicaData(user?.id)
    gerarOrcamentoPDF({
      paciente: paciente.nome,
      itens: itensData.map(i => ({ nome: i.nome, codigo: i.codigo || '', preco: String(i.preco_unitario), qtd: i.quantidade })),
      formaPagamento: fp, desconto: disc, valorDesconto: vDesc, parcelas: parc,
      valorParcela: vParc, subtotal: sub, totalFinal: total,
      dentista: profile?.nome || '', clinica: profile?.clinica || 'Meu Consultório SorrIA', clinicaData,
    })
    toast('PDF gerado!', 'success')
  }

  // Load on tab switch
  useEffect(() => {
    if (aba === 'evolucao')   carregarEvolucoes()
    if (aba === 'orcamentos') carregarOrcamentos()
  }, [aba, carregarEvolucoes, carregarOrcamentos])

  // ── Navegação ───────────────────────────────────────────────────────────────
  const nome = paciente?.nome || dados.nome || (ehNovo ? 'Novo Paciente' : '...')
  const idade = calcIdade(dados.data_nascimento || paciente?.data_nascimento)
  const tel = (dados.telefone || paciente?.telefone || '').replace(/\D/g, '')

  const cardStyle = { background: '#fff', borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,.08)', padding: 20, marginBottom: 14 }
  const abaStyle = (id) => ({
    padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: aba === id ? 700 : 500,
    border: `2px solid ${aba === id ? C.primary : '#e2e8f0'}`,
    background: aba === id ? C.primary : '#fff', color: aba === id ? '#fff' : '#4a5568',
    cursor: 'pointer', whiteSpace: 'nowrap',
  })

  // Mostrar loading enquanto pacientes carregam (exceto para novo)
  if (!ehNovo && loadingPac) {
    return <div style={{ textAlign: 'center', padding: 60, color: '#a0aec0' }}>Carregando...</div>
  }

  if (!ehNovo && !paciente) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <p style={{ fontSize: 16, color: '#718096', marginBottom: 16 }}>Paciente não encontrado.</p>
        <button className="btn btn-primary" onClick={() => navigate('/pacientes')}>← Voltar</button>
      </div>
    )
  }

  return (
    <div>
      {/* ── Header do paciente ─────────────────────────────────────────────── */}
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/pacientes')} style={{ padding: '7px 14px', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#4a5568', cursor: 'pointer' }}>
            ← Pacientes
          </button>

          <Avatar nome={nome} size={48} />

          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a202c', lineHeight: 1.2 }}>{nome}</h2>
            <p style={{ fontSize: 13, color: '#718096', marginTop: 2 }}>
              {[
                idade != null && `${idade} anos`,
                dados.telefone || paciente?.telefone,
                dados.convenio || paciente?.convenio,
              ].filter(Boolean).join(' · ') || 'Sem informações'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            {tel && (
              <a
                href={`https://wa.me/55${tel}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: '#dcfce7', color: '#166534', border: '1.5px solid #86efac', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                📱 WhatsApp
              </a>
            )}
            <button onClick={() => setAba('dados')} style={{ padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: aba === 'dados' ? C.primary : '#f1f5f9', color: aba === 'dados' ? '#fff' : '#4a5568', border: 'none', cursor: 'pointer' }}>
              ✏️ Editar dados
            </button>
          </div>
        </div>
      </div>

      {/* ── Abas ──────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { id: 'dados',       label: '📋 Dados' },
          { id: 'odontograma', label: '🦷 Odontograma' },
          { id: 'anamnese',    label: '📝 Anamnese' },
          { id: 'evolucao',    label: '📈 Evolução' },
          { id: 'orcamentos',  label: '💰 Orçamentos' },
          { id: 'documentos',  label: '📄 Documentos' },
        ].map(a => <button key={a.id} style={abaStyle(a.id)} onClick={() => setAba(a.id)}>{a.label}</button>)}
      </div>

      {/* ── ABA DADOS ─────────────────────────────────────────────────────── */}
      {aba === 'dados' && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#2d3748', marginBottom: 18 }}>Dados Pessoais</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Campo label="Nome completo *" full>
              <FInput value={dados.nome} onChange={setD('nome')} placeholder="Nome do paciente" />
            </Campo>
            <Campo label="Data de nascimento">
              <FInput type="date" value={dados.data_nascimento} onChange={setD('data_nascimento')} />
            </Campo>
            <Campo label="CPF">
              <FInput value={dados.cpf} onChange={setD('cpf')} placeholder="000.000.000-00" />
            </Campo>
            <Campo label="Telefone">
              <FInput value={dados.telefone} onChange={setD('telefone')} placeholder="(11) 99999-9999" />
            </Campo>
            <Campo label="E-mail">
              <FInput type="email" value={dados.email} onChange={setD('email')} placeholder="paciente@email.com" />
            </Campo>
            <Campo label="Endereço" full>
              <FInput value={dados.endereco} onChange={setD('endereco')} placeholder="Rua, número, bairro, cidade" />
            </Campo>
            <Campo label="Convênio" full>
              <FInput value={dados.convenio} onChange={setD('convenio')} placeholder="Unimed, Bradesco, particular..." />
            </Campo>
          </div>
          <div style={{ marginTop: 20 }}>
            <BtnSalvar onClick={salvarDados} loading={saving}>💾 Salvar Dados</BtnSalvar>
          </div>
        </div>
      )}

      {/* ── ABA ODONTOGRAMA ───────────────────────────────────────────────── */}
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

      {/* ── ABA ANAMNESE ──────────────────────────────────────────────────── */}
      {aba === 'anamnese' && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#2d3748', marginBottom: 18 }}>Anamnese</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Campo label="Alergias"><FTextarea value={anamnese.alergias} onChange={setA('alergias')} placeholder="Ex: penicilina, látex, anestésicos..." rows={2} /></Campo>
            <Campo label="Doenças Sistêmicas"><FTextarea value={anamnese.doencas} onChange={setA('doencas')} placeholder="Ex: diabetes, hipertensão, cardiopatia..." rows={2} /></Campo>
            <Campo label="Medicamentos em Uso"><FTextarea value={anamnese.medicamentos} onChange={setA('medicamentos')} placeholder="Ex: metformina 500mg, losartana 50mg..." rows={2} /></Campo>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4a5568', marginBottom: 10 }}>Condições</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 28px' }}>
                {[
                  { f: 'fumante', label: 'Fumante' }, { f: 'alcool', label: 'Uso de álcool' },
                  { f: 'gestante', label: 'Gestante' }, { f: 'anticoagulante', label: 'Anticoagulante' },
                  { f: 'bifosfonato', label: 'Bifosfonato' },
                ].map(({ f, label }) => (
                  <label key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#4a5568', cursor: 'pointer' }}>
                    <input type="checkbox" checked={!!anamnese[f]} onChange={setCheck(f)} style={{ width: 16, height: 16, accentColor: C.primary, cursor: 'pointer' }} />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <Campo label="Observações Gerais"><FTextarea value={anamnese.observacoes} onChange={setA('observacoes')} placeholder="Informações relevantes sobre o paciente..." rows={4} /></Campo>
          </div>
          <div style={{ marginTop: 20 }}>
            <BtnSalvar onClick={salvarAnamnese} loading={saving}>💾 Salvar Anamnese</BtnSalvar>
          </div>
        </div>
      )}

      {/* ── ABA EVOLUÇÃO ──────────────────────────────────────────────────── */}
      {aba === 'evolucao' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button onClick={() => setModalEvol(true)} className="btn btn-primary">+ Nova Evolução</button>
          </div>

          {carregandoEvol ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>⏳ Carregando...</div>
          ) : evolucoes.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '48px 24px', color: '#9ca3af' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>📈</div>
              <p style={{ fontWeight: 600, color: '#718096' }}>Nenhuma evolução registrada</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>Registre os atendimentos clínicos do paciente.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {evolucoes.map(ev => (
                <div key={ev.id} style={{ ...cardStyle, marginBottom: 0, borderLeft: `4px solid ${C.primary}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>
                      {ev.data_atendimento ? new Date(ev.data_atendimento + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}
                    </span>
                    {ev.dentista_nome && (
                      <span style={{ fontSize: 12, color: '#6b7280' }}>Dr(a). {ev.dentista_nome}</span>
                    )}
                  </div>
                  <p style={{ fontSize: 14, color: '#374151', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{ev.descricao}</p>
                </div>
              ))}
            </div>
          )}

          {/* Modal nova evolução */}
          {modalEvol && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
              onClick={() => setModalEvol(false)}>
              <div style={{ background: '#fff', borderRadius: 14, padding: 28, width: 500, maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,.18)' }}
                onClick={e => e.stopPropagation()}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18, color: '#1a202c' }}>📈 Nova Evolução</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <Campo label="Data do Atendimento">
                    <FInput type="date" value={novaEvol.data_atendimento} onChange={e => setNovaEvol(p => ({ ...p, data_atendimento: e.target.value }))} />
                  </Campo>
                  <Campo label="Descrição do Atendimento *">
                    <FTextarea value={novaEvol.descricao} onChange={e => setNovaEvol(p => ({ ...p, descricao: e.target.value }))} placeholder="Descreva os procedimentos realizados, observações clínicas, próximos passos..." rows={5} />
                  </Campo>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                  <button onClick={() => setModalEvol(false)} style={{ padding: '9px 18px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', color: '#4a5568', cursor: 'pointer', fontSize: 14 }}>Cancelar</button>
                  <BtnSalvar onClick={salvarEvolucao} loading={salvandoEvol}>💾 Salvar</BtnSalvar>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ABA ORÇAMENTOS ────────────────────────────────────────────────── */}
      {aba === 'orcamentos' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button onClick={() => navigate('/orcamento')} className="btn btn-primary">+ Novo Orçamento</button>
          </div>

          <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 110px 100px 140px 120px', padding: '10px 18px', background: '#f0fdf4', fontSize: 12, fontWeight: 700, color: C.dark, borderBottom: '1px solid #e5e7eb' }}>
              <span>Data</span>
              <span>Pagamento</span>
              <span style={{ textAlign: 'right' }}>Total</span>
              <span style={{ textAlign: 'center' }}>Status</span>
              <span style={{ textAlign: 'center' }}>Ações</span>
            </div>

            {carregandoOrc ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>⏳ Carregando...</div>
            ) : orcamentos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>💰</div>
                <p>Nenhum orçamento para este paciente.</p>
              </div>
            ) : (
              orcamentos.map((orc, idx) => {
                const statusAtual = orc.status || 'em_analise'
                const cfg = STATUS_CONFIG[statusAtual] || STATUS_CONFIG.em_analise
                return (
                  <div key={orc.id} style={{ display: 'grid', gridTemplateColumns: '110px 110px 100px 140px 120px', alignItems: 'center', padding: '12px 18px', borderBottom: idx < orcamentos.length - 1 ? '1px solid #f1f5f9' : 'none', background: '#fff' }}>
                    <span style={{ fontSize: 13, color: '#6b7280' }}>
                      {orc.created_at ? new Date(orc.created_at).toLocaleDateString('pt-BR') : '—'}
                    </span>
                    <span style={{ fontSize: 13, color: '#4b5563' }}>{FORMA_LABEL[orc.forma_pagamento] || '—'}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.primary, textAlign: 'right' }}>
                      R$ {parseFloat(orc.valor_total || 0).toFixed(2)}
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <select
                        value={['em_analise','aprovado','recusado'].includes(statusAtual) ? statusAtual : 'em_analise'}
                        onChange={e => atualizarStatusOrc(orc.id, e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: 20, fontSize: 12, fontWeight: 700, border: `1.5px solid ${cfg.border}`, background: cfg.bg, color: cfg.cor, cursor: 'pointer', outline: 'none', appearance: 'none', WebkitAppearance: 'none', paddingRight: 22, paddingLeft: 10, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23999'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
                      >
                        <option value="em_analise">Em Análise</option>
                        <option value="aprovado">Aprovado</option>
                        <option value="recusado">Recusado</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                      <button onClick={() => navigate('/orcamento', { state: { editarId: orc.id } })} title="Editar" style={{ padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: '1.5px solid #fbbf24', background: '#fefce8', color: '#92400e', cursor: 'pointer' }}>✏️</button>
                      <button onClick={() => gerarPDFOrcamento(orc)} title="PDF" style={{ padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: '1.5px solid #a7f3d0', background: '#f0fdf4', color: '#136b5e', cursor: 'pointer' }}>📄</button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* ── ABA DOCUMENTOS ────────────────────────────────────────────────── */}
      {aba === 'documentos' && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#2d3748', marginBottom: 8 }}>Gerar Documentos</h3>
          <p style={{ fontSize: 13, color: '#718096', marginBottom: 24 }}>
            O paciente <strong>{nome}</strong> será pré-selecionado no módulo correspondente.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { path: '/receituario', icon: '📝', label: 'Nova Receita',          desc: 'Receituário odontológico', bg: '#faf5ff', border: '#c4b5fd', color: '#7c3aed' },
              { path: '/atestado',    icon: '📋', label: 'Novo Atestado',         desc: 'Atestado de comparecimento', bg: '#fff7ed', border: '#fed7aa', color: '#ea580c' },
              { path: '/exames',      icon: '🔬', label: 'Pedido de Exames',      desc: 'Solicitação de exames', bg: '#f0fdf4', border: '#a7f3d0', color: '#1a8a7b' },
            ].map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path, { state: { paciente } })}
                style={{ padding: '24px 16px', borderRadius: 12, border: `2px solid ${item.border}`, background: item.bg, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, transition: 'transform .1s, box-shadow .1s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,.1)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <span style={{ fontSize: 32 }}>{item.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: item.color }}>{item.label}</span>
                <span style={{ fontSize: 11, color: '#6b7280' }}>{item.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
