import { FormEvent, useState } from 'react'
import { PRECIO_NUMERO } from '../lib/types'

interface BuyerFormModalProps {
  numero: string
  enviando: boolean
  error: string | null
  onCancel: () => void
  onSubmit: (datos: { nombre: string; telefono: string; correo: string }) => void
}

export default function BuyerFormModal({ numero, enviando, error, onCancel, onSubmit }: BuyerFormModalProps) {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [correo, setCorreo] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit({ nombre, telefono, correo })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
        <h2 className="font-display text-xl font-bold brand-gradient-text">Reservar número {numero}</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Completa tus datos. El número se reservará a tu nombre por <strong>${PRECIO_NUMERO} USD</strong>. El pago se
          coordina aparte con las administradoras.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Nombre completo *</label>
            <input
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-lg border border-rifa-rosaPastel px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rifa-lavanda"
              placeholder="Ej. María Pérez"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Teléfono (WhatsApp) *</label>
            <input
              required
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full rounded-lg border border-rifa-rosaPastel px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rifa-lavanda"
              placeholder="Ej. +58 412 1234567"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Correo (opcional)</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full rounded-lg border border-rifa-rosaPastel px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rifa-lavanda"
              placeholder="Ej. maria@correo.com"
            />
          </div>

          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={enviando}
              className="flex-1 rounded-lg border border-rifa-rosaPastel py-2 font-semibold text-neutral-600 hover:bg-rifa-bg disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="flex-1 rounded-lg brand-gradient py-2 font-semibold text-white shadow-soft disabled:opacity-60"
            >
              {enviando ? 'Reservando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
