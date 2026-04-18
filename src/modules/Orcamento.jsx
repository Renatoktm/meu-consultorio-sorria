import { useState } from 'react'
import { usePacientes } from '../hooks/usePacientes'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/Toast'
import Autocomplete from '../components/Autocomplete'
import { gerarOrcamentoPDF } from '../lib/pdf'
import { supabase } from '../lib/supabase'

// ─── Taxas de juros cartão de crédito ────────────────────────────────────────
const TAXAS_CARTAO = {
  1: 0, 2: 1.99, 3: 2.49, 4: 2.99, 5: 3.49, 6: 3.99,
  7: 4.49, 8: 4.99, 9: 5.49, 10: 5.99, 11: 6.49, 12: 6.99,
}

function calcValorParcela(subtotal, parcelas) {
  const taxa = TAXAS_CARTAO[parcelas] || 0
  return (subtotal * (1 + taxa / 100)) / parcelas
}

// ─── Catálogo padrão (77 procedimentos) ──────────────────────────────────────
const CATALOGO_PADRAO = [
  // Preventivo
  { id: 1,  categoria: 'Preventivo',      nome: 'Consulta / Avaliação',                   codigo: 'PREV001', preco: '150.00' },
  { id: 2,  categoria: 'Preventivo',      nome: 'Profilaxia (limpeza)',                   codigo: 'PREV002', preco: '180.00' },
  { id: 3,  categoria: 'Preventivo',      nome: 'Aplicação de flúor tópico',              codigo: 'PREV003', preco: '80.00'  },
  { id: 4,  categoria: 'Preventivo',      nome: 'Selante de fóssulas e fissuras (dente)', codigo: 'PREV004', preco: '120.00' },
  { id: 5,  categoria: 'Preventivo',      nome: 'Raspagem supragengival (por sextante)',  codigo: 'PREV005', preco: '200.00' },
  { id: 6,  categoria: 'Preventivo',      nome: 'Orientação de higiene bucal',            codigo: 'PREV006', preco: '60.00'  },
  // Restaurações
  { id: 7,  categoria: 'Restaurações',    nome: 'Restauração em resina (1 face)',         codigo: 'REST001', preco: '250.00' },
  { id: 8,  categoria: 'Restaurações',    nome: 'Restauração em resina (2 faces)',        codigo: 'REST002', preco: '320.00' },
  { id: 9,  categoria: 'Restaurações',    nome: 'Restauração em resina (3+ faces)',       codigo: 'REST003', preco: '400.00' },
  { id: 10, categoria: 'Restaurações',    nome: 'Restauração em amálgama (1 face)',       codigo: 'REST004', preco: '200.00' },
  { id: 11, categoria: 'Restaurações',    nome: 'Restauração em amálgama (2 faces)',      codigo: 'REST005', preco: '260.00' },
  { id: 12, categoria: 'Restaurações',    nome: 'Ionômero de vidro',                      codigo: 'REST006', preco: '180.00' },
  { id: 13, categoria: 'Restaurações',    nome: 'Restauração provisória',                 codigo: 'REST007', preco: '100.00' },
  // Endodontia
  { id: 14, categoria: 'Endodontia',      nome: 'Canal — dente unirradicular',            codigo: 'ENDO001', preco: '900.00'  },
  { id: 15, categoria: 'Endodontia',      nome: 'Canal — dente birradicular',             codigo: 'ENDO002', preco: '1100.00' },
  { id: 16, categoria: 'Endodontia',      nome: 'Canal — dente multirradicular',          codigo: 'ENDO003', preco: '1400.00' },
  { id: 17, categoria: 'Endodontia',      nome: 'Retratamento de canal (unirradicular)',  codigo: 'ENDO004', preco: '1200.00' },
  { id: 18, categoria: 'Endodontia',      nome: 'Retratamento de canal (multirradicular)',codigo: 'ENDO005', preco: '1600.00' },
  { id: 19, categoria: 'Endodontia',      nome: 'Pulpotomia (dente decíduo)',             codigo: 'ENDO006', preco: '350.00' },
  { id: 20, categoria: 'Endodontia',      nome: 'Esvaziamento / curativo de urgência',   codigo: 'ENDO007', preco: '300.00' },
  // Periodontia
  { id: 21, categoria: 'Periodontia',     nome: 'Raspagem radicular (por dente)',         codigo: 'PERIO001', preco: '150.00' },
  { id: 22, categoria: 'Periodontia',     nome: 'Gengivoplastia (por sextante)',          codigo: 'PERIO002', preco: '400.00' },
  { id: 23, categoria: 'Periodontia',     nome: 'Cunha distal',                           codigo: 'PERIO003', preco: '350.00' },
  { id: 24, categoria: 'Periodontia',     nome: 'Cirurgia periodontal a retalho (sext.)', codigo: 'PERIO004', preco: '600.00' },
  { id: 25, categoria: 'Periodontia',     nome: 'Enxerto gengival livre',                 codigo: 'PERIO005', preco: '800.00' },
  { id: 26, categoria: 'Periodontia',     nome: 'Frenectomia lingual',                   codigo: 'PERIO006', preco: '500.00' },
  { id: 27, categoria: 'Periodontia',     nome: 'Frenectomia labial',                    codigo: 'PERIO007', preco: '450.00' },
  // Cirurgia
  { id: 28, categoria: 'Cirurgia',        nome: 'Extração simples',                      codigo: 'CIR001', preco: '220.00' },
  { id: 29, categoria: 'Cirurgia',        nome: 'Extração de dente decíduo',             codigo: 'CIR002', preco: '150.00' },
  { id: 30, categoria: 'Cirurgia',        nome: 'Extração de 3° molar incluso',          codigo: 'CIR003', preco: '800.00' },
  { id: 31, categoria: 'Cirurgia',        nome: 'Extração de 3° molar semi-incluso',     codigo: 'CIR004', preco: '600.00' },
  { id: 32, categoria: 'Cirurgia',        nome: 'Apicectomia',                           codigo: 'CIR005', preco: '700.00' },
  { id: 33, categoria: 'Cirurgia',        nome: 'Cistectomia',                           codigo: 'CIR006', preco: '900.00' },
  { id: 34, categoria: 'Cirurgia',        nome: 'Biópsia de tecido mole',                codigo: 'CIR007', preco: '500.00' },
  { id: 35, categoria: 'Cirurgia',        nome: 'Alveoloplastia',                        codigo: 'CIR008', preco: '400.00' },
  // Prótese
  { id: 36, categoria: 'Prótese',         nome: 'Coroa de porcelana sobre metal',        codigo: 'PROT001', preco: '1200.00' },
  { id: 37, categoria: 'Prótese',         nome: 'Coroa de porcelana / zircônia',         codigo: 'PROT002', preco: '2000.00' },
  { id: 38, categoria: 'Prótese',         nome: 'Coroa de metal',                        codigo: 'PROT003', preco: '800.00'  },
  { id: 39, categoria: 'Prótese',         nome: 'Coroa de resina provisória',            codigo: 'PROT004', preco: '300.00'  },
  { id: 40, categoria: 'Prótese',         nome: 'Ponte fixa (por elemento)',             codigo: 'PROT005', preco: '1500.00' },
  { id: 41, categoria: 'Prótese',         nome: 'Prótese parcial removível (por arcada)',codigo: 'PROT006', preco: '2200.00' },
  { id: 42, categoria: 'Prótese',         nome: 'Prótese total (dentadura)',             codigo: 'PROT007', preco: '2500.00' },
  { id: 43, categoria: 'Prótese',         nome: 'Prótese over-denture',                  codigo: 'PROT008', preco: '3500.00' },
  { id: 44, categoria: 'Prótese',         nome: 'Pino intracanal de fibra de vidro',     codigo: 'PROT009', preco: '400.00'  },
  { id: 45, categoria: 'Prótese',         nome: 'Núcleo metálico fundido',               codigo: 'PROT010', preco: '500.00'  },
  // Ortodontia
  { id: 46, categoria: 'Ortodontia',      nome: 'Aparelho fixo metálico (instalação)',   codigo: 'ORTO001', preco: '2800.00' },
  { id: 47, categoria: 'Ortodontia',      nome: 'Aparelho fixo estético (instalação)',   codigo: 'ORTO002', preco: '3500.00' },
  { id: 48, categoria: 'Ortodontia',      nome: 'Alinhadores invisíveis (pacote)',       codigo: 'ORTO003', preco: '6000.00' },
  { id: 49, categoria: 'Ortodontia',      nome: 'Manutenção mensal de aparelho',         codigo: 'ORTO004', preco: '200.00'  },
  { id: 50, categoria: 'Ortodontia',      nome: 'Contenção fixa',                        codigo: 'ORTO005', preco: '450.00'  },
  { id: 51, categoria: 'Ortodontia',      nome: 'Contenção removível',                   codigo: 'ORTO006', preco: '350.00'  },
  { id: 52, categoria: 'Ortodontia',      nome: 'Aparelho funcional ortopédico',         codigo: 'ORTO007', preco: '2000.00' },
  // Implantodontia
  { id: 53, categoria: 'Implantodontia',  nome: 'Implante osseointegrado (por unidade)', codigo: 'IMP001', preco: '3500.00' },
  { id: 54, categoria: 'Implantodontia',  nome: 'Coroa sobre implante (porcelana)',      codigo: 'IMP002', preco: '2200.00' },
  { id: 55, categoria: 'Implantodontia',  nome: 'Enxerto ósseo (por região)',            codigo: 'IMP003', preco: '1500.00' },
  { id: 56, categoria: 'Implantodontia',  nome: 'Levantamento de seio maxilar',          codigo: 'IMP004', preco: '2000.00' },
  { id: 57, categoria: 'Implantodontia',  nome: 'Intermediário protético (abutment)',    codigo: 'IMP005', preco: '600.00'  },
  // Estética
  { id: 58, categoria: 'Estética',        nome: 'Clareamento a laser (consultório)',     codigo: 'EST001', preco: '1200.00' },
  { id: 59, categoria: 'Estética',        nome: 'Clareamento caseiro (moldeiras)',       codigo: 'EST002', preco: '600.00'  },
  { id: 60, categoria: 'Estética',        nome: 'Faceta de porcelana (por dente)',       codigo: 'EST003', preco: '2000.00' },
  { id: 61, categoria: 'Estética',        nome: 'Faceta de resina direta (por dente)',   codigo: 'EST004', preco: '500.00'  },
  { id: 62, categoria: 'Estética',        nome: 'Microabrasão do esmalte',               codigo: 'EST005', preco: '300.00'  },
  { id: 63, categoria: 'Estética',        nome: 'Protocolo smile design',                codigo: 'EST006', preco: '500.00'  },
  // Radiologia
  { id: 64, categoria: 'Radiologia',      nome: 'Radiografia periapical',               codigo: 'RAD001', preco: '40.00'  },
  { id: 65, categoria: 'Radiologia',      nome: 'Radiografia interproximal (bitewing)',  codigo: 'RAD002', preco: '40.00'  },
  { id: 66, categoria: 'Radiologia',      nome: 'Radiografia panorâmica',               codigo: 'RAD003', preco: '150.00' },
  { id: 67, categoria: 'Radiologia',      nome: 'Tomografia computadorizada (CBCT)',     codigo: 'RAD004', preco: '500.00' },
  { id: 68, categoria: 'Radiologia',      nome: 'Telerradiografia de perfil',            codigo: 'RAD005', preco: '150.00' },
  // Odontopediatria
  { id: 69, categoria: 'Odontopediatria', nome: 'Restauração em resina (decíduo)',       codigo: 'ODP001', preco: '180.00' },
  { id: 70, categoria: 'Odontopediatria', nome: 'Coroa de aço (dente decíduo)',          codigo: 'ODP002', preco: '280.00' },
  { id: 71, categoria: 'Odontopediatria', nome: 'Mantenedor de espaço',                  codigo: 'ODP003', preco: '400.00' },
  { id: 72, categoria: 'Odontopediatria', nome: 'Tratamento de canal (decíduo)',         codigo: 'ODP004', preco: '450.00' },
  // Outros
  { id: 73, categoria: 'Outros',          nome: 'Placa de bruxismo (Michigan)',          codigo: 'OUT001', preco: '800.00' },
  { id: 74, categoria: 'Outros',          nome: 'Placa estabilizadora articular',        codigo: 'OUT002', preco: '900.00' },
  { id: 75, categoria: 'Outros',          nome: 'Consulta de urgência',                  codigo: 'OUT003', preco: '200.00' },
  { id: 76, categoria: 'Outros',          nome: 'Dessensibilização dentária',            codigo: 'OUT004', preco: '120.00' },
  { id: 77, categoria: 'Outros',          nome: 'Toxina botulínica (por área)',          codigo: 'OUT005', preco: '600.00' },
]

