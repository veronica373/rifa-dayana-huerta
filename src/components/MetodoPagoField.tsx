import { useState } from 'react'
import { METODOS_PAGO } from '../lib/types'

interface MetodoPagoFieldProps {
  value: string
  onChange: (value: string) => void
  label?: string
}

export default function MetodoPagoField({ value, onChange, label = 'Método de pago' }: MetodoPagoFieldProps) {
  const esConocido = (METODOS_PAGO as readonly string[]).includes(value)
  const [modoOtro, setModoOtro] = useState(value !== '' && !esConocido)

  return (
    <div>
      <label className="block text-sm font-semibold text-neutral-700 mb-1">{label}</label>
      {modoOtro ? (
        <div className="flex gap-2">
          <input
            autoFocus
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Escribe el método de pago"
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
          <option value="">Sin especificar</option>
          {METODOS_PAGO.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
