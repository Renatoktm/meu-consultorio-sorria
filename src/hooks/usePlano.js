import { useAuth } from './useAuth'
import { usePacientes } from './usePacientes'

const LIMITE_FREE = 3

export function usePlano() {
  const { profile } = useAuth()
  const { pacientes } = usePacientes()

  const plano = profile?.plano || 'free'
  const isFree = plano === 'free'
  const total = pacientes.length
  const limite = isFree ? LIMITE_FREE : Infinity
  const podeAdicionarPaciente = !isFree || total < LIMITE_FREE
  const percentual = isFree ? Math.min((total / LIMITE_FREE) * 100, 100) : 0

  return { plano, isFree, total, limite, podeAdicionarPaciente, percentual, LIMITE_FREE }
}
