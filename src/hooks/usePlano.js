import { useAuth } from './useAuth'
import { usePacientes } from './usePacientes'

const LIMITE_FREE = 3

export function usePlano() {
  const { profile } = useAuth()
  const { pacientes } = usePacientes()

  const plano = profile?.plano || 'trial'

  // Trial: verifica se ainda está no período
  const trialEndsAt = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : null
  const trialAtivo = plano === 'trial' && trialEndsAt && trialEndsAt > new Date()
  const trialExpirado = plano === 'trial' && (!trialEndsAt || trialEndsAt <= new Date())

  // Dias restantes do trial
  const diasTrial = trialAtivo
    ? Math.ceil((trialEndsAt - new Date()) / (1000 * 60 * 60 * 24))
    : 0

  // Pro: acesso total
  const isPro = plano === 'pro'

  // Bloqueado: free sem limite OU trial expirado
  const isFree = plano === 'free'
  const isBlocked = isFree || trialExpirado

  // Contagem de pacientes
  const total = pacientes.length
  const limite = isBlocked ? LIMITE_FREE : Infinity
  const podeAdicionarPaciente = !isBlocked || total < LIMITE_FREE

  // Percentual para o banner (só mostra no free)
  const percentual = isFree ? Math.min((total / LIMITE_FREE) * 100, 100) : 0

  return {
    plano,
    isFree,
    isPro,
    isBlocked,
    trialAtivo,
    trialExpirado,
    diasTrial,
    trialEndsAt,
    total,
    limite,
    podeAdicionarPaciente,
    percentual,
    LIMITE_FREE,
  }
}
