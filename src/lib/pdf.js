import jsPDF from 'jspdf'

function cabecalho(doc, clinica = 'Meu Consultório SorrIA', dentista = '') {
  doc.setFillColor(13, 148, 136)
  doc.rect(0, 0, 210, 22, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(clinica, 14, 13)
  if (dentista) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(dentista, 14, 19)
  }
  doc.setTextColor(0, 0, 0)
}

function rodape(doc) {
  const hoje = new Date().toLocaleDateString('pt-BR')
  doc.setFontSize(8)
  doc.setTextColor(120, 120, 120)
  doc.text(`Emitido em ${hoje} — Meu Consultório SorrIA`, 14, 285)
  doc.text('Documento gerado eletronicamente', 140, 285)
  doc.setTextColor(0, 0, 0)
}

export function gerarOrcamentoPDF({
  paciente, itens = [], formaPagamento = 'pix',
  desconto = 0, valorDesconto = 0,
  parcelas = 1, valorParcela = 0,
  subtotal = 0, totalFinal = 0,
  dentista, clinica,
  // Compatibilidade retroativa com versão antiga
  procedimentos, plano,
}) {
  // Suporte ao formato antigo (procedimentos sem qtd)
  if (!itens.length && procedimentos?.length) {
    itens = procedimentos.map(p => ({ ...p, qtd: 1 }))
    formaPagamento = plano || 'pix'
    subtotal = procedimentos.reduce((s, p) => s + parseFloat(p.preco), 0)
    valorDesconto = subtotal * (desconto / 100)
    totalFinal = subtotal - valorDesconto
  }

  const doc = new jsPDF()
  cabecalho(doc, clinica, dentista)

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('ORÇAMENTO ODONTOLÓGICO', 14, 34)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Paciente: ${paciente}`, 14, 44)
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 150, 44)

  doc.setDrawColor(13, 148, 136)
  doc.line(14, 48, 196, 48)

  // Cabeçalho tabela
  doc.setFont('helvetica', 'bold')
  doc.setFillColor(240, 253, 250)
  doc.rect(14, 52, 182, 8, 'F')
  doc.text('Procedimento', 16, 58)
  doc.text('Qtd', 108, 58)
  doc.text('Unit.', 128, 58)
  doc.text('Total', 162, 58)

  doc.setFont('helvetica', 'normal')
  let y = 68
  itens.forEach((item) => {
    const qtd = item.qtd || 1
    const unit = parseFloat(item.preco)
    const tot = unit * qtd
    // Truncar nome longo
    const nome = item.nome.length > 48 ? item.nome.slice(0, 46) + '…' : item.nome
    doc.text(nome, 16, y)
    doc.text(String(qtd), 110, y)
    doc.text(`R$ ${unit.toFixed(2)}`, 124, y)
    doc.text(`R$ ${tot.toFixed(2)}`, 158, y)
    y += 8
  })

  doc.setDrawColor(200, 200, 200)
  doc.line(14, y, 196, y)
  y += 8

  const isPix    = formaPagamento === 'pix' || formaPagamento === 'avista'
  const isCartao = formaPagamento === 'cartao'

  // Subtotal
  doc.setFont('helvetica', 'normal')
  doc.text('Subtotal:', 130, y)
  doc.text(`R$ ${subtotal.toFixed(2)}`, 162, y)
  y += 8

  if (isPix && desconto > 0) {
    const label = formaPagamento === 'pix' ? 'PIX' : 'À Vista'
    doc.setTextColor(220, 38, 38)
    doc.text(`Desconto ${label} (${desconto}%):`, 112, y)
    doc.text(`- R$ ${valorDesconto.toFixed(2)}`, 162, y)
    doc.setTextColor(0, 0, 0)
    y += 8
  }

  // Total final
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(13, 148, 136)
  doc.text('TOTAL:', 130, y)
  doc.text(`R$ ${totalFinal.toFixed(2)}`, 162, y)
  doc.setTextColor(0, 0, 0)
  y += 10

  // Condição de pagamento
  if (isCartao && parcelas > 1) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(`Parcelamento: ${parcelas}x de R$ ${valorParcela.toFixed(2)}`, 14, y)
    y += 7
  } else if (isPix) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const label = formaPagamento === 'pix' ? 'PIX' : 'Dinheiro / À Vista'
    doc.text(`Forma de pagamento: ${label}`, 14, y)
    y += 7
  } else if (formaPagamento === 'convenio') {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text('Forma de pagamento: Convênio', 14, y)
    y += 7
  }

  doc.setFontSize(8)
  doc.setTextColor(120, 120, 120)
  doc.text('Este orçamento tem validade de 30 dias a partir da data de emissão.', 14, y + 6)
  doc.setTextColor(0, 0, 0)

  rodape(doc)
  doc.save(`orcamento_${paciente.replace(/\s+/g, '_')}.pdf`)
}

export function gerarReceituarioPDF({ paciente, medicamentos, dentista, cro, clinica }) {
  const doc = new jsPDF()
  cabecalho(doc, clinica, dentista)

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('RECEITUÁRIO ODONTOLÓGICO', 14, 34)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Paciente: ${paciente}`, 14, 44)
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 150, 44)

  doc.setDrawColor(13, 148, 136)
  doc.line(14, 48, 196, 48)

  let y = 58
  medicamentos.forEach((m, i) => {
    doc.setFont('helvetica', 'bold')
    doc.text(`${i + 1}. ${m.medicamento}`, 14, y)
    y += 7
    doc.setFont('helvetica', 'normal')
    doc.text(`Posologia: ${m.posologia}`, 18, y)
    y += 6
    doc.text(`Via: ${m.via} | Quantidade: ${m.quantidade}`, 18, y)
    y += 10
  })

  y += 20
  doc.line(80, y, 196, y)
  y += 6
  doc.setFont('helvetica', 'bold')
  doc.text(`${dentista}`, 80, y)
  if (cro) {
    y += 6
    doc.setFont('helvetica', 'normal')
    doc.text(`CRO: ${cro}`, 80, y)
  }

  rodape(doc)
  doc.save(`receituario_${paciente.replace(/\s+/g, '_')}.pdf`)
}

