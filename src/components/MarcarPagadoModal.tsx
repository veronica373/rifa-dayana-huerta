import { FormEvent, useState } from 'react'
import type { NumeroRifa } from '../lib/types'
import MetodoPagoField from './MetodoPagoField'

interface MarcarPagadoModalProps {
  fila: NumeroRifa
  enviando: boolean
  onCancel: () => void
  onSubmit: (metodoPago: string) => void
}

export default function MarcarPagadoModal({ fila, enviando, onCancel, onSubmit }: MarcarPagadoModalProps) {
  const [metodoPago, setMetodoPago] = useState(fila.metodo_pago ?? '')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit(metodoPago)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6">
        <h2 className="font-display text-xl font-bold brand-gradient-text">Marcar {fila.numero} como pagado</h2>
        <p className="text-sm text-neutral-500 mt-1">Comprador: {fila.comprador_nombre ?? '—'}</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <MetodoPagoField value={metodoPago} onChange={setMetodoPago} />

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
              {enviando ? 'Guardando...' : 'Confirmar pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
