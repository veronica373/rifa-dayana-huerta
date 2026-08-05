import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { NumeroRifa } from '../lib/types'
import { BUCKET_COMPROBANTES } from '../lib/types'

interface ParticipantsTableProps {
  filas: NumeroRifa[]
  onMarcarPagado: (fila: NumeroRifa) => void
  onLiberar: (numero: string) => void
  onEditar: (fila: NumeroRifa) => void
  procesando: string | null
  seleccionados: Set<string>
  onToggleSeleccionado: (numero: string) => void
}

const estiloEstado: Record<string, string> = {
  disponible: 'bg-estado-disponible text-rifa-fucsiaDark',
  reservado: 'bg-estado-reservadoBg text-estado-reservado',
  pagado: 'bg-estado-pagadoBg text-estado-pagado',
}

export default function ParticipantsTable({
  filas,
  onMarcarPagado,
  onLiberar,
  onEditar,
  procesando,
  seleccionados,
  onToggleSeleccionado,
}: ParticipantsTableProps) {
  const [abriendo, setAbriendo] = useState<string | null>(null)

  async function handleVerComprobante(fila: NumeroRifa) {
    if (!fila.comprobante_url) return
    setAbriendo(fila.numero)
    const { data, error } = await supabase.storage.from(BUCKET_COMPROBANTES).createSignedUrl(fila.comprobante_url, 60)
    setAbriendo(null)
    if (error || !data) {
      alert('No se pudo abrir el comprobante.')
      return
    }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-rifa-rosaPastel bg-white/80 shadow-soft">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-rifa-rosaPastel/40 text-left text-neutral-600">
            <th className="px-3 py-2 font-semibold"></th>
            <th className="px-3 py-2 font-semibold">Número</th>
            <th className="px-3 py-2 font-semibold">Nombre</th>
            <th className="px-3 py-2 font-semibold">Teléfono</th>
            <th className="px-3 py-2 font-semibold">Correo</th>
            <th className="px-3 py-2 font-semibold">País</th>
            <th className="px-3 py-2 font-semibold">Estado</th>
            <th className="px-3 py-2 font-semibold">Método pago</th>
            <th className="px-3 py-2 font-semibold">Referencia</th>
            <th className="px-3 py-2 font-semibold">Comprobante</th>
            <th className="px-3 py-2 font-semibold">Referido por</th>
            <th className="px-3 py-2 font-semibold">Notas</th>
            <th className="px-3 py-2 font-semibold">Ticket</th>
            <th className="px-3 py-2 font-semibold">Fecha</th>
            <th className="px-3 py-2 font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filas.length === 0 && (
            <tr>
              <td colSpan={15} className="px-3 py-6 text-center text-neutral-400">
                No hay participantes que coincidan.
              </td>
            </tr>
          )}
          {filas.map((f) => (
            <tr key={f.numero} className="border-t border-rifa-rosaPastel/60">
              <td className="px-3 py-2">
                {f.estado === 'reservado' && (
                  <input
                    type="checkbox"
                    checked={seleccionados.has(f.numero)}
                    onChange={() => onToggleSeleccionado(f.numero)}
                    className="w-4 h-4 accent-rifa-lavanda"
                  />
                )}
              </td>
              <td className="px-3 py-2 font-mono font-semibold">{f.numero}</td>
              <td className="px-3 py-2">{f.comprador_nombre ?? '—'}</td>
              <td className="px-3 py-2">{f.comprador_telefono ?? '—'}</td>
              <td className="px-3 py-2">{f.comprador_correo ?? '—'}</td>
              <td className="px-3 py-2">{f.pais_compra ?? '—'}</td>
              <td className="px-3 py-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${estiloEstado[f.estado]}`}>
                  {f.estado}
                </span>
              </td>
              <td className="px-3 py-2">{f.metodo_pago ?? '—'}</td>
              <td className="px-3 py-2 font-mono text-xs">{f.referencia_pago ?? '—'}</td>
              <td className="px-3 py-2">
                {f.comprobante_url ? (
                  <button
                    onClick={() => handleVerComprobante(f)}
                    disabled={abriendo === f.numero}
                    className="text-xs font-semibold text-rifa-lavanda underline disabled:opacity-50"
                  >
                    {abriendo === f.numero ? 'Abriendo...' : 'Ver'}
                  </button>
                ) : (
                  '—'
                )}
              </td>
              <td className="px-3 py-2">{f.referido_por ?? '—'}</td>
              <td className="px-3 py-2 max-w-[160px] truncate" title={f.notas ?? ''}>
                {f.notas ?? '—'}
              </td>
              <td className="px-3 py-2 font-mono text-xs">{f.codigo_ticket ?? '—'}</td>
              <td className="px-3 py-2 text-xs">{f.fecha ? new Date(f.fecha).toLocaleString('es-VE') : '—'}</td>
              <td className="px-3 py-2">
                <div className="flex gap-2">
                  {f.estado === 'reservado' && (
                    <button
                      onClick={() => onMarcarPagado(f)}
                      disabled={procesando === f.numero}
                      className="text-xs font-semibold text-estado-pagado underline disabled:opacity-50"
                    >
                      Marcar pagado
                    </button>
                  )}
                  {f.estado !== 'disponible' && (
                    <button
                      onClick={() => onLiberar(f.numero)}
                      disabled={procesando === f.numero}
                      className="text-xs font-semibold text-estado-reservado underline disabled:opacity-50"
                    >
                      Liberar
                    </button>
                  )}
                  <button
                    onClick={() => onEditar(f)}
                    disabled={procesando === f.numero}
                    className="text-xs font-semibold text-rifa-lavanda underline disabled:opacity-50"
                  >
                    Editar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