export function gerarAtestadoPDF({ paciente, dias, data, cid, observacoes, dentista, cro, clinica }) {
  const doc = new jsPDF()
  cabecalho(doc, clinica, dentista)

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('ATESTADO ODONTOLÓGICO', 14, 34)

  doc.setDrawColor(13, 148, 136)
  doc.line(14, 38, 196, 38)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')

  const texto = `Atestamos para os devidos fins que o(a) paciente ${paciente} foi atendido(a) nesta data e necessita de afastamento de suas atividades por ${dias} dia(s), a partir de ${data}.`
  const linhas = doc.splitTextToSize(texto, 170)
  doc.text(linhas, 14, 55)

  let y = 55 + linhas.length * 7 + 10

  if (cid) {
    doc.text(`CID-10: ${cid}`, 14, y)
    y += 10
  }
  if (observacoes) {
    doc.setFont('helvetica', 'italic')
    doc.text(`Observações: ${observacoes}`, 14, y)
    y += 10
  }

  y += 30
  doc.line(80, y, 196, y)
  y += 6
  doc.setFont('helvetica', 'bold')
  doc.text(dentista, 80, y)
  if (cro) {
    y += 6
    doc.setFont('helvetica', 'normal')
    doc.text(`CRO: ${cro}`, 80, y)
  }

  rodape(doc)
  doc.save(`atestado_${paciente.replace(/\s+/g, '_')}.pdf`)
}

export function gerarExamesPDF({ paciente, exames, dentista, clinica }) {
  const doc = new jsPDF()
  cabecalho(doc, clinica, dentista)

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('SOLICITAÇÃO DE EXAMES', 14, 34)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Paciente: ${paciente}`, 14, 44)
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 150, 44)

  doc.setDrawColor(13, 148, 136)
  doc.line(14, 48, 196, 48)

  let y = 58
  exames.forEach((e, i) => {
    doc.setFont('helvetica', 'bold')
    doc.text(`${i + 1}. ${e.nome}`, 14, y)
    if (e.obs) {
      y += 6
      doc.setFont('helvetica', 'normal')
      doc.text(`   Obs: ${e.obs}`, 14, y)
    }
    y += 9
  })

  rodape(doc)
  doc.save(`exames_${paciente.replace(/\s+/g, '_')}.pdf`)
}
