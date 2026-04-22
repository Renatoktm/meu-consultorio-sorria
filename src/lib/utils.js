// Mascaramento e validação de dados sensíveis

export function maskCPF(cpf) {
  if (!cpf) return ''
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return cpf
  return `${digits.slice(0, 3)}.***.***-${digits.slice(9)}`
}

export function maskPhone(phone) {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)}****-${digits.slice(7)}`
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ****-${digits.slice(6)}`
  return phone
}

// Retorna só dígitos do telefone validados para WhatsApp (10 ou 11 dígitos BR)
export function sanitizePhoneForWhatsApp(phone) {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 10 || digits.length > 11) return null
  // Bloqueia números que não parecem telefones brasileiros reais
  if (!/^[1-9][1-9]/.test(digits)) return null
  return digits
}

// Sanitiza texto para uso em PDF (remove caracteres de controle, limita tamanho)
export function sanitizeForPDF(text, maxLength = 200) {
  if (!text) return ''
  return String(text)
    .replace(/[\x00-\x1F\x7F]/g, ' ')
    .trim()
    .slice(0, maxLength)
}

// Validação básica de e-mail
export function isValidEmail(email) {
  if (!email) return true // campo opcional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Validação de CPF (formato + dígitos verificadores)
export function isValidCPF(cpf) {
  if (!cpf) return true // campo opcional
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return false
  if (/^(\d)\1{10}$/.test(digits)) return false // todos iguais
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i)
  let check = (sum * 10) % 11
  if (check === 10 || check === 11) check = 0
  if (check !== parseInt(digits[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i)
  check = (sum * 10) % 11
  if (check === 10 || check === 11) check = 0
  return check === parseInt(digits[10])
}
