import { FormEvent, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { NumeroRifa } from '../lib/types'
import { BUCKET_COMPROBANTES, METODOS_PAGO } from '../lib/types'
import SelectConOtro from './SelectConOtro'

interface MarcarPagadoModalProps {
  fila: NumeroRifa
  enviando: boolean
  onCancel: () => void
  onSubmit: (metodoPago: string) => void
}

export default function MarcarPagadoModal({ fila, enviando, onCancel, onSubmit }: MarcarPagadoModalProps) {
  const [metodoPago, setMetodoPago] = useState(fila.metodo_pago ?? '')
  const [abriendoComprobante, setAbriendoComprobante] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit(metodoPago)
  }

  async function handleVerComprobante() {
    if (!fila.comprobante_url) return
    setAbriendoComprobante(true)
    const { data, error } = await supabase.storage.from(BUCKET_COMPROBANTES).createSignedUrl(fila.comprobante_url, 60)
    setAbriendoComprobante(false)
    if (error || !data) {
      alert('No se pudo abrir el comprobante.')
      return
    }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6">
        <h2 className="font-display text-xl font-bold brand-gradient-text">Marcar {fila.numero} como pagado</h2>
        <p className="text-sm text-neutral-500 mt-1">Comprador: {fila.comprador_nombre ?? '—'}</p>

        {(fila.pais_compra || fila.referencia_pago || fila.comprobante_url) && (
          <div className="mt-3 rounded-lg bg-rifa-bg border border-rifa-rosaPastel px-3 py-2 text-xs space-y-1">
            {fila.pais_compra && (
              <p>
                <span className="text-neutral-500">País: </span>
                <span className="font-semibold">{fila.pais_compra}</span>
              </p>
            )}
            {fila.referencia_pago && (
              <p>
                <span className="text-neutral-500">Referencia: </span>
                <span className="font-mono font-semibold">{fila.referencia_pago}</span>
              </p>
            )}
            {fila.comprobante_url && (
              <button
                type="button"
                onClick={handleVerComprobante}
                disabled={abriendoComprobante}
                className="font-semibold text-rifa-lavanda underline disabled:opacity-50"
              >
                {abriendoComprobante ? 'Abriendo...' : 'Ver comprobante'}
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <SelectConOtro value={metodoPago} onChange={setMetodoPago} label="Método de pago" opciones={METODOS_PAGO} />

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
