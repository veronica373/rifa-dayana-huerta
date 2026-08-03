import { PRECIO_NUMERO } from '../lib/types'

interface SeleccionBarProps {
  cantidad: number
  onReservar: () => void
  onVaciar: () => void
}

export default function SeleccionBar({ cantidad, onReservar, onVaciar }: SeleccionBarProps) {
  if (cantidad === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 print:hidden">
      <div className="max-w-5xl mx-auto px-4 pb-4">
        <div className="brand-gradient rounded-2xl shadow-2xl px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between text-white">
          <p className="font-semibold text-sm sm:text-base">
            {cantidad} número{cantidad === 1 ? '' : 's'} seleccionado{cantidad === 1 ? '' : 's'} · ${cantidad * PRECIO_NUMERO} USD
          </p>
          <div className="flex gap-3">
            <button
              onClick={onVaciar}
              className="rounded-lg border border-white/60 px-4 py-2 text-sm font-semibold hover:bg-white/10"
            >
              Vaciar
            </button>
            <button
              onClick={onReservar}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-rifa-fucsiaDark shadow-soft hover:bg-white/90"
            >
              Reservar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
