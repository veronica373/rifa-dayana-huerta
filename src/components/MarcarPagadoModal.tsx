import { FormEvent, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { NumeroRifa } from '../lib/types'
import { BUCKET_COMPROBANTES, METODOS_PAGO } from '../lib/types'
import SelectConOtro from './SelectConOtro'

export interface DatosPago {
  metodoPago: string
  comprobante: File | null
}

interface MarcarPagadoModalProps {
  filas: NumeroRifa[]
  enviando: boolean
  onCancel: () => void
  onSubmit: (datos: DatosPago) => void
}

export default function MarcarPagadoModal({ filas, enviando, onCancel, onSubmit }: MarcarPagadoModalProps) {
  const primera = filas[0]
  const esMultiple = filas.length > 1
  const [metodoPago, setMetodoPago] = useState(esMultiple ? '' : primera.metodo_pago ?? '')
  const [comprobante, setComprobante] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [abriendoComprobante, setAbriendoComprobante] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function handleArchivo(file: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setComprobante(file)
    setPreviewUrl(file ? URL.createObjectURL(file) : null)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit({ metodoPago, comprobante })
  }

  async function handleVerComprobante(fila: NumeroRifa) {
    if (!fila.comprobante_url) return
    setAbriendoComprobante(fila.numero)
    const { data, error } = await supabase.storage.from(BUCKET_COMPROBANTES).createSignedUrl(fila.comprobante_url, 60)
    setAbriendoComprobante(null)
    if (error || !data) {
      alert('No se pudo abrir el comprobante.')
      return
    }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="font-display text-xl font-bold brand-gradient-text">
          Marcar {esMultiple ? `${filas.length} números` : primera.numero} como pagado{esMultiple ? 's' : ''}
        </h2>

        {esMultiple ? (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {filas.map((f) => (
              <span key={f.numero} className="font-mono text-xs bg-rifa-rosaPastel/60 text-rifa-fucsiaDark px-2 py-0.5 rounded-full">
                {f.numero}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-500 mt-1">Comprador: {primera.comprador_nombre ?? '—'}</p>
        )}

        {!esMultiple && (primera.pais_compra || primera.referencia_pago || primera.comprobante_url) && (
          <div className="mt-3 rounded-lg bg-rifa-bg border border-rifa-rosaPastel px-3 py-2 text-xs space-y-1">
            {primera.pais_compra && (
              <p>
                <span className="text-neutral-500">País: </span>
                <span className="font-semibold">{primera.pais_compra}</span>
              </p>
            )}
            {primera.referencia_pago && (
              <p>
                <span className="text-neutral-500">Referencia: </span>
                <span className="font-mono font-semibold">{primera.referencia_pago}</span>
              </p>
            )}
            {primera.comprobante_url && (
              <button
                type="button"
                onClick={() => handleVerComprobante(primera)}
                disabled={abriendoComprobante === primera.numero}
                className="font-semibold text-rifa-lavanda underline disabled:opacity-50"
              >
                {abriendoComprobante === primera.numero ? 'Abriendo...' : 'Ver comprobante'}
              </button>
            )}
          </div>
        )}

        {esMultiple && filas.some((f) => f.comprobante_url) && (
          <div className="mt-3 rounded-lg bg-rifa-bg border border-rifa-rosaPastel px-3 py-2 text-xs space-y-1">
            <p className="text-neutral-500">Comprobantes ya subidos:</p>
            {filas
              .filter((f) => f.comprobante_url)
              .map((f) => (
                <button
                  key={f.numero}
                  type="button"
                  onClick={() => handleVerComprobante(f)}
                  disabled={abriendoComprobante === f.numero}
                  className="block font-semibold text-rifa-lavanda underline disabled:opacity-50"
                >
                  {abriendoComprobante === f.numero ? 'Abriendo...' : `Ver comprobante de ${f.numero}`}
                </button>
              ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <SelectConOtro value={metodoPago} onChange={setMetodoPago} label="Método de pago" opciones={METODOS_PAGO} />

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">
              Agregar/reemplazar captura de pago (opcional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleArchivo(e.target.files?.[0] ?? null)}
              className="w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-rifa-lavanda file:text-white file:px-3 file:py-2 file:font-semibold"
            />
            {previewUrl && (
              <img src={previewUrl} alt="Vista previa del comprobante" className="mt-2 max-h-32 rounded-lg border border-rifa-rosaPastel" />
            )}
            {esMultiple && comprobante && (
              <p className="text-xs text-neutral-400 mt-1">Se aplicará a los {filas.length} números seleccionados.</p>
            )}
          </div>

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
