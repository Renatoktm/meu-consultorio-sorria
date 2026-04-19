import { supabase } from './supabase'

export async function fetchClinicaData(userId) {
  if (!userId) return null
  const { data } = await supabase
    .from('clinicas')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  return data || null
}

// Writes clinic header to jsPDF doc. Returns Y where body content should start.
export function buildClinicHeader(doc, clinicaData) {
  const nome = clinicaData?.nome_clinica || 'Meu Consultório SorrIA'
  const nomeDentista = clinicaData?.nome_dentista || ''
  const cro = clinicaData?.cro || ''
  const telefone = clinicaData?.telefone || ''
  const email = clinicaData?.email_clinica || ''
  // Suporte aos campos separados (novos) e ao campo antigo (legado)
  const enderecoPartes = [
    clinicaData?.logradouro,
    clinicaData?.bairro,
    clinicaData?.cidade,
  ].filter(Boolean)
  const endereco = enderecoPartes.length > 0
    ? enderecoPartes.join(' — ')
    : (clinicaData?.endereco || '')

  // Teal filled bar
  doc.setFillColor(26, 138, 123)
  doc.rect(0, 0, 210, 26, 'F')

  // Clinic name — large, bold, white
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  doc.text(nome, 14, 12)

  // Dentist | CRO inside bar
  const barLine = [nomeDentista, cro ? `CRO: ${cro}` : ''].filter(Boolean).join('   |   ')
  if (barLine) {
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'normal')
    doc.text(barLine, 14, 20)
  }

  // Contact info below bar
  doc.setTextColor(65, 65, 65)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')

  const contactLine = [telefone ? `Tel: ${telefone}` : '', email].filter(Boolean).join('   |   ')
  if (contactLine) doc.text(contactLine, 14, 31)
  if (endereco) doc.text(endereco, 14, 37)

  // Teal separator line
  doc.setDrawColor(26, 138, 123)
  doc.setLineWidth(0.5)
  doc.line(14, 42, 196, 42)
  doc.setLineWidth(0.2)

  doc.setDrawColor(0, 0, 0)
  doc.setTextColor(0, 0, 0)

  return 47 // content starts here
}