const TODAS_CATEGORIAS = ['Todas', 'Preventivo', 'Restaurações', 'Endodontia', 'Periodontia',
  'Cirurgia', 'Prótese', 'Ortodontia', 'Implantodontia', 'Estética', 'Radiologia',
  'Odontopediatria', 'Outros']

const C = { primary: '#1a8a7b', dark: '#136b5e', bg: '#f4faf8' }

const card = {
  background: '#fff',
  borderRadius: 12,
  padding: '18px 20px',
  boxShadow: '0 2px 10px rgba(0,0,0,.07)',
  border: '1px solid #e8f5f3',
}

const btnQtd = {
  width: 26, height: 26, border: `1px solid #a7f3d0`, borderRadius: 4,
  background: '#fff', cursor: 'pointer', fontWeight: 700, color: '#136b5e',
  fontSize: 15, lineHeight: 1, padding: 0,
}

export default function Orcamento() {
  const { pacientes } = usePacientes()
  const { profile, user } = useAuth()
  const toast = useToast()

  // ── Tabs ────────────────────────────────────────────────────────────────────
  const [aba, setAba] = useState('novo')

  // ── Novo Orçamento ──────────────────────────────────────────────────────────
  const [busca, setBusca] = useState('')
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null)
  const [itens, setItens] = useState([])
  const [formaPagamento, setFormaPagamento] = useState('pix')
  const [desconto, setDesconto] = useState(5)
  const [parcelas, setParcelas] = useState(1)
  const [salvando, setSalvando] = useState(false)

  // ── Busca inline de procedimento ────────────────────────────────────────────
  const [buscaProc, setBuscaProc] = useState('')
  const [dropdownAberto, setDropdownAberto] = useState(false)

  // ── Catálogo ────────────────────────────────────────────────────────────────
  const [catalogo, setCatalogo] = useState(CATALOGO_PADRAO)
  const [buscaCat, setBuscaCat] = useState('')
  const [categFiltro, setCategFiltro] = useState('Todas')
  const [showForm, setShowForm] = useState(false)
  const [novoProc, setNovoProc] = useState({ nome: '', codigo: '', preco: '', categoria: 'Outros' })

  // ── Cálculos ────────────────────────────────────────────────────────────────
  const subtotal = itens.reduce((s, i) => s + parseFloat(i.preco) * i.qtd, 0)
  const isCartao = formaPagamento === 'cartao'
  const isPix    = formaPagamento === 'pix' || formaPagamento === 'avista'
  const valorParcela    = isCartao ? calcValorParcela(subtotal, parcelas) : 0
  const totalCartao     = isCartao ? valorParcela * parcelas : 0
  const valorDesconto   = isPix ? subtotal * (desconto / 100) : 0
  const totalFinal      = isCartao ? totalCartao : subtotal - valorDesconto

  // ── Helpers itens ───────────────────────────────────────────────────────────
  function adicionarItem(proc) {
    setItens(prev => {
      const existe = prev.find(i => i.id === proc.id)
      if (existe) return prev.map(i => i.id === proc.id ? { ...i, qtd: i.qtd + 1 } : i)
      return [...prev, { ...proc, qtd: 1 }]
    })
    toast(`"${proc.nome}" adicionado ao orçamento`, 'success')
  }

  function alterarQtd(id, delta) {
    setItens(prev => prev
      .map(i => i.id === id ? { ...i, qtd: Math.max(1, i.qtd + delta) } : i)
    )
  }

  function removerItem(id) {
    setItens(prev => prev.filter(i => i.id !== id))
  }

  // ── Salvar Supabase ─────────────────────────────────────────────────────────
  async function salvar() {
    if (!pacienteSelecionado) { toast('Selecione um paciente.', 'error'); return }
    if (itens.length === 0)   { toast('Adicione pelo menos um procedimento.', 'error'); return }
    setSalvando(true)
    try {
      const { data: orc, error: e1 } = await supabase.from('orcamentos').insert({
        user_id: user.id,
        paciente_id: pacienteSelecionado.id,
        forma_pagamento: formaPagamento,
        desconto_pct: isPix ? desconto : 0,
        parcelas: isCartao ? parcelas : 1,
        valor_total: totalFinal,
        status: 'pendente',
      }).select().single()
      if (e1) throw e1

      const linhas = itens.map(i => ({
        orcamento_id: orc.id,
        nome: i.nome,
        codigo: i.codigo || '',
        preco_unitario: parseFloat(i.preco),
        quantidade: i.qtd,
        subtotal: parseFloat(i.preco) * i.qtd,
      }))
      const { error: e2 } = await supabase.from('orcamento_itens').insert(linhas)
      if (e2) throw e2

      toast('Orçamento salvo com sucesso!', 'success')
    } catch (err) {
      toast('Erro ao salvar: ' + (err.message || 'Tente novamente'), 'error')
    } finally {
      setSalvando(false)
    }
  }

  // ── Gerar PDF ───────────────────────────────────────────────────────────────
  function gerarPDF() {
    if (!pacienteSelecionado) { toast('Selecione um paciente.', 'error'); return }
    if (itens.length === 0)   { toast('Adicione pelo menos um procedimento.', 'error'); return }
    gerarOrcamentoPDF({
      paciente: pacienteSelecionado.nome,
      itens,
      formaPagamento,
      desconto: isPix ? desconto : 0,
      valorDesconto,
      parcelas,
      valorParcela,
      totalFinal,
      subtotal,
      dentista: profile?.nome || '',
      clinica: profile?.clinica || 'Meu Consultório SorrIA',
    })
    toast('PDF gerado!', 'success')
  }

  // ── Adicionar procedimento personalizado ao catálogo ────────────────────────
  function salvarNovoProc() {
    if (!novoProc.nome.trim()) return
    const novo = { ...novoProc, id: Date.now(), preco: novoProc.preco || '0.00' }
    setCatalogo(prev => [...prev, novo])
    setNovoProc({ nome: '', codigo: '', preco: '', categoria: 'Outros' })
    setShowForm(false)
    toast('Procedimento adicionado ao catálogo', 'success')
  }

  // ── Style helpers ───────────────────────────────────────────────────────────
  const abaStyle = id => ({
    padding: '9px 22px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: aba === id ? 700 : 500,
    border: `2px solid ${aba === id ? C.primary : '#e2e8f0'}`,
    background: aba === id ? C.primary : '#fff',
    color: aba === id ? '#fff' : '#4a5568',
    cursor: 'pointer',
  })

  // ── Resultados busca inline ─────────────────────────────────────────────────
  const resultsBusca = buscaProc.length >= 1
    ? catalogo.filter(p => p.nome.toLowerCase().includes(buscaProc.toLowerCase())).slice(0, 8)
    : []

  // ── Catálogo filtrado ───────────────────────────────────────────────────────
  const catalogoFiltrado = catalogo.filter(p => {
    const matchCat  = categFiltro === 'Todas' || p.categoria === categFiltro
    const matchBusca = !buscaCat || p.nome.toLowerCase().includes(buscaCat.toLowerCase()) || (p.codigo || '').toLowerCase().includes(buscaCat.toLowerCase())
    return matchCat && matchBusca
  })

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">💰 Orçamento</h1>
          <p className="page-subtitle">Crie orçamentos profissionais e gere PDFs</p>
        </div>
        {itens.length > 0 && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn btn-secondary"
              onClick={salvar}
              disabled={salvando}
            >
              {salvando ? '⏳ Salvando…' : '💾 Salvar'}
            </button>
            <button className="btn btn-success" onClick={gerarPDF}>📄 Gerar PDF</button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button style={abaStyle('novo')}     onClick={() => setAba('novo')}>📋 Novo Orçamento</button>
        <button style={abaStyle('catalogo')} onClick={() => setAba('catalogo')}>
          🗂 Catálogo
          {itens.length > 0 && (
            <span style={{
              marginLeft: 8, background: '#ef4444', color: '#fff',
              borderRadius: '50%', fontSize: 11, padding: '1px 6px', fontWeight: 700,
            }}>
              {itens.length}
            </span>
          )}
        </button>
      </div>

      {/* ── ABA NOVO ORÇAMENTO ──────────────────────────────────────────────── */}
      {aba === 'novo' && (
        <div>
          {/* Paciente */}
          <div style={{ ...card, marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, color: C.dark, marginBottom: 12 }}>👤 Paciente</h3>
            <Autocomplete
              pacientes={pacientes}
              value={busca}
              onChange={v => { setBusca(v); if (!v) setPacienteSelecionado(null) }}
              onSelect={p => { setPacienteSelecionado(p); setBusca(p.nome) }}
            />
            {pacienteSelecionado && (
              <div style={{ marginTop: 10, padding: '8px 12px', background: '#f0fdf4', borderRadius: 6, fontSize: 13, color: '#166534' }}>
                ✅ {pacienteSelecionado.nome}
                {pacienteSelecionado.convenio && ` · ${pacienteSelecionado.convenio}`}
              </div>
            )}
          </div>

          {/* Busca de procedimento */}
          <div style={{ ...card, marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, color: C.dark, marginBottom: 12 }}>🔍 Buscar Procedimento</h3>
            <div style={{ position: 'relative' }}>
              <input
                className="form-input"
                placeholder="Digite o procedimento..."
                value={buscaProc}
                onChange={e => { setBuscaProc(e.target.value); setDropdownAberto(true) }}
                onFocus={() => buscaProc && setDropdownAberto(true)}
                onBlur={() => setTimeout(() => setDropdownAberto(false), 150)}
                style={{ paddingLeft: 38 }}
                autoComplete="off"
              />
              <span style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                fontSize: 14, pointerEvents: 'none', color: '#9ca3af',
              }}>🔍</span>

              {dropdownAberto && resultsBusca.length > 0 && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                  background: '#fff', border: '1.5px solid #a7f3d0',
                  borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,.12)',
                  zIndex: 100, overflow: 'hidden',
                }}>
                  {resultsBusca.map((proc, idx) => (
                    <div
                      key={proc.id}
                      onMouseDown={() => {
                        adicionarItem(proc)
                        setBuscaProc('')
                        setDropdownAberto(false)
                      }}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px 14px', cursor: 'pointer',
                        borderBottom: idx < resultsBusca.length - 1 ? '1px solid #f0fdf4' : 'none',
                        background: '#fff',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                    >
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 14, color: '#1f2937' }}>{proc.nome}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{proc.categoria} · {proc.codigo}</div>
                      </div>
                      <span style={{ fontWeight: 700, color: C.primary, fontSize: 14, marginLeft: 16 }}>
                        R$ {parseFloat(proc.preco).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {dropdownAberto && buscaProc.length >= 1 && resultsBusca.length === 0 && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                  background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 8,
                  padding: '14px', textAlign: 'center', color: '#9ca3af', fontSize: 13, zIndex: 100,
                }}>
                  Nenhum procedimento encontrado para "{buscaProc}"
                </div>
              )}
            </div>
          </div>

          {/* Procedimentos Selecionados */}
          <div style={{ ...card, marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, color: C.dark, marginBottom: 14 }}>
              📋 Procedimentos Selecionados
              {itens.length > 0 && (
                <span style={{ marginLeft: 8, background: C.primary, color: '#fff', borderRadius: 12, fontSize: 11, padding: '2px 8px' }}>
                  {itens.length}
                </span>
              )}
            </h3>

            {itens.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 20px', color: '#9ca3af' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🦷</div>
                <div style={{ fontSize: 14 }}>Nenhum procedimento adicionado</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>Use a busca acima para encontrar e adicionar procedimentos</div>
              </div>
            ) : (
              <div>
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 104px 116px 116px 36px',
                  padding: '7px 10px', background: '#f0fdf4', borderRadius: 6, marginBottom: 6,
                  fontSize: 12, fontWeight: 700, color: C.dark,
                }}>
                  <span>Procedimento</span>
                  <span style={{ textAlign: 'center' }}>Qtd</span>
                  <span style={{ textAlign: 'right' }}>Valor Unit.</span>
                  <span style={{ textAlign: 'right' }}>Subtotal</span>
                  <span />
                </div>

                {itens.map(item => (
                  <div
                    key={item.id}
                    style={{
                      display: 'grid', gridTemplateColumns: '1fr 104px 116px 116px 36px',
                      alignItems: 'center', padding: '9px 10px', marginBottom: 4,
                      borderRadius: 7, border: '1px solid #e5e7eb', background: '#fafafa',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#1f2937' }}>{item.nome}</div>
                      {item.codigo && <div style={{ fontSize: 11, color: '#9ca3af' }}>{item.codigo}</div>}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <button onClick={() => alterarQtd(item.id, -1)} style={btnQtd}>−</button>
                      <span style={{ fontWeight: 700, fontSize: 14, minWidth: 18, textAlign: 'center' }}>{item.qtd}</span>
                      <button onClick={() => alterarQtd(item.id, +1)} style={btnQtd}>+</button>
                    </div>

                    <div style={{ textAlign: 'right', fontSize: 13, color: '#4b5563' }}>
                      R$ {parseFloat(item.preco).toFixed(2)}
                    </div>

                    <div style={{ textAlign: 'right', fontWeight: 700, color: C.primary, fontSize: 14 }}>
                      R$ {(parseFloat(item.preco) * item.qtd).toFixed(2)}
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => removerItem(item.id)}
                        style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 15, padding: 0, lineHeight: 1 }}
                        title="Remover"
                      >🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagamento + Resumo */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Pagamento */}
            <div style={card}>
              <h3 style={{ fontWeight: 700, fontSize: 15, color: C.dark, marginBottom: 14 }}>💳 Pagamento</h3>

              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Forma de pagamento</label>
                <select
                  className="form-input"
                  value={formaPagamento}
                  onChange={e => { setFormaPagamento(e.target.value); setParcelas(1) }}
                >
                  <option value="pix">PIX</option>
                  <option value="avista">À Vista (dinheiro)</option>
                  <option value="cartao">Cartão de crédito</option>
                  <option value="convenio">Convênio</option>
                </select>
              </div>

              {isPix && (
                <div className="form-group" style={{ marginBottom: 4 }}>
                  <label className="form-label">Desconto (%)</label>
                  <input
                    className="form-input"
                    type="number" min={0} max={100} step={0.5}
                    value={desconto}
                    onChange={e => setDesconto(Number(e.target.value))}
                  />
                  {desconto > 0 && subtotal > 0 && (
                    <div style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>
                      Economia de R$ {valorDesconto.toFixed(2)}
                    </div>
                  )}
                </div>
              )}

              {isCartao && (
                <div className="form-group" style={{ marginBottom: 4 }}>
                  <label className="form-label">Parcelamento</label>
                  <select
                    className="form-input"
                    value={parcelas}
                    onChange={e => setParcelas(Number(e.target.value))}
                    disabled={subtotal === 0}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(n => {
                      const vp = calcValorParcela(subtotal, n)
                      return (
                        <option key={n} value={n}>
                          {n}x de R$ {vp.toFixed(2)}{n === 1 ? ' (sem juros)' : ''}
                        </option>
                      )
                    })}
                  </select>
                </div>
              )}
            </div>

            {/* Resumo + Botões */}
            <div style={card}>
              <h3 style={{ fontWeight: 700, fontSize: 15, color: C.dark, marginBottom: 14 }}>📊 Resumo</h3>
              <div style={{ fontSize: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#6b7280' }}>Subtotal</span>
                  <strong>R$ {subtotal.toFixed(2)}</strong>
                </div>

                {isPix && desconto > 0 && subtotal > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, color: '#dc2626' }}>
                    <span>Desconto {formaPagamento === 'pix' ? 'PIX' : 'À Vista'} ({desconto}%)</span>
                    <span>− R$ {valorDesconto.toFixed(2)}</span>
                  </div>
                )}

                {isCartao && parcelas > 1 && subtotal > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, color: '#6b7280', fontSize: 13 }}>
                    <span>Parcelamento</span>
                    <span>{parcelas}x de R$ {valorParcela.toFixed(2)}</span>
                  </div>
                )}

                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 10, marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>Total</span>
                  <span style={{ fontWeight: 800, fontSize: 18, color: C.primary }}>
                    R$ {totalFinal.toFixed(2)}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                <button
                  style={{
                    background: C.primary, color: '#fff', border: 'none', borderRadius: 8,
                    padding: '10px 0', fontWeight: 700, fontSize: 14, cursor: salvando ? 'not-allowed' : 'pointer',
                    opacity: salvando ? 0.7 : 1,
                  }}
                  onClick={salvar}
                  disabled={salvando}
                >
                  {salvando ? '⏳ Salvando…' : '💾 Salvar no Supabase'}
                </button>
                <button
                  style={{
                    background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8,
                    padding: '10px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  }}
                  onClick={gerarPDF}
                >
                  📄 Gerar PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ABA CATÁLOGO ────────────────────────────────────────────────────── */}
      {aba === 'catalogo' && (
        <div>
          {/* Barra de busca + botão novo */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <input
              className="form-input"
              placeholder="🔍  Buscar procedimento ou código…"
              value={buscaCat}
              onChange={e => setBuscaCat(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              style={{
                background: C.primary, color: '#fff', border: 'none', borderRadius: 8,
                padding: '0 18px', fontWeight: 600, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap',
              }}
              onClick={() => setShowForm(f => !f)}
            >
              {showForm ? '✕ Cancelar' : '+ Novo procedimento'}
            </button>
          </div>

          {/* Formulário novo procedimento */}
          {showForm && (
            <div style={{ ...card, marginBottom: 16, background: '#f0fdf4', border: '1px solid #a7f3d0' }}>
              <h4 style={{ fontWeight: 700, color: C.dark, marginBottom: 12 }}>Novo procedimento</h4>
              <div className="form-row-3" style={{ marginBottom: 10 }}>
                <div className="form-group">
                  <label className="form-label">Nome *</label>
                  <input className="form-input" value={novoProc.nome}
                    onChange={e => setNovoProc(p => ({ ...p, nome: e.target.value }))}
                    placeholder="Ex: Clareamento LED" />
                </div>
                <div className="form-group">
                  <label className="form-label">Código</label>
                  <input className="form-input" value={novoProc.codigo}
                    onChange={e => setNovoProc(p => ({ ...p, codigo: e.target.value }))}
                    placeholder="EX001" />
                </div>
                <div className="form-group">
                  <label className="form-label">Preço (R$) *</label>
                  <input className="form-input" type="number" min={0} value={novoProc.preco}
                    onChange={e => setNovoProc(p => ({ ...p, preco: e.target.value }))}
                    placeholder="0.00" />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Categoria</label>
                <select className="form-input" value={novoProc.categoria}
                  onChange={e => setNovoProc(p => ({ ...p, categoria: e.target.value }))}>
                  {TODAS_CATEGORIAS.filter(c => c !== 'Todas').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <button
                style={{ background: C.primary, color: '#fff', border: 'none', borderRadius: 7, padding: '8px 20px', fontWeight: 700, cursor: 'pointer' }}
                onClick={salvarNovoProc}
              >
                Adicionar ao catálogo
              </button>
            </div>
          )}

          {/* Filtro de categorias */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {TODAS_CATEGORIAS.map(cat => (
              <button
                key={cat}
                onClick={() => setCategFiltro(cat)}
                style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  border: `1.5px solid ${categFiltro === cat ? C.primary : '#e2e8f0'}`,
                  background: categFiltro === cat ? C.primary : '#fff',
                  color: categFiltro === cat ? '#fff' : '#4a5568',
                  cursor: 'pointer',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Contagem */}
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
            {catalogoFiltrado.length} procedimento(s) encontrado(s)
          </div>

          {/* Lista de procedimentos */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
            {catalogoFiltrado.map(proc => {
              const noOrc = itens.find(i => i.id === proc.id)
              return (
                <div
                  key={proc.id}
                  style={{
                    ...card,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px',
                    border: noOrc ? `1.5px solid ${C.primary}` : '1px solid #e8f5f3',
                    background: noOrc ? '#f0fdf4' : '#fff',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#1f2937', marginBottom: 2 }}>{proc.nome}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{proc.categoria} · {proc.codigo}</div>
                    <div style={{ fontWeight: 700, color: C.primary, fontSize: 14, marginTop: 4 }}>
                      R$ {parseFloat(proc.preco).toFixed(2)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                    {noOrc && (
                      <span style={{ fontSize: 11, color: C.primary, fontWeight: 600, whiteSpace: 'nowrap' }}>
                        ✓ {noOrc.qtd}x no orçamento
                      </span>
                    )}
                    <button
                      onClick={() => adicionarItem(proc)}
                      style={{
                        background: noOrc ? '#fff' : C.primary,
                        color: noOrc ? C.primary : '#fff',
                        border: `1.5px solid ${C.primary}`,
                        borderRadius: 6,
                        padding: '5px 12px',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {noOrc ? '+ Adicionar' : '+ Adicionar'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {catalogoFiltrado.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
              <div style={{ fontSize: 36 }}>🔍</div>
              <div style={{ marginTop: 10 }}>Nenhum procedimento encontrado.</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
