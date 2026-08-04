import { useState } from 'react'

interface SelectConOtroProps {
  value: string
  onChange: (value: string) => void
  label: string
  opciones: readonly string[]
  requerido?: boolean
}

export default function SelectConOtro({ value, onChange, label, opciones, requerido }: SelectConOtroProps) {
  const esConocido = opciones.includes(value)
  const [modoOtro, setModoOtro] = useState(value !== '' && !esConocido)

  return (
    <div>
      <label className="block text-sm font-semibold text-neutral-700 mb-1">
        {label} {requerido && '*'}
      </label>
      {modoOtro ? (
        <div className="flex gap-2">
          <input
            autoFocus
            required={requerido}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Escribe ${label.toLowerCase()}`}
            className="flex-1 rounded-lg border border-rifa-rosaPastel px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rifa-lavanda"
          />
          <button
            type="button"
            onClick={() => {
              setModoOtro(false)
              onChange('')
            }}
            className="text-xs font-semibold text-rifa-lavanda underline whitespace-nowrap"
          >
            Elegir de la lista
          </button>
        </div>
      ) : (
        <select
          required={requerido}
          value={value}
          onChange={(e) => {
            if (e.target.value === 'Otro') {
              setModoOtro(true)
              onChange('')
            } else {
              onChange(e.target.value)
            }
          }}
          className="w-full rounded-lg border border-rifa-rosaPastel px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rifa-lavanda"
        >
          {!requerido && <option value="">Sin especificar</option>}
          {requerido && <option value="" disabled>Selecciona una opción</option>}
          {opciones.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
