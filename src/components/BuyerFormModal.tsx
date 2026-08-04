import { FormEvent, useEffect, useState } from 'react'
import { METODOS_PAGO, PAISES_COMPRA, PRECIO_NUMERO } from '../lib/types'
import SelectConOtro from './SelectConOtro'

export interface DatosCompra {
  nombre: string
  telefono: string
  correo: string
  pais: string
  metodoPago: string
  referenciaPago: string
  comprobante: File
}

interface BuyerFormModalProps {
  numeros: string[]
  enviando: boolean
  error: string | null
  onCancel: () => void
  onSubmit: (datos: DatosCompra) => void
}

export default function BuyerFormModal({ numeros, enviando, error, onCancel, onSubmit }: BuyerFormModalProps) {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [correo, setCorreo] = useState('')
  const [pais, setPais] = useState('')
  const [metodoPago, setMetodoPago] = useState('')
  const [referenciaPago, setReferenciaPago] = useState('')
  const [comprobante, setComprobante] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

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
    if (!comprobante) return
    onSubmit({ nombre, telefono, correo, pais, metodoPago, referenciaPago, comprobante })
  }

  const total = numeros.length * PRECIO_NUMERO

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="font-display text-xl font-bold brand-gradient-text">
          Reservar {numeros.length === 1 ? `número ${numeros[0]}` : `${numeros.length} números`}
        </h2>
        {numeros.length > 1 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {numeros.map((n) => (
              <span key={n} className="font-mono text-xs bg-rifa-rosaPastel/60 text-rifa-fucsiaDark px-2 py-0.5 rounded-full">
                {n}
              </span>
            ))}
          </div>
        )}
        <p className="text-sm text-neutral-500 mt-2">
          Completa tus datos y el comprobante de tu pago por <strong>${total} USD</strong> (ver métodos de pago arriba).
          Tu número queda <strong>reservado</strong>; una administradora confirmará el pago.
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

          <SelectConOtro value={pais} onChange={setPais} label="País desde donde compras" opciones={PAISES_COMPRA} requerido />

          <SelectConOtro value={metodoPago} onChange={setMetodoPago} label="Método de pago" opciones={METODOS_PAGO} requerido />

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Número de referencia *</label>
            <input
              required
              value={referenciaPago}
              onChange={(e) => setReferenciaPago(e.target.value)}
              className="w-full rounded-lg border border-rifa-rosaPastel px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rifa-lavanda"
              placeholder="Ej. últimos dígitos de la transferencia"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Captura del pago *</label>
            <input
              required
              type="file"
              accept="image/*"
              onChange={(e) => handleArchivo(e.target.files?.[0] ?? null)}
              className="w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-rifa-lavanda file:text-white file:px-3 file:py-2 file:font-semibold"
            />
            {previewUrl && (
              <img src={previewUrl} alt="Vista previa del comprobante" className="mt-2 max-h-32 rounded-lg border border-rifa-rosaPastel" />
            )}
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
