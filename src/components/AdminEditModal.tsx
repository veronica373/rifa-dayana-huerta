import { FormEvent, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { EstadoNumero, NumeroRifa } from '../lib/types'
import { BUCKET_COMPROBANTES, METODOS_PAGO, PAISES_COMPRA } from '../lib/types'
import SelectConOtro from './SelectConOtro'

interface AdminEditModalProps {
  fila: NumeroRifa
  enviando: boolean
  error: string | null
  onCancel: () => void
  onSubmit: (datos: {
    nombre: string
    telefono: string
    correo: string
    estado: EstadoNumero
    metodoPago: string
    referidoPor: string
    notas: string
    paisCompra: string
    referenciaPago: string
  }) => void
}

export default function AdminEditModal({ fila, enviando, error, onCancel, onSubmit }: AdminEditModalProps) {
  const [nombre, setNombre] = useState(fila.comprador_nombre ?? '')
  const [telefono, setTelefono] = useState(fila.comprador_telefono ?? '')
  const [correo, setCorreo] = useState(fila.comprador_correo ?? '')
  const [estado, setEstado] = useState<EstadoNumero>(fila.estado)
  const [metodoPago, setMetodoPago] = useState(fila.metodo_pago ?? '')
  const [referidoPor, setReferidoPor] = useState(fila.referido_por ?? '')
  const [notas, setNotas] = useState(fila.notas ?? '')
  const [paisCompra, setPaisCompra] = useState(fila.pais_compra ?? '')
  const [referenciaPago, setReferenciaPago] = useState(fila.referencia_pago ?? '')
  const [abriendoComprobante, setAbriendoComprobante] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit({ nombre, telefono, correo, estado, metodoPago, referidoPor, notas, paisCompra, referenciaPago })
  }

  async function handleVerComprobante() {
    if (!fila.comprobante_url) return
    setAbriendoComprobante(true)
    const { data, error: err } = await supabase.storage.from(BUCKET_COMPROBANTES).createSignedUrl(fila.comprobante_url, 60)
    setAbriendoComprobante(false)
    if (err || !data) {
      alert('No se pudo abrir el comprobante.')
      return
    }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="font-display text-xl font-bold brand-gradient-text">Editar número {fila.numero}</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Útil para registrar ventas en efectivo/presenciales o corregir datos.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Nombre completo</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-lg border border-rifa-rosaPastel px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rifa-lavanda"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Teléfono</label>
            <input
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full rounded-lg border border-rifa-rosaPastel px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rifa-lavanda"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Correo</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full rounded-lg border border-rifa-rosaPastel px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rifa-lavanda"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Estado</label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value as EstadoNumero)}
              className="w-full rounded-lg border border-rifa-rosaPastel px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rifa-lavanda"
            >
              <option value="disponible">Disponible</option>
              <option value="reservado">Reservado</option>
              <option value="pagado">Pagado</option>
            </select>
          </div>

          <SelectConOtro value={metodoPago} onChange={setMetodoPago} label="Método de pago" opciones={METODOS_PAGO} />

          <SelectConOtro value={paisCompra} onChange={setPaisCompra} label="País de compra" opciones={PAISES_COMPRA} />

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Número de referencia</label>
            <input
              value={referenciaPago}
              onChange={(e) => setReferenciaPago(e.target.value)}
              className="w-full rounded-lg border border-rifa-rosaPastel px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rifa-lavanda"
            />
          </div>

          {fila.comprobante_url && (
            <button
              type="button"
              onClick={handleVerComprobante}
              disabled={abriendoComprobante}
              className="text-sm font-semibold text-rifa-lavanda underline disabled:opacity-50"
            >
              {abriendoComprobante ? 'Abriendo...' : 'Ver comprobante subido'}
            </button>
          )}

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Referido por</label>
            <input
              value={referidoPor}
              onChange={(e) => setReferidoPor(e.target.value)}
              placeholder="Ej. Thaidis, Daniela, un nombre..."
              className="w-full rounded-lg border border-rifa-rosaPastel px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rifa-lavanda"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Notas</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={2}
              placeholder="Comentarios internos sobre esta venta..."
              className="w-full rounded-lg border border-rifa-rosaPastel px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rifa-lavanda"
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
              {enviando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
