import type { NumeroRifa } from '../lib/types'

interface ParticipantsTableProps {
  filas: NumeroRifa[]
  onMarcarPagado: (fila: NumeroRifa) => void
  onLiberar: (numero: string) => void
  onEditar: (fila: NumeroRifa) => void
  procesando: string | null
}

const estiloEstado: Record<string, string> = {
  disponible: 'bg-estado-disponible text-rifa-fucsiaDark',
  reservado: 'bg-estado-reservadoBg text-estado-reservado',
  pagado: 'bg-estado-pagadoBg text-estado-pagado',
}

export default function ParticipantsTable({ filas, onMarcarPagado, onLiberar, onEditar, procesando }: ParticipantsTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-rifa-rosaPastel bg-white/80 shadow-soft">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-rifa-rosaPastel/40 text-left text-neutral-600">
            <th className="px-3 py-2 font-semibold">Número</th>
            <th className="px-3 py-2 font-semibold">Nombre</th>
            <th className="px-3 py-2 font-semibold">Teléfono</th>
            <th className="px-3 py-2 font-semibold">Correo</th>
            <th className="px-3 py-2 font-semibold">Estado</th>
            <th className="px-3 py-2 font-semibold">Método pago</th>
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
              <td colSpan={11} className="px-3 py-6 text-center text-neutral-400">
                No hay participantes que coincidan.
              </td>
            </tr>
          )}
          {filas.map((f) => (
            <tr key={f.numero} className="border-t border-rifa-rosaPastel/60">
              <td className="px-3 py-2 font-mono font-semibold">{f.numero}</td>
              <td className="px-3 py-2">{f.comprador_nombre ?? '—'}</td>
              <td className="px-3 py-2">{f.comprador_telefono ?? '—'}</td>
              <td className="px-3 py-2">{f.comprador_correo ?? '—'}</td>
              <td className="px-3 py-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${estiloEstado[f.estado]}`}>
                  {f.estado}
                </span>
              </td>
              <td className="px-3 py-2">{f.metodo_pago ?? '—'}</td>
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
