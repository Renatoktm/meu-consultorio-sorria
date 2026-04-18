import { usePlano } from '../hooks/usePlano'

export default function PlanoBanner() {
  const { isFree, total, LIMITE_FREE, percentual } = usePlano()

  if (!isFree) return null

  return (
    <div className="plano-banner">
      <div>
        <strong>Plano Free</strong> — {total}/{LIMITE_FREE} pacientes cadastrados
        <div className="plano-banner-progress">
          <div className="plano-banner-bar" style={{ width: `${percentual}%` }} />
        </div>
      </div>
      <span style={{ fontSize: 20 }}>⭐</span>
    </div>
  )
}
