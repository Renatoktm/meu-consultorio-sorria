import { useState, useRef, useEffect } from 'react'

export default function Autocomplete({ pacientes, value, onChange, onSelect }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const filtered = pacientes.filter(p =>
    p.nome.toLowerCase().includes(value.toLowerCase()) ||
    (p.cpf && p.cpf.includes(value))
  ).slice(0, 8)

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="autocomplete-wrapper" ref={ref}>
      <input
        className="form-input"
        placeholder="Digite o nome do paciente..."
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
      />
      {open && filtered.length > 0 && (
        <div className="autocomplete-dropdown">
          {filtered.map(p => (
            <div
              key={p.id}
              className="autocomplete-item"
              onMouseDown={() => { onSelect(p); setOpen(false) }}
            >
              <div className="autocomplete-item-name">{p.nome}</div>
              <div className="autocomplete-item-detail">
                {p.cpf && `CPF: ${p.cpf}`}{p.telefone && ` · ${p.telefone}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
